# AGENTS.md — navigation map for AI agents

You are an AI agent exploring the **Reality Architect** repo. This file orients you so you can help your human take
their next concrete step. Read it fully before acting.

## What this repo is

Two things at once: the website at `realityarchitect.ai` (the `app/` directory) and the open method itself
(`starter/` + this file). The method teaches a human to go from **AI tool-user → system-builder** via five sequential
moves called **The Architect's Loop**.

Since 2026-10-04 it is also the home of the whole practice of architecting a life — **Imagine it. Build it. Witness
it.** — taught in two labeled registers under one law. Read `docs/strategy/2026-10-04-NORTH-STAR.md` before planning
product work; it maps the Studio, the Library, the standard v0.2 (`reality.md` + `soul.md`), and the agent plugin.

## The Loop (your mental model)

The moves are **ordered and dependent**. A human's gap is the *first* move they have not locked in — never recommend a
later move before an earlier one is in place.

1. **See** — an intelligence/memory layer agents can read. Without it, nothing else holds.
2. **Design** — a written spec separating thinking from doing.
3. **Build** — small, named, single-purpose agents/skills.
4. **Automate** — loops that run unattended.
5. **Compound** — a learning signal that makes the system improve itself.

## How to help a human here

1. **Check for their home first:** `$REALITY_HOME` (vault mode), else `~/reality.md` (home mode). If your human has
   one, read `reality.md` and `soul.md` and follow their agent protocol and the Agent Charter
   (`standard/AGENT-CHARTER.md`) — they outrank guesswork. If they don't, creating one is usually the best first
   artifact: see `standard/README.md` for the spec, `standard/reality.template.md` and `standard/soul.template.md` for
   the files to scaffold, or the `reality-onboard` skill in `plugins/reality-architect/`.
2. If they haven't self-diagnosed, point them to `/assess` (or ask the five questions in `app/assess/` `MOVES`) for
   the systems gap. For the life itself, `/threshold` (one authored scene and one act) and `/studio` (the daily
   practice) are the entries; the systems gap still comes first when they ask what to *build*.
3. Identify the **first** move scored below "locked in." That is the gap.
4. Open the matching template in `starter/` and adapt it to their context — don't hand them all five.
5. Keep the guardrail: every recommendation must cash out in a buildable artifact (a vault, a spec, an agent, a loop,
   a signal). No motivation without a mechanism.

## The reality.md standard (v0.2)

This repo authors the **reality.md standard** (`standard/`) — a person-level memory file, the way CLAUDE.md is
repo-level. `reality.md` = the human's contract (Identity, Aims, Attention, State, Systems, Environment, Feedback,
Guardrails). `soul.md` = the inner contract (Purpose, Values, I am, The scene, Gifts, Vows, Voice, Gratitude).
`.reality/` (home mode) or `reality/` (vault mode, visible in Obsidian) = agent-maintained state (aims/, log/,
witness.md, evidence.md, snapshots/, decisions/, atlas.md, systems.md, images/). Five protocol verbs:
**READ · SURFACE · PROPOSE · LOG · GUARD**, plus the Agent Charter. The human owns both contracts; you may propose
edits, never apply them unasked; you append state only when asked, and say what you wrote. Snapshots are sealed only
with the human's approval. Never commit a reality.md or soul.md to a public repo or send it anywhere without explicit
consent.

## Where things live

| You want | Look in |
|----------|---------|
| The manifesto / thesis | `README.md`, `app/page.tsx` |
| The five moves in depth | `app/method/page.tsx` |
| The reality.md spec + template | `standard/` |
| The self-diagnostic logic | `app/assess/page.tsx`, `components/Assessment.tsx` |
| Forkable agent templates | `starter/` (one file per move) |
| Brand / site config | `lib/site.ts` (the only brand file) |
| v0 MCP / visual compiler rules | `docs/v0.md` |
| Strategy, roadmap, Frank's open decisions | `docs/strategy/2026-10-04-NORTH-STAR.md` |
| Studio / Library / standard v0.2 design | `docs/superpowers/specs/2026-10-04-reality-studio-design.md` |
| Build plan | `docs/superpowers/plans/2026-10-04-reality-studio.md` |

