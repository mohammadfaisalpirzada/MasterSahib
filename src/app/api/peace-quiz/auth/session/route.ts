import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_SESSION_COOKIE, verifySessionToken } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ success: true, session: null });
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ success: true, session: null });
  }

  return NextResponse.json({
    success: true,
    session: {
      role: payload.role,
      source: payload.source,
      username: payload.username,
      programName: payload.programName,
      ...(payload.classLevel ? { classLevel: payload.classLevel } : {}),
    },
  });
}
