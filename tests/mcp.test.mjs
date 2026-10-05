import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { run } from '../plugins/reality-architect/bin/reality.mjs'
import { TOOLS, callTool, createSession } from '../plugins/reality-architect/mcp/server.mjs'
import { bundleFiles } from '../lib/studio/export.ts'
import { sampleState } from '../lib/studio/sample.ts'

const TODAY = '2026-10-04'

function sampleHome(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ra-mcp-'))
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  for (const file of bundleFiles(sampleState(TODAY), TODAY)) {
    fs.mkdirSync(path.dirname(path.join(dir, file.path)), { recursive: true })
    fs.writeFileSync(path.join(dir, file.path), file.text)
  }
  return path.join(dir, 'Reality Architect')
}

/** What the CLI prints for the same command, so the MCP tools and `reality` provably agree. */
function cli(argv, home) {
  const lines = []
  run([...argv, '--home', home, '--today', TODAY], { out: (text) => lines.push(text) })
  return lines.join('\n')
}

test('every tool is read-only, titled, and has an object schema', () => {
  assert.equal(TOOLS.length, 9)
  for (const tool of TOOLS) {
    assert.match(tool.name, /^[a-z_]+$/)
    assert.ok(tool.title && tool.description, tool.name)
    assert.equal(tool.inputSchema.type, 'object', tool.name)
    assert.deepEqual(tool.annotations, { title: tool.title, readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }, tool.name)
  }
})

test('the tools compute the same answers as the CLI on a real export', (t) => {
  const home = sampleHome(t)
  const env = { REALITY_HOME: home }
  assert.equal(callTool('reality_status', { today: TODAY }, env).text, cli(['status'], home))
  assert.equal(callTool('reality_due', { today: TODAY }, env).text, cli(['due'], home))
  assert.equal(callTool('reality_brief', { loop: 'weekly', today: TODAY }, env).text, cli(['brief', 'weekly'], home))
  assert.equal(callTool('reality_insights', { today: TODAY }, env).text, cli(['insights'], home))
  assert.equal(callTool('reality_validate', {}, env).text, cli(['validate'], home))
  // Compared as JSON, the form MCP sends.
  assert.deepEqual(JSON.parse(JSON.stringify(callTool('reality_graph', { today: TODAY }, env).data)), JSON.parse(cli(['graph'], home)))
  for (const audience of ['private', 'alliance']) {
    const viaTool = JSON.parse(JSON.stringify(callTool('reality_kernel', { audience, offset: 'Z', today: TODAY }, env).data))
    assert.deepEqual(viaTool, JSON.parse(cli(['kernel', '--audience', audience, '--offset', 'Z', '--check'], home)), audience)
  }
  assert.throws(() => callTool('reality_kernel', { audience: 'public', today: TODAY }, env), /Reality Card/)
  const status = callTool('reality_status', { today: TODAY }, env).data
  assert.ok(status.aims.length >= 1 && Array.isArray(status.due))
})

test('the Library answers by words or id without a home', () => {
  const byId = callTool('library_search', { id: 'gollwitzer' }, {})
  assert.equal(byId.data.entries.length, 1)
  assert.match(byId.text, /Keep \(meaning\):[\s\S]*Mechanism:[\s\S]*Limits:/)
  assert.ok(callTool('library_search', { query: 'if-then' }, {}).data.entries.length >= 1)
  assert.equal(callTool('library_search', { query: 'zzzz-no-such-thing' }, {}).text, 'No Library entry matches.')
  assert.match(callTool('reality_loops', {}, {}).text, /^morning: /)
})

/** A session that has completed the MCP handshake. */
function ready(env) {
  const handle = createSession(env)
  handle({ jsonrpc: '2.0', id: 0, method: 'initialize', params: { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'test', version: '0' } } })
  handle({ jsonrpc: '2.0', method: 'notifications/initialized' })
  return handle
}
const call = (handle, name, args, id = 1) => handle({ jsonrpc: '2.0', id, method: 'tools/call', params: { name, arguments: args } })

test('the lifecycle holds: a valid initialize, then the initialized notification, then tools; ping always', () => {
  const INIT = { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '0' } }
  const handle = createSession({ REALITY_HOME: os.tmpdir() })
  assert.equal(handle({ jsonrpc: '2.0', id: 1, method: 'tools/list' }).error.code, -32002)
  assert.equal(call(handle, 'reality_loops', {}).error.code, -32002)
  assert.deepEqual(handle({ jsonrpc: '2.0', id: 2, method: 'ping' }).result, {})

  // Malformed initialize requests and an initialize notification change nothing.
  for (const params of [undefined, {}, { protocolVersion: '2025-06-18' }, { ...INIT, clientInfo: { name: 'x' } }, { ...INIT, capabilities: null }]) {
    assert.equal(handle({ jsonrpc: '2.0', id: 3, method: 'initialize', params }).error.code, -32602, JSON.stringify(params))
  }
  assert.equal(handle({ jsonrpc: '2.0', method: 'initialize', params: INIT }), null)
  handle({ jsonrpc: '2.0', method: 'notifications/initialized' })
  assert.equal(handle({ jsonrpc: '2.0', id: 4, method: 'tools/list' }).error.code, -32002, 'the notification before a valid initialize does not unlock')

  // A valid initialize alone does not unlock tools; the initialized notification does.
  assert.equal(handle({ jsonrpc: '2.0', id: 5, method: 'initialize', params: INIT }).result.protocolVersion, '2025-06-18')
  assert.equal(handle({ jsonrpc: '2.0', id: 6, method: 'tools/list' }).error.code, -32002)
  assert.equal(handle({ jsonrpc: '2.0', method: 'notifications/initialized' }), null)
  assert.equal(handle({ jsonrpc: '2.0', id: 7, method: 'tools/list' }).result.tools.length, TOOLS.length)
})

