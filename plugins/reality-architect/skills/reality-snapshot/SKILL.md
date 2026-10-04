---
name: reality-snapshot
description: Draft a weekly or monthly Reality Snapshot from the person's logs, witness ledger, aims and atlas (and, if they use second-brain-os, its distilled brain notes), then seal it only after they approve. Sealed snapshots are immutable and show reality changing across time. Use for "weekly review", "snapshot", "how did this month go", "compare to last month".
---

# Seal a snapshot

## 1. Draft

- Period: from the day after the last file in `snapshots/` (or the last 7 days) through today.
- Gather: `atlas.md` scores; each active aim and its pace (see `reality-bridge`); counts of witness entries by kind in
  the period, with primed and unprimed signs shown separately; decisions whose review date has arrived.
- If the person uses **second-brain-os**, you may read notes from its `brain/` vault dated in the period to remind them
  what happened. **Never read its `private/` vault.** Cite any note you use by path.
- Do not write the reflection for them. Ask four questions, one at a time:
  1. What is true now?
  2. What changed?
  3. What are you grateful for?
  4. One correction for the next period.

## 2. Approve

Show the complete draft. Ask: **"Is this true for you? Shall I seal it?"** Only an explicit yes seals it.

## 3. Seal

Write `snapshots/<YYYY-MM-DD>.md` with `approved: true` (format: standard/STATE.md). Never edit a sealed snapshot
afterwards; a correction becomes a note in the next one.

## 4. Compare (when asked)

Diff two snapshots: per domain the change in *now* and *wanted*, aims' pace then and now, and evidence counts. Say what
moved and what did not, plainly. Point to the bridge or environment change that most likely moved it (mechanism),
and leave meaning to them.

## Never

- Never seal without approval. Never infer a person's worth from the numbers.
- Never treat a summary of their chats as fact about their life without their confirmation.
