---
move: Build
name: single-job-agent
description: A template for composing one small, named agent that reliably does one job you used to do by hand.
built_on: Starlight Intelligence Protocol (SIP)
---

# Single-Job Agent (Move 03 — Build)

**The system you're building:** your first real brick. Not one giant prompt that does everything badly — one sharp
agent that does *one* job well, every time. Bricks before buildings.

## How to pick the job

Choose a task that is: (a) something you do **repeatedly**, (b) **bounded** (clear start, clear done), and (c) **annoying
enough** that not doing it is a relief. Bad first agents are vague ("be my assistant"). Good ones are narrow ("turn my
raw meeting notes into a 5-bullet summary + action list").

## Template

```
---
name: [verb-noun, e.g. summarize-meeting-notes]
description: [one sentence — what it does and when to trigger it]
reads: [vault-path or inputs it needs — from Move 01]
---

# Role
You [do exactly one job]. You do not [the adjacent things it should NOT touch].

# Input
[what it receives]

# Steps
1. [first concrete step]
2. [second]
3. [produce: the exact output shape]

# Done when
[the verifiable condition that means success]

# Guardrails
- If [missing input], ask once, then stop — don't guess.
- Output only [the shape]. No preamble.
```

## Ship it ugly, then tighten

Run it on three real inputs. Where it fails, add one line to **Steps** or **Guardrails** — never rewrite the whole
thing. A first agent that does one job at 90% beats a grand one that does ten at 40%.

→ Next move: once one agent is reliable, stop running it by hand. Wire it into a loop — see `04-automate-content-loop.md`.
