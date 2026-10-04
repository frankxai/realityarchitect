# Reality Studio, Library, standard v0.2, and agent plugin: design

Date: 2026-10-04 · Status: approved for build under Frank's 2026-10-04 directive ("plan with files, then implement").
Strategy: `docs/strategy/2026-10-04-NORTH-STAR.md` · Register verdict: `docs/strategy/2026-10-04-AGENT-COUNCIL-REGISTER.md`.

## 0. Understanding (what Frank asked, separated from assumptions)

**Said:** a reality.md, a Reality Architect profile, and a soul.md, used locally in Claude Code and in the Starlight
Second Brain. Better visuals than Obsidian, mobile access, an infinite canvas, vision boards. Temporal processing with
approved snapshots and tracked decisions. Teach reality theory and the manifestation canon (Dispenza, Peer, Robbins,
Byrne, Goddard, quantum philosophy, E²) combined with sound science. Track signs and "miracles" as evidence. Whole-life
areas, current → desired state, the skills a person needs, AI workflows, reps, massive action, "is it enough?", new
people and environments, living in the assumption. Later: image and video generation, VR and AR, a school, a
marketplace. Build with GitHub, Claude and Vercel, and get to production.

**Assumed (stated so they can be corrected):**
- One brand, one domain: realityarchitect.ai. No new repo for the product.
- Local-first is non-negotiable for personal content (the site's existing privacy contract).
- "Prove the quantum realm" is not something we will claim; we teach it honestly as philosophy (North Star §7).
- No new npm dependencies in this round (the lockfile cannot be regenerated on this machine; CI installs frozen).
- No server AI or image generation in this round (needs Frank's provider and budget decision).

**Success:** a stranger can open `/studio`, see a sample life (or start their own), rate twelve domains, build one
bridge with an honest pace verdict, witness a sign, seal a snapshot, see the Map, and export an Obsidian-ready folder.
All without an account and with nothing leaving the device. `/library` teaches every named teacher with Keep /
Mechanism / Limits. The plugin installs from the repo and its skills operate on the same files.

## 1. Standard v0.2 (open, MIT)

Backward compatible: every v0.1 file stays valid.

### 1.1 Files

```
reality.md            the contract (mechanism) — unchanged eight sections + agent protocol; version "0.2" allowed
soul.md               NEW — the inner contract (meaning)
reality/  or .reality/  state directory (vault mode or home mode, see 1.2)
  aims/<slug>.md          one per aim (a Bridge): spec, scene, if-then, reps, moves, people & places, pace
  log/<YYYY-MM-DD>.md     daily: look-for, rehearsal, correction, the day's witnessed entries
  witness.md              NEW — the ledger: every entry with kind, fact, meaning, action
  evidence.md             identity votes: wins and completed moves (v0.1 semantics kept)
  snapshots/<date>.md     NEW — approved, immutable state at a point in time
  decisions/<date>-<slug>.md  NEW — decision records with a review date
  atlas.md                NEW — twelve domains, now and wanted, one true sentence, one scene
  systems.md              v0.1 registry of agents and automations (kept)
  images/                 NEW — vision-board images the person chose
Reality Map.canvas      NEW, optional — JSON Canvas 1.0 (jsoncanvas.org), opens in Obsidian
```

### 1.2 Home mode and vault mode

- **Home mode (v0.1 canonical):** `~/reality.md`, `~/soul.md`, `~/.reality/`.
- **Vault mode (new):** any folder holding `reality.md` with a visible `reality/` subfolder, typically inside an
  Obsidian vault. Notes apps hide dot-folders, which is why vault mode exists. Point agents at it with
  `REALITY_HOME=<folder>`.
- Resolution order for agents: `$REALITY_HOME` → `~/reality.md` (+ `~/.reality/`) → ask the human.

### 1.3 soul.md v0.1

Frontmatter `standard: soul.md`, `version: "0.1"`, `updated`. Sections, all optional:

| Section | Holds | Register |
| --- | --- | --- |
| Purpose | why you are building this life | Meaning |
| Values | the five you rank highest | Meaning |
| I am | present-tense identity lines, as already real ("I am someone who…") | Meaning |
| The scene | the life scene, an ordinary day when it works | Meaning (desired) |
| Gifts | what you choose to give | Meaning |
| Vows | commitments you keep | Meaning |
| Voice | how agents should speak to you: gentle, direct, or challenging | Instruction |
| Gratitude | what is already good | Meaning |
| Agent protocol | the standing instruction (see Agent Charter) | Instruction |

**Coexistence:** GenCreator's soul.md sections (Energy, Mind, Craft, Voice, Capital, Circle, Legacy) are valid in the
same file. Agents treat unknown sections as the human's own and read them. The seven GenCreator scores map to Atlas
domains (Energy → Body & Vitality, Mind → Mind & Mastery, Craft → Craft & Contribution, Capital → Wealth &
Sovereignty, Circle → Circle & Community, Legacy → Lineage & Legacy; Voice stays in soul.md).

### 1.4 Entry formats (Markdown, human-first, machine-parseable)

Witness entry (in `witness.md` and the day log):

```markdown
### 2026-10-04 08:12 · sign · primed
- **Happened (fact):** A stranger at the café asked about the album artwork.
- **Meant (my meaning):** The work is ready to be seen.
- **Did (action):** Sent her the listening link.
- Bridge: finish-the-album · Domain: craft
```

Snapshot, decision, aim and atlas formats are specified by example in `standard/STATE.md`.

### 1.5 Agent Charter

`standard/AGENT-CHARTER.md`: how any agent supports a person's reality architecture. It extends the five verbs (READ ·
SURFACE · PROPOSE · LOG · GUARD) with: keep registers separate; never certify causation; never blame; consent before
memory, sync, sharing or spending; crisis → human help; other people keep their agency; seal only what the human
approved.

## 2. Reality Studio (`/studio`)

### 2.1 Principles

- Client-only route; personal content never leaves the device. Storage: `localStorage` key `ra.studio.v1` (JSON) and
  IndexedDB database `ra-studio`, store `images` (blobs). Every read and write is wrapped; when storage is unavailable
  the Studio says so and still works for the session.
- No streaks, no scores of human worth, no urgency. Counts are neutral.
- Every field is labeled with its epistemic class: *desired*, *reported*, *planned*, *meaning*, *done*.
- Your words in dawn serif; the system in blueprint.

### 2.2 Data model (`lib/studio/types.ts`)

```ts
type DomainId = 'body' | 'mind' | 'heart' | 'character' | 'spirit' | 'love'
  | 'lineage' | 'circle' | 'wealth' | 'craft' | 'sanctuary' | 'golden-age'
type GapClass = 'knowledge' | 'capability' | 'resource' | 'coordination' | 'technology'
  | 'permission' | 'process' | 'evidence' | 'time'                    // SIS GENESIS gap classes
type WitnessKind = 'sign' | 'win' | 'rep' | 'move' | 'opening' | 'lesson' | 'gratitude'

interface StudioState {
  schema: 'reality-studio'; version: 1; createdAt: string; updatedAt: string; sample: boolean
  soul: { purpose; values[]; iAm[]; scene; gifts; vows[]; voice: 'gentle'|'direct'|'challenging'; gratitude[] }
  atlas: Record<DomainId, { now: number|null; want: number|null; fact: string; scene: string; priority: boolean }>
  bridges: Bridge[]          // aims: title, domain, doneWhen, by, scene (desired), fact (reported),
                             // obstacle, gap, ifThen, skills[], systems[], reps[{name, perWeek}],
                             // moves[{title, due, done}], reach[{kind: person|place, name, why, status}], status
  witness: WitnessEntry[]    // at, day, kind, fact, meaning, action, bridgeId?, repId?, domain?, primed
  days: Record<day, { lookFor; focusBridgeId; rehearsed; correction }>
  snapshots: Snapshot[]      // immutable after sealing
  decisions: Decision[]      // day, title, context, options, choice, why, reviewOn, outcome, status
  canvas: { cards: CanvasCard[]; positions: Record<nodeId, {x, y}>; view: {x, y, zoom} }
}
```

Twelve domains (Codex's original names from #38): Body & Vitality, Mind & Mastery, Heart & State, Character & Code,
Spirit & Source, Love & Union, Lineage & Legacy, Circle & Community, Wealth & Sovereignty, Craft & Contribution,
Sanctuary & Lifestyle, The Golden Age.

### 2.3 Views

| View | Job | Key states |
| --- | --- | --- |
| **Today** | Morning: "I am" lines, rest with a scene (no timer), set one thing to look for, one rep. Any time: witness a moment in one line. Evening: what happened, what was noticed, what was done, one correction. | First run (no soul or bridges) shows three doors and the sample. Tired path: one line. |
| **Atlas** | Rate twelve domains for now and wanted (0–10), one true sentence, one scene, at most three priorities. | Empty tiles invite, never nag. A full grid is not required. |
| **Bridges** | One per aim: aim and date, scene, present fact, obstacle with gap class and if-then, skills, systems, reps, bold moves, people and places, the "Is it enough?" verdict, close as achieved or released. Copy an image prompt or an agent brief. | No bridges: "Start from a priority domain." |
| **Witness** | Ledger with kind filters, the fact/meaning/action split, primed vs unprimed sign tally. | Empty: explains why noticing is a skill. |
| **Map** | Canvas: Now (left) → bridges → Vision (right). Pan, zoom, pinch, drag, notes, images, fit, list view, JSON Canvas export. | Empty: sample or start prompt. Images missing after import: a labeled placeholder. |
| **Timeline** | Seal a snapshot (draft → reflection → "I reviewed this; it is true for me" → seal). Compare two snapshots. Domain trend lines. Decisions with review dates. | Fewer than two snapshots: compare is disabled with a reason. |
| **Soul** | Author soul.md: purpose, values, I am, scene, gifts, vows, voice, gratitude. Preview and download. | — |

Utility (header): storage status, **Export** dialog (native `<dialog>`): Obsidian-ready ZIP, JSON backup, import (a
Studio backup or a Threshold `sip.reality-card` packet becomes a bridge), weekly prompt for your own AI assistant, load
or clear the sample, delete everything (two-step).

### 2.4 "Is it enough?" (`lib/studio/pace.ts`, deterministic and inspectable)

Window = the last 14 days, or since the bridge was created. Planned reps = Σ perWeek × days/7. Logged reps = witness
entries of kind `rep` linked to the bridge in the window. Overdue moves = not done and due before today.

| Condition | State | Message (shape) |
| --- | --- | --- |
| no reps and no moves | `undefined` | Not enough yet: nothing is defined to do. Add one rep you can do this week. |
| deadline passed, still active | `review` | The date has passed. Review it: achieved, extend, or release. |
| bridge younger than 3 days, nothing logged | `early` | Too early to judge. Log the first rep. |
| rep ratio ≥ 0.8 and no overdue move | `on-pace` | On pace: X of Y planned reps, no overdue moves. |
| rep ratio ≥ 0.5 or at most one overdue move | `behind` | Behind: X of Y reps, Z overdue. Shrink the rep or move a date; do not add pressure. |
| otherwise | `off-pace` | Not enough for the date: make the rep smaller, change the environment, ask someone, or extend. |

The panel always shows the numbers it used.

### 2.5 Map layout (`lib/studio/canvas.ts`, pure)

Columns: Now at x = 0 (priority domains with a fact, plus the soul's present-tense identity), bridge lanes from
x = 420, Vision at x = 1680 (each bridge's scene and the soul's life scene in dawn). One lane per active bridge at
y = 200 + i × 300: bridge node, then reps, moves, people and places, and the last six witnessed entries in time order.
Edges: now → bridge → vision; items → bridge. Free notes and images live wherever the person puts them. Dragged
positions override computed ones. `toJsonCanvas()` emits JSON Canvas 1.0 (text, file and group nodes; edges with
sides; colors 1–6).

### 2.6 Export (`lib/studio/export.ts`, `lib/studio/zip.ts`)

ZIP (store method, CRC-32, UTF-8 names) with root folder `Reality Architect/`: `reality.md`, `soul.md`,
`reality/atlas.md`, `reality/aims/*.md`, `reality/witness.md`, `reality/evidence.md`, `reality/log/*.md`,
`reality/snapshots/*.md`, `reality/decisions/*.md`, `reality/images/*`, `Reality Map.canvas`,
`reality/studio-backup.json`. JSON backup excludes image blobs (stated in the UI).

### 2.7 Accessibility and responsive

Skip link exists globally. View switcher = buttons with `aria-pressed` and a visible current state. Native `<dialog>`
for export and confirmations. Every input has a label. Status changes go to one polite live region. The Map has a list
equivalent, keyboard pan (arrows), zoom (+/−/0), Tab through cards, Delete removes a focused free card, and
`touch-action: none` only on the canvas surface. Layout recomposes at 375 / 768 / 1440. Reduced motion: no animated
transitions; the canvas does not ease.

## 3. Library (`/library`)

`lib/library.ts` holds the data, `app/library/page.tsx` renders it statically. Sections: Reality Theory (three
layers, the One Law, ten principles) → three shelves (Meaning, Mechanism, Frontier) → reading paths by intention →
"Practice it in the Studio". Each entry: name, work(s) and year, shelf, claim tags (evidence / practice / belief, as
on frankx.ai), **Keep**, **Mechanism**, **Limits**, **In the Studio**, sources (links checked to resolve).

Claims gate changes: `/joe dispenza/i` remains blocked everywhere except `lib/library.ts`. New blocked patterns:
`raise your vibration`, `attract (money|wealth|abundance)`, `quantum (proof|proves|physics proves)`,
`law of attraction (is|as) (real|proven|scientific)`, `guaranteed (results|manifestation)`,
`heal(s|ing)? (cancer|disease|illness)`, `thoughts? (are|is) (a )?frequenc`. A test asserts every Library entry has
Keep, Mechanism and Limits (each at least 40 characters) and at least one source.

## 4. Agent plugin (`plugins/reality-architect/`, marketplace at `.claude-plugin/marketplace.json`)

- A standalone agent-profile file (`agents/reality-architect.md`) is **deferred**: writing it was held by the
  session's permission classifier on 2026-10-04, so it waits for Frank. Every skill carries the home resolution and
  the Charter rules itself, so the plugin works without it.
- Skills: `reality-onboard` (interview → soul.md, reality.md, reality/; or import a Studio export), `reality-daily`
  (morning and evening), `reality-witness`, `reality-bridge` (build, update, pace check), `reality-snapshot` (draft
  from logs and, if present, second-brain-os `brain/` notes → human approves → seal), `reality-decide`,
  `reality-vision-board` (scene → image prompts; uses image tools the person already has, only with consent; writes
  the canvas), `reality-library` (tutor from the honest canon).
- Install: `/plugin marketplace add frankxai/realityarchitect` then `/plugin install reality-architect@realityarchitect`.

## 5. Home and navigation (protected surfaces, evolve)

- `lib/site.ts` nav adds **Studio** and **Library** (homepage surface).
- `app/page.tsx` adds one section after the dependency map: "The inner architecture: Imagine it. Build it. Witness
  it." with three doors (Threshold, Studio, Library). Hero, Loop, product path and capture are unchanged.
- `app/globals.css` adds the dawn tokens `--color-dawn` and `--color-dawn-2` (brand-system surface).

## 6. Testing

Node's built-in test runner (`node --test`, TypeScript stripped natively) for: pace states and boundaries, snapshot
diff, exports (sections present, labels, no empty-crash), JSON Canvas shape, ZIP (CRC against `zlib.crc32`, central
directory, UTF-8 flag), import parsing (Studio backup, reality card, garbage), domain ids, Library completeness, and a
privacy contract (no network sink anywhere in `components/studio` or `lib/studio`; storage access only in
`lib/studio/persist.ts` and `lib/studio/images.ts`). CI runs `pnpm gate`. Rendered verification happens on the Vercel
preview at 375, 768 and 1440 with keyboard and reduced-motion checks.

## 7. Out of scope (this round)

Server AI, server image generation, accounts, sync, payments, analytics, File System Access API, WebXR, video. Each
has a North Star horizon and a Frank decision.
