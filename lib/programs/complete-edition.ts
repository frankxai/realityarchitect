/**
 * The paid Complete Edition of the free 30-day program. Opening it is Frank's button: set `checkoutUrl` to the Polar
 * hosted checkout link of the live product, `portalUrl` to the organization's Polar customer portal, `supportEmail` to
 * a real inbox, then `open: true`. Until all four are set the page shows no price, is not indexed, and links to nothing
 * that takes money (tests/programs-edition.test.mjs holds this). `node scripts/check-edition-launch.mjs` lists what is
 * still missing. docs/strategy/POLAR-COMPLETE-EDITION.md has the Polar side.
 */

export type Edition = {
  open: boolean
  checkoutUrl: string
  /** Where a buyer downloads the files again and asks for a refund: https://polar.sh/<org-slug>/portal */
  portalUrl: string
  supportEmail: string
  price: number
  currency: 'USD'
  refundDays: number
  narration: string
  contents: { title: string; detail: string }[]
}

export const COMPLETE_EDITION: Edition = {
  open: false,
  checkoutUrl: '',
  portalUrl: '',
  supportEmail: '',
  price: 39,
  currency: 'USD',
  refundDays: 30,
  narration:
    'The narration is a synthesized voice made with ElevenLabs. The orientation track says so aloud, and every file is labeled. The music is original.',
  contents: [
    {
      title: 'Guided rehearsal audio',
      detail:
        'Fourteen tracks, about 75 minutes: an orientation, one rehearsal for each week, seven short morning sets, the evening witness, and the snapshot ritual. Pauses are left for your own words.',
    },
    {
      title: 'The Honest Canon',
      detail:
        'The companion book, as PDF and EPUB: Reality Theory and the works of the Library, each taught as what to keep, the mechanism underneath, and the limits.',
    },
    {
      title: 'The 30-day journal',
      detail: 'A printable page for every day: the intent, the look-for, and the evening witness with a place to count the misses.',
    },
    {
      title: 'The vault for Obsidian',
      detail:
        'The thirty days, the templates for reality.md, soul.md and the witness ledger, and a vision board canvas, ready to open on your computer and your phone.',
    },
    {
      title: 'Every update',
      detail: 'New tracks and new editions of the book come to you at no cost.',
    },
  ],
}

/**
 * A Polar hosted checkout link and nothing else: https, the buy.polar.sh host, a /polar_cl_<id> path, no credentials,
 * port or fragment. Any query is allowed, since it carries a discount code or campaign metadata
 * (?discount_code=LAUNCH&utm_campaign=fall+launch).
 */
function isPolarCheckout(link: string): boolean {
  let url: URL
  try {
    url = new URL(link)
  } catch {
    return false
  }
  return url.protocol === 'https:' && url.hostname === 'buy.polar.sh' && url.port === '' && !url.username && !url.password && !url.hash && /^\/polar_cl_[A-Za-z0-9]+$/.test(url.pathname)
}

/** Polar's customer portal for one organization: https://polar.sh/<slug>/portal, nothing else. */
function isPolarPortal(link: string): boolean {
  let url: URL
  try {
    url = new URL(link)
  } catch {
    return false
  }
  return url.protocol === 'https:' && url.hostname === 'polar.sh' && url.port === '' && !url.username && !url.password && !url.hash && !url.search && /^\/[a-z0-9][a-z0-9-]*\/portal$/.test(url.pathname)
}

function isEmail(value: string): boolean {
  return /^[^\s@<>"']+@[^\s@<>"']+\.[a-z]{2,}$/i.test(value)
}

/** Everything that must be true before a buyer can pay and get the files, as plain sentences. Empty means ready. */
export function launchGaps(edition: Edition = COMPLETE_EDITION): string[] {
  const gaps: string[] = []
  if (!isPolarCheckout(edition.checkoutUrl)) gaps.push('checkoutUrl is not a Polar hosted checkout link (https://buy.polar.sh/polar_cl_…)')
  if (!isPolarPortal(edition.portalUrl)) gaps.push('portalUrl is not a Polar customer portal (https://polar.sh/<org-slug>/portal)')
  if (!isEmail(edition.supportEmail)) gaps.push('supportEmail is not an email address')
  return gaps
}

/** Open only when Frank has opened it and a buyer can pay, download and reach a person. */
export function isOpen(edition: Edition = COMPLETE_EDITION): boolean {
  return edition.open && launchGaps(edition).length === 0
}

export function priceLabel(edition: Edition = COMPLETE_EDITION): string {
  return `$${edition.price}`
}

/** Where Polar sends a buyer after a successful payment. Set it as the checkout link's success URL. */
export const THANKS_PATH = '/programs/imaginal-30/complete/thanks'

/** The files the buyer receives, in the order the thanks page and the email list them. */
export const FILES = [
  { name: 'Guided rehearsal audio', formats: 'MP3 (zip) and a chaptered M4B audiobook' },
  { name: 'The Honest Canon', formats: 'EPUB and PDF' },
  { name: 'The 30-day journal', formats: 'PDF, A4 and US Letter' },
  { name: 'The vault for Obsidian', formats: 'zip, with the audio and a listening plan' },
  { name: 'Licence', formats: 'LICENSE.txt, personal use' },
] as const

/**
 * The confirmation a buyer reads after paying. Polar sends the receipt and the download email itself; this text goes
 * into the product's File Downloads benefit description and is the reply template for "where are my files?". The thanks
 * page renders the same steps, so the site and the email never disagree.
 */
export function confirmationEmail(edition: Edition = COMPLETE_EDITION): { subject: string; body: string } {
  const files = FILES.map((file) => `- ${file.name}: ${file.formats}`).join('\n')
  return {
    subject: 'Your Complete Edition of The Imaginal Act',
    body: [
      'Thank you for buying the Complete Edition of The Imaginal Act.',
      '',
      'Your files:',
      files,
      '',
      `Download them any time from your Polar portal: ${edition.portalUrl || '<portalUrl>'}`,
      'Sign in with the email you used at checkout. Each link is personal to you, so please do not forward it.',
      '',
      'Where to start: open the orientation track, then day 1 of the program at https://www.realityarchitect.ai/programs/imaginal-30/1.',
      'The vault opens in Obsidian on a computer or a phone. Print the journal at 100%.',
      '',
      `Every update comes to the same portal at no cost. If the edition is not for you, a refund within ${edition.refundDays} days needs no reason: reply to your receipt or write to ${edition.supportEmail || '<supportEmail>'}.`,
      '',
      'The narration is a synthesized voice; the music is original. This is a practice of attention and rehearsal. It is not medical, psychological or financial advice, and it promises no outcome.',
      '',
      'Frank, Reality Architect',
    ].join('\n'),
  }
}
