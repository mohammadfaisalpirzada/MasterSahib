import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { STAFF_ADMIN_SESSION_COOKIE, verifyStaffAdminSessionToken } from '@/app/lib/staffAdminAuth';
import {
  REPORT_CARDS_TAB_NAME,
  REPORT_CARD_HEADER_ROW,
  fetchReportCardRows,
  ensureReportCardSheetTab,
  buildRecordId,
  toQuotedReportSheetName,
  toColLetter,
  type ReportCardRowRecord,
} from '@/app/lib/reportCardRecords';
import {
  appendQuizRowToSheet,
  updateQuizRowInSheet,
  deleteSheetRow,
  getQuizSheetIdByTitle,
} from '@/app/lib/googleSheets';
import { resolveAdmissionSpreadsheetId } from '@/app/lib/admissionRecords';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

    const { searchParams } = new URL(request.url);
    const session = searchParams.get('session') || undefined;
    const examTitle = searchParams.get('examTitle') || undefined;
    const studentClass = searchParams.get('class') || undefined;
    const search = searchParams.get('search') || undefined;

    const spreadsheetId = resolveAdmissionSpreadsheetId();
    const records = await fetchReportCardRows({
      spreadsheetId,
      session,
      examTitle,
      studentClass,
      search,
    });

    return NextResponse.json({
      success: true,
      records,
      sheetTabName: REPORT_CARDS_TAB_NAME,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to load report cards.' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isFullAdmin())) {
      return NextResponse.json({ success: false, message: 'Admin access only.' }, { status: 403 });
    }

    const body = (await request.json()) as {
      records?: Array<Record<string, string>>;
      record?: Record<string, string>;
      allowOverwrite?: boolean; // if true, updates existing duplicate row instead of rejecting
    };

    const incomingList = body.records || (body.record ? [body.record] : []);
    if (!incomingList.length) {
      return NextResponse.json({ success: false, message: 'No student result data provided.' }, { status: 400 });
    }

    const spreadsheetId = resolveAdmissionSpreadsheetId();
    await ensureReportCardSheetTab(spreadsheetId);

    // Fetch existing records to enforce unique constraint:
    // "aik saal ma us name or gr ka same data aik hi exam ka nhi save hoga"
    const existingRecords = await fetchReportCardRows({ spreadsheetId });

    // Map existing records by composite identifier and by (session + exam + gr_no / student_name)
    const existingById = new Map<string, ReportCardRowRecord>();
    const existingByGr = new Map<string, ReportCardRowRecord>();
    const existingByName = new Map<string, ReportCardRowRecord>();

    for (const ex of existingRecords) {
      const s = String(ex.session || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const e = String(ex.exam_title || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const g = String(ex.gr_no || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const n = String(ex.student_name || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');

      if (ex.record_id) {
        existingById.set(ex.record_id.toLowerCase(), ex);
      }
      if (s && e && g) {
        existingByGr.set(`${s}_${e}_${g}`, ex);
      }
      if (s && e && n) {
        existingByName.set(`${s}_${e}_${n}`, ex);
      }
    }

    const duplicatesFound: Array<{ name: string; grNo: string; session: string; exam: string; existingRow: string }> = [];
    const updatesToPerform: Array<{ rowNumber: number; rowValues: string[] }> = [];
    const rowsToAppend: Array<string[]> = [];

    const nowIso = new Date().toISOString();

    for (const raw of incomingList) {
      const session = String(raw.session || '').trim();
      const examTitle = String(raw.exam_title || '').trim();
      const grNo = String(raw.gr_no || '').trim();
      const studentName = String(raw.student_name || '').trim();

      const recordId = raw.record_id || buildRecordId(session, examTitle, grNo, studentName);
      const s = session.toLowerCase().replace(/[^a-z0-9]/g, '');
      const e = examTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
      const g = grNo.toLowerCase().replace(/[^a-z0-9]/g, '');
      const n = studentName.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Check if duplicate exists
      const existingMatch =
        (recordId ? existingById.get(recordId.toLowerCase()) : null) ||
        (s && e && g ? existingByGr.get(`${s}_${e}_${g}`) : null) ||
        (s && e && n ? existingByName.get(`${s}_${e}_${n}`) : null);

      if (existingMatch && existingMatch.row_number) {
        if (!body.allowOverwrite) {
          duplicatesFound.push({
            name: studentName,
            grNo: grNo,
            session: session,
            exam: examTitle,
            existingRow: existingMatch.row_number,
          });
          continue;
        }

        // Prepare row values according to header order
        const rowValues = REPORT_CARD_HEADER_ROW.map((key) => {
          if (key === 'record_id') return recordId;
          if (key === 'created_at') return existingMatch.created_at || nowIso;
          if (key === 'updated_at') return nowIso;
          return String(raw[key] ?? existingMatch[key] ?? '').trim();
        });

        updatesToPerform.push({
          rowNumber: parseInt(existingMatch.row_number, 10),
          rowValues,
        });
      } else {
        // Prepare new row
        const rowValues = REPORT_CARD_HEADER_ROW.map((key) => {
          if (key === 'record_id') return recordId;
          if (key === 'created_at') return nowIso;
          if (key === 'updated_at') return nowIso;
          return String(raw[key] ?? '').trim();
        });

        rowsToAppend.push(rowValues);
      }
    }

    // If duplicate check failed and allowOverwrite is false, do not save; alert user
    if (duplicatesFound.length > 0 && !body.allowOverwrite) {
      return NextResponse.json(
        {
          success: false,
          hasDuplicates: true,
          message: `Same year/session and exam duplicate records detected for ${duplicatesFound.length} student(s).`,
          duplicates: duplicatesFound,
        },
        { status: 409 },
      );
    }

    // Execute updates
    const lastCol = toColLetter(REPORT_CARD_HEADER_ROW.length - 1);
    for (const update of updatesToPerform) {
      await updateQuizRowInSheet({
        spreadsheetId,
        range: `${toQuotedReportSheetName()}!A${update.rowNumber}:${lastCol}${update.rowNumber}`,
        values: update.rowValues,
      });
    }

    // Execute appends
    for (const newRow of rowsToAppend) {
      await appendQuizRowToSheet({
        spreadsheetId,
        range: `${toQuotedReportSheetName()}!A:${lastCol}`,
        values: newRow,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully saved! (${rowsToAppend.length} new records created, ${updatesToPerform.length} existing records updated).`,
      createdCount: rowsToAppend.length,
      updatedCount: updatesToPerform.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to save report card records.' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await isFullAdmin())) {
      return NextResponse.json({ success: false, message: 'Admin access only.' }, { status: 403 });
    }

    const body = (await request.json()) as {
      rowNumber?: number | string;
      record_id?: string;
      values?: Record<string, string>;
    };

    const rowNum = Number(body.rowNumber);
    if (!Number.isFinite(rowNum) || rowNum < 2) {
      return NextResponse.json({ success: false, message: 'Valid rowNumber required.' }, { status: 400 });
    }

    const spreadsheetId = resolveAdmissionSpreadsheetId();
    const existingRecords = await fetchReportCardRows({ spreadsheetId });
    const existing = existingRecords.find((r) => r.row_number === String(rowNum));

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Record not found in sheet.' }, { status: 404 });
    }

    const incoming = body.values || {};
    const nowIso = new Date().toISOString();
    const lastCol = toColLetter(REPORT_CARD_HEADER_ROW.length - 1);

    const updatedRow = REPORT_CARD_HEADER_ROW.map((key) => {
      if (key === 'updated_at') return nowIso;
      if (incoming[key] !== undefined) return String(incoming[key]).trim();
      return String(existing[key] ?? '').trim();
    });

    await updateQuizRowInSheet({
      spreadsheetId,
      range: `${toQuotedReportSheetName()}!A${rowNum}:${lastCol}${rowNum}`,
      values: updatedRow,
    });

    return NextResponse.json({ success: true, message: 'Record updated successfully.' });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to update record.' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await isFullAdmin())) {
      return NextResponse.json({ success: false, message: 'Admin access only.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const rowParam = searchParams.get('row');
    const rowNumber = Number(rowParam);

    if (!Number.isFinite(rowNumber) || rowNumber < 2) {
      return NextResponse.json({ success: false, message: 'Valid rowNumber required.' }, { status: 400 });
    }

    const spreadsheetId = resolveAdmissionSpreadsheetId();
    const sheetId = await getQuizSheetIdByTitle(REPORT_CARDS_TAB_NAME, { spreadsheetId });

    if (sheetId === null) {
      return NextResponse.json({ success: false, message: 'Report cards sheet tab not found.' }, { status: 404 });
    }

    await deleteSheetRow({
      spreadsheetId,
      sheetId,
      rowNumber,
    });

    return NextResponse.json({ success: true, message: 'Record deleted successfully.' });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to delete record.' },
      { status: 500 },
    );
  }
}
