import assert from 'node:assert/strict'
import test from 'node:test'
import {
  agentBrief, aimMd, atlasMd, bridgeSlugs, bundleFiles, dayLogMd, decisionMd, evidenceMd, ifThenSentence, imagePrompt,
  realityMd, snapshotMd, soulMd, weeklyPrompt, witnessMd, ROOT,
} from '../lib/studio/export.ts'
import { sampleState } from '../lib/studio/sample.ts'
import { emptyState } from '../lib/studio/state.ts'

const TODAY = '2026-10-04'
const sample = sampleState(TODAY)

test('reality.md v0.2 has all eight sections plus the agent protocol', () => {
  const md = realityMd(sample, TODAY)
  assert.match(md, /^---\nstandard: reality\.md\nversion: "0\.2"\nupdated: 2026-10-04\n/)
  for (const heading of ['Identity', 'Aims', 'Attention', 'State', 'Systems', 'Environment', 'Feedback', 'Guardrails', 'Agent protocol']) {
    assert.match(md, new RegExp(`^## ${heading}$`, 'm'), heading)
  }
  assert.match(md, /# reality\.md — Mara \(sample\)/)
  assert.match(md, /\*\*Finish the album\*\* — done when Ten mastered tracks/)
  assert.match(md, /reality\/aims\/finish-the-album\.md/)
  assert.match(md, /If I open a new idea instead of finishing the current song, then I write the idea/)
  assert.match(md, /soul\.md/)
})

test('soul.md carries the inner contract and the chosen voice', () => {
  const md = soulMd(sample, TODAY)
  assert.match(md, /^---\nstandard: soul\.md\nversion: "0\.1"\n/)
  for (const heading of ['Purpose', 'Values', 'I am', 'The scene', 'Gifts', 'Vows', 'Voice', 'Gratitude', 'Agent protocol']) {
    assert.match(md, new RegExp(`^## ${heading}$`, 'm'), heading)
  }
  assert.match(md, /^- Voice: direct$/m)
  assert.match(md, /^1\. Honesty in the work$/m)
  assert.match(md, /never claim that\s+feeling or imagining them causes an outcome/i)
})

test('witness entries separate fact, meaning and action, and name the sign as primed', () => {
  const md = witnessMd(sample)
  assert.match(md, /### \d{4}-\d{2}-\d{2} \d{2}:\d{2} · sign · primed/)
  assert.match(md, /- \*\*Happened \(fact\):\*\* A stranger at the café/)
  assert.match(md, /- \*\*Meant \(my meaning\):\*\* The work is ready to be seen\./)
  assert.match(md, /- \*\*Did \(action\):\*\* Sent her the listening link/)
  assert.match(md, /Bridge: finish-the-album · Domain: craft/)
})

test('an aim file labels desired, reported, planned and computed content', () => {
  const album = sample.bridges[0]
  const md = aimMd(album, sample, TODAY, bridgeSlugs(sample))
  assert.match(md, /## The scene \(desired\)/)
  assert.match(md, /## True now \(reported\)/)
  assert.match(md, /## Obstacle and plan \(planned\)/)
  assert.match(md, /Gap class: process/)
  assert.match(md, /## Is it enough\? \(computed 2026-10-04\)/)
  assert.match(md, /Book the mastering engineer \(planned, due \d{4}-\d{2}-\d{2}\)/)
})

test('the if-then sentence reads cleanly whatever the person typed', () => {
  assert.equal(ifThenSentence('When I reach for my phone.', 'I open the draft'), 'If I reach for my phone, then I open the draft.')
  assert.equal(ifThenSentence('', 'walk'), '')
  assert.equal(ifThenSentence('Rain makes me skip the run.', 'Run the indoor track'), 'If rain makes me skip the run, then I run the indoor track.')
  assert.equal(ifThenSentence('AI tools distract me', 'close them'), 'If AI tools distract me, then I close them.')
  assert.equal(ifThenSentence('Ideas pull me away', 'I note them'), 'If ideas pull me away, then I note them.')
})

test('an empty studio exports without throwing and marks the gaps', () => {
  const empty = emptyState(new Date(2026, 9, 4))
  const md = realityMd(empty, TODAY)
  assert.match(md, /^## Aims\n- …/m)
  assert.doesNotMatch(md, /undefined|null|NaN/)
  assert.doesNotMatch(soulMd(empty, TODAY), /undefined|null|NaN/)
  assert.doesNotMatch(atlasMd(empty), /undefined|null|NaN/)
  const files = bundleFiles(empty, TODAY)
  assert.ok(files.some((file) => file.path === `${ROOT}reality.md`))
})

test('the bundle has unique, safe paths for every part of the format', () => {
  const files = bundleFiles(sample, TODAY)
  const paths = files.map((file) => file.path)
  assert.equal(new Set(paths).size, paths.length)
  for (const path of paths) {
    assert.ok(path.startsWith('Reality Architect/'), path)
    assert.doesNotMatch(path, /\.\.|\\|:/)
  }
  for (const expected of ['reality.md', 'soul.md', 'START HERE.md', 'reality/atlas.md', 'reality/witness.md', 'reality/evidence.md', 'reality/studio-backup.json']) {
    assert.ok(paths.includes(`${ROOT}${expected}`), expected)
  }
  assert.ok(paths.includes(`${ROOT}reality/aims/finish-the-album.md`))
  assert.ok(paths.some((path) => path.startsWith(`${ROOT}reality/snapshots/`)))
  assert.ok(paths.some((path) => path.startsWith(`${ROOT}reality/decisions/`)))
  assert.ok(paths.some((path) => path === `${ROOT}reality/log/${TODAY}.md`))
  const backup = JSON.parse(files.find((file) => file.path.endsWith('studio-backup.json')).text)
  assert.equal(backup.schema, 'reality-studio')
})

test('two snapshots on the same day get distinct files', () => {
  const twice = sampleState(TODAY)
  twice.snapshots = [twice.snapshots[0], { ...twice.snapshots[0], id: 'again' }]
  const paths = bundleFiles(twice, TODAY).map((file) => file.path).filter((path) => path.includes('/snapshots/'))
  assert.equal(new Set(paths).size, 2)
})

test('daily logs, evidence, snapshots and decisions use the standard formats', () => {
  assert.match(dayLogMd(TODAY, sample), /- Looking for: A sign the album is wanted/)
  assert.match(evidenceMd(sample), /Finished the arrangement of "Low Water"/)
  const snapshot = snapshotMd(sample.snapshots[0])
  assert.match(snapshot, /approved: true/)
  assert.match(snapshot, /\| Craft & Contribution \| 5 \| 9 \|/)
  assert.match(snapshot, /- One correction: /)
  assert.match(decisionMd(sample.decisions[0]), /^review_on: \d{4}-\d{2}-\d{2}$/m)
})

test('prompts for the person’s own tools carry the boundaries', () => {
  const image = imagePrompt('I play back the final mix in a quiet studio.', 'Craft & Contribution')
  assert.match(image, /quiet studio/)
  assert.match(image, /No text/i)
  assert.match(image, /no recognizable people/i)
  const weekly = weeklyPrompt(sample, TODAY)
  assert.match(weekly, /Agent Charter/)
  assert.match(weekly, /one at a time/i)
  assert.match(weekly, /never claim/i)
  assert.match(agentBrief(sample.bridges[0], sample, TODAY), /smallest next act/i)
})
