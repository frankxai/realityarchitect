import registry from '@/data/products.json'
import { publicState, createRateLimiter, callerKey } from '@/lib/waitlist.mjs'

/**
 * Per-product waitlist. Wire-compatible with `starlight/packages/demand-capture`:
 * the same `DemandSignal` shape, the same KV key layout (`waitlist:<id>:count|positions|signals`),
 * and the same honest-count rule — so the estate-wide `report.mjs` reads this property's
 * signals without a special case.
 *
 * It is reimplemented here rather than imported because this repo is not yet part of the
 * estate pnpm workspace. Replace the body with `handleJoin`/`handleState` from the package
 * the moment it is installable; do not let the two drift.
 *
 * Fails closed: with no KV configured this returns 503 and the UI says so. A form that
 * says "you're in" while storing nothing is worse than no form at all.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Product = (typeof registry.products)[number]

const KV_URL = process.env.KV_REST_API_URL
const KV_TOKEN = process.env.KV_REST_API_TOKEN
const RESEND_KEY = process.env.RESEND_API_KEY
const RESEND_AUDIENCE = process.env.RESEND_AUDIENCE_ID

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URGENCIES = ['now', 'this-quarter', 'exploring']
const BANDS = ['free-only', 'under-25', '25-99', '100-299', '300-999', 'over-1000', 'company-pays']

const key = (id: string, suffix: string) => `waitlist:${id}:${suffix}`
const clip = (v: unknown, n: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, n) : undefined)
const oneOf = (v: unknown, allowed: string[]) => (typeof v === 'string' && allowed.includes(v) ? v : undefined)
const find = (id: unknown): Product | undefined => registry.products.find((p) => p.id === id)

async function kv(command: unknown[]): Promise<unknown> {
  const res = await fetch(KV_URL as string, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`KV ${res.status}`)
  return (await res.json()).result
}

/**
 * One bucket per caller address, module-scoped so it survives between requests in a warm
 * runtime. See `lib/waitlist.mjs` for what this does and does not defend against.
 */
const writeLimit = createRateLimiter({ capacity: 5, windowMs: 60_000 })
const readLimit = createRateLimiter({ capacity: 60, windowMs: 60_000 })

const tooMany = (retryAfter: number) =>
  Response.json(
    { error: 'Too many requests from this address. Try again shortly.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  )

const unconfigured = () =>
  Response.json(
    { error: 'Waitlist storage is not configured on this deployment, so nothing would be saved.' },
    { status: 503 }
  )

export async function POST(req: Request) {
  const gate = writeLimit.take(callerKey(req.headers))
  if (!gate.ok) return tooMany(gate.retryAfter)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid body' }, { status: 400 })
  }

  const product = find(body.productId)
  if (!product || !product.waitlist.enabled) return Response.json({ error: 'Unknown product' }, { status: 404 })

  const email = clip(body.email, 320)?.toLowerCase()
  if (!email || !EMAIL_RE.test(email)) return Response.json({ error: 'Valid email required' }, { status: 400 })
  if (body.consent !== true) return Response.json({ error: 'Consent required' }, { status: 400 })
  if (!KV_URL || !KV_TOKEN) return unconfigured()

  const url = new URL(req.url)
  try {
    // Idempotent on email: a repeat signup re-reads its position and never increments the
    // count. Re-posting is how someone answers the skippable questions later, and it must not
    // cost a seat — nor hand anyone a one-line way to inflate the number the page publishes.
    const existing = await kv(['hget', key(product.id, 'positions'), email])
    let position: number
    if (existing) position = Number(existing)
    else {
      position = Number(await kv(['incr', key(product.id, 'count')]))
      await kv(['hset', key(product.id, 'positions'), email, String(position)])
    }

    const signal = {
      productId: product.id,
      email,
      name: clip(body.name, 100),
      role: clip(body.role, 100),
      pain: clip(body.pain, 400),
      urgency: oneOf(body.urgency, URGENCIES),
      priceBand: oneOf(body.priceBand, BANDS),
      alternative: clip(body.alternative, 200),
      source: clip(body.source, 160) ?? url.pathname,
      referrer: clip(req.headers.get('referer'), 160),
      position,
      createdAt: new Date().toISOString(),
      consent: true as const,
    }
    await kv(['hset', key(product.id, 'signals'), email, JSON.stringify(signal)])

    if (RESEND_KEY && RESEND_AUDIENCE) {
      // Non-fatal: a Resend outage must not cost the signal already stored in KV.
      try {
        await fetch(`https://api.resend.com/audiences/${RESEND_AUDIENCE}/contacts`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            first_name: signal.name?.split(' ')[0],
            unsubscribed: false,
            properties: { waitlist: product.id },
          }),
        })
      } catch {}
    }

    const count = await kv(['get', key(product.id, 'count')])
    return Response.json(publicState(product, count ? Number(count) : position, position))
  } catch {
    return Response.json({ error: 'Could not save your signal. Nothing was stored — try again.' }, { status: 502 })
  }
}

export async function GET(req: Request) {
  const gate = readLimit.take(callerKey(req.headers))
  if (!gate.ok) return tooMany(gate.retryAfter)

  const product = find(new URL(req.url).searchParams.get('productId'))
  if (!product) return Response.json({ error: 'Unknown product' }, { status: 404 })
  if (!KV_URL || !KV_TOKEN) return unconfigured()
  try {
    const count = await kv(['get', key(product.id, 'count')])
    return Response.json(publicState(product, count ? Number(count) : 0))
  } catch {
    return Response.json({ error: 'Waitlist unavailable' }, { status: 502 })
  }
}
