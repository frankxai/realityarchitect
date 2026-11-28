---
standard: reality.md
version: "0.1"
updated: YYYY-MM-DD
---
# reality.md — <your name>

<!--
This is your contract with every agent on your machine. Keep it under ~150 lines.
Empty sections are fine — an empty section is your gap, and that's useful information.
Spec: https://github.com/frankxai/realityarchitect/tree/main/standard
-->

## Identity
<!-- Who is acting. 2-4 roles, present tense. Every action is a vote for one of these. -->
- I am someone who …

## Aims
<!-- What's being built. Specific, difficult, written. Each aim gets a file in .reality/aims/. -->
- **<aim>** — done when <verifiable result>, by <date>. → `.reality/aims/<slug>.md`
  - if <trigger>, then I <action>

## Attention
<!-- What signal agents should surface, what to mute. This is your filter. -->
- Surface: …
- Mute: …

## State
<!-- The conditions you act from. Non-negotiables agents must protect. -->
- Sleep: …
- Deep work window: …
- Non-negotiable: …

## Systems
<!-- What already runs without you. Registry detail in .reality/systems.md. -->
- …

## Environment
<!-- Defaults you've engineered. What's one click away; what's been removed. -->
- …

## Feedback
<!-- Review cadence + the metrics that count. Reviews land in .reality/log/. -->
- Review: <daily/weekly>, <when>. Log to `.reality/log/`.
- Metrics that count: …

## Guardrails
<!-- What agents must never do on your behalf. -->
- Never spend money, send messages, or publish publicly without asking.
- Never propose belief or visualization as the mechanism — every recommendation ends in an artifact.
- …

## Agent protocol
You are an agent reading my reality.md. Follow the standard's five verbs:
**READ** this file before acting for me · **SURFACE** what matches my Aims and Attention ·
**PROPOSE** the smallest next action that votes for my Identity · **LOG** outcomes to `.reality/` ·
**GUARD** the guardrails above without exception.
