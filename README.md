# Reality Architect

**Find the system gap. Build the next artifact.**

> Go from AI tool-user to system-builder. This repo is two things at once: the **website** at
> [realityarchitect.ai](https://www.realityarchitect.ai), and the **open method** itself. Humans read the site.
> Agents read the repo. Both walk the same five moves.

---

## The thesis

Most people use AI like a vending machine: ask, get an answer, start over tomorrow. The work resets every morning.

An **architect** writes the system around the model: context, specification, bounded agents, supervised automation,
and a feedback protocol. This repo provides the open method, assessment, and starter artifacts for doing that work.

There is no mysticism here. You don't "manifest" a reality — you **engineer** it: memory, specs, agents, loops, and a
learning signal. Every recommendation on the site must cash out in an inspectable artifact and acceptance test.

---

## The Architect's Loop

Five moves. It's a loop, not a ladder — every pass makes the next pass cheaper. Each move is a system you can build
this month, and a brick the next move stacks on.

| # | Move | Build this | It buys you |
|---|------|------------|-------------|
| 01 | **See** | An intelligence layer — a vault your agents read | You stop re-explaining yourself |
| 02 | **Design** | A written spec for one repeating job | Decisions stop draining you |
| 03 | **Build** | One agent that does one job you used to do by hand | The first hour a week comes back |
| 04 | **Automate** | A supervised loop with a receipt | Repeated work has a visible review path |
| 05 | **Compound** | A comparable outcome signal | The next run can be reviewed against the last |

→ Full walkthrough: [realityarchitect.ai/method](https://www.realityarchitect.ai/method)
→ Find your gap: [realityarchitect.ai/assess](https://www.realityarchitect.ai/assess)

---

## The reality.md standard

Codebases got a memory layer — `CLAUDE.md`, `AGENTS.md`, `.cursorrules`. People didn't. **[reality.md](./standard)**
is the open standard that fixes it: one file at `~/reality.md` that tells *any* agent who you are and what you're
building, plus a `~/.reality/` state directory agents maintain. Eight sections, five protocol verbs, zero lock-in.

```
~/reality.md      the contract — you write it, agents read it
~/.reality/       the state — agents maintain it, you review it
```

→ Spec, blank template, and a filled example: [`standard/`](./standard) · Rendered: [realityarchitect.ai/standard](https://www.realityarchitect.ai/standard)

---

## Skill Packs — the build layer

One forkable agent template per move, surfaced at [realityarchitect.ai/skills](https://www.realityarchitect.ai/skills)
and sourced from [`starter/`](./starter). Each pack is harness-agnostic and reads your `reality.md`. Don't install all
five — run the assessment, find your first gap, and fork **that** one.

---

## The MCP server — reality.md, made live

Instead of copying the protocol into every harness, call it. A stateless [MCP server](./app/api/mcp) exposes the five
verbs (READ · SURFACE · PROPOSE · GUARD) as tools for any agent client, operating on the `reality.md` you pass in and
storing nothing. Same engine as the browser playground — only the transport differs, locked by a conformance test.

→ Connect it: [realityarchitect.ai/mcp](https://www.realityarchitect.ai/mcp)

---

## Two ways to use this repo

**As a human** — read [`/start`](https://www.realityarchitect.ai/start), run the assessment, then fork the templates in
[`starter/`](./starter) for whichever move is your gap. Build the one system in front of you, not all five.

The assessment runs locally and exports a Markdown architecture brief. It does not transmit or persist the optional context you enter.

**As an agent** — read [`AGENTS.md`](./AGENTS.md). It's the navigation map: where the method lives, what each starter
template does, and how to orient your human toward their next move without guessing.

---

## What's in here

```
app/            the website (Next.js 16, App Router) — realityarchitect.ai
  page.tsx        the platform overview — spine, four pillars, the Loop
  method/         the five moves in depth (each links to its pack)
  standard/       the reality.md standard, rendered
  skills/         the Skill Packs, sourced from starter/
  mcp/            the live MCP server + browser playground
  assess/         the Architect Assessment (find your gap)
  start/          the getting-started path
  api/mcp/        the stateless MCP server route
  api/reality/    the same engine over plain JSON
standard/       the reality.md spec v0.1 + template + filled example
starter/        forkable, harness-agnostic agent templates — one per move
lib/site.ts     the single brand-config file
lib/packs.ts    Skill Pack content (single source for /skills)
AGENTS.md       navigation map for AI agents exploring this repo
```

Built on the **[Starlight Intelligence Protocol](https://github.com/frankxai/Starlight-Intelligence-System)** — the
substrate that lets one method run across Claude Code, Cursor, Codex, and Gemini.

---

## Run it locally

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # production build
```

Next.js 16 · React 19 · Tailwind v4 (CSS-first) · MDX. Brand lives entirely in `lib/site.ts`.

---

## License

MIT — fork it, ship it, make it yours. The method is meant to be owned. See [`LICENSE`](./LICENSE).

Built by [Frank](https://frankx.ai) — AI Architect. _Let the work speak._
