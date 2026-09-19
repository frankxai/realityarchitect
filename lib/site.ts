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
    'The open platform for building AI systems you own — a five-move method, the reality.md memory standard your agents read, forkable skill packs, and a live MCP server.',
  author: 'Frank',
  updatedAt: '2026-07-10',
  github: 'https://github.com/frankxai/realityarchitect',
  // The proof layer — this method, already applied. Humans see it works before they build.
  network: [
    { name: 'FrankX', url: 'https://frankx.ai', blurb: 'Creator and founder systems, implementation work, and the person behind the method.' },
    { name: 'Agentic Income', url: 'https://agenticincome.ai', blurb: 'A separate editorial/product system focused on AI-enabled income workflows.' },
  ],
  // Primary nav — the platform, ordered by the journey. Secondary links live in the footer.
  nav: [
    { label: 'The Method', href: '/method' },
    { label: 'reality.md', href: '/standard' },
    { label: 'Skill Packs', href: '/skills' },
    { label: 'MCP', href: '/mcp' },
    { label: 'Assess', href: '/assess' },
  ],
  // Footer sitemap — grouped so every surface stays one click away.
  footerNav: [
    {
      title: 'Platform',
      links: [
        { label: 'The Method', href: '/method' },
        { label: 'reality.md standard', href: '/standard' },
        { label: 'Skill Packs', href: '/skills' },
        { label: 'MCP server', href: '/mcp' },
      ],
    },
    {
      title: 'Get started',
      links: [
        { label: 'Run the assessment', href: '/assess' },
        { label: 'Start here', href: '/start' },
        { label: 'Apply for a review', href: '/apply' },
        { label: 'Implementation options', href: '/vault' },
      ],
    },
    {
      title: 'Project',
      links: [
        { label: 'Privacy & data boundary', href: '/privacy' },
      ],
    },
  ],
  vault: {
    status: 'not-open-for-purchase',
    publicBoundary: 'The method, assessment, architecture brief, standard, and sanitized starter templates remain public and complete.',
    privateBoundary: 'Private operating configurations, confidential evidence, customer material, and guided review work remain outside the public repository.',
  },
} as const

export type Site = typeof site
