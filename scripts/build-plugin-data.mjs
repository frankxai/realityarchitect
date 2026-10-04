#!/usr/bin/env node
/**
 * Writes the reality-architect plugin's shared data from the repo's single sources:
 * - plugins/reality-architect/CHARTER.md, an exact copy of standard/AGENT-CHARTER.md (skills read it first);
 * - plugins/reality-architect/skills/reality-library/library.json, generated from lib/library.ts, so the Library tutor
 *   never keeps its own list of teachers or claims.
 * tests/plugin.test.mjs fails if either drifts. Run: pnpm plugin:data
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const { ENTRIES, LAYERS, MYTHS, ONE_LAW, PATHS, PRINCIPLES, SHELVES, TAG_LABEL } = await import(pathToFileURL(path.join(root, 'lib/library.ts')).href)

export function libraryData() {
  return {
    generatedFrom: 'lib/library.ts',
    canonical: 'https://www.realityarchitect.ai/library',
    oneLaw: [...ONE_LAW],
    layers: LAYERS,
    principles: PRINCIPLES,
    shelves: SHELVES,
    tags: TAG_LABEL,
    entries: ENTRIES,
    myths: MYTHS,
    paths: PATHS,
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const plugin = path.join(root, 'plugins/reality-architect')
  fs.copyFileSync(path.join(root, 'standard/AGENT-CHARTER.md'), path.join(plugin, 'CHARTER.md'))
  fs.writeFileSync(path.join(plugin, 'skills/reality-library/library.json'), `${JSON.stringify(libraryData(), null, 2)}\n`)
  console.log('plugin data written: CHARTER.md, skills/reality-library/library.json')
}
