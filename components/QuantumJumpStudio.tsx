'use client'

import { useState, useRef, useEffect } from 'react'

interface JumpTemplate {
  id: string
  name: string
  theme: string
  timeline: string
  doppelganger: string
  frequencyHz: number
  binauralHz: number
  coreBelief: string
  somaticAnchor: string
  voiceRecommendation: string
  sunoPrompt: string
  stages: {
    number: number
    name: string
    duration: string
    script: string
  }[]
}

const TEMPLATES: JumpTemplate[] = [
  {
    id: 'midas',
    name: 'The Midas Jump',
    theme: 'Sovereign Wealth & Autonomous Capital',
    timeline: 'Timeline 88-Alpha',
    doppelganger: 'Midas-Prime (The Value Architect)',
    frequencyHz: 432,
    binauralHz: 5.5,
    coreBelief: 'Capital is organized attention and trust; eliminate friction and sovereign flow follows.',
    somaticAnchor: 'Thumb pressed firmly into center of right palm with 4-7-8 breath',
    voiceRecommendation: 'ElevenLabs: Adam (Stability 0.65, Clarity 0.80, Speed 0.88)',
    sunoPrompt:
      'cinematic ambient meditation, 432Hz sacred geometry tuning, warm analog Moog synth pads, sub-bass theta binaural carrier wave 5.5Hz, slow majestic cello swells, no aggressive drums, vast spatial reverb, golden hour atmosphere, transcendent tranquility, 52 BPM',
    stages: [
      {
        number: 1,
        name: 'Somatic Down-Regulation',
        duration: '0:00 - 2:00',
        script:
          'Close your eyes... and let your body settle into the surface beneath you. Breathe in through your nose for 4 seconds... hold gently for 7 seconds... and slowly exhale through your mouth for 8 seconds. Feel every drop of tension drain from your jaw, your neck, and your shoulders. You are safe. There is nowhere you need to rush.',
      },
      {
        number: 2,
        name: 'The Quantum Corridor',
        duration: '2:00 - 4:00',
        script:
          'Allow the physical room to dissolve into soft, radiant amber light. Before you appears the Corridor of Infinite Timelines—a soaring crystalline hall stretching across quantum probability. Lining this hall are doors of living resonance. Ahead on your right is a heavy bronze and gold doorway: Timeline 88-Alpha: Sovereign Abundance.',
      },
      {
        number: 3,
        name: 'The Threshold Crossing',
        duration: '4:00 - 6:00',
        script:
          'Place your hand upon the warm handle. Feel the vibrational hum of compounding flow, effortless stability, and sovereign freedom. Take a slow, deep breath... turn the handle... and step across the event horizon.',
      },
      {
        number: 4,
        name: 'The Doppelgänger Encounter',
        duration: '6:00 - 9:00',
        script:
          'You enter a quiet sanctuary overlooking a peaceful horizon. Sitting in absolute calm is Midas-Prime. Notice how completely relaxed their shoulders are, how slow and deep their belly breath moves. They look at you with warm recognition and stand to greet you with rooted certainty.',
      },
      {
        number: 5,
        name: 'Tacit Knowledge Merge',
        duration: '9:00 - 13:00',
        script:
          'Ask them: "What belief did you let go of to make this wealth effortless?" Receive their truth. Ask: "What obvious move am I currently avoiding out of fear?" Listen. Now step forward and merge into their physical vessel. Feel what it feels like to know with mathematical certainty that you are fully provided for and that your systems create sovereign wealth every hour.',
      },
      {
        number: 6,
        name: 'Calibration & Anchor Gift',
        duration: '13:00 - 15:00',
        script:
          'Midas-Prime presses their thumb firmly into the center of your right palm. Press your thumb into your right palm now in physical reality. Lock this calm into this point. Whenever you touch this anchor and breathe, this sovereign capital state immediately re-engages.',
      },
      {
        number: 7,
        name: 'Grounded Return',
        duration: '15:00 - 17:00',
        script:
          'Step back through the gold door into the corridor, carrying the full frequency of 88-Alpha. 1... Feeling your fingers and toes. 2... Carrying capital stillness in your chest. 3... Deep revitalizing breath. 4... Ready to decide without fear. 5... Eyes open, awake, grounded, and sovereign in this timeline now.',
      },
    ],
  },
  {
    id: 'vitality',
    name: 'The Vitality Jump',
    theme: 'Cellular Regeneration & Somatic Radiance',
    timeline: 'Timeline 77-Elysium',
    doppelganger: 'Aethel-Soma (The Radiant Athlete)',
    frequencyHz: 528,
    binauralHz: 4.5,
    coreBelief: 'My vessel is an intelligent, self-regenerating garden; natural biological rhythm is default health.',
    somaticAnchor: 'Left palm over heart center with right fingers feeling pulse on wrist',
    voiceRecommendation: 'ElevenLabs: Rachel (Stability 0.70, Clarity 0.85, Speed 0.85)',
    sunoPrompt:
      'ambient healing meditation, 528Hz DNA repair solfeggio frequency, warm acoustic strings, subtle ocean waves and distant forest birds, sub-bass 4.5Hz theta binaural drone, no harsh percussion, crystal singing bowl harmonics, tranquil restorative flow, 48 BPM',
    stages: [
      {
        number: 1,
        name: 'Somatic Down-Regulation',
        duration: '0:00 - 2:00',
        script:
          'Rest your hands comfortably, palms up. Inhale deeply into your lower belly for 4 seconds... hold for 7 seconds, feeling life force flood your cells... and slowly sigh it out for 8 seconds. Feel the micro-muscles around your eyes, jaw, and throat let go of all chronic holding.',
      },
      {
        number: 2,
        name: 'The Quantum Corridor',
        duration: '2:00 - 4:00',
        script:
          'The room dissolves into luminous emerald and indigo mist. In the Corridor of Infinite Realities, you approach an arched doorway carved from living cedar and jade: Timeline 77-Elysium. Feel the clean prana pulsing through the wood.',
      },
      {
        number: 3,
        name: 'The Threshold Crossing',
        duration: '4:00 - 6:00',
        script:
          'Push open the cedar door and step into the healing light. A warm, mineral-rich ocean breeze greets your skin. You feel your blood pressure normalize and your nervous system exhale.',
      },
      {
        number: 4,
        name: 'The Doppelgänger Encounter',
        duration: '6:00 - 9:00',
        script:
          'Standing before you is Aethel-Soma, glowing with radiant, effortless vitality. Notice their clear eyes, cat-like agility, and the deep stillness of their diaphragm. They reach out both hands in greeting.',
      },
      {
        number: 5,
        name: 'Tacit Knowledge Merge',
        duration: '9:00 - 13:00',
        script:
          'Ask: "What chronic habit did you release to allow this healing?" Listen. Ask: "What does my body need right now that I have been ignoring?" Receive the answer. Step forward and merge completely with Aethel-Soma. Feel your mitochondria energize, your vagus nerve relax, and systemic inflammation melt like ice in water.',
      },
      {
        number: 6,
        name: 'Calibration & Anchor Gift',
        duration: '13:00 - 15:00',
        script:
          'Place your left palm over your heart center and your right fingers over your pulse. Feel your heart beat with rhythmic, coherent power. Lock this anchor into your body now.',
      },
      {
        number: 7,
        name: 'Grounded Return',
        duration: '15:00 - 17:00',
        script:
          'Walk back through the jade doorway, carrying cellular vitality into every tissue. 1... Blood oxygenated. 2... Spine strong and light. 3... Deep clean breath. 4... Fully energized. 5... Eyes open, awake, glowing with health in this timeline now.',
      },
    ],
  },
  {
    id: 'polymath',
    name: 'The Polymath Jump',
    theme: 'Flow State & Prolific Creative Mastery',
    timeline: 'Timeline 99-DaVinci',
    doppelganger: 'DaVinci-Prime (The Universal Crafter)',
    frequencyHz: 741,
    binauralHz: 7.0,
    coreBelief: 'Taste is clarity; shipping is editing. Lower the bar for the draft, raise the bar for the cut.',
    somaticAnchor: 'Touching tips of index finger and thumb together on both hands simultaneously',
    voiceRecommendation: 'ElevenLabs: Marcus or Freya (Stability 0.58, Clarity 0.80, Speed 0.92)',
    sunoPrompt:
      'neo-classical ambient electronic, 639Hz and 741Hz awakening frequencies, arpeggiated upright piano, warm analog synthesizers, light acoustic percussion, 7.0Hz theta flow state binaural carrier wave, uplifting inspiring cinematic momentum, 78 BPM',
    stages: [
      {
        number: 1,
        name: 'Somatic Down-Regulation',
        duration: '0:00 - 2:00',
        script:
          'Sit tall with an elongated, light spine. Breathe in golden creative light from base to crown. Hold, feeling pure imagination ignite. Exhale all creative hesitation and fear of judgment. Your hands rest on your lap, tingling with creative power.',
      },
      {
        number: 2,
        name: 'The Quantum Corridor',
        duration: '2:00 - 4:00',
        script:
          'The corridor shines with iridescent sapphire and platinum light. You walk up to a brushed titanium and polished walnut door: Timeline 99-DaVinci: The Studio of Infinite Invention.',
      },
      {
        number: 3,
        name: 'The Threshold Crossing',
        duration: '4:00 - 6:00',
        script:
          'Touch the cool titanium handle. Creative electricity flows through your fingers. Push the door open and enter the sprawling workshop of world-class creation.',
      },
      {
        number: 4,
        name: 'The Doppelgänger Encounter',
        duration: '6:00 - 9:00',
        script:
          'Working effortlessly at the central table is DaVinci-Prime. Watch the gleam of playful intensity in their eyes as they bring ideas into physical form with zero resistance. They look up, wipe ink from their hands, and grin warmly.',
      },
      {
        number: 5,
        name: 'Tacit Knowledge Merge',
        duration: '9:00 - 13:00',
        script:
          'Ask: "How did you break free from the paralysis of perfectionism?" Listen to the answer. Ask: "What masterpiece inside me is demanding to be born next?" Step into their shoes. Feel their razor-sharp taste and fearless drafting speed flood your consciousness.',
      },
      {
        number: 6,
        name: 'Calibration & Anchor Gift',
        duration: '13:00 - 15:00',
        script:
          'Bring the tips of both your index fingers and thumbs together, completing the circuit of flow. Do this in physical reality now. Breathe into this circuit. Whenever you make this gesture, your mind locks into pure creative flow.',
      },
      {
        number: 7,
        name: 'Grounded Return',
        duration: '15:00 - 17:00',
        script:
          'Step back through the workshop door, ideas sparking rapidly in your mind. 1... Fingers ready to build. 2... Spine tall and light. 3... Deep breath of creative fire. 4... Doubts dissolved. 5... Eyes open, awake, inspired, and creating in this timeline now.',
      },
    ],
  },
  {
    id: 'sage',
    name: 'The Serene Sage Jump',
    theme: 'Equanimity & Sovereign Transcendence',
    timeline: 'Timeline 108-Omicron',
    doppelganger: 'Sophia-Zen (The Unmoved Witness)',
    frequencyHz: 963,
    binauralHz: 3.8,
    coreBelief: 'You are not the weather of transient events; you are the vast, empty sky in which all weather appears and dissolves.',
    somaticAnchor: 'Cosmic Mudra: right hand resting inside left hand in lap, thumb tips touching lightly',
    voiceRecommendation: 'ElevenLabs: Michael or Sarah (Stability 0.85, Clarity 0.85, Speed 0.80)',
    sunoPrompt:
      'sacred ambient drone, 963Hz pineal crown chakra resonance, deep Tibetan singing bowls, sub-bass 3.8Hz delta binaural carrier wave, soft harmonic wind chimes, ethereal monastic choir pads, no drums, timeless stillness, deep vast meditative space, 40 BPM',
    stages: [
      {
        number: 1,
        name: 'Somatic Down-Regulation',
        duration: '0:00 - 2:00',
        script:
          'Let go of all doing, fixing, and achieving. Inhale into the deep base of your belly... hold in the silent space between breaths... and let everything empty out. Feel the stillness settling into your bones.',
      },
      {
        number: 2,
        name: 'The Quantum Corridor',
        duration: '2:00 - 4:00',
        script:
          'The corridor dissolves into velvet violet silence. You walk along white river stones to a dark granite archway covered in quiet moss: Timeline 108-Omicron: The Mountain of Stillness.',
      },
      {
        number: 3,
        name: 'The Threshold Crossing',
        duration: '4:00 - 6:00',
        script:
          'Step through the granite arch. Instantly, the frantic noise of time ceases. A cool, serene stillness washes over your crown and spine.',
      },
      {
        number: 4,
        name: 'The Doppelgänger Encounter',
        duration: '6:00 - 9:00',
        script:
          'You sit upon a high mountain peak under a canopy of stars. Sitting peacefully on a flat stone is Sophia-Zen. Their face carries the majestic stillness of an ancient mountain. Their gaze holds unconditional compassion.',
      },
      {
        number: 5,
        name: 'Tacit Knowledge Merge',
        duration: '9:00 - 13:00',
        script:
          'Ask: "What is the truth of the burden I have been carrying?" Feel the tension dissolve. Ask: "How do I walk through the noise of the world without losing this peace?" Merge into Sophia-Zen. Feel how thoughts arise, pass, and dissolve without touching your sovereign nature.',
      },
      {
        number: 6,
        name: 'Calibration & Anchor Gift',
        duration: '13:00 - 15:00',
        script:
          'Rest your right hand inside your left hand in your lap, thumb tips touching lightly (The Cosmic Mudra). Form this mudra physically now. Whenever life feels urgent, form this mudra and return instantly to the mountain summit.',
      },
      {
        number: 7,
        name: 'Grounded Return',
        duration: '15:00 - 17:00',
        script:
          'Bring the mountain back into the marketplace. 1... Grounded firmly. 2... Carrying sovereign stillness in your chest. 3... Cool, peaceful breath. 4... Non-reactive and centered. 5... Eyes open, awake, peaceful, and anchored in this timeline now.',
      },
    ],
  },
  {
    id: 'unity',
    name: 'The Magnetic Unity Jump',
    theme: 'Heart Coherence & Relational Love',
    timeline: 'Timeline 44-Anahata',
    doppelganger: 'Amara-Vera (The Loving Sovereign)',
    frequencyHz: 639,
    binauralHz: 6.0,
    coreBelief: 'True magnetism is the radical absence of defense; safety begins in your own chest.',
    somaticAnchor: 'Right palm flat over sternum, fingers splayed, feeling radiant warmth',
    voiceRecommendation: 'ElevenLabs: Charlotte or Adam (Stability 0.62, Clarity 0.85, Speed 0.88)',
    sunoPrompt:
      'heart coherence meditation, 528Hz and 639Hz relational harmony frequencies, warm acoustic fingerpicked guitar, soft cello and violin duet, gentle female vocalise choir, sub-bass 6.0Hz theta carrier wave, emotional depth, no drums, pure compassionate warmth, 58 BPM',
    stages: [
      {
        number: 1,
        name: 'Somatic Down-Regulation',
        duration: '0:00 - 2:00',
        script:
          'Place your hands over your lower ribs. Breathe softly into your heart center. Hold, feeling rose-gold light expand across your chest. Slowly sigh it out, releasing all fear of rejection and all relational armor. Your chest softens into sweet safety.',
      },
      {
        number: 2,
        name: 'The Quantum Corridor',
        duration: '2:00 - 4:00',
        script:
          'The corridor turns into a sunset glow of amber and rose. You walk to an arched cedar door wrapped in blooming jasmine: Timeline 44-Anahata: The Field of Coherent Resonance.',
      },
      {
        number: 3,
        name: 'The Threshold Crossing',
        duration: '4:00 - 6:00',
        script:
          'Touch the cedar wood. Feel the gentle rhythmic heartbeat pulsing from within. Push open the door and step into the sunlit courtyard of profound emotional warmth.',
      },
      {
        number: 4,
        name: 'The Doppelgänger Encounter',
        duration: '6:00 - 9:00',
        script:
          'Turning to meet you with warm, open eyes is Amara-Vera. There is zero armor, zero judgment in their gaze. They embrace you with unconditional love, recognizing your sovereign soul.',
      },
      {
        number: 5,
        name: 'Tacit Knowledge Merge',
        duration: '9:00 - 13:00',
        script:
          'Ask: "What old wound did you forgive to allow your heart to stay this open?" Feel the knot in your chest dissolve. Ask: "How do I express my truth without fear of losing love?" Merge into Amara-Vera. Feel how magnetic you are when you are truly at home in your own heart.',
      },
      {
        number: 6,
        name: 'Calibration & Anchor Gift',
        duration: '13:00 - 15:00',
        script:
          'Place your right palm flat over your sternum, fingers gently splayed. Feel the physical warmth radiating into your heart. Lock this anchor into your chest now.',
      },
      {
        number: 7,
        name: 'Grounded Return',
        duration: '15:00 - 17:00',
        script:
          'Step back through the jasmine doorway, carrying an open, magnetic heart. 1... Warmth in your palms and feet. 2... Radiant love in your chest. 3... Deep breath of safety. 4... Ready to connect authentically. 5... Eyes open, awake, magnetic, and loving in this timeline now.',
      },
    ],
  },
]

