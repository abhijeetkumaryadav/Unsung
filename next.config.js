/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['*'],
    unoptimized: true,
  },
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig