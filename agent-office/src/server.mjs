#!/usr/bin/env node
/**
 * Finalidad: MCP server (stdio) de "La Oficina" — uno por sesion de agente. Claude Code
 *   lo arranca al iniciar la sesion. Hace 3 cosas:
 *     1. Asegura que el broker daemon este vivo (lo auto-arranca detached si no esta).
 *     2. Deriva el office_id ESTABLE del proyecto leyendo <memoria>/.office-id (lo crea
 *        si no existe) — la oficina se identifica por el proyecto, no por su ruta.
 *     3. Expone las tools con las que el agente se une, anuncia, revisa su inbox, reserva
 *        recursos y cierra la oficina.
 *
 *   Pull + push: el agente revisa su inbox en checkpoints (office_inbox); ADEMÁS, las
 *   MENCIONES DIRECTAS se EMPUJAN a la sesión vía claude/channel (v2, ver pollAndPush) —
 *   un toque en el hombro sin esperar al checkpoint. Los broadcasts quedan solo en pull
 *   para no saturar. El push requiere que Claude Code procese el channel (ver README § Push).
 *
 * Interrelacion: Habla con broker.mjs por HTTP (127.0.0.1). La identidad del agente es su
 *   NOMBRE (Minerva, Hermes, ...), que el agente declara en join_office. Reconectar con el
 *   mismo nombre al mismo proyecto = takeover + herencia (reinicio por limite de contexto).
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const PORT = parseInt(process.env.OFFICE_MCP_PORT ?? "7900", 10);
const BROKER_URL = `http://127.0.0.1:${PORT}`;
const BROKER_SCRIPT = fileURLToPath(new URL("./broker.mjs", import.meta.url));
const HEARTBEAT_MS = 20_000;

// --- Estado de la sesion ---
let me = null; // { officeId, name, projectPath, memoriaPath }
let heartbeatTimer = null;
let pushTimer = null;
let lastPushedSeq = 0; // cursor del push loop: solo empuja menciones directas POSTERIORES al join

function logErr(msg) {
  // stdout es el canal del protocolo MCP; los logs van SIEMPRE a stderr.
  console.error(`[office-mcp] ${msg}`);
}

// --- Comunicacion con el broker ---

async function brokerPost(path, body) {
  const res = await fetch(`${BROKER_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `${res.status} en ${path}`);
  return data;
}

async function isBrokerAlive() {
  try {
    const res = await fetch(`${BROKER_URL}/health`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function ensureBroker() {
  if (await isBrokerAlive()) {
    logErr("broker ya esta vivo");
    return false; // no lo arranque yo
  }
  logErr("broker no responde — arrancandolo (detached)");
  const proc = spawn(process.execPath, [BROKER_SCRIPT], {
    detached: true,
    stdio: "ignore",
  });
  proc.unref(); // que sobreviva al cierre de esta sesion
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 200));
    if (await isBrokerAlive()) {
      logErr("broker arrancado");
      return true; // yo lo encendi
    }
  }
  throw new Error("no se pudo arrancar el broker tras 6s");
}

// --- office_id estable desde la memoria del proyecto ---

function resolveOfficeId(memoriaPath) {
  const idFile = join(memoriaPath, ".office-id");
  if (existsSync(idFile)) {
    const id = readFileSync(idFile, "utf8").trim();
    if (id) return { officeId: id, created: false };
  }
  const id = randomUUID();
  if (!existsSync(memoriaPath)) mkdirSync(memoriaPath, { recursive: true });
  writeFileSync(idFile, `${id}\n`, "utf8");
  return { officeId: id, created: true };
}

// --- Archivo de sesion: mapea ESTA sesion de Claude Code → su oficina ---
// Lo escribe el server al unirse; lo lee el hook de pull-automatico para consultar SOLO la
// oficina de ESTA sesion (aislamiento por proyecto cuando el mismo agente esta en varios
// proyectos a la vez). Clave = CLAUDE_CODE_SESSION_ID (Claude Code >=2.1.154) o el ppid como
// respaldo. El hook intenta ambas claves, asi correlaciona en cualquier version.
const SESSION_DIR = process.env.OFFICE_MCP_SESSION_DIR || join(homedir(), ".office-mcp", "sessions");
function sessionKey() {
  return process.env.CLAUDE_CODE_SESSION_ID || String(process.ppid);
}
function writeSessionFile(officeId, name) {
  try {
    if (!existsSync(SESSION_DIR)) mkdirSync(SESSION_DIR, { recursive: true });
    writeFileSync(
      join(SESSION_DIR, `${sessionKey()}.json`),
      JSON.stringify({ officeId, name, ts: Date.now() }),
      "utf8",
    );
  } catch {
    /* no critico */
  }
}
function clearSessionFile() {
  try {
    const f = join(SESSION_DIR, `${sessionKey()}.json`);
    if (existsSync(f)) unlinkSync(f);
  } catch {
    /* no critico */
  }
}

