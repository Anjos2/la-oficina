# La Oficina

**EN** — Build your AI agent team with persistent memory, collaborating on your projects. · **ES** — Crea tu equipo de agentes de IA con memoria persistente que colaboran en tus proyectos. *(Versión completa en español más abajo.)*

**Website / full guide**: https://oficina.itelsystems.pe · **Works with [Claude Code](https://claude.com/claude-code) and [Codex](https://developers.openai.com/codex)**

---

## What is it?

A La Oficina **agent** is a folder you open as an agent session — in [Claude Code](https://claude.com/claude-code) or [Codex](https://developers.openai.com/codex): it has its own identity (who it is, what it masters, how it decides), a **research-backed library with sources** it loads on demand, domain **skills**, and a **shared protocol** that lets it remember across sessions and collaborate with other agents through each project's memory.

It works for any domain: cooking, legal, marketing, research, fitness, software — you name it. You bring the domain; the generator researches it and builds the expert. **Every agent speaks its human's language**, and **every generated agent is universal**: the same folder runs in Claude Code and Codex (identity in `AGENTS.md` + skills in the open [Agent Skills](https://agentskills.io) standard).

## Install (2 commands)

**Claude Code:**

```bash
claude plugin marketplace add Anjos2/la-oficina
```

Then, inside Claude Code:

```
/plugin install oficina@la-oficina
```

**Codex:**

```bash
codex plugin marketplace add Anjos2/la-oficina
```

Then install `oficina` from the plugins list (`/plugins` inside Codex).

## Create your first agent

In any Claude Code or Codex session:

```
/oficina:create-agent
```

*(Spanish alias: `/oficina:crear-agente`.)* Plugin skills are always invoked with the plugin's namespace prefix — that's why the command starts with `oficina:`. You can also just describe what you want ("I want an agent for baking") and the model triggers the skill on its own; the explicit command is the reliable path. The generator interviews you in your language (domain, name, research depth), **researches the domain against reliable sources**, generates the complete agent folder and teaches you how to use it. Then: open that folder in a new session, greet it with your project's path, and its startup protocol does the rest.

## Want several agents working together?

That is the whole point. Agents on the same project coordinate **through the project's memory** (checklists as handoffs, a shared decision log): you open whichever sessions you want and each agent resumes with full context on startup. For **live** coordination (presence, instant mentions, resource claims), install the optional add-on:

```
/plugin install agent-office@la-oficina
```

In Codex, register the MCP directly (self-contained bundle, no npm install): `codex mcp add office -- node <plugin path>/agent-office/dist/server.bundle.mjs` — see the office [README](agent-office/README.md).

(Beta — requires Node.js; see its [README](agent-office/README.md). Everything works without it.)

## What is in this repository

| Piece | What it is |
|---|---|
| `oficina/` | The generator plugin: `/oficina:create-agent` skill (+ `/oficina:crear-agente` alias) + `/oficina:recursive-research` (deep research with source tiering) + the molds (agnostic core protocol, project memory, base agent) |
| `agent-office/` | Live coordination (MCP): presence, mentions, claims — optional, with near-real-time delivery hooks. Published on npm as [`la-oficina-mcp`](https://www.npmjs.com/package/la-oficina-mcp) for MCP-registry discovery — same code, three doors: plugin `agent-office`, npm `la-oficina-mcp`, or direct `codex mcp add` |

## Philosophy (protocol summary)

- **Teammate, not tool**: the human defines WHAT and WHY; the agent proposes and executes HOW — and pushes back with evidence when the facts support it.
- **Shared memory is the channel**: everything important is written to the project's memory; no session depends on anyone remembering the conversation.
- **Decisions with method**: weighted matrix + inversion before anything non-trivial.
- **Verified closures**: nothing is "done" without evidence, and reports arrive in plain language.

## License

[MIT](LICENSE) © 2026 Joseph Huayhualla ([@Anjos2](https://github.com/Anjos2)). The generator is free forever — it runs on your own Claude subscription.

---

## Versión en español

**La Oficina** te permite crear tu equipo de agentes de IA sobre **Claude Code o Codex**: cada agente es una carpeta con identidad propia, una **biblioteca investigada con fuentes** que consulta bajo demanda, skills de su oficio, y un protocolo compartido de memoria persistente y colaboración asíncrona a través de la carpeta `memoria/` de cada proyecto. Sirve para cualquier dominio, **cada agente habla el idioma de su humano**, y **cada agente generado es universal**: la misma carpeta funciona en ambos runtimes (identidad en `AGENTS.md` + skills en el estándar abierto Agent Skills).

**Instalación en Claude Code**: `claude plugin marketplace add Anjos2/la-oficina`, luego `/plugin install oficina@la-oficina`. **En Codex**: `codex plugin marketplace add Anjos2/la-oficina`, luego instala `oficina` desde `/plugins`. **Tu primer agente**: escribe `/oficina:create-agent` (o su alias `/oficina:crear-agente` — las skills de un plugin siempre se invocan con el prefijo del plugin; también puedes simplemente describir lo que quieres y el modelo dispara la skill solo) — el generador te entrevista en tu idioma, investiga el dominio con fuentes confiables, construye la carpeta completa y te enseña a usarla. Coordinación en vivo opcional entre varios agentes: `/plugin install agent-office@la-oficina` (beta, requiere Node.js — todo funciona sin él; en Codex: `codex mcp add office -- node <ruta>/agent-office/dist/server.bundle.mjs`). Guía completa (ES/EN): https://oficina.itelsystems.pe · Licencia MIT.
