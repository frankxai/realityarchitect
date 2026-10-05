import assert from 'node:assert/strict'
import test from 'node:test'
import { buildOrder } from '../scripts/book/build-book.mjs'

test("the book's chapter order comes from the outline's Build order block", () => {
  const outline = '# Outline\n\n## Contents\n\n```\nnot-this.md\n```\n\n## Build order\n\nPandoc takes files in this order:\n\n```\n01-how-to-read.md\n02-the-one-law.md\n\n90-sources.md\n```\n\nPart pages come from the template.\n'
  assert.deepEqual(buildOrder(outline), ['01-how-to-read.md', '02-the-one-law.md', '90-sources.md'])
  assert.deepEqual(buildOrder('# No order here\n'), [])
})

test('a chapter name that Pandoc would read as an option is never in the build order', () => {
  const outline = '## Build order\n\n```\n-o.md\n--output=x.md\n01-ok.md\n```\n'
  assert.deepEqual(buildOrder(outline), ['01-ok.md'])
})
