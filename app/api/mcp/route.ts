import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'
import {
  read,
  surface,
  propose,
  guard,
  buildLogAppend,
  SECTIONS,
  LOOP,
} from '@/lib/reality'

/**
 * The reality.md MCP server — a stateless, sovereign implementation of the
 * standard's five protocol verbs, callable from any MCP client (Claude, Cursor,
 * ChatGPT, VS Code, …).
 *
 * Sovereignty by construction: this server keeps no database and writes no
 * files. The client passes the reality.md content in with each call and gets
 * structured guidance back. The file never leaves the user's control, and
 * .reality/ appends are returned as text for the client to write — the server
 * only proposes, it never persists.
 *
 * Spec: https://www.realityarchitect.ai/standard
 */

// A fenced JSON block keeps every response readable by a human AND parseable by
// an agent, without declaring an outputSchema that older clients may not honor.
function reply(headline: string, data: unknown) {
  return {
    content: [
      {
        type: 'text' as const,
        text: `${headline}\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``,
      },
    ],
  }
}

const contentArg = z
  .string()
  .min(1)
  .describe('The full text of the user\'s reality.md file. Passed in by the client; never stored by the server.')

const handler = createMcpHandler(
  (server) => {
    // READ — load a reality.md, validate it against the spec, report the gaps.
    server.registerTool(
      'reality_read',
      {
        title: 'Read reality.md',
        description:
          'READ verb. Parse a reality.md file, validate it against the v0.1 spec, and report who it belongs to, ' +
          'which of the eight sections are filled, and which are empty. Call this first, before acting on the ' +
          'human\'s behalf. Empty sections are gaps, in Architect\'s Loop order.',
        inputSchema: { content: contentArg },
      },
      async ({ content }) => {
        const report = read(content)
        return reply(report.summary, {
          name: report.parsed.name,
          frontmatter: report.parsed.frontmatter,
          valid: report.parsed.valid,
          issues: report.parsed.issues,
          filledSections: SECTIONS.map((s) => s.key).filter((k) => !report.parsed.emptySections.includes(k)),
          emptySections: report.parsed.emptySections,
          gaps: report.gaps,
        })
      },
    )

    // SURFACE — filter incoming items against Attention rules and Aims.
    server.registerTool(
      'reality_surface',
      {
        title: 'Surface signal, mute noise',
        description:
          'SURFACE verb. Given a list of incoming items (messages, links, tasks, headlines), classify each as ' +
          'surface, mute, or unclear against the file\'s Attention rules and active Aims. Mute wins ties; unclear ' +
          'items are left for the human to triage — the filter never guesses.',
        inputSchema: {
          content: contentArg,
          inputs: z.array(z.string()).min(1).describe('The incoming items to triage against the filter.'),
        },
      },
      async ({ content, inputs }) => {
        const report = read(content)
        const results = surface(report.parsed, inputs)
        const counts = {
          surface: results.filter((r) => r.verdict === 'surface').length,
          mute: results.filter((r) => r.verdict === 'mute').length,
          unclear: results.filter((r) => r.verdict === 'unclear').length,
        }
        return reply(
          `Triaged ${inputs.length} item(s): ${counts.surface} to surface, ${counts.mute} muted, ${counts.unclear} left for you.`,
          { results, counts },
        )
      },
    )

    // PROPOSE — name the first gap in the Loop and the smallest next artifact.
    server.registerTool(
      'reality_propose',
      {
        title: 'Propose the smallest next artifact',
        description:
          'PROPOSE verb. Find the first move of the Architect\'s Loop that is not yet in place (its backing ' +
          'section is empty) and name the single smallest buildable artifact that moves it forward. Never a ' +
          'lecture, never a later move before an earlier one holds.',
        inputSchema: {
          content: contentArg,
          situation: z
            .string()
            .optional()
            .describe('Optional: what the human is facing right now, to ground the proposal.'),
        },
      },
      async ({ content, situation }) => {
        const report = read(content)
        const proposal = propose(report.parsed, situation)
        return reply(
          proposal.allSectionsFilled
            ? 'All sections are filled. The next artifact is the next turn of the Compound loop.'
            : `Your gap is the "${proposal.gapMove}" move. Smallest next artifact: ${proposal.artifact}.`,
          proposal,
        )
      },
    )

    // GUARD — check a proposed action against guardrails and standing rules.
    server.registerTool(
      'reality_guard',
      {
        title: 'Guard against a violating action',
        description:
          'GUARD verb. Check a proposed action against the file\'s Guardrails plus the standard\'s two standing ' +
          'rules: never spend, send, publish, or delete without asking, and never propose belief or ' +
          'visualization as the mechanism — every recommendation must cash out in a buildable artifact. Returns ' +
          'allow, ask, or refuse.',
        inputSchema: {
          content: contentArg,
          action: z.string().min(1).describe('The action the agent is about to take on the human\'s behalf.'),
        },
      },
      async ({ content, action }) => {
        const report = read(content)
        const decision = guard(report.parsed, action)
        return reply(`Decision: ${decision.decision.toUpperCase()}. ${decision.reason}`, decision)
      },
    )

    // LOG — return a ready-to-append block for .reality/ (server writes nothing).
    server.registerTool(
      'reality_log',
      {
        title: 'Build a .reality/ log append',
        description:
          'LOG verb. Produce a ready-to-append block and the canonical .reality/ path for an outcome — a shipped ' +
          'win (evidence), a review entry (log), or aim progress (aim). The server writes nothing; the client, ' +
          'which owns .reality/, performs the append. Never log silently — tell the human what you recorded.',
        inputSchema: {
          target: z.enum(['evidence', 'review', 'aim']).describe('Where the entry belongs in .reality/.'),
          summary: z.string().min(1).describe('One-line summary of what happened.'),
          detail: z.string().optional().describe('Optional supporting detail.'),
          slug: z.string().optional().describe('For target "aim": the aim slug, e.g. "template-store".'),
        },
      },
      async ({ target, summary, detail, slug }) => {
        const append = buildLogAppend({ target, summary, detail, slug })
        return reply(`Append this to ${append.path}. ${append.note}`, append)
      },
    )

    // Resource: the standard itself, so a client can pull the spec on demand.
    server.registerResource(
      'reality-md-spec',
      'reality://spec',
      {
        title: 'The reality.md standard (v0.1)',
        description: 'The eight sections, the five verbs, and the spec rules.',
        mimeType: 'text/markdown',
      },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/markdown',
            text: SPEC_SUMMARY,
          },
        ],
      }),
    )

    // Resource: the blank template, ready to scaffold a new file.
    server.registerResource(
      'reality-md-template',
      'reality://template',
      {
        title: 'reality.md blank template',
        description: 'A blank reality.md the user can fill in — empty sections are meaningful.',
        mimeType: 'text/markdown',
      },
      async (uri) => ({
        contents: [{ uri: uri.href, mimeType: 'text/markdown', text: TEMPLATE }],
      }),
    )

    // Prompt: bootstrap a first reality.md by interview.
    server.registerPrompt(
      'bootstrap-reality-md',
      {
        title: 'Bootstrap my reality.md',
        description:
          'A guided prompt that helps the user draft a first reality.md — filling only what they know and leaving ' +
          'the rest empty, because an empty section is a found gap.',
        argsSchema: {
          name: z.string().optional().describe('The user\'s name for the file header.'),
        },
      },
      ({ name }) => ({
        messages: [
          {
            role: 'user' as const,
            content: {
              type: 'text' as const,
              text:
                `Help me draft a reality.md${name ? ` for ${name}` : ''} following the v0.1 standard. ` +
                `Read the reality://spec and reality://template resources first. Interview me one section at a ` +
                `time in Loop order (Attention and State, then Aims, then Systems, then Environment, then ` +
                `Feedback), plus Identity and Guardrails. Keep the whole file under 150 lines. Do not invent ` +
                `content — if I do not have an answer for a section, leave it empty and note it as my current gap. ` +
                `When done, output the complete file in a single markdown code block.`,
            },
          },
        ],
      }),
    )
  },
  {
    serverInfo: { name: 'reality-md', version: '0.1.0' },
    instructions:
      'This server implements the reality.md standard (https://www.realityarchitect.ai/standard). Call reality_read ' +
      'first to load and validate the user\'s file, then use surface / propose / guard / log for the other verbs. ' +
      'The server is stateless: pass the reality.md content with each call. It never stores or transmits the file.',
  },
)