// --- heartbeat ---

function startHeartbeat() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = setInterval(async () => {
    if (!me) return;
    try {
      await brokerPost("/heartbeat", { officeId: me.officeId, name: me.name });
    } catch {
      /* no critico */
    }
  }, HEARTBEAT_MS);
  heartbeatTimer.unref?.();
}

// --- Push real (v2): empuja menciones directas a la sesion via claude/channel ---

async function pollAndPush() {
  if (!me) return;
  let events;
  try {
    ({ events } = await brokerPost("/poll", { officeId: me.officeId, sinceSeq: lastPushedSeq }));
  } catch {
    return; // broker temporalmente caido; reintenta en el proximo tick sin avanzar el cursor
  }
  if (!events || !events.length) return;
  for (const ev of events) {
    // Solo se EMPUJAN las menciones directas (toque en el hombro). Los broadcasts (joins,
    // locks, info general) quedan para office_inbox / office_who (pull) — evita saturar.
    if (ev.from !== me.name && Array.isArray(ev.mentions) && ev.mentions.includes(me.name)) {
      try {
        await mcp.notification({
          method: "notifications/claude/channel",
          params: {
            content: `[${ev.type}] ${ev.from}: ${ev.text}`,
            meta: { from: ev.from, type: ev.type, seq: ev.seq, affects: ev.affects ?? [] },
          },
        });
      } catch {
        // El channel no esta activo (Claude Code sin el flag de development channels).
        // Best-effort: no rompe nada, el agente igual lo vera con office_inbox (pull).
      }
    }
  }
  lastPushedSeq = Math.max(lastPushedSeq, ...events.map((e) => e.seq));
}

function startPushLoop() {
  if (pushTimer) clearInterval(pushTimer);
  pushTimer = setInterval(pollAndPush, 2500);
  pushTimer.unref?.();
}

// Aviso de inbox pendiente que se adjunta al final de cada tool (nudge sin push).
async function inboxHint() {
  if (!me) return "";
  try {
    const { messages } = await brokerPost("/inbox", { officeId: me.officeId, name: me.name });
    if (messages && messages.length > 0) {
      return `\n\n📨 Tienes ${messages.length} mensaje(s) en tu inbox de la oficina. Llama \`office_inbox\` para leerlos.`;
    }
  } catch {
    /* ignore */
  }
  return "";
}

function text(t) {
  return { content: [{ type: "text", text: t }] };
}
function errText(t) {
  return { content: [{ type: "text", text: t }], isError: true };
}

// --- Definicion de tools ---

