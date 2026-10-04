import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { serviceWorkerSource } from '../lib/service-worker.ts'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

test('the site installs as an app that opens on the Studio', () => {
  const manifest = read('app/manifest.ts')
  assert.match(manifest, /start_url: '\/studio'/)
  assert.match(manifest, /display: 'standalone'/)
  assert.match(manifest, /sizes: '192x192'/)
  assert.match(manifest, /sizes: '512x512'/)
  assert.match(manifest, /purpose: 'maskable'/)
  assert.match(read('app/pwa-icon/[size]/route.tsx'), /dynamicParams = false/)
})

test('the offline worker is valid script, versioned per build, and caches only site pages and code', () => {
  const source = serviceWorkerSource('abc123def456')
  assert.doesNotThrow(() => new Function(source), 'the worker parses as JavaScript')
  assert.match(source, /ra-shell-abc123def456/)
  assert.match(source, /request\.method !== 'GET'\) return/, 'writes are never intercepted')
  assert.match(source, /url\.origin !== self\.location\.origin\) return/, 'other origins are never intercepted')
  assert.doesNotMatch(source, /localStorage|indexedDB|IndexedDB|postMessage|sendBeacon/, 'the worker never touches the Studio’s data')
  assert.equal(serviceWorkerSource("'; alert(1); '"), serviceWorkerSource('alert1'), 'the version cannot inject code')
})

test('the privacy page says what the offline cache holds', () => {
  assert.match(read('app/privacy/page.tsx'), /holds only what every visitor receives/)
})
