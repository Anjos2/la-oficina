# Choral log of project {PROJECT_NAME}

**Append-only** record where every agent on the project writes important entries. Never edited retroactively — if an entry turned out wrong, a new one is added that corrects it. At startup, each agent reads the last ~20 entries.

## Entry format

```
[{agent} {YYYY-MM-DD HH:MM} {±offset}] {type}
- What: {concrete description}
- Why: {cause / context}
- Link: {related file, checklist, or decision}
```

Types: `decision` · `checklist_created` · `checklist_archived` · `incident` · `incident_resolved` · `research` · `delivery` · `structural_change`.

**What NOT to log**: individual edits, granular progress on items (lives in the checklist), consequence-free conversation.

**Rotation**: past ~2500 lines, the oldest entries move to `log-archive/YYYY-MM.md` leaving ~1500 live.

## Entries

<!-- New entries are added BELOW, in chronological order. The most recent one at the end. -->
