/**
 * The published JSON Schema and the reference implementation must not drift.
 * This is a structural check (required keys, enums, patterns), not a full
 * JSON Schema engine — the standard ships zero dependencies on purpose.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { readRealityMd, SECTIONS, TARGETS, VERSION } from '../src/index.mjs'

const load = (p) => readFileSync(fileURLToPath(new URL(p, import.meta.url)), 'utf8')
const schema = JSON.parse(load('../spec/reality.packet.schema.json'))
const { packet } = readRealityMd(load('../fixtures/valid.reality.md'))

test('schema section keys match the implementation', () => {
  assert.deepEqual(schema.$defs.sectionKey.enum, SECTIONS.map((s) => s.key))
})

test('every emitted packet key is declared in the schema', () => {
  for (const key of Object.keys(packet)) assert.ok(key in schema.properties, `undeclared packet key: ${key}`)
  for (const req of schema.required) assert.ok(req in packet, `schema requires ${req}, packet lacks it`)
})

test('every node satisfies the schema node contract', () => {
  const req = schema.$defs.node.required
  const allowed = new Set(Object.keys(schema.$defs.node.properties))
  const kinds = new Set(schema.$defs.nodeKind.enum)
  const idRe = new RegExp(schema.$defs.nodeId.pattern)
  const visibilities = new Set(schema.$defs.visibility.enum)
  const statuses = new Set(schema.$defs.evaluation.properties.status.enum)
  const sources = new Set(schema.$defs.provenance.properties.source.enum)
  const methods = new Set(schema.$defs.provenance.properties.method.enum)

  for (const n of packet.graph.nodes) {
    for (const r of req) assert.ok(n[r] !== undefined, `${n.id} missing ${r}`)
    for (const k of Object.keys(n)) assert.ok(allowed.has(k), `${n.id} has undeclared key ${k}`)
    assert.ok(kinds.has(n.kind), `${n.id} kind ${n.kind}`)
    assert.match(n.id, idRe)
    assert.ok(visibilities.has(n.visibility))
    assert.ok(statuses.has(n.evaluation.status))
    assert.ok(sources.has(n.provenance.source))
    assert.ok(methods.has(n.provenance.method))
    assert.match(n.version, new RegExp(schema.$defs.version.pattern))
  }
})

test('every edge satisfies the schema edge contract and points at real nodes', () => {
  const ids = new Set(packet.graph.nodes.map((n) => n.id))
  const rels = new Set(schema.$defs.rel.enum)
  const req = schema.$defs.edge.required
  for (const e of packet.graph.edges) {
    for (const r of req) assert.ok(e[r] !== undefined, `${e.id} missing ${r}`)
    assert.ok(rels.has(e.rel), `unknown rel ${e.rel}`)
    assert.ok(ids.has(e.from), `dangling from ${e.from}`)
    assert.ok(ids.has(e.to), `dangling to ${e.to}`)
  }
})

test('node ids are unique', () => {
  const ids = packet.graph.nodes.map((n) => n.id)
  assert.equal(new Set(ids).size, ids.length)
})

test('the version constant, the schema id, and the docs agree', () => {
  assert.equal(VERSION, '0.1')
  assert.equal(schema.$id, 'https://realityarchitect.ai/spec/reality.packet.schema.json')
  const conformance = load('../CONFORMANCE.md')
  for (const l of ['Parseable', 'Structural', 'Operative', 'Portable']) assert.ok(conformance.includes(l), `CONFORMANCE.md missing ${l}`)
  for (const t of TARGETS) assert.ok(conformance.includes(t), `CONFORMANCE.md missing target ${t}`)
})
