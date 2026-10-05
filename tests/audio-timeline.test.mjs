import assert from 'node:assert/strict'
import test from 'node:test'
import { CROSSFADE, FINAL_FADE_OUT, SIGNPOST_BEAT, layout, parseScript, tailSeconds, voicedCharacters } from '../scripts/audio/timeline.mjs'

const SCRIPT = `---
track: "05"
title: "A morning"
minutes: 3.0
music: [rise]
---

# A morning

[music: rise]
[pause 5s]
Good morning.
Three minutes, and then the day is yours.
[pause 2s]
Meaning. That line is yours.
[music: witness]
Mechanism. Deciding the moment in advance helps you begin.
[pause 3s]
[music: witness]
`

test('a script becomes speech, real pauses and music cues, with a beat after each signpost', () => {
  const { front, events } = parseScript(SCRIPT)
  assert.equal(front.title, 'A morning')
  assert.deepEqual(front.music, ['rise'])
  assert.deepEqual(events, [
    { type: 'music', cue: 'rise' },
    { type: 'pause', seconds: 5 },
    { type: 'speech', text: 'Good morning. Three minutes, and then the day is yours.' },
    { type: 'pause', seconds: 2 },
    { type: 'speech', text: 'Meaning.' },
    { type: 'pause', seconds: SIGNPOST_BEAT },
    { type: 'speech', text: 'That line is yours.' },
    { type: 'music', cue: 'witness' },
    { type: 'speech', text: 'Mechanism.' },
    { type: 'pause', seconds: SIGNPOST_BEAT },
    { type: 'speech', text: 'Deciding the moment in advance helps you begin.' },
    { type: 'pause', seconds: 3 },
    { type: 'music', cue: 'witness' },
  ])
  assert.equal(voicedCharacters(events), 55 + 8 + 19 + 10 + 47)
  assert.equal(tailSeconds(front), 6)
  assert.equal(tailSeconds({ minutes: 8.5 }), 10)
})

test('the layout places speech and silence in order and crossfades music around each change', () => {
  const { events } = parseScript(SCRIPT)
  const plan = layout(events, [4, 1, 2, 1, 3], 6)
  assert.deepEqual(plan.voice.map((part) => [part.kind, part.start, part.seconds]), [
    ['silence', 0, 5],
    ['speech', 5, 4],
    ['silence', 9, 2],
    ['speech', 11, 1],
    ['silence', 12, SIGNPOST_BEAT],
    ['speech', 12.6, 2],
    ['speech', 14.6, 1],
    ['silence', 15.6, SIGNPOST_BEAT],
    ['speech', 16.2, 3],
    ['silence', 19.2, 3],
  ])
  assert.equal(plan.voiceEnd, 22.2)
  assert.equal(plan.total, 28.2)
  // The repeated closing cue continues the bed instead of restarting it.
  assert.deepEqual(plan.spans.map((span) => span.cue), ['rise', 'witness'])
  assert.equal(plan.spans[0].start, 0)
  assert.ok(Math.abs(plan.spans[0].end - (14.6 + CROSSFADE / 2)) < 1e-9)
  assert.ok(Math.abs(plan.spans[1].start - (14.6 - CROSSFADE / 2)) < 1e-9)
  assert.equal(plan.spans[1].end, 28.2)
  assert.equal(plan.spans[1].fadeOut, FINAL_FADE_OUT)
})

test('unknown directions and missing durations fail loudly', () => {
  assert.throws(() => parseScript('[whisper]\nHello.'), /Unknown direction/)
  const { events } = parseScript(SCRIPT)
  assert.throws(() => layout(events, [4, 1, 2, 1]), /Missing duration|durations for/)
})
