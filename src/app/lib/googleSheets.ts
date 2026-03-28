import 'server-only';
import { google } from 'googleapis';

const GOOGLE_SHEETS_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
];

const requiredEnv = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const getServiceAccountConfig = () => {
  const clientEmail = requiredEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  const privateKey = requiredEnv('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY').replace(/\\n/g, '\n');

  return { clientEmail, privateKey };
};

export const getGoogleSheetsClient = () => {
  const { clientEmail, privateKey } = getServiceAccountConfig();

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: GOOGLE_SHEETS_SCOPES,
  });

  return google.sheets({ version: 'v4', auth });
};

type QuizSheetFetchOptions = {
  spreadsheetId?: string;
  range?: string;
};

type QuizSheetMetaOptions = {
  spreadsheetId?: string;
};

const extractSpreadsheetId = (input: string) => {
  const trimmed = input.trim();
  if (!trimmed) {
    return '';
  }

  const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch?.[1]) {
    return urlMatch[1];
  }

  // If input is not a URL path, treat as a direct spreadsheet id.
  if (!trimmed.includes('/')) {
    return trimmed;
  }

  throw new Error('Invalid spreadsheet input. Paste a Google Sheet URL or spreadsheet ID.');
};

const resolveSpreadsheetId = (input?: string) => {
  const spreadsheetIdInput = input || process.env.GOOGLE_QUIZ_SPREADSHEET_ID || '';
  const spreadsheetId = extractSpreadsheetId(spreadsheetIdInput);

  if (!spreadsheetId) {
    throw new Error('Missing required spreadsheet id. Provide GOOGLE_QUIZ_SPREADSHEET_ID or pass spreadsheetId.');
  }

  return spreadsheetId;
};

export const getQuizRowsFromSheet = async (options?: QuizSheetFetchOptions) => {
  const spreadsheetId = resolveSpreadsheetId(options?.spreadsheetId);

  const range = options?.range?.trim() || process.env.GOOGLE_QUIZ_SHEET_RANGE || 'A:Z';

  const sheets = getGoogleSheetsClient();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  return response.data.values ?? [];
};

export const getQuizSheetTabs = async (options?: QuizSheetMetaOptions) => {
  const spreadsheetId = resolveSpreadsheetId(options?.spreadsheetId);
  const sheets = getGoogleSheetsClient();

  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets(properties(title))',
  });

  return (
    response.data.sheets
      ?.map((sheet) => sheet.properties?.title?.trim() || '')
      .filter(Boolean) || []
  );
};

export const getQuizSheetTitleById = async (sheetId: number, options?: QuizSheetMetaOptions) => {
  const spreadsheetId = resolveSpreadsheetId(options?.spreadsheetId);
  const sheets = getGoogleSheetsClient();

  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets(properties(sheetId,title))',
  });

  const matchedSheet = response.data.sheets?.find((sheet) => sheet.properties?.sheetId === sheetId);
  return matchedSheet?.properties?.title?.trim() || '';
};

const toQuotedSheetName = (sheetName: string) => {
  const escaped = sheetName.replace(/'/g, "''");
  return `'${escaped}'`;
};

export const getFirstColumnValuesFromTab = async (
  sheetName: string,
  options?: QuizSheetMetaOptions
) => {
  const spreadsheetId = resolveSpreadsheetId(options?.spreadsheetId);
  const sheets = getGoogleSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${toQuotedSheetName(sheetName)}!A:A`,
  });

  return (response.data.values ?? []).map((row) => String(row[0] ?? '').trim()).filter(Boolean);
};

type QuizSheetAppendOptions = {
  spreadsheetId?: string;
  range: string;
  values: string[];
};

type QuizSheetUpdateOptions = {
  spreadsheetId?: string;
  range: string;
  values: string[];
};

export const appendQuizRowToSheet = async (options: QuizSheetAppendOptions) => {
  const spreadsheetId = resolveSpreadsheetId(options.spreadsheetId);
  const sheets = getGoogleSheetsClient();

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: options.range,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [options.values],
    },
  });
};

export const updateQuizRowInSheet = async (options: QuizSheetUpdateOptions) => {
  const spreadsheetId = resolveSpreadsheetId(options.spreadsheetId);
  const sheets = getGoogleSheetsClient();

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: options.range,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [options.values],
    },
  });
};

export type SheetUser = {
  username: string;
  password: string;
  role: string;
  program: string;
  class: string;
};

// Reads the 'Users' tab — expected header: username | password | role | program | class
export const getQuizUsersFromSheet = async (spreadsheetIdInput?: string): Promise<SheetUser[]> => {
  try {
    const spreadsheetId = resolveSpreadsheetId(spreadsheetIdInput);
    const sheets = getGoogleSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "'Users'!A:E",
    });

    const rows = response.data.values ?? [];
    if (rows.length < 2) return [];

    const [, ...dataRows] = rows;
    return dataRows
      .filter((row) => row.some((cell) => String(cell ?? '').trim()))
      .map((row) => ({
        username: String(row[0] ?? '').trim(),
        password: String(row[1] ?? '').trim(),
        role: String(row[2] ?? '').trim().toLowerCase(),
        program: String(row[3] ?? '').trim().toLowerCase(),
        class: String(row[4] ?? '').trim(),
      }));
  } catch {
    return [];
  }
};

// Updates the password for a matching user row in the 'Users' tab
export const updateQuizUserPasswordInSheet = async (
  username: string,
  program: string,
  role: string,
  newPassword: string,
  spreadsheetIdInput?: string
): Promise<boolean> => {
  const spreadsheetId = resolveSpreadsheetId(spreadsheetIdInput);
  const sheets = getGoogleSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'Users'!A:D",
  });

  const rows = response.data.values ?? [];
  const normalizedProgram = program.trim().toLowerCase();

  for (let i = 1; i < rows.length; i += 1) {
    const rowUsername = String(rows[i]?.[0] ?? '').trim();
    const rowRole = String(rows[i]?.[2] ?? '').trim().toLowerCase();
    const rowProgram = String(rows[i]?.[3] ?? '').trim().toLowerCase();

    if (rowUsername === username && rowRole === role && rowProgram === normalizedProgram) {
      const sheetRowNumber = i + 1;
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'Users'!B${sheetRowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[newPassword]] },
      });
      return true;
    }
  }

  return false;
};
