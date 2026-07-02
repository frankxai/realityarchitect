import { NextResponse } from 'next/server'

// Signups route through the FrankX Resend audience until Reality Architect
// has its own ESP. Server-to-server, so no CORS and no keys in this repo.
const UPSTREAM = 'https://www.frankx.ai/api/subscribe'

export async function POST(request: Request) {
  let email: unknown
  try {
    ;({ email } = await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
  }

  const upstream = await fetch(UPSTREAM, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, listType: 'reality-architect', source: 'realityarchitect.ai' }),
  })

  if (!upstream.ok) {
    return NextResponse.json({ error: 'Signup failed, please try again' }, { status: 502 })
  }
  return NextResponse.json({ ok: true })
}
