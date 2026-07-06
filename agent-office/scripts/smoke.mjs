#!/usr/bin/env node
/**
 * Finalidad: Smoke test end-to-end del broker de "La Oficina". Levanta un broker real en
 *   un puerto + estado AISLADOS (no toca el broker/estado de produccion del operador),
 *   simula 2 agentes (Minerva, Hermes) y verifica el flujo completo: join, presencia,
 *   announce con mencion → inbox, claim con conflicto, reconnect-by-name con herencia de
 *   locks, y cierre de oficina con acta. Mata el broker al terminar.
 * Interrelacion: Valida store.mjs + broker.mjs sin necesitar el SDK MCP ni Claude Code.
 *   Es la validacion empirica programatica de la logica de coordinacion.
 *
 * Uso: node scripts/smoke.mjs   (sale 0 = OK, 1 = fallo)
 */

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PORT = 7910; // aislado del default 7900
const STATE = join(tmpdir(), `office-smoke-${process.pid}.json`);
const BASE = `http://127.0.0.1:${PORT}`;
const BROKER = fileURLToPath(new URL("../src/broker.mjs", import.meta.url));

const env = { ...process.env, OFFICE_MCP_PORT: String(PORT), OFFICE_MCP_STATE: STATE };

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  return res.json();
}
async function alive() {
  try {
    const r = await fetch(`${BASE}/health`, { signal: AbortSignal.timeout(1000) });
    return r.ok;
  } catch {
    return false;
  }
}

const OFFICE = "smoke-office-A";
let broker;
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

async function main() {
  // Arrancar broker aislado
  broker = spawn(process.execPath, [BROKER], { env, stdio: "ignore" });
  for (let i = 0; i < 30 && !(await alive()); i++) await new Promise((r) => setTimeout(r, 100));
  assert(await alive(), "el broker de smoke no arranco");
  console.log("smoke: broker arriba\n");

  // 1. Minerva entra a una oficina nueva
  const m1 = await post("/join", { officeId: OFFICE, projectPath: "/proj/A", memoriaPath: "/proj/A/memoria", name: "Minerva", pid: 101, branch: "agent/minerva/rbac", modules: ["backend/"] });
  check("Minerva entra a oficina nueva (no reconnect)", () => {
    assert.equal(m1.reconnected, false);
    assert.equal(m1.presence.agents.length, 1);
    assert.equal(m1.inbox.length, 0);
  });

  // 2. Hermes entra a la misma oficina y ve a Minerva
  const h1 = await post("/join", { officeId: OFFICE, projectPath: "/proj/A", memoriaPath: "/proj/A/memoria", name: "Hermes", pid: 202, branch: "agent/hermes/rel", modules: ["android/"] });
  check("Hermes ve a Minerva activa al entrar", () => {
    const names = h1.presence.agents.map((a) => a.name).sort();
    assert.deepEqual(names, ["Hermes", "Minerva"]);
  });

  // 3. Minerva menciona a Hermes → le llega al inbox de Hermes (no al de Minerva)
  await post("/announce", { officeId: OFFICE, from: "Minerva", type: "contract_change", text: "voy a renombrar el campo X del payload de pagos", mentions: ["Hermes"], affects: ["contracts/pagos.yaml"] });
  const hInbox = await post("/inbox", { officeId: OFFICE, name: "Hermes" });
  const mInbox = await post("/inbox", { officeId: OFFICE, name: "Minerva" });
  check("la mencion dirigida llega a Hermes y NO a Minerva", () => {
    // Hermes ve la mencion (y ademas el broadcast 'Minerva entro' — awareness correcto).
    assert.equal(hInbox.messages.some((m) => m.text.includes("renombrar el campo X")), true);
    // Minerva NO recibe su propio mensaje dirigido a Hermes.
    assert.equal(mInbox.messages.some((m) => m.text.includes("renombrar el campo X")), false);
  });

  // 4. broadcast (join de Hermes, type 'joined', mentions=[]) lo ve Minerva
  check("Minerva ve el broadcast de que Hermes entro", () => {
    assert.equal(mInbox.messages.some((m) => m.from === "Hermes" && m.type === "joined"), true);
  });

  // 5. claim con conflicto
  const c1 = await post("/claim", { officeId: OFFICE, name: "Minerva", resource: "backend/payments/", note: "migracion" });
  const c2 = await post("/claim", { officeId: OFFICE, name: "Hermes", resource: "backend/payments/" });
  const c3 = await post("/claim", { officeId: OFFICE, name: "Hermes", resource: "android/capture/" });
  check("Minerva reserva, Hermes choca, Hermes reserva otro", () => {
    assert.equal(c1.ok, true);
    assert.equal(c2.ok, false);
    assert.equal(c2.held_by, "Minerva");
    assert.equal(c3.ok, true);
  });

  // 6. reconnect-by-name: Minerva "reinicia" (PID nuevo) y HEREDA su lock
  //    Antes de reconectar, Minerva ya habia leido su inbox en el paso 3 (ack implicito? no,
  //    /inbox no ackea; el ack lo hace la tool). Forzamos un ack para probar la herencia del cursor.
  const before = await post("/poll", { officeId: OFFICE, sinceSeq: 0 });
  const lastSeq = Math.max(...before.events.map((e) => e.seq));
  await post("/ack", { officeId: OFFICE, name: "Minerva", upToSeq: lastSeq });
  const m2 = await post("/join", { officeId: OFFICE, projectPath: "/proj/A", memoriaPath: "/proj/A/memoria", name: "Minerva", pid: 999, branch: "agent/minerva/rbac", modules: ["backend/"] });
  const pres = await post("/presence", { officeId: OFFICE });
  const minervaLock = pres.locks.find((l) => l.resource === "backend/payments/");
  check("Minerva reconecta por nombre, hereda cursor (inbox vacio) y su lock sigue", () => {
    assert.equal(m2.reconnected, true);
    assert.equal(m2.inbox.length, 0, "tras ack, el inbox heredado debe venir vacio");
    assert.ok(minervaLock, "el lock de Minerva debe sobrevivir el reinicio");
    assert.equal(minervaLock.holder, "Minerva");
    // No se duplico el agente: sigue habiendo una sola Minerva.
    assert.equal(pres.agents.filter((a) => a.name === "Minerva").length, 1);
  });

  // 7. leave libera locks de Hermes pero conserva su presencia (idle)
  await post("/leave", { officeId: OFFICE, name: "Hermes" });
  const pres2 = await post("/presence", { officeId: OFFICE });
  check("leave de Hermes libera su lock y lo marca idle", () => {
    assert.equal(pres2.locks.some((l) => l.holder === "Hermes"), false);
    const h = pres2.agents.find((a) => a.name === "Hermes");
    assert.equal(h.status, "idle");
  });

  // 8. cierre de oficina devuelve acta con el log
  const close = await post("/close-office", { officeId: OFFICE });
  check("close-office devuelve acta con eventos y la oficina desaparece", () => {
    assert.ok(close.acta);
    assert.ok(close.acta.events.length >= 5);
    assert.deepEqual(close.acta.agents.sort(), ["Hermes", "Minerva"]);
  });
  const gone = await post("/presence", { officeId: OFFICE });
  check("la oficina ya no existe tras cerrarla", () => {
    assert.ok(gone.error);
  });

  console.log(`\nsmoke: ${failures === 0 ? "TODO VERDE ✓" : `${failures} fallo(s) ✗`}`);
}

main()
  .catch((e) => {
    console.error("smoke fatal:", e.message);
    failures++;
  })
  .finally(() => {
    if (broker) broker.kill();
    process.exit(failures === 0 ? 0 : 1);
  });
