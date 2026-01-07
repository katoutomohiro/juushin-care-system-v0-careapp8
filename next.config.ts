import type { NextConfig } from "next"

const DEV_PORT = 3000
const ip = process.env.DEV_HOST

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/achievements/daily",
        destination: "/manage/achievements/daily",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
