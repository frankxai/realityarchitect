import { DOMAINS, witnessLabel } from './domains.ts'
import { assessPace } from './pace.ts'
import type { StudioState } from './types.ts'

export type MapTone = 'now' | 'vision' | 'bridge' | 'rep' | 'move' | 'reach' | 'witness' | 'note' | 'image'

export interface MapNode {
  id: string
  tone: MapTone
  x: number
  y: number
  w: number
  h: number
  title: string
  body: string
  /** Free cards are the person's own notes and images; everything else is derived from the Studio. */
  free: boolean
  bridgeId?: string
  imageId?: string
}

export interface MapEdge {
  id: string
  from: string
  to: string
}

export interface MapLayout {
  nodes: MapNode[]
  edges: MapEdge[]
  bounds: { minX: number; minY: number; maxX: number; maxY: number }
  /** The x of the vision column, for drawing column labels. */
  visionX: number
}

const LANE_X = 420
const ITEM_X = LANE_X + 330
const ITEM_STEP = 240
const LANE_Y = 340
const LANE_H = 330
const MIN_VISION_X = 1680
const LAST_WITNESSED = 6

/**
 * Now (reported) on the left, one lane per active bridge, the vision (desired) on the right. Plan items (reps, bold
 * moves, people and places) sit on the lane; the last few witnessed moments sit just below it, in time order.
 */
export function layoutMap(state: StudioState, today: string): MapLayout {
  const nodes: MapNode[] = []
  const edges: MapEdge[] = []
  const active = state.bridges.filter((bridge) => bridge.status === 'active')

  const lanes = active.map((bridge) => {
    const plan = [
      ...bridge.reps.map((rep) => ({ id: `rep:${rep.id}`, tone: 'rep' as const, title: `Rep · ${rep.perWeek}× a week`, body: rep.name })),
      ...bridge.moves.map((move) => ({
        id: `move:${move.id}`, tone: 'move' as const,
        title: move.done ? `Bold move · done${move.doneAt ? ` ${move.doneAt}` : ''}` : `Bold move · planned${move.due ? `, ${move.due}` : ''}`,
        body: move.title,
      })),
      ...bridge.reach.map((reach) => ({ id: `reach:${reach.id}`, tone: 'reach' as const, title: `${reach.kind === 'place' ? 'Place' : 'Person'} · ${reach.status}`, body: reach.name })),
    ]
    const witnessed = state.witness
      .filter((entry) => entry.bridgeId === bridge.id)
      .sort((a, b) => (a.day === b.day ? a.at.localeCompare(b.at) : a.day.localeCompare(b.day)))
      .slice(-LAST_WITNESSED)
      .map((entry) => ({
        id: `w:${entry.id}`, tone: 'witness' as const,
        title: `${witnessLabel(entry.kind)}${entry.kind === 'sign' ? (entry.primed ? ' · primed' : ' · unprimed') : ''} · ${entry.day}`,
        body: entry.fact,
      }))
    return { bridge, plan, witnessed }
  })

  const widest = lanes.reduce((max, lane) => Math.max(max, lane.plan.length, lane.witnessed.length), 0)
  const visionX = Math.max(MIN_VISION_X, ITEM_X + widest * ITEM_STEP + 60)

  const priorities = DOMAINS.filter((domain) => state.atlas[domain.id].priority)
  if (priorities.length) {
    nodes.push({
      id: 'now:atlas', tone: 'now', x: 0, y: 0, w: 320, h: 150, free: false, title: 'Where I am now',
      body: priorities.map((domain) => `${domain.label}: ${state.atlas[domain.id].now ?? '–'} → ${state.atlas[domain.id].want ?? '–'}`).join('\n'),
    })
  }
  const soulBody = [state.soul.scene.trim(), ...state.soul.iAm].filter(Boolean).join('\n\n')
  if (soulBody) nodes.push({ id: 'vision:soul', tone: 'vision', x: visionX, y: 0, w: 360, h: 220, free: false, title: 'The life I am building', body: soulBody })

  lanes.forEach(({ bridge, plan, witnessed }, index) => {
    const y = LANE_Y + index * LANE_H
    const pace = assessPace(bridge, state.witness, today)
    nodes.push({ id: `now:${bridge.id}`, tone: 'now', x: 0, y, w: 320, h: 130, free: false, bridgeId: bridge.id, title: 'True now', body: bridge.fact.trim() || 'Not written yet.' })
    nodes.push({ id: `bridge:${bridge.id}`, tone: 'bridge', x: LANE_X, y, w: 290, h: 130, free: false, bridgeId: bridge.id, title: bridge.title || 'Untitled aim', body: pace.headline })
    plan.forEach((item, i) => nodes.push({ ...item, x: ITEM_X + i * ITEM_STEP, y, w: 220, h: 100, free: false, bridgeId: bridge.id }))
    witnessed.forEach((item, i) => nodes.push({ ...item, x: ITEM_X + i * ITEM_STEP, y: y + 140, w: 220, h: 110, free: false, bridgeId: bridge.id }))
    nodes.push({ id: `vision:${bridge.id}`, tone: 'vision', x: visionX, y, w: 360, h: 160, free: false, bridgeId: bridge.id, title: 'The scene', body: bridge.scene.trim() || 'Not written yet.' })
    edges.push({ id: `e:now:${bridge.id}`, from: `now:${bridge.id}`, to: `bridge:${bridge.id}` })
    edges.push({ id: `e:vision:${bridge.id}`, from: `bridge:${bridge.id}`, to: `vision:${bridge.id}` })
  })

  for (const card of state.canvas.cards) {
    nodes.push({
      id: `card:${card.id}`, tone: card.kind === 'image' ? 'image' : 'note', x: card.x, y: card.y, w: card.w, h: card.h,
      free: true, title: '', body: card.text, ...(card.imageId ? { imageId: card.imageId } : {}),
    })
  }

  for (const node of nodes) {
    const moved = state.canvas.positions[node.id]
    if (!node.free && moved && Number.isFinite(moved.x) && Number.isFinite(moved.y)) {
      node.x = moved.x
      node.y = moved.y
    }
  }

  const bounds = nodes.length
    ? {
        minX: Math.min(...nodes.map((node) => node.x)),
        minY: Math.min(...nodes.map((node) => node.y)),
        maxX: Math.max(...nodes.map((node) => node.x + node.w)),
        maxY: Math.max(...nodes.map((node) => node.y + node.h)),
      }
    : { minX: 0, minY: 0, maxX: 0, maxY: 0 }
  return { nodes, edges, bounds, visionX }
}

