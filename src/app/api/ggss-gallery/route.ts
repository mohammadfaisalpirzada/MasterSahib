import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const GALLERY_DIR = path.join(process.cwd(), 'public', 'images', 'ggss-gallery');
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export async function GET() {
  try {
    const entries = await fs.readdir(GALLERY_DIR, { withFileTypes: true }).catch(() => []);

    const images = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => ALLOWED_EXTENSIONS.has(path.extname(name).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      .map((name) => `/images/ggss-gallery/${encodeURIComponent(name)}`);

    return NextResponse.json({ success: true, images });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to load gallery images.',
      },
      { status: 500 },
    );
  }
}
