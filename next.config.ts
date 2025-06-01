import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Enable for Docker optimization
  serverExternalPackages: ['redis', 'mem0ai'],
  eslint: {
    // Disable linting during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip type checking during production builds (speeds up build)
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost', 'mnemo.ishaan812.com', 'mnemo.ishaan812.com'],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Handle Cloudflare Workers polyfills
    if (isServer) {
      config.externals.push({
        'cloudflare:sockets': 'commonjs cloudflare:sockets',
      });
    }
    
    // Fallback for modules that might not be available
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'cloudflare:sockets': false,
    };

    return config;
  },
};

export default nextConfig;
