# System Contract

## Public product

- Open five-move method.
- Local-only system-gap assessment.
- Downloadable/copyable Markdown architecture brief.
- Sanitized starter templates and the open standard: `reality.md`, `soul.md`, and the `reality/` state directory.
- Threshold (`/threshold`): the Imaginal Act, a private first session that exports a Reality Card.
- Reality Studio (`/studio`): the daily practice — Today, Atlas, Bridges, Witness, Map, Timeline, Soul — stored on the
  person's device and exported as the open format.
- Library (`/library`): Reality Theory and the honest canon, every teacher with Keep / Mechanism / Limits.
- The `reality-architect` agent plugin and its marketplace listing (`plugins/`, `.claude-plugin/`).

## Offer ladder

1. Free: method, assessment, architecture brief, starter templates, Threshold, Studio, Library, standard, plugin.
2. Digital product: assessment pack or Reality Diff pack only after its files, delivery, price, license, and refund
   terms are complete.
3. Guided service: scoped architecture review with deliverables and availability confirmed before payment.
4. Private Vault: tuned systems, per-claim sourcing, and private evidence remain separate from the public repo.

## Privacy

- **Assessment and Threshold:** inputs remain in page memory. Nothing is transmitted or persisted. A generated brief or
  card may contain personal context; the person chooses whether to download, copy, or share it.
- **Studio:** entries are stored in this browser's own storage on this device (localStorage for text, IndexedDB for
  images the person adds) so the practice survives a reload. They are never transmitted, synced, or included in
  analytics. The person can export everything, import a backup, and delete everything from the Studio itself.
- **`/apply` waitlist (opt-in):** joining sends the email, an optional name, and, only if the person ticks the box,
  their stated aim, priority, and computed headline to the FrankX subscriber endpoint. The rest of the draft
  reality.md stays in the browser.
- **Connected Observatory (opt-in):** separate Supabase accounts and owner-scoped evidence at
  `/observatory/workspace`. Only explicitly saved records and explicitly submitted AI requests leave the browser.
  It never reads the offline Studio. AI review artifacts persist in Supabase; guardian sessions persist in Vercel
  Workflow. Operator deletion must cover both stores. See `/observatory/data`.
- No analytics provider is active on local workflows. Eve records operational trace metadata with model inputs and
  outputs excluded from OpenTelemetry. Its durable session history still contains submitted conversations.

## Motion and performance

Track A CSS only. No GSAP, WebGL, video, or new motion dependency. `blueprint-resolve` is disabled under reduced
motion. Use Next Image for raster assets. Studio JavaScript is route-scoped; the Map canvas is plain SVG and pointer
events with a list equivalent for keyboard and screen-reader use.

## Release gates

Frozen install, type/lint, public-claims scan, tests, build, security scan, desktop/mobile/reduced-motion inspection,
and one Git-backed Vercel preview.
