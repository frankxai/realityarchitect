import assert from 'node:assert/strict'
import test from 'node:test'
import { layoutMap, toJsonCanvas } from '../lib/studio/canvas.ts'
import { sampleState } from '../lib/studio/sample.ts'
import { emptyState } from '../lib/studio/state.ts'

const TODAY = '2026-10-04'
const finite = (node) => [node.x, node.y, node.w, node.h].every(Number.isFinite)

test('the map runs from now on the left to the vision on the right', () => {
  const { nodes } = layoutMap(sampleState(TODAY), TODAY)
  const soul = nodes.find((node) => node.id === 'vision:soul')
  assert.ok(soul, 'the life scene is on the map')
  for (const node of nodes.filter((entry) => entry.tone === 'now')) assert.ok(node.x < soul.x, node.id)
  assert.ok(nodes.every(finite))
})

test('every active bridge gets a lane joined to its present and its scene', () => {
  const state = sampleState(TODAY)
  const { nodes, edges } = layoutMap(state, TODAY)
  const ids = new Set(nodes.map((node) => node.id))
  for (const bridge of state.bridges) {
    assert.ok(ids.has(`bridge:${bridge.id}`))
    assert.ok(ids.has(`now:${bridge.id}`))
    assert.ok(ids.has(`vision:${bridge.id}`))
    assert.ok(edges.some((edge) => edge.from === `now:${bridge.id}` && edge.to === `bridge:${bridge.id}`))
    assert.ok(edges.some((edge) => edge.from === `bridge:${bridge.id}` && edge.to === `vision:${bridge.id}`))
  }
  const lane = nodes.filter((node) => node.bridgeId === state.bridges[0].id && node.tone === 'witness')
  assert.ok(lane.length > 0 && lane.length <= 6, 'the last few witnessed moments sit on the lane')
  const sorted = [...lane].sort((a, b) => a.x - b.x)
  assert.deepEqual(lane.map((node) => node.id), sorted.map((node) => node.id), 'in time order, left to right')
})

test('closed bridges leave the map; free cards stay where the person put them', () => {
  const state = sampleState(TODAY)
  state.bridges[1].status = 'achieved'
  const { nodes } = layoutMap(state, TODAY)
  assert.ok(!nodes.some((node) => node.id === `bridge:${state.bridges[1].id}`))
  const card = nodes.find((node) => node.id === 'card:sample-card-cover')
  assert.equal(card.x, 1680)
  assert.equal(card.free, true)
})

test('a dragged position overrides the computed one', () => {
  const state = sampleState(TODAY)
  state.canvas.positions['vision:soul'] = { x: -500, y: 900 }
  const soul = layoutMap(state, TODAY).nodes.find((node) => node.id === 'vision:soul')
  assert.equal(soul.x, -500)
  assert.equal(soul.y, 900)
})

test('an empty studio produces an empty, finite map', () => {
  const layout = layoutMap(emptyState(new Date(2026, 9, 4)), TODAY)
  assert.deepEqual(layout.nodes, [])
  assert.deepEqual(layout.edges, [])
  assert.ok(Object.values(layout.bounds).every(Number.isFinite))
})

test('JSON Canvas output follows the 1.0 shape and opens in Obsidian', () => {
  const state = sampleState(TODAY)
  state.canvas.cards.push({ id: 'img1', kind: 'image', text: '', imageId: 'abc', x: 10, y: 10, w: 300, h: 200 })
  const canvas = toJsonCanvas(layoutMap(state, TODAY), (imageId) => `reality/images/${imageId}.png`)
  const ids = new Set(canvas.nodes.map((node) => node.id))
  for (const node of canvas.nodes) {
    for (const key of ['id', 'type', 'x', 'y', 'width', 'height']) assert.ok(key in node, `${node.id} lacks ${key}`)
    assert.ok(Number.isInteger(node.x) && Number.isInteger(node.width))
    if (node.type === 'text') assert.equal(typeof node.text, 'string')
    if (node.type === 'group') assert.equal(typeof node.label, 'string')
  }
  const image = canvas.nodes.find((node) => node.id === 'card:img1')
  assert.equal(image.type, 'file')
  assert.equal(image.file, 'reality/images/abc.png')
  for (const edge of canvas.edges) {
    assert.ok(ids.has(edge.fromNode) && ids.has(edge.toNode))
    assert.equal(edge.fromSide, 'right')
  }
  assert.ok(canvas.nodes.some((node) => node.type === 'group'))
})
