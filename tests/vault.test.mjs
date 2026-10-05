import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { resolveHome } from '../plugins/reality-architect/engine/parse.mjs'
import { validate } from '../plugins/reality-architect/engine/validate.mjs'

/** Reads a stored (uncompressed) ZIP from createZip into { name: text-or-bytes }. */
function readZip(bytes) {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const end = bytes.length - 22
  const count = dv.getUint16(end + 10, true)
  let offset = dv.getUint32(end + 16, true)
  const files = new Map()
  for (let i = 0; i < count; i++) {
    const size = dv.getUint32(offset + 20, true)
    const nameLength = dv.getUint16(offset + 28, true)
    const extra = dv.getUint16(offset + 30, true) + dv.getUint16(offset + 32, true)
    const name = new TextDecoder().decode(bytes.subarray(offset + 46, offset + 46 + nameLength))
    const local = dv.getUint32(offset + 42, true)
    const start = local + 30 + dv.getUint16(local + 26, true) + dv.getUint16(local + 28, true)
    files.set(name, bytes.subarray(start, start + size))
    offset += 46 + nameLength + extra
  }
  return files
}

test('the vault holds the program, the dashboard, the board, the templates, and files the engine accepts', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ra-vault-'))
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  const zip = path.join(dir, 'vault.zip')
  const run = spawnSync(process.execPath, ['scripts/vault/build-vault.mjs', '--out', zip, '--today', '2026-10-05'], { encoding: 'utf8' })
  assert.equal(run.status, 0, run.stderr)
  const files = readZip(fs.readFileSync(zip))
  const names = [...files.keys()]
  const text = (name) => new TextDecoder().decode(files.get(name))

  assert.equal(names.filter((name) => /^Reality Architect\/The Imaginal Act\/Day \d{2} — .+\.md$/.test(name)).length, 30)
  for (const name of ['START HERE.md', 'reality.md', 'soul.md', 'reality/atlas.md', 'reality/witness.md', 'Vision board.canvas', 'The Imaginal Act/Thirty days.base', 'The Imaginal Act/About the program.md', 'Templates/Witness entry.md', 'Templates/Snapshot.md']) {
    assert.ok(files.has(`Reality Architect/${name}`), name)
  }
  assert.ok(!names.some((name) => /studio-backup|PLACEHOLDER/.test(name)), 'no Studio backup or placeholder audio')
  assert.match(text('Reality Architect/The Imaginal Act/Day 01 — The honest now.md'), /^---\nday: 1\n[\s\S]*\nstatus: to do\ndone:\n---\n/)
  assert.match(text('Reality Architect/The Imaginal Act/Thirty days.base'), /file\.inFolder\("Reality Architect\/The Imaginal Act"\)/)
  const canvas = JSON.parse(text('Reality Architect/Vision board.canvas'))
  const ids = new Set(canvas.nodes.map((node) => node.id))
  for (const edge of canvas.edges) assert.ok(ids.has(edge.fromNode) && ids.has(edge.toNode), edge.id)

  // The engine reads the extracted vault like any other home.
  const home = path.join(dir, 'x')
  for (const [name, data] of files) {
    fs.mkdirSync(path.dirname(path.join(home, name)), { recursive: true })
    fs.writeFileSync(path.join(home, name), data)
  }
  assert.deepEqual(validate(resolveHome(path.join(home, 'Reality Architect'))), [])
})
