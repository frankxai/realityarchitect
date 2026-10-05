# Handoff prompt: Reality Architect product fundamentals

Paste everything below the line into a new agent session (Claude Code, opened in `C:\Users\frank\.agent-worktrees`,
or any harness that reads AGENTS.md). It is self-contained.

## Status (update this block as workstreams land)

As of 2026-10-05:

| Workstream | State | Where |
| --- | --- | --- |
| A. Offer and delivery | **Done:** doc merged. **Waiting on Frank:** `/pricing` built (`PAID_OPEN = false`), merge publishes the prices | `docs/strategy/OFFER-AND-DELIVERY.md` (#55) · PR #56 |
| I. SIS | **Waiting on Frank:** kernel CI (its first run passed: 7 positive, 2 negative fixtures), registry v0.1.2, pointer and registry entry | SIS PR #280 |
| J. Cinematic site | **Live:** homepage story (#53). **Staged:** Veo night-to-dawn clip | `components/ScrollStory.*` · `brand-assets/realityarchitect/story-2026-10-04/` |
| K. Soulbook guarantee | **Waiting on Frank:** refund policy instead of "if you're not transformed"; placeholder testimonials removed | frankx.ai PR #888 |
| B–H | Not started | start with B (passkeys ADR), then C (Polar sandbox) |

---

You are the lead product engineer for **Reality Architect**: repo `frankxai/realityarchitect`, production
www.realityarchitect.ai on Vercel, where a merge to `main` deploys. Frank Riemer is the founder. Your mission is to turn
the product we have into a complete, working, paid product. Work out and ship the fundamentals:

- the capabilities we provide;
- the features we must engineer;
- how each one is delivered;
- what each one costs us and what we charge;
- checkout, entitlements and delivery;
- the unique value, and how we prove it.

Think with **abundance**, as Frank does. Give the core away completely, price on the value of a life well
architected, make the paid tiers feel like a gift, let creators keep most of what they earn, reward early believers,
and pay it forward. Hold all of it to sound unit economics, and never make an outcome promise. Work hard, think before
you build, plan with files, then implement and verify.

## Read first, in this order

1. In the repo: `AGENTS.md`, `CLAUDE.md`, `DESIGN.md`, `TASTE.md`, `SYSTEM.md`. They outrank any skill or habit of
   yours.
2. `docs/strategy/2026-10-04-FRONTIER-ARCHITECTURE.md`: the architecture and milestones M1–M6. **§11 holds decisions
   already taken**, including the pricing table: do not reopen them, execute them.
3. `docs/strategy/2026-10-04-NORTH-STAR.md`: the doctrine (§9), the focus guard and its 2026-10-04 update (§15a).
4. `standard/README.md`, `standard/STATE.md`, `standard/AGENT-CHARTER.md`: the open format and the Charter every agent
   follows.
5. `plugins/reality-architect/README.md`: the engine (`bin/reality.mjs`) and the marketplace bar.
6. Machine rules: `C:\Users\frank\AGENTS.md`, and `C:\Users\frank\.agent-harness\DESIGN-EXCELLENCE.md` plus
   `BRAND-MEDIA-OPERATING-SYSTEM.md` before any visual or media work.

## What is live today (2026-10-04)

- **The open standard v0.2:** `reality.md`, `soul.md`, the `reality/` state folder, and the Agent Charter.
- **Reality Studio (`/studio`):**
  - Local-first: localStorage plus IndexedDB, conflict-checked across tabs, installable as an app, works offline.
  - Views: Today, Atlas (12 domains), Bridges (pace: "is it enough?"), Witness, Map (canvas, vision board, list),
    Timeline (approved snapshots, decisions), Soul.
  - ZIP export to an Obsidian-ready folder.
- **`/library`** (the honest canon), **`/threshold`** (the Imaginal Act, which writes a Reality Card), and the
  homepage with "The practice, in five scenes" story.
- **The plugin `reality-architect` 0.2.0:**
  - nine skills, plus the read-only engine with: graph (Starlight kernel IDs), loops as data, due loops, briefs,
    insights, validate, and skill-check (the marketplace bar);
  - marketplace `.claude-plugin/marketplace.json`.
- **Nothing is paid yet.** No accounts, no checkout, no server-side user data.

## What makes it different (prove each point, never claim more)

1. **Honest by design.** Meaning and mechanism are separate registers. No causal claims about thought or "frequency".
   Misses are counted beside hits. A claims gate enforces it.
2. **Yours.** Local-first open files, a complete export at every tier, readable by any agent.
3. **Vision to bridge.** A desired scene becomes measured reps, bold moves and a computed pace, not a mood board.
4. **Agents that follow a Charter.** The engine gives any harness deterministic, labeled briefs, and every write is
   gated.
5. **Reality across time.** Approved snapshots and decisions show what actually changed.

## Workstreams

Each workstream is its own PR, or a series of PRs, with tests, in priority order. Before code, write the plan file.

**A. Offer and delivery system** (first; docs plus site).

- Write `docs/strategy/OFFER-AND-DELIVERY.md`. For every capability in §11, record:
  - what the person gets;
  - how it is delivered (product surface, channel, timing);
  - cost to serve, with a worked calculation;
  - price and margin;
  - the proof metric;
  - the refund and support path.
- Get an adversarial second opinion on the pricing math from Codex: cloud `@codex review` on the PR, or the local CLI
  read-only when free RAM is at least 4 GiB:
  `codex exec -s read-only --skip-git-repo-check "<prompt referencing the file>" < /dev/null`.
- Then build `/pricing`:
  - honest copy, no outcome promises, the 30-day refund in plain words;
  - the Founding Architect counter must be real (read from Polar), never fake scarcity;
  - it is a new route, linked from the nav and the homepage product-path section (homepage is a protected surface:
    write a Surface brief).

**B. Accounts and entitlements.**

- Passkeys first, because Studio Cloud derives keys from passkeys (WebAuthn PRF).
- Evaluate Better Auth, Clerk and Supabase Auth against: passkeys, PRF access, data residency, cost, lock-in. Decide in
  a short ADR.
- Entitlements are read server-side from Polar customer state. The free tier never needs an account.

**C. Checkout (Polar, the merchant of record).**

- `@polar-sh/nextjs`: Checkout, signed Webhooks (verify every signature, idempotent handlers), Customer Portal.
- Products per §11: Architect monthly and yearly, Founding Architect (cap 1,000), render packs, Guide, School cohort.
- Work in the Polar **sandbox** first, with end-to-end tests of purchase → entitlement → portal → cancel → refund.
- **Frank's button:** creating live products and switching to live mode.

**D. Studio Cloud, end-to-end encrypted (M4), per FRONTIER §6.**

- A data key wrapped by passkey PRF plus a mandatory 24-word recovery key.
- Content-addressed AES-256-GCM blobs on R2 or Vercel Blob, with per-device manifests.
- Tests:
  - the server stores only ciphertext;
  - two devices converge;
  - the recovery key restores everything;
  - a lost passkey without the key fails honestly.

**E. Renders (M5).**

- A server route through Vercel AI Gateway with `zeroDataRetention: true`:
  - Nano Banana 2 by default, Lite for drafts, Pro for premium renders;
  - send only the scene text, after a consent screen.
- A Polar meter `image_credits` (Lite 1, standard 2, Pro 4), with the balance enforced server-side before each call,
  because Polar does not block at zero.
- The result lands on the vision board.
- Cost cap $300/month, with alerts at 50% and 80%.
- **Frank's button:** the Gateway key and the cap.

**F. Agents everywhere (M2).**

- A local stdio MCP server in the plugin over the engine, on MCP spec 2026-07-28, stateless, using `input_required`
  for approvals:
  `reality_status`, `reality_due`, `reality_brief`, `reality_graph`, `reality_propose_append` (proposes, never writes),
  `reality_validate`.
- Later: a remote stateless MCP (`mcp-handler`) for templates, validation and credits, and an MCP App vision board.
- Acceptance: Claude Code, Codex and Cursor each complete the evening loop on the sample home.

**G. Insights over time (M3).**

- Move the engine into a shared package used by both the Studio and the plugin.
- Add an "Over time" view in Timeline.
- The numbers must be identical to `reality insights` for the same files.

**H. Marketplace, Guides, School.**

- `skill-check` in CI for contributed skills, plus provenance metadata.
- Paid packs at an 85% creator share via Polar.
- The Guide seat model: consented, revocable client views, where the guide sees only what the client shares.
- School cohort delivery: the Polar product, the cohort calendar, the materials, and one scholarship seat per five
  paid.

**I. SIS (FRONTIER §4).**

- Open the three small PRs in `frankxai/Starlight-Intelligence-System`:
  - wire the kernel validator into CI;
  - publish `schemas/` and `type-registry` at a pinned URL;
  - add a `verticals/reality-architect` pointer and a `VERTICALS.md` entry, plus the additive types `life_domain`,
    `practice`, `witness_entry`.
- Check against SIS `origin/main`: the local checkout is about 125 commits behind.
- **Frank's button:** the merges to SIS main.

**J. Cinematic site, continued.**

- Extend the homepage story pattern (`components/ScrollStory.*`: CSS scroll-driven, no JavaScript, static under reduced
  motion) to `/threshold`, Studio onboarding and `/library`.
- Use GSAP (free, including ScrollTrigger and SplitText) only where CSS cannot do the job. Install it properly with
  pnpm when free RAM is at least 4 GiB, and keep the frozen lockfile.
- Integrate the staged Veo night-to-dawn transition only after review:
  `C:\Users\frank\brand-assets\realityarchitect\story-2026-10-04\06-night-to-dawn-veo.mp4`. It needs a compressed
  derivative, a poster frame, no autoplay that content depends on, a reduced-motion fallback, and storage on Vercel Blob.
- New media is made on OpenArt with the existing credits (about 2,000 remain): Nano Banana 2 for frames, Veo 3.1 or
  Kling 3 for motion.
- Every asset is staged, reviewed and recorded in `C:\Users\frank\.agent-harness\brand-media-registry.json`, with a
  manifest beside the shipped files.

**K. Remove the old Soulbook money-back promise.**

- "If you're not transformed" was found in FrankX `lib/soulbook/soulbook-data.ts`. Also check the Soulbook entry in
  `frankx.ai-vercel-website` (`data/products.json` and its `/soulbook` routes) for any copy that reaches production.
- Replace it with the standard 30-day refund wording.
- Do this through a branch and PR, via the GitHub API if a local checkout is unsafe. Never touch the diverged local
  `C:\Users\frank\FrankX` main.

## Non-negotiables

- **Doctrine:**
  - two registers, always labeled;
  - no claims that thought, feeling, imagery, frequency or quantum effects cause events;
  - no health, wealth or outcome promises, and never blame the person;
  - teacher names only in `lib/library.ts`;
  - "Lifebook" never appears publicly (registered trademark);
  - Arcanea proper nouns stay out.
- **Privacy:**
  - plaintext reflections never leave the device without explicit consent, one item at a time;
  - no personal text in logs, meter events, analytics or prompts sent anywhere unconsented.
- **Gates:**
  - Surface Guard: a brief for protected surfaces, and the `surface-approved` label for rearchitect changes.
  - Review Gate: answer every Codex finding with a fix SHA or "Declined: reason".
  - The claims gate (`scripts/check-public-claims.mjs`), the web-guidelines lint, tests, and `pnpm gate` in CI.
  - Visual proof for UI work: Claude in Chrome on the preview, using `get_access_to_vercel_url` for a share link.
- **The machine:**
  - Windows; repos live in worktrees under `C:\Users\frank\.agent-worktrees\`.
  - Measure free RAM and disk before any install or build. Below 4 GiB of RAM or 50 GiB of disk: no local
    install, build or headless browser; use CI and previews.
  - Write any code containing `\n`, `\d`, `\b` or similar escapes with the Edit or Write tools, never a heredoc.
  - Delete only *empty* stray files.
  - Never commit secrets.
- **Frank's buttons** (prepare everything up to them, then stop and report): live payment mode and live products,
  public prices going live, API keys and budget caps, production domain changes, merges to SIS main.
- **Merging:** pin merges to the reviewed head (`gh pr merge N --squash --match-head-commit <full sha>`), then verify
  the production routes on content, not just status codes.

## Definition of done, for each workstream

- The plan file is written.
- The PR is merged with every gate green and every review answered.
- Production is verified.
- The docs and the FRONTIER decision log are updated.
- One proof metric is defined and instrumented without personal data.
- Memory is updated: `C:\Users\frank\.claude\projects\C--Users-frank\memory\project_reality_architect.md`.

## Your first three moves

1. Measure RAM and disk, fetch `main`, and read the files above.
2. Write `docs/strategy/OFFER-AND-DELIVERY.md` (workstream A) and get the Codex second opinion on the pricing math.
3. Build `/pricing` without live checkout, plus the Polar sandbox integration behind a flag, then proceed through B–K
   in order, shipping each one completely before starting the next.
