/**
 * The Library: Reality Theory and the honest canon. Original summaries in our own words; no book text is reproduced.
 * Teachers of the manifestation tradition are named only in this file, and every entry carries Keep, Mechanism and
 * Limits (scripts/check-public-claims.mjs and tests/library.test.mjs enforce both).
 */

export type Shelf = 'meaning' | 'mechanism' | 'frontier'
/** The same claim tags as the frankx.ai manifestation hub: research-backed, useful framing, or belief held lightly. */
export type ClaimTag = 'evidence' | 'practice' | 'belief'

export interface Source {
  label: string
  url: string
}

export interface Entry {
  id: string
  name: string
  works: string
  shelf: Shelf
  tags: ClaimTag[]
  keep: string
  mechanism: string
  limits: string
  inStudio: string
  sources: Source[]
}

export const ONE_LAW = ['attention', 'belief', 'action', 'environment', 'feedback', 'outcome'] as const

export const LAYERS = [
  {
    id: 'perceived',
    name: 'Perceived reality',
    what: 'What reaches you. Your experience is a model your brain builds from expectation and evidence.',
    moves: 'Attention, expectation, what you have trained yourself to notice.',
    practice: 'Witness, and one thing to look for each morning.',
  },
  {
    id: 'inner',
    name: 'Inner reality',
    what: 'Who is acting: identity, state, meaning, the scene you hold.',
    moves: 'Imagination, rehearsal, self-talk, values, rest.',
    practice: 'Soul, the “I am” lines, and the Imaginal Act.',
  },
  {
    id: 'outer',
    name: 'Outer reality',
    what: 'What exists: habits, systems, environments, relationships, results.',
    moves: 'Action, repetition, environment design, other people, time.',
    practice: 'Atlas and Bridges: skills, systems, reps, bold moves, people and places.',
  },
] as const

export const PRINCIPLES = [
  'Reality has three layers you can work on: what you perceive, who you are being, and what exists.',
  'Outcomes travel one chain: attention → belief → action → environment → feedback → outcome. Nothing skips it.',
  'Begin with the end as a scene, a moment you could live in on an ordinary day, not a wish you chase.',
  'Face what is true today. The obstacle belongs inside the plan, with an if-then response.',
  'Identity before outcome. Act as the person who already lives there, one small vote at a time.',
  'Build the bridge: skills to grow, systems to build, reps to repeat, bold moves to make, people and places to reach.',
  'Let systems carry what willpower cannot: environments, defaults, and agents.',
  'Witness honestly: record what happened, what it meant to you, and what you did, misses included.',
  'Seal the moment. Approve snapshots so you can see reality change across time.',
  'Your words, your data, your agency. You own the file; agents propose and never impose; other people keep their own will.',
] as const

export const SHELVES: { id: Shelf; title: string; intro: string }[] = [
  {
    id: 'meaning',
    title: 'The meaning shelf',
    intro: 'The manifestation teachers. Each points at something real about imagination, identity or state, and each makes claims we do not repeat. Keep the practice; know the limits.',
  },
  {
    id: 'mechanism',
    title: 'The mechanism shelf',
    intro: 'The research that explains why the useful practices work, and how much. These are the pathways every cause-and-effect claim on this site must pass through.',
  },
  {
    id: 'frontier',
    title: 'The frontier shelf',
    intro: 'Physics and philosophy of mind that people often borrow for manifestation. Serious ideas, worth wonder, labeled as philosophy. None says a wish changes an external event.',
  },
]

const wiki = (title: string, label = 'Wikipedia') => ({ label, url: `https://en.wikipedia.org/wiki/${title}` })
const doi = (id: string, label: string) => ({ label, url: `https://doi.org/${id}` })
const OETTINGEN_2002 = doi('10.1037/0022-3514.83.5.1198', 'Oettingen & Mayer, 2002: expectations versus fantasies')
const DUCKWORTH_2013 = { label: 'Duckworth et al., 2013: from fantasy to action (randomized study)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4106484/' }
const GOLLWITZER_2006 = doi('10.1016/S0065-2601(06)38002-1', 'Gollwitzer & Sheeran, 2006: implementation intentions meta-analysis')
const LALLY_2010 = doi('10.1002/ejsp.674', 'Lally et al., 2010: how habits form in the real world')
const BANDURA_1977 = doi('10.1037/0033-295X.84.2.191', 'Bandura, 1977: self-efficacy')
const EMMONS_2003 = doi('10.1037/0022-3514.84.2.377', 'Emmons & McCullough, 2003: counting blessings')
const FREQUENCY = wiki('Frequency_illusion', 'The frequency illusion')

