#!/usr/bin/env node
//! La Oficina — (c) 2026 Joseph Huayhualla (@Anjos2) · https://github.com/Anjos2/la-oficina · MIT License (@license)
/**
 * Finalidad: Hook `UserPromptSubmit` que inyecta, en cada turno, las menciones nuevas de La
 *   Oficina dirigidas a ESTE agente EN ESTE PROYECTO. Respeta el aislamiento por proyecto:
 *   lee el archivo de sesion que el MCP server escribio al unirse
 *   (`~/.office-mcp/sessions/<key>.json` = {officeId, name}), correlacionando por session-id
 *   (Claude Code >=2.1.154) o ppid (respaldo), y consulta SOLO esa oficina. Si NO encuentra
 *   el archivo (no puede determinar el proyecto de esta sesion), NO inyecta nada — nunca
 *   mezcla menciones de proyectos distintos. Funciona en Windows (no usa el channel push).
 *   Falla siempre silencioso (exit 0): si el broker no esta, el agente usa office_inbox.
 * Interrelacion: lee input del hook (stdin) + sessions/<key>.json; consulta broker
 *   /inbox-by-name {name, officeId}; imprime additionalContext con las menciones.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const PORT = parseInt(process.env.OFFICE_MCP_PORT ?? "7900", 10);
const SESSION_DIR = process.env.OFFICE_MCP_SESSION_DIR || join(homedir(), ".office-mcp", "sessions");

function readStdin() {
  return new Promise((resolve) => {
    let d = "";
    process.stdin.on("data", (c) => (d += c));
    process.stdin.on("end", () => resolve(d));
    setTimeout(() => resolve(d), 250); // no bloquear si no llega stdin
  });
}

function findSession(input) {
  // Intenta session-id (Claude Code >=2.1.154) y luego ppid (respaldo). El que exista.
  const keys = [input.session_id, String(process.ppid)].filter(Boolean);
  for (const k of keys) {
    const f = join(SESSION_DIR, `${k}.json`);
    if (existsSync(f)) {
      try {
        const s = JSON.parse(readFileSync(f, "utf8"));
        if (s.officeId && s.name) return s;
      } catch {
        /* archivo corrupto → ignorar */
      }
    }
  }
  return null;
}

async function main() {
  const raw = await readStdin();
  let input = {};
  try { input = JSON.parse(raw); } catch { /* sin input */ }

  const session = findSession(input);
  if (!session) return; // no se pudo determinar la oficina de ESTA sesion → no inyectar (seguro)

  let data;
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/inbox-by-name`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: session.name, officeId: session.officeId }),
      signal: AbortSignal.timeout(800),
    });
    data = await res.json();
  } catch {
    return; // broker apagado → office_inbox manual
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
    `📨 La Oficina — mensajes nuevos para ti (${session.name}):\n${lines.join("\n")}\n` +
    `(Marcados como leidos. Considera si afectan lo que estas por hacer.)`;

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: context },
    }),
  );
}

main().catch(() => {}).finally(() => process.exit(0));
