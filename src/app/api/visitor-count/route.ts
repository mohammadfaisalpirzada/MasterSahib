import { NextResponse } from 'next/server';

import { getVisitorCount, incrementVisitorCount } from '@/app/lib/visitorCount';

export async function GET() {
  try {
    const count = await getVisitorCount();
    return NextResponse.json({ success: true, count });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to retrieve visitor count.',
      },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const count = await incrementVisitorCount();
    return NextResponse.json({ success: true, count });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to update visitor count.',
      },
      { status: 500 },
    );
  }
}
