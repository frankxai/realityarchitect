# Reality Architect: the agent teams, their skills, and the bar

Status: proposed 2026-10-05 in answer to Frank's ask: "suggest which multi agent team, working with which skills and
the highest quality standards, delivers on my vision with excellence".

It builds on what already exists and creates no new agents or frameworks:

- the estate Agent OS (`/si`, the nine Generals, the studio workers);
- `AMBITION-AND-EXCELLENCE.md` (the binding floor);
- `PLAN-2026-10-05.md` (drain before build);
- `docs/strategy/2026-10-04-AGENT-COUNCIL-REGISTER.md` (the two-register verdict).

Every agent named below is an installed agent type, and every skill is installed.

## 0. Why this shape

- **The constraint is landing, not agent count.** The estate has 467 open pull requests, so more agents add debt unless
  each one ends in a verified merge. On 2026-10-05, Reality Architect opened and landed #60, #61 and #62 the same day,
  each with gates and a production probe. That is the rhythm to keep: open, verify, land.
- **One gap showed up the same day.** Codex's GitHub reviews were out of quota, so two diffs merged without a
  reviewer from another model family. The fix is in the process: the local Codex CLI runs read-only whenever this
  machine has at least 2.5 GiB free, and a risky diff waits for its verdict.
- **The machine sets the width.** It is in zone RED: about 42 GiB disk and under 4 GiB RAM free.
  - At most three API-bound agents run at once.
  - No local installs or builds; CI and Vercel build everything.
  - Long missions go to cloud sessions or the Yoga Book (`/si offload`).

So the plan is a small number of standing pods. Each pod has one lead, deterministic gates, an independent verifier,
and a cross-family reviewer for risky diffs.

## 1. The organisation

```
Frank: vision, taste, voice, and the buttons (money, publishing, keys, human-tier merges)
└── RA Lead (one Claude session per mission; /si routes): owns the board, writes the five-line contracts,
    │   integrates, and lands under the standing merge rule
    ├── Council, on demand: CEO + CPO + CFO Generals; decisions with dissent and a kill criterion
    ├── Pod 1  Engine & Platform     Studio, engine, MCP, accounts, Studio Cloud, Polar integration
    ├── Pod 2  Experience & Design   site, Studio UI, program pages, motion, visuals in the product
    ├── Pod 3  Canon & Content       the Library, programs, the book, guides
    ├── Pod 4  Audio & Media         guided audio, music beds, images, video
    ├── Pod 5  Growth & Launch       positioning, channels, launch kits, search and answer engines
    ├── Pod 6  Commerce & Ops        offer, pricing, Polar, releases, support, the weekly numbers
    └── Pod 7  Trust & Review        independent verification; never reviews its own work
```

- **No Reality Architect Queen yet.** The brand has no recurring revenue, and the floor prefers skills over standing
  agents. The CEO General owns portfolio calls, and the RA Lead acts as the domain lead.
- **When to add a Queen:** when the Complete Edition has 30 days of sales, or a second paid line opens.

## 2. The pods

### Pod 1 — Engine & Platform

| | |
| --- | --- |
| Mission | One engine, every surface: the Studio, the CLI, MCP and (later) Obsidian compute the same numbers. Accounts and Studio Cloud are end-to-end encrypted by design (ADR-001). |
| Agents | `general-cto` (architecture and ADR review); `feature-dev:code-architect` (blueprints); the Claude implementer; `app-studio-team:test-engineer` (TDD and silent-failure hunting); `app-studio-team:backend-architect` (Neon, Better Auth, webhooks); `app-studio-team:security-auditor` |
| Skills | `superpowers:brainstorming` → `writing-plans` → `subagent-driven-development` → `test-driven-development` → `systematic-debugging` → `verification-before-completion` → `requesting-code-review`; `mcp-architecture`, `mcp-2025-patterns`, `nextjs-expert`, `claude-sdk`; Context7 for current library docs |
| Done when | `pnpm gate` is green in CI. Every behaviour has a test, and parity tests prove the surfaces agree. An ADR covers any architecture change. Risky diffs carry a Codex verdict (Pod 7). The merge is pinned to the head SHA, followed by a production probe. |

### Pod 2 — Experience & Design

| | |
| --- | --- |
| Mission | Pages and tools a person keeps open: job first, "your words in dawn, the system in blueprint", calm motion. |
| Agents | `app-studio-team:ux-architect` (flows, onboarding, the paywall); `app-studio-team:ui-craftsman` (tokens, type, motion); `accessibility-auditor` (WCAG 2.2); `performance-guardian` (Core Web Vitals); `worker-visual-qa` (renders 375 / 768 / 1440 and scores the rubric); `app-studio-team:craft-reviewer` (fresh-context slop hunter) |
| Skills | The repo's `web-release-gate` pack: `ui-ux-pro-max`, `emil-design-eng`, `apple-design`, `review-animations`, `web-design-guidelines`, `core-web-vitals`, `visual-proof`, `find-animation-opportunities`. Also `impeccable` and `design-system`. `gsap` / `css-animations` only with a real reduced-motion variant. |
| Done when | The web release gate receipt is complete: direction plus three alternatives for high-value pages, audit, motion review, vitals, screenshots. No horizontal overflow at 375. Keyboard and focus work, contrast is AA, and visual QA scores ≥ 8 on public pages. Scores are stated honestly; scaffolding is 7. |

