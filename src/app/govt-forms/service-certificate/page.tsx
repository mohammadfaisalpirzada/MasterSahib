'use client';

import CertificateBuilder, { Fill, longDate, type CertificateConfig } from '@/app/components/govt-forms/CertificateBuilder';
import { EMPLOYEE_FIELDS, PURPOSE_FIELD } from '@/app/lib/govtFormFields';

const config: CertificateConfig = {
  slug: 'service-certificate',
  pageTitle: 'Service / Experience Certificate',
  pageIntro:
    'The service certificate that states a teacher’s designation, BPS and complete period of service — required for higher studies, promotion cases, foreign applications and job changes. Fill the details and print a signature-ready A4 page.',
  certificateHeading: 'Service Certificate',
  certificateSubHeading: '(Experience Certificate — Teaching Staff)',
  fields: [
    ...EMPLOYEE_FIELDS,
    { key: 'serviceFrom', label: 'Service period — From', type: 'date' },
    { key: 'serviceTo', label: 'Service period — To', type: 'date', hint: 'Leave empty for "till date"' },
    { key: 'totalService', label: 'Total service (years / months)', placeholder: '15 Years 04 Months' },
    { key: 'subjectsTaught', label: 'Subjects / Classes taught', wide: true, placeholder: 'Mathematics & Physics, Classes IX–X' },
    { key: 'employmentStatus', label: 'Employment Status', type: 'select', options: ['Regular / Permanent', 'Contract', 'Adhoc', 'Officiating'], defaultValue: 'Regular / Permanent' },
    { key: 'performance', label: 'Performance / Conduct', type: 'select', options: ['Excellent', 'Very Good', 'Good', 'Satisfactory'], defaultValue: 'Very Good' },
    PURPOSE_FIELD,
  ],
  body: (v) => (
    <>
      <p className="font-bold">To Whom It May Concern</p>
      <p>
        Certified that <Fill value={[v.title, v.employeeName].filter(Boolean).join(' ')} width={200} />{' '}
        <Fill value={v.relation} width={40} /> <Fill value={v.fatherName} width={180} />, holding CNIC No.{' '}
        <Fill value={v.cnic} width={150} /> and Personal / SAP No. <Fill value={v.personalNo} width={110} />, served in
        this institution as <Fill value={v.designation} width={180} /> (BPS-<Fill value={v.bps} width={30} />) on{' '}
        <Fill value={v.employmentStatus} width={150} /> basis.
      </p>
      <p>
        His / Her period of service is from <Fill value={longDate(v.serviceFrom)} width={140} /> to{' '}
        <Fill value={longDate(v.serviceTo) || 'till date'} width={140} />, making a total service of{' '}
        <Fill value={v.totalService} width={150} /> at <Fill value={v.schoolPosting} width={220} />.
      </p>
      <p>
        During this period he / she taught <Fill value={v.subjectsTaught} width={260} /> and also performed the
        additional duties assigned by the undersigned from time to time.
      </p>
      <p>
        His / Her professional performance, conduct and punctuality throughout remained{' '}
        <Fill value={v.performance} width={130} />, and nothing adverse is on record against him / her in this office.
      </p>
      <p>
        This certificate is issued on his / her own request for the purpose of{' '}
        <Fill value={v.purpose} width={230} />.
      </p>
    </>
  ),
  footerNotes: [
    'Note: This certificate is valid only when signed and stamped by the competent authority.',
    'Issued on the basis of the service record available in this office on the date of issue.',
  ],
};

export default function ServiceCertificatePage() {
  return <CertificateBuilder config={config} />;
}