export function QuantumJumpStudio() {
  const [selectedId, setSelectedId] = useState('midas')
  const [activeStage, setActiveStage] = useState(1)
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [copiedPatch, setCopiedPatch] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  // Reflection form state
  const [beliefShift, setBeliefShift] = useState('')
  const [actionAnchor, setActionAnchor] = useState('')
  const [somaticObservation, setSomaticObservation] = useState('')

  // Audio synthesis reference using Web Audio API
  const audioCtxRef = useRef<AudioContext | null>(null)
  const osc1Ref = useRef<OscillatorNode | null>(null)
  const osc2Ref = useRef<OscillatorNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  const current = TEMPLATES.find((t) => t.id === selectedId) || TEMPLATES[0]

  // Stop audio on unmount or template change
  useEffect(() => {
    return () => {
      stopAudio()
    }
  }, [selectedId])

  function toggleAudio() {
    if (isPlayingAudio) {
      stopAudio()
    } else {
      startAudio()
    }
  }

  function startAudio() {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new AudioCtx()
      audioCtxRef.current = ctx

      const baseFreq = current.frequencyHz
      const binauralDiff = current.binauralHz

      // Stereo panner if available or standard channels
      const gainNode = ctx.createGain()
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime)
      gainNode.connect(ctx.destination)
      gainRef.current = gainNode

      // Carrier 1 (Left ear)
      const osc1 = ctx.createOscillator()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime)
      osc1.connect(gainNode)
      osc1.start()
      osc1Ref.current = osc1

      // Carrier 2 (Right ear - offset by binaural theta)
      const osc2 = ctx.createOscillator()
      osc2.type = 'sine'
      osc2.frequency.setValueAtTime(baseFreq + binauralDiff, ctx.currentTime)
      osc2.connect(gainNode)
      osc2.start()
      osc2Ref.current = osc2

      setIsPlayingAudio(true)
    } catch {
      alert('Web Audio not supported in this environment.')
    }
  }

  function stopAudio() {
    if (osc1Ref.current) {
      try {
        osc1Ref.current.stop()
      } catch {}
      osc1Ref.current = null
    }
    if (osc2Ref.current) {
      try {
        osc2Ref.current.stop()
      } catch {}
      osc2Ref.current = null
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close()
      } catch {}
      audioCtxRef.current = null
    }
    setIsPlayingAudio(false)
  }

  function copySunoPrompt() {
    navigator.clipboard.writeText(current.sunoPrompt)
    setCopiedPrompt(true)
    setTimeout(() => setCopiedPrompt(false), 2000)
  }

  function copyRealityPatch() {
    const today = new Date().toISOString().split('T')[0]
    const patch = `## Identity\n- I embody the state of ${current.doppelganger} (${current.timeline}).\n- Core Belief: "${beliefShift || current.coreBelief}"\n\n## State\n- Somatic Anchor: ${current.somaticAnchor}\n- Quantum Jump Frequency: ${current.frequencyHz}Hz / ${current.binauralHz}Hz Theta\n\n## Systems\n- 60-Minute Action Anchor committed ${today}: ${actionAnchor || 'Complete initial timeline alignment move.'}\n`
    navigator.clipboard.writeText(patch)
    setCopiedPatch(true)
    setTimeout(() => setCopiedPatch(false), 2000)
  }

  function downloadObsidianLog() {
    const today = new Date().toISOString().split('T')[0]
    const content = `---
type: quantum-jump-log
template: ${current.id}
timeline: ${current.timeline}
doppelganger: ${current.doppelganger}
created: ${today}
tags: [quantum-jump, reality-architect, state, second-brain]
---

# Quantum Jump Log: ${current.name}

**Date**: ${today}  
**Target Timeline**: ${current.timeline}  
**Doppelgänger**: [[Doppelgangers/${current.doppelganger}]]  
**Frequency**: ${current.frequencyHz}Hz (Binaural: ${current.binauralHz}Hz)

---

## 1. Tacit Knowledge Transferred
- **Core Belief Shift**: ${beliefShift || current.coreBelief}
- **Somatic Observations**: ${somaticObservation || 'Deep vagal relaxation and drop in jaw/shoulder tension.'}

## 2. Somatic Anchor
- **Physical Anchor**: ${current.somaticAnchor}

## 3. The 60-Minute Action Anchor
- [ ] **Action**: ${actionAnchor || 'Perform one tangible commitment move in physical reality.'}
- **Committed**: ${today}

---
*Generated via Reality Architect Quantum Jump Studio.*
`
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${today}-jump-${current.id}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mt-8 rounded-2xl border border-border bg-surface p-6 sm:p-8">
      {/* Template selector tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-6">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setSelectedId(t.id)
              setActiveStage(1)
            }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              selectedId === t.id
                ? 'bg-accent text-bg shadow-sm'
                : 'border border-border bg-bg text-muted hover:border-accent hover:text-ink'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Header Info */}
      <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-border bg-bg px-3 py-1 font-mono text-xs font-semibold text-accent">
              {current.timeline}
            </span>
            <span className="rounded-full border border-border bg-bg px-3 py-1 font-mono text-xs text-muted">
              {current.frequencyHz}Hz · {current.binauralHz}Hz Theta
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">{current.name}</h2>
          <p className="text-sm text-muted">{current.theme}</p>
        </div>

        {/* Ambient audio generator toggle */}
        <button
          onClick={toggleAudio}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-mono font-semibold transition ${
            isPlayingAudio
              ? 'border-accent-2 bg-accent-2/20 text-accent-2 animate-pulse'
              : 'border-border bg-bg text-muted hover:border-accent hover:text-ink'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-current" />
          {isPlayingAudio ? `Tone Active (${current.frequencyHz}Hz)` : `Play Carrier Tone (${current.frequencyHz}Hz)`}
        </button>
      </div>

      {/* Doppelgänger card */}
      <div className="mt-6 rounded-xl border border-border bg-bg/80 p-5">
        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-accent">Doppelgänger Blueprint</p>
        <p className="mt-1 text-lg font-semibold text-ink">{current.doppelganger}</p>
        <blockquote className="mt-2 border-l-2 border-accent pl-3 text-sm italic text-muted">
          &ldquo;{current.coreBelief}&rdquo;
        </blockquote>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border/60 bg-surface/50 p-3 text-xs">
            <span className="font-mono text-muted">Tactile Anchor: </span>
            <span className="text-ink">{current.somaticAnchor}</span>
          </div>
          <div className="rounded-lg border border-border/60 bg-surface/50 p-3 text-xs">
            <span className="font-mono text-muted">Voice Recommended: </span>
            <span className="text-ink">{current.voiceRecommendation}</span>
          </div>
        </div>
      </div>

      {/* 7-Stage Stepper & Interactive Script */}
      <div className="mt-8">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-accent">
            Stage {activeStage} of 7 — {current.stages[activeStage - 1].name}
          </p>
          <span className="font-mono text-xs text-muted">{current.stages[activeStage - 1].duration}</span>
        </div>

        {/* Stage selection bubbles */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {current.stages.map((st) => (
            <button
              key={st.number}
              onClick={() => setActiveStage(st.number)}
              className={`flex-shrink-0 rounded-md px-3 py-1.5 font-mono text-xs transition ${
                activeStage === st.number
                  ? 'border border-accent bg-accent/15 text-accent font-semibold'
                  : 'border border-border bg-bg text-muted hover:text-ink'
              }`}
            >
              {st.number}. {st.name}
            </button>
          ))}
        </div>

        {/* Script Display */}
        <div className="mt-4 rounded-xl border border-border bg-bg p-6">
          <p className="text-base leading-relaxed text-ink/90 sm:text-lg">
            {current.stages[activeStage - 1].script}
          </p>
          <div className="mt-6 flex justify-between">
            <button
              disabled={activeStage === 1}
              onClick={() => setActiveStage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted transition disabled:opacity-30 hover:text-ink"
            >
              ← Previous Stage
            </button>
            <button
              disabled={activeStage === 7}
              onClick={() => setActiveStage((p) => Math.min(7, p + 1))}
              className="rounded-lg border border-accent bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent transition disabled:opacity-30 hover:bg-accent/20"
            >
              Next Stage →
            </button>
          </div>
        </div>
      </div>

      {/* Layer 3: Suno Music Prompt */}
      <div className="mt-8 rounded-xl border border-border bg-bg/50 p-5">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-muted">
            Layer 3: Suno Ambient Meditation Prompt
          </p>
          <button
            onClick={copySunoPrompt}
            className="rounded-md border border-border bg-surface px-3 py-1 font-mono text-xs text-accent transition hover:border-accent"
          >
            {copiedPrompt ? 'Copied Prompt!' : 'Copy Prompt'}
          </button>
        </div>
        <pre className="mt-3 overflow-x-auto rounded-lg border border-border/60 bg-surface/80 p-3 font-mono text-xs text-muted">
          {current.sunoPrompt}
        </pre>
      </div>

      {/* Guided Post-Jump Integration Reflection */}
      <div className="mt-8 rounded-xl border border-border bg-bg p-6">
        <p className="font-mono text-xs font-semibold uppercase tracking-wider text-accent">
          Post-Jump Integration: 5-Point Debrief & Second Brain Sync
        </p>
        <p className="mt-1 text-sm text-muted">
          Lock the jump into your nervous system and commit an irreversible physical action within 60 minutes.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block font-mono text-xs text-muted">
              1. The Core Belief Shift (What did your Doppelgänger make feel effortless?):
            </label>
            <input
              type="text"
              value={beliefShift}
              onChange={(e) => setBeliefShift(e.target.value)}
              placeholder={current.coreBelief}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-muted">
              2. Somatic Observation (Where in your body did you feel the tension release?):
            </label>
            <input
              type="text"
              value={somaticObservation}
              onChange={(e) => setSomaticObservation(e.target.value)}
              placeholder="e.g. Jaw unclasped, solar plexus warm, breathing deepened to belly"
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-muted">
              3. The 60-Minute Physical Action Anchor (The one irreversible move you will execute now):
            </label>
            <input
              type="text"
              value={actionAnchor}
              onChange={(e) => setActionAnchor(e.target.value)}
              placeholder="e.g. Ship the checkout integration / Send the proposal email"
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={downloadObsidianLog}
            className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-bg transition hover:opacity-90"
          >
            Download Obsidian Jump Log (.md)
          </button>
          <button
            onClick={copyRealityPatch}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-ink transition hover:border-accent"
          >
            {copiedPatch ? 'Copied to Clipboard!' : 'Copy reality.md Patch'}
          </button>
        </div>
      </div>
    </div>
  )
}
