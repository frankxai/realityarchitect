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
  tagline: 'Find the system gap. Build the next artifact.',
  description:
    'An open five-move method, local system-gap assessment, and exportable architecture brief for building dependable AI workflows.',
  author: 'Frank',
  updatedAt: '2026-07-10',
  github: 'https://github.com/frankxai/realityarchitect',
  // The proof layer — this method, already applied. Humans see it works before they build.
  network: [
    { name: 'FrankX', url: 'https://frankx.ai', blurb: 'Creator and founder systems, implementation work, and the person behind the method.' },
    { name: 'Agentic Income', url: 'https://agenticincome.ai', blurb: 'A separate editorial/product system focused on AI-enabled income workflows.' },
  ],
  nav: [
    { label: 'The Method', href: '/method' },
    { label: 'reality.md', href: '/standard' },
    { label: 'Assess', href: '/assess' },
    { label: 'Start', href: '/start' },
    { label: 'Vault', href: '/vault' },
    { label: 'Privacy', href: '/privacy' },
  ],
  vault: {
    status: 'not-open-for-purchase',
    publicBoundary: 'The method, assessment, architecture brief, standard, and sanitized starter templates remain public and complete.',
    privateBoundary: 'Private operating configurations, confidential evidence, customer material, and guided review work remain outside the public repository.',
  },
} as const

export type Site = typeof site
