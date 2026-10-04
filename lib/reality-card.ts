export type RealityCard = {
  domain: string
  scene: string
  giving: string
  fact: string
  obstacle: string
  response: string
  act: string
  due: string
  proof: string
  boundary: string
}

export type Written = { date: string; timeZone: string }

/** The date and zone a card is written in, so "Friday before noon" can be resolved later. */
export function writtenNow(now = new Date()): Written {
  const pad = (n: number) => String(n).padStart(2, '0')
  let timeZone = 'local time'
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || timeZone
  } catch {
    // Older engines without Intl time zones keep the generic label.
  }
  return { date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`, timeZone }
}

/** "When I reach for my phone." -> "I reach for my phone"; "I open the draft" -> "open the draft". */
function clause(value: string, leading: RegExp): string {
  return value.trim().replace(leading, '').replace(/[.!;,\s]+$/, '')
}

export function readyForStep(card: RealityCard, step: number): boolean {
  if (step === 0) return Boolean(card.domain && card.scene.trim().length >= 30)
  if (step === 1) return Boolean(card.fact.trim() && card.obstacle.trim() && card.response.trim())
  if (step === 2) return Boolean(card.act.trim() && card.due.trim() && card.proof.trim())
  return false
}

export function realityCardMarkdown(card: RealityCard, written: Written = writtenNow()): string {
  const line = (value: string) => value.trim() || 'Not specified'
  const condition = clause(card.obstacle, /^(if|when|whenever)[\s,:;–—-]+/i) || 'Not specified'
  // The sentence supplies its own "then I": drop a leading "then" (with any punctuation after it) and a first-person
  // subject, contracted or not.
  const response = clause(card.response, /^(then[\s,:;–—-]+)?(i['’]ll\s+|i\s+will\s+|i['’]m\s+going\s+to\s+|i\s+am\s+going\s+to\s+|i\s+)?/i) || 'Not specified'
  return [
    '# My Reality Card', '', 'Built on SIP · User-authored · Version 1', `Written: ${written.date} (${written.timeZone})`, '',
    `Domain: ${line(card.domain)}`, '',
    '## The scene I choose (desired, not observed)', line(card.scene), '',
    '## What I choose to give', line(card.giving), '',
    '## What I report as true now', line(card.fact), '',
    '## The obstacle I expect', line(card.obstacle), '',
    `If ${condition}, then I ${response}.`, '',
    '## My next act (planned, not completed)', line(card.act), '',
    `When: ${line(card.due)} (as written on ${written.date})`, `Evidence I will look for: ${line(card.proof)}`, '',
    '## Other people retain their own agency', line(card.boundary), '',
    '## Review after acting',
    'What happened: ', 'Evidence or counterevidence: ', 'What I will revise: ', '',
    'This card is an intention, not proof of an outcome. I can revise it when evidence changes.',
  ].join('\n')
}

export function realityCardPacket(card: RealityCard, written: Written = writtenNow()) {
  return {
    schema: 'sip.reality-card', version: 1, authorship: 'user',
    written,
    domain: card.domain,
    desired: { scene: card.scene, giving: card.giving },
    reportedPresent: { fact: card.fact, verifiedBySystem: false },
    plan: { obstacle: card.obstacle, response: card.response, act: card.act, due: card.due, proofCriterion: card.proof, status: 'planned' },
    agencyBoundary: card.boundary,
    consent: { aiUse: false, cloudSync: false, share: false },
    authority: 'Read as user-authored intent. Propose changes; do not infer completion, consent, or permission to act.',
  }
}
