# Independent implementation review — 25 October 2026

Status: **initial findings repaired in the evolving worktree; frozen revision review pending**. This is a fresh-context reviewer separate from the maker, using the same model/provider. It is not the cross-family review required before release of data-export changes. No merge or production approval is supplied.

## Scope and evidence

Baseline: `9ebd5ba540af1e99e64566050e608c7679943787`; worktree branch `agent/codex/lumina-continuity`. Initial review covered the new Lumina journey and pure engine, observation parser and its staged import UI, additive Studio normalization/export, existing persistence/snapshot boundaries, and related tests. The maker was still editing; this initial receipt is not a frozen-head signoff.

Executed independently: `pnpm lint` and the focused Lumina, observation-import, Studio state, export, import, and snapshot tests: **50 tests pass**. These checks establish deterministic behavior and compatibility in those paths; they do not establish browser usability, a deployed route, a separate agent-client installation, or customer adoption.

## Initial findings

| Severity | Finding | Required repair |
| --- | --- | --- |
| High | One approved imported observation can contain raw Markdown newlines that export as a second Witness heading, or as additional action/meta fields. Reproduced one approved lesson becoming a lesson plus a manufactured win in `loadReality`. The underlying multiline exporter is a baseline weakness, newly reachable through the external-source connector. | Escape or encode user-controlled Witness fields across export/parse; verify one approved event remains exactly one and meaning cannot become action or metadata. |
| High | A persisted morning action has no bridge identity. Changing today's focus from Bridge A to B can display A's action beside B's scene and record the report against B. | Bind morning content to the selected bridge, preserve or safely reset when selection changes, and test same-day cross-bridge switching. |
| High | First-session input uses the global in-memory `useDraft` cache. It remains populated after the user saves and after deleting Studio data, allowing the prior aspiration to reappear in empty onboarding. | Clear draft secrets on save and reset/replacement; test deletion and starting a new Studio in the same page visit. |
| Medium | Both the new Lumina evening form and the collapsed legacy daily form mount with the same `witness-today:*` draft keys, while each holds its own hook state. They can present stale parallel drafts. | Mount one shared form or give each explicit, isolated draft scope and clear consistently. |
| Medium | The backup normalizer accepts any `https://` prefix and silently truncates provenance URLs, while the narrow parser validates URLs but allows longer ones. Credentials or malformed source URLs can survive backup import, or source identity can be changed by truncation. | Apply one safe HTTPS/no-userinfo length contract to both ingress paths; reject or drop malformed/oversized values deterministically. |
| Medium | Markdown exports write the additive provenance line, but the existing filesystem parser initially ignores it. JSON backup preserves it, yet an independent parser does not retain source metadata. | Add a backwards-compatible parser extension with tests, or report this as an explicit interoperability limitation; never claim complete provenance round-trip before the check. |
| Medium | The final onboarding submit disappears after Bridge creation without moving keyboard focus to the new morning region. | Move focus to the new heading after that explicit action, without autofocus on routine returning visits. |

These findings were sent to the integrator while implementation continued. Final disposition belongs in the revision receipt below.

## Positive checks

- First-session Bridge creation is copy-based, bounded, idempotent, and refuses the fictional sample.
- A scene remains desired; choosing or rehearsing an action creates no Witness event and never achieves an aspiration.
- A separate larger outcome criterion is retained rather than equating first action with goal fulfilment.
- The constellation retains blank days and missed/unmarked look-fors; it describes records rather than manufacturing progress.
- Observation import is offline, strict, text-only, and staged for explicit approval. It does not fetch a source URL, execute imported text, or accept a claim of independent verification.
- Existing Studio optimistic storage conflict handling and export/recovery boundary are reused.
- The UI explicitly distinguishes authored guidance from a connected AI model.

## Release gates still required

1. Frozen-head review of the repaired findings and regressions.
2. Full repository quality gate and estate/security scan bound to that revision.
3. Authentic browser journey, saved-work recovery, mobile/desktop/reduced-motion inspection, and export/reopen evidence.
4. Cross-family export review under the existing repository policy before release.
5. Human-authorized merge and production serving receipt. Internal demonstration is not adoption evidence.

## Final revision receipt

Follow-up inspection found repairs for the initial findings:

- `morningPractice` binds a daily plan to its Bridge and uses the selected Bridge's defaults when focus changes. A regression test covers same-day switching.
- Successful first-session creation clears its form. Whole-Studio replacement/deletion clears the draft cache and advances a rendering generation so mounted form hooks are reset.
- Lumina's compact Witness form has its own draft scope.
- Source URL validation is bounded, HTTPS-only and refuses userinfo across the narrow importer, backup normalizer and filesystem reader.
- Private file parsing preserves additive provenance; tests confirm source label/URL and original imported instant do not appear in the alliance projection.
- Explicit first-session creation moves focus to the new morning heading.
- Witness scalar display is flattened to one line, while an additive JSON string-fields record preserves original multiline content. This closes the reproduced event/metadata injection path without executing source text. The regression asserts that one imported event remains one, and meaning/next text cannot become action or verification.
- `sourceAt` distinguishes the source instant from `importedAt` ingestion time.

Executed after repairs: **47/47** continuity, kernel, privacy, import and observation-import tests, followed by **6/6** continuity tests after the Markdown injection repair. These overlap the earlier tests; they are not additive unique-test totals. `git diff --check` passed. Browser behavior, including focus and lifecycle clearing, still needs an authentic acceptance pass; code inspection is not browser evidence.

Residual refinement sent to integrator: automatic adoption of a same-identity update from another tab should preserve visit-only drafts, rather than resetting them on every storage event. Explicit replacement, deletion and adoption of a different identity should clear them. Agent prompts should additionally mark imported records as untrusted data, never new instructions or consent.

Pending frozen revision and final disposition of the residual refinement. This document is not a release approval.
