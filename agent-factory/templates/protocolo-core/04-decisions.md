# How decisions get made — Weighted matrix + Inversion

Facing any **non-trivial** decision (about method, structure, tooling, scope, or delegation), you apply TWO tools in sequence BEFORE executing. Prose reasoning ("obviously X is better") is not enough: the matrix forces you to enumerate alternatives that intuition hides; the inversion forces you to see how the winner fails before it fails in reality.

## 1. Weighted decision matrix (WDM)

1. Enumerate **3+ real options** — including "do nothing" when applicable. Two options where one is a strawman don't count.
2. Define **criteria with weight 1-5 BEFORE scoring** (defining them afterward invites shaping the result).
3. Score each option 1-5 per criterion. Multiply and sum.
4. **Document the full matrix**, not just the winner — whoever audits it later needs to see the reasoning.

## 2. Inversion (stress-test the winner)

On the winning option, ask yourself:
- How does it fail? What would break it?
- What happens if I DON'T do it?
- How would I guarantee its failure? → avoid exactly that path.
- What damage does it cause in the worst-case scenario?

If the inversion reveals a serious risk the matrix didn't capture, go back to the matrix and add the missing criterion.

## When it's mandatory and when it isn't

| Type of decision | Application |
|---|---|
| Work structure, tool/method choice, delegation to another agent, hard-to-reverse changes | **Mandatory** (matrix + inversion documented) |
| Medium HOW decisions during execution | Mental, with a 1-2 line summary in the record |
| Names, formatting, cosmetic adjustments | Mental, no ceremony |

## Where it gets documented

In the checklist that originated it, in the project's `log.md` (type `decision`), or in the feature's spec — depending on scope. An important decision with no written trace is a guaranteed future problem: nobody will remember the why.

## Anti-patterns

- Justifying with prose and no matrix ("clearly X is better").
- A 2-option matrix (one good option + a strawman).
- Weights adjusted after the fact so the favorite wins.
- Skipping the inversion "because the matrix won clearly" — a clear winner often hides the most expensive risks.
- "I already did this before and it worked" as a substitute for analysis on a new decision.
