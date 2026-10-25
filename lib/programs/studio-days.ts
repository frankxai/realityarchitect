import { plainText } from './markdown.ts'
import type { Day } from './imaginal-30.ts'
import type { ProgramDay } from '../studio/program.ts'

/**
 * The days as the Studio needs them: number, title, minutes and the intent as plain text. Pure: the server page
 * (app/studio/page.tsx) reads the Markdown with readDays() and passes this list down, so the Studio's client bundle
 * never imports the file system loader.
 */
export function studioDays(days: Day[]): ProgramDay[] {
  return days.map((day) => ({ day: day.day, title: day.title, minutes: day.minutes, intent: dayIntent(day) }))
}

/** The paragraphs under the day's intent heading, as one line of plain text. */
export function dayIntent(day: Day): string {
  const intent = day.sections.find((section) => /intent/i.test(section.title))
  return (intent?.blocks ?? [])
    .flatMap((block) => (block.kind === 'paragraph' ? [plainText(block.text).trim()] : []))
    .filter(Boolean)
    .join(' ')
}
