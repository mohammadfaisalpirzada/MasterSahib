import { NextResponse } from 'next/server';
import { sortedEducationalResourceItems } from '@/app/lib/educationalResources';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(
      {
        success: true,
        resources: sortedEducationalResourceItems,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to load educational resources.',
      },
      { status: 500 },
    );
  }
}
