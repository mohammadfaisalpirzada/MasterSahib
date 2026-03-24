import { NextResponse } from 'next/server';
import { getQuizRowsFromSheet, updateQuizRowInSheet } from '@/app/lib/googleSheets';
import { getQuizSheetConfigForProgram } from '@/app/lib/quizSheets';

type StaffRecord = {
  sno: number;
  name: string;
  fatherName: string;
  cnic: string;
  designation: string;
  bps: string;
  placeOfPosting: string;
  contactNo: string;
  ibanNo: string;
  pid: string;
};

type StaffRecordWithRow = StaffRecord & {
  rowNumber: number;
};

const STAFF_TAB_NAME = process.env.TEACHERS_DATA_SHEET_TAB?.trim() || 'TeachersData';
const STAFF_COLUMN_RANGE = 'A:J';
const DEFAULT_PROGRAM_NAME = 'peace international school';

const toSheetRange = (sheetName: string, columnRange = STAFF_COLUMN_RANGE) => {
  const escaped = sheetName.replace(/'/g, "''");
  return `'${escaped}'!${columnRange}`;
};

const toKey = (value: string, index: number) => {
  const base = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return base || `column_${index + 1}`;
};

const toStringValue = (value: unknown) => String(value ?? '').trim();

const sanitizePhone = (value: string) => {
  const raw = value.replace(/\s+/g, '').trim();

  if (!raw || raw === '-') return '-';
  if (raw.startsWith('+923')) return raw;
  if (raw.startsWith('923')) return `+${raw}`;
  if (raw.startsWith('03')) return `+92${raw.slice(1)}`;
  if (raw.startsWith('3')) return `+92${raw}`;
  return raw;
};

const normalizeStaffRecord = (record: StaffRecord): StaffRecord => ({
  ...record,
  contactNo: sanitizePhone(record.contactNo),
});

const recordFromArrayRow = (row: string[]): StaffRecord => {
  return normalizeStaffRecord({
    sno: Number(row[0] ?? 0) || 0,
    name: toStringValue(row[1]),
    fatherName: toStringValue(row[2]),
    cnic: toStringValue(row[3]),
    designation: toStringValue(row[4]),
    bps: toStringValue(row[5]),
    placeOfPosting: toStringValue(row[6]),
    contactNo: toStringValue(row[7]),
    ibanNo: toStringValue(row[8]),
    pid: toStringValue(row[9]),
  });
};

const recordFromItem = (item: Record<string, string>, fallbackSno: number): StaffRecord => {
  return normalizeStaffRecord({
    sno: Number(item.sno || item.serial_no || item.serial || fallbackSno) || fallbackSno,
    name: toStringValue(item.name),
    fatherName: toStringValue(item.father_name || item.fathername),
    cnic: toStringValue(item.cnic),
    designation: toStringValue(item.designation),
    bps: toStringValue(item.bps),
    placeOfPosting: toStringValue(item.place_of_posting || item.placeofposting),
    contactNo: toStringValue(item.contact_no || item.contact_number || item.contactno),
    ibanNo: toStringValue(item.iban_no || item.iban || item.ibanno),
    pid: toStringValue(item.pid),
  });
};

const parseStaffRows = (rows: string[][]) => {
  if (!rows.length) {
    return [] as StaffRecordWithRow[];
  }

  const headerKeys = rows[0].map((header, index) => toKey(String(header ?? ''), index));
  const hasHeader = headerKeys.includes('name') && headerKeys.includes('pid');

  if (!hasHeader) {
    return rows
      .map((row, index) => ({
        ...recordFromArrayRow(row),
        rowNumber: index + 1,
      }))
      .filter((record) => record.name && record.pid);
  }

  return rows
    .slice(1)
    .map((row, index) => {
      const item: Record<string, string> = {};
      headerKeys.forEach((key, colIndex) => {
        item[key] = toStringValue(row[colIndex]);
      });

      return {
        ...recordFromItem(item, index + 1),
        rowNumber: index + 2,
      };
    })
    .filter((record) => record.name && record.pid);
};

const toRowValues = (record: StaffRecord) => {
  return [
    String(record.sno || ''),
    record.name,
    record.fatherName,
    record.cnic,
    record.designation,
    record.bps,
    record.placeOfPosting,
    sanitizePhone(record.contactNo),
    record.ibanNo,
    record.pid,
  ];
};

const editableKeys: Array<keyof StaffRecord> = [
  'fatherName',
  'cnic',
  'designation',
  'bps',
  'placeOfPosting',
  'contactNo',
  'ibanNo',
];

const getSheetConfig = (programName?: string) => {
  const config = getQuizSheetConfigForProgram(programName || DEFAULT_PROGRAM_NAME);

  if (!config && !process.env.GOOGLE_QUIZ_SPREADSHEET_ID) {
    throw new Error('Missing spreadsheet mapping for teachers data. Configure quizSheets.ts or GOOGLE_QUIZ_SPREADSHEET_ID.');
  }

  return config;
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const programName = url.searchParams.get('programName') || DEFAULT_PROGRAM_NAME;
    const sheetConfig = getSheetConfig(programName);

    const rows = await getQuizRowsFromSheet({
      spreadsheetId: sheetConfig?.spreadsheetId,
      range: toSheetRange(STAFF_TAB_NAME),
    });

    const items = parseStaffRows(rows as string[][]).map(({ rowNumber: _rowNumber, ...record }) => record);

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load teachers data.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      sno?: number;
      pid?: string;
      programName?: string;
      updates?: Partial<StaffRecord>;
    };

    const sno = Number(body.sno || 0) || 0;
    const pid = toStringValue(body.pid);
    if (!sno || !pid) {
      return NextResponse.json({ success: false, message: 'sno and pid are required.' }, { status: 400 });
    }

    const sheetConfig = getSheetConfig(body.programName);

    const rows = await getQuizRowsFromSheet({
      spreadsheetId: sheetConfig?.spreadsheetId,
      range: toSheetRange(STAFF_TAB_NAME),
    });

    const records = parseStaffRows(rows as string[][]);
    const target = records.find((record) => record.sno === sno);

    if (!target) {
      return NextResponse.json({ success: false, message: 'Record not found.' }, { status: 404 });
    }

    if (target.pid !== pid) {
      return NextResponse.json({ success: false, message: 'Incorrect PID. Update not allowed.' }, { status: 401 });
    }

    const nextRecord: StaffRecord = { ...target };

    editableKeys.forEach((key) => {
      const nextValue = body.updates?.[key];
      if (typeof nextValue === 'string') {
        nextRecord[key] = nextValue.trim() as never;
      }
    });

    await updateQuizRowInSheet({
      spreadsheetId: sheetConfig?.spreadsheetId,
      range: toSheetRange(STAFF_TAB_NAME, `A${target.rowNumber}:J${target.rowNumber}`),
      values: toRowValues(nextRecord),
    });

    return NextResponse.json({
      success: true,
      item: normalizeStaffRecord(nextRecord),
      message: 'Record updated successfully.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update teacher record.';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
