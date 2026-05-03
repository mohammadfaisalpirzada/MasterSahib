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
    return {
      beforeFiles: [
        {
          source: '/',
          has: [
            {
              type: 'host',
              value: 'ggssnishtarroad.mastersahib.com',
            },
          ],
          destination: '/ggss-nishtar-road',
        },
        {
          source: '/',
          has: [
            {
              type: 'host',
              value: 'ggssnishtarroad.themastersahib.com',
            },
          ],
          destination: '/ggss-nishtar-road',
        },
        {
          source: '/',
          has: [
            {
              type: 'host',
              value: 'ggssnishtarroad.localhost',
            },
          ],
          destination: '/ggss-nishtar-road',
        },
        {
          source: '/',
          has: [
            {
              type: 'host',
              value: 'ggssnishtarroad.localhost:3000',
            },
          ],
          destination: '/ggss-nishtar-road',
        },
        {
          source: '/',
          has: [
            {
              type: 'host',
              value: 'ggssnishtarroad.localhost:3001',
            },
          ],
          destination: '/ggss-nishtar-road',
        },
      ],
    };
  },
};

export default nextConfig;
