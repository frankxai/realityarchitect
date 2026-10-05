import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { COMPLETE_EDITION, isOpen } from '../lib/programs/complete-edition.ts'

test('the Complete Edition opens only with a Polar hosted checkout link', () => {
  const edition = { ...COMPLETE_EDITION }
  assert.equal(isOpen({ ...edition, open: false, checkoutUrl: 'https://buy.polar.sh/polar_cl_abc' }), false, 'Frank has not opened it')
  assert.equal(isOpen({ ...edition, open: true, checkoutUrl: '' }), false, 'no link, no sale')
  for (const bad of ['http://buy.polar.sh/x', 'https://buy.polar.sh.evil.example/x', 'https://example.com/pay', 'javascript:alert(1)']) assert.equal(isOpen({ ...edition, open: true, checkoutUrl: bad }), false, bad)
  assert.equal(isOpen({ ...edition, open: true, checkoutUrl: 'https://buy.polar.sh/polar_cl_abc123' }), true)
  if (COMPLETE_EDITION.open) assert.ok(isOpen(), 'an open edition must carry a valid Polar link')
})

test('the edition discloses the synthesized voice and keeps the refund promise the site makes', () => {
  assert.match(COMPLETE_EDITION.narration, /synthesized voice/i)
  assert.match(COMPLETE_EDITION.narration, /says so aloud, and every file is labeled/i)
  assert.equal(COMPLETE_EDITION.refundDays, 30)
  assert.ok(COMPLETE_EDITION.contents.length >= 4)
})

test('the closed page shows no price and is not indexed', () => {
  const page = fs.readFileSync('app/programs/imaginal-30/complete/page.tsx', 'utf8')
  assert.match(page, /robots: isOpen\(\) \? undefined : \{ index: false/)
  assert.match(page, /open \? `\$\{priceLabel\(\)\}, once` : 'In production'/)
  const index = fs.readFileSync('app/programs/imaginal-30/page.tsx', 'utf8')
  assert.match(index, /\{open \? \(\s*<Link href="\/programs\/imaginal-30\/complete"[^]*?priceLabel\(\)[^]*?\) : \(/)
})
