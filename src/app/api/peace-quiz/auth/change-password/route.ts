import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_SESSION_COOKIE, verifySessionToken } from '@/lib/session';
import { getQuizSheetConfigForProgram } from '@/app/lib/quizSheets';
import { getQuizUsersFromSheet, updateQuizUserPasswordInSheet } from '@/app/lib/googleSheets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_SESSION_COOKIE)?.value;

    const session = token ? await verifySessionToken(token) : null;

    const body = (await request.json()) as {
      username?: string;
      role?: 'admin' | 'teacher' | 'student';
      programName?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    const requestRole = body.role;
    const requestedUsername = body.username?.trim() || '';
    const requestedProgramName = body.programName?.trim() || '';

    const currentPassword = body.currentPassword?.trim() || '';
    const newPassword = body.newPassword?.trim() || '';

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Current and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'New password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const targetRole = session?.role || requestRole;
    if (targetRole !== 'student') {
      return NextResponse.json(
        { success: false, message: 'Only students can change their password.' },
        { status: 403 }
      );
    }

    const targetUsername = session?.username || requestedUsername;
    const targetProgramName = session?.programName || requestedProgramName;

    if (!targetUsername || !targetProgramName) {
      return NextResponse.json(
        { success: false, message: 'Username and program name are required.' },
        { status: 400 }
      );
    }

    const sheetConfig = getQuizSheetConfigForProgram(targetProgramName);
    if (!sheetConfig) {
      return NextResponse.json(
        { success: false, message: 'Password change not supported for this program.' },
        { status: 400 }
      );
    }

    // Verify current password
    const sheetUsers = await getQuizUsersFromSheet(sheetConfig.spreadsheetId);
    const normalizedProgram = targetProgramName.trim().toLowerCase();
    const matchedUser = sheetUsers.find(
      (u) =>
        u.username === targetUsername &&
        u.password === currentPassword &&
        u.role === 'student' &&
        u.program === normalizedProgram
    );

    if (!matchedUser) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect.' },
        { status: 401 }
      );
    }

    // Update password in sheet
    const updated = await updateQuizUserPasswordInSheet(
      targetUsername,
      targetProgramName,
      'student',
      newPassword,
      sheetConfig.spreadsheetId
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Could not update password. Please contact your teacher.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Password change failed.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
