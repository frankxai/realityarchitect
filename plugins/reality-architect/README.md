# reality-architect — the agent plugin

Skills that let Claude Code (and any harness that reads `SKILL.md`) practice Reality Architect with you, on the open
format: `reality.md` (the contract), `soul.md` (the inner contract), and the `reality/` state directory.

**Imagine it. Build it. Witness it.** Meaning and mechanism stay separate; nothing leaves your machine unless you say
so.

## Install

```text
/plugin marketplace add frankxai/realityarchitect
/plugin install reality-architect@realityarchitect
```

Then tell your agents where your home is (vault mode works inside Obsidian, including on your phone):

```bash
export REALITY_HOME="$HOME/Notes/Reality Architect"   # or leave unset to use ~/reality.md + ~/.reality/
```

## Skills

| Skill | Use it to |
| --- | --- |
| `reality-onboard` | create soul.md, reality.md and reality/ by interview, or unpack a Studio export |
| `reality-daily` | the morning practice (I am, the scene, one thing to look for, one rep) and the evening witness |
| `reality-witness` | log a sign, win, opening, rep, move, lesson, or gratitude as fact / meaning / action |
| `reality-bridge` | plan an aim from now to the scene, and answer "is it enough?" with the numbers |
| `reality-snapshot` | draft a weekly or monthly snapshot, and seal it only when you approve |
| `reality-decide` | record decisions with a review date, then review them |
| `reality-vision-board` | turn your scenes into image prompts, generate only with consent, place them on the map |
| `reality-library` | learn a teacher or idea with Keep, Mechanism, and Limits |

## The rules every skill follows

The [Agent Charter](../../standard/AGENT-CHARTER.md): read before acting, propose rather than impose, keep labels
(desired, reported, planned, done, meaning), never certify causation, never blame, protect everyone's agency, ask
before memory, sync, sharing, or spending, count misses with hits, seal only what you approved, and send health,
money, and crisis questions to humans.

## Works with

- **Reality Studio** at https://www.realityarchitect.ai/studio: same files; its export unzips into your home.
- **Obsidian:** `reality/` and `Reality Map.canvas` open natively, on desktop and mobile.
- **second-brain-os:** the snapshot skill can read its `brain/` vault (never `private/`).

MIT. Built on SIP.
