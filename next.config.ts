import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/courses/ai-for-teachers',
        destination: '/courses/ai-for-all',
        permanent: true,
      },
      {
        source: '/curriculum',
        destination: '/class_notes',
        permanent: true,
      },
      {
        source: '/class-notes',
        destination: '/class_notes',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/portal',
          destination: '/ggss-nishtar-road/staff-portal',
        },
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
