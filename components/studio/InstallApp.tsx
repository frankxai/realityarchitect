'use client'

import { useEffect, useState } from 'react'
import { button } from './ui'

/** Chromium's install prompt; not in the DOM typings. */
interface InstallPrompt extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Registers the offline worker and, where the browser offers it, an "Install the Studio" button. Safari adds the site
 * from its Share menu instead, so nothing shows there. The worker caches site code only, never the person's words.
 */
export function InstallApp({ announce }: { announce: (text: string) => void }) {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => undefined)
    const onPrompt = (event: Event) => {
      event.preventDefault()
      setPrompt(event as InstallPrompt)
    }
    const onInstalled = () => {
      setPrompt(null)
      announce('The Studio is installed. It opens from your home screen or app list.')
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [announce])

  if (!prompt) return null
  return (
    <button
      type="button"
      className={button.secondary}
      onClick={async () => {
        await prompt.prompt()
        const choice = await prompt.userChoice
        setPrompt(null)
        if (choice.outcome === 'dismissed') announce('Not installed. You can install the Studio later from the browser menu.')
      }}
    >
      Install the Studio
    </button>
  )
}
