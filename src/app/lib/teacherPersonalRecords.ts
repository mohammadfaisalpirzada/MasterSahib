import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { getGoogleSheetsClient } from '@/app/lib/googleSheets';

export const TEACHER_SHEET_TAB = 'Teacher Verification Data';

export const TEACHER_HEADERS = [
  'SR No.',
  'Name',
  'Father Name',
  'CNIC No',
  'PID No.',
  'Place of Appointment',
  'Domicile',
  'Date of Offer Letter',
  'Date of Apptt:',
  'Qualification at the time of Apptt.',
  'Requirement as per Rules',
  'Name & Desig of Apptt: Authority Committee Members with Designation',
  'Any others relevent information',
  'Name of News paper of Advertisement & Date'
] as const;

export type TeacherFieldKey =
  | 'sr_no'
  | 'name'
  | 'father_name'
  | 'cnic_no'
  | 'pid_no'
  | 'place_of_appointment'
  | 'domicile'
  | 'date_of_offer_letter'
  | 'date_of_apptt'
  | 'qualification_at_apptt'
  | 'requirement_as_per_rules'
  | 'appointment_committee_members'
  | 'other_relevant_info'
  | 'newspaper_advertisement_and_date';

export type TeacherRecordData = {
  rowNumber: number;
  sr_no: string;
  name: string;
  father_name: string;
  cnic_no: string;
  pid_no: string;
  place_of_appointment: string;
  domicile: string;
  date_of_offer_letter: string;
  date_of_apptt: string;
  qualification_at_apptt: string;
  requirement_as_per_rules: string;
  appointment_committee_members: string;
  other_relevant_info: string;
  newspaper_advertisement_and_date: string;
};

export type TeacherListItem = {
  rowNumber: number;
  sr_no: string;
  name: string;
};

const getSpreadsheetId = (): string => {
  const id = process.env.GGSS_STAFF_SPREADSHEET_ID || process.env.DISTRICT_EAST_SPREADSHEET_ID;
  if (!id) {
    throw new Error('Spreadsheet ID is not configured.');
  }
  const match = id.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : id.trim();
};

const getSecretKey = (): string => {
  return process.env.AUTH_SESSION_SECRET || 'master-sahib-teacher-personal-secret-salt-2026';
};

const signPayload = (payload: string): string => {
  return createHmac('sha256', getSecretKey()).update(payload).digest('base64url');
};

const encodeTokenPart = (val: string): string => Buffer.from(val, 'utf8').toString('base64url');
const decodeTokenPart = (val: string): string => Buffer.from(val, 'base64url').toString('utf8');

export const createSignedToken = (payload: { rowNumber: number; purpose: 'view' | 'edit'; exp: number }): string => {
  const json = JSON.stringify(payload);
  const encoded = encodeTokenPart(json);
  const sig = signPayload(encoded);
  return `${encoded}.${sig}`;
};

export const verifySignedToken = (token: string, expectedPurpose: 'view' | 'edit'): { rowNumber: number } => {
  if (!token || typeof token !== 'string') {
    throw new Error('Verification token is missing.');
  }

  const [encoded, sig] = token.split('.');
  if (!encoded || !sig) {
    throw new Error('Malformed verification token.');
  }

  const expectedSig = signPayload(encoded);
  const bufSig = Buffer.from(sig);
  const bufExpected = Buffer.from(expectedSig);

  if (bufSig.length !== bufExpected.length || !timingSafeEqual(bufSig, bufExpected)) {
    throw new Error('Security token signature mismatch.');
  }

  const payload = JSON.parse(decodeTokenPart(encoded)) as { rowNumber?: number; purpose?: string; exp?: number };
  if (!payload.rowNumber || payload.purpose !== expectedPurpose || !payload.exp) {
    throw new Error('Invalid token permissions.');
  }

  if (Date.now() > payload.exp) {
    throw new Error('Session has expired. Please verify your Personal Number again.');
  }

  return { rowNumber: payload.rowNumber };
};

/** Normalize personal number for comparison (removes spaces, dashes, case-insensitive) */
export const normalizePersonalNumber = (input: string): string => {
  return (input || '').replace(/[\s\-_]/g, '').trim().toUpperCase();
};

