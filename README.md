# Reality Architect

**Build the systems that build the life you want.**

> Go from AI tool-user to system-builder. This repo is two things at once: the **website** at
> [realityarchitect.ai](https://realityarchitect.ai), and the **open method** itself. Humans read the site.
> Agents read the repo. Both walk the same five moves.

---

## The thesis

Most people use AI like a vending machine: ask, get an answer, start over tomorrow. The work resets every morning.

An **architect** builds the *system* that does the asking — agents that draft, automations that ship, loops that
earn and learn. Same models. Completely different life. The gap between tool-user and system-builder is the only
skill that compounds now. This repo is the method for crossing it, given away free.

There is no mysticism here. You don't "manifest" a reality — you **engineer** it: memory, specs, agents, loops, and a
learning signal. Every claim on the site cashes out in something shipped — a repo to fork, an agent to run, a site
already earning. Proof first. Inspiration is the doorway; engineering is the room.

---

## The Architect's Loop

Five moves. It's a loop, not a ladder — every pass makes the next pass cheaper. Each move is a system you can build
this month, and a brick the next move stacks on.

| # | Move | Build this | It buys you |
|---|------|------------|-------------|
| 01 | **See** | An intelligence layer — a vault your agents read | You stop re-explaining yourself |
| 02 | **Design** | A written spec for one repeating job | Decisions stop draining you |
| 03 | **Build** | One agent that does one job you used to do by hand | The first hour a week comes back |
| 04 | **Automate** | A loop that runs unattended | Output ships on the days you don't |
| 05 | **Compound** | A learning signal pointed at your outcome | The system improves while you sleep |

→ Full walkthrough: [realityarchitect.ai/method](https://realityarchitect.ai/method)
→ Find your gap: [realityarchitect.ai/assess](https://realityarchitect.ai/assess)

---

## Two ways to use this repo

**As a human** — read [`/start`](https://realityarchitect.ai/start), run the assessment, then fork the templates in
[`starter/`](./starter) for whichever move is your gap. Build the one system in front of you, not all five.

**As an agent** — read [`AGENTS.md`](./AGENTS.md). It's the navigation map: where the method lives, what each starter
template does, and how to orient your human toward their next move without guessing.

---

## What's in here

```
app/            the website (Next.js 16, App Router) — realityarchitect.ai
  page.tsx        the manifesto + the Loop
  method/         the five moves in depth
  assess/         the Architect Assessment (find your gap)
  start/          the getting-started path
starter/        forkable, harness-agnostic agent templates — one per move
lib/site.ts     the single brand-config file
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
