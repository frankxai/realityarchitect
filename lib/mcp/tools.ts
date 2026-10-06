import fs from 'node:fs'
import path from 'node:path'
import { READ_ONLY, ToolError, libraryEntryText, searchLibrary } from '../../plugins/reality-architect/mcp/core.mjs'
import { LOOPS } from '../../plugins/reality-architect/engine/loops.mjs'
import { checkSkill, libraryTeacherNames } from '../../plugins/reality-architect/engine/skill-check.mjs'
import { parseInline, plainText, type Block, type Inline } from '../programs/markdown.ts'
import { DAYS, WEEKS, readDay } from '../programs/imaginal-30.ts'
import { site } from '../site.ts'

/**
 * The four tools of the public, read-only MCP endpoint (/api/mcp). They serve only the site's own public content: the
 * Library, the free 30-day program, the practice loops, and the skill bar applied to the published skills. No tool
 * reads a person's files, accepts a person's practice, stores anything, calls a model, or reaches the network
 * (ADR-003, "the one hosted surface"). A person's own practice stays in their own agent, through the local stdio
 * server in the plugin.
 *
 * Every source is read where it already lives: the Library from the plugin's library.json (generated from
 * lib/library.ts), the days from programs/imaginal-30/ through lib/programs, the loops and the skill bar from the
 * engine. next.config.mjs traces those files into the function.
 */

/** Read at request time from the deployment's files (process.cwd() is the project root, locally and on Vercel). */
const PLUGIN_ROOT = path.join(process.cwd(), 'plugins', 'reality-architect')
const SKILLS_DIR = path.join(PLUGIN_ROOT, 'skills')

type Prop =
  | { type: 'string'; description: string; maxLength: number; pattern?: string; enum?: readonly string[] }
  | { type: 'integer'; description: string; minimum: number; maximum: number }
type InputSchema = { type: 'object'; properties: Record<string, Prop>; required?: string[]; additionalProperties: false }
type Result = { text: string; data: Record<string, unknown> }

type LibraryEntry = { id: string; name: string; shelf: string; [key: string]: unknown }
type Library = { entries: LibraryEntry[] }

let library: Library | undefined
function loadLibrary(): Library {
  library ??= JSON.parse(fs.readFileSync(path.join(SKILLS_DIR, 'reality-library', 'library.json'), 'utf8')) as Library
  return library
}

// ---------------------------------------------------------------- arguments

/**
 * Checks arguments against a tool's declared input schema, so the bounds a client sees in tools/list are the bounds the
 * server enforces. A problem is a tool result with isError (the agent can fix it); values are never echoed back.
 */
export function checkArgs(schema: InputSchema, args: Record<string, unknown>): void {
  const names = Object.keys(schema.properties)
  for (const key of Object.keys(args)) {
    if (!Object.prototype.hasOwnProperty.call(schema.properties, key)) {
      throw new ToolError(`Unknown argument ${JSON.stringify(key.slice(0, 40))}. ${names.length ? `This tool takes: ${names.join(', ')}.` : 'This tool takes no arguments.'}`)
    }
  }
  for (const key of schema.required ?? []) if (args[key] === undefined) throw new ToolError(`${key} is required.`)
  for (const [key, prop] of Object.entries(schema.properties)) {
    const value = args[key]
    if (value === undefined) continue
    if (prop.type === 'integer') {
      if (typeof value !== 'number' || !Number.isInteger(value) || value < prop.minimum || value > prop.maximum) throw new ToolError(`${key} must be a whole number from ${prop.minimum} to ${prop.maximum}.`)
      continue
    }
    if (typeof value !== 'string') throw new ToolError(`${key} must be a string.`)
    if (Array.from(value).length > prop.maxLength) throw new ToolError(`${key} must be at most ${prop.maxLength} characters.`)
    if (prop.enum && !prop.enum.includes(value)) throw new ToolError(`${key} must be one of: ${prop.enum.join(', ')}.`)
    if (prop.pattern && !new RegExp(prop.pattern, 'u').test(value)) throw new ToolError(`${key} is not in the expected form.`)
  }
}

// ---------------------------------------------------------------- library_search

