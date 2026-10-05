import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { ENTRIES } from '../lib/library.ts'
import { parseFrontMatter, parseInline, parseMarkdown, safeHref, sections, wordCount } from '../lib/programs/markdown.ts'
import { DAYS, LOOPS, PROGRAM_DIR, WEEKS, dayFile, readDay, readDays, readOverview, summary, weekOf } from '../lib/programs/imaginal-30.ts'

test('front matter reads scalars, quoted strings and both list forms', () => {
  const front = parseFrontMatter('day: 3\ntitle: "The one scene: yours"\nloop: morning\nlibrary: [mental-rehearsal, attention]\nother:\n  - a\n  - "b, c"\nflag: true')
  assert.deepEqual(front, { day: 3, title: 'The one scene: yours', loop: 'morning', library: ['mental-rehearsal', 'attention'], other: ['a', 'b, c'], flag: true })
})

test('the body parses into headings, paragraphs, lists and quotes', () => {
  const { front, blocks } = parseMarkdown('---\nday: 1\n---\n# Day 1 — Arrive\n\n## The practice\n\n1. Sit.\n2. Write one line\n   in soul.md.\n\n- a\n- b\n\n> A quiet line.\n\nOne paragraph\nacross two lines.\n')
  assert.equal(front.day, 1)
  assert.deepEqual(blocks.map((block) => block.kind), ['heading', 'heading', 'list', 'list', 'quote', 'paragraph'])
  assert.deepEqual(blocks[2], { kind: 'list', ordered: true, items: ['Sit.', 'Write one line in soul.md.'] })
  assert.equal(blocks[5].text, 'One paragraph across two lines.')
  assert.deepEqual(sections(blocks).map((section) => section.id), ['the-practice'])
  assert.equal(wordCount(blocks), 22)
})

test('inline marks nest, and only safe links become links', () => {
  assert.deepEqual(parseInline('**Meaning.** your *own* `soul.md`'), [
    { kind: 'strong', children: [{ kind: 'text', text: 'Meaning.' }] },
    { kind: 'text', text: ' your ' },
    { kind: 'em', children: [{ kind: 'text', text: 'own' }] },
    { kind: 'text', text: ' ' },
    { kind: 'code', text: 'soul.md' },
  ])
  assert.deepEqual(parseInline('[Studio](/studio)'), [{ kind: 'link', href: '/studio', children: [{ kind: 'text', text: 'Studio' }] }])
  assert.deepEqual(parseInline('[x](javascript:alert(1))'), [{ kind: 'text', text: 'x' }, { kind: 'text', text: ')' }])
  for (const bad of ['javascript:alert(1)', '//evil.example', '/\\evil.example', 'http://plain.example', 'data:text/html,x']) assert.equal(safeHref(bad), null, bad)
  for (const good of ['https://www.realityarchitect.ai/studio', '/library#neville', '#the-practice']) assert.equal(safeHref(good), good)
  assert.deepEqual(parseInline('snake_case_name and 2*3*4'), [{ kind: 'text', text: 'snake_case_name and 2*3*4' }])
})

const LS = String.fromCharCode(0x2028)
const PS = String.fromCharCode(0x2029)

test('unusual line endings never stall the parser', () => {
  for (const source of ['# A' + LS + 'B', '# Day 1\r\r## Foo\rText', 'para' + PS + '# Head' + PS + 'more', '#nospace\n']) {
    const { blocks } = parseMarkdown(source)
    assert.ok(blocks.length >= 1 && blocks.length <= 4, JSON.stringify(source))
  }
  assert.deepEqual(parseMarkdown('# Day 1\r\r## Foo').blocks.map((block) => block.kind), ['heading', 'heading'])
})

test('a fenced block is kept verbatim, its lines never parsed, and it does not count as prose', () => {
  const fence = '```'
  const { blocks } = parseMarkdown(['## The practice', '', '1. Write it.', '', `${fence}markdown`, '---', '# Snapshot — <today>', '- True now:', fence, '', 'After.'].join('\n'))
  assert.deepEqual(blocks.map((block) => block.kind), ['heading', 'list', 'fence', 'paragraph'])
  assert.deepEqual(blocks[2], { kind: 'fence', lang: 'markdown', text: ['---', '# Snapshot — <today>', '- True now:'].join('\n') })
  assert.equal(wordCount(blocks), 2 + 2 + 1)
  const unclosed = parseMarkdown([`${fence}`, 'a', 'b'].join('\n')).blocks
  assert.deepEqual(unclosed, [{ kind: 'fence', lang: '', text: ['a', 'b'].join('\n') }])
  // A longer fence holds a shorter one, and tildes close only tildes.
  const nested = parseMarkdown([`${fence}\`md`, fence, 'inner', fence, `${fence}\``, 'after'].join('\n')).blocks
  assert.deepEqual(nested.map((block) => block.kind), ['fence', 'paragraph'])
  assert.equal(nested[0].text, [fence, 'inner', fence].join('\n'))
  const tildes = parseMarkdown(['~~~', fence, '~~~'].join('\n')).blocks
  assert.deepEqual(tildes, [{ kind: 'fence', lang: '', text: fence }])
})

