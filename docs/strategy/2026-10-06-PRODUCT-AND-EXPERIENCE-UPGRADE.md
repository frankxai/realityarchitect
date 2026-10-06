# Reality Architect: product and experience upgrade
Date: 2026-10-06
Status: proposed execution plan; pricing, hosted services and visual directions are recommendations, not shipped promises.
Owner: Frank Riemer. Repository: frankxai/realityarchitect. Implementation baseline: ff60a7564bb59021bbd266f6dc8858041b89523e.

## Decision
Build a premium local-first software product around Reality Studio, owned practice editions and installable agents. The customer is a creator or founder turning a desired future into actions and an honest record, using tools and agents they already have.

The signature experience is scene → bridge → action → evidence → approved review. Chat is an aid within this loop, not the product's homepage or sole interface. The moat is a coherent portable state contract, useful practice content, trustworthy longitudinal evidence and exceptional execution.

A conventional hosted SaaS is a later option. First establish repeated use, willingness to pay and a clear reason for hosted data. This follows the direction recorded in ADR-003; that ADR remains proposed and deserves an explicit founder decision. This plan does not authorize uploading personal journals or implementing paid model usage.

## PR cleanup and release receipt
All eleven original open PRs were reviewed. Ten are closed with disposition notes and retained source branches. PR #86 selectively integrated the useful work and was squash merged.

| Original PR | Disposition | Reason |
| --- | --- | --- |
| #82 | Integrated through #86 | Local ICS calendar export |
| #83 | Integrated through #86 | 30-day program inside Studio |
| #84 | Integrated through #86 | Named rep receipts and STATE v0.3, legacy snapshot compatibility |
| #69 | Partially integrated through #86 | Next 16.3.8, React 19.3.0, Node 24; analytics excluded |
| #85 | Remains draft | Public read-only MCP needs verified platform rate limiting and client smoke tests |
| #56 | Closed, superseded | Unbuilt subscription, credit and payout commitments |
| #54 | Closed, superseded | Hosted observatory conflicts with current direction; incomplete live auth/provider verification |
| #44 | Closed, separate vertical | City study belongs in a separately scoped product |
| #41 | Closed, superseded | Old homepage CTA |
| #39 | Closed, superseded | Duplicate waitlist capture; atomic idempotency/error handling gaps |
| #22 | Closed, superseded | Legacy schema fork and unsupported quantum/health/wealth claims |

Tested tree: b9d3cde561d9a5bc1c7a2cdb21f99e7b6429ef25, identical to the merged main tree.
Local full gate: typecheck, claims, 268 tests, production build and emitted-page checks pass. CI, Web excellence, estate guard, Surface Guard and Review Gate pass. Estate scan: zero critical/high, two medium and six low, unchanged from baseline.
Exact-head Vercel preview was READY. Browser checks: start program, mark day done, reload retains progress. No application console errors observed; extension errors were excluded.
Automated Codex code review reported a usage limit; no independent automated approval is claimed. Security review was still running when inspected, with merge gate disabled. Mobile viewport QA remains unverified in this session.
#85 was tested separately in a 282-test combined suite, but Vercel firewall read/write returned 404 Seawall Config not found. No public endpoint was deployed by #86.
Closing #54 does not remove any database infrastructure previously applied outside its branch. Audit those resources separately before changing them.
Issues #71, #72, #74 and #75 are completed. #73 remains the MCP work item.

## What the current experience needs
Desktop homepage and Studio were directly inspected; responsive source was reviewed but new mobile screenshots were not captured.
The homepage has ten navigation destinations plus GitHub, competing practice and AI-assessment journeys, and a code excerpt where a visitor needs product proof. Studio's three onboarding doors lead into many fields and seven views before establishing the first outcome.
The Threshold-to-Studio handoff should carry the authored scene directly through an explicit local action. Avoid making people download and import to continue the same session.
The current JSON backup does not include image bytes; the complete ZIP export needs a supported image-inclusive restore path. A premium product must demonstrate full recovery before offering sync.

Use one primary front door: “Build your first bridge.” Secondary: explore a fictional example. Put Method, Library and Editions in a compact navigation; developer standard, privacy and ecosystem references belong in appropriate secondary locations. Retain the AI systems assessment as a coherent optional path.

## Exactly three visual directions
| Direction | Composition and materials | Product role |
| --- | --- | --- |
| A. Dawn Atelier — recommended | Graphite room transitioning into soft dawn, warm vellum, restrained copper/glass details, generous editorial type | One cinematic scene beside a real editable bridge; human meaning with precise instruments |
| B. Reality Instrument | Crisp graphite/blueprint canvas, modular panels, high information clarity, minimal imagery | Product-first bridge/map demonstration with visible state and evidence |
| C. Field Journal | Warm paper, photographic field notes, ink annotations, quiet archive rhythm | An approachable practice journal, strongly editorial and tactile |

