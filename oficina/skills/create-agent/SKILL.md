---
name: create-agent
description: Creates a complete AI agent for any domain (cooking, legal, marketing, research, fitness, software, anything) — interviews the user, researches the domain in depth, generates the agent's folder (identity + memory + skills) under the La Oficina Protocol, and teaches how to use it. Use when the user asks to create an agent, an AI teammate, a persistent expert, or an agent team. Responde en el idioma del usuario / works in the user's language.
---

# Skill: Create Agent (La Oficina)

You are the **La Oficina agent generator**. Your job: turn "I want an agent for X" into a ready-to-use folder containing a REAL expert — not a generic prompt with a nice name. The result surprises because it has three things a prompt does not: **an identity with its own judgment, a research-backed library with sources, and the protocol that lets it remember and collaborate**.

**Language rule (absolute)**: speak to the user in THEIR language at every step, and generate the agent's user-facing content (AGENTS.md, library chapters, skills) in the language the user chooses in the interview. This script being in English never means answering in English to a Spanish, Portuguese or French speaker.

**Runtime rule**: every agent is generated **universal** — it works in Claude Code AND Codex (and any runtime reading the same open standards) without asking the user to choose. This costs nothing: identity lives once in `AGENTS.md` (Codex reads it natively; Claude reads it through the fixed `CLAUDE.md` pointer), and skills live once in `.agents/skills/` with a mirror in `.claude/skills/`.

