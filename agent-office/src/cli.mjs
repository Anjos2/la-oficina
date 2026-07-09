#!/usr/bin/env node
//! La Oficina — (c) 2026 Joseph Huayhualla (@Anjos2) · https://github.com/Anjos2/la-oficina · MIT License (@license)
/**
 * Finalidad: CLI de inspeccion/control del broker de "La Oficina". Para que el operador
 *   (o un agente via Bash) vea el estado o apague el broker daemon sin pasar por una sesion.
 * Interrelacion: Habla con broker.mjs por HTTP. Read-only salvo `kill-broker`.
 *
 * Uso:
 *   node src/cli.mjs status        # oficinas activas + agentes + reservas
 *   node src/cli.mjs health        # ¿el broker esta vivo?
 *   node src/cli.mjs kill-broker   # apaga el broker daemon (mata TODAS las oficinas)
 */

const PORT = parseInt(process.env.OFFICE_MCP_PORT ?? "7900", 10);
const BASE = `http://127.0.0.1:${PORT}`;

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(3000) });
  return res.json();
}
async function post(path) {
  const res = await fetch(`${BASE}${path}`, { method: "POST", signal: AbortSignal.timeout(3000) });
  return res.json();
}

const cmd = process.argv[2] ?? "status";

try {
  switch (cmd) {
    case "health": {
      const h = await get("/health");
      console.log(`broker OK — estado en ${h.state_path}`);
      break;
    }
    case "status":
    case "offices": {
      const s = await get("/snapshot");
      if (!s.offices.length) {
        console.log("No hay oficinas activas.");
        break;
      }
      for (const o of s.offices) {
        console.log(`Oficina ${o.id}`);
        console.log(`  proyecto: ${o.project_path ?? "(?)"}`);
        console.log(`  agentes : ${o.agents.length ? o.agents.join(", ") : "(ninguno)"}`);
        console.log(`  eventos : ${o.events}   reservas: ${o.locks}`);
      }
      break;
    }
    case "kill-broker": {
      const r = await post("/kill");
      console.log(r.msg ?? "broker apagado");
      break;
    }
    default:
      console.log("Comandos: status | health | kill-broker");
  }
} catch (e) {
  console.error(`No se pudo contactar al broker en ${BASE}: ${e.message}`);
  console.error("(¿esta encendido? lo arranca la primera sesion de agente, o: node src/broker.mjs)");
  process.exit(1);
}
