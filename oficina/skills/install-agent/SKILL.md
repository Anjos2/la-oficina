---
name: install-agent
description: Installs a private agent you were given access to, from a download code. Ask for the catalog URL and the code, fetch the package, verify it and leave the agent ready to open. Use when the user says they have a code for an agent, was given an agent by their company, or wants to install a ready-made agent instead of creating one. Responde en el idioma del usuario / works in the user's language.
---

# Skill: Install Agent (La Oficina)

You install an **already-built private agent** that someone hands out through a catalog of their own — typically a company distributing an internal agent to its people. Your job: turn "I have a code" into a working agent folder, verified, with the protocol in place.

This is the **mirror of `create-agent`**: there you build an agent from research; here you receive one already built. The delivery bar is the same — nothing is "installed" until it passes verification.

**Language rule (absolute)**: speak to the user in THEIR language at every step. This script being in English never means answering in English to a Spanish, Portuguese or French speaker.

**Genericity rule (do not break it)**: the catalog URL is **always** input from the user or their instructions — never a constant you assume. This plugin is public and serves any owner of private agents; hardcoding one company's URL would break it for everyone else. If you were given a URL in the conversation, use that one; if not, ask.

## What the code does, and what it does not

Say it plainly if the user asks: the code **gates the download**. Once installed, the agent is a folder of text files on their machine — it works offline, forever, with no license checks and no calls home. Revoking a code stops future downloads and updates; it does not disable a copy already installed.

Never imply the agent phones home or can be remotely disabled. It cannot, and promising otherwise is a lie the product would have to keep.

## Phase 1 — Collect what you need (ask, do not assume)

1. **The code** — as the user received it. Trim spaces; the catalog normalizes casing.
2. **The catalog URL** — whoever gave the code gave a URL too (e.g. `https://catalog.company.com/api/agentes`). If the user does not have it, stop and tell them to ask their provider: without it there is nothing to query.
3. **Where to install** — propose `~/agents/<agent-slug>` once you know the slug (Phase 2 tells you). Confirm before writing anything.

**Refuse plain `http://`** and say why: the code would travel in the clear. HTTPS only.

## Phase 2 — Validate the code before downloading anything

```
POST {catalog_url}/validar     Content-Type: application/json
body: {"codigo": "<code>"}
```

Send the code **in the body, never in the URL** — codes in query strings end up in server access logs and shell history.

- If the response has `ok: false` → **stop**. Show the `mensaje` field to the user as-is (it is written for them) and explain what it means: `codigo_no_existe` usually means a typo or a code for a different catalog; `revocado` means the owner turned it off — they should contact whoever gave it to them. Do not retry in a loop.
- If `ok: true` → you now have `nombre`, `descripcion`, `version`, `tamano_bytes` and `sha256`. **Tell the user what they are about to install** (name, one-line description, version, size) and confirm before downloading. This is the step that prevents installing the wrong agent with a wrong code.

## Phase 3 — Download and check integrity

```
POST {catalog_url}/descargar   Content-Type: application/json
body: {"codigo": "<code>"}     → the .tar.gz (binary)
```

Success and refusal are told apart by **Content-Type**, not by HTTP status: `application/gzip` is the package, `application/json` is a refusal (same shape as Phase 2 — show its `mensaje`).

Then **verify the checksum** against the `sha256` from Phase 2 (or the `X-Agente-Sha256` header). Available tools: `sha256sum` (Linux/macOS/git-bash), `certutil -hashfile <file> SHA256` (Windows), `shasum -a 256` (macOS).

**If the checksums differ, abort and delete the file.** Do not install it. It means the download was corrupted or the package changed mid-flight — either way the user must not receive it silently.

## Phase 4 — Install

1. Extract into the chosen folder. The archive contains a single root folder named after the agent slug, so it will not scatter files.
2. **Install the protocol**: copy the plugin's `templates/protocolo-core/` to **`~/.la-oficina/protocolo/`** (create it if missing; overwrite if it exists — it is the shared copy every agent on this machine reads). The protocol does **not** travel inside the package; it comes from the plugin, which is why the installed agent is always on the current protocol. Locate the mold at `../../templates/protocolo-core/` relative to this file.
3. Do **not** run `git init` and do not commit anything: this agent belongs to whoever built it, and its history is theirs. If the user wants version control over their copy, say so as a suggestion, not as a step you take.

## Phase 5 — Empirical verification (never skipped)

Same bar as the generator's Phase 4. Do not report success before running these:

- `AGENTS.md` exists and has **zero** residual placeholders (grep `{[A-Z_]+}` → 0 matches).
- `CLAUDE.md` is the intact 3-line pointer (starts with `@AGENTS.md`).
- `.agents/skills/` and `.claude/skills/` are **identical trees** (recursive diff → no differences). A private agent whose mirrors drifted works in one runtime and not the other.
- Every skill folder holds a `SKILL.md` in **uppercase**, with `name` + `description` frontmatter.
- Chapter count in `memoria/` matches what `memoria/00-INDEX.md` declares.
- The protocol is at `~/.la-oficina/protocolo/` (10 files).
- **Nothing that should not be there**: no `.env`, no credential files, no `.git`. If you find any, stop and report it to the user — a package carrying secrets is a problem for whoever published it, and they need to know.

If any check fails, say exactly which one and do not call the installation done. A half-installed agent that "seems fine" is worse than a clear failure.

## Phase 6 — Pedagogical closing

In plain words:

1. **How to open it**: `cd <path> && claude` (Claude Code) or `cd <path> && codex` (Codex), or open the folder in the desktop app. Greet it with the path of the project to work on; its startup protocol does the rest. The same folder works in both runtimes.
2. **What it knows**: name the agent's chapters in one line each, from `memoria/00-INDEX.md` — the user should know what expertise they just received.
3. **What it does not cover** — read it from the specialty section of `AGENTS.md`. Setting the boundary now avoids the disappointment of asking it something outside its craft.
4. **Updates**: if the owner publishes a new version, running this skill again with the same code installs it. Say plainly that a reinstall **overwrites** the folder, so anything they added themselves inside it should be backed up first.

## Hard rules of this skill

- Never install without validating the code first, and never report success without Phase 5.
- Never hardcode a catalog URL into this skill or suggest a default one.
- Never send the code in a URL, a log line, or your own output back to the user's screen beyond what they typed.
- Never claim the agent can be remotely disabled or that it verifies a license at startup — it does not.
- If the package is missing pieces the protocol expects (no `AGENTS.md`, no chapters), do not "fix" it by inventing content: report it to the user as a defective package so the owner can republish.
