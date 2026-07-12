import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/method', '/standard', '/assess', '/apply', '/start', '/vault', '/privacy'].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(site.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }))
}
