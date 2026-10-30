import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { COMPLETE_EDITION, FILES, THANKS_PATH, confirmationEmail, isOpen, launchGaps } from '../lib/programs/complete-edition.ts'

/** Everything but the checkout link in place, so each test isolates one field. */
const READY = { portalUrl: 'https://polar.sh/realityarchitect/portal', supportEmail: 'hello@realityarchitect.ai' }

test('the Complete Edition opens only with a Polar hosted checkout link', () => {
  const edition = { ...COMPLETE_EDITION, ...READY }
  assert.equal(isOpen({ ...edition, open: false, checkoutUrl: 'https://buy.polar.sh/polar_cl_abc' }), false, 'Frank has not opened it')
  assert.equal(isOpen({ ...edition, open: true, checkoutUrl: '' }), false, 'no link, no sale')
  for (const bad of ['http://buy.polar.sh/polar_cl_abc', 'https://buy.polar.sh.evil.example/polar_cl_abc', 'https://example.com/pay', 'javascript:alert(1)', 'https://polar.sh/blog', 'https://polar.sh/realityarchitect', 'https://buy.polar.sh/x', 'https://buy.polar.sh/polar_cl_abc/../x', 'https://buy.polar.sh/polar_cl_abc#x', 'https://user:pw@buy.polar.sh/polar_cl_abc', 'https://buy.polar.sh:8443/polar_cl_abc', 'not a url']) {
    assert.equal(isOpen({ ...edition, open: true, checkoutUrl: bad }), false, bad)
  }
  for (const good of ['https://buy.polar.sh/polar_cl_abc123', 'https://buy.polar.sh/polar_cl_abc123?discount_code=LAUNCH', 'https://buy.polar.sh/polar_cl_abc?discount_code=LAUNCH&utm_campaign=fall+launch']) assert.equal(isOpen({ ...edition, open: true, checkoutUrl: good }), true, good)
  if (COMPLETE_EDITION.open) assert.deepEqual(launchGaps(), [], 'open is set, so every link and address must be in place')
})

test('the edition opens only when a buyer can download the files again and reach a person', () => {
  const edition = { ...COMPLETE_EDITION, ...READY, open: true, checkoutUrl: 'https://buy.polar.sh/polar_cl_abc123' }
  assert.equal(isOpen(edition), true)
  assert.deepEqual(launchGaps(edition), [])
  for (const bad of ['', 'http://polar.sh/realityarchitect/portal', 'https://polar.sh.evil.example/realityarchitect/portal', 'https://polar.sh/realityarchitect', 'https://polar.sh/realityarchitect/portal/x', 'https://polar.sh/realityarchitect/portal?x=1', 'https://polar.sh/realityarchitect/portal#x', 'https://u:p@polar.sh/realityarchitect/portal', 'javascript:alert(1)']) {
    assert.equal(isOpen({ ...edition, portalUrl: bad }), false, bad)
  }
  for (const bad of ['', 'hello', 'hello@', 'a b@realityarchitect.ai', '"x"@realityarchitect.ai', 'hello@realityarchitect']) {
    assert.equal(isOpen({ ...edition, supportEmail: bad }), false, bad)
  }
  assert.equal(launchGaps({ ...COMPLETE_EDITION, checkoutUrl: '', portalUrl: '', supportEmail: '' }).length, 3, 'each missing field is named')
})

test('the confirmation copy says where the files are, how to get help, and promises nothing', () => {
  const { subject, body } = confirmationEmail({ ...COMPLETE_EDITION, ...READY })
  assert.ok(subject.length > 0 && subject.length < 70)
  assert.ok(body.includes(READY.portalUrl), 'portal link')
  assert.ok(body.includes(READY.supportEmail), 'support address')
  assert.match(body, new RegExp(`refund within ${COMPLETE_EDITION.refundDays} days needs no reason`))
  assert.match(body, /synthesized voice/)
  assert.match(body, /promises no outcome/)
  for (const file of FILES) assert.ok(body.includes(file.name), file.name)
  assert.doesNotMatch(body, /\$\s?\d|guarantee|income|earn|transform|manifest|abundance/i)
  assert.doesNotMatch(body, /<portalUrl>|<supportEmail>/, 'no placeholders once configured')
})

test('the thanks page is never indexed or listed, and delivers nothing while closed', () => {
  const page = fs.readFileSync('app/programs/imaginal-30/complete/thanks/page.tsx', 'utf8')
  const sitemap = fs.readFileSync('app/sitemap.ts', 'utf8')
  assert.equal(THANKS_PATH, '/programs/imaginal-30/complete/thanks')
  assert.match(page, /robots: \{ index: false, follow: false \}/)
  assert.doesNotMatch(sitemap, /thanks/)
  assert.match(page, /const open = isOpen\(\)/)
  const closed = /if \(!open\) \{([\s\S]*?)\n  \}\n/.exec(page)?.[1]
  assert.ok(closed, 'the closed branch returns early')
  assert.match(closed, /Nothing to collect here yet/)
  assert.doesNotMatch(closed, /portalUrl|supportEmail|checkoutUrl|priceLabel|refund/)
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
    assert.doesNotMatch(closedView(source), /priceLabel\(\)|checkoutUrl|portalUrl|supportEmail|helps keep the free program free/, `${name}: price, checkout, delivery or purchase copy outside an open branch`)
  }
  const ABOUT = /const ABOUT =\s*'([^']*)'/.exec(page)[1]
  for (const text of [ABOUT, COMPLETE_EDITION.narration, ...COMPLETE_EDITION.contents.flatMap((item) => [item.title, item.detail])]) {
    assert.doesNotMatch(text, /\$\s?\d|\brefund\b|\bpay(?:ment)?\b/i, text)
  }
})
