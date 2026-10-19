import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient } from '@/lib/google-drive-presentations';

export const MASTER_BLOGS_FOLDER_ID = '1Pl3pR3BPIcCZ2-pC9LbQNzDPDMbfKF6u';

export async function GET(_request: NextRequest, context: { params: Promise<{ fileId: string }> }) {
  try {
    const { fileId } = await context.params;
    const drive = getDriveClient();
    const metadata = await drive.files.get({ fileId, fields: 'mimeType,parents,trashed' });

    if (
      metadata.data.trashed ||
      !metadata.data.mimeType?.startsWith('image/') ||
      !metadata.data.parents?.includes(MASTER_BLOGS_FOLDER_ID)
    ) {
      return new NextResponse('Not found', { status: 404 });
    }

    const file = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'arraybuffer' });
    return new NextResponse(Buffer.from(file.data as ArrayBuffer), {
      headers: {
        'Content-Type': metadata.data.mimeType,
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('Unable to load master blog image from Drive:', error);
    return new NextResponse('Not found', { status: 404 });
  }
}
