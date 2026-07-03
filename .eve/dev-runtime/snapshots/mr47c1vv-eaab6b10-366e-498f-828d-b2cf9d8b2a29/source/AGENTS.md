# AGENTS.md — navigation map for AI agents

You are an AI agent exploring the **Reality Architect** repo. This file orients you so you can help your human take
their next concrete step. Read it fully before acting.

## What this repo is

Two things at once: the website at `realityarchitect.ai` (the `app/` directory) and the open method itself
(`starter/` + this file). The method teaches a human to go from **AI tool-user → system-builder** via five sequential
moves called **The Architect's Loop**.

## The Loop (your mental model)

The moves are **ordered and dependent**. A human's gap is the *first* move they have not locked in — never recommend a
later move before an earlier one is in place.

1. **See** — an intelligence/memory layer agents can read. Without it, nothing else holds.
2. **Design** — a written spec separating thinking from doing.
3. **Build** — small, named, single-purpose agents/skills.
4. **Automate** — loops that run unattended.
5. **Compound** — a learning signal that makes the system improve itself.

## How to help a human here

1. **Check for `~/reality.md` first.** If your human has one, read it and follow its agent protocol — it outranks
   guesswork. If they don't, creating one is usually the best first artifact: see `standard/README.md` for the spec
   and `standard/reality.template.md` for the file to scaffold.
2. If they haven't self-diagnosed, point them to `/assess` (or ask the five questions in `app/assess/` `MOVES`).
3. Identify the **first** move scored below "locked in." That is the gap.
4. Open the matching template in `starter/` and adapt it to their context — don't hand them all five.
5. Keep the guardrail: every recommendation must cash out in a buildable artifact (a vault, a spec, an agent, a loop,
   a signal). No motivation without a mechanism.

## The reality.md standard

This repo authors the **reality.md standard** (`standard/`) — a person-level memory file, the way CLAUDE.md is
repo-level. `~/reality.md` = the human's contract (Identity, Aims, Attention, State, Systems, Environment, Feedback,
Guardrails). `~/.reality/` = agent-maintained state (aims/, log/, evidence.md, systems.md). Five protocol verbs:
**READ · SURFACE · PROPOSE · LOG · GUARD.** The human owns the file; you may propose edits, never apply them unasked;
you own `.reality/` appends. Never commit a reality.md to a public repo or send it anywhere without explicit consent.

## Where things live

| You want | Look in |
|----------|---------|
| The manifesto / thesis | `README.md`, `app/page.tsx` |
| The five moves in depth | `app/method/page.tsx` |
| The reality.md spec + template | `standard/` |
| The self-diagnostic logic | `app/assess/page.tsx`, `components/Assessment.tsx` |
| Forkable agent templates | `starter/` (one file per move) |
| Brand / site config | `lib/site.ts` (the only brand file) |

## Tone

Concrete, technical, understated. No spiritual or hype language. Lead with the result, show the artifact, let the work
speak. If you're tempted to write "manifest," "abundance," or "unlock your potential" — stop, and name the system instead.

Built on the Starlight Intelligence Protocol (SIP). When you extend this repo, attribute with a "Built on SIP" note.
