# The project's memory

The project's `memoria/` folder is the **communication channel between agents and across time**. It is not decorative documentation: it's where the project's truth lives. An agent that worked for 3 hours and didn't update memory, as far as the rest of the team is concerned, didn't work.

## Standard structure

```
memoria/
├── index.md              ← project map (loaded at startup)
├── schema.md             ← local conventions for THIS project
├── core/
│   ├── business.yaml     ← what the project is, who it's for, glossary, business decisions
│   ├── resources.yaml    ← tools, accounts, services, locations the project uses
│   └── references.md     ← pointers to access/credentials (NEVER the values — see rule below)
├── checklists/
│   ├── index.md          ← status table (Active / Archived, separate sections)
│   ├── active/           ← pending or in-progress work
│   └── archive/          ← completed (historical, not loaded at startup)
├── specs/                ← optional: behavior contracts for large features
├── log.md                ← the CHORAL LOG (see below)
└── log-archive/          ← rotated old entries
```

## The choral log (`log.md`)

**Append-only** record where every agent on the project writes important entries. Never edited retroactively — if an entry turned out wrong, a new one is added that corrects it.

Entry format:

```
[{agent} {YYYY-MM-DD HH:MM} {±offset}] {type}
- What: {concrete description}
- Why: {cause / context}
- Link: {file, checklist, related decision}
```

Types: `decision` · `checklist_created` · `checklist_archived` · `incident` · `incident_resolved` · `research` · `delivery` · `structural_change`.

**What DOES get logged**: decisions, deliveries, incidents and their resolution, research with findings, structural changes, handoffs. **What does NOT**: each individual edit, granular progress on items (that lives in the checklist itself), consequence-free conversation.

**Size-based rotation**: when `log.md` exceeds ~2500 lines, the oldest entries move to `log-archive/YYYY-MM.md`, leaving the live file at ~1500. Historical search covers both (`grep ... log.md log-archive/*.md`).

## Current truth vs. history

- `core/*.yaml` documents **what IS** (current state). It stays compact (<1000 lines per file); if it grows with historical narrative, that narrative belongs in the log.
- `log.md` documents **what HAPPENED** (history). Its content is never pruned, only rotated.
- The indexes (`index.md`, `checklists/index.md`) **do not duplicate derivable data**: the number of active checklists is derived from `ls active/`, not written by hand in several places. Wherever there's a duplicated count, drift will show up sooner or later — link to the source, don't copy it.

## Credentials and sensitive data — hard rule

Memory holds **pointers**, never values: `references.md` says WHERE an access lives ("the key for X is in the password manager, entry Y") — never the key itself. Before publishing memory to a remote repository: **private** repository + a sanitization pass (a secrets scanner like gitleaks in pre-commit is the standard defense).

## Resilience against unexpected shutdowns

After **every block of work with consequences** (not just at the end of the session), memory stays updated: checklist marked, log entry if there was a decision or delivery, coherent indexes. The acid test: if the session died right now, could the next one continue without asking the human anything? If the answer is no, you're missing memory to write.
