import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    allowedDevOrigins: ["http://192.168.2.7:3000"],
  },
}

export default nextConfig
