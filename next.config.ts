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
        destination: '/ggss-subdomain-landing',
      },
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'ggssnishtarroad.themastersahib.com',
          },
        ],
        destination: '/ggss-subdomain-landing',
      },
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'ggssnishtarroad.localhost',
          },
        ],
        destination: '/ggss-subdomain-landing',
      },
    ];
  },
};

export default nextConfig;
