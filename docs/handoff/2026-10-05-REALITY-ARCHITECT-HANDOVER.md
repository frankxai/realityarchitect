# Reality Architect: complete engineering handover (2026-10-05)

For the next agent: this is everything needed to continue at the same bar, without the chat.

- **State.** `main` is at `b5e365d` (PR #64), and production is www.realityarchitect.ai. `node --test` passes 226/226.
- **Frank's prompts, verbatim.** They are in a private local file: `C:\Users\frank\.starlight\restart\2026-10-05-reality-architect-PROMPTS.md`.
  - Read it before planning anything large.
  - It is private on purpose: the prompts name a trademark that must never appear on a public surface. Never copy it into this repo.

**Read in this order.**

1. This file.
2. `AGENTS.md` (the two registers).
3. `docs/strategy/2026-10-05-AGENT-TEAMS.md`.
4. `docs/strategy/2026-10-05-GTM-PLAN.md`.
5. `docs/adr/ADR-001-passkeys-and-studio-cloud-keys.md`.
6. The private prompts file.
7. `C:\Users\frank\.agent-harness\AMBITION-AND-EXCELLENCE.md` and `C:\Users\frank\.starlight\agent-os\PLAN-2026-10-05.md`.

---

## 1. The mission, in Frank's intent (paraphrased; verbatim in the private file)

Frank gave Reality Architect "god mode", with eleven prompts over 2026-10-04 and 2026-10-05. Together they ask for:

1. **One coherent practice for architecting a life: imagine it, build it, witness it.** The parts are:
   - a person's `reality.md` and `soul.md` that every agent reads;
   - a second brain (Obsidian-ready, Starlight-connected), with better visuals than Obsidian;
   - an infinite canvas and vision boards with agent-made images;
   - temporal processing (approved snapshots and decisions tracked across time);
   - a daily practice that records signs honestly as evidence;
   - a bridge from the current state to the desired one: skills, systems, AI workflows, reps, bold moves, "is it enough?";
   - the people and places a person needs;
   - living from the person they are becoming.
2. **Teach the manifestation canon and "Reality Theory" fully, combined with sound science.**
   - Doctrine decided 2026-10-04: two registers, always labeled; never claim that thought or frequency causes events.
3. **Own design and interfaces, and a bigger moat.**
   - Main focus: the skill marketplace, workflows, graph engineering, loop design, and agentic execution in the second brain.
   - Weave the brand's old names in, each keeping its meaning.
4. **Frontier architecture.** Image generation, Studio Cloud, Pro options, MCP, Vercel, and later video and VR/AR.
5. **Abundance in decisions.** Frank delegated the remaining decisions to the agent, to be made with abundance thinking.
6. **Sell now, and scale without Frank.**
   - Per-layer offers, tooling, agent capabilities and time to market.
   - Audio programs with his voice and music, ebooks, an MCP connector and the person's own hub, connectors, a token budget, agent teams.
7. **Excellence through teams.** Multi-agent teams, the right skills, and the highest quality standards.
8. **This handover:** all prompts, deeper engineering, all repos, and a greater implementation.

## 2. Non-negotiables

These are enforced in code and must never be weakened.

- **Two registers.**
  - **Meaning** is contemplative and the person's own. It is shown in dawn (`#e8d5ad` / `#f7e8c8`, Georgia).
  - **Mechanism** is a studied pathway. It is shown in blueprint (`#5b8cff`, Inter / Space Grotesk / JetBrains Mono).
  - The two are labeled per block and never blended into one causal sentence. Dawn never carries a causal claim, a number, a price or a system route.
- **No causal claims or promises.**
  - Never claim that thought, feeling, imagery, frequency, vibration or quantum effects cause external events.
  - No promises about health, income or relationships, and no blaming a person for a miss.
- **Library only.**
  - Teacher names appear only in `lib/library.ts` and the generated `plugins/reality-architect/skills/reality-library/library.json`, enforced by `scripts/check-public-claims.mjs`.
  - Day pages show meaning-shelf entries by shelf.
- **A registered trademark appears in the private prompts.** Never use it as a product name, in page copy, or on any
  public-facing surface. `docs/strategy/2026-10-04-FRONTIER-ARCHITECTURE.md` §10 records the trademark analysis and
  the naming weave.
- **Local-first.** The Studio keeps data on the device: `localStorage` `ra.studio.v1` (only in `lib/studio/persist.ts`) and IndexedDB `ra-studio` for images (only in `lib/studio/images.ts`).
  - The cloud only ever sees end-to-end-encrypted blobs (ADR-001).
- **Agents ask before writing.** The Agent Charter (`standard/AGENT-CHARTER.md`, 12 articles) applies: agents propose, the person decides, and snapshots are sealed only on approval.
- **Frank's buttons.** These stay with Frank: money (Polar live, prices going public), publishing and posting, keys and budgets, the Neon project, SIS `main`, frankx.ai production merges, and the Polar organization and onboarding.

## 3. What is live (verified 2026-10-05 on production)

| Surface | Route | What it is |
| --- | --- | --- |
| Home | `/` | Hero "Imagine it. Build it. Witness it." and "The practice, in five scenes" (CSS scroll-driven, static under reduced motion) |
| Studio | `/studio` | Local-first PWA: Today, Atlas, Bridges, Witness, Map (JSON Canvas, board mode), Timeline (snapshots, decisions, patterns over time), Soul; export to an Obsidian-ready ZIP |
| Library | `/library` | Reality Theory (One Law, three layers, ten principles); 26 works as Keep · Mechanism · Limits; myths; reading paths |
| Threshold | `/threshold` | The Imaginal Act: one scene, one fact, one act, as a Reality Card |
| Program | `/programs/imaginal-30` and `/1` … `/30` | Free 30-day program, rendered from `programs/imaginal-30/*.md` |
| Complete Edition | `/programs/imaginal-30/complete` | **Closed**: no price, `noindex`, not in the sitemap; opens only with `open: true` plus a Polar hosted-checkout link |
| Standard | `/standard` | reality.md and soul.md v0.2 |
| Plugin | GitHub `frankxai/realityarchitect` | Claude Code plugin `reality-architect` 0.3.0: nine skills, a zero-dependency engine and CLI, and a local MCP server with eight read-only tools |
| Also | `/method`, `/assess`, `/apply`, `/start`, `/vault`, `/privacy` | The earlier method site; `/sw.js` and `/manifest.webmanifest` for the PWA |

## 4. Repository map

| Path | Responsibility |
| --- | --- |
| `app/` | Next 16 App Router pages (server components by default). `app/sitemap.ts` imports pure constants from `lib/programs/program.ts`. |
| `components/studio/` | The Studio client app: `Studio.tsx` (shell, banners), `useStudio.ts` (state, conflict-safe saves), views `TodayView`, `AtlasView`, `BridgesView`, `WitnessView`, `MapView`, `TimelineView`, `SoulView`, plus `DataDialog`, `InstallApp`, `ui.tsx` |
| `lib/studio/` | Pure Studio logic: `types.ts` (StudioState v1), `state.ts` (empty and normalize), `persist.ts` (conflict-checked saves), `images.ts`, `pace.ts` ("is it enough?"), `snapshot.ts`, `moves.ts`, `board.ts`, `canvas.ts` (JSON Canvas), `export.ts` (`bundleFiles`), `importer.ts`, `zip.ts` (store-method, UTF-8), `reality.ts` (Studio → engine shape), `stats.ts`, `domains.ts` (12 domains), `sample.ts` |
| `lib/library.ts` | The single source of truth for the canon. Correct it here first. |
| `lib/programs/` | `markdown.ts` (zero-dependency parser: front matter, headings, lists, quotes, CommonMark-style fences, safe links), `imaginal-30.ts` (file system loader), `program.ts` (pure constants), `complete-edition.ts` (the paid edition config, `isPolarCheckout` URL validation) |
| `components/programs/Prose.tsx` | Renders parsed blocks as React elements. Meaning and Mechanism paragraphs become labeled cards; fences become named, scrollable regions. |
| `programs/imaginal-30/` | The free program as Markdown: `README.md` plus `days/day-01.md` … `day-30.md`, each with front matter `day, week, title, loop, library, minutes`. |
| `plugins/reality-architect/` | `engine/*.mjs`: `parse`, `graph` (SIS kernel IDs `ra:<type>:<key>`), `pace`, `loops` (morning/evening/weekly/monthly/decisions/pace), `brief`, `insights` (counts only), `validate`, `skill-check` (the marketplace bar), `model`. Also `bin/reality.mjs` (CLI), `mcp/server.mjs` (stdio MCP), `.mcp.json`, nine skills, `CHARTER.md`, `STATE.md`. |
| `standard/` | The open format: `README`, `STATE.md` (all file formats), `AGENT-CHARTER.md`, and templates and examples for reality.md and soul.md |
| `scripts/` | Gates: `check-public-claims.mjs`, `check-built-pages.mjs` (runs after `next build`), `governance/*`. Builders: `audio/` (TTS → mix), `vault/`, `book/` (Pandoc), `journal/` (Chromium print). Also `build-plugin-data.mjs`. |
| `tests/` | 30 test files, `node --test` with native TypeScript stripping (runtime `.ts` imports with explicit extensions) |
| `docs/` | Strategy (north star, frontier architecture, GTM, agent teams, offer and delivery, the Polar spec), ADR-001, handoffs, superpowers specs and plans |
| `media/story/` | Five original story frames with `MANIFEST.md` (provenance) |

### Contracts that must hold

- **The standard v0.2 formats** are in `standard/STATE.md`: the Atlas table, aims, the witness entry (`### <day> <time> · <kind> · primed|unprimed` with Happened / Meant / Did / Next), the day log ("Looking for", "Did it come: yes|no|not marked"), approved immutable snapshots, and decisions with `review_on`.
- **Parity.** The Studio's patterns equal `reality insights` run on its own export (`tests/studio-patterns.test.mjs`). The MCP tools equal the CLI's output (`tests/mcp.test.mjs`). The vault validates in the engine (`tests/vault.test.mjs`).
- **`sip.reality-card` v1** (`lib/reality-card.ts`, documented in `docs/experience-architecture-2026.md`) is the emitted shape: desired / reportedPresent / plan.
- **The MCP lifecycle** follows 2025-11-25:
  - a valid `initialize` request (`protocolVersion`, `capabilities`, `clientInfo{name,version}`), then `notifications/initialized`, then tools;
  - `-32002` before that, `-32602` for an unknown tool or malformed params, `isError` results for argument or home problems;
  - `id: null` is answered.

## 5. Gates, CI, and how to verify on this machine

- **`pnpm gate`** (CI `.github/workflows/ci.yml`, Node 24) runs, in order:
  1. `tsc --noEmit`
  2. the claims gate
  3. `node --test`
  4. `next build`
  5. `scripts/check-built-pages.mjs` (reads `.next/server/app/**.html`)
- **Surface Guard** (`.github/protected-surfaces.json`) protects two surfaces:
  - **homepage:** `app/page.tsx`, `components/EmailCapture*`, `components/ArchitectLoopMap*`, `lib/site.ts`;
  - **brand-system:** `app/globals.css`, `app/layout.tsx`, `components/Nav.tsx`, `components/Footer.tsx`.

  A change to either needs a brief in the PR body:
  `Surface:` / `Kind: evolve|rearchitect` / `Intent:` / `Keeps:` ("job: how" for every job) / `Changes:` / `Evidence:`.
  A `rearchitect` change also needs Frank's `surface-approved` label.
- **Review Gate:** every Codex finding on a PR is answered with a fix SHA or "Declined: <reason>".
  - The `review-gate` *job* on `pull_request` often shows a stale failure. The `Review Gate` *status* is what counts.
- **Web excellence:**
  - Before any UI work, read `.claude/skills/web-release-gate/SKILL.md`; the `Skill` tool cannot load it.
  - Run `.claude/ci/web-guidelines-lint.mjs` on changed UI.
  - Do the visual proof at 375, 768 and 1440.
- **Low-RAM local verification.** The workstation is in zone RED: under 4 GiB RAM free, and 42 GiB disk (the floor is 50).
  - Do not run `pnpm install` or `next build` locally.
  - Run tests with `node --test --test-concurrency=1`.
  - Type-check with borrowed types. The scratch `tsconfig` maps `react`, `next` and `@types/node` to `C:/Users/frank/arcanea-ai-app/node_modules/.pnpm/...` and runs `typescript@5.9.3/bin/tsc`.
  - Visual QA: headless Chrome over CDP with **device emulation** and an **absolute** `--user-data-dir`. A relative one hands off to an orphaned Chrome (exit 21), and `--window-size` clips at about 500px.
- **Cross-family review.**
  - Locally: `codex exec -s read-only --skip-git-repo-check "<prompt>" < /dev/null > verdict.md`. Only when free RAM is at least 2.5 GiB (better 3); it uses about 250 MB.
  - Codex's GitHub *code* review quota was exhausted on 2026-10-04 and 2026-10-05; its security review still runs.
- **Vercel.** Team `starlight-intelligence`, project `realityarchitect`. Previews are protected; open them through the Vercel connector (`get_access_to_vercel_url`). A merge to `main` deploys production in about 45 seconds.

## 6. How quality is held (the loop used on 2026-10-05)

`docs/strategy/2026-10-05-AGENT-TEAMS.md` defines seven pods and the rules:

- the outcome ladder (CREATED → CANDIDATE → VERIFIED → DELIVERED);
- the five-line contract;
- the implementer is never the verifier;
- Codex reviews every risky diff;
- the open-PR count never grows.

**Proof of the loop.** PRs #60 and #61 merged with Claude-only review. Then two independent verifiers reviewed them:

- **Codex pass 1:** 1 High, 5 Medium, 2 Low.
- **worker-visual-qa:** 2.11 against a ship bar of 2.3, so "revise".

The fixes landed in #64 through two fix rounds. Codex pass 2 found **0 Critical or High**, and visual QA round 2 scored **2.44, ship**. #64 added `check-built-pages.mjs`, so the closed edition is now verified in rendered HTML on every build.

## 7. All repos and lanes

| Repo / place | State | Next action |
| --- | --- | --- |
| `frankxai/realityarchitect` | `main` `b5e365d`, production. Merged on 2026-10-04 and 05: #38, #43, #47, #48, #50–#53, #55, #57–#64 | Missions below |
| ↳ #56 `/pricing` | Open, green, unmerged | **Frank's button**: merging publishes the plan prices. Rebase onto main first, and keep `PAID_OPEN=false`. |
| ↳ #54 (Codex, Supabase evidence workspace + guardian, +1833, conflicting) | Draft | **Close as superseded** by ADR-001 (Better Auth + Neon, end-to-end encryption). First extract any evidence-ledger ideas into M10's notes, and confirm no live lane owns it. |
| ↳ #44 (Codex, Reality Observatory, +383) | Draft | Triage: fold anything the Library and Patterns lack, then close. |
| ↳ #41 (Cursor, apply CTA in the hero, +2/−1) | Draft | Close: superseded by the new hero (#51). |
| ↳ #39 (waitlist door, +759) | Draft | Triage against `site.vault.status: 'not-open-for-purchase'` and the program funnel; most likely close. |
| ↳ #22 (Antigravity, "Quantum Jump" studio, +6400) | Draft | Close: superseded by Studio and Threshold. Its "quantum" framing conflicts with the doctrine. |
| `frankxai/frankx.ai-vercel-website` | #880 merged (`/manifestation` links to the Studio, Library and Threshold) | |
| ↳ #888 Soulbook: refund policy instead of an outcome guarantee; placeholder testimonials removed | Open, **Review Gate failing**: two Codex P2s unanswered | (1) Match the refund line in `lib/soulbook/soulbook-data.ts:88` to `app/legal/refund/page.tsx` (14 days, under 25% accessed). (2) Remove the contradiction in `lib/soulbook/soulbook-data.ts:134`: the "no outcomes promised" sentence sits under the book selector's "What you'll transform" outcomes (the component in `components/soulbook/` named at `:267-285` in the Codex comment). Rename the heading to something like "What the book covers", or drop the outcomes. Then answer both threads; Frank merges. |
| `frankxai/Starlight-Intelligence-System` | #280 open and CLEAN: registers Reality Architect as an external SIP vertical, adds kernel CI, registry v0.1.2 (`life_domain`, `practice`, `witness_entry`) | **Frank's button** (SIS `main`). It unblocks M10's kernel projection. |
| `C:\Users\frank\brand-assets\realityarchitect\` (local, private) | `products/imaginal-30-complete/audio-scripts/` (14 scripts); `products/imaginal-30-complete/build-2026-10-05/` (journal PDFs, vault ZIP, EPUB); `products/honest-canon/` (16 files, about 34.6k words, fact-checked, with a claims log in `README.md`); `launch/2026-10-imaginal-30/LAUNCH-KIT.md` | M3 |
| Agent OS `C:\Users\frank\.starlight\agent-os\` | `brands/reality-architect.brand.json` lists two gaps | Its "no local checkout" gap is stale (`~/.agent-worktrees/ra-studio` exists). Adding the register to `REGISTER-BOUNDARIES.md` belongs to the `claude-code-config` lane, after its Phase 1. |
| Memory | `~/.claude/projects/C--Users-frank/memory/project_reality_architect.md` | Update it at the close of every session |
| Worktrees | `~/.agent-worktrees/ra-studio` (the current lane), `~/.agent-worktrees/ra-mcp` (merged; safe to remove after confirming that it is clean and its branch is merged) | |

## 8. Verification debts (pay these first)

1. **Codex pass 3 on #64's final commit.** It was memory-reaped. Diff: `git diff 326de85^..b5e365d`, or the round-2 delta alone.
   - Re-run only at ≥ 3 GiB free.
   - Fix anything at Critical or High before new building.
2. **Visual QA leftovers.** Header nav links are 20 px tall (this needs `Nav.tsx`, a brand-system brief), page left edges differ at 1440, and "Why it works" sits above the dawn card.
3. **Polish the closed edition page.** Hide "Every update … at no cost" and the track count while it is closed. Ask Frank: AGENTS.md says not to advertise a paid product until its terms are real.
4. **The Studio has not been browser-tested end to end since #58.** Run the CDP QA script across all seven views at 375 and 1440.

## 9. The greater implementation: twelve missions, with engineering depth

Each mission uses the five-line contract. Work them in order unless Frank reorders them. Pods are from `AGENT-TEAMS.md`. Every mission ends with a CI-green, head-pinned merge, a production probe, and a receipt in memory.

### M1: The program inside the Studio (Experience + Engine)

- **Goal.** The Studio's Today shows "Day N of 30 · <title> · <minutes> min" with the day's intent and a link to its page.
  - "Start the 30 days" stores a start date on the device.
  - The Timeline marks completed days, and day 30 offers the month snapshot.
- **Design.**
  - Add `program?: { id: 'imaginal-30'; start: string; done: string[] }` to `StudioState`. It is optional, so v1 stays compatible: `normalizeState` keeps it and the importer accepts it.
  - The server page `app/studio/page.tsx` reads the day titles and minutes through `readDays()` and passes `programDays` to `<Studio>`, so the client bundle never imports `fs`.
  - The day index is `daysBetween(start, today) + 1`, clamped. Show "Not started", "Day N", or "Complete".
  - Export the program block into `reality/log/<day>.md`. It is not an engine field yet.
- **Done when.**
  - `node --test` covers: before start, day 1, a missed day, day 30, after day 30, an import round trip, and an export that stays engine-valid.
  - Visual QA ≥ 8/10 (the agents' rubric average ≥ 2.3) at 375/768/1440; a production probe.
- **Don't touch.** The homepage surface; the localStorage key.

### M2: A public MCP connector and the Claude directory (Engine + Trust + Growth)

- **Goal.** `app/api/mcp/route.ts` is a remote, read-only MCP endpoint with no account.
  - Tools: `library_search`, `program_day`, `loop_prompts`, `skill_check`.
  - It reuses the engine, the Library data and `lib/programs/*`.
- **Design.**
  - Use the Streamable HTTP transport; stay stateless in an initialize-per-request style, or keep a light session id.
  - Annotate every tool with `title` and `readOnlyHint`, and rate-limit by IP with Vercel's firewall.
  - Write a privacy note, saying no personal data is stored.
  - Prepare the Claude directory package: 3–5 screenshots at least 1000 px wide, a test account (none needed), the privacy and support URLs.
  - In ChatGPT it is a free practice surface only, with no checkout links.
- **Done when.** Protocol tests over HTTP (initialize, list, call, errors), a Codex verdict with no Critical or High, and the submission text in `docs/`. **Frank submits.**

### M3: Launch the Complete Edition (Audio + Commerce + Canon)

- **Blocked on Frank:** Polar organization onboarding, the ElevenLabs key and voice, the music beds, and saying yes to the price.
- **Steps.**
  1. Run `scripts/audio/build.mjs` with ElevenLabs Multilingual v2 (not a beta model), `--voice <id> --music <beds>`.
     - Frank listens to every track. Loudness report: −16 LUFS ±1, true peak ≤ −1.5.
  2. Build the files: `build-vault.mjs --audio`, the book (Pandoc EPUB, plus PDF by headless print or Typst once installable), and the journals.
  3. Follow the steps in `docs/strategy/POLAR-COMPLETE-EDITION.md`: sandbox purchase, file downloads, refund.
  4. Set `checkoutUrl` and `open: true` in a PR. The gates verify it.
- **Done when.** A sandbox order downloads all seven files, they open, the refund works, and the built-pages check passes in the open state.

### M4: Accounts and Studio Cloud (Engine + Trust), per ADR-001

- **Design.**
  - Better Auth with `@better-auth/passkey` 1.7.x on Neon Frankfurt (Frank creates the project and the env vars).
  - Sign-in is passkey-only, using PRF.
  - The browser holds an AES-256 data key, wrapped with HKDF(PRF). A mandatory 24-word recovery key gives a second wrapped copy and an Ed25519 recovery identity.
  - Blobs are AES-GCM-encrypted Studio JSON and images in R2, versioned, with conflict-checked saves reusing the `persist.ts` semantics.
  - Placeholder emails use `<uuid>@users.invalid`.
  - `/.well-known/passkey-endpoints` declares `prfUsageDetails`.
  - Strict CSP and no third-party scripts.
- **Done when.**
  - Unit tests for wrap, unwrap, rotation and recovery, using WebCrypto in Node.
  - An end-to-end test in a preview with a virtual authenticator (CDP `WebAuthn.addVirtualAuthenticator` with PRF).
  - **Codex: no Critical or High.** The threat model is written into the ADR.

### M5: Polar subscriptions and entitlements (Commerce + Engine)

- **Design.**
  - Products: Architect at $19/month or $190/year; Founding Architect at $120/year, capped at the first 1,000.
  - Webhook route: verify the signature, idempotent by event id, then store the customer state.
  - Read entitlements on the server from Polar customer state by external id.
  - Use a credits meter for renders, and check the balance on the server before every call.
  - The portal handles plan changes and cancellation.
- **Done when.** In the sandbox, a subscribe, upgrade, cancel and refund cycle passes. Webhook replay is idempotent. **Frank turns on live mode.**

### M6: Renders and vision boards (Media + Engine)

- **Design.**
  - Nano Banana 2 through the Vercel AI Gateway with zero data retention, behind a monthly cap (Frank sets the key and the cap).
  - Consent on every render. The prompt is built from the person's own scene, using `imagePrompt` in `lib/studio/export.ts`.
  - The result is stored as an end-to-end-encrypted blob, placed on the Map board, and recorded with provenance.
- **Done when.** Cap enforcement is tested, consent is required, the Map board renders, and no prompt is logged on the server.

### M7: Personal rehearsal audio (Audio + Engine)

- **Design.**
  - A Vercel Workflow takes the person's scene and "I am" lines (sent only on "make my track"), builds a script from the same template as the companion, and voices it with a stock voice.
  - The pipeline from `scripts/audio` runs as a function: ffmpeg on Fluid compute, or ElevenLabs only with server-side silence.
  - The track is delivered as an encrypted blob and charged to credits.
- **Done when.** The cost per 10-minute track is ≤ $0.60, the loudness spec passes, the consent copy is shown, and nothing persists on the server after delivery.

### M8: The Obsidian plugin (Engine + Experience)

- **Design.** The zero-dependency engine runs inside an Obsidian plugin (desktop and mobile). It provides:
  - commands: status, due, insights, a snapshot draft;
  - a Today view in a sidebar;
  - a dashboard built on Bases.

  Writes always ask first, as a modal with the exact text.
- **Done when.** It passes the community plugin review checklist, it runs on Obsidian mobile, and the parity test with the CLI passes.

### M9: MCP Apps widgets (Engine + Experience)

- **Goal.** A `ui://` Reality Card and a Today widget, rendered in Claude and ChatGPT from the M2 connector.
- **Done when.** The widgets render in both hosts, it is screenshotted for the directory, and there are no checkout links in ChatGPT.

### M10: Reality across time and the SIS projection (Engine + Canon)

- **Needs:** SIS #280 merged.
- **Design.**
  - A snapshot diff ("reality diff"): Atlas deltas, bridges, the intentions tally over time.
  - A monthly report the person approves.
  - The graph is projected into SIS kernel ids under registry v0.1.2. It is export-only, and the person owns the files.
- **Done when.** Diff tests on sample histories, kernel ID conformance tests, and a monthly report as a draft that only an approval seals.

### M11: Marketplace and the Guide licence (Commerce + Trust)

- **Design.**
  - Paid practice packs via Polar license keys, validated in the plugin. `skill-check` runs in CI for every pack, and creators keep 85%.
  - The Guide licence costs $79 a month for 15 client seats, with consented, revocable views shared through end-to-end-encrypted re-wrapping.
- **Done when.** A pack goes from submit through the bar and the license to install. Consent and revocation tests pass.

### M12: School and spatial (later)

- The School is a six-week cohort built from the Library and the program, with one scholarship for every five paid seats.
- A WebXR vision board for headsets is explored only after the core retains.

## 10. Hard-won lessons

### The machine

- The tool layer decodes `\uXXXX` escapes, and turns `\n` inside Python heredoc strings into raw characters.
  - Write separators with `String.fromCharCode`, and keep sources ASCII.
  - Prefer the Edit tool for any escape-bearing change.
- Branch switches check files out with **CRLF**. Normalize (`split(String.fromCharCode(13)).join('')`) before multi-line string replacement in scripts.
- Git Bash rewrites `/programs/...` arguments into Windows paths. Set `MSYS_NO_PATHCONV=1` when passing URL paths to CLIs.
- Long background commands can be **memory-reaped**. Do not restart them on your own; record them as owed.
- Empty files named after code fragments used to appear in the worktree root. The cause was the old `cmd.exe` impeccable hook, fixed 2026-10-05.
  - To clear any that remain, delete only empty strays: `find . -maxdepth 1 -type f -empty -delete`.

### Next.js and the code

- Prerendered HTML embeds an RSC payload full of `"$1"` references. Content checks must read visible text only, as `visibleText()` does.
- React inserts comment markers between text and expressions (`Do day <!-- -->1<!-- --> in the Studio`). Grep production HTML for fragments, not for whole JSX sentences.
- `gh pr merge --match-head-commit` needs the full SHA.
- Codex re-reviews every pushed head, so batch fixes into one push.

## 11. Receipts (2026-10-05)

- **#60 `d0fb86e`.** The free program went live: 31 pages returned 200, `/31` returned 404, `/complete` was `noindex`, and the sitemap listed 31 entries.
- **#61 `6024653`.** Plugin 0.3.0 with the MCP server is on `main`, and `claude plugin validate` passed for both the plugin and the marketplace.
- **#62 `4729948`.** The Library corrections are live: production shows "fifth graders" and "several, though not all, measures".
- **#63 `4dc06ed`.** The agent teams doc.
- **#64 `b5e365d`.**
  - Every route returned 200 in production.
  - The day 7 format block is a `role="region"`.
  - `/complete` shows "Begin day 1, free" and is `noindex`.
  - CI printed: "✓ built pages: 30 days prerendered; the edition is closed, with no price, checkout or purchase terms, and noindex".

## 12. Kickoff prompt for the next agent (paste as is)

```
You are the Reality Architect lead for frankxai/realityarchitect (worktree C:\Users\frank\.agent-worktrees\ra-studio).
Read docs/handoff/2026-10-05-REALITY-ARCHITECT-HANDOVER.md fully, then AGENTS.md, docs/strategy/2026-10-05-AGENT-TEAMS.md,
the private prompts file it names, and AMBITION-AND-EXCELLENCE.md. Measure free RAM and disk first (zone rules apply).
1) Pay the verification debts in §8 (Codex pass 3 only at >= 3 GiB free). 2) Triage the five old drafts in §7 with a
verdict each (land, fold, or close with a link), checking no live lane owns them. 3) Fix frankx.ai #888's two Codex
P2s and answer the threads. 4) Run M1 through the full loop: five-line contract, TDD, CI green, Codex for risky
diffs, worker-visual-qa >= 2.3 on the preview, head-pinned merge, production probe, memory receipt. Then M2.
Never weaken the claims gate, the registers, or the closed-edition checks. Frank's buttons stay Frank's (§2, §7).
Report only VERIFIED or DELIVERED outcomes, with receipts.
```
