'use client';

import AgFormBuilder, { Rule, type AgFormConfig } from '@/app/components/govt-forms/AgFormBuilder';

const config: AgFormConfig = {
  slug: 'joining-report',
  pageTitle: 'Joining Report',
  pageIntro:
    'The joining report a newly appointed or transferred teacher submits to the Headmaster / Campus Head on assuming duty, quoting the offer and endorsement order numbers. Fill the details and print a signature-ready A4 page.',
  fields: [
    { key: 'addressedTo', label: 'Addressed to', section: 'Addressee', defaultValue: 'The Headmaster / Headmistress', placeholder: 'The Campus Head / The Head Mistress' },
    { key: 'schoolPosting', label: 'School Name', wide: true, section: 'Addressee' },
    { key: 'schoolAddress', label: 'Town / District', wide: true, section: 'Addressee', placeholder: 'Saddar Town, District South, Karachi' },
    { key: 'semisCode', label: 'SEMIS Code', section: 'Addressee' },
    { key: 'title', label: 'Title', type: 'select', options: ['Mr.', 'Miss', 'Mrs.'], defaultValue: 'Mr.', section: 'Applicant' },
    { key: 'employeeName', label: 'Name', section: 'Applicant' },
    { key: 'relation', label: 'S/O — D/O — W/O', type: 'select', options: ['S/O', 'D/O', 'W/O'], defaultValue: 'S/O', section: 'Applicant' },
    { key: 'fatherName', label: "Father's / Husband's Name", section: 'Applicant' },
    { key: 'cnic', label: 'CNIC No.', type: 'cnic', section: 'Applicant' },
    { key: 'personalNo', label: 'Personal / SAP No.', section: 'Applicant' },
    { key: 'designation', label: 'Designation', section: 'Applicant', placeholder: 'P.S.T' },
    { key: 'bps', label: 'BPS', type: 'number', section: 'Applicant' },
    { key: 'offerOrderNo', label: 'Offer / Appointment Order No.', wide: true, section: 'Order Reference', placeholder: 'SELD/RP-2021/Rec/PST(15004-09)' },
    { key: 'offerOrderDate', label: 'Offer Order Date', type: 'date', section: 'Order Reference' },
    { key: 'issuingDirectorate', label: 'Issued by', section: 'Order Reference', defaultValue: 'Directorate of School Education Karachi Region' },
    { key: 'endorsementNo', label: 'Endorsement No. (DEO)', wide: true, section: 'Order Reference', placeholder: 'SELD/RP-2021/Rec/PST (26809-16)' },
    { key: 'endorsementDate', label: 'Endorsement Date', type: 'date', section: 'Order Reference' },
    { key: 'endorsingOffice', label: 'Endorsed by', section: 'Order Reference', defaultValue: 'The District Education Officer' },
    { key: 'joiningDate', label: 'Date of Joining Duty', type: 'date', section: 'Order Reference' },
    { key: 'reportDate', label: 'Date of this Report', type: 'date', section: 'Order Reference' },
  ],
  sheet: (v) => (
    <>
      <p className="mb-1 font-bold">To,</p>
      <div className="mb-5 pl-8">
        <p className="font-bold">{v.addressedTo || 'The Headmaster / Headmistress'},</p>
        <p className="font-bold">{v.schoolPosting || '______________________________'},</p>
        {v.schoolAddress ? <p>{v.schoolAddress}.</p> : null}
      </div>

      <p className="mb-5 font-bold underline">Subject: Joining Report</p>

      <p className="mb-4">Respected Sir / Madam,</p>

      <p className="text-justify" style={{ lineHeight: 2.3 }}>
        In compliance with offer order No. <Rule value={v.offerOrderNo} width={230} /> dated{' '}
        <Rule value={v.offerOrderDate} width={130} />, issued by the{' '}
        <Rule value={v.issuingDirectorate} width={260} /> and endorsed by{' '}
        <Rule value={v.endorsingOffice} width={230} /> vide No. <Rule value={v.endorsementNo} width={220} /> dated{' '}
        <Rule value={v.endorsementDate} width={130} />, I, <Rule value={[v.title, v.employeeName].filter(Boolean).join(' ')} width={200} />{' '}
        <Rule value={v.relation} width={40} /> <Rule value={v.fatherName} width={190} />, holding CNIC No.{' '}
        <Rule value={v.cnic} width={150} /> and Personal / SAP No. <Rule value={v.personalNo} width={110} />, am
        reporting today to your school <Rule value={v.schoolPosting} width={230} /> (SEMIS Code{' '}
        <Rule value={v.semisCode} width={110} />) for duties as <Rule value={v.designation} width={150} /> (BPS-
        <Rule value={v.bps} width={35} />) with effect from <Rule value={v.joiningDate} width={140} />.
      </p>

      <p className="mt-4 text-justify" style={{ lineHeight: 2.3 }}>
        Kindly allow me to assume charge and join duty with effect from <Rule value={v.joiningDate} width={140} />. I
        shall be very obliged to you.
      </p>

      <div className="mt-12 flex items-end justify-between">
        <p className="flex items-end gap-2"><span className="ag-lab">Dated:</span><Rule value={v.reportDate} width={150} /></p>
        <div className="w-[280px] text-center">
          <p className="mb-1 font-bold">Yours Obediently,</p>
          <div className="mb-1 h-[38px] border-b border-black" />
          <p className="font-bold">{v.employeeName || '________________________'}</p>
          <p>{v.relation} {v.fatherName}</p>
          <p>CNIC: {v.cnic || '__________________'}</p>
          <p className="font-bold">
            {v.designation || 'Designation'}{v.bps ? ` (BPS-${v.bps})` : ''}
          </p>
        </div>
      </div>

      <div className="mt-14 border-t border-black pt-3">
        <p className="mb-4 font-bold">For Office Use — Charge Assumption</p>
        <div className="flex justify-between gap-8">
          <div className="flex-1 text-center">
            <div className="mb-1 h-[36px] border-b border-black" />
            <p className="font-bold">Charge Handed Over By</p>
          </div>
          <div className="flex-1 text-center">
            <div className="mb-1 h-[36px] border-b border-black" />
            <p className="font-bold">Headmaster / Headmistress (Stamp)</p>
          </div>
        </div>
      </div>
    </>
  ),
  notes: [
    'Attach a copy of the appointment / posting order and the endorsement letter.',
    'Submit one copy each to the school, the DEO office and your personal file.',
  ],
};

export default function JoiningReportPage() {
  return <AgFormBuilder config={config} />;
}
