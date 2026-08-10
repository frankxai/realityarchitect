# Releasing Reality Architect

Reality Architect is the public website and open method at `https://www.realityarchitect.ai`. The private paid Vault is a separate repository and authority boundary. Releases must describe inspectable method, assessment, artifact, privacy, trust, experience, or platform changes without implying unverified commerce or outcomes.

## Meaningful-change rule

Create a release candidate only when a coherent method, assessment, exported artifact, standard, starter, privacy, public-experience, trust, security, or release-engineering contract changes. Do not release quiet weeks, formatting-only edits, speculative plans, providerless capture, or dependency churn without supported behavior impact.

Portfolio discovery runs weekly through the private portfolio control plane. This repository adds no second schedule. Human review decides whether evidence warrants a release, so quiet weeks consume no release or deployment capacity.

## Versioned product contract

Semantic Versioning requires a declared public API. For Reality Architect, that contract includes:

- the ordered See, Design, Build, Automate, and Compound method and its artifact/acceptance-test semantics;
- the `reality.md` standard, starter files, agent guidance, and human-consent boundary;
- the assessment questions, first-gap diagnosis, local-only context handling, export schema, and no-account promise;
- the public routes, canonical-host behavior, sitemap, robots, metadata, claims, and security/privacy statements;
- the public-method/private-Vault separation and the evidence required before commercial or capture claims;
- the machine-readable release ledger and human authority boundary for providers, offers, domains, production, and publication.

Choose versions from changes to that contract:

- `PATCH`: compatible correction, evidence clarification, security hardening, metadata fix, or presentation defect fix.
- `MINOR`: compatible method, assessment, artifact, standard, starter, route, or ledger capability.
- `MAJOR`: intentional incompatible change to move ordering, exported artifact schema, privacy behavior, route semantics, public/private boundaries, or release authority.

Before 1.0.0, use a minor bump for substantial incompatible evolution and explain the migration. The package version may align with a release candidate, but package metadata alone does not publish a release.

## Release procedure

1. Update `docs/releases/release-ledger.json` and `CHANGELOG.md` with the exact source boundary, merged PR receipts, audience-facing outcome, dated observations, and limitations.
2. Run `node .github/scripts/validate-release-ledger.mjs` and `node --test .github/scripts/release-ledger.test.mjs`.
3. Run the affected product checks. For a full release boundary, `pnpm gate` remains the exact-head repository gate.
4. If assessment or capture behavior changes, verify local-only handling, no server persistence/transmission, truthful provider acceptance, export content, keyboard use, and no synthetic success.
5. If the public UI changes, run the repo's web-excellence sequence, desktop/mobile/reflow/reduced-motion visual evidence, accessibility, performance, canonical, sitemap, robots, and structured-data checks.
6. Open or update a draft PR and let the release contract, full CI gate, review, and Vercel preview pass.
7. Merge through normal review. Do not tag an unmerged branch.
8. In a reviewed main-branch commit, set the intended ledger entry to `ready` and set its source range head to the final audited product commit. The approval-only metadata commit may follow that product head.
9. Create an annotated semantic-version tag from reviewed `main`: `git tag -a vX.Y.Z -m "Reality Architect vX.Y.Z"`.
10. Push the exact tag. The workflow verifies the ledger, tag type, main reachability, ready status, and inclusion of the audited product head before creating a GitHub release as a draft.
11. Review generated notes, remove private or irrelevant material, preserve privacy/commercial limitations, and publish only with maintainer approval.
12. After any approved production promotion, verify the exact deployment, apex 308, www canonical, assessment, exports, sitemap, robots, security headers, and audience-critical flows.

## Draft and cost controls

- Tag pushes never publish automatically.
- Generated notes use `.github/release.yml` categories and receive human review.
- Release validation installs no dependencies, uses pinned actions, cancels superseded runs, and is capped at five minutes.
- No duplicate weekly schedule is added; the portfolio radar owns discovery.
- Providers, capture, pricing, offers, checkout, Vault content, DNS, domains, production promotion, public release publication, and external sends remain human-gated.

## Public changelog and SEO boundary

The public GitHub repository makes reviewed source history discoverable, but a customer-facing changelog must live on the canonical www site. As of 2026-08-10, `/changelog` returns 404 while the apex-to-www 308, sitemap, robots, home, and assessment routes are healthy.

A future public changelog must ship in a separate premium-web lane with:

- editorial summaries that explain the artifact, acceptance test, privacy impact, and user value rather than raw commit logs;
- self-canonical www URLs, sitemap inclusion, descriptive titles and summaries, crawlable HTML, and RSS or Atom discovery;
- visible author/date/update information and `Article` structured data only when the rendered page contains matching article content;
- no indexing or publication of private `reality.md` data, assessment context, Vault contents, internal strategy, or unverified provider/commerce claims;
- responsive, keyboard, reflow, reduced-motion, accessibility, performance, and desktop/mobile visual evidence.

## Primary-source basis

- [GitHub generated release notes](https://docs.github.com/en/repositories/releasing-projects-on-github/automatically-generated-release-notes) support categorized notes and require review of generated contents.
- [GitHub releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases) are tag-based records and support draft review before publication.
- [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html) requires a declared public API and immutable released contents.
- [Google Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article) requires article markup to describe visible page content.
- [Google structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) require representative, non-misleading markup.
