'use client';

import AgFormBuilder, { CheckTable, LabelTable, Rule, type AgFormConfig } from '@/app/components/govt-forms/AgFormBuilder';

const DOCUMENTS = [
  'Photocopy of CNIC',
  'Photocopy of latest Pay Slip',
  'Photocopy of Matriculation Certificate',
  'Intermediate: F.A / F.Sc / D.A.E (date of declaration of result)',
  'Graduation: B.A / B.Sc / B.Com / B.B.A / B.E',
  'Masters: M.A / M.Sc / M.Com / M.B.A / M.E',
  'Post Masters degree (if any)',
  'C.T certificate',
  'B.Ed (date of declaration of result)',
  'Appointment / Offer order',
  'Joining report of present district',
  'Domicile / PRC "D"',
];

const config: AgFormConfig = {
  slug: 'seniority-inclusion-application',
  pageTitle: 'Seniority List Inclusion Application',
  pageIntro:
    'Application to the District Education Officer for inclusion of your name in the seniority list, with the full personal and service track and the attached-documents checklist. Fill it and print the A4 sheets.',
  fields: [
    { key: 'addressedTo', label: 'Addressed to', wide: true, section: 'Addressee', defaultValue: 'The District Education Officer' },
    { key: 'officeLine', label: 'Office line', wide: true, section: 'Addressee', defaultValue: 'Elementary, Secondary & Higher Secondary' },
    { key: 'district', label: 'District', section: 'Addressee', placeholder: 'Karachi Central' },
    { key: 'cadre', label: 'Seniority list of (cadre)', section: 'Addressee', placeholder: 'J.E.S.T / P.S.T / H.S.T' },
    { key: 'designation', label: 'Working as (Designation)', section: 'Applicant' },
    { key: 'bps', label: 'BPS', type: 'number', section: 'Applicant' },
    { key: 'schoolPosting', label: 'Name of School', wide: true, section: 'Applicant' },
    { key: 'personalNo', label: 'Personal No.', section: 'Applicant' },
    { key: 'employeeName', label: 'Name of Teacher', section: 'Applicant' },
    { key: 'fatherName', label: "Father's Name", section: 'Applicant' },
    { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', section: 'Applicant' },
    { key: 'cnic', label: 'CNIC #', type: 'cnic', section: 'Applicant' },
    { key: 'highestQualification', label: 'Highest Academic Qualification (with date)', wide: true, section: 'Applicant' },
    { key: 'ctResultDate', label: 'Date of result — C.T.', type: 'date', section: 'Service Track' },
    { key: 'bedResultDate', label: 'Date of result — B.Ed.', type: 'date', section: 'Service Track' },
    { key: 'dateOfEntryService', label: 'Date of Entry in Govt. Service', type: 'date', section: 'Service Track' },
    { key: 'regularizationDate', label: 'Date of Promotion / Regularization', type: 'date', section: 'Service Track' },
    { key: 'districtJoiningDate', label: 'Date of joining in this District', type: 'date', section: 'Service Track' },
    { key: 'semisCode', label: 'SEMIS ID', section: 'Service Track' },
    { key: 'ddoCode', label: 'Cost Center', section: 'Service Track' },
    { key: 'domicile', label: 'Domicile', section: 'Service Track' },
    { key: 'applicationDate', label: 'Date of Application', type: 'date', section: 'Service Track' },
  ],
  sheet: (v) => (
    <>
      <p className="mb-1 font-bold">To,</p>
      <div className="mb-5 pl-10">
        <p className="font-bold">{v.addressedTo || 'The District Education Officer'}</p>
        <p>{v.officeLine || 'Elementary, Secondary & Higher Secondary'}</p>
        <p>District {v.district || '______________________'}</p>
      </div>

      <p className="mb-4 flex flex-wrap items-end gap-2 font-bold">
        <span className="underline">SUBJECT:</span>
        <span className="uppercase">Application for inclusion in seniority list of</span>
        <Rule value={v.cadre} width={170} />
      </p>

      <p className="mb-5 text-justify" style={{ lineHeight: 2.2 }}>
        I am working as <Rule value={v.designation} width={140} /> BPS <Rule value={v.bps} width={50} /> at{' '}
        <Rule value={v.schoolPosting} width={280} /> (Name of school). Kindly include my name in the seniority list of{' '}
        <Rule value={v.cadre} width={160} />. My personal data and service track is as under.
      </p>

      <LabelTable
        numbered={false}
        labelWidth="48%"
        rows={[
          ['Personal No.', v.personalNo],
          ['Name of Teacher', v.employeeName],
          ["Father's Name", v.fatherName],
          ['Date of Birth', v.dateOfBirth],
          ['CNIC #', v.cnic],
          ['Highest Academic Qualification (Date)', v.highestQualification],
          ['Date of Result Announcement of Professional Examination — C.T.', v.ctResultDate],
          ['Date of Result Announcement of Professional Examination — B.Ed.', v.bedResultDate],
          ['Date of Entry in Govt. Service', v.dateOfEntryService],
          ['Date of Promotion / Regularization', v.regularizationDate],
          ['Date of passing B.Ed / Joining in this district', v.districtJoiningDate],
          ['Place of Posting', v.schoolPosting],
          ['SEMIS ID', v.semisCode],
          ['Cost Center', v.ddoCode],
          ['Date of joining in this District', v.districtJoiningDate],
          ['DOMICILE', v.domicile],
        ]}
      />

      <p className="mt-5 text-justify" style={{ lineHeight: 1.9 }}>
        <span className="font-bold">Certificate:</span> I solemnly state that all the above information is correct and
        the documents attached with this proforma are authenticated. In case of any irregularity, I personally will be
        held responsible.
      </p>

      <div className="mt-3 flex items-end gap-2">
        <span className="ag-lab">Dated:</span><Rule value={v.applicationDate} width={150} />
      </div>

      <div className="mt-10 flex justify-between gap-6">
        {['Signature of Applicant', 'Verified by H.M', 'Countersigned by D.D.O'].map((label) => (
          <div key={label} className="flex-1 text-center">
            <div className="mb-1 h-[38px] border-b border-black" />
            <p className="font-bold">{label}</p>
          </div>
        ))}
      </div>

      <div className="ag-block mt-8">
        <p className="mb-3 text-center font-bold">For office use only</p>
        <p className="text-justify" style={{ lineHeight: 2 }}>
          The above given data has been checked and verified from the documents attached. He / She is recommended to be
          included in the seniority of <Rule value={v.cadre} width={170} />. His / Her date of seniority is{' '}
          <Rule value="" width={170} />.
        </p>
        <div className="mt-8 flex justify-between gap-6">
          {['Signature of dealing clerk', 'Signature of Seniority In-charge', 'Signature of DDO (Admin)'].map((label) => (
            <div key={label} className="flex-1 text-center">
              <div className="mb-1 h-[34px] border-b border-black" />
              <p className="font-bold">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ pageBreakBefore: 'always', breakBefore: 'page' }} />

      <p className="mb-2 text-center font-bold underline">Documents to be attached</p>
      <p className="mb-3 text-[10.5px] italic">
        Note: All the documents should be attested by the H.M / D.D.O and should be filed as per the S. No. given below.
      </p>
      <CheckTable head="Document" rows={DOCUMENTS} extraBlank={4} />
    </>
  ),
  notes: [
    'Your seniority date is decided from the date of result declaration of the professional qualification — attach the correct result notification.',
    'All attached documents must be attested by the H.M / D.D.O and filed in the same order as the checklist.',
  ],
};

export default function SeniorityInclusionPage() {
  return <AgFormBuilder config={config} />;
}
