import 'server-only';
import { getGoogleSheetsClient } from './googleSheets';

const getSpreadsheetId = () => {
  const id = process.env.GGSS_STAFF_SPREADSHEET_ID;
  if (!id) throw new Error('Missing GGSS_STAFF_SPREADSHEET_ID environment variable.');
  return id;
};

const toQuotedSheetName = (name: string) => `'${name.replace(/'/g, "''")}'`;

export const TAKEOVER_TAB_PREFIX = 'Takeover ';

export type TakeoverSessionMeta = {
  schoolName: string;
  date: string;
  day: string;
  time: string;
  handoverBy: string;
  handoverTo: string;
  remarks: string;
};

export type TakeoverSessionItem = {
  serialNo: number;
  area: string;
  object: string;
  quantity: string;
  status: string;
  comments: string;
};

export type TakeoverSession = {
  tabName: string;
  meta: TakeoverSessionMeta;
  items: TakeoverSessionItem[];
};

// ── List all takeover session tab names ──────────────────────────────────────
export const listTakeoverSessions = async (): Promise<string[]> => {
  const spreadsheetId = getSpreadsheetId();
  const sheets = getGoogleSheetsClient();

  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets(properties(title))',
  });

  return (response.data.sheets ?? [])
    .map((s) => s.properties?.title?.trim() ?? '')
    .filter((title) => title.startsWith(TAKEOVER_TAB_PREFIX))
    .sort((a, b) => b.localeCompare(a)); // newest first
};

// ── Load a session by tab name ───────────────────────────────────────────────
export const loadTakeoverSession = async (tabName: string): Promise<TakeoverSession> => {
  const spreadsheetId = getSpreadsheetId();
  const sheets = getGoogleSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${toQuotedSheetName(tabName)}!A:G`,
  });

  const rows = response.data.values ?? [];

  // Row 0: meta headers  Row 1: meta values  Row 2: item headers  Row 3+: item data
  const metaValues = rows[1] ?? [];
  const meta: TakeoverSessionMeta = {
    schoolName: String(metaValues[0] ?? ''),
    date: String(metaValues[1] ?? ''),
    day: String(metaValues[2] ?? ''),
    time: String(metaValues[3] ?? ''),
    handoverBy: String(metaValues[4] ?? ''),
    handoverTo: String(metaValues[5] ?? ''),
    remarks: String(metaValues[6] ?? ''),
  };

  const itemRows = rows.slice(3); // skip meta header, meta values, item header
  const items: TakeoverSessionItem[] = itemRows
    .filter((row) => row.some((cell) => String(cell ?? '').trim()))
    .map((row) => ({
      serialNo: Number(row[0] ?? 0) || 0,
      area: String(row[1] ?? ''),
      object: String(row[2] ?? ''),
      quantity: String(row[3] ?? ''),
      status: String(row[4] ?? 'Working'),
      comments: String(row[5] ?? ''),
    }));

  return { tabName, meta, items };
};

// ── Write (create or overwrite) a session ───────────────────────────────────
const buildSheetRows = (meta: TakeoverSessionMeta, items: TakeoverSessionItem[]) => {
  const metaHeader = ['schoolName', 'date', 'day', 'time', 'handoverBy', 'handoverTo', 'remarks'];
  const metaValues = [
    meta.schoolName,
    meta.date,
    meta.day,
    meta.time,
    meta.handoverBy,
    meta.handoverTo,
    meta.remarks,
  ];
  const itemHeader = ['S#', 'Area', 'Object', 'Quantity', 'Status', 'Comments'];
  const itemRows = items.map((item) => [
    String(item.serialNo),
    item.area,
    item.object,
    String(item.quantity),
    item.status,
    item.comments,
  ]);
  return [metaHeader, metaValues, itemHeader, ...itemRows];
};

const ensureTakeoverTabExists = async (tabName: string) => {
  const spreadsheetId = getSpreadsheetId();
  const sheets = getGoogleSheetsClient();

  const metaResponse = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets(properties(title))',
  });
  const existingTabs = (metaResponse.data.sheets ?? []).map((s) => s.properties?.title?.trim() ?? '');

  if (!existingTabs.includes(tabName)) {
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: [{ addSheet: { properties: { title: tabName } } }] },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : '';
      if (!message.includes('already exists')) throw error;
    }
  }
};

export const saveTakeoverSession = async (
  meta: TakeoverSessionMeta,
  items: TakeoverSessionItem[],
  tabName?: string,
): Promise<string> => {
  // Build tab name from date + time if not provided
  const resolvedTabName =
    tabName ??
    `${TAKEOVER_TAB_PREFIX}${meta.date} ${meta.time.replace(':', '-')}`;

  const spreadsheetId = getSpreadsheetId();
  const sheets = getGoogleSheetsClient();

  await ensureTakeoverTabExists(resolvedTabName);

  const allRows = buildSheetRows(meta, items);
  const endCol = 'G';
  const endRow = allRows.length;

  // Clear existing content first
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${toQuotedSheetName(resolvedTabName)}!A1:${endCol}1000`,
  });

  // Write all rows
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${toQuotedSheetName(resolvedTabName)}!A1:${endCol}${endRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: allRows },
  });

  return resolvedTabName;
};
