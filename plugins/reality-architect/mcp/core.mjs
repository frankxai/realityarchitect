/**
 * The transport-agnostic core of the Reality Architect MCP servers: the JSON-RPC 2.0 dispatcher and the Library
 * search. No dependencies, and no file, network or environment access, so two transports share it:
 * - `server.mjs`, the local stdio server over the person's own files;
 * - the public read-only endpoint on the website (`app/api/mcp`), which imports this file and never the personal tools.
 */

export const PROTOCOL_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05']

export const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }

/** A problem the agent can fix in its arguments (or a missing home): answered as a tool result with isError. */
export class ToolError extends Error {}

export const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)

/** The initialize params MCP requires: protocolVersion, capabilities, and clientInfo with a name and version. */
function validInitialize(params) {
  return isPlainObject(params) && typeof params.protocolVersion === 'string' && isPlainObject(params.capabilities) && isPlainObject(params.clientInfo) && typeof params.clientInfo.name === 'string' && typeof params.clientInfo.version === 'string'
}

/** One Library entry as text, every part labeled: Keep (meaning), Mechanism, Limits. */
export const libraryEntryText = (entry) => [`${entry.name} — ${entry.works} (${entry.shelf} shelf, id ${entry.id})`, `Keep (meaning): ${entry.keep}`, `Mechanism: ${entry.mechanism}`, `Limits: ${entry.limits}`].join('\n')

/**
 * Searches the Library data (library.json, generated from lib/library.ts): by id, or by words that must all appear in
 * an entry. With neither, every entry. Each entry is labeled Keep (meaning), Mechanism and Limits.
 */
export function searchLibrary(library, args = {}) {
  const entries = library.entries
  let found = entries
  if (args.id) found = entries.filter((entry) => entry.id === args.id)
  else if (args.query) {
    const words = String(args.query).toLowerCase().split(/\s+/).filter(Boolean)
    found = entries.filter((entry) => words.every((word) => [entry.id, entry.name, entry.works, entry.keep, entry.mechanism, entry.limits, ...(entry.tags ?? [])].join(' ').toLowerCase().includes(word)))
  }
  return { text: found.length ? found.map(libraryEntryText).join('\n\n') : 'No Library entry matches.', data: { entries: found } }
}

/**
 * One MCP dispatcher: it takes one parsed JSON-RPC message and returns the response object, or null for a
 * notification. Protocol problems (an unknown tool, malformed params) are JSON-RPC errors; problems the agent can fix
 * in its arguments come back as a tool result with isError, so the model sees them.
 *
 * - `lifecycle: true` (stdio, one connection is one session): a valid `initialize` request, then the client's
 *   `notifications/initialized`, and only then do tools answer. Before that they answer -32002.
 * - `lifecycle: false` (stateless HTTP, each request stands alone): `initialize` is answered the same way, and
 *   `tools/list` and `tools/call` answer without a session.
 *
 * `call(name, args)` returns { text, data } or throws ToolError. `internalError(error)` words any other failure.
 */
export function createDispatcher({ tools, call, serverInfo, instructions, lifecycle = true, internalError = (error) => `The engine failed: ${error.message}` }) {
  let phase = lifecycle ? 'new' : 'ready' // 'new' → 'initializing' (initialize answered) → 'ready' (initialized notification received)
  return function handle(message) {
    const isObject = isPlainObject(message)
    // A request has an id member (a string, a number, or null); a notification has none.
    const hasId = isObject && Object.prototype.hasOwnProperty.call(message, 'id')
    const id = hasId ? message.id : undefined
    const validId = id === null || typeof id === 'string' || (typeof id === 'number' && Number.isFinite(id))
    if (!isObject || message.jsonrpc !== '2.0' || typeof message.method !== 'string' || (hasId && !validId)) {
      return { jsonrpc: '2.0', id: validId ? id : null, error: { code: -32600, message: 'Invalid request' } }
    }
    const { method, params } = message
    const reply = (result) => (hasId ? { jsonrpc: '2.0', id, result } : null)
    const fail = (code, text) => (hasId ? { jsonrpc: '2.0', id, error: { code, message: text } } : null)

    if (method === 'initialize') {
      // A notification cannot initialize, and neither can a request without the required params.
      if (!hasId) return null
      if (!validInitialize(params)) return fail(-32602, 'Invalid params: initialize needs protocolVersion, capabilities and clientInfo { name, version }.')
      if (lifecycle) phase = 'initializing'
      const requested = params.protocolVersion
      return reply({
        protocolVersion: PROTOCOL_VERSIONS.includes(requested) ? requested : PROTOCOL_VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo,
        instructions,
      })
    }
    if (method === 'ping') return reply({})
    if (method.startsWith('notifications/')) {
      if (lifecycle && method === 'notifications/initialized' && !hasId && phase === 'initializing') phase = 'ready'
      return null
    }
    if (method !== 'tools/list' && method !== 'tools/call') return fail(-32601, `Method not found: ${method}`)
    if (phase !== 'ready') return fail(-32002, 'Server not initialized: send initialize, then notifications/initialized.')
    if (method === 'tools/list') return reply({ tools })

    // tools/call: arguments may be omitted (then {}), but when present they must be an object, never null.
    const name = params?.name
    const args = isPlainObject(params) && Object.prototype.hasOwnProperty.call(params, 'arguments') ? params.arguments : {}
    if (typeof name !== 'string' || !tools.some((tool) => tool.name === name)) return fail(-32602, `Invalid params: unknown tool ${JSON.stringify(name ?? null)}.`)
    if (!isPlainObject(args)) return fail(-32602, 'Invalid params: arguments must be an object.')
    try {
      const { text, data } = call(name, args)
      return reply({ content: [{ type: 'text', text }], structuredContent: data && !Array.isArray(data) ? data : { value: data }, isError: false })
    } catch (error) {
      if (error instanceof ToolError) return reply({ content: [{ type: 'text', text: error.message }], isError: true })
      return reply({ content: [{ type: 'text', text: internalError(error) }], isError: true })
    }
  }
}
