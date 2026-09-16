import 'server-only';

export const ADMISSION_TAB_NAME = 'Admission Forms 26-27';

export const ADMISSION_HEADER_ROW = [
  'sr_no',
  'roll_no',
  'gr_no',
  'student_name',
  'dob',
  'dob_words',
  'nationality',
  'surname',
  'religion',
  'previous_class',
  'last_school',
  'leaving_reason',
  'leaving_date',
  'admission_class',
  'admission_date',
  'nadra_status',
  'b_form_no',
  'address',
  'father_name',
  'father_cnic',
  'father_qualification',
  'father_occupation',
  'company_details',
  'whatsapp_no',
  'mother_name',
  'mother_cnic',
  'mother_cell',
  'office_class_admitted',
  'office_admission_date',
  'campus_head_sign',
  'academic_incharge_sign',
  'prepared_by',
  'prepared_sign',
  'office_date',
  'picture_base64',
  'submitted_at',
  'father_cell',
  'guardian_cell',
  'academic_group',
  'elective_subject',
] as const;

export const resolveAdmissionSpreadsheetId = (): string => {
  const raw =
    process.env.GGSS_STUDENT_RECORD_SPREADSHEET_ID?.trim() ||
    process.env.GGSS_STAFF_SPREADSHEET_ID?.trim() ||
    process.env.GOOGLE_QUIZ_SPREADSHEET_ID?.trim() ||
    '';

  if (!raw) {
    throw new Error('Missing required spreadsheet id. Set GGSS_STUDENT_RECORD_SPREADSHEET_ID or GGSS_STAFF_SPREADSHEET_ID.');
  }

  const match = raw.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match?.[1] || raw;
};

export const toQuotedAdmissionSheetName = (sheetName: string = ADMISSION_TAB_NAME) => {
  const escaped = sheetName.replace(/'/g, "''");
  return `'${escaped}'`;
};

// Converts a 0-based column index to a spreadsheet column letter (0 -> A, 25 -> Z, 26 -> AA, ...).
export const toSheetColumnLabel = (index: number) => {
  let value = index + 1;
  let label = '';
  while (value > 0) {
    const remainder = (value - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    value = Math.floor((value - 1) / 26);
  }
  return label;
};
