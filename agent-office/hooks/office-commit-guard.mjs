#!/usr/bin/env node
/**
 * Finalidad: Hook `PreToolUse` (Bash) que BLOQUEA un `git commit` cuando firmaría
 *   archivos reservados por OTRO agente en La Oficina del proyecto de ESTA sesión.
 *   Resuelve el cruce del checkout+index compartido (un agente arrastra al commit el
 *   trabajo-en-vuelo de otro — ocurrió 2× el 2026-06-17, una vez deployando un cambio
 *   sin validar). Es el enforcement que a los locks advisory de La Oficina les faltaba.
 *
 *   Aislamiento multi-proyecto / multi-agente (requisito del operador):
 *     - Identifica {officeId, name} por la SESIÓN: session_id (Claude Code) → respaldo ppid →
 *       lee `~/.office-mcp/sessions/<key>.json` (el archivo que el server escribe al unirse,
 *       MISMO mecanismo que `office-inbox-hook.mjs`). Cada sesión tiene su propia key, así
 *       que Minerva@proyecto1..4 quedan separadas: cada commit se valida contra los locks de
 *       SU oficina, nunca contra los de otro proyecto.
 *     - Consulta SOLO la oficina de esa sesión vía `POST /presence {officeId}`.
 *
 *   Falla ABIERTO (permite) en TODA incertidumbre — nunca paraliza el trabajo:
 *     no es Bash / no es git commit / no hay sesión (ej. commit del operador) / broker caído /
 *     nada staged / ningún lock ajeno path-like / cualquier excepción → exit 0 sin decisión.
 *
 * Interrelación: lee input PreToolUse (stdin) + sessions/<key>.json; `git diff --cached`
 *   en el cwd; `POST 127.0.0.1:7900/presence`; funciones puras en `commit-guard-lib.mjs`.
 *   Imprime permissionDecision=deny al cruzar. Se ejecuta SIEMPRE al invocarse (sin guard
 *   `isMain`: el smoke importa la lib, no este archivo, así que main() no se dispara de más).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { execFileSync } from "node:child_process";
import {
  isGitCommit,
  commitsAllModified,
  isPathResource,
  pathMatch,
} from "./commit-guard-lib.mjs";

const PORT = parseInt(process.env.OFFICE_MCP_PORT ?? "7900", 10);
const SESSION_DIR =
  process.env.OFFICE_MCP_SESSION_DIR || join(homedir(), ".office-mcp", "sessions");

/** Permite la tool sin fricción: exit 0 sin stdout = "sin decisión, procede normal". */
function allow() {
  process.exit(0);
}

/** Bloquea la tool con una razón visible para el modelo. */
function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
}

function readStdin() {
  return new Promise((resolve) => {
    let d = "";
    process.stdin.on("data", (c) => (d += c));
    process.stdin.on("end", () => resolve(d));
    setTimeout(() => resolve(d), 250);
  });
}

/** {officeId, name} de ESTA sesión, o null. Mismo orden de claves que office-inbox-hook. */
function findSession(sessionId) {
  const keys = [sessionId, String(process.ppid)].filter(Boolean);
  for (const k of keys) {
    const f = join(SESSION_DIR, `${k}.json`);
    if (existsSync(f)) {
      try {
        const s = JSON.parse(readFileSync(f, "utf8"));
        if (s.officeId && s.name) return s;
      } catch {
        /* corrupto → siguiente clave */
      }
    }
  }
  return null;
}

/** Archivos que el commit firmaría: staged (+ modificados tracked si lleva -a). */
function candidateFiles(cwd, withModified) {
  const collect = (args) => {
    try {
      return execFileSync("git", ["-C", cwd, ...args], {
        encoding: "utf8",
        timeout: 3000,
      })
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    } catch {
      return [];
    }
  };
  const out = collect(["diff", "--cached", "--name-only"]);
  if (withModified) out.push(...collect(["diff", "--name-only"]));
  return [...new Set(out)];
}

async function getLocks(officeId) {
  const res = await fetch(`http://127.0.0.1:${PORT}/presence`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ officeId }),
    signal: AbortSignal.timeout(800),
  });
  const data = await res.json();
  return data.locks ?? [];
}

async function main() {
  const D = process.env.CG_DEBUG ? (m) => process.stderr.write(`[cg] ${m}\n`) : () => {};
  const raw = await readStdin();
  let input = {};
  try {
    input = JSON.parse(raw);
  } catch {
    allow();
  }

  if (input.tool_name !== "Bash") allow();
  const cmd = input.tool_input?.command ?? "";
  if (!isGitCommit(cmd)) allow();

  const session = findSession(input.session_id);
  D(`session=${JSON.stringify(session)}`);
  if (!session) allow(); // commit fuera de una sesión de agente (p. ej. el operador) → no bloquear

  const files = candidateFiles(input.cwd ?? ".", commitsAllModified(cmd));
  D(`cwd=${input.cwd} files=${JSON.stringify(files)}`);
  if (!files.length) allow(); // nada que firmar (amend vacío, etc.)

  let locks;
  try {
    locks = await getLocks(session.officeId);
  } catch (e) {
    D(`getLocks ERROR: ${e}`);
    allow(); // broker caído → degradar a disciplina, NO paralizar
  }
  D(`locks=${JSON.stringify(locks)}`);

  const others = locks.filter(
    (l) => l.holder && l.holder !== session.name && isPathResource(l.resource),
  );
  if (!others.length) allow();

  const conflicts = [];
  for (const f of files) {
    for (const l of others) {
      if (pathMatch(f, l.resource)) {
        conflicts.push({ file: f, resource: l.resource, holder: l.holder });
      }
    }
  }
  if (!conflicts.length) allow();

  const byHolder = {};
  for (const c of conflicts) (byHolder[c.holder] ??= new Set()).add(c.file);
  const lines = Object.entries(byHolder).map(
    ([h, set]) => `  • ${[...set].join(", ")} → reservado por ${h}`,
  );
  deny(
    `🔒 La Oficina bloqueó este commit. Tú (${session.name}) estás por firmar archivos reservados por otro agente en este proyecto:\n` +
      lines.join("\n") +
      `\nEsto evita arrastrar trabajo ajeno (el cruce del checkout/index compartido). Qué hacer:\n` +
      `  1) Saca lo ajeno del commit: git restore --staged <archivo>, y commitea con pathspec explícito (git commit -- <tus-archivos>).\n` +
      `  2) Si de verdad es tuyo, pide al dueño que libere (office_release) o coordina en office_who.\n` +
      `  • Evita git add -A / git commit -a en el checkout compartido — son el vector del cruce.`,
  );
}

main()
  .catch(() => {})
  .finally(() => process.exit(0)); // cualquier fallo inesperado → falla abierto (no bloquea)
