/**
 * Reality Studio data model. Every personal field carries its epistemic class in the UI and in exports:
 * desired (a scene), reported (what the person says is true now), planned (an act), done, and meaning (their own
 * interpretation). Nothing here is ever sent over the network; see lib/studio/persist.ts.
 */

export type DomainId =
  | 'body' | 'mind' | 'heart' | 'character' | 'spirit' | 'love'
  | 'lineage' | 'circle' | 'wealth' | 'craft' | 'sanctuary' | 'golden-age'

/** Reality Diff gap classes, shared with the SIS Reality Architecture kernel. */
export type GapClass =
  | 'knowledge' | 'capability' | 'resource' | 'coordination' | 'technology'
  | 'permission' | 'process' | 'evidence' | 'time'

export type WitnessKind = 'sign' | 'win' | 'rep' | 'move' | 'opening' | 'lesson' | 'gratitude'

export type Voice = 'gentle' | 'direct' | 'challenging'

export interface Soul {
  /** Optional, used only as the heading of exported files. */
  name: string
  purpose: string
  values: string[]
  iAm: string[]
  scene: string
  gifts: string
  vows: string[]
  voice: Voice
  gratitude: string[]
}

export interface DomainState {
  /** 0–10, reported. Null means not looked at yet, which is coverage, not failure. */
  now: number | null
  /** 0–10, desired. */
  want: number | null
  /** One true sentence about now (reported). */
  fact: string
  /** One scene for when it works (desired). */
  scene: string
  priority: boolean
}

export type Atlas = Record<DomainId, DomainState>

export interface Rep {
  id: string
  name: string
  /** Planned times per week, 1–14. */
  perWeek: number
}

export interface Move {
  id: string
  title: string
  /** YYYY-MM-DD or empty. */
  due: string
  done: boolean
  doneAt?: string
}

export interface Reach {
  id: string
  kind: 'person' | 'place'
  name: string
  why: string
  status: 'wish' | 'reached'
}

export type BridgeStatus = 'active' | 'achieved' | 'released'

/** One aim: the bridge from what is reported now to the desired scene. */
export interface Bridge {
  id: string
  /** YYYY-MM-DD the bridge was created. */
  createdAt: string
  title: string
  domain: DomainId | ''
  doneWhen: string
  /** YYYY-MM-DD target date or empty. */
  by: string
  scene: string
  fact: string
  obstacle: string
  gap: GapClass | ''
  ifThen: string
  skills: string[]
  systems: string[]
  reps: Rep[]
  moves: Move[]
  reach: Reach[]
  status: BridgeStatus
  closedAt?: string
  closingNote?: string
}

export interface WitnessEntry {
  id: string
  /** ISO timestamp. */
  at: string
  /** Local YYYY-MM-DD the entry belongs to. */
  day: string
  /** Local HH:MM when it was written, kept so exports do not shift with the reading device's time zone. */
  time: string
  kind: WitnessKind
  /** What happened (fact). */
  fact: string
  /** What it meant (the person's meaning). Optional. */
  meaning: string
  /** What they already did (done). Optional. Plans never go here. */
  action: string
  /** What they will do next (planned). Optional; kept apart from what was done. */
  next: string
  bridgeId?: string
  /** The bridge's title, kept when that bridge is deleted so the entry stays attributed. */
  bridgeTitle?: string
  repId?: string
  moveId?: string
  domain?: DomainId
  /** For signs: the person had set out that day to notice something like it. */
  primed: boolean
}

export interface DayNote {
  lookFor: string
  /** Whether what they looked for came. Misses are recorded too; that is what keeps the tally honest. */
  lookForResult: '' | 'came' | 'missed'
  focusBridgeId: string
  rehearsed: boolean
  correction: string
}

export interface SnapshotBridge {
  id: string
  title: string
  state: string
  repsLogged: number
  repsPlanned: number
  movesDone: number
  movesTotal: number
}

export interface Reflection {
  trueNow: string
  changed: string
  grateful: string
  correction: string
}

/** Approved and immutable once sealed. */
export type Cadence = 'weekly' | 'monthly'

export interface Snapshot {
  /** Weekly reviews start after the last snapshot; monthly reviews after the last monthly one (or the month's start). */
  cadence: Cadence
  id: string
  /** ISO timestamp of sealing. */
  sealedAt: string
  /** Local YYYY-MM-DD. */
  day: string
  periodStart: string
  atlas: Record<DomainId, { now: number | null; want: number | null }>
  bridges: SnapshotBridge[]
  counts: Record<WitnessKind, number>
  primedSigns: number
  unprimedSigns: number
  /** Days with a look-for in the period, and whether it came or was missed. Misses are counted, not dropped. */
  intentions: { set: number; came: number; missed: number }
  reflection: Reflection
}

export type DecisionStatus = 'open' | 'decided' | 'reviewed'

export interface Decision {
  id: string
  day: string
  title: string
  context: string
  options: string
  choice: string
  why: string
  /** YYYY-MM-DD or empty. */
  reviewOn: string
  outcome: string
  status: DecisionStatus
}

export interface CanvasCard {
  id: string
  kind: 'note' | 'image'
  text: string
  imageId?: string
  x: number
  y: number
  w: number
  h: number
}

export interface CanvasState {
  cards: CanvasCard[]
  /** Positions the person dragged, keyed by map node id. They override computed layout. */
  positions: Record<string, { x: number; y: number }>
  view: { x: number; y: number; zoom: number }
}

export interface StudioState {
  schema: 'reality-studio'
  version: 1
  createdAt: string
  updatedAt: string
  /** True while the fictional sample life is loaded. */
  sample: boolean
  soul: Soul
  atlas: Atlas
  bridges: Bridge[]
  witness: WitnessEntry[]
  days: Record<string, DayNote>
  snapshots: Snapshot[]
  decisions: Decision[]
  canvas: CanvasState
}