// Node runtime — the MCP handler is not edge-compatible.
export const runtime = 'nodejs'
export const maxDuration = 60

export { handler as GET, handler as POST, handler as DELETE }

// --- Static payloads for the resources (kept inline so the route is self-contained) ---

const SPEC_SUMMARY = `# The reality.md standard — v0.1

One file in your home directory that tells any AI agent who you are and what you are building.

\`\`\`
~/reality.md   the contract — you write it, agents read it
~/.reality/    the state — agents maintain it, you review it
\`\`\`

## The eight sections (each a lever on the outcome chain)
${SECTIONS.map((s) => `- **${s.key}**${s.move ? ` (${s.move})` : ''} — ${s.blurb}`).join('\n')}

## The Architect's Loop (moves are ordered and dependent)
${LOOP.map((l, i) => `${i + 1}. **${l.move}** — backed by ${l.sections.join(' + ')}. Artifact: ${l.artifact}.`).join('\n')}

## The five verbs
- **READ** — load reality.md before acting; goals, guardrails, and state come first.
- **SURFACE** — filter inputs against Aims and Attention; signal forward, noise muted.
- **PROPOSE** — recommend the smallest next artifact consistent with Identity; never a lecture.
- **LOG** — append outcomes to .reality/; wins to evidence.md, reviews to log/, never silently.
- **GUARD** — refuse anything that violates Guardrails; every claim cashes out in a buildable artifact.

## Spec rules
- Location: ~/reality.md (canonical), ~/.reality/ for state.
- Format: markdown + YAML frontmatter (standard: reality.md, version).
- Size: target ≤150 lines. Depth goes in .reality/.
- Authorship: the human owns reality.md; agents propose edits, never apply them unasked. Agents own .reality/ appends.
- Privacy: private by default. Never commit to a public repo; never send to a service without explicit consent.
- License: MIT.`

const TEMPLATE = `---
standard: reality.md
version: "0.1"
updated: YYYY-MM-DD
---
# reality.md — <your name>

## Identity
- I am someone who …

## Aims
- **<aim>** — done when <verifiable result>, by <date>.
  - if <trigger>, then I <action>

## Attention
- Surface: …
- Mute: …

## State
- Sleep: …
- Deep work window: …
- Non-negotiable: …

## Systems
- …

## Environment
- …

## Feedback
- Review: <daily/weekly>, <when>. Log to .reality/log/.
- Metrics that count: …

## Guardrails
- Never spend money, send messages, or publish publicly without asking.
- Never propose belief or visualization as the mechanism — every recommendation ends in an artifact.

## Agent protocol
You are an agent reading my reality.md. Follow the standard's five verbs:
READ this file before acting for me · SURFACE what matches my Aims and Attention ·
PROPOSE the smallest next action that votes for my Identity · LOG outcomes to .reality/ ·
GUARD the guardrails above without exception.`
