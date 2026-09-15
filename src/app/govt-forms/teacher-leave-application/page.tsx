'use client';

import CertificateBuilder, { Fill, longDate, type CertificateConfig } from '@/app/components/govt-forms/CertificateBuilder';
import { EMPLOYEE_FIELDS } from '@/app/lib/govtFormFields';

const config: CertificateConfig = {
  slug: 'teacher-leave-application',
  pageTitle: 'Teacher Leave Application',
  pageIntro:
    'A proper leave application for a government school teacher — casual, earned, medical or maternity leave — addressed to the competent authority through the Headmaster / Principal. Fill the details and print a signature-ready A4 page.',
  certificateHeading: 'Application for Leave',
  fields: [
    ...EMPLOYEE_FIELDS,
    {
      key: 'leaveType', label: 'Type of Leave', type: 'select',
      options: ['Casual Leave', 'Earned Leave', 'Medical Leave', 'Maternity Leave', 'Leave Without Pay', 'Ex-Pakistan Leave'],
      defaultValue: 'Casual Leave',
    },
    { key: 'leaveFrom', label: 'Leave From', type: 'date' },
    { key: 'leaveTo', label: 'Leave To', type: 'date' },
    { key: 'leaveDays', label: 'Number of Days', type: 'number' },
    { key: 'addressedTo', label: 'Addressed to', wide: true, defaultValue: 'The District Education Officer (Secondary)', placeholder: 'The District Education Officer (Secondary), Karachi South' },
    { key: 'through', label: 'Through', defaultValue: 'Proper Channel — Headmaster / Principal' },
    { key: 'leaveReason', label: 'Reason for Leave', type: 'textarea', wide: true, placeholder: 'Brief reason — illness, family matter, hajj / umrah, etc.' },
    { key: 'addressDuringLeave', label: 'Address during leave', wide: true },
    { key: 'contactDuringLeave', label: 'Contact number during leave', type: 'phone' },
    { key: 'chargeHandedTo', label: 'Charge handed over to', placeholder: 'Name & designation of the colleague' },
    { key: 'lastLeaveTaken', label: 'Last leave availed (if any)', placeholder: 'e.g. 03 days CL in March 2026' },
    { key: 'applicationDate', label: 'Date of Application', type: 'date' },
  ],
  body: (v) => (
    <>
      <p className="mb-1 font-bold">To,</p>
      <p className="mb-1 pl-8 font-bold">{v.addressedTo || 'The District Education Officer (Secondary)'}</p>
      {v.through ? <p className="mb-4 pl-8">Through: <Fill value={v.through} width={250} /></p> : null}

      <p className="mb-4 font-bold underline">
        Subject: Application for {v.leaveType || 'Leave'}
        {v.leaveDays ? ` — ${v.leaveDays} Day(s)` : ''}
      </p>

      <p>Respected Sir / Madam,</p>
      <p>
        With due respect, it is submitted that I, <Fill value={[v.title, v.employeeName].filter(Boolean).join(' ')} width={190} />{' '}
        <Fill value={v.relation} width={40} /> <Fill value={v.fatherName} width={170} />, am serving as{' '}
        <Fill value={v.designation} width={170} /> (BPS-<Fill value={v.bps} width={30} />) at{' '}
        <Fill value={v.schoolPosting} width={220} />, holding CNIC No. <Fill value={v.cnic} width={150} /> and Personal
        / SAP No. <Fill value={v.personalNo} width={100} />.
      </p>
      <p>
        I request the grant of <Fill value={v.leaveType} width={150} /> for{' '}
        <Fill value={v.leaveDays} width={50} /> day(s) with effect from{' '}
        <Fill value={longDate(v.leaveFrom)} width={140} /> to <Fill value={longDate(v.leaveTo)} width={140} />, on the
        following grounds: <Fill value={v.leaveReason} width={250} />.
      </p>
      <p>
        During the leave period I can be contacted at <Fill value={v.addressDuringLeave} width={250} />, phone{' '}
        <Fill value={v.contactDuringLeave} width={130} />. The charge of my duties has been handed over to{' '}
        <Fill value={v.chargeHandedTo} width={200} />. My last leave availed was{' '}
        <Fill value={v.lastLeaveTaken} width={180} />.
      </p>
      <p>
        It is therefore requested that the above leave may kindly be sanctioned. I shall be very thankful to you.
      </p>
    </>
  ),
  signature: (v) => (
    <div className="flex items-end justify-between">
      <div className="text-[12.5px]">
        <p>Dated: <span className="border-b border-black px-2 font-bold">{longDate(v.applicationDate) || '          '}</span></p>
      </div>
      <div className="w-[280px] text-center">
        <p className="mb-1 text-[12.5px] font-bold">Yours Obediently,</p>
        <div className="mb-1 h-[40px] border-b border-black" />
        <p className="text-[13px] font-bold">{v.employeeName || '________________________'}</p>
        <p className="text-[12px] font-semibold">
          {v.designation || 'Designation'}{v.bps ? ` (BPS-${v.bps})` : ''}
        </p>
        <p className="text-[11px]">Personal / SAP No. {v.personalNo || '__________'}</p>
      </div>
    </div>
  ),
  footerNotes: [
    'Recommended / Not Recommended by the Headmaster / Principal: ______________________________',
    'Sanctioned / Not Sanctioned by the competent authority: ______________________________',
    'Note: Attach a medical certificate for medical leave, and the prescribed leave-account statement for earned leave.',
  ],
  howTo: [
    'Fill your school / office letterhead once — it is remembered for every form in this section.',
    'Enter your service details and the leave you need. Any field you leave empty prints as a blank line.',
    'Click Generate Certificate, then Print / Save as PDF on A4 with Headers and footers OFF.',
    'Sign the application, get it recommended by the Headmaster / Principal and forward it through proper channel.',
  ],
};

export default function TeacherLeaveApplicationPage() {
  return <CertificateBuilder config={config} />;
}
