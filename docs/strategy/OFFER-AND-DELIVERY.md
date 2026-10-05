# Offer and delivery — every capability, worked out

Status: workstream A of `docs/handoff/2026-10-04-PRODUCT-FUNDAMENTALS-SESSION.md`. Prices are the decisions in
`2026-10-04-FRONTIER-ARCHITECTURE.md` §11, taken under Frank's delegation with abundance thinking. Publishing them on
the site, and taking money, wait for Frank's click.

Costs use the sources in FRONTIER (checked 2026-10-04):

- a render is Nano Banana 2 at 1K, $0.067;
- Polar charges 4% + 40¢, plus 0.5% on subscriptions;
- R2 storage is $0.015 per GB-month;
- Vercel Workflows cost $0.02 per 1,000 events.

Every margin below shows its arithmetic.

## The promise, in one line

**Imagine it. Build it. Witness it.** An open practice that turns the life you would love into a measured bridge, keeps
an honest record of what happens, and shows your reality changing across time. Your files, your agents, no promises we
cannot keep.

## Why this and not a journal, a vision board app, or a coach

1. **Honest by design.** Meaning and mechanism are labeled and never blended. Misses count with hits. No causal claims,
   enforced by a claims gate on every page and skill.
2. **Yours.** Local-first open files. The export is complete at every tier and works in Obsidian and with any agent.
3. **A bridge, not a mood.** Scene → reps and bold moves → a computed "is it enough?".
4. **Agents with a Charter.** Deterministic, labeled briefs. Every write is gated.
5. **Reality across time.** Approved snapshots and decisions show what actually changed.

## Capability catalogue

| # | Capability | Tier | What you get | Delivered by | Cost to serve | Price and margin | Proof (privacy-safe) | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Open standard | Free | `reality.md`, `soul.md`, `reality/`, the Agent Charter | `/standard`, GitHub (MIT) | ≈ $0 | gift | GitHub stars, forks, and repos using the format | live |
| 2 | The Library | Free | Reality Theory, 26 works taught as Keep · Mechanism · Limits | `/library`, the plugin's `library.json` | hosting | gift | page reads (aggregate) | live |
| 3 | The Imaginal Act | Free | One scene, one fact, one act, as a Reality Card | `/threshold`, downloads | hosting | gift | opt-in count of completed cards (no content) | live |
| 4 | Reality Studio (local) | Free | Today, Atlas, Bridges, Witness, Map and board, Timeline, Soul, export; installable, offline | `/studio` (PWA) | hosting; data stays on the device | gift | opt-in weekly "practising" count (no content) | live |
| 5 | Patterns over time (local) | Free | `reality insights` and the Studio's patterns from your own files | engine (plugin), Studio (M3) | runs on your device | gift | as #4 | engine live; Studio M3 |
| 6 | Agents and engine | Free | Plugin, nine skills, `bin/reality.mjs`; MCP server (M2) | Claude Code marketplace, agentskills.io, skills.sh | ≈ $0 | gift | plugin installs (GitHub traffic) | live; MCP M2 |
| 7 | First renders | Free with sign-up | 20 images of your own scenes | Studio → "Render my scene" (consent each time) | 20 × $0.067 = **$1.34 per new member** | gift, funded by conversions | renders per member; conversion to Architect | M5 |
| 8 | Studio Cloud | Architect | End-to-end encrypted sync on every device; recovery key | Studio, passkey sign-in | 50 MB × $0.015/GB-month ≈ $0.001 per member; writes negligible | in Architect | devices per member; 90-day retention | M4 |
| 9 | Patterns across devices and monthly report | Architect | Insights over the full history on every device; a monthly reflection report drafted for your approval | Studio Timeline (M3 on Cloud) | runs on the device; the report about $0.02 in tokens | in Architect | report opened, snapshot sealed | M3 to M4 |
| 10 | Cloud loops (opt-in) | Architect | "Your weekly loop is ready" nudges, with proposals sealed to your key | Vercel Workflows + push; the device decrypts | 20 events/day × 30 × $0.02/1,000 ≈ $0.012 + about $1 tokens | in Architect | loops completed per week | M2 to M5 |
| 11 | Renders (monthly) | Architect | 150 renders per month | as #7 | at most 150 × $0.067 = $10.05; typically about 50 × $0.067 = $3.35 | in Architect | renders used/month; credit balance | M5 |
| 12 | **Architect** | Paid | #8–#11 | Polar subscription, Customer Portal | typical $3.35 + $1 + $0.01 + Polar ($0.76 + $0.40 + $0.10 = $1.26) = **$5.62** | **$19/month: 70% margin** (full use: $12.32, 35%) · $190/year | paid members, monthly churn, NPS | checkout after Frank's go |
| 13 | **Founding Architect** | Paid | Architect, locked for life, first 1,000 | Polar product with a cap | typical $4.36 + Polar ($120 × 4% + 40¢ + 0.5% = $5.80/yr ≈ $0.48/month) = $4.84/month | **$120/year: 52% margin**; at full use slightly below cost, by design | founding seats taken (a real counter) | as #12 |
| 14 | Render packs | Paid | 120 renders, never expire | Polar one-time + `image_credits` meter | 120 × $0.067 = $8.04 + Polar $0.76 = $8.80 | **$9: break-even by design** | packs per member | M5 |
| 15 | **Guide** | Paid | 15 client seats with consented, revocable views; a practice library; guide analytics | Guide dashboard (new), invites | client sync for shared items, about $0.05/client × 15; analytics about $0.50; Polar $3.16 + 40¢ + 40¢ = $3.96 → about $5.21 | **$79/month: about 93% margin before support** | guides active, clients per guide, client retention | after Architect retains |
| 16 | **School** | Paid | 6-week live cohort on the Library and the practice; one scholarship seat per five paid | Polar product, cohort calendar, Library curriculum, Studio practice | Frank's time; tools ≈ $0 | **$490 per seat**; scholarships priced in | cohort completion; snapshots sealed during the cohort | after Guide |
| 17 | Marketplace | Paid packs | Practice packs and skills from creators who pass the bar | Plugin marketplace + Polar license keys | review time | **creators keep 85%** | packs sold, creator earnings | free skills now; paid packs with Architect |

