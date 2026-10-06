import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { DELETE, GET, POST } from '../app/api/mcp/route.ts'
import { MAX_BODY_BYTES } from '../lib/mcp/http.ts'
import { LIBRARY_PAGE, PUBLIC_TOOLS, publishedSkills } from '../lib/mcp/tools.ts'
import { DAYS } from '../lib/programs/program.ts'
import { closedPageProblems } from '../scripts/check-built-pages.mjs'
import { PROTOCOL_VERSIONS } from '../plugins/reality-architect/mcp/core.mjs'
import { callTool } from '../plugins/reality-architect/mcp/server.mjs'
import { LOOPS } from '../plugins/reality-architect/engine/loops.mjs'

/**
 * The public MCP endpoint, tested over HTTP: real Request objects into the route handler, real Responses out.
 */

const ENDPOINT = 'https://www.realityarchitect.ai/api/mcp'
const HEADERS = { 'content-type': 'application/json', accept: 'application/json, text/event-stream' }
const INIT = { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'test', version: '0' } }
const library = JSON.parse(fs.readFileSync('plugins/reality-architect/skills/reality-library/library.json', 'utf8'))

function post(body, headers = {}) {
  return POST(new Request(ENDPOINT, { method: 'POST', headers: { ...HEADERS, ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) }))
}

async function rpc(body, headers) {
  const response = await post(body, headers)
  const text = await response.text()
  assert.equal(response.headers.get('mcp-session-id'), null, 'a stateless server never mints a session')
  return { status: response.status, headers: response.headers, body: text ? JSON.parse(text) : null }
}

const call = (name, args, id = 1) => rpc({ jsonrpc: '2.0', id, method: 'tools/call', params: { name, arguments: args } })

/** A successful tool call: HTTP 200, a result, and isError false. */
async function ok(name, args) {
  const { status, body } = await call(name, args)
  assert.equal(status, 200, name)
  assert.equal(body.result.isError, false, `${name}: ${body.result.content?.[0]?.text}`)
  return body.result
}

/** A tool-level problem the agent can fix: HTTP 200, a result with isError true. */
async function toolError(name, args, expected) {
  const { status, body } = await call(name, args)
  assert.equal(status, 200, name)
  assert.equal(body.result.isError, true, `${name} ${JSON.stringify(args)} should be a tool error`)
  if (expected) assert.match(body.result.content[0].text, expected)
  return body.result
}

test('initialize answers with the protocol version, capabilities and server info, and needs no session after', async () => {
  const { status, headers, body } = await rpc({ jsonrpc: '2.0', id: 1, method: 'initialize', params: INIT })
  assert.equal(status, 200)
  assert.match(headers.get('content-type'), /^application\/json/)
  assert.equal(headers.get('cache-control'), 'no-store')
  assert.equal(body.id, 1)
  assert.equal(body.result.protocolVersion, '2025-11-25')
  assert.deepEqual(body.result.capabilities, { tools: { listChanged: false } })
  assert.equal(body.result.serverInfo.name, 'reality-architect-public')
  assert.equal(body.result.serverInfo.websiteUrl, 'https://www.realityarchitect.ai')
  assert.match(body.result.instructions, /Meaning[\s\S]*Mechanism/)

  for (const version of PROTOCOL_VERSIONS) assert.equal((await rpc({ jsonrpc: '2.0', id: 2, method: 'initialize', params: { ...INIT, protocolVersion: version } })).body.result.protocolVersion, version)
  assert.equal((await rpc({ jsonrpc: '2.0', id: 3, method: 'initialize', params: { ...INIT, protocolVersion: '1999-01-01' } })).body.result.protocolVersion, PROTOCOL_VERSIONS[0], 'an unknown version is answered with the latest')
  for (const params of [undefined, {}, { protocolVersion: '2025-11-25' }, { ...INIT, clientInfo: { name: 'x' } }]) {
    assert.equal((await rpc({ jsonrpc: '2.0', id: 4, method: 'initialize', params })).body.error.code, -32602, JSON.stringify(params))
  }

  // The initialized notification is accepted with 202 and no body; ping works.
  const accepted = await post({ jsonrpc: '2.0', method: 'notifications/initialized' })
  assert.equal(accepted.status, 202)
  assert.equal(await accepted.text(), '')
  assert.deepEqual((await rpc({ jsonrpc: '2.0', id: 5, method: 'ping' })).body.result, {})
})

