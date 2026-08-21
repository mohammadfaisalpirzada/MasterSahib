import { NextResponse } from 'next/server';
import { saveCourseRegistration } from '@/app/lib/courseRegistrations';

const clean = (value: unknown) => String(value ?? '').trim();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const registration = {
      name: clean(body.name), email: clean(body.email), phone: clean(body.phone),
      city: clean(body.city), experience: clean(body.experience), courseId: clean(body.courseId),
    };
    if (!registration.name || !registration.email || !registration.phone || !registration.courseId) {
      return NextResponse.json({ success: false, message: 'Name, email and phone are required.' }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(registration.email)) {
      return NextResponse.json({ success: false, message: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (Object.values(registration).some((value) => value.length > 180)) {
      return NextResponse.json({ success: false, message: 'One or more fields are too long.' }, { status: 400 });
    }
    await saveCourseRegistration(registration);
    return NextResponse.json({ success: true, message: 'Registration received successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : 'Registration failed.' }, { status: 500 });
  }
}
