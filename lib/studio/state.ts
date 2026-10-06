import { DOMAIN_IDS, isDomainId, isGapClass, isWitnessKind } from './domains.ts'
import { normalizeProgram } from './program.ts'
import { clampText, isDay, localDay, newId } from './util.ts'
import type {
  Atlas, Bridge, CanvasCard, CanvasState, DayNote, Decision, DomainState, Move, Reach, Rep, Snapshot, SnapshotBridge,
  Soul, StudioState, Voice, WitnessEntry, WitnessKind,
} from './types.ts'

export const STORAGE_KEY = 'ra.studio.v1'

/**
 * Caps only stop pathological input (a hand-edited or runaway save). They sit far above anything the Studio lets a
 * person write, so normalizing a real state never changes it.
 */
const CAP = { title: 500, line: 2000, text: 20000, scene: 20000, list: 200, items: 1000, bridges: 1000, witness: 100000, records: 10000, cards: 5000 }

const VOICES: Voice[] = ['gentle', 'direct', 'challenging']

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const text = (value: unknown, max = CAP.text) => clampText(value, max)

const list = (value: unknown, max = CAP.list): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim() !== '').map((item) => item.slice(0, CAP.line)).slice(0, max)
    : []

const score = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? Math.min(10, Math.max(0, Math.round(value))) : null

const finite = (value: unknown, fallback = 0): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

const day = (value: unknown): string => (isDay(value) ? value : '')

const id = (value: unknown): string => (typeof value === 'string' && value.trim() ? value.slice(0, 80) : newId())

export function emptySoul(): Soul {
  return { name: '', purpose: '', values: [], iAm: [], scene: '', gifts: '', vows: [], voice: 'direct', gratitude: [] }
}

export function emptyDomain(): DomainState {
  return { now: null, want: null, fact: '', scene: '', priority: false }
}

export function emptyAtlas(): Atlas {
  return Object.fromEntries(DOMAIN_IDS.map((domainId) => [domainId, emptyDomain()])) as Atlas
}

export function emptyCanvas(): CanvasState {
  return { cards: [], positions: {}, view: { x: 0, y: 0, zoom: 0.6 } }
}

export function emptyState(now: Date = new Date()): StudioState {
  const stamp = now.toISOString()
  return {
    schema: 'reality-studio',
    version: 1,
    createdAt: stamp,
    updatedAt: stamp,
    sample: false,
    soul: emptySoul(),
    atlas: emptyAtlas(),
    bridges: [],
    witness: [],
    days: {},
    snapshots: [],
    decisions: [],
    canvas: emptyCanvas(),
  }
}

export function emptyBridge(today: string, domain: Bridge['domain'] = ''): Bridge {
  return {
    id: newId(), createdAt: today, title: '', domain, doneWhen: '', by: '', scene: '', fact: '', obstacle: '', gap: '',
    ifThen: '', skills: [], systems: [], reps: [], moves: [], reach: [], status: 'active',
  }
}

function normalizeSoul(input: unknown): Soul {
  const soul = isObject(input) ? input : {}
  return {
    name: text(soul.name, 80),
    purpose: text(soul.purpose),
    values: list(soul.values, 10),
    iAm: list(soul.iAm, 12),
    scene: text(soul.scene, CAP.scene),
    gifts: text(soul.gifts),
    vows: list(soul.vows, 12),
    voice: VOICES.includes(soul.voice as Voice) ? (soul.voice as Voice) : 'direct',
    gratitude: list(soul.gratitude, 20),
  }
}

function normalizeAtlas(input: unknown): Atlas {
  const atlas = isObject(input) ? input : {}
  return Object.fromEntries(
    DOMAIN_IDS.map((domainId) => {
      const entry = isObject(atlas[domainId]) ? (atlas[domainId] as Record<string, unknown>) : {}
      return [domainId, { now: score(entry.now), want: score(entry.want), fact: text(entry.fact), scene: text(entry.scene, CAP.scene), priority: entry.priority === true }]
    }),
  ) as Atlas
}

