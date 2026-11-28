import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('/agents.md and /.well-known/agent.json routes expose canonical AX discovery', () => {
  const agentsMd = read('app/agents.md/route.ts')
  const agentJson = read('app/.well-known/agent.json/route.ts')

  assert.match(agentsMd, /text\/markdown; charset=utf-8/)
  assert.match(agentsMd, /\/llms\.txt/)
  assert.match(agentsMd, /\/\.well-known\/agent\.json/)
  assert.match(agentsMd, /\/standard/)
  assert.match(agentsMd, /\/studio/)
  assert.match(agentJson, /starlight\.agent\.v1/)
  assert.match(agentJson, /local-first/)
  assert.match(agentJson, /license:\s*'MIT'/)
  assert.match(agentJson, /\/agents\.md/)
})

test('every path the agent surface advertises resolves to a route or a public file', () => {
  const exists = (path) => fs.existsSync(new URL(`../${path}`, import.meta.url))
  const routeOrFile = (route) =>
    exists(`app${route}/route.ts`) ||
    exists(`app${route}/page.tsx`) ||
    exists(`public${route}`)

  for (const route of [
    '/llms.txt',
    '/llms-full.txt',
    '/.well-known/agent.json',
    '/agents.md',
    '/standard',
    '/method',
    '/studio',
    '/threshold',
    '/assess',
    '/library',
    '/api/mcp',
  ]) {
    assert.ok(routeOrFile(route), `agent surface advertises ${route} but nothing serves it`)
  }
})
