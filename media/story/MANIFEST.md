# media/story — provenance

The five frames of the homepage story ("The practice, in five scenes", `components/ScrollStory.tsx`).

| File | Role | Source | Notes |
| --- | --- | --- | --- |
| `01-now-night.webp` | Now (reported): the room at night | Nano Banana 2 text-to-image, 2K 16:9, OpenArt, 2026-10-04 | No people or text; an illegibly small maker's mark on the audio interface |
| `02-scene-dawn.webp` | The scene (desired): the same room at dawn | Nano Banana 2 image-to-image from `01`, same framing | Aligned with `01`, so the scroll crossfade reads as one room changing |
| `03-bridge.webp` | The bridge (planned) | Nano Banana 2 text-to-image | A scale-model bridge from graphite stone to dawn sandstone |
| `04-witness.webp` | Witness (reported, meaning) | Nano Banana 2 text-to-image | The notebook script is pseudo-handwriting, not readable words |
| `05-snapshots.webp` | Snapshots (approved) | Nano Banana 2 text-to-image | Seven instant photographs of one window, night to dawn |

- **Rights:** original renders made for Reality Architect on Frank's OpenArt account (Starter plan). No supplied
  third-party marks, no recognizable people, no text baked in.
- **Derivatives:** these are 1920×1072 WebP files at quality 80, 65–129 KB each, made from the 2752×1536 PNG masters.
- **Masters:** `C:\Users\frank\brand-assets\realityarchitect\story-2026-10-04\`, recorded in the brand media registry.
- **Accessibility:** the images are atmosphere; the story's text carries the meaning, so each image is decorative
  (`alt=""`, hidden from assistive technology).
- **Motion:** `dawn-scrub` and `beat-rise` in `components/ScrollStory.module.css` are bound to the reader's scroll.
  With reduced motion, or in a browser without scroll timelines, the story is a static sequence.
- **Lifecycle:** `released` once the PR that adds this file merges. Before that, `integration-ready`.

**Candidate, not shipped:** an 8-second Veo 3.1 (fast, 1080p, silent) start-and-end-frame transition from `01` to `02`,
staged as `06-night-to-dawn-veo.mp4` beside the masters (4.96 MB). Before any use it needs a compressed derivative, a
poster frame, a reduced-motion fallback, and a storage decision (Vercel Blob by default).

Spend: 5 images × 30 credits, plus 1 video × 280 credits = 430 OpenArt credits of an existing balance. Nothing was
purchased.
