import Link from 'next/link'
import { site } from '@/lib/site'

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border">
      <div className="mx-auto max-w-5xl px-5 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <div className="font-bold text-ink">{site.name}</div>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{site.description}</p>
            <a href={site.github} className="mt-4 inline-block font-mono text-xs text-accent hover:underline">
              Fork the open repo ↗
            </a>
          </div>

          <nav aria-label="Footer" className="grid gap-8 sm:grid-cols-3">
            {site.footerNav.map((group) => (
              <div key={group.title}>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted">{group.title}</div>
                <ul className="mt-3 space-y-2 text-sm">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-ink hover:text-accent">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted">The network</div>
          <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {site.network.map((n) => (
              <li key={n.url}>
                <a href={n.url} className="text-ink hover:text-accent">{n.name}</a>
                <span className="text-muted"> — {n.blurb}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {site.name}. Built by {site.author}.</span>
          <span>The method is open source (MIT). Fork it, ship it, make it yours. Built on SIP.</span>
        </div>
      </div>
    </footer>
  )
}
