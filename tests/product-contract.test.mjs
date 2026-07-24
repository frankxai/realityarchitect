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

test('clipboard success and failure feedback is announced accessibly', () => {
  const assessment = read('components/Assessment.tsx')
  assert.match(assessment, /role="status"/)
  assert.match(assessment, /aria-live="polite"/)
  assert.match(assessment, /aria-atomic="true"/)
  assert.match(assessment, /copyState === 'copied' \? 'Brief copied\.'/)
  assert.match(assessment, /copyState === 'failed' \? 'Copy was blocked by the browser; use the download instead\.'/)
})

test('assessment content fields have no network, persistence, or telemetry sink', () => {
  const assessment = read('components/Assessment.tsx')
  assert.match(assessment, /stays in this browser/i)
  for (const field of ['answers', 'systemName', 'repeatingJob']) {
    assert.match(assessment, new RegExp(`\\b${field}\\b`))
  }
  assert.doesNotMatch(
    assessment,
    /\b(?:fetch|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|URLSearchParams|FormData|analytics|telemetry)\b/,
  )
  assert.doesNotMatch(assessment, /<form\b|\baction=/)
})

test('privacy route states the local boundary without claiming zero server logs', () => {
  const privacy = read('app/privacy/page.tsx')
  assert.match(privacy, /ordinary server logs still exist/i)
  assert.match(privacy, /IP address, timestamp, requested path/i)
  assert.match(privacy, /do not contain your assessment answers, system name, repeating job, or generated brief/i)
  assert.match(privacy, /No analytics or telemetry provider is active/i)
  assert.doesNotMatch(privacy, /(?:no|zero) (?:server|hosting|cdn) logs/i)
})

test('completed loop produces a review artifact instead of rebuilding Compound', () => {
  const assessment = read('components/Assessment.tsx')
  assert.match(assessment, /FULL_LOOP_REVIEW/)
  assert.match(assessment, /A full-loop review record/)
  assert.match(assessment, /gapIndex === -1 \? FULL_LOOP_REVIEW : gap/)
})

test('signup success is impossible without provider acceptance', () => {
  const capture = read('components/EmailCapture.tsx')

  // Until a provider-backed route exists, this surface is deliberately a pair
  // of honest product links—not a form that can manufacture a success state.
  assert.doesNotMatch(capture, /<form\b/)
  assert.doesNotMatch(capture, /type="email"/)
  assert.doesNotMatch(capture, /\bfetch\s*\(/)
  assert.doesNotMatch(capture, /\/api\/(?:subscribe|waitlist)/)
  assert.doesNotMatch(capture, /(?:you're in|check your inbox|subscribed|signup (?:complete|successful))/i)
  assert.match(capture, /href="\/assess"/)
  assert.match(capture, /No account or email required\./)
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
  const site = read('lib/site.ts')
  assert.doesNotMatch(layout, /alternates:\s*\{\s*canonical:/)
  assert.match(site, /url: ['"]https:\/\/www\.realityarchitect\.ai['"]/)
  assert.doesNotMatch(site, /url: ['"]https:\/\/realityarchitect\.ai['"]/)
  for (const route of ['', 'method', 'standard', 'assess', 'start', 'vault', 'privacy']) {
    const page = read(route ? `app/${route}/page.tsx` : 'app/page.tsx')
    const path = route ? `/${route}` : '/'
    assert.match(page, new RegExp(`canonical: ['\"]${path.replace('/', '\\/')}['\"]`))
    assert.match(page, new RegExp(`url: ['\"]${path.replace('/', '\\/')}['\"]`))
  }
  const sitemap = read('app/sitemap.ts')
  const robots = read('app/robots.ts')
  assert.match(sitemap, /'\/standard'/)
  assert.match(sitemap, /'\/privacy'/)
  assert.match(sitemap, /url: `\$\{site\.url\}\$\{path\}`/)
  assert.match(robots, /sitemap: `\$\{site\.url\}\/sitemap\.xml`/)
  assert.match(read('lib/site.ts'), /label: 'Privacy', href: '\/privacy'/)
  assert.match(read('components/Footer.tsx'), /href="\/privacy"/)

  const publicUrlSources = [
    'lib/site.ts',
    'app/layout.tsx',
    'app/page.tsx',
    'app/method/page.tsx',
    'app/standard/page.tsx',
    'app/assess/page.tsx',
    'app/start/page.tsx',
    'app/vault/page.tsx',
    'app/privacy/page.tsx',
    'app/robots.ts',
    'app/sitemap.ts',
    'package.json',
    'public/llms.txt',
    'README.md',
    'standard/README.md',
    'starter/README.md',
  ].map(read).join('\n')
  assert.doesNotMatch(publicUrlSources, /https:\/\/realityarchitect\.ai\b/)
})

test('security headers prevent embedding and unsafe base or object content', () => {
  const config = read('next.config.mjs')
  assert.match(config, /Content-Security-Policy/)
  assert.match(config, /frame-ancestors 'self'/)
  assert.match(config, /base-uri 'self'/)
  assert.match(config, /object-src 'none'/)
})
