import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
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
        // Old software hub and short alias → The Master Store.
        source: '/softwares',
        destination: '/the-master-store',
        permanent: true,
      },
      {
        source: '/softwares/:path*',
        destination: '/the-master-store/:path*',
        permanent: true,
      },
      {
        source: '/store',
        destination: '/the-master-store',
        permanent: true,
      },
      {
        source: '/store/:path*',
        destination: '/the-master-store/:path*',
        permanent: true,
      },
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
      {
        // Old URL structure before the educational-resources rename.
        // Google Search Console flagged /teaching-tools/exit-ticket and
        // /teaching-tools/fun-learning as 404s — see AI_IMPROVEMENT_LOG.md 2026-10-06.
        source: '/teaching-tools/:slug*',
        destination: '/educational-resources/:slug*',
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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            // Intentionally permissive on script-src/style-src (unsafe-inline,
            // unsafe-eval) rather than a strict nonce-based policy: this site
            // runs Google AdSense + Analytics (revenue-critical, notoriously
            // CSP-sensitive) and this change could not be build/browser-tested
            // before deploy in the environment it was written in. Still adds
            // real protection: blocks script/frame/connect loads from any
            // domain not explicitly listed, locks down object-src and
            // base-uri, and reinforces frame-ancestors alongside the existing
            // X-Frame-Options. Tightening further (nonces, dropping
            // unsafe-eval) is a good follow-up once it can be tested live.
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://www.google-analytics.com https://*.googlesyndication.com https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://www.google-analytics.com https://generativelanguage.googleapis.com https://*.googlesyndication.com https://*.google-analytics.com https://*.adtrafficquality.google; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://accounts.google.com https://*.googlesyndication.com https://googleads.g.doubleclick.net https://*.adtrafficquality.google; object-src 'none'; base-uri 'self'; frame-ancestors 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
