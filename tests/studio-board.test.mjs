import assert from 'node:assert/strict'
import test from 'node:test'
import { visionBoard } from '../lib/studio/board.ts'
import { sampleState } from '../lib/studio/sample.ts'
import { emptyState } from '../lib/studio/state.ts'

const TODAY = '2026-10-04'

test('an empty studio has an empty board, not invented content', () => {
  assert.deepEqual(visionBoard(emptyState(new Date(2026, 9, 4))), [])
})

test('the board holds only the person’s own scenes and chosen images, soul first, priorities before the rest', () => {
  const state = sampleState(TODAY)
  const tiles = visionBoard(state)
  assert.ok(tiles.length > 0)
  const scenes = tiles.filter((tile) => tile.kind === 'scene')
  if (state.soul.scene.trim()) assert.equal(scenes[0].source, 'soul')
  const atlas = scenes.filter((tile) => tile.source === 'atlas')
  const firstOther = atlas.findIndex((tile) => !state.atlas[tile.id.slice('atlas:'.length)].priority)
  if (firstOther > -1) assert.ok(atlas.slice(firstOther).every((tile) => !state.atlas[tile.id.slice('atlas:'.length)].priority), 'priority domains come first')
  for (const tile of scenes) assert.ok(tile.text.length > 0)
})

test('images are interleaved with scenes and keep their captions', () => {
  const state = sampleState(TODAY)
  state.canvas.cards.push(
    { id: 'i1', kind: 'image', text: 'The studio at dusk', imageId: 'img-1', x: 0, y: 0, w: 300, h: 200 },
    { id: 'i2', kind: 'image', text: '', imageId: 'img-2', x: 0, y: 0, w: 300, h: 200 },
  )
  const tiles = visionBoard(state)
  const kinds = tiles.slice(0, 4).map((tile) => tile.kind)
  assert.deepEqual(kinds, ['scene', 'image', 'scene', 'image'])
  assert.equal(tiles.find((tile) => tile.kind === 'image' && tile.cardId === 'i1').caption, 'The studio at dusk')
})

test('a scene written twice (an aim and its Atlas domain) appears once, under its first source', () => {
  const state = sampleState(TODAY)
  state.atlas.body = { ...state.atlas.body, scene: 'I finish the river 10K smiling, with breath left to talk.' }
  state.bridges[1] = { ...state.bridges[1], scene: '  I finish the river 10K smiling, with breath left to talk. ' }
  const texts = visionBoard(state).filter((tile) => tile.kind === 'scene').map((tile) => tile.text)
  assert.equal(texts.filter((text) => text === 'I finish the river 10K smiling, with breath left to talk.').length, 1)
  assert.equal(new Set(texts).size, texts.length)
})

test('released bridges and blank scenes stay off the board', () => {
  const state = sampleState(TODAY)
  state.bridges[0] = { ...state.bridges[0], status: 'released' }
  const ids = visionBoard(state).map((tile) => tile.id)
  assert.ok(!ids.includes(`bridge:${state.bridges[0].id}`))
})
