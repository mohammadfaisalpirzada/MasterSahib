import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { GGSS_STIPEND_SESSION_COOKIE, isGgssStipendAdminUser, verifyGgssStipendSessionToken } from '@/app/lib/ggssStipendAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(GGSS_STIPEND_SESSION_COOKIE)?.value;
  const session = token ? verifyGgssStipendSessionToken(token) : null;

  return NextResponse.json({
    success: true,
    authenticated: Boolean(session),
    username: session?.username || '',
    className: session?.className || '',
    isAdmin: session ? isGgssStipendAdminUser(session.username) : false,
  });
}
