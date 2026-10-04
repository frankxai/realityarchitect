import type { DomainId, GapClass, WitnessKind } from './types.ts'

export interface Domain {
  id: DomainId
  label: string
  short: string
  /** The question the Atlas asks for this domain. */
  prompt: string
}

/** Twelve original life-domain names (from the Imaginal Act, #38). Coverage, not twelve simultaneous projects. */
export const DOMAINS: readonly Domain[] = [
  { id: 'body', label: 'Body & Vitality', short: 'Body', prompt: 'Energy, sleep, movement, strength, how your body carries your days.' },
  { id: 'mind', label: 'Mind & Mastery', short: 'Mind', prompt: 'What you are learning, how you think, the skills you are deepening.' },
  { id: 'heart', label: 'Heart & State', short: 'Heart', prompt: 'Your emotional weather, how you recover, what steadies you.' },
  { id: 'character', label: 'Character & Code', short: 'Character', prompt: 'The standards you keep and the person your actions say you are.' },
  { id: 'spirit', label: 'Spirit & Source', short: 'Spirit', prompt: 'Meaning, faith or practice, what you feel connected to.' },
  { id: 'love', label: 'Love & Union', short: 'Love', prompt: 'Partnership and intimacy, as it is and as you would like it to be.' },
  { id: 'lineage', label: 'Lineage & Legacy', short: 'Lineage', prompt: 'Family, those who came before and after you, what you hand on.' },
  { id: 'circle', label: 'Circle & Community', short: 'Circle', prompt: 'Friends, peers, mentors, the rooms you belong to.' },
  { id: 'wealth', label: 'Wealth & Sovereignty', short: 'Wealth', prompt: 'Money, freedom of choice, the margin you have to decide.' },
  { id: 'craft', label: 'Craft & Contribution', short: 'Craft', prompt: 'Your work, what you make, the contribution you are proud of.' },
  { id: 'sanctuary', label: 'Sanctuary & Lifestyle', short: 'Sanctuary', prompt: 'Your home, places, rhythm, the texture of ordinary days.' },
  { id: 'golden-age', label: 'The Golden Age', short: 'Vision', prompt: 'The whole life seen from far ahead: what it all adds up to.' },
]

export const DOMAIN_IDS: readonly DomainId[] = DOMAINS.map((domain) => domain.id)

const BY_ID = new Map<string, Domain>(DOMAINS.map((domain) => [domain.id, domain]))

export function isDomainId(value: unknown): value is DomainId {
  return typeof value === 'string' && BY_ID.has(value)
}

export function domainLabel(id: string | undefined): string {
  return (id && BY_ID.get(id)?.label) || 'No domain'
}

export const GAP_CLASSES: readonly { id: GapClass; label: string; hint: string }[] = [
  { id: 'knowledge', label: 'Knowledge', hint: 'I do not know how yet.' },
  { id: 'capability', label: 'Capability', hint: 'I know how, but cannot do it well yet.' },
  { id: 'resource', label: 'Resource', hint: 'Money, tools, space or materials are missing.' },
  { id: 'coordination', label: 'Coordination', hint: 'It depends on other people lining up.' },
  { id: 'technology', label: 'Technology', hint: 'A system, agent or automation is missing.' },
  { id: 'permission', label: 'Permission', hint: 'Someone has to allow it, or a rule applies.' },
  { id: 'process', label: 'Process', hint: 'The habit, routine or order of work gets in the way.' },
  { id: 'evidence', label: 'Evidence', hint: 'I cannot yet tell whether it is working.' },
  { id: 'time', label: 'Time', hint: 'There is no protected time for it.' },
]

export function isGapClass(value: unknown): value is GapClass {
  return typeof value === 'string' && GAP_CLASSES.some((gap) => gap.id === value)
}

export const WITNESS_KINDS: readonly { id: WitnessKind; label: string; hint: string }[] = [
  { id: 'sign', label: 'Sign', hint: 'A meaningful coincidence. Its meaning is yours.' },
  { id: 'win', label: 'Win', hint: 'A vote for who you are becoming.' },
  { id: 'rep', label: 'Rep', hint: 'A practice you did.' },
  { id: 'move', label: 'Bold move', hint: 'A one-off act that took courage.' },
  { id: 'opening', label: 'Opening', hint: 'An opportunity, a person, a door.' },
  { id: 'lesson', label: 'Lesson', hint: 'Something you would do differently.' },
  { id: 'gratitude', label: 'Gratitude', hint: 'Something already good.' },
]

export function isWitnessKind(value: unknown): value is WitnessKind {
  return typeof value === 'string' && WITNESS_KINDS.some((kind) => kind.id === value)
}

export function witnessLabel(kind: WitnessKind): string {
  return WITNESS_KINDS.find((entry) => entry.id === kind)?.label ?? kind
}
