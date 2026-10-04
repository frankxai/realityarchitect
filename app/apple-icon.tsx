import { ImageResponse } from 'next/og'
import { BrandMark } from '@/components/BrandMark'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/** The home-screen icon iPhones and iPads use when the site is added to the home screen. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#06070c' }}>
        <BrandMark size={150} />
      </div>
    ),
    size,
  )
}
