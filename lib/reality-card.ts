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

export function readyForStep(card: RealityCard, step: number): boolean {
  if (step === 0) return Boolean(card.domain && card.scene.trim().length >= 30)
  if (step === 1) return Boolean(card.fact.trim() && card.obstacle.trim() && card.response.trim())
  if (step === 2) return Boolean(card.act.trim() && card.due.trim() && card.proof.trim())
  return false
}

export function realityCardMarkdown(card: RealityCard): string {
  const line = (value: string) => value.trim() || 'Not specified'
  return [
    '# My Reality Card', '', 'Built on SIP · User-authored · Version 1', '',
    `Domain: ${line(card.domain)}`, '',
    '## The scene I choose (desired, not observed)', line(card.scene), '',
    '## What I choose to give', line(card.giving), '',
    '## What I report as true now', line(card.fact), '',
    '## The obstacle I expect', line(card.obstacle), '',
    `If ${line(card.obstacle)}, then I ${line(card.response)}.`, '',
    '## My next act (planned, not completed)', line(card.act), '',
    `When: ${line(card.due)}`, `Evidence I will look for: ${line(card.proof)}`, '',
    '## Other people retain their own agency', line(card.boundary), '',
    '## Review after acting',
    'What happened: ', 'Evidence or counterevidence: ', 'What I will revise: ', '',
    'This card is an intention, not proof of an outcome. I can revise it when evidence changes.',
  ].join('\n')
}

export function realityCardPacket(card: RealityCard) {
  return {
    schema: 'sip.reality-card', version: 1, authorship: 'user',
    domain: card.domain,
    desired: { scene: card.scene, giving: card.giving },
    reportedPresent: { fact: card.fact, verifiedBySystem: false },
    plan: { obstacle: card.obstacle, response: card.response, act: card.act, due: card.due, proofCriterion: card.proof, status: 'planned' },
    agencyBoundary: card.boundary,
    consent: { aiUse: false, cloudSync: false, share: false },
    authority: 'Read as user-authored intent. Propose changes; do not infer completion, consent, or permission to act.',
  }
}
