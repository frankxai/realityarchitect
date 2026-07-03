import createMDX from '@next/mdx'
import { withEve } from 'eve/next'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  experimental: { mdxRs: true },
}

const withMDX = createMDX({})

export default withEve(withMDX(nextConfig))
