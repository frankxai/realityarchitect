import fs from 'node:fs'
import path from 'node:path'
import { parseMarkdown, plainText, sections, type Block } from './markdown.ts'
import { DAYS, LOOPS, SLUG, WEEKS, weekOf } from './program.ts'

/**
 * The free 30-day program, read from programs/imaginal-30/ at build time. The Markdown files are the source of truth:
 * people copy them into Obsidian, agents read them, and the site renders them (tests/programs.test.mjs holds the
 * contract).
 */

export { DAYS, LOOPS, SLUG, WEEKS, weekOf }
export const PROGRAM_DIR = path.join(process.cwd(), 'programs', SLUG)

export type Section = { id: string; title: string; blocks: Block[] }

export type Day = {
  day: number
  week: number
  title: string
  loop: (typeof LOOPS)[number]
  library: string[]
  minutes: number
  intro: Block[]
  sections: Section[]
}

export function dayFile(day: number, dir = PROGRAM_DIR): string {
  return path.join(dir, 'days', `day-${String(day).padStart(2, '0')}.md`)
}

export function readDay(day: number, dir = PROGRAM_DIR): Day {
  const { front, blocks } = parseMarkdown(fs.readFileSync(dayFile(day, dir), 'utf8'))
  const firstSection = blocks.findIndex((block) => block.kind === 'heading' && block.level === 2)
  const intro = (firstSection === -1 ? blocks : blocks.slice(0, firstSection)).filter((block) => block.kind !== 'heading')
  return {
    day: Number(front.day),
    week: Number(front.week),
    title: String(front.title ?? ''),
    loop: String(front.loop ?? '') as Day['loop'],
    library: Array.isArray(front.library) ? front.library : front.library ? [String(front.library)] : [],
    minutes: Number(front.minutes),
    intro,
    sections: sections(blocks),
  }
}

export function readDays(dir = PROGRAM_DIR): Day[] {
  return Array.from({ length: DAYS }, (_, index) => readDay(index + 1, dir))
}

/** The README as blocks, without its title (pages set their own). */
export function readOverview(dir = PROGRAM_DIR): { title: string; blocks: Block[] } {
  const { blocks } = parseMarkdown(fs.readFileSync(path.join(dir, 'README.md'), 'utf8'))
  const title = blocks.find((block) => block.kind === 'heading' && block.level === 1)
  return { title: title && title.kind === 'heading' ? plainText(title.text) : '', blocks: blocks.filter((block) => block !== title) }
}

/** The first sentence of the day's intent, for metadata and the index. */
export function summary(day: Day): string {
  const intent = day.sections.find((section) => /intent/i.test(section.title))
  const first = intent?.blocks.find((block) => block.kind === 'paragraph')
  const text = first && first.kind === 'paragraph' ? plainText(first.text) : ''
  const sentence = /^(.+?[.!?])(\s|$)/.exec(text)
  return (sentence ? sentence[1] : text).slice(0, 200)
}