export const ENTRIES: Entry[] = [
  {
    id: 'neville-goddard',
    name: 'Neville Goddard',
    works: 'Feeling Is the Secret (1944), The Power of Awareness (1952)',
    shelf: 'meaning',
    tags: ['practice', 'belief'],
    keep: 'Assume the end: picture a short, ordinary scene that would follow the wish fulfilled, in the first person and the present tense, and rest in it before sleep. In the evening, revise the day in imagination the way you wish it had gone.',
    mechanism: 'Mental rehearsal shapes expectation, attention and motivation, and identity-consistent imagery makes the next act easier to choose. Positive fantasy on its own can lower effort; paired with the obstacle and an if-then plan, it supports action.',
    limits: 'Neville taught that imagination creates reality directly, with events forming a “bridge of incidents” to the assumed state. That is a contemplative claim, not a demonstrated mechanism, and we never use it to read anyone’s circumstances as a failure of their imagination.',
    inStudio: 'Soul (the “I am” lines and the scene), Today (rest with the scene), and the Imaginal Act.',
    sources: [wiki('Neville_Goddard'), DUCKWORTH_2013],
  },
  {
    id: 'joe-dispenza',
    name: 'Joe Dispenza',
    works: 'Breaking the Habit of Being Yourself (2012), Becoming Supernatural (2017)',
    shelf: 'meaning',
    tags: ['practice', 'belief'],
    keep: 'A daily meditation that rehearses who you intend to be: notice the old automatic reactions, then mentally practice the thoughts, feelings and choices of your future self before the day begins.',
    mechanism: 'Meta-analyses find moderate benefits of meditation programs for anxiety, depression and pain, and mental practice improves performance on practiced tasks. Rehearsing a chosen response makes it more available when the old cue arrives.',
    limits: 'Claims that meditation reorganizes physical reality, works through a “quantum field”, or heals disease are not supported by the evidence. Meditation is not a replacement for medical care, and we do not repeat those claims.',
    inStudio: 'Today (morning rehearsal and one thing to look for) and Bridges (an if-then response to the old habit).',
    sources: [{ label: 'Official site', url: 'https://drjoedispenza.com/' }, doi('10.1001/jamainternmed.2013.13018', 'Goyal et al., 2014: meditation programs meta-analysis'), doi('10.1037/0021-9010.79.4.481', 'Driskell et al., 1994: mental practice and performance')],
  },
  {
    id: 'marisa-peer',
    name: 'Marisa Peer',
    works: 'I Am Enough (2018), Rapid Transformational Therapy',
    shelf: 'meaning',
    tags: ['practice'],
    keep: 'Notice the words you say to yourself and replace harsh, absolute ones with kind, specific ones. “I am enough” is a daily reminder that your worth is not earned by your output.',
    mechanism: 'Self-affirmation research finds that reflecting on core values can lower defensiveness and help people engage with hard information. The effects are real, modest, and depend on context.',
    limits: 'Outcome claims for single-session hypnotherapy go beyond the published evidence. Affirmations do not cause external events and are not therapy; if your inner voice is relentlessly harsh, a qualified therapist is the right next step.',
    inStudio: 'Soul (values, gratitude, and the voice your agents use with you) and Witness (wins as identity votes).',
    sources: [{ label: 'Official site', url: 'https://marisapeer.com/' }, doi('10.1146/annurev-psych-010213-115137', 'Cohen & Sherman, 2014: self-affirmation')],
  },
  {
    id: 'tony-robbins',
    name: 'Tony Robbins',
    works: 'Unlimited Power (1986), Awaken the Giant Within (1991)',
    shelf: 'meaning',
    tags: ['practice'],
    keep: 'Change your state first through body, focus and language. Plan by Result, Purpose and Massive Action. Raise your standards, and put yourself in rooms with people who already live the way you want to.',
    mechanism: 'Specific, difficult goals with a clear purpose outperform vague ones; action before motivation builds momentum; and environments and peers shape behavior more than willpower does.',
    limits: 'Peak states at events fade without a system to carry them, testimonials are not evidence, and massive action without a plan you can sustain tends to end in burnout. Here, massive action becomes dated bold moves plus small reps.',
    inStudio: 'Bridges (bold moves, reps, people and places) and Today (state before the day).',
    sources: [wiki('Tony_Robbins'), doi('10.1037/0003-066X.57.9.705', 'Locke & Latham, 2002: goal-setting theory')],
  },
  {
    id: 'the-secret',
    name: 'Rhonda Byrne',
    works: 'The Secret (2006)',
    shelf: 'meaning',
    tags: ['practice', 'belief'],
    keep: 'Get clear about what you want, write it down, and practice gratitude for what is already good.',
    mechanism: 'Specific goals focus attention, and gratitude journaling shows small, consistent gains in wellbeing. A goal you hold in mind makes related opportunities easier to notice, which is the frequency illusion at work.',
    limits: 'The law of attraction as a literal law of physics is unfalsifiable and unsupported, and its corollary, that people attract their misfortunes, does harm. Picturing the outcome without facing the obstacles is linked to lower effort. We keep the clarity and the gratitude and leave the cosmology.',
    inStudio: 'Soul (the scene and gratitude), Today (one thing to look for), and Witness (gratitude entries).',
    sources: [wiki('The_Secret_(Byrne_book)'), EMMONS_2003, OETTINGEN_2002],
  },
  {
    id: 'e-squared',
    name: 'Pam Grout',
    works: 'E-Squared (2013)',
    shelf: 'meaning',
    tags: ['practice', 'belief'],
    keep: 'Treat a belief as an experiment: state what you expect to see, set a time window, and watch.',
    mechanism: 'Writing a prediction down first is the heart of honest testing. Setting an intention primes attention, which is why expected things seem to appear more often once you are looking.',
    limits: 'The book’s experiments have no controls and remember hits while forgetting misses, so they cannot show that thought shapes events. Run them properly: write the prediction first, record what came and what did not, and keep both counts.',
    inStudio: 'Today (look for something, then mark whether it came) and Witness (primed and unprimed signs, the honest tally).',
    sources: [{ label: 'Official site', url: 'https://pamgrout.com/' }, FREQUENCY],
  },
  {
    id: 'joseph-murphy',
    name: 'Joseph Murphy',
    works: 'The Power of Your Subconscious Mind (1963)',
    shelf: 'meaning',
    tags: ['practice', 'belief'],
    keep: 'Repeat a short, calm statement of the outcome before sleep and on waking, and let it guide the choices of the day.',
    mechanism: 'Repetition makes an intention more mentally available, so it is more likely to guide what you notice and choose. Its effects run through attention and behavior.',
    limits: 'Claims that the subconscious mind heals illness or brings wealth by itself are not supported. Never delay medical care because of a practice like this one.',
    inStudio: 'Soul (the “I am” lines) and Today (the morning).',
    sources: [wiki('Joseph_Murphy_(author)')],
  },
  {
    id: 'abraham-hicks',
    name: 'Esther and Jerry Hicks',
    works: 'Ask and It Is Given (2004)',
    shelf: 'meaning',
    tags: ['practice', 'belief'],
    keep: 'Notice your emotional state, and reach for a slightly better-feeling thought instead of trying to leap from despair to joy.',
    mechanism: 'Gradual reappraisal is a studied emotion-regulation skill, and putting a feeling into words can lower its intensity.',
    limits: 'The teachings are presented as channeled from a non-physical source, and their account of “vibrational” attraction is a metaphysical belief, not a mechanism. We use only the reappraisal practice.',
    inStudio: 'Today (state before the day) and Witness (lessons).',
    sources: [wiki('Esther_Hicks'), doi('10.1037/1089-2680.2.3.271', 'Gross, 1998: emotion regulation'), doi('10.1111/j.1467-9280.2007.01916.x', 'Lieberman et al., 2007: putting feelings into words')],
  },
  {
    id: 'wayne-dyer',
    name: 'Wayne Dyer',
    works: 'The Power of Intention (2004), Wishes Fulfilled (2012)',
    shelf: 'meaning',
    tags: ['practice', 'belief'],
    keep: 'Speak and act as the person you intend to become, with generosity, and let a clear intention organize your days.',
    mechanism: 'Identity-based habits: each action is a vote for who you are becoming, and acting from a chosen identity raises the odds of the matching behavior.',
    limits: 'Dyer’s later books build on Neville’s assumption and on spiritual claims about intention as a force in the universe. Those are beliefs, held lightly here, never mechanisms.',
    inStudio: 'Soul (the “I am” lines and gifts) and Witness (wins).',
    sources: [wiki('Wayne_Dyer')],
  },
  {
    id: 'james-allen',
    name: 'James Allen',
    works: 'As a Man Thinketh (1903)',
    shelf: 'meaning',
    tags: ['practice'],
    keep: 'Character is cultivated like a garden: the thoughts you keep shape your habits, and your habits shape your circumstances over time.',
    mechanism: 'Read as thought, then character, then action, then result, it matches the One Law and modern habit research.',
    limits: 'Read as thought acting directly on circumstance, it slides into blaming people for poverty or illness. We read it the first way.',
    inStudio: 'Soul (vows and values) and the One Law.',
    sources: [wiki('As_a_Man_Thinketh')],
  },
  {
    id: 'napoleon-hill',
    name: 'Napoleon Hill',
    works: 'Think and Grow Rich (1937)',
    shelf: 'meaning',
    tags: ['practice', 'belief'],
    keep: 'A definite aim, written down and read daily; a concrete plan; persistence; and a mastermind of people working toward it with you.',
    mechanism: 'Goal specificity, planning, persistence and peer support each have good support in research.',
    limits: 'The book’s research method does not meet a modern standard, its examples are shaped by survivorship bias, and “thoughts become riches” is not a mechanism. Nothing here is financial advice.',
    inStudio: 'Bridges (done when, bold moves, people and places).',
    sources: [wiki('Think_and_Grow_Rich')],
  },
  {
    id: 'maxwell-maltz',
    name: 'Maxwell Maltz',
    works: 'Psycho-Cybernetics (1960)',
    shelf: 'meaning',
    tags: ['practice'],
    keep: 'Your self-image steers your behavior. Rehearse the self-image you want, vividly and often, and act from it.',
    mechanism: 'Self-efficacy, your belief in your capacity to act, predicts what you attempt and how long you persist, and it grows most from small, real successes.',
    limits: 'The famous “21 days to form a habit” is a misreading. In a field study, habits took from 18 to 254 days to form, about 66 on average. Plan for months, not weeks.',
    inStudio: 'Witness (wins) and Bridges (reps sized so you succeed).',
    sources: [wiki('Psycho-Cybernetics'), BANDURA_1977, LALLY_2010],
  },
  {
    id: 'oettingen',
    name: 'Gabriele Oettingen',
    works: 'Rethinking Positive Thinking (2014), WOOP',
    shelf: 'mechanism',
    tags: ['evidence'],
    keep: 'Wish, Outcome, Obstacle, Plan: imagine the outcome, then the inner obstacle, then an if-then plan for meeting it.',
    mechanism: 'In experiments, positive fantasies alone sapped energy and effort, while contrasting the desired future with present obstacles, combined with if-then plans, improved follow-through, including in a randomized study with students.',
    limits: 'Effects vary by person and goal. It is a tool for goals you can influence, not a promise of outcomes.',
    inStudio: 'The Imaginal Act and Bridges (scene, obstacle, if-then).',
    sources: [OETTINGEN_2002, DUCKWORTH_2013, { label: 'WOOP (official)', url: 'https://woopmylife.org/' }],
  },
  {
    id: 'gollwitzer',
    name: 'Peter Gollwitzer',
    works: 'Implementation intentions',
    shelf: 'mechanism',
    tags: ['evidence'],
    keep: 'Decide in advance: “If situation X happens, then I will do Y.”',
    mechanism: 'A meta-analysis of 94 independent tests found a medium-to-large effect of if-then plans on goal attainment, over and above the goal itself.',
    limits: 'If-then plans help you start and stay on track. They do not create motivation for a goal you do not actually hold.',
    inStudio: 'Bridges (the if-then plan) and the Imaginal Act.',
    sources: [GOLLWITZER_2006, wiki('Implementation_intention')],
  },
  {
    id: 'bandura',
    name: 'Albert Bandura',
    works: 'Self-efficacy (1977)',
    shelf: 'mechanism',
    tags: ['evidence'],
    keep: 'Build belief in your ability from small, real successes, from watching people like you succeed, and from encouragement.',
    mechanism: 'Self-efficacy predicts effort, persistence and which activities people choose, and mastery experiences are its strongest source.',
    limits: 'Belief that runs far ahead of skill becomes overconfidence. Keep it calibrated to evidence.',
    inStudio: 'Witness (wins) and Bridges (reps).',
    sources: [BANDURA_1977, wiki('Self-efficacy')],
  },
  {
    id: 'habits',
    name: 'James Clear and BJ Fogg',
    works: 'Atomic Habits (2018), Tiny Habits (2019)',
    shelf: 'mechanism',
    tags: ['evidence', 'practice'],
    keep: 'Make the behavior tiny, anchor it to something you already do, and let each repetition count as a vote for the identity you want.',
    mechanism: 'A large share of daily behavior is habitual, and repetition in a stable context makes actions automatic over weeks to months.',
    limits: '“One percent better every day” is an illustration, not a measured result. Real progress plateaus and dips.',
    inStudio: 'Bridges (reps), Today (log a rep), and Soul (the “I am” lines).',
    sources: [LALLY_2010, wiki('Atomic_Habits')],
  },
  {
    id: 'constructed',
    name: 'Anil Seth and Lisa Feldman Barrett',
    works: 'Being You (2021), How Emotions Are Made (2017)',
    shelf: 'mechanism',
    tags: ['evidence'],
    keep: 'Your experience of the world is a model your brain builds from predictions and evidence. Change the predictions through attention, experience and practice, and experience changes.',
    mechanism: 'Predictive processing and the theory of constructed emotion are leading scientific accounts of perception and feeling. They explain why expectation and attention change what you notice and how you feel.',
    limits: '“Reality is constructed” here means perceived reality, inside a person. It does not mean the outside world bends to belief.',
    inStudio: 'Reality Theory (the perceived layer) and Today (one thing to look for).',
    sources: [wiki('Anil_Seth'), wiki('Theory_of_constructed_emotion', 'The theory of constructed emotion')],
  },
  {
    id: 'gratitude',
    name: 'Robert Emmons and Martin Seligman',
    works: 'Counting blessings (2003), Three good things (2005)',
    shelf: 'mechanism',
    tags: ['evidence'],
    keep: 'Write down what went well, and why, a few times a week.',
    mechanism: 'Controlled studies find that gratitude and “three good things” exercises can raise wellbeing. The effects are modest and consistent.',
    limits: 'Gratitude is not a lever on events, and it is not a substitute for treating depression.',
    inStudio: 'Witness (gratitude), Soul (gratitude), and Timeline (grateful for).',
    sources: [EMMONS_2003, doi('10.1037/0003-066X.60.5.410', 'Seligman et al., 2005: positive psychology interventions')],
  },
  {
    id: 'wiseman',
    name: 'Richard Wiseman',
    works: 'The Luck Factor (2003)',
    shelf: 'mechanism',
    tags: ['evidence', 'practice'],
    keep: 'Relax your attention and stay open to chance: talk to new people, vary your routines, and follow up on what you notice.',
    mechanism: 'In Wiseman’s studies, people who saw themselves as lucky were more relaxed and noticed opportunities the others missed. Part of luck is attention.',
    limits: 'These are small studies written up for a general audience. Treat them as a useful lens, not settled science.',
    inStudio: 'Today (one thing to look for) and Witness (openings and signs).',
    sources: [wiki('Richard_Wiseman')],
  },
  {
    id: 'stoics',
    name: 'Marcus Aurelius and Epictetus',
    works: 'Meditations, Enchiridion',
    shelf: 'mechanism',
    tags: ['practice'],
    keep: 'Separate what is up to you from what is not. Prepare for the day in the morning, and review it in the evening.',
    mechanism: 'The Stoic split between what you control and what you do not is an ancestor of modern cognitive reappraisal, and a fixed evening review turns experience into a correction.',
    limits: 'Acceptance is not resignation. The Stoics paired it with vigorous action on whatever is yours to change.',
    inStudio: 'Today (morning and evening) and Timeline (snapshots).',
    sources: [wiki('Stoicism')],
  },
  {
    id: 'jung-synchronicity',
    name: 'Carl Jung',
    works: 'Synchronicity (1952)',
    shelf: 'frontier',
    tags: ['belief'],
    keep: 'A meaningful coincidence can be honored as meaningful to you, and used as a prompt to act.',
    mechanism: 'Jung himself called synchronicity acausal: events connected by meaning, not by cause. Selective attention and the frequency illusion explain why such coincidences cluster once you are looking.',
    limits: 'Synchronicity is a framework for meaning, not evidence that the world is responding to your thoughts.',
    inStudio: 'Witness (signs: what happened, what it meant to you, what you did).',
    sources: [wiki('Synchronicity'), FREQUENCY],
  },
  {
    id: 'wheeler',
    name: 'John Archibald Wheeler',
    works: '“It from bit” and the participatory universe (1989)',
    shelf: 'frontier',
    tags: ['belief'],
    keep: 'A great physicist’s provocation: that observation and information may be woven into what physics describes. Worth wonder.',
    mechanism: 'In quantum physics, an observation is a physical interaction with a measuring system. It is not a conscious wish.',
    limits: 'Wheeler’s speculation concerns the foundations of physics. It says nothing about personal desires shaping daily events.',
    inStudio: 'The Library only: a frontier to wonder about, not a practice.',
    sources: [wiki('John_Archibald_Wheeler')],
  },
  {
    id: 'bohm',
    name: 'David Bohm',
    works: 'Wholeness and the Implicate Order (1980)',
    shelf: 'frontier',
    tags: ['belief'],
    keep: 'An invitation to see the world as undivided wholeness, which many people find helpful for compassion and for systems thinking.',
    mechanism: 'Bohm’s pilot-wave interpretation reproduces the predictions of standard quantum mechanics. The implicate order is his philosophical extension of it.',
    limits: 'It is philosophy and one interpretation of physics, not evidence that the mind moves matter.',
    inStudio: 'The Library only.',
    sources: [{ label: 'Stanford Encyclopedia: Bohmian mechanics', url: 'https://plato.stanford.edu/entries/qm-bohm/' }, wiki('Implicate_and_explicate_order', 'Implicate and explicate order')],
  },
  {
    id: 'relational-qbism',
    name: 'Carlo Rovelli and Christopher Fuchs',
    works: 'Relational quantum mechanics, QBism',
    shelf: 'frontier',
    tags: ['belief'],
    keep: 'Two serious readings of quantum theory: properties are relations between systems (Rovelli), and a quantum state expresses an agent’s expectations (QBism).',
    mechanism: 'Both are interpretations of the same equations, and both make the same experimental predictions as standard quantum mechanics.',
    limits: 'Neither says that wishing changes an external event. QBism’s agent is about belief and decision, not about manifesting outcomes.',
    inStudio: 'The Library only.',
    sources: [{ label: 'Stanford Encyclopedia: relational quantum mechanics', url: 'https://plato.stanford.edu/entries/qm-relational/' }, { label: 'Stanford Encyclopedia: QBism', url: 'https://plato.stanford.edu/entries/quantum-bayesian/' }],
  },
  {
    id: 'hoffman',
    name: 'Donald Hoffman',
    works: 'The Case Against Reality (2019)',
    shelf: 'frontier',
    tags: ['belief'],
    keep: 'Perception may be a user interface tuned for survival rather than a window on how things are. A humbling and useful idea.',
    mechanism: 'The argument rests on evolutionary game-theory simulations, and it is debated among philosophers and scientists.',
    limits: 'Even if perception is an interface, actions still have consequences. It is not permission to treat outcomes as optional.',
    inStudio: 'Reality Theory (the perceived layer).',
    sources: [wiki('Donald_D._Hoffman')],
  },
  {
    id: 'orch-or',
    name: 'Roger Penrose and Stuart Hameroff',
    works: 'Orchestrated objective reduction (1990s)',
    shelf: 'frontier',
    tags: ['belief'],
    keep: 'A bold hypothesis: that consciousness involves quantum processes inside neurons.',
    mechanism: 'It is a minority hypothesis with ongoing experiments and strong critics. It has not been established.',
    limits: 'Even if it were true, it would describe how brains work, not a channel through which thoughts move events outside the body.',
    inStudio: 'The Library only.',
    sources: [wiki('Orchestrated_objective_reduction')],
  },
]

