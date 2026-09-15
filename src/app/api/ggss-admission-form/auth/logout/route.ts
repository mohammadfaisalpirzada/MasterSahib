import { NextResponse } from 'next/server';
import { ADMISSION_FORM_SESSION_COOKIE } from '@/app/lib/admissionFormAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Only clears the lighter admission-desk session — logging out here should not
// sign a full admin (who may be using the shared main /admin dashboard too) out of that session.
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMISSION_FORM_SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return response;
}
