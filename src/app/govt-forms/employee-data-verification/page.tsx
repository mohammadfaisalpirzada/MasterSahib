'use client';

import AgFormBuilder, { Rule, type AgFormConfig } from '@/app/components/govt-forms/AgFormBuilder';

const config: AgFormConfig = {
  slug: 'employee-data-verification',
  pageTitle: 'Employees Data Verification Proforma',
  pageIntro:
    'The School Education & Literacy Department proforma used to verify an employee’s school, appointment and current service data. Fill the details and print the A4 sheet for the DDO / Headmaster and the employee to sign.',
  fields: [
    { key: 'region', label: 'Region', section: 'Location' },
    { key: 'district', label: 'District', section: 'Location' },
    { key: 'tehsil', label: 'Tehsil', section: 'Location' },
    { key: 'unionCouncil', label: 'U/C', section: 'Location' },

    { key: 'semisCode', label: 'SEMIS Code', section: 'A — School & Head Information' },
    { key: 'prefix', label: 'Prefix', section: 'A — School & Head Information', placeholder: 'GGSS / GBPS' },
    { key: 'instituteName', label: 'Institute Name', wide: true, section: 'A — School & Head Information' },
    { key: 'headName', label: 'Head Name', section: 'A — School & Head Information' },
    { key: 'headContact', label: 'Head Contact #', type: 'phone', section: 'A — School & Head Information' },
    { key: 'enrolmentBoys', label: 'Enrolment (Boys)', type: 'number', section: 'A — School & Head Information' },
    { key: 'enrolmentGirls', label: 'Enrolment (Girls)', type: 'number', section: 'A — School & Head Information' },
    { key: 'ddoCode', label: 'DDO Codes', section: 'A — School & Head Information' },

    { key: 'employeeName', label: 'Name', section: 'B — Employee Information' },
    { key: 'fatherName', label: "Father's Name", section: 'B — Employee Information' },
    { key: 'contactNo', label: 'Contact #', type: 'phone', section: 'B — Employee Information' },
    { key: 'cnic', label: 'CNIC #', type: 'cnic', section: 'B — Employee Information' },
    { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'], section: 'B — Employee Information' },
    { key: 'personalNo', label: 'P.ID', section: 'B — Employee Information' },
    { key: 'dateOfBirth', label: 'D.O.B', type: 'date', section: 'B — Employee Information' },

    { key: 'firstOrderNo', label: 'First Order No.', wide: true, section: 'I — First Appointment' },
    { key: 'firstOrderDate', label: 'Order Date', type: 'date', section: 'I — First Appointment' },
    { key: 'firstDesignation', label: 'Designation', section: 'I — First Appointment' },
    { key: 'firstBps', label: 'BPS', type: 'number', section: 'I — First Appointment' },
    { key: 'deptJoiningDate', label: 'Date of Joining in Department', type: 'date', wide: true, section: 'I — First Appointment' },

    { key: 'designation', label: 'Designation', section: 'II — Current Status' },
    { key: 'bps', label: 'BPS', type: 'number', section: 'II — Current Status' },
    { key: 'timeScale', label: 'Time Scale', section: 'II — Current Status' },
    { key: 'presentJoiningDate', label: 'Date of Joining of Present Status', type: 'date', wide: true, section: 'II — Current Status' },
    { key: 'qualification', label: 'Academic Qualification', section: 'II — Current Status' },
    { key: 'profQualification', label: 'Professional / Training Qualification', section: 'II — Current Status' },
    { key: 'joiningType', label: 'Joining Type', section: 'II — Current Status', placeholder: 'Fresh / Promotion / Transfer' },
    { key: 'cadre', label: 'Cadre', section: 'II — Current Status' },
  ],
  sheet: (v, emblem) => {
    const Pair = ({ a, av, b, bv }: { a: string; av?: string; b?: string; bv?: string }) => (
      <div className="mb-3 flex flex-wrap items-end gap-x-8 gap-y-3">
        <span className="flex flex-1 items-end gap-2" style={{ minWidth: 230 }}>
          <span className="ag-lab">{a}</span><Rule value={av} grow />
        </span>
        {b ? (
          <span className="flex flex-1 items-end gap-2" style={{ minWidth: 230 }}>
            <span className="ag-lab">{b}</span><Rule value={bv} grow />
          </span>
        ) : null}
      </div>
    );

    return (
      <>
        <div className="mb-5 flex items-start gap-3">
          {emblem ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={emblem} alt="Government Emblem" className="h-[56px] w-[56px] object-contain" />
          ) : null}
          <div className="flex-1 text-center">
            <h2 className="leading-tight">School Education and Literacy Department</h2>
            <p className="text-[13px] font-bold uppercase">Government of Sindh</p>
            <p className="mt-1 text-[13.5px] font-bold uppercase underline">Employees Data Verification Proforma</p>
          </div>
          <div className="w-[56px]" />
        </div>

        <Pair a="REGION" av={v.region} b="DISTRICT" bv={v.district} />
        <Pair a="TEHSIL" av={v.tehsil} b="U/C" bv={v.unionCouncil} />

        <div className="ag-block mt-4">
          <p className="ag-block-title">A. School &amp; Head Information</p>
          <Pair a="SEMIS CODE" av={v.semisCode} b="PREFIX" bv={v.prefix} />
          <div className="mb-3 flex items-end gap-2">
            <span className="ag-lab">INSTITUTE NAME</span><Rule value={v.instituteName} grow />
          </div>
          <Pair a="HEAD NAME" av={v.headName} b="CONTACT #" bv={v.headContact} />
          <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
            <span className="flex items-end gap-2"><span className="ag-lab">ENROLMENT (BOYS)</span><Rule value={v.enrolmentBoys} width={90} /></span>
            <span className="flex items-end gap-2"><span className="ag-lab">(GIRLS)</span><Rule value={v.enrolmentGirls} width={90} /></span>
            <span className="flex flex-1 items-end gap-2"><span className="ag-lab">DDO CODES</span><Rule value={v.ddoCode} grow /></span>
          </div>
        </div>

        <div className="ag-block">
          <p className="ag-block-title">B. Employees Information</p>
          <Pair a="NAME" av={v.employeeName} b="FATHER'S NAME" bv={v.fatherName} />
          <Pair a="CONTACT #" av={v.contactNo} b="CNIC #" bv={v.cnic} />
          <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
            <span className="flex items-end gap-2"><span className="ag-lab">GENDER</span><Rule value={v.gender} width={100} /></span>
            <span className="flex items-end gap-2"><span className="ag-lab">P.ID</span><Rule value={v.personalNo} width={130} /></span>
            <span className="flex flex-1 items-end gap-2"><span className="ag-lab">D.O.B</span><Rule value={v.dateOfBirth} grow /></span>
          </div>
        </div>

        <div className="ag-block">
          <p className="ag-block-title">I. First Appointment</p>
          <Pair a="FIRST ORDER NO." av={v.firstOrderNo} b="ORDER DATE" bv={v.firstOrderDate} />
          <Pair a="DESIGNATION" av={v.firstDesignation} b="BPS" bv={v.firstBps} />
          <div className="flex items-end gap-2">
            <span className="ag-lab">DATE OF JOINING IN DEPARTMENT</span><Rule value={v.deptJoiningDate} grow />
          </div>
        </div>

        <div className="ag-block">
          <p className="ag-block-title">II. Current Status</p>
          <div className="mb-3 flex flex-wrap items-end gap-x-8 gap-y-3">
            <span className="flex flex-1 items-end gap-2"><span className="ag-lab">DESIGNATION</span><Rule value={v.designation} grow /></span>
            <span className="flex items-end gap-2"><span className="ag-lab">BPS</span><Rule value={v.bps} width={70} /></span>
            <span className="flex items-end gap-2"><span className="ag-lab">TIME SCALE</span><Rule value={v.timeScale} width={110} /></span>
          </div>
          <div className="mb-3 flex items-end gap-2">
            <span className="ag-lab">DATE OF JOINING OF PRESENT STATUS</span><Rule value={v.presentJoiningDate} grow />
          </div>
          <Pair a="ACAD: QUALIFICATION" av={v.qualification} b="PROF: / TRAINING QUALIFICATION" bv={v.profQualification} />
          <Pair a="JOINING TYPE" av={v.joiningType} b="CADRE" bv={v.cadre} />
        </div>

        <p className="mt-3 text-[10.5px] italic">
          (NOTE: Each employee should submit his / her complete personal file along with this proforma)
        </p>

        <div className="mt-12 flex justify-between gap-10">
          <div className="flex-1 text-center">
            <div className="mb-1 h-[38px] border-b border-black" />
            <p className="font-bold">Sign of DDO / HM with Stamp</p>
          </div>
          <div className="flex-1 text-center">
            <div className="mb-1 h-[38px] border-b border-black" />
            <p className="font-bold">Sign of Employee</p>
          </div>
        </div>
      </>
    );
  },
  notes: ['Submit the complete personal file along with this proforma, as required by the department.'],
};

export default function EmployeeDataVerificationPage() {
  return <AgFormBuilder config={config} />;
}
