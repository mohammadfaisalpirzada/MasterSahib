'use client';

import CertificateBuilder, { Fill, longDate, type CertificateConfig } from '@/app/components/govt-forms/CertificateBuilder';

const config: CertificateConfig = {
  slug: 'character-certificate',
  pageTitle: 'Character Certificate',
  pageIntro:
    'The standard character certificate issued to a leaving or passing-out student — required for admission to the next institution, board forms and job applications. Fill the details and print a signature-ready A4 page.',
  certificateHeading: 'Character Certificate',
  fields: [
    { key: 'stTitle', label: 'Title', type: 'select', options: ['Mr.', 'Miss'], defaultValue: 'Mr.' },
    { key: 'studentName', label: 'Student Name' },
    { key: 'stRelation', label: 'Son / Daughter of', type: 'select', options: ['S/O', 'D/O'], defaultValue: 'S/O' },
    { key: 'stFatherName', label: "Father's Name" },
    { key: 'grNo', label: 'GR No.' },
    { key: 'bFormNo', label: 'B-Form / CRC No.', type: 'cnic' },
    { key: 'stDateOfBirth', label: 'Date of Birth', type: 'date' },
    { key: 'studyFrom', label: 'Studied in this school from', type: 'date' },
    { key: 'studyTo', label: 'Studied in this school up to', type: 'date' },
    { key: 'lastClass', label: 'Last Class Studied / Passed', placeholder: 'X (Matriculation)' },
    { key: 'studentConduct', label: 'Character & Conduct', type: 'select', options: ['Excellent', 'Very Good', 'Good', 'Satisfactory'], defaultValue: 'Good' },
    { key: 'activities', label: 'Co-curricular participation', wide: true, placeholder: 'Sports, debates, scouts — optional' },
    { key: 'purpose', label: 'Purpose (certificate is required for)', wide: true, placeholder: 'Further Studies / Admission / Employment' },
  ],
  body: (v) => (
    <>
      <p className="font-bold">To Whom It May Concern</p>
      <p>
        Certified that <Fill value={[v.stTitle, v.studentName].filter(Boolean).join(' ')} width={200} />{' '}
        <Fill value={v.stRelation} width={40} /> <Fill value={v.stFatherName} width={190} />, bearing GR No.{' '}
        <Fill value={v.grNo} width={90} />, B-Form / CRC No. <Fill value={v.bFormNo} width={150} /> and date of birth{' '}
        <Fill value={longDate(v.stDateOfBirth)} width={140} />, remained a student of this school from{' '}
        <Fill value={longDate(v.studyFrom)} width={140} /> to <Fill value={longDate(v.studyTo)} width={140} />.
      </p>
      <p>
        He / She studied up to class <Fill value={v.lastClass} width={150} /> in this institution. During his / her stay
        in the school his / her character and conduct remained{' '}
        <Fill value={v.studentConduct} width={120} />, and nothing adverse came to the notice of the undersigned.
      </p>
      <p>
        He / She also took part in <Fill value={v.activities} width={260} /> and behaved respectfully with the teachers
        and fellow students.
      </p>
      <p>
        This certificate is issued on his / her own request for the purpose of{' '}
        <Fill value={v.purpose} width={230} />. The school wishes him / her success in future life.
      </p>
    </>
  ),
  footerNotes: [
    'Note: This certificate is valid only when signed and stamped by the competent authority.',
    'Issued on the basis of the school record available on the date of issue.',
  ],
};

export default function CharacterCertificatePage() {
  return <CertificateBuilder config={config} />;
}
