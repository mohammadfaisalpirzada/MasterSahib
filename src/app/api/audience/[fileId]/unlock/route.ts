import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { createAudienceToken, hashAudiencePin } from '@/lib/audience-pdf-auth';
import { getDriveClient } from '@/lib/google-drive-presentations';
import { checkRateLimit, getClientIdentifier } from '@/app/lib/rateLimit';

const safeEqual = (a: string, b: string) => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
};

export async function POST(request: Request, { params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params;

  // Audience PINs are short (often a handful of digits), so this endpoint is
  // directly brute-forceable without a limit - rate-limit by IP+fileId.
  const clientId = getClientIdentifier(request);
  const rateLimit = checkRateLimit(`audience-unlock:${fileId}:${clientId}`, 10, 10 * 60);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } },
    );
  }

  const { pin } = await request.json() as { pin?: string };
  const drive = getDriveClient();
  const file = await drive.files.get({ fileId, fields: 'appProperties' });
  const props = file.data.appProperties;
  const expectedHash = props?.audiencePinHash;
  const isCorrectPin =
    props?.audienceEnabled === 'true' &&
    typeof pin === 'string' &&
    !!pin &&
    typeof expectedHash === 'string' &&
    safeEqual(hashAudiencePin(fileId, pin), expectedHash);

  if (!isCorrectPin) {
    return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });
  }
  const response = NextResponse.json({ success: true });
  response.cookies.set(`audience_${fileId}`, createAudienceToken(fileId), { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 8, path: `/` });
  return response;
}
