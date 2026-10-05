/**
 * The small Markdown subset the programs are written in (programs/<slug>/), parsed into plain data so pages render it
 * as React elements: no HTML strings, no dependency. Front matter is flat YAML (scalars and string lists); the body
 * has headings, paragraphs, ordered and unordered lists, and block quotes, with **strong**, *em*, `code` and links.
 */

export type FrontValue = string | number | boolean | string[]
export type FrontMatter = Record<string, FrontValue>

export type Inline =
  | { kind: 'text'; text: string }
  | { kind: 'strong'; children: Inline[] }
  | { kind: 'em'; children: Inline[] }
  | { kind: 'code'; text: string }
  | { kind: 'link'; href: string; children: Inline[] }

export type Block =
  | { kind: 'heading'; level: 1 | 2 | 3; text: string; id: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'quote'; text: string }
  | { kind: 'fence'; lang: string; text: string }

export type Doc = { front: FrontMatter; blocks: Block[] }

function scalar(raw: string): string | number | boolean {
  const value = raw.trim()
  const quoted = /^"((?:[^"\\]|\\.)*)"$/.exec(value) ?? /^'((?:[^']|'')*)'$/.exec(value)
  if (quoted) return value.startsWith('"') ? quoted[1].replace(/\\(.)/g, '$1') : quoted[1].replace(/''/g, "'")
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value)
  if (value === 'true' || value === 'false') return value === 'true'
  return value
}

/** Flat YAML: `key: value`, `key: [a, b]`, or `key:` followed by `  - item` lines. Anything else is ignored. */
export function parseFrontMatter(text: string): FrontMatter {
  const front: FrontMatter = {}
  let listKey = ''
  for (const line of text.split(/\r?\n/)) {
    const item = /^\s+-\s+(.*)$/.exec(line)
    if (item && listKey) {
      ;(front[listKey] as string[]).push(String(scalar(item[1])))
      continue
    }
    const pair = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line)
    if (!pair) continue
    const [, key, rest] = pair
    listKey = ''
    if (rest === '') {
      front[key] = []
      listKey = key
    } else if (/^\[.*\]$/.test(rest.trim())) {
      const inner = rest.trim().slice(1, -1).trim()
      front[key] = inner ? inner.split(',').map((part) => String(scalar(part))) : []
    } else {
      front[key] = scalar(rest)
    }
  }
  return front
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[*_`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Line ends: CRLF, LF, a lone CR, and the Unicode line and paragraph separators (built from char codes so the source
// stays ASCII).
const LINE_BREAK = new RegExp(`\\r\\n|[\\n\\r${String.fromCharCode(0x2028, 0x2029)}]`)

const LIST_ITEM = /^(\s*)(?:(\d+)[.)]|[-*+])\s+(.*)$/

/** Splits a document into front matter and blocks. Blank lines end paragraphs; indented lines continue list items. */
export function parseMarkdown(source: string): Doc {
  const text = source.charCodeAt(0) === 0xfeff ? source.slice(1) : source
  const fm = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text)
  const front = fm ? parseFrontMatter(fm[1]) : {}
  // A lone \r, U+2028 and U+2029 end lines too, so every line the loop sees is one the heading test can match.
  const lines = (fm ? text.slice(fm[0].length) : text).split(LINE_BREAK)
  const blocks: Block[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) {
      i++
      continue
    }
    // A fenced block keeps its lines verbatim (a file format, a template), so nothing inside it is parsed.
    // As in CommonMark: the fence closes on a run of the same character at least as long as the opening one, so a
    // four-backtick fence can hold a three-backtick example.
    const fence = /^(`{3,}|~{3,})([\w-]*)\s*$/.exec(line)
    if (fence) {
      const marker = fence[1]
      const closes = (candidate: string) => {
        const run = /^(`{3,}|~{3,})\s*$/.exec(candidate)
        return Boolean(run && run[1][0] === marker[0] && run[1].length >= marker.length)
      }
      const body: string[] = []
      i++
      while (i < lines.length && !closes(lines[i])) body.push(lines[i++])
      i++
      blocks.push({ kind: 'fence', lang: fence[2], text: body.join('\n') })
      continue
    }
    const heading = /^(#{1,3})\s+(.*?)\s*#*\s*$/.exec(line)
    if (heading) {
      const level = heading[1].length as 1 | 2 | 3
      blocks.push({ kind: 'heading', level, text: heading[2], id: slugify(heading[2]) })
      i++
      continue
    }
    if (/^>\s?/.test(line)) {
      const parts: string[] = []
      while (i < lines.length && /^>\s?/.test(lines[i])) parts.push(lines[i++].replace(/^>\s?/, ''))
      blocks.push({ kind: 'quote', text: parts.join(' ').trim() })
      continue
    }
    const first = LIST_ITEM.exec(line)
    if (first) {
      const ordered = first[2] !== undefined
      const items: string[] = []
      while (i < lines.length) {
        const current = lines[i]
        const match = LIST_ITEM.exec(current)
        if (match && (match[2] !== undefined) === ordered && match[1].length <= first[1].length) {
          items.push(match[3].trim())
          i++
        } else if (current.trim() && /^\s+/.test(current) && items.length) {
          items[items.length - 1] += ` ${current.trim()}`
          i++
        } else break
      }
      blocks.push({ kind: 'list', ordered, items })
      continue
    }
    if (/^(?:-{3,}|\*{3,})\s*$/.test(line)) {
      i++
      continue
    }
    // The first line is always consumed, so a line no other branch takes can never stall the loop.
    const parts: string[] = [lines[i++].trim()]
    while (i < lines.length && lines[i].trim() && !/^(#{1,3})\s/.test(lines[i]) && !/^>\s?/.test(lines[i]) && !/^(?:`{3,}|~{3,})/.test(lines[i]) && !LIST_ITEM.test(lines[i])) parts.push(lines[i++].trim())
    blocks.push({ kind: 'paragraph', text: parts.join(' ') })
  }
  return { front, blocks }
}

