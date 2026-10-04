import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { clearState, loadState, saveState } from '../lib/studio/persist.ts'
import { STORAGE_KEY } from '../lib/studio/state.ts'
import { sampleState } from '../lib/studio/sample.ts'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

function filesIn(dir) {
  const full = path.join(root, dir)
  if (!fs.existsSync(full)) return []
  return fs.readdirSync(full, { recursive: true })
    .filter((name) => /\.(ts|tsx)$/.test(name))
    .map((name) => path.join(dir, name).replaceAll('\\', '/'))
}

const studioFiles = [...filesIn('lib/studio'), ...filesIn('components/studio'), ...filesIn('app/studio')]
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

class MemoryStorage {
  constructor() { this.map = new Map() }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null }
  setItem(key, value) { this.map.set(key, String(value)) }
  removeItem(key) { this.map.delete(key) }
}

test('no studio file can send personal content anywhere', () => {
  assert.ok(studioFiles.length >= 10, 'the scan sees the studio')
  for (const file of studioFiles) {
    assert.doesNotMatch(read(file), /\b(?:fetch|XMLHttpRequest|sendBeacon|WebSocket|EventSource|analytics|telemetry)\b/, file)
  }
})

test('browser storage is touched in exactly two audited files', () => {
  for (const file of studioFiles) {
    if (file !== 'lib/studio/persist.ts') assert.doesNotMatch(read(file), /localStorage/, file)
    if (file !== 'lib/studio/images.ts') assert.doesNotMatch(read(file), /indexedDB/, file)
  }
})

test('the studio speaks through one polite live region and uses native dialogs', () => {
  const shell = read('components/studio/Studio.tsx')
  assert.equal(shell.match(/aria-live="polite"/g)?.length, 1)
  assert.match(shell, /role="status"/)
  assert.match(shell, /aria-pressed=\{view === entry\.id\}/)
  assert.match(read('components/studio/DataDialog.tsx'), /<dialog\b/)
  assert.match(read('components/studio/DataDialog.tsx'), /showModal\(\)/)
})

test('no studio form posts anywhere and the address only ever holds a view name', () => {
  for (const file of studioFiles) assert.doesNotMatch(read(file), /\baction=|method="post"/i, file)
  const shell = read('components/studio/Studio.tsx')
  assert.match(shell, /replaceState\(null, '', `#\$\{next\}`\)/)
  for (const file of studioFiles) assert.doesNotMatch(read(file), /URLSearchParams|searchParams|location\.search/, file)
})

test('the map has a keyboard route and a list equivalent', () => {
  const map = read('components/studio/MapView.tsx')
  assert.match(map, /role="region"/)
  assert.match(map, /tabIndex=\{0\}/)
  assert.match(map, /ArrowLeft/)
  assert.match(map, /function MapList/)
  assert.match(map, /passive: false/)
  assert.match(map, /if \(!event\.ctrlKey && !event\.metaKey\) return/, 'a plain wheel keeps scrolling the page')
})

test('rest mode has no timer and says what it is', () => {
  const today = read('components/studio/TodayView.tsx')
  assert.match(today, /no timer/)
  assert.match(today, /not a cause of outcomes by itself/)
  assert.doesNotMatch(today, /setInterval|countdown/i)
})

test('a full storage keeps the session usable and reports why', () => {
  const quota = { getItem: () => null, setItem: () => { const error = new Error('full'); error.name = 'QuotaExceededError'; throw error }, removeItem() {} }
  assert.deepEqual(saveState(sampleState('2026-10-04'), quota), { ok: false, reason: 'quota' })
  assert.deepEqual(saveState(sampleState('2026-10-04'), null), { ok: false, reason: 'unavailable' })
  const broken = { getItem: () => null, setItem: () => { throw new Error('nope') }, removeItem() {} }
  assert.deepEqual(saveState(sampleState('2026-10-04'), broken), { ok: false, reason: 'error' })
})

test('saved state loads back; corrupt state is recovered and kept aside, never lost silently', () => {
  const storage = new MemoryStorage()
  assert.equal(loadState(storage).status, 'empty')
  const sample = sampleState('2026-10-04')
  assert.deepEqual(saveState(sample, storage), { ok: true })
  const loaded = loadState(storage)
  assert.equal(loaded.status, 'loaded')
  assert.deepEqual(loaded.state, sample)

  storage.setItem(STORAGE_KEY, '{not json')
  const recovered = loadState(storage)
  assert.equal(recovered.status, 'recovered')
  assert.equal(recovered.state.schema, 'reality-studio')
  assert.equal(storage.getItem(`${STORAGE_KEY}.unreadable`), '{not json')

  assert.equal(loadState(null).status, 'unavailable')
  assert.equal(clearState(storage), true)
  assert.equal(storage.getItem(STORAGE_KEY), null)
})
