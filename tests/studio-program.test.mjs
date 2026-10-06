import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { insights } from '../plugins/reality-architect/engine/insights.mjs'
import { loadReality, resolveHome } from '../plugins/reality-architect/engine/parse.mjs'
import { validate } from '../plugins/reality-architect/engine/validate.mjs'
import { readDays } from '../lib/programs/imaginal-30.ts'
import { DAYS } from '../lib/programs/program.ts'
import { studioDays } from '../lib/programs/studio-days.ts'
import { ROOT, bundleFiles, dayLogMd } from '../lib/studio/export.ts'
import { parseImport } from '../lib/studio/importer.ts'
import {
  PROGRAM_ID, dayHref, dayLine, normalizeProgram, offerMonthSnapshot, programCells, programLogLines, programStatus,
  startProgram, statusLabel, toggleDay,
} from '../lib/studio/program.ts'
import { studioPatterns } from '../lib/studio/reality.ts'
import { sampleState } from '../lib/studio/sample.ts'
import { emptyState, isEmptyState, normalizeState } from '../lib/studio/state.ts'
import { addDays } from '../lib/studio/util.ts'

// Separators are built from char codes so this source stays ASCII.
const DOT = String.fromCharCode(0xb7)
const START = '2026-10-01'
/** The local date of program day n for START. */
const on = (n) => addDays(START, n - 1)
const program = (done = [], start = START) => ({ id: 'imaginal-30', start, done })
const NOW = new Date(2026, 9, 4, 9, 0)
const TODAY = '2026-10-04'

test('with no program, or before its start date, the program reads Not started', () => {
  const none = programStatus(undefined, TODAY)
  assert.equal(none.state, 'not-started')
  assert.equal(none.day, 1)
  assert.equal(none.start, '')
  assert.equal(statusLabel(none), 'Not started')

  const ahead = programStatus(program([], '2026-10-10'), '2026-10-06')
  assert.equal(ahead.state, 'not-started', 'a start date still ahead (a backup from another time zone, a changed clock) has not begun')
  assert.equal(ahead.day, 1, 'the index is clamped to day 1')
  assert.equal(ahead.start, '2026-10-10')
  assert.equal(ahead.doneToday, false)
  assert.equal(statusLabel(ahead), 'Not started')
})

test('the start date is day 1', () => {
  const status = programStatus(program(), START)
  assert.equal(status.state, 'day')
  assert.equal(status.day, 1)
  assert.equal(status.date, START)
  assert.equal(status.doneCount, 0)
  assert.deepEqual(status.notMarked, [])
  assert.equal(statusLabel(status), 'Day 1')
  assert.equal(programStatus(program(), on(2)).day, 2, 'the next calendar day is day 2')
})

test('a missed day is counted, not carried as debt: the calendar moves on', () => {
  const status = programStatus(program([on(1), on(2)]), on(4))
  assert.equal(status.state, 'day')
  assert.equal(status.day, 4, 'day 3 was not marked; today is still day 4')
  assert.equal(status.doneCount, 2)
  assert.deepEqual(status.notMarked, [3], 'only past days that are not marked; today is not a miss yet')
  assert.equal(status.doneToday, false)
  const cells = programCells(program([on(1), on(2)]), on(4))
  assert.equal(cells.length, DAYS)
  assert.deepEqual(cells.slice(0, 5).map((cell) => [cell.day, cell.done, cell.today, cell.future]), [
    [1, true, false, false], [2, true, false, false], [3, false, false, false], [4, false, true, false], [5, false, false, true],
  ])
  assert.equal(cells[2].date, on(3))
})

test('day 30 is the last day; after it the program is Complete', () => {
  const last = programStatus(program(), on(30))
  assert.equal(last.state, 'day')
  assert.equal(last.day, 30)
  assert.equal(statusLabel(last), 'Day 30')

  for (const today of [on(31), on(45), addDays(START, 400)]) {
    const after = programStatus(program([on(1), on(30)]), today)
    assert.equal(after.state, 'complete', today)
    assert.equal(after.day, 30, 'the index stays clamped to 30')
    assert.equal(after.doneCount, 2)
    assert.equal(after.notMarked.length, 28, 'every unmarked day of the month is counted, nothing more')
    assert.equal(statusLabel(after), 'Complete')
  }
  assert.ok(programCells(program(), on(31)).every((cell) => !cell.future && !cell.today))
})