test('tools/list works without a session: four titled, read-only, closed-world tools with bounded inputs', async () => {
  const { status, body } = await rpc({ jsonrpc: '2.0', id: 1, method: 'tools/list' }, { 'mcp-protocol-version': '2025-11-25' })
  assert.equal(status, 200)
  const tools = body.result.tools
  assert.deepEqual(tools.map((tool) => tool.name), ['library_search', 'program_day', 'loop_prompts', 'skill_check'])
  for (const tool of tools) {
    assert.ok(tool.title && tool.description, tool.name)
    assert.equal(tool.annotations.title, tool.title, tool.name)
    assert.equal(tool.annotations.readOnlyHint, true, tool.name)
    assert.equal(tool.annotations.openWorldHint, false, tool.name)
    assert.equal(tool.annotations.destructiveHint, false, tool.name)
    assert.equal(tool.inputSchema.type, 'object', tool.name)
    assert.equal(tool.inputSchema.additionalProperties, false, tool.name)
    for (const [key, prop] of Object.entries(tool.inputSchema.properties)) {
      if (prop.type === 'string') assert.ok(Number.isInteger(prop.maxLength) && prop.maxLength <= 200, `${tool.name}.${key} has a bounded length`)
      else assert.ok(prop.type === 'integer' && Number.isFinite(prop.minimum) && Number.isFinite(prop.maximum), `${tool.name}.${key} is bounded`)
    }
  }
})

test('library_search: by id, by words, or an index; the same entries the local server returns, labeled and bounded', async () => {
  const byId = await ok('library_search', { id: 'gollwitzer' })
  assert.equal(byId.structuredContent.entries.length, 1)
  assert.match(byId.content[0].text, /Keep \(meaning\):[\s\S]*Mechanism:[\s\S]*Limits:/)
  assert.match(byId.content[0].text, /https:\/\/www\.realityarchitect\.ai\/library/)
  for (const args of [{ id: 'gollwitzer' }, { query: 'if-then' }, { query: 'mental rehearsal' }]) {
    const hosted = await ok('library_search', args)
    assert.deepEqual(hosted.structuredContent.entries, callTool('library_search', args, {}).data.entries, JSON.stringify(args))
    assert.deepEqual(hosted.structuredContent.more, [], JSON.stringify(args))
  }
  // With no search, an index of every entry rather than every entry in full.
  const index = await ok('library_search', {})
  assert.deepEqual(index.structuredContent.index.map((entry) => entry.id), library.entries.map((entry) => entry.id))
  assert.doesNotMatch(index.content[0].text, /Limits:/)
  // A broad search shows a page of full entries and lists the rest by id.
  const broad = await ok('library_search', { query: 'the' })
  const local = callTool('library_search', { query: 'the' }, {}).data.entries
  assert.ok(local.length > LIBRARY_PAGE, 'the fixture query is broad')
  assert.deepEqual(broad.structuredContent.entries, local.slice(0, LIBRARY_PAGE))
  assert.deepEqual(broad.structuredContent.more, local.slice(LIBRARY_PAGE).map((entry) => entry.id))
  assert.match(broad.content[0].text, /more match: /)
  assert.match((await ok('library_search', { query: 'zzzz-no-such-thing' })).content[0].text, /^No Library entry matches\./)
})