function normalizeRep(input: unknown): Rep | null {
  if (!isObject(input) || typeof input.name !== 'string' || !input.name.trim()) return null
  return { id: id(input.id), name: input.name.slice(0, CAP.line), perWeek: Math.min(14, Math.max(1, Math.round(finite(input.perWeek, 1)))) }
}

function normalizeMove(input: unknown): Move | null {
  if (!isObject(input) || typeof input.title !== 'string' || !input.title.trim()) return null
  const move: Move = { id: id(input.id), title: input.title.slice(0, CAP.line), due: day(input.due), done: input.done === true }
  if (move.done && isDay(input.doneAt)) move.doneAt = input.doneAt
  return move
}

function normalizeReach(input: unknown): Reach | null {
  if (!isObject(input) || typeof input.name !== 'string' || !input.name.trim()) return null
  return {
    id: id(input.id),
    kind: input.kind === 'place' ? 'place' : 'person',
    name: input.name.slice(0, CAP.line),
    why: text(input.why, CAP.line),
    status: input.status === 'reached' ? 'reached' : 'wish',
  }
}

const compact = <T>(items: (T | null)[]): T[] => items.filter((item): item is T => item !== null)

function normalizeBridge(input: unknown, today: string): Bridge | null {
  if (!isObject(input)) return null
  const bridge: Bridge = {
    id: id(input.id),
    createdAt: day(input.createdAt) || today,
    title: text(input.title, CAP.title),
    domain: isDomainId(input.domain) ? input.domain : '',
    doneWhen: text(input.doneWhen),
    by: day(input.by),
    scene: text(input.scene, CAP.scene),
    fact: text(input.fact),
    obstacle: text(input.obstacle),
    gap: isGapClass(input.gap) ? input.gap : '',
    ifThen: text(input.ifThen),
    skills: list(input.skills),
    systems: list(input.systems),
    reps: Array.isArray(input.reps) ? compact(input.reps.slice(0, CAP.list).map(normalizeRep)) : [],
    moves: Array.isArray(input.moves) ? compact(input.moves.slice(0, CAP.items).map(normalizeMove)) : [],
    reach: Array.isArray(input.reach) ? compact(input.reach.slice(0, CAP.items).map(normalizeReach)) : [],
    status: input.status === 'achieved' || input.status === 'released' ? input.status : 'active',
  }
  if (bridge.status !== 'active') {
    if (isDay(input.closedAt)) bridge.closedAt = input.closedAt
    const note = text(input.closingNote)
    if (note) bridge.closingNote = note
  }
  return bridge
}

function normalizeWitness(input: unknown): WitnessEntry | null {
  if (!isObject(input) || !isWitnessKind(input.kind) || !isDay(input.day)) return null
  const fact = text(input.fact)
  if (!fact.trim()) return null
  const at = typeof input.at === 'string' && !Number.isNaN(Date.parse(input.at)) ? input.at : `${input.day}T12:00:00.000Z`
  const stamp = new Date(at)
  const entry: WitnessEntry = {
    id: id(input.id),
    at,
    day: input.day,
    // Older saves had no time: derive it once from the timestamp on this device.
    time: typeof input.time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(input.time)
      ? input.time
      : `${String(stamp.getHours()).padStart(2, '0')}:${String(stamp.getMinutes()).padStart(2, '0')}`,
    kind: input.kind,
    fact,
    meaning: text(input.meaning),
    action: text(input.action),
    next: text(input.next),
    primed: input.primed === true,
  }
  for (const key of ['bridgeId', 'repId', 'moveId'] as const) {
    if (typeof input[key] === 'string' && input[key]) entry[key] = (input[key] as string).slice(0, 80)
  }
  if (typeof input.bridgeTitle === 'string' && input.bridgeTitle) entry.bridgeTitle = input.bridgeTitle.slice(0, CAP.title)
  if (isDomainId(input.domain)) entry.domain = input.domain
  return entry
}