const TOOLS = [
  {
    name: "join_office",
    description:
      "Unirte a la oficina del proyecto al ARRANCAR tu sesion (parte del bootstrap). Identidad por NOMBRE de agente: si ya habia una sesion tuya en este proyecto (ej. reiniciaste por limite de contexto), reconectas y HEREDAS tu inbox y reservas. Devuelve quien mas esta activo + tus mensajes pendientes. La oficina se identifica por un id estable en <memoria>/.office-id (robusto ante mover/renombrar la carpeta).",
    inputSchema: {
      type: "object",
      properties: {
        agent_name: { type: "string", description: "Tu nombre de agente: Minerva, Hermes, Lyra, Atlas, Vitruvius, Sentinel, 'Dr. Quispe', Argus." },
        project_path: { type: "string", description: "Ruta del proyecto (la que te dio el operador)." },
        memoria_path: { type: "string", description: "Ruta de la carpeta memoria del proyecto (la que te dio el operador)." },
        branch: { type: "string", description: "Branch/worktree en el que trabajaras (opcional)." },
        modules: { type: "array", items: { type: "string" }, description: "Modulos/areas que piensas tocar (ej. ['android/','backend/']) — para que otros sepan tu zona (opcional)." },
      },
      required: ["agent_name", "project_path", "memoria_path"],
    },
  },
  {
    name: "office_announce",
    description:
      "Publicar un evento a la oficina para que el resto se entere. Usa mentions=['Minerva'] para dirigirlo a alguien (le aparece en su inbox); vacio = broadcast a todos. type: intent (voy a hacer X) / contract_change (cambio un contrato que te afecta) / blocker / question / done / info.",
    inputSchema: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["intent", "contract_change", "blocker", "question", "done", "info"] },
        text: { type: "string", description: "El mensaje, claro y autocontenido." },
        mentions: { type: "array", items: { type: "string" }, description: "Nombres de agentes a quienes afecta (opcional; vacio = todos)." },
        affects: { type: "array", items: { type: "string" }, description: "Archivos/modulos/contratos afectados (opcional)." },
      },
      required: ["type", "text"],
    },
  },
  {
    name: "office_inbox",
    description: "Leer los mensajes dirigidos a ti (menciones directas + broadcasts) que aun no leiste, y marcarlos como vistos. Llamalo en tus checkpoints: al arrancar, antes de tocar algo compartido, y al cerrar.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "office_who",
    description: "Ver quien esta en la oficina del proyecto ahora mismo (agentes + su estado active/idle/disconnected + que modulos tocan) y que recursos estan reservados. Consultalo antes de tocar un modulo que podria estar tocando otro.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "office_claim",
    description: "Reservar (lock advisory) un recurso compartido — un archivo, un modulo, un deploy, un puerto — mientras trabajas en el. Falla si OTRO agente ya lo tiene (te dice quien). Es cooperativo: no bloquea fisicamente, avisa. Libera con office_release al terminar.",
    inputSchema: {
      type: "object",
      properties: {
        resource: { type: "string", description: "Identificador del recurso (ej. 'backend/payments/', 'deploy:kvm2', 'contracts/pagos.yaml')." },
        note: { type: "string", description: "Que estas haciendo con el (opcional)." },
      },
      required: ["resource"],
    },
  },
  {
    name: "office_release",
    description: "Liberar un recurso que reservaste con office_claim. Usa force=true solo para liberar un lock huerfano de otro agente que ya no esta (avisale).",
    inputSchema: {
      type: "object",
      properties: {
        resource: { type: "string" },
        force: { type: "boolean", description: "Liberar aunque sea de otro agente (lock huerfano). Default false." },
      },
      required: ["resource"],
    },
  },
  {
    name: "office_leave",
    description: "Salir limpio de la oficina al terminar tu sesion: libera tus reservas y marca tu presencia como idle. NO apaga la oficina ni el broker (otros siguen). Tu inbox se conserva por si reconectas.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "office_shutdown",
    description: "Cerrar la oficina de ESTE proyecto cuando el operador lo pide. Guarda AUTOMATICAMENTE el ACTA (log completo de la jornada de coordinacion) en memoria/oficina/<fecha>.json y te pide agregar una linea en log.md. NO mata el broker daemon (que puede servir otros proyectos en paralelo). Usalo solo por orden explicita del operador.",
    inputSchema: { type: "object", properties: {} },
  },
];

// --- MCP server ---

const mcp = new Server(
  { name: "office-mcp", version: "0.1.0" },
  {
    // claude/channel (experimental): EMPUJA las menciones directas a la sesion sin que el
    // agente tenga que llamar office_inbox. Requiere arrancar Claude Code con el flag de
    // development channels (ver README § Push real). Sin el flag, degrada a pull (inofensivo).
    capabilities: { experimental: { "claude/channel": {} }, tools: {} },
    instructions: `Estas conectado a "La Oficina": el canal de coordinacion en vivo del equipo para este proyecto. Otros agentes (Minerva, Lyra, Atlas, etc.) que trabajan EN EL MISMO proyecto te ven y te pueden hablar.

Flujo esperado:
1. Al ARRANCAR (en tu bootstrap, cuando el operador te da proyecto + memoria): llama join_office con tu nombre, project_path y memoria_path. Mira quien mas esta activo y revisa tu inbox.
2. MIENTRAS trabajas: antes de tocar un modulo/contrato que otro podria estar tocando, mira office_who y haz office_claim. Si vas a cambiar algo que afecta a otro agente, anuncialo con office_announce(type:'intent'|'contract_change', mentions:[...]).
3. En tus CHECKPOINTS (cambio de fase, antes de operaciones de riesgo, al cerrar): llama office_inbox para ver si alguien te hablo.
4. Al TERMINAR tu sesion: office_leave (salida limpia). Solo si el operador pide cerrar todo el proyecto: office_shutdown (y aterriza el acta en memoria/).

Regla de oro: la oficina es el canal en vivo (efimero); la VERDAD durable sigue viviendo en memoria/ (log.md, contratos, checklists). Todo evento con consecuencia se aterriza en memoria/.`,
  },
);

