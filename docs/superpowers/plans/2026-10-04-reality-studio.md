# Reality Studio, Library, standard v0.2, and plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> This round runs **native** (one builder session) with fresh review at the end (Codex PR review + an independent
> reviewer), per Frank's 2026-10-04 directive to plan with files and then implement without pausing.

**Goal:** Ship the two-register doctrine, the open standard v0.2 with `soul.md`, the `reality-architect` agent plugin,
the honest Library, and Reality Studio v1 to realityarchitect.ai.

**Architecture:** Pure, tested TypeScript modules in `lib/studio/` (state, pace, snapshots, exports, canvas layout,
ZIP, import) drive client components in `components/studio/` on one route-scoped page `/studio`. Personal content lives
only in browser storage behind `lib/studio/persist.ts` and `lib/studio/images.ts`. The Library is static data in
`lib/library.ts` rendered by a server page. The plugin and standard are Markdown.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4 (CSS-first tokens in `app/globals.css`), TypeScript,
Node's built-in test runner with native type stripping, pnpm 11.5 frozen lockfile.

**Spec:** `docs/superpowers/specs/2026-10-04-reality-studio-design.md` (strategy:
`docs/strategy/2026-10-04-NORTH-STAR.md`).

## Global Constraints

- No new npm dependencies; `pnpm-lock.yaml` changes only with a pnpm-generated diff.
- Tests: `node --test` over `tests/*.test.mjs`, importing `.ts` directly (Node ≥ 22.18 locally, 24 in CI).
- No `fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `EventSource`, or analytics anywhere in `components/studio/`
  or `lib/studio/`.
- `localStorage` only in `lib/studio/persist.ts`; `indexedDB` only in `lib/studio/images.ts`.
- Twelve domain ids: `body mind heart character spirit love lineage circle wealth craft sanctuary golden-age`.
- Labels on every personal field: desired, reported, planned, meaning, done.
- Copy rules: AGENTS.md "Tone — two registers, one law"; teacher names only in `lib/library.ts`.
- Protected surfaces (`app/page.tsx`, `lib/site.ts`, `components/EmailCapture*`, `components/ArchitectLoopMap*`,
  `app/globals.css`, `app/layout.tsx`, `components/Nav.tsx`, `components/Footer.tsx`) change only as `evolve` with a
  Surface change brief.
- Motion: CSS only; nothing essential depends on motion; `prefers-reduced-motion` disables transitions.
- Builds run in CI and on Vercel previews (workstation below the 4 GiB RAM floor for local installs/builds).

## Review Focus

1. **Corrupted or older saved state** (a hand-edited or partial `ra.studio.v1`) must load with defaults, never crash
   or blank the page. Pinned in Task 3 (`normalizeState` on garbage, partial, and wrong-typed input).
2. **Storage full or unavailable** (private mode, quota) must keep the session usable and say so. Pinned in Task 10
   (`saveState` returns `{ ok: false, reason }` on a throwing storage).
3. **Day boundaries**: a move due *today* is not overdue; entries logged near midnight count on the local day. Pinned
   in Task 4 (due === today) and Task 2 (`localDay` uses local time).
4. **Foreign imports** (another schema, a Threshold card missing fields, invalid JSON) must fail with a clear message
   and change nothing. Pinned in Task 9.
5. **Unsafe titles in file paths** (slashes, colons, emoji, 300 characters, duplicates) must produce safe, unique ZIP
   paths. Pinned in Task 2 (`slugify`, `uniqueSlug`) and Task 8 (paths written as given).

---

### Task 1: Domains and types

**Files:** Create `lib/studio/types.ts`, `lib/studio/domains.ts`. Test `tests/studio-domains.test.mjs`.

**Interfaces — Produces:** `DomainId`, `GapClass`, `WitnessKind`, `StudioState`, `Bridge`, `Rep`, `Move`, `Reach`,
`WitnessEntry`, `DayNote`, `Soul`, `Snapshot`, `Decision`, `CanvasCard`; `DOMAINS: {id, label, short}[]`,
`DOMAIN_IDS`, `GAP_CLASSES: {id, label}[]`, `WITNESS_KINDS: {id, label, hint}[]`, `domainLabel(id)`.

- [ ] Write the test: 12 unique ids in the order above; labels include `Body & Vitality` and `The Golden Age`;
  `GAP_CLASSES` has the nine SIS classes; `WITNESS_KINDS` ids are `sign win rep move opening lesson gratitude`.
- [ ] Run `node --test tests/studio-domains.test.mjs` → FAIL (module missing).
- [ ] Implement the two files.
- [ ] Run → PASS. Commit `feat(studio): domain, gap and witness vocabularies`.

### Task 2: Utilities (dates, ids, slugs)

**Files:** Create `lib/studio/util.ts`. Test `tests/studio-util.test.mjs`.

**Produces:** `localDay(d?: Date): string` (YYYY-MM-DD, local), `addDays(day, n): string`,
`daysBetween(a, b): number` (b − a in whole days), `newId(): string`, `slugify(text, max = 60): string`
(lowercase ASCII, hyphens, never empty → `untitled`), `uniqueSlug(base, taken: Set<string>): string` (`-2`, `-3`…),
`clampText(text, max): string`.

- [ ] Tests: `localDay(new Date(2026, 9, 4, 23, 59))` → `2026-10-04`; `addDays('2026-10-31', 1)` → `2026-11-01`;
  `daysBetween('2026-10-01', '2026-10-15')` → 14 (also across the DST change on 2026-10-25);
  `slugify('Finish: the/album ✨ now')` → `finish-the-album-now`; `slugify('✨')` → `untitled`;
  `slugify('a'.repeat(300)).length` ≤ 60; `uniqueSlug('a', new Set(['a','a-2']))` → `a-3`.
- [ ] FAIL → implement → PASS → commit `feat(studio): local-day and slug utilities`.

### Task 3: State, defaults, normalization, sample

**Files:** Create `lib/studio/state.ts`, `lib/studio/sample.ts`. Test `tests/studio-state.test.mjs`.

**Consumes:** Task 1 types, Task 2 utils. **Produces:** `emptyState(now?: Date): StudioState`,
`normalizeState(input: unknown, now?: Date): StudioState` (never throws; drops malformed items; clamps 0–10 scores;
caps text lengths), `sampleState(today: string): StudioState` (fictional composer "Mara", `sample: true`),
`isEmptyState(s): boolean`, `STORAGE_KEY = 'ra.studio.v1'`.

- [ ] Tests: `normalizeState(null)`, `normalizeState('garbage')`, `normalizeState({ bridges: 'x', atlas: { body: { now:
  14 } } })` all return valid state, the score clamped to 10; a valid state round-trips through `JSON` and
  `normalizeState` unchanged; `sampleState('2026-10-04')` has two bridges, at least eight witness entries, two
  snapshots, a filled soul, and `sample === true`; `isEmptyState(emptyState())` is true and false for the sample.
- [ ] FAIL → implement → PASS → commit `feat(studio): resilient state model and sample life`.

### Task 4: "Is it enough?" pace

**Files:** Create `lib/studio/pace.ts`. Test `tests/studio-pace.test.mjs`.

**Produces:** `type PaceState = 'undefined'|'review'|'early'|'on-pace'|'behind'|'off-pace'|'closed'`;
`assessPace(bridge: Bridge, witness: WitnessEntry[], today: string): Pace` with `{ state, windowDays, repsPlanned,
repsLogged, ratio, overdue: Move[], movesDone, movesTotal, daysLeft, headline, suggestions: string[] }`.

- [ ] Tests (one per row of spec §2.4): no reps/moves → `undefined`; `by` in the past → `review`; created 1 day ago, no
  logs → `early`; 3 reps/week, 4 logged in 14 days of 6 planned → ratio 0.67, `behind`; 6 of 6 and no overdue →
  `on-pace`; 1 of 6 and 2 overdue → `off-pace`; a move due **today** is not overdue; achieved/released → `closed`;
  headline always contains the numbers used.
- [ ] FAIL → implement → PASS → commit `feat(studio): deterministic is-it-enough pace check`.

### Task 5: Snapshots and decisions over time

**Files:** Create `lib/studio/snapshot.ts`. Test `tests/studio-snapshot.test.mjs`.

**Produces:** `draftSnapshot(state, today, reflection): Snapshot` (period starts the day after the previous snapshot or
7 days back), `diffSnapshots(a, b): SnapshotDiff` (`domains: {id, label, nowDelta, wantDelta}[]`, `counts`,
`bridges`), `domainTrend(snapshots, id): {day, now}[]`, `decisionsDue(decisions, today): Decision[]`.

- [ ] Tests: the draft counts only entries in the period; diff of the sample's two snapshots shows the expected
  `nowDelta` for `craft`; a missing score yields `null` delta, not `NaN`; `decisionsDue` returns decided items with
  `reviewOn ≤ today`, excluding reviewed ones.
- [ ] FAIL → implement → PASS → commit `feat(studio): sealed snapshots, diffs, trends, decision reviews`.

### Task 6: Markdown exports

**Files:** Create `lib/studio/export.ts`. Test `tests/studio-export.test.mjs`.

**Produces:** `realityMd(state, today)`, `soulMd(state, today)`, `atlasMd(state)`, `aimMd(bridge, state, today)`,
`witnessMd(entries, state)`, `evidenceMd(entries, state)`, `dayLogMd(day, note, entries, state)`,
`snapshotMd(snapshot)`, `decisionMd(decision)`, `weeklyPrompt(state, today)`, `imagePrompt(scene, domainLabel)`,
`bundleFiles(state, today): { path: string; text: string }[]` (every Markdown/JSON file of spec §2.6, paths under
`Reality Architect/`).

- [ ] Tests: `realityMd` has frontmatter `version: "0.2"` and all eight section headings plus `## Agent protocol`;
  `soulMd` has `standard: soul.md`, `## I am`, `## Voice`; witness entries render the three labels
  `Happened (fact)`, `Meant (my meaning)`, `Did (action)`; desired/reported/planned labels appear in `aimMd`; empty
  state exports without throwing and with gaps marked; `bundleFiles(sample)` paths are unique and include
  `reality/aims/`, `reality/snapshots/`, `reality/studio-backup.json`; `imagePrompt` contains no person likeness
  instruction and states "no text".
