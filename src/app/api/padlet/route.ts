import { NextResponse } from 'next/server';

import { addPadletIdea, getPadletIdeas } from '@/app/lib/padletIdeas';

const sanitize = (value: unknown) => String(value ?? '').trim();

export async function GET() {
  try {
    const items = await getPadletIdeas();
    return NextResponse.json({ success: true, items });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to load ideas.',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { author?: string; idea?: string };

    const author = sanitize(body.author) || 'Anonymous';
    const idea = sanitize(body.idea);

    if (!idea) {
      return NextResponse.json({ success: false, message: 'Idea is required.' }, { status: 400 });
    }

    if (author.length > 120) {
      return NextResponse.json({ success: false, message: 'Author name is too long.' }, { status: 400 });
    }

    if (idea.length > 800) {
      return NextResponse.json({ success: false, message: 'Idea is too long. Keep it under 800 characters.' }, { status: 400 });
    }

    const item = await addPadletIdea({ author, idea });
    return NextResponse.json({ success: true, item });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to add idea.',
      },
      { status: 500 }
    );
  }
}