export interface JsonCanvasNode {
  id: string
  type: 'text' | 'file' | 'group'
  x: number
  y: number
  width: number
  height: number
  text?: string
  file?: string
  label?: string
  color?: string
}

export interface JsonCanvas {
  nodes: JsonCanvasNode[]
  edges: { id: string; fromNode: string; toNode: string; fromSide: 'right'; toSide: 'left' }[]
}

/** JSON Canvas preset colors: 2 orange, 3 yellow, 4 green, 5 cyan, 6 purple. */
const COLOR: Partial<Record<MapTone, string>> = { vision: '3', bridge: '5', rep: '5', move: '2', reach: '4', witness: '6' }

/** JSON Canvas 1.0 (jsoncanvas.org): opens in Obsidian on desktop and mobile. */
export function toJsonCanvas(layout: MapLayout, imagePath: (imageId: string) => string): JsonCanvas {
  const round = (value: number) => Math.round(value)
  const groups: JsonCanvasNode[] = []
  const laneIds = [...new Set(layout.nodes.filter((node) => node.tone === 'bridge').map((node) => node.bridgeId as string))]
  for (const bridgeId of laneIds) {
    const lane = layout.nodes.filter((node) => node.bridgeId === bridgeId && node.tone !== 'now' && node.tone !== 'vision')
    const title = lane.find((node) => node.tone === 'bridge')?.title ?? 'Bridge'
    const minX = Math.min(...lane.map((node) => node.x)) - 30
    const minY = Math.min(...lane.map((node) => node.y)) - 50
    const maxX = Math.max(...lane.map((node) => node.x + node.w)) + 30
    const maxY = Math.max(...lane.map((node) => node.y + node.h)) + 30
    groups.push({ id: `group:${bridgeId}`, type: 'group', x: round(minX), y: round(minY), width: round(maxX - minX), height: round(maxY - minY), label: `Bridge · ${title}` })
  }
  const nodes: JsonCanvasNode[] = layout.nodes.map((node) => {
    const base = { id: node.id, x: round(node.x), y: round(node.y), width: round(node.w), height: round(node.h), ...(COLOR[node.tone] ? { color: COLOR[node.tone] } : {}) }
    if (node.tone === 'image' && node.imageId) return { ...base, type: 'file', file: imagePath(node.imageId) }
    return { ...base, type: 'text', text: node.title ? `**${node.title}**\n\n${node.body}` : node.body }
  })
  return {
    nodes: [...groups, ...nodes],
    edges: layout.edges.map((edge) => ({ id: edge.id, fromNode: edge.from, toNode: edge.to, fromSide: 'right', toSide: 'left' })),
  }
}
