/** @type {import('next').NextConfig} */

// Optional: Enable bundle analyzer for debugging
const withBundleAnalyzer = process.env.ANALYZE === 'true'
  ? require('@next/bundle-analyzer')({
      enabled: true,
    })
  : (config) => config;

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false, // Reduce bundle size in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  },
  webpack: (config, { isServer }) => {
    // Avoid conflicts with Next.js 14's default caching strategy
    // Next.js 14 uses cacheUnaffected strategy which conflicts with usedExports
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        sideEffects: false,
      };
    }
    return config;
  },
  // Enable code splitting for large libraries
  // Next.js 14+ automatically code-splits large dependencies like recharts
  experimental: {
    optimizePackageImports: ['recharts'],
  },
};

module.exports = withBundleAnalyzer(nextConfig);
