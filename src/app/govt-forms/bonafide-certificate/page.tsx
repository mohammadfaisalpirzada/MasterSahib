'use client';

import CertificateBuilder, { Fill, longDate, type CertificateConfig } from '@/app/components/govt-forms/CertificateBuilder';
import { EMPLOYEE_FIELDS, PURPOSE_FIELD } from '@/app/lib/govtFormFields';

const config: CertificateConfig = {
  slug: 'bonafide-certificate',
  pageTitle: 'Bonafide Employee Certificate',
  pageIntro:
    'The bonafide certificate a Sindh education department employee submits to banks, embassies, universities and department offices — confirming that he or she is a regular government employee. Fill the details and print a signature-ready A4 page.',
  certificateHeading: 'Bonafide Certificate',
  certificateSubHeading: '(Government Employee — School Education & Literacy Department, Sindh)',
  fields: [
    ...EMPLOYEE_FIELDS,
    {
      key: 'employmentStatus',
      label: 'Employment Status',
      type: 'select',
      options: ['Regular / Permanent', 'Contract', 'Adhoc', 'Officiating'],
      defaultValue: 'Regular / Permanent',
    },
    { key: 'basicPay', label: 'Present Basic Pay (Rs.)', placeholder: '85,000/-' },
    { key: 'grossPay', label: 'Gross Monthly Pay (Rs.)', placeholder: '1,10,000/-' },
    { key: 'dateOfRetirement', label: 'Date of Superannuation', type: 'date' },
    { key: 'addressedTo', label: 'Certificate addressed to', wide: true, placeholder: 'To Whom It May Concern / Name of Bank / University' },
    PURPOSE_FIELD,
  ],
  body: (v) => (
    <>
      {v.addressedTo ? <p className="font-bold">{v.addressedTo}</p> : <p className="font-bold">To Whom It May Concern</p>}
      <p>
        Certified that <Fill value={[v.title, v.employeeName].filter(Boolean).join(' ')} width={200} />{' '}
        <Fill value={v.relation} width={40} /> <Fill value={v.fatherName} width={180} />, holding CNIC No.{' '}
        <Fill value={v.cnic} width={150} />, date of birth <Fill value={longDate(v.dateOfBirth)} width={140} />, is a
        bonafide employee of the School Education &amp; Literacy Department, Government of Sindh.
      </p>
      <p>
        He / She is presently serving as <Fill value={v.designation} width={180} /> (BPS-
        <Fill value={v.bps} width={30} />) at <Fill value={v.schoolPosting} width={230} /> on{' '}
        <Fill value={v.employmentStatus} width={150} /> basis, bearing Personal / SAP No.{' '}
        <Fill value={v.personalNo} width={110} />, and was first appointed on{' '}
        <Fill value={longDate(v.dateOfAppointment)} width={140} />.
      </p>
      <p>
        His / Her present basic pay is Rs. <Fill value={v.basicPay} width={110} /> per month and gross monthly pay is
        Rs. <Fill value={v.grossPay} width={110} />. The date of superannuation is{' '}
        <Fill value={longDate(v.dateOfRetirement)} width={140} />.
      </p>
      <p>
        This certificate is issued on his / her own request for the purpose of{' '}
        <Fill value={v.purpose} width={230} /> and carries no financial liability upon this office or the Government of
        Sindh.
      </p>
    </>
  ),
  footerNotes: [
    'Note: This certificate is valid only when signed and stamped by the competent authority.',
    'Pay particulars are as per the pay bill of this office on the date of issue.',
  ],
};

export default function BonafideCertificatePage() {
  return <CertificateBuilder config={config} />;
}
