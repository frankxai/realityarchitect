import { createHash } from 'node:crypto'
import { generateText, Output } from 'ai'
import { authenticate } from '@/lib/platform'
import { evidenceReview, reviewInstructions, reviewRequest } from '@/lib/review-contract'
export const runtime = 'nodejs'
export const maxDuration = 60
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
export async function POST(request: Request) {
  const auth = await authenticate(request)
  if (!auth) return reply({ error: 'Sign in with a verified account.' },401)
  if (process.env.RA_AI_ENABLED === 'false') return reply({ error: 'AI review is paused.' },503)
  let body
  try { const raw = await request.text(); if (raw.length > 2048) return reply({ error: 'Request too large.' },413); body = reviewRequest.safeParse(JSON.parse(raw)) } catch { return reply({ error: 'Invalid request.' },400) }
  if (!body.success) return reply({ error: 'Select a saved record, listed model and explicit consent.' },400)
  const { data: record, error } = await auth.db.from('ra_records').select('id,payload').eq('id',body.data.recordId).single()
  if (error || !record) return reply({ error: 'Record not found in your workspace.' },404)
  const { data: runId, error: quotaError } = await auth.db.rpc('ra_reserve_run',{ p_kind:'review', p_record_id:record.id, p_model:body.data.model })
  if (quotaError) return reply({ error:'Daily usage limit reached or a run is already in progress. Failed attempts count.' },429)
  try {
    const result = await generateText({ model:body.data.model, system:reviewInstructions, prompt:JSON.stringify(record.payload), output:Output.object({ schema:evidenceReview }), reasoning:'low', maxOutputTokens:2200, maxRetries:0, abortSignal:AbortSignal.timeout(45000), providerOptions:{ gateway:{ user:createHash('sha256').update(auth.user.id).digest('hex'), tags:['realityarchitect','evidence-review'] } } })
    const output = result.output
    const { error: savedError } = await auth.db.rpc('ra_finish_run',{ p_id:runId,p_status:'succeeded',p_result:output,p_usage:{ inputTokens:result.totalUsage.inputTokens,outputTokens:result.totalUsage.outputTokens,modelId:result.response.modelId } })
    if (savedError) return reply({ error:'Review completed but its receipt was not saved. Refresh history before retrying.',runId },503)
    return reply({ output,runId,review:'unreviewed' })
  } catch {
    await auth.db.rpc('ra_finish_run',{ p_id:runId,p_status:'failed',p_result:{ error:'Review did not complete. No claim was verified.' },p_usage:{} })
    return reply({ error:'Model unavailable or review incomplete. Check run history before retrying.',runId },503)
  }
}
