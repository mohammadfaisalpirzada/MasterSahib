import { checkRateLimit, getClientIdentifier } from '@/app/lib/rateLimit';
import { NextResponse } from 'next/server';
import { PICTURE_KEY } from '@/app/lib/staffRecords';

const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const runtime = 'nodejs';

export async function POST(request: Request) {
  {
    const rl = await checkRateLimit(`post:staff-records-picture:${getClientIdentifier(request)}`, 20, 600);
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.', message: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } },
      );
    }
  }
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided.' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Only JPG, PNG and WebP images are supported.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { success: false, message: `Image size must be under 1MB. Your file is ${(file.size / 1024).toFixed(1)}KB.` },
        { status: 400 }
      );
    }

    // Convert to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    // Return base64 encoded image
    return NextResponse.json(
      { success: true, data: base64, key: PICTURE_KEY },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to process image.' },
      { status: 500 }
    );
  }
}
