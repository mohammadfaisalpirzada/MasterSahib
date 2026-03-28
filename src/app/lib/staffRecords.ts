import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  clearRowInTabByKey,
  deleteSheetRow,
  ensureSheetTabExists,
  getQuizRowsFromSheet,
  getQuizSheetIdByTitle,
  getQuizSheetTitleById,
  getRowFromTabByKey,
  updateQuizRowInSheet,
  upsertRowByKeyInTab,
} from '@/app/lib/googleSheets';

export type ColumnMeta = {
  key: string;
  label: string;
  editable: boolean;
};

export type DirectoryItem = {
  rowId: string;
  sno: string;
  name: string;
};

export type StaffSheetRecord = {
  rowNumber: number;
  [key: string]: string | number;
};

export type SheetContext = {
  spreadsheetId: string;
  sheetName: string;
};

export const STAFF_RANGE = 'A:AZ';
export const NAME_KEY = 'name';
export const PID_KEY = 'pid';
export const PICTURE_KEY = 'picture';
export const LOCKED_KEYS = new Set([
  NAME_KEY,
  PID_KEY,
  PICTURE_KEY,
  's_no',
  'sno',
  'serial_no',
  'serial',
]);

export const PICTURES_TAB_NAME = 'pictures';

export const savePictureToStaffTab = async (staffName: string, base64: string) => {
  const { context } = await getStaffSheetRows();
  await ensureSheetTabExists(PICTURES_TAB_NAME, ['name', 'picture'], { spreadsheetId: context.spreadsheetId });
  await upsertRowByKeyInTab(PICTURES_TAB_NAME, staffName, [staffName, base64], { spreadsheetId: context.spreadsheetId });
};

export const loadPictureFromStaffTab = async (staffName: string): Promise<string> => {
  if (!staffName) return '';
  try {
    const { context } = await getStaffSheetRows();
    await ensureSheetTabExists(PICTURES_TAB_NAME, ['name', 'picture'], { spreadsheetId: context.spreadsheetId });
    const row = await getRowFromTabByKey(PICTURES_TAB_NAME, staffName, { spreadsheetId: context.spreadsheetId });
    return row[1] ?? '';
  } catch {
    return '';
  }
};

export const deletePictureFromStaffTab = async (staffName: string) => {
  if (!staffName) return;
  const { context } = await getStaffSheetRows();
  await ensureSheetTabExists(PICTURES_TAB_NAME, ['name', 'picture'], { spreadsheetId: context.spreadsheetId });
  await clearRowInTabByKey(PICTURES_TAB_NAME, staffName, { spreadsheetId: context.spreadsheetId });
};

const RETIREMENT_KEYS = new Set([
  'date_of_retirement',
  'retirement_date',
  'date_of_retiremnet',
  'retirement',
  'dor',
  'date_of_superannuation',
  'superannuation_date',
]);

const isLockedStaffField = (key: string) => {
  return LOCKED_KEYS.has(key) || RETIREMENT_KEYS.has(key);
};

const isRetirementLabel = (label: string) => {
  const normalized = label.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  // Covers variations like "Date of Retirement", typo variants, and superannuation labels.
  return (
    normalized.includes('retirement') ||
    normalized.includes('retiremnet') ||
    normalized.includes('retire') ||
    normalized.includes('superannuation')
  );
};

