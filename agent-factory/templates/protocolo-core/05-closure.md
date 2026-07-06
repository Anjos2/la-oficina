# Task closure — mandatory gate

Before declaring any task or session done, you run these checks. Without them, "done" means something different every time; with them, it means one single thing. If a check doesn't apply to the type of task, **state so explicitly** — it is never omitted silently (silent omission = task not done).

## The 5 checks

### 1. Result verified empirically

The deliverable was **confirmed working in its real environment**, not assumed: if it's a document, it was fully reread against what was asked; if it's a calculation, it was re-run; if it's a process, it was run end-to-end; if it's published content, it was opened from the recipient's view. "I generated it" is not "I verified it." Attach the concrete evidence (command + output, screenshot, quote) in the report.

### 2. Project memory updated

`log.md` with the corresponding entry · `core/*.yaml` if the current state changed · coherent indexes. The test: the next session (yours or another agent's) can continue using only memory.

### 3. Checklists coherent with the filesystem

Items marked according to their real state · a 100%-complete checklist → file moved to `archive/` AND its row moved to the "Archived" section of the index (move, don't edit in place) · empirical verification: `ls active/` and `ls archive/` match the index rows. Divergence between index and filesystem is a defect, not an opinion.

### 4. Handoffs materialized

All work left for another agent (or for the human) exists as a **checklist in `active/`** with its WHAT + WHY — never as a loose mention in the report ("I'll tell X that..."). Size doesn't excuse this: even a 2-line pending item goes as a checklist, because the target agent only reads THEIR active checklists at startup, not other people's reports.

### 5. Work backed up (if the project is a repository)

Changes committed and pushed to the remote. Without this, the next agent doesn't see them and coordination breaks. If the project doesn't use git, state how the work is backed up.

## The closure report — two channels

**Channel 1 — the `log.md` entry** (for other agents and for the record): technical, precise, with files, commands, and evidence. It's the auditable source of truth.

**Channel 2 — the chat report** (for the human): **pedagogical**. The human isn't an expert in every detail of your domain; the report is written in plain words:

- 3-5 paragraphs telling the what and the why in plain language; every piece of jargon is explained in parentheses when used.
- 1-3 **concrete examples** (before/after, or "if X happens, before Y used to occur, now Z"). Everyday-world analogies work better than formal definitions.
- **"What matters for you"** section: current status + what's left for the human to do, if anything.
- **"Technical detail"** section, compact, at the end (5-10 lines) for anyone who wants the exact data without opening the log.

**They don't mix**: pasting the log's technical entry into the chat isn't reporting, it's shifting the work of understanding onto the human.

## Closure anti-patterns

- "It's done" with no evidence from check 1.
- Closing without a log entry — the next session starts blind.
- Leaving a pending item for someone else as "optional/quick/informal" in the closure text instead of a formal checklist — it always gets lost.
- A report to the human full of technical identifiers as the main characters — that goes in the log; the chat explains.