### Pod 3 — Canon & Content

| | |
| --- | --- |
| Mission | The fairest, most useful teaching of the canon: every claim sourced, two registers, no promises, no blame. |
| Agents | `Business & Transformation Master` (lead); `Developmental Editor`; `Line Editor & Voice Alchemist`; `Research Librarian` (DOI, Crossref and PubMed checks); `Sensitivity Reader`; `Continuity Guardian` (Library ↔ book ↔ programs ↔ audio); `general-cco` (canon and register); `brand-voice:quality-assurance` |
| Skills | `excellence-book-writing`, `book-publishing`, `canon-check`, `brand-voice`, `obsidian-second-brain`; the claims gate; `scripts/book` |
| Done when | The claims gate passes, and every factual claim is in a claims log with its source. A fairness read covers living people, and a human or legal read happens before sale. Quotes are at most 15 words. **`lib/library.ts` is the single source of truth:** a correction lands there first, then flows to the book and programs (as with #62). |

### Pod 4 — Audio & Media

| | |
| --- | --- |
| Mission | Rehearsal you can hear, made with Frank's voice and music, and images the person's words carry. |
| Agents | Script writer (general-purpose with the audio brief); `general-cco` (direction); the Claude producer running `scripts/audio`; `worker-visual-producer` (OpenArt, within a credit cap). Frank is the voice and the final listener. |
| Skills | `suno-prompt-architect` / `suno-ai-mastery` (beds), `video-production-workflow`, `hyperframes` (short video), `acos-visual-gen` |
| Done when | Frank has listened to every track. Loudness is −16 LUFS ±1 integrated, true peak ≤ −1.5 dBTP, and beds sit 7–9 LU under speech (the pipeline reports all three). The synthetic voice is disclosed aloud and in the tags. Every bed has a rights record and every asset has provenance in the brand media registry. No title or credit names a frequency or a healing claim. |

### Pod 5 — Growth & Launch

| | |
| --- | --- |
| Mission | Distribution is product: every asset has a placement, and every post is staged for Frank. |
| Agents | `general-cmo` (positioning and channels); `app-studio-team:story-weaver` (copy); `app-studio-team:growth-analyst` (funnel experiments); `worker-publisher` (packages each channel and stops at the publish gate); `social-content-generator`; `Publishing Strategist` (book launch) |
| Skills | `social-media-strategy`, `publish-distribute`, `brand-voice`; the Semrush connector for search and answer-engine visibility; `llms.txt` and structured data |
| Done when | Copy passes the claims gate. There is no fake scarcity or countdown. Attribution is privacy-safe (UTM only, no trackers). Each asset has a distribution ticket. **Agents never post.** |

### Pod 6 — Commerce & Ops

| | |
| --- | --- |
| Mission | Sell honestly, deliver instantly, refund without friction, and know the numbers every Friday. |
| Agents | `general-cfo` (fees, plan tier, unit economics with arithmetic); `general-cpo` (offer ladder, packaging); `general-coo` (loops, receipts, runbooks); `app-studio-team:release-captain`; `app-studio-team:liveops-keeper` (after launch: vitals, refunds, support) |
| Tools | The Polar connector (read-only until Frank says yes), the Vercel connector, GitHub |
| Done when | Money moves only on Frank's button. A sandbox purchase and a refund are tested before live. Every number shows its calculation. The Friday report comes from Polar data, not estimates. |

### Pod 7 — Trust & Review (independent)

| | |
| --- | --- |
| Mission | Make "verified" mean something. Pod 7 never builds what it judges. |
| Agents | Local Codex CLI, read-only (the cross-family reviewer); `adversarial-reviewer`; `pr-review-toolkit:code-reviewer`, `silent-failure-hunter`, `pr-test-analyzer`; `prompt-red-team` (prompt injection in skills and MCP tools); `general-caio` (evals, model routing); `app-studio-team:security-auditor` |
| Skills | `verification-quality`, `gate-eval`, `skill-comply`, and the engine's `reality skill-check` (the marketplace bar) |
| Rule | Some diff classes need a Codex verdict and a fix loop until no Critical or High remains: auth, payments, encryption, MCP tools, hooks, merge paths, data import and export. Everything else gets one fresh-context Claude review. |

## 3. Definition of done, by artifact

The outcome ladder is binding: CREATED → CANDIDATE → VERIFIED → DELIVERED. Only the last two count as progress.

| Artifact | VERIFIED by (never the maker) | DELIVERED means |
| --- | --- | --- |
| Code PR | CI gate, plus Pod 7 (Codex for risky classes) | Merged pinned to the head SHA, plus a production probe |
| Public page | `worker-visual-qa` ≥ 8, the web release gate receipt, no overflow at 375 | Live, in the sitemap where it should be, probed |
| Program day | Claims gate, the registers test, the word cap, the Library ids exist | Live page and file; the vault rebuilt |
| Book chapter | Research Librarian claims log, Sensitivity Reader, Continuity Guardian | In the EPUB build; human or legal read before sale |
| Audio track | Pipeline loudness report, then **Frank listens** | In the Polar files and the vault |
| Image or video | CCO brief check, provenance record | Registered in the brand media registry, then placed |
| Launch post | `worker-publisher` package, claims gate | **Frank** posts it |
| Price or offer | CFO arithmetic, CPO packaging | **Frank** turns it on |
| Skill or MCP tool | `reality skill-check`, `prompt-red-team`, Codex | In the plugin, `claude plugin validate` passes |

## 4. How a mission runs

1. **Contract.**
   - Every mission starts with five lines: Goal · Repo · Done when (a command someone can run) · Don't touch ·
     Deliver as (draft PR).
   - Strategic forks go to `/si council` first.
2. **Design.** Use the right size of design process.
   - A bounded change gets a short design in chat.
   - Architecture gets a spec, then `writing-plans`.
3. **Build.** `subagent-driven-development`: a fresh implementer per task and test-first, at most three at a time on
   this machine.
4. **Verify.** CI, then Pod 7, then visual QA for UI.
   - Every Codex finding is answered with a fix SHA or a "declined, because …".
5. **Land.**
   - Merge pinned to the head SHA, then a production probe with a receipt (route, status, content match).
   - Net PR count does not grow: a session lands or closes before it opens another.
6. **Learn.** A one-line receipt goes to the OPS ledger or SIS memory, and recurring lessons become skills or memory
   notes.

## 5. Cadence and scorecard

- **Daily.** Drain first: land or close, then build. CI green. After launch, check Polar for orders and refunds.
- **Friday.** The numbers and the scorecard below, a 20-minute review with Frank, and Monday's contracts.
- **Monthly.** A canon audit (CCO) and a drift check between the Library and the book (Continuity Guardian).

| Area | Measure | Target |
| --- | --- | --- |
| Delivery | PRs landed − PRs opened (Reality Architect) | ≥ 0 every day |
| Delivery | Risky diffs with a cross-family verdict | 100% |
| Craft | Visual QA score on public pages | ≥ 8, no page below 7 |
| Craft | Accessibility violations · overflow at 375 | 0 · 0 |
| Truth | Claims gate violations · unsourced factual claims in the book | 0 · 0 |
| Business | Program starts · Complete Edition conversion · refund rate | measured weekly · ≥ 1% · < 10% |
| Practice | Practising architects per week (opt-in, no content) | measured once Studio Cloud ships |

## 6. Capacity and budget

- **Local.** In RED: up to three API-bound agents, no builds, Codex only at ≥ 2.5 GiB free, one Chrome at a time
  (absolute `--user-data-dir`).
- **Cloud.** Claude cloud sessions and the Yoga Book take the long missions; `/si offload` sends work with a receipt.
  Waking more than three idle cloud sessions needs Frank's word.
- **Tokens.** Bulk drafting runs on Sonnet 5.5; editing, orchestration and review run on Opus 5.5.
  - This week: ≤ 40M input (≥ 80% cached) and ≤ 2M output, about $80 API-equivalent (`2026-10-05-GTM-PLAN.md` §5.2).

## 7. The first three missions

| # | Goal | Pods | Done when |
| --- | --- | --- | --- |
| M1 | **The program inside the Studio.** Today shows "Day N of 30" with that day's practice. The person picks a start date (stored on the device). Progress shows on the Timeline. | 2 + 1, verified by 7 | `node --test` covers day selection and edges (before start, after day 30, a missed day). Visual QA ≥ 8 at 375/768/1440. Production probe. |
| M2 | **A public read-only MCP connector** at `/api/mcp`: Library search, program days, loop prompts and `skill-check`. No account, so no OAuth. Plus the Claude directory package (screenshots, privacy URL, test notes). | 1 + 7 + 5 | Protocol tests over HTTP. Codex verdict with no Critical or High. `claude plugin validate`. The submission is ready for Frank. |
| M3 | **The Complete Edition, launch-ready.** Tracks voiced and mixed, the book's legal read, a sandbox purchase that delivers every file and refunds cleanly. | 4 + 6 + 3 | A sandbox order downloads seven files that all open (MP3, M4B, EPUB, two PDFs, the vault, the licence), the refund succeeds, and Frank has listened to every track. |

Agent OS gaps to close, from `~/.starlight/agent-os/brands/reality-architect.brand.json`:

- **Register:** add the Meaning/Mechanism register to `REGISTER-BOUNDARIES.md`. CMO General; in the
  `claude-code-config` lane after its Phase 1 reconciliation.
- **Stale gap:** "No local checkout on this PC" can be marked resolved, since `~/.agent-worktrees/ra-studio` exists.

## 8. Frank's part, and only this

- **Taste:** read day 1 and the book's first chapter, and listen to the first track.
- **Voice:** record the reading for the voice clone.
- **Music:** choose the beds.
- **Buttons:** Polar onboarding, prices, publishing, keys, human-tier merges.
- **Review:** 20 minutes on Fridays.

Everything else is the team's to lead, verify and land.
