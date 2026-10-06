import assert from 'node:assert/strict'
import test from 'node:test'
import { addDays, buildProgramIcs, calendarDays, escapeText, foldLine, icsFileName, isIcsDate, isIcsTime } from '../lib/programs/ics.ts'
import { DAYS, readDays } from '../lib/programs/imaginal-30.ts'

const CRLF = '\r\n'
const STAMP = new Date(Date.UTC(2026, 9, 6, 12, 0, 0))
const BASE = 'https://www.realityarchitect.ai'

const day = (n, extra = {}) => ({ n, title: `Title ${n}`, intent: `Intent ${n}.`, url: `${BASE}/programs/imaginal-30/${n}`, ...extra })
const thirty = Array.from({ length: 30 }, (_, i) => day(i + 1))
const build = (extra = {}) => buildProgramIcs({ start: '2026-10-07', time: '07:00', minutes: 10, days: thirty, stamp: STAMP, ...extra })

/** The physical lines of a file, without the CRLF that ends each one. */
const physical = (text) => text.slice(0, -CRLF.length).split(CRLF)
/** RFC 5545 unfolding: a CRLF followed by one space joins two physical lines. */
const unfold = (text) => text.replaceAll(`${CRLF} `, '')
const octets = (text) => Buffer.byteLength(text, 'utf8')
const strictUtf8 = new TextDecoder('utf-8', { fatal: true })
const events = (text) => unfold(text).split(`BEGIN:VEVENT${CRLF}`).slice(1).map((block) => block.split(CRLF))
const prop = (lines, name) => lines.find((line) => line.startsWith(`${name}:`))?.slice(name.length + 1)

test('a line of exactly 75 octets stays whole; one more octet folds, and the space counts', () => {
  const exact = 'X'.repeat(75)
  assert.equal(foldLine(exact), exact)
  const folded = foldLine('X'.repeat(76))
  assert.equal(folded, `${'X'.repeat(75)}${CRLF} X`)
  // A continuation line holds 74 octets after its space, so 75 + 74 + 1 makes three physical lines.
  assert.deepEqual(foldLine('Y'.repeat(150)).split(CRLF).map(octets), [75, 75, 2])
})

test('folding counts UTF-8 octets and never splits a multi-byte character', () => {
  // Each wide character is placed so its octets straddle the 75-octet boundary.
  for (const [char, size] of [['\u00e9', 2], ['\u00b7', 2], ['\u2014', 3], ['\u6728', 3], ['\u{1F319}', 4]]) {
    assert.equal(octets(char), size)
    for (let pad = 70; pad <= 75; pad++) {
      const line = `${'a'.repeat(pad)}${char.repeat(40)}`
      const folded = foldLine(line)
      const parts = folded.split(CRLF)
      for (const [index, part] of parts.entries()) {
        assert.ok(octets(part) <= 75, `${char} pad ${pad}: line ${index} is ${octets(part)} octets`)
        if (index > 0) assert.ok(part.startsWith(' ') && !part.startsWith('  '), 'a continuation starts with exactly one space')
        // A strict decoder throws on a split sequence, so every physical line is whole UTF-8.
        assert.doesNotThrow(() => strictUtf8.decode(Buffer.from(part, 'utf8')))
        assert.ok(!/[\uD800-\uDBFF]$/.test(part), 'no surrogate pair is cut')
      }
      // The first line uses as many octets as fit without splitting the character.
      assert.ok(octets(parts[0]) > 75 - size, `${char} pad ${pad}: first line is packed`)
      assert.equal(unfold(folded), line)
    }
  }
})

test('every physical line of a real file is at most 75 octets, and unfolding restores the long values', () => {
  const long = { title: 'Rehearse, revise; repeat \u2014 caf\u00e9 \u6728 \u{1F319} '.repeat(6), intent: '\u00e9t\u00e9 \u2014 '.repeat(40) }
  const text = build({ days: [day(1, long), ...thirty.slice(1)] })
  for (const line of physical(text)) assert.ok(octets(line) <= 75, `${octets(line)} octets: ${line}`)
  const first = events(text)[0]
  assert.equal(prop(first, 'SUMMARY'), escapeText(`Day 1 \u00b7 ${long.title.trim()}`))
  assert.ok(prop(first, 'DESCRIPTION').startsWith(escapeText(long.intent.trim())))
})

