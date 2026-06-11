'use client'

import { useState } from 'react'
import Link from 'next/link'
import { site } from '@/lib/site'

interface Lever {
  id: string
  number: string
  name: string
  loopMove: 'See' | 'Design' | 'Build' | 'Automate' | 'Compound'
  focus: string
  ancient: {
    text: string
    source: string
  }
  modern: {
    text: string
    science: string
  }
  mechanism: string
  aiAmplifier: string
  honestLimit: string
}

const LEVERS: Lever[] = [
  {
    id: 'clarity',
    number: '01',
    name: 'Clarity & Aim',
    loopMove: 'Design',
    focus: 'the spec of the outcome',
    ancient: {
      text: 'Stoic prohairesis — the disciplined faculty of choice. The defined reason-to-rise of ikigai.',
      source: 'Epictetus, Discourses'
    },
    modern: {
      text: 'Goal-Setting Theory shows specific, difficult goals beat "do your best" in ~90% of cases. Implementation intentions ("if X, then Y") add d ≈ 0.65 to attainment.',
      science: 'Locke & Latham; Gollwitzer & Sheeran'
    },
    mechanism: 'A precise, committed aim directs attention to relevant cues, mobilizes effort, sustains persistence, and triggers strategy-search. If-then plans pre-delegate the action to a trigger, bypassing in-the-moment willpower.',
    aiAmplifier: 'An agent that interrogates a fuzzy goal into strict specificity, maps the obstacles, and drafts a comprehensive if-then plan set.',
    honestLimit: 'Over-prescribed goals cause tunnel vision ("Goals Gone Wild"). Naive outcome-visualization backfires by draining motivation. Must use mental contrasting (WOOP: Wish, Outcome, Obstacle, Plan).',
  },
  {
    id: 'identity',
    number: '02',
    name: 'Identity & Belief',
    loopMove: 'Design',
    focus: 'the self that acts',
    ancient: {
      text: '"As a man thinketh, so is he" (read as character driving conduct). The mind-first view of Vedanta and the Dhammapada.',
      source: 'James Allen; Dhammapada'
    },
    modern: {
      text: 'Self-efficacy dictates what we attempt and sustain. Identity-based habits ("every action is a vote for who you become"). Placebo neurobiology shows expectation triggers real dopamine/opioid release.',
      science: 'Albert Bandura; James Clear; Benedetti'
    },
    mechanism: 'Belief works through the body and behavior, never around them. High efficacy → harder attempts → mastery experiences → higher efficacy (a compounding positive-feedback loop). Expectation also has a direct physiological arm.',
    aiAmplifier: 'An agent that mirrors back your daily wins as objective identity-evidence, tracking matches and catching identity-incongruent excuses.',
    honestLimit: 'Growth-mindset effects are small and contested (r ≈ .10). Efficacy must stay calibrated to real skill or it degrades into hubristic overconfidence.',
  },
  {
    id: 'attention',
    number: '03',
    name: 'Attention & Perception',
    loopMove: 'See',
    focus: 'what reaches you',
    ancient: {
      text: 'dhāraṇā and ekāgratā (one-pointed concentration) and sati (mindfulness), which texts pair with clear comprehension and goal-directed effort, not passive noticing.',
      source: 'Patañjali, Yoga Sutras'
    },
    modern: {
      text: 'Selective attention via the salience network. Predictive processing/active inference shows the brain constructs perception from priors. The frequency illusion explains why focus makes the world seem to "respond."',
      science: 'Friston; Clark; Zwicky'
    },
    mechanism: 'The brain receives far more data than awareness can hold; attention selects the active subset. Concentration trains you to reliably notice goal-relevant cues and opportunities that were always present in your surroundings.',
    aiAmplifier: 'This is the legitimate "RAS" — a memory vault + agent that parses your feeds, notes, and messages, and surfaces goal-relevant signals while muting noise.',
    honestLimit: 'Attention projects nothing onto the external world. "Where attention goes, energy flows" is true for behavior only; it does not rearrange physical reality directly.',
  },
  {
    id: 'state',
    number: '04',
    name: 'State & Energy',
    loopMove: 'See',
    focus: 'the body you act from',
    ancient: {
      text: 'Pranayama (breath regulation), fasting, and dawn rituals — the physical and contemplative disciplines of state management.',
      source: 'Contemplative traditions'
    },
    modern: {
      text: 'Extended-exhale cyclic sighing raises vagal tone and beats meditation for mood. Flow state triggers transient hypofrontality. Circadian/meal-timing and 90-min ultradian blocks govern focus quality.',
      science: 'Stanford/Huberman RCT (2023); Csikszentmihalyi; Walker'
    },
    mechanism: 'Breath is the autonomic lever under voluntary control, enabling fast down-shifting of physiological arousal. State quality dictates action quality. Sleep is the substrate of all cognitive capability.',
    aiAmplifier: 'An agent that monitors your deep-work windows, schedules focus blocks against your natural energy curve, and actively guards them.',
    honestLimit: 'State tools change state fast and reliably; they do not cure organic disease. The "90-minute cycle" and "5 flow chemicals" are heuristics, not mathematical constants.',
  },
  {
    id: 'action',
    number: '05',
    name: 'Consistent Action',
    loopMove: 'Build',
    focus: 'the engine of compounding',
    ancient: {
      text: 'Kaizen (continuous improvement); the dō (path of mastery) and shokunin; the Stoic reserve clause on outcomes (value lives in the act itself).',
      source: 'Japanese Zen; Stoicism'
    },
    modern: {
      text: 'Habitual behavior accounts for ~43% of daily actions. Deliberate practice requires feedback-rich repetitions at the challenge edge. Behavioral activation shows action precedes motivation.',
      science: 'Wendy Wood; Anders Ericsson'
    },
    mechanism: 'Repetition in a stable context converts willpower-dependent behavior into automatic cued response, removing the per-instance decision tax. Consistency beats intensity. Compounding distributes edges only when retained over long horizons.',
    aiAmplifier: 'Automations and local scripts that drop the execution friction of the next action to near-zero, pre-filling assets and workspaces.',
    honestLimit: 'Compounding in habits is an illustration, not a law; gains plateau and decay. Deliberate practice explains only ~1/3 of expertise variance; talent and background carry the rest.',
  },
  {
    id: 'environment',
    number: '06',
    name: 'Environment & Systems',
    loopMove: 'Automate',
    focus: 'the container of behavior',
    ancient: {
      text: 'The monastic Rule and its fixed horarium. Structure, not willpower, forms the person. The sangha (community) as a behavioral container.',
      source: 'St. Benedict; Buddhist Sangha'
    },
    modern: {
      text: 'Choice architecture shows defaults are the strongest, most replicated nudge. Fogg\'s B = MAP formula. Systems-over-goals framework.',
      science: 'Thaler & Sunstein; BJ Fogg; James Clear'
    },
    mechanism: 'Willpower is a depletable, high-cost cognitive resource; physical and digital environments act continuously and for free. Changing the default behavior changes the outcome without demanding self-control.',
    aiAmplifier: 'An agent that audits and redesigns your digital defaults (blocking distraction sites, auto-launching tools, burying notifications).',
    honestLimit: 'Most nudges beyond defaults are weak after publication-bias correction. Social contagion is highly suggestive but heavily confounded by homophily.',
  },
  {
    id: 'feedback',
    number: '07',
    name: 'Feedback & Iteration',
    loopMove: 'Compound',
    focus: 'the learning loop',
    ancient: {
      text: 'The Ignatian Examen and Stoic evening review — structured, recurring reflection, not occasional rumination.',
      source: 'Ignatius of Loyola; Seneca'
    },
    modern: {
      text: 'Reflection adds causally to performance (+23% in trainees). Self-monitoring (d+ = 0.40) is highly effective, especially when recorded and made public. Boyd\'s OODA Loop.',
      science: 'Di Stefano et al. (HBS); Harkin et al.'
    },
    mechanism: 'A feedback loop turns blind repetition into directed repetition. Measurement surfaces the gap, reflection extracts the correction, and the next cycle applies it, shrinking error in each pass.',
    aiAmplifier: 'The Compound move done for real — an agent that scores your weekly outputs against outcomes, adjusts configurations, and biases next moves.',
    honestLimit: 'Reflection is not a substitute for repetitions. Self-monitoring is moderately effective, not transformative, and can demotivate if the goal gap remains wide.',
  },
]

