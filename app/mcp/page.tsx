import type { Metadata } from 'next'
import Link from 'next/link'
import { site } from '@/lib/site'
import { CopyBlock } from '@/components/CopyBlock'
import { EmailCapture } from '@/components/EmailCapture'

const ENDPOINT = `${site.url}/api/mcp`

export const metadata: Metadata = {
  title: 'reality.md MCP server',
  description:
    'A live, stateless Model Context Protocol server for the reality.md standard. Connect any MCP client and run the five protocol verbs — read, surface, propose, guard, log — against your own file. Nothing is stored.',
  alternates: { canonical: '/mcp' },
  openGraph: {
    title: 'reality.md MCP server',
    description: 'Run the reality.md protocol from any agent client. Stateless, sovereign, no account.',
    url: '/mcp',
    type: 'website',
  },
}

const TOOLS = [
  { verb: 'READ', name: 'reality_read', d: 'Parse and validate a reality.md, report who it is and which sections are filled or empty.' },
  { verb: 'SURFACE', name: 'reality_surface', d: 'Triage incoming items against Attention rules and active Aims — surface, mute, or leave for you.' },
  { verb: 'PROPOSE', name: 'reality_propose', d: 'Name the first Loop move not yet in place and the single smallest artifact that moves it forward.' },
  { verb: 'GUARD', name: 'reality_guard', d: 'Check a proposed action against your Guardrails and the standard\'s standing rules. Allow, ask, or refuse.' },
  { verb: 'LOG', name: 'reality_log', d: 'Return a ready-to-append .reality/ block for a win, review, or aim. The server writes nothing.' },
]

const GUARANTEES = [
  { h: 'Stateless', d: 'No database, no session store. Your file is passed in with each call and analyzed in memory. There is nothing to leak because nothing is kept.' },
  { h: 'The file stays yours', d: 'The server reads content you hand it and hands analysis back. It never fetches, stores, or forwards your reality.md anywhere.' },
  { h: 'Propose, never apply', d: 'It returns proposed edits and .reality/ append blocks as text. Your client does the writing — the server cannot touch your files.' },
]

const nativeConfig = `{
  "mcpServers": {
    "reality-md": {
      "url": "${ENDPOINT}"
    }
  }
}`

const bridgeConfig = `{
  "mcpServers": {
    "reality-md": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "${ENDPOINT}"]
    }
  }
}`

export default function McpPage() {
  return (
    <div className="py-14">
      <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-accent">Model Context Protocol · live server</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
        Run the reality.md protocol from <span className="text-accent">any agent</span>
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-muted">
        The <Link href="/standard" className="text-accent hover:underline">reality.md standard</Link> works today for any
        harness that can read a local file. This server extends it over the wire: connect Claude, Cursor, VS Code, or any
        MCP client and the five protocol verbs become callable tools — operating on the file <em>you</em> pass in,
        keeping nothing.
      </p>

      <div className="mt-8">
        <CopyBlock label="server endpoint (Streamable HTTP)" code={ENDPOINT} />
      </div>

      <h2 className="mt-16 text-2xl font-bold text-ink">The sovereign guarantee</h2>
      <p className="mt-3 max-w-2xl text-muted">
        A memory file for your life should never live in someone else&apos;s database. This server is built so it
        cannot — the design, not a promise, is what protects you.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {GUARANTEES.map((g) => (
          <div key={g.h} className="rounded-xl border border-border glass p-5">
            <div className="font-mono text-sm font-bold text-accent">{g.h}</div>
            <p className="mt-1.5 text-sm text-muted">{g.d}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-16 text-2xl font-bold text-ink">Connect it in a minute</h2>
      <p className="mt-3 max-w-2xl text-muted">
        Add the server to your client&apos;s MCP config. Clients with native remote support take the URL directly;
        stdio-only clients bridge through <code className="rounded bg-surface px-1.5 py-0.5 text-xs">mcp-remote</code>.
      </p>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div>
          <h3 className="mb-2.5 text-sm font-semibold text-ink">Native remote (Cursor, VS Code, Claude web)</h3>
          <CopyBlock label="mcp.json" code={nativeConfig} />
        </div>
        <div>
          <h3 className="mb-2.5 text-sm font-semibold text-ink">Bridge (Claude Desktop &amp; stdio clients)</h3>
          <CopyBlock label="claude_desktop_config.json" code={bridgeConfig} />
        </div>
      </div>
      <p className="mt-4 max-w-2xl text-sm text-muted">
        Then start any tool with your file: <em>&quot;Read my reality.md&quot;</em> (paste it, or let the client read
        <code className="rounded bg-surface px-1.5 py-0.5 text-xs">~/reality.md</code>) and the agent can surface, propose,
        guard, and log against it.
      </p>

      <h2 className="mt-16 text-2xl font-bold text-ink">Five verbs, five tools</h2>
      <div className="mt-6 overflow-hidden rounded-2xl border border-border glass">
        {TOOLS.map((t, i) => (
          <div
            key={t.name}
            className={`flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:gap-5 ${i > 0 ? 'border-t border-border/70' : ''}`}
          >
            <div className="flex shrink-0 items-center gap-3 sm:w-56">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent/15 font-mono text-[10px] font-bold text-accent">{i + 1}</span>
              <div>
                <div className="font-mono text-sm font-bold text-ink">{t.verb}</div>
                <div className="font-mono text-xs text-muted">{t.name}</div>
              </div>
            </div>
            <p className="text-sm text-muted">{t.d}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 max-w-2xl text-sm text-muted">
        The server also exposes the spec and a blank template as MCP resources
        (<code className="rounded bg-surface px-1.5 py-0.5 text-xs">reality://spec</code>,
        <code className="ml-1 rounded bg-surface px-1.5 py-0.5 text-xs">reality://template</code>) and a
        <code className="ml-1 rounded bg-surface px-1.5 py-0.5 text-xs">bootstrap-reality-md</code> prompt that interviews
        you into a first file — one section at a time, inventing nothing.
      </p>

      <div className="mt-16 rounded-2xl border border-accent/30 blueprint glass p-7">
        <h2 className="text-xl font-bold text-ink">Build-time vs. runtime — why this is a separate server</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          MCP has two sides. A build-time server gives an AI tools while it writes code for you. This is the other
          side: a <strong className="text-ink">runtime</strong> server that ships as part of the product, so the
          standard is callable by anyone&apos;s agent, on their own file, in their own client. One protocol, every
          harness — that is the leverage a file alone can&apos;t reach.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link href="/standard" className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-bg hover:opacity-90">
            Read the standard
          </Link>
          <a href={`${site.github}/tree/main/standard`} className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-ink hover:border-accent">
            Spec + template on GitHub ↗
          </a>
        </div>
      </div>

      <EmailCapture
        headline="Get the reality.md field guide"
        sub="The full walkthrough for filling all eight sections — with the agent prompts that maintain it for you."
      />
    </div>
  )
}
