import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { CREATOR_SHARE, OFFERS, PAID_OPEN, PROMISES, RENDER_PACK } from '../lib/offers.ts'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const page = read('app/pricing/page.tsx')
const doc = read('docs/strategy/OFFER-AND-DELIVERY.md')
const offer = (id) => OFFERS.find((item) => item.id === id)

test('the page sells nothing until checkout exists and Frank opens it', () => {
  assert.equal(PAID_OPEN, false)
  assert.match(page, /\{!PAID_OPEN && \(/)
  assert.match(page, /nothing is for sale today/)
  assert.doesNotMatch(page, /checkout|polar\.sh|buy now|<form/i, 'no checkout, link to a checkout, or capture form yet')
})

test('the prices match the worked-out offer document', () => {
  assert.equal(offer('free').price, '$0')
  assert.equal(offer('architect').price, '$19')
  assert.match(offer('architect').alternative, /\$190 per year/)
  assert.equal(offer('founding').price, '$120')
  assert.match(offer('founding').alternative, /first 1,000/)
  assert.equal(offer('guide').price, '$79')
  assert.equal(offer('school').price, '$490')
  assert.equal(`${RENDER_PACK.renders} for ${RENDER_PACK.price}`, '120 for $9')
  assert.equal(CREATOR_SHARE, '85%')
  for (const figure of ['$19/month', '$190/year', '$120/year', '$79/month', '$490 per seat', '$9: break-even', 'creators keep 85%']) assert.ok(doc.includes(figure), `the document states ${figure}`)
})

test('the promises are a refund policy and a no-outcome promise, never a conditional guarantee', () => {
  const text = PROMISES.join(' ')
  assert.match(text, /30-day refund, no questions asked/)
  assert.match(text, /never promise outcomes/i)
  assert.match(text, /export is complete on every plan/i)
  assert.doesNotMatch(`${text} ${page} ${JSON.stringify(OFFERS)}`, /if you('|’)re not (transformed|satisfied)|guaranteed results|guarantee/i)
})

test('free means everything on the device, and nothing not yet built is sold as present', () => {
  const free = offer('free').includes.join(' ')
  for (const capability of ['Reality Studio', 'offline', 'Patterns over time', 'Complete export']) assert.ok(free.includes(capability), capability)
  assert.match(free, /once accounts open/, 'renders are marked as not yet available')
})

test('pricing is reachable: navigation, sitemap, canonical', () => {
  assert.match(read('lib/site.ts'), /\{ label: 'Pricing', href: '\/pricing' \}/)
  assert.match(read('app/sitemap.ts'), /'\/pricing'/)
  assert.match(page, /canonical: '\/pricing'/)
})