const ONE_LAW_STEPS = [
  {
    name: 'Attention',
    d: 'The Filter',
    desc: 'You process a tiny fraction of environmental data. Attention selects what enters the brain.',
    vuln: 'Without training, you only notice standard signals. Focus primes your predictive network to see opportunities that were already there.'
  },
  {
    name: 'Belief',
    d: 'The Model',
    desc: 'Self-efficacy acts as a governor on capacity. What you believe you can do determines what you attempt.',
    vuln: 'Placebo trials prove that mental expectations trigger objective physical changes. Efficacy controls performance volume.'
  },
  {
    name: 'Action',
    d: 'The Physics',
    desc: 'No information leaves the skull to rearrange reality directly. Every outcome is a consequence of behavior.',
    vuln: 'Repetition in stable contexts automates behavior, eliminating the decision cost and reserving energy for edge work.'
  },
  {
    name: 'Environment',
    d: 'The Default',
    desc: 'Willpower is expensive and transient. Your physical and digital containers shape your actions for free.',
    vuln: 'Defaults govern 80%+ of behavior. Redesigning defaults renders compliance passive and friction-free.'
  },
  {
    name: 'Feedback',
    d: 'The Correction',
    desc: 'Repetition without correction is blind. Feedback closes the loop to shrink error over time.',
    vuln: 'Structured review improves performance by 23% by extracting rules from errors. It makes the other levers compound.'
  },
  {
    name: 'Outcome',
    d: 'The Lagging Indicator',
    desc: 'The final, physical result. It cannot be edited directly; it is the mathematical printout of the entire chain.',
    vuln: 'Gurus try to manifest the outcome directly. Architects engineer the chain that forces the outcome.'
  }
]

