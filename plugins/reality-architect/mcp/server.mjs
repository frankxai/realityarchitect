#!/usr/bin/env node
/**
 * The Reality Architect engine as a local MCP server (stdio, newline-delimited JSON-RPC 2.0). No dependencies, Node 18
 * or newer. Every tool is read-only and computes from the person's own files, the same way `bin/reality.mjs` does, so
 * an agent in any MCP client starts from the same numbers the Studio and the CLI show. Nothing is written, sent or
 * synced; writing stays with the skills, which ask first (CHARTER.md).
 *
 * Home: $REALITY_HOME, else ~/reality.md with ~/.reality/ (the same rule as the CLI).
 */
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'
import { brief } from '../engine/brief.mjs'
import { buildGraph } from '../engine/graph.mjs'
import { insights } from '../engine/insights.mjs'
import { LOOPS, due } from '../engine/loops.mjs'
import { isDay, localDay } from '../engine/model.mjs'
import { assessAim } from '../engine/pace.mjs'
import { loadReality, resolveHome } from '../engine/parse.mjs'
import { AUDIENCES, OFFSET, checkKernel, checkKernelOptions, toKernel } from '../engine/kernel.mjs'
import { validate } from '../engine/validate.mjs'
import { READ_ONLY, ToolError, createDispatcher, searchLibrary } from './core.mjs'

const PLUGIN_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const VERSION = JSON.parse(fs.readFileSync(path.join(PLUGIN_ROOT, '.claude-plugin', 'plugin.json'), 'utf8')).version