Choose A as the primary identity. Its Studio still uses precise instruments from the existing meaning/mechanism distinction; do not create a second disconnected brand. Keep dawn for desired meaning and blueprint for planned/computed mechanisms. Reported facts, personal interpretations and approved evidence stay visibly distinct.
Retain existing serif/sans/mono roles until a focused typography audit verifies source, licensing, weight coverage and readability. Reduce all-caps mono in long prose. Unify tokens, spacing, radii, focus, error, empty, loading and recovery states before decorative expansion.

### GSAP motion contract
The current SYSTEM.md specifies a CSS-only track. Change that contract deliberately before installing GSAP.
Use route-scoped GSAP with @gsap/react useGSAP, scoped selectors and cleanup. Use matchMedia for desktop/mobile and prefers-reduced-motion. CSS remains appropriate for buttons, focus and ordinary feedback.
One signature sequence, “Bridge resolves”: the reported starting point and desired scene establish themselves, then one planned action connects them, and a real evidence card settles into the review. Motion explains the relationship.
No scroll hijacking. Optional short desktop pinning must retain keyboard reading order and a complete static mobile/reduced-motion version. Content is readable before hydration. Pause decorative movement out of view; animate transforms/opacity, avoid layout work.
Targets to verify on representative devices: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1. Establish a measured JS baseline and require an explicit budget for GSAP/ScrollTrigger before adoption.

### Image generation production brief
Generate original atmosphere and material assets, not fake screenshots, charts or testimonial people.
First asset family: the same creator's room at night and dawn, with consistent desk, camera, objects and restrained light. Produce landscape and portrait compositions with useful text-safe space.
Second family: tactile vellum/glass/copper studies for scene, bridge and archive backgrounds. Third: practice-pack cover system with consistent crop, palette and typographic space.
Start with three candidates for the selected territory, critique at actual mobile/desktop sizes, then produce a small coherent winning set. Record prompts, source inputs, intended use and provenance in a media manifest. Ship responsive AVIF/WebP derivatives and a fast poster; avoid giant decorative video.
Draw exact maps, evidence diagrams and product UI with SVG/CSS and real state. Do not generate them as raster proof.
For customers' own vision imagery, begin with prompts/export or their local agent/provider. Hosted generation is a separate metered product with explicit processing consent.

## First-session and returning-user flow
1. Choose a fictional example or write one ordinary desired scene.
2. Record one fact about now; choose one aim.
3. Build one bridge with a small rep and one dated move; show the mechanism without an Atlas questionnaire.
4. Save visibly on the device and offer a complete backup.
5. Return to Today: one next action, today's program intent, a short witness capture.
6. Review the week: compare reported evidence, interpretation and missed expectations; explicitly approve a snapshot.
7. Connect an agent only when it can help with the next concrete task.

Progressively reveal Atlas, maps and Soul. Preserve advanced functionality behind contextual routes. No compulsory account, long setup, guilt-based streaks or AI-generated certainty.
Acceptance: first authored bridge is saved, reload works, a backup restores on a fresh profile, the user can find the next action and understand what leaves their device.

## Platform foundations
Keep Next.js/React/TypeScript and one canonical practice engine. Share versioned domain contracts between Studio, CLI and MCP rather than forking business rules per adapter.
Move durable structured state toward transactional IndexedDB with revisions and documented migrations; current localStorage conflict detection is not an atomic multi-tab transaction. Use a write lock/revision check and BroadcastChannel notification. Preserve backward compatibility and export parity.
Build a complete backup/restore bundle including images, manifest, schema version and checksums. Validate file paths, media types, byte limits and references; offer preview and rollback before replacing state. Encryption needs a recoverable user-owned key/passphrase design, not a hidden server key.
Exercise offline edits, quota exhaustion, private browsing, interrupted imports, multi-tab conflicts and service-worker upgrades. Show clear saved/unsaved/conflict states. Existing PWA capabilities need real iOS/Android testing; do not promise background execution uniformly.
Separate public content, local practice state and commercial entitlements. Never put private journal text into analytics or public MCP logs.

## AI ecosystem and Reality Architect Agents
Keep provider/model selection behind adapters. Publish readable reality.md/soul.md/state contracts plus tested CLI and local stdio MCP installation guides. Verify each supported harness with an actual install → read → proposed action → export smoke test. Do not market universal interoperability from shared Markdown alone.
Complete #85 with rate limiting, bounded response tests, deployed Inspector/client checks and honest public-content privacy metadata. Private tools remain local by default.
Ship bounded agent packs:
- Architect: propose a bridge from an authored scene and constraints.
- Witness: organize source-linked observations, keep personal interpretation separate, count misses.
- Archivist: propose a snapshot and explain its changes; approval belongs to the user.
- Creative Director: draft scene prompts and image directions.

Every run shows inputs, scope, output, provider/cost when relevant, and a reviewable proposed change. External actions require an explicit permission boundary. Imported agent output is untrusted until validated.
Use the Starlight engine and existing runtime conventions where applicable; do not create another general-purpose agent orchestration stack inside this repo.

