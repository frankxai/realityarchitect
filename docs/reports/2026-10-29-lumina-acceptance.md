# Lumina candidate hardening — 29 October 2026

Built on SIP. Continuation of draft PR #122; no new product, backend or parallel release.

## Product decision

Finish the existing first-session and return journey: one aspiration, one active Bridge, a finite practice, an
explicitly reported act and a portable record. Its useful outcome is continuity the person can inspect and keep.
Closing demonstrated failures has priority over new companion screens or hosted services. Paid packaging remains
behind the existing delivery, rights, price and release gates.

## Integration

Started at #122 head `b3992985d9fc6763e53863d13b2cda0474318a27`. Integrated current main
`36305c65c67e40eb940b8157d40dfd045159b725` without conflicts; integration commit
`0a09b30d0d3179860022dea791404afdc4580cd8` preserves main's phone text-size, pointer-hover and `dayIntent` fixes.
The existing 316-test gate passed on that integration before further repairs.

## Reproduced findings and repairs

An independent same-provider reviewer found two Medium defects in the integrated candidate:

1. Onboarding treated released/achieved Bridges as active duplicates. Repeating the same aspiration/action left
   no active morning plan. Duplicate suppression now applies only to active Bridges. Closed history remains
   intact; restarting creates an active Bridge, and replay of that active submission remains idempotent.
2. Morning text was interpolated into day-log Markdown. Multiline text could manufacture a Witness heading when
   the file engine used its supported day-log fallback without `witness.md`. Morning fields, the practice-save
   line and adjacent day-note text now use the existing single-line text encoding. The JSON backup retains
   original multiline content; this does not introduce a second file format or parser.

Regression tests failed before the repairs and passed afterward. The adversarial matrix covers six morning fields
plus look-for/correction, with LF, CR, Unicode line separator and paragraph separator. Separate checks prove that
real Witness entries and provenance survive the fallback, and that backup restore retains the original day data.
The STATE specification and its plugin copy document the readable-text/backup distinction.

## Validation

- Frozen dependency installation; no dependency or lockfile change.
- Final `pnpm gate`: PASS — typecheck, claims across 139 files, **319/319 tests**, production build and built pages.
- `git diff --check`: PASS.
- Estate guard: zero Critical/High; two existing Medium and six existing Low findings remain. No gate suppression
  or permission change was made.
- Local runtime: Node 24.22.1 and the environment's pnpm 11.25.0 fallback. CI declares pnpm 11.5.0; a green local
  run is not a receipt for that separate CI environment.
- The fresh reviewer is independent of the implementation pass but uses the same provider. Required cross-family
  review of import/export remains owed. The exact final review SHA and verdict belong in the PR receipt.

## Open acceptance

The available cloud browser returned `ERR_CONNECTION_REFUSED` for this workspace's running server. This is a
browser/workspace reachability limitation, not a production outage. The existing Git preview is protected; no share
link, bypass credential or protection change was created. No mobile, keyboard, reduced-motion, actual browser
download/restore/reopen or visual acceptance claim is made.

Neither Claude Code nor Codex CLI is installed in this executor. The file-engine tests and subprocess protocol
tests are useful evidence but do not establish installation in a separate supported agent client.

Next gate: current-head independent cross-family export review and authenticated browser journey at 375/768/1440,
including keyboard, reduced motion and download/restore/reopen. Then reconcile current checks and the exact serving
deployment before any release decision. This receipt does not authorize or claim a production merge, customer
adoption, purchase, retention, editorial publication or background personal agent.
