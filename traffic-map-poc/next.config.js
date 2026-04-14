/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['maplibre-gl'],
  experimental: {
    outputFileTracingIncludes: {
      '/api/segments-hcmc': ['./data/*.csv'],
    },
  },
}

module.exports = nextConfig
