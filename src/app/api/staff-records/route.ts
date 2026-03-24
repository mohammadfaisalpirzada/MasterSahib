import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getQuizRowsFromSheet, getQuizSheetTitleById } from '@/app/lib/googleSheets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ColumnMeta = {
  key: string;
  label: string;
  editable: boolean;
};

type DirectoryItem = {
  rowId: string;
  sno: string;
  name: string;
};

type StaffSheetRecord = {
  rowNumber: number;
  [key: string]: string | number;
};

type SheetContext = {
  spreadsheetId: string;
  sheetName: string;
};

const toFriendlySheetsError = (error: unknown, fallbackMessage: string) => {
  const rawMessage = error instanceof Error ? error.message : '';
  const normalized = rawMessage.toLowerCase();

  if (normalized.includes('this operation is not supported for this document')) {
    return 'This file is in Office compatibility mode. Convert it to a native Google Sheet and then retry.';
  }

  if (normalized.includes('insufficient permissions') || normalized.includes('the caller does not have permission')) {
    return 'Service account does not have access to this sheet. Share the sheet with GOOGLE_SERVICE_ACCOUNT_EMAIL as Editor.';
  }

  return rawMessage || fallbackMessage;
};

const STAFF_RANGE = 'A:AZ';
const NAME_KEY = 'name';
const PID_KEY = 'pid';
const SERIAL_KEYS = new Set(['s_no', 'sno', 'serial_no', 'serial']);
const LOCKED_KEYS = new Set([NAME_KEY, PID_KEY, 's_no', 'sno', 'serial_no', 'serial']);

