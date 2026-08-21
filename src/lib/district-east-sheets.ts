import 'server-only';
import { getGoogleSheetsClient } from '@/app/lib/googleSheets';
import { type TeacherRecord } from '@/app/pay-fixation-2008/types';

const SHEET_TAB = '2026';
const HEADERS = [
  'S.No', 'Name', 'PID', 'Designation', 'Mobile',
  'Place of Posting', 'SEMIS Code', 'Taluka',
  'Contractual Appointment', 'Regularization Date',
  'Increments Claimed', 'Arrears', 'Recurring Annual Cost',
  'Pensionary Implications'
];

const RANGE = `${SHEET_TAB}!A:N`;

function getSpreadsheetId(): string {
  const id = process.env.DISTRICT_EAST_SPREADSHEET_ID;
  if (!id) throw new Error('Server database configuration is incomplete.');
  return id;
}

function toSheetValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  return String(val);
}

function rowToTeacher(row: string[], index: number): TeacherRecord {
  return {
    id: `row_${index + 2}`,
    name: row[1] || '',
    pid: row[2] || '',
    designation: row[3] || '',
    mobile: row[4] || '',
    place_of_posting: row[5] || '',
    semis_code: row[6] || '',
    taluka: row[7] || '',
    contractual_appointment: row[8] || '',
    regularization_date: row[9] || '',
    increments_claimed: row[10] || '',
    arrears: Number(row[11]) || 0,
    recurring_annual_cost: Number(row[12]) || 0,
    pensionary_implications: row[13] || '',
  };
}

/** Ensure the "2026" tab exists with headers */
export async function ensureSheetExists() {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets(properties(title))',
  });

  const existingTabs = meta.data.sheets
    ?.map(s => s.properties?.title?.trim() || '')
    .filter(Boolean) || [];

  if (!existingTabs.includes(SHEET_TAB)) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: SHEET_TAB } } }],
      },
    });
  }

  // Check if headers exist
  const headerCheck = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_TAB}!A1:N1`,
  });

  const existingHeaders = headerCheck.data.values?.[0] || [];
  const hasHeaders = existingHeaders.length > 0 && existingHeaders.some(c => String(c).trim().length > 0);

  if (!hasHeaders) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${SHEET_TAB}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [HEADERS] },
    });
  }
}

/** Get all teacher records from the sheet */
export async function getAllTeachers(): Promise<TeacherRecord[]> {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: RANGE,
  });

  const rows = response.data.values || [];
  if (rows.length < 2) return [];

  const dataRows = rows.slice(1).filter(row => row.some(cell => String(cell || '').trim().length > 0));
  return dataRows.map(rowToTeacher);
}

/** Add a new teacher record to the sheet */
export async function addTeacher(data: {
  name: string; pid: string; designation: string; mobile?: string;
  place_of_posting: string; semis_code?: string; taluka: string;
  contractual_appointment: string; regularization_date: string;
  increments_claimed: string; arrears: number; recurring_annual_cost: number;
  pensionary_implications: string;
}): Promise<TeacherRecord> {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  // Get current row count to calculate S.No
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_TAB}!A:A`,
  });
  const rowCount = (existing.data.values || []).length;

  const values = [
    rowCount, // S.No
    data.name, data.pid, data.designation, data.mobile || '',
    data.place_of_posting, data.semis_code || '', data.taluka,
    data.contractual_appointment, data.regularization_date,
    data.increments_claimed, data.arrears, data.recurring_annual_cost,
    data.pensionary_implications,
  ].map(toSheetValue);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: RANGE,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [values] },
  });

  return {
    id: `row_${rowCount + 1}`,
    name: data.name,
    pid: data.pid,
    designation: data.designation,
    mobile: data.mobile || '',
    place_of_posting: data.place_of_posting,
    semis_code: data.semis_code || '',
    taluka: data.taluka,
    contractual_appointment: data.contractual_appointment,
    regularization_date: data.regularization_date,
    increments_claimed: data.increments_claimed,
    arrears: data.arrears,
    recurring_annual_cost: data.recurring_annual_cost,
    pensionary_implications: data.pensionary_implications,
  };
}

/** Update an existing teacher record by row number (id format: row_X) */
export async function updateTeacher(id: string, data: {
  name: string; pid: string; designation: string; mobile?: string;
  place_of_posting: string; semis_code?: string; taluka: string;
  contractual_appointment: string; regularization_date: string;
  increments_claimed: string; arrears: number; recurring_annual_cost: number;
  pensionary_implications: string;
}): Promise<TeacherRecord> {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const rowIndex = parseInt(id.replace('row_', ''), 10);
  if (isNaN(rowIndex) || rowIndex < 2) throw new Error('Invalid record ID');

  const sNo = rowIndex - 1; // S.No in column A

  const values = [
    sNo,
    data.name, data.pid, data.designation, data.mobile || '',
    data.place_of_posting, data.semis_code || '', data.taluka,
    data.contractual_appointment, data.regularization_date,
    data.increments_claimed, data.arrears, data.recurring_annual_cost,
    data.pensionary_implications,
  ].map(toSheetValue);

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${SHEET_TAB}!A${rowIndex}:N${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  });

  return {
    id,
    name: data.name,
    pid: data.pid,
    designation: data.designation,
    mobile: data.mobile || '',
    place_of_posting: data.place_of_posting,
    semis_code: data.semis_code || '',
    taluka: data.taluka,
    contractual_appointment: data.contractual_appointment,
    regularization_date: data.regularization_date,
    increments_claimed: data.increments_claimed,
    arrears: data.arrears,
    recurring_annual_cost: data.recurring_annual_cost,
    pensionary_implications: data.pensionary_implications,
  };
}

/** Delete all teacher records (keep header) */
export async function clearAllTeachers(): Promise<void> {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets(properties(sheetId,title))',
  });

  const teacherSheet = meta.data.sheets?.find(
    s => s.properties?.title?.trim() === SHEET_TAB
  );
  const sheetId = teacherSheet?.properties?.sheetId;
  if (sheetId === null || sheetId === undefined) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: { sheetId, dimension: 'ROWS', startIndex: 1, endIndex: 99999 },
        },
      }],
    },
  });
}

/** Get all teacher records as CSV array for export */
export async function getTeachersCsvRows(): Promise<{ headers: string[]; rows: string[][] }> {
  const records = await getAllTeachers();
  const headers = [
    'S.No', 'Name', 'PID', 'Designation', 'Mobile',
    'Place of Posting', 'SEMIS Code', 'Taluka',
    'Contractual Appointment', 'Regularization Date',
    'Increments Claimed', 'Arrears', 'Recurring Annual Cost',
    'Pensionary Implications'
  ];

  const rows = records.map((r, i) => [
    String(i + 1), r.name, r.pid, r.designation, r.mobile || '',
    r.place_of_posting, r.semis_code || '', r.taluka,
    r.contractual_appointment, r.regularization_date,
    String(r.increments_claimed), String(r.arrears), String(r.recurring_annual_cost),
    r.pensionary_implications
  ]);

  return { headers, rows };
}
