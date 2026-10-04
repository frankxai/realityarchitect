export type View = 'today' | 'atlas' | 'bridges' | 'witness' | 'map' | 'timeline' | 'soul'

/** Switch view; for Bridges, optionally open one bridge in the editor. */
export type Go = (view: View, bridgeId?: string) => void

export const VIEWS: { id: View; label: string; title: string; intro: string }[] = [
  { id: 'today', label: 'Today', title: 'Today', intro: 'Morning: begin as the person who already lives there. Evening: witness the day.' },
  { id: 'atlas', label: 'Atlas', title: 'Atlas', intro: 'Twelve life domains: where you are, where you want to be. Coverage, not twelve projects at once.' },
  { id: 'bridges', label: 'Bridges', title: 'Bridges', intro: 'From what is true now to the scene: skills, systems, reps, bold moves, people and places, and an honest pace check.' },
  { id: 'witness', label: 'Witness', title: 'Witness', intro: 'Signs, wins, openings and reps, recorded as fact, meaning and action.' },
  { id: 'map', label: 'Map', title: 'Reality Map', intro: 'Now on the left, the vision on the right, your bridges in between. Add notes and images; export it for Obsidian.' },
  { id: 'timeline', label: 'Timeline', title: 'Timeline', intro: 'Seal approved snapshots, compare them across time, and review your decisions.' },
  { id: 'soul', label: 'Soul', title: 'Soul', intro: 'The inner contract: why you are building this life, and who you are being while you build it.' },
]

export const isView = (value: string): value is View => VIEWS.some((view) => view.id === value)
