import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient } from '@/lib/google-drive-presentations';

const WORKSHOP_BANNER_FOLDER_ID = '1OZa1UbJUkHrK1DA5qYpfWTky9UQliLtz';

export async function GET(_request: NextRequest, context: { params: Promise<{ fileId: string }> }) {
  try {
    const { fileId } = await context.params;
    const drive = getDriveClient();
    const metadata = await drive.files.get({ fileId, fields: 'mimeType,parents,trashed' });

    if (metadata.data.trashed || !metadata.data.mimeType?.startsWith('image/') || !metadata.data.parents?.includes(WORKSHOP_BANNER_FOLDER_ID)) {
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
    console.error('Unable to load workshop banner:', error);
    return new NextResponse('Not found', { status: 404 });
  }
}
