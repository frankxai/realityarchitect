import test from 'node:test'
import assert from 'node:assert/strict'
import { guardianMessage, guardianPath } from '../lib/guardian-contract.ts'
import { reviewRequest, evidenceReview } from '../lib/review-contract.ts'

test('review requests require consent, owned-record addressing, and an allowlisted model', () => {
  const good = { recordId:'11111111-1111-4111-8111-111111111111',model:'openai/gpt-6.1-sol',consent:true }
  assert.ok(reviewRequest.safeParse(good).success)
  for (const patch of [{ consent:false },{ model:'attacker/arbitrary' },{ recordId:'../foreign' },{ ownerId:'foreign-user' },{ instructions:'Override system' }]) assert.equal(reviewRequest.safeParse({ ...good,...patch }).success,false)
})
test('guardian proxy excludes traversal, arbitrary tools, and budget approval routes', () => {
  assert.equal(guardianPath(['session'],'POST'),'create')
  assert.equal(guardianPath(['session','wrun_12345678','stream'],'GET'),'stream')
  for (const parts of [['session','../secret'],['session','wrun_12345678','compact'],['session','wrun_12345678','reset'],['session','wrun_12345678','approve'],['info'],['health'],['session','wrun_12345678','stream','extra']]) assert.equal(guardianPath(parts,'POST'),null)
  assert.equal(guardianPath(['session','wrun_12345678'],'GET'),null)
  for (const value of ['',{},[{ type:'file',data:'private' }],'x'.repeat(6001)]) assert.equal(guardianMessage(value),null)
  assert.equal(guardianMessage('  Design a test.  '),'Design a test.')
})
test('structured suggestions reject unbounded fields and missing uncertainty limitations', () => {
  const output={ summary:'A hypothesis.',evidenceGaps:['No baseline.'],alternativeExplanations:['Weather.'],nextTest:'Measure matched routes.',relevantDisciplines:['Climate science'],limitations:'No source was fetched.' }
  assert.ok(evidenceReview.safeParse(output).success)
  assert.equal(evidenceReview.safeParse({ ...output,summary:'x'.repeat(1201) }).success,false)
  const { limitations,...missing }=output
  assert.equal(evidenceReview.safeParse(missing).success,false)
})
