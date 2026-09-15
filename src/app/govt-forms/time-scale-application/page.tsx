'use client';

import AgFormBuilder, { LabelTable, Rule, type AgFormConfig } from '@/app/components/govt-forms/AgFormBuilder';

const config: AgFormConfig = {
  slug: 'time-scale-application',
  pageTitle: 'Time Scale Application Form',
  pageIntro:
    'Application for the incentive of a higher grade on the basis of Time Scale, for P.S.T. and equivalent grades. Fill your service particulars and print the A4 sheet for the D.D.O and District Education Officer.',
  fields: [
    { key: 'employeeName', label: 'Name of Applicant', wide: true, section: 'Applicant' },
    { key: 'fatherName', label: "Father's Name", wide: true, section: 'Applicant' },
    { key: 'designation', label: 'Designation with Grade', section: 'Applicant', placeholder: 'P.S.T - BPS-9' },
    { key: 'schoolPosting', label: 'Place of Posting', section: 'Applicant' },
    { key: 'qualification', label: 'Qualification (Academic)', section: 'Applicant', placeholder: 'B.A.' },
    { key: 'profQualification', label: 'Professional Qualification', section: 'Applicant', placeholder: 'B.Ed.' },
    { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', section: 'Applicant' },
    { key: 'dateOfAppointment', label: 'Date of Appointment', type: 'date', section: 'Applicant' },
    { key: 'dateOfFirstJoining', label: 'Date of First Joining', type: 'date', section: 'Applicant' },
    { key: 'personalNo', label: 'Personal No.', section: 'Applicant' },
    { key: 'cnic', label: 'C.N.I.C', type: 'cnic', section: 'Applicant' },
    { key: 'workingSincePresentPost', label: 'Date of Working in Present Post', type: 'date', section: 'Service' },
    { key: 'lengthUpToDate', label: 'Length of service calculated up to', type: 'date', section: 'Service' },
    { key: 'lengthOfService', label: 'Length of Service in Present Post', wide: true, section: 'Service', placeholder: '12 Years, 2 Months, 15 Days' },
    { key: 'dueGradeYears', label: 'Higher grade due on completion of (years)', section: 'Service', defaultValue: '09' },
    { key: 'dueGrade', label: 'Higher Grade claimed (BPS)', section: 'Service', placeholder: '12' },
    { key: 'dueDate', label: 'Date on which higher grade became due', type: 'date', section: 'Service' },
    { key: 'applicationNo', label: 'Application No.', section: 'Office' },
    { key: 'applicationDate', label: 'Date', type: 'date', section: 'Office' },
  ],
  sheet: (v, emblem) => (
    <>
      <div className="mb-5 flex items-start gap-3">
        {emblem ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={emblem} alt="Government Emblem" className="h-[56px] w-[56px] object-contain" />
        ) : null}
        <div className="flex-1 text-center">
          <h2 className="leading-tight">
            Application Form for Incentive of Higher Grade on the Basis of Time Scale
          </h2>
          <p className="mt-1 text-[12.5px] font-bold uppercase">For P.S.T. and Equivalent Grade</p>
        </div>
        <div className="w-[56px]" />
      </div>

      <LabelTable
        rows={[
          ['Name of Applicant', v.employeeName],
          ["Father's Name", v.fatherName],
          ['Designation with Grade', v.designation],
          ['Place of Posting', v.schoolPosting],
          ['Qualification', v.qualification],
          ['Professional Qualification', v.profQualification],
          ['Date of Birth', v.dateOfBirth],
          ['Date of Appointment', v.dateOfAppointment],
          ['Date of First Joining', v.dateOfFirstJoining],
          ['Personal No.', v.personalNo],
          ['C.N.I.C', v.cnic],
          ['Date of Working in Present Post', v.workingSincePresentPost],
          [`Length of Service in Present Post up to ${v.lengthUpToDate || '____________'}`, v.lengthOfService],
          [`Date on which B-${v.dueGrade || '__'} due on completion of ${v.dueGradeYears || '09'} Years' Service`, v.dueDate],
        ]}
      />

      <div className="mt-6 flex items-end justify-between">
        <div>
          <p className="mb-2 flex items-end gap-2"><span className="ag-lab">No.</span><Rule value={v.applicationNo} width={190} /></p>
          <p className="flex items-end gap-2"><span className="ag-lab">Date:</span><Rule value={v.applicationDate} width={150} /></p>
        </div>
        <div className="w-[250px] text-center">
          <div className="mb-1 h-[36px] border-b border-black" />
          <p className="font-bold">Signature of Applicant</p>
        </div>
      </div>

      <div className="ag-block mt-8">
        <p className="text-justify" style={{ lineHeight: 1.9 }}>
          Verified from the record and certified that the applicant and his / her claim is genuine and he / she is
          entitled to avail the benefits of Time Scale, hence his / her case is recommended for the incentive of Higher
          Grade i.e. B.P.S - <Rule value={v.dueGrade} width={60} />.
        </p>
      </div>

      <div className="mt-10 flex items-end justify-between gap-8">
        <div className="w-[250px] text-center">
          <p className="mb-1 font-bold">Counter Signed by:</p>
          <div className="mb-1 h-[38px] border-b border-black" />
          <p className="font-bold">District Officer Education</p>
        </div>
        <div className="w-[280px] text-center">
          <div className="mb-1 h-[52px] border-b border-black" />
          <p className="font-bold">Signature of D.D.O / Head of Institution</p>
        </div>
      </div>

      <div className="mt-10 border-t border-black pt-2 text-[10.5px]">
        <p className="font-bold">Documents Attached:</p>
        <p>
          A.C.R of 5 years &nbsp;·&nbsp; Current Pay Slip &nbsp;·&nbsp; Photocopy of 6 months attendance &nbsp;·&nbsp;
          Service Book &nbsp;·&nbsp; No Dues and No Enquiry Certificates &nbsp;·&nbsp; Appointment Order &nbsp;·&nbsp;
          Academic &amp; Professional documents
        </p>
      </div>
    </>
  ),
  notes: [
    'Time Scale is granted under Government of Sindh, Finance Department letter No. (SR-I)(52)/2010 dated 07-06-2010.',
    'The higher scale is personal to the incumbent and does not create a right to claim a higher post.',
  ],
};

export default function TimeScalePage() {
  return <AgFormBuilder config={config} />;
}
