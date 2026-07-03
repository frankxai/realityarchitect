# The reality.md Standard
### v0.1 — a machine-readable file for a human life, the way CLAUDE.md is for a codebase.

Every serious AI harness already reads an instruction file before touching a repo: `CLAUDE.md`, `AGENTS.md`,
`.cursorrules`, `GEMINI.md`. Codebases got a memory layer. **People didn't.**

So every agent session starts the same way: you re-explain who you are, what you're building, what matters, what to
ignore. The agent is brilliant and amnesiac. The most leveraged technology in history, and it meets you as a stranger
every morning.

`reality.md` fixes that. It is **one file, in your home directory, that tells any agent who you are and what you're
building** — so every agent on your machine works *for your life*, not just for your repo.

```
~/reality.md      the contract — you write it, agents read it
~/.reality/       the state — agents maintain it, you review it
```

That's the whole standard. No SaaS, no account, no lock-in. A markdown file and a directory, readable by every
harness that exists and every harness that will exist.

---

## Why a file, not an app

- **Files are harness-agnostic.** Claude Code, Cursor, Codex, Gemini, Grok — all of them can read `~/reality.md`
  today, with zero integration work. An app would need twelve integrations; a file needs none.
- **Files are yours.** Versionable, diffable, private by default, portable forever. Your life's operating contract
  should not live in someone's database.
- **Files compound.** A `reality.md` under version control is a record of who you decided to become, with timestamps.

---

## Anatomy of `reality.md`

Eight sections. Each one is a *lever that actually moves outcomes* — and each maps to a move of the
[Architect's Loop](https://realityarchitect.ai/method). Keep the whole file under ~150 lines: it's a contract, not a
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
.reality/
  aims/<slug>.md        one file per aim: the spec, the why, the if-then triggers, current status
  log/<YYYY-MM-DD>.md   review entries — what moved, what didn't, the one correction
  evidence.md           identity votes — every shipped win, appended as it happens
  systems.md            the registry of agents and automations running for you
```

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

To wire it up, add one line to whatever instruction file your harness already reads (`CLAUDE.md`, `.cursorrules`,
`GEMINI.md`, …):

```
Read ~/reality.md before acting on my goals; follow its agent protocol.
```

That's the entire integration.

---

## The chain (why this works)

`reality.md` is built on one mechanism, stated plainly:

> **Outcomes flow through a chain: attention → belief → action → environment → feedback → outcome.**
> Nothing skips the chain. No thought rearranges the world directly — the chain always passes through what you do.

Every section of the file is an intervention point on that chain. An agent reading your `reality.md` is pulling the
levers *with* you: directing attention, lowering the cost of action, holding the environment, closing the feedback
loop. That's the whole trick — and it's mechanism, not magic, which is why it works again and again.

---

## Spec rules (v0.1)

1. **Location:** `~/reality.md` (canonical). `~/.reality/` for state.
2. **Format:** plain markdown + YAML frontmatter declaring `standard: reality.md` and `version`.
3. **Sections:** the eight above. Empty sections are allowed and meaningful — an empty section *is* your gap.
4. **Size:** target ≤150 lines. Depth goes in `.reality/`, not the contract.
5. **Authorship:** the human owns `reality.md`; agents may *propose* edits but never apply them unasked.
   Agents own `.reality/` appends.
6. **Privacy:** the file is private by default. Never commit it to a public repo; never send it to an external
   service without explicit consent.
7. **License:** this spec is MIT. Extend it, fork it, build tools on it. The name `reality.md` stays generic —
   that's how standards survive their authors.

---

*Authored at [realityarchitect.ai](https://realityarchitect.ai). The method that fills the file is free —
[start here](https://realityarchitect.ai/start). If your eight sections are mostly empty, that's not a problem,
that's a map.*
