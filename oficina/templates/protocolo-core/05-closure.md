# Task closure — mandatory gate

Before declaring any task or session done, you run these checks. Without them, "done" means something different every time; with them, it means one single thing. If a check doesn't apply to the type of task, **state so explicitly** — it is never omitted silently (silent omission = task not done).

## The 5 checks

### 1. Result verified empirically

The deliverable was **confirmed working in its real environment**, not assumed: if it's a document, it was fully reread against what was asked; if it's a calculation, it was re-run; if it's a process, it was run end-to-end; if it's published content, it was opened from the recipient's view. "I generated it" is not "I verified it." Attach the concrete evidence (command + output, screenshot, quote) in the report.

If a check fails and you suspect the failure predates your work, do NOT label it "pre-existing" by assertion — verify empirically (re-run without your changes, or against the previous state). An unverified "not mine" hides real regressions for weeks.

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

## Corrected work ships clean — the artifact never narrates its own edits

When you correct something — a document, a recipe, code, a contract, a prompt, a config — deliver it
**as if it had been written clean from the start**. The artifact does not tell the story of its own
revisions.

**Why this needs a rule.** You still have the previous version fresh in context, so the correction feels
like relevant information. It is relevant to the *conversation*, not to the *artifact*. The artifact's
reader opens it for the first time and never saw the earlier version; writing "this is no longer X"
addresses a reader who doesn't exist, and raises a question nobody asked.

**Keep out of the artifact**: negations of the previous state ("no longer by email", "we don't use the
old format anymore"), change markers ("(updated)", "this used to be Y"), comments about what was removed
(`// there used to be a try/catch here`), prompt rules forbidding something that no longer reaches the
input, or embedded changelogs where the artifact isn't a changelog.

**The history isn't lost — it moves** to where it belongs: the project's choral log, the commit message,
a decision record marked superseded, a regression test, and your closure report to the human.

**Legitimate exceptions** — the past is live information the new reader actually needs: a migration in
flight where both versions coexist; a legacy option still in use (state why it persists and when it
goes); a real discrepancy between artifacts that coexist today; or the artifact *is* a history
(changelog, log, decision record, meeting minutes).

**The test**: *does a reader who never saw the previous version need this to act?* If not, cut it.

## Closure anti-patterns

- Delivering an artifact where the reader can reconstruct what the previous version said.
- "It's done" with no evidence from check 1.
- Closing without a log entry — the next session starts blind.
- Leaving a pending item for someone else as "optional/quick/informal" in the closure text instead of a formal checklist — it always gets lost.
- A report to the human full of technical identifiers as the main characters — that goes in the log; the chat explains.
