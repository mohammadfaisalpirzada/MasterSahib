import type { FieldDef } from '@/app/components/govt-forms/CertificateBuilder';

/**
 * Employee fields shared by the Sindh education department certificates.
 * The keys are deliberately identical across forms so that a teacher who fills
 * them on one certificate finds them pre-filled on the next one.
 */
export const EMPLOYEE_FIELDS: FieldDef[] = [
  { key: 'title', label: 'Title', type: 'select', options: ['Mr.', 'Ms.', 'Mrs.'], defaultValue: 'Mr.' },
  { key: 'employeeName', label: 'Employee Name', placeholder: 'Full name as per service book' },
  { key: 'relation', label: 'Son / Daughter / Wife of', type: 'select', options: ['S/O', 'D/O', 'W/O'], defaultValue: 'S/O' },
  { key: 'fatherName', label: "Father's / Husband's Name" },
  { key: 'designation', label: 'Designation', placeholder: 'Junior School Teacher (JST)' },
  { key: 'bps', label: 'BPS (Pay Scale)', type: 'number', placeholder: '16' },
  { key: 'cnic', label: 'CNIC No.', type: 'cnic', placeholder: '#####-#######-#' },
  { key: 'personalNo', label: 'Personal / SAP / CS No.', placeholder: 'As shown on pay slip' },
  { key: 'schoolPosting', label: 'School / Office of Posting', wide: true, placeholder: 'Leave empty to use the letterhead school' },
  { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
  { key: 'dateOfAppointment', label: 'Date of First Appointment', type: 'date' },
];

export const PURPOSE_FIELD: FieldDef = {
  key: 'purpose',
  label: 'Purpose (certificate is required for)',
  wide: true,
  placeholder: 'Pension / NOC / Transfer / Promotion / Higher Study',
};

/* ---------------- Accountant General Sindh / payroll forms ---------------- */

import type { AgFieldDef } from '@/app/components/govt-forms/AgFormBuilder';

/** The "OFFICE OF THE / DDO CODE" block that heads almost every PAY form. */
export const AG_OFFICE_FIELDS: AgFieldDef[] = [
  { key: 'officeOfThe', label: 'Office of the', wide: true, section: 'Office', placeholder: 'Govt. Girls Secondary School, Nishtar Road Campus, Karachi' },
  { key: 'forMonth', label: 'For the month of', section: 'Office', placeholder: 'August' },
  { key: 'forYear', label: 'Year (20__)', section: 'Office', placeholder: '26' },
  { key: 'ddoCode', label: 'DDO Code (Cost Center)', type: 'number', section: 'Office', placeholder: '6 digits' },
  { key: 'ddoDescription', label: 'DDO Description', wide: true, section: 'Office' },
  { key: 'formDate', label: 'Form Date', type: 'date', section: 'Office' },
  { key: 'pageNo', label: 'Page No.', section: 'Office' },
];

/** Employee identity block shared by the PAY forms. */
export const AG_EMPLOYEE_FIELDS: AgFieldDef[] = [
  { key: 'personalNo', label: 'Personnel / SAP No.', type: 'number', section: 'Employee', placeholder: '8 digits' },
  { key: 'employeeName', label: 'Employee Name', wide: true, section: 'Employee' },
  { key: 'cnic', label: 'CNIC / National ID Card No.', type: 'cnic', section: 'Employee', placeholder: '#####-#######-#' },
  { key: 'bps', label: 'BPS / Grade (Pay Scale Group)', type: 'number', section: 'Employee', placeholder: '16' },
  { key: 'designation', label: 'Designation', section: 'Employee' },
  { key: 'periodOfService', label: 'Period of Service', section: 'Employee', placeholder: '15 Years 04 Months' },
];
