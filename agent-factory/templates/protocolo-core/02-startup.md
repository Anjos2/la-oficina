# Session startup

Every new session runs these steps BEFORE working. Startup exists so you begin with full context and no assumptions.

## Step 1 — Real date and time

Run a command that returns date + time + **explicit timezone offset** and use it as context for the whole session:

```bash
# Bash:        date "+%Y-%m-%d %H:%M:%S %Z (%z)"
# PowerShell:  (Get-Date).ToString('yyyy-MM-dd HH:mm:ss zzz')
```

Time is VERIFIED, not assumed: your internal knowledge of "what date it is" may be outdated, and the records you write to memory carry a real timestamp. If the result strongly contradicts the context (the system says one year and the project's last record says a very different one), pause and ask before writing dates.

## Step 2 — Load the protocol

Read this folder's `00-INDEX.md` and load the files marked **always**. In your first report you state what you loaded — if while listing it you notice one is missing, load it before continuing.

## Step 3 — Ask about the project

Greet and ask:

> "What project are we working on?
> 1. Project path
> 2. Path to its `memoria/` folder (if you don't give it to me, I'll assume `{project}/memoria`)"

## Step 4 — Join La Oficina (if installed)

If the `office` MCP is available, join as soon as you have the paths: `join_office(agent_name="<your name>", project_path, memoria_path)`. You'll see who else is working on this project right now and your message inbox. If the MCP isn't there, skip and continue — coordination still works via files (`06-async-collaboration.md`).

## Step 5 — Sync and read memory

If the project is a git repository with a remote: `git -C <path> pull --rebase --autostash` BEFORE reading anything (it brings in what other agents wrote). If it's not git, skip and state so.

Then read from `memoria/`:
- `index.md` — the project map.
- `schema.md` — local conventions (if it exists).
- `checklists/index.md` + your active checklist(s) — **validate the index against the filesystem** (`ls checklists/active/`): if they differ, the filesystem rules and you report the mismatch.
- The last ~20 entries of `log.md` — recent context.
- `core/` loads on demand depending on the session's topic (not all of it upfront).

## Step 6 — Report status

> "Ready. Context loaded:
> - Project: {name} · Date: {date with offset}
> - Protocol loaded: {list of always files}
> - In the office right now: {who, or 'just me', or 'no office'}
> - My active checklists: {N} ({M} pending items)
> - Last log entry: {one line}
> - What are we working on today?"

## New project (memory doesn't exist or is empty)

1. Confirm with the human: *"Should I create the standard memory structure?"*
2. With a yes, copy the plugin's `memoria-proyecto/` template.
3. Interview the human to populate `core/business.yaml`: what the project is, who it's for, what it aims to achieve, with what resources.
4. Log the creation as the first entry in `log.md`.

## What is NOT done at startup

- Loading the agent's entire own library (it loads by chapter when the topic calls for it).
- Reading archived checklists or full specs "just in case."
- Starting work without having read the recent log — you'd repeat work or override decisions already made.
