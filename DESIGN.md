# Reality Architect Design System

## Product role

Reality Architect is an open practice for architecting a life: an open method, an assessment, the Imaginal Act (Threshold), Reality Studio, and the Library. The first useful outcome is never inspiration alone; it is an exported artifact — an architecture brief, a Reality Card, or a Studio export — and one chosen next act.

## First read

Find the first gap in your AI system. Leave with a build brief.

## Visual system

- Foundation: graphite `#06070c`, elevated slate `#0d0f18`, structural border `#1b1f30`.
- Signal: blueprint blue `#5b8cff`; violet `#a78bfa` only for secondary state.
- Type: Space Grotesk for architectural headings, Inter for reading, JetBrains Mono for artifacts and system states.
- Composition: exact diagrams, ordered dependencies, quiet space, and dense artifacts over abstract inspiration.
- Glass: navigation and one proof plane only; body content stays on solid surfaces.
- Dawn register (since 2026-10-04): warm `#e8d5ad` (`--color-dawn`), `#f7e8c8` (`--color-dawn-2`) and Georgia serif carry meaning — the person's own scenes, "I am" lines, and contemplative passages. **Your words in dawn, the system in blueprint.** Dawn never carries a causal claim, a number, or a CTA price.
- The Reality Map makes the two registers spatial: Now on the graphite left, the Vision in dawn on the right, Bridges crossing between them.

## Asset strategy

Tier C code-authored assessment and architecture brief are the primary proof assets. Existing owned blueprint imagery may support the method but cannot replace the working artifact.

The homepage story (since 2026-10-04) uses five original photographic frames: one room at night and the same room at dawn, a bridge from graphite stone to dawn sandstone, a witness notebook, and a row of snapshots. They carry atmosphere, never claims. Each has no people and no baked-in text, is decorative to assistive technology, and has its provenance in `media/story/MANIFEST.md` and the brand media registry. Rule for new frames: the same room or the same light logic (graphite night to dawn), and the person's words still carry the meaning.

## Motion

Named behavior: `blueprint-resolve`. The five assessment states resolve in sequence to clarify dependency order. It uses opacity and transform once, preserves reading, and becomes fully static under reduced motion. Threshold's single `arrive` entrance follows the same rule. The Studio has no decorative motion; the Map pans and zooms only under the person's hand. The homepage story adds `dawn-scrub` (its frames crossfade from night to dawn, bound to the reader's scroll) and `beat-rise` (each beat's card rises once into place). Both are CSS scroll-driven animations of opacity and transform, with no JavaScript and no autoplay. With reduced motion, or without scroll-timeline support, the story is a static sequence with every image and word present.

## Accessibility

Assessment choices expose pressed state, result changes are announced, export controls are keyboard operable, and the page has a skip link and stable focus treatment. Studio: every field labeled, one polite live region, native `<dialog>` for export and confirmations, and a list equivalent plus keyboard pan/zoom for the Map.
