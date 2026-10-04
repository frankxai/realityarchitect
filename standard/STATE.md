# The reality state directory — v0.2

`reality.md` and `soul.md` are contracts the human writes. The **state directory** is the record agents and tools
maintain, and the human reviews. It is append-mostly: history is the point.

## Where it lives

| Mode | Contract files | State directory | Use when |
| --- | --- | --- | --- |
| Home (v0.1 canonical) | `~/reality.md`, `~/soul.md` | `~/.reality/` | Agents on one machine |
| Vault (v0.2) | `<folder>/reality.md`, `<folder>/soul.md` | `<folder>/reality/` | Inside Obsidian or any notes app that hides dot-folders, including on mobile |

Agents resolve the home in this order: `$REALITY_HOME` → `~/reality.md` with `~/.reality/` → ask the human. Both
directory names hold the same files.

## Files

```
reality/
  atlas.md                    twelve life domains: now, wanted, one true sentence, one scene, priority
  aims/<slug>.md              one per aim (a Bridge)
  log/<YYYY-MM-DD>.md         one per day with any practice
  witness.md                  the full ledger, newest first
  evidence.md                 identity votes: wins and completed moves
  snapshots/<YYYY-MM-DD>.md   approved, immutable
  decisions/<YYYY-MM-DD>-<slug>.md
  systems.md                  agents and automations that run for you (v0.1)
  images/                     images you chose for your vision board
Reality Map.canvas            optional, JSON Canvas 1.0 (https://jsoncanvas.org)
```

## Epistemic labels

Every field says what kind of statement it is. Tools must keep these labels when they copy, summarize, or export.

| Label | Meaning |
| --- | --- |
| desired | a scene or state the person wants; not an observation, not a prediction |
| reported | the person's account of what is true now; not verified by any system |
| planned | an act the person intends; not done until marked done |
| done | the person marked it done (self-reported unless a receipt is attached) |
| meaning | the person's own interpretation; never certified as cause |

## Formats by example

### atlas.md

```markdown
# Atlas — updated 2026-10-04
| Domain | Now | Wanted | Priority |
| --- | --- | --- | --- |
| Craft & Contribution | 5 | 9 | yes |
| Body & Vitality | 6 | 8 | |

## Craft & Contribution
- True now (reported): The album has seven of ten songs drafted.
- The scene (desired): I play back the final mix in a quiet studio and it sounds like I meant it.
```

Twelve domains, in this order: Body & Vitality, Mind & Mastery, Heart & State, Character & Code, Spirit & Source,
Love & Union, Lineage & Legacy, Circle & Community, Wealth & Sovereignty, Craft & Contribution, Sanctuary &
Lifestyle, The Golden Age. Scores are 0–10 and optional. A domain left blank is coverage not yet looked at, not a
failure.

### aims/<slug>.md (a Bridge)

```markdown
---
aim: Finish the album
domain: craft
by: 2026-12-15
status: active
---
# Finish the album
Done when (verifiable): ten mastered tracks uploaded to the distributor.

## The scene (desired)
I play back the final mix in a quiet studio and it sounds like I meant it.

## True now (reported)
Seven of ten songs drafted; none mixed.

## Obstacle and plan (planned)
- Obstacle: I open a new idea instead of finishing the current song. · Gap class: process
- If I open a new idea before noon, then I write it in the idea log and return to the current song for 20 minutes.

## Bridge
- Skills to grow: mixing low end
- Systems to build: a weekly mix-review loop with an agent that compares versions
- Reps: 3× per week — 90-minute finishing session
- Bold moves: 2026-11-01 — book the mastering engineer (planned)
- People: a mastering engineer (wish) — Places: a quiet studio day each month (wish)

## Is it enough? (computed 2026-10-04)
On pace: 6 of 6 planned reps logged in 14 days; no overdue moves.
```

### witness.md and log entries

```markdown
### 2026-10-04 08:12 · sign · primed
- **Happened (fact):** A stranger at the café asked about the album artwork.
- **Meant (my meaning):** The work is ready to be seen.
- **Did (action):** Sent her the listening link.
- **Next (planned):** Play her the final mix when it is done.
- Bridge: finish-the-album · Domain: craft
```

**Did** holds only what is already done. Anything the person intends to do goes under **Next (planned)**, so a plan is
never counted as evidence.

Kinds: `sign` (a meaningful coincidence), `win` (an identity vote), `rep` (a practice done), `move` (a bold move
done), `opening` (an opportunity, a person, a door), `lesson`, `gratitude`. **primed** means the person had set out
that day to notice something like it; **unprimed** means it arrived without being looked for. Counting both, misses
included, is what turns sign-tracking into an honest experiment.

### log/<YYYY-MM-DD>.md

```markdown
# 2026-10-04
- Looking for: a sign the album is wanted
- Did it come: yes | no | not marked
- Rehearsed the scene: yes
- Focus: finish-the-album
- One correction: start the session before opening messages
(then the day's witness entries)
```

### snapshots/<YYYY-MM-DD>.md

```markdown
---
snapshot: 2026-10-04
cadence: weekly
period: 2026-09-27 → 2026-10-04
approved: true
---
# Snapshot — 2026-10-04 (approved, immutable)
## Atlas
| Domain | Now | Wanted |
## Bridges
- Finish the album — on pace — reps 6/6 — moves 0/2
## Witnessed this period
sign 3 · win 2 · rep 6 · move 0 · opening 1 · lesson 1 · gratitude 4
Signs: 2 primed · 1 unprimed
Intentions: set 5 · came 2 · missed 2
## Reflection
- True now: …
- What changed: …
- Grateful for: …
- One correction: …
```

The **Did it come** line in each day's log is the countable record of a look-for: `yes`, `no` (a miss, counted), or
`not marked`. Snapshots aggregate those lines as **Intentions**, so misses enter the tally instead of disappearing.

**Cadence and period.** A weekly snapshot covers the days since the latest snapshot of any cadence, or the last 7 days.
A monthly snapshot covers the days since the latest *monthly* snapshot, or the last 30 days, so weekly reviews in
between do not shorten it.

A snapshot is written only after the human approves it. Tools never edit a sealed snapshot; a correction is a new
note or a new snapshot.

### decisions/<YYYY-MM-DD>-<slug>.md

```markdown
---
decision: Hire a mastering engineer instead of mastering myself
day: 2026-10-04
review_on: 2027-01-15
status: decided
---
## Context
## Options
## Choice
## Why
## Outcome (filled at review)
```

## Rules

1. The human owns `reality.md` and `soul.md`. Agents propose edits; they never apply them unasked.
2. Agents may append to the state directory when the human has asked them to log, and they say what they wrote.
3. Snapshots are sealed only with explicit human approval.
4. Nothing in the state directory leaves the device or vault without explicit consent.
5. Keep epistemic labels intact in every copy, summary, or export.
