import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'ggssnishtarroad.mastersahib.com',
          },
        ],
        destination: '/ggss-root',
      },
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'ggssnishtarroad.themastersahib.com',
          },
        ],
        destination: '/ggss-root',
      },
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'ggssnishtarroad.localhost',
          },
        ],
        destination: '/ggss-root',
      },
    ];
  },
};

export default nextConfig;