test('protocol errors are JSON-RPC errors; argument and home problems are tool results the agent can fix', () => {
  // REALITY_HOME pointing at a folder without reality.md: no home, whatever this machine's ~/reality.md holds.
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'ra-mcp-empty-'))
  const home = call(ready({ REALITY_HOME: empty }), 'reality_status', {})
  fs.rmSync(empty, { recursive: true, force: true })
  assert.equal(home.result.isError, true)
  assert.match(home.result.content[0].text, /REALITY_HOME/)

  const handle = ready({ REALITY_HOME: os.tmpdir() })
  for (const [name, args, expected] of [['reality_brief', { loop: 'nope' }, /loop must be one of/], ['reality_status', { today: '2026-02-31' }, /real day/], ['reality_insights', { days: 3 }, /7 to 365/]]) {
    const response = call(handle, name, args)
    assert.equal(response.result.isError, true, name)
    assert.match(response.result.content[0].text, expected, name)
  }
  assert.equal(call(handle, 'no_such_tool', {}).error.code, -32602)
  assert.equal(handle({ jsonrpc: '2.0', id: 5, method: 'tools/call', params: {} }).error.code, -32602)
  assert.equal(call(handle, 'reality_loops', 'not an object').error.code, -32602)
  assert.equal(call(handle, 'reality_loops', null).error.code, -32602, 'arguments may be omitted, never null')
  assert.equal(handle({ jsonrpc: '2.0', id: 7, method: 'tools/call', params: { name: 'reality_loops' } }).result.isError, false, 'omitted arguments are {}')
  assert.equal(handle({ jsonrpc: '2.0', id: 6, method: 'nope' }).error.code, -32601)
  assert.equal(handle({ jsonrpc: '2.0', method: 'notifications/initialized' }), null)
})

test('ids: null is a request and is answered; invalid ids and messages are rejected', () => {
  const handle = createSession({})
  assert.deepEqual(handle({ jsonrpc: '2.0', id: null, method: 'ping' }), { jsonrpc: '2.0', id: null, result: {} })
  assert.equal(handle({ jsonrpc: '2.0', id: 'a', method: 'ping' }).id, 'a')
  for (const bad of [{ jsonrpc: '2.0', id: { x: 1 }, method: 'ping' }, { jsonrpc: '2.0', id: true, method: 'ping' }, { id: 4, method: 'ping' }, [], null, 'text']) {
    const response = handle(bad)
    assert.equal(response.error.code, -32600, JSON.stringify(bad))
  }
  assert.equal(handle({ id: 4, method: 'ping' }).id, 4, 'a valid id is echoed even when the message is invalid')
})

test('over stdio: initialize, list, call', async (t) => {
  const home = sampleHome(t)
  const server = spawn(process.execPath, ['plugins/reality-architect/mcp/server.mjs'], { env: { ...process.env, REALITY_HOME: home }, stdio: ['pipe', 'pipe', 'inherit'] })
  t.after(() => server.kill())
  const responses = []
  let buffer = ''
  server.stdout.on('data', (chunk) => {
    buffer += chunk
    let index
    while ((index = buffer.indexOf('\n')) !== -1) {
      responses.push(JSON.parse(buffer.slice(0, index)))
      buffer = buffer.slice(index + 1)
    }
  })
  const send = (message) => server.stdin.write(`${JSON.stringify(message)}\n`)
  send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '0' } } })
  send({ jsonrpc: '2.0', method: 'notifications/initialized' })
  send({ jsonrpc: '2.0', id: 2, method: 'tools/list' })
  send({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'reality_due', arguments: { today: TODAY } } })
  server.stdin.write(`not json${String.fromCharCode(10)}`)
  for (let i = 0; i < 100 && responses.length < 4; i++) await new Promise((resolve) => setTimeout(resolve, 50))
  const byId = new Map(responses.map((response) => [response.id, response]))
  assert.equal(byId.get(1).result.protocolVersion, '2025-06-18')
  assert.equal(byId.get(1).result.serverInfo.name, 'reality-architect')
  assert.deepEqual(byId.get(1).result.capabilities, { tools: { listChanged: false } })
  assert.equal(byId.get(2).result.tools.length, TOOLS.length)
  assert.equal(byId.get(3).result.isError, false)
  assert.equal(byId.get(3).result.content[0].text, cli(['due'], home))
  assert.ok(responses.some((response) => response.error?.code === -32700), 'a parse error is answered, not fatal')
})

test('the plugin declares the server', () => {
  const config = JSON.parse(fs.readFileSync('plugins/reality-architect/.mcp.json', 'utf8'))
  assert.deepEqual(config.mcpServers.reality, { command: 'node', args: ['${CLAUDE_PLUGIN_ROOT}/mcp/server.mjs'] })
})
