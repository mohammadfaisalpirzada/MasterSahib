import type { NextApiRequest, NextApiResponse } from 'next';
import NextAuth from 'next-auth';

import { authOptions } from '@/lib/auth';

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const forwardedHost = Array.isArray(req.headers['x-forwarded-host'])
    ? req.headers['x-forwarded-host'][0]
    : req.headers['x-forwarded-host'];
  const host = (forwardedHost || req.headers.host || '').split(',')[0]?.trim().toLowerCase();
  const forwardedProto = Array.isArray(req.headers['x-forwarded-proto'])
    ? req.headers['x-forwarded-proto'][0]
    : req.headers['x-forwarded-proto'];
  const proto = (forwardedProto || '').split(',')[0]?.trim().toLowerCase() === 'http' ? 'http' : 'https';

  const isAllowedDynamicHost =
    host === 'themastersahib.com' ||
    host === 'www.themastersahib.com' ||
    host === 'ggssnishtarroad.themastersahib.com' ||
    host.endsWith('.themastersahib.com') ||
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1');

  if (isAllowedDynamicHost) {
    process.env.NEXTAUTH_URL = `${proto}://${host}`;
  } else if (process.env.NEXTAUTH_URL?.includes('ggssnishtarroad.')) {
    process.env.NEXTAUTH_URL = 'https://themastersahib.com';
  }

  return await NextAuth(req, res, authOptions);
}