test('program_day: every day, with Meaning and Mechanism labeled and teachers kept to the Library', async () => {
  const meaningShelf = new Map(library.entries.filter((entry) => entry.shelf === 'meaning').map((entry) => [entry.id, entry.name]))
  for (let day = 1; day <= DAYS; day++) {
    const result = await ok('program_day', { day })
    const text = result.content[0].text
    const data = result.structuredContent
    assert.equal(data.day, day)
    assert.equal(data.url, `https://www.realityarchitect.ai/programs/imaginal-30/${day}`)
    assert.match(text, new RegExp(`^Day ${day} of ${DAYS} — `))
    assert.match(text, /\*\*Meaning\.\*\*[\s\S]*\*\*Mechanism\.\*\*/, `day ${day} labels both registers`)
    assert.equal(data.registers.meaning.length, 1, `day ${day}`)
    assert.equal(data.registers.mechanism.length, 1, `day ${day}`)
    assert.ok(data.sections.some((section) => section.title === 'Why it works'), `day ${day}`)
    // As on the day page: a meaning-shelf entry is named by its shelf, never by its teacher, outside the Library tool.
    const libraryLine = text.split('\n').find((line) => line.startsWith('Library: ')) ?? ''
    for (const item of data.library) {
      if (!meaningShelf.has(item.id)) continue
      assert.equal(item.label, 'the meaning shelf', `day ${day} ${item.id}`)
      assert.ok(!libraryLine.includes(meaningShelf.get(item.id)), `day ${day} names ${item.id} outside the Library`)
    }
  }
})

test('loop_prompts: every loop from the engine, or one, with its steps and its gate', async () => {
  const all = await ok('loop_prompts', {})
  assert.deepEqual(all.structuredContent.loops.map((loop) => loop.id), LOOPS.map((loop) => loop.id))
  assert.match(all.content[0].text, /nothing is written or sealed without their yes/)
  const morning = await ok('loop_prompts', { loop: 'morning' })
  assert.equal(morning.structuredContent.loops.length, 1)
  for (const step of LOOPS[0].steps) assert.ok(morning.content[0].text.includes(step))
  assert.match(morning.content[0].text, /Gate: ask-before-write/)
})

test('skill_check: the bar, and the engine passes every published skill', async () => {
  const all = await ok('skill_check', {})
  const skills = publishedSkills()
  assert.equal(skills.length, 9)
  assert.deepEqual(all.structuredContent.results.map((result) => result.skill), skills)
  for (const result of all.structuredContent.results) assert.deepEqual(result.issues, [], result.skill)
  assert.ok(all.structuredContent.bar.length >= 6)
  assert.match(all.content[0].text, /skill-check <your-skill-folder>/)
  const one = await ok('skill_check', { skill: 'reality-daily' })
  assert.deepEqual(one.structuredContent.results.map((result) => result.skill), ['reality-daily'])
  await toolError('skill_check', { skill: 'no-such-skill' }, /one of the published skills/)
})

test('an unknown tool is a JSON-RPC -32602 error, and an unknown method -32601', async () => {
  const unknown = await call('no_such_tool', {})
  assert.equal(unknown.status, 200)
  assert.equal(unknown.body.error.code, -32602)
  assert.equal(unknown.body.id, 1)
  // The local server's personal tools do not exist here.
  for (const name of ['reality_status', 'reality_kernel', 'reality_graph', 'reality_validate']) assert.equal((await call(name, {})).body.error.code, -32602, name)
  assert.equal((await rpc({ jsonrpc: '2.0', id: 2, method: 'resources/list' })).body.error.code, -32601)
})

