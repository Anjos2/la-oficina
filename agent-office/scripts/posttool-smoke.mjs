#!/usr/bin/env node
/**
 * Finalidad: smoke test del hook `office-posttool-hook.mjs` (menciones a mitad de turno).
 *   Valida con broker MOCK: (1) inyecta additionalContext PostToolUse cuando hay menciones,
 *   (2) el throttle evita consultas repetidas dentro de la ventana, (3) vuelve a consultar
 *   pasada la ventana, (4) sin session file no inyecta nada, (5) broker caido = silencio (exit 0).
 * Interrelacion: ejecuta el hook como subproceso con env de prueba; broker mock en node:http.
 */
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HOOK = join(dirname(fileURLToPath(import.meta.url)), "..", "hooks", "office-posttool-hook.mjs");
const PORT = 7902;
let pass = 0, fail = 0;
const ok = (name, cond) => { cond ? (pass++, console.log(`  ✓ ${name}`)) : (fail++, console.log(`  ✗ ${name}`)); };

// spawn ASINCRONO: spawnSync bloquearia el event loop del padre y el broker mock
// (que vive en ESTE proceso) jamas podria responder al hook — deadlock hasta el timeout.
function runHook(env, stdin) {
  return new Promise((resolve) => {
    const p = spawn("node", [HOOK], { env: { ...process.env, ...env } });
    let out = "";
    p.stdout.on("data", (c) => (out += c));
    p.on("close", (code) => resolve({ out, code }));
    p.stdin.write(JSON.stringify(stdin ?? {}));
    p.stdin.end();
    setTimeout(() => p.kill(), 5000);
  });
}

const sessions = mkdtempSync(join(tmpdir(), "office-smoke-"));
writeFileSync(join(sessions, "test-key.json"), JSON.stringify({ officeId: "of-1", name: "Vatel" }));

const broker = createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      inboxes: [{ messages: [{ type: "question", from: "Milon", text: "¿tocas tú el modulo X?", affects: ["x/"] }] }],
    }));
  });
});

await new Promise((r) => broker.listen(PORT, "127.0.0.1", r));

const env = { OFFICE_MCP_PORT: String(PORT), OFFICE_MCP_SESSION_DIR: sessions, OFFICE_POLL_SECONDS: "2" };

// 1. Primera corrida: inyecta la mencion
const r1 = await runHook(env, { session_id: "test-key" });
ok("inyecta additionalContext PostToolUse con la mencion", r1.out.includes("PostToolUse") && r1.out.includes("Milon") && r1.out.includes("MITAD de tu turno"));

// 2. Corrida inmediata: throttle (sin output)
const r2 = await runHook(env, { session_id: "test-key" });
ok("throttle: segunda corrida inmediata NO consulta", r2.out.trim() === "");

// 3. Pasada la ventana: consulta de nuevo
await new Promise((r) => setTimeout(r, 2200));
const r3 = await runHook(env, { session_id: "test-key" });
ok("pasada la ventana vuelve a consultar e inyectar", r3.out.includes("PostToolUse"));

// 4. Sin session file: silencio (aislamiento seguro)
const r4 = await runHook(env, { session_id: "no-existe" });
ok("sin session file no inyecta nada", r4.out.trim() === "");

// 5. Broker caido: silencio, exit 0
broker.close();
await new Promise((r) => setTimeout(r, 2200)); // pasar la ventana del throttle
const r5 = await runHook(env, { session_id: "test-key" });
ok("broker caido = silencio y exit 0", r5.out.trim() === "" && r5.code === 0);

rmSync(sessions, { recursive: true, force: true });
console.log(fail === 0 ? `\nposttool-smoke: TODO VERDE ✓ (${pass}/${pass})` : `\nposttool-smoke: ${fail} FALLOS`);
process.exit(fail === 0 ? 0 : 1);
