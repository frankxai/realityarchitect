import { plainText, type Block } from './markdown.ts'
import { SLUG } from './program.ts'

/**
 * The 30-day program as an iCalendar file (RFC 5545), written on the person's device. The page hands the client each
 * day's title, intent and link; this module turns a start date and a time into the file. No server sees the date.
 *
 * - Floating local time: DTSTART carries no Z and no TZID, so 07:00 stays 07:00 in whatever zone the calendar is in,
 *   across daylight-saving changes.
 * - Every line ends in CRLF and is folded at 75 octets of UTF-8, never inside a character.
 * - TEXT values escape backslash, semicolon, comma and newlines.
 * - No alarms.
 *
 * Pure: no I/O, and no clock unless `stamp` is left out (then DTSTAMP is the moment of the call).
 */

export type IcsDay = {
  n: number
  title: string
  intent: string
  /** The day's absolute https link. */
  url: string
  /** This day's length in minutes; when absent, the program-wide `minutes` applies. */
  minutes?: number
}

export type ProgramIcsOptions = {
  /** The first day, as a calendar date: YYYY-MM-DD. */
  start: string
  /** The local time of day for every event, 24-hour: HH:MM. */
  time: string
  /** The default event length in minutes. */
  minutes: number
  days: IcsDay[]
  /** DTSTAMP. Defaults to the moment of the call; pass it for a byte-identical file. */
  stamp?: Date
}

const CRLF = '\r\n'
const MAX_OCTETS = 75
const MIDDLE_DOT = '\u00b7'
const UID_DOMAIN = 'realityarchitect.ai'
const PRODID = '-//Reality Architect//The Imaginal Act 30 Days//EN'

const DATE = /^(\d{4})-(\d{2})-(\d{2})$/
const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/

/** True for a real calendar date written YYYY-MM-DD (2026-02-30 is not one). */
export function isIcsDate(value: string): boolean {
  const match = DATE.exec(value)
  if (!match) return false
  const [year, month, day] = match.slice(1).map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

/** True for a 24-hour time written HH:MM. */
export function isIcsTime(value: string): boolean {
  return TIME.test(value)
}

/** The calendar date `offset` days after `start`. Counted in UTC, which has no daylight-saving gaps or repeats. */
export function addDays(start: string, offset: number): string {
  if (!isIcsDate(start)) throw new RangeError(`Expected a date as YYYY-MM-DD, got "${start}"`)
  const [year, month, day] = start.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + offset)).toISOString().slice(0, 10)
}

/** The file name for a download that starts on `start`. */
export function icsFileName(start: string): string {
  return `${SLUG}-from-${start}.ics`
}

/**
 * A TEXT value (RFC 5545 3.3.11): every line break becomes the two characters `\n`; backslash, semicolon and comma
 * are escaped; other control characters, which TEXT does not allow, are dropped.
 */
export function escapeText(value: string): string {
  return value
    .replace(/\r\n?|[\u2028\u2029]/g, '\n')
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/** UTF-8 length of one code point (a lone surrogate encodes as U+FFFD, three octets). */
function octets(char: string): number {
  const code = char.codePointAt(0) ?? 0
  return code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4
}

/**
 * Folds one content line (RFC 5545 3.1): no physical line is longer than 75 octets, a continuation starts with one
 * space (which counts toward its 75), and a break never falls inside a character's UTF-8 sequence.
 */
export function foldLine(line: string): string {
  const parts: string[] = []
  let current = ''
  let size = 0
  let limit = MAX_OCTETS
  for (const char of line) {
    const width = octets(char)
    if (size + width > limit) {
      parts.push(current)
      current = ''
      size = 0
      limit = MAX_OCTETS - 1
    }
    current += char
    size += width
  }
  parts.push(current)
  return parts.join(`${CRLF} `)
}

/** DTSTAMP form of an instant, in UTC: 20261006T120000Z. */
function utcStamp(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z').replace(/[-:]/g, '')
}

function checkMinutes(value: number, what: string): void {
  if (!Number.isInteger(value) || value < 1 || value > 24 * 60) throw new RangeError(`${what} must be whole minutes from 1 to 1440, got ${value}`)
}

/**
 * One VCALENDAR with one VEVENT per day. Day n falls `n - 1` days after `start`, at `time`, in floating local time.
 * Throws a RangeError on a malformed date, time, length, day number or link, so a bad file is never offered.
 */
export function buildProgramIcs({ start, time, minutes, days, stamp = new Date() }: ProgramIcsOptions): string {
  if (!isIcsDate(start)) throw new RangeError(`start must be a date as YYYY-MM-DD, got "${start}"`)
  const clock = TIME.exec(time)
  if (!clock) throw new RangeError(`time must be HH:MM (24-hour), got "${time}"`)
  checkMinutes(minutes, 'minutes')
  const dtstamp = utcStamp(stamp)
  const at = `T${clock[1]}${clock[2]}00`

  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:${PRODID}`, 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH']
  const seen = new Set<number>()
  for (const day of days) {
    if (!Number.isInteger(day.n) || day.n < 1) throw new RangeError(`A day number must be a whole number from 1, got ${day.n}`)
    if (seen.has(day.n)) throw new RangeError(`Day ${day.n} appears twice`)
    seen.add(day.n)
    const length = day.minutes ?? minutes
    checkMinutes(length, `Day ${day.n}'s minutes`)
    // A URI value is not escaped, so it must not be able to carry a line break or a space into the file.
    if (!/^https:\/\/[^\s"<>\\]+$/.test(day.url)) throw new RangeError(`Day ${day.n}'s link must be an absolute https URL`)
    const description = [day.intent.trim(), day.url].filter(Boolean).join('\n\n')
    lines.push(
      'BEGIN:VEVENT',
      `UID:${SLUG}-day-${day.n}-${start}@${UID_DOMAIN}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${addDays(start, day.n - 1).replace(/-/g, '')}${at}`,
      `DURATION:PT${length}M`,
      `SUMMARY:${escapeText(`Day ${day.n} ${MIDDLE_DOT} ${day.title.trim()}`)}`,
      `DESCRIPTION:${escapeText(description)}`,
      `URL:${day.url}`,
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.map(foldLine).join(CRLF) + CRLF
}

/** The shape of a program day this module reads (lib/programs/imaginal-30.ts `Day` satisfies it). */
export type CalendarSourceDay = {
  day: number
  title: string
  minutes: number
  sections: { title: string; blocks: Block[] }[]
}

/** The paragraphs of a day's intent section, as plain text. */
export function intentOf(day: CalendarSourceDay): string {
  const section = day.sections.find((item) => /intent/i.test(item.title))
  return (section?.blocks ?? [])
    .flatMap((block) => (block.kind === 'paragraph' ? [plainText(block.text)] : []))
    .join('\n\n')
}

/**
 * The days as the calendar file needs them, and nothing more: plain-text title and intent, length, and the absolute
 * link under `base` (the site's origin). Runs on the server; the client component receives only this.
 */
export function calendarDays(days: CalendarSourceDay[], base: string): IcsDay[] {
  const origin = base.replace(/\/+$/, '')
  return days.map((day) => ({
    n: day.day,
    title: plainText(day.title),
    intent: intentOf(day),
    url: `${origin}/programs/${SLUG}/${day.day}`,
    minutes: day.minutes,
  }))
}
