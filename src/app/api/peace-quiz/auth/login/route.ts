import { NextResponse } from 'next/server';
import { getQuizCredentialsForProgram } from '@/app/lib/quizAccounts';
import { AUTH_SESSION_COOKIE, createSessionToken } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
      role?: 'admin' | 'teacher' | 'student';
      programName?: string;
    };

    const username = body.username?.trim() || '';
    const password = body.password || '';
    const role = body.role;
    const programName = body.programName?.trim() || '';

    if (!username || !password || !role || !programName) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required login fields.',
        },
        { status: 400 }
      );
    }

    const credentials = getQuizCredentialsForProgram(programName);
    if (!credentials) {
      return NextResponse.json(
        {
          success: false,
          message: `No login setup found for ${programName}.`,
        },
        { status: 401 }
      );
    }

    const selected = credentials[role];
    if (!selected || selected.username !== username || selected.password !== password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid username or password for selected role.',
        },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      role,
      username,
      programName,
    });

    const response = NextResponse.json({
      success: true,
      session: {
        role,
        username,
        programName,
        source: 'peace-quiz',
      },
    });

    response.cookies.set(AUTH_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
