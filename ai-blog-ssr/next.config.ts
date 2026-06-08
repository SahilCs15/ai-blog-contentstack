import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@contentstack/live-preview-utils'],
  // Pin the workspace root — the repo has stray lockfiles further up the tree.
  turbopack: { root: __dirname },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.csnonprod.com' },
      { protocol: 'https', hostname: 'images.contentstack.io' },
    ],
  },
}

export default nextConfig
