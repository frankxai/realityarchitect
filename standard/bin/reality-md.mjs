#!/usr/bin/env node
/**
 * reality-md — the conformance CLI for the reality.md standard.
 * Zero dependencies. Node 18+. Reads files or stdin; never writes unless told to,
 * never sends anything anywhere. Your reality.md does not leave your machine.
 *
 *   reality-md validate ~/reality.md
 *   reality-md migrate  ./old.md --write ./reality.md
 *   reality-md emit     ~/reality.md --target claude
 *   reality-md brief    ~/reality.md
 *   reality-md graph    ~/reality.md --json
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, resolve as resolvePath } from 'node:path'
import {
  readRealityMd,
  emit,
  emitAll,
  mergeIntoFile,
  verifyEmission,
  nextArtifactBrief,
  briefToMarkdown,
  migrate,
  detectVersion,
  LEVELS,
  TARGETS,
  LEGACY_TARGETS,
} from '../src/index.mjs'

const argv = process.argv.slice(2)
const cmd = argv[0]
const flag = (name, fallback = null) => {
  const i = argv.indexOf(`--${name}`)
  return i === -1 ? fallback : (argv[i + 1] ?? true)
}
const has = (name) => argv.includes(`--${name}`)

const VALUE_FLAGS = new Set(['--target', '--write', '--source'])
const files = []
for (let i = 1; i < argv.length; i++) {
  const a = argv[i]
  if (a.startsWith('--')) {
    if (VALUE_FLAGS.has(a)) i++
    continue
  }
  files.push(a)
}

const USAGE = `reality-md — conformance tooling for the reality.md standard (v0.1)

  validate <file>            check a reality.md against the four conformance levels
  migrate  <file>            rewrite a pre-standard (v0.0) file as v0.1
  emit     <file>            project the file into a harness context file
  verify   <file>            check a generated projection still matches its source
  brief    <file>            print the next-artifact brief for the current gap
  graph    <file>            print the derived node/edge graph

Flags
  --target <${[...TARGETS, ...LEGACY_TARGETS].join('|')}>   emit target (default: all)
  --json                     machine-readable output
  --write <path>             write the result; for emit this merges into the block between
                             <!-- reality.md:start --> and <!-- reality.md:end -->, never
                             overwriting the rest of an existing file
  --source <path>            verify: the reality.md an import-style projection points at
  --strict                   exit non-zero unless conformance level 4 is reached

Spec: https://realityarchitect.ai/standard · nothing is uploaded, ever.`

const read = () => {
  const file = files[0]
  if (!file) {
    console.error('No input file.\n\n' + USAGE)
    process.exit(2)
  }
  try {
    return { file, text: readFileSync(file, 'utf8') }
  } catch (e) {
    console.error(`Cannot read ${file}: ${e.message}`)
    process.exit(2)
  }
}

const out = (text) => {
  const target = flag('write')
  if (typeof target === 'string') {
    writeFileSync(target, text.endsWith('\n') ? text : text + '\n')
    console.error(`Wrote ${target}`)
  } else console.log(text)
}

const SEV = { error: 'error', warning: 'warn ' }

function runValidate() {
  const { file, text } = read()
  const { conformance, packet } = readRealityMd(text, { source: file })
  if (has('json')) return out(JSON.stringify(conformance, null, 2))

  const lines = [`${file}`, '']
  for (const l of LEVELS) {
    const bad = conformance.byLevel[l.level]
    const reached = conformance.level >= l.level
    lines.push(`  ${reached ? 'PASS' : bad.length ? 'FAIL' : '—   '}  L${l.level} ${l.name.padEnd(11)} ${l.claim}`)
  }
  lines.push('', `  Level ${conformance.level} (${conformance.levelName}) · ${conformance.counts.nodes} nodes, ${conformance.counts.edges} edges, ${conformance.counts.goals} aims`)
  if (conformance.counts.unmetMoves.length) lines.push(`  Loop moves without evidence: ${conformance.counts.unmetMoves.join(', ')}`)
  if (conformance.errors.length || conformance.warnings.length) lines.push('')
  for (const f of [...conformance.errors, ...conformance.warnings])
    lines.push(`  ${SEV[f.severity]} ${f.code.padEnd(22)} ${f.message}${f.where ? `  [${f.where}]` : ''}`)
  const brief = nextArtifactBrief(packet)
  if (brief.move) lines.push('', `  Next artifact: ${brief.artifact} (${brief.timebox}) — run \`reality-md brief ${file}\``)
  console.log(lines.join('\n'))
  const need = has('strict') ? 4 : 2
  process.exit(conformance.level >= need ? 0 : 1)
}

function runMigrate() {
  const { file, text } = read()
  const from = detectVersion(text)
  const result = migrate(text)
  if (has('json')) return out(JSON.stringify(result, null, 2))
  console.error(`v${from} → v${result.to}`)
  for (const n of result.notes) console.error(`  · ${n}`)
  out(result.markdown)
}

function runEmit() {
  const { file, text } = read()
  const { packet, conformance } = readRealityMd(text, { source: file })
  if (conformance.level < 1) {
    console.error(`Refusing to emit: ${file} is not parseable as a reality.md. Run \`reality-md validate ${file}\`.`)
    process.exit(1)
  }
  const target = flag('target')
  const emissions = typeof target === 'string' ? [emit(packet, target)] : emitAll(packet)
  const dest = flag('write')
  if (typeof dest === 'string') {
    if (emissions.length !== 1) {
      console.error('--write needs a single --target.')
      process.exit(2)
    }
    const [e] = emissions
    const existing = existsSync(dest) ? readFileSync(dest, 'utf8') : ''
    mkdirSync(dirname(resolvePath(dest)), { recursive: true })
    writeFileSync(dest, mergeIntoFile(existing, e))
    console.error(existing ? `Merged the reality.md block into ${dest} (nothing else was touched).` : `Wrote ${dest}`)
    return
  }
  if (has('json')) return out(JSON.stringify(emissions, null, 2))
  if (emissions.length === 1) return out(emissions[0].content)
  for (const e of emissions) console.log(`\n───── ${e.filename} (${e.target}) · digest ${e.digest}\n\n${e.content}`)
}

function runVerify() {
  const { file, text } = read()
  const sourcePath = flag('source')
  const result = verifyEmission(text, {
    target: null,
    resolve: (p) => {
      const path = typeof sourcePath === 'string' ? sourcePath : p.replace(/^~(?=$|[\\/])/, homedir())
      return readFileSync(path, 'utf8')
    },
  })
  if (has('json')) return out(JSON.stringify(result, null, 2))
  console.log(
    [
      file,
      '',
      `  ${result.ok ? 'MATCH' : 'DRIFT'}  ${result.mode}`,
      `  declared ${result.declared ?? '—'}   derived ${result.derived ?? '—'}`,
      `  ${result.reason}`,
    ].join('\n')
  )
  process.exit(result.ok ? 0 : 1)
}

function runBrief() {
  const { file, text } = read()
  const { packet } = readRealityMd(text, { source: file })
  const brief = nextArtifactBrief(packet)
  out(has('json') ? JSON.stringify(brief, null, 2) : briefToMarkdown(brief, packet))
}

function runGraph() {
  const { file, text } = read()
  const { packet } = readRealityMd(text, { source: file })
  if (has('json')) return out(JSON.stringify(packet, null, 2))
  const lines = [`${packet.subject.name} · reality.md v${packet.version}`, '']
  for (const n of packet.graph.nodes)
    lines.push(`  ${n.kind.padEnd(10)} ${n.id.padEnd(38)} ${n.visibility.padEnd(7)} ${n.provenance.method.padEnd(8)} ${n.evaluation.status}`)
  lines.push('', `  ${packet.graph.edges.length} edges`)
  console.log(lines.join('\n'))
}

switch (cmd) {
  case 'validate':
    runValidate()
    break
  case 'migrate':
    runMigrate()
    break
  case 'emit':
    runEmit()
    break
  case 'verify':
    runVerify()
    break
  case 'brief':
    runBrief()
    break
  case 'graph':
    runGraph()
    break
  default:
    console.log(USAGE)
    process.exit(cmd ? 2 : 0)
}
