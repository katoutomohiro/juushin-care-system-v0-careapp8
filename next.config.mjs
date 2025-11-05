const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    allowedDevOrigins: ['http://localhost:3000', 'http://192.168.2.7:3000'],
  },
  async redirects() {
    return [
      {
        source: '/achievements/daily',
        destination: '/manage/achievements/daily',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