test('malformed parameters: protocol errors for the shape, tool errors for the values', async () => {
  assert.equal((await call('program_day', 'not an object')).body.error.code, -32602)
  assert.equal((await call('program_day', null)).body.error.code, -32602)
  assert.equal((await rpc({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: {} })).body.error.code, -32602)
  await toolError('program_day', {}, /day is required/)
  await toolError('program_day', { day: 'three' }, /whole number from 1 to 30/)
  await toolError('program_day', { day: 0 }, /whole number from 1 to 30/)
  await toolError('program_day', { day: 31 }, /whole number from 1 to 30/)
  await toolError('program_day', { day: 2.5 }, /whole number from 1 to 30/)
  await toolError('program_day', { day: 1, extra: true }, /Unknown argument "extra"/)
  await toolError('loop_prompts', { loop: 'nope' }, /loop must be one of: morning, evening/)
  await toolError('library_search', { query: 42 }, /query must be a string/)
  await toolError('library_search', { id: '../../etc/passwd' }, /id is not in the expected form/)
  await toolError('skill_check', { skill: '../reality-daily' }, /skill is not in the expected form/)
})

test('oversized input: an argument past its bound is a tool error; a body past 64 KB is refused with 413', async () => {
  await toolError('library_search', { query: 'x'.repeat(201) }, /at most 200 characters/)
  await toolError('library_search', { id: 'a'.repeat(81) }, /at most 80 characters/)
  assert.equal((await ok('library_search', { query: 'x'.repeat(200) })).structuredContent.entries.length, 0)

  const big = { jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'library_search', arguments: { query: 'x'.repeat(MAX_BODY_BYTES) } } }
  const streamed = await rpc(big)
  assert.equal(streamed.status, 413)
  assert.equal(streamed.body.error.code, -32600)
  const declared = await rpc({ jsonrpc: '2.0', id: 1, method: 'ping' }, { 'content-length': String(MAX_BODY_BYTES + 1) })
  assert.equal(declared.status, 413, 'a declared length over the limit is refused before the body is read')
})

test('GET and DELETE are 405 with Allow: POST', async () => {
  for (const response of [GET(), DELETE()]) {
    assert.equal(response.status, 405)
    assert.equal(response.headers.get('allow'), 'POST')
    assert.equal((await response.json()).error.code, -32000)
  }
})

test('a JSON-RPC batch is rejected with 400, and so is anything that is not one valid message', async () => {
  const batch = await rpc([{ jsonrpc: '2.0', id: 1, method: 'ping' }, { jsonrpc: '2.0', id: 2, method: 'tools/list' }])
  assert.equal(batch.status, 400)
  assert.equal(batch.body.error.code, -32600)
  assert.match(batch.body.error.message, /batches are not supported/)
  const parse = await rpc('{"jsonrpc": "2.0", "id": 1, "method": ')
  assert.equal(parse.status, 400)
  assert.equal(parse.body.error.code, -32700)
  // The raw string '"text"' is a JSON string, not an object; the last is a JSON-RPC response, which a client never sends.
  for (const bad of [{ id: 1, method: 'ping' }, { jsonrpc: '2.0', id: { x: 1 }, method: 'ping' }, '"text"', null, { jsonrpc: '2.0', id: 1, result: {} }]) {
    const response = await rpc(bad)
    assert.equal(response.status, 400, JSON.stringify(bad))
    assert.equal(response.body.error.code, -32600, JSON.stringify(bad))
  }
})

test('transport headers: content type, accept, protocol version and origin', async () => {
  const ping = { jsonrpc: '2.0', id: 1, method: 'ping' }
  assert.equal((await rpc(ping, { 'content-type': 'text/plain' })).status, 415)
  assert.equal((await rpc(ping, { 'content-type': 'application/json; charset=utf-8' })).status, 200)
  assert.equal((await rpc(ping, { accept: 'text/html' })).status, 406)
  assert.equal((await rpc(ping, { accept: '*/*' })).status, 200)
  // An unsupported version is a plain 400, never the modern -32022, so a newer client falls back to initialize.
  const version = await rpc(ping, { 'mcp-protocol-version': '2026-07-28' })
  assert.equal(version.status, 400)
  assert.equal(version.body.error.code, -32600)
  assert.match(version.body.error.message, /2025-11-25/)
  for (const supported of PROTOCOL_VERSIONS) assert.equal((await rpc(ping, { 'mcp-protocol-version': supported })).status, 200, supported)
  assert.equal((await rpc(ping, { origin: 'https://evil.example' })).status, 403)
  assert.equal((await rpc(ping, { origin: 'https://www.realityarchitect.ai' })).status, 200)
  assert.equal((await rpc(ping, { 'mcp-session-id': 'made-up' })).status, 200, 'a session id is ignored')
})

