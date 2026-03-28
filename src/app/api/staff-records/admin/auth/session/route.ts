import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { STAFF_ADMIN_SESSION_COOKIE, verifyStaffAdminSessionToken } from '@/app/lib/staffAdminAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_ADMIN_SESSION_COOKIE)?.value;
  const session = token ? verifyStaffAdminSessionToken(token) : null;

  return NextResponse.json({
    success: true,
    authenticated: Boolean(session),
  });
}
