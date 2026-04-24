import 'server-only';
import {
  appendQuizRowToSheet,
  deleteSheetRow,
  ensureSheetTabExists,
  getQuizRowsFromSheet,
  getQuizSheetIdByTitle,
  updateQuizRowInSheet,
} from '@/app/lib/googleSheets';

export type GgssStipendColumnMeta = {
  key: string;
  label: string;
};

export type GgssStipendSheetRecord = {
  rowNumber: number;
  [key: string]: string | number;
};

export type GgssStipendSheetContext = {
  spreadsheetId: string;
  sheetName: string;
};

export const GGSS_STIPEND_DEFAULT_SHEET_TAB = 'Students Stipend Record';
export const GGSS_STIPEND_RANGE = 'A:AZ';

export const GGSS_STIPEND_HEADERS = [
  'Class',
  'GR #',
  'Student Name',
  'Date of Birth',
  'Father/ Guardian Name',
  'CNIC of Father/Guardian',
  'Mobile No. of Father/ Guardian',
  'Relation',
  'August',
  'September',
  'October',
  'November',
  'December',
  'January',
  'February',
  'March',
];

const toSpreadsheetId = (input: string) => {
  const trimmed = input.trim();
  if (!trimmed) {
    return '';
  }

  const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch?.[1]) {
    return urlMatch[1];
  }

  if (!trimmed.includes('/')) {
    return trimmed;
  }

  throw new Error('Invalid spreadsheet input for GGSS stipend module.');
};

const resolveSpreadsheetId = () => {
  const stipendSheetInput = process.env.GGSS_STIPEND_SPREADSHEET_ID?.trim();
  const staffSheetInput = process.env.GGSS_STAFF_SPREADSHEET_ID?.trim();
  const spreadsheetInput = stipendSheetInput || staffSheetInput || '';

  if (!spreadsheetInput) {
    throw new Error('Missing GGSS spreadsheet id. Set GGSS_STIPEND_SPREADSHEET_ID or GGSS_STAFF_SPREADSHEET_ID.');
  }

  const spreadsheetId = toSpreadsheetId(spreadsheetInput);
  if (!spreadsheetId) {
    throw new Error('Unable to resolve GGSS stipend spreadsheet id.');
  }

  return spreadsheetId;
};

export const resolveGgssStipendSheetContext = async (): Promise<GgssStipendSheetContext> => {
  const spreadsheetId = resolveSpreadsheetId();
  const sheetName = process.env.GGSS_STIPEND_SHEET_TAB?.trim() || GGSS_STIPEND_DEFAULT_SHEET_TAB;
  return { spreadsheetId, sheetName };
};

const toSheetRange = (sheetName: string, columnRange = GGSS_STIPEND_RANGE) => {
  const escaped = sheetName.replace(/'/g, "''");
  return `'${escaped}'!${columnRange}`;
};

const normalizeKey = (value: string, index: number) => {
  const base = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return base || `column_${index + 1}`;
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

export const buildGgssStipendColumns = (headerRow: string[]): GgssStipendColumnMeta[] => {
  return headerRow.map((label, index) => {
    const normalizedLabel = String(label ?? '').trim();
    return {
      key: normalizeKey(String(label ?? ''), index),
      label: normalizedLabel || `Column ${index + 1}`,
    };
  });
};

export const getGgssStipendSheetRows = async () => {
  const context = await resolveGgssStipendSheetContext();

  await ensureSheetTabExists(context.sheetName, GGSS_STIPEND_HEADERS, {
    spreadsheetId: context.spreadsheetId,
  });

  const rows = await getQuizRowsFromSheet({
    spreadsheetId: context.spreadsheetId,
    range: toSheetRange(context.sheetName),
  });

  return {
    context,
    rows: rows as string[][],
  };
};

export const ggssStipendRowsToRecords = (rows: string[][]) => {
  if (!rows.length) {
    return { columns: [] as GgssStipendColumnMeta[], records: [] as GgssStipendSheetRecord[] };
  }

  const columns = buildGgssStipendColumns(rows[0]);
  const records = rows.slice(1).map((row, index) => {
    const record: GgssStipendSheetRecord = { rowNumber: index + 2 };
    columns.forEach((column, colIndex) => {
      record[column.key] = String(row[colIndex] ?? '').trim();
    });
    return record;
  });

  return { columns, records };
};

export const toGgssStipendRecord = (
  record: GgssStipendSheetRecord,
  columns: GgssStipendColumnMeta[]
) => {
  const nextRecord: Record<string, string> = {};
  columns.forEach((column) => {
    nextRecord[column.key] = String(record[column.key] ?? '');
  });
  return nextRecord;
};

export const saveGgssStipendRow = async (
  rowNumber: number,
  values: Record<string, string>,
  columns: GgssStipendColumnMeta[]
) => {
  const { context } = await getGgssStipendSheetRows();
  const endColumn = toSheetColumnLabel(Math.max(columns.length - 1, 0));
  const rowValues = columns.map((column) => String(values[column.key] ?? '').trim());

  await updateQuizRowInSheet({
    spreadsheetId: context.spreadsheetId,
    range: toSheetRange(context.sheetName, `A${rowNumber}:${endColumn}${rowNumber}`),
    values: rowValues,
  });
};

export const addGgssStipendRow = async (values: Record<string, string>, columns: GgssStipendColumnMeta[]) => {
  const { context } = await getGgssStipendSheetRows();
  const rowValues = columns.map((column) => String(values[column.key] ?? '').trim());

  await appendQuizRowToSheet({
    spreadsheetId: context.spreadsheetId,
    range: toSheetRange(context.sheetName, GGSS_STIPEND_RANGE),
    values: rowValues,
  });
};

export const deleteGgssStipendRow = async (rowNumber: number) => {
  const { context } = await getGgssStipendSheetRows();
  const sheetId = await getQuizSheetIdByTitle(context.sheetName, {
    spreadsheetId: context.spreadsheetId,
  });

  if (sheetId === null) {
    throw new Error('Could not resolve GGSS stipend sheet id for row deletion.');
  }

  await deleteSheetRow({
    spreadsheetId: context.spreadsheetId,
    sheetId,
    rowNumber,
  });
};