test('weeks cover every day exactly once', () => {
  const covered = WEEKS.flatMap((week) => Array.from({ length: week.last - week.first + 1 }, (_, i) => week.first + i))
  assert.deepEqual(covered, Array.from({ length: DAYS }, (_, i) => i + 1))
})

// Locally the content tests wait for the program; in CI a missing program is a failure, not a skip.
const present = fs.existsSync(path.join(PROGRAM_DIR, 'README.md')) || Boolean(process.env.CI)

test('every day file exists with front matter that matches its place in the program', { skip: !present && 'program not written yet' }, () => {
  const ids = new Set(ENTRIES.map((entry) => entry.id))
  for (let n = 1; n <= DAYS; n++) {
    assert.ok(fs.existsSync(dayFile(n)), `day ${n} exists`)
    const day = readDay(n)
    assert.equal(day.day, n, `day ${n}: front matter day`)
    assert.equal(day.week, weekOf(n), `day ${n}: week`)
    assert.ok(day.title.length > 3, `day ${n}: title`)
    assert.ok(LOOPS.includes(day.loop), `day ${n}: loop "${day.loop}" is an engine loop`)
    assert.ok(day.library.length >= 1 && day.library.length <= 2, `day ${n}: one or two Library entries`)
    for (const id of day.library) assert.ok(ids.has(id), `day ${n}: Library entry "${id}" exists in lib/library.ts`)
    assert.ok(day.minutes >= 5 && day.minutes <= 12, `day ${n}: minutes`)
  }
})

test('every day carries the intent, the practice, both registers and the evening witness', { skip: !present && 'program not written yet' }, () => {
  for (const day of readDays()) {
    const titles = day.sections.map((section) => section.title.toLowerCase())
    for (const expected of [/intent/, /practice/, /why it works/, /tonight/]) assert.ok(titles.some((title) => expected.test(title)), `day ${day.day}: section ${expected}`)
    const why = day.sections.find((section) => /why it works/i.test(section.title))
    const text = why.blocks.map((block) => ('text' in block ? block.text : '')).join('\n')
    assert.match(text, /^\*\*Meaning\.\*\*/m, `day ${day.day}: a labeled Meaning paragraph`)
    assert.match(text, /^\*\*Mechanism\.\*\*/m, `day ${day.day}: a labeled Mechanism paragraph`)
    const practice = day.sections.find((section) => /practice/i.test(section.title))
    assert.ok(practice.blocks.some((block) => block.kind === 'list' && block.ordered), `day ${day.day}: numbered steps`)
    const words = day.sections.reduce((total, section) => total + wordCount(section.blocks), wordCount(day.intro))
    assert.ok(words <= 450, `day ${day.day}: ${words} words, at most 450`)
    assert.ok(summary(day).length > 10, `day ${day.day}: a summary for metadata`)
  }
})

test('the program never names a teacher or promises an outcome', { skip: !present && 'program not written yet' }, () => {
  const names = [...ENTRIES.map((entry) => entry.name), 'Goddard', 'Dispenza', 'Robbins', 'Byrne', 'Grout', 'Hicks', 'Maltz', 'Lifebook']
  const forbidden = [/raise your vibration/i, /law of attraction/i, /\bmanifest(?:s|ed|ing)?\b/i, /rewir(?:e|ing) your (?:sub)?conscious/i, /reprogram/i, /\bguarantee/i, /\bquantum\b/i, /vibration/i,/\battract(?:s|ing)?\b/i]
  const files = [path.join(PROGRAM_DIR, 'README.md'), ...Array.from({ length: DAYS }, (_, i) => dayFile(i + 1))]
  for (const file of files) {
    const body = fs.readFileSync(file, 'utf8')
    for (const name of names) assert.ok(!body.includes(name), `${path.basename(file)} names ${name}; teacher names live in lib/library.ts`)
    for (const phrase of forbidden) assert.doesNotMatch(body, phrase, `${path.basename(file)}`)
  }
  assert.ok(readOverview().title.length > 0, 'the README has a title')
})
