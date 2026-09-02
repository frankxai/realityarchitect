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
    { label: 'reality.md', href: '/standard' },
    { label: 'Assess', href: '/assess' },
    { label: 'Start', href: '/start' },
    { label: 'Vault', href: '/vault' },
  ],
  // The premium layer. Concept stage, ungated, no checkout — the product row lives in
  // data/products.json, mirrored from the estate registry. Nothing here may state a price:
  // the price hypothesis is what the waitlist question is for, and the answer is not in yet.
  vault: {
    productId: 'realityarchitect-vault',
    headline: 'The method is free. It stays free.',
    sub:
      'The Vault is the other half — filled contracts rather than a blank template, the loops with their real numbers attached, and the wiring for the learning layer that the free method only describes. It is not built, there is nothing to buy, and this page will say so until that changes.',
    // What is actually in scope, written as things that can exist or not exist.
    contents: [
      { t: 'Filled contracts', d: 'A dozen real reality.md files from people running different kinds of work, with the reasoning behind each section.' },
      { t: 'Loops with their numbers', d: 'The automations, with what they cost to run and what they actually returned. Not a case study — the config and the ledger.' },
      { t: 'The Compound wiring', d: 'The part the free method describes and does not hand you: the feedback layer, built, with its failure modes.' },
    ],
    // Stated because a waitlist that promises nothing specific measures nothing.
    founding: 'Lifetime access to every future revision, a name in the founders file, and a vote on the v1 spec.',
    milestone: 'At 100 people on the list, reality.md v1.0 is ratified and published as an open spec.',
  },
} as const

export type Site = typeof site
