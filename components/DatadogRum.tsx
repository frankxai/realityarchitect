'use client'

import { useSyncExternalStore } from 'react'
import Script from 'next/script'
import {
  DATADOG_RUM_SCRIPT_URL,
  allowsRumMeasurement,
  datadogRumConfig,
  redactRumEvent,
} from '@/lib/datadog-rum-config'

type PrivacyNavigator = Navigator & { globalPrivacyControl?: boolean }

type DatadogRumGlobal = {
  init: (options: Record<string, unknown>) => void
}

declare global {
  interface Window {
    DD_RUM?: DatadogRumGlobal
  }
}

const config = datadogRumConfig({
  NEXT_PUBLIC_DD_RUM_APPLICATION_ID: process.env.NEXT_PUBLIC_DD_RUM_APPLICATION_ID,
  NEXT_PUBLIC_DD_RUM_CLIENT_TOKEN: process.env.NEXT_PUBLIC_DD_RUM_CLIENT_TOKEN,
  NEXT_PUBLIC_DD_RUM_SAMPLE_RATE: process.env.NEXT_PUBLIC_DD_RUM_SAMPLE_RATE,
  NEXT_PUBLIC_DD_RUM_ENV: process.env.NEXT_PUBLIC_DD_RUM_ENV,
  NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
})

let rumInitialized = false

function subscribeToPrivacySignal() {
  return () => undefined
}

function initRum() {
  if (!config || rumInitialized || !window.DD_RUM) return
  rumInitialized = true
  window.DD_RUM.init({
    ...config,
    trackingConsent: 'granted',
    beforeSend: redactRumEvent,
  })
}

/**
 * Env-flag-gated Datadog Real User Monitoring.
 * Renders nothing when NEXT_PUBLIC_DD_RUM_* env vars are unset or when DNT/GPC is active.
 */
export function DatadogRum() {
  const canLoad = useSyncExternalStore(
    subscribeToPrivacySignal,
    () => {
      if (!config) return false
      const privacyNavigator = navigator as PrivacyNavigator
      return allowsRumMeasurement(privacyNavigator.doNotTrack, Boolean(privacyNavigator.globalPrivacyControl))
    },
    () => false,
  )

  if (!config || !canLoad) return null

  return <Script id="datadog-rum" src={DATADOG_RUM_SCRIPT_URL} strategy="afterInteractive" onReady={initRum} />
}
