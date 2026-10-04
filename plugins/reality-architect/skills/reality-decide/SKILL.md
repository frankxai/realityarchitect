---
name: reality-decide
description: Record a life or business decision as a dated decision record with context, options, choice, reasons, and a review date, and later review it against what happened. Use for "help me decide", "record this decision", "which decisions are due for review", or "did that decision work".
---

# Decision records

## Record

Ask for: the decision in one line; context (what forces it now); the options considered (at least two, including "do
nothing"); the choice; why (the two or three reasons that carried it); and a **review date** when the outcome will be
visible. Write `reality/decisions/<YYYY-MM-DD>-<slug>.md` (format: standard/STATE.md) with `status: decided`.

If they are still deciding, help them think in options and consequences. Do not decide for them, and be explicit when a
decision needs a professional (medical, legal, financial).

## Review

List decisions whose `review_on` has arrived and whose status is not `reviewed`. For each, ask what actually happened,
write it under **Outcome**, and set `status: reviewed`. Separate decision quality (was it reasonable with what was known)
from outcome (what happened), so luck is not mistaken for judgment.

## Never

- Never rewrite the original reasons after the fact. The record is valuable because it is honest about the time.
