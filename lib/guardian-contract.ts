export function guardianPath(parts: string[], method: string) {
  if (parts.length === 1 && parts[0] === 'session' && method === 'POST') return 'create'
  if (parts[0] !== 'session' || !/^[A-Za-z0-9_-]{8,160}$/.test(parts[1] || '')) return null
  if (parts.length === 2 && method === 'POST') return 'message'
  if (parts.length === 3 && parts[2] === 'stream' && method === 'GET') return 'stream'
  if (parts.length === 3 && parts[2] === 'cancel' && method === 'POST') return 'cancel'
  return null
}
export function guardianMessage(value: unknown): string | null { return typeof value === 'string' && value.trim() && value.length <= 6000 ? value.trim() : null }
