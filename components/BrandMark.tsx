/** Aperture v1: an open threshold, a horizon, and the point where a chosen act begins. */
export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="62" height="62" rx="19" fill="#0d0f18" stroke="#343849" />
      <path d="M18 47V28a14 14 0 0 1 28 0v19M13 47h38" stroke="#e8d5ad" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M25 40V28a7 7 0 0 1 14 0v12" stroke="#5b8cff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="47" r="3" fill="#e8d5ad" />
    </svg>
  )
}
