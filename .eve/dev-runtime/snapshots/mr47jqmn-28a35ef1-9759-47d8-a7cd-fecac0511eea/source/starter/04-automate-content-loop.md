---
move: Automate
name: capture-to-ships-loop
description: A loop that turns one capture (a voice memo, a doc, a recording) into many finished outputs, unattended.
built_on: Starlight Intelligence Protocol (SIP)
---

# Capture-to-Ships Loop (Move 04 — Automate)

**The system you're building:** the leverage move. One input lands; multiple finished outputs come out the other side
without you babysitting it. The goal was never to do the work faster — it's to not do it at all.

## The shape: single capture, many ships

```
   [one capture]
   voice memo / doc / recording
        │
        ▼
   [classifier]  ── what is this? who's it for?
        │
        ├──► [agent A] ─► output for channel 1
        ├──► [agent B] ─► output for channel 2
        └──► [agent C] ─► output for channel 3
                 │
                 ▼
        [review queue]  ← you approve, you don't author
```

## Build order

1. **Pick one capture type** you already produce (e.g. a weekly voice memo).
2. **Define the ships** — the 2-3 finished outputs you want from it (e.g. a post, a newsletter blurb, a task list).
3. **Chain the agents from Move 03** — one per ship. Each reads the capture, writes its output.
4. **Add a trigger** — a watched folder, a webhook, a schedule. When a capture lands, the loop runs.
5. **End in a review queue, not a publish.** The loop drafts; you approve. Automation earns trust before it earns autonomy.

## The rule that keeps it safe

A loop **drafts and stages** — it never sends, posts, or charges on its own until you've watched it work for weeks.
Permissionless *inside* the boundary (drafting), gated *at* the boundary (publishing).

→ Next move: now make the loop get better on its own. Point a learning signal at what actually worked — Move 05, Compound.
