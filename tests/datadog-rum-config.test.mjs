import assert from 'node:assert/strict'
import test from 'node:test'
import {
  DATADOG_RUM_INTAKE_SOURCES,
  DATADOG_RUM_SCRIPT_ORIGIN,
  DATADOG_RUM_SITE,
  allowsRumMeasurement,
  datadogRumConfig,
  datadogRumCspSources,
  isSensitiveRumPath,
  redactRumEvent,
  redactRumUrl,
  scrubCredentialPaths,
} from '../lib/datadog-rum-config.ts'

test('datadogRumConfig returns null when required identifiers are absent', () => {
  assert.equal(datadogRumConfig({}), null)
  assert.equal(datadogRumConfig({ NEXT_PUBLIC_DD_RUM_APPLICATION_ID: 'app-1' }), null)
  assert.equal(datadogRumConfig({ NEXT_PUBLIC_DD_RUM_CLIENT_TOKEN: 'pub-1' }), null)
})

test('datadogRumConfig returns EU privacy-hardened defaults and clamps sample rate', () => {
  const cfg = datadogRumConfig({
    NEXT_PUBLIC_DD_RUM_APPLICATION_ID: 'app-123',
    NEXT_PUBLIC_DD_RUM_CLIENT_TOKEN: 'pub-456',
    NEXT_PUBLIC_DD_RUM_SAMPLE_RATE: '120',
    NEXT_PUBLIC_VERCEL_ENV: 'preview',
  })
  assert.deepEqual(cfg, {
    applicationId: 'app-123',
    clientToken: 'pub-456',
    site: DATADOG_RUM_SITE,
    service: 'realityarchitect-ai',
    env: 'preview',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 0,
    defaultPrivacyLevel: 'mask',
    trackUserInteractions: false,
    trackResources: false,
  })
})

test('allowsRumMeasurement honors DNT and GPC', () => {
  assert.equal(allowsRumMeasurement(null, false), true)
  assert.equal(allowsRumMeasurement('1', false), false)
  assert.equal(allowsRumMeasurement(null, true), false)
})

test('redactRumEvent strips queries, hashes, referrers, and vault paths', () => {
  const view = {
    type: 'view',
    view: {
      url: 'https://www.realityarchitect.ai/method?ref=secret#step',
      referrer: 'https://private.example/ref',
    },
  }
  assert.equal(redactRumEvent(view), true)
  assert.equal(view.view.url, 'https://www.realityarchitect.ai/method')
  assert.equal(view.view.referrer, '')

  assert.equal(isSensitiveRumPath('/vault/private-note'), true)
  assert.equal(
    redactRumUrl('https://www.realityarchitect.ai/vault/private-note?k=1'),
    'https://www.realityarchitect.ai/vault/:token',
  )
  assert.equal(scrubCredentialPaths('err at /api/auth/tok_9'), 'err at /api/auth/:token')
  assert.equal(
    redactRumEvent({ type: 'error', view: { url: 'https://www.realityarchitect.ai/vault/private-note' } }),
    false,
  )
})

test('redactRumEvent drops exact OAuth/vault routes, percent-encoded paths, and query secrets in errors', () => {
  assert.equal(isSensitiveRumPath('/vault'), true)
  assert.equal(isSensitiveRumPath('/auth/callback'), true)
  assert.equal(isSensitiveRumPath('/%76ault/private-note'), true)
  assert.equal(isSensitiveRumPath('/method'), false)

  const oauthError = {
    type: 'error',
    view: { url: 'https://www.realityarchitect.ai/auth/callback?code=SECRET_CODE' },
    error: { message: 'OAuth failed at https://www.realityarchitect.ai/auth/callback?code=SECRET_CODE' },
  }
  assert.equal(redactRumEvent(oauthError), false)

  const methodError = {
    type: 'error',
    view: { url: 'https://www.realityarchitect.ai/method' },
    error: {
      message: 'Failed redirect to https://www.realityarchitect.ai/vault?token=SECRET_VAULT',
      stack: 'at load (https://www.realityarchitect.ai/api/method?key=SECRET_KEY&v=1)',
    },
  }
  assert.equal(redactRumEvent(methodError), true)
  assert.equal(methodError.error.message, 'Failed redirect to https://www.realityarchitect.ai/vault')
  assert.equal(methodError.error.stack, 'at load (https://www.realityarchitect.ai/api/method?key=:redacted&v=1)')
})

test('datadogRumCspSources stays empty when disabled and returns EU script/intake origins when enabled', () => {
  assert.deepEqual(datadogRumCspSources({}), { scriptSrc: [], connectSrc: [] })
  assert.deepEqual(
    datadogRumCspSources({
      NEXT_PUBLIC_DD_RUM_APPLICATION_ID: 'app-1',
      NEXT_PUBLIC_DD_RUM_CLIENT_TOKEN: 'pub-1',
    }),
    {
      scriptSrc: [DATADOG_RUM_SCRIPT_ORIGIN],
      connectSrc: DATADOG_RUM_INTAKE_SOURCES,
    },
  )
})
