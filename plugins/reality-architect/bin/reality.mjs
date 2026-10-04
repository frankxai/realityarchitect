#!/usr/bin/env node
/**
 * reality: the Reality Architect engine on the command line. Read-only, no dependencies, Node 18 or newer.
 * Agents call it before a loop so they start from computed state; people can run it too.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { brief } from '../engine/brief.mjs'
import { buildGraph } from '../engine/graph.mjs'
import { insights } from '../engine/insights.mjs'
import { LOOPS, due } from '../engine/loops.mjs'
import { isDay, localDay } from '../engine/model.mjs'
import { assessAim } from '../engine/pace.mjs'
import { loadReality, resolveHome } from '../engine/parse.mjs'
import { checkSkill, libraryTeacherNames } from '../engine/skill-check.mjs'
import { validate } from '../engine/validate.mjs'

const USAGE = `reality <command> [--home DIR] [--today YYYY-MM-DD] [--json]

  status            your home, every aim's pace, and the loops due today
  due               the loops due today, with the computed reason for each
  brief <loop>      the context an agent reads before running a loop with you
                    loops: ${LOOPS.map((loop) => loop.id).join(', ')}
  insights          patterns over time, as counts (never causes)
  graph             the typed reality graph, as JSON
  validate          check your files against the standard
  loops             what each loop does, what it may write, and its approval gate
  skill-check DIR   check a skill folder against the marketplace bar

The home is --home, else $REALITY_HOME, else ~/reality.md with ~/.reality/.
Read-only: nothing here writes, sends, or syncs anything.`

function parseArgs(argv) {
  const options = { positional: [] }
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--json') options.json = true
    else if (arg === '--home' || arg === '--today') options[arg.slice(2)] = argv[(index += 1)]
    else if (arg === '--help' || arg === '-h') options.help = true
    else options.positional.push(arg)
  }
  return options
}

export function run(argv, { env = process.env, out = (text) => process.stdout.write(`${text}\n`), now = new Date() } = {}) {
  const options = parseArgs(argv)
  const [command, argument] = options.positional
  if (!command || options.help) {
    out(USAGE)
    return command || options.help ? 0 : 2
  }
  if (options.today && !isDay(options.today)) {
    out(`--today must be a real day as YYYY-MM-DD, not "${options.today}".`)
    return 2
  }
  const today = options.today ?? localDay(now)
  const print = (value, text) => out(options.json ? JSON.stringify(value, null, 2) : text)

  if (command === 'loops') {
    print(LOOPS, LOOPS.map((loop) => `${loop.id}: ${loop.title} (${loop.cadence}; ${loop.gate}; skill ${loop.skill})\n  writes: ${loop.writes.join('; ')}`).join('\n'))
    return 0
  }
  if (command === 'skill-check') {
    if (!argument) {
      out('skill-check needs a skill folder.')
      return 2
    }
    const pluginRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
    const issues = checkSkill(argument, { teacherNames: libraryTeacherNames(pluginRoot) })
    print(issues, issues.length ? issues.map((issue) => `${issue.level}: ${issue.message}`).join('\n') : `${path.basename(path.resolve(argument))}: meets the marketplace bar.`)
    return issues.some((issue) => issue.level === 'error') ? 1 : 0
  }

  const home = resolveHome(options.home, env)
  if (!home) {
    out('No Reality Architect home found. Pass --home DIR, set REALITY_HOME, or run the reality-onboard skill.')
    return 2
  }
  if (command === 'validate') {
    const issues = validate(home)
    const errors = issues.filter((issue) => issue.level === 'error').length
    print(issues, issues.length ? `${issues.map((issue) => `${issue.level}: ${issue.file}${issue.line ? `:${issue.line}` : ''} ${issue.message}`).join('\n')}\n${errors} error(s), ${issues.length - errors} warning(s).` : 'Every file meets the standard.')
    return errors ? 1 : 0
  }

  const reality = loadReality(home)
  if (command === 'status') {
    const paces = reality.aims.map((aim) => assessAim(aim, reality.witness, today))
    const dueNow = due(reality, today)
    print({ home, today, aims: paces, due: dueNow }, [
      `Home: ${home.root} (${home.mode} mode) · today ${today}`,
      `Aims (pace is computed):`,
      ...(paces.length ? paces.map((pace) => `  - ${pace.title}: ${pace.headline}`) : ['  - none yet']),
      `Due today:`,
      ...(dueNow.length ? dueNow.map((item) => `  - ${item.loop}: ${item.reason}`) : ['  - nothing; the practice is current']),
    ].join('\n'))
    return 0
  }
  if (command === 'due') {
    const dueNow = due(reality, today)
    print(dueNow, dueNow.length ? dueNow.map((item) => `${item.loop}: ${item.reason}`).join('\n') : 'Nothing is due today.')
    return 0
  }
  if (command === 'brief') {
    if (!LOOPS.some((loop) => loop.id === argument)) {
      out(`brief needs a loop: ${LOOPS.map((loop) => loop.id).join(', ')}.`)
      return 2
    }
    const text = brief(reality, argument, today)
    print({ loop: argument, today, brief: text }, text)
    return 0
  }
  if (command === 'insights') {
    const list = insights(reality, today)
    print(list, list.map((insight) => `- ${insight.text}`).join('\n'))
    return 0
  }
  if (command === 'graph') {
    out(JSON.stringify(buildGraph(reality, today), null, 2))
    return 0
  }
  out(`Unknown command "${command}".\n\n${USAGE}`)
  return 2
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = run(process.argv.slice(2))
