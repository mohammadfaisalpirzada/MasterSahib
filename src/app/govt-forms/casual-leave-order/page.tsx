'use client';

import AgFormBuilder, { Rule, type AgFormConfig } from '@/app/components/govt-forms/AgFormBuilder';

const config: AgFormConfig = {
  slug: 'casual-leave-order',
  pageTitle: 'Casual / Earned Leave Order',
  pageIntro:
    'The office ORDER that sanctions a teacher’s casual, medical or earned leave, issued by the Taluka / District Education Officer. Fill the details and print a signature-ready A4 page.',
  fields: [
    { key: 'officeOfThe', label: 'Office of the', wide: true, section: 'Office', placeholder: 'Taluka Education Officer, Jamshed Town' },
    { key: 'orderNo', label: 'Order No.', section: 'Office' },
    { key: 'orderDate', label: 'Order Date', type: 'date', section: 'Office' },
    { key: 'title', label: 'Title', type: 'select', options: ['Mr.', 'Miss', 'Mrs.'], defaultValue: 'Mr.', section: 'Employee' },
    { key: 'employeeName', label: 'Name of Employee', section: 'Employee' },
    { key: 'personalNo', label: 'Personal I.D. No.', section: 'Employee' },
    { key: 'semisCode', label: 'SEMIS Code', section: 'Employee', placeholder: '408070227' },
    { key: 'taluka', label: 'Taluka', section: 'Employee', placeholder: 'Jamshed Town' },
    { key: 'district', label: 'District', section: 'Employee', placeholder: 'Karachi East' },
    { key: 'designation', label: 'Working as (Designation)', section: 'Employee', placeholder: 'P.S.T / S.L.T / J.S.T' },
    { key: 'schoolPosting', label: 'School of Posting', wide: true, section: 'Employee' },
    {
      key: 'leaveKind', label: 'Kind of Leave', type: 'select',
      options: ['Casual', 'Medical', 'Earned'], defaultValue: 'Casual', section: 'Leave',
    },
    { key: 'leaveDays', label: 'Number of Day(s)', type: 'number', section: 'Leave' },
    { key: 'leaveFrom', label: 'Leave From', type: 'date', section: 'Leave' },
    { key: 'leaveTo', label: 'Leave To', type: 'date', section: 'Leave' },
    { key: 'availedDays', label: 'Leave already availed (days)', type: 'number', section: 'Leave' },
    { key: 'academicYear', label: 'Academic Year', section: 'Leave', placeholder: '2026' },
    { key: 'issuerName', label: 'Signing Officer Name', section: 'Signing Authority' },
    { key: 'issuerOffice', label: 'Taluka / District Education Officer, Taluka', section: 'Signing Authority' },
    { key: 'issuerDistrict', label: 'District', section: 'Signing Authority' },
    { key: 'copyTo', label: 'Copy to', wide: true, section: 'Signing Authority', defaultValue: 'The next supervisory officer of the leave granting authority' },
  ],
  sheet: (v, emblem) => (
    <>
      <div className="mb-4 flex items-start gap-3">
        {emblem ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={emblem} alt="Government Emblem" className="h-[60px] w-[60px] object-contain" />
        ) : null}
        <div className="flex-1 text-center">
          <div className="flex items-end justify-center gap-2">
            <span className="ag-lab">OFFICE OF THE</span>
            <Rule value={v.officeOfThe} width={330} />
          </div>
          <p className="mt-1 font-bold uppercase">School Education Department</p>
          <p className="font-bold uppercase">Government of Sindh</p>
        </div>
        <div className="w-[60px]" />
      </div>

      <p className="mb-4 text-center text-[15px] font-bold underline">ORDER:</p>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <span className="flex items-end gap-2"><span className="ag-lab">No.</span><Rule value={v.orderNo} width={200} /></span>
        <span className="flex items-end gap-2"><span className="ag-lab">Dated:</span><Rule value={v.orderDate} width={150} /></span>
      </div>

      <p className="text-justify" style={{ lineHeight: 2.4 }}>
        <Rule value={v.title} width={55} /> <Rule value={v.employeeName} width={230} />, personal I.D. No{' '}
        <Rule value={v.personalNo} width={120} />, SEMIS CODE <Rule value={v.semisCode} width={110} />, Taluka{' '}
        <Rule value={v.taluka} width={150} />, District <Rule value={v.district} width={150} />, working as{' '}
        <Rule value={v.designation} width={140} /> at <Rule value={v.schoolPosting} width={260} /> is hereby allowed{' '}
        <Rule value={v.leaveDays} width={55} /> day(s) <Rule value={v.leaveKind} width={110} /> leave i.e. on from{' '}
        <Rule value={v.leaveFrom} width={140} /> to <Rule value={v.leaveTo} width={140} />.
      </p>

      <p className="mt-4 text-justify" style={{ lineHeight: 2.4 }}>
        He / She has so far availed <Rule value={v.availedDays} width={60} /> days of casual / earned / other leave
        during the academic year <Rule value={v.academicYear} width={90} />.
      </p>

      <div className="mt-14 flex justify-end">
        <div className="w-[300px]">
          <p className="mb-3 flex items-end gap-2"><span className="ag-lab">SIGNATURE:</span><Rule value="" grow /></p>
          <p className="mb-3 flex items-end gap-2"><span className="ag-lab">NAME:</span><Rule value={v.issuerName} grow /></p>
          <p className="ag-lab">TALUKA / DISTRICT EDUCATION</p>
          <p className="mb-3 flex items-end gap-2"><span className="ag-lab">OFFICER, TALUKA:</span><Rule value={v.issuerOffice} grow /></p>
          <p className="mb-3 flex items-end gap-2"><span className="ag-lab">DISTRICT:</span><Rule value={v.issuerDistrict} grow /></p>
          <p className="flex items-end gap-2"><span className="ag-lab">STAMP:</span><Rule value="" grow /></p>
        </div>
      </div>

      <div className="mt-10">
        <p className="font-bold">Copy to:</p>
        <p>{v.copyTo || '(The next supervisory officer of the leave granting authority)'}</p>
      </div>
    </>
  ),
  notes: [
    'This is the sanctioning ORDER issued by the leave granting authority — not the teacher’s own application.',
    'As per the original proforma, an ILMI text message is also required for the grant of leave.',
  ],
};

export default function CasualLeaveOrderPage() {
  return <AgFormBuilder config={config} />;
}
