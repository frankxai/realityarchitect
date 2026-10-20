import assert from 'node:assert/strict'
import test from 'node:test'
import { POST } from '../app/api/mcp/route.ts'
import { publishedSkills } from '../lib/mcp/tools.ts'

const ENDPOINT = 'https://www.realityarchitect.ai/api/mcp'
const HEADERS = { 'content-type': 'application/json', accept: 'application/json, text/event-stream' }

async function callTool(name, args, id = 1) {
  const req = new Request(ENDPOINT, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ jsonrpc: '2.0', id, method: 'tools/call', params: { name, arguments: args } }),
  })
  const response = await POST(req)
  const text = await response.text()
  const body = text ? JSON.parse(text) : null
  return body.result
}

test('skill_check rejects invalid skill argument patterns', async () => {
  const invalidSkills = [
    '..\\reality-daily',
    'reality-daily/..',
    '%2e%2e%2freality-daily',
    '/etc/passwd',
    'C:\\Windows',
    '.',
    '..',
    'reality-daily\u0000',
    'reality-daily\n',
    'REALITY-DAILY',
    'reality--daily',
    '-reality-daily',
    'reality-daily-',
    '',
  ]
  for (const skill of invalidSkills) {
    const res = await callTool('skill_check', { skill })
    assert.equal(res.isError, true, `skill_check with ${JSON.stringify(skill)} should be an error`)
    assert.match(res.content[0].text, /skill is not in the expected form/)
  }
})

test('skill_check validates published skills and rejects unknown published skill names', async () => {
  const unknown = await callTool('skill_check', { skill: 'no-such-skill' })
  assert.equal(unknown.isError, true)
  assert.match(unknown.content[0].text, /must be one of the published skills/)

  for (const skill of publishedSkills()) {
    const res = await callTool('skill_check', { skill })
    assert.equal(res.isError, false, `skill_check for ${skill} should succeed`)
  }
})

test('library_search rejects invalid id patterns', async () => {
  const invalidIds = ['../x', 'a/b', 'A', 'a_b', 'a--b', '-a', 'a-']
  for (const id of invalidIds) {
    const res = await callTool('library_search', { id })
    assert.equal(res.isError, true, `library_search with id ${JSON.stringify(id)} should be an error`)
    assert.match(res.content[0].text, /id is not in the expected form/)
  }
})

test('library_search bounds query length in code points', async () => {
  const okQuery = '😀'.repeat(200)
  const okRes = await callTool('library_search', { query: okQuery })
  assert.equal(okRes.isError, false)

  const longQuery = '😀'.repeat(201)
  const errRes = await callTool('library_search', { query: longQuery })
  assert.equal(errRes.isError, true)
  assert.match(errRes.content[0].text, /at most 200 characters/)
})

test('program_day truncates unknown argument names in error messages', async () => {
  const unknownArg = 'x'.repeat(500)
  const res = await callTool('program_day', { day: 1, [unknownArg]: 'value' })
  assert.equal(res.isError, true)
  assert.ok(res.content[0].text.length < 200, `error text length (${res.content[0].text.length}) should be under 200 characters`)
})
