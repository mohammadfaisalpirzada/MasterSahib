'use client';

import CertificateBuilder, { Fill, longDate, type CertificateConfig } from '@/app/components/govt-forms/CertificateBuilder';

const config: CertificateConfig = {
  slug: 'student-bonafide-certificate',
  pageTitle: 'Student Bonafide Certificate',
  pageIntro:
    'Official proof that a child is a bonafide student of your school — required for scholarships, bank accounts, NADRA, concession forms and admission to the next institution. Fill the details and print a signature-ready A4 page.',
  certificateHeading: 'Bonafide Certificate',
  certificateSubHeading: '(Student)',
  fields: [
    { key: 'stTitle', label: 'Title', type: 'select', options: ['Mr.', 'Miss'], defaultValue: 'Mr.' },
    { key: 'studentName', label: 'Student Name', placeholder: 'Full name as per B-Form' },
    { key: 'stRelation', label: 'Son / Daughter of', type: 'select', options: ['S/O', 'D/O'], defaultValue: 'S/O' },
    { key: 'stFatherName', label: "Father's Name" },
    { key: 'grNo', label: 'GR No.' },
    { key: 'rollNo', label: 'Roll No.' },
    { key: 'bFormNo', label: 'B-Form / CRC No.', type: 'cnic', placeholder: '#####-#######-#' },
    { key: 'stDateOfBirth', label: 'Date of Birth', type: 'date' },
    { key: 'studentClass', label: 'Present Class / Section', placeholder: 'IX-A' },
    { key: 'academicSession', label: 'Academic Session', placeholder: '2026 - 2027' },
    { key: 'dateOfAdmission', label: 'Date of Admission', type: 'date' },
    { key: 'studentConduct', label: 'Conduct', type: 'select', options: ['Excellent', 'Very Good', 'Good', 'Satisfactory'], defaultValue: 'Good' },
    { key: 'addressedTo', label: 'Certificate addressed to', wide: true, placeholder: 'To Whom It May Concern / Name of Bank / Institution' },
    { key: 'purpose', label: 'Purpose (certificate is required for)', wide: true, placeholder: 'Scholarship / Bank Account / NADRA / Admission' },
  ],
  body: (v) => (
    <>
      <p className="font-bold">{v.addressedTo || 'To Whom It May Concern'}</p>
      <p>
        Certified that <Fill value={[v.stTitle, v.studentName].filter(Boolean).join(' ')} width={200} />{' '}
        <Fill value={v.stRelation} width={40} /> <Fill value={v.stFatherName} width={190} />, bearing B-Form / CRC No.{' '}
        <Fill value={v.bFormNo} width={150} /> and date of birth <Fill value={longDate(v.stDateOfBirth)} width={140} />,
        is a bonafide student of this school.
      </p>
      <p>
        He / She is enrolled under GR No. <Fill value={v.grNo} width={90} /> and Roll No.{' '}
        <Fill value={v.rollNo} width={90} />, and is presently studying in class{' '}
        <Fill value={v.studentClass} width={110} /> during the academic session{' '}
        <Fill value={v.academicSession} width={140} />. He / She was admitted to this school on{' '}
        <Fill value={longDate(v.dateOfAdmission)} width={140} />.
      </p>
      <p>
        As per the record of this school, his / her attendance is regular and conduct is{' '}
        <Fill value={v.studentConduct} width={120} />.
      </p>
      <p>
        This certificate is issued on the request of the parent / guardian for the purpose of{' '}
        <Fill value={v.purpose} width={230} />.
      </p>
    </>
  ),
  footerNotes: [
    'Note: This certificate is valid only when signed and stamped by the competent authority.',
    'Issued on the basis of the school record available on the date of issue.',
  ],
};

export default function StudentBonafidePage() {
  return <CertificateBuilder config={config} />;
}