test('TEXT escaping covers backslash, semicolon, comma and every kind of newline', () => {
  assert.equal(escapeText('a\\b;c,d'), 'a\\\\b\\;c\\,d')
  assert.equal(escapeText(['one', 'two', 'three'].join('\n')), 'one\\ntwo\\nthree')
  assert.equal(escapeText(['one', 'two'].join('\r\n')), 'one\\ntwo')
  assert.equal(escapeText(['one', 'two'].join('\r')), 'one\\ntwo')
  assert.equal(escapeText('a: b'), 'a: b', 'a colon needs no escape')
  assert.equal(escapeText('tab\there\u0000\u0007'), 'tab\there', 'TAB stays, other controls go')
  // Backslash is escaped first, so an existing "\;" never becomes an unescaped semicolon.
  assert.equal(escapeText('\\;'), '\\\\\\;')

  const text = build({ days: [day(1, { title: 'Plan, act; review \\ repeat', intent: ['First line, here.', 'Second; line.'].join('\n') })] })
  const [event] = events(text)
  assert.equal(prop(event, 'SUMMARY'), 'Day 1 \u00b7 Plan\\, act\\; review \\\\ repeat')
  assert.equal(prop(event, 'DESCRIPTION'), `First line\\, here.\\nSecond\\; line.\\n\\n${BASE}/programs/imaginal-30/1`)
  assert.equal(prop(event, 'URL'), `${BASE}/programs/imaginal-30/1`, 'a URI value is not escaped')
})

test('CRLF ends every line, with no bare CR or LF anywhere', () => {
  const text = build({ days: [day(1, { intent: ['a', 'b'].join('\n') + '\r' + 'c' }), ...thirty.slice(1)] })
  assert.ok(text.endsWith(`END:VCALENDAR${CRLF}`))
  assert.equal(/\r(?!\n)|(?<!\r)\n/.test(text), false)
  assert.ok(physical(text).every((line) => line.length > 0), 'no empty lines')
})

test('one calendar, 30 events, unique stable UIDs, and no alarms', () => {
  const text = build()
  const lines = physical(unfold(text))
  assert.equal(lines[0], 'BEGIN:VCALENDAR')
  assert.equal(lines.at(-1), 'END:VCALENDAR')
  assert.ok(lines.includes('VERSION:2.0'))
  assert.ok(lines.some((line) => /^PRODID:-\/\/.+\/\/EN$/.test(line)))
  const list = events(text)
  assert.equal(list.length, 30)
  assert.equal(lines.filter((line) => line === 'END:VEVENT').length, 30)
  const uids = list.map((event) => prop(event, 'UID'))
  assert.equal(new Set(uids).size, 30)
  uids.forEach((uid, i) => assert.equal(uid, `imaginal-30-day-${i + 1}-2026-10-07@realityarchitect.ai`))
  assert.deepEqual(physical(unfold(build({ stamp: new Date() }))).filter((line) => line.startsWith('UID:')), lines.filter((line) => line.startsWith('UID:')), 'UIDs do not depend on the clock')
  for (const [i, event] of list.entries()) {
    assert.equal(prop(event, 'DTSTAMP'), '20261006T120000Z')
    assert.equal(prop(event, 'SUMMARY'), `Day ${i + 1} \u00b7 Title ${i + 1}`)
    assert.equal(prop(event, 'DURATION'), 'PT10M')
    assert.equal(prop(event, 'DESCRIPTION'), `Intent ${i + 1}.\\n\\n${BASE}/programs/imaginal-30/${i + 1}`)
  }
  assert.equal(/VALARM|TRIGGER|ACTION:/.test(text), false)
  assert.equal(build(), text, 'the same input and stamp give the same bytes')
})

test('each day keeps its own length, and the program length is the fallback', () => {
  const [a, b] = events(build({ days: [day(1, { minutes: 12 }), day(2)], minutes: 8 }))
  assert.equal(prop(a, 'DURATION'), 'PT12M')
  assert.equal(prop(b, 'DURATION'), 'PT8M')
})

