import { NextResponse } from 'next/server';
import { getQuizCredentialsForProgram } from '@/app/lib/quizAccounts';
import { getQuizUsersFromSheet } from '@/app/lib/googleSheets';
import { getQuizSheetConfigForProgram } from '@/app/lib/quizSheets';
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

    if (role === 'student') {
      // Students: verify from Google Sheets 'Users' tab only
      const sheetConfig = getQuizSheetConfigForProgram(programName);
      if (!sheetConfig) {
        return NextResponse.json(
          { success: false, message: `No login setup found for ${programName}.` },
          { status: 401 }
        );
      }

      let sheetUsers;
      try {
        sheetUsers = await getQuizUsersFromSheet(sheetConfig.spreadsheetId);
      } catch {
        return NextResponse.json(
          {
            success: false,
            message: 'Unable to read student users sheet. Check service account access and production env variables.',
          },
          { status: 500 }
        );
      }

      const normalizedProgram = programName.trim().toLowerCase();
      const normalizedUsername = username.trim().toLowerCase();
      const matchedUser = sheetUsers.find(
        (u) =>
          u.username.toLowerCase() === normalizedUsername &&
          u.password === password &&
          u.role === 'student' &&
          u.program === normalizedProgram
      );

      if (!matchedUser) {
        return NextResponse.json(
          { success: false, message: 'Invalid username or password for selected role.' },
          { status: 401 }
        );
      }

      const studentClassLevel = matchedUser.class?.trim() || '';

      const token = await createSessionToken({
        role,
        username: matchedUser.username,
        programName,
        ...(studentClassLevel ? { classLevel: studentClassLevel } : {}),
      });

      const response = NextResponse.json({
        success: true,
        session: {
          role,
          username: matchedUser.username,
          programName,
          source: 'peace-quiz',
          ...(studentClassLevel ? { classLevel: studentClassLevel } : {}),
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
    } else {
      // Admin / Teacher: verify from hardcoded quizAccounts
      if (!credentials) {
        return NextResponse.json(
          { success: false, message: `No login setup found for ${programName}.` },
          { status: 401 }
        );
      }

      const selected = credentials[role];
      const isValid =
        Array.isArray(selected) &&
        selected.some((cred) => cred.username === username && cred.password === password);

      if (!isValid) {
        return NextResponse.json(
          { success: false, message: 'Invalid username or password for selected role.' },
          { status: 401 }
        );
      }
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
