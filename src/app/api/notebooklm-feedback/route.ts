import { NextResponse } from 'next/server';
import { submitNotebookLmFeedback } from '@/app/lib/notebooklmFeedback';

const clean = (value: unknown) => String(value ?? '').trim();

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = clean(body.name);
    const email = clean(body.email);
    const score = Number(body.score);
    const total = Number(body.total);
    const timestamp = clean(body.timestamp) || new Date().toISOString();

    if (!name || !email) {
      return NextResponse.json({ message: 'Name and email are required.' }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ message: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (!Number.isFinite(score) || !Number.isFinite(total)) {
      return NextResponse.json({ message: 'Invalid score payload.' }, { status: 400 });
    }

    const result = await submitNotebookLmFeedback({ name, email, score, total, timestamp });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Could not record feedback.' },
      { status: 500 },
    );
  }
}
