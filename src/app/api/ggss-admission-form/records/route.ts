import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { STAFF_ADMIN_SESSION_COOKIE, verifyStaffAdminSessionToken } from '@/app/lib/staffAdminAuth';
import { ensureSheetTabExists, getQuizRowsFromSheet, updateQuizRowInSheet } from '@/app/lib/googleSheets';
import {
  ADMISSION_TAB_NAME,
  ADMISSION_HEADER_ROW,
  resolveAdmissionSpreadsheetId,
  toQuotedAdmissionSheetName,
  toSheetColumnLabel,
} from '@/app/lib/admissionRecords';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Deliberately admin-only — the admission-desk password (used by front-desk
// staff to fill new forms) does NOT grant access here. Front-desk staff can
// add admissions, but only the school admin can browse/edit the full list.
const isFullAdmin = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_ADMIN_SESSION_COOKIE)?.value;
  return Boolean(token && verifyStaffAdminSessionToken(token));
};

export async function GET(request: NextRequest) {
  try {
    if (!(await isFullAdmin())) {
      return NextResponse.json({ success: false, message: 'Admin access only.' }, { status: 403 });
    }

    const spreadsheetId = resolveAdmissionSpreadsheetId();
    await ensureSheetTabExists(ADMISSION_TAB_NAME, [...ADMISSION_HEADER_ROW], { spreadsheetId });

    const { searchParams } = new URL(request.url);
    const singleRowParam = searchParams.get('row');

    if (singleRowParam) {
      // Single-record detail fetch — includes picture_base64, used by the view/edit screen.
      const rowNumber = Number(singleRowParam);
      if (!Number.isFinite(rowNumber) || rowNumber < 2) {
        return NextResponse.json({ success: false, message: 'Invalid record reference.' }, { status: 400 });
      }
      const rows = await getQuizRowsFromSheet({
        spreadsheetId,
        range: `${toQuotedAdmissionSheetName()}!A${rowNumber}:AZ${rowNumber}`,
      });
      const row = rows[0] || [];
      if (!row.length) {
        return NextResponse.json({ success: false, message: 'Record not found.' }, { status: 404 });
      }
      const record: Record<string, string> = { row_number: String(rowNumber) };
      ADMISSION_HEADER_ROW.forEach((key, colIndex) => {
        record[key] = String(row[colIndex] ?? '').trim();
      });
      return NextResponse.json({ success: true, record });
    }

    const rows = await getQuizRowsFromSheet({
      spreadsheetId,
      range: `${toQuotedAdmissionSheetName()}!A:AZ`,
    });

    const headerRow = (rows[0] || []).map((cell) => String(cell ?? '').trim());
    // Picture data is heavy and not needed for the list view — leave it out
    // of the list payload; the detail/edit view fetches it separately via ?row=.
    const records = rows
      .slice(1)
      .map((row, index) => {
        const record: Record<string, string> = { row_number: String(index + 2) };
        headerRow.forEach((key, colIndex) => {
          if (key === 'picture_base64') return;
          record[key] = String(row[colIndex] ?? '').trim();
        });
        return record;
      })
      .filter((record) => record.student_name);

    return NextResponse.json({ success: true, records });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to load admission records.' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await isFullAdmin())) {
      return NextResponse.json({ success: false, message: 'Admin access only.' }, { status: 403 });
    }

    const body = (await request.json()) as { rowNumber?: number | string; values?: Record<string, string> };
    const rowNumber = Number(body.rowNumber);
    if (!Number.isFinite(rowNumber) || rowNumber < 2) {
      return NextResponse.json({ success: false, message: 'Invalid record reference.' }, { status: 400 });
    }

    const values = body.values || {};
    if (!String(values.student_name ?? '').trim()) {
      return NextResponse.json({ success: false, message: 'Student name is required.' }, { status: 400 });
    }

    const spreadsheetId = resolveAdmissionSpreadsheetId();

    // Preserve the existing photo unless a new one was explicitly sent — the
    // edit UI doesn't re-send the (large) picture on every save.
    let pictureValue = values.picture_base64;
    if (pictureValue === undefined) {
      const existing = await getQuizRowsFromSheet({
        spreadsheetId,
        range: `${toQuotedAdmissionSheetName()}!A${rowNumber}:AZ${rowNumber}`,
      });
      const existingRow = existing[0] || [];
      const pictureIndex = ADMISSION_HEADER_ROW.indexOf('picture_base64');
      pictureValue = String(existingRow[pictureIndex] ?? '');
    }

    const rowValues = ADMISSION_HEADER_ROW.map((key) => {
      if (key === 'picture_base64') return pictureValue ?? '';
      return String(values[key] ?? '').trim();
    });

    const endColumn = toSheetColumnLabel(ADMISSION_HEADER_ROW.length - 1);
    await updateQuizRowInSheet({
      spreadsheetId,
      range: `${toQuotedAdmissionSheetName()}!A${rowNumber}:${endColumn}${rowNumber}`,
      values: rowValues,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to update the record.' },
      { status: 500 },
    );
  }
}
