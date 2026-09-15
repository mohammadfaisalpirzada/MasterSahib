import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { STAFF_ADMIN_SESSION_COOKIE, verifyStaffAdminSessionToken } from '@/app/lib/staffAdminAuth';
import { ADMISSION_FORM_SESSION_COOKIE, verifyAdmissionFormSessionToken } from '@/app/lib/admissionFormAuth';
import { appendQuizRowToSheet, ensureSheetTabExists, getQuizRowsFromSheet, updateQuizRowInSheet } from '@/app/lib/googleSheets';
import {
  ADMISSION_TAB_NAME,
  ADMISSION_HEADER_ROW,
  resolveAdmissionSpreadsheetId as resolveSpreadsheetId,
  toQuotedAdmissionSheetName as toQuotedSheetName,
} from '@/app/lib/admissionRecords';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_PICTURE_CELL_CHARS = 35000; // client already compresses to ~32,000 chars; this is just a safety ceiling

// Tabs created before a header was added (e.g. father_cell / guardian_cell)
// won't pick it up from ensureSheetTabExists, which only writes headers for a
// brand-new tab. Top up row 1 with any headers the live sheet is missing —
// safe because we only ever add columns at the end, never reorder existing ones.
const syncAdmissionHeaderRow = async (spreadsheetId: string) => {
  try {
    const existing = await getQuizRowsFromSheet({
      spreadsheetId,
      range: `${toQuotedSheetName(ADMISSION_TAB_NAME)}!A1:AZ1`,
    });
    const currentHeaders = (existing[0] || []).map((cell) => String(cell ?? '').trim());
    const missing = currentHeaders.length < ADMISSION_HEADER_ROW.length;
    if (missing) {
      await updateQuizRowInSheet({
        spreadsheetId,
        range: `${toQuotedSheetName(ADMISSION_TAB_NAME)}!A1`,
        values: ADMISSION_HEADER_ROW,
      });
    }
  } catch {
    // Non-blocking — worst case the new columns' header cells stay blank
    // until the next successful sync, but data still saves correctly.
  }
};

// Either a full admin session or an admission-desk session may use this endpoint.
const isAuthorized = async () => {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get(STAFF_ADMIN_SESSION_COOKIE)?.value;
  if (adminToken && verifyStaffAdminSessionToken(adminToken)) return true;

  const admissionToken = cookieStore.get(ADMISSION_FORM_SESSION_COOKIE)?.value;
  if (admissionToken && verifyAdmissionFormSessionToken(admissionToken)) return true;

  return false;
};

export async function GET() {
  try {
    if (!(await isAuthorized())) {
      return NextResponse.json({ success: false, message: 'Session expired. Please login again.' }, { status: 401 });
    }

    const spreadsheetId = resolveSpreadsheetId();
    await ensureSheetTabExists(ADMISSION_TAB_NAME, ADMISSION_HEADER_ROW, { spreadsheetId });
    await syncAdmissionHeaderRow(spreadsheetId);

    const rows = await getQuizRowsFromSheet({
      spreadsheetId,
      range: `${toQuotedSheetName(ADMISSION_TAB_NAME)}!A:A`,
    });

    // Serial numbers are formatted "<year>/<count>" and reset to 1 every new year,
    // e.g. 2026/1, 2026/2, ... then 2027/1 once the year changes.
    const currentYear = new Date().getFullYear();
    const yearPrefix = `${currentYear}/`;

    const usedNumbers = rows
      .slice(1) // skip header row
      .map((row) => String(row[0] ?? '').trim())
      .filter((value) => value.startsWith(yearPrefix))
      .map((value) => parseInt(value.slice(yearPrefix.length), 10))
      .filter((value) => Number.isFinite(value));

    const nextCount = usedNumbers.length ? Math.max(...usedNumbers) + 1 : 1;
    const nextSerial = `${currentYear}/${nextCount}`;

    return NextResponse.json({ success: true, nextSerial });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to fetch next serial number.' },
      { status: 500 },
    );
  }
}

const normalizeName = (value: unknown) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
const normalizeDigits = (value: unknown) => String(value ?? '').replace(/\D/g, '');
const normalizeLoose = (value: unknown) => {
  const trimmed = String(value ?? '').trim().toLowerCase();
  return trimmed === '-' ? '' : trimmed;
};

