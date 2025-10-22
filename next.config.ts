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
  experimental: {
    allowedDevOrigins: [
      `http://localhost:${DEV_PORT}`,
      ...(ip ? [`http://${ip}:${DEV_PORT}`] : []),
    ],
  },
}

export default nextConfig
