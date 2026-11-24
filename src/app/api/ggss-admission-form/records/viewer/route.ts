import { NextResponse } from 'next/server';
import { verifyStaffAdminPassword } from '@/app/lib/staffAdminAuth';
import {
  ADMISSION_RECORD_VIEWER_COOKIE,
  ADMISSION_RECORD_VIEWER_COOKIE_PATH,
  ADMISSION_RECORD_VIEWER_TTL_SECONDS,
  createAdmissionRecordViewerToken,
  isValidAdmissionVerifySignature,
  verifyAdmissionFormPassword,
} from '@/app/lib/admissionFormAuth';
import { checkRateLimit, getClientIdentifier } from '@/app/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Unlocks VIEW-ONLY access to the single record named in a signed QR link.
// Needs: a genuine (untampered) QR signature + a school password, every time.
export async function POST(request: Request) {
  try {
    const clientId = getClientIdentifier(request);
    const rateLimit = await checkRateLimit(`login:admission-record-viewer:${clientId}`, 10, 10 * 60);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } },
      );
    }

    const body = (await request.json()) as { password?: string; target?: string; sig?: string };
    const password = String(body.password ?? '').trim();
    const target = String(body.target ?? '').trim();
    const sig = String(body.sig ?? '').trim();

    if (!isValidAdmissionVerifySignature(target, sig)) {
      return NextResponse.json(
        { success: false, message: 'This QR link is invalid or has been changed. Please scan the original form.' },
        { status: 403 },
      );
    }

    if (!password) {
      return NextResponse.json({ success: false, message: 'Password is required.' }, { status: 400 });
    }

    if (!verifyStaffAdminPassword(password) && !verifyAdmissionFormPassword(password)) {
      return NextResponse.json({ success: false, message: 'Incorrect password.' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, role: 'viewer' });
    response.cookies.set(ADMISSION_RECORD_VIEWER_COOKIE, createAdmissionRecordViewerToken(target), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: ADMISSION_RECORD_VIEWER_COOKIE_PATH,
      maxAge: ADMISSION_RECORD_VIEWER_TTL_SECONDS,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Login failed.' },
      { status: 500 },
    );
  }
}

// Ends the viewer session (called when the record is closed).
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMISSION_RECORD_VIEWER_COOKIE, '', {
    path: ADMISSION_RECORD_VIEWER_COOKIE_PATH,
    maxAge: 0,
  });
  return response;
}
