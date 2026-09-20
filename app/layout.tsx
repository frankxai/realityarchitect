import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { site } from '@/lib/site'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jb', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  applicationName: site.name,
  title: { default: `${site.name} — ${site.tagline}`, template: `%s · ${site.name}` },
  description: site.description,
  openGraph: { title: site.name, description: site.description, siteName: site.name, type: 'website' },
  twitter: { card: 'summary_large_image', title: site.name, description: site.description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
}

// The surface declares a single colour scheme (globals.css `:root { color-scheme: dark }`), so one
// themeColor is correct. viewportFit: 'cover' is what makes env(safe-area-inset-*) resolve on a
// phone; without it the site reads as a website inside a browser (AGENTS.md §11.3).
export const viewport: Viewport = {
  themeColor: '#06070c',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable} ${mono.variable}`}>
      <body>
        <a href="#content" className="skip-link">Skip to content</a>
        <Nav />
        <main id="content" className="mx-auto max-w-5xl px-5">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
