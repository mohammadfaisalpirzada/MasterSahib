import { Readable } from 'node:stream';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { google } from 'googleapis';

import { authOptions } from '@/lib/auth';
import { encryptAudiencePin, hashAudiencePin } from '@/lib/audience-pdf-auth';
import { AUDIENCE_PDF_FOLDER_ID, getDriveClient } from '@/lib/google-drive-presentations';

const OWNER_EMAIL = 'mohammadfaisalpirzada@gmail.com';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const googleDriveAccessToken = (session as (typeof session & { googleDriveAccessToken?: string }) | null)?.googleDriveAccessToken;
  if (session?.user?.email?.toLowerCase() !== OWNER_EMAIL) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await request.json() as { action?: string; presentationId?: string; title?: string; pdfId?: string; pin?: string };
  const drive = getDriveClient();

  try {
    if (body.action === 'create' && body.presentationId) {
      if (!googleDriveAccessToken) return NextResponse.json({ error: 'Connect Google Drive first, then try again.' }, { status: 401 });
      const exported = await drive.files.export({ fileId: body.presentationId, mimeType: 'application/pdf' }, { responseType: 'arraybuffer' });
      const bytes = Buffer.from(exported.data as ArrayBuffer);
      const oauth = new google.auth.OAuth2();
      oauth.setCredentials({ access_token: googleDriveAccessToken });
      const userDrive = google.drive({ version: 'v3', auth: oauth });
      const created = await userDrive.files.create({
        requestBody: {
          name: `${(body.title || 'Presentation').replace(/[\\/:*?"<>|]/g, '-')}.pdf`,
          parents: [AUDIENCE_PDF_FOLDER_ID],
          appProperties: { sourcePresentationId: body.presentationId, audienceEnabled: 'false' },
        },
        media: { mimeType: 'application/pdf', body: Readable.from(bytes) },
        fields: 'id',
      });
      return NextResponse.json({ success: true, pdfId: created.data.id });
    }

    if (body.action === 'pin' && body.pdfId && body.pin && /^\d{4,10}$/.test(body.pin)) {
      if (!googleDriveAccessToken) return NextResponse.json({ error: 'Connect Google Drive first, then try again.' }, { status: 401 });
      const oauth = new google.auth.OAuth2();
      oauth.setCredentials({ access_token: googleDriveAccessToken });
      await google.drive({ version: 'v3', auth: oauth }).files.update({
        fileId: body.pdfId,
        requestBody: { appProperties: { audiencePinHash: hashAudiencePin(body.pdfId, body.pin), audiencePinCipher: encryptAudiencePin(body.pdfId, body.pin), audienceEnabled: 'true' } },
      });
      return NextResponse.json({ success: true });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Google Drive request failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}
