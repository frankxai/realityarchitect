import test from 'node:test'
import assert from 'node:assert/strict'
import { createRecord, exportLedger, validateRecord } from '../lib/reality-ledger.ts'

const input = { kind: 'Hypothesis', domain: 'Cities & infrastructure', statement: 'Shade may reduce exposure.', sourceUrl: '', method: '', uncertainty: 'Weather and traffic confound comparisons.', nextTest: 'Measure a baseline and a matched pilot.' }
test('hypotheses remain unreviewed even when a source is supplied', () => {
  const record = createRecord({ ...input, sourceUrl: 'https://example.org/study' }, 'r1', '2026-10-02T20:00:00.000Z')
  assert.equal(record.review, 'unreviewed')
  assert.equal(record.kind, 'Hypothesis')
  const exported = JSON.parse(exportLedger([record]))
  assert.equal(exported.schema, 'reality-observatory/v0.1')
  assert.deepEqual(exported.records, [record])
  assert.match(exported.boundary, /does not establish truth/)
})
test('observations, simulations, and outcomes require method and all records require uncertainty and a next test', () => {
  for (const kind of ['Observation', 'Simulation', 'Outcome']) assert.match(validateRecord({ ...input, kind }), /measurement or simulation method/)
  assert.equal(validateRecord({ ...input, kind: 'Observation', method: 'Air temperature in °C, hourly at two matched locations.' }), null)
  for (const field of ['statement', 'uncertainty', 'nextTest']) assert.ok(validateRecord({ ...input, [field]: '  ' }))
  assert.ok(validateRecord({ ...input, kind: 'Verified fact' }))
})
test('sources reject executable schemes and embedded credentials', () => {
  for (const sourceUrl of ['javascript:alert(1)', 'data:text/html,test', 'file:///etc/passwd', 'https://user:password@example.org', 'not a URL']) assert.ok(validateRecord({ ...input, sourceUrl }))
  assert.equal(validateRecord({ ...input, sourceUrl: 'https://example.org' }), null)
})
test('export retains multiline context, uncertainty, provenance, and fiction label', () => {
  const record = createRecord({ ...input, kind: 'Fiction', statement: '  An imagined city.\nA future story.  ' }, 'fiction1', '2026-10-02T20:00:00.000Z')
  assert.equal(record.statement, 'An imagined city.\nA future story.')
  assert.equal(JSON.parse(exportLedger([record])).records[0].kind, 'Fiction')
  assert.equal(JSON.parse(exportLedger([])).records.length, 0)
})
