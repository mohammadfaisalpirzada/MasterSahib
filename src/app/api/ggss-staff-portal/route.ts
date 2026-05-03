import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { normalizeKey, resolveStaffSheetContext, toSheetRange } from '@/app/lib/staffRecords';
import { getGoogleSheetsClient } from '@/app/lib/googleSheets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const getSecret = (): string =>
  process.env.AUTH_SESSION_SECRET?.trim() || 'ggss-portal-fallback-secret-change-me';

const hmacSign = (payload: string): string =>
  createHmac('sha256', getSecret()).update(payload).digest('base64url');

/** Constant-time string comparison that also handles different lengths safely. */
const safeStringEqual = (a: string, b: string): boolean => {
  const aBuf = Buffer.from(String(a), 'utf8');
  const bBuf = Buffer.from(String(b), 'utf8');
  const maxLen = Math.max(aBuf.length, bBuf.length, 1);
  const aPad = Buffer.concat([aBuf, Buffer.alloc(maxLen - aBuf.length)]);
  const bPad = Buffer.concat([bBuf, Buffer.alloc(maxLen - bBuf.length)]);
  const equal = timingSafeEqual(aPad, bPad);
  return equal && aBuf.length === bBuf.length;
};

// ─── Token ──────────────────────────────────────────────────────────────────

type TokenPayload = { role: 'teacher' | 'admin'; name: string; iat: number };

const createToken = (data: Omit<TokenPayload, 'iat'>): string => {
  const payload = Buffer.from(JSON.stringify({ ...data, iat: Date.now() })).toString('base64url');
  return `${payload}.${hmacSign(payload)}`;
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const lastDot = token.lastIndexOf('.');
    if (lastDot === -1) return null;
    const payload = token.slice(0, lastDot);
    const sig = token.slice(lastDot + 1);
    const expected = hmacSign(payload);
    const sigBuf = Buffer.from(sig, 'base64url');
    const expBuf = Buffer.from(expected, 'base64url');
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as TokenPayload;
    if (!data.role || !data.name || !data.iat) return null;
    if (data.role !== 'teacher' && data.role !== 'admin') return null;
    if (Date.now() - data.iat > 8 * 60 * 60 * 1000) return null; // 8-hour expiry
    return data;
  } catch {
    return null;
  }
};

// ─── Sheet ──────────────────────────────────────────────────────────────────

const getSheetRows = async (): Promise<string[][]> => {
  const context = await resolveStaffSheetContext();
  const sheets = getGoogleSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: context.spreadsheetId,
    range: toSheetRange(context.sheetName),
  });
  return (res.data.values ?? []) as string[][];
};

// ─── GET ─────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') ?? 'teachers';

  try {
    // ── List teacher names (no sensitive data) ──────────────────────────────
    if (action === 'teachers') {
      const rows = await getSheetRows();
      if (rows.length < 2) return NextResponse.json({ success: true, teachers: [] });
      const headers = rows[0].map((h, i) => normalizeKey(String(h ?? ''), i));
      const nameIdx = headers.indexOf('name');
      if (nameIdx === -1)
        return NextResponse.json({ success: false, error: 'Name column not found in sheet.' }, { status: 500 });
      const teachers = rows
        .slice(1)
        .map(row => (row[nameIdx] ?? '').trim())
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b));
      return NextResponse.json({ success: true, teachers });
    }

    // ── Admin: fetch all records (token required) ───────────────────────────
    if (action === 'records') {
      const token = searchParams.get('token') ?? '';
      const session = verifyToken(token);
      if (!session || session.role !== 'admin')
        return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });

      const rows = await getSheetRows();
      if (rows.length < 2) return NextResponse.json({ success: true, records: [], columns: [] });

      const headers = rows[0].map((h, i) => normalizeKey(String(h ?? ''), i));
      const rawLabels = rows[0].map(h => String(h ?? '').trim());

      // Strip PID and raw picture blobs from admin view
      const safeIdx = headers
        .map((k, i) => (k === 'pid' || k === 'picture' ? -1 : i))
        .filter(i => i !== -1);
      const safeLabels = safeIdx.map(i => rawLabels[i]);

      const records = rows
        .slice(1)
        .map(row => {
          const rec: Record<string, string> = {};
          safeIdx.forEach((i, j) => {
            rec[safeLabels[j]] = (row[i] ?? '').trim();
          });
          return rec;
        })
        .filter(r => Object.values(r).some(Boolean));

      return NextResponse.json({ success: true, records, columns: safeLabels });
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Server error.' },
      { status: 500 },
    );
  }
}

// ─── POST (Login) ─────────────────────────────────────────────────────────────

const THROTTLE_MS = 600; // Slow down brute-force attempts

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { name?: unknown; password?: unknown };
    const name = String(body.name ?? '').trim();
    const password = String(body.password ?? '').trim();

    if (!name || !password) {
      return NextResponse.json({ success: false, error: 'Name and password are required.' }, { status: 400 });
    }

    // ── Admin login ─────────────────────────────────────────────────────────
    if (name.toLowerCase() === 'admin') {
      const valid = safeStringEqual(password, 'adminadmin321');
      if (!valid) {
        await new Promise(r => setTimeout(r, THROTTLE_MS));
        return NextResponse.json({ success: false, error: 'Invalid credentials.' }, { status: 401 });
      }
      const token = createToken({ role: 'admin', name: 'Admin' });
      return NextResponse.json({ success: true, token, role: 'admin', name: 'Admin' });
    }

    // ── Teacher login ───────────────────────────────────────────────────────
    const rows = await getSheetRows();
    if (rows.length < 2) {
      await new Promise(r => setTimeout(r, THROTTLE_MS));
      return NextResponse.json({ success: false, error: 'Invalid credentials.' }, { status: 401 });
    }

    const headers = rows[0].map((h, i) => normalizeKey(String(h ?? ''), i));
    const rawLabels = rows[0].map(h => String(h ?? '').trim());
    const nameIdx = headers.indexOf('name');
    const pidIdx = headers.indexOf('pid');

    if (nameIdx === -1 || pidIdx === -1) {
      return NextResponse.json(
        { success: false, error: 'Sheet is missing required columns (name / pid).' },
        { status: 500 },
      );
    }

    let matchedRow: string[] | undefined;
    for (const row of rows.slice(1)) {
      if ((row[nameIdx] ?? '').trim().toLowerCase() === name.toLowerCase()) {
        matchedRow = row;
        break;
      }
    }

    if (!matchedRow) {
      await new Promise(r => setTimeout(r, THROTTLE_MS));
      return NextResponse.json({ success: false, error: 'Invalid credentials.' }, { status: 401 });
    }

    const storedPid = (matchedRow[pidIdx] ?? '').trim();
    if (!storedPid || !safeStringEqual(password, storedPid)) {
      await new Promise(r => setTimeout(r, THROTTLE_MS));
      return NextResponse.json({ success: false, error: 'Invalid credentials.' }, { status: 401 });
    }

    // Build safe record — never include PID or raw picture blob
    const record: Record<string, string> = {};
    headers.forEach((key, i) => {
      if (key !== 'pid' && key !== 'picture') {
        const label = rawLabels[i] || key;
        const val = (matchedRow![i] ?? '').trim();
        if (val) record[label] = val;
      }
    });

    const token = createToken({ role: 'teacher', name: matchedRow[nameIdx]!.trim() });
    return NextResponse.json({
      success: true,
      token,
      role: 'teacher',
      name: matchedRow[nameIdx]!.trim(),
      record,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Login failed.' },
      { status: 500 },
    );
  }
}
