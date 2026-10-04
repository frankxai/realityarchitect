---
name: reality-vision-board
description: Turn the person's own scenes (from soul.md and their aims) into image prompts and, only with consent, generated images for their vision board, then place them on Reality Map.canvas (JSON Canvas, opens in Obsidian). Use for "make my vision board", "generate an image of my scene", "visualize my goal", or "add this to my map".
---

# Vision board

Images here are reminders for attention and rehearsal: they keep the scene visible. Do not describe them as
programming the subconscious or attracting the outcome.

## 1. Prompts from their words

For each chosen scene (soul.md **The scene**, or an aim's scene), write one prompt:

- Their concrete details first (place, light, objects, activity), then mood and composition.
- Always: no text or lettering in the image, no logos, no recognizable real people.
- People: anonymous figures seen from behind or at a distance, unless the person supplies a photo of themselves and
  explicitly asks for their own likeness.
- No religious symbols, flags, or brands unless they asked for them.

Show the prompts. They may paste them into any image tool they already use.

## 2. Generate (optional, with consent)

If an image-generation tool is available in this session, say which one, what it may cost, and that the prompt text
will be sent to that provider. Generate only after a yes. Save results to `reality/images/<slug>.<ext>`.

## 3. Place on the map

Add each image to `Reality Map.canvas` (JSON Canvas 1.0) as a `file` node near its scene, without moving their
existing nodes:

```json
{ "id": "img-<slug>", "type": "file", "file": "reality/images/<slug>.png",
  "x": 1700, "y": 200, "width": 360, "height": 240 }
```

Create the canvas if it does not exist (`{"nodes": [], "edges": []}`). Keep ids unique.

## Never

- Never generate images of other real people, or of the person in compromising, medical, or sexual contexts.
- Never upload their soul.md or reality.md to an image provider; send only the prompt they approved.
