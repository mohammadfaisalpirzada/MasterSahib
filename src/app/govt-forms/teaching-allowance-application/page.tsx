'use client';

import AgFormBuilder, { LabelTable, Rule, type AgFormConfig } from '@/app/components/govt-forms/AgFormBuilder';

const ACADEMIC = ['Matric', 'Inter', 'Graduation', 'M.A / M.Sc'];
const PROFESSIONAL = ['P.T.C. / I.V.', 'C.T. / S.V.', 'B.Ed.', 'M.Ed.'];

const rowsOf = (raw: string) =>
  (raw || '')
    .split('\n')
    .map((line) => line.split('|').map((c) => c.trim()))
    .filter((cells) => cells.some((c) => c));

const config: AgFormConfig = {
  slug: 'teaching-allowance-application',
  pageTitle: 'Teaching Allowance Application',
  pageIntro:
    'Application for sanction of the qualification-based Teaching Allowance of Rs. 1000/= per month by virtue of possessing B.Ed or a higher qualification. Fill your qualification record and print the A4 sheet for the D.E.O.',
  fields: [
    { key: 'employeeName', label: 'Name of Teacher', wide: true, section: 'Applicant' },
    { key: 'fatherName', label: "Father's Name", wide: true, section: 'Applicant' },
    { key: 'designation', label: 'Present Designation with Grade', section: 'Applicant' },
    { key: 'dateOfBirth', label: 'Date of Birth', type: 'date', section: 'Applicant' },
    { key: 'dateOfAppointment', label: 'Date of Appointment / Promotion to present post', type: 'date', wide: true, section: 'Applicant' },
    { key: 'schoolPosting', label: 'Present Place of Posting', wide: true, section: 'Applicant' },
    { key: 'cnic', label: 'C.N.I.C. No.', type: 'cnic', section: 'Applicant' },
    { key: 'qualification', label: 'Academic qualification on which allowance is claimed', section: 'Claim' },
    { key: 'profQualification', label: 'Professional qualification', section: 'Claim', defaultValue: 'B.Ed.' },
    { key: 'allowanceFrom', label: 'Date from which allowance is to be granted', type: 'date', section: 'Claim' },
    { key: 'allowanceAmount', label: 'Financial benefit claimed (Rs. per month)', section: 'Claim', defaultValue: '1000/=' },
    {
      key: 'academicRows', label: 'Academic qualification rows', type: 'textarea', wide: true, section: 'Qualification Tables',
      placeholder: 'Matric | 2000 | 15-08-2000 | A Grade\nInter | 2002 | ... | ...',
      hint: 'One per line: Examination | Year of Passing | Date of Result | Division / Grade. Leave empty for a blank table.',
    },
    {
      key: 'professionalRows', label: 'Professional qualification rows', type: 'textarea', wide: true, section: 'Qualification Tables',
      placeholder: 'B.Ed. | 2012 | 20-11-2012 | 1st Division',
    },
    {
      key: 'incrementRows', label: 'Advance increments availed earlier (if any)', type: 'textarea', wide: true, section: 'Qualification Tables',
      placeholder: 'Qualification | No. of increments allowed | Date from which allowed',
    },
    { key: 'declarationQualification', label: 'Declaration — qualification held', section: 'Declaration', placeholder: 'B.A plus B.Ed' },
    { key: 'applicationDate', label: 'Date of Application', type: 'date', section: 'Declaration' },
    { key: 'officeName', label: 'Name of Office', wide: true, section: 'Declaration', defaultValue: 'Office of the District Education Officer Karachi South' },
    { key: 'officeLetterNo', label: 'Office Letter No.', wide: true, section: 'Declaration' },
  ],
  sheet: (v) => {
    const academic = rowsOf(v.academicRows);
    const professional = rowsOf(v.professionalRows);
    const increments = rowsOf(v.incrementRows);

    const QualTable = ({ names, rows }: { names: string[]; rows: string[][] }) => (
      <table className="ag-table">
        <thead>
          <tr>
            <th style={{ width: '6%' }}>S. No.</th>
            <th>Name of Examination / Qualification</th>
            <th style={{ width: '16%' }}>Year of Passing</th>
            <th style={{ width: '18%' }}>Date of Result</th>
            <th style={{ width: '18%' }}>Division / Grade</th>
          </tr>
        </thead>
        <tbody>
          {names.map((name, i) => (
            <tr key={name}>
              <td style={{ textAlign: 'center' }}>{i + 1}.</td>
              <td>{rows[i]?.[0] || name}</td>
              <td className="h">{rows[i]?.[1] || ''}</td>
              <td className="h">{rows[i]?.[2] || ''}</td>
              <td className="h">{rows[i]?.[3] || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );

    return (
      <>
        <h2 className="mb-5 text-center leading-tight">
          Application for Sanction of &ldquo;Qualification Based Teaching Allowance&rdquo; of Rs.{' '}
          {v.allowanceAmount || '1000/='} Per Month in the Capacity of B.Ed by Virtue of Possessing Higher
          Qualifications
        </h2>

        <LabelTable
          rows={[
            ['Name of Teacher', v.employeeName],
            ["Father's Name", v.fatherName],
            ['Present Designation with Grade', v.designation],
            ['Date of Birth', v.dateOfBirth],
            ['Date of Appointment or Promotion to the present post', v.dateOfAppointment],
            ['Qualifications on the basis whereof Teaching Allowance is to be granted — Academic', v.qualification],
            ['Qualifications on the basis whereof Teaching Allowance is to be granted — Professional', v.profQualification],
            ['Date from which the "Teaching Allowance" is to be granted', v.allowanceFrom],
            ['Financial benefit to be granted in the shape of "Teaching Allowance" (Rs. per month)', v.allowanceAmount],
            ['Present Place of Posting', v.schoolPosting],
            ['C.N.I.C. No.', v.cnic],
          ]}
        />

        <p className="ag-block-title mt-5">11. Academic Qualifications</p>
        <QualTable names={ACADEMIC} rows={academic} />

        <p className="ag-block-title mt-5">12. Professional Qualifications</p>
        <QualTable names={PROFESSIONAL} rows={professional} />

        <p className="ag-block-title mt-5">13. Advance Increments Availed Earlier (if any)</p>
        <table className="ag-table">
          <thead>
            <tr>
              <th style={{ width: '6%' }}>S. No.</th>
              <th>Name of Examination / Qualification</th>
              <th style={{ width: '26%' }}>No. of Increments Allowed / Granted Previously</th>
              <th style={{ width: '22%' }}>Date from which Increments Allowed</th>
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2].map((i) => (
              <tr key={i}>
                <td style={{ textAlign: 'center' }}>{i + 1}.</td>
                <td className="h">{increments[i]?.[0] || ''}</td>
                <td className="h">{increments[i]?.[1] || ''}</td>
                <td className="h">{increments[i]?.[2] || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="ag-block-title mt-6 text-center">Declaration</p>
        <p className="text-justify" style={{ lineHeight: 2 }}>
          I solemnly declare that I have not availed the BENEFIT of &ldquo;Higher Grade&rdquo; and &ldquo;advance
          increment&rdquo; by virtue of possessing or acquiring the qualification i.e.{' '}
          <Rule value={v.declarationQualification} width={220} /> during the entire period of my service.
        </p>

        <div className="mt-8 flex items-end justify-between">
          <p className="flex items-end gap-2"><span className="ag-lab">Date:</span><Rule value={v.applicationDate} width={150} /></p>
          <div className="w-[250px] text-center">
            <div className="mb-1 h-[36px] border-b border-black" />
            <p className="font-bold">(Signature of Applicant)</p>
          </div>
        </div>

        <div className="ag-block mt-8">
          <p className="mb-2 flex items-end gap-2"><span className="ag-lab">Name of Office:</span><Rule value={v.officeName} grow /></p>
          <p className="mb-3 flex items-end gap-2">
            <span className="ag-lab">No.</span><Rule value={v.officeLetterNo} width={250} />
            <span className="ag-lab">Date:</span><Rule value="" width={140} />
          </p>
          <p className="text-justify" style={{ lineHeight: 1.9 }}>
            Verified from the records and certified that the applicant has not availed the BENEFIT of higher grade and
            advance increment by virtue of possessing or acquiring the qualification i.e.{' '}
            <Rule value={v.declarationQualification} width={200} />, therefore his / her case for sanction of the
            qualification based &ldquo;Teaching Allowance&rdquo; of Rs. {v.allowanceAmount || '1000/='} per month with
            effect from <Rule value={v.allowanceFrom} width={140} /> is recommended and awarded, and forwarded to the
            District Officer Education (Male / Female S&amp;HS) for further necessary action.
          </p>
        </div>

        <div className="mt-10 flex items-end justify-between gap-8">
          <div className="w-[240px] text-center">
            <p className="mb-1 font-bold">Counter Signed by</p>
            <div className="mb-1 h-[36px] border-b border-black" />
            <p className="font-bold">D.E.O. Concerned</p>
          </div>
          <div className="w-[240px] text-center">
            <div className="mb-1 h-[52px] border-b border-black" />
            <p className="font-bold">H.M / T.E.O. Concerned</p>
          </div>
        </div>
      </>
    );
  },
  notes: [
    'The teaching allowance is granted only if no higher grade or advance increment has been availed for the same qualification.',
    'Attach attested copies of all academic and professional certificates with the date of declaration of result.',
  ],
};

export default function TeachingAllowancePage() {
  return <AgFormBuilder config={config} />;
}
