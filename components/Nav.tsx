import Link from 'next/link'
import { NavExplore } from '@/components/NavExplore'
import { BrandMark } from '@/components/BrandMark'
import { MobileMenu } from '@/components/MobileMenu'
import { site } from '@/lib/site'

const primary = ['/method', '/library', '/standard', '/assess']

export function Nav() {
  return (
    <header className="site-header sticky top-0 z-50">
      <nav aria-label="Primary navigation" className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
        <Link href="/" className="flex min-h-11 shrink-0 items-center gap-3 font-medium tracking-tight text-ink">
          <BrandMark size={34} />
          <span className="text-[0.95rem]">{site.name}</span>
        </Link>
        <div className="hidden items-center gap-5 text-sm text-muted lg:flex">
          {site.nav.filter(item => primary.includes(item.href)).map(item => <Link key={item.href} href={item.href} className="nav-link">{item.label}</Link>)}
          <NavExplore>
              {site.nav.filter(item => !primary.includes(item.href) && item.href !== '/studio').map(item => <Link key={item.href} href={item.href} className="rounded-lg px-3 py-3 text-ink hover:bg-white/5">{item.label}</Link>)}
              <a href={site.github} className="rounded-lg px-3 py-3 text-accent hover:bg-white/5">GitHub ↗</a>
          </NavExplore>
          <Link href="/studio" className="studio-link">Open Studio <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <Link href="/studio" className="min-h-11 content-center rounded-lg px-3 max-[359px]:hidden text-sm font-medium text-accent hover:text-ink">Studio</Link>
          <MobileMenu items={site.nav} github={site.github} />
        </div>
      </nav>
    </header>
  )
}
