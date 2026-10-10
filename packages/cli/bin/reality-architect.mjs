#!/usr/bin/env node
import process from 'node:process';
import { runMcpServer } from '../src/mcp-server.mjs';
import {
  validateReality,
  assessClaimConfidence,
  readRealityMd,
  emit,
  emitAll,
  nextArtifactBrief,
  briefToMarkdown
} from '../src/index.mjs';
import { existsSync, readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const command = args[0];

if (!command || command === '--help' || command === '-h') {
  console.log(`
Reality Architect Cockpit CLI & Stdio MCP Server v0.1.0

USAGE:
  reality-architect <command> [options]

COMMANDS:
  mcp, --mcp              Launch the Stdio Model Context Protocol (MCP) server
  validate <file>         Validate a reality.md file against conformance levels (L0-L3)
  emit <file> [--target]  Emit harness context projection (claude, cursor, opencode, codex, antigravity)
  brief <file>            Print the next-artifact build brief
  graph <file>            Output node/edge graph JSON
  assess "<claim>"        Assess empirical reality confidence, indicators, and certainty capping

EXAMPLES:
  reality-architect validate ~/reality.md
  reality-architect emit ~/reality.md --target claude
  reality-architect assess "The API endpoint has 100% guaranteed zero downtime"
  reality-architect --mcp
`);
  process.exit(0);
}

if (command === '--mcp' || command === 'mcp') {
  runMcpServer().catch((err) => {
    console.error('Fatal MCP Server error:', err);
    process.exit(1);
  });
} else if (command === 'validate') {
  const file = args[1];
  if (!file) {
    console.error('Error: specify a reality.md file path');
    process.exit(1);
  }
  const res = validateReality(file);
  console.log(JSON.stringify(res, null, 2));
  process.exit(res.conforms ? 0 : 1);
} else if (command === 'emit') {
  const file = args[1];
  if (!file || !existsSync(file)) {
    console.error('Error: file not found:', file);
    process.exit(1);
  }
  const targetIdx = args.indexOf('--target');
  const target = targetIdx !== -1 ? args[targetIdx + 1] : 'claude';
  const parsed = readRealityMd(readFileSync(file, 'utf8'));
  console.log(emit(parsed, target));
} else if (command === 'brief') {
  const file = args[1];
  if (!file || !existsSync(file)) {
    console.error('Error: file not found:', file);
    process.exit(1);
  }
  const parsed = readRealityMd(readFileSync(file, 'utf8'));
  const brief = nextArtifactBrief(parsed);
  console.log(briefToMarkdown(brief));
} else if (command === 'graph') {
  const file = args[1];
  if (!file || !existsSync(file)) {
    console.error('Error: file not found:', file);
    process.exit(1);
  }
  const parsed = readRealityMd(readFileSync(file, 'utf8'));
  console.log(JSON.stringify({ entities: parsed.entities, invariants: parsed.invariants, edges: parsed.edges }, null, 2));
} else if (command === 'assess') {
  const claim = args[1];
  if (!claim) {
    console.error('Error: provide a claim text to assess');
    process.exit(1);
  }
  const res = assessClaimConfidence(claim);
  console.log(JSON.stringify(res, null, 2));
} else {
  console.error(`Unknown command: ${command}. Run "reality-architect --help" for usage.`);
  process.exit(1);
}
