import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../components/Assessment.tsx', import.meta.url), 'utf8')

test('every assess button and link uses the shared focus ring', () => {
  assert.match(
    source,
    /const focusRing =\s*'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg'/,
  )

  const starts = [...source.matchAll(/<(?:button|Link)\b/g)]
  assert.equal(starts.length, 5)
  for (const start of starts) {
    const slice = source.slice(start.index, start.index + 900)
    const className = slice.match(/className=(?:"[^"]*"|\{`[^`]*`\}|\{[^}]*\})/)
    assert.ok(className, 'control is missing className')
    assert.match(className[0], /focusRing/)
  }
})