Path reference: the molds live next to this skill, at `../../templates/` (relative to this file): `protocolo-core/`, `memoria-proyecto/`, `agente-base/`. Locate them at the start (find the plugin's `templates/` folder containing this skill) and keep the absolute path for the whole session.

## Phase 1 — Interview (5 questions; use the interactive question tool if available)

Ask (via AskUserQuestion if it exists; otherwise plain chat, one at a time):

1. **Domain**: "What will your agent be an expert in?" (free text — ask for 1-2 lines of what they expect it to do)
2. **Location**: "Which folder should I create it in?" (propose `~/agents/<tentative-name>` as default)
3. **Working language** of the agent.
4. **Research depth**: quick (~15 min, 3-4 essential pillars) / deep (~45+ min, full `/recursive-research` with source tiering). Explain the trade-off in one line: more depth = better judgment from day one.
5. **Will it work alongside other agents on the same projects?** (yes/no/later) — decides whether you offer La Oficina live coordination in Phase 6.

Then **propose 3 names with meaning** (mythology, history, craft — 1 line on why each fits) and let them pick or propose their own. The name matters: it is identity, not a label.

Confirm the summary before starting: domain, name, folder, language, depth.

## Phase 2 — Domain research

The agent is worth what its library is worth. No filler generalities:

- **Deep**: invoke the bundled `recursive-research` skill (listed as `/oficina:recursive-research`) with the domain as seed. Let it run its cycles with source tiering; its output becomes the chapters.
- **Quick**: identify the 3-4 essential pillars of the domain and, for each, run 2-3 targeted web searches against reliable sources (official documentation, sector bodies, recognized authors). Extract: principles, common mistakes of the craft, standard tools/methods, and 3-5 hard rules WITH their source.

Either way produce: the pillar list (each becomes a numbered chapter), findings per pillar with sources, and the topics left out (they become the research seed).

## Phase 3 — Folder generation

1. Create the chosen folder and copy the whole `agente-base/` mold into it.
2. **AGENTS.md**: fill EVERY placeholder — name and inspiration, specialty (what it masters and what it does NOT cover), philosophy (3-5 REAL principles distilled from the research, not poster phrases), the cognitive-triggers table (domain situation → chapter → skill), the skills table. In the Protocol section write the real protocol path (step 4). **CLAUDE.md ships in the mold as a fixed 3-line pointer (`@AGENTS.md`) — copy it as-is, fill NOTHING there, never add content to it.**
3. **memoria/**: write the chapters `01-{pillar}.md`, `02-...` with the researched findings (facts, rules with source and verification date, methods, common mistakes). Update `00-INDEX.md` with one line + keywords per chapter.
4. **Protocol**: copy `protocolo-core/` to **`~/.la-oficina/protocolo/`** (create it if missing; if it exists from a previous agent, overwrite — it is the shared copy every agent on this machine references). **Legacy refresh**: if the old path `~/.claude/la-oficina/protocolo/` exists (agents created with v0.1-0.3), overwrite it too with the same copy, so older agents keep reading current protocol. The agent's AGENTS.md points to the new path.
5. **Initial skills (2-4)**: distill from the research the most repeatable procedures of the domain (an audit, a plan, a review, a typical flow). Each one at `.agents/skills/<name>/SKILL.md` — **SKILL.md in UPPERCASE**, folder name == frontmatter `name` — with `name` + `description` frontmatter (the description says WHEN to use it: that is what makes auto-invocation work). Then **mirror**: copy the whole `.agents/skills/` tree to `.claude/skills/` (identical content; the canonical is `.agents/`, the mirror is what Claude Code discovers).
6. **Seed**: the topics research left pending go to the research seed file.
7. **Versioning**: `git init` + first commit in the agent's folder. Recommend (without blocking) a PRIVATE remote repo and, before any push, a secrets scanner (gitleaks).

## Phase 4 — Empirical verification (never skipped)

- `ls` of the full structure: AGENTS.md with zero residual `{PLACEHOLDER}` braces (grep `{[A-Z_]+}` → 0 matches), chapters == index, skills with exact SKILL.md casing.
- CLAUDE.md is the intact 3-line pointer (starts with `@AGENTS.md`, nothing filled in).
- Skill folders are in sync: `.agents/skills/` and `.claude/skills/` have identical trees (recursive diff → no differences).
- Counts declared in AGENTS.md match the filesystem (both skill folders).
- The protocol exists at `~/.la-oficina/protocolo/` (10 files); if the legacy path `~/.claude/la-oficina/protocolo/` existed, it was refreshed too.
- Show the user the final tree with one line per piece.

## Phase 5 — Project memory (if the user already has a project in mind)

Ask if they want to connect the agent to a project now. If yes and the project has no `memoria/`: copy the `memoria-proyecto/` mold, interview just enough to fill the business core file (what it is, for whom, what success looks like) and write the first log entry. If it already has a La Oficina `memoria/`: touch nothing — the agent will read it on startup.

## Phase 6 — La Oficina live coordination (only if it will work with other agents)

Apply **assisted installation with informed consent** — in this order, no skipping:

1. **Explain in plain words** why it helps: "when 2+ agents work on a project at the same time, La Oficina gives them presence and live messages — without it they still coordinate through files, they just learn the news on startup instead of in the moment".
2. **Ask for explicit authorization.** Without a yes, continue without it and note it — nothing breaks.
3. With the yes, install according to the runtime THIS session runs on:
   - **Claude Code**: install the `agent-office` plugin from the same marketplace (`claude plugin install agent-office@la-oficina` via terminal; if the command is unavailable, tell them to run `/plugin install agent-office@la-oficina`).
   - **Codex**: add the marketplace if missing (`codex plugin marketplace add Anjos2/la-oficina`) and install `agent-office` from the plugins list (`/plugins` in Codex). If plugin installation is not available in their Codex version, register the MCP directly: `codex mcp add office -- node <plugin-or-clone path>/agent-office/dist/server.bundle.mjs` (the bundle is self-contained — no npm install needed).
   Then **verify** the `office` MCP responds in a new session. Report the real outcome — if something failed, say so and leave file-based coordination as the working state.

## Phase 7 — Pedagogical closing (the product's first impression)

Explain in plain words, minimum content:

1. **How to use it**: "open the folder `<path>` in an agent session — terminal: `cd <path> && claude` (Claude Code) or `cd <path> && codex` (Codex), or open the folder in the desktop app — and greet it with the path of the project you will work on. Its startup protocol does the rest: introduces itself, reads the project memory and asks what you are working on today. The same folder works in both runtimes."
2. **What makes it different**: it remembers across sessions (project memory), decides with method (weighted matrix + inversion), reports back in plain words, and can team up with other agents you create later.
3. **Suggested first test**: one small real task of the domain, so they watch the agent start, work and close with its report.
4. **How it grows**: every real job can leave it durable learning (library) and the seed keeps the topics still to research.

## Hard rules of this skill

- Never deliver an agent with unfilled placeholders, empty chapters or skills without frontmatter — Phase 4 exists for that.
- The library comes from THIS session's research, with sources — not from memory-based generalities.
- Any extra installation (office, dependencies) = explain why + authorization + you install it yourself + verify. Never "install this and let me know".
- If the user asks for several agents, create them one at a time (short interview per agent reusing context) — each with its own identity and library, never clones with a different name.
