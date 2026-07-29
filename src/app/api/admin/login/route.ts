import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const { password } = await req.json();
  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_TOKEN) return NextResponse.json({ error:'Admin environment variables missing' }, { status:500 });
  if (password !== process.env.ADMIN_PASSWORD) return NextResponse.json({ error:'Invalid password' }, { status:401 });
  const cookieStore = await cookies();
  cookieStore.set('district_east_admin', process.env.ADMIN_SESSION_TOKEN, { httpOnly:true, secure:process.env.NODE_ENV==='production', sameSite:'lax', path:'/', maxAge:60*60*8 });
  return NextResponse.json({ ok:true });
}
