import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const story = read('components/ScrollStory.tsx')
const css = read('components/ScrollStory.module.css')

test('the story ships no client JavaScript: motion is CSS bound to the reader’s scroll', () => {
  assert.doesNotMatch(story, /^'use client'/m)
  assert.doesNotMatch(story, /useEffect|useState|addEventListener|requestAnimationFrame/)
  assert.match(css, /animation-timeline: --story/)
  assert.match(css, /animation-timeline: view\(\)/)
  assert.doesNotMatch(css, /transition: all|animation-iteration-count: infinite/)
})

test('motion exists only with scroll-timeline support and no reduced-motion preference; otherwise a static sequence', () => {
  const guarded = css.indexOf('@supports (animation-timeline: view())')
  assert.ok(guarded > 0)
  assert.ok(css.indexOf('prefers-reduced-motion: no-preference', guarded) > guarded)
  const before = css.slice(0, guarded)
  assert.match(before, /\.stage \{\s*display: none;/, 'the pinned stage is off by default')
  assert.doesNotMatch(before, /animation:/, 'no animation outside the guard')
  assert.match(css, /\.still \{\s*display: none;/, 'the inline stills give way only when the stage takes over')
})

test('every frame is decorative, its provenance recorded, and the words carry the meaning', () => {
  assert.equal((story.match(/alt=""/g) ?? []).length, 2, 'stage and still images are both decorative')
  assert.match(story, /aria-hidden="true"/)
  const manifest = read('media/story/MANIFEST.md')
  for (const file of fs.readdirSync(path.join(root, 'media/story')).filter((name) => name.endsWith('.webp'))) {
    assert.match(manifest, new RegExp(file.replace('.', '\\.')), `${file} has a provenance row`)
    assert.ok(fs.statSync(path.join(root, 'media/story', file)).size < 200_000, `${file} stays light`)
  }
  for (const label of ['reported', 'desired', 'planned', 'approved']) assert.match(story, new RegExp(`register: '[^']*${label}`))
  assert.match(story, /Desired, never promised\./)
})

test('the homepage tells the story right after the hero and keeps every job', () => {
  const home = read('app/page.tsx')
  assert.match(home, /<ScrollStory \/>/)
  assert.ok(home.indexOf('<ScrollStory />') < home.indexOf('aria-labelledby="inner-title"'))
  assert.match(home, /<ArchitectLoopMap \/>/)
  assert.match(home, /<EmailCapture \/>/)
})
