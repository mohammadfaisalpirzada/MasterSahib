import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ pageNumber: string }> }
) {
  const { pageNumber } = await params;
  const pageNum = parseInt(pageNumber, 10);

  if (isNaN(pageNum) || pageNum < 1 || pageNum > 70) {
    return NextResponse.json({ error: 'Invalid page number' }, { status: 400 });
  }

  // Basic anti-hotlink / direct browser scraping protection
  const referer = request.headers.get('referer') || '';
  const secFetchDest = request.headers.get('sec-fetch-dest') || '';
  const isViewerRequest =
    request.headers.get('x-ms-viewer') === 'iba-2008' ||
    referer.includes('/iba-result-2008') ||
    referer.includes('localhost') ||
    referer.includes('themastersahib') ||
    referer.includes('mastersahib') ||
    secFetchDest === 'image';

  if (!isViewerRequest) {
    return NextResponse.json(
      { error: 'Direct download is disabled. Please view and print pages on www.themastersahib.com' },
      { status: 403 }
    );
  }

  const fileName = `page-${String(pageNum).padStart(2, '0')}.jpg`;
  const filePath = path.join(process.cwd(), 'src', 'data', 'iba-result-2008', 'pages', fileName);

  try {
    const fileBuffer = await fs.readFile(filePath);
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `inline; filename="MasterSahib-IBA-2008-Page-${String(pageNum).padStart(2, '0')}.jpg"`,
        'Cache-Control': 'private, max-age=3600, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'noimageindex',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  }
}
