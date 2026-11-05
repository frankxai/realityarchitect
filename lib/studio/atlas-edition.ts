import { DOMAINS } from './domains.ts'
import type { StudioState } from './types.ts'

/**
 * A versioned, client-owned editorial projection of the existing Reality Studio.
 * No inference, scoring algorithm, network request, external model or expert opinion.
 * The person explicitly downloads the file; no local state is changed.
 */
export function atlasEditionMd(state: StudioState, day: string): string {
  const name = state.soul.name.trim() || 'Your'
  const title = name === 'Your' ? 'Your Life Atlas' : name + ' — Life Atlas'
  const source = 'Reality Studio (device-held, self-reported)'
  const rated = DOMAINS.filter((domain) => state.atlas[domain.id].now !== null)
  const priorities = DOMAINS.filter((domain) => state.atlas[domain.id].priority)
  const shown = (value: string) => value.trim() || 'Not recorded'
  const paragraphs = (value: string) => value.trim().replace(/\r\n?/g, '\n') || 'Not recorded'
  const score = (value: number | null) => value === null ? 'not rated' : String(value) + ' / 10'
  const domains = DOMAINS.map((domain, index) => {
    const entry = state.atlas[domain.id]
    return [
      '### ' + String(index + 1).padStart(2, '0') + ' · ' + domain.label,
      '- Current · self-reported: ' + score(entry.now),
      '- Desired · self-reported: ' + score(entry.want),
      '- Attention: ' + (entry.priority ? 'chosen priority' : 'not selected'),
      '- What is true now · your account: ' + shown(entry.fact),
      '- What you want to live · your scene: ' + shown(entry.scene),
    ].join('\n')
  })
  const bridges = state.bridges.filter((item) => item.status === 'active')
    .map((item, index) => [
      '### ' + (index + 1) + ' · ' + shown(item.title),
      '- Domain: ' + (DOMAINS.find((domain) => domain.id === item.domain)?.label || 'not assigned'),
      '- Done when · planned criterion: ' + shown(item.doneWhen),
      '- Next action · planned: ' + (item.moves.find((move) => !move.done)?.title || 'Not recorded'),
      '- Blocker · reported: ' + shown(item.obstacle),
      '- Response · planned: ' + shown(item.ifThen),
      '- Status: active (not yet an accomplished result)',
    ].join('\n'))
  const witnesses = state.witness.slice(-8).map((item) =>
    '- ' + item.day + ' · ' + item.kind + ' · ' + shown(item.fact) +
    (item.action ? ' · action taken: ' + item.action : '') +
    (item.meaning ? ' · personal meaning: ' + item.meaning : '')
  )
  return [
    '---',
    'standard: starlight-life-atlas',
    'edition: "1.0"',
    'created: ' + day,
    'source: realityarchitect.ai/studio',
    'register: self-report-and-personal-meaning',
    'sample: ' + (state.sample ? 'true' : 'false'),
    '---',
    '# ' + title,
    '',
    'An edition of a living practice · ' + day,
    '',
    state.sample ? '> FICTIONAL SAMPLE — demonstration material, not a real person or client result.' : '> Private personal material. Share only when you choose.',
    '',
    '## 01 / Orientation',
    '',
    '**Purpose · personal meaning**',
    '',
    paragraphs(state.soul.purpose),
    '',
    '**Scene · desired future**',
    '',
    paragraphs(state.soul.scene),
    '',
    '**Values · self-authored**',
    '',
    state.soul.values.length ? state.soul.values.map((item) => '- ' + item).join('\n') : 'Not recorded',
    '',
    '## 02 / The twelve domains',
    '',
    rated.length + ' of 12 domains have current self-ratings. A missing value is not a zero, failure or diagnosis.',
    priorities.length + ' of 3 possible priorities are chosen. The numbers are personal reflection markers, not validated psychometrics.',
    '',
    domains.join('\n\n'),
    '',
    '## 03 / Bridges · the work in progress',
    '',
    bridges.length ? bridges.join('\n\n') : 'No active bridge recorded. A next action is not inferred.',
    '',
    '## 04 / Witness · what happened',
    '',
    witnesses.length ? witnesses.join('\n') : 'No events recorded. No outcomes are presumed.',
    '',
    '## 05 / Interpretation contract',
    '',
    '- Source: ' + source + '. No external expert or AI analysis has been applied.',
    '- Reported: a statement the person chose to record; it is not independently verified.',
    '- Desired: a personally meaningful scene; it is not a prediction.',
    '- Planned: an intended action; it is not an accomplished outcome.',
    '- Done: an action explicitly recorded as completed in Witness or a bridge.',
    '- Meaning: the person’s own interpretation; not a causal or scientific claim.',
    '- This edition does not diagnose personality, trauma or health, infer outcomes from fingerprints, or promise transformation.',
    '- Future practitioner MethodPacks must display author, rights, claims, evidence tier, limitations, and independent review before inclusion.',
    '',
    '## 06 / Stewardship',
    '',
    'Your data stays within Reality Studio on this device until you choose to export it.',
    'This Markdown file is yours to keep, edit, print, or import. The Studio remains the source of your current self-authored state.',
    '',
    'Built on the Starlight Intelligence Protocol (SIP).',
    '',
  ].join('\n')
}
