# Anatomy of an agent

An agent is a **folder** that gets opened as a Claude Code session. Its structure:

```
my-agent/
├── CLAUDE.md                 ← identity: who it is, what it masters, how it behaves, what protocol it loads
├── memoria/
│   ├── 00-INDEX.md           ← master index of its library (loaded at startup; the rest is NOT)
│   ├── 01-{pillar}.md        ← deep-knowledge chapters, numbered (one number = one file)
│   ├── 02-{pillar}.md
│   └── investigaciones/      ← research in progress or closed (checkpoints on disk)
├── .claude/skills/
│   └── {name}/SKILL.md       ← invocable procedures (EXACT format, see below)
└── research-seed.md          ← topics pending research (optional; archived once consumed)
```

## The managed-memory principle

The agent **manages its own memory the way a professional manages their library**: at startup it reads only the index (`00-INDEX.md` — one line per chapter with keywords); full chapters load **on demand**, when a cognitive trigger makes them relevant. Loading the entire library upfront wastes the context you'll need to actually work.

**Cognitive triggers**: your CLAUDE.md declares a "situation → chapter(s) to consult → candidate skill(s)" table. Rule: you don't make an important decision in your domain without having consulted at least one relevant chapter; if none applies, you say so explicitly and reason with what's available.

## How an agent evolves

```
seed (topic) → deep research (/recursive-research) → numbered chapters in memoria/
             → skills distilled from what was learned → index updated → consumed seed gets archived
```

- Research is done with verifiable sources and reliability tiering, with checkpoints to disk (survives session closures).
- A **skill** is an actionable procedure ("when to use it" + steps); a **chapter** is reference knowledge. If a file only informs, it's a chapter; if it guides an execution, it's a skill.
- After every real piece of work, if you learned something durable about your domain, you integrate it into the library (new or expanded chapter + index).

## Skill format (exact, or it doesn't exist)

Claude Code ONLY registers a skill if it lives at `.claude/skills/<name>/SKILL.md` — **SKILL.md in uppercase** (on Windows lowercase seems to work, but on macOS/Linux it doesn't get registered). Minimal frontmatter:

```markdown
---
name: kebab-case-name
description: One line saying when to use it (the model decides whether to invoke it by reading this).
---

# Procedure content...
```

## Folder hygiene (hard rules)

1. **No project context inside the agent**: the agent is cross-cutting; project-specific stuff lives in THAT project's memory. No client files, no data dumps, no build artifacts, no configs pointing to a project's paths.
2. **Single source**: protocol rules live in the protocol; your CLAUDE.md **references** them, it doesn't copy them. A fact repeated across N files ages N times.
3. **Coherent counts**: if your CLAUDE.md declares "I have N skills," N == what's on the filesystem. When adding or removing a skill, update the declaration at the same moment.
4. **Consistent identity**: name and role identical in CLAUDE.md and in `memoria/00-INDEX.md`. If the agent gets renamed, it's propagated to ALL its files that same day.
5. **Domain rules with source and date**: the hard rules of your specialty ("don't use X," "always Y") carry the source backing them and the verification date — the ecosystem changes and rules without a source turn into superstitions. When fixing a bug, do NOT leave the anti-bug rule as a scar at the site of the fix: if the cause was eliminated, the rule is unnecessary; the bug's history lives in the project's log.
6. **Versioning**: the agent's folder deserves to be a git repository (backup + history). Before the first push to a remote: private repository + secrets scanner.
7. **Installing anything** (tools, packages, plugins — in your folder or a project's): verify the current stable version and its OFFICIAL source BEFORE installing — internal knowledge of versions ages fast and supply chains get attacked (compromised packages, lookalike names). Prefer pinned versions from official channels and report what you verified. If a security advisory exists for the candidate version, don't install it: pick the patched one.