function normalizeDays(input: unknown): Record<string, DayNote> {
  if (!isObject(input)) return {}
  const days: Record<string, DayNote> = {}
  for (const [key, value] of Object.entries(input).slice(-CAP.records * 4)) {
    if (!isDay(key) || !isObject(value)) continue
    const result = value.lookForResult === 'came' || value.lookForResult === 'missed' ? value.lookForResult : ''
    days[key] = { lookFor: text(value.lookFor, CAP.line), lookForResult: result, focusBridgeId: text(value.focusBridgeId, 80), rehearsed: value.rehearsed === true, correction: text(value.correction, CAP.line) }
  }
  return days
}

const KINDS: WitnessKind[] = ['sign', 'win', 'rep', 'move', 'opening', 'lesson', 'gratitude']

function normalizeSnapshot(input: unknown): Snapshot | null {
  if (!isObject(input) || !isDay(input.day)) return null
  const atlas = isObject(input.atlas) ? input.atlas : {}
  const counts = isObject(input.counts) ? input.counts : {}
  const reflection = isObject(input.reflection) ? input.reflection : {}
  const bridges = Array.isArray(input.bridges) ? input.bridges : []
  const intentions = isObject(input.intentions) ? input.intentions : {}
  const count = (value: unknown) => Math.max(0, Math.round(finite(value)))
  return {
    id: id(input.id),
    cadence: input.cadence === 'monthly' ? 'monthly' : 'weekly',
    sealedAt: typeof input.sealedAt === 'string' && !Number.isNaN(Date.parse(input.sealedAt)) ? input.sealedAt : `${input.day}T12:00:00.000Z`,
    day: input.day,
    periodStart: day(input.periodStart) || input.day,
    atlas: Object.fromEntries(DOMAIN_IDS.map((domainId) => {
      const entry = isObject(atlas[domainId]) ? (atlas[domainId] as Record<string, unknown>) : {}
      return [domainId, { now: score(entry.now), want: score(entry.want) }]
    })) as Snapshot['atlas'],
    bridges: compact(bridges.slice(0, CAP.list).map((item): SnapshotBridge | null => {
      if (!isObject(item) || typeof item.title !== 'string') return null
      return {
        id: text(item.id, 80), title: item.title.slice(0, CAP.title), state: text(item.state, 40),
        repsLogged: Math.max(0, Math.round(finite(item.repsLogged))), repsPlanned: Math.max(0, Math.round(finite(item.repsPlanned))),
        movesDone: Math.max(0, Math.round(finite(item.movesDone))), movesTotal: Math.max(0, Math.round(finite(item.movesTotal))),
      }
    })),
    counts: Object.fromEntries(KINDS.map((kind) => [kind, Math.max(0, Math.round(finite(counts[kind])))])) as Snapshot['counts'],
    primedSigns: Math.max(0, Math.round(finite(input.primedSigns))),
    unprimedSigns: Math.max(0, Math.round(finite(input.unprimedSigns))),
    intentions: { set: count(intentions.set), came: count(intentions.came), missed: count(intentions.missed) },
    reflection: { trueNow: text(reflection.trueNow), changed: text(reflection.changed), grateful: text(reflection.grateful), correction: text(reflection.correction) },
  }
}

function normalizeDecision(input: unknown): Decision | null {
  if (!isObject(input) || typeof input.title !== 'string' || !input.title.trim()) return null
  const status = input.status === 'open' || input.status === 'reviewed' ? input.status : 'decided'
  return {
    id: id(input.id), day: day(input.day) || localDay(), title: input.title.slice(0, CAP.title), context: text(input.context),
    options: text(input.options), choice: text(input.choice), why: text(input.why), reviewOn: day(input.reviewOn),
    outcome: text(input.outcome), status,
  }
}

