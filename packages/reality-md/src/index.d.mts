/**
 * reality.md standard v0.1 — public type surface.
 *
 * This file is the contract downstream products build against. It mirrors
 * `spec/reality.packet.schema.json`; the two are checked against each other in
 * `test/schema.test.mjs`. Changes are governed by VERSIONING.md.
 */

export type StandardVersion = `${number}.${number}`

export type SectionKey =
  | 'identity'
  | 'aims'
  | 'attention'
  | 'state'
  | 'systems'
  | 'environment'
  | 'feedback'
  | 'guardrails'
  | 'agentProtocol'

export type NodeKind =
  | 'Human'
  | 'Role'
  | 'Goal'
  | 'Constraint'
  | 'Context'
  | 'SystemGap'
  | 'Artifact'
  | 'Agent'
  | 'Authority'
  | 'Workflow'
  | 'Decision'
  | 'Feedback'
  | 'Evidence'
  | 'Revision'

export type Rel =
  | 'holds'
  | 'pursues'
  | 'bounds'
  | 'informs'
  | 'blocks'
  | 'closes'
  | 'operates'
  | 'permits'
  | 'denies'
  | 'serves'
  | 'measures'
  | 'evidences'
  | 'decides'
  | 'revises'

export type Visibility = 'private' | 'shared' | 'public'

export interface Provenance {
  source: 'human' | 'agent' | 'assessment' | 'migration' | 'derived'
  method: 'written' | 'parsed' | 'inferred' | 'migrated'
  locator?: string
}

export interface Evaluation {
  rule: string
  status: 'unset' | 'open' | 'met' | 'failed' | 'retired'
}

export interface RealityNode {
  id: string
  kind: NodeKind
  label: string
  owner: string
  provenance: Provenance
  version: StandardVersion
  visibility: Visibility
  evaluation: Evaluation
  detail?: Record<string, unknown>
}

export interface RealityEdge {
  id: string
  rel: Rel
  from: string
  to: string
  owner: string
  provenance: Provenance
  version: StandardVersion
  visibility: Visibility
  evaluation: Evaluation
}

export interface RealityPacket {
  standard: 'reality.md'
  version: StandardVersion
  updated?: string
  source?: string
  subject: { id: string; name: string }
  sections: Partial<Record<SectionKey, string[]>>
  graph: { nodes: RealityNode[]; edges: RealityEdge[] }
}

export interface ParsedRealityMd {
  frontmatter: Record<string, string> | null
  title: string
  name: string
  sections: Partial<Record<SectionKey, string[]>>
  unknownHeadings: string[]
  notes: string[]
  source?: string
}

export interface Finding {
  severity: 'error' | 'warning'
  code: string
  message: string
  where?: string
}

export interface Conformance {
  ok: boolean
  level: 0 | 1 | 2 | 3 | 4
  levelName: string
  version: string | null
  errors: Finding[]
  warnings: Finding[]
  byLevel: Record<1 | 2 | 3 | 4, Finding[]>
  counts: { nodes: number; edges: number; goals: number; unmetMoves: string[] }
}

export interface Move {
  move: 'See' | 'Design' | 'Build' | 'Automate' | 'Compound'
  /** Where a human normally writes this move. Never what decides whether it is met. */
  sections: SectionKey[]
  builds: string
  /** What the file must state for this move to count as evidenced. */
  evidence: string
  /** The decision: read over derived nodes, never over section emptiness. */
  evidenced: (nodes: RealityNode[]) => boolean
}

export interface NextArtifactBrief {
  move: Move['move'] | null
  order: number | null
  gap: string
  artifact: string
  build: string[]
  acceptance: string
  timebox: string
  closes: string | null
}

export type EmitTarget = 'reality.md' | 'claude' | 'codex' | 'cursor' | 'gemini' | 'hermes'
/** Deprecated filenames a harness still reads. Never emitted by `emitAll`. */
export type LegacyEmitTarget = 'cursor-legacy'

export interface Emission {
  target: EmitTarget | LegacyEmitTarget
  filename: string
  /** The whole file, including any header the harness requires above the block. */
  content: string
  /** Just the marker-delimited block `mergeIntoFile` owns. */
  block: string
  digest: string
}

