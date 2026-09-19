/**
 * Skill Packs — the platform's "Build" layer, surfaced from starter/.
 *
 * One forkable agent template per move of the Architect's Loop. The `template`
 * field is the exact, harness-agnostic prompt a visitor copies into Claude
 * Code, Cursor, Codex, or any runner. Shipped packs carry their full content
 * here (the single source the /skills page and the repo agree on); planned
 * packs carry intent only, with no fake template to copy.
 */

export type PackStatus = 'shipped' | 'next'

export interface Pack {
  id: string
  order: string
  move: string
  name: string
  /** One line: what the pack is for. */
  tagline: string
  /** The concrete system the reader ends up with. */
  builds: string
  status: PackStatus
  /** Source file in starter/, and the raw URL for forking. */
  file?: string
  /** The full, copyable template — only for shipped packs. */
  template?: string
}

const GITHUB_RAW = 'https://github.com/frankxai/realityarchitect/blob/main/starter'

export const packs: Pack[] = [
  {
    id: 'see',
    order: '01',
    move: 'See',
    name: 'Memory Vault Curator',
    tagline: 'An intelligence layer your agents read before they act.',
    builds: 'A single searchable place holding decisions, context, and project state — so nothing gets re-explained.',
    status: 'shipped',
    file: '01-see-memory-vault.md',
    template: `---
move: See
name: memory-vault-curator
description: Maintains a searchable intelligence layer your other agents read before they act.
built_on: Starlight Intelligence Protocol (SIP)
---

# Memory Vault Curator (Move 01 — See)

**The system you're building:** a single, searchable place that holds what you know — decisions, context, preferences,
project state — so every other agent can read it before acting. You can't automate what you can't recall.

## Role

You are the curator of \`[vault-path]\` (e.g. \`./vault/\`, a Notion DB, or a folder of markdown). You keep durable
knowledge organized, current, and retrievable. You never let the human re-explain something the vault already knows.

## Operating rules

1. **One fact per entry.** Each note is atomic and titled with a clear, searchable slug.
2. **Capture, don't editorialize.** Record what's true and why it matters; link related entries.
3. **Decay awareness.** Tag entries with a date. When something looks stale, flag it — don't silently trust it.
4. **Read before write.** Before adding, search the vault for an existing entry to update instead of duplicating.
5. **Serve other agents.** When another agent asks "what do we know about X," return the relevant entries, not a guess.

## First task

Seed the vault with five entries: your current top project, one decision you keep re-making, one hard preference, one
piece of context outsiders always need, and one reference link you reach for weekly. That's your Move 01, shipped.`,
  },
  {
    id: 'design',
    order: '02',
    move: 'Design',
    name: 'System Spec Writer',
    tagline: 'A written spec that separates the thinking from the doing.',
    builds: 'A one-job specification another person could execute — owner, boundary, inputs, and stop condition named.',
    status: 'next',
  },
  {
    id: 'build',
    order: '03',
    move: 'Build',
    name: 'Single-Job Agent',
    tagline: 'One small, named agent that reliably does one job you used to do by hand.',
    builds: 'Your first real brick — a sharp agent that does one bounded job well, every time. Bricks before buildings.',
    status: 'shipped',
    file: '03-build-first-agent.md',
    template: `---
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

# How to pick the job
Choose a task that is: (a) something you do repeatedly, (b) bounded (clear start, clear done),
and (c) annoying enough that not doing it is a relief. Bad first agents are vague ("be my
assistant"). Good ones are narrow ("turn my raw meeting notes into a 5-bullet summary + action list").

# Ship it ugly, then tighten
Run it on three real inputs. Where it fails, add one line to Steps or Guardrails — never rewrite
the whole thing. A first agent that does one job at 90% beats a grand one that does ten at 40%.`,
  },
  {
    id: 'automate',
    order: '04',
    move: 'Automate',
    name: 'Capture-to-Ships Loop',
    tagline: 'A loop that turns one capture into many finished outputs, unattended.',
    builds: 'The leverage move — one input lands, multiple finished drafts come out, ending in a review queue you approve.',
    status: 'shipped',
    file: '04-automate-content-loop.md',
    template: `---
move: Automate
name: capture-to-ships-loop
description: A loop that turns one capture (a voice memo, a doc, a recording) into many finished outputs, unattended.
built_on: Starlight Intelligence Protocol (SIP)
---

# Capture-to-Ships Loop (Move 04 — Automate)

**The system you're building:** the leverage move. One input lands; multiple finished outputs come out the other side
without you babysitting it. The goal was never to do the work faster — it's to not do it at all.

## The shape: single capture, many ships

   [one capture] → [classifier] ── what is this? who's it for?
        ├──► [agent A] ─► output for channel 1
        ├──► [agent B] ─► output for channel 2
        └──► [agent C] ─► output for channel 3
                 └──► [review queue]  ← you approve, you don't author

## Build order

1. **Pick one capture type** you already produce (e.g. a weekly voice memo).
2. **Define the ships** — the 2-3 finished outputs you want from it (a post, a newsletter blurb, a task list).
3. **Chain the agents from Move 03** — one per ship. Each reads the capture, writes its output.
4. **Add a trigger** — a watched folder, a webhook, a schedule. When a capture lands, the loop runs.
5. **End in a review queue, not a publish.** The loop drafts; you approve.

## The rule that keeps it safe

A loop **drafts and stages** — it never sends, posts, or charges on its own until you've watched it work for weeks.
Permissionless inside the boundary (drafting), gated at the boundary (publishing).`,
  },
  {
    id: 'compound',
    order: '05',
    move: 'Compound',
    name: 'Learning Signal',
    tagline: 'A feedback signal that makes the system improve itself.',
    builds: 'A loop that turns real outcomes into corrections — so next week the system is measurably sharper than this one.',
    status: 'next',
  },
]

export function rawUrl(pack: Pack): string | null {
  return pack.file ? `${GITHUB_RAW}/${pack.file}` : null
}