type Tab = 'wisdom' | 'mechanism' | 'ai' | 'limit'
type GlobalView = 'local' | Tab

export function MethodContent() {
  const [activeLawStep, setActiveLawStep] = useState<number>(0)
  const [globalView, setGlobalView] = useState<GlobalView>('local')
  const [localTabs, setLocalTabs] = useState<Record<string, Tab>>(
    LEVERS.reduce((acc, curr) => ({ ...acc, [curr.id]: 'wisdom' }), {})
  )

  const handleLocalTabChange = (leverId: string, tab: Tab) => {
    setGlobalView('local')
    setLocalTabs(prev => ({ ...prev, [leverId]: tab }))
  }

  const handleGlobalViewChange = (view: GlobalView) => {
    setGlobalView(view)
  }

  const getMoveStyles = (move: Lever['loopMove']) => {
    switch (move) {
      case 'See':
        return 'text-purple-400 border-purple-500/20 bg-purple-500/5'
      case 'Design':
        return 'text-blue-400 border-blue-500/20 bg-blue-500/5'
      case 'Build':
        return 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5'
      case 'Automate':
        return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
      case 'Compound':
        return 'text-rose-400 border-rose-500/20 bg-rose-500/5'
    }
  }

  return (
    <div className="py-14 space-y-16">
      {/* Hero */}
      <section className="blueprint -mx-5 px-5 py-16 sm:py-24 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-2/10 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDuration: '12s' }} />
        <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-accent">The Operating Manual</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-extrabold tracking-tight text-ink sm:text-6xl leading-[1.05]">
          The Architect&apos;s Codex
        </h1>
        <p className="mt-6 max-w-3xl text-lg sm:text-xl text-muted leading-relaxed">
          For three thousand years, wisdom traditions circled the same claim: that you can deliberately, repeatably shape your life.
          They were right — but they described the <strong className="text-ink">what</strong> in the language of their age (spirit, energy, will).
          Modern science has measured the <strong className="text-ink">how</strong>. When the two align, magic resolves into <strong className="text-accent">mechanism</strong>.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#levers" className="rounded-lg bg-accent px-6 py-3 font-semibold text-bg hover:opacity-90 transition">
            Explore the 7 Levers ↓
          </a>
          <Link href="/assess" className="rounded-lg border border-border px-6 py-3 font-semibold text-ink hover:border-accent transition">
            Assess your gap →
          </Link>
        </div>
        <div className="mt-10 aspect-video max-h-[360px] w-full overflow-hidden rounded-2xl border border-border glass relative flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/loop-blueprint.png" alt="The Architect's Loop Blueprint" className="object-cover w-full h-full opacity-90" loading="lazy" />
        </div>
      </section>

      {/* The One Law */}
      <section className="border-t border-border pt-16">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-ink">The One Law</h2>
          <p className="mt-3 text-muted">
            Outcomes flow through a strict behavioral chain. No information leaves the skull to rearrange reality directly.
            Every legitimate practice intervenes somewhere on this chain.
          </p>
        </div>

        {/* Chain Diagram */}
        <div className="mt-10 rounded-2xl border border-border glass p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 overflow-x-auto pb-4">
            {ONE_LAW_STEPS.map((s, idx) => (
              <button
                key={s.name}
                onClick={() => setActiveLawStep(idx)}
                className={`group relative flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-300 w-full sm:w-[15.5%] cursor-pointer ${
                  activeLawStep === idx
                    ? 'border-accent bg-accent/5 shadow-md shadow-accent/5'
                    : 'border-border bg-bg/20 hover:border-accent/40'
                }`}
              >
                <span className="font-mono text-xs text-muted group-hover:text-accent transition">0{idx + 1}</span>
                <span className="mt-1 font-bold text-sm text-ink group-hover:text-accent transition">{s.name}</span>
                <span className="mt-0.5 text-xs text-muted">{s.d}</span>
                {idx < ONE_LAW_STEPS.length - 1 && (
                  <span className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 text-border font-bold text-lg select-none z-10">
                    →
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Active step details */}
          <div className="mt-6 border-t border-border pt-6 grid md:grid-cols-2 gap-6 min-h-[140px] transition-all duration-300">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-accent">0{activeLawStep + 1}</span>
                <h3 className="text-xl font-bold text-ink">{ONE_LAW_STEPS[activeLawStep].name}</h3>
              </div>
              <p className="mt-3 text-muted text-sm leading-relaxed">{ONE_LAW_STEPS[activeLawStep].desc}</p>
            </div>
            <div className="bg-surface/30 rounded-xl border border-border/80 p-5 flex flex-col justify-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-accent-2">Architect&apos;s Stance</div>
              <p className="mt-1 text-sm text-ink">{ONE_LAW_STEPS[activeLawStep].vuln}</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Levers section */}
      <section id="levers" className="border-t border-border pt-16 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-ink">The Seven Levers of Outcome-Creation</h2>
            <p className="mt-3 text-muted">
              These are the nodes of the chain where ancient wisdom and modern science converge.
              Use the tab controls to see their sources, mechanisms, and agent implementations.
            </p>
          </div>
          {/* Global Toggle */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-surface border border-border w-fit self-start">
            <button
              onClick={() => handleGlobalViewChange('local')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                globalView === 'local' ? 'bg-accent text-bg font-semibold' : 'text-muted hover:text-ink'
              }`}
            >
              Custom
            </button>
            <button
              onClick={() => handleGlobalViewChange('wisdom')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                globalView === 'wisdom' ? 'bg-accent text-bg font-semibold' : 'text-muted hover:text-ink'
              }`}
            >
              Wisdom & Sci
            </button>
            <button
              onClick={() => handleGlobalViewChange('mechanism')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                globalView === 'mechanism' ? 'bg-accent text-bg font-semibold' : 'text-muted hover:text-ink'
              }`}
            >
              Mechanism
            </button>
            <button
              onClick={() => handleGlobalViewChange('ai')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                globalView === 'ai' ? 'bg-accent text-bg font-semibold' : 'text-muted hover:text-ink'
              }`}
            >
              AI Amplifier
            </button>
            <button
              onClick={() => handleGlobalViewChange('limit')}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                globalView === 'limit' ? 'bg-accent text-bg font-semibold' : 'text-muted hover:text-ink'
              }`}
            >
              Honest Limit
            </button>
          </div>
        </div>

        {/* Levers Stack */}
        <div className="space-y-6">
          {LEVERS.map((l) => {
            const activeTab = globalView === 'local' ? localTabs[l.id] : globalView
            return (
              <div key={l.id} className="rounded-2xl border border-border glass p-6 md:p-8 space-y-6 transition-all hover:border-border/80">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-accent">{l.number}</span>
                      <h3 className="text-2xl font-bold text-ink">{l.name}</h3>
                    </div>
                    <p className="mt-1.5 text-sm text-muted font-mono italic">· {l.focus} ·</p>
                  </div>
                  {/* Loop Move Pill */}
                  <div className={`rounded-full border px-3 py-1 text-xs font-mono font-semibold tracking-wider uppercase ${getMoveStyles(l.loopMove)}`}>
                    Move: {l.loopMove}
                  </div>
                </div>

                {/* Inner tab selectors */}
                <div className="flex border-b border-border/60 pb-px gap-4 overflow-x-auto">
                  {(['wisdom', 'mechanism', 'ai', 'limit'] as Tab[]).map((tabName) => {
                    const labels = {
                      wisdom: 'Wisdom & Science',
                      mechanism: 'The Mechanism',
                      ai: 'AI Agent Amplifier',
                      limit: 'Honest Limit'
                    }
                    return (
                      <button
                        key={tabName}
                        onClick={() => handleLocalTabChange(l.id, tabName)}
                        className={`pb-2 text-sm font-medium border-b-2 transition select-none whitespace-nowrap cursor-pointer ${
                          activeTab === tabName
                            ? 'border-accent text-accent'
                            : 'border-transparent text-muted hover:text-ink'
                        }`}
                      >
                        {labels[tabName]}
                      </button>
                    )
                  })}
                </div>

                {/* Tab content panel */}
                <div className="min-h-[110px] flex items-center transition-all duration-300">
                  {activeTab === 'wisdom' && (
                    <div className="grid md:grid-cols-2 gap-6 w-full">
                      <div className="space-y-1">
                        <div className="text-xs font-semibold uppercase tracking-wider text-accent">Ancient Wisdom</div>
                        <p className="text-ink text-sm leading-relaxed">{l.ancient.text}</p>
                        <div className="text-[11px] text-muted font-mono">— {l.ancient.source}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-semibold uppercase tracking-wider text-accent-2">Modern Science</div>
                        <p className="text-ink text-sm leading-relaxed">{l.modern.text}</p>
                        <div className="text-[11px] text-muted font-mono">— {l.modern.science}</div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'mechanism' && (
                    <div className="space-y-1 w-full">
                      <div className="text-xs font-semibold uppercase tracking-wider text-accent">Biological & Cognitive Mechanism</div>
                      <p className="text-ink text-sm leading-relaxed max-w-4xl">{l.mechanism}</p>
                    </div>
                  )}

                  {activeTab === 'ai' && (
                    <div className="space-y-1 w-full border border-accent/20 bg-accent/5 p-4 rounded-xl">
                      <div className="text-xs font-semibold uppercase tracking-wider text-accent flex items-center gap-1.5">
                        <span>⚡</span> AI Agent Amplifier
                      </div>
                      <p className="text-ink text-sm leading-relaxed max-w-4xl mt-1">
                        {l.aiAmplifier}
                      </p>
                      <div className="text-xs text-muted mt-2">
                        This amplifier bridges the inner-game lever directly to your operational loop, reducing execution friction by 10×.
                      </div>
                    </div>
                  )}

                  {activeTab === 'limit' && (
                    <div className="space-y-1 w-full border border-red-950/20 bg-red-950/5 p-4 rounded-xl">
                      <div className="text-xs font-semibold uppercase tracking-wider text-rose-400">Honest Science-Based Boundary</div>
                      <p className="text-ink text-sm leading-relaxed max-w-4xl mt-1">{l.honestLimit}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* The Grid Summary */}
      <section className="border-t border-border pt-16">
        <h2 className="text-3xl font-bold tracking-tight text-ink">The Codex Map</h2>
        <p className="mt-3 text-muted">
          A blueprint of the whole system mapped to the Loop moves. The operational path that translates concept to output.
        </p>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-border glass">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface/50 font-mono text-xs text-muted uppercase">
                <th className="p-4 font-semibold">Lever</th>
                <th className="p-4 font-semibold">Loop Move</th>
                <th className="p-4 font-semibold">Ancient Source</th>
                <th className="p-4 font-semibold">Modern Science</th>
                <th className="p-4 font-semibold">Mechanism</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm font-mono">
              {LEVERS.map((l) => (
                <tr key={l.id} className="hover:bg-surface/30 transition">
                  <td className="p-4 font-bold text-ink">{l.name}</td>
                  <td className="p-4">
                    <span className={`rounded-md border px-2 py-0.5 text-xs ${getMoveStyles(l.loopMove)}`}>
                      {l.loopMove}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-muted">{l.ancient.source}</td>
                  <td className="p-4 text-xs text-muted">{l.modern.science}</td>
                  <td className="p-4 text-xs text-ink/80 truncate max-w-[200px]" title={l.mechanism}>
                    {l.mechanism}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* The Discard Pile / Pseudoscience Firewall */}
      <section className="rounded-2xl border border-red-500/10 bg-red-500/5 p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          <h2 className="text-2xl font-bold text-ink">The Discard Pile: Pseudoscience Firewall</h2>
        </div>
        <p className="text-sm text-muted leading-relaxed max-w-3xl">
          Reality Architect&apos;s edge is that it cannot be debunked. We keep our credibility intact by enforcing a strict firewall against the pseudoscience and action-free rituals popular in traditional manifestation circles.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-rose-400">Hard Discards</h3>
            <ul className="space-y-3 text-xs text-ink/90">
              <li className="flex gap-2">
                <span className="text-rose-500/80">❌</span>
                <span>
                  <strong>Literal &quot;Law of Attraction&quot;</strong>: Esther/Jerry Hicks or <em>The Secret</em>. Unfalsifiable confirmation bias that claims direct thought-to-reality alteration and victim-blames misfortune.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-rose-500/80">❌</span>
                <span>
                  <strong>Observer-effect woo</strong>: Claiming conscious attention rearranges subatomic particles. Entanglement transmits no intention; micro-effects do not scale to macro events.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-rose-500/80">❌</span>
                <span>
                  <strong>Thought Vibrations</strong>: The claim that thoughts vibrate at frequencies that draw money. No measurable electromagnetic thought-frequency emission exists.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-rose-500/80">❌</span>
                <span>
                  <strong>Joe Dispenza-style healing</strong>: Wrapping small, legitimate findings on meditation and neuroplasticity in unsupported reality-bending claims.
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400">Viral Myths &amp; Overclaims</h3>
            <ul className="space-y-3 text-xs text-ink/90">
              <li className="flex gap-2">
                <span className="text-amber-500/80">⚠️</span>
                <span>
                  <strong>Naive Visualization</strong>: Empirically reduces goal attainment (Oettingen) by tricking the brain into feeling the goal is achieved, draining motivation. We replace it with mental contrasting (WOOP).
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500/80">⚠️</span>
                <span>
                  <strong>The 21-Day Habit Myth</strong>: Real habit formation ranges from 18 to 254 days (avg ~66). Naming Maltz&apos;s observation as a law is incorrect.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500/80">⚠️</span>
                <span>
                  <strong>The 10,000-Hour Rule</strong>: Anders Ericsson disowned this. Raw hours without feedback-rich deliberate structure explain only 1/3 of variance.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-500/80">⚠️</span>
                <span>
                  <strong>Growth Mindset as a Miracle</strong>: Sisk 2018 meta-analysis shows very small effects (r ≈ .10). Keep it as a humane stance, never as a structural load-bearing lever.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-mono text-muted">
          <div>
            <strong>The Test:</strong> Keep: <code className="text-accent">attention → belief → action → environment → feedback → outcome</code>. Discard: <code className="text-rose-400">thought/energy → external reality directly</code>.
          </div>
          <div className="text-accent">
            Mechanism, not magic.
          </div>
        </div>
      </section>

      {/* CTA / Pitch */}
      <section className="border-t border-border pt-16">
        <div className="rounded-2xl border border-accent/30 blueprint glass p-8 text-center sm:text-left md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-2xl font-bold text-ink">The framework is free. The systems are paid.</h2>
            <p className="text-muted text-sm sm:text-base">
              The 7 Levers show you the physics. The Architect&apos;s Loop shows you the moves.
              The Vault is where the tuned, production systems live — the exact checklists, prompts, and agent loops that run my business.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <Link href="/vault" className="rounded-lg bg-accent px-6 py-3 font-semibold text-bg hover:opacity-90 text-center transition">
              Enter the Vault →
            </Link>
            <Link href="/assess" className="rounded-lg border border-border px-6 py-3 font-semibold text-ink hover:border-accent text-center transition">
              Find your gap first
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
