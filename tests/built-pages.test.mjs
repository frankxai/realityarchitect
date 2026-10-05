import assert from 'node:assert/strict'
import test from 'node:test'
import { closedPageProblems, visibleText } from '../scripts/check-built-pages.mjs'

const page = (body, scripts = '') => `<!doctype html><html><head><title>x</title></head><body>${body}${scripts}</body></html>`

test('a clean closed page passes, whatever the RSC payload holds', () => {
  const html = page('<p>Complete Edition · in production</p><a href="/programs/imaginal-30/1">Begin day 1, free</a>', '<script>self.__next_f.push([1,"$1:[\\"$\\",\\"div\\",null,{}]\\n$L7"])</script>')
  assert.deepEqual(closedPageProblems(html, 39), [])
  assert.equal(visibleText(html), 'x Complete Edition · in production Begin day 1, free')
})

test('split markup cannot hide a price or purchase terms', () => {
  const leaks = [
    ['USD <span>39</span>', 'shows a price'],
    ['<b>$</b>39', 'shows a price'],
    ['&#36;39', 'shows a price'],
    ['39<span> </span>USD', 'shows a price'],
    ['€39', 'shows a price'],
    ['Refund <strong>within</strong> 30 days', 'shows purchase terms'],
    ['One <em>payment</em>, every update', 'shows purchase terms'],
    ['One\n      payment', 'shows purchase terms'],
    ['<a href="https://buy.polar.sh/polar_cl_abc">Get it</a>', 'links to a checkout'],
  ]
  for (const [body, problem] of leaks) assert.ok(closedPageProblems(page(body), 39).includes(problem), `${body} → ${problem}`)
})

test('ordinary numbers are not prices', () => {
  assert.deepEqual(closedPageProblems(page('<p>Fourteen tracks, about 75 minutes. Day 39 does not exist; 30 days.</p>'), 39), [])
})
