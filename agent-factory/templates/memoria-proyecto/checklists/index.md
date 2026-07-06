# Checklists for project {PROJECT_NAME}

Global index. Each agent loads this index at startup, plus only its own active checklist(s). **The source of truth for status is the filesystem** (`ls active/`): if this index differs, the index is corrected.

## Active

| File | Agent | Pending items | Total items | Created | Last activity | Priority |
|---|---|---|---|---|---|---|
| _(none yet)_ | | | | | | |

## Archived

**Not loaded at startup.** Consult only on demand.

| File | Agent | Completed | Total items | Created | Archived |
|---|---|---|---|---|---|
| _(none)_ | | | | | |

## Index rules

- Two separate sections (Active / Archived) — never a single table with a status column.
- When archiving a checklist: the **file is moved** from `active/` to `archive/` AND the **row is moved** between sections (not edited in place).
- Short cells: the narrative lives in the checklist ("Delivery Summary") and in the log, not here.
- File name: `{YYYY-MM-DD}-{agent}-{topic}.md`.
- Item states: `[ ]` pending · `[-]` in progress · `[x]` completed · `[!]` blocked with a note.