- [ ] FAIL → implement → PASS → commit `feat(studio): open-format Markdown exports`.

### Task 7: Map layout and JSON Canvas

**Files:** Create `lib/studio/canvas.ts`. Test `tests/studio-canvas.test.mjs`.

**Produces:** `layoutMap(state, today): { nodes: MapNode[]; edges: MapEdge[]; bounds }` with
`MapNode = { id, tone, x, y, w, h, title, body, imageId?, free }`;
`toJsonCanvas(layout, imagePath: (imageId) => string): JsonCanvas`.

- [ ] Tests: the sample produces a `vision:soul` node right of every `now:*` node; each active bridge has a lane node
  and edges to now and vision; dragged positions override computed ones; no `NaN` in any coordinate for empty state;
  `toJsonCanvas` nodes all have `id,type,x,y,width,height`, text nodes have `text`, image cards become `file` nodes,
  edges reference existing node ids.
- [ ] FAIL → implement → PASS → commit `feat(studio): reality map layout and JSON Canvas export`.

### Task 8: ZIP writer

**Files:** Create `lib/studio/zip.ts`. Test `tests/studio-zip.test.mjs`.

**Produces:** `crc32(bytes: Uint8Array): number`, `createZip(files: { path: string; data: Uint8Array }[],
date?: Date): Uint8Array` (store method, UTF-8 flag bit 11, local headers + central directory + end record).

