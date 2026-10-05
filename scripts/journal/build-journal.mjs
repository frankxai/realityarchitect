#!/usr/bin/env node
/**
 * The printable 30-day journal: one page per day (the intent, the look-for, the evening witness with a place to count
 * the miss) and a snapshot page on days 7, 14, 21, 28 and 30, built from programs/imaginal-30. Writes print HTML, and
 * a PDF when a Chromium browser is given (headless print; no other dependency).
 *
 *   node scripts/journal/build-journal.mjs --out <dir> [--paper a4|letter] [--browser <path to chrome or msedge>]
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { DAYS, WEEKS, readDay, summary } from '../../lib/programs/imaginal-30.ts'

const SNAPSHOT_DAYS = new Set([7, 14, 21, 28, 30])

const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function args(argv) {
  const out = { paper: 'a4' }
  for (let i = 0; i < argv.length; i++) out[argv[i].replace(/^--/, '')] = argv[++i]
  return out
}

const lines = (n) => Array.from({ length: n }, () => '<div class="line"></div>').join('')

function dayPage(n) {
  const day = readDay(n)
  const week = WEEKS.find((item) => item.week === day.week)
  return `<section class="page">
  <header><span class="eyebrow">Week ${day.week} · ${escape(week?.name ?? '')} · Day ${String(n).padStart(2, '0')} of ${DAYS}</span><span class="date">Date ____________</span></header>
  <h1>${escape(day.title)}</h1>
  <p class="intent"><span class="label">Today's intent (planned)</span>${escape(summary(day))}</p>
  <div class="box"><span class="label">Looking for today</span>${lines(1)}</div>
  <div class="box"><span class="label">Today's rep, and when</span>${lines(1)}</div>
  <h2>Tonight · the witness</h2>
  <div class="box"><span class="label">Happened (fact)</span>${lines(2)}</div>
  <div class="box meaning"><span class="label">Meant (my meaning)</span>${lines(2)}</div>
  <div class="box"><span class="label">Did (only what is done)</span>${lines(2)}</div>
  <div class="box"><span class="label">Next (planned)</span>${lines(1)}</div>
  <p class="came"><span class="label">Did it come?</span> ☐ yes &nbsp;&nbsp; ☐ no — a miss, counted &nbsp;&nbsp; ☐ not marked</p>
  <footer>Full practice: realityarchitect.ai/programs/imaginal-30/${n}</footer>
</section>`
}

function snapshotPage(n) {
  const cadence = n === 30 ? 'The month' : `Week ${n / 7}`
  return `<section class="page">
  <header><span class="eyebrow">Snapshot · ${cadence}</span><span class="date">Date ____________</span></header>
  <h1>${cadence}, counted</h1>
  <table><tr><th>sign</th><th>win</th><th>rep</th><th>move</th><th>opening</th><th>lesson</th><th>gratitude</th></tr><tr>${'<td></td>'.repeat(7)}</tr></table>
  <p class="came"><span class="label">Signs</span> ______ primed · ______ unprimed &nbsp;&nbsp; <span class="label">Look-fors</span> set ____ · came ____ · missed ____</p>
  <div class="box"><span class="label">True now</span>${lines(2)}</div>
  <div class="box"><span class="label">What changed</span>${lines(2)}</div>
  <div class="box meaning"><span class="label">Grateful for</span>${lines(2)}</div>
  <div class="box"><span class="label">One correction</span>${lines(2)}</div>
  <p class="came"><span class="label">Sealed</span> ☐ only if it is true for me</p>
  <footer>A sealed snapshot does not change. A correction is a new note.</footer>
</section>`
}

const CSS = (paper) => `@page { size: ${paper === 'letter' ? 'letter' : 'A4'}; margin: 14mm 15mm; }
* { box-sizing: border-box; }
body { margin: 0; font-family: Georgia, "Iowan Old Style", serif; color: #1d1d1f; font-size: 10.5pt; }
.page { page-break-after: always; break-after: page; display: flex; flex-direction: column; gap: 3.2mm; min-height: 100%; }
.page:last-child { page-break-after: auto; break-after: auto; }
header { display: flex; justify-content: space-between; font-family: "Helvetica Neue", Arial, sans-serif; font-size: 8pt; letter-spacing: 0.08em; text-transform: uppercase; color: #5a5f73; }
h1 { font-family: "Helvetica Neue", Arial, sans-serif; font-size: 18pt; margin: 1mm 0 0; }
h2 { font-family: "Helvetica Neue", Arial, sans-serif; font-size: 11pt; margin: 3mm 0 0; color: #2f5bd3; }
.label { display: block; font-family: "Helvetica Neue", Arial, sans-serif; font-size: 7.5pt; letter-spacing: 0.1em; text-transform: uppercase; color: #5a5f73; margin-bottom: 1mm; }
.came .label { display: inline; }
.intent { margin: 0; }
.box { border-left: 2px solid #c9ccd8; padding-left: 3mm; }
.box.meaning { border-left-color: #b08a3e; }
.line { border-bottom: 0.6px solid #b9bccb; height: 8.5mm; }
.came { margin: 1mm 0 0; font-family: "Helvetica Neue", Arial, sans-serif; font-size: 9.5pt; }
table { width: 100%; border-collapse: collapse; font-family: "Helvetica Neue", Arial, sans-serif; font-size: 8pt; }
th { text-transform: uppercase; letter-spacing: 0.08em; color: #5a5f73; font-weight: normal; padding: 1mm; border-bottom: 0.6px solid #b9bccb; }
td { height: 11mm; border: 0.6px solid #d6d8e2; }
footer { margin-top: auto; font-family: "Helvetica Neue", Arial, sans-serif; font-size: 7.5pt; color: #8a8fa3; }
.cover { justify-content: center; text-align: left; }
.cover h1 { font-size: 30pt; }
.cover p { max-width: 120mm; line-height: 1.5; }`

function cover() {
  return `<section class="page cover">
  <p class="label">Reality Architect · the 30-day journal</p>
  <h1>The Imaginal Act</h1>
  <p>One page a day: what you intend, what you look for, and an honest record of what happened, misses included. Your words in the warm boxes are yours; nothing here promises an outcome.</p>
  <p class="label">© Frank Riemer · realityarchitect.ai</p>
</section>`
}

export function journalHtml(paper = 'a4') {
  const pages = [cover()]
  for (let n = 1; n <= DAYS; n++) {
    pages.push(dayPage(n))
    if (SNAPSHOT_DAYS.has(n)) pages.push(snapshotPage(n))
  }
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>The Imaginal Act — 30-day journal</title><style>${CSS(paper)}</style></head><body>${pages.join('\n')}</body></html>\n`
}

function main() {
  const opts = args(process.argv.slice(2))
  if (!opts.out) {
    console.error('Usage: node scripts/journal/build-journal.mjs --out <dir> [--paper a4|letter] [--browser <chrome or msedge>]')
    process.exit(2)
  }
  fs.mkdirSync(opts.out, { recursive: true })
  const html = path.resolve(opts.out, `imaginal-30-journal-${opts.paper}.html`)
  fs.writeFileSync(html, journalHtml(opts.paper))
  console.log(`→ ${html}`)
  if (opts.browser) {
    const pdf = html.replace(/\.html$/, '.pdf')
    const result = spawnSync(opts.browser, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${pdf}`, pathToFileURL(html).href], { encoding: 'utf8', timeout: 120000 })
    if (result.status !== 0 || !fs.existsSync(pdf)) throw new Error(`PDF failed: ${(result.stderr || '').slice(-800)}`)
    console.log(`→ ${pdf}`)
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) main()
