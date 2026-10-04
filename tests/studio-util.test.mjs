import assert from 'node:assert/strict'
import test from 'node:test'
import { addDays, clampText, daysBetween, isDay, localDay, newId, slugify, uniqueSlug } from '../lib/studio/util.ts'

test('localDay uses the local calendar, including one minute before midnight', () => {
  assert.equal(localDay(new Date(2026, 9, 4, 23, 59)), '2026-10-04')
  assert.equal(localDay(new Date(2026, 0, 1, 0, 0)), '2026-01-01')
})

test('day arithmetic is calendar based and survives the October DST change', () => {
  assert.equal(addDays('2026-10-31', 1), '2026-11-01')
  assert.equal(addDays('2026-03-01', -1), '2026-02-28')
  assert.equal(daysBetween('2026-10-01', '2026-10-15'), 14)
  assert.equal(daysBetween('2026-10-20', '2026-10-30'), 10)
  assert.equal(daysBetween('2026-10-15', '2026-10-01'), -14)
  assert.equal(daysBetween('', '2026-10-01'), 0)
})

test('impossible calendar dates are not days', () => {
  assert.equal(isDay('2026-02-31'), false)
  assert.equal(isDay('2026-13-01'), false)
  assert.equal(isDay('2026-00-10'), false)
  assert.equal(isDay('2028-02-29'), true)
  assert.equal(isDay('2026-10-04'), true)
})

test('slugs are safe file names: ASCII, hyphenated, bounded, never empty', () => {
  assert.equal(slugify('Finish: the/album ✨ now'), 'finish-the-album-now')
  assert.equal(slugify('Café Über Straße'), 'cafe-uber-strasse')
  assert.equal(slugify('✨'), 'untitled')
  assert.equal(slugify('   '), 'untitled')
  assert.ok(slugify('a'.repeat(300)).length <= 60)
  assert.equal(slugify('Hire a mastering engineer instead of mastering myself', 48), 'hire-a-mastering-engineer-instead-of-mastering')
  assert.equal(slugify('finish the album', 6), 'finish')
  assert.doesNotMatch(slugify('../../etc/passwd'), /[./\\]/)
})

test('uniqueSlug never repeats a taken name', () => {
  assert.equal(uniqueSlug('a', new Set()), 'a')
  assert.equal(uniqueSlug('a', new Set(['a', 'a-2'])), 'a-3')
})

test('ids are unique and text is clamped', () => {
  const ids = new Set(Array.from({ length: 200 }, () => newId()))
  assert.equal(ids.size, 200)
  assert.equal(clampText('abcdef', 3), 'abc')
  assert.equal(clampText(42, 3), '')
})
