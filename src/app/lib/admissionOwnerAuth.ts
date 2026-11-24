import 'server-only';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  ADMISSION_RECORD_VIEWER_COOKIE,
  verifyAdmissionRecordViewerToken,
} from '@/app/lib/admissionFormAuth';

// The ONLY account allowed to browse the full admission list, edit records,
// print them or download them as PDF.
export const ADMISSION_OWNER_EMAIL = 'mohammadfaisalpirzada@gmail.com';

export const isAdmissionOwner = async () => {
  try {
    const session = await getServerSession(authOptions);
    return session?.user?.email?.trim().toLowerCase() === ADMISSION_OWNER_EMAIL;
  } catch {
    return false;
  }
};

// Everyone else may view exactly ONE record: the one whose signed QR link they
// opened and then unlocked with a school password on the records page itself.
// Older admin/admission-desk cookies from other pages do NOT grant access here.
export const getViewerAllowedTarget = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMISSION_RECORD_VIEWER_COOKIE)?.value;
  if (!token) return null;
  return verifyAdmissionRecordViewerToken(token)?.target ?? null;
};
