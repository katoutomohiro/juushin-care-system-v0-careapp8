import type { NextConfig } from "next"

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
