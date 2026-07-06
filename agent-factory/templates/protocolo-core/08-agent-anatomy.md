# Anatomy of an agent

An agent is a **folder** that gets opened as an agent-runtime session (Claude Code, Codex, or any runtime that reads the same open standards). Its structure:

```
my-agent/
├── AGENTS.md                 ← identity (SINGLE SOURCE): who it is, what it masters, how it behaves,
│                               what protocol it loads. Read natively by Codex and most runtimes.
├── CLAUDE.md                 ← 3-line pointer for Claude Code: imports @AGENTS.md (never edited by hand)
├── memoria/
│   ├── 00-INDEX.md           ← master index of its library (loaded at startup; the rest is NOT)
│   ├── 01-{pillar}.md        ← deep-knowledge chapters, numbered (one number = one file)
│   ├── 02-{pillar}.md
│   └── investigaciones/      ← research in progress or closed (checkpoints on disk)
├── .agents/skills/
│   └── {name}/SKILL.md       ← invocable procedures, CANONICAL copy (EXACT format, see below)
├── .claude/skills/
│   └── {name}/SKILL.md       ← mirror of the canonical copy, for Claude Code discovery
└── research-seed.md          ← topics pending research (optional; archived once consumed)
```

**Why two identity files**: Claude Code reads `CLAUDE.md`; Codex and the multi-tool ecosystem read `AGENTS.md`. Keeping the full identity in AGENTS.md and importing it from a fixed CLAUDE.md pointer (`@AGENTS.md` — Claude's native import, the pattern Anthropic itself documents) means one source of truth and zero drift. When the agent evolves its identity, it edits **AGENTS.md only**.

## The managed-memory principle

The agent **manages its own memory the way a professional manages their library**: at startup it reads only the index (`00-INDEX.md` — one line per chapter with keywords); full chapters load **on demand**, when a cognitive trigger makes them relevant. Loading the entire library upfront wastes the context you'll need to actually work.

**Cognitive triggers**: your AGENTS.md declares a "situation → chapter(s) to consult → candidate skill(s)" table. Rule: you don't make an important decision in your domain without having consulted at least one relevant chapter; if none applies, you say so explicitly and reason with what's available.

## How an agent evolves

```
seed (topic) → deep research (/recursive-research) → numbered chapters in memoria/
             → skills distilled from what was learned → index updated → consumed seed gets archived
```

- Research is done with verifiable sources and reliability tiering, with checkpoints to disk (survives session closures).
- A **skill** is an actionable procedure ("when to use it" + steps); a **chapter** is reference knowledge. If a file only informs, it's a chapter; if it guides an execution, it's a skill.
- After every real piece of work, if you learned something durable about your domain, you integrate it into the library (new or expanded chapter + index).

## Skill format (exact, or it doesn't exist)

Skills follow the **open Agent Skills standard** (agentskills.io, adopted by Claude Code, Codex, Cursor, Gemini CLI and many more): a folder per skill containing `SKILL.md` — **SKILL.md in uppercase** (on Windows lowercase seems to work, but on macOS/Linux it doesn't get registered). Each runtime discovers skills in its own path, which is why the agent keeps two identical copies:

- `.agents/skills/<name>/SKILL.md` — **canonical** (Codex and standard-following runtimes read this)
- `.claude/skills/<name>/SKILL.md` — mirror (Claude Code reads this)

Minimal frontmatter:

```markdown
---
name: kebab-case-name
description: One line saying when to use it (the model decides whether to invoke it by reading this).
---

# Procedure content...
```

The `name` must match the folder name (lowercase, hyphens). When creating or editing a skill: write it in the canonical folder, then copy it to the mirror **in the same change** — the two folders must stay identical (a simple recursive copy of `.agents/skills/` over `.claude/skills/` re-mirrors everything).

## Folder hygiene (hard rules)

1. **No project context inside the agent**: the agent is cross-cutting; project-specific stuff lives in THAT project's memory. No client files, no data dumps, no build artifacts, no configs pointing to a project's paths.
2. **Single source**: protocol rules live in the protocol; your AGENTS.md **references** them, it doesn't copy them. A fact repeated across N files ages N times. Same principle for identity: it lives in AGENTS.md; CLAUDE.md stays a fixed pointer (`@AGENTS.md`) that is never edited.
3. **Coherent counts**: if your AGENTS.md declares "I have N skills," N == what's on the filesystem — in BOTH skill folders (canonical `.agents/skills/` and mirror `.claude/skills/` must have the same N). When adding, editing or removing a skill, update the canonical folder, re-mirror, and update the declaration at the same moment.
4. **Consistent identity**: name and role identical in AGENTS.md and in `memoria/00-INDEX.md`. If the agent gets renamed, it's propagated to ALL its files that same day.
5. **Domain rules with source and date**: the hard rules of your specialty ("don't use X," "always Y") carry the source backing them and the verification date — the ecosystem changes and rules without a source turn into superstitions. When fixing a bug, do NOT leave the anti-bug rule as a scar at the site of the fix: if the cause was eliminated, the rule is unnecessary; the bug's history lives in the project's log.
6. **Versioning**: the agent's folder deserves to be a git repository (backup + history). Before the first push to a remote: private repository + secrets scanner.
7. **Installing anything** (tools, packages, plugins — in your folder or a project's): verify the current stable version and its OFFICIAL source BEFORE installing — internal knowledge of versions ages fast and supply chains get attacked (compromised packages, lookalike names). Prefer pinned versions from official channels and report what you verified. If a security advisory exists for the candidate version, don't install it: pick the patched one.
