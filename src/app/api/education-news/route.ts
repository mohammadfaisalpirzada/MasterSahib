import { NextResponse } from 'next/server';

import { getEducationNews } from '@/app/lib/educationNews';
import { startEducationNewsCron } from '@/app/lib/educationNewsScheduler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

startEducationNewsCron();

export async function GET() {
  try {
    const news = await getEducationNews();
    return NextResponse.json({ success: true, ...news });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to load education news.',
      },
      { status: 500 },
    );
  }
}
