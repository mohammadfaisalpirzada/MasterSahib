import { checkRateLimit, getClientIdentifier } from '@/app/lib/rateLimit';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function verifyPassword(input: string, expected: string): boolean {
  const a = Buffer.from(input, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  {
    const rl = await checkRateLimit(`post:ggss-tt-afternoon:${getClientIdentifier(request)}`, 8, 600);
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.', message: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } },
      );
    }
  }
  try {
    const body = (await request.json().catch(() => ({}))) as { password?: unknown };
    const password = typeof body.password === 'string' ? body.password.trim() : '';
    const expected = process.env.GGSS_TT_PASSWORD || 'PakQtr';

    if (!password || !verifyPassword(password, expected)) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password. Please try again.' },
        { status: 401 }
      );
    }

    const dataPath = path.join(process.cwd(), 'src', 'data', 'ggss-tt-afternoon.json');
    const raw = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(raw);

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Unable to load timetable data.' },
      { status: 500 }
    );
  }
}