/** Full entries per answer; past this, the rest are listed by id so a broad query stays a reasonable size. */
export const LIBRARY_PAGE = 8

function librarySearch(args: Record<string, unknown>): Result {
  const url = `${site.url}/library`
  const legend = `The Library on the site: ${url}. Keep (meaning) is a contemplative lens; Mechanism is the studied pathway; Limits says what is not claimed.`
  const all = loadLibrary().entries
  if (!args.query && !args.id) {
    // No search: an index to choose from, not every entry in full.
    const index = all.map((entry) => ({ id: entry.id, name: entry.name, works: entry.works, shelf: entry.shelf }))
    const text = [`The Library holds ${all.length} entries. Fetch one by id, or search by words.`, index.map((entry) => `- ${entry.id}: ${entry.name} — ${entry.works} (${entry.shelf} shelf)`).join('\n'), legend].join('\n\n')
    return { text, data: { index, url } }
  }
  const found = searchLibrary(loadLibrary(), args).data.entries as LibraryEntry[]
  const shown = found.slice(0, LIBRARY_PAGE)
  const more = found.slice(LIBRARY_PAGE).map((entry) => entry.id)
  const text = [
    found.length ? shown.map(libraryEntryText).join('\n\n') : 'No Library entry matches.',
    more.length ? `${more.length} more match: ${more.join(', ')}. Fetch one by id, or add words to narrow the search.` : '',
    legend,
  ]
    .filter(Boolean)
    .join('\n\n')
  return { text, data: { entries: shown, more, url } }
}

// ---------------------------------------------------------------- program_day

const absolute = (href: string) => (href.startsWith('/') ? `${site.url}${href}` : href)

/** Inline Markdown back to Markdown, with site-relative links made absolute (the day files hold no others). */
function inline(text: string): string {
  const walk = (nodes: Inline[]): string =>
    nodes
      .map((node) => {
        if (node.kind === 'text') return node.text
        if (node.kind === 'code') return `\`${node.text}\``
        if (node.kind === 'strong') return `**${walk(node.children)}**`
        if (node.kind === 'em') return `*${walk(node.children)}*`
        return `[${walk(node.children)}](${absolute(node.href)})`
      })
      .join('')
  return walk(parseInline(text))
}

function blockText(block: Block): string {
  if (block.kind === 'heading') return `${'#'.repeat(Math.min(block.level + 1, 4))} ${inline(block.text)}`
  if (block.kind === 'paragraph') return inline(block.text)
  if (block.kind === 'quote') return `> ${inline(block.text)}`
  if (block.kind === 'fence') return `\`\`\`${block.lang}\n${block.text}\n\`\`\``
  return block.items.map((item, index) => `${block.ordered ? `${index + 1}.` : '-'} ${inline(item)}`).join('\n')
}

const REGISTER = /^\*\*(Meaning|Mechanism)\.\*\*\s*([\s\S]*)$/

function programDay(args: Record<string, unknown>): Result {
  const n = args.day as number
  const day = readDay(n)
  const week = WEEKS.find((item) => item.week === day.week)
  const loop = LOOPS.find((item: { id: string }) => item.id === day.loop) as { title: string } | undefined
  const entries = new Map(loadLibrary().entries.map((entry) => [entry.id, entry]))
  // As on the day page: a meaning-shelf entry is shown by its shelf (teachers are named only in the Library, beside
  // their limits); researchers on the mechanism and frontier shelves by name.
  const library = day.library.map((id) => {
    const entry = entries.get(id)
    return { id, label: !entry ? id : entry.shelf === 'meaning' ? 'the meaning shelf' : entry.name, url: `${site.url}/library#${id}` }
  })
  const url = `${site.url}/programs/imaginal-30/${n}`
  const registers: { meaning: string[]; mechanism: string[] } = { meaning: [], mechanism: [] }
  const sections = day.sections.map((section) => {
    for (const block of section.blocks) {
      const match = block.kind === 'paragraph' ? REGISTER.exec(block.text) : null
      if (match) registers[match[1] === 'Meaning' ? 'meaning' : 'mechanism'].push(plainText(match[2]))
    }
    return { title: plainText(section.title), text: section.blocks.map(blockText).join('\n\n') }
  })
  const text = [
    `Day ${n} of ${DAYS} — ${inline(day.title)}`,
    `The Imaginal Act, the free 30-day program · Week ${day.week}${week ? ` (${week.name})` : ''} · ${loop?.title ?? day.loop} · about ${day.minutes} minutes`,
    library.length ? `Library: ${library.map((item) => `${item.label} (${item.url})`).join('; ')}` : '',
    `On the site: ${url}`,
    ...day.intro.map(blockText),
    ...day.sections.map((section, index) => `## ${inline(section.title)}\n\n${sections[index].text}`),
    'Meaning and Mechanism are labeled as on the site: Meaning is a contemplative lens and stays the person’s own; Mechanism is the studied pathway. The person’s words stay with them, in their own notes, the Studio or the Claude Code plugin.',
  ]
    .filter(Boolean)
    .join('\n\n')
  return {
    text,
    data: { day: n, of: DAYS, week: day.week, weekName: week?.name ?? '', title: plainText(day.title), loop: day.loop, minutes: day.minutes, library, url, sections, registers },
  }
}