/** Ensure the sheet exists with headers, seed if empty */
export const ensureTeacherVerificationSheet = async (): Promise<void> => {
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const tabExists = meta.data.sheets?.some(s => s.properties?.title === TEACHER_SHEET_TAB);

  if (!tabExists) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: TEACHER_SHEET_TAB,
              },
            },
          },
        ],
      },
    });

    // Seed from 'data' tab if available
    let seedRows: string[][] = [Array.from(TEACHER_HEADERS)];
    try {
      const dataRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'data!A1:Z100',
      });
      const dataRows = dataRes.data.values || [];
      if (dataRows.length > 1) {
        dataRows.slice(1).forEach((r, idx) => {
          const name = (r[1] || '').trim();
          const pid = (r[10] || '').trim();
          if (name && pid) {
            seedRows.push([
              String(idx + 1), // SR No.
              name, // Name
              (r[2] || '').trim(), // Father Name
              (r[4] || '').trim(), // CNIC No
              pid, // PID No.
              (r[7] || '').trim(), // Place of Appointment
              (r[25] || '').trim(), // Domicile
              '', // Date of Offer Letter
              (r[21] || '').trim(), // Date of Apptt:
              (r[16] || '').trim(), // Qualification at the time of Apptt.
              '', // Requirement as per Rules
              (r[22] || '').trim(), // Name & Desig of Apptt: Authority Committee Members with Designation
              '', // Any others relevent information
              '', // Name of News paper of Advertisement & Date
            ]);
          }
        });
      }
    } catch {
      // Seed with headers only if data tab is missing
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${TEACHER_SHEET_TAB}'!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: seedRows,
      },
    });
  }
};

/** Parse row array to structured TeacherRecordData */
const parseRowToRecord = (row: string[], rowNumber: number): TeacherRecordData => {
  return {
    rowNumber,
    sr_no: (row[0] || '').trim() || String(rowNumber - 1),
    name: (row[1] || '').trim(),
    father_name: (row[2] || '').trim(),
    cnic_no: (row[3] || '').trim(),
    pid_no: (row[4] || '').trim(),
    place_of_appointment: (row[5] || '').trim(),
    domicile: (row[6] || '').trim(),
    date_of_offer_letter: (row[7] || '').trim(),
    date_of_apptt: (row[8] || '').trim(),
    qualification_at_apptt: (row[9] || '').trim(),
    requirement_as_per_rules: (row[10] || '').trim(),
    appointment_committee_members: (row[11] || '').trim(),
    other_relevant_info: (row[12] || '').trim(),
    newspaper_advertisement_and_date: (row[13] || '').trim(),
  };
};

/** Get lightweight list of teachers for the dropdown (ONLY rowNumber, sr_no, and name) */
export const getTeachersDropdownList = async (): Promise<TeacherListItem[]> => {
  await ensureTeacherVerificationSheet();
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${TEACHER_SHEET_TAB}'!A2:B200`,
  });

  const rows = response.data.values || [];
  const list: TeacherListItem[] = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2; // Row 1 is header
    const sr_no = (row[0] || '').trim() || String(index + 1);
    const name = (row[1] || '').trim();
    if (name) {
      list.push({ rowNumber, sr_no, name });
    }
  });

  return list;
};

/** Fetch single teacher row by rowNumber */
export const getTeacherRecordByRow = async (rowNumber: number): Promise<TeacherRecordData | null> => {
  await ensureTeacherVerificationSheet();
  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${TEACHER_SHEET_TAB}'!A${rowNumber}:N${rowNumber}`,
  });

  const row = response.data.values?.[0];
  if (!row || !row[1]) {
    return null;
  }

  return parseRowToRecord(row, rowNumber);
};

