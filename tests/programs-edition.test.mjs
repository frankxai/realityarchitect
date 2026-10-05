import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { COMPLETE_EDITION, isOpen } from '../lib/programs/complete-edition.ts'

test('the Complete Edition opens only with a Polar hosted checkout link', () => {
  const edition = { ...COMPLETE_EDITION }
  assert.equal(isOpen({ ...edition, open: false, checkoutUrl: 'https://buy.polar.sh/polar_cl_abc' }), false, 'Frank has not opened it')
  assert.equal(isOpen({ ...edition, open: true, checkoutUrl: '' }), false, 'no link, no sale')
  for (const bad of ['http://buy.polar.sh/polar_cl_abc', 'https://buy.polar.sh.evil.example/polar_cl_abc', 'https://example.com/pay', 'javascript:alert(1)', 'https://polar.sh/blog', 'https://polar.sh/realityarchitect', 'https://buy.polar.sh/x', 'https://buy.polar.sh/polar_cl_abc/../x', 'https://buy.polar.sh/polar_cl_abc#x', 'https://user:pw@buy.polar.sh/polar_cl_abc', 'https://buy.polar.sh:8443/polar_cl_abc', 'not a url']) {
    assert.equal(isOpen({ ...edition, open: true, checkoutUrl: bad }), false, bad)
  }
  for (const good of ['https://buy.polar.sh/polar_cl_abc123', 'https://buy.polar.sh/polar_cl_abc123?discount_code=LAUNCH', 'https://buy.polar.sh/polar_cl_abc?discount_code=LAUNCH&utm_campaign=fall+launch']) assert.equal(isOpen({ ...edition, open: true, checkoutUrl: good }), true, good)
  if (COMPLETE_EDITION.open) assert.ok(isOpen(), 'an open edition must carry a valid Polar link')
})

test('the edition discloses the synthesized voice and keeps the refund promise the site makes', () => {
  assert.match(COMPLETE_EDITION.narration, /synthesized voice/i)
  assert.match(COMPLETE_EDITION.narration, /says so aloud, and every file is labeled/i)
  assert.equal(COMPLETE_EDITION.refundDays, 30)
  assert.ok(COMPLETE_EDITION.contents.length >= 4)
})

/** The component's source with every open-only branch removed: what a visitor can see while the edition is closed. */
function closedView(source) {
  const body = source.slice(source.indexOf('export default function'))
  return body
    .replace(/\{open \? \(([\s\S]*?)\) : \(/g, '{(')
    .replace(/open \? `[^`]*` : /g, '')
}

test('the closed pages show no price, no checkout and no purchase terms, and are not indexed', () => {
  const page = fs.readFileSync('app/programs/imaginal-30/complete/page.tsx', 'utf8')
  const index = fs.readFileSync('app/programs/imaginal-30/page.tsx', 'utf8')
  assert.match(page, /robots: isOpen\(\) \? undefined : \{ index: false/)
  assert.match(page, /: `\$\{ABOUT\} In production\.`/, 'the closed description says it is in production')
  for (const [name, source] of [['complete', page], ['index', index]]) {
    assert.match(source, /priceLabel\(\)/, `${name} shows the price when open`)
    // The rendered check lives in scripts/check-built-pages.mjs (after next build); this pins the switch to isOpen().
    assert.match(source, /const open = isOpen\(\)/, `${name}: the page's open state comes from isOpen()`)
    assert.doesNotMatch(closedView(source), /priceLabel\(\)|checkoutUrl|helps keep the free program free/, `${name}: price, checkout or purchase copy outside an open branch`)
  }
  const ABOUT = /const ABOUT =\s*'([^']*)'/.exec(page)[1]
  for (const text of [ABOUT, COMPLETE_EDITION.narration, ...COMPLETE_EDITION.contents.flatMap((item) => [item.title, item.detail])]) {
    assert.doesNotMatch(text, /\$\s?\d|\brefund\b|\bpay(?:ment)?\b/i, text)
  }
})