/** Only site-relative, in-page and https links become links; anything else stays text. */
export function safeHref(href: string): string | null {
  const value = href.trim()
  if (/^https:\/\//i.test(value) || /^\/(?![/\\])/.test(value) || /^#[\w-]+$/.test(value)) return value
  return null
}

export function parseInline(text: string): Inline[] {
  const out: Inline[] = []
  let buffer = ''
  const flush = () => {
    if (buffer) out.push({ kind: 'text', text: buffer })
    buffer = ''
  }
  let i = 0
  while (i < text.length) {
    const rest = text.slice(i)
    const code = /^`([^`]+)`/.exec(rest)
    const strong = /^\*\*(.+?)\*\*/.exec(rest)
    const em = /^\*(?!\s)([^*]+?)\*/.exec(rest) ?? /^_(?!\s)([^_]+?)_(?![A-Za-z0-9])/.exec(rest)
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)/.exec(rest)
    if (code) {
      flush()
      out.push({ kind: 'code', text: code[1] })
      i += code[0].length
    } else if (strong) {
      flush()
      out.push({ kind: 'strong', children: parseInline(strong[1]) })
      i += strong[0].length
    } else if (em && (i === 0 || !/[A-Za-z0-9]/.test(text[i - 1]))) {
      flush()
      out.push({ kind: 'em', children: parseInline(em[1]) })
      i += em[0].length
    } else if (link) {
      flush()
      const href = safeHref(link[2])
      if (href) out.push({ kind: 'link', href, children: parseInline(link[1]) })
      else out.push(...parseInline(link[1]))
      i += link[0].length
    } else {
      buffer += text[i]
      i++
    }
  }
  flush()
  return out
}

/** Plain text of an inline string, for titles, descriptions and word counts. */
export function plainText(text: string): string {
  const walk = (nodes: Inline[]): string => nodes.map((node) => ('children' in node ? walk(node.children) : node.text)).join('')
  return walk(parseInline(text))
}

/** The blocks under each `##` heading, keyed by the heading's slug, in order. */
export function sections(blocks: Block[]): { id: string; title: string; blocks: Block[] }[] {
  const out: { id: string; title: string; blocks: Block[] }[] = []
  for (const block of blocks) {
    if (block.kind === 'heading' && block.level === 2) out.push({ id: block.id, title: block.text, blocks: [] })
    else if (out.length && !(block.kind === 'heading' && block.level === 1)) out[out.length - 1].blocks.push(block)
  }
  return out
}

/** Words of prose: a fenced block is a format to copy, not reading, so it does not count. */
export function wordCount(blocks: Block[]): number {
  let total = 0
  for (const block of blocks) {
    if (block.kind === 'fence') continue
    const texts = block.kind === 'list' ? block.items : [block.text]
    for (const text of texts) total += plainText(text).split(/\s+/).filter(Boolean).length
  }
  return total
}
