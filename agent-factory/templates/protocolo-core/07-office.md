# La Oficina — live coordination (optional complement)

When 2+ agents work on the same project **at the same time**, file-based coordination falls short in the moment: nobody finds out what the other is doing until the next startup. La Oficina adds the **live** channel: presence, mentions-based messages, and resource claims.

**It's an enhancement, not a requirement.** Without it, everything still works via the async model (`06-async-collaboration.md`). An agent is never blocked by its absence.

## The model

- **One office per project** (identified by a stable id inside memory — it survives moving/renaming the folder).
- **Identity by agent name**: if you reconnect (for example after restarting the session due to a context limit), you inherit your inbox and your claims.
- **Durable truth still lives in memory**: the office is ephemeral transport. Every event with consequences still lands in the log/checklists just the same.

## Use during the session

| Moment | Action |
|---|---|
| At startup (with the project's paths) | `join_office(...)` → you see who's there and your inbox |
| Before touching something another agent might be touching | `office_who` + `office_claim(resource)` |
| When changing something that affects another agent | `office_announce(type, text, mentions=[...])` |
| At every checkpoint (phase change, before risky operations, when closing) | `office_inbox` |
| When ending the session | `office_leave` (releases claims; everyone else keeps working) |

Announcement types: `intent` (I'm about to do X) · `contract_change` (I'm changing something you consume) · `blocker` · `question` · `done` · `info`.

## Claims (locks)

Claims are **a notice, not a lock**: they declare "I'm working on this" so someone else doesn't step on it. Claim what you're about to modify, release it when done. If you find what you need already claimed, coordinate via mention instead of stepping on it.

## Installation

La Oficina ships as its own plugin (`agent-office`). If an agent detects that the human is working with several agents in parallel and the office isn't installed, it can offer to install it applying the **assisted installation with informed consent** rule: explain in plain words why it's worth it, ask for explicit authorization, and with a yes, install it itself and verify it works. Without the yes, continue via files with no friction.