/** What we do not claim. Each common claim is quoted in order to correct it. */
export const MYTHS: { claim: string; correction: string }[] = [
  {
    claim: 'Thoughts are frequencies that attract matching events.',
    correction: 'No measurable emission of that kind exists, and nothing in physics lets a thought reorganize events at a distance. What is real: attention changes what you notice, expectation changes how you act, and both change results through behavior.',
  },
  {
    claim: 'Quantum physics proves that consciousness creates reality.',
    correction: 'In quantum mechanics an observation is a physical interaction with a measuring device. Serious interpretations, such as relational quantum mechanics and QBism, debate what the theory describes; none says a wish changes an external event.',
  },
  {
    claim: 'Raise your vibration to attract money.',
    correction: 'There is no mechanism for this. Money follows value, skill, offers, people and time, which is what a bridge plans and the Witness ledger tracks.',
  },
  {
    claim: 'Visualize it vividly and it will come.',
    correction: 'Positive fantasy on its own is linked to lower effort. Picturing the outcome, then the obstacle, then an if-then plan is the version that helps.',
  },
  {
    claim: 'If it did not happen, you did not believe enough.',
    correction: 'This cannot be tested and it blames people for their circumstances. Look at the plan, the reps, the environment, the time, and what was outside your control.',
  },
  {
    claim: 'Meditation and positive thinking can heal disease on their own.',
    correction: 'Meditation has modest, real benefits for stress, anxiety and pain. It is not a cure, and it is never a reason to delay medical care.',
  },
]

