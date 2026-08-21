import { NextResponse } from 'next/server';
import { getDriveClient } from '@/lib/google-drive-presentations';

const WORKSHOP_BANNER_FOLDER_ID = '1OZa1UbJUkHrK1DA5qYpfWTky9UQliLtz';

export const revalidate = 300;

export async function GET() {
  try {
    const drive = getDriveClient();
    const response = await drive.files.list({
      q: `'${WORKSHOP_BANNER_FOLDER_ID}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: 'files(id,name,mimeType,modifiedTime)',
      orderBy: 'modifiedTime desc',
      pageSize: 100,
    });

    const banners = (response.data.files ?? [])
      .filter((file) => file.id && file.name)
      .map((file) => ({
        id: file.id as string,
        name: file.name as string,
        modifiedTime: file.modifiedTime ?? '',
        imageUrl: `/api/workshop-banners/${file.id}`,
      }));

    return NextResponse.json({ banners }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' },
    });
  } catch (error) {
    console.error('Unable to list workshop banners:', error);
    return NextResponse.json({ banners: [] }, { status: 200 });
  }
}