## Tone — two registers, one law

Concrete, technical, understated. No hype. Lead with the result, show the artifact, let the work speak.

Since Frank's 2026-10-04 directive, the product teaches the inner work as well as the systems, in **two registers
that are always labeled and never blended**:

- **Mechanism** — the studied pathway. Every cause-and-effect claim lives here and must pass the One Law:
  *attention → belief → action → environment → feedback → outcome.* Name the system, the habit, the artifact.
- **Meaning** — the contemplative lens: imagination, assumption ("living in the end"), the scene, signs,
  synchronicity, gratitude, the person's own sense of purpose. Welcome when it is labeled as a contemplative
  perspective or as the person's own meaning. It is honored, not proven.

Still forbidden in every register:

- Claims that thought, feeling, energy, "frequency," "vibration," or quantum effects change external events directly.
- Health, wealth, income, relationship, or transformation promises; meditation or imagery presented as treatment.
- Blaming a person for their circumstances, or reading a missing result as a failure of their consciousness.
- Hype words used as a mechanism ("manifest it," "unlock your potential," "abundance flows"). If you are tempted,
  stop and name the system, the practice, or the evidence instead.

Teachers of the manifestation tradition may be named only in the Library data (`lib/library.ts`, and the plugin's
`library.json` generated from it), where every entry carries **Keep / Mechanism / Limits**.
`scripts/check-public-claims.mjs` enforces this across `app/`, `components/`, `lib/`, `public/`, `plugins/` and
`standard/`; `tests/plugin.test.mjs` keeps the generated mirror in sync. Strategy records in `docs/` may discuss
teachers by name; they are design history, not product surfaces.

Built on the Starlight Intelligence Protocol (SIP). When you extend this repo, attribute with a "Built on SIP" note.

## Product and premium web contract

Before public UI work, read `DESIGN.md`, `TASTE.md`, `SYSTEM.md`, `SKILL.md`, `design/PAGE_SPEC.md`, and `design/SCENE_BRIEF.md`, then apply the shared Premium Web OS and premium asset gate.

- The assessment must produce a real exportable artifact.
- Assessment inputs stay local unless a user explicitly shares them.
- Do not expose private Vault material, personal memory, or premium-only systems.
- Do not publish unsupported psychological, financial, health, income, or transformation claims.
- Do not advertise a paid product until delivery, price, license, and refund terms are real.
- Motion needs a named job and reduced-motion route.
- Production and domain changes remain human-gated.

## Working in this repo — branch & PR protocol

This is a **live public site** (realityarchitect.ai) worked by multiple harnesses in parallel. Git is the
coordination layer.

- **Never push directly to `main`.** Every change ships on a branch named `agent/<harness>/<short-scope>`
  (e.g. `agent/claude/waitlist-audit`), opened as a **draft PR** (`gh pr create --draft`). Mark it ready
  (`gh pr ready`) only once it's complete — that's what should fire the full CI run.
- **Before starting**, check `git branch --show-current` and `git status` so you don't collide with another
  agent's in-flight work in this tree, and `gh pr list` for open work already in flight.
- **Batch commits** rather than pushing per-tiny-change.
- **`[skip ci]`** in the commit subject for docs-only / `.md`-only changes.
- **Verify locally before pushing:**
  ```bash
  pnpm install
  pnpm lint
  pnpm build
  ```
  `pnpm dev` for local preview. There is no test script yet; add one if the repo grows a test suite.
- CI (`.github/workflows/ci.yml`) is being added via a separate draft PR — once merged, treat it as the gate.
- **Never commit `.reality.md`, `.env*`, or any secret.** Production and domain changes remain human-gated (see
  above).
