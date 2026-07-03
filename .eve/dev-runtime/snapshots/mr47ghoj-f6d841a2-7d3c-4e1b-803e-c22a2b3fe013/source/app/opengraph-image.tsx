import { ImageResponse } from 'next/og'
import { site } from '@/lib/site'

export const alt = `${site.name} — ${site.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          backgroundColor: '#06070c',
          backgroundImage:
            'linear-gradient(rgba(91,140,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(91,140,255,0.07) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-200px',
            right: '-100px',
            width: '700px',
            height: '600px',
            background: 'radial-gradient(circle at center, rgba(91,140,255,0.22), transparent 65%)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <svg width="52" height="52" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="14" fill="#0d0f18" />
            <path d="M32 14 50 32 32 50 14 32Z" fill="none" stroke="#5b8cff" strokeWidth="3.5" strokeLinejoin="round" />
            <circle cx="32" cy="32" r="3.5" fill="#a78bfa" />
          </svg>
          <div style={{ fontSize: '30px', fontWeight: 700, color: '#e8eaf2', letterSpacing: '-0.5px' }}>{site.name}</div>
        </div>
        <div
          style={{
            marginTop: '48px',
            fontSize: '64px',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.1,
            letterSpacing: '-2px',
            maxWidth: '900px',
          }}
        >
          {site.tagline}
        </div>
        <div style={{ marginTop: '32px', fontSize: '26px', color: '#969cb2', maxWidth: '820px', lineHeight: 1.45 }}>
          From AI tool-user to system-builder. The open method — agents, loops, and the reality.md standard.
        </div>
        <div style={{ marginTop: '56px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '3px', backgroundColor: '#5b8cff' }} />
          <div style={{ fontSize: '22px', color: '#5b8cff', fontWeight: 600 }}>{site.domain}</div>
        </div>
      </div>
    ),
    { ...size },
  )
}
