---
name: reality-onboard
description: Set up a person's Reality Architect home: soul.md (the inner contract), reality.md (the contract agents follow), and the reality/ state directory, by interview or by unpacking a Reality Studio export. Use when they say "set up my reality.md", "create my soul.md", "start Reality Architect", or bring a Studio ZIP or backup.
---

# Onboard a Reality Architect home

## 1. Choose the home

- If `$REALITY_HOME` is set or `~/reality.md` exists, read what is there and offer to fill the gaps instead of starting
  over.
- Otherwise recommend **vault mode**: a folder such as `<notes vault>/Reality Architect/` holding `reality.md`,
  `soul.md`, and a visible `reality/` folder. It syncs to the phone through their notes app. Home mode
  (`~/reality.md` + `~/.reality/`) also works.
- Tell them they can set `REALITY_HOME=<that folder>` so every agent finds it.

## 2. Bringing a Studio export

If they exported from https://www.realityarchitect.ai/studio, the ZIP holds `Reality Architect/` with `reality.md`,
`soul.md`, `reality/…`, and `Reality Map.canvas`. Unpack it into the chosen home only after showing which files would
be overwritten and getting a yes.

## 3. Interview (one question at a time, their words verbatim)

soul.md first, because meaning steers the rest:

1. Purpose: "Why this life? One or two sentences."
2. Values: "Your top five, in order."
3. I am: "Three present-tense lines, as if already true: 'I am someone who…'"
4. The scene: "An ordinary day when this life works. Where are you, who is near, what are your hands doing?"
5. Voice: "Should I be gentle, direct, or challenging with you? Anything I must never say?"
6. Gifts, Vows, and Gratitude, offered as optional.

Then reality.md: Identity (reuse the "I am" lines), one to three Aims (each with *done when* and a date), Attention
(what to surface, what to mute), State (sleep, deep-work window, a non-negotiable), Systems, Environment, Feedback
(review cadence), and Guardrails (always include: never spend, send, or publish without asking).

## 4. Write, with consent

- Show both drafts in full. Write them only after a yes. Use the templates' frontmatter:
  `standard: soul.md` / `version: "0.1"` and `standard: reality.md` / `version: "0.2"`.
- Create `reality/` with `aims/`, `log/`, `snapshots/`, `decisions/`, `images/`, and empty `witness.md`,
  `evidence.md`, `atlas.md`.
- Offer, never force, one line for the instruction file their harness already reads (`CLAUDE.md`, `AGENTS.md`,
  `GEMINI.md`): `Read $REALITY_HOME/reality.md and soul.md before acting on my goals; follow their agent protocol.`

## 5. If they already keep a GenCreator soul.md

Keep its sections (Energy, Mind, Craft, Voice, Capital, Circle, Legacy). Add the Reality Architect sections beside them;
do not rename or delete anything.

## Never

- Never invent content for their soul.md or reality.md. Empty is honest.
- Never commit these files to a public repository or send them anywhere without explicit consent.

Templates: https://github.com/frankxai/realityarchitect/tree/main/standard
