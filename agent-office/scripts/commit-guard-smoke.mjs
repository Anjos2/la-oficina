#!/usr/bin/env node
/**
 * Smoke de `hooks/office-commit-guard.mjs`. Dos bloques:
 *  A) Funciones puras (parsing del comando + matching archivo↔lock), con los casos reales
 *     del incidente 2026-06-17 (rate_limit.py reservado por Sentinel, Lyra commiteando).
 *  B) End-to-end: broker HTTP mock + sessions/<key>.json + repo git temporal con un archivo
 *     staged que cruza un lock ajeno → el hook DEBE denegar; y el caso del dueño/sin-cruce
 *     → DEBE permitir. Valida el flujo completo sin tocar el broker real.
 *
 * Ejecutar: node scripts/commit-guard-smoke.mjs   (exit 0 = todo verde)
 */

import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir, homedir } from "node:os";
import { join } from "node:path";
import { execFileSync, spawn } from "node:child_process";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";

import {
  isGitCommit,
  commitsAllModified,
  isPathResource,
  pathMatch,
} from "../hooks/commit-guard-lib.mjs";

let failed = 0;
const ok = (name, cond) => {
  console.log(`  [${cond ? "PASS" : "FAIL"}] ${name}`);
  if (!cond) failed++;
};

// ---------------------------------------------------------------------------
// A) Funciones puras
// ---------------------------------------------------------------------------
console.log("A) funciones puras:");
ok("isGitCommit: 'git commit -m x'", isGitCommit("git commit -m x") === true);
ok("isGitCommit: 'git add memoria/ && git commit -m x'", isGitCommit("git add memoria/ && git commit -m x") === true);
ok("isGitCommit: 'git status' NO", isGitCommit("git status") === false);
ok("isGitCommit: 'git add .' NO", isGitCommit("git add .") === false);

ok("commitsAllModified: '-am'", commitsAllModified("git commit -am x") === true);
ok("commitsAllModified: '-a'", commitsAllModified("git commit -a -m x") === true);
ok("commitsAllModified: '--all'", commitsAllModified("git commit --all -m x") === true);
ok("commitsAllModified: '-m' solo NO", commitsAllModified("git commit -m x") === false);

ok("isPathResource: 'backend/app/rate_limit.py'", isPathResource("backend/app/rate_limit.py") === true);
ok("isPathResource: 'backend/payments/'", isPathResource("backend/payments/") === true);
ok("isPathResource: 'deploy:kvm2' NO", isPathResource("deploy:kvm2") === false);
ok("isPathResource: 'M-DELP backend (delete)' NO", isPathResource("M-DELP backend (delete)") === false);

ok("pathMatch exacto", pathMatch("backend/app/rate_limit.py", "backend/app/rate_limit.py") === true);
ok("pathMatch dir/", pathMatch("backend/payments/foo.py", "backend/payments/") === true);
ok("pathMatch dir sin slash", pathMatch("backend/app/auth.py", "backend") === true);
ok("pathMatch NO (archivo distinto)", pathMatch("backend/app/auth.py", "backend/app/rate_limit.py") === false);
ok("pathMatch NO (carpeta hermana)", pathMatch("memoria/log.md", "memoria/checklists/") === false);

// ---------------------------------------------------------------------------
// B) End-to-end con broker mock + git temp
// ---------------------------------------------------------------------------
console.log("B) end-to-end:");

const HOOK = fileURLToPath(new URL("../hooks/office-commit-guard.mjs", import.meta.url));
const PORT = 7951; // distinto del broker real (7900) para no interferir
const tmp = mkdtempSync(join(tmpdir(), "cg-smoke-"));
const sessionDir = join(tmp, "sessions");
const repo = join(tmp, "repo");
mkdirSync(sessionDir, { recursive: true });
mkdirSync(join(repo, "backend", "app"), { recursive: true });

// Repo git con un archivo staged: backend/app/rate_limit.py
const git = (...a) => execFileSync("git", ["-C", repo, ...a], { encoding: "utf8" });
git("init", "-q");
git("config", "user.email", "smoke@test.local");
git("config", "user.name", "smoke");
writeFileSync(join(repo, "backend", "app", "rate_limit.py"), "x = 1\n");
git("add", "backend/app/rate_limit.py");

// sessions/<key>.json para una sesión "Lyra" en la oficina "office-test"
const KEY = "cg-smoke-session";
const writeSession = (name) =>
  writeFileSync(join(sessionDir, `${KEY}.json`), JSON.stringify({ officeId: "office-test", name, ts: Date.now() }));

// Broker mock: /presence devuelve un lock de rate_limit.py por Sentinel
const server = createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({
      office_id: "office-test",
      locks: [{ resource: "backend/app/rate_limit.py", holder: "Sentinel" }],
    }));
  });
});

// async (spawn) — NO execFileSync: el broker mock vive en ESTE proceso; bloquear el event
// loop con una llamada síncrona dejaría al mock sin responder y el fetch del hook timeout-earía.
function runHook(command, sessionName) {
  writeSession(sessionName);
  const input = JSON.stringify({
    session_id: KEY,
    cwd: repo,
    tool_name: "Bash",
    tool_input: { command },
  });
  return new Promise((resolve) => {
    const child = spawn("node", [HOOK], {
      env: { ...process.env, OFFICE_MCP_PORT: String(PORT), OFFICE_MCP_SESSION_DIR: sessionDir },
      stdio: ["pipe", "pipe", process.env.CG_DEBUG ? "inherit" : "ignore"],
    });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.on("close", () => resolve(out.trim()));
    child.stdin.write(input);
    child.stdin.end();
  });
}

await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));
try {
  // Caso 1: Lyra commitea rate_limit.py reservado por Sentinel → DENY
  const o1 = await runHook("git commit -m 'mis cosas'", "Lyra");
  let d1 = {};
  try { d1 = JSON.parse(o1); } catch { /* vacío = allow */ }
  ok("Lyra commitea archivo de Sentinel → deny", d1?.hookSpecificOutput?.permissionDecision === "deny");
  ok("razón menciona rate_limit.py + Sentinel", /rate_limit\.py/.test(o1) && /Sentinel/.test(o1));

  // Caso 2: el DUEÑO (Sentinel) commitea su propio archivo → allow (sin output)
  const o2 = await runHook("git commit -m 'lo mio'", "Sentinel");
  ok("el dueño commitea lo suyo → allow (sin deny)", o2 === "");

  // Caso 3: no es git commit → allow
  const o3 = await runHook("git status", "Lyra");
  ok("'git status' → allow (sin deny)", o3 === "");
} finally {
  server.close();
  rmSync(tmp, { recursive: true, force: true });
}

console.log(`\n${failed === 0 ? "ALL GREEN" : failed + " FALLO(S)"}`);
process.exit(failed === 0 ? 0 : 1);
