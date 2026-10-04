# The reality.md Standard
### v0.2 — a machine-readable file for a human life, the way CLAUDE.md is for a codebase.

Every serious AI harness already reads an instruction file before touching a repo: `CLAUDE.md`, `AGENTS.md`,
`.cursorrules`, `GEMINI.md`. Codebases got a memory layer. **People didn't.**

So every agent session starts the same way: you re-explain who you are, what you're building, what matters, what to
ignore. The agent is brilliant and amnesiac. The most leveraged technology in history, and it meets you as a stranger
every morning.

`reality.md` fixes that. It is **one file, in your home directory, that tells any agent who you are and what you're
building** — so every agent on your machine works *for your life*, not just for your repo.

```
~/reality.md      the contract — you write it, agents read it
~/soul.md         the inner contract — why, and who you are being (new in v0.2)
~/.reality/       the state — agents maintain it, you review it
```

That's the whole standard. No SaaS, no account, no lock-in. Markdown files and a directory, readable by every
harness that exists and every harness that will exist.

### New in v0.2

- **`soul.md`**, the inner contract: Purpose, Values, I am, The scene, Gifts, Vows, Voice, Gratitude.
  `reality.md` holds the mechanism (what you build and how); `soul.md` holds the meaning (why, and who you are being).
  Template: [`soul.template.md`](./soul.template.md) · Fictional example: [`soul.example.md`](./soul.example.md).
- **Vault mode:** keep everything in a visible `reality/` folder inside your notes vault (Obsidian hides dot-folders),
  so it syncs to your phone. Agents find it through `REALITY_HOME`.
- **More state:** `witness.md` (signs, wins, openings, reps, as fact / meaning / action), `snapshots/` (approved and
  immutable), `decisions/`, `atlas.md` (twelve life domains), `images/`, and an optional `Reality Map.canvas`
  (JSON Canvas). Formats: [`STATE.md`](./STATE.md).
- **Epistemic labels** on every field: desired, reported, planned, done, meaning.
- **The [Agent Charter](./AGENT-CHARTER.md):** how any agent supports a person's reality architecture.

Every v0.1 file stays valid.

---

## Why a file, not an app

- **Files are harness-agnostic.** Claude Code, Cursor, Codex, Gemini, Grok — all of them can read `~/reality.md`
  today, with zero integration work. An app would need twelve integrations; a file needs none.
- **Files are yours.** Versionable, diffable, private by default, portable forever. Your life's operating contract
  should not live in someone's database.
- **Files compound.** A `reality.md` under version control is a record of who you decided to become, with timestamps.

---

## Anatomy of `reality.md`

