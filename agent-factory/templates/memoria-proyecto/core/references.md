# Access references — pointers ONLY

**Hard rule**: this records WHERE each access lives, NEVER the value (password, token, key, PIN). Values live in a password manager, in the system keychain, or wherever the human decides — outside this memory.

If this memory gets published to a remote repository: **private** repository + a secrets scanner (e.g. gitleaks) before every push.

## Access

| What | Where the value lives | Who has it | Notes |
|---|---|---|---|
| {e.g.: account for service X} | {e.g.: password manager, entry "Project—X"} | {human / shared} | {e.g.: ask the human live when needed} |

## Usage pattern during a session

When you need an access: (1) look up the pointer here, (2) if the flow allows it, ask the human to authenticate live themselves (you execute the rest), (3) never paste the value into memory files or logs.