test('day 30 offers the month snapshot until a monthly one is sealed for the program', () => {
  const p = program()
  const monthly = { cadence: 'monthly', day: on(30) }
  assert.equal(offerMonthSnapshot(p, [], on(29)), false, 'not before day 30')
  assert.equal(offerMonthSnapshot(p, [], on(30)), true)
  assert.equal(offerMonthSnapshot(p, [], on(33)), true, 'still offered once complete')
  assert.equal(offerMonthSnapshot(p, [{ cadence: 'weekly', day: on(30) }], on(30)), true, 'a weekly seal is not the month')
  assert.equal(offerMonthSnapshot(p, [{ cadence: 'monthly', day: addDays(START, -3) }], on(30)), true, 'a month sealed before the program does not count')
  assert.equal(offerMonthSnapshot(p, [monthly], on(30)), false)
  assert.equal(offerMonthSnapshot(undefined, [], on(30)), false)
})

test('starting stores today on the device, and marking a day toggles only that day', () => {
  assert.deepEqual(startProgram('2026-10-06'), { id: PROGRAM_ID, start: '2026-10-06', done: [] })
  assert.equal(PROGRAM_ID, 'imaginal-30')
  const marked = toggleDay(program([on(5)]), 2)
  assert.deepEqual(marked.done, [on(2), on(5)], 'kept in date order')
  assert.deepEqual(toggleDay(marked, 2).done, [on(5)], 'marking again unmarks')
  assert.deepEqual(toggleDay(program(), 31).done, [], 'a day outside the thirty is ignored')
  assert.deepEqual(program([on(5)]).done, [on(5)], 'the input is never mutated')
})

test('the Today line and the link use the day data, with the minutes and the count as numbers', () => {
  const day = { day: 3, title: 'One scene', minutes: 12, intent: 'Write one short scene.' }
  assert.equal(dayLine(day), `Day 3 of 30 ${DOT} One scene ${DOT} 12 min`)
  assert.equal(dayLine({ day: 3 }), 'Day 3 of 30', 'without the server data it still names the day')
  assert.equal(dayHref(3), '/programs/imaginal-30/3')
})

test('normalizeState keeps a valid program and repairs or drops a broken one', () => {
  const kept = normalizeState({ program: program([on(2), 'junk', on(2), on(1), '2026-09-01', on(31), 7]) }, NOW)
  assert.deepEqual(kept.program, program([on(1), on(2)]), 'dates outside the thirty days, duplicates and junk go')
  for (const broken of [{ id: 'other', start: START, done: [] }, { id: 'imaginal-30', start: '2026-02-31', done: [] }, 'x', null, []]) {
    const state = normalizeState({ program: broken }, NOW)
    assert.equal('program' in state, false, JSON.stringify(broken))
  }
  assert.equal(normalizeProgram({ id: 'imaginal-30', start: START }).done.length, 0, 'a missing list is an empty list')
})

test('an old v1 state without a program loads unchanged', () => {
  const old = sampleState(TODAY)
  assert.equal('program' in old, false)
  const loaded = normalizeState(JSON.parse(JSON.stringify(old)), NOW)
  assert.deepEqual(loaded, old)
  assert.equal('program' in loaded, false, 'no program key appears on a state that never had one')
  const imported = parseImport(JSON.stringify(old), TODAY)
  assert.equal(imported.kind, 'studio')
  assert.deepEqual(imported.state, old)
})

test('an import round trip carries the program', () => {
  const state = sampleState(TODAY)
  state.program = program([on(1), on(3)], '2026-10-01')
  const result = parseImport(JSON.stringify(state), TODAY)
  assert.equal(result.kind, 'studio')
  assert.deepEqual(result.state.program, state.program)
  assert.deepEqual(result.state, state)
})

test('a started program is authored content, so the Studio is no longer empty', () => {
  const state = emptyState(NOW)
  assert.equal(isEmptyState(state), true)
  state.program = startProgram(TODAY)
  assert.equal(isEmptyState(state), false)
})