Eight sections. Each one is a *lever in the model below* — and each maps to a move of the
[Architect's Loop](https://www.realityarchitect.ai/method). Keep the whole file under ~150 lines: it's a contract, not a
journal. (The journal lives in `.reality/`.)

```markdown
---
standard: reality.md
version: "0.1"
updated: YYYY-MM-DD
---
# reality.md — <your name>

## Identity        — who is acting. The roles you're voting for with every action.
## Aims            — what's being built. Specific, written, with if-then triggers. (Design)
## Attention       — what signal agents should surface to you, and what to filter out. (See)
## State           — the conditions you act from: sleep, deep-work windows, non-negotiables. (See)
## Systems         — what already runs without you: agents, automations, loops. (Build/Automate)
## Environment     — the defaults you've engineered; what's been removed. (Automate)
## Feedback        — your review cadence, the metrics that count, where reviews are logged. (Compound)
## Guardrails      — what agents must never do on your behalf.
## Agent protocol  — the standing instructions for any agent reading this file.
```

Blank template: [`reality.template.md`](./reality.template.md) · Filled example: [`reality.example.md`](./reality.example.md)

## Anatomy of `.reality/`

The state directory. Agents write here; you review it. Append-mostly — history is the point.

```
.reality/  (or reality/ in vault mode)
  aims/<slug>.md        one file per aim: the scene, the if-then triggers, reps, bold moves, current pace
  log/<YYYY-MM-DD>.md   daily entries — what you looked for, what moved, the one correction
  witness.md            the ledger — every sign, win, opening and rep as fact / meaning / action   (v0.2)
  evidence.md           identity votes — every shipped win, appended as it happens
  snapshots/<date>.md   approved, immutable state at a point in time                              (v0.2)
  decisions/<date>-<slug>.md  decisions with a review date                                         (v0.2)
  atlas.md              twelve life domains: now, wanted, one true sentence, one scene             (v0.2)
  systems.md            the registry of agents and automations running for you
```

Full formats and the epistemic labels: [`STATE.md`](./STATE.md).

---

## The agent protocol

This is what makes the file a *standard* rather than a note. Any agent that finds `~/reality.md` follows five verbs:

| Verb | What the agent does |
|------|---------------------|
| **READ** | Load `reality.md` before acting on the human's behalf — goals, guardrails, and state come first. |
| **SURFACE** | Filter inputs against **Aims** and **Attention**: bring goal-relevant signal forward, mute the rest. |
| **PROPOSE** | Recommend the *smallest next action* consistent with **Identity** — one artifact, never a lecture. |
| **LOG** | Append outcomes to `.reality/` — wins to `evidence.md`, reviews to `log/`, never silently. |
| **GUARD** | Refuse anything that violates **Guardrails**. Every claim must cash out in a buildable artifact. |

v0.2 agents also read `soul.md` (speaking in its **Voice**) and follow the [Agent Charter](./AGENT-CHARTER.md):
keep desired, reported, planned, done and meaning apart; never certify that thought or feeling caused an event;
never blame; ask before memory, sync, sharing or spending; seal snapshots only with approval.

To wire it up, add one line to whatever instruction file your harness already reads (`CLAUDE.md`, `.cursorrules`,
`GEMINI.md`, …):

```
Read ~/reality.md and ~/soul.md before acting on my goals; follow their agent protocol.
```

In vault mode: `Read $REALITY_HOME/reality.md and soul.md before acting on my goals; follow their agent protocol.`
Or install the [agent plugin](../plugins/reality-architect/README.md):
`/plugin marketplace add frankxai/realityarchitect`.

That's the entire integration.

---

## The chain (why this works)

`reality.md` is built on one mechanism, stated plainly:

> **Outcomes flow through a chain: attention → belief → action → environment → feedback → outcome.**
> Nothing skips the chain. No thought rearranges the world directly — the chain always passes through what you do.

Every section of the file is an intervention point on that chain. An agent reading your `reality.md` is pulling the
levers *with* you: directing attention, lowering the cost of action, holding the environment, closing the feedback
loop. That's the whole trick — and it's mechanism, not magic.

---

## Spec rules (v0.2)

1. **Location:** home mode `~/reality.md` + `~/soul.md` + `~/.reality/` (canonical), or vault mode
   `$REALITY_HOME/reality.md` + `soul.md` + `reality/`. Agents resolve `$REALITY_HOME` first.
2. **Format:** plain markdown + YAML frontmatter declaring `standard: reality.md` (or `soul.md`) and `version`.
3. **Sections:** the eight above. Empty sections are allowed and meaningful — an empty section *is* your gap.
4. **Size:** target ≤150 lines. Depth goes in `.reality/`, not the contract.
5. **Authorship:** the human owns `reality.md` and `soul.md`; agents may *propose* edits but never apply them
   unasked. Agents own state-directory appends, made when asked and always disclosed.
6. **Privacy:** the file is private by default. Never commit it to a public repo; never send it to an external
   service without explicit consent.
7. **License:** this spec is MIT. Extend it, fork it, build tools on it. The name `reality.md` stays generic —
   that's how standards survive their authors.

---

*Authored at [realityarchitect.ai](https://www.realityarchitect.ai). The method that fills the file is free —
[start here](https://www.realityarchitect.ai/start). If your eight sections are mostly empty, that's not a problem,
that's a map.*
