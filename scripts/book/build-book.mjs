#!/usr/bin/env node
/**
 * Builds a book written as Markdown chapters into EPUB3 (and a print-ready HTML) with Pandoc. The chapter order is the
 * "Build order" code block in the source's 00-outline.md; chapters not written yet are skipped and listed. Register
 * blocks are Pandoc fenced divs (`::: {.meaning}`, `.mechanism`, `.limits`, `.practice`) whose first line is a visible
 * bold label, so they read correctly on any reader, styled or not.
 *
 *   node scripts/book/build-book.mjs --src <chapters dir> --out <dir> [--title …] [--subtitle …] [--author …] [--cover cover.jpg]
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))

function args(argv) {
  const out = { title: 'The Honest Canon', subtitle: 'Reality Theory and the Practice of Architecting a Life', author: 'Frank Riemer' }
  for (let i = 0; i < argv.length; i++) out[argv[i].replace(/^--/, '')] = argv[++i]
  // Absolute paths, so no chapter path can ever start with "-" and be read by Pandoc as an option.
  for (const key of ['src', 'out', 'cover']) if (out[key]) out[key] = path.resolve(out[key])
  return out
}

/** The chapter files named in the outline's "Build order" block, in order. */
export function buildOrder(outline) {
  const section = outline.split(/^## Build order\s*$/m)[1] ?? ''
  const block = /```[^\n]*\n([\s\S]*?)```/.exec(section)
  return block ? block[1].split(/\r?\n/).map((line) => line.trim()).filter((line) => /^(?!-)[\w.-]+\.md$/.test(line)) : []
}

function pandoc(list) {
  const result = spawnSync('pandoc', list, { encoding: 'utf8' })
  if (result.status !== 0) throw new Error(`pandoc failed: ${result.stderr.slice(-1500)}`)
  return result.stderr
}

function main() {
  const opts = args(process.argv.slice(2))
  if (!opts.src || !opts.out) {
    console.error('Usage: node scripts/book/build-book.mjs --src <dir> --out <dir> [--title …] [--author …] [--cover file]')
    process.exit(2)
  }
  const order = buildOrder(fs.readFileSync(path.join(opts.src, '00-outline.md'), 'utf8'))
  if (!order.length) throw new Error('No "## Build order" block in 00-outline.md')
  const present = order.filter((file) => fs.existsSync(path.join(opts.src, file)))
  const missing = order.filter((file) => !present.includes(file))
  fs.mkdirSync(opts.out, { recursive: true })
  const year = new Date().getFullYear()
  const meta = [
    '--metadata', `title=${opts.title}`,
    '--metadata', `subtitle=${opts.subtitle}`,
    '--metadata', `author=${opts.author}`,
    '--metadata', 'lang=en',
    '--metadata', `rights=© ${year} ${opts.author}. All rights reserved.`,
    '--metadata', `date=${new Date().toISOString().slice(0, 10)}`,
  ]
  const inputs = present.map((file) => path.join(opts.src, file))
  const slug = opts.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const epub = path.join(opts.out, `${slug}.epub`)
  const cover = opts.cover && fs.existsSync(opts.cover) ? ['--epub-cover-image', opts.cover] : []
  const warnings = pandoc(['--from', 'markdown+fenced_divs+smart', '--to', 'epub3', '--toc', '--toc-depth', '2', '--split-level', '1', '--css', path.join(here, 'book.css'), ...cover, ...meta, '-o', epub, ...inputs])
  const html = path.join(opts.out, `${slug}.html`)
  pandoc(['--from', 'markdown+fenced_divs+smart', '--to', 'html5', '--standalone', '--embed-resources', '--toc', '--toc-depth', '2', '--css', path.join(here, 'book.css'), ...meta, '-o', html, ...inputs])
  const words = inputs.reduce((total, file) => total + fs.readFileSync(file, 'utf8').replace(/^:::.*$/gm, '').split(/\s+/).filter(Boolean).length, 0)
  console.log(`${present.length} chapters, about ${words.toLocaleString('en')} words → ${epub}`)
  if (missing.length) console.log(`Not written yet (skipped): ${missing.join(', ')}`)
  if (warnings.trim()) console.log(`Pandoc notes:\n${warnings.trim()}`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
