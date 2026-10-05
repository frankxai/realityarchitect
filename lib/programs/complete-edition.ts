/**
 * The paid Complete Edition of the free 30-day program. Opening it is Frank's button: set `checkoutUrl` to the Polar
 * hosted checkout link of the live product, then `open: true`. Until both are set the page shows no price, is not
 * indexed, and links to nothing that takes money (tests/programs-edition.test.mjs holds this).
 */

export type Edition = {
  open: boolean
  checkoutUrl: string
  price: number
  currency: 'USD'
  refundDays: number
  narration: string
  contents: { title: string; detail: string }[]
}

export const COMPLETE_EDITION: Edition = {
  open: false,
  checkoutUrl: '',
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
export function isPolarCheckout(link: string): boolean {
  let url: URL
  try {
    url = new URL(link)
  } catch {
    return false
  }
  return url.protocol === 'https:' && url.hostname === 'buy.polar.sh' && url.port === '' && !url.username && !url.password && !url.hash && /^\/polar_cl_[A-Za-z0-9]+$/.test(url.pathname)
}

/** Open only when Frank has opened it and the link goes to Polar's hosted checkout. */
export function isOpen(edition: Edition = COMPLETE_EDITION): boolean {
  return edition.open && isPolarCheckout(edition.checkoutUrl)
}

export function priceLabel(edition: Edition = COMPLETE_EDITION): string {
  return `$${edition.price}`
}
