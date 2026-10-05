import type { MetadataRoute } from 'next'
import { isOpen } from '@/lib/programs/complete-edition'
import { DAYS } from '@/lib/programs/imaginal-30'
import { site } from '@/lib/site'

// Routes published after site.updatedAt carry their own last significant update, so lastmod stays truthful.
const UPDATED: Record<string, string> = { '/threshold': '2026-10-04', '/start': '2026-10-04', '/privacy': '2026-10-04' }

// The free program and each of its days. The Complete Edition joins only once it can be bought.
const PROGRAM = ['/programs/imaginal-30', ...Array.from({ length: DAYS }, (_, index) => `/programs/imaginal-30/${index + 1}`)]

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['', '/method', '/standard', '/assess', '/apply', '/start', '/vault', '/privacy', '/threshold', '/studio', '/library', ...PROGRAM]
  if (isOpen()) paths.push('/programs/imaginal-30/complete')
  return paths.map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(UPDATED[path] ?? (path.startsWith('/programs/') ? '2026-10-05' : site.updatedAt)),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }))
}
