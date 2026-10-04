---
name: reality-witness
description: "Record one moment in the person's Witness ledger - a sign or synchronicity, a win, an opening, a rep or bold move done, a lesson, or gratitude - as what happened, what it meant, what was done and what comes next. Use when they say log this, I noticed something, something happened, a sign, a win, or I did my rep."
---

# Witness a moment

> **First:** read `CHARTER.md` at the root of this plugin if you have not read it in this session, and follow it.
> Non-negotiable: never claim that thought, feeling, imagery, frequency or quantum effects caused an event; never
> blame; ask before writing; keep desired, reported, planned, done and meaning apart; if the person mentions self-harm,
> harm to others or an emergency, stop, respond with care, and point them to local emergency services or a crisis line.

Noticing is a skill. This ledger trains it and keeps an honest record.

## Find the home

`$REALITY_HOME/reality/` if set, else `~/.reality/` when `~/reality.md` exists, else offer `reality-onboard`. Never
write in the current working directory. `STATE/` below means that directory.

## Steps

1. **Classify** the moment as one kind: `sign` (a meaningful coincidence) · `win` (an identity vote) · `rep` (a practice
   done) · `move` (a bold move done) · `opening` (an opportunity, a person, a door) · `lesson` · `gratitude`.
2. **Separate four things**, asking only for what is missing:
   - **Happened (fact):** what an outside observer could have seen.
   - **Meant (my meaning):** what it meant to them, in their words. Optional. Never add your own interpretation.
   - **Did (action):** only what is **already done**. Optional.
   - **Next (planned):** what they intend to do. Optional. A plan never goes under Did, so it is never counted as
     evidence.
3. For a `sign`, ask: "Had you set out today to notice something like this?" Yes → `primed`, no → `unprimed`. If it
   matches today's look-for, also set today's log line `Did it come:` to `yes`.
4. If they tell you the look-for **did not** come, set today's log line `Did it come:` to `no` (create the line if it
   is missing). That is the countable record of a miss; snapshots add these up.
5. Ask which aim or life domain it belongs to, if any.
6. Show what you will append, and after a yes:
   - Insert the entry at the top of `STATE/witness.md`, just under its heading (newest first), and append it to
     `STATE/log/<YYYY-MM-DD>.md`. Never rewrite existing entries.

     ```markdown
     ### 2026-10-04 08:12 · sign · primed
     - **Happened (fact):** …
     - **Meant (my meaning):** …
     - **Did (action):** …
     - **Next (planned):** …
     - Bridge: <aim-slug> · Domain: <domain-id>
     ```
   - For `win` and `move`, also append one line to `STATE/evidence.md`: `- 2026-10-04 · <the win, as an identity vote>`.
7. Reply with one sentence that reflects what they did or will do, not the cosmos.

## Never

- Never say or imply that the sign was caused by their thoughts, feelings, frequency, or the universe responding. If
  they believe that, it is their meaning: record it under **Meant**, unedited.
- Never count only the hits. Never turn the ledger into a score of their worth.
- Never log anything about another person beyond what the person chose to write.

Format reference: https://github.com/frankxai/realityarchitect/blob/main/standard/STATE.md
