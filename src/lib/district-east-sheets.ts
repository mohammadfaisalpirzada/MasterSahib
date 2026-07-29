import 'server-only';
import { getGoogleSheetsClient } from '@/app/lib/googleSheets';
import { type TeacherRecord } from '@/app/district-east-teachers/types';

const SHEET_TAB = 'Teachers';
const HEADERS = [
  'S.No', 'Name', 'PID', 'Designation', 'CNIC', 'Mobile',
  'Place of Posting', 'SEMIS Code', 'Taluka',
  'Contractual Appointment', 'Regularization Date',
  'Increments Claimed', 'Arrears', 'Recurring Annual Cost',
  'Pensionary Implications', 'Remarks', 'Created At'
];

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
    id: `row_${index + 2}`, // row 1 = header, so data starts at row 2
    created_at: row[16] || new Date().toISOString(),
    name: row[1] || '',
    pid: row[2] || '',
    designation: row[3] || '',
    cnic: row[4] || '',
    mobile: row[5] || '',
    place_of_posting: row[6] || '',
    semis_code: row[7] || '',
    taluka: row[8] || '',
    contractual_appointment: row[9] || '',
    regularization_date: row[10] || '',
    increments_claimed: Number(row[11]) || 0,
    arrears: Number(row[12]) || 0,
    recurring_annual_cost: Number(row[13]) || 0,
    pensionary_implications: row[14] || '',
    remarks: row[15] || '',
  };
}

/** Ensure the "Teachers" tab exists with headers */
export async function ensureSheetExists() {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  // Check if Teachers tab exists
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets(properties(title))',
  });

  const existingTabs = meta.data.sheets
    ?.map(s => s.properties?.title?.trim() || '')
    .filter(Boolean) || [];

  if (!existingTabs.includes(SHEET_TAB)) {
    // Create tab
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title: SHEET_TAB } } }],
      },
    });
  }

  // Check if headers exist (row 1 is populated)
  const headerCheck = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_TAB}!A1:Q1`,
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
    range: `${SHEET_TAB}!A:Q`,
  });

  const rows = response.data.values || [];
  if (rows.length < 2) return [];

  // Skip header row, process data rows
  const dataRows = rows.slice(1).filter(row => row.some(cell => String(cell || '').trim().length > 0));
  return dataRows.map(rowToTeacher);
}

/** Add a new teacher record to the sheet */
export async function addTeacher(data: {
  name: string; pid: string; designation: string; cnic?: string; mobile?: string;
  place_of_posting: string; semis_code?: string; taluka: string;
  contractual_appointment: string; regularization_date: string;
  increments_claimed: number; arrears: number; recurring_annual_cost: number;
  pensionary_implications: string; remarks?: string;
}): Promise<TeacherRecord> {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const now = new Date().toISOString();

  // Get current row count to calculate S.No
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEET_TAB}!A:A`,
  });
  const rowCount = (existing.data.values || []).length; // includes header

  const values = [
    rowCount, // S.No
    data.name, data.pid, data.designation,
    data.cnic || '', data.mobile || '',
    data.place_of_posting, data.semis_code || '', data.taluka,
    data.contractual_appointment, data.regularization_date,
    data.increments_claimed, data.arrears, data.recurring_annual_cost,
    data.pensionary_implications, data.remarks || '', now
  ].map(toSheetValue);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${SHEET_TAB}!A:Q`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [values] },
  });

  return {
    id: `row_${rowCount + 1}`,
    created_at: now,
    name: data.name,
    pid: data.pid,
    designation: data.designation,
    cnic: data.cnic || '',
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
    remarks: data.remarks || '',
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

  // Delete all data rows (leave header)
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: 1,
            endIndex: 99999, // delete all rows after header
          },
        },
      }],
    },
  });
}

/** Get all teacher records as CSV array for export */
export async function getTeachersCsvRows(): Promise<{ headers: string[]; rows: string[][] }> {
  const records = await getAllTeachers();
  const headers = [
    'S.No', 'Name', 'PID', 'Designation', 'CNIC', 'Mobile',
    'Place of Posting', 'SEMIS Code', 'Taluka',
    'Contractual Appointment', 'Regularization Date',
    'Increments Claimed', 'Arrears', 'Recurring Annual Cost',
    'Pensionary Implications', 'Remarks'
  ];

  const rows = records.map((r, i) => [
    String(i + 1), r.name, r.pid, r.designation, r.cnic || '', r.mobile || '',
    r.place_of_posting, r.semis_code || '', r.taluka,
    r.contractual_appointment, r.regularization_date,
    String(r.increments_claimed), String(r.arrears), String(r.recurring_annual_cost),
    r.pensionary_implications, r.remarks || ''
  ]);

  return { headers, rows };
}
