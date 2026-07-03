import type { Metadata } from 'next'
import Link from 'next/link'
import { site } from '@/lib/site'
import { EmailCapture } from '@/components/EmailCapture'

export const metadata: Metadata = {
  title: 'The reality.md Standard',
  description:
    'reality.md — a machine-readable file for a human life, the way CLAUDE.md is for a codebase. One file in your home directory that tells every AI agent who you are and what you\'re building.',
}

const SECTIONS = [
  { s: 'Identity', d: 'Who is acting — the roles every action votes for.' },
  { s: 'Aims', d: 'What\'s being built. Specific, written, with if-then triggers.' },
  { s: 'Attention', d: 'What signal agents surface to you, and what they mute.' },
  { s: 'State', d: 'The conditions you act from — sleep, deep-work windows, non-negotiables.' },
  { s: 'Systems', d: 'What already runs without you: agents, automations, loops.' },
  { s: 'Environment', d: 'The defaults you\'ve engineered. What\'s been removed.' },
  { s: 'Feedback', d: 'Review cadence and the metrics that count.' },
  { s: 'Guardrails', d: 'What agents must never do on your behalf.' },
]

const VERBS = [
  { v: 'READ', d: 'Load reality.md before acting on the human\'s behalf.' },
  { v: 'SURFACE', d: 'Filter inputs against Aims and Attention — signal forward, noise muted.' },
  { v: 'PROPOSE', d: 'Recommend the smallest next action that votes for the Identity.' },
  { v: 'LOG', d: 'Append outcomes to .reality/ — wins, reviews, never silently.' },
  { v: 'GUARD', d: 'Refuse anything that violates the Guardrails.' },
]

export default function Standard() {
  return (
    <div className="py-14">
      <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-accent">An open standard · v0.1</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
        reality.md — a memory file for your <span className="text-accent">life</span>, not just your repo
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-muted">
        Every AI harness already reads an instruction file before touching a codebase — CLAUDE.md, AGENTS.md,
        .cursorrules. Codebases got a memory layer. People didn&apos;t. So every session starts with you re-explaining
        yourself to a brilliant amnesiac.
      </p>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        <strong className="text-ink">reality.md</strong> is one file in your home directory that tells any agent who
        you are and what you&apos;re building — so every agent on your machine works for your life, not just your repo.
      </p>

      <div className="mt-10 rounded-2xl border border-border glass p-6 font-mono text-sm">
        <div className="text-ink">~/reality.md <span className="text-muted">— the contract. You write it, agents read it.</span></div>
        <div className="mt-2 text-ink">~/.reality/ <span className="text-muted">— the state. Agents maintain it, you review it.</span></div>
        <div className="mt-4 text-muted">No SaaS. No account. No lock-in. A markdown file, readable by every harness that exists.</div>
      </div>

      <div className="mt-6 aspect-video max-h-[320px] w-full overflow-hidden rounded-2xl border border-border glass relative flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/reality-spec.png" alt="reality.md Standard Specification Blueprint" className="object-cover w-full h-full opacity-90" loading="lazy" />
      </div>

      <h2 className="mt-16 text-2xl font-bold text-ink">Eight sections, eight levers</h2>
      <p className="mt-3 max-w-2xl text-muted">
        Each section is an intervention point on the one chain outcomes actually flow through:
        attention → belief → action → environment → feedback → outcome. An empty section isn&apos;t a failure — it&apos;s your gap,
        found. (The <Link href="/assess" className="text-accent hover:underline">assessment</Link> tells you which one.)
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {SECTIONS.map((x) => (
          <div key={x.s} className="rounded-xl border border-border glass p-5">
            <div className="font-mono text-sm font-bold text-accent">## {x.s}</div>
            <p className="mt-1.5 text-sm text-muted">{x.d}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-16 text-2xl font-bold text-ink">The agent protocol — five verbs</h2>
      <p className="mt-3 max-w-2xl text-muted">
        What makes this a standard rather than a note: any agent that finds your reality.md knows exactly how to behave.
      </p>
      <ol className="mt-8 space-y-3">
        {VERBS.map((x, i) => (
          <li key={x.v} className="flex items-center gap-4 rounded-xl border border-border glass px-5 py-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent/15 font-mono text-xs font-bold text-accent">{i + 1}</span>
            <div><span className="font-mono font-bold text-ink">{x.v}</span> <span className="text-sm text-muted">— {x.d}</span></div>
          </li>
        ))}
      </ol>

      <div className="mt-16 rounded-2xl border border-accent/30 blueprint glass p-7">
        <h2 className="text-xl font-bold text-ink">Adopt it in two minutes</h2>
        <ol className="mt-4 space-y-3 text-sm text-muted">
          <li><span className="font-semibold text-ink">1.</span> Copy the template from the repo into <code className="rounded bg-surface px-1.5 py-0.5 text-xs">~/reality.md</code> and fill what you know. Leave the rest empty — empty is a map.</li>
          <li><span className="font-semibold text-ink">2.</span> Add one line to your harness&apos;s instruction file (CLAUDE.md, .cursorrules, GEMINI.md):
            <div className="mt-2 rounded-lg bg-surface px-3 py-2 font-mono text-xs text-ink">Read ~/reality.md before acting on my goals; follow its agent protocol.</div>
          </li>
          <li><span className="font-semibold text-ink">3.</span> Ask your agent: <em>&quot;Read my reality.md. What&apos;s the smallest next action?&quot;</em> — and watch it answer like it knows you. Because now it does.</li>
        </ol>
        <a href={`${site.github}/tree/main/standard`} className="mt-6 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
          Get the spec + template →
        </a>
      </div>

      <p className="mt-10 max-w-2xl text-sm text-muted">
        The spec is MIT — extend it, fork it, build tools on it. The name stays generic on purpose: standards survive
        their authors. The method that fills the file is the <Link href="/method" className="text-accent hover:underline">Architect&apos;s Loop</Link>,
        and it&apos;s free too.
      </p>

      <EmailCapture headline="Get the reality.md field guide" sub="The full walkthrough for filling all eight sections — with the agent prompts that maintain it for you." />
    </div>
  )
}
