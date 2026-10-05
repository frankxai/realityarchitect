import assert from 'node:assert/strict'
import test from 'node:test'
import { journalHtml } from '../scripts/journal/build-journal.mjs'

test('the journal has a cover, one page per day and a snapshot page on days 7, 14, 21, 28 and 30', () => {
  const html = journalHtml('a4')
  assert.equal((html.match(/<section class="page/g) ?? []).length, 1 + 30 + 5)
  assert.equal((html.match(/class="eyebrow">Snapshot · /g) ?? []).length, 5)
  assert.match(html, /@page \{ size: A4;/)
  assert.match(journalHtml('letter'), /@page \{ size: letter;/)
  assert.match(html, /☐ no — a miss, counted/)
  assert.doesNotMatch(html, /<script/i)
})
