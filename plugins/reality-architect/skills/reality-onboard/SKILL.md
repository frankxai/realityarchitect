---
name: reality-onboard
description: "Set up a person's Reality Architect home - soul.md (the inner contract), reality.md (the contract agents follow) and the state directory - by interview or by unpacking a Reality Studio export. Use when they say set up my reality.md, create my soul.md, start Reality Architect, or bring a Studio ZIP or backup."
---

# Onboard a Reality Architect home

> **First:** read `CHARTER.md` at the root of this plugin (the Agent Charter) if you have not read it in this session,
> and follow it. Non-negotiable: never claim that thought, feeling, imagery, frequency or quantum effects caused an
> event; never blame; propose rather than impose; ask before writing, storing, syncing, sharing or spending; keep
> desired, reported, planned, done and meaning apart; if the person mentions self-harm, harm to others or an
> emergency, stop, respond with care, and point them to local emergency services or a crisis line; health and money
> decisions go to qualified humans.

## 1. Choose the home, with absolute paths

If `$REALITY_HOME` is set or `~/reality.md` exists, read what is there and offer to fill the gaps instead of starting
over. Otherwise ask which mode they want and resolve every path before writing anything. **Never create files in the
current working directory.**

| Mode | Contracts | State directory | Line for their instruction file |
| --- | --- | --- | --- |
| **Vault** (recommended with Obsidian; syncs to the phone) | `<folder>/reality.md`, `<folder>/soul.md` | `<folder>/reality/` | `Read $REALITY_HOME/reality.md and soul.md before acting on my goals; follow their agent protocol.` and set `REALITY_HOME=<folder>` |
| **Home** | `~/reality.md`, `~/soul.md` | `~/.reality/` | `Read ~/reality.md and ~/soul.md before acting on my goals; follow their agent protocol.` |

For vault mode, ask for the folder as an absolute path (for example `/Users/me/Notes/Reality Architect` or
`C:\Users\me\Notes\Reality Architect`). Repeat the resolved paths back before writing.

## 2. Bringing a Studio export

The Studio's ZIP has one top folder, `Reality Architect/`, holding `START HERE.md`, `reality.md`, `soul.md`,
`reality/…`, and `Reality Map.canvas`.

- **Vault mode:** copy the *contents* of that top folder into the home (strip the wrapper), so the home holds
  `reality.md` directly. If the chosen home is itself a not-yet-existing folder named `Reality Architect`, extracting
  the archive into its parent gives the same result.
- **Home mode:** copy `reality.md` and `soul.md` to `~`, and the contents of the archive's `reality/` into
  `~/.reality/`.
- Before copying, list every file that would be overwritten and get an explicit yes.

## 3. Interview (one question at a time, their words verbatim)

soul.md first, because meaning steers the rest:

1. Purpose: Why this life? One or two sentences.
2. Values: their top five, in order.
3. I am: three present-tense lines, as if already true ("I am someone who…").
4. The scene: an ordinary day when this life works. Where are they, who is near, what are their hands doing?
5. Voice: should agents be gentle, direct, or challenging with them? Anything agents must never say?
6. Gifts, Vows and Gratitude, offered as optional.

Then reality.md: Identity (reuse the "I am" lines), one to three Aims (each with *done when* and a date), Attention
(what to surface, what to mute), State (sleep, deep-work window, a non-negotiable), Systems, Environment, Feedback
(review cadence), and Guardrails (always include: never spend, send, or publish without asking).

## 4. Write only after an explicit yes

- Show both drafts in full. Write them only after a yes. Frontmatter: `standard: soul.md` / `version: "0.1"` and
  `standard: reality.md` / `version: "0.2"`.
- Create the state directory with `aims/`, `log/`, `snapshots/`, `decisions/`, `images/`, and empty `witness.md`,
  `evidence.md`, `atlas.md`.
- Offer, never force, the line for the instruction file their harness already reads (`CLAUDE.md`, `AGENTS.md`,
  `GEMINI.md`), using the line for their mode from the table above.

## 5. If they already keep a GenCreator soul.md

Keep its sections (Energy, Mind, Craft, Voice, Capital, Circle, Legacy). Add the Reality Architect sections beside them;
do not rename or delete anything.

## Never

- Never invent content for their soul.md or reality.md. Empty is honest.
- Never commit these files to a public repository or send them anywhere without explicit consent.

Templates and formats: https://github.com/frankxai/realityarchitect/tree/main/standard
