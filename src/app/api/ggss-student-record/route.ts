import { NextRequest, NextResponse } from 'next/server';
import { appendQuizRowToSheet, deleteSheetRow, getQuizRowsFromSheet, ensureSheetTabExists, getQuizSheetIdByTitle, updateQuizRowInSheet } from '@/app/lib/googleSheets';

const STUDENT_TAB_NAME = 'students record 26-27';
const STUDENT_HEADER_ROW = ['class', 'teacher_name', 'teacher_phone', 'total_students', 'boys', 'girls', 'notes', 'updated_at'];
// Shared class/admin passwords for the student-record tool. Set
// GGSS_STUDENT_RECORD_CLASS_PASSWORD / GGSS_STUDENT_RECORD_ADMIN_PASSWORD in
// Vercel env vars to override — these string literals are only the fallback
// used when those env vars are not set.
const CLASS_PASSWORD = process.env.GGSS_STUDENT_RECORD_CLASS_PASSWORD?.trim() || '20262027';
const ADMIN_PASSWORD = process.env.GGSS_STUDENT_RECORD_ADMIN_PASSWORD?.trim() || 'adminadmin321';
const CLASS_OPTIONS = [
  'ECE',
  'IM', 'IA',
  'IIM', 'IIA',
  'IIIM', 'IIIA',
  'IVM', 'IVA',
  'VM', 'VA',
  'VIM', 'VIA',
  'VIIM', 'VIIA',
  'VIIIM', 'VIIIA',
  'IXM', 'IXA',
  'XM', 'XA',
  'Admin',
];

