import Link from 'next/link'
import { Fragment, type ReactNode } from 'react'
import { parseInline, type Block, type Inline } from '@/lib/programs/markdown'

const LINK = 'text-accent underline underline-offset-4 decoration-accent/40 hover:decoration-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg'

function inline(nodes: Inline[]): ReactNode {
  return nodes.map((node, index) => {
    switch (node.kind) {
      case 'text':
        return <Fragment key={index}>{node.text}</Fragment>
      case 'strong':
        return <strong key={index} className="font-semibold text-ink">{inline(node.children)}</strong>
      case 'em':
        return <em key={index}>{inline(node.children)}</em>
      case 'code':
        return <code key={index} className="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[0.85em] text-ink">{node.text}</code>
      case 'link':
        return node.href.startsWith('https://') ? (
          <a key={index} href={node.href} className={LINK} rel="noopener noreferrer">{inline(node.children)}</a>
        ) : (
          <Link key={index} href={node.href} className={LINK}>{inline(node.children)}</Link>
        )
    }
  })
}

export function Text({ text }: { text: string }) {
  return <>{inline(parseInline(text))}</>
}

/** Which register a paragraph speaks in, when it opens with a bold "Meaning." or "Mechanism." label. */
export function registerOf(text: string): 'meaning' | 'mechanism' | null {
  const match = /^\*\*(Meaning|Mechanism)\.?\*\*/.exec(text.trim())
  return match ? (match[1].toLowerCase() as 'meaning' | 'mechanism') : null
}

function Paragraph({ text }: { text: string }) {
  const register = registerOf(text)
  if (register === 'meaning') {
    const body = text.trim().replace(/^\*\*Meaning\.?\*\*\s*/, '')
    return (
      <div className="rounded-2xl border border-border border-l-2 border-l-dawn/60 bg-surface/70 p-5">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-dawn">Meaning</p>
        <p className="mt-2 font-serif text-lg leading-relaxed text-dawn-2"><Text text={body} /></p>
      </div>
    )
  }
  if (register === 'mechanism') {
    const body = text.trim().replace(/^\*\*Mechanism\.?\*\*\s*/, '')
    return (
      <div className="rounded-2xl border border-border border-l-2 border-l-accent/70 bg-surface/70 p-5">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">Mechanism</p>
        <p className="mt-2 leading-relaxed text-ink"><Text text={body} /></p>
      </div>
    )
  }
  return <p className="leading-relaxed text-ink/90"><Text text={text} /></p>
}

export function Prose({ blocks, headingOffset = 0 }: { blocks: Block[]; headingOffset?: number }) {
  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        switch (block.kind) {
          case 'heading': {
            const level = Math.min(block.level + headingOffset, 4)
            const Tag = `h${level}` as 'h2' | 'h3' | 'h4'
            return (
              <Tag key={index} id={block.id} className="scroll-mt-28 pt-4 text-xl font-semibold text-ink">
                <Text text={block.text} />
              </Tag>
            )
          }
          case 'paragraph':
            return <Paragraph key={index} text={block.text} />
          case 'quote':
            return (
              <blockquote key={index} className="border-l-2 border-dawn/50 pl-4 font-serif text-lg italic leading-relaxed text-dawn-2">
                <Text text={block.text} />
              </blockquote>
            )
          case 'fence':
            // A file format to copy as it is: kept verbatim, scrollable on a phone instead of wrapping mid-token.
            return (
              <figure key={index} className="rounded-xl border border-border bg-bg">
                {block.lang && <figcaption className="border-b border-border px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-muted">{block.lang}</figcaption>}
                <pre tabIndex={0} role="region" aria-label={`${block.lang || 'Text'} format, scrolls sideways on small screens`} className="overflow-x-auto px-4 py-3 font-mono text-[0.8rem] leading-relaxed text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"><code>{block.text}</code></pre>
              </figure>
            )
          case 'list': {
            const Tag = block.ordered ? 'ol' : 'ul'
            return (
              <Tag key={index} className={`space-y-2 pl-6 leading-relaxed text-ink/90 ${block.ordered ? 'list-decimal marker:font-mono marker:text-accent' : 'list-disc marker:text-muted'}`}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="pl-1"><Text text={item} /></li>
                ))}
              </Tag>
            )
          }
        }
      })}
    </div>
  )
}
