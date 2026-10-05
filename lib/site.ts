/**
 * Per-site brand config — the single source of brand truth.
 * This repo IS the website AND the open-source method: humans read the site,
 * agents read the repo. Everything brand-specific lives here; everything else
 * (chassis, components, the Loop) is the method.
 */
export const site = {
  name: 'Reality Architect',
  domain: 'realityarchitect.ai',
  url: 'https://www.realityarchitect.ai',
  tagline: 'Imagine it. Build it. Witness it.',
  // The hero sets the last part in the dawn register: the person's own witnessing, not the system's claim.
  taglineParts: ['Imagine it. Build it.', 'Witness it.'],
  description:
    'The open practice for architecting a life: author the scene you are building toward, bridge to it with skills, systems, reps and bold moves, and keep an honest record of what happens. Local-first, exported as Markdown you own.',
  author: 'Frank',
  updatedAt: '2026-10-04',
  github: 'https://github.com/frankxai/realityarchitect',
  // The proof layer — this method, already applied. Humans see it works before they build.
  network: [
    { name: 'FrankX', url: 'https://frankx.ai', blurb: 'Creator and founder systems, implementation work, and the person behind the method.' },
    { name: 'Agentic Income', url: 'https://agenticincome.ai', blurb: 'A separate editorial/product system focused on AI-enabled income workflows.' },
  ],
  nav: [
    { label: 'The Method', href: '/method' },
    { label: 'Studio', href: '/studio' },
    { label: 'Library', href: '/library' },
    { label: 'reality.md', href: '/standard' },
    { label: 'Assess', href: '/assess' },
    { label: 'Apply', href: '/apply' },
    { label: 'Start', href: '/start' },
    { label: 'Vault', href: '/vault' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Privacy', href: '/privacy' },
  ],
  vault: {
    status: 'not-open-for-purchase',
    publicBoundary: 'The method, assessment, architecture brief, standard, and sanitized starter templates remain public and complete.',
    privateBoundary: 'Private operating configurations, confidential evidence, customer material, and guided review work remain outside the public repository.',
  },
} as const

// A page-level openGraph replaces the layout's, and with it the file-based card image, so each route names it.
export const ogImage = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: `${site.name} — ${site.tagline}`,
}

export type Site = typeof site
