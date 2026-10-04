---
name: reality-vision-board
description: "Turn the person's own scenes (from soul.md and their aims) into image prompts and, only with consent, generated images for their vision board, then place them on Reality Map.canvas (JSON Canvas, opens in Obsidian). Use for make my vision board, generate an image of my scene, visualize my goal, or add this to my map."
---

# Vision board

> **First:** read `CHARTER.md` at the root of this plugin if you have not read it in this session, and follow it.
> Non-negotiable: ask before generating, sending or writing anything; send a provider only the prompt they approved;
> never claim images program the subconscious or attract an outcome.

Images here are reminders for attention and rehearsal: they keep the scene visible.

## Find the home

`$REALITY_HOME` (map at `$REALITY_HOME/Reality Map.canvas`, images in `$REALITY_HOME/reality/images/`) if set, else
`~/Reality Map.canvas` and `~/.reality/images/` when `~/reality.md` exists, else offer `reality-onboard`.

## 1. Prompts from their words

For each chosen scene (soul.md **The scene**, or an aim's scene), write one prompt:

- Their concrete details first (place, light, objects, activity), then mood and composition.
- Always: no text or lettering in the image, no logos, no recognizable real people.
- People: anonymous figures seen from behind or at a distance, unless the person supplies a photo of themselves and
  explicitly asks for their own likeness.
- No religious symbols, flags or brands unless they asked for them.

Show the prompts. They may paste them into any image tool they already use.

## 2. Generate (optional, with consent)

If an image-generation tool is available in this session, say which one, what it may cost, and that the prompt text
will be sent to that provider. Generate only after a yes. Save each result to `images/<slug>.<ext>` in the state
directory, choosing a slug that is not taken.

## 3. Place on the map, each in its own spot

Read the canvas (create `{"nodes": [], "edges": []}` if it does not exist), then for each new image:

- Find the vision column: the largest `x` among existing nodes. If the canvas is empty, use `x: 0`.
- Place the image 40 px below the lowest node whose `x` is in that column (`y = max(y + height) + 40`), or at `y: 0` if
  none is there.
- Place each further image 40 px below the previous one. Never reuse coordinates, never move the person's existing
  nodes, and keep every `id` unique.

```json
{ "id": "img-<slug>", "type": "file", "file": "reality/images/<slug>.png",
  "x": 1680, "y": 620, "width": 360, "height": 240 }
```

Show the change and write the canvas after a yes.

## Never

- Never generate images of other real people, or of the person in compromising, medical or sexual contexts.
- Never upload their soul.md or reality.md to an image provider.
