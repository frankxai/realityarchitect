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
  sections: SectionKey[]
  builds: string
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

export interface Emission {
  target: EmitTarget
  filename: string
  content: string
  digest: string
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
export declare function parseTrigger(line: string): { when: string; then: string; raw: string } | null
export declare function buildPacket(
  parsed: ParsedRealityMd,
  opts?: { visibility?: Visibility }
): RealityPacket
export declare function primaryGap(packet: RealityPacket): RealityNode | null
export declare function slug(s: string): string
export declare function makeNode(spec: Record<string, unknown>): RealityNode
export declare function makeEdge(spec: Record<string, unknown>): RealityEdge
export declare function validatePacket(input: {
  parsed: ParsedRealityMd
  packet: RealityPacket
  raw?: string
}): Conformance
export declare function emit(packet: RealityPacket, target: EmitTarget): Emission
export declare function emitAll(packet: RealityPacket): Emission[]
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
