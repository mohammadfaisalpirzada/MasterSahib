'use client';

import CertificateBuilder, { Fill, longDate, type CertificateConfig } from '@/app/components/govt-forms/CertificateBuilder';

const ROWS: Array<[string, string]> = [
  ['GR No.', 'grNo'],
  ['Name of Student', 'studentName'],
  ["Father's Name", 'stFatherName'],
  ['Religion / Caste', 'stReligion'],
  ['B-Form / CRC No.', 'bFormNo'],
  ['Date of Birth (in figures)', 'dobFigures'],
  ['Date of Birth (in words)', 'dobWords'],
  ['Date of Admission', 'dateOfAdmission'],
  ['Class in which admitted', 'admittedClass'],
  ['Date of Leaving School', 'dateOfLeaving'],
  ['Class in which studying at the time of leaving', 'leavingClass'],
  ['Whether qualified for promotion', 'qualifiedForPromotion'],
  ['Conduct', 'studentConduct'],
  ['Reason for leaving the school', 'reasonForLeaving'],
  ['Any fee / dues outstanding', 'duesOutstanding'],
  ['Remarks', 'remarks'],
];

const config: CertificateConfig = {
  slug: 'school-leaving-certificate',
  pageTitle: 'School Leaving Certificate (TC)',
  pageIntro:
    'The transfer / school leaving certificate issued when a student leaves the school — required for admission anywhere else. Fill the GR record and print a signature-ready A4 page.',
  certificateHeading: 'School Leaving Certificate',
  certificateSubHeading: '(Transfer Certificate)',
  fields: [
    { key: 'grNo', label: 'GR No.' },
    { key: 'studentName', label: 'Name of Student' },
    { key: 'stFatherName', label: "Father's Name" },
    { key: 'stReligion', label: 'Religion / Caste', defaultValue: 'Islam' },
    { key: 'bFormNo', label: 'B-Form / CRC No.', type: 'cnic' },
    { key: 'dobFigures', label: 'Date of Birth', type: 'date' },
    { key: 'dobWords', label: 'Date of Birth (in words)', wide: true, placeholder: 'Fifteenth March Two Thousand Twelve' },
    { key: 'dateOfAdmission', label: 'Date of Admission', type: 'date' },
    { key: 'admittedClass', label: 'Class in which admitted' },
    { key: 'dateOfLeaving', label: 'Date of Leaving School', type: 'date' },
    { key: 'leavingClass', label: 'Class at the time of leaving' },
    { key: 'qualifiedForPromotion', label: 'Qualified for promotion', type: 'select', options: ['Yes', 'No'], defaultValue: 'Yes' },
    { key: 'studentConduct', label: 'Conduct', type: 'select', options: ['Excellent', 'Very Good', 'Good', 'Satisfactory'], defaultValue: 'Good' },
    { key: 'reasonForLeaving', label: 'Reason for leaving the school', wide: true, placeholder: 'On parent request / Shifting of residence' },
    { key: 'duesOutstanding', label: 'Any fee / dues outstanding', defaultValue: 'Nil' },
    { key: 'remarks', label: 'Remarks', wide: true },
  ],
  body: (v) => {
    const display = (key: string) =>
      ['dobFigures', 'dateOfAdmission', 'dateOfLeaving'].includes(key) ? longDate(v[key]) : v[key];
    return (
      <>
        <table className="w-full border-collapse text-[13px]">
          <tbody>
            {ROWS.map(([label, key], i) => (
              <tr key={key}>
                <td className="border border-black px-2 py-[5px]" style={{ width: '8%', textAlign: 'center' }}>{i + 1}</td>
                <td className="border border-black px-2 py-[5px]" style={{ width: '45%' }}>{label}</td>
                <td className="border border-black px-2 py-[5px] font-bold" style={{ height: 26 }}>{display(key) || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-5">
          Certified that the above particulars have been taken from the General Register of this school and are correct
          to the best of the knowledge of the undersigned.
        </p>
        <p>
          This certificate is issued on the request of the parent / guardian of{' '}
          <Fill value={v.studentName} width={200} /> for the purpose of admission elsewhere.
        </p>
      </>
    );
  },
  footerNotes: [
    'Note: This certificate is valid only when signed and stamped by the competent authority.',
    'A duplicate leaving certificate is issued only on a written application stating the loss of the original.',
  ],
};

export default function SchoolLeavingCertificatePage() {
  return <CertificateBuilder config={config} />;
}
