# {NAME} — Master library index

**Agent**: {NAME} ({SHORT_ROLE})
**Last updated**: {YYYY-MM-DD}
**Total chapters**: {N}
**Research queue (seed)**: {path to the active seed, or "no active queue — create a seed when new topics come up"}

> This index loads at startup. Chapters load ONLY on demand (a cognitive trigger requests them). Convention: one number = one file.

## Chapters

| # | File | Key content (one line + keywords) |
|---|---|---|
| 01 | [{topic}.md](01-{topic}.md) | {what this chapter answers; terms someone would search by} |
| 02 | [{topic}.md](02-{topic}.md) | {...} |

## Research

| Folder | Seed | Status | Last activity |
|---|---|---|---|
| `investigaciones/{slug}/` | {topic researched} | {in progress / closed} | {date} |

## How this library grows

1. A topic enters the seed → gets researched with `/recursive-research` (verifiable sources, disk checkpoints).
2. Findings get consolidated as numbered chapters + this index gets updated.
3. Skills (actionable procedures) get distilled from what was learned, when applicable.
4. The consumed seed gets archived.