function normalizeCard(input: unknown): CanvasCard | null {
  if (!isObject(input)) return null
  const kind = input.kind === 'image' ? 'image' : 'note'
  const card: CanvasCard = {
    id: id(input.id), kind, text: text(input.text), x: finite(input.x), y: finite(input.y),
    w: Math.min(800, Math.max(120, finite(input.w, 280))), h: Math.min(800, Math.max(80, finite(input.h, 160))),
  }
  if (kind === 'image') {
    if (typeof input.imageId !== 'string' || !input.imageId) return null
    card.imageId = input.imageId.slice(0, 80)
  }
  return card
}

function normalizeCanvas(input: unknown): CanvasState {
  const canvas = isObject(input) ? input : {}
  const view = isObject(canvas.view) ? canvas.view : {}
  const positions: CanvasState['positions'] = {}
  if (isObject(canvas.positions)) {
    for (const [key, value] of Object.entries(canvas.positions).slice(0, CAP.cards * 4)) {
      if (isObject(value) && Number.isFinite(value.x) && Number.isFinite(value.y)) positions[key.slice(0, 120)] = { x: value.x as number, y: value.y as number }
    }
  }
  return {
    cards: Array.isArray(canvas.cards) ? compact(canvas.cards.slice(0, CAP.cards).map(normalizeCard)) : [],
    positions,
    view: { x: finite(view.x), y: finite(view.y), zoom: Math.min(2.5, Math.max(0.2, finite(view.zoom, 0.6))) },
  }
}

/** Never throws. Anything malformed is dropped or reset field by field, so a damaged save cannot blank the Studio. */
export function normalizeState(input: unknown, now: Date = new Date()): StudioState {
  const base = emptyState(now)
  if (!isObject(input)) return base
  const today = localDay(now)
  const stamp = (value: unknown, fallback: string) => (typeof value === 'string' && !Number.isNaN(Date.parse(value)) ? value : fallback)
  // Optional: the key appears only when a valid program was saved, so a v1 save without one loads unchanged.
  const program = normalizeProgram(input.program)
  return {
    schema: 'reality-studio',
    version: 1,
    createdAt: stamp(input.createdAt, base.createdAt),
    updatedAt: stamp(input.updatedAt, base.updatedAt),
    sample: input.sample === true,
    soul: normalizeSoul(input.soul),
    atlas: normalizeAtlas(input.atlas),
    bridges: Array.isArray(input.bridges) ? compact(input.bridges.slice(0, CAP.bridges).map((bridge) => normalizeBridge(bridge, today))) : [],
    witness: Array.isArray(input.witness) ? compact(input.witness.slice(0, CAP.witness).map(normalizeWitness)) : [],
    days: normalizeDays(input.days),
    snapshots: Array.isArray(input.snapshots) ? compact(input.snapshots.slice(0, CAP.records).map(normalizeSnapshot)) : [],
    decisions: Array.isArray(input.decisions) ? compact(input.decisions.slice(0, CAP.records).map(normalizeDecision)) : [],
    canvas: normalizeCanvas(input.canvas),
    ...(program ? { program } : {}),
  }
}

/** True until the person has authored anything at all. */
export function isEmptyState(state: StudioState): boolean {
  const soul = state.soul
  const soulEmpty = !soul.name && !soul.purpose && !soul.scene && !soul.gifts && !soul.values.length && !soul.iAm.length && !soul.vows.length && !soul.gratitude.length
  const atlasEmpty = Object.values(state.atlas).every((domain) => domain.now === null && domain.want === null && !domain.fact && !domain.scene && !domain.priority)
  return soulEmpty && atlasEmpty && !state.bridges.length && !state.witness.length && !state.snapshots.length && !state.decisions.length && !state.canvas.cards.length && !Object.keys(state.days).length && !state.program
}
