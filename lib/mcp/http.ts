import { PROTOCOL_VERSIONS, createDispatcher } from '../../plugins/reality-architect/mcp/core.mjs'
import { site } from '../site.ts'
import { INSTRUCTIONS, PUBLIC_TOOLS, SERVER_INFO, callPublicTool } from './tools.ts'

/**
 * The Streamable HTTP transport for the public MCP endpoint, stateless: every POST carries one JSON-RPC message and
 * gets one application/json answer (or 202 for a notification). No session is minted, no SSE stream is opened, and
 * nothing about a request is kept or logged; the dispatcher is the same one the plugin's stdio server uses, with the
 * lifecycle gate off because each request stands alone.
 *
 * Status codes follow the MCP transport spec (2025-03-26 to 2025-11-25):
 * 405 GET and DELETE · 403 a foreign Origin · 400 an unsupported MCP-Protocol-Version, a parse error, a batch or an
 * invalid message · 415 a body that is not JSON · 406 an Accept that excludes JSON · 413 a body over the limit.
 */

export const MAX_BODY_BYTES = 64 * 1024

const dispatch = createDispatcher({
  tools: PUBLIC_TOOLS,
  call: callPublicTool,
  serverInfo: SERVER_INFO,
  instructions: INSTRUCTIONS,
  lifecycle: false,
  // Never echo an internal message (it could name a server path); the agent only needs to know it can retry.
  internalError: () => 'This tool could not answer just now. Nothing was stored; try again later.',
})

const HEADERS = { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }

function json(status: number, body: unknown, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...HEADERS, ...extra } })
}

const rpcError = (status: number, code: number, message: string, extra: Record<string, string> = {}) => json(status, { jsonrpc: '2.0', id: null, error: { code, message } }, extra)

/** GET (no standalone SSE stream) and DELETE (no sessions to end) are not offered. */
export function methodNotAllowed(): Response {
  return rpcError(405, -32000, 'Method not allowed: this MCP endpoint accepts POST only.', { allow: 'POST' })
}

/**
 * Origin is checked to stop DNS rebinding (the spec requires it): a request without Origin is a server-side client;
 * a browser request must come from the site itself or from this deployment's own origin.
 */
function allowedOrigin(origin: string, request: Request): boolean {
  if (origin === site.url) return true
  try {
    return origin === new URL(request.url).origin
  } catch {
    return false
  }
}

function acceptsJson(accept: string | null): boolean {
  if (accept === null || accept.trim() === '') return true
  return accept.split(',').some((range) => ['application/json', 'application/*', '*/*'].includes(range.split(';')[0].trim().toLowerCase()))
}

/** The body as text, or null when it is over the limit. Read as a stream, so an oversized body is never buffered. */
async function readBody(request: Request, limit: number): Promise<string | null> {
  const declared = request.headers.get('content-length')
  if (declared !== null && Number(declared) > limit) return null
  if (!request.body) return ''
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > limit) {
      await reader.cancel()
      return null
    }
    chunks.push(value)
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  // Invalid UTF-8 throws here and is answered as a parse error.
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
}

export async function handlePost(request: Request): Promise<Response> {
  const origin = request.headers.get('origin')
  if (origin !== null && !allowedOrigin(origin, request)) return rpcError(403, -32600, 'Forbidden: this Origin may not call the endpoint.')

  const version = request.headers.get('mcp-protocol-version')
  if (version !== null && !PROTOCOL_VERSIONS.includes(version)) {
    return rpcError(400, -32600, `Bad request: unsupported MCP-Protocol-Version. This server speaks ${PROTOCOL_VERSIONS.join(', ')}; start with initialize.`)
  }

  const type = (request.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
  if (type !== 'application/json') return rpcError(415, -32600, 'Unsupported media type: send one JSON-RPC message as application/json.')
  if (!acceptsJson(request.headers.get('accept'))) return rpcError(406, -32600, 'Not acceptable: this server answers with application/json.')

  let body: string | null
  try {
    body = await readBody(request, MAX_BODY_BYTES)
  } catch {
    return rpcError(400, -32700, 'Parse error')
  }
  if (body === null) return rpcError(413, -32600, `Payload too large: the limit is ${MAX_BODY_BYTES} bytes.`)

  let message: unknown
  try {
    message = JSON.parse(body)
  } catch {
    return rpcError(400, -32700, 'Parse error')
  }
  if (Array.isArray(message)) return rpcError(400, -32600, 'Invalid request: JSON-RPC batches are not supported. Send one message per request.')

  const response = dispatch(message) as { error?: { code: number } } | null
  if (response === null) return new Response(null, { status: 202, headers: { 'cache-control': 'no-store' } })
  return json(response.error?.code === -32600 ? 400 : 200, response)
}
