import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import {
  VAULT_WAITLIST_LIST_TYPE,
  VAULT_WAITLIST_SOURCE,
  applicationNote,
  upstreamPayload,
} from '../lib/waitlist-application.ts'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('the application note carries what the visitor shared, labelled, in one line', () => {
  assert.equal(
    applicationNote('Ship the vault', 'Health', 'You say health but log 2 hours'),
    'Aim: Ship the vault | Priority: Health | Audit: You say health but log 2 hours',
  )
  assert.equal(applicationNote('Ship the vault', undefined, undefined), 'Aim: Ship the vault')
})

test('the application note is undefined when the visitor shared nothing', () => {
  assert.equal(applicationNote(undefined, undefined, undefined), undefined)
  assert.equal(applicationNote('   ', '', null), undefined)
})

test('the application note fits the 280-character field the subscribe endpoint stores', () => {
  const note = applicationNote('a'.repeat(900), 'b'.repeat(900), 'c'.repeat(900))
  assert.ok(note.length <= 280, `note is ${note.length} characters`)
  assert.match(note, /Audit: c+$/, 'the headline must survive truncation')
})

test('the upstream payload registers the Vault list and carries the note in the stored field', () => {
  const payload = upstreamPayload({
    email: 'applicant@example.invalid',
    name: '  Ada  ',
    aim: 'Ship the vault',
    statedPriority: 'Health',
    headline: 'Gap',
  })
  assert.equal(payload.listType, VAULT_WAITLIST_LIST_TYPE)
  assert.equal(payload.listType, 'reality-architect-vault-waitlist')
  assert.equal(payload.source, VAULT_WAITLIST_SOURCE)
  assert.equal(payload.name, 'Ada')
  assert.equal(payload.intention, 'Aim: Ship the vault | Priority: Health | Audit: Gap')
  assert.equal('metadata' in payload, false, 'the subscribe endpoint ignores metadata, so it must not carry the aim')
})

test('an email-only application sends no aim, priority or headline', () => {
  const payload = upstreamPayload({ email: 'applicant@example.invalid' })
  assert.equal(payload.name, undefined)
  assert.equal(payload.intention, undefined)
})

test('the waitlist route forwards the shared payload to the subscribe endpoint', () => {
  const route = read('app/api/waitlist/route.ts')
  assert.match(route, /upstreamPayload\(\{ email, name, aim, statedPriority, headline \}\)/)
  assert.match(route, /https:\/\/www\.frankx\.ai\/api\/subscribe/)
  assert.doesNotMatch(route, /metadata/)
})

test('the form says what is sent and does not claim the name stays local', () => {
  const form = read('components/RealityAudit.tsx')
  assert.doesNotMatch(form, /nothing is sent anywhere yet/i)
  assert.match(form, /sent only if you join the waitlist at the end/)
  assert.match(form, /does\s+not join the newsletter/)
  assert.match(form, /href="\/privacy#vault-waitlist"/)
})

test('the privacy page discloses the Vault waitlist request', () => {
  const privacy = read('app/privacy/page.tsx')
  assert.match(privacy, /id="vault-waitlist"/)
  assert.match(privacy, /sends your email address, the name you typed if any/)
  assert.match(privacy, /only if you tick the box/)
  assert.match(privacy, /does not add you to the newsletter, and no automatic email is sent/)
  assert.match(privacy, /one optional\s+exception is a Vault waitlist application/)
})
