import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { timingSafeEqual } from 'node:crypto';
import { checkRateLimit, getClientIdentifier } from '@/app/lib/rateLimit';

const safeEqual = (a: string, b: string) => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
};

export async function POST(req: Request) {
  const clientId = getClientIdentifier(req);
  const rateLimit = checkRateLimit(`login:admin:${clientId}`, 10, 10 * 60);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } },
    );
  }

  const { password } = await req.json();
  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_TOKEN) return NextResponse.json({ error:'Admin environment variables missing' }, { status:500 });
  if (typeof password !== 'string' || !safeEqual(password, process.env.ADMIN_PASSWORD)) return NextResponse.json({ error:'Invalid password' }, { status:401 });
  const cookieStore = await cookies();
  cookieStore.set('district_east_admin', process.env.ADMIN_SESSION_TOKEN, { httpOnly:true, secure:process.env.NODE_ENV==='production', sameSite:'lax', path:'/', maxAge:60*60*8 });
  return NextResponse.json({ ok:true });
}
