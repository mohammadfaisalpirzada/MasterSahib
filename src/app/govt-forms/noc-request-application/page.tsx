'use client';

import AgFormBuilder, { Rule, type AgFormConfig } from '@/app/components/govt-forms/AgFormBuilder';

const config: AgFormConfig = {
  slug: 'noc-request-application',
  pageTitle: 'NOC Request Application (Transfer)',
  pageIntro:
    'The application a teacher submits to the Headmaster / Headmistress of another school requesting a No Objection Certificate for transfer. Fill your appointment particulars and print a signature-ready A4 page.',
  fields: [
    { key: 'addressedTo', label: 'Addressed to', section: 'Addressee', defaultValue: 'The Headmaster / Headmistress' },
    { key: 'targetSchool', label: 'School where NOC is requested', wide: true, section: 'Addressee', placeholder: 'G.G.S.S. Gulshan-e-Iqbal, Karachi' },
    { key: 'postSought', label: 'Post / Cadre for which NOC is sought', section: 'Addressee', placeholder: 'J.E.S.T (BPS-14)' },
    { key: 'title', label: 'Title', type: 'select', options: ['Mr.', 'Miss', 'Mrs.'], defaultValue: 'Mr.', section: 'Applicant' },
    { key: 'employeeName', label: 'Name', section: 'Applicant' },
    { key: 'relation', label: 'S/O — D/O — W/O', type: 'select', options: ['S/O', 'D/O', 'W/O'], defaultValue: 'S/O', section: 'Applicant' },
    { key: 'fatherName', label: "Father's / Husband's Name", section: 'Applicant' },
    { key: 'cnic', label: 'CNIC No.', type: 'cnic', section: 'Applicant' },
    { key: 'personalNo', label: 'Personal ID No.', section: 'Applicant' },
    { key: 'designation', label: 'Appointed as (Designation)', section: 'Applicant' },
    { key: 'bps', label: 'BPS', type: 'number', section: 'Applicant' },
    { key: 'schoolPosting', label: 'Present School of Posting', wide: true, section: 'Applicant' },
    { key: 'semisCode', label: 'SEMIS Code', section: 'Applicant' },
    { key: 'kqCode', label: 'KQ Code', section: 'Applicant' },
    { key: 'appointmentOrderNo', label: 'Appointment Order No.', wide: true, section: 'Order Reference' },
    { key: 'endorsementNo', label: 'Endorsement No.', wide: true, section: 'Order Reference' },
    { key: 'orderDate', label: 'Order Date', type: 'date', section: 'Order Reference' },
    { key: 'residence', label: 'Applicant’s residence', wide: true, section: 'Grounds' },
    { key: 'reason', label: 'Reason for the transfer request', type: 'textarea', wide: true, section: 'Grounds', placeholder: 'Long distance from residence / vacant post in your school' },
    { key: 'applicationDate', label: 'Date of Application', type: 'date', section: 'Grounds' },
  ],
  sheet: (v) => (
    <>
      <p className="mb-1 font-bold">To,</p>
      <div className="mb-5 pl-8">
        <p className="font-bold">{v.addressedTo || 'The Headmaster / Headmistress'},</p>
        <p className="font-bold">{v.targetSchool || '______________________________'},</p>
      </div>

      <p className="mb-5 font-bold underline">
        Subject: Request for the No Objection Certificate{v.postSought ? ` (For ${v.postSought})` : ''}
      </p>

      <p className="mb-4">Respected Sir / Madam,</p>

      <p className="text-justify" style={{ lineHeight: 2.3 }}>
        I hereby state that I, <Rule value={[v.title, v.employeeName].filter(Boolean).join(' ')} width={200} />{' '}
        <Rule value={v.relation} width={40} /> <Rule value={v.fatherName} width={190} />, holding CNIC No.{' '}
        <Rule value={v.cnic} width={150} /> and Personal ID No. <Rule value={v.personalNo} width={110} />, am appointed
        as <Rule value={v.designation} width={150} /> (BPS-<Rule value={v.bps} width={35} />) at{' '}
        <Rule value={v.schoolPosting} width={240} />, SEMIS Code <Rule value={v.semisCode} width={110} />, KQ Code{' '}
        <Rule value={v.kqCode} width={80} />, vide appointment order number{' '}
        <Rule value={v.appointmentOrderNo} width={230} />, endorsement No.{' '}
        <Rule value={v.endorsementNo} width={230} />, dated <Rule value={v.orderDate} width={130} />.
      </p>

      <p className="mt-4 text-justify" style={{ lineHeight: 2.3 }}>
        I am a resident of <Rule value={v.residence} width={280} />. <Rule value={v.reason} width={420} />
      </p>

      <p className="mt-4 text-justify" style={{ lineHeight: 2.3 }}>
        I request you to kindly issue me a NO OBJECTION CERTIFICATE for{' '}
        <Rule value={v.postSought} width={200} />. I shall be very thankful to you.
      </p>

      <div className="mt-12 flex items-end justify-between">
        <p className="flex items-end gap-2"><span className="ag-lab">Dated:</span><Rule value={v.applicationDate} width={150} /></p>
        <div className="w-[280px] text-center">
          <p className="mb-1 font-bold">Yours Faithfully,</p>
          <div className="mb-1 h-[38px] border-b border-black" />
          <p className="font-bold">{v.employeeName || '________________________'}</p>
          <p className="font-bold">
            {v.designation || 'Designation'}{v.bps ? ` (BPS-${v.bps})` : ''}
          </p>
          <p>Personal ID No. {v.personalNo || '__________'}</p>
        </div>
      </div>

      <div className="mt-14 border-t border-black pt-3">
        <p className="mb-4 font-bold">Recommendation of the present Headmaster / Headmistress</p>
        <div className="flex justify-between gap-8">
          <div className="flex-1 text-center">
            <div className="mb-1 h-[36px] border-b border-black" />
            <p className="font-bold">Recommended / Not Recommended (Stamp)</p>
          </div>
          <div className="flex-1 text-center">
            <div className="mb-1 h-[36px] border-b border-black" />
            <p className="font-bold">Countersigned by D.D.O</p>
          </div>
        </div>
      </div>
    </>
  ),
  notes: [
    'Attach copies of your CNIC, appointment order, endorsement letter and latest pay slip.',
    'A transfer is only effective once the NOC is accepted and a formal transfer order is issued.',
  ],
};

export default function NocRequestPage() {
  return <AgFormBuilder config={config} />;
}
