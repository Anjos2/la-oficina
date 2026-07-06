# Specs for project {PROJECT_NAME}

A **spec** is the behavior contract of a project part that exceeds a simple checklist: intertwined rules, states and transitions, edge cases. It outlives the checklists that implement it and stays current when reality changes — an outdated spec is worse than not having one.

**Spec or just a checklist?** If you can explain the behavior in ≤10 lines, checklist. If you need state tables, edge cases, and scenarios, spec.

## Active specs

| File | Status | Priority | What it covers | Last updated |
|---|---|---|---|---|
| _(none yet)_ | | | | |

## States

| State | Means |
|---|---|
| Draft | Under construction; nothing gets implemented based on it yet |
| Approved | Source of truth; derived work can be executed |
| Amended | A real change altered the behavior; the spec was already updated in the same session |
| Archived | The described part was retired or replaced (the file moves to `archive/`) |

## Rules

- If the work changes a behavior described in a spec, the spec is updated **in the same session**.
- Decisions pending from the human are NOT buried in a section of the spec waiting to be found: they're asked in the chat of the session where they arise.
- Only this index loads at startup; each spec is read on demand.
