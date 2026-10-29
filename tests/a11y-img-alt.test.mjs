import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const script = fileURLToPath(new URL('../scripts/check-a11y-img-alt.mjs', import.meta.url))

function check(html, missingRoute) {
  const root = mkdtempSync(path.join(tmpdir(), 'reality-a11y-'))
  try {
    const output = path.join(root, '.next/server/app')
    mkdirSync(output, { recursive: true })
    for (const route of ['index', 'start', 'assess']) {
      if (route !== missingRoute) writeFileSync(path.join(output, `${route}.html`), html)
    }
    return spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' })
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

test('built image check accepts described and intentionally decorative images', () => {
  const result = check('<img src="diagram.png" alt="Five ordered moves"><img src="dawn.png" alt="">')
  assert.equal(result.status, 0, result.stderr)
})

test('quoted angle brackets do not truncate an image tag before its alt', () => {
  const result = check('<img title="Now > Next" alt="Five ordered moves">')
  assert.equal(result.status, 0, result.stderr)
})

test('built image check rejects a missing alt on every inspected route', () => {
  const result = check('<img src="diagram.png">')
  assert.equal(result.status, 1)
  for (const route of ['index', 'start', 'assess']) assert.match(result.stderr, new RegExp(`${route}\\.html`))
})

test('alt inside another attribute cannot satisfy the built image check', () => {
  for (const html of ['<img title="alt=described">', '<img data-alt="description">']) {
    const result = check(html)
    assert.equal(result.status, 1, html)
    assert.match(result.stderr, /Missing alt attribute/)
  }
})

test('built image check fails closed when an expected route is missing', () => {
  const result = check('<img alt="">', 'assess')
  assert.equal(result.status, 1)
  assert.match(result.stderr, /Build artifact not found: .*assess\.html/)
})
