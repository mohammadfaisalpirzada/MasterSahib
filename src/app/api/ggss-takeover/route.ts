import { NextRequest, NextResponse } from 'next/server';
import { STAFF_ADMIN_SESSION_COOKIE, verifyStaffAdminSessionToken } from '@/app/lib/staffAdminAuth';
import {
  listTakeoverSessions,
  loadTakeoverSession,
  saveTakeoverSession,
  type TakeoverSessionMeta,
  type TakeoverSessionItem,
} from '@/app/lib/ggssTakeover';

type SaveBody = {
  meta: TakeoverSessionMeta;
  items: TakeoverSessionItem[];
  tabName?: string; // if provided → update existing session
};

const verifyAdmin = (request: NextRequest) => {
  const sessionToken = request.cookies.get(STAFF_ADMIN_SESSION_COOKIE)?.value ?? '';
  return verifyStaffAdminSessionToken(sessionToken) !== null;
};

// GET /api/ggss-takeover            → list sessions
// GET /api/ggss-takeover?tab=Name   → load one session
export async function GET(request: NextRequest) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const tab = request.nextUrl.searchParams.get('tab');

    if (tab) {
      const session = await loadTakeoverSession(tab);
      return NextResponse.json({ success: true, session });
    }

    const sessions = await listTakeoverSessions();
    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load takeover data.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// POST /api/ggss-takeover → create new session
// PATCH /api/ggss-takeover → update existing session (pass tabName in body)
export async function POST(request: NextRequest) {
  return handleSave(request, undefined);
}

export async function PATCH(request: NextRequest) {
  return handleSave(request, 'patch');
}

async function handleSave(request: NextRequest, _mode: string | undefined) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as SaveBody;

    if (!body.meta || !Array.isArray(body.items)) {
      return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 });
    }

    const savedTabName = await saveTakeoverSession(body.meta, body.items, body.tabName);
    return NextResponse.json({ success: true, tabName: savedTabName, message: `Saved to sheet tab: ${savedTabName}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save takeover session.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
