import type { MetadataRoute } from 'next'

/** Makes the site installable as an app that opens on the Studio, on phones and desktops, with no app store. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/studio',
    name: 'Reality Studio · Reality Architect',
    short_name: 'Reality Studio',
    description: 'Your daily practice for architecting a life, kept on your device and exported as Markdown you own.',
    start_url: '/studio',
    scope: '/',
    display: 'standalone',
    background_color: '#06070c',
    theme_color: '#06070c',
    categories: ['lifestyle', 'productivity'],
    icons: [
      { src: '/pwa-icon/192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/pwa-icon/512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/pwa-icon/maskable', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
