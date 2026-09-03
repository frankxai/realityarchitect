/**
 * The reality.md standard, v0.1 — reference implementation.
 * Zero dependencies, no I/O, no network. Runs in node, in a browser, and in a worker.
 *
 * Downstream products (starlight.you) consume this module. The exported surface below
 * is the versioned interface: it changes only under the rules in VERSIONING.md.
 */

export { SECTIONS, HEADING_ALIASES, parseRealityMd, parseFrontmatter, parseAim, parseTrigger } from './parse.mjs'
export { VERSION, MOVES, buildPacket, primaryGap, unmetMoves, makeNode, makeEdge, slug } from './graph.mjs'
export { LEVELS, SUPPORTED_VERSIONS, validatePacket } from './validate.mjs'
export {
  TARGETS,
  LEGACY_TARGETS,
  MARKER_START,
  MARKER_END,
  emit,
  emitAll,
  mergeIntoFile,
  verifyEmission,
  toMarkdown,
  digest,
  nextArtifactBrief,
  briefToMarkdown,
} from './emit.mjs'
export { MIGRATIONS, detectVersion, migrate } from './migrate.mjs'

import { parseRealityMd } from './parse.mjs'
import { buildPacket } from './graph.mjs'
import { validatePacket } from './validate.mjs'

/**
 * Read a reality.md string end to end: parse → graph → conformance.
 * This is the one call most consumers need.
 * @param {string} text
 * @param {{ visibility?: 'private'|'shared'|'public', source?: string, allowAliases?: boolean }} [opts]
 */
export function readRealityMd(text, opts = {}) {
  const parsed = parseRealityMd(text, opts)
  const packet = buildPacket(parsed, opts)
  const conformance = validatePacket({ parsed, packet, raw: text })
  return { parsed, packet, conformance }
}
