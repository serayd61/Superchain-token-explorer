/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable type checking during build (for faster builds)
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // API route configuration
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          }
        ]
      }
    ]
  },
  // Ensure proper output for Vercel
  output: 'standalone',
  // Image optimization
  images: {
    unoptimized: true
  }
}

export default nextConfig
