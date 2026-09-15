'use client';

import CertificateBuilder, { Fill, longDate, type CertificateConfig } from '@/app/components/govt-forms/CertificateBuilder';
import { EMPLOYEE_FIELDS, PURPOSE_FIELD } from '@/app/lib/govtFormFields';

const config: CertificateConfig = {
  slug: 'no-dues-certificate',
  pageTitle: 'No Dues Certificate (Bay-Baqi)',
  pageIntro:
    'The No Dues / Bay-Baqi certificate required from Sindh government education department employees at the time of pension, transfer, NOC or final settlement. Fill the details and print a signature-ready A4 page.',
  certificateHeading: 'No Dues Certificate',
  certificateSubHeading: '(Bay-Baqi Certificate)',
  fields: [
    ...EMPLOYEE_FIELDS,
    { key: 'duesUpto', label: 'No dues outstanding up to (date)', type: 'date' },
    { key: 'lastPayDrawn', label: 'Last Pay Drawn (Rs.)', placeholder: '85,000/-' },
    PURPOSE_FIELD,
  ],
  body: (v) => (
    <>
      <p>
        Certified that <Fill value={[v.title, v.employeeName].filter(Boolean).join(' ')} width={200} />{' '}
        <Fill value={v.relation} width={40} /> <Fill value={v.fatherName} width={180} />, holding CNIC No.{' '}
        <Fill value={v.cnic} width={150} />, Personal / SAP No. <Fill value={v.personalNo} width={110} />, is serving as{' '}
        <Fill value={v.designation} width={180} /> (BPS-<Fill value={v.bps} width={30} />) at{' '}
        <Fill value={v.schoolPosting} width={230} />.
      </p>
      <p>
        It is further certified that nothing is outstanding against him / her up to{' '}
        <Fill value={longDate(v.duesUpto)} width={140} /> on account of pay and allowances, House Building Advance,
        Motor Car / Motor Cycle Advance, G.P. Fund advance, Benevolent Fund, Group Insurance, house rent, electricity /
        utility charges, library books, furniture, sports material, laboratory or any other Government store items or
        recoverable amount whatsoever.
      </p>
      <p>
        His / her last pay drawn was Rs. <Fill value={v.lastPayDrawn} width={120} /> per month. No audit paragraph,
        recovery or over-payment is pending against him / her in the record of this office.
      </p>
      <p>
        This certificate is issued on his / her own request for the purpose of{' '}
        <Fill value={v.purpose} width={230} />.
      </p>
    </>
  ),
  footerNotes: [
    'Note: This certificate is valid only when signed and stamped by the competent authority.',
    'Any recovery detected later shall remain payable by the employee notwithstanding this certificate.',
  ],
};

export default function NoDuesCertificatePage() {
  return <CertificateBuilder config={config} />;
}
