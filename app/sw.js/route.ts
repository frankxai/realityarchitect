import { serviceWorkerSource } from '@/lib/service-worker'

export const dynamic = 'force-static'

/** Served at /sw.js so its scope can cover the whole site; the source and its caching rules live in lib/service-worker.ts. */
export function GET() {
  // A static route is rendered once per build, so a missing commit SHA still yields a new version on every deploy.
  return new Response(serviceWorkerSource(process.env.VERCEL_GIT_COMMIT_SHA ?? new Date().toISOString()), {
    headers: { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-cache' },
  })
}