const TODAY = { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$', description: 'The day to compute for, YYYY-MM-DD. Defaults to today on this machine.' }

export const TOOLS = [
  {
    name: 'reality_status',
    title: 'Reality status',
    description: "The person's home, every aim's computed pace, and the loops due today. Start here before any loop.",
    inputSchema: { type: 'object', properties: { today: TODAY }, additionalProperties: false },
  },
  {
    name: 'reality_due',
    title: 'Loops due today',
    description: 'Which loops are due today (morning, evening, weekly, monthly, decisions, pace), each with the computed reason.',
    inputSchema: { type: 'object', properties: { today: TODAY }, additionalProperties: false },
  },
  {
    name: 'reality_brief',
    title: 'Loop brief',
    description: 'The context to read before running one loop with the person: their aims and pace, recent witness entries, and the Charter lines that govern the loop.',
    inputSchema: { type: 'object', properties: { loop: { type: 'string', enum: LOOPS.map((loop) => loop.id) }, today: TODAY }, required: ['loop'], additionalProperties: false },
  },
  {
    name: 'reality_insights',
    title: 'Patterns over time',
    description: 'Patterns from the person\'s own records, as counts labeled computed (never causes): reps, misses counted with hits, primed and unprimed signs.',
    inputSchema: { type: 'object', properties: { today: TODAY, days: { type: 'integer', minimum: 7, maximum: 365, description: 'Window in days (default 30).' } }, additionalProperties: false },
  },
  {
    name: 'reality_validate',
    title: 'Validate files',
    description: 'Check the person\'s files against the open standard and list every broken rule by file and line.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'reality_graph',
    title: 'Reality graph',
    description: 'The typed graph of aims, domains, practices, moves and witness entries, with SIS kernel IDs (ra:<type>:<key>).',
    inputSchema: { type: 'object', properties: { today: TODAY }, additionalProperties: false },
  },
  {
    name: 'reality_loops',
    title: 'The loops',
    description: 'What each loop does, its steps, what it may write, and its approval gate. Needs no home.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'library_search',
    title: 'Search the Library',
    description: 'Reality Theory and the honest canon: each work with what to keep (meaning), the mechanism it rides on, its limits, and sources. Search by words or fetch by id. Needs no home.',
    inputSchema: { type: 'object', properties: { query: { type: 'string', maxLength: 200 }, id: { type: 'string', maxLength: 80 } }, additionalProperties: false },
  },
  {
    name: 'reality_kernel',
    title: 'Starlight kernel projection',
    description: "The person's reality as Starlight Reality Architecture kernel v0.1.1 documents: objects, desired branches, diffs, plans, self-reported receipts and events. Audience 'private' is the person's own; 'alliance' is a guide's view, with structure and counts only. Validated against the vendored SIS schemas.",
    inputSchema: { type: 'object', properties: { audience: { type: 'string', enum: AUDIENCES, description: "Required. 'private' is everything, for the person; 'alliance' is a guide's view." }, offset: { type: 'string', pattern: OFFSET.source, description: 'Offset for local witness times, e.g. +02:00. Defaults to this machine.' }, today: TODAY }, required: ['audience'], additionalProperties: false },
  },
].map((tool) => ({ ...tool, annotations: { title: tool.title, ...READ_ONLY } }))

function dayFrom(args) {
  if (args.today === undefined) return localDay(new Date())
  if (!isDay(args.today)) throw new ToolError(`today must be a real day as YYYY-MM-DD, not "${args.today}".`)
  return args.today
}

function homeFrom(env) {
  const home = resolveHome(undefined, env)
  if (!home) throw new ToolError('No Reality Architect home found. Set REALITY_HOME to the folder with reality.md, or create ~/reality.md (the reality-onboard skill walks through it).')
  return home
}

let library
function loadLibrary() {
  library ??= JSON.parse(fs.readFileSync(path.join(PLUGIN_ROOT, 'skills', 'reality-library', 'library.json'), 'utf8'))
  return library
}

/** Runs one tool. Returns { text, data } or throws ToolError for a problem the agent should relay. */
export function callTool(name, args = {}, env = process.env) {
  if (args === null || typeof args !== 'object' || Array.isArray(args)) throw new ToolError('arguments must be an object.')
  if (name === 'reality_loops') return { text: LOOPS.map((loop) => `${loop.id}: ${loop.title} (${loop.cadence}; ${loop.gate}; skill ${loop.skill})\n  writes: ${loop.writes.join('; ')}`).join('\n'), data: { loops: LOOPS } }
  if (name === 'library_search') return searchLibrary(loadLibrary(), args)
  if (!TOOLS.some((tool) => tool.name === name)) throw new ToolError(`Unknown tool "${name}".`)
  // Input first, so a bad argument is reported as itself and not as a missing home.
  if (name === 'reality_brief' && !LOOPS.some((loop) => loop.id === args.loop)) throw new ToolError(`loop must be one of: ${LOOPS.map((loop) => loop.id).join(', ')}.`)
  const days = args.days === undefined ? 30 : Number(args.days)
  if (name === 'reality_insights' && (!Number.isInteger(days) || days < 7 || days > 365)) throw new ToolError('days must be a whole number from 7 to 365.')
  if (name === 'reality_kernel') {
    // Who may see the projection is the person's explicit choice: no default audience, checked before any file is read.
    try {
      checkKernelOptions({ audience: args.audience, offset: args.offset })
    } catch (error) {
      throw new ToolError(error.message)
    }
  }
  const today = dayFrom(args)
  const home = homeFrom(env)
  if (name === 'reality_validate') {
    const issues = validate(home)
    return { text: issues.length ? issues.map((issue) => `${issue.level}: ${issue.file}${issue.line ? `:${issue.line}` : ''} ${issue.message}`).join('\n') : 'Every file meets the standard.', data: { issues } }
  }
  const reality = loadReality(home)
  if (name === 'reality_status') {
    const aims = reality.aims.map((aim) => assessAim(aim, reality.witness, today))
    const dueNow = due(reality, today)
    const text = [
      `Home: ${home.root} (${home.mode} mode) · today ${today}`,
      'Aims (pace is computed):',
      ...(aims.length ? aims.map((pace) => `  - ${pace.title}: ${pace.headline}`) : ['  - none yet']),
      'Due today:',
      ...(dueNow.length ? dueNow.map((item) => `  - ${item.loop}: ${item.reason}`) : ['  - nothing; the practice is current']),
    ].join('\n')
    return { text, data: { home: home.root, mode: home.mode, today, aims, due: dueNow } }
  }
  if (name === 'reality_due') {
    const dueNow = due(reality, today)
    return { text: dueNow.length ? dueNow.map((item) => `${item.loop}: ${item.reason}`).join('\n') : 'Nothing is due today.', data: { today, due: dueNow } }
  }
  if (name === 'reality_brief') {
    const text = brief(reality, args.loop, today)
    return { text, data: { loop: args.loop, today, brief: text } }
  }
  if (name === 'reality_insights') {
    const list = insights(reality, today, days)
    return { text: list.length ? list.map((insight) => `- ${insight.text}`).join('\n') : 'Not enough records yet for patterns.', data: { today, days, insights: list } }
  }
  if (name === 'reality_graph') {
    const graph = buildGraph(reality, today)
    return { text: JSON.stringify(graph), data: graph }
  }
  if (name === 'reality_kernel') {
    let bundle
    try {
      bundle = toKernel(reality, today, { audience: args.audience, offset: args.offset })
    } catch (error) {
      throw new ToolError(error.message)
    }
    const problems = checkKernel(bundle)
    if (problems.length) throw new ToolError(`The projection does not conform to the kernel: ${problems.slice(0, 5).join('; ')}`)
    return { text: JSON.stringify(bundle), data: bundle }
  }
  throw new ToolError(`Unknown tool "${name}".`)
}

const INSTRUCTIONS = "Read-only tools over the person's own Reality Architect files. Call reality_status first. Counts are computed, never causes. To write anything, use the plugin skills, which show the exact text and ask first."

/**
 * One MCP session (one client connection). It follows the lifecycle: a valid `initialize` request, then the client's
 * `notifications/initialized`, and only then do tools answer; ping always works. Protocol problems (an unknown tool,
 * malformed params) are JSON-RPC errors; problems the agent can fix in its arguments, or a missing home, come back as a
 * tool result with isError, so the model sees them. The dispatcher itself is transport-agnostic (core.mjs).
 */
export function createSession(env = process.env) {
  return createDispatcher({
    tools: TOOLS,
    call: (name, args) => callTool(name, args, env),
    serverInfo: { name: 'reality-architect', title: 'Reality Architect', version: VERSION },
    instructions: INSTRUCTIONS,
    lifecycle: true,
  })
}

function serve() {
  const handle = createSession()
  const lines = readline.createInterface({ input: process.stdin })
  lines.on('line', (line) => {
    if (!line.trim()) return
    let message
    try {
      message = JSON.parse(line)
    } catch {
      process.stdout.write(`${JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } })}\n`)
      return
    }
    const response = handle(message)
    if (response) process.stdout.write(`${JSON.stringify(response)}\n`)
  })
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) serve()
