import { NextResponse } from 'next/server';
import {
  STAFF_ADMIN_SESSION_COOKIE,
  createStaffAdminSessionToken,
  verifyStaffAdminPassword,
} from '@/app/lib/staffAdminAuth';
import {
  ADMISSION_FORM_SESSION_COOKIE,
  createAdmissionFormSessionToken,
  verifyAdmissionFormPassword,
} from '@/app/lib/admissionFormAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

// Accepts EITHER the full admin password OR the lighter admission-desk password,
// so the same login box on the Admission Form page works for both.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: string };
    const password = body.password?.trim() || '';

    if (!password) {
      return NextResponse.json({ success: false, message: 'Password is required.' }, { status: 400 });
    }

    if (verifyStaffAdminPassword(password)) {
      const token = createStaffAdminSessionToken();
      const response = NextResponse.json({ success: true, role: 'admin' });
      response.cookies.set(STAFF_ADMIN_SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_MAX_AGE_SECONDS,
      });
      return response;
    }

    if (verifyAdmissionFormPassword(password)) {
      const token = createAdmissionFormSessionToken();
      const response = NextResponse.json({ success: true, role: 'admission-desk' });
      response.cookies.set(ADMISSION_FORM_SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_MAX_AGE_SECONDS,
      });
      return response;
    }

    return NextResponse.json({ success: false, message: 'Incorrect password.' }, { status: 401 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
