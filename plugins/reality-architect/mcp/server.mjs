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
import { validate } from '../engine/validate.mjs'

const PLUGIN_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const VERSION = JSON.parse(fs.readFileSync(path.join(PLUGIN_ROOT, '.claude-plugin', 'plugin.json'), 'utf8')).version
const PROTOCOL_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05']

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
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
].map((tool) => ({ ...tool, annotations: { title: tool.title, ...READ_ONLY } }))

class ToolError extends Error {}

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

const entryText = (entry) => [`${entry.name} — ${entry.works} (${entry.shelf} shelf, id ${entry.id})`, `Keep (meaning): ${entry.keep}`, `Mechanism: ${entry.mechanism}`, `Limits: ${entry.limits}`].join('\n')

/** Runs one tool. Returns { text, data } or throws ToolError for a problem the agent should relay. */
export function callTool(name, args = {}, env = process.env) {
  if (args === null || typeof args !== 'object' || Array.isArray(args)) throw new ToolError('arguments must be an object.')
  if (name === 'reality_loops') return { text: LOOPS.map((loop) => `${loop.id}: ${loop.title} (${loop.cadence}; ${loop.gate}; skill ${loop.skill})\n  writes: ${loop.writes.join('; ')}`).join('\n'), data: { loops: LOOPS } }
  if (name === 'library_search') {
    const { entries } = loadLibrary()
    let found = entries
    if (args.id) found = entries.filter((entry) => entry.id === args.id)
    else if (args.query) {
      const words = String(args.query).toLowerCase().split(/\s+/).filter(Boolean)
      found = entries.filter((entry) => words.every((word) => [entry.id, entry.name, entry.works, entry.keep, entry.mechanism, entry.limits, ...(entry.tags ?? [])].join(' ').toLowerCase().includes(word)))
    }
    return { text: found.length ? found.map(entryText).join('\n\n') : 'No Library entry matches.', data: { entries: found } }
  }
  if (!TOOLS.some((tool) => tool.name === name)) throw new ToolError(`Unknown tool "${name}".`)
  // Input first, so a bad argument is reported as itself and not as a missing home.
  if (name === 'reality_brief' && !LOOPS.some((loop) => loop.id === args.loop)) throw new ToolError(`loop must be one of: ${LOOPS.map((loop) => loop.id).join(', ')}.`)
  const days = args.days === undefined ? 30 : Number(args.days)
  if (name === 'reality_insights' && (!Number.isInteger(days) || days < 7 || days > 365)) throw new ToolError('days must be a whole number from 7 to 365.')
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
  throw new ToolError(`Unknown tool "${name}".`)
}

/** Handles one JSON-RPC message; returns the response object, or null for notifications. */
export function handle(message, env = process.env) {
  const { id, method, params } = message ?? {}
  const isRequest = id !== undefined && id !== null
  const reply = (result) => (isRequest ? { jsonrpc: '2.0', id, result } : null)
  const fail = (code, text) => (isRequest ? { jsonrpc: '2.0', id, error: { code, message: text } } : null)
  // An invalid message is always answered (with a null id when it has none), never dropped.
  if (message?.jsonrpc !== '2.0' || typeof method !== 'string') return { jsonrpc: '2.0', id: id ?? null, error: { code: -32600, message: 'Invalid request' } }
  switch (method) {
    case 'initialize': {
      const requested = params?.protocolVersion
      return reply({
        protocolVersion: PROTOCOL_VERSIONS.includes(requested) ? requested : PROTOCOL_VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'reality-architect', title: 'Reality Architect', version: VERSION },
        instructions: 'Read-only tools over the person\'s own Reality Architect files. Call reality_status first. Counts are computed, never causes. To write anything, use the plugin skills, which show the exact text and ask first.',
      })
    }
    case 'ping':
      return reply({})
    case 'tools/list':
      return reply({ tools: TOOLS })
    case 'tools/call': {
      try {
        const { text, data } = callTool(params?.name, params?.arguments ?? {}, env)
        return reply({ content: [{ type: 'text', text }], structuredContent: data && !Array.isArray(data) ? data : { value: data }, isError: false })
      } catch (error) {
        if (error instanceof ToolError) return reply({ content: [{ type: 'text', text: error.message }], isError: true })
        return reply({ content: [{ type: 'text', text: `The engine failed: ${error.message}` }], isError: true })
      }
    }
    default:
      if (method.startsWith('notifications/')) return null
      return fail(-32601, `Method not found: ${method}`)
  }
}

function serve() {
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
