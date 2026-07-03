'use client'

import { useEffect, useRef, useState } from 'react'
import { useEveAgent } from 'eve/react'

/**
 * The Architect — the live diagnostic agent. This is the product demo, the lead
 * magnet, and the proof layer in one: a durable eve session that interviews the
 * visitor and generates their personalized reality.md.
 */

const OPENERS = [
  'Diagnose my system gap',
  'Build my reality.md',
  'What is a Reality Architect?',
]

/** Split assistant text into prose and fenced code blocks so reality.md renders as an artifact. */
function splitBlocks(text: string): Array<{ type: 'text' | 'code'; content: string }> {
  const blocks: Array<{ type: 'text' | 'code'; content: string }> = []
  const re = /```(?:markdown|md)?\n([\s\S]*?)```/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) blocks.push({ type: 'text', content: text.slice(last, m.index) })
    blocks.push({ type: 'code', content: m[1] })
    last = m.index + m[0].length
  }
  if (last < text.length) blocks.push({ type: 'text', content: text.slice(last) })
  return blocks
}

function CodeArtifact({ content }: { content: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  const download = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'reality.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-accent/40 bg-bg">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="font-mono text-xs font-semibold text-accent">reality.md</span>
        <div className="flex gap-2">
          <button onClick={copy} className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted hover:border-accent hover:text-ink">
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={download} className="rounded-md bg-accent px-2.5 py-1 text-xs font-semibold text-bg hover:opacity-90">
            Download
          </button>
        </div>
      </div>
      <pre className="max-h-96 overflow-auto p-4 font-mono text-xs leading-relaxed text-ink/90">{content}</pre>
    </div>
  )
}

export function ArchitectChat() {
  const agent = useEveAgent()
  const isBusy = agent.status === 'submitted' || agent.status === 'streaming'
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasMessages = agent.data.messages.length > 0

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [agent.data.messages])

  const sendMessage = (message: string) => {
    const trimmed = message.trim()
    if (trimmed.length === 0 || isBusy) return
    setInput('')
    void agent.send({ message: trimmed })
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border glass" style={{ height: 'min(72vh, 720px)' }}>
      {/* Session header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`absolute inline-flex h-full w-full rounded-full ${isBusy ? 'animate-ping bg-accent/60' : ''}`} />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
          </span>
          <span className="text-sm font-semibold text-ink">The Architect</span>
          <span className="hidden font-mono text-xs text-muted sm:inline">· diagnostic session</span>
        </div>
        {hasMessages && (
          <button onClick={() => agent.reset()} className="text-xs font-medium text-muted hover:text-ink">
            New session
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5">
        {!hasMessages ? (
          <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
            <div className="blueprint rounded-2xl border border-border p-6">
              <p className="max-w-sm text-sm leading-relaxed text-muted">
                {'Five questions. One diagnosis. Your personalized '}
                <span className="font-mono text-accent">reality.md</span>
                {' — the file your AI agents read before they act. Free, two minutes.'}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {OPENERS.map((o) => (
                <button
                  key={o}
                  onClick={() => sendMessage(o)}
                  className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:border-accent hover:text-ink"
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {agent.data.messages.map((message) => (
              <article key={message.id} className={message.role === 'user' ? 'self-end' : 'self-start'}>
                {message.parts.map((part, i) => {
                  if (part.type !== 'text' || part.text.trim().length === 0) return null
                  if (message.role === 'user') {
                    return (
                      <p key={i} className="max-w-md rounded-2xl rounded-br-sm bg-accent/15 px-4 py-2.5 text-sm leading-relaxed text-ink">
                        {part.text}
                      </p>
                    )
                  }
                  return (
                    <div key={i} className="max-w-2xl">
                      {splitBlocks(part.text).map((b, j) =>
                        b.type === 'code' ? (
                          <CodeArtifact key={j} content={b.content} />
                        ) : (
                          <p key={j} className="whitespace-pre-wrap text-sm leading-relaxed text-ink/90">
                            {b.content.trim()}
                          </p>
                        ),
                      )}
                    </div>
                  )
                })}
              </article>
            ))}
            {agent.status === 'submitted' && (
              <p className="text-sm text-muted" aria-live="polite">The Architect is thinking…</p>
            )}
            {agent.status === 'error' && (
              <p className="text-sm text-red-400" role="alert">
                Session hit an error. {agent.error?.message ?? ''} Try again or start a new session.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        className="flex gap-2 border-t border-border px-4 py-3"
        onSubmit={(e) => {
          e.preventDefault()
          sendMessage(input)
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isBusy}
          aria-label="Message The Architect"
          placeholder={hasMessages ? 'Reply…' : 'Tell The Architect what you do…'}
          className="flex-1 rounded-lg border border-border bg-bg px-4 py-2.5 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-accent disabled:opacity-50"
        />
        {isBusy ? (
          <button type="button" onClick={() => agent.stop()} className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-muted hover:border-accent hover:text-ink">
            Stop
          </button>
        ) : (
          <button type="submit" className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:opacity-90 disabled:opacity-40" disabled={input.trim().length === 0}>
            Send
          </button>
        )}
      </form>
    </div>
  )
}