/** Verify personal number and generate view token + return full record */
export const verifyTeacherAccess = async (rowNumber: number, personalNumberInput: string) => {
  const teacher = await getTeacherRecordByRow(rowNumber);
  if (!teacher) {
    throw new Error('Teacher record nahi mila. Barah-e-karam page refresh kar ke dobara muntakhab karein.');
  }

  const normalizedInput = normalizePersonalNumber(personalNumberInput);
  const normalizedStored = normalizePersonalNumber(teacher.pid_no);

  if (!normalizedInput || !normalizedStored || normalizedInput !== normalizedStored) {
    throw new Error('Ghalat Personal Number (Password). Sirf mutaaliqa Personal Number darj karein.');
  }

  // 1 hour view token
  const token = createSignedToken({
    rowNumber,
    purpose: 'view',
    exp: Date.now() + 60 * 60 * 1000,
  });

  return {
    token,
    record: teacher,
  };
};

/** Re-verify personal number for editing privilege */
export const verifyTeacherForEdit = async (viewToken: string, rowNumber: number, personalNumberInput: string) => {
  // Validate active view session first
  const session = verifySignedToken(viewToken, 'view');
  if (session.rowNumber !== rowNumber) {
    throw new Error('Security session mismatch.');
  }

  const teacher = await getTeacherRecordByRow(rowNumber);
  if (!teacher) {
    throw new Error('Teacher record nahi mila.');
  }

  const normalizedInput = normalizePersonalNumber(personalNumberInput);
  const normalizedStored = normalizePersonalNumber(teacher.pid_no);

  if (!normalizedInput || !normalizedStored || normalizedInput !== normalizedStored) {
    throw new Error('Ghalat Personal Number (Password). Tarmeem (Edit) ke liye sahi personal number darj karein.');
  }

  // 20 minutes edit token
  const editToken = createSignedToken({
    rowNumber,
    purpose: 'edit',
    exp: Date.now() + 20 * 60 * 1000,
  });

  return { editToken };
};

/** Update teacher record in Google Sheet using edit token */
export const updateTeacherRecord = async (
  editToken: string,
  rowNumber: number,
  updatedData: Partial<TeacherRecordData>
) => {
  const session = verifySignedToken(editToken, 'edit');
  if (session.rowNumber !== rowNumber) {
    throw new Error('Unauthorized edit session.');
  }

  const current = await getTeacherRecordByRow(rowNumber);
  if (!current) {
    throw new Error('Record not found.');
  }

  const sheets = getGoogleSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  // Prepare updated row array matching TEACHER_HEADERS
  const updatedRow: string[] = [
    current.sr_no, // Keep SR No.
    updatedData.name !== undefined ? String(updatedData.name).trim() : current.name,
    updatedData.father_name !== undefined ? String(updatedData.father_name).trim() : current.father_name,
    updatedData.cnic_no !== undefined ? String(updatedData.cnic_no).trim() : current.cnic_no,
    updatedData.pid_no !== undefined ? String(updatedData.pid_no).trim() : current.pid_no,
    updatedData.place_of_appointment !== undefined ? String(updatedData.place_of_appointment).trim() : current.place_of_appointment,
    updatedData.domicile !== undefined ? String(updatedData.domicile).trim() : current.domicile,
    updatedData.date_of_offer_letter !== undefined ? String(updatedData.date_of_offer_letter).trim() : current.date_of_offer_letter,
    updatedData.date_of_apptt !== undefined ? String(updatedData.date_of_apptt).trim() : current.date_of_apptt,
    updatedData.qualification_at_apptt !== undefined ? String(updatedData.qualification_at_apptt).trim() : current.qualification_at_apptt,
    updatedData.requirement_as_per_rules !== undefined ? String(updatedData.requirement_as_per_rules).trim() : current.requirement_as_per_rules,
    updatedData.appointment_committee_members !== undefined ? String(updatedData.appointment_committee_members).trim() : current.appointment_committee_members,
    updatedData.other_relevant_info !== undefined ? String(updatedData.other_relevant_info).trim() : current.other_relevant_info,
    updatedData.newspaper_advertisement_and_date !== undefined ? String(updatedData.newspaper_advertisement_and_date).trim() : current.newspaper_advertisement_and_date,
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${TEACHER_SHEET_TAB}'!A${rowNumber}:N${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [updatedRow],
    },
  });

  return parseRowToRecord(updatedRow, rowNumber);
};
