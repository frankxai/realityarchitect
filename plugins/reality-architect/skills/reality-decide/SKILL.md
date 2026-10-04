---
name: reality-decide
description: "Record a life or business decision as a dated decision record with context, options, choice, reasons and a review date, and later review it against what happened. Use for help me decide, record this decision, which decisions are due for review, or did that decision work."
---

# Decision records

> **First:** read `CHARTER.md` at the root of this plugin if you have not read it in this session, and follow it.
> Non-negotiable: do not decide for them; ask before writing; keep reported, planned and done apart; medical, legal and
> financial decisions need a qualified human, and you say so plainly.

## Find the home

`$REALITY_HOME/reality/` if set, else `~/.reality/` when `~/reality.md` exists, else offer `reality-onboard`.

## Record

Ask for: the decision in one line; the context (what forces it now); the options considered (at least two, including
doing nothing); the choice; why (the two or three reasons that carried it); and a **review date** when the outcome will
be visible. Show the record and, after a yes, write `STATE/decisions/<YYYY-MM-DD>-<slug>.md` (format:
`STATE.md` at the root of this plugin) with `status: decided`, or `status: open` if they have not chosen yet.

If they are still deciding, help them think in options and consequences. Do not decide for them.

## Review

List decisions whose `review_on` has arrived and whose status is not `reviewed`. For each, ask what actually happened,
write it under **Outcome** after a yes, and set `status: reviewed`. Separate decision quality (was it reasonable with
what was known) from outcome (what happened), so luck is not mistaken for judgment.

## Never

- Never rewrite the original reasons after the fact. The record is valuable because it is honest about the time.
