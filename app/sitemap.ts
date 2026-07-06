import type { MetadataRoute } from 'next'
import { site } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/method', '/manifestation', '/standard', '/assess', '/start', '/vault'].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }))
}
