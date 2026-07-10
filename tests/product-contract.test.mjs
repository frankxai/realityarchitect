import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('assessment produces downloadable Markdown', () => {
  const assessment = read('components/Assessment.tsx')
  assert.match(assessment, /text\/markdown/)
  assert.match(assessment, /architecture-brief\.md/)
  assert.match(assessment, /navigator\.clipboard/)
})

test('assessment states that inputs stay local', () => {
  assert.match(read('components/Assessment.tsx'), /stays in this browser/i)
})

test('no fake email capture ships', () => {
  assert.doesNotMatch(read('components/EmailCapture.tsx'), /type="email"/)
})

test('paid offers disclose readiness boundaries', () => {
  const vault = read('app/vault/page.tsx')
  assert.match(vault, /not open for purchase/i)
  assert.match(vault, /availability is confirmed before payment/i)
})
