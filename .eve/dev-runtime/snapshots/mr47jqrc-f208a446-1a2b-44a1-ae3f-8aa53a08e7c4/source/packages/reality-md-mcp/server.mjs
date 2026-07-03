#!/usr/bin/env node
/**
 * reality-md-mcp — the MCP server for the reality.md standard.
 *
 * reality.md is to a person what AGENTS.md is to a repo: the one file an AI
 * agent reads before acting on your behalf. This server gives any MCP client
 * (Claude Code, Claude Desktop, Cursor, ...) read/write access to yours.
 *
 * The file lives at REALITY_MD_PATH, or ~/.reality/reality.md by default.
 * Generate your first one at https://realityarchitect.ai/architect
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { homedir } from 'node:os'

const REALITY_PATH = process.env.REALITY_MD_PATH ?? join(homedir(), '.reality', 'reality.md')

const TEMPLATE = `# reality.md

> The file my agents read before they act.
> Generate a personalized one at https://realityarchitect.ai/architect

## Who I am
<!-- What you do, what you're building toward. -->

## Current stack
<!-- Your AI tools and how you use them. -->

## Next build (this month)
<!-- The ONE system you're building first. -->

## Rules for my agents
- <!-- Voice, constraints, what never to automate. -->
`

async function readReality() {
  if (!existsSync(REALITY_PATH)) return null
  return readFile(REALITY_PATH, 'utf8')
}

async function writeReality(content) {
  await mkdir(dirname(REALITY_PATH), { recursive: true })
  await writeFile(REALITY_PATH, content, 'utf8')
}

const server = new McpServer({ name: 'reality-md', version: '0.1.0' })

server.registerTool(
  'read_reality',
  {
    description:
      'Read the user\'s reality.md — their identity, stack, goals, current build, and rules for agents. Call this before acting on the user\'s behalf so your work fits their systems.',
    inputSchema: {},
  },
  async () => {
    const content = await readReality()
    if (content === null) {
      return {
        content: [
          {
            type: 'text',
            text: `No reality.md found at ${REALITY_PATH}. Offer to create one with init_reality, or point the user to https://realityarchitect.ai/architect to generate a personalized one.`,
          },
        ],
      }
    }
    return { content: [{ type: 'text', text: content }] }
  },
)

server.registerTool(
  'init_reality',
  {
    description:
      'Create the user\'s reality.md from the standard template (or provided content). Fails if one already exists — use update_section or replace_reality to change an existing file.',
    inputSchema: {
      content: z.string().optional().describe('Full reality.md content. Omit to use the standard template.'),
    },
  },
  async ({ content }) => {
    if (existsSync(REALITY_PATH)) {
      return { content: [{ type: 'text', text: `reality.md already exists at ${REALITY_PATH}.` }], isError: true }
    }
    await writeReality(content ?? TEMPLATE)
    return { content: [{ type: 'text', text: `Created reality.md at ${REALITY_PATH}.` }] }
  },
)

server.registerTool(
  'update_section',
  {
    description:
      'Replace the body of one "## Section" in reality.md, keeping the rest of the file intact. Use for surgical updates like changing "Next build" when the user ships something.',
    inputSchema: {
      section: z.string().min(1).describe('Exact section heading text, without the leading "## "'),
      body: z.string().describe('New body for the section (markdown, without the heading line)'),
    },
  },
  async ({ section, body }) => {
    const content = await readReality()
    if (content === null) {
      return { content: [{ type: 'text', text: `No reality.md at ${REALITY_PATH}. Run init_reality first.` }], isError: true }
    }
    const lines = content.split('\n')
    const start = lines.findIndex((l) => l.trim() === `## ${section}`)
    if (start === -1) {
      const sections = lines.filter((l) => l.startsWith('## ')).map((l) => l.slice(3)).join(', ')
      return {
        content: [{ type: 'text', text: `Section "${section}" not found. Available sections: ${sections || '(none)'}` }],
        isError: true,
      }
    }
    let end = lines.length
    for (let i = start + 1; i < lines.length; i++) {
      if (lines[i].startsWith('## ')) {
        end = i
        break
      }
    }
    const next = [...lines.slice(0, start + 1), body.trimEnd(), '', ...lines.slice(end)]
    await writeReality(next.join('\n'))
    return { content: [{ type: 'text', text: `Updated "## ${section}" in ${REALITY_PATH}.` }] }
  },
)

server.registerTool(
  'replace_reality',
  {
    description:
      'Overwrite the entire reality.md with new content. Use only when the user explicitly asks for a rewrite; prefer update_section for incremental changes.',
    inputSchema: {
      content: z.string().min(10).describe('The complete new reality.md content'),
    },
  },
  async ({ content }) => {
    await writeReality(content)
    return { content: [{ type: 'text', text: `Replaced reality.md at ${REALITY_PATH}.` }] }
  },
)

const transport = new StdioServerTransport()
await server.connect(transport)
