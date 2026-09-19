'use client'

import { useState } from 'react'

/**
 * A labelled code block with a copy button. Used on /mcp for connection configs
 * and endpoint URLs — the details a user pastes into their agent client.
 */
export function CopyBlock({ label, code }: { label?: string; code: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border glass">
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-2">
        <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted">{label ?? 'config'}</span>
        <button
          type="button"
          onClick={copy}
          className="rounded-md border border-border px-2.5 py-1 font-mono text-xs font-semibold text-ink hover:border-accent"
          aria-label={`Copy ${label ?? 'code'} to clipboard`}
        >
          {copied ? 'copied ✓' : 'copy'}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3.5 text-sm leading-relaxed text-ink">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  )
}
