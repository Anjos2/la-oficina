#!/usr/bin/env node
/**
 * Finalidad: Test del boundary MCP (cliente ↔ server.mjs ↔ broker). Usa el Client real
 *   del SDK MCP sobre stdio para lanzar server.mjs, lista las tools y ejercita el flujo
 *   que vivira un agente: join_office → office_who → office_announce. Valida que el
 *   contrato MCP funciona end-to-end (no solo la logica del broker, ya cubierta por smoke.mjs).
 * Interrelacion: server.mjs auto-arranca el broker en el puerto AISLADO que pasamos por env.
 *   Al cerrar, apaga ese broker (POST /kill) para no dejar procesos colgados.
 *
 * Uso: node scripts/mcp-smoke.mjs   (0 = OK, 1 = fallo)
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "node:url";
import { mkdtempSync, existsSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";

const PORT = 7911; // aislado
const STATE = join(tmpdir(), `office-mcpsmoke-${process.pid}.json`);
// OFFICE_SMOKE_SERVER permite apuntar el smoke a otro build (ej. ../dist/server.bundle.mjs)
const SERVER = fileURLToPath(new URL(process.env.OFFICE_SMOKE_SERVER || "../src/server.mjs", import.meta.url));
const memoriaDir = mkdtempSync(join(tmpdir(), "office-mem-"));

let failures = 0;
function check(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failures++;
    console.log(`  ✗ ${name}\n      ${e.message}`);
  }
}
function textOf(res) {
  return (res.content ?? []).map((c) => c.text ?? "").join("\n");
}

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [SERVER],
  env: { ...process.env, OFFICE_MCP_PORT: String(PORT), OFFICE_MCP_STATE: STATE },
});
const client = new Client({ name: "smoke-client", version: "0.0.1" }, { capabilities: {} });

async function main() {
  await client.connect(transport);
  console.log("mcp-smoke: conectado al server MCP\n");

  const { tools } = await client.listTools();
  const names = tools.map((t) => t.name).sort();
  check("expone las 8 tools de la oficina", () => {
    assert.deepEqual(names, [
      "join_office",
      "office_announce",
      "office_claim",
      "office_inbox",
      "office_leave",
      "office_release",
      "office_shutdown",
      "office_who",
    ]);
  });

  const joinRes = await client.callTool({
    name: "join_office",
    arguments: { agent_name: "Hermes", project_path: "/proj/X", memoria_path: memoriaDir, branch: "agent/hermes/test", modules: ["android/"] },
  });
  const joinTxt = textOf(joinRes);
  check("join_office responde y crea/usa el office-id estable", () => {
    assert.match(joinTxt, /oficina del proyecto como "Hermes"/);
  });

  const whoRes = await client.callTool({ name: "office_who", arguments: {} });
  check("office_who muestra a Hermes activo", () => {
    assert.match(textOf(whoRes), /Hermes \[active\]/);
  });

  const annRes = await client.callTool({
    name: "office_announce",
    arguments: { type: "intent", text: "voy a tocar el NLS de captura", mentions: [], affects: ["android/"] },
  });
  check("office_announce publica sin error", () => {
    assert.equal(annRes.isError ?? false, false);
    assert.match(textOf(annRes), /Anunciado a todos/);
  });

  const shutRes = await client.callTool({ name: "office_shutdown", arguments: {} });
  check("office_shutdown aterriza el acta en memoria/oficina/", () => {
    assert.match(textOf(shutRes), /Acta guardada en/);
    const dir = join(memoriaDir, "oficina");
    assert.ok(existsSync(dir), "debe existir memoria/oficina/");
    const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
    assert.ok(files.length >= 1, "debe haber al menos un acta .json");
    const acta = JSON.parse(readFileSync(join(dir, files[0]), "utf8"));
    assert.ok(Array.isArray(acta.events), "el acta debe tener events");
    assert.ok(acta.agents.includes("Hermes"), "el acta lista a Hermes");
  });

  console.log(`\nmcp-smoke: ${failures === 0 ? "TODO VERDE ✓" : `${failures} fallo(s) ✗`}`);
}

main()
  .catch((e) => {
    console.error("mcp-smoke fatal:", e.message);
    failures++;
  })
  .finally(async () => {
    // Apagar el broker aislado que el server levanto.
    try {
      await fetch(`http://127.0.0.1:${PORT}/kill`, { method: "POST", signal: AbortSignal.timeout(1500) });
    } catch {
      /* ya estaba caido */
    }
    try {
      await client.close();
    } catch {
      /* ignore */
    }
    process.exit(failures === 0 ? 0 : 1);
  });
