import { DAYS, SLUG } from '../programs/program.ts'
import { addDays, daysBetween, isDay } from './util.ts'
import type { ProgramProgress, Snapshot } from './types.ts'

/**
 * The free 30-day program inside the Studio. Pure and client-safe: the day titles, minutes and intents arrive as
 * `ProgramDay` data from the server page (app/studio/page.tsx reads the Markdown), so nothing here touches the file
 * system. Progress is a start date and the local days marked done, kept on this device with the rest of the Studio.
 */

export const PROGRAM_ID = SLUG
export const PROGRAM_NAME = 'The Imaginal Act'

/** The middle dot, built from its char code so this source stays ASCII. */
const SEP = ` ${String.fromCharCode(0xb7)} `

/** What the server page hands the Studio for each day: plain text and numbers, no Markdown. */
export type ProgramDay = { day: number; title: string; minutes: number; intent: string }

export type ProgramState = 'not-started' | 'day' | 'complete'

export interface ProgramStatus {
  state: ProgramState
  /** The program day to show, clamped to 1..30: day 1 before the start, day 30 once complete. */
  day: number
  /** The local date of `day`, or empty when there is no program. */
  date: string
  /** The start date, or empty when there is no program. */
  start: string
  doneCount: number
  /** Past program days that are not marked, oldest first. Counted honestly, never carried as a debt. */
  notMarked: number[]
  doneToday: boolean
}

export interface ProgramCell {
  day: number
  date: string
  done: boolean
  today: boolean
  future: boolean
}

/** The local date of program day `day` for a given start. */
export const dayDate = (start: string, day: number): string => addDays(start, day - 1)

/** The program day a date falls on, or null outside the thirty days. */
export function dayOf(start: string, date: string): number | null {
  if (!isDay(start) || !isDay(date)) return null
  const index = daysBetween(start, date) + 1
  return index >= 1 && index <= DAYS ? index : null
}

/** "Start the 30 days": today becomes day 1. */
export function startProgram(today: string): ProgramProgress {
  return { id: PROGRAM_ID, start: today, done: [] }
}

/** Keeps a well-formed program and drops anything else. Done days outside the thirty, duplicates and junk go. */
export function normalizeProgram(input: unknown): ProgramProgress | undefined {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) return undefined
  const value = input as Record<string, unknown>
  if (value.id !== PROGRAM_ID || !isDay(value.start)) return undefined
  const start = value.start
  const done = Array.isArray(value.done)
    ? [...new Set(value.done.filter((day): day is string => isDay(day) && dayOf(start, day) !== null))].sort()
    : []
  return { id: PROGRAM_ID, start, done }
}

/** Marks or unmarks one program day. Returns a new object; a day outside the thirty changes nothing. */
export function toggleDay(program: ProgramProgress, day: number): ProgramProgress {
  if (!Number.isInteger(day) || day < 1 || day > DAYS) return { ...program, done: [...program.done] }
  const date = dayDate(program.start, day)
  const done = program.done.includes(date) ? program.done.filter((entry) => entry !== date) : [...program.done, date]
  return { ...program, done: done.sort() }
}

/** Where the person is: the day index is daysBetween(start, today) + 1, clamped to 1..30. */
export function programStatus(program: ProgramProgress | undefined, today: string): ProgramStatus {
  if (!program) return { state: 'not-started', day: 1, date: '', start: '', doneCount: 0, notMarked: [], doneToday: false }
  const raw = daysBetween(program.start, today) + 1
  const state: ProgramState = raw < 1 ? 'not-started' : raw > DAYS ? 'complete' : 'day'
  const day = Math.min(DAYS, Math.max(1, raw))
  const done = new Set(program.done)
  // Days already behind the person: before today while the program runs, all thirty once it is complete.
  const past = state === 'not-started' ? 0 : state === 'complete' ? DAYS : day - 1
  const notMarked: number[] = []
  for (let index = 1; index <= past; index += 1) if (!done.has(dayDate(program.start, index))) notMarked.push(index)
  return {
    state,
    day,
    date: dayDate(program.start, day),
    start: program.start,
    doneCount: program.done.filter((date) => dayOf(program.start, date) !== null).length,
    notMarked,
    doneToday: state === 'day' && done.has(today),
  }
}

/** The three states, as the Studio names them. */
export function statusLabel(status: ProgramStatus): string {
  return status.state === 'not-started' ? 'Not started' : status.state === 'complete' ? 'Complete' : `Day ${status.day}`
}

/** "Day N of 30 . <title> . <minutes> min"; just "Day N of 30" when the day data is missing. */
export function dayLine(day: Pick<ProgramDay, 'day'> & Partial<ProgramDay>): string {
  return [`Day ${day.day} of ${DAYS}`, day.title?.trim() ?? '', day.minutes ? `${day.minutes} min` : ''].filter(Boolean).join(SEP)
}

/** The day's page on the site. */
export const dayHref = (day: number): string => `/programs/${PROGRAM_ID}/${day}`

/** The thirty days for the Timeline, each marked done or not, with today and the days still ahead. */
export function programCells(program: ProgramProgress, today: string): ProgramCell[] {
  const done = new Set(program.done)
  return Array.from({ length: DAYS }, (_, index) => {
    const date = dayDate(program.start, index + 1)
    return { day: index + 1, date, done: done.has(date), today: date === today, future: date > today }
  })
}

/** Day 30, and every day after it, offers the month snapshot until a monthly one is sealed since the start. */
export function offerMonthSnapshot(program: ProgramProgress | undefined, snapshots: Pick<Snapshot, 'cadence' | 'day'>[], today: string): boolean {
  if (!program) return false
  const status = programStatus(program, today)
  if (status.state === 'not-started' || (status.state === 'day' && status.day < DAYS)) return false
  return !snapshots.some((snapshot) => snapshot.cadence === 'monthly' && snapshot.day >= program.start)
}

/**
 * The program block for one day's log, as plain text: the day, its title and minutes when known, and whether it is
 * marked done. Empty outside the thirty days. The engine does not read it yet; it uses no witness heading or day-note
 * label, so `reality validate` and `reality insights` read the log exactly as before.
 */
export function programLogLines(program: ProgramProgress | undefined, date: string, days: ProgramDay[] = []): string[] {
  if (!program) return []
  const day = dayOf(program.start, date)
  if (day === null) return []
  const data = days.find((entry) => entry.day === day)
  return [`## ${PROGRAM_NAME}`, `- ${dayLine(data ?? { day })}`, `- Marked done: ${program.done.includes(date) ? 'yes' : 'not marked'}`]
}
