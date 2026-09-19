import { NextResponse } from 'next/server'
import { read, surface, propose, guard, parseReality } from '@/lib/reality'

/**
 * Stateless JSON facade over the reality.md engine — the transport behind the
 * on-page playground. Same guarantees as the MCP server: the document is
 * analyzed in memory and never stored, logged, or forwarded. Every response is
 * derived purely from the request body.
 */

export const runtime = 'nodejs'

const MAX_DOC = 60_000
const MAX_INPUTS = 12

type Verb = 'read' | 'surface' | 'propose' | 'guard'

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body must be JSON.' }, { status: 400 })
  }

  const { verb, content, inputs, situation, action } = (body ?? {}) as {
    verb?: Verb
    content?: string
    inputs?: unknown
    situation?: string
    action?: string
  }

  if (typeof content !== 'string' || !content.trim()) {
    return NextResponse.json({ error: 'A non-empty reality.md `content` string is required.' }, { status: 400 })
  }
  if (content.length > MAX_DOC) {
    return NextResponse.json({ error: `Document exceeds ${MAX_DOC} characters.` }, { status: 413 })
  }

  try {
    switch (verb) {
      case 'read':
        return NextResponse.json(read(content))

      case 'surface': {
        const list = Array.isArray(inputs)
          ? inputs.filter((i): i is string => typeof i === 'string' && i.trim().length > 0).slice(0, MAX_INPUTS)
          : []
        if (!list.length) {
          return NextResponse.json({ error: 'Provide at least one input line to triage.' }, { status: 400 })
        }
        return NextResponse.json({ results: surface(parseReality(content), list) })
      }

      case 'propose':
        return NextResponse.json(propose(parseReality(content), typeof situation === 'string' ? situation : undefined))

      case 'guard': {
        if (typeof action !== 'string' || !action.trim()) {
          return NextResponse.json({ error: 'Provide an `action` to check.' }, { status: 400 })
        }
        return NextResponse.json(guard(parseReality(content), action))
      }

      default:
        return NextResponse.json({ error: 'Unknown verb. Use read, surface, propose, or guard.' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Could not analyze the document.' }, { status: 500 })
  }
}
