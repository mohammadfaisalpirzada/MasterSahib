import { NextResponse } from 'next/server';

import { refreshEducationNews } from '@/app/lib/educationNews';
import { startEducationNewsCron } from '@/app/lib/educationNewsScheduler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

startEducationNewsCron();

const isAuthorized = (request: Request) => {
  const secret = process.env.EDUCATION_NEWS_CRON_SECRET?.trim() || process.env.CRON_SECRET?.trim();

  if (!secret) {
    return true;
  }

  const url = new URL(request.url);
  const querySecret = url.searchParams.get('secret');
  const authorizationHeader = request.headers.get('authorization');

  return querySecret === secret || authorizationHeader === `Bearer ${secret}`;
};

const handleRefresh = async (request: Request) => {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized refresh request.' },
      { status: 403 },
    );
  }

  try {
    const news = await refreshEducationNews();
    return NextResponse.json({ success: true, ...news });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to refresh education news.',
      },
      { status: 500 },
    );
  }
};

export async function GET(request: Request) {
  return handleRefresh(request);
}

export async function POST(request: Request) {
  return handleRefresh(request);
}