**Correction to §11.** Patterns computed on the person's own device are free. The engine runs locally already, and
charging for them would contradict "the core is a gift". Architect sells what costs us something or needs the cloud:
sync, patterns across devices, the monthly report, cloud loops, and renders.

## How each paid thing is delivered, end to end

1. **Discover:** homepage story → `/pricing` (honest copy, a real founding counter, refund terms) → Studio, where
   everything free works without an account.
2. **Sign up:** a passkey (no password), which also unlocks the encryption key for Studio Cloud (WebAuthn PRF). A
   recovery key is shown once, and must be saved before sync starts.
3. **Checkout:** Polar hosted checkout. Polar is the merchant of record, so tax and invoices are handled.
4. **Entitlement:** a Polar webhook (signature-verified, idempotent) updates the customer state. The server reads
   entitlements from Polar on demand, and the Studio unlocks sync, renders and loops.
5. **Use:** renders debit the `image_credits` meter. The balance is checked server-side before every call, because
   Polar does not block at zero.
6. **Self-serve:** the Polar Customer Portal handles the plan, invoices, cancellation and payment method.
7. **Refund:** 30 days, no questions, from the portal or by email. Cancelling never deletes local data; the export
   stays complete.
8. **Leave:** export everything at any time. Cloud blobs are deleted within 30 days of account deletion, and we say so.

## Proof without surveillance

- **North-star metric:** practising architects per week, meaning people who completed at least one loop.
- **How it is counted:** opt-in only. The Studio asks once; if yes, it sends an anonymous weekly "practised: yes"
  ping with no content, no identifiers beyond a random rotating token, and no third-party analytics.
- **Paid metrics come from Polar** (members, churn, refunds); they need no tracking.
- **Honesty check:** no testimonial is published without written consent and a real name or initials the person
  chose, and never with health or income metrics.

## Open items for Frank (the buttons)

1. Approve the prices going public on `/pricing`. The page is built in PR "pricing page", unmerged.
2. Create the Polar products (sandbox first, then live) and switch to live mode.
3. The AI Gateway key and the $300/month render cap.
4. The domain for passkeys (rpID): `realityarchitect.ai`, already decided.
