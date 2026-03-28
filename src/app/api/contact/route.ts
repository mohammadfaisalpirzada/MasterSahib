import { NextResponse } from 'next/server';

import { saveContactMessage } from '@/app/lib/contactMessages';

const sanitize = (value: unknown) => String(value ?? '').trim();

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      phone?: string;
      email?: string;
      message?: string;
    };

    const name = sanitize(body.name);
    const phone = sanitize(body.phone);
    const email = sanitize(body.email);
    const message = sanitize(body.message);

    if (!name || !message) {
      return NextResponse.json(
        { success: false, message: 'Name and message are required.' },
        { status: 400 }
      );
    }

    if (name.length > 120 || phone.length > 40 || email.length > 160) {
      return NextResponse.json(
        { success: false, message: 'One or more fields are too long.' },
        { status: 400 }
      );
    }

    if (message.length > 3000) {
      return NextResponse.json(
        { success: false, message: 'Message is too long. Keep it under 3000 characters.' },
        { status: 400 }
      );
    }

    await saveContactMessage({ name, phone, email, message });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unable to save your message right now.',
      },
      { status: 500 }
    );
  }
}
