import { NextRequest, NextResponse } from 'next/server';
import { AUTH_SESSION_COOKIE, verifySessionToken } from './lib/session';

const redirectToLogin = (request: NextRequest) => {
  const loginUrl = new URL('/peace-quiz', request.url);
  loginUrl.searchParams.set('next', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/api/peace-quiz/auth/')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isApi = pathname.startsWith('/api/peace-quiz/questions');

  if (!session) {
    if (isApi) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    return redirectToLogin(request);
  }

  if (pathname.startsWith('/admin') && session.role !== 'admin') {
    return redirectToLogin(request);
  }

  if (pathname.startsWith('/teacher') && session.role !== 'teacher') {
    return redirectToLogin(request);
  }

  if ((pathname.startsWith('/student') || pathname.startsWith('/peace-quiz/student')) && session.role !== 'student') {
    return redirectToLogin(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/teacher/:path*',
    '/student/:path*',
    '/peace-quiz/student/:path*',
    '/api/peace-quiz/questions',
  ],
};
