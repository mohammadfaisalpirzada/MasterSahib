import 'server-only';
import {
  ensureSheetTabExists,
  getQuizRowsFromSheet,
  getQuizSheetTabs,
  getQuizSheetIdByTitle,
  appendQuizRowToSheet,
  updateQuizRowInSheet,
  deleteSheetRow,
} from '@/app/lib/googleSheets';
import { resolveAdmissionSpreadsheetId } from '@/app/lib/admissionRecords';

export const REPORT_CARDS_TAB_NAME = 'result card data';

export const REPORT_CARD_HEADER_ROW = [
  'record_id',
  'session',
  'exam_title',
  'exam_year_suffix',
  'student_class',
  'gr_no',
  'roll_no',
  'student_name',
  'father_name',
  'dob',
  'address',
  'english_max',
  'english_obt',
  'urdu_max',
  'urdu_obt',
  'social_pak_studies_max',
  'social_pak_studies_obt',
  'sindhi_max',
  'sindhi_obt',
  'islamiat_oral_max',
  'islamiat_oral_obt',
  'islamiat_written_max',
  'islamiat_written_obt',
  'islamiat_total_max',
  'islamiat_total_obt',
  'g_science_max',
  'g_science_obt',
  'mathematics_max',
  'mathematics_obt',
  'h_economics_max',
  'h_economics_obt',
  'arabic_drawing_max',
  'arabic_drawing_obt',
  'biology_computer_max',
  'biology_computer_obt',
  'physics_max',
  'physics_obt',
  'chemistry_max',
  'chemistry_obt',
  'grand_total_max',
  'grand_total_obt',
  'percentage',
  'grade',
  'rank',
  'result',
  'attendance',
  'conduct',
  'created_at',
  'updated_at',
] as const;

export type ReportCardRecordKey = typeof REPORT_CARD_HEADER_ROW[number];

export type ReportCardRowRecord = Record<ReportCardRecordKey | string, string> & {
  row_number?: string;
};

export const toQuotedReportSheetName = (sheetName: string = REPORT_CARDS_TAB_NAME) => {
  const escaped = sheetName.replace(/'/g, "''");
  return `'${escaped}'`;
};

// Generates a composite unique identity to prevent duplicate records for the same student + session + exam
export const buildRecordId = (
  session: string,
  examTitle: string,
  grNo: string,
  studentName: string,
): string => {
  const normSession = String(session || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const normExam = String(examTitle || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const normGr = String(grNo || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const normName = String(studentName || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  const studentIdentifier = normGr || normName || 'student';
  return `${normSession}_${normExam}_${studentIdentifier}`;
};

export const ensureReportCardSheetTab = async (spreadsheetId?: string) => {
  const targetSpreadsheetId = spreadsheetId || resolveAdmissionSpreadsheetId();
  await ensureSheetTabExists(REPORT_CARDS_TAB_NAME, [...REPORT_CARD_HEADER_ROW], {
    spreadsheetId: targetSpreadsheetId,
  });
};

export const fetchReportCardRows = async (options?: {
  spreadsheetId?: string;
  session?: string;
  examTitle?: string;
  studentClass?: string;
  search?: string;
}): Promise<ReportCardRowRecord[]> => {
  const spreadsheetId = options?.spreadsheetId || resolveAdmissionSpreadsheetId();
  await ensureReportCardSheetTab(spreadsheetId);

  const rawRows = await getQuizRowsFromSheet({
    spreadsheetId,
    range: `${toQuotedReportSheetName()}!A:BA`,
  });

  if (!rawRows || rawRows.length <= 1) {
    return [];
  }

  const header = (rawRows[0] || []).map((c) => String(c ?? '').trim());
  const records: ReportCardRowRecord[] = [];

  for (let i = 1; i < rawRows.length; i += 1) {
    const row = rawRows[i];
    if (!row || !row.length) continue;

    const record: ReportCardRowRecord = { row_number: String(i + 1) };
    header.forEach((key, colIdx) => {
      if (key) {
        record[key] = String(row[colIdx] ?? '').trim();
      }
    });

    // Skip empty ghost rows
    if (!record.student_name && !record.gr_no && !record.record_id) {
      continue;
    }

    // Filter by session if requested
    if (options?.session) {
      const s1 = String(record.session || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const s2 = String(options.session || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (s1 && s2 && s1 !== s2) continue;
    }

    // Filter by exam title if requested
    if (options?.examTitle) {
      const e1 = String(record.exam_title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const e2 = String(options.examTitle || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (e1 && e2 && !e1.includes(e2) && !e2.includes(e1)) continue;
    }

    // Filter by class if requested
    if (options?.studentClass) {
      const c1 = String(record.student_class || '').trim().toLowerCase();
      const c2 = String(options.studentClass || '').trim().toLowerCase();
      if (c1 && c2 && c1 !== c2) continue;
    }

    // Filter by general search term if requested
    if (options?.search) {
      const q = options.search.trim().toLowerCase();
      const matches = [
        record.student_name,
        record.father_name,
        record.gr_no,
        record.roll_no,
        record.student_class,
      ].some((val) => String(val || '').toLowerCase().includes(q));
      if (!matches) continue;
    }

    records.push(record);
  }

  return records;
};

// Converts 0-indexed column number to column letters (0 -> A, 26 -> AA, etc.)
export const toColLetter = (index: number): string => {
  let temp = index + 1;
  let letter = '';
  while (temp > 0) {
    const mod = (temp - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    temp = Math.floor((temp - 1) / 26);
  }
  return letter;
};
