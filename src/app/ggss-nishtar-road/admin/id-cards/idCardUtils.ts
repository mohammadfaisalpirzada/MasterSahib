// Shared helpers for the Student ID Card generator
// (src/app/ggss-nishtar-road/admin/id-cards).
//
// Data source: this tool does NOT keep its own student list. It reads the
// exact same "Admission Forms 26-27" Google Sheet that already backs
// /ggss-nishtar-road/admin/admission-form/records (via the
// /api/ggss-admission-form/records API — see admissionRecords.ts for the
// header row). That sheet has no "blood_group" column yet, so Blood Group
// is offered as an editable-at-print-time field only (see StudentIdCard.tsx)
// rather than invented — add a blood_group column to ADMISSION_HEADER_ROW
// later if it should be saved permanently.

import QRCode from 'qrcode';
import { buildAdmissionVerifyUrl } from '../admission-form/AdmissionFormPrintView';

export type AdmissionRecord = Record<string, string>;

// Which colour template a card prints on — blue for Boys, pink for Girls.
export type CardGender = 'boys' | 'girls';

export type IdCardData = {
  rowNumber: string;
  name: string;
  fatherName: string;
  grNo: string;
  rollNo: string;
  studentClass: string;
  dob: string;
  address: string;
  emergencyContact: string;
  photoSrc: string; // '' when no photo is on file for this student
  qrDataUrl: string; // '' until generateQrDataUrl() resolves
  gender: CardGender;
};

// Read straight off the admission form's own "Gender" field
// (Male/Female — see ADMISSION_HEADER_ROW in admissionRecords.ts) so the
// right template is picked automatically, no manual per-student choice.
// Defaults to girls only when the field is genuinely blank on an older
// record saved before this column existed.
export const resolveGender = (record: AdmissionRecord): CardGender =>
  String(record.gender || '').trim().toLowerCase().startsWith('m') ? 'boys' : 'girls';

// D.O.B is stored as free text on the admission form (whatever the office
// typed) — pass it through as-is rather than trying to re-parse/reformat
// a value we can't guarantee the shape of.
export const formatDob = (value: string): string => String(value || '').trim();

// picture_base64 is stored without the "data:image/..." prefix (see
// admission-form/imageUtils.ts) — add it back for use in an <img src>.
export const resolvePhotoSrc = (record: AdmissionRecord): string => {
  const raw = record.picture_base64 || '';
  if (!raw) return '';
  return raw.startsWith('data:') ? raw : `data:image/jpeg;base64,${raw}`;
};

// Prefer father's cell (primary contact on the admission form), then
// guardian, then whatsapp, then mother's cell.
export const resolveEmergencyContact = (record: AdmissionRecord): string =>
  record.father_cell || record.guardian_cell || record.whatsapp_no || record.mother_cell || '';

export const getInitials = (name: string): string => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');
};

// Same QR as the admission form itself (AdmissionFormPrintView.tsx) —
// reuses its exact verify-URL builder and QRCode.toDataURL options, so the
// ID card's QR is not a different/new code: scanning either one opens the
// same admin verification page for that student's row.
export const generateQrDataUrl = async (record: AdmissionRecord): Promise<string> => {
  const verifyUrl = buildAdmissionVerifyUrl(record.row_number);
  if (!verifyUrl) return '';
  try {
    return await QRCode.toDataURL(verifyUrl, { width: 180, margin: 0, errorCorrectionLevel: 'M' });
  } catch {
    return '';
  }
};

export const recordToCardData = (record: AdmissionRecord, qrDataUrl: string): IdCardData => ({
  rowNumber: record.row_number || '',
  name: record.student_name || '',
  fatherName: record.father_name || '',
  grNo: record.gr_no || '',
  rollNo: record.roll_no || '',
  studentClass: record.admission_class || '',
  dob: formatDob(record.dob || ''),
  address: record.address || '',
  emergencyContact: resolveEmergencyContact(record),
  photoSrc: resolvePhotoSrc(record),
  qrDataUrl,
  gender: resolveGender(record),
});

// Default "current" academic session label, e.g. "2026-2027" — schools here
// run roughly April/August to the next year, so anything from mid-year
// onward is treated as the start of the next session.
export const defaultSessionLabel = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const startYear = month >= 3 ? year : year - 1; // April (3) onward -> current year starts the session
  return `${startYear}-${startYear + 1}`;
};

export const formatIssueDate = (date: Date = new Date()): string =>
  date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
