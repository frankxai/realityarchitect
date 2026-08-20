# Reality Architect release foundation receipt

Date: 2026-08-10

Repository: `frankxai/realityarchitect` (public method and website)

Branch: `agent/codex/release-foundation-20260810`

## Outcome

The repository now has an evidence-led initial release contract defining a draft `0.1.0` candidate over all 18 commits from root `14d1178` through production main `395cf4a`.

All six merged pull-request receipts appear exactly once. Open draft PRs #1, #4, #11, and #12 are recorded as excluded because unmerged work cannot be represented as supported product history.

The tag workflow accepts only annotated `vMAJOR.MINOR.PATCH` tags whose commits are reachable from `origin/main`, match a `ready` ledger entry, and contain its audited product head. It creates a draft GitHub release and never publishes automatically.

## Product and privacy boundary

The public repository owns the open method, public site, local assessment, exportable architecture brief, standard, and starters. `realityarchitect-vault` remains the separate private paid Vault.

The release contract preserves the existing promise that optional assessment context is processed locally and is not transmitted or persisted. It does not add provider-backed capture, paid availability, pricing, checkout, enrollment, private Vault content, or outcome guarantees.

## Live production evidence

- Vercel project `realityarchitect` reported production deployment `dpl_ADoNzETbG3izc9fQjkg4Ti9bcw4h` for main commit `395cf4a` as `READY` on 2026-08-10.
- A direct production request to `https://www.realityarchitect.ai/` returned HTTP 200 and referenced that exact deployment ID in its assets. The page declared the www canonical URL, index/follow robots directive, and the open method/system-gap description.
- The apex returned HTTP 308 to the www host. `/assess`, `/sitemap.xml`, and `/robots.txt` returned HTTP 200. `/changelog` returned HTTP 404.

These receipts prove the current production source, canonical-host, assessment, and discoverability baseline. They do not substitute for a fresh visual, accessibility, or performance review of a future public changelog.

## Safety and cost decisions

- Existing method content, assessment behavior, exports, UI, metadata, routes, redirects, Vercel configuration, deployment state, domains, and DNS are unchanged.
- No weekly repository schedule, version tag, GitHub release, merge, provider integration, capture path, paid offer, production deployment, domain mutation, or external send was created.
- The lightweight release contract uses pinned actions, Node 24, no dependency install, run cancellation, and a five-minute cap.
- Portfolio discovery remains centralized; quiet weeks produce no repository release.
- Machine preflight admitted one serial interactive lane and paused new swarms. Local build remained held by the machine policy; the exact-head cloud gate is the full build proof for this PR.

## Evidence gates

- [x] Ledger validator confirms the 18-commit root-to-main range and six unique PR receipts.
- [x] Six Node contract tests pass, including open-draft exclusion and authority checks.
- [x] Public claims scan passes across 20 files; all ten existing product-contract tests pass.
- [x] Workflow YAML parses.
- [x] Patch hygiene and private-path/credential-like scans pass.
- [x] Staged gitleaks scan passes with no findings.
- [ ] Draft pull-request full CI, release contract, review, and Vercel preview are inspected remotely.

## Follow-up sequence

1. Review and merge this release foundation.
2. When the 0.1.0 content and limitations are approved, update its source head to the final audited product commit and set its status to `ready` in a reviewed main-branch commit.
3. Create an annotated tag from the reviewed ready commit; the workflow will require that it contains the audited product head. Review the generated draft release before any publication.
4. Open a separate premium-web lane for a public `/changelog` experience, then run exact-head desktop/mobile, accessibility, performance, canonical, sitemap, robots, RSS, and structured-data evidence gates.
