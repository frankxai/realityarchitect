import registry from '@/data/products.json'
import {
  publicState,
  createRateLimiter,
  callerKey,
  kvCredentials,
  joinWaitlist,
  updateWaitlist,
  waitlistKeys,
  takeDurable,
  readJsonObject,
  normaliseEmail,
  tokenShapeOk,
} from '@/lib/waitlist.mjs'

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

const KV = kvCredentials(process.env)
const RESEND_KEY = process.env.RESEND_API_KEY
const RESEND_AUDIENCE = process.env.RESEND_AUDIENCE_ID

const URGENCIES = ['now', 'this-quarter', 'exploring']
const BANDS = ['free-only', 'under-25', '25-99', '100-299', '300-999', 'over-1000', 'company-pays']

const clip = (v: unknown, n: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, n) : undefined)
const oneOf = (v: unknown, allowed: string[]) => (typeof v === 'string' && allowed.includes(v) ? v : undefined)
const find = (id: unknown): Product | undefined => registry.products.find((p) => p.id === id)

async function kv(command: unknown[]): Promise<unknown> {
  if (!KV) throw new Error('KV not configured')
  const res = await fetch(KV.url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`KV ${res.status}`)
  return (await res.json()).result
}

/**
 * Two limits per caller address. The in-memory bucket is checked first, so a flood from one
 * address never reaches the store; the durable window in KV is the one that holds across
 * instances and restarts. If the store cannot answer, the in-memory verdict stands.
 */
const LIMITS = {
  write: { capacity: 5, windowMs: 60_000 },
  read: { capacity: 60, windowMs: 60_000 },
} as const
const writeLimit = createRateLimiter(LIMITS.write)
const readLimit = createRateLimiter(LIMITS.read)

async function gate(local: ReturnType<typeof createRateLimiter>, scope: keyof typeof LIMITS, req: Request) {
  const caller = callerKey(req.headers)
  const first = local.take(caller)
  if (!first.ok || !KV) return first
  try {
    return await takeDurable(kv, { scope, caller, ...LIMITS[scope] })
  } catch {
    return first
  }
}

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
  const allowed = await gate(writeLimit, 'write', req)
  if (!allowed.ok) return tooMany(allowed.retryAfter)

  const read = await readJsonObject(req)
  if (!('body' in read)) return Response.json({ error: read.error }, { status: read.status })
  const body = read.body

  const product = find(body.productId)
  if (!product || !product.waitlist.enabled) return Response.json({ error: 'Unknown product' }, { status: 404 })

  const email = normaliseEmail(body.email)
  if (!email) return Response.json({ error: 'Valid email required' }, { status: 400 })
  if (body.token !== undefined && !tokenShapeOk(body.token))
    return Response.json({ error: 'Invalid update token' }, { status: 400 })
  if (body.consent !== true) return Response.json({ error: 'Consent required' }, { status: 400 })
  if (!KV) return unconfigured()

  const answers = {
    name: clip(body.name, 100),
    role: clip(body.role, 100),
    pain: clip(body.pain, 400),
    urgency: oneOf(body.urgency, URGENCIES),
    priceBand: oneOf(body.priceBand, BANDS),
    alternative: clip(body.alternative, 200),
  }

  // A request carrying a token is an update to answers already given; only the browser that
  // received the token at signup holds it. Without one, the request is a join, which never
  // touches an existing signal.
  if (body.token !== undefined) {
    let result
    try {
      result = await updateWaitlist(kv, { productId: product.id, email, token: body.token, answers })
    } catch {
      return Response.json({ error: 'Could not save your answers. Your place on the list is unchanged.' }, { status: 502 })
    }
    if (result.status === 'refused')
      return Response.json({ error: 'These answers can only be changed from the browser that joined.' }, { status: 403 })
    return Response.json(publicState(product, result.count, result.position))
  }

  const url = new URL(req.url)
  let joined
  try {
    joined = await joinWaitlist(kv, {
      productId: product.id,
      email,
      signal: {
        productId: product.id,
        email,
        ...answers,
        source: clip(body.source, 160) ?? url.pathname,
        referrer: clip(req.headers.get('referer'), 160),
        createdAt: new Date().toISOString(),
        consent: true as const,
      },
    })
  } catch {
    // The join is one atomic script: if it ran, repeating it returns the same place; if it did
    // not, nothing was written. Either way retrying is safe, which is the only claim made here.
    return Response.json(
      { error: 'Could not confirm your signup. Trying again is safe: it never takes a second place.' },
      { status: 502 }
    )
  }

  // An address already on the list gets the public view only: no position, no token, no answers.
  if (joined.status === 'exists') return Response.json(publicState(product, joined.count))

  if (RESEND_KEY && RESEND_AUDIENCE) {
    // Non-fatal: a Resend outage must not cost the signal already stored in KV.
    try {
      await fetch(`https://api.resend.com/audiences/${RESEND_AUDIENCE}/contacts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          first_name: answers.name?.split(' ')[0],
          unsubscribed: false,
          properties: { waitlist: product.id },
        }),
      })
    } catch {}
  }

  return Response.json({ ...publicState(product, joined.count, joined.position), token: joined.token })
}

export async function GET(req: Request) {
  const allowed = await gate(readLimit, 'read', req)
  if (!allowed.ok) return tooMany(allowed.retryAfter)

  const product = find(new URL(req.url).searchParams.get('productId'))
  if (!product) return Response.json({ error: 'Unknown product' }, { status: 404 })
  if (!KV) return unconfigured()
  try {
    const count = await kv(['get', waitlistKeys(product.id)[1]])
    return Response.json(publicState(product, count ? Number(count) : 0))
  } catch {
    return Response.json({ error: 'Waitlist unavailable' }, { status: 502 })
  }
}