mcp.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

mcp.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args = {} } = req.params;
  try {
    switch (name) {
      case "join_office": {
        const { agent_name, project_path, memoria_path, branch, modules } = args;
        const started = await ensureBroker();
        const { officeId, created } = resolveOfficeId(memoria_path);
        const r = await brokerPost("/join", {
          officeId,
          projectPath: project_path,
          memoriaPath: memoria_path,
          name: agent_name,
          pid: process.pid,
          branch: branch ?? null,
          modules: modules ?? [],
        });
        me = { officeId, name: agent_name, projectPath: project_path, memoriaPath: memoria_path };
        lastPushedSeq = r.currentSeq ?? 0; // empuja solo lo NUEVO (el inbox heredado ya va en la respuesta)
        startHeartbeat();
        startPushLoop();
        writeSessionFile(officeId, agent_name); // el hook de pull-auto leera SOLO esta oficina
        const others = r.presence.agents.filter((a) => a.name !== agent_name);
        const lines = [];
        lines.push(
          `${r.reconnected ? "Reconectado" : "Unido"} a la oficina del proyecto como "${agent_name}".` +
            (started ? " (Encendiste el broker — eras el primero.)" : "") +
            (created ? " (Cree el office-id estable en <memoria>/.office-id — commitealo con la memoria.)" : ""),
        );
        lines.push(
          others.length
            ? `\nActivos ahora:\n` +
                others.map((a) => `  • ${a.name} [${a.status}]${a.branch ? ` branch ${a.branch}` : ""}${a.modules?.length ? ` — toca ${a.modules.join(", ")}` : ""}`).join("\n")
            : "\nNo hay otros agentes en la oficina ahora mismo.",
        );
        if (r.presence.locks.length) {
          lines.push(`\nReservas activas:\n` + r.presence.locks.map((l) => `  • ${l.resource} — ${l.holder}${l.note ? ` (${l.note})` : ""}`).join("\n"));
        }
        if (r.inbox.length) {
          lines.push(`\n📨 Inbox heredado (${r.inbox.length}):\n` + r.inbox.map((m) => `  • [${m.type}] ${m.from}: ${m.text}`).join("\n") + `\n(Llama office_inbox para marcarlos leidos.)`);
        }
        return text(lines.join("\n"));
      }

      case "office_announce": {
        if (!me) return errText("Primero llama join_office.");
        const { type, text: msg, mentions, affects } = args;
        await brokerPost("/announce", { officeId: me.officeId, from: me.name, type, text: msg, mentions: mentions ?? [], affects: affects ?? [] });
        const to = mentions?.length ? `a ${mentions.join(", ")}` : "a todos (broadcast)";
        return text(`Anunciado ${to}: [${type}] ${msg}${await inboxHint()}`);
      }

      case "office_inbox": {
        if (!me) return errText("Primero llama join_office.");
        const { messages } = await brokerPost("/inbox", { officeId: me.officeId, name: me.name });
        if (!messages.length) return text("Inbox vacio — nadie te hablo desde la ultima vez.");
        const maxSeq = Math.max(...messages.map((m) => m.seq));
        await brokerPost("/ack", { officeId: me.officeId, name: me.name, upToSeq: maxSeq });
        const lines = messages.map((m) => `[${m.type}] ${m.from} (${m.ts})${m.affects?.length ? ` {${m.affects.join(", ")}}` : ""}:\n  ${m.text}`);
        return text(`${messages.length} mensaje(s) (marcados como leidos):\n\n${lines.join("\n\n")}`);
      }

      case "office_who": {
        if (!me) return errText("Primero llama join_office.");
        const p = await brokerPost("/presence", { officeId: me.officeId });
        const agents = p.agents.length ? p.agents.map((a) => `  • ${a.name} [${a.status}]${a.branch ? ` branch ${a.branch}` : ""}${a.modules?.length ? ` — ${a.modules.join(", ")}` : ""}`).join("\n") : "  (vacio)";
        const locks = p.locks.length ? `\n\nReservas:\n` + p.locks.map((l) => `  • ${l.resource} — ${l.holder}${l.note ? ` (${l.note})` : ""}`).join("\n") : "\n\nSin reservas activas.";
        return text(`Oficina del proyecto:\n${agents}${locks}`);
      }

      case "office_claim": {
        if (!me) return errText("Primero llama join_office.");
        const { resource, note } = args;
        const r = await brokerPost("/claim", { officeId: me.officeId, name: me.name, resource, note });
        if (!r.ok) return errText(`No pudiste reservar "${resource}": lo tiene ${r.held_by}${r.note ? ` (${r.note})` : ""} desde ${r.since}. Coordina con ${r.held_by} antes de tocarlo.`);
        return text(`Reservaste "${resource}".${await inboxHint()}`);
      }

      case "office_release": {
        if (!me) return errText("Primero llama join_office.");
        const { resource, force } = args;
        const r = await brokerPost("/release", { officeId: me.officeId, name: me.name, resource, force: !!force });
        if (!r.ok) return errText(`No pudiste liberar "${resource}": es de ${r.held_by}. Usa force=true solo si es huerfano.`);
        return text(`Liberaste "${resource}".`);
      }

      case "office_leave": {
        if (!me) return errText("No estabas en ninguna oficina.");
        await brokerPost("/leave", { officeId: me.officeId, name: me.name });
        const who = me.name;
        me = null;
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        if (pushTimer) clearInterval(pushTimer);
        clearSessionFile();
        return text(`${who} salio de la oficina (reservas liberadas, presencia idle). El broker y los demas siguen activos.`);
      }

      case "office_shutdown": {
        if (!me) return errText("No estabas en ninguna oficina.");
        const memoriaPath = me.memoriaPath;
        const r = await brokerPost("/close-office", { officeId: me.officeId });
        const acta = r.acta;
        me = null;
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        if (pushTimer) clearInterval(pushTimer);
        clearSessionFile();
        // Aterrizaje automatico del acta: el server la escribe a memoria/oficina/<fecha>.json.
        // El agente solo agrega la linea consciente en log.md (la parte de criterio).
        try {
          const stamp = (acta.closed_at || new Date().toISOString())
            .slice(0, 16)
            .replace("T", "-")
            .replace(/:/g, "");
          const dir = join(memoriaPath, "oficina");
          if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
          const actaPath = join(dir, `${stamp}.json`);
          writeFileSync(actaPath, JSON.stringify(acta, null, 2), "utf8");
          return text(
            `Oficina del proyecto CERRADA. Acta guardada en \`${actaPath}\` ` +
              `(${acta.events.length} eventos; agentes: ${acta.agents.join(", ") || "—"}).\n\n` +
              `Siguiente paso: agrega una línea en \`memoria/log.md\` resumiendo la jornada de coordinación. ` +
              `El broker daemon sigue vivo (otros proyectos); para apagarlo del todo: CLI \`kill-broker\`.`,
          );
        } catch (e) {
          // Fallback: si no se pudo escribir, devolver el acta inline para aterrizarla a mano.
          return text(
            `Oficina CERRADA, pero NO pude escribir el acta (${e.message}). Aterrízala a mano en memoria/oficina/:\n\n` +
              "```json\n" + JSON.stringify(acta, null, 2) + "\n```",
          );
        }
      }

      default:
        return errText(`Tool desconocida: ${name}`);
    }
  } catch (e) {
    return errText(`Error en ${name}: ${e.message}`);
  }
});

// --- Arranque ---
async function main() {
  await mcp.connect(new StdioServerTransport());
  logErr("MCP conectado (stdio). Esperando join_office.");
}

main().catch((e) => {
  logErr(`Fatal: ${e.message}`);
  process.exit(1);
});