- [ ] Tests: `crc32` equals `zlib.crc32` for three inputs; a two-file archive has signatures `PK\x03\x04`,
  `PK\x01\x02`, `PK\x05\x06`, the right entry count, names readable as UTF-8 (`Reality Architect/reality.md`,
  `ü.md`), stored data byte-identical; empty file list produces a valid 22-byte archive.
- [ ] FAIL → implement → PASS → commit `feat(studio): dependency-free ZIP writer`.

### Task 9: Import

**Files:** Create `lib/studio/importer.ts`. Test `tests/studio-import.test.mjs`.

**Produces:** `parseImport(text: string, today: string): { kind: 'studio'; state } | { kind: 'card'; bridge } |
{ kind: 'error'; message }`.

- [ ] Tests: a Studio backup round-trips; a Threshold `sip.reality-card` packet becomes an active bridge with scene,
  fact, obstacle, if-then and one move (due text kept in the move title when not a date); invalid JSON, `{}`, an array,
  and `{schema:'other'}` return `error` with a human sentence.
- [ ] FAIL → implement → PASS → commit `feat(studio): import Studio backups and Threshold cards`.

### Task 10: Persistence boundary and privacy contract

**Files:** Create `lib/studio/persist.ts`, `lib/studio/images.ts`. Test `tests/studio-privacy.test.mjs`.

**Produces:** `loadState(storage?: Storage | null): { state, status: 'loaded'|'empty'|'unavailable'|'recovered' }`,
`saveState(state, storage?): { ok: true } | { ok: false; reason: 'unavailable'|'quota'|'error' }`,
`clearState(storage?)`; images: `putImage(file: Blob): Promise<string>`, `getImage(id): Promise<Blob|null>`,
`listImageIds()`, `deleteImage(id)`, `clearImages()`.

- [ ] Tests: `saveState` with a storage whose `setItem` throws `QuotaExceededError` returns `{ok:false,
  reason:'quota'}`; `loadState` with corrupt JSON returns `recovered` and a valid state; the privacy scan finds no
  network sink in `lib/studio/**` or `components/studio/**`, `localStorage` only in `persist.ts`, `indexedDB` only in
  `images.ts`.
- [ ] FAIL → implement → PASS → commit `feat(studio): local persistence boundary with privacy contract`.

### Task 11: Studio UI

