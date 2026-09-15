'use client';

import CertificateBuilder, { Fill, longDate, type CertificateConfig } from '@/app/components/govt-forms/CertificateBuilder';
import { EMPLOYEE_FIELDS, PURPOSE_FIELD } from '@/app/lib/govtFormFields';

const config: CertificateConfig = {
  slug: 'no-inquiry-certificate',
  pageTitle: 'No Inquiry / No Enquiry Certificate',
  pageIntro:
    'The No Inquiry certificate submitted by Sindh education department employees with pension, NOC, promotion and transfer cases — confirming that no departmental inquiry or disciplinary proceeding is pending. Fill the details and print a signature-ready A4 page.',
  certificateHeading: 'No Inquiry Certificate',
  certificateSubHeading: '(No Departmental / Disciplinary Proceedings Pending)',
  fields: [
    ...EMPLOYEE_FIELDS,
    { key: 'serviceFrom', label: 'Service period — From', type: 'date' },
    { key: 'serviceTo', label: 'Service period — To', type: 'date', hint: 'Leave empty for "till date"' },
    PURPOSE_FIELD,
  ],
  body: (v) => (
    <>
      <p>
        Certified that <Fill value={[v.title, v.employeeName].filter(Boolean).join(' ')} width={200} />{' '}
        <Fill value={v.relation} width={40} /> <Fill value={v.fatherName} width={180} />, holding CNIC No.{' '}
        <Fill value={v.cnic} width={150} />, Personal / SAP No. <Fill value={v.personalNo} width={110} />, is / was
        serving as <Fill value={v.designation} width={180} /> (BPS-<Fill value={v.bps} width={30} />) at{' '}
        <Fill value={v.schoolPosting} width={230} /> with effect from <Fill value={longDate(v.serviceFrom)} width={140} />{' '}
        to <Fill value={longDate(v.serviceTo) || 'till date'} width={140} />.
      </p>
      <p>
        It is certified that no departmental inquiry or disciplinary proceeding under the Sindh Government Servants
        (Efficiency &amp; Discipline) Rules is pending against him / her, nor is any such inquiry contemplated by this
        office. No case is pending against him / her before any Court of Law, Anti-Corruption Establishment or National
        Accountability Bureau to the best of the knowledge of this office.
      </p>
      <p>
        Further certified that no major or minor penalty has been imposed upon him / her during the above period, and
        his / her conduct, character and performance of duties throughout remained satisfactory.
      </p>
      <p>
        This certificate is issued on his / her own request for the purpose of{' '}
        <Fill value={v.purpose} width={230} />.
      </p>
    </>
  ),
  footerNotes: [
    'Note: This certificate is valid only when signed and stamped by the competent authority.',
    'Issued on the basis of the service record available in this office as on the date of issue.',
  ],
};

export default function NoInquiryCertificatePage() {
  return <CertificateBuilder config={config} />;
}
