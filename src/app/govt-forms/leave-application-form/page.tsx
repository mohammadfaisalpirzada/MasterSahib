'use client';

import AgFormBuilder, { Check, Rule, type AgFormConfig } from '@/app/components/govt-forms/AgFormBuilder';

const KINDS = ['Earned Leave', 'Leave on M.C.', 'Leave on private affairs', 'Extra Ordinary Leave', 'Maternity Leave'];

const config: AgFormConfig = {
  slug: 'leave-application-form',
  pageTitle: 'Leave Application Form (Earned / Medical)',
  pageIntro:
    'The official departmental Leave Application Form — the applicant’s half plus the Report of the Head of the Department underneath. This is the proforma attached to a leave case, not a plain letter. Fill it and print a signature-ready A4 page.',
  fields: [
    { key: 'employeeName', label: 'Name', wide: true, section: 'Applicant' },
    { key: 'designation', label: 'Designation with scale of pay', section: 'Applicant', placeholder: 'P.S.T – BPS 12' },
    { key: 'leaveType', label: 'Nature of leave applied for', type: 'select', options: KINDS, defaultValue: 'Earned Leave', section: 'Applicant' },
    { key: 'leaveDays', label: 'Period of Leave — days', type: 'number', section: 'Applicant' },
    { key: 'leaveFrom', label: 'From', type: 'date', section: 'Applicant' },
    { key: 'leaveTo', label: 'To', type: 'date', section: 'Applicant' },
    { key: 'prefix', label: 'With permission to Prefix', section: 'Applicant' },
    { key: 'suffix', label: 'and Suffix', section: 'Applicant' },
    { key: 'grounds', label: 'Grounds', wide: true, section: 'Applicant', placeholder: 'Enclose medical certificate where required' },
    { key: 'previousLeaveNature', label: 'Leave already taken — nature', section: 'Applicant' },
    { key: 'previousLeaveDays', label: 'Days', type: 'number', section: 'Applicant' },
    { key: 'previousLeaveFrom', label: 'From', type: 'date', section: 'Applicant' },
    { key: 'previousLeaveTo', label: 'To', type: 'date', section: 'Applicant' },

    { key: 'leaveDueNature', label: 'Amount of leave due — nature', section: 'Report of the Head of the Department' },
    { key: 'leaveDueDays', label: 'Days due', type: 'number', section: 'Report of the Head of the Department' },
    { key: 'recommendedKind', label: 'Kind of leave recommended', type: 'select', options: KINDS, section: 'Report of the Head of the Department' },
    { key: 'leaveRules', label: 'Under leave rules', section: 'Report of the Head of the Department', defaultValue: 'Leave Rules 1986' },
    { key: 'absenteeArrangement', label: 'Proposals for absentee’s work', wide: true, section: 'Report of the Head of the Department', placeholder: 'Name of the teacher who will cover the classes' },
    { key: 'fileNo', label: 'File No. (No. GBSS/P.F./____/62)', section: 'Report of the Head of the Department' },
    { key: 'reportDate', label: 'Dated', type: 'date', section: 'Report of the Head of the Department' },
  ],
  sheet: (v) => (
    <>
      <h2 className="mb-5 text-center underline">Leave Application Form</h2>

      <div className="mb-2 flex items-end gap-2"><span className="ag-lab">Name:</span><Rule value={v.employeeName} grow /></div>
      <div className="mb-3 flex items-end gap-2"><span className="ag-lab">Designation with scale of pay:</span><Rule value={v.designation} grow /></div>

      <div className="mb-3 flex items-start gap-3">
        <span className="ag-lab" style={{ minWidth: 160 }}>Nature of leave applied for</span>
        <span className="flex flex-1 flex-wrap gap-x-4 gap-y-1">
          {KINDS.map((k) => <Check key={k} checked={v.leaveType === k} label={k} />)}
        </span>
      </div>

      <div className="mb-3 flex flex-wrap items-end gap-2">
        <span className="ag-lab">Period of Leave:</span><Rule value={v.leaveDays} width={55} />
        <span>days from</span><Rule value={v.leaveFrom} width={140} />
        <span>to</span><Rule value={v.leaveTo} width={140} />
      </div>
      <div className="mb-3 flex flex-wrap items-end gap-2">
        <span>With permission to Prefix</span><Rule value={v.prefix} width={130} />
        <span>and suffix</span><Rule value={v.suffix} width={130} />
      </div>
      <div className="mb-3 flex items-end gap-2"><span>Grounds</span><Rule value={v.grounds} grow /></div>
      <p className="mb-3 text-[10.5px] italic">(Enclose medical Certificate where required)</p>

      <div className="mb-6 flex flex-wrap items-end gap-2">
        <span>Leave taken — nature</span><Rule value={v.previousLeaveNature} width={140} />
        <span>for</span><Rule value={v.previousLeaveDays} width={45} />
        <span>days from</span><Rule value={v.previousLeaveFrom} width={130} />
        <span>to</span><Rule value={v.previousLeaveTo} width={130} />
      </div>

      <div className="mb-6 flex justify-end">
        <div className="w-[240px] text-center">
          <div className="mb-1 h-[34px] border-b border-black" />
          <p className="font-bold">Signature of applicant</p>
        </div>
      </div>

      <p className="mb-3 text-center font-bold underline">Report of the Head of the Department</p>

      <div className="mb-3 flex flex-wrap items-end gap-2">
        <span>Amount of leave due — nature</span><Rule value={v.leaveDueNature} width={150} />
        <span>days</span><Rule value={v.leaveDueDays} width={55} />
        <span>as per enclosed leave statement.</span>
      </div>

      <p className="mb-3 text-justify" style={{ lineHeight: 2 }}>
        Recommendation with proposal for the absentee&apos;s work: <Rule value={v.employeeName} width={200} /> will be
        absent from duty for <Rule value={v.leaveDays} width={50} /> days from{' '}
        <Rule value={v.leaveFrom} width={130} /> to <Rule value={v.leaveTo} width={130} />. The following kind of leave
        is recommended: <Rule value={v.recommendedKind} width={170} /> under{' '}
        <Rule value={v.leaveRules} width={160} />.
      </p>

      <div className="mb-6 flex items-end gap-2">
        <span>Proposals for absentee&apos;s work</span><Rule value={v.absenteeArrangement} grow />
      </div>

      <div className="mt-8 flex items-end justify-between">
        <div>
          <p className="mb-2 flex items-end gap-2"><span className="ag-lab">No. GBSS/P.F./</span><Rule value={v.fileNo} width={90} /><span>/62</span></p>
          <p className="flex items-end gap-2"><span className="ag-lab">Dated:</span><Rule value={v.reportDate} width={140} /></p>
        </div>
        <div className="w-[260px] text-center">
          <div className="mb-1 h-[34px] border-b border-black" />
          <p className="font-bold">Signature of Headmaster / D.D.O</p>
        </div>
      </div>

      <div className="mt-8">
        <p className="font-bold">Enclosed:</p>
        <p>1. Leave Application &nbsp;&nbsp; 2. Leave Statement &nbsp;&nbsp; 3. Service Book &nbsp;&nbsp; 4. ______________________</p>
      </div>
    </>
  ),
  notes: [
    'Attach the leave statement and service book with this proforma.',
    'For medical leave, a medical certificate is compulsory.',
  ],
};

export default function LeaveApplicationFormPage() {
  return <AgFormBuilder config={config} />;
}
