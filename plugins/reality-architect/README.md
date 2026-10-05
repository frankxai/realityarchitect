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
| `reality-loop` | ask the engine what is due today, then run that one loop with you, asking before every write |
| `reality-onboard` | create soul.md, reality.md and reality/ by interview, or unpack a Studio export |
| `reality-daily` | the morning practice (I am, the scene, one thing to look for, one rep) and the evening witness |
| `reality-witness` | log a sign, win, opening, rep, move, lesson, or gratitude as fact / meaning / action |
| `reality-bridge` | plan an aim from now to the scene, and answer "is it enough?" with the numbers |
| `reality-snapshot` | draft a weekly or monthly snapshot, and seal it only when you approve |
| `reality-decide` | record decisions with a review date, then review them |
| `reality-vision-board` | turn your scenes into image prompts, generate only with consent, place them on the map |
| `reality-library` | learn a teacher or idea with Keep, Mechanism, and Limits, from `library.json` (generated from the site's Library) |

## The engine

`bin/reality.mjs` is a read-only engine with no dependencies (Node 18 or newer). Skills call it so an agent starts
from computed state instead of guessing; you can run it too:

```bash
node bin/reality.mjs status            # your home, each aim's pace, and what is due today
node bin/reality.mjs due               # the loops due today, each with its computed reason
node bin/reality.mjs brief weekly      # what an agent reads before a loop: quoted Charter, steps, gate, labeled state
node bin/reality.mjs insights          # patterns over time, as counts, never causes
node bin/reality.mjs graph             # the typed reality graph as JSON
node bin/reality.mjs validate          # your files against STATE.md, with file and line
node bin/reality.mjs skill-check DIR   # a skill folder against the marketplace bar
```

- **The graph** turns your files into typed nodes and edges. Every node carries its label (desired, reported, planned,
  done, meaning, computed) and an ID in the Starlight kernel's `ra:<type>:<key>` form, so it can project into SIS
  without either side owning the other.
- **The loops** are data: morning, evening, weekly, monthly, decisions, and pace. Each one says what makes it due, its
  steps, what it may write, and its gate (ask before writing, or seal only on approval). `reality loops` lists them.
- **The marketplace bar** (`skill-check`) is what any skill must meet to ship here: the Agent Skills format, the
  Charter preamble, no outcome promises or causal claims, no teacher names outside the Library data, no paths the
  installed plugin cannot reach, and asking before any write.

## The MCP server

The plugin also starts the same engine as a local MCP server (`mcp/server.mjs`, stdio, no dependencies), so any agent
in an MCP client reads the numbers the Studio and the CLI show. Installing the plugin wires it up through `.mcp.json`.
To use it in another client, run `node mcp/server.mjs` with `REALITY_HOME` set.

| Tool | Returns |
| --- | --- |
| `reality_status` | your home, each aim's computed pace, and what is due today |
| `reality_due` | the loops due today, each with its reason |
| `reality_brief` | what to read before one loop (`morning`, `evening`, `weekly`, `monthly`, `decisions`, `pace`) |
| `reality_insights` | patterns over a window of days, as counts labeled computed |
| `reality_validate` | your files against the standard, by file and line |
| `reality_graph` | the typed reality graph with kernel IDs |
| `reality_loops` | what each loop does, writes, and needs approval for |
| `library_search` | a Library entry by id or by words: keep, mechanism, limits |

Every tool is read-only and marked so. It runs on your machine, reads only your home folder, and sends nothing
anywhere. Writing stays with the skills, which show the exact text and ask first. The tests check that every tool
returns exactly what the CLI prints for the same files.

## The rules every skill follows

Every skill begins by reading `CHARTER.md` in this plugin, an exact copy of the
[Agent Charter](CHARTER.md): read before acting, propose rather than impose, keep labels
(desired, reported, planned, done, meaning), never certify causation, never blame, protect everyone's agency, ask
before memory, sync, sharing, or spending, count misses with hits, seal only what you approved, and send health,
money, and crisis questions to humans.

## Works with

- **Reality Studio** at https://www.realityarchitect.ai/studio: same files; its export unzips into your home.
- **Obsidian:** `reality/` and `Reality Map.canvas` open natively, on desktop and mobile.
- **second-brain-os:** the snapshot skill can read its `brain/` vault (never `private/`).

MIT. Built on SIP.
