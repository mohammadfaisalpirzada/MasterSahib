import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { STAFF_ADMIN_SESSION_COOKIE, verifyStaffAdminSessionToken } from '@/app/lib/staffAdminAuth';
import { ADMISSION_FORM_SESSION_COOKIE, verifyAdmissionFormSessionToken } from '@/app/lib/admissionFormAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();

  const adminToken = cookieStore.get(STAFF_ADMIN_SESSION_COOKIE)?.value;
  const adminSession = adminToken ? verifyStaffAdminSessionToken(adminToken) : null;

  const admissionToken = cookieStore.get(ADMISSION_FORM_SESSION_COOKIE)?.value;
  const admissionSession = admissionToken ? verifyAdmissionFormSessionToken(admissionToken) : null;

  return NextResponse.json({
    success: true,
    authenticated: Boolean(adminSession || admissionSession),
    role: adminSession ? 'admin' : admissionSession ? 'admission-desk' : null,
  });
}