test('dates roll over month ends, year ends and leap days', () => {
  const starts = (start, count) => events(build({ start, days: thirty.slice(0, count) })).map((event) => prop(event, 'DTSTART'))
  assert.deepEqual(starts('2026-01-30', 4), ['20260130T070000', '20260131T070000', '20260201T070000', '20260202T070000'])
  assert.deepEqual(starts('2026-12-30', 3), ['20261230T070000', '20261231T070000', '20270101T070000'])
  assert.deepEqual(starts('2028-02-28', 3), ['20280228T070000', '20280229T070000', '20280301T070000'])
  assert.deepEqual(starts('2027-02-28', 2), ['20270228T070000', '20270301T070000'])
  const all = starts('2026-10-07', 30)
  assert.equal(all[29], '20261105T070000', 'day 30 is 29 days after day 1')
  assert.equal(addDays('2026-10-07', 29), '2026-11-05')
})

test('across a daylight-saving week, 07:00 stays 07:00 in floating local time', () => {
  // Europe leaves summer time on 2026-10-25 and the United States on 2026-11-01; Europe enters it on 2027-03-28.
  for (const start of ['2026-10-22', '2026-10-29', '2027-03-25']) {
    const list = events(build({ start, days: thirty.slice(0, 7) }))
    assert.equal(list.length, 7)
    list.forEach((event, i) => {
      const dtstart = prop(event, 'DTSTART')
      assert.equal(dtstart, `${addDays(start, i).replaceAll('-', '')}T070000`)
      assert.ok(!event.some((line) => /^DTSTART;|TZID/.test(line)), 'no TZID')
    })
  }
  // The device's own zone never changes the file.
  const before = process.env.TZ
  try {
    const outputs = ['Europe/Amsterdam', 'America/New_York', 'Australia/Lord_Howe', 'UTC'].map((zone) => {
      process.env.TZ = zone
      return build({ start: '2026-10-22' })
    })
    for (const output of outputs) assert.equal(output, outputs[0])
  } finally {
    if (before === undefined) delete process.env.TZ
    else process.env.TZ = before
  }
  assert.equal(/BEGIN:VTIMEZONE|TZID|DTSTART:\d{8}T\d{6}Z/.test(build()), false)
})

test('a malformed date, time, length or link is refused instead of making a bad file', () => {
  for (const start of ['2026-02-30', '2026-13-01', '07/10/2026', '', '2026-1-7']) assert.throws(() => build({ start }), RangeError, start)
  for (const time of ['7:00', '24:00', '07:60', '07:00:00', '']) assert.throws(() => build({ time }), RangeError, time)
  for (const minutes of [0, -5, 1.5, Number.NaN]) assert.throws(() => build({ minutes }), RangeError, String(minutes))
  for (const url of ['http://www.realityarchitect.ai/x', '/programs/imaginal-30/1', `${BASE}/x${CRLF}ATTENDEE:evil`, `${BASE}/a b`]) {
    assert.throws(() => build({ days: [day(1, { url })] }), RangeError, url)
  }
  assert.throws(() => build({ days: [day(1), day(1)] }), RangeError)
  assert.throws(() => build({ days: [day(0)] }), RangeError)
  assert.ok(isIcsDate('2028-02-29') && !isIcsDate('2027-02-29'))
  assert.ok(isIcsTime('00:00') && isIcsTime('23:59') && !isIcsTime('23:5'))
  assert.equal(icsFileName('2026-10-07'), 'imaginal-30-from-2026-10-07.ics')
})

test('the real program becomes 30 events with plain-text intents and absolute day links', () => {
  const days = calendarDays(readDays(), `${BASE}/`)
  assert.equal(days.length, DAYS)
  for (const item of days) {
    assert.equal(item.url, `${BASE}/programs/imaginal-30/${item.n}`)
    assert.ok(item.title.length > 0 && !/[*`[\]]/.test(item.title), `day ${item.n} title is plain text`)
    assert.ok(item.intent.length > 0 && !/[*`]/.test(item.intent), `day ${item.n} has a plain-text intent`)
    assert.ok(Number.isInteger(item.minutes) && item.minutes > 0)
  }
  // Only what the calendar needs crosses to the client.
  assert.deepEqual(Object.keys(days[0]).sort(), ['intent', 'minutes', 'n', 'title', 'url'])
  const text = buildProgramIcs({ start: '2026-10-07', time: '07:00', minutes: 10, days, stamp: STAMP })
  assert.equal(events(text).length, 30)
  for (const line of physical(text)) assert.ok(octets(line) <= 75)
})
