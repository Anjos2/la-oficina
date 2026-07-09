#!/usr/bin/env node
//! La Oficina — (c) 2026 Joseph Huayhualla (@Anjos2) · https://github.com/Anjos2/la-oficina · MIT License

// src/broker.mjs
import { createServer } from "node:http";

// src/store.mjs
import { writeFileSync, readFileSync, existsSync, mkdirSync, renameSync } from "node:fs";
import { dirname } from "node:path";
import { homedir } from "node:os";
var STATE_PATH = process.env.OFFICE_MCP_STATE ?? `${homedir()}/.office-mcp/state.json`;
var HEARTBEAT_TTL_MS = 9e4;
var STATUS = { ACTIVE: "active", IDLE: "idle", DISCONNECTED: "disconnected" };
function nowIso() {
  return (/* @__PURE__ */ new Date()).toISOString();
}
function emptyState() {
  return { version: 1, offices: {} };
}
function loadState() {
  try {
    if (existsSync(STATE_PATH)) {
      const raw = readFileSync(STATE_PATH, "utf8");
      const parsed = JSON.parse(raw);
      if (parsed && parsed.offices) return parsed;
    }
  } catch (e) {
    console.error(`[office store] no se pudo leer ${STATE_PATH}: ${e.message}; arranco limpio`);
  }
  return emptyState();
}
var state = loadState();
function persist() {
  try {
    const dir = dirname(STATE_PATH);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const tmp = `${STATE_PATH}.tmp`;
    writeFileSync(tmp, JSON.stringify(state, null, 2), "utf8");
    renameSync(tmp, STATE_PATH);
  } catch (e) {
    console.error(`[office store] no se pudo persistir: ${e.message}`);
  }
}
function getOffice(officeId) {
  return state.offices[officeId] ?? null;
}
function ensureOffice({ officeId, projectPath, memoriaPath }) {
  let office = state.offices[officeId];
  if (!office) {
    office = {
      id: officeId,
      project_path: projectPath ?? null,
      memoria_path: memoriaPath ?? null,
      created_at: nowIso(),
      seq: 0,
      agents: {},
      events: [],
      locks: {}
    };
    state.offices[officeId] = office;
  } else {
    if (projectPath) office.project_path = projectPath;
    if (memoriaPath) office.memoria_path = memoriaPath;
  }
  return office;
}
function presenceOf(office) {
  return {
    office_id: office.id,
    project_path: office.project_path,
    agents: Object.values(office.agents).map((a) => ({
      name: a.name,
      status: a.status,
      branch: a.branch,
      modules: a.modules,
      joined_at: a.joined_at,
      last_seen: a.last_seen
    })),
    locks: Object.entries(office.locks).map(([resource, l]) => ({
      resource,
      holder: l.holder,
      note: l.note,
      since: l.ts
    }))
  };
}
function inboxFor(office, agentName) {
  const agent = office.agents[agentName];
  const sinceSeq = agent ? agent.last_acked_seq : 0;
  return office.events.filter(
    (e) => e.seq > sinceSeq && e.from !== agentName && (e.mentions.length === 0 || e.mentions.includes(agentName))
  );
}
var store = {
  STATUS,
  /**
   * Une (o reconecta) un agente a una oficina. Reconnect-by-name: si el nombre ya
   * existe en la oficina, hace takeover (nueva sesion toma la identidad) conservando
   * su last_acked_seq y sus locks → hereda el inbox pendiente. Crea la oficina si no
   * existe. Devuelve presencia actual + inbox heredado.
   */
  join({ officeId, projectPath, memoriaPath, name, pid, branch, modules }) {
    const office = ensureOffice({ officeId, projectPath, memoriaPath });
    const existing = office.agents[name];
    const reconnected = !!existing;
    office.agents[name] = {
      name,
      pid: pid ?? null,
      branch: branch ?? null,
      modules: modules ?? [],
      status: STATUS.ACTIVE,
      joined_at: existing ? existing.joined_at : nowIso(),
      last_seen: nowIso(),
      // Herencia: conserva hasta donde habia leido la sesion previa con este nombre.
      last_acked_seq: existing ? existing.last_acked_seq : 0
    };
    const inbox = inboxFor(office, name);
    this._appendEvent(office, {
      from: name,
      type: reconnected ? "reconnected" : "joined",
      text: reconnected ? `${name} se reconecto (sesion nueva tomo la identidad)` : `${name} entro a la oficina${branch ? ` (branch ${branch})` : ""}`,
      mentions: [],
      affects: modules ?? []
    });
    persist();
    return { reconnected, presence: presenceOf(office), inbox, currentSeq: office.seq };
  },
  /** Publica un evento al log de la oficina. mentions=[] => broadcast a todos. */
  announce({ officeId, from, type, text, mentions, affects }) {
    const office = getOffice(officeId);
    if (!office) return { error: `office ${officeId} no existe` };
    const event = this._appendEvent(office, {
      from,
      type: type ?? "info",
      text,
      mentions: mentions ?? [],
      affects: affects ?? []
    });
    if (office.agents[from]) office.agents[from].last_seen = nowIso();
    persist();
    return { event };
  },
  _appendEvent(office, { from, type, text, mentions, affects }) {
    office.seq += 1;
    const event = {
      seq: office.seq,
      ts: nowIso(),
      from,
      type,
      text,
      mentions: mentions ?? [],
      affects: affects ?? []
    };
    office.events.push(event);
    return event;
  },
  /** Eventos dirigidos a este agente (mencion directa o broadcast) aun no leidos. */
  inbox({ officeId, name }) {
    const office = getOffice(officeId);
    if (!office) return { error: `office ${officeId} no existe` };
    return { messages: inboxFor(office, name) };
  },
  /** Marca leidos los eventos hasta up_to_seq (cursor del agente). */
  ack({ officeId, name, upToSeq }) {
    const office = getOffice(officeId);
    if (!office) return { error: `office ${officeId} no existe` };
    const agent = office.agents[name];
    if (agent && upToSeq > agent.last_acked_seq) {
      agent.last_acked_seq = upToSeq;
      agent.last_seen = nowIso();
      persist();
    }
    return { ok: true };
  },
  /** Eventos nuevos desde un cursor (para pull explicito). */
  poll({ officeId, sinceSeq }) {
    const office = getOffice(officeId);
    if (!office) return { error: `office ${officeId} no existe` };
    return { events: office.events.filter((e) => e.seq > (sinceSeq ?? 0)) };
  },
  /** Presencia de la oficina: quien esta, su estado, y los locks activos. */
  presence({ officeId }) {
    this._pruneStale();
    const office = getOffice(officeId);
    if (!office) return { error: `office ${officeId} no existe` };
    return presenceOf(office);
  },
  /** Reserva advisory de un recurso. Falla si lo tiene OTRO agente. */
  claim({ officeId, name, resource, note }) {
    const office = getOffice(officeId);
    if (!office) return { error: `office ${officeId} no existe` };
    const held = office.locks[resource];
    if (held && held.holder !== name) {
      return { ok: false, held_by: held.holder, note: held.note, since: held.ts };
    }
    office.locks[resource] = { holder: name, note: note ?? null, ts: nowIso() };
    this._appendEvent(office, {
      from: name,
      type: "lock",
      text: `${name} reservo ${resource}${note ? ` \u2014 ${note}` : ""}`,
      mentions: [],
      affects: [resource]
    });
    if (office.agents[name]) office.agents[name].last_seen = nowIso();
    persist();
    return { ok: true };
  },
  /** Libera un recurso (solo si lo tiene este agente). force=true ignora el dueno. */
  release({ officeId, name, resource, force }) {
    const office = getOffice(officeId);
    if (!office) return { error: `office ${officeId} no existe` };
    const held = office.locks[resource];
    if (!held) return { ok: true };
    if (held.holder !== name && !force) {
      return { ok: false, held_by: held.holder };
    }
    delete office.locks[resource];
    this._appendEvent(office, {
      from: name,
      type: "unlock",
      text: `${name} libero ${resource}${force && held.holder !== name ? ` (forzado; era de ${held.holder})` : ""}`,
      mentions: force && held.holder !== name ? [held.holder] : [],
      affects: [resource]
    });
    persist();
    return { ok: true };
  },
  /** Actualiza last_seen del agente (mantiene su presencia "active"). */
  heartbeat({ officeId, name }) {
    const office = getOffice(officeId);
    if (!office) return { error: `office ${officeId} no existe` };
    const agent = office.agents[name];
    if (agent) {
      agent.last_seen = nowIso();
      if (agent.status === STATUS.DISCONNECTED) agent.status = STATUS.ACTIVE;
      persist();
    }
    return { ok: true };
  },
  /** Salida limpia: marca idle y libera los locks del agente. NO borra al agente
   *  (conserva su cursor para un reconnect-by-name posterior). */
  leave({ officeId, name }) {
    const office = getOffice(officeId);
    if (!office) return { error: `office ${officeId} no existe` };
    const agent = office.agents[name];
    if (agent) agent.status = STATUS.IDLE;
    for (const [resource, l] of Object.entries(office.locks)) {
      if (l.holder === name) delete office.locks[resource];
    }
    this._appendEvent(office, {
      from: name,
      type: "left",
      text: `${name} salio de la oficina (libero sus reservas)`,
      mentions: [],
      affects: []
    });
    persist();
    return { ok: true };
  },
  /** Cierra la oficina del proyecto: devuelve el acta (log completo) para que el
   *  agente la aterrice en memoria/, y la elimina del estado. NO apaga el broker. */
  closeOffice({ officeId }) {
    const office = getOffice(officeId);
    if (!office) return { error: `office ${officeId} no existe` };
    const acta = {
      office_id: office.id,
      project_path: office.project_path,
      opened_at: office.created_at,
      closed_at: nowIso(),
      agents: Object.keys(office.agents),
      events: office.events
    };
    delete state.offices[officeId];
    persist();
    return { acta };
  },
  /** Marca como "disconnected" a los agentes sin heartbeat reciente (sin borrarlos). */
  _pruneStale() {
    const cutoff = Date.now() - HEARTBEAT_TTL_MS;
    let changed = false;
    for (const office of Object.values(state.offices)) {
      for (const agent of Object.values(office.agents)) {
        if (agent.status === STATUS.ACTIVE && new Date(agent.last_seen).getTime() < cutoff) {
          agent.status = STATUS.DISCONNECTED;
          changed = true;
        }
      }
    }
    if (changed) persist();
  },
  /**
   * Inbox de menciones directas de un agente por NOMBRE. Si se pasa officeId, busca SOLO en
   * esa oficina (respeta el aislamiento por proyecto — el caso del hook con session id); sin
   * officeId, busca en todas (fallback). Marca leidas las menciones que devuelve (avanza el
   * cursor hasta la ultima mencion). Devuelve por oficina.
   */
  inboxByName({ name, officeId }) {
    this._pruneStale();
    const inboxes = [];
    let changed = false;
    const offices = officeId ? state.offices[officeId] ? [state.offices[officeId]] : [] : Object.values(state.offices);
    for (const office of offices) {
      const agent = office.agents[name];
      if (!agent) continue;
      const msgs = office.events.filter(
        (e) => e.seq > agent.last_acked_seq && e.from !== name && e.mentions.includes(name)
      );
      if (msgs.length) {
        inboxes.push({ office_id: office.id, project: office.project_path, messages: msgs });
        agent.last_acked_seq = Math.max(...msgs.map((m) => m.seq));
        changed = true;
      }
    }
    if (changed) persist();
    return { inboxes };
  },
  /** Snapshot global (para CLI / health). */
  snapshot() {
    this._pruneStale();
    return {
      offices: Object.values(state.offices).map((o) => ({
        id: o.id,
        project_path: o.project_path,
        agents: Object.values(o.agents).map((a) => `${a.name}:${a.status}`),
        events: o.events.length,
        locks: Object.keys(o.locks).length
      }))
    };
  }
};