// Guards against the same admission being added twice, and a few other
// obviously-wrong-data cases that are cheap to catch before writing to the sheet.
const findAdmissionConflict = async (spreadsheetId: string, values: Record<string, string>): Promise<string | null> => {
  const rows = await getQuizRowsFromSheet({
    spreadsheetId,
    range: `${toQuotedSheetName(ADMISSION_TAB_NAME)}!A:AZ`,
  });
  if (rows.length < 2) return null;

  const headerRow = rows[0].map((cell) => String(cell ?? '').trim());
  const columnIndex = (key: string) => headerRow.indexOf(key);
  const nameIdx = columnIndex('student_name');
  const cnicIdx = columnIndex('father_cnic');
  const dobIdx = columnIndex('dob');
  const grIdx = columnIndex('gr_no');
  const srIdx = columnIndex('sr_no');

  const newName = normalizeName(values.student_name);
  const newCnic = normalizeDigits(values.father_cnic);
  const newDob = String(values.dob ?? '').trim();
  const newGr = normalizeLoose(values.gr_no);

  const sheetLabel = (rowIndex: number) => {
    const sr = srIdx >= 0 ? String(rows[rowIndex][srIdx] ?? '').trim() : '';
    return sr ? ` (Sr No. ${sr})` : '';
  };

  for (let i = 1; i < rows.length; i += 1) {
    const row = rows[i];
    const rowName = normalizeName(nameIdx >= 0 ? row[nameIdx] : '');
    if (!rowName || rowName !== newName) continue;

    // Same student name + same father CNIC (both real values) — the exact
    // duplicate the front desk asked to be blocked.
    const rowCnic = normalizeDigits(cnicIdx >= 0 ? row[cnicIdx] : '');
    if (newCnic && rowCnic && newCnic === rowCnic) {
      return `This student is already in the admission records — same name and father's CNIC${sheetLabel(i)}. Please verify before adding again.`;
    }

    // Same student name + same date of birth — almost certainly the same
    // child re-submitted (e.g. father's CNIC left blank the second time).
    const rowDob = String(dobIdx >= 0 ? row[dobIdx] ?? '' : '').trim();
    if (newDob && rowDob && newDob === rowDob) {
      return `This student is already in the admission records — same name and date of birth${sheetLabel(i)}. Please verify before adding again.`;
    }
  }

  // GR No. is a unique registration number — block reuse regardless of the name.
  if (newGr) {
    for (let i = 1; i < rows.length; i += 1) {
      const row = rows[i];
      const rowGr = normalizeLoose(grIdx >= 0 ? row[grIdx] : '');
      if (rowGr && rowGr === newGr) {
        return `GR No. "${values.gr_no}" is already used by another admission${sheetLabel(i)}. Please use the correct / a different GR number.`;
      }
    }
  }

  return null;
};

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthorized())) {
      return NextResponse.json({ success: false, message: 'Session expired. Please login again.' }, { status: 401 });
    }

    const body = (await request.json()) as { values?: Record<string, string> };
    const values = body.values || {};

    if (!String(values.student_name ?? '').trim()) {
      return NextResponse.json({ success: false, message: 'Student name is required.' }, { status: 400 });
    }

    const picture = String(values.picture_base64 ?? '');
    if (picture.length > MAX_PICTURE_CELL_CHARS) {
      return NextResponse.json({ success: false, message: 'Picture is too large even after compression. Please retake it.' }, { status: 400 });
    }

    const spreadsheetId = resolveSpreadsheetId();
    await ensureSheetTabExists(ADMISSION_TAB_NAME, ADMISSION_HEADER_ROW, { spreadsheetId });
    await syncAdmissionHeaderRow(spreadsheetId);

    const conflictMessage = await findAdmissionConflict(spreadsheetId, values);
    if (conflictMessage) {
      return NextResponse.json({ success: false, message: conflictMessage }, { status: 409 });
    }

    const submittedAt = new Date().toISOString();
    const rowValues = ADMISSION_HEADER_ROW.map((key) => {
      if (key === 'submitted_at') return submittedAt;
      return String(values[key] ?? '').trim();
    });

    await appendQuizRowToSheet({
      spreadsheetId,
      range: `${toQuotedSheetName(ADMISSION_TAB_NAME)}!A1`,
      values: rowValues,
    });

    return NextResponse.json({ success: true, submittedAt });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to save admission form.' },
      { status: 500 },
    );
  }
}
