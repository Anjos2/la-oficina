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

### Installed it before July 9, 2026? Remove the old plugin

The generator plugin was renamed `agent-factory` → `oficina`. **In Codex, installing the new one is not enough — remove the old one explicitly:**

```bash
codex plugin remove agent-factory@la-oficina
```

Why this matters: `codex plugin marketplace upgrade` refreshes the marketplace but **does not remove a plugin that disappeared from it** through a rename. The old one stays enabled in `~/.codex/config.toml` with its cache intact and **invisible to `codex plugin list`** — yet it still competes for skill resolution, and when it wins it serves the pre-rename instructions (`/create-agent`, without the namespace that actually works). The command above works even though the plugin is no longer in the marketplace.

**Symptom → cause**: if the create-agent command does not resolve, or you are shown instructions *without* the `oficina:` prefix, you are being served by the old plugin. Check it:

```bash
grep 'plugins."' ~/.codex/config.toml    # should list only oficina@la-oficina
ls ~/.codex/plugins/cache/la-oficina/    # should contain only 'oficina'
```

**Claude Code needs no action.** Verified empirically: Claude Code validates every plugin against its marketplace *before* loading skills, so a plugin renamed away never serves them — it simply shows as `✘ failed to load` in `claude plugin list`. Removing it is optional tidying: `claude plugin uninstall agent-factory@la-oficina`.

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

**Instalación en Claude Code**: `claude plugin marketplace add Anjos2/la-oficina`, luego `/plugin install oficina@la-oficina`. **En Codex**: `codex plugin marketplace add Anjos2/la-oficina`, luego instala `oficina` desde `/plugins`.

**¿Lo instalaste antes del 9 de julio de 2026?** El plugin se renombró `agent-factory` → `oficina`, y en **Codex** instalar el nuevo no basta: hay que **desinstalar el viejo** con `codex plugin remove agent-factory@la-oficina`. Motivo: `codex plugin marketplace upgrade` no retira un plugin que desapareció del marketplace por un rename — el viejo queda habilitado en `~/.codex/config.toml` con su caché, **invisible para `codex plugin list`**, y aun así compite por la resolución de la skill; cuando gana, entrega las instrucciones previas al rename (`/create-agent`, sin el namespace que sí funciona). Síntoma que delata el problema: el comando no resuelve, o te muestran instrucciones **sin** el prefijo `oficina:`. Verifícalo con `grep 'plugins."' ~/.codex/config.toml` (debe listar solo `oficina@la-oficina`) y `ls ~/.codex/plugins/cache/la-oficina/` (solo `oficina`). **En Claude Code no hay que hacer nada**: verificado empíricamente, valida cada plugin contra su marketplace *antes* de cargar sus skills, así que un plugin renombrado nunca las sirve — solo aparece como `✘ failed to load`. Desinstalarlo es limpieza opcional.

**Tu primer agente**: escribe `/oficina:create-agent` (o su alias `/oficina:crear-agente` — las skills de un plugin siempre se invocan con el prefijo del plugin; también puedes simplemente describir lo que quieres y el modelo dispara la skill solo) — el generador te entrevista en tu idioma, investiga el dominio con fuentes confiables, construye la carpeta completa y te enseña a usarla. Coordinación en vivo opcional entre varios agentes: `/plugin install agent-office@la-oficina` (beta, requiere Node.js — todo funciona sin él; en Codex: `codex mcp add office -- node <ruta>/agent-office/dist/server.bundle.mjs`). Guía completa (ES/EN): https://oficina.itelsystems.pe · Licencia MIT.
