import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { libraryData } from '../scripts/build-plugin-data.mjs'
import { ENTRIES } from '../lib/library.ts'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const plugin = path.join(root, 'plugins/reality-architect')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')
const skills = fs.readdirSync(path.join(plugin, 'skills'))

test('the plugin ships the exact Agent Charter that every skill reads first', () => {
  assert.equal(read('plugins/reality-architect/CHARTER.md'), read('standard/AGENT-CHARTER.md'), 'run pnpm plugin:data')
  for (const skill of skills) assert.match(read(`plugins/reality-architect/skills/${skill}/SKILL.md`), /read `CHARTER\.md` at the root of this plugin/, skill)
})

test('the plugin ships the state formats its skills follow, and never points outside itself', () => {
  assert.equal(read('plugins/reality-architect/STATE.md'), read('standard/STATE.md'), 'run pnpm plugin:data')
  for (const skill of skills) {
    const body = read(`plugins/reality-architect/skills/${skill}/SKILL.md`)
    assert.doesNotMatch(body, /(?<![\w/.])standard\//, `${skill} points at standard/, which an installed plugin cannot reach`)
  }
})

test('the Library tutor teaches from generated Library data, never its own list', () => {
  const mirror = JSON.parse(read('plugins/reality-architect/skills/reality-library/library.json'))
  assert.deepEqual(mirror, JSON.parse(JSON.stringify(libraryData())), 'run pnpm plugin:data')
  const names = [...ENTRIES.map((entry) => entry.name), 'Goddard', 'Dispenza', 'Robbins', 'Byrne', 'Grout', 'Hicks', 'Maltz']
  for (const skill of skills) {
    const body = read(`plugins/reality-architect/skills/${skill}/SKILL.md`)
    for (const name of names) assert.ok(!body.includes(name), `${skill} names ${name}; teacher names live in lib/library.ts`)
  }
})

test('every SKILL.md has valid, quoted frontmatter matching its folder', () => {
  assert.equal(skills.length, 9)
  for (const skill of skills) {
    const body = read(`plugins/reality-architect/skills/${skill}/SKILL.md`)
    const match = /^---\n([\s\S]*?)\n---\n/.exec(body.replace(/\r\n/g, '\n'))
    assert.ok(match, `${skill} has frontmatter`)
    const lines = match[1].split('\n')
    assert.deepEqual(lines.map((line) => line.split(':')[0]), ['name', 'description'], skill)
    assert.equal(lines[0], `name: ${skill}`)
    assert.match(lines[1], /^description: "[^"\\]{40,}"$/, `${skill}: description must be one double-quoted string with no inner quotes`)
  }
})

test('skills that write ask first and resolve an absolute home', () => {
  for (const skill of skills.filter((name) => name !== 'reality-library')) {
    const body = read(`plugins/reality-architect/skills/${skill}/SKILL.md`)
    assert.match(body, /(?:after (?:a|an explicit) yes|only after an explicit yes|Only an explicit yes)/i, `${skill} asks before writing`)
    assert.match(body, /REALITY_HOME/, `${skill} resolves the home`)
  }
  assert.match(read('plugins/reality-architect/skills/reality-onboard/SKILL.md'), /Never create files in the\s+current working directory/)
  assert.match(read('plugins/reality-architect/skills/reality-daily/SKILL.md'), /never remove,\s+reorder or rewrite anything already there/)
})

test('witness keeps planned apart from done and counts misses', () => {
  const witness = read('plugins/reality-architect/skills/reality-witness/SKILL.md')
  assert.match(witness, /\*\*Next \(planned\):\*\*/)
  assert.match(witness, /only what is \*\*already done\*\*/)
  assert.match(witness, /`Did it come:` to `no`/)
  assert.match(read('plugins/reality-architect/skills/reality-snapshot/SKILL.md'), /cadence: monthly/)
  assert.match(read('plugins/reality-architect/skills/reality-bridge/SKILL.md'), /With moves only \(no reps\):\*\* never divide by zero/)
})

test('plugin and marketplace manifests agree', () => {
  const manifest = JSON.parse(read('plugins/reality-architect/.claude-plugin/plugin.json'))
  const marketplace = JSON.parse(read('.claude-plugin/marketplace.json'))
  const listing = marketplace.plugins.find((entry) => entry.name === manifest.name)
  assert.ok(listing)
  assert.equal(listing.version, manifest.version)
  assert.equal(listing.source, './plugins/reality-architect')
})
