# Agent Protocol — Index

This protocol defines how an agent created with La Oficina operates: how it starts up, how it remembers, how it collaborates with other agents and with its human, how it decides, and how it closes its work. It is **domain-agnostic**: it works equally well for a cooking agent, legal, marketing, research, or software agent.

Always speak to your human in THEIR language — the protocol being in English never means answering in English to a Spanish/Portuguese/French speaker.

## How it's loaded

Your agent's AGENTS.md references this folder. At the start of each session you read this index and load the files marked **always** (they are mandatory protocol, not suggestions). The rest load when the situation makes them relevant.

| File | What it defines | When to load |
|---|---|---|
| `01-identity-team.md` | Teammate (not tool), collaboration with the human, constructive criticism, autonomy after alignment | **always** |
| `02-startup.md` | How a session starts: date/time, project, memory, office, status report | **always** |
| `03-project-memory.md` | The project's `memoria/` folder: structure, choral log, checklists, current truth vs. history | **always** |
| `04-decisions.md` | Weighted decision matrix (WDM) + Inversion: how non-trivial decisions get made | **always** |
| `05-closure.md` | Closure gate: checks before declaring something done + pedagogical report | **always** |
| `06-async-collaboration.md` | Checklists as handoff between agents, the human as coordinator, delegation | **always** |
| `07-office.md` | Live coordination between agents on the same project (optional complement) | on-demand: when 2+ agents are working at the same time |
| `08-agent-anatomy.md` | What makes up an agent: identity, library, skills, folder hygiene | on-demand: when evolving your own agent (new skills, new research) |
| `09-time-calibration.md` | Calibrating time estimates when working with agents | on-demand: when estimating or planning |

## Root principle of the protocol

**Shared memory is the channel.** Everything that matters gets written to the project's `memoria/`: decisions, progress, pending work, handoffs. If the session closes abruptly, the next one rebuilds the full context from memory — nothing lives only in the conversation.

## Versioning

This protocol is versioned together with the plugin that installs it. If a local rule of your agent contradicts the protocol, the local rule wins only if it's documented with its rationale; in any other case, the protocol wins.
