# Frontier architecture, moat, and the engine — 2026-10-04

Status: a proposal for Frank's decisions, plus a record of what ships now (milestone M1, in the PR that adds this
file). It answers his question of 2026-10-04: "Suggest all what we need and where, and if it should be in the main
branch of SIS or a module, and explain image gen, Studio Cloud, Pro options, what we could build and how, and the
smartest frontier architecture." It also covers his named main focus: "the skill marketplace, workflow, graph
engineering, the loop design, the agentic execution in the second brain, and depth."

Prices and product facts were checked on 2026-10-04; sources are at the end. A figure marked *3P* comes from a third
party and was not confirmed on the vendor's page.

## 0. The answers on one screen

| Question | Recommendation | Where it lives | Frank's button |
| --- | --- | --- | --- |
| SIS main or a module? | The kernel is already on SIS `main` (merged 2026-09-06, `3f9f53e`). Do not move it. Reality Architect becomes an external, public SIP vertical (the Gravity Engine pattern), and its graph projects into the kernel's IDs. | RA: format, engine, Studio. SIS: doctrine, kernel, optional power engine. | Approve three small SIS PRs (§4). |
| Graph | One typed graph built from the person's files: kernel IDs, kernel types and relations, and a label on every node. **Shipped in M1.** | `plugins/reality-architect/engine/` | none |
| Loops and agent execution | Loops as data, with deterministic "what is due" and briefs that quote the Charter. The agent proposes and the person approves. **Shipped in M1.** | engine and the `reality-loop` skill | none |
| Skill marketplace | The marketplace bar (`skill-check`) is **shipped in M1**. Next: CI on contributions, then publishing to agentskills.io, skills.sh and Anthropic's directory. | `.claude-plugin/marketplace.json` | Approve outside contributions and paid packs (§9). |
| Image generation | Nano Banana 2 at 1K by default, Lite for drafts, Pro as a premium render. Route through AI Gateway with zero data retention, send only the scene text, ask for consent each time. Video later (Veo 3.1 Lite). | a server route, M5 | Provider, monthly budget cap, consent copy. |
| Studio Cloud | End-to-end encrypted file sync. A passkey (WebAuthn PRF) plus a 24-word recovery key wrap a key made on the device; content-addressed AES-256-GCM blobs live on R2. No CRDT in v1. | M4 | Approve before any account system exists. |
| Pro and offers | Free (everything local), Pro (sync, insights over time, monthly credits), one-time credit packs, then Guide seats and the School. | Polar (merchant of record) | Prices, refund terms, and the go date. |
| Agent runtime | Vercel Workflows + AI SDK 7 `WorkflowAgent`: cron → propose → wait for approval → apply, with **no plaintext in run state**. | M2 (cloud loops are a paid opt-in) | none until Pro |
| MCP | A local stdio MCP server in the plugin for private data; a remote stateless server for non-private operations; an MCP App vision-board viewer. | M2 and M5 | none |
| Names | Weave them, don't retire them; keep "Lifebook" out of every public name (registered trademark). §10. | docs, then product copy | Pick the weave. |

## 1. The moat, and how value is captured

The open files are the way in, not the moat. People will only trust a tool with their inner life if they can always
take everything with them, so export stays free and complete at every tier. The moat is what reads and shows those
files better than anything else:

1. **Insights over time.** Approved snapshots, witness entries, decisions and pace accumulate into a history. The
   engine turns that history into counted patterns, such as reps per week, primed against unprimed signs, look-for
   hits and misses, and how decisions turned out. They get better with every month a person keeps, and nobody can
   fake them without that person's data. M1 ships the first counts (`reality insights`); M3 brings them into the
   Studio.
