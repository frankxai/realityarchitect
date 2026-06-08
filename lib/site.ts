/**
 * Per-site brand config — the single source of brand truth.
 * This repo IS the website AND the open-source method: humans read the site,
 * agents read the repo. Everything brand-specific lives here; everything else
 * (chassis, components, the Loop) is the method.
 */
export const site = {
  name: 'Reality Architect',
  domain: 'realityarchitect.ai',
  url: 'https://realityarchitect.ai',
  tagline: 'Build the systems that build the life you want.',
  description:
    'Go from AI tool-user to system-builder. The open method for designing agents, automations, and income loops that compound — the operating system, given away free.',
  author: 'Frank',
  github: 'https://github.com/frankxai/realityarchitect',
  // The proof layer — this method, already applied. Humans see it works before they build.
  network: [
    { name: 'frankx.ai', url: 'https://frankx.ai', blurb: 'The architect behind it — enterprise AI, 12k songs, 36 shipped repos.' },
    { name: 'Agentic Income', url: 'https://agenticincome.ai', blurb: 'The method applied to money — income systems running on agents.' },
  ],
  nav: [
    { label: 'The Method', href: '/method' },
    { label: 'Assess', href: '/assess' },
    { label: 'Start', href: '/start' },
    { label: 'Vault', href: '/vault' },
  ],
  // The premium layer — open-core. The method is free; the tuned, private systems are paid.
  // Edit prices/tiers here; the /vault page is fully data-driven from this block.
  vault: {
    headline: 'The method is free. The systems aren’t.',
    sub:
      'The free starter gives you the map and the templates. The Vault is where the tuned, production systems live — the prompts that actually convert, the income loops with real numbers, and the room where your build gets reviewed. Private for a reason.',
    // Why some things stay private — the honest mechanism, not mystique.
    whyPrivate: [
      { t: 'Edge-decay', d: 'The configs that make money get arbitraged away the moment they’re public. They’re worth more because they’re not.' },
      { t: 'Real numbers', d: 'Actual revenue, analytics, and client teardowns can’t live on a public site. Inside, you see the receipts.' },
      { t: 'Access that can’t scale free', d: 'My eyes on your build, the cohort, first access to new loops. It costs because it’s time, not files.' },
    ],
    tiers: [
      {
        name: 'Starter Pack', price: '€49', cadence: 'one-time', highlight: false,
        for: 'You’ve run the assessment and want to build faster.',
        includes: ['Every starter template, tuned (not sanitized)', 'The build-order checklists for all five moves', 'The prompt library behind each agent'],
        cta: 'Get the pack',
      },
      {
        name: 'The Vault', price: '€497', cadence: 'one-time', highlight: true,
        for: 'You want the systems that actually run my income and content.',
        includes: ['Private repo: the full production system library', 'Real-numbers teardowns of live loops', 'The learning-layer wiring (Compound, done for real)', 'Cohort + a review of your own build'],
        cta: 'Get the Vault',
      },
      {
        name: 'Inner Room', price: '€2,997', cadence: 'per quarter', highlight: false,
        for: 'You’re building at scale and want me in the loop.',
        includes: ['Everything in the Vault, kept current', 'First access to new systems before they ship', 'Direct review of your architecture', 'The private guild of architects'],
        cta: 'Apply to join',
      },
    ],
  },
} as const

export type Site = typeof site
