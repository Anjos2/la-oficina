# La Oficina

**EN** — Build your AI agent team with persistent memory, collaborating on your projects. · **ES** — Crea tu equipo de agentes de IA con memoria persistente que colaboran en tus proyectos. *(Versión completa en español más abajo.)*

**Website / full guide**: https://oficina.itelsystems.pe

---

## What is it?

A La Oficina **agent** is a folder you open as a [Claude Code](https://claude.com/claude-code) session: it has its own identity (who it is, what it masters, how it decides), a **research-backed library with sources** it loads on demand, domain **skills**, and a **shared protocol** that lets it remember across sessions and collaborate with other agents through each project's memory.

It works for any domain: cooking, legal, marketing, research, fitness, software — you name it. You bring the domain; the generator researches it and builds the expert. **Every agent speaks its human's language.**

## Install (2 commands)

```bash
claude plugin marketplace add Anjos2/la-oficina
```

Then, inside Claude Code:

```
/plugin install agent-factory@la-oficina
```

## Create your first agent

In any Claude Code session:

```
/create-agent
```

*(Spanish alias: `/crear-agente`.)* The generator interviews you in your language (domain, name, research depth), **researches the domain against reliable sources**, generates the complete agent folder and teaches you how to use it. Then: open that folder in a new session, greet it with your project's path, and its startup protocol does the rest.

## Want several agents working together?

That is the whole point. Agents on the same project coordinate **through the project's memory** (checklists as handoffs, a shared decision log): you open whichever sessions you want and each agent resumes with full context on startup. For **live** coordination (presence, instant mentions, resource claims), install the optional add-on:

```
/plugin install agent-office@la-oficina
```

(Beta — requires Node.js; see its [README](agent-office/README.md). Everything works without it.)

## What is in this repository

| Piece | What it is |
|---|---|
| `agent-factory/` | The generator: `/create-agent` skill (+ `/crear-agente` alias) + `/recursive-research` (deep research with source tiering) + the molds (agnostic core protocol, project memory, base agent) |
| `agent-office/` | Live coordination (MCP): presence, mentions, claims — optional, with near-real-time delivery hooks |

## Philosophy (protocol summary)

- **Teammate, not tool**: the human defines WHAT and WHY; the agent proposes and executes HOW — and pushes back with evidence when the facts support it.
- **Shared memory is the channel**: everything important is written to the project's memory; no session depends on anyone remembering the conversation.
- **Decisions with method**: weighted matrix + inversion before anything non-trivial.
- **Verified closures**: nothing is "done" without evidence, and reports arrive in plain language.

## License

[MIT](LICENSE) © 2026 Joseph Huayhualla ([@Anjos2](https://github.com/Anjos2)). The generator is free forever — it runs on your own Claude subscription.

---

## Versión en español

**La Oficina** te permite crear tu equipo de agentes de IA sobre Claude Code: cada agente es una carpeta con identidad propia, una **biblioteca investigada con fuentes** que consulta bajo demanda, skills de su oficio, y un protocolo compartido de memoria persistente y colaboración asíncrona a través de la carpeta `memoria/` de cada proyecto. Sirve para cualquier dominio — y **cada agente habla el idioma de su humano**.

**Instalación**: `claude plugin marketplace add Anjos2/la-oficina`, luego `/plugin install agent-factory@la-oficina`. **Tu primer agente**: escribe `/create-agent` (o su alias `/crear-agente`) — el generador te entrevista en tu idioma, investiga el dominio con fuentes confiables, construye la carpeta completa y te enseña a usarla. Coordinación en vivo opcional entre varios agentes: `/plugin install agent-office@la-oficina` (beta, requiere Node.js — todo funciona sin él). Guía completa (ES/EN): https://oficina.itelsystems.pe · Licencia MIT.
