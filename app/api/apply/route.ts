import { NextResponse } from 'next/server'

// Reality Architect has no ESP or database of its own yet. Waitlist signups
// route server-to-server through the FrankX Resend audience — the estate's
// existing, working subscribe endpoint — tagged with a distinct source and
// listType so they are identifiable, not folded silently into the newsletter.
// No keys live in this repo; the upstream host holds the Resend credential.
const UPSTREAM = 'https://www.frankx.ai/api/subscribe'

interface WaitlistPayload {
  email: unknown
  name?: unknown
  aim?: unknown
  statedPriority?: unknown
  headline?: unknown
}

function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(request: Request) {
  let body: WaitlistPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { email, name, aim, statedPriority, headline } = body

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
  }

  // Only what the application needs to be reviewable is transmitted: email,
  // an optional name, the stated aim/priority, and the computed headline.
  // The full reality.md draft (State, Guardrails, everything else typed in)
  // stays in the browser — it is downloaded or copied by the visitor, never
  // sent by this endpoint.
  const upstream = await fetch(UPSTREAM, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email,
      name: typeof name === 'string' ? name.slice(0, 200) : undefined,
      listType: 'reality-architect-vault-waitlist',
      source: 'realityarchitect.ai/apply',
      metadata: {
        aim: typeof aim === 'string' ? aim.slice(0, 500) : undefined,
        statedPriority: typeof statedPriority === 'string' ? statedPriority.slice(0, 100) : undefined,
        headline: typeof headline === 'string' ? headline.slice(0, 500) : undefined,
      },
    }),
  })

  if (!upstream.ok) {
    return NextResponse.json({ error: 'Signup failed, please try again' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
