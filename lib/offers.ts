/**
 * The offers, in one place. `/pricing` renders from this file, and the numbers match the decisions in
 * docs/strategy/OFFER-AND-DELIVERY.md (tests/pricing.test.mjs holds them together). Nothing here sells anything:
 * `open` stays false until checkout exists and Frank turns it on.
 */

export type Offer = {
  id: string
  name: string
  price: string
  cadence?: string
  alternative?: string
  summary: string
  includes: string[]
  note?: string
}

/** Paid plans are not open until checkout exists. */
export const PAID_OPEN = false

export const OFFERS: Offer[] = [
  {
    id: 'free',
    name: 'Free, forever',
    price: '$0',
    summary: 'Everything that runs on your device. No account needed.',
    includes: [
      'Reality Studio: Today, Atlas, Bridges, Witness, Map and vision board, Timeline, Soul',
      'Installable on your phone, works offline',
      'Patterns over time from your own files',
      'The Library, the Imaginal Act, the open standard',
      'The agent plugin and engine for Claude Code and other agents',
      'Complete export: reality.md, soul.md, and an Obsidian-ready folder',
      '20 image renders of your own scenes once accounts open',
    ],
  },
  {
    id: 'architect',
    name: 'Architect',
    price: '$19',
    cadence: 'per month',
    alternative: 'or $190 per year',
    summary: 'Your practice on every device, with the parts that need the cloud.',
    includes: [
      'Everything in Free',
      'End-to-end encrypted sync on every device (we cannot read it)',
      'Patterns across devices and a monthly reflection report, drafted for your approval',
      'Opt-in weekly loop nudges, with proposals only you can open',
      '150 image renders of your own scenes every month',
    ],
  },
  {
    id: 'founding',
    name: 'Founding Architect',
    price: '$120',
    cadence: 'per year',
    alternative: 'locked for life, for the first 1,000 members',
    summary: 'Everything in Architect, at the founding rate for as long as you stay.',
    includes: ['Everything in Architect', 'Your rate never rises, even when Architect’s does'],
  },
  {
    id: 'guide',
    name: 'Guide',
    price: '$79',
    cadence: 'per month',
    summary: 'For coaches and guides who walk the practice with clients.',
    includes: [
      'Everything in Architect',
      '15 client seats; each client chooses exactly what you see, and can revoke it',
      'A practice library to share with clients',
    ],
  },
  {
    id: 'school',
    name: 'School',
    price: '$490',
    cadence: 'per seat, per cohort',
    summary: 'Six live weeks on the Library and the practice, in a small cohort.',
    includes: ['Six weekly live sessions', 'The practice in the Studio between sessions', 'One scholarship seat for every five paid seats'],
  },
]

export const RENDER_PACK = { renders: 120, price: '$9', note: 'never expire; sold at about our cost' }

export const CREATOR_SHARE = '85%'

export const PROMISES = [
  'Everything that runs on your device stays free. A paid plan never takes a free capability away.',
  'Your export is complete on every plan, including after you cancel.',
  '30-day refund, no questions asked.',
  'We never promise outcomes. The practice is yours; what happens is real life.',
  'Your words are never sent anywhere without your consent, one item at a time.',
]
