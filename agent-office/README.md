# agent-office — La Oficina live (beta)

**Live coordination** channel between agents (Claude Code or Codex sessions) working on the **same project** at the same time: presence (who is in), messages with mentions (per-agent inbox) and resource claims ("I'm touching this" advisories).

**It is an add-on, not a requirement**: the protocol's file-based collaboration works fully without it. The office adds the "in the moment" layer.

## Requirements

- Node.js ≥ 20 on PATH. **That's it — zero install steps**: the plugin ships a self-contained bundle (`dist/server.bundle.mjs` + `dist/broker.mjs`, no `node_modules` needed).

> Developing/modifying the source instead? `npm install` once and run against `src/` (see Tests below).

## How it works

```
Agent A session ──┐
Agent B session ──┼── MCP server (one per session) ──→ local broker (daemon, port 7900)
Agent C session ──┘        one office PER PROJECT · state at ~/.office-mcp/
```

- **One office per project**, identified by a stable id stored inside the project's `memoria/` (survives moving/renaming the folder).
- **Identity by name**: reconnecting with the same name (e.g. after restarting a session) inherits your inbox and claims.
- The **broker** is started by the first session that needs it and auto-stops after ~1 h idle. Footprint: ~40 MB RAM, ~0% CPU.
- **Durable truth lives in the project memory** — the office is ephemeral transport; every consequential event is still recorded in the project log.

## Tools exposed (MCP `office`)

| Tool | What it does |
|---|---|
| `join_office` | Join the project's office (at session startup) |
| `office_who` | See active agents and claimed resources |
| `office_announce` | Publish an event (`intent`/`contract_change`/`blocker`/`question`/`done`/`info`), with mentions or broadcast |
| `office_inbox` | Read your pending messages |
| `office_claim` / `office_release` | Claim / release a resource (advisory, not a lock) |
| `office_leave` | Clean exit when closing your session |
| `office_shutdown` | Close the project's office (returns the day's record) |

Agents created with `agent-factory` already know how to use them (protocol file `07-office.md`).

## Hooks — near-real-time mention delivery (optional, recommended)

Two scripts in `hooks/` for your Claude Code `settings.json`. Together they deliver mentions **almost in real time, cross-platform** (no push channel needed):

- `office-inbox-hook.mjs` (`UserPromptSubmit` event): injects your new mentions at the **start of every turn**.
- `office-posttool-hook.mjs` (`PostToolUse` event): injects new mentions **mid-turn** — the agent learns the news on its next action (seconds), not on the next human message. Throttled (default: max 1 broker poll per 20 s per session, `OFFICE_POLL_SECONDS` to tune). Validated by `scripts/posttool-smoke.mjs` (5/5).

```json
{
  "hooks": {
    "UserPromptSubmit": [
      { "hooks": [{ "type": "command", "command": "node \"<this-plugin-folder>/hooks/office-inbox-hook.mjs\"" }] }
    ],
    "PostToolUse": [
      { "matcher": "*", "hooks": [{ "type": "command", "command": "node \"<this-plugin-folder>/hooks/office-posttool-hook.mjs\"" }] }
    ]
  }
}
```

Both hooks respect per-project isolation (they only query THIS session's office) and fail silent: broker down = nothing injected, `office_inbox` still works manually.

There is also `office-commit-guard.mjs` (`PreToolUse`, matcher `Bash`): blocks a `git commit` that would sweep in files claimed by ANOTHER agent. Fails open (any doubt = allow).

## Using it from Codex

The office is a standard MCP server, so Codex talks to it natively. Register it once (self-contained bundle, no npm install):

```bash
codex mcp add office -- node "<this-plugin-folder>/dist/server.bundle.mjs"
```

Verify with `/mcp` inside Codex — the `office` server and its tools should be listed. Agents created with `agent-factory` use the same tools in both runtimes.

**Mention-delivery hooks in Codex (experimental)**: Codex supports the same lifecycle events (`UserPromptSubmit`, `PostToolUse`) via `~/.codex/config.toml` `[hooks]` tables or `hooks.json`. The hook scripts' exact input/output field compatibility with Codex is still being validated — until then, mentions in Codex are delivered on session startup and whenever the agent calls `office_inbox` (its protocol tells it to check at every checkpoint). Nothing breaks without the hooks.

## Beta status

Tested on Windows (Claude Code end-to-end; bundle smoke green). Pending: macOS/Linux validation and empirical validation of the mention hooks under Codex. Issues: the repository tracker.

## Tests

```bash
node scripts/smoke.mjs           # broker logic (isolated)
node scripts/mcp-smoke.mjs       # MCP boundary client↔server↔broker (against src/)
OFFICE_SMOKE_SERVER=../dist/server.bundle.mjs node scripts/mcp-smoke.mjs   # same, against the shipped bundle
node scripts/posttool-smoke.mjs  # mid-turn mention hook (mock broker, throttle, isolation)
```

Rebuild the bundle after changing `src/`: `npx esbuild src/server.mjs --bundle --platform=node --format=esm --outfile=dist/server.bundle.mjs && npx esbuild src/broker.mjs --bundle --platform=node --format=esm --outfile=dist/broker.mjs --allow-overwrite`

## License

MIT — see `LICENSE` at the repository root.
