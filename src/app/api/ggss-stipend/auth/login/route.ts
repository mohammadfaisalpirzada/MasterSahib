import { NextResponse } from 'next/server';
import {
  GGSS_STIPEND_ALLOWED_USERS,
  GGSS_STIPEND_CLASS_USERS,
  GGSS_STIPEND_SESSION_COOKIE,
  createGgssStipendSessionToken,
  isGgssStipendAdminUser,
  verifyGgssStipendCredentials,
} from '@/app/lib/ggssStipendAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { username?: string; password?: string };
    const username = body.username?.trim() || '';
    const password = body.password?.trim() || '';

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Class username and password are required.' },
        { status: 400 }
      );
    }

    if (!verifyGgssStipendCredentials(username, password)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid username or password.',
          allowedUsers: GGSS_STIPEND_ALLOWED_USERS,
        },
        { status: 401 }
      );
    }

    const isAdmin = isGgssStipendAdminUser(username);
    const token = createGgssStipendSessionToken(username);
    const response = NextResponse.json({
      success: true,
      username,
      className: isAdmin ? 'All Classes' : username,
      isAdmin,
      allowedUsers: GGSS_STIPEND_CLASS_USERS,
    });
    response.cookies.set(GGSS_STIPEND_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Stipend login failed.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