// ---------------------------------------------------------------- loop_prompts

type Loop = { id: string; title: string; cadence: string; skill: string; steps: string[]; writes: string[]; gate: string; charter: number[] }

function loopText(loop: Loop): string {
  return [
    `${loop.id}: ${loop.title}`,
    `When: ${loop.cadence}`,
    'Steps the agent walks with the person:',
    ...loop.steps.map((step, index) => `  ${index + 1}. ${step}`),
    `May write, only after the person’s yes: ${loop.writes.join('; ')}`,
    `Gate: ${loop.gate} · Skill: ${loop.skill} · Agent Charter articles: ${loop.charter.join(', ')}`,
  ].join('\n')
}

function loopPrompts(args: Record<string, unknown>): Result {
  const loops = (LOOPS as Loop[]).filter((loop) => args.loop === undefined || loop.id === args.loop)
  const text = [
    'The loops of the practice, as the engine defines them. An agent proposes and the person decides: nothing is written or sealed without their yes, and no step claims to cause an event.',
    ...loops.map(loopText),
    'Run them with the person’s own files in their own agent: the Claude Code plugin (reality-loop skill) or the Studio at ' + `${site.url}/studio.`,
  ].join('\n\n')
  return { text, data: { loops } }
}

// ---------------------------------------------------------------- skill_check

const BAR = [
  'Format: an Agent Skills SKILL.md whose kebab-case name matches its folder, with a quoted one-line description under 1,024 characters.',
  'Charter first: the skill tells the agent to read CHARTER.md, the Agent Charter, before acting.',
  'No outcome promises and no causal claims.',
  'No teacher names: those live only in the Library data.',
  'No paths an installed plugin cannot reach.',
  'Asks first: a skill that writes files says it asks before writing.',
]

export function publishedSkills(): string[] {
  return fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
}

function skillCheckTool(args: Record<string, unknown>): Result {
  const published = publishedSkills()
  const skill = args.skill as string | undefined
  if (skill !== undefined && !published.includes(skill)) throw new ToolError(`skill must be one of the published skills: ${published.join(', ')}.`)
  const teacherNames = libraryTeacherNames(PLUGIN_ROOT) as string[]
  // Without the Library's names the teacher-name rule would pass everything, so refuse rather than answer weaker.
  if (!teacherNames.length) throw new Error('The Library data is missing, so the bar cannot be checked.')
  const check = checkSkill as (dir: string, options: { teacherNames: string[] }) => { level: string; message: string }[]
  const results = (skill ? [skill] : published).map((name) => {
    const issues = check(path.join(SKILLS_DIR, name), { teacherNames })
    return { skill: name, passes: !issues.some((issue) => issue.level === 'error'), issues }
  })
  const verdicts = results.map((result) =>
    result.issues.length ? `- ${result.skill}: ${result.passes ? 'passes, with warnings' : 'does not pass'}\n${result.issues.map((issue) => `    ${issue.level}: ${issue.message}`).join('\n')}` : `- ${result.skill}: passes`,
  )
  const text = [
    'The marketplace bar: what a Reality Architect skill must meet before it ships, checked by the engine’s skill-check.',
    BAR.map((rule) => `- ${rule}`).join('\n'),
    `The published skills, checked now (${results.length}):\n${verdicts.join('\n')}`,
    'To check your own skill, run the same check on your machine, so the draft never leaves it: in a clone of https://github.com/frankxai/realityarchitect, run `node plugins/reality-architect/bin/reality.mjs skill-check <your-skill-folder>`.',
  ].join('\n\n')
  return { text, data: { bar: BAR, results } }
}

