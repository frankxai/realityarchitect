import { emptyAtlas } from './state.ts'
import { addDays } from './util.ts'
import type { Snapshot, StudioState, WitnessEntry, WitnessKind } from './types.ts'

/**
 * A fictional sample life (Mara, a composer) so a visitor can see every view filled before typing anything.
 * Dates are relative to `today` so the sample always looks current. Clearly marked with `sample: true`.
 */
export function sampleState(today: string): StudioState {
  const d = (offset: number) => addDays(today, offset)
  const at = (offset: number, hour: number) => `${d(offset)}T${String(hour).padStart(2, '0')}:15:00.000Z`

  const atlas = emptyAtlas()
  const scores: [keyof typeof atlas, number, number, string, string, boolean][] = [
    ['craft', 5, 9, 'Seven of ten songs are drafted; none is mixed.', 'I play back the final mix in a quiet studio and it sounds like I meant it.', true],
    ['body', 5, 8, 'I run twice a week when the weather allows.', 'I finish the river 10K smiling, with breath left to talk.', true],
    ['circle', 4, 7, 'I have not played for anyone outside my family in a year.', 'Twelve people in my living room, listening closely.', true],
    ['mind', 7, 8, 'I am learning to mix low end properly.', '', false],
    ['heart', 6, 8, 'Mornings are calm; evenings get noisy.', '', false],
    ['wealth', 4, 7, 'Teaching covers rent; the music covers nothing yet.', '', false],
    ['sanctuary', 7, 8, 'The studio corner is finally quiet.', '', false],
    ['love', 8, 9, 'We walk to the river most evenings.', '', false],
  ]
  for (const [domain, now, want, fact, scene, priority] of scores) atlas[domain] = { now, want, fact, scene, priority }

  const witness: WitnessEntry[] = []
  const add = (offset: number, hour: number, kind: WitnessKind, fact: string, extra: Partial<WitnessEntry> = {}) => {
    witness.push({ id: `sample-w-${witness.length + 1}`, at: at(offset, hour), day: d(offset), kind, fact, meaning: '', action: '', primed: false, ...extra })
  }
  add(-13, 7, 'rep', 'Ninety-minute finishing session on "Cedar".', { bridgeId: 'sample-album', repId: 'sample-rep-finish', domain: 'craft' })
  add(-12, 6, 'rep', 'Easy 5K along the river.', { bridgeId: 'sample-run', repId: 'sample-rep-run', domain: 'body' })
  add(-11, 7, 'rep', 'Finishing session: bridge section of "Cedar".', { bridgeId: 'sample-album', repId: 'sample-rep-finish', domain: 'craft' })
  add(-10, 19, 'gratitude', 'My partner listened to the rough mix twice without being asked.')
  add(-9, 6, 'rep', 'Intervals at the track, 6 × 400 m.', { bridgeId: 'sample-run', repId: 'sample-rep-run', domain: 'body' })
  add(-8, 7, 'rep', 'Finishing session: vocals on "Low Water".', { bridgeId: 'sample-album', repId: 'sample-rep-finish', domain: 'craft' })
  add(-6, 11, 'sign', 'A stranger at the café asked about the album artwork on my laptop.', {
    meaning: 'The work is ready to be seen.', action: 'Sent her the listening link the same morning.', primed: true, bridgeId: 'sample-album', domain: 'craft',
  })
  add(-5, 7, 'rep', 'Finishing session: printed the track list and timed every song.', { bridgeId: 'sample-album', repId: 'sample-rep-finish', domain: 'craft' })
  add(-4, 15, 'opening', 'A former student offered her living room for a listening evening.', {
    action: 'Said yes and proposed a date in November.', bridgeId: 'sample-album', domain: 'circle',
  })
  add(-3, 6, 'rep', 'Long run, 8K, slow and easy.', { bridgeId: 'sample-run', repId: 'sample-rep-run', domain: 'body' })
  add(-2, 21, 'lesson', 'Mixing after 9 pm makes everything sound too bright the next morning.', { action: 'No mixing after 8 pm.' })
  add(-1, 7, 'win', 'Finished the arrangement of "Low Water" before noon.', { bridgeId: 'sample-album', domain: 'craft' })
  add(0, 8, 'rep', 'Finishing session: first full pass on "Harbor".', { bridgeId: 'sample-album', repId: 'sample-rep-finish', domain: 'craft' })

  const kinds: WitnessKind[] = ['sign', 'win', 'rep', 'move', 'opening', 'lesson', 'gratitude']
  const zero = () => Object.fromEntries(kinds.map((kind) => [kind, 0])) as Snapshot['counts']
  const snapshotAtlas = (shift: number) => Object.fromEntries(
    Object.entries(atlas).map(([domain, value]) => [domain, { now: value.now === null ? null : Math.max(0, value.now - shift), want: value.want }]),
  ) as Snapshot['atlas']

  const first: Snapshot = {
    id: 'sample-snapshot-1', sealedAt: at(-14, 20), day: d(-14), periodStart: d(-21), atlas: snapshotAtlas(1),
    bridges: [
      { id: 'sample-album', title: 'Finish the album', state: 'early', repsLogged: 0, repsPlanned: 0, movesDone: 0, movesTotal: 2 },
      { id: 'sample-run', title: 'Run the river 10K', state: 'early', repsLogged: 0, repsPlanned: 0, movesDone: 0, movesTotal: 1 },
    ],
    counts: { ...zero(), gratitude: 2, lesson: 1 }, primedSigns: 0, unprimedSigns: 0,
    reflection: {
      trueNow: 'I keep starting new songs instead of finishing old ones.', changed: 'I said the album out loud to my partner.',
      grateful: 'The quiet studio corner.', correction: 'Finish before I start.',
    },
  }
  const second: Snapshot = {
    id: 'sample-snapshot-2', sealedAt: at(-7, 20), day: d(-7), periodStart: d(-13), atlas: snapshotAtlas(0),
    bridges: [
      { id: 'sample-album', title: 'Finish the album', state: 'on-pace', repsLogged: 3, repsPlanned: 3, movesDone: 0, movesTotal: 2 },
      { id: 'sample-run', title: 'Run the river 10K', state: 'behind', repsLogged: 2, repsPlanned: 3, movesDone: 0, movesTotal: 1 },
    ],
    counts: { ...zero(), rep: 5, gratitude: 1 }, primedSigns: 0, unprimedSigns: 0,
    reflection: {
      trueNow: 'Three finishing sessions in one week. That has not happened in a year.', changed: 'The mornings belong to the album now.',
      grateful: 'My partner listening twice.', correction: 'Run before the weather turns, not after.',
    },
  }

  return {
    schema: 'reality-studio',
    version: 1,
    createdAt: at(-21, 9),
    updatedAt: at(0, 9),
    sample: true,
    soul: {
      name: 'Mara (sample)',
      purpose: 'To make music that keeps people company in hard seasons, and to live a life quiet enough to hear it.',
      values: ['Honesty in the work', 'Health that lasts decades', 'Generosity with time', 'Craft over speed', 'Play'],
      iAm: ['I am a composer who finishes albums.', 'I am someone who protects her mornings.', 'I am a teacher who is generous with what she knows.'],
      scene: 'A Tuesday in late spring. The studio window is open and the room smells of coffee and cedar. I play back the last mix of the album at low volume and it sounds like I meant it. In the evening we walk to the river and do not talk about work.',
      gifts: 'One honest album a year, and free Sunday office hours for young composers.',
      vows: ['No email before noon.', 'I finish the piece before I start the next one.'],
      voice: 'direct',
      gratitude: ['The teachers who answered my first clumsy letters.', 'A body that can still sit at the piano for three hours.'],
    },
    atlas,
    bridges: [
      {
        id: 'sample-album', createdAt: d(-14), title: 'Finish the album', domain: 'craft',
        doneWhen: 'Ten mastered tracks are uploaded to the distributor.', by: d(72),
        scene: 'I play back the final mix in a quiet studio and it sounds like I meant it.',
        fact: 'Seven of ten songs drafted; none mixed.',
        obstacle: 'I open a new idea instead of finishing the current song.', gap: 'process',
        ifThen: 'write the idea in the idea log and return to the current song for 20 minutes',
        skills: ['Mixing low end', 'Deciding when a song is finished'],
        systems: ['Design: a one-page finishing spec per song', 'Automate: a weekly mix-review with an agent that compares versions'],
        reps: [{ id: 'sample-rep-finish', name: '90-minute finishing session', perWeek: 3 }],
        moves: [
          { id: 'sample-move-master', title: 'Book the mastering engineer', due: d(9), done: false },
          { id: 'sample-move-listening', title: 'Host a listening evening for twelve people', due: d(40), done: false },
        ],
        reach: [
          { id: 'sample-reach-engineer', kind: 'person', name: 'A mastering engineer who works with acoustic records', why: 'I cannot hear my own low end honestly yet.', status: 'wish' },
          { id: 'sample-reach-room', kind: 'place', name: 'A living room with twelve chairs', why: 'The songs need to be heard by people, not by algorithms first.', status: 'reached' },
        ],
        status: 'active',
      },
      {
        id: 'sample-run', createdAt: d(-14), title: 'Run the river 10K', domain: 'body',
        doneWhen: 'I finish the autumn river 10K without walking.', by: d(48),
        scene: 'I finish the river 10K smiling, with breath left to talk.',
        fact: 'I run twice a week when the weather allows.',
        obstacle: 'Rain makes me skip the run.', gap: 'process',
        ifThen: 'run the indoor track instead and count it the same',
        skills: ['Pacing by breath'],
        systems: ['See: a shared calendar block my partner can see'],
        reps: [{ id: 'sample-rep-run', name: 'Run (any distance)', perWeek: 3 }],
        moves: [{ id: 'sample-move-register', title: 'Register for the race', due: d(-2), done: false }],
        reach: [{ id: 'sample-reach-club', kind: 'place', name: 'The Thursday running club', why: 'Other people make the rainy days easier.', status: 'wish' }],
        status: 'active',
      },
    ],
    witness: witness.reverse(),
    days: {
      [d(-1)]: { lookFor: 'Someone who wants to hear the album', focusBridgeId: 'sample-album', rehearsed: true, correction: 'Start the session before opening messages.' },
      [d(0)]: { lookFor: 'A sign the album is wanted', focusBridgeId: 'sample-album', rehearsed: true, correction: '' },
    },
    snapshots: [second, first],
    decisions: [
      {
        id: 'sample-decision-master', day: d(-10), title: 'Hire a mastering engineer instead of mastering myself',
        context: 'My mixes sound different on every speaker.', options: 'Master it myself; trade lessons for mastering; hire an engineer.',
        choice: 'Hire an engineer.', why: 'It is the step I cannot judge honestly yet, and it unblocks the release date.',
        reviewOn: d(80), outcome: '', status: 'decided',
      },
      {
        id: 'sample-decision-teaching', day: d(-30), title: 'Teach three days a week instead of five',
        context: 'Five days left no mornings for the album.', options: 'Keep five days; four days; three days with higher rates.',
        choice: 'Three days with higher rates.', why: 'Mornings are where the album gets finished.',
        reviewOn: d(-1), outcome: '', status: 'decided',
      },
    ],
    canvas: {
      cards: [{ id: 'sample-card-cover', kind: 'note', text: 'Album cover: cedar wood, river light at 6 am, no faces.', x: 1680, y: -260, w: 300, h: 140 }],
      positions: {},
      view: { x: 0, y: 0, zoom: 0.6 },
    },
  }
}
