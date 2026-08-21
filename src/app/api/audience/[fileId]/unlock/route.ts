import { NextResponse } from 'next/server';
import { createAudienceToken, hashAudiencePin } from '@/lib/audience-pdf-auth';
import { getDriveClient } from '@/lib/google-drive-presentations';

export async function POST(request: Request, { params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params;
  const { pin } = await request.json() as { pin?: string };
  const drive = getDriveClient();
  const file = await drive.files.get({ fileId, fields: 'appProperties' });
  const props = file.data.appProperties;
  if (props?.audienceEnabled !== 'true' || !pin || hashAudiencePin(fileId, pin) !== props.audiencePinHash) {
    return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });
  }
  const response = NextResponse.json({ success: true });
  response.cookies.set(`audience_${fileId}`, createAudienceToken(fileId), { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 8, path: `/` });
  return response;
}