const requiredEnv = (key: string) => {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const resolveSpreadsheetId = (): string => {
  const raw =
    process.env.GGSS_STUDENT_RECORD_SPREADSHEET_ID?.trim() ||
    process.env.GGSS_STAFF_SPREADSHEET_ID?.trim() ||
    process.env.GOOGLE_QUIZ_SPREADSHEET_ID?.trim() ||
    '';

  if (!raw) {
    throw new Error('Missing required spreadsheet id. Set GGSS_STUDENT_RECORD_SPREADSHEET_ID or GGSS_STAFF_SPREADSHEET_ID.');
  }

  const match = raw.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match?.[1] || raw;
};

const normalizeClassName = (className: string) => {
  const trim = className.trim();
  const exact = CLASS_OPTIONS.find((option) => option.toLowerCase() === trim.toLowerCase());
  return exact || trim;
};

const toQuotedSheetName = (sheetName: string) => {
  const escaped = sheetName.replace(/'/g, "''");
  return `'${escaped}'`;
};

const validatePassword = (className: string, password: string) => {
  if (className.toLowerCase() === 'admin') {
    return password === ADMIN_PASSWORD;
  }

  return password === CLASS_PASSWORD;
};

const getSheetRows = async (spreadsheetId: string) => {
  const escapedTab = toQuotedSheetName(STUDENT_TAB_NAME);
  const range = `${escapedTab}!A:Z`;
  return await getQuizRowsFromSheet({ spreadsheetId, range });
};

const SERIAL_KEYS = ['sno', 'serial', 'serial_no', 'sr'];

const getSerialHeader = (headerRow: string[]) =>
  headerRow.find((cell) => SERIAL_KEYS.includes(String(cell ?? '').trim().toLowerCase())) ?? null;

const getHeaderIndex = (headerRow: string[], keys: string[]) =>
  headerRow.findIndex((cell) => keys.includes(String(cell ?? '').trim().toLowerCase()));

const getNextSerial = (
  serialHeader: string,
  rows: string[][],
  className?: string,
  classIndex: number = -1,
) => {
  const headerRow = rows[0] ?? [];
  const serialIndex = headerRow.findIndex(
    (cell) => String(cell ?? '').trim().toLowerCase() === serialHeader.toLowerCase(),
  );

  if (serialIndex === -1) return 1;

  const normalizedClass = String(className ?? '').trim().toLowerCase();
  const numbers = rows
    .slice(1)
    .filter((row) => {
      if (!normalizedClass) return true;
      if (classIndex === -1) return true;
      return String(row[classIndex] ?? '').trim().toLowerCase() === normalizedClass;
    })
    .map((row) => parseInt(String(row[serialIndex] ?? '').replace(/\D/g, ''), 10))
    .filter((value) => Number.isFinite(value));

  return numbers.length ? Math.max(...numbers) + 1 : 1;
};

type RecordRow = {
  rowNumber: number;
  record: Record<string, string>;
};

const getAvailableClassesFromRows = (rows: string[][], className: string, classIndex: number = 0) => {
  const rawClasses = rows
    .slice(1)
    .map((row) => String(row[classIndex] ?? '').trim())
    .filter(Boolean);

  if (className && !rawClasses.some((item) => item.toLowerCase() === className.toLowerCase())) {
    rawClasses.push(className);
  }

  return Array.from(
    new Set(rawClasses.map((entry) => entry.trim()).filter(Boolean)),
  );
};

const getRowsForClass = (
  headerRow: string[],
  rows: string[][],
  className: string,
  classIndex: number,
): RecordRow[] => {
  const normalizedClass = className.trim().toLowerCase();

  return rows
    .map((row, rowIndex) => ({ row, rowNumber: rowIndex + 1 }))
    .filter(({ row, rowNumber }) => {
      if (rowNumber === 1) return false;
      if (classIndex === -1) {
        return String(row[0] ?? '').trim().toLowerCase() === normalizedClass;
      }
      return String(row[classIndex] ?? '').trim().toLowerCase() === normalizedClass;
    })
    .map(({ row, rowNumber }) => ({ rowNumber, record: buildRecord(headerRow, row) }));
};

const buildRecord = (headerRow: string[], row: string[]) => {
  const record: Record<string, string> = {};
  headerRow.forEach((cell, index) => {
    const label = String(cell ?? '').trim() || `column_${index + 1}`;
    record[label] = String(row[index] ?? '').trim();
  });
  return record;
};

const buildEmptyRecordFromHeaders = (headerRow: string[], className: string) => {
  const record: Record<string, string> = {};
  headerRow.forEach((cell) => {
    const label = String(cell ?? '').trim() || '';
    if (!label) return;
    record[label] = label.trim().toLowerCase() === 'class' ? className : '';
  });
  return record;
};

const findRowByClass = (rows: string[][], classKey: string, classIndex: number) => {
  const normalizedKey = classKey.trim().toLowerCase();
  if (classIndex === -1) {
    return rows.find((row, index) => index > 0 && String(row[0] ?? '').trim().toLowerCase() === normalizedKey);
  }
  return rows.find(
    (row, index) => index > 0 && String(row[classIndex] ?? '').trim().toLowerCase() === normalizedKey,
  );
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      action?: string;
      className?: string;
      password?: string;
      values?: Record<string, string>;
      rowNumber?: number | string;
    };

    const action = String(body.action ?? 'load').trim().toLowerCase();
    const rawClassName = String(body.className ?? '').trim();
    const password = String(body.password ?? '').trim();
    const className = normalizeClassName(rawClassName);

    if (!className) {
      return NextResponse.json({ success: false, error: 'Class is required.' }, { status: 400 });
    }

    if (!CLASS_OPTIONS.some((option) => option.toLowerCase() === className.toLowerCase())) {
      return NextResponse.json({ success: false, error: 'Invalid class selected.' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ success: false, error: 'Password is required.' }, { status: 400 });
    }

    if (!validatePassword(className, password)) {
      return NextResponse.json({ success: false, error: 'Invalid password.' }, { status: 401 });
    }

    const spreadsheetId = resolveSpreadsheetId();
    await ensureSheetTabExists(STUDENT_TAB_NAME, STUDENT_HEADER_ROW, { spreadsheetId });
    const rows = await getSheetRows(spreadsheetId);

    const headerRow = rows[0]?.map((cell) => String(cell ?? '').trim()).filter(Boolean) || STUDENT_HEADER_ROW;
    const classHeaderIndex = getHeaderIndex(headerRow, ['class', 'class_name', 'class_no', 'classnumber', 'class number']);
    const classRows = getRowsForClass(headerRow, rows, className, classHeaderIndex);
    const record = classRows.length ? classRows[0].record : buildEmptyRecordFromHeaders(headerRow, className);
    const serialHeader = getSerialHeader(headerRow);
    const nextSerial = serialHeader ? getNextSerial(serialHeader, rows, className, classHeaderIndex) : undefined;
    const availableClasses = getAvailableClassesFromRows(rows, className, classHeaderIndex === -1 ? 0 : classHeaderIndex);

    if (!classRows.length && serialHeader && !record[serialHeader] && typeof nextSerial === 'number') {
      record[serialHeader] = String(nextSerial);
    }

    if (action === 'load') {
      return NextResponse.json({
        success: true,
        record,
        exists: classRows.length > 0,
        className,
        headers: headerRow,
        nextSerial,
        availableClasses,
        records: classRows.map((item) => ({ rowNumber: item.rowNumber, record: item.record })),
      });
    }

    const rowNumber = body.rowNumber !== undefined ? Number(body.rowNumber) : undefined;
    const hasValidRowNumber = typeof rowNumber === 'number' && Number.isFinite(rowNumber) && rowNumber > 1;

    if (action === 'save') {
      const values = body.values || {};
      const updatedAt = new Date().toISOString();
      const serialHeader = getSerialHeader(headerRow);
      const nextSerial = serialHeader ? getNextSerial(serialHeader, rows, className, classHeaderIndex) : undefined;
      const rowValues = headerRow.map((header) => {
        const key = String(header ?? '').trim();
        if (key.toLowerCase() === 'class') return className;
        if (key.toLowerCase() === 'updated_at') return updatedAt;
        if (serialHeader && key === serialHeader && !String(values[key] ?? '').trim()) {
          return typeof nextSerial === 'number' ? String(nextSerial) : '';
        }
        return String(values[key] ?? '').trim();
      });

      if (hasValidRowNumber) {
        await updateQuizRowInSheet({
          spreadsheetId,
          range: `${toQuotedSheetName(STUDENT_TAB_NAME)}!A${rowNumber}`,
          values: rowValues,
        });
      } else {
        await appendQuizRowToSheet({
          spreadsheetId,
          range: `${toQuotedSheetName(STUDENT_TAB_NAME)}!A1`,
          values: rowValues,
        });
      }

      const savedRecord = headerRow.reduce((acc, header, index) => {
        const key = String(header ?? '').trim();
        acc[key] = String(rowValues[index] ?? '').trim();
        return acc;
      }, {} as Record<string, string>);

      return NextResponse.json({ success: true, record: savedRecord, exists: true, rowNumber: hasValidRowNumber ? rowNumber : undefined });
    }

    if (action === 'delete') {
      if (!hasValidRowNumber) {
        return NextResponse.json({ success: false, error: 'Row number is required to delete a specific student record.' }, { status: 400 });
      }

      const sheetId = await getQuizSheetIdByTitle(STUDENT_TAB_NAME, { spreadsheetId });
      if (sheetId === null) {
        return NextResponse.json({ success: false, error: `Sheet not found: ${STUDENT_TAB_NAME}` }, { status: 500 });
      }

      await deleteSheetRow({
        spreadsheetId,
        sheetId,
        rowNumber,
      });

      return NextResponse.json({ success: true, deleted: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Server error.' },
      { status: 500 },
    );
  }
}