const requiredEnv = (key: string) => {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const getSignatureSecret = () => {
  return requiredEnv('AUTH_SESSION_SECRET');
};

const encodeTokenPart = (value: string) => Buffer.from(value, 'utf8').toString('base64url');
const decodeTokenPart = (value: string) => Buffer.from(value, 'base64url').toString('utf8');

const signTokenPayload = (payload: string) => {
  return createHmac('sha256', getSignatureSecret()).update(payload).digest('base64url');
};

export const toFriendlySheetsError = (error: unknown, fallbackMessage: string) => {
  const rawMessage = error instanceof Error ? error.message : '';
  const normalized = rawMessage.toLowerCase();

  if (normalized.includes('this operation is not supported for this document')) {
    return 'This file is in Office compatibility mode. Convert it to a native Google Sheet and then retry.';
  }

  if (normalized.includes('insufficient permissions') || normalized.includes('the caller does not have permission')) {
    return 'Service account does not have access to this sheet. Share the sheet with GOOGLE_SERVICE_ACCOUNT_EMAIL as Editor.';
  }

  if (normalized.includes('maximum of 50000 characters in a single cell')) {
    return 'Photo is too large for Google Sheet cell. Please upload a smaller or compressed image.';
  }

  return rawMessage || fallbackMessage;
};

export const normalizeKey = (value: string, index: number) => {
  const base = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return base || `column_${index + 1}`;
};

export const toSheetRange = (sheetName: string, columnRange = STAFF_RANGE) => {
  const escaped = sheetName.replace(/'/g, "''");
  return `'${escaped}'!${columnRange}`;
};

export const createStaffVerifyToken = (payload: { rowNumber: number; verifiedAt: number }) => {
  const encodedPayload = encodeTokenPart(JSON.stringify(payload));
  const signature = signTokenPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
};

export const verifyStaffVerifyToken = (token: string) => {
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

export const resolveStaffSheetContext = async (): Promise<SheetContext> => {
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

export const getStaffSheetRows = async () => {
  const context = await resolveStaffSheetContext();
  const rows = await getQuizRowsFromSheet({
    spreadsheetId: context.spreadsheetId,
    range: toSheetRange(context.sheetName),
  });

  return {
    context,
    rows: rows as string[][],
  };
};

export const buildColumns = (headerRow: string[]): ColumnMeta[] => {
  return headerRow.map((label, index) => {
    const normalizedLabel = String(label ?? '').trim();
    const key = normalizeKey(String(label ?? ''), index);
    const lockedByLabel = isRetirementLabel(normalizedLabel);
    return {
      key,
      label: normalizedLabel || `Column ${index + 1}`,
      editable: !isLockedStaffField(key) && !lockedByLabel,
    };
  });
};

export const rowsToRecords = (rows: string[][]) => {
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

export const getDirectoryItems = (records: StaffSheetRecord[]): DirectoryItem[] => {
  return records
    .filter((record) => String(record[NAME_KEY] ?? '').trim())
    .map((record) => ({
      rowId: String(record.rowNumber),
      sno: String(record.s_no || record.sno || record.serial_no || record.serial || ''),
      name: String(record[NAME_KEY] || ''),
    }));
};

export const toPublicRecord = (record: StaffSheetRecord, columns: ColumnMeta[]) => {
  const nextRecord: Record<string, string> = {};
  columns.forEach((column) => {
    if (column.key === PID_KEY) {
      return;
    }
    nextRecord[column.key] = String(record[column.key] || '');
  });
  return nextRecord;
};

export const toFullRecord = (record: StaffSheetRecord, columns: ColumnMeta[]) => {
  const nextRecord: Record<string, string> = {};
  columns.forEach((column) => {
    nextRecord[column.key] = String(record[column.key] || '');
  });
  return nextRecord;
};

export const toRowValues = (record: Record<string, string>, columns: ColumnMeta[]) => {
  return columns.map((column) => record[column.key] || '');
};

const toSheetColumnLabel = (index: number) => {
  let value = index + 1;
  let label = '';

  while (value > 0) {
    const remainder = (value - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    value = Math.floor((value - 1) / 26);
  }

  return label;
};

export const saveStaffRow = async (
  rowNumber: number,
  updates: Record<string, string>,
  columns: ColumnMeta[]
) => {
  const { context } = await getStaffSheetRows();

  // Update only editable changed cells so formula-driven columns are never overwritten.
  for (let i = 0; i < columns.length; i += 1) {
    const column = columns[i];
    if (!column.editable) {
      continue;
    }

    const nextValue = updates[column.key];
    if (typeof nextValue !== 'string') {
      continue;
    }

    const colLabel = toSheetColumnLabel(i);
    const cellRange = toSheetRange(context.sheetName, `${colLabel}${rowNumber}:${colLabel}${rowNumber}`);
    await updateQuizRowInSheet({
      spreadsheetId: context.spreadsheetId,
      range: cellRange,
      values: [nextValue],
    });
  }
};

export const deleteStaffRow = async (rowNumber: number) => {
  const { context } = await getStaffSheetRows();
  const sheetId = await getQuizSheetIdByTitle(context.sheetName, {
    spreadsheetId: context.spreadsheetId,
  });

  if (sheetId === null) {
    throw new Error('Could not resolve GGSS staff sheet id for row deletion.');
  }

  await deleteSheetRow({
    spreadsheetId: context.spreadsheetId,
    sheetId,
    rowNumber,
  });
};
