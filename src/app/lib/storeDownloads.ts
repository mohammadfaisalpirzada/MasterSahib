import 'server-only';

import { ensureSheetTabExists, getGoogleSheetsClient } from '@/app/lib/googleSheets';

/** Real download / open clicks per Master Store app, kept in the same spreadsheet as the visitor count. */
const TAB = 'StoreDownloads';

const normalizeSpreadsheetId = (input: string) =>
  input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1] || input;

const resolveSpreadsheetId = () => {
  const id =
    process.env.STORE_DOWNLOADS_SPREADSHEET_ID?.trim() ||
    process.env.VISITOR_COUNT_SPREADSHEET_ID?.trim() ||
    process.env.CONTACT_MESSAGES_SPREADSHEET_ID?.trim();
  if (!id) throw new Error('Missing VISITOR_COUNT_SPREADSHEET_ID (or CONTACT_MESSAGES_SPREADSHEET_ID fallback).');
  return normalizeSpreadsheetId(id);
};

let tabReady = false;
const prepare = async (spreadsheetId: string) => {
  if (tabReady) return;
  await ensureSheetTabExists(TAB, ['appId', 'count', 'updatedAt'], { spreadsheetId });
  tabReady = true;
};

const readRows = async (spreadsheetId: string) => {
  const sheets = getGoogleSheetsClient();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: `${TAB}!A:B` });
  return (res.data.values ?? []).map((r) => [String(r[0] ?? '').trim(), String(r[1] ?? '')]);
};

/** { appId: realCount } for every app that has been clicked at least once. */
export const getStoreDownloadCounts = async (): Promise<Record<string, number>> => {
  const spreadsheetId = resolveSpreadsheetId();
  await prepare(spreadsheetId);
  const out: Record<string, number> = {};
  for (const [id, count] of (await readRows(spreadsheetId)).slice(1)) {
    if (id) out[id] = parseInt(count, 10) || 0;
  }
  return out;
};

/** Adds one click for appId and returns its new real count. */
export const incrementStoreDownload = async (appId: string): Promise<number> => {
  const spreadsheetId = resolveSpreadsheetId();
  await prepare(spreadsheetId);
  const sheets = getGoogleSheetsClient();
  const rows = await readRows(spreadsheetId);
  const idx = rows.findIndex((r, i) => i > 0 && r[0] === appId);
  const next = (idx > 0 ? parseInt(rows[idx][1], 10) || 0 : 0) + 1;
  const values = [[appId, String(next), new Date().toISOString()]];

  if (idx > 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${TAB}!A${idx + 1}`,
      valueInputOption: 'RAW',
      requestBody: { values },
    });
  } else {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${TAB}!A1`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values },
    });
  }
  return next;
};
