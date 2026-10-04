import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'

// Routes published after site.updatedAt carry their own last significant update, so lastmod stays truthful.
const UPDATED: Record<string, string> = { '/threshold': '2026-10-04', '/start': '2026-10-04', '/privacy': '2026-10-04' }

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/method', '/standard', '/assess', '/apply', '/start', '/vault', '/privacy', '/threshold'].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(UPDATED[path] ?? site.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }))
}
