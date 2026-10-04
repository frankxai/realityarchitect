import { DOMAINS } from './domains.ts'
import type { StudioState } from './types.ts'

export type BoardTile =
  | { kind: 'scene'; id: string; title: string; text: string; source: 'soul' | 'bridge' | 'atlas' }
  | { kind: 'image'; id: string; cardId: string; imageId: string; caption: string }

/**
 * The vision board: the person's own scenes (all desired, all in their words) and the images they chose for the map,
 * interleaved so neither crowds the other out. Order: the life they are building (soul), the scenes of active
 * bridges, then the Atlas, priority domains first. Nothing here is generated or inferred.
 */
export function visionBoard(state: StudioState): BoardTile[] {
  const scenes: BoardTile[] = []
  const soul = state.soul.scene.trim()
  if (soul) scenes.push({ kind: 'scene', id: 'soul', title: 'The life I am building', text: soul, source: 'soul' })
  for (const bridge of state.bridges) {
    if (bridge.status !== 'active' || !bridge.scene.trim()) continue
    scenes.push({ kind: 'scene', id: `bridge:${bridge.id}`, title: bridge.title.trim() || 'Untitled aim', text: bridge.scene.trim(), source: 'bridge' })
  }
  const atlas = DOMAINS.map((domain) => ({ domain, entry: state.atlas[domain.id] }))
    .filter(({ entry }) => entry && entry.scene.trim())
    .sort((a, b) => Number(b.entry.priority) - Number(a.entry.priority))
  for (const { domain, entry } of atlas) scenes.push({ kind: 'scene', id: `atlas:${domain.id}`, title: domain.label, text: entry.scene.trim(), source: 'atlas' })

  // The same scene is often written for an aim and for its domain; it shows once, under its first source.
  const seen = new Set<string>()
  const unique = scenes.filter((tile) => {
    const key = tile.kind === 'scene' ? tile.text.toLowerCase().replace(/\s+/g, ' ') : tile.id
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const images: BoardTile[] = state.canvas.cards.flatMap((card) => (card.kind === 'image' && card.imageId
    ? [{ kind: 'image' as const, id: `image:${card.id}`, cardId: card.id, imageId: card.imageId, caption: card.text.trim() }]
    : []))

  const tiles: BoardTile[] = []
  for (let index = 0; index < Math.max(unique.length, images.length); index += 1) {
    if (unique[index]) tiles.push(unique[index])
    if (images[index]) tiles.push(images[index])
  }
  return tiles
}