export const PATHS: { id: string; want: string; read: string[]; practice: string; href: string }[] = [
  { id: 'end', want: 'Feel the end as already real', read: ['neville-goddard', 'oettingen', 'gollwitzer'], practice: 'Write your scene and “I am” lines, then the Imaginal Act.', href: '/threshold' },
  { id: 'signs', want: 'Notice signs and openings', read: ['jung-synchronicity', 'wiseman', 'e-squared', 'constructed'], practice: 'Set one thing to look for each morning; witness honestly.', href: '/studio#today' },
  { id: 'state', want: 'Change your state and your self-talk', read: ['joe-dispenza', 'marisa-peer', 'tony-robbins', 'abraham-hicks'], practice: 'Rest with the scene before the day; keep your voice kind.', href: '/studio#soul' },
  { id: 'build', want: 'Turn the vision into a life', read: ['habits', 'gollwitzer', 'tony-robbins', 'napoleon-hill', 'bandura'], practice: 'Build a bridge with reps, bold moves, and people and places.', href: '/studio#bridges' },
  { id: 'wonder', want: 'Wonder about reality itself', read: ['constructed', 'hoffman', 'wheeler', 'bohm', 'relational-qbism', 'orch-or'], practice: 'Read the frontier shelf, and keep the wonder separate from the plan.', href: '#frontier' },
]

export const TAG_LABEL: Record<ClaimTag, { label: string; hint: string }> = {
  evidence: { label: 'Evidence', hint: 'research-backed' },
  practice: { label: 'Practice', hint: 'a useful framing to act on' },
  belief: { label: 'Belief', hint: 'held lightly, not a mechanism' },
}
