import { NextResponse } from 'next/server';

import storeData from '@/data/store-data.json';
import { getStoreDownloadCounts, incrementStoreDownload } from '@/app/lib/storeDownloads';

export const dynamic = 'force-dynamic';

/** Only real store apps can be counted (stops junk rows being added to the sheet). */
const KNOWN_IDS = new Set<string>([
  'msve-video-editor', // pinned web app in src/app/the-master-store/page.tsx
  ...(storeData.items as Array<{ id: string }>).map((i) => i.id),
]);

// Short in-memory cache so every page view doesn't hit the Sheets API.
let cache: { at: number; counts: Record<string, number> } | null = null;
const CACHE_MS = 30_000;

export async function GET() {
  try {
    if (!cache || Date.now() - cache.at > CACHE_MS) {
      cache = { at: Date.now(), counts: await getStoreDownloadCounts() };
    }
    return NextResponse.json(
      { success: true, counts: cache.counts },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to read store counts.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { id?: unknown };
    const id = typeof body.id === 'string' ? body.id.trim() : '';
    if (!KNOWN_IDS.has(id)) {
      return NextResponse.json({ success: false, message: 'Unknown app.' }, { status: 400 });
    }
    const count = await incrementStoreDownload(id);
    if (cache) cache.counts[id] = count;
    return NextResponse.json({ success: true, id, count });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to update store count.' },
      { status: 500 },
    );
  }
}
