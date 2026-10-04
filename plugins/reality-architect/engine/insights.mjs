import { WITNESS_KINDS, addDays, daysBetween } from './model.mjs'

/**
 * Patterns over time, as counts only. Every insight is labeled computed and says what it counted; none claims a
 * cause, and misses are counted beside hits. These are the seed of "insights over time": they get more useful with
 * every week of history a person keeps.
 */
export function insights(reality, today, days = 30) {
  const from = addDays(today, -(days - 1))
  const inWindow = (day) => day >= from && day <= today
  const entries = reality.witness.filter((entry) => inWindow(entry.day))
  const out = []

  const kinds = Object.fromEntries(WITNESS_KINDS.map((kind) => [kind, entries.filter((entry) => entry.kind === kind).length]))
  out.push({ id: 'witnessed', text: `Witnessed in the last ${days} days: ${WITNESS_KINDS.map((kind) => `${kind} ${kinds[kind]}`).join(' · ')}.`, data: kinds })

  const signs = entries.filter((entry) => entry.kind === 'sign')
  const primed = signs.filter((entry) => entry.primed).length
  if (signs.length) out.push({ id: 'signs', text: `Signs: ${primed} primed and ${signs.length - primed} unprimed. A primed sign is one you had set out to notice; counting both keeps the experiment honest.`, data: { primed, unprimed: signs.length - primed } })

  const notes = Object.values(reality.days).filter((note) => inWindow(note.day) && note.lookFor)
  if (notes.length) {
    const came = notes.filter((note) => note.lookForResult === 'came').length
    const missed = notes.filter((note) => note.lookForResult === 'missed').length
    out.push({ id: 'intentions', text: `Look-fors set on ${notes.length} days: came ${came}, missed ${missed}, not marked ${notes.length - came - missed}.`, data: { set: notes.length, came, missed } })
  }

  for (const aim of reality.aims.filter((item) => item.status === 'active' && item.reps.length)) {
    const planned = aim.reps.reduce((sum, rep) => sum + rep.perWeek, 0)
    const weeks = [3, 2, 1, 0].map((back) => {
      const end = addDays(today, -7 * back)
      const start = addDays(end, -6)
      return reality.witness.filter((entry) => entry.kind === 'rep' && entry.bridge === aim.slug && entry.day >= start && entry.day <= end).length
    })
    out.push({ id: `reps:${aim.slug}`, text: `${aim.title}: reps per week over the last four weeks ${weeks.join(' → ')} (planned ${planned}).`, data: { weeks, planned } })
  }

  const repDays = new Set(reality.witness.filter((entry) => entry.kind === 'rep').map((entry) => entry.day))
  let streak = 0
  for (let day = repDays.has(today) ? today : addDays(today, -1); repDays.has(day); day = addDays(day, -1)) streak += 1
  if (streak > 1) out.push({ id: 'streak', text: `Reps logged on ${streak} days in a row. A missed day ends the count; it does not erase the work.`, data: { streak } })

  const sealed = reality.snapshots.filter((snapshot) => snapshot.day).sort((a, b) => a.day.localeCompare(b.day))
  if (sealed.length >= 2) {
    const [first, last] = [sealed[0], sealed.at(-1)]
    const moved = Object.keys(last.atlas).filter((id) => first.atlas[id]?.now !== null && last.atlas[id]?.now !== null && first.atlas[id]?.now !== last.atlas[id]?.now)
    out.push({ id: 'atlas', text: `Across ${sealed.length} sealed snapshots (${first.day} to ${last.day}, ${daysBetween(first.day, last.day)} days), ${moved.length} Atlas domain${moved.length === 1 ? '' : 's'} changed score.`, data: { moved } })
  }
  return out.map((insight) => ({ ...insight, register: 'computed' }))
}
