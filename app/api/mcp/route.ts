import { handlePost, methodNotAllowed } from '../../../lib/mcp/http.ts'

/**
 * The public, read-only MCP endpoint: Streamable HTTP, stateless, no account. It serves the site's own public content
 * (the Library, the 30-day program, the practice loops, the skill bar) and nothing personal: no tool reads or stores a
 * person's data, calls a model, or reaches the network. See lib/mcp/ and docs/directory/.
 */

export const runtime = 'nodejs'

export function POST(request: Request): Promise<Response> {
  return handlePost(request)
}

export function GET(): Response {
  return methodNotAllowed()
}

export function DELETE(): Response {
  return methodNotAllowed()
}
