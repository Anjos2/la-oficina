#!/usr/bin/env node
/**
 * Finalidad: Test del PUSH v2 (claude/channel). Un cliente MCP real (Hermes) se une y
 *   registra un handler de notificaciones; luego se simula que otro agente (Minerva)
 *   menciona a Hermes y se verifica que el server EMPUJA esa mención por el channel.
 *   También verifica que un BROADCAST (sin mención directa) NO se empuja (queda para pull).
 * Interrelacion: valida el boundary nuevo server.mjs → cliente vía notifications/claude/channel.
 *   El poll loop del server corre cada 2.5s; el test espera lo suficiente.
 *
 * Uso: node scripts/mcp-push-smoke.mjs   (0 = OK, 1 = fallo)
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "node:url";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PORT = 7912;
const STATE = join(tmpdir(), `office-pushsmoke-${process.pid}.json`);
const SERVER = fileURLToPath(new URL("../src/server.mjs", import.meta.url));
const memoriaDir = mkdtempSync(join(tmpdir(), "office-pushmem-"));
const BROKER = `http://127.0.0.1:${PORT}`;

let failures = 0;
function check(name, cond, detail) {
  if (cond) console.log(`  ✓ ${name}`);
  else { failures++; console.log(`  ✗ ${name}${detail ? `\n      ${detail}` : ""}`); }
}

const received = [];
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [SERVER],
  env: { ...process.env, OFFICE_MCP_PORT: String(PORT), OFFICE_MCP_STATE: STATE },
});
const client = new Client(
  { name: "push-smoke", version: "0.0.1" },
  { capabilities: { experimental: { "claude/channel": {} } } },
);
// Captura toda notificación que el server empuje (incluido el channel experimental).
client.fallbackNotificationHandler = async (n) => { received.push(n); };

async function announceAs(officeId, from, type, text, mentions) {
  await fetch(`${BROKER}/announce`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ officeId, from, type, text, mentions }),
  });
}

async function main() {
  await client.connect(transport);
  console.log("mcp-push-smoke: conectado\n");

  await client.callTool({
    name: "join_office",
    arguments: { agent_name: "Hermes", project_path: "/proj/P", memoria_path: memoriaDir },
  });
  const officeId = readFileSync(join(memoriaDir, ".office-id"), "utf8").trim();

  // (1) Minerva menciona a Hermes → debe empujarse por el channel
  await announceAs(officeId, "Minerva", "contract_change", "cambio el campo X del payload", ["Hermes"]);
  await new Promise((r) => setTimeout(r, 4000)); // poll loop = 2.5s
  const pushed = received.find(
    (n) => n.method === "notifications/claude/channel" && JSON.stringify(n.params ?? {}).includes("cambio el campo X"),
  );
  check("la mención directa de Minerva se EMPUJA a Hermes", !!pushed,
    `notifs recibidas: ${JSON.stringify(received.map((n) => n.method))}`);

  // (2) Un broadcast (mentions vacío) NO debe empujarse — queda para office_inbox
  await announceAs(officeId, "Minerva", "info", "mensaje broadcast general a todos", []);
  await new Promise((r) => setTimeout(r, 3500));
  const broadcastPushed = received.find((n) => JSON.stringify(n.params ?? {}).includes("broadcast general"));
  check("un broadcast NO se empuja (queda para pull)", !broadcastPushed);

  console.log(`\nmcp-push-smoke: ${failures === 0 ? "TODO VERDE ✓" : `${failures} fallo(s) ✗`}`);
}

main()
  .catch((e) => { console.error("mcp-push-smoke fatal:", e.message); failures++; })
  .finally(async () => {
    try { await fetch(`${BROKER}/kill`, { method: "POST", signal: AbortSignal.timeout(1500) }); } catch { /* ya caído */ }
    try { await client.close(); } catch { /* ignore */ }
    process.exit(failures === 0 ? 0 : 1);
  });
