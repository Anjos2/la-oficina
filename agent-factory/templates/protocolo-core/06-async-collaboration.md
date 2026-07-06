# Asynchronous collaboration — checklists as handoff

## The model

The agents on a project **don't call each other at runtime**. Each session starts without the conversational context of the others. Coordination is asynchronous and rests on three pieces:

1. **The project's memory** — the shared bus: checklists, log, specs, and `core/` are the state everyone reads and writes.
2. **The human as coordinator** — decides which agent to open and when. Each opening is a new session in that agent's folder.
3. **Checklists as formal handoff** — when agent A needs something from agent B, it doesn't call it: it leaves a checklist at `memoria/checklists/active/{date}-{B}-{topic}.md`. When the human opens B's session, its startup will discover it on its own.

## Checklist format (mandatory): WHAT + WHY, never HOW

```markdown
- [ ] [What to achieve] — [Full why: context + motivation + consequence of not doing it] — [Relevant resources/files (a hint, not an order)] — [How to verify it turned out right]
```

The recipient is an expert in their specialty: prescribing the HOW limits their judgment. The full "why" is what lets them decide well; a poor why produces poor execution.

Item states: `[ ]` pending · `[-]` in progress · `[x]` completed · `[!]` blocked (with a note).

## Handoff rules

- **Self-contained**: the target agent was NOT in your conversation. Everything needed goes in the checklist; "as we discussed earlier" doesn't exist for them.
- **Delegation is decided with the matrix** (`04-decisions.md`): every handoff costs the human's time (opening a session + startup + execution). If it costs you less to do it yourself with sufficient quality, do it yourself. "X always does it" is not a justification.
- **Responses are asynchronous too**: if you ask for an opinion, you don't wait blocked — you move on to something else and the answer reaches you in your next session.
- **The human also participates via the bus**: they can leave checklists for any agent, answer queries by editing the checklist, or leave notes in the log. Not everything requires opening a session.

## Checklist lifecycle

1. It's created in `active/` + a row in the "Active" section of `checklists/index.md` + a `checklist_created` entry in the log.
2. The assigned agent marks `[-]` when starting each item and `[x]` when verifying it.
3. At 100%: a "Delivery Summary" section at the end of the file (what was done, decisions made, derived pending items) → file moved to `archive/` → row moved to "Archived" → `checklist_archived` entry in the log.

## The checklist index

Two separate sections — **"Active"** and **"Archived"** — never a single table with a status column. When archiving, the row is MOVED between sections (editing it in place accumulates drift). Short cells: the index is navigation; the narrative lives in the checklist and in the log. The source of truth for status is the filesystem (`ls active/`), and the index is corrected against it, never the other way around.

## Boundary contracts (parallel work)

When two agents will work **at the same time** on pieces that must fit together (one produces what the other consumes — a dataset and its analysis, a recipe and its costing plan, a document and its translation), they agree the interface FIRST and write it down as a small contract file in the project memory: what crosses the boundary, its exact shape, who produces it, who consumes it, and how it will be verified. Each side then works against the contract — never against assumptions about the other's work-in-progress (assumptions about unseen work are where parallel collaborations break). When the boundary is implemented and verified, the contract's status is updated in the same session: a stale contract is worse than none.
