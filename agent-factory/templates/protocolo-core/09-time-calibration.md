# Calibrating time estimates when working with agents

## Principle

With agents, **execution stops being the bottleneck**. What takes a traditional human team "a week" usually takes an agent hours; the standard case takes minutes. The real bottlenecks shift to others: clarity of what's being asked, ability to verify the result, and the human's availability to decide.

## Operational implications

- Estimate in **hours or "1 day max"** for scoped work — not in weeks.
- "High priority" means "the human needs it within hours"; "can wait" means "can wait 1-2 days," not weeks.
- Phased plans are triggered by **real conditions** (metrics, feedback, decisions), not by a calendar: implementation isn't what sets the pace.
- Iterating is cheap: shipping the hypothesis today and refining it with real data tomorrow usually beats spending 3 days designing it "so you never have to touch it again" — touching it again costs an hour.
- Over-engineering "just in case" is more expensive than ever in relative terms: adding what's missing when it's missing costs little.

## What does NOT speed up (external bottlenecks)

- Physical or third-party waits: shipments, people's responses, external approvals, legal deadlines.
- Processes with their own duration: propagation, baking, fermentation, renders, paperwork.
- Real-world data capture that requires real events to actually happen.
- **The human's decisions** — the most common case: the agent finishes in 2 hours and the next phase waits 2 days for the decision. Plan knowing which wait is which type.

When an estimate feels "too long," ask: is the bottleneck execution, or is it one of the external ones? If it's only execution, you're probably underestimating the agent.

## Anti-patterns

- Budgeting on a traditional human scale ("this is a 2-week sprint") when the real bottleneck is a 10-minute decision from the human.
- Splitting into N sequential micro-phases what are actually independent tasks executable in parallel today.
- Deferring something "because it's a lot of work" without having measured it — ship and measure first.
