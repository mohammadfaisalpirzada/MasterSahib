import { NextResponse } from 'next/server';
import {
  STAFF_ADMIN_SESSION_COOKIE,
  createStaffAdminSessionToken,
  verifyStaffAdminPassword,
} from '@/app/lib/staffAdminAuth';
import { checkRateLimit, getClientIdentifier } from '@/app/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`login:staff-admin:${clientId}`, 10, 10 * 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } },
      );
    }

    const body = (await request.json()) as { password?: string };
    const password = body.password?.trim() || '';

    if (!password) {
      return NextResponse.json({ success: false, message: 'Admin password is required.' }, { status: 400 });
    }

    if (!verifyStaffAdminPassword(password)) {
      return NextResponse.json({ success: false, message: 'Incorrect admin password.' }, { status: 401 });
    }

    const token = createStaffAdminSessionToken();
    const response = NextResponse.json({ success: true });
    response.cookies.set(STAFF_ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Admin login failed.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
