/** The Reality Architect mark as plain SVG, for generated images (app icons) where CSS classes do not apply. */
export function BrandMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <rect width="64" height="64" rx="14" fill="#0d0f18" />
      <path d="M21.5 0v64M42.5 0v64M0 21.5h64M0 42.5h64" stroke="#5b8cff" strokeOpacity="0.18" strokeWidth="2" />
      <path d="M32 14 50 32 32 50 14 32Z" fill="none" stroke="#5b8cff" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="32" cy="32" r="4" fill="#a78bfa" />
    </svg>
  )
}
