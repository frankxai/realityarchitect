import { getVercelOidcToken } from '@vercel/functions/oidc'
import { authenticate } from '@/lib/platform'
import { guardianMessage, guardianPath } from '@/lib/guardian-contract'
export const runtime = 'nodejs'
export const maxDuration = 60
const reply = (error: string, status: number) => Response.json({ ok: false, error }, { status, headers: { 'Cache-Control': 'no-store' } })
async function handle(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const auth = await authenticate(request)
  if (!auth) return reply('Sign in with a verified account.', 401)
  const { path } = await context.params
  const action = guardianPath(path, request.method)
  if (!action) return reply('Unsupported guardian action.', 404)
  if (process.env.RA_AI_ENABLED === 'false' && action !== 'stream' && action !== 'cancel') return reply('Guardian is paused.', 503)
  if (action !== 'create') {
    const { data, error } = await auth.db.from('ra_guardian_sessions').select('id').eq('id', path[1]).single()
    if (error || !data) return reply('Session not found in your workspace.', 404)
  }
  let body: { message: string; operationId?: string } | undefined
  let runId: string | null = null
  if (action === 'create' || action === 'message') {
    try {
      const raw = await request.text()
      if (raw.length > 8000) return reply('Message too large.', 413)
      const message = guardianMessage(JSON.parse(raw).message)
      if (!message || request.headers.get('x-ra-ai-consent') !== 'true') return reply('Write a message and consent to AI processing.', 400)
      body = { message, ...(action === 'create' ? { operationId: crypto.randomUUID() } : {}) }
    } catch { return reply('Send a text message.', 400) }
    const { data, error } = await auth.db.rpc('ra_reserve_run', { p_kind: 'guardian', p_record_id: null, p_model: 'openai/gpt-6-luna' })
    if (error) return reply('Daily limit reached or a run is in progress. Failed attempts count.', 429)
    runId = data
  }
  try {
    const oidc = await getVercelOidcToken()
    if (!oidc || !process.env.VERCEL_URL) throw new Error('Missing deployment identity')
    const url = new URL(`https://${process.env.VERCEL_URL}/eve/v1/${path.join('/')}`)
    const cursor = new URL(request.url).searchParams.get('startIndex')
    if (action === 'stream' && cursor && /^\d{1,8}$/.test(cursor)) url.searchParams.set('startIndex', cursor)
    const response = await fetch(url, { method: request.method, headers: { Authorization: `Bearer ${oidc}`, 'x-vercel-trusted-oidc-idp-token': oidc, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, cache: 'no-store', signal: request.signal })
    if (action === 'stream') return new Response(response.body, { status: response.status, headers: { 'Content-Type': response.headers.get('content-type') || 'application/x-ndjson', 'Cache-Control': 'no-store' } })
    const result = await response.json()
    if (action === 'create' && response.ok && typeof result.sessionId === 'string') {
      const { error } = await auth.db.from('ra_guardian_sessions').insert({ id: result.sessionId })
      if (error) throw new Error('Ownership not saved')
    }
    if (runId) await auth.db.rpc('ra_finish_run', { p_id: runId, p_status: response.ok ? 'succeeded' : 'failed', p_result: { accepted: response.ok, sessionId: result.sessionId || path[1], boundary: 'Transport acceptance only. Stream reports model completion.' }, p_usage: {} })
    return Response.json(result, { status: response.status, headers: { 'Cache-Control': 'no-store' } })
  } catch {
    if (runId) await auth.db.rpc('ra_finish_run', { p_id: runId, p_status: 'failed', p_result: { error: 'Guardian transport unavailable.' }, p_usage: {} })
    return reply('Guardian unavailable. Your evidence remains saved.', 503)
  }
}
export const GET = handle
export const POST = handle
