import { ImageResponse } from 'next/og'
import { BrandMark } from '@/components/BrandMark'

export const dynamic = 'force-static'
export const dynamicParams = false

const SIZES = { '192': 192, '512': 512, maskable: 512 } as const

export function generateStaticParams() {
  return Object.keys(SIZES).map((size) => ({ size }))
}

/** App icons for the web manifest. The maskable icon keeps the mark inside the central safe zone on a full bleed. */
export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params
  const pixels = SIZES[size as keyof typeof SIZES]
  if (!pixels) return new Response('Not found', { status: 404 })
  const mark = Math.round(pixels * (size === 'maskable' ? 0.56 : 0.86))
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#06070c' }}>
        <BrandMark size={mark} />
      </div>
    ),
    { width: pixels, height: pixels },
  )
}
