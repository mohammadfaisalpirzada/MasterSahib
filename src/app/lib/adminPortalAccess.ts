import 'server-only';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { STAFF_ADMIN_SESSION_COOKIE, verifyStaffAdminSessionToken } from '@/app/lib/staffAdminAuth';

// Google accounts allowed into the GGSS admin portal. Add an email here to give
// someone else access — nobody else can even load these pages.
export const ADMIN_PORTAL_EMAILS = ['mohammadfaisalpirzada@gmail.com'];

// Server-side gate for /ggss-nishtar-road/admin (dashboard, id-cards, report-cards,
// takeover). Runs BEFORE any admin UI is sent to the browser:
//   - allowed Google account            -> in
//   - valid staff-admin session cookie  -> in (existing "admin rights" session)
//   - not signed in at all              -> sent to Google sign-in
//   - signed in with any other account  -> plain 404 (nothing about admin is revealed)
export const requireAdminPortalAccess = async (path: string) => {
  let email = '';
  try {
    const session = await getServerSession(authOptions);
    email = session?.user?.email?.trim().toLowerCase() ?? '';
  } catch {
    email = '';
  }
  if (email && ADMIN_PORTAL_EMAILS.includes(email)) return;

  const cookieStore = await cookies();
  const adminToken = cookieStore.get(STAFF_ADMIN_SESSION_COOKIE)?.value;
  if (adminToken && verifyStaffAdminSessionToken(adminToken)) return;

  if (!email) redirect(`/auth/signin?callbackUrl=${encodeURIComponent(path)}`);
  notFound();
};

// Same rule as requireAdminPortalAccess, but returns true/false for API routes
// (which must answer 401/403 JSON instead of redirecting).
export const hasAdminPortalAccess = async (): Promise<boolean> => {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.trim().toLowerCase() ?? '';
    if (email && ADMIN_PORTAL_EMAILS.includes(email)) return true;
  } catch {
    // fall through to the cookie check
  }
  const cookieStore = await cookies();
  const adminToken = cookieStore.get(STAFF_ADMIN_SESSION_COOKIE)?.value;
  return Boolean(adminToken && verifyStaffAdminSessionToken(adminToken));
};
