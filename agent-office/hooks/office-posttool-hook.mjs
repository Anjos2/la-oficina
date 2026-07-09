#!/usr/bin/env node
//! La Oficina — (c) 2026 Joseph Huayhualla (@Anjos2) · https://github.com/Anjos2/la-oficina · MIT License (@license)
/**
 * Finalidad: Hook `PostToolUse` que inyecta menciones nuevas de La Oficina A MITAD DE TURNO:
 *   el agente se entera en su siguiente accion (segundos), sin esperar al proximo mensaje del
 *   humano. Complementa a `office-inbox-hook.mjs` (UserPromptSubmit, inicio de turno): juntos
 *   dan la entrega "casi en tiempo real" multiplataforma (sin depender del push channel).
 *   THROTTLE: PostToolUse dispara en cada tool call; para no consultar el broker decenas de
 *   veces por minuto, este hook consulta como maximo 1 vez cada OFFICE_POLL_SECONDS (default 20)
 *   por sesion (marca de tiempo en sessions/<key>.last-poll). Mismo aislamiento por proyecto
 *   que el inbox-hook (sessions/<key>.json via session_id o ppid); si no puede determinar la
 *   oficina de ESTA sesion, no inyecta nada. Falla siempre silencioso (exit 0).
 * Interrelacion: lee input del hook (stdin) + sessions/<key>.json + <key>.last-poll; consulta
 *   broker /inbox-by-name {name, officeId}; imprime additionalContext (PostToolUse).
 */

import { existsSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const PORT = parseInt(process.env.OFFICE_MCP_PORT ?? "7900", 10);
const SESSION_DIR = process.env.OFFICE_MCP_SESSION_DIR || join(homedir(), ".office-mcp", "sessions");
const POLL_SECONDS = parseInt(process.env.OFFICE_POLL_SECONDS ?? "20", 10);

function readStdin() {
  return new Promise((resolve) => {
    let d = "";
    process.stdin.on("data", (c) => (d += c));
    process.stdin.on("end", () => resolve(d));
    setTimeout(() => resolve(d), 250);
  });
}

function findSessionKey(input) {
  const keys = [input.session_id, String(process.ppid)].filter(Boolean);
  for (const k of keys) {
    const f = join(SESSION_DIR, `${k}.json`);
    if (existsSync(f)) {
      try {
        const s = JSON.parse(readFileSync(f, "utf8"));
        if (s.officeId && s.name) return { key: k, session: s };
      } catch { /* corrupto → ignorar */ }
    }
  }
  return null;
}

function throttled(key) {
  // true = saltar esta pasada (consultamos hace <POLL_SECONDS)
  const mark = join(SESSION_DIR, `${key}.last-poll`);
  try {
    if (existsSync(mark)) {
      const age = (Date.now() - statSync(mark).mtimeMs) / 1000;
      if (age < POLL_SECONDS) return true;
    }
  } catch { /* sin marca → consultar */ }
  try { writeFileSync(mark, String(Date.now())); } catch { /* best effort */ }
  return false;
}

async function main() {
  const raw = await readStdin();
  let input = {};
  try { input = JSON.parse(raw); } catch { /* sin input */ }

  const found = findSessionKey(input);
  if (!found) return; // sesion sin oficina identificable → no inyectar (seguro)
  if (throttled(found.key)) return;

  let data;
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/inbox-by-name`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: found.session.name, officeId: found.session.officeId }),
      signal: AbortSignal.timeout(700),
    });
    data = await res.json();
  } catch {
    return; // broker apagado → pull manual con office_inbox
  }

  const inboxes = (data.inboxes ?? []).filter((i) => i.messages?.length);
  if (!inboxes.length) return;

  const lines = [];
  for (const ib of inboxes) {
    for (const m of ib.messages) {
      lines.push(`  • [${m.type}] ${m.from}${m.affects?.length ? ` {${m.affects.join(", ")}}` : ""}: ${m.text}`);
    }
  }
  const context =
    `📨 La Oficina — mensaje nuevo a MITAD de tu turno (${found.session.name}):\n${lines.join("\n")}\n` +
    `(Marcado como leido. Evalua si afecta lo que estas haciendo AHORA antes de continuar.)`;

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: context },
    }),
  );
}

main().catch(() => {}).finally(() => process.exit(0));
