import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('assessment produces downloadable Markdown', () => {
  const assessment = read('components/Assessment.tsx')
  assert.match(assessment, /text\/markdown/)
  assert.match(assessment, /architecture-brief\.md/)
  assert.match(assessment, /navigator\.clipboard/)
  assert.match(assessment, /setTimeout\(\(\) => URL\.revokeObjectURL/)
})

test('assessment states that inputs stay local', () => {
  const assessment = read('components/Assessment.tsx')
  assert.match(assessment, /stays in this browser/i)
  assert.doesNotMatch(assessment, /\b(?:fetch|XMLHttpRequest|sendBeacon)\b/)
})

test('completed loop produces a review artifact instead of rebuilding Compound', () => {
  const assessment = read('components/Assessment.tsx')
  assert.match(assessment, /FULL_LOOP_REVIEW/)
  assert.match(assessment, /A full-loop review record/)
  assert.match(assessment, /gapIndex === -1 \? FULL_LOOP_REVIEW : gap/)
})

test('no fake email capture ships', () => {
  assert.doesNotMatch(read('components/EmailCapture.tsx'), /type="email"/)
})

test('paid offers disclose readiness boundaries', () => {
  const vault = read('app/vault/page.tsx')
  assert.match(vault, /not open for purchase/i)
  assert.match(vault, /availability is confirmed before payment/i)
})

test('public method stays inside the workflow boundary', () => {
  const method = read('components/MethodContent.tsx')
  assert.match(method, /workflow method—not a diagnosis or promise/i)
  assert.doesNotMatch(method, /placebo|vagal tone|dopamine|healing|cannot be debunked/i)
})

test('public routes own canonical metadata and sitemap coverage', () => {
  const layout = read('app/layout.tsx')
  assert.doesNotMatch(layout, /alternates:\s*\{\s*canonical:/)
  for (const route of ['', 'method', 'standard', 'assess', 'start', 'vault']) {
    const page = read(route ? `app/${route}/page.tsx` : 'app/page.tsx')
    const path = route ? `/${route}` : '/'
    assert.match(page, new RegExp(`canonical: ['\"]${path.replace('/', '\\/')}['\"]`))
    assert.match(page, new RegExp(`url: ['\"]${path.replace('/', '\\/')}['\"]`))
  }
  assert.match(read('app/sitemap.ts'), /'\/standard'/)
})
