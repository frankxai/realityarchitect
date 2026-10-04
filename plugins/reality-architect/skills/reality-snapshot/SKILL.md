---
name: reality-snapshot
description: "Draft a weekly or monthly Reality Snapshot from the person's logs, witness ledger, aims and atlas (and, if they use second-brain-os, its distilled brain notes), then seal it only after they approve. Sealed snapshots are immutable and show reality changing across time. Use for weekly review, monthly review, snapshot, how did this month go, or compare to last month."
---

# Seal a snapshot

> **First:** read `CHARTER.md` at the root of this plugin if you have not read it in this session, and follow it.
> Non-negotiable: seal only what they approve; never infer their worth from numbers; never claim that thought or
> feeling caused an outcome; keep desired, reported, planned, done and meaning apart.

## Find the home

`$REALITY_HOME/reality/` if set, else `~/.reality/` when `~/reality.md` exists, else offer `reality-onboard`.
`STATE/` below means that directory.

## 1. Cadence and period

Ask: weekly or monthly? Then use the period rule from `STATE.md` at the root of this plugin:

- **Weekly:** from the day after the latest file in `STATE/snapshots/` of any cadence, else the last 7 days.
- **Monthly:** from the day after the latest snapshot whose frontmatter says `cadence: monthly`, else the last 30 days.
  Weekly snapshots in between do not shorten a monthly review.

## 2. Draft

- `atlas.md` scores; each active aim and its pace (see `reality-bridge`).
- Witness entries in the period by kind, with primed and unprimed signs shown separately.
- **Intentions:** read the `Did it come:` line of every daily log in the period and count set (days with a look-for),
  came (`yes`), missed (`no`) and not marked. Misses stay in the tally.
- Decisions whose review date has arrived.
- If they use **second-brain-os**, you may read notes from its `brain/` vault dated in the period to remind them what
  happened. **Never read its `private/` vault.** Cite any note you use by path, and treat chat summaries as reminders,
  not as facts about their life.

Do not write the reflection for them. Ask, one at a time: What is true now? What changed? What are you grateful for?
One correction for the next period?

## 3. Approve, then seal

Show the complete draft and ask: "Is this true for you? Shall I seal it?" Only an explicit yes seals it. Write
`STATE/snapshots/<YYYY-MM-DD>.md` (add `-2`, `-3` if that name exists) with frontmatter `cadence:`, `period:` and
`approved: true`, following `STATE.md` at the root of this plugin. Never edit a sealed snapshot afterwards; a correction becomes a note in
the next one.

## 4. Compare (when asked)

Diff two snapshots: per domain the change in now and wanted, each aim's pace then and now, evidence counts, and the
intention tally. Say plainly what moved and what did not. Point to the bridge or environment change that most likely
moved it (mechanism), and leave meaning to them.
