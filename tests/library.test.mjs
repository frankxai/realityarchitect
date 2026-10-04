import assert from 'node:assert/strict'
import test from 'node:test'
import { ENTRIES, LAYERS, MYTHS, ONE_LAW, PATHS, PRINCIPLES, SHELVES, TAG_LABEL } from '../lib/library.ts'

test('every teacher carries Keep, Mechanism and Limits, a place in the Studio, and a source', () => {
  for (const entry of ENTRIES) {
    for (const field of ['keep', 'mechanism', 'limits']) assert.ok(entry[field].length >= 40, `${entry.id}.${field} is too thin`)
    assert.ok(entry.inStudio.length >= 10, `${entry.id}.inStudio`)
    assert.ok(entry.sources.length >= 1, `${entry.id} needs a source`)
    for (const source of entry.sources) assert.match(source.url, /^https:\/\//, `${entry.id}: ${source.url}`)
    assert.ok(entry.tags.length >= 1 && entry.tags.every((tag) => tag in TAG_LABEL), entry.id)
  }
})

test('ids are unique and every shelf is stocked', () => {
  assert.equal(new Set(ENTRIES.map((entry) => entry.id)).size, ENTRIES.length)
  for (const shelf of SHELVES) assert.ok(ENTRIES.filter((entry) => entry.shelf === shelf.id).length >= 3, shelf.id)
  assert.deepEqual(SHELVES.map((shelf) => shelf.id), ['meaning', 'mechanism', 'frontier'])
})

test('the frontier shelf never claims a mechanism for wishes', () => {
  for (const entry of ENTRIES.filter((item) => item.shelf === 'frontier')) {
    assert.ok(entry.tags.includes('belief'), `${entry.id} is labeled as belief or philosophy`)
    assert.doesNotMatch(`${entry.keep} ${entry.mechanism}`, /\b(?:manifest|attract)/i, entry.id)
  }
})

test('the teachers Frank named are all on the shelf', () => {
  const names = ENTRIES.map((entry) => entry.name).join(' | ')
  for (const name of ['Neville Goddard', 'Joe Dispenza', 'Marisa Peer', 'Tony Robbins', 'Rhonda Byrne', 'Pam Grout']) assert.match(names, new RegExp(name))
})

test('every myth is quoted only to be corrected', () => {
  assert.ok(MYTHS.length >= 5)
  for (const myth of MYTHS) {
    assert.ok(myth.claim.length > 10)
    assert.ok(myth.correction.length >= 80, myth.claim)
  }
})

test('reality theory: one law, three layers, ten principles', () => {
  assert.deepEqual([...ONE_LAW], ['attention', 'belief', 'action', 'environment', 'feedback', 'outcome'])
  assert.equal(LAYERS.length, 3)
  assert.equal(PRINCIPLES.length, 10)
})

test('reading paths point at real entries', () => {
  const ids = new Set(ENTRIES.map((entry) => entry.id))
  for (const path of PATHS) for (const id of path.read) assert.ok(ids.has(id), `${path.id} -> ${id}`)
})