// ---------------------------------------------------------------- the tool list

const tool = (name: string, title: string, description: string, inputSchema: InputSchema) => ({ name, title, description, inputSchema, annotations: { title, ...READ_ONLY } })

export const PUBLIC_TOOLS = [
  tool(
    'library_search',
    'Search the Library',
    'Reality Theory and the honest canon from the Reality Architect Library: each work with what to keep (meaning), the mechanism it rides on, its limits, and sources. Search by words (up to eight full entries, the rest listed by id), or fetch one entry by id; with neither, an index of every entry.',
    {
      type: 'object',
      properties: {
        query: { type: 'string', maxLength: 200, description: 'Words that must all appear in an entry, e.g. "if-then" or "mental rehearsal".' },
        id: { type: 'string', maxLength: 80, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$', description: 'One entry by its id, e.g. "gollwitzer".' },
      },
      additionalProperties: false,
    },
  ),
  tool(
    'program_day',
    'Program day',
    'One day of The Imaginal Act, the free 30-day program: the intent, the practice, why it works (Meaning and Mechanism, each labeled), and what to record tonight.',
    {
      type: 'object',
      properties: { day: { type: 'integer', minimum: 1, maximum: DAYS, description: `The day, from 1 to ${DAYS}.` } },
      required: ['day'],
      additionalProperties: false,
    },
  ),
  tool(
    'loop_prompts',
    'Loop prompts',
    'The practice loops (morning, evening, weekly, monthly, decisions, pace) as prompts an agent walks with a person: when each is due, its steps, what it may write after the person says yes, and its approval gate.',
    {
      type: 'object',
      properties: { loop: { type: 'string', maxLength: 20, enum: (LOOPS as Loop[]).map((loop) => loop.id), description: 'One loop; omit for all of them.' } },
      additionalProperties: false,
    },
  ),
  tool(
    'skill_check',
    'Skill bar',
    'The marketplace bar every Reality Architect skill must meet (format, the Agent Charter, no outcome promises or causal claims, no teacher names, asking before any write), and the engine’s verdict on each published skill. Your own draft is checked locally, never sent here.',
    {
      type: 'object',
      properties: { skill: { type: 'string', maxLength: 64, pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$', description: 'One published skill, e.g. "reality-daily"; omit for all of them.' } },
      additionalProperties: false,
    },
  ),
]

const RUN: Record<string, (args: Record<string, unknown>) => Result> = {
  library_search: librarySearch,
  program_day: programDay,
  loop_prompts: loopPrompts,
  skill_check: skillCheckTool,
}

/** Runs one public tool: the arguments are checked against its schema first. Throws ToolError for the agent to fix. */
export function callPublicTool(name: string, args: Record<string, unknown>): Result {
  const definition = PUBLIC_TOOLS.find((item) => item.name === name)
  if (!definition) throw new ToolError(`Unknown tool "${name}".`)
  checkArgs(definition.inputSchema, args)
  return RUN[name](args)
}

export const SERVER_INFO = {
  name: 'reality-architect-public',
  title: 'Reality Architect',
  // The endpoint's own contract version: bump it when a tool, schema or output shape changes.
  version: '0.1.0',
  websiteUrl: site.url,
}

export const INSTRUCTIONS =
  'Public, read-only content from realityarchitect.ai: the Library, the free 30-day program, the practice loops and the skill bar. Nothing sent here is stored. Library entries and program days label their two registers as the site does: Meaning is a contemplative lens and Mechanism is the studied pathway. Nothing here claims that thought or imagery causes events, and nothing promises an outcome. A person’s own practice stays in their own agent, where the Claude Code plugin has the local tools.'