2. **Our own interfaces:** Studio, the canvas, the vision board, the timeline, in our design register (blueprint for
   the system, dawn for the person's words). Installable on phones as of PR #51; native later through App Studio;
   immersive (VR/AR) when demand is real. Obsidian stays an export target, not the home screen.
3. **Visual generation:** images and short video from the person's own scenes, sold as credits.
4. **Canon, school and guides:** the honest Library is rare in this category. Certified guides use the Studio with
   clients: network effects, plus a marketplace that takes a commission on practices, templates and skills.
5. **The open standard:** `reality.md` and `soul.md` readable by every agent. Distribution, not lock-in.

| Tier | What | Captures value through |
| --- | --- | --- |
| Free | Standard, Library, local Studio, plugin and engine, complete export | Adoption, trust, the email list |
| Pro | Encrypted sync across devices, insights over time, monthly image credits, cloud loops (opt-in) | Subscription |
| Credit packs | More images and video | One-time purchases |
| Guide | Seats with consented client views, a practice library | Per-seat subscription |
| School | Cohorts on the Library and the practice | Cohort fee |
| Marketplace | Paid practice packs and skills from certified creators | Commission |

## 2. The architecture

The plaintext of a person's reflections lives only on their devices and in tools they run. Everything else either
carries ciphertext or carries one consented item at a time.

```text
THE PERSON'S DEVICES (plaintext lives only here)
  Reality Studio (browser storage)  ─┐
  Claude Code + plugin engine        ├─  the open files: reality.md · soul.md · reality/  (source of truth)
  Obsidian (desktop and phone)      ─┘
        │ ciphertext only: data key wrapped by passkey PRF and a recovery key            (M4)
        ▼
  Studio Cloud: R2 blobs plus per-device manifests; we cannot read them
        │ one consented scene or brief at a time, zero data retention                   (M5)
        ▼
  AI Gateway → images (Nano Banana 2) and text models · Polar meters credits (events carry no content)
  Vercel Workflows → "your weekly loop is ready" push → the device decrypts and proposes → the person approves (M2)
  Remote MCP (stateless): templates, validation, credits · MCP App: vision board inside Claude and ChatGPT
  SIS (optional): the reality graph projected by kernel ID; sis_* tools for recall and goals
```

Each layer can be swapped without moving the line where plaintext is allowed: Loro for sync, Cloudflare for the
runtime, Graphiti-style extraction for the graph.

## 3. The engine and loops, built now (M1) and next

**Shipped in M1** (this PR): `plugins/reality-architect/engine/` and `bin/reality.mjs`, with no dependencies and
Node 18 or newer.

- **Parse:** reads the open format as exported and as written by hand. A test exports the sample life with the
  Studio's own exporter and reads it back completely. Misses count as misses.
- **Graph:**
  - Node types: self, domain, aim, scene, rep, move, skill, system, person, place, witness, day, snapshot, decision.
  - IDs follow `ra:<type>:<key>`. Kernel object types (v0.1.1) are mapped. Relations come only from the kernel's list.
  - Every node is labeled desired, reported, planned, done, meaning, or computed. A scene can never be read as a fact.
- **Loops:** morning, evening, weekly, monthly, decisions, pace.
  - Each declares its cadence, steps, the files it may write, its gate (ask before writing, or seal on approval), the
    Charter articles it applies, and the skill that runs it.
  - `due()` decides deterministically, and gives a reason.
- **Brief:** the context an agent reads before a loop. It quotes the Charter articles verbatim from the bundled
  `CHARTER.md`, then gives the steps, the gate, the writable files, and the labeled state.
- **Insights:** counts over time, never causes.
- **Validate:** the files against STATE.md, with file and line.
- **Skill check:** the marketplace bar (§9).
- **Skills:**
  - New: `reality-loop`, which runs the loop that is due, one at a time, asking before every write.
  - The five loop skills now start from the engine's brief.

The engine also found and fixed one export bug: snapshot bridge lines were double-bulleted.

**Next:**

- **M2, agents everywhere:**
  - A local stdio MCP server in the plugin over the same engine (spec 2026-07-28, stateless; `input_required` for
    approvals), with tools: `reality_status`, `reality_due`, `reality_brief`, `reality_graph`,
    `reality_propose_append` (returns a proposal, never writes), `reality_validate`.
  - A projection of the graph into kernel RealityObjects, validated against the SIS kernel schemas.
  - Acceptance: an agent in Claude Code, Codex and Cursor completes the evening loop on the sample home without
    reading raw files.
- **M3, insights over time in the Studio:**
  - Move the engine into a shared package that the plugin and the Studio both import.
  - An "Over time" view in Timeline: reps per week, look-for tally, primed/unprimed, Atlas movement.
  - When data outgrows localStorage: OPFS plus SQLite-Wasm with a bitemporal `nodes`/`edges` index and recursive CTE
    queries.
  - Acceptance: identical numbers in the Studio and `reality insights` for the same files.
- **M4, Studio Cloud** (§6). Acceptance: two devices converge, and a server dump shows only ciphertext.
- **M5, vision credits** (§5) and the MCP App vision board. Acceptance: one consented render per scene, the credit
  balance enforced server-side, no reflection text in any log or event.
- **M6, open marketplace and guides** (§9).

## 4. SIS: main or module (corrected)

Facts, checked 2026-10-04:

- **The kernel is already merged.** GENESIS, ADR-000, six schemas, the type registry and fixtures were squash-merged
  to SIS `main` on 2026-09-06 (`3f9f53e`, PR #133, consolidating PRs #85 and #87). North Star decision 7 assumed it
  was unmerged. The local SIS checkout is 125 commits behind `origin/main`, which is what misled it.
- **SIS is public and MIT-licensed.** `LICENSING.md` plans an Apache-2.0 protocol layer and an FSL or proprietary
  hosted layer.
- **A vertical needs:** `SKILL.md`, `MEMORY.md` and a `VERTICALS.md` entry, optionally `mcp.json` and a Foundry
  manifest. Gravity Engine is the precedent: pointer-only inside SIS, a separate public MIT repo, runs without SIS.
- **What SIS can already do:** SQLite keyword and hybrid retrieval, partial temporal validity (not yet bitemporal),
  a work graph and loop engine, and 13 `sis_*` plus 4 `starlight_*` MCP tools. Its graph contract forbids a second
  memory product and per-domain graphs unless they project into SIS. Our graph is exactly such a projection.

Recommendation: keep the kernel in SIS as the doctrine. Make Reality Architect an external public SIP vertical that
owns the open format and the engine, mapped one way into kernel IDs:

- Bridge → FutureBranch + ActualizationPlan
- Atlas gap → RealityDiff
- Witness → a self-reported ActualizationReceipt

Reality Architect never requires SIS; SIS is the optional power engine. Three small SIS PRs, for review:

1. Wire `scripts/validate-reality-architecture-kernel.py` into SIS CI.
2. Publish `schemas/` and `type-registry` at a pinned public URL or as a package, so this repo can test against them
   instead of copying gap classes.
3. Add `verticals/reality-architect/README.md` (pointer only) and a `VERTICALS.md` entry, plus additive registry types
   `life_domain`, `practice` and `witness_entry` (today they map to `other`, `capability` and `event`).

## 5. Image and video generation

| Model | Price per image (standard) | Use |
| --- | --- | --- |
| Nano Banana 2 Lite `gemini-3.1-flash-lite-image` | $0.0336 at 1K | drafts |
| Nano Banana 2 `gemini-3.1-flash-image` | $0.067 at 1K, $0.101 at 2K | default |
| Nano Banana Pro `gemini-3-pro-image` | $0.134 at 1–2K | premium render |
| OpenAI `gpt-image-2` | about $0.01–0.22 by quality *3P* | fallback |
| FLUX.2 [pro] | from $0.03 | style option (no zero data retention outside enterprise) |

- **Route** through Vercel AI Gateway with `zeroDataRetention: true` per request. Gateway adds no token markup.
  Google Vertex and OpenAI are on its zero-data-retention list.
- **Privacy:**
  - Never use a free tier, where prompts may be reviewed by humans.
  - Send only the scene text, never the journal, after a one-time consent note and a per-render confirmation.
  - Gemini images carry a SynthID watermark.
- **Video:** Veo 3.1 Lite at $0.05–0.08 per second (an 8-second clip costs $0.40–0.64). Defer it until images prove
  themselves. OpenAI shut down the Sora 2 API on 2026-09-24.
- **Credits:** one Polar meter, `image_credits`, weighted Lite 1, standard 2, Pro 4. Check the balance on the server
  before each call; never put reflection text in meter events.

## 6. Studio Cloud (end-to-end encrypted)

- **Keys:**
  - A random 256-bit data key is created on the first device.
  - It is wrapped by a key derived from each device's passkey (WebAuthn PRF), and by a mandatory 24-word recovery key.
  - PRF works with iCloud Keychain, Google Password Manager and Windows Hello in current browsers. Gaps: Bitwarden on
    iOS Safari, Dashlane, NordPass. A lost passkey without the recovery key means lost data, and the product says so
    plainly.
- **Data:**
  - Each changed file becomes a content-addressed AES-256-GCM blob on Cloudflare R2 ($0.015 per GB-month, no egress
    fees), plus an append-only manifest per device. Paths are encrypted too.
  - Merging: last writer wins per file, a three-way merge for Markdown, and conflict copies otherwise.
- **New device:** a QR handoff or the recovery key. No server-side key escrow.
- **No CRDT in v1.** Move to Loro with its `%ELO` end-to-end encryption only if live co-editing ships (guides with
  clients).
- **The Obsidian export stays the person's own plaintext backup.**

## 7. Pro and offers (proposal; prices are Frank's)

- **Free forever:** the standard, the Library, the local Studio, the plugin and engine, and the complete export. A
  paid tier never takes a capability away from free users.
- **Pro:** sync, insights over time across devices, monthly image credits, cloud loops (opt-in, sealed to the person's
  key). Offered monthly and yearly.
- **Credit packs:** one-time.
- **Guide:** seats with consented client views, launching after Pro has retained users.
- **Polar:**
  - Fees: Early Member rate 4% + 40¢ (+0.5% on subscriptions) for organizations created before 2026-05-27; otherwise
    5% + 50¢, or 3.8% + 40¢ on the $20/month plan; +1.5% for non-US cards.
  - Integration: `@polar-sh/nextjs` for checkout, the customer portal and webhooks. Customers are keyed by
    `external_customer_id`.
  - **Polar does not block usage at zero balance.** Enforce it on our side.
- **Copy rules:** no outcome promises, no "transformed or your money back" (the old Soulbook copy breaks this). Refund
  terms are written before checkout exists.

## 8. Agent and loop runtime

- **Choice:** Vercel Workflows (GA since April 2026: durable steps, unlimited sleep, cron; $0.02 per 1,000 events) with
  AI SDK 7 `WorkflowAgent`, using `needsApproval` and HMAC-signed approvals. A daily five-step loop costs about $0.012
  per user per month in events; model tokens dominate.
- **The catch:** Workflows records run inputs and outputs, and team owners can read them. So:
  - The cron step only sends "your weekly loop is ready".
  - The device decrypts, calls a zero-data-retention Gateway route, and stores the proposal encrypted.
  - Unattended cloud loops are a paid opt-in on a scoped brief, with the output sealed to the person's public key.
- **Fallback:** Cloudflare Workflows and the Agents SDK.
- **Locally**, the same loops already run today through Claude Code and the `reality-loop` skill, at no cost and with
  nothing leaving the machine.

## 9. The skill marketplace

- **The bar (shipped as `reality skill-check`, enforced by tests on every bundled skill):**
  - the Agent Skills `SKILL.md` format with a quoted description;
  - the Charter preamble;
  - no outcome promises or causal claims;
  - no teacher names outside the Library data;
  - no paths an installed plugin cannot reach;
  - asking before any write.
- **Distribution:** our marketplace (`frankxai/realityarchitect`) first, then agentskills.io (46 clients, including
  Codex, Gemini CLI, Cursor and Copilot), skills.sh, and Anthropic's plugin directory. A skill written once runs in
  every harness that reads `SKILL.md`.
- **Next:**
  - `skill-check` in CI for contributed skills.
  - Provenance in `pack.meta.yaml`, following ACOS (author, licence, version, checksum).
  - Evals: a promptfoo suite per skill that replays the sample home and checks that the agent keeps labels and asks
    before writing.
- **Paid packs** (practice packs by certified guides) only after the bar, provenance and refund terms exist.
- **Depth:** for each loop, a pack of variants (the gentle, direct and challenging voices of `soul.md`), and domain
  practice packs for the twelve Atlas domains, all held to the same bar.

## 10. The names: woven, each keeping its meaning

What each name meant (from the vault, memory and repos):

- **Lightbook** (coined 2026-03-21, "Author your life in light"): the *measuring* instrument. Domains, luminosity, a
  quarterly rhythm. Frozen at v0.1.
- **Agentic Lifebook:** the open *protocol* layer beneath it.
- **Soulbook:**
  - "The Creator's Soulbook" (a free FrankX product: seven pillars and three lenses for artists, seekers and
    builders);
  - Frank's private book;
  - a separate spiritual-AI product (Linear P-ARC-21) for pastors and spiritual directors.
- **GenCreator soul.md:** a creator's seven-dimension operating file.

Proposed weave:

| Name | Becomes | Keeps its meaning as |
| --- | --- | --- |
| Lightbook | The name of the measuring view: the Atlas and snapshots over time ("your Lightbook") | the instrument that measures your life in light |
| Agentic Lifebook | Described publicly as "the agentic layer" of the open standard (`reality.md` + `soul.md` + engine) | the protocol beneath the instrument |
| Soulbook | The inner Meaning register: `soul.md` and a person's private writing, never public data | the book your soul writes |
| Soulbook's three lenses | Onboarding paths (artist, seeker, builder), not paid tiers | three ways in |
| Spiritual-AI Soulbook | A separate product, renamed so it does not share the inner layer's name | its own audience |

**Trademark:** "Lifebook" is a registered US trademark (USPTO #86271363; the vault records Jon Butcher and Mindvalley
inconsistently). Memory says never to use it publicly, so "Agentic Lifebook" stays internal and is described as "the
agentic layer" in public. "Lightbook" needs a clearance search before any public use. Arcanea's Guardian and Hz
mappings stay out of Reality Architect (register boundary).

## 11. Decisions for Frank

This list supersedes North Star §15 items 7 and 10.

1. **SIS:** approve the three small SIS PRs (§4), and Reality Architect as an external public SIP vertical.
2. **Image generation (M5):** the provider (recommended: Nano Banana 2 through AI Gateway with zero data retention), a
   monthly budget cap, and the consent copy.
3. **Studio Cloud (M4):** go or not, and whether the recovery key is mandatory (recommended: yes).
4. **Pro:** prices, the monthly and yearly split, refund terms, the start date. Nothing is charged before you approve.
5. **The marketplace:** open it to contributors (CI bar plus provenance), and when to allow paid packs.
6. **The names (§10):** pick the weave, and run a trademark clearance on "Lightbook" before public use.
7. **The Soulbook money-back promise:** remove "if you're not transformed" from the old Soulbook copy in the FrankX
   repo (it breaks the no-outcome-promise rule).

## Sources

- Gemini pricing and image generation: https://ai.google.dev/gemini-api/docs/pricing · https://ai.google.dev/gemini-api/docs/image-generation · terms https://ai.google.dev/gemini-api/terms
- OpenAI pricing, data and Sora status: https://developers.openai.com/api/docs/pricing · https://developers.openai.com/api/docs/guides/your-data · https://developers.openai.com/api/docs/models/sora-2
- BFL FLUX.2 pricing: https://docs.bfl.ai/quick_start/pricing · Recraft: https://www.recraft.ai/docs/api-reference/pricing
- Vercel AI Gateway (image, video, ZDR, pricing): https://vercel.com/docs/ai-gateway/modalities/image-generation/ai-sdk · https://vercel.com/docs/ai-gateway/modalities/video-generation · https://vercel.com/docs/ai-gateway/capabilities/zdr · https://vercel.com/docs/ai-gateway/pricing
- Passkeys PRF support: https://www.corbado.com/blog/passkeys-prf-webauthn · Loro E2EE: https://github.com/loro-dev/protocol · Evolu: https://github.com/evoluhq/evolu
- Storage: https://developers.cloudflare.com/r2/pricing/ · https://vercel.com/docs/vercel-blob/usage-and-pricing
- Vercel Workflows: https://vercel.com/docs/workflows · https://vercel.com/docs/workflows/pricing · AI SDK 7: https://vercel.com/blog/ai-sdk-7
- Cloudflare Workflows and Agents: https://developers.cloudflare.com/workflows/reference/pricing/ · https://developers.cloudflare.com/agents/
- MCP 2026-07-28 and extensions: https://modelcontextprotocol.io/specification/2026-07-28/changelog · https://modelcontextprotocol.io/docs/extensions/overview · mcp-handler: https://vercel.com/changelog/latest-mcp-spec-now-supported-in-mcp-handler
- Claude Code plugins: https://code.claude.com/docs/en/plugins-reference · https://code.claude.com/docs/en/discover-plugins · Agent Skills: https://agentskills.io
- Graph engines: https://github.com/getzep/graphiti · https://www.thoughtworks.com/radar/platforms/graphiti · https://github.com/kuzudb/kuzu (archived) · SQLite WITH: https://sqlite.org/lang_with.html · SQLite-Wasm OPFS: https://sqlite.org/wasm/doc/trunk/persistence.md
- Polar: https://polar.sh/resources/pricing · https://polar.sh/docs/features/usage-based-billing/credits · https://polar.sh/docs/integrate/sdk/adapters/nextjs · https://polar.sh/docs/features/customer-portal
- SIS facts: `frankxai/Starlight-Intelligence-System` main `12d794a` (2026-10-02); kernel merge `3f9f53e`; registry `docs/reality-architecture/type-registry.v0.json` v0.1.1.
