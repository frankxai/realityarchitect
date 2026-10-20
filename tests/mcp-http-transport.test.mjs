import assert from 'node:assert/strict'
import test from 'node:test'
import { POST } from '../app/api/mcp/route.ts'
import { MAX_BODY_BYTES } from '../lib/mcp/http.ts'

const ENDPOINT = 'https://www.realityarchitect.ai/api/mcp'
const HEADERS = { 'content-type': 'application/json', accept: 'application/json' }
const PING = JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'ping' })

function makeRequest(url = ENDPOINT, body = PING, headers = {}) {
  return new Request(url, {
    method: 'POST',
    headers: { ...HEADERS, ...headers },
    body,
  })
}

test('origin verification for public MCP endpoint', async () => {
  const reqNoOrigin = makeRequest()
  const resNoOrigin = await POST(reqNoOrigin)
  assert.equal(resNoOrigin.status, 200)

  const reqSiteOrigin = makeRequest(ENDPOINT, PING, { origin: 'https://www.realityarchitect.ai' })
  const resSiteOrigin = await POST(reqSiteOrigin)
  assert.equal(resSiteOrigin.status, 200)

  const vercelUrl = 'https://realityarchitect-git-x.vercel.app/api/mcp'
  const vercelOrigin = 'https://realityarchitect-git-x.vercel.app'
  const reqVercelSameOrigin = makeRequest(vercelUrl, PING, { origin: vercelOrigin })
  const resVercelSameOrigin = await POST(reqVercelSameOrigin)
  assert.equal(resVercelSameOrigin.status, 200)

  const reqVercelDiffOrigin = makeRequest(vercelUrl, PING, { origin: 'https://evil.example' })
  const resVercelDiffOrigin = await POST(reqVercelDiffOrigin)
  assert.equal(resVercelDiffOrigin.status, 403)

  const forbiddenOrigins = [
    'null',
    'https://www.realityarchitect.ai.evil.example',
    'https://www.realityarchitect.ai/',
    'http://www.realityarchitect.ai',
    'https://realityarchitect.ai',
  ]

  for (const origin of forbiddenOrigins) {
    const req = makeRequest(ENDPOINT, PING, { origin })
    const res = await POST(req)
    assert.equal(res.status, 403, `Expected 403 for origin ${origin}`)
    const json = await res.json()
    assert.equal(json.error?.code, -32600, `Expected -32600 for origin ${origin}`)
  }
})

test('byte-boundary and multi-byte body limit enforcement', async () => {
  const prefix = '{"jsonrpc":"2.0","id":1,"method":"ping","pad":"'
  const suffix = '"}'
  const baseLen = new TextEncoder().encode(prefix + suffix).byteLength

  const exactBody = prefix + 'a'.repeat(MAX_BODY_BYTES - baseLen) + suffix
  assert.equal(new TextEncoder().encode(exactBody).byteLength, MAX_BODY_BYTES)
  const resExact = await POST(makeRequest(ENDPOINT, exactBody))
  assert.equal(resExact.status, 200)

  const overBody = prefix + 'a'.repeat(MAX_BODY_BYTES - baseLen + 1) + suffix
  assert.equal(new TextEncoder().encode(overBody).byteLength, MAX_BODY_BYTES + 1)
  const resOver = await POST(makeRequest(ENDPOINT, overBody))
  assert.equal(resOver.status, 413)

  const pad30k = prefix + '€'.repeat(30000) + suffix
  const res30k = await POST(makeRequest(ENDPOINT, pad30k))
  assert.equal(res30k.status, 413)

  const pad20k = prefix + '€'.repeat(20000) + suffix
  const res20k = await POST(makeRequest(ENDPOINT, pad20k))
  assert.equal(res20k.status, 200)
})

test('invalid UTF-8, empty, and whitespace-only body parsing', async () => {
  const reqInvalidUtf8 = new Request(ENDPOINT, {
    method: 'POST',
    headers: HEADERS,
    body: new Uint8Array([0x7b, 0xff, 0xfe, 0x7d]),
  })
  const resInvalidUtf8 = await POST(reqInvalidUtf8)
  assert.equal(resInvalidUtf8.status, 400)
  const jsonInvalidUtf8 = await resInvalidUtf8.json()
  assert.equal(jsonInvalidUtf8.error?.code, -32700)

  const reqEmpty = makeRequest(ENDPOINT, '')
  const resEmpty = await POST(reqEmpty)
  assert.equal(resEmpty.status, 400)
  const jsonEmpty = await resEmpty.json()
  assert.equal(jsonEmpty.error?.code, -32700)

  const reqWhitespace = makeRequest(ENDPOINT, '   \n\t  ')
  const resWhitespace = await POST(reqWhitespace)
  assert.equal(resWhitespace.status, 400)
  const jsonWhitespace = await resWhitespace.json()
  assert.equal(jsonWhitespace.error?.code, -32700)
})
