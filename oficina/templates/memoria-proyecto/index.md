# Project {PROJECT_NAME} — Memory

Project map. Loaded at the start of each session; details load on demand.

## Core (project's current state)

| File | What it contains | When to load it |
|---|---|---|
| `core/business.yaml` | What the project is, who it's for, glossary, acceptance criteria, business decisions | When discussing goals, scope, or domain rules |
| `core/resources.yaml` | Tools, accounts, services, locations, and assets the project uses | When touching tools or access |
| `core/references.md` | Pointers to credentials/access (NEVER literal values) | When an access is needed |

## Checklists

See `checklists/index.md` (overall status). Each agent loads at startup only its own active checklist(s). The source of truth for status is the filesystem (`ls checklists/active/`).

## Specs (optional)

See `specs/index.md` if it exists. A spec describes the behavior contract of a project part that exceeds a simple checklist (rules, states, edge cases). Simple projects may have none.

## Choral log

`log.md` — append-only record of decisions, deliveries, incidents, and research from ALL agents on the project. At startup, the last ~20 entries are read. Rotated by size to `log-archive/`.

## Local conventions

See `schema.md`: how work is done on THIS project (particulars the general protocol doesn't cover).
