/**
 * Govt Educational Forms — a separate section from Educational Resources.
 *
 * Purpose: forms that Sindh government school teachers and office staff actually
 * need on paper (admission form, no dues, bonafide certificate, character
 * certificate, leave applications, etc.). The teacher fills in a few details
 * once and gets a clean, print-ready A4 PDF.
 */

export type GovtFormItem = {
  title: string;
  description: string;
  status: 'Ready' | 'Coming Soon';
  href?: string;
  showInNavbar?: boolean;
  addedOn?: string;
  audience?: 'school-office' | 'employee' | 'ag-sindh' | 'teacher' | 'student' | 'parents';
  icon?: string;
  color?: string;
  /** ASCII-safe description used on the social share card, when the main one contains Urdu. */
  shareDescription?: string;
};

export const govtFormItems: GovtFormItem[] = [
  {
    title: 'School Admission Form',
    description:
      'Printable A4 admission form for any school. Add your school name and SEMIS code, then print or save as PDF.',
    status: 'Ready',
    href: '/govt-forms/admission-form',
    addedOn: '2026-08-31',
    audience: 'school-office',
    icon: '🏫',
    color: 'from-sky-500 to-blue-600',
  },
  {
    title: 'No Dues Certificate (Bay-Baqi)',
    description:
      'Bay-Baqi clearance for a Sindh education department employee — required for pension, transfer, NOC and final settlement.',
    status: 'Ready',
    href: '/govt-forms/no-dues-certificate',
    addedOn: '2026-09-01',
    audience: 'employee',
    icon: '🧾',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'No Inquiry Certificate',
    description:
      'Certifies that no departmental inquiry or disciplinary proceeding is pending against the employee. Needed with pension, NOC and promotion cases.',
    status: 'Ready',
    href: '/govt-forms/no-inquiry-certificate',
    addedOn: '2026-09-01',
    audience: 'employee',
    icon: '🛡️',
    color: 'from-violet-500 to-indigo-600',
  },
  {
    title: 'Bonafide Employee Certificate',
    description:
      'Proof that the holder is a regular government employee of the School Education & Literacy Department — for banks, embassies and universities.',
    status: 'Ready',
    href: '/govt-forms/bonafide-certificate',
    addedOn: '2026-09-01',
    audience: 'employee',
    icon: '📜',
    color: 'from-amber-500 to-orange-600',
  },
  {
    title: 'Bonafide Certificate (Student)',
    description:
      'Proof that a child is a bonafide student — for scholarships, bank accounts, NADRA and concession forms.',
    status: 'Ready',
    href: '/govt-forms/student-bonafide-certificate',
    showInNavbar: false,
    addedOn: '2026-09-01',
    audience: 'student',
    icon: '🎒',
    color: 'from-pink-500 to-rose-600',
  },
  {
    title: 'Character Certificate',
    description:
      'Standard character certificate for a leaving or passing-out student — for admission, board forms and job applications.',
    status: 'Ready',
    href: '/govt-forms/character-certificate',
    showInNavbar: false,
    addedOn: '2026-09-01',
    audience: 'student',
    icon: '⭐',
    color: 'from-yellow-500 to-amber-600',
  },
  {
    title: 'School Leaving Certificate (TC)',
    description:
      'Transfer certificate with the full GR record — date of admission, class, conduct and reason for leaving.',
    status: 'Ready',
    href: '/govt-forms/school-leaving-certificate',
    showInNavbar: false,
    addedOn: '2026-09-01',
    audience: 'school-office',
    icon: '🚪',
    color: 'from-sky-600 to-cyan-700',
  },
  {
    title: 'Leave Application (Teacher)',
    description:
      'Casual, earned, medical or maternity leave application addressed to the competent authority through proper channel.',
    status: 'Ready',
    href: '/govt-forms/teacher-leave-application',
    addedOn: '2026-09-01',
    audience: 'teacher',
    icon: '📝',
    color: 'from-indigo-500 to-blue-600',
  },
  {
    title: 'Service / Experience Certificate',
    description:
      'Service certificate stating a teacher’s designation, BPS, subjects taught and complete period of service.',
    status: 'Ready',
    href: '/govt-forms/service-certificate',
    showInNavbar: false,
    addedOn: '2026-09-01',
    audience: 'teacher',
    icon: '🎖️',
    color: 'from-purple-500 to-violet-600',
  },
  {
    title: 'Employee Master File Creation Form',
    description:
      'AG Sindh PAY01 — creates a new employee in the payroll and GP Fund system. Prints as four A4 pages including the required-documents checklist.',
    status: 'Ready',
    href: '/govt-forms/pay01-employee-master-file',
    addedOn: '2026-09-01',
    audience: 'ag-sindh',
    icon: '🗂️',
    color: 'from-blue-600 to-indigo-700',
  },
  {
    title: 'Payroll Amendment — Single Employee',
    description:
      'AG Sindh PAY02 — change one employee’s payroll data, allowances, deductions or salary start/stop. Prints A4 landscape.',
    status: 'Ready',
    href: '/govt-forms/pay02-payroll-amendment',
    showInNavbar: false,
    addedOn: '2026-09-01',
    audience: 'ag-sindh',
    icon: '✏️',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    title: 'Payroll Amendment — Multiple Employees',
    description:
      'AG Sindh PAY03 — the same amendment for several employees on one sheet. Prints A4 landscape.',
    status: 'Ready',
    href: '/govt-forms/pay03-payroll-amendment-multiple',
    showInNavbar: false,
    addedOn: '2026-09-01',
    audience: 'ag-sindh',
    icon: '📋',
    color: 'from-teal-500 to-cyan-600',
  },
  {
    title: 'Temporary GP Fund Loan / Advance',
    description:
      'AG Sindh PAY05 — refundable loan against your GP Fund, with interest and recovery details.',
    status: 'Ready',
    href: '/govt-forms/pay05-temporary-gp-fund-loan',
    showInNavbar: false,
    addedOn: '2026-09-01',
    audience: 'ag-sindh',
    icon: '💵',
    color: 'from-lime-500 to-emerald-600',
  },
  {
    title: 'Permanent GP Fund Advance',
    description:
      'AG Sindh PAY06 — non-refundable (permanent) advance from your GP Fund balance.',
    status: 'Ready',
    href: '/govt-forms/pay06-permanent-gp-fund-advance',
    showInNavbar: false,
    addedOn: '2026-09-01',
    audience: 'ag-sindh',
    icon: '🏦',
    color: 'from-green-600 to-teal-700',
  },
  {
    title: 'AG Sindh Vendor Creation Form',
    description:
      'Register an employee, pensioner, supplier or institution in the AG Sindh payment system against a bank account.',
    status: 'Ready',
    href: '/govt-forms/ag-vendor-creation',
    showInNavbar: false,
    addedOn: '2026-09-01',
    audience: 'ag-sindh',
    icon: '🏷️',
    color: 'from-orange-500 to-red-600',
  },
  {
    title: 'Pension Direct Credit Option Form',
    description:
      'Option form for drawing pension directly into a bank account, with the bank verification block.',
    status: 'Ready',
    href: '/govt-forms/pension-direct-credit-option',
    addedOn: '2026-09-01',
    audience: 'ag-sindh',
    icon: '💳',
    color: 'from-fuchsia-500 to-purple-600',
  },
  {
    title: 'Pension Indemnity Bond',
    description:
      'The indemnity bond submitted to the bank along with the pension direct-credit option form.',
    status: 'Ready',
    href: '/govt-forms/pension-indemnity-bond',
    showInNavbar: false,
    addedOn: '2026-09-01',
    audience: 'ag-sindh',
    icon: '🖋️',
    color: 'from-rose-500 to-pink-600',
  },
  {
    title: 'Pensioner Fingerprints Form (Urdu)',
    description:
      'پینشنرز انگلیوں اور انگوٹھوں کے نشانات — both hands plus the witness attestation (تصدیق نامہ) for a pension case.',
    shareDescription:
      'Fingerprints of both hands plus the witness attestation, for a Sindh government pension case. Free A4 print.',
    status: 'Ready',
    href: '/govt-forms/pensioner-fingerprints',
    showInNavbar: false,
    addedOn: '2026-09-01',
    audience: 'ag-sindh',
    icon: '👍',
    color: 'from-stone-500 to-amber-700',
  },
  {
    title: 'Casual / Earned Leave Order',
    description:
      'The office ORDER sanctioning a teacher’s casual, medical or earned leave, issued by the Taluka / District Education Officer.',
    status: 'Ready',
    href: '/govt-forms/casual-leave-order',
    showInNavbar: false,
    addedOn: '2026-09-02',
    audience: 'school-office',
    icon: '🗓️',
    color: 'from-emerald-500 to-green-600',
  },
  {
    title: 'Leave Application Form (Earned / Medical)',
    description:
      'The official departmental leave proforma — applicant’s half plus the Report of the Head of the Department.',
    status: 'Ready',
    href: '/govt-forms/leave-application-form',
    showInNavbar: false,
    addedOn: '2026-09-02',
    audience: 'teacher',
    icon: '📄',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    title: 'Time Scale Application Form',
    description:
      'Application for the incentive of a higher grade on the basis of Time Scale, for P.S.T. and equivalent grades.',
    status: 'Ready',
    href: '/govt-forms/time-scale-application',
    addedOn: '2026-09-02',
    audience: 'employee',
    icon: '📈',
    color: 'from-cyan-500 to-sky-600',
  },
  {
    title: 'Teaching Allowance Application',
    description:
      'Application for the qualification-based Teaching Allowance of Rs. 1000/= per month by virtue of holding B.Ed or higher.',
    status: 'Ready',
    href: '/govt-forms/teaching-allowance-application',
    addedOn: '2026-09-02',
    audience: 'teacher',
    icon: '💰',
    color: 'from-amber-500 to-yellow-600',
  },
  {
    title: 'Joining Report',
    description:
      'The joining report a newly appointed or transferred teacher submits on assuming duty, quoting the offer and endorsement orders.',
    status: 'Ready',
    href: '/govt-forms/joining-report',
    addedOn: '2026-09-02',
    audience: 'teacher',
    icon: '🚩',
    color: 'from-teal-500 to-emerald-600',
  },
  {
    title: 'NOC Request Application (Transfer)',
    description:
      'Application to another school’s head requesting a No Objection Certificate for transfer, with the appointment particulars.',
    status: 'Ready',
    href: '/govt-forms/noc-request-application',
    showInNavbar: false,
    addedOn: '2026-09-02',
    audience: 'teacher',
    icon: '🔁',
    color: 'from-violet-500 to-purple-600',
  },
  {
    title: 'Service Profile of Employee',
    description:
      'Complete service profile — personal data, academic and professional qualifications, full service record and trainings. Prints as two A4 pages.',
    status: 'Ready',
    href: '/govt-forms/service-profile-employee',
    addedOn: '2026-09-02',
    audience: 'employee',
    icon: '🗃️',
    color: 'from-slate-600 to-blue-700',
  },
  {
    title: 'Employees Data Verification Proforma',
    description:
      'The SELD proforma verifying an employee’s school, first appointment and current service data, signed by the DDO / HM and the employee.',
    status: 'Ready',
    href: '/govt-forms/employee-data-verification',
    addedOn: '2026-09-02',
    audience: 'school-office',
    icon: '✅',
    color: 'from-lime-600 to-green-700',
  },
  {
    title: 'Seniority List Inclusion Application',
    description:
      'Application to the DEO for inclusion in the seniority list, with the full service track and the attached-documents checklist.',
    status: 'Ready',
    href: '/govt-forms/seniority-inclusion-application',
    showInNavbar: false,
    addedOn: '2026-09-02',
    audience: 'employee',
    icon: '🏅',
    color: 'from-orange-500 to-amber-600',
  },
  {
    title: 'Medical Fitness Certificate',
    description:
      'The medical fitness certificate required at the time of a government appointment — item 7 on the PAY01 documents list.',
    status: 'Ready',
    href: '/govt-forms/medical-fitness-certificate',
    showInNavbar: false,
    addedOn: '2026-09-02',
    audience: 'employee',
    icon: '🩺',
    color: 'from-rose-500 to-red-600',
  },
];

const addedTimestamp = (item: GovtFormItem, index: number) => {
  if (item.addedOn) {
    const parsed = Date.parse(item.addedOn);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return index;
};

export const sortedGovtFormItems = govtFormItems
  .map((item, index) => ({ item, index }))
  .sort((a, b) => addedTimestamp(b.item, b.index) - addedTimestamp(a.item, a.index))
  .map(({ item }) => item);

export const govtFormNavLinks = sortedGovtFormItems
  .filter((item) => item.status === 'Ready' && item.href && item.href !== '#' && item.showInNavbar !== false)
  .map((item) => ({
    label: item.title,
    href: item.href as string,
    description: item.description,
  }));
