import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyAudienceToken } from '@/lib/audience-pdf-auth';
import { getDriveClient } from '@/lib/google-drive-presentations';

export async function GET(_request: Request, { params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params;
  const token = (await cookies()).get(`audience_${fileId}`)?.value;
  if (!verifyAudienceToken(token, fileId)) return NextResponse.json({ error: 'Locked' }, { status: 401 });
  const drive = getDriveClient();
  const file = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'arraybuffer' });
  return new NextResponse(Buffer.from(file.data as ArrayBuffer), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline', 'Cache-Control': 'private, no-store' } });
}
