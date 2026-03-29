import 'server-only';

import {
  ensureSheetTabExists,
  getRowFromTabByKey,
  upsertRowByKeyInTab,
} from '@/app/lib/googleSheets';

const VISITOR_TAB = process.env.VISITOR_COUNT_SHEET_TAB?.trim() || 'VisitorCount';
const VISITOR_KEY = 'total';

const normalizeSpreadsheetId = (input: string) => {
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match?.[1] || input;
};

const resolveVisitorSpreadsheetId = () => {
  const explicit = process.env.VISITOR_COUNT_SPREADSHEET_ID?.trim();
  if (explicit) return normalizeSpreadsheetId(explicit);

  const fallback = process.env.CONTACT_MESSAGES_SPREADSHEET_ID?.trim();
  if (fallback) return normalizeSpreadsheetId(fallback);

  throw new Error(
    'Missing VISITOR_COUNT_SPREADSHEET_ID (or CONTACT_MESSAGES_SPREADSHEET_ID fallback).',
  );
};

const prepareTab = async (spreadsheetId: string) => {
  await ensureSheetTabExists(VISITOR_TAB, ['key', 'count'], { spreadsheetId });
};

export const getVisitorCount = async (): Promise<number> => {
  const spreadsheetId = resolveVisitorSpreadsheetId();
  await prepareTab(spreadsheetId);

  const row = await getRowFromTabByKey(VISITOR_TAB, VISITOR_KEY, { spreadsheetId });
  return row[1] ? parseInt(row[1], 10) || 0 : 0;
};

export const incrementVisitorCount = async (): Promise<number> => {
  const spreadsheetId = resolveVisitorSpreadsheetId();
  await prepareTab(spreadsheetId);

  const row = await getRowFromTabByKey(VISITOR_TAB, VISITOR_KEY, { spreadsheetId });
  const current = row[1] ? parseInt(row[1], 10) || 0 : 0;
  const newCount = current + 1;

  await upsertRowByKeyInTab(VISITOR_TAB, VISITOR_KEY, [VISITOR_KEY, String(newCount)], {
    spreadsheetId,
  });

  return newCount;
};
