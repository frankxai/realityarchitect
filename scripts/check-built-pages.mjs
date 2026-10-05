#!/usr/bin/env node
/**
 * Runs after `next build` (in `pnpm gate`): reads the prerendered HTML of the program pages and checks what a visitor
 * actually receives. While the Complete Edition is closed, its page and the program overview must carry no price, no
 * checkout link and no purchase terms, and the edition page must be noindex. The 30 day pages must all exist.
 */
import fs from 'node:fs'
import path from 'node:path'
import { COMPLETE_EDITION, isOpen } from '../lib/programs/complete-edition.ts'
import { DAYS } from '../lib/programs/program.ts'

const APP = path.join('.next', 'server', 'app')

function html(route) {
  const file = path.join(APP, `${route}.html`)
  if (!fs.existsSync(file)) throw new Error(`No prerendered page for /${route} (looked for ${file}). Run next build first.`)
  return fs.readFileSync(file, 'utf8')
}

/** What a reader sees: no scripts (the RSC payload is full of "$1"-style references), no styles, no tags. */
const visible = (page) => page.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&#x27;|&#39;/g, "'")

const failures = []
const check = (ok, message) => ok || failures.push(message)

const edition = html('programs/imaginal-30/complete')
const overview = html('programs/imaginal-30')
for (let day = 1; day <= DAYS; day++) check(fs.existsSync(path.join(APP, 'programs', 'imaginal-30', `${day}.html`)), `day ${day} was not prerendered`)

if (!isOpen()) {
  for (const [name, page] of [['/programs/imaginal-30/complete', edition], ['/programs/imaginal-30', overview]]) {
    const text = visible(page)
    check(!/\$\s?\d/.test(text), `${name}: shows a price while the edition is closed`)
    check(!text.includes(`${COMPLETE_EDITION.price} USD`) && !text.includes(`$${COMPLETE_EDITION.price}`), `${name}: shows the price`)
    check(!/buy\.polar\.sh|polar_cl_/.test(page), `${name}: links to a checkout while the edition is closed`)
    check(!/refund within|One payment/i.test(text), `${name}: shows purchase terms while the edition is closed`)
  }
  check(/<meta name="robots" content="[^"]*noindex/.test(edition), '/programs/imaginal-30/complete: not marked noindex while closed')
  check(/in production/i.test(edition), '/programs/imaginal-30/complete: does not say it is in production')
}

if (failures.length) {
  console.error(`✗ built pages:\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log(`✓ built pages: ${DAYS} days prerendered; the edition is ${isOpen() ? 'open' : 'closed, with no price, checkout or purchase terms, and noindex'}`)