test('the day log carries the program block as plain text, with or without the day data', () => {
  const state = sampleState(TODAY)
  state.program = program(['2026-10-02'], '2026-09-28')
  assert.deepEqual(programLogLines(state.program, '2026-09-27'), [], 'no block before the program')
  assert.deepEqual(programLogLines(state.program, '2026-10-28'), [], 'no block after day 30')
  assert.deepEqual(programLogLines(state.program, '2026-10-02'), ['## The Imaginal Act', '- Day 5 of 30', '- Marked done: yes'])
  const days = studioDays(readDays())
  const md = dayLogMd('2026-10-03', state, days)
  assert.ok(md.includes(`\n## The Imaginal Act\n- Day 6 of 30 ${DOT} ${days[5].title} ${DOT} ${days[5].minutes} min\n- Marked done: not marked\n`), md)
  assert.ok(md.indexOf('## The Imaginal Act') < md.indexOf('### '), 'the block sits above the witness entries')
})

test('the export with a program stays valid for the engine and keeps pattern parity', (t) => {
  const state = sampleState(TODAY)
  // Day 7 of 30 on TODAY: days 1, 2 and 5 marked (day 2 has no note or entry of its own), 3 and 4 not marked.
  state.program = program(['2026-09-28', '2026-09-29', '2026-10-02'], '2026-09-28')
  const files = bundleFiles(state, TODAY, studioDays(readDays()))
  const log = (day) => files.find((file) => file.path === `${ROOT}reality/log/${day}.md`)
  assert.ok(log('2026-09-29'), 'a marked day gets its log even without a note or an entry')
  assert.match(log('2026-09-29').text, /^- Marked done: yes$/m)
  assert.match(log(TODAY).text, /^- Day 7 of 30 /m)
  assert.match(log(TODAY).text, /^- Marked done: not marked$/m)

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ra-program-'))
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }))
  for (const file of files) {
    const target = path.join(dir, file.path)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, file.text)
  }
  const home = resolveHome(path.join(dir, 'Reality Architect'))
  assert.deepEqual(validate(home), [])
  const reality = loadReality(home)
  assert.equal(reality.days['2026-10-02'].lookFor, state.days['2026-10-02'].lookFor, 'the morning note still parses')
  assert.equal(reality.days['2026-10-02'].lookForResult, 'missed', 'a counted miss is still a miss')
  assert.deepEqual(studioPatterns(state, TODAY), insights(reality, TODAY))
})

test('the server hands the Studio a small, plain list of the thirty days', () => {
  const days = studioDays(readDays())
  assert.equal(days.length, DAYS)
  days.forEach((day, index) => {
    assert.deepEqual(Object.keys(day).sort(), ['day', 'intent', 'minutes', 'title'])
    assert.equal(day.day, index + 1)
    assert.ok(day.title.length > 2, `day ${day.day} has a title`)
    assert.ok(Number.isInteger(day.minutes) && day.minutes > 0, `day ${day.day} has its minutes`)
    assert.ok(day.intent.length > 20, `day ${day.day} has its intent`)
    assert.doesNotMatch(day.intent, /[`*]|\]\(/, `day ${day.day}: plain text, no Markdown marks`)
  })
  assert.equal(days[0].intent, 'Write down what is true in your life today, plainly, before you imagine anything. You are taking a reading, not passing a verdict.')
  assert.ok(JSON.stringify(days).length < 12000, 'small enough to send with the page')
})

test('the Studio client never imports the file system; only the server page reads the days', () => {
  const root = process.cwd()
  const client = [
    ...fs.readdirSync(path.join(root, 'components', 'studio')).map((name) => path.join('components', 'studio', name)),
    ...fs.readdirSync(path.join(root, 'lib', 'studio')).map((name) => path.join('lib', 'studio', name)),
  ].filter((file) => /\.tsx?$/.test(file))
  for (const file of client) {
    const source = fs.readFileSync(path.join(root, file), 'utf8')
    assert.doesNotMatch(source, /from ['"](?:node:)?(?:fs|path)['"]/, `${file} imports the file system`)
    assert.doesNotMatch(source, /programs\/(?:imaginal-30|studio-days)['".]/, `${file} imports the server-side program loader`)
  }
  const page = fs.readFileSync(path.join(root, 'app', 'studio', 'page.tsx'), 'utf8')
  assert.doesNotMatch(page, /['"]use client['"]/, 'the Studio page stays a server component')
  assert.match(page, /readDays\(\)/)
  assert.match(page, /programDays=/)
})