### Eve
Vercel Eve is in preview. Evaluate it for a customer-deployed Reality Architect agent template and tightly bounded internal operations, with pinned versions, secrets management and tested security boundaries.
Do not embed an always-on commercial Eve agent in the consumer Studio as the default architecture. A paid deployment template can run in the customer's Vercel account with their keys; hosted execution requires isolation, durable jobs, cancellation, limits and support economics first.

## Identity, Supabase and hosted SaaS
There are three independent concerns:
| Concern | Now | Later |
| --- | --- | --- |
| Practice state | Anonymous local-first | Optional encrypted sync if demand justifies it |
| Purchase entitlement | Minimal commerce/license record | Account for updates/downloads when useful |
| AI access | Customer's existing agent/provider | Explicit provider authorization or managed metered service |

Sign in with ChatGPT for commercial websites is documented but remains a limited partner trial. It provides identity through a registered integration; identity scopes do not grant conversation history or general API resources. Do not make launch depend on admission to it.
Open-source token sharing is a separate preview path with its own client registration, grant and limitations. Verify eligibility and supported flows for the installable local agent before adoption. Never equate a user's ChatGPT subscription with unlimited hosted inference or resell their plan quota.
Supabase is not required for the present product. If hosted workspaces are approved, Supabase Auth/Postgres/Storage is a reasonable coherent option: tenant-scoped RLS, server-side permission checks, storage policies, audited migrations and deletion/export flows. Confirm supported identity integration rather than assuming ChatGPT is a built-in provider.
A hosted decision requires evidence: users repeatedly need multi-device recovery/collaboration; paid pilots cover support and variable costs; privacy/data retention and account recovery are specified. Approval should update ADR-003 before implementation.

## Revenue and packaging hypotheses
Prices below are experiments, not active offers. Confirm currency/tax treatment with the actual checkout market.
| Offer | Proposed test | Deliverable and release condition |
| --- | --- | --- |
| Complete Edition | $39 once | Finished 30-day workbook, agent prompts, editable templates, offline bundle and tested download/restore |
| Practice Packs | $19–29 once | Specific creator/founder practice with examples, source notes and a repeatable outcome |
| Reality Architect Agent Kit | $79 once | Tested local agent/MCP setup, bounded skills, example workspace and update policy |
| Facilitator Kit | $149 once | Session plans, participant materials and explicit commercial-use license |
| Annual content pass | $99/year, later | Only after a demonstrated release cadence and a valuable catalog |
| Customer-deployed agent template | Price after pilot | Installation, documented boundaries and support scope in customer's infrastructure |

Keep the open method usable and avoid charging for basic export. One-time paid assets monetize craft and convenience; a recurring pass must provide recurring value.
Optional scoped architecture reviews can create learning/revenue but should be capacity-limited, with explicit deliverables.
Defer a credit wallet, marketplace payouts and unlimited subscriptions. If managed generation is validated, show the price ceiling before each run; reserve credits atomically, settle idempotently against actual usage, release failed reservations and provide cancellation/refund rules. Separate monetary ledger from provider tokens.
Price floor = (model + tools + storage + payments + support + refund reserve) / (1 − target contribution margin). Measure retries and tail costs, not just a demo's average. Recurring runtime is a separate product decision.

## Execution roadmap
Estimates are sequencing aids for one accountable product/engineering team, not promises.

| Wave | Scope | Exit evidence | Existing work |
| --- | --- | --- | --- |
| 1: experience and recovery, 1–2 weeks | Choose direction A; simplify navigation; Threshold handoff; one-bridge onboarding; complete image backup/restore; static flagship composition | Desktop/mobile screenshots, keyboard/reduced-motion, reload and fresh-profile restore | #46, #77, #80 |
| 2: visual system and agent delivery, 2–4 weeks | Approved asset family; route-scoped motion; storage revisions; agent install guides; finish public MCP gates | Performance budgets, offline/conflict tests, real harness/Inspector smoke tests | #73, #76, #80 |
| 3: paid edition, following 2 weeks | Finish and deliver Complete Edition; rebuild honest pricing; entitlement and transactional download recovery | Test purchase/refund/download, license/support, no unbuilt claims | #78, #79 |
| 4: evidence-led expansion | Paid agent kit, facilitator pilot; assess encrypted sync and customer-deployed Eve | Repeated use, recovery demand, contribution margin, bounded operational support | New scoped issues after pilot |

Use #80 as the canonical execution board; avoid parallel redesign branches/controllers. Split implementation into small reviewable PRs on current main with ownership, scope, screenshots, tests and rollback. Harmonize SYSTEM.md, PAGE_SPEC and ADRs when their decisions actually change.
Metrics: time to first saved bridge, successful full restore, day-7 meaningful return, weekly review completion, agent-install success, support burden and paid contribution. Collect consented aggregate events without practice text; otherwise use opt-in sessions and interviews.

## Official sources checked on 2026-10-06
- https://developers.openai.com/siwc/website
- https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations
- https://github.com/vercel/eve
- https://eve.dev/
- https://gsap.com/resources/React/
- https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/
- https://supabase.com/docs/guides/auth

These are moving product surfaces; re-check availability, licenses and supported flows at implementation time.
