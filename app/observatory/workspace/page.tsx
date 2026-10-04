import type { Metadata } from 'next'
import { ConnectedObservatory } from '@/components/ConnectedObservatory'
import { ogImage } from '@/lib/site'
export const metadata: Metadata = { title: 'Connected Observatory', description: 'An opt-in private evidence workspace and AI review desk.', alternates: { canonical: '/observatory/workspace' }, openGraph: { url: '/observatory/workspace', images: [ogImage] }, robots: { index: false, follow: false } }
export default function Workspace() { return <div className="py-16"><p className="font-mono text-xs uppercase tracking-widest text-accent">Mechanism / Evidence before action</p><h1 className="mt-5 text-4xl font-semibold sm:text-6xl">Keep evidence. Question it.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-muted">An opt-in connected workspace for private records, explicit AI review, and guardian discussion. Your offline Studio stays on your device.</p><ConnectedObservatory /></div> }