// src/broker.mjs
var PORT = parseInt(process.env.OFFICE_MCP_PORT ?? "7900", 10);
var HOST = "127.0.0.1";
var IDLE_SHUTDOWN_MIN = parseInt(process.env.OFFICE_MCP_IDLE_SHUTDOWN_MIN ?? "60", 10);
var lastActivity = Date.now();
var ROUTES = {
  "/join": (b) => store.join(b),
  "/announce": (b) => store.announce(b),
  "/inbox": (b) => store.inbox(b),
  "/inbox-by-name": (b) => store.inboxByName(b),
  "/ack": (b) => store.ack(b),
  "/poll": (b) => store.poll(b),
  "/presence": (b) => store.presence(b),
  "/claim": (b) => store.claim(b),
  "/release": (b) => store.release(b),
  "/heartbeat": (b) => store.heartbeat(b),
  "/leave": (b) => store.leave(b),
  "/close-office": (b) => store.closeOffice(b)
};
function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1e6) reject(new Error("body demasiado grande"));
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(new Error(`JSON invalido: ${e.message}`));
      }
    });
    req.on("error", reject);
  });
}
var server = createServer(async (req, res) => {
  lastActivity = Date.now();
  const path = (req.url ?? "").split("?")[0];
  if (req.method === "GET") {
    if (path === "/health") return sendJson(res, 200, { status: "ok", state_path: STATE_PATH });
    if (path === "/snapshot") return sendJson(res, 200, store.snapshot());
    return sendJson(res, 200, { server: "office-mcp broker" });
  }
  if (req.method !== "POST") return sendJson(res, 405, { error: "metodo no permitido" });
  if (path === "/kill") {
    sendJson(res, 200, { ok: true, msg: "broker apagandose" });
    return shutdown();
  }
  const handler = ROUTES[path];
  if (!handler) return sendJson(res, 404, { error: `ruta desconocida: ${path}` });
  try {
    const body = await readBody(req);
    const result = handler(body);
    const status = result && result.error ? 400 : 200;
    return sendJson(res, status, result);
  } catch (e) {
    return sendJson(res, 500, { error: e.message });
  }
});
server.listen(PORT, HOST, () => {
  console.error(`[office-mcp broker] escuchando en http://${HOST}:${PORT} (estado: ${STATE_PATH})`);
  if (IDLE_SHUTDOWN_MIN > 0) {
    console.error(`[office-mcp broker] auto-apagado tras ${IDLE_SHUTDOWN_MIN} min sin actividad`);
  }
});
if (IDLE_SHUTDOWN_MIN > 0) {
  const idleMs = IDLE_SHUTDOWN_MIN * 6e4;
  setInterval(() => {
    if (Date.now() - lastActivity > idleMs) {
      console.error(`[office-mcp broker] ${IDLE_SHUTDOWN_MIN} min sin actividad \u2014 auto-apagado`);
      shutdown();
    }
  }, 6e4).unref();
}
function shutdown() {
  console.error("[office-mcp broker] apagando");
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 1500).unref();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
//! La Oficina — (c) 2026 Joseph Huayhualla (@Anjos2) · https://github.com/Anjos2/la-oficina · MIT License (@license)
