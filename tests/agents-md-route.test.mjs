import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('lib/site.ts removes the triad cliché from metadata tagline', () => {
  const siteSource = read('lib/site.ts')
  assert.doesNotMatch(siteSource, /Imagine it\.\s*Build it\.\s*Witness it\./i)
  assert.match(siteSource, /A local-first life practice, exported as Markdown\./)
})

test('/agents.md and /.well-known/agent.json routes expose canonical AX discovery', () => {
  const agentsMd = read('app/agents.md/route.ts')
  const agentJson = read('app/.well-known/agent.json/route.ts')

  assert.match(agentsMd, /text\/markdown; charset=utf-8/)
  assert.match(agentsMd, /\/llms\.txt/)
  assert.match(agentsMd, /\/\.well-known\/agent\.json/)
  assert.match(agentsMd, /\/standard/)
  assert.match(agentsMd, /\/studio/)
  assert.doesNotMatch(agentsMd, /Imagine it\.\s*Build it\.\s*Witness it\./i)

  assert.match(agentJson, /starlight\.agent\.v1/)
  assert.match(agentJson, /local-first/)
  assert.match(agentJson, /license:\s*'MIT'/)
  assert.match(agentJson, /\/agents\.md/)
})
