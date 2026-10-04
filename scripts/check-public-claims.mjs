#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

// plugins/ and standard/ ship to people and agents too, so the same rules apply there.
const roots = ['app', 'components', 'lib', 'public', 'plugins', 'standard']
const files = ['README.md']
const extensions = new Set(['.ts', '.tsx', '.md', '.txt'])
const blocked = [
  /only skill that matters/i,
  /runs? without you/i,
  /not doing it at all/i,
  /improves? while you sleep/i,
  /earning on autopilot/i,
  /system that runs itself/i,
  /change your life/i,
  /prompts that actually convert/i,
  /cannot be debunked/i,
  /placebo neurobiology/i,
  /vagal tone/i,
  /ancient wisdom and modern science converge/i,
  /reducing execution friction by 10×/i,
  /guaranteed (?:results|manifestation|outcomes?)/i,
]

// Teacher names and the manifestation claims the Library corrects may appear in exactly one place: the Library's
// data, where every entry carries Keep / Mechanism / Limits and every quoted myth carries its correction
// (tests/library.test.mjs). Everywhere else they stay blocked, so no page can assert or anchor on them.
const LIBRARY = 'lib/library.ts'
const libraryOnly = [
  /joe dispenza/i,
  /raise your vibration/i,
  /attract(?:s|ing)? (?:money|wealth|abundance)/i,
  /quantum (?:proof|proves|physics proves)/i,
  /law of attraction (?:is|as) (?:a )?(?:real|proven|scientific)/i,
  /heal(?:s|ing)? (?:cancer|disease|illness)/i,
  /thoughts? (?:are|is) (?:a )?frequenc/i,
]

function walk(dir) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(target)
    else if (extensions.has(path.extname(entry.name))) files.push(target)
  }
}

for (const root of roots) walk(root)

const failures = []
for (const file of files) {
  const body = fs.readFileSync(file, 'utf8')
  for (const phrase of blocked) if (phrase.test(body)) failures.push(`${file} matches ${phrase}`)
  if (file.split(path.sep).join('/') === LIBRARY) continue
  for (const phrase of libraryOnly) if (phrase.test(body)) failures.push(`${file} matches ${phrase} (allowed only in ${LIBRARY})`)
}

if (failures.length) {
  console.error('Public claims gate failed:')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log(`✓ public claims gate passed across ${files.length} files`)
