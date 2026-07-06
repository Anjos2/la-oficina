#!/usr/bin/env node
/**
 * Finalidad: Daemon del broker de "La Oficina". Un unico servidor HTTP en
 *   127.0.0.1:PUERTO (localhost-only) que mantiene el estado compartido de todas las
 *   oficinas (via store.mjs) y enruta las operaciones de los agentes. Es un singleton:
 *   lo auto-arranca el primer MCP server que no lo encuentra vivo, y sobrevive al cierre
 *   de las sesiones — solo se apaga por orden explicita del humano (shutdown / kill).
 *
 *   Stack: Node http nativo. Sin frameworks, sin SQLite, sin deps de red. El store es
 *   el unico escritor (single-process), asi que no hay concurrencia que coordinar.
 *
 * Interrelacion: Cada sesion de agente corre un server.mjs (MCP stdio) que habla con
 *   este broker por HTTP. El broker NUNCA habla con Claude directo — solo sirve estado.
 */

import { createServer } from "node:http";
import { store, STATE_PATH } from "./store.mjs";

const PORT = parseInt(process.env.OFFICE_MCP_PORT ?? "7900", 10);
const HOST = "127.0.0.1";

// Auto-apagado por inactividad: si nadie toca el broker por este tiempo (todas las
// sesiones cerradas → sin heartbeats), el daemon se apaga solo para NO consumir recursos.
// Asi el operador no tiene que acordarse de matarlo. 0 = nunca auto-apagar.
// El estado (state.json) persiste en disco: al reabrir, la primera sesion lo relanza.
const IDLE_SHUTDOWN_MIN = parseInt(process.env.OFFICE_MCP_IDLE_SHUTDOWN_MIN ?? "60", 10);
let lastActivity = Date.now();

// Mapa endpoint → handler del store. Cada handler recibe el body parseado y devuelve
// el objeto a serializar como respuesta JSON.
const ROUTES = {
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
  "/close-office": (b) => store.closeOffice(b),
};

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) reject(new Error("body demasiado grande"));
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

const server = createServer(async (req, res) => {
  lastActivity = Date.now(); // cualquier request cuenta como actividad (incluye heartbeats)
  const path = (req.url ?? "").split("?")[0];

  // GET de lectura: health + snapshot (para el CLI / diagnostico).
  if (req.method === "GET") {
    if (path === "/health") return sendJson(res, 200, { status: "ok", state_path: STATE_PATH });
    if (path === "/snapshot") return sendJson(res, 200, store.snapshot());
    return sendJson(res, 200, { server: "office-mcp broker" });
  }

  if (req.method !== "POST") return sendJson(res, 405, { error: "metodo no permitido" });

  // Apagado del broker daemon (solo localhost). Lo usa el CLI `kill-broker` o el operador.
  // OJO: mata el broker de TODOS los proyectos. Cerrar UNA oficina es /close-office.
  if (path === "/kill") {
    sendJson(res, 200, { ok: true, msg: "broker apagandose" });
    return shutdown();
  }

  const handler = ROUTES[path];
  if (!handler) return sendJson(res, 404, { error: `ruta desconocida: ${path}` });

  try {
    const body = await readBody(req);
    const result = handler(body);
    // Los handlers del store devuelven {error} para errores de dominio (oficina inexistente, etc).
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

// Vigilancia de inactividad. El .unref() evita que el timer impida la salida del proceso;
// el server HTTP es quien mantiene vivo el event loop.
if (IDLE_SHUTDOWN_MIN > 0) {
  const idleMs = IDLE_SHUTDOWN_MIN * 60_000;
  setInterval(() => {
    if (Date.now() - lastActivity > idleMs) {
      console.error(`[office-mcp broker] ${IDLE_SHUTDOWN_MIN} min sin actividad — auto-apagado`);
      shutdown();
    }
  }, 60_000).unref();
}

// Apagado limpio (el humano lo mata con SIGTERM/SIGINT o el CLI kill-broker).
function shutdown() {
  console.error("[office-mcp broker] apagando");
  server.close(() => process.exit(0));
  // Salida forzada si alguna conexion queda colgada.
  setTimeout(() => process.exit(0), 1500).unref();
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
