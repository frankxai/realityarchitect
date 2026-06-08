import Link from 'next/link'
import { site } from '@/lib/site'

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <div className="font-bold text-ink">{site.name}</div>
            <p className="mt-2 max-w-sm text-sm text-muted">{site.description}</p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted">The network</div>
            <ul className="mt-3 space-y-2 text-sm">
              {site.network.map((n) => (
                <li key={n.url}>
                  <a href={n.url} className="text-ink hover:text-accent">{n.name}</a>
                  <span className="text-muted"> — {n.blurb}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {site.name}. Built by {site.author}.</span>
          <span>Honest tool comparisons. Some links are affiliate links.</span>
        </div>
      </div>
    </footer>
  )
}