**Files:** Create `app/studio/page.tsx`, `components/studio/Studio.tsx`, `components/studio/useStudio.ts`,
`components/studio/ui.tsx` (Field, Area, ListEditor, Chip, Section), `TodayView.tsx`, `AtlasView.tsx`,
`BridgesView.tsx`, `WitnessView.tsx`, `MapView.tsx`, `TimelineView.tsx`, `SoulView.tsx`, `DataDialog.tsx`.
Test: extend `tests/studio-privacy.test.mjs` with UI contract checks (labels, live region, dialog, aria-pressed).

**Consumes:** Tasks 1–10.

- [ ] `useStudio()` loads once on mount (no SSR access to storage), saves debounced 400 ms, exposes
  `state, update(fn), status, announce(msg)`.
- [ ] Views per spec §2.3 with the states listed there; Map per §2.5 with list equivalent and keyboard controls.
- [ ] DataDialog per §2.3 utility row, using native `<dialog>`; two-step delete.
- [ ] Contract test asserts: `aria-live="polite"` present once in `Studio.tsx`; every `<input`/`<textarea`/`<select`
  in studio components sits inside a `<label` or has `aria-label`; `DataDialog.tsx` uses `<dialog`; view buttons use
  `aria-pressed`.
- [ ] CI gate → preview → inspect 375/768/1440, keyboard-only pass, reduced motion → commit per view.

### Task 12: Library and claims gate

**Files:** Create `lib/library.ts`, `app/library/page.tsx`, `tests/library.test.mjs`. Modify
`scripts/check-public-claims.mjs`.

- [ ] Test: every entry has `keep`, `mechanism`, `limits` ≥ 40 characters, `inStudio`, ≥ 1 source with `https://`;
  shelves `meaning mechanism frontier` all non-empty; ten principles; ids unique.
- [ ] Gate: allow `/joe dispenza/i` only in `lib/library.ts`; add the new blocked patterns from spec §3; the gate
  passes on the repo.
- [ ] Verify every source URL resolves (HTTP 200/301/302) before commit.
- [ ] Commit `feat(library): reality theory and the honest canon`.

### Task 13: Home, navigation, tokens, privacy, discovery

**Files:** Modify `lib/site.ts` (nav, `updatedAt`), `app/page.tsx` (one new section), `app/globals.css` (dawn
tokens), `app/sitemap.ts`, `app/privacy/page.tsx` (Studio storage section), `public/llms.txt`, `README.md`,
`tests/product-contract.test.mjs` (Studio privacy statements).

- [ ] Surface change briefs for `homepage` and `brand-system` in the PR body (kind `evolve`, every job kept).
- [ ] Commit `feat(home): inner architecture doors to Threshold, Studio and Library`.

### Task 14: Standard v0.2, Agent Charter, plugin (docs PR)

**Files:** Modify `standard/README.md`, `standard/reality.template.md`, `AGENTS.md`, `README.md`. Create
`standard/soul.template.md`, `standard/soul.example.md`, `standard/STATE.md`, `standard/AGENT-CHARTER.md`,
`.claude-plugin/marketplace.json`, `plugins/reality-architect/.claude-plugin/plugin.json`,
eight `plugins/reality-architect/skills/*/SKILL.md` (the agent-profile file is deferred to Frank, see spec §4),
`plugins/reality-architect/README.md`.

- [ ] `claude plugin validate` (if available) or JSON parse check on both manifests.
- [ ] Commit `docs(standard): v0.2 with soul.md, vault mode, witness, snapshots, decisions, Agent Charter` and
  `feat(plugin): reality-architect skills and marketplace`.

### Task 15: Land Codex's Imaginal Act (#38)

- [ ] Fix the six findings: Start order (assessment stays step 1; Threshold offered as the life entry after it),
  spiritual lens kept under the new doctrine and explicitly labeled (answer: Declined with reason citing AGENTS.md),
  full-bleed overflow (`:global(html):has(.experience){overflow-x:clip}`), bfcache (`pagehide` clears the card,
  disclosure narrowed), `If When…` normalization, export date and timezone in Markdown and JSON.
- [ ] Reply on each thread with the fix commit SHA; Review Gate green; merge.

### Task 16: Verify and ship

- [ ] Each PR: CI `Full quality gate` green, Web Interface Guidelines green, Surface Guard green, Codex review findings
  answered, Review Gate green, Vercel preview READY and inspected.
- [ ] Merge in order: #48 (security) → docs PR → #38 → product PR(s). Confirm the production deployment for each merge
  commit and spot-check `/`, `/studio`, `/library`, `/threshold`, `/standard` on www.realityarchitect.ai.

### Task 17: Frank's local setup

- [ ] Scaffold an **empty** REALITY_HOME inside the Second Brain vault (`Reality Architect/` with `reality.md`,
  `soul.md` templates and `reality/` folders). No invented personal content.
- [ ] Install the plugin from the merged marketplace; record the install command and REALITY_HOME in the handoff.
