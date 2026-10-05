#!/usr/bin/env node
/**
 * Runs after `next build` (in `pnpm gate`): reads the prerendered HTML of the program pages and checks what a visitor
 * actually receives. While the Complete Edition is closed, its page and the program overview must carry no price, no
 * checkout link and no purchase terms, and the edition page must be noindex. The 30 day pages must all exist.
 * The checks are pure functions (tests/built-pages.test.mjs feeds them split-markup fixtures).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { COMPLETE_EDITION, isOpen } from '../lib/programs/complete-edition.ts'
import { DAYS } from '../lib/programs/program.ts'

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'", '#x27': "'", '#36': '$', '#x24': '$' }

/**
 * What a reader sees, as one line: scripts (the RSC payload is full of "$1"-style references), styles and tags are
 * dropped, entities decoded, and every run of whitespace becomes one space, so markup cannot split a phrase or a price.
 */
export function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, name) => ENTITIES[name.toLowerCase()] ?? match)
    .replace(/\s+/g, ' ')
    .trim()
}

/** Every way a closed page could leak a sale: a price in any common form, a checkout link, or purchase terms. */
export function closedPageProblems(html, price = COMPLETE_EDITION.price) {
  const text = visibleText(html)
  const problems = []
  const amount = String(price)
  if (/[$€£]\s?\d/.test(text) || new RegExp(`\\b(?:USD|US\\$|EUR)\\s?${amount}\\b|\\b${amount}(?:[.,]00)?\\s?(?:USD|dollars?|\\$)`, 'i').test(text)) problems.push('shows a price')
  if (/buy\.polar\.sh|polar_cl_|\/checkout\b/i.test(html)) problems.push('links to a checkout')
  if (/\brefund\s+within\b|\bone\s+payment\b|\bbuy\s+now\b|\badd\s+to\s+cart\b/i.test(text)) problems.push('shows purchase terms')
  return problems
}

function main() {
  const APP = path.join('.next', 'server', 'app')
  const read = (route) => {
    const file = path.join(APP, `${route}.html`)
    if (!fs.existsSync(file)) throw new Error(`No prerendered page for /${route} (looked for ${file}). Run next build first.`)
    return fs.readFileSync(file, 'utf8')
  }
  const failures = []
  const edition = read('programs/imaginal-30/complete')
  const overview = read('programs/imaginal-30')
  for (let day = 1; day <= DAYS; day++) if (!fs.existsSync(path.join(APP, 'programs', 'imaginal-30', `${day}.html`))) failures.push(`day ${day} was not prerendered`)
  if (!isOpen()) {
    for (const [name, page] of [['/programs/imaginal-30/complete', edition], ['/programs/imaginal-30', overview]]) {
      for (const problem of closedPageProblems(page)) failures.push(`${name}: ${problem} while the edition is closed`)
    }
    if (!/<meta name="robots" content="[^"]*noindex/.test(edition)) failures.push('/programs/imaginal-30/complete: not marked noindex while closed')
    if (!/in production/i.test(visibleText(edition))) failures.push('/programs/imaginal-30/complete: does not say it is in production')
  }
  if (failures.length) {
    console.error(`✗ built pages:\n- ${failures.join('\n- ')}`)
    process.exit(1)
  }
  console.log(`✓ built pages: ${DAYS} days prerendered; the edition is ${isOpen() ? 'open' : 'closed, with no price, checkout or purchase terms, and noindex'}`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