test('no tool output carries a checkout link, a Polar link or a price', async () => {
  const outputs = []
  const collect = async (name, args) => {
    const result = await ok(name, args)
    outputs.push(`${result.content.map((item) => item.text).join('\n')}\n${JSON.stringify(result.structuredContent)}`)
  }
  await collect('library_search', {})
  for (const entry of library.entries) await collect('library_search', { id: entry.id })
  for (let day = 1; day <= DAYS; day++) await collect('program_day', { day })
  await collect('loop_prompts', {})
  await collect('skill_check', {})
  const init = await rpc({ jsonrpc: '2.0', id: 1, method: 'initialize', params: INIT })
  const list = await rpc({ jsonrpc: '2.0', id: 2, method: 'tools/list' })
  outputs.push(JSON.stringify(init.body), JSON.stringify(list.body))
  for (const output of outputs) {
    assert.doesNotMatch(output, /polar\.sh|polar_cl_|checkout/i)
    assert.doesNotMatch(output, /\bprice|\b\d+(?:[.,]\d{2})?\s?(?:USD|EUR|GBP|dollars?|euros?)\b/i)
    assert.deepEqual(closedPageProblems(output), [])
  }
})

test('the endpoint reads no personal data, logs nothing, and keeps nothing between requests', async (t) => {
  // A home with a marker in it, where the local server would look: no public tool may surface it.
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'ra-public-mcp-'))
  t.after(() => fs.rmSync(home, { recursive: true, force: true }))
  const MARKER = 'private-marker-7f3a'
  fs.writeFileSync(path.join(home, 'reality.md'), `# Reality\n\n${MARKER}\n`)
  const previous = process.env.REALITY_HOME
  process.env.REALITY_HOME = home
  t.after(() => (previous === undefined ? delete process.env.REALITY_HOME : (process.env.REALITY_HOME = previous)))

  const logged = []
  for (const method of ['log', 'info', 'warn', 'error', 'debug']) {
    const original = console[method]
    console[method] = (...args) => logged.push(args.join(' '))
    t.after(() => (console[method] = original))
  }
  const SECRET = 'body-marker-91c2'
  const responses = []
  for (const tool of PUBLIC_TOOLS) responses.push(JSON.stringify((await call(tool.name, {})).body))
  responses.push(JSON.stringify((await call('library_search', { query: SECRET })).body))
  responses.push(JSON.stringify((await call('program_day', { day: 'x', note: SECRET })).body))
  for (const response of responses) assert.ok(!response.includes(MARKER), 'no personal file is read')
  assert.ok(!responses.at(-1).includes(SECRET), 'argument values are not echoed back')
  assert.deepEqual(logged, [], 'nothing is logged')

  // The hosted code never imports the local server, the network, or the environment, and never logs.
  for (const file of ['app/api/mcp/route.ts', 'lib/mcp/http.ts', 'lib/mcp/tools.ts', 'plugins/reality-architect/mcp/core.mjs']) {
    const source = fs.readFileSync(file, 'utf8')
    assert.doesNotMatch(source, /mcp\/server\.mjs|loadReality|resolveHome|engine\/(?:kernel|graph|brief|insights|validate)\.mjs/, `${file} reaches the personal tools`)
    assert.doesNotMatch(source, /\bfetch\s*\(|node:https?|XMLHttpRequest|process\.env|console\./, `${file} reaches the network, the environment or a log`)
  }
})