const requiredEnv = (key: string) => {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const normalizeKey = (value: string, index: number) => {
  const base = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return base || `column_${index + 1}`;
};

const toSheetRange = (sheetName: string, columnRange = STAFF_RANGE) => {
  const escaped = sheetName.replace(/'/g, "''");
  return `'${escaped}'!${columnRange}`;
};

const getSignatureSecret = () => {
  return requiredEnv('AUTH_SESSION_SECRET');
};

const encodeTokenPart = (value: string) => Buffer.from(value, 'utf8').toString('base64url');
const decodeTokenPart = (value: string) => Buffer.from(value, 'base64url').toString('utf8');

const signTokenPayload = (payload: string) => {
  return createHmac('sha256', getSignatureSecret()).update(payload).digest('base64url');
};

const createVerifyToken = (payload: { rowNumber: number; verifiedAt: number }) => {
  const encodedPayload = encodeTokenPart(JSON.stringify(payload));
  const signature = signTokenPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
};

const verifyToken = (token: string) => {
  const [encodedPayload, providedSignature] = token.split('.');
  if (!encodedPayload || !providedSignature) {
    throw new Error('Invalid verification token.');
  }

  const expectedSignature = signTokenPayload(encodedPayload);
  const providedBuffer = Buffer.from(providedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (providedBuffer.length !== expectedBuffer.length || !timingSafeEqual(providedBuffer, expectedBuffer)) {
    throw new Error('Verification token signature mismatch.');
  }

  const payload = JSON.parse(decodeTokenPart(encodedPayload)) as { rowNumber?: number; verifiedAt?: number };
  if (!payload.rowNumber || !payload.verifiedAt) {
    throw new Error('Invalid verification token payload.');
  }

  const ageMs = Date.now() - payload.verifiedAt;
  if (ageMs > 1000 * 60 * 20) {
    throw new Error('Verification token expired. Please verify again.');
  }

  return { rowNumber: payload.rowNumber };
};

const resolveSheetContext = async (): Promise<SheetContext> => {
  const spreadsheetIdInput = requiredEnv('GGSS_STAFF_SPREADSHEET_ID');
  const spreadsheetId = spreadsheetIdInput.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1] || spreadsheetIdInput;
  const explicitSheetName = process.env.GGSS_STAFF_SHEET_TAB?.trim() || process.env.ggss_staff_sheet_tab?.trim();

  if (explicitSheetName) {
    return { spreadsheetId, sheetName: explicitSheetName };
  }

  const sheetGidInput = requiredEnv('GGSS_STAFF_SHEET_GID');
  const sheetId = Number(sheetGidInput);
  if (Number.isNaN(sheetId)) {
    throw new Error('GGSS_STAFF_SHEET_GID must be a valid numeric gid.');
  }

  const sheetName = await getQuizSheetTitleById(sheetId, { spreadsheetId });
  if (!sheetName) {
    throw new Error('Could not resolve GGSS staff sheet tab from gid.');
  }

  return { spreadsheetId, sheetName };
};

const getSheetRows = async () => {
  const context = await resolveSheetContext();
  const rows = await getQuizRowsFromSheet({
    spreadsheetId: context.spreadsheetId,
    range: toSheetRange(context.sheetName),
  });

  return {
    context,
    rows: rows as string[][],
  };
};

const buildColumns = (headerRow: string[]): ColumnMeta[] => {
  return headerRow.map((label, index) => {
    const key = normalizeKey(String(label ?? ''), index);
    return {
      key,
      label: String(label ?? '').trim() || `Column ${index + 1}`,
      editable: !LOCKED_KEYS.has(key),
    };
  });
};

const rowsToRecords = (rows: string[][]) => {
  if (!rows.length) {
    return { columns: [] as ColumnMeta[], records: [] as StaffSheetRecord[] };
  }

  const headerRow = rows[0];
  const columns = buildColumns(headerRow);
  const records = rows.slice(1).map((row, index) => {
    const record: StaffSheetRecord = { rowNumber: index + 2 };
    columns.forEach((column, columnIndex) => {
      record[column.key] = String(row[columnIndex] ?? '').trim();
    });
    return record;
  });

  return { columns, records };
};

const getDirectoryItems = (records: StaffSheetRecord[]): DirectoryItem[] => {
  return records
    .filter((record) => String(record[NAME_KEY] ?? '').trim())
    .map((record) => ({
      rowId: String(record.rowNumber),
      sno: String(record.s_no || record.sno || record.serial_no || record.serial || ''),
      name: String(record[NAME_KEY] || ''),
    }));
};

const toPublicRecord = (record: StaffSheetRecord, columns: ColumnMeta[]) => {
  const nextRecord: Record<string, string> = {};
  columns.forEach((column) => {
    if (column.key === PID_KEY) {
      return;
    }
    nextRecord[column.key] = String(record[column.key] || '');
  });
  return nextRecord;
};

const toRowValues = (record: Record<string, string>, columns: ColumnMeta[]) => {
  return columns.map((column) => record[column.key] || '');
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const mode = (url.searchParams.get('mode') || 'directory').toLowerCase();
    const { context, rows } = await getSheetRows();
    const { columns, records } = rowsToRecords(rows);

    if (mode === 'directory') {
      return NextResponse.json({
        success: true,
        items: getDirectoryItems(records),
        source: {
          sheetName: context.sheetName,
        },
      });
    }

    return NextResponse.json({
      success: true,
      columns: columns.filter((column) => column.key !== PID_KEY),
      count: records.length,
    });
  } catch (error) {
    const message = toFriendlySheetsError(error, 'Unable to load GGSS staff directory.');
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { rowId?: string; pid?: string };
    const rowNumber = Number(body.rowId || 0);
    const pid = String(body.pid ?? '').trim();

    if (!rowNumber || !pid) {
      return NextResponse.json({ success: false, message: 'rowId and PID are required.' }, { status: 400 });
    }

    const { rows } = await getSheetRows();
    const { columns, records } = rowsToRecords(rows);
    const record = records.find((item) => item.rowNumber === rowNumber);

    if (!record) {
      return NextResponse.json({ success: false, message: 'Staff record not found.' }, { status: 404 });
    }

    if (String(record[PID_KEY] || '').trim() !== pid) {
      return NextResponse.json({ success: false, message: 'Incorrect PID. Please try again.' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      record: toPublicRecord(record, columns),
      columns: columns.filter((column) => column.key !== PID_KEY),
      verifyToken: createVerifyToken({ rowNumber, verifiedAt: Date.now() }),
    });
  } catch (error) {
    const message = toFriendlySheetsError(error, 'Unable to verify staff record.');
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      verifyToken?: string;
      updates?: Record<string, string>;
    };

    const token = String(body.verifyToken ?? '').trim();
    if (!token) {
      return NextResponse.json({ success: false, message: 'Verification token is required.' }, { status: 400 });
    }

    const { rowNumber } = verifyToken(token);
    const { context, rows } = await getSheetRows();
    const { columns, records } = rowsToRecords(rows);
    const target = records.find((item) => item.rowNumber === rowNumber);

    if (!target) {
      return NextResponse.json({ success: false, message: 'Staff record not found.' }, { status: 404 });
    }

    const nextRecord: Record<string, string> = {};
    columns.forEach((column) => {
      nextRecord[column.key] = String(target[column.key] || '');
    });

    columns.forEach((column) => {
      if (!column.editable) {
        return;
      }

      const nextValue = body.updates?.[column.key];
      if (typeof nextValue === 'string') {
        nextRecord[column.key] = nextValue.trim();
      }
    });

    const rowRange = toSheetRange(context.sheetName, `A${rowNumber}:AZ${rowNumber}`);
    const { updateQuizRowInSheet } = await import('@/app/lib/googleSheets');
    await updateQuizRowInSheet({
      spreadsheetId: context.spreadsheetId,
      range: rowRange,
      values: toRowValues(nextRecord, columns),
    });

    return NextResponse.json({
      success: true,
      record: Object.fromEntries(columns.filter((column) => column.key !== PID_KEY).map((column) => [column.key, nextRecord[column.key] || ''])),
      columns: columns.filter((column) => column.key !== PID_KEY),
      message: 'Data saved successfully.',
    });
  } catch (error) {
    const message = toFriendlySheetsError(error, 'Unable to save GGSS staff record.');
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}