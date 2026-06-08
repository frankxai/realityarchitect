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
  ],
} as const

export type Site = typeof site