export type VerifyMode = 'canonical' | 'import' | 'snapshot' | 'json' | 'unknown'

export interface VerifyResult {
  target: string | null
  mode: VerifyMode
  /** The digest the projection declares, or null when it declares none. */
  declared: string | null
  /** The digest re-derived from what the projection actually contains. */
  derived: string | null
  ok: boolean
  reason: string
  importPath?: string
  unresolved?: boolean
}

export interface ReadResult {
  parsed: ParsedRealityMd
  packet: RealityPacket
  conformance: Conformance
}

export declare const VERSION: StandardVersion
export declare const SECTIONS: ReadonlyArray<{ key: SectionKey; heading: string }>
export declare const HEADING_ALIASES: ReadonlyMap<string, SectionKey>
export declare const MOVES: ReadonlyArray<Move>
export declare const TARGETS: ReadonlyArray<EmitTarget>
export declare const LEGACY_TARGETS: ReadonlyArray<LegacyEmitTarget>
export declare const MARKER_START: string
export declare const MARKER_END: string
export declare const SUPPORTED_VERSIONS: ReadonlyArray<string>
export declare const LEVELS: ReadonlyArray<{ level: 1 | 2 | 3 | 4; name: string; claim: string }>
export declare const MIGRATIONS: ReadonlyArray<{ from: string; to: string; describe: string }>

export declare function parseRealityMd(
  text: string,
  opts?: { allowAliases?: boolean; source?: string }
): ParsedRealityMd
export declare function parseFrontmatter(text: string): { data: Record<string, string> | null; body: string }
export declare function parseAim(line: string): {
  label: string
  doneWhen: string | null
  deadline: string | null
  aimFile: string | null
  raw: string
}
/**
 * A nested sub-bullet under an aim carrying `done when …` / `by <date>` / an aims-file path.
 * Null when the line carries none of them, so an unrelated note is not folded into the aim.
 */
export declare function parseAimContinuation(line: string): {
  doneWhen: string | null
  deadline: string | null
  aimFile: string | null
  raw: string
} | null
export declare function parseTrigger(line: string): { when: string; then: string; raw: string } | null
export declare function buildPacket(
  parsed: ParsedRealityMd,
  opts?: { visibility?: Visibility }
): RealityPacket
export declare function primaryGap(packet: RealityPacket): RealityNode | null
/** Loop moves with no evidence anywhere in the packet's graph, in Loop order. */
export declare function unmetMoves(packet: RealityPacket): Move[]
export declare function slug(s: string): string
export declare function makeNode(spec: Record<string, unknown>): RealityNode
export declare function makeEdge(spec: Record<string, unknown>): RealityEdge
export declare function validatePacket(input: {
  parsed: ParsedRealityMd
  packet: RealityPacket
  raw?: string
}): Conformance
export declare function emit(packet: RealityPacket, target: EmitTarget | LegacyEmitTarget): Emission
export declare function emitAll(packet: RealityPacket): Emission[]
/**
 * Replace what sits between the reality.md markers, append the block when the file has none,
 * and never touch anything else. Idempotent.
 */
export declare function mergeIntoFile(existing: string, emission: Emission | string): string
/**
 * Re-derive a packet from what a projection actually contains and compare it with the digest
 * the projection declares. `import` targets need `resolve(path) => string` to read their source.
 */
export declare function verifyEmission(
  content: string,
  opts?: { target?: string | null; expect?: string; resolve?: (path: string) => string }
): VerifyResult
export declare function toMarkdown(packet: RealityPacket): string
export declare function digest(packet: RealityPacket): string
export declare function nextArtifactBrief(packet: RealityPacket): NextArtifactBrief
export declare function briefToMarkdown(brief: NextArtifactBrief, packet: RealityPacket): string
export declare function detectVersion(text: string): string
export declare function migrate(
  text: string,
  opts?: { today?: string }
): { markdown: string; from: string; to: StandardVersion; notes: string[]; revision: RealityNode | null }
export declare function readRealityMd(
  text: string,
  opts?: { visibility?: Visibility; source?: string; allowAliases?: boolean }
): ReadResult
