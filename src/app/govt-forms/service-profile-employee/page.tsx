'use client';

import AgFormBuilder, { LabelTable, type AgFormConfig } from '@/app/components/govt-forms/AgFormBuilder';

const rowsOf = (raw: string) =>
  (raw || '')
    .split('\n')
    .map((line) => line.split('|').map((c) => c.trim()))
    .filter((cells) => cells.some((c) => c));

const QUAL_HEAD = ['Qualification', 'Year of Passing', 'Div / Grade', 'Board / University'];
const ACADEMIC = ['Matriculation', 'Intermediate', 'Graduation (mention discipline)', 'Post Graduation (mention discipline)'];
const PROFESSIONAL = ['P.T.C.', 'C.T.', 'B.Ed.', 'M.Ed.', 'Diploma in Education', 'D.T.C. / O.T.C. / D.A.E. / B.P.H.Ed', 'Other'];

const config: AgFormConfig = {
  slug: 'service-profile-employee',
  pageTitle: 'Service Profile of Employee',
  pageIntro:
    'The complete service profile of a government school employee — personal data, academic and professional qualifications, full service record and trainings. Fill it once and print the A4 sheets for your personal file.',
  fields: [
    { key: 'employeeName', label: 'Name of Employee', wide: true, section: 'A — Personal Data' },
    { key: 'fatherName', label: "Father's Name", wide: true, section: 'A — Personal Data' },
    { key: 'dateOfBirth', label: 'Date of Birth (as per Matric certificate)', type: 'date', section: 'A — Personal Data' },
    { key: 'personalNo', label: 'Personal Number', section: 'A — Personal Data' },
    { key: 'cnic', label: 'C.N.I.C No.', type: 'cnic', section: 'A — Personal Data' },
    { key: 'contactNo', label: 'Mobile No.', type: 'phone', section: 'A — Personal Data' },
    { key: 'email', label: 'Email Address', wide: true, section: 'A — Personal Data' },
    { key: 'presentAddress', label: 'Postal Address — Present', wide: true, section: 'A — Personal Data' },
    { key: 'permanentAddress', label: 'Postal Address — Permanent (as per PRC "D")', wide: true, section: 'A — Personal Data' },
    { key: 'domicile', label: 'Domicile', wide: true, section: 'A — Personal Data' },

    {
      key: 'academicRows', label: 'Academic qualification rows', type: 'textarea', wide: true, section: 'B — Qualification',
      placeholder: 'Matriculation | 2000 | A Grade | BSEK\nIntermediate | 2002 | B Grade | BIEK',
      hint: 'One per line: Qualification | Year of Passing | Div/Grade | Board. Leave empty for a blank table.',
    },
    {
      key: 'professionalRows', label: 'Professional qualification rows', type: 'textarea', wide: true, section: 'B — Qualification',
      placeholder: 'B.Ed. | 2012 | 1st Div | University of Karachi',
    },

    { key: 'dateOfEntryService', label: 'Date of Initial Appointment / Entry into service', type: 'date', wide: true, section: 'C — Service Record' },
    { key: 'offerLetterNo', label: 'Offer Letter — Number', section: 'C — Service Record' },
    { key: 'offerLetterDate', label: 'Offer Letter — Date', type: 'date', section: 'C — Service Record' },
    { key: 'appointmentOrderNo', label: 'Appointment Order — Number', section: 'C — Service Record' },
    { key: 'appointmentOrderDate', label: 'Appointment Order — Date', type: 'date', section: 'C — Service Record' },
    { key: 'medicalFitnessNo', label: 'Medical Fitness — Number', section: 'C — Service Record' },
    { key: 'medicalFitnessDate', label: 'Medical Fitness — Date', type: 'date', section: 'C — Service Record' },
    { key: 'firstPost', label: 'Post at the time of Appointment', section: 'C — Service Record' },
    { key: 'firstBps', label: 'B.P.S. at appointment', type: 'number', section: 'C — Service Record' },
    { key: 'firstPosting', label: 'First Place of Posting', wide: true, section: 'C — Service Record' },
    { key: 'firstJoiningDate', label: 'Date of First Joining', type: 'date', section: 'C — Service Record' },
    { key: 'promotionPost', label: 'Promotion — Post', section: 'C — Service Record' },
    { key: 'promotionBps', label: 'Promotion — B.P.S.', type: 'number', section: 'C — Service Record' },
    { key: 'promotionDate', label: 'Promotion — Date', type: 'date', section: 'C — Service Record' },
    { key: 'promotionOrderNo', label: 'Promotion Order No.', section: 'C — Service Record' },
    { key: 'promotionOrderDate', label: 'Promotion Order Date', type: 'date', section: 'C — Service Record' },
    { key: 'postingOnPromotion', label: 'Place of posting on promotion', wide: true, section: 'C — Service Record' },
    { key: 'presentPostDate', label: 'Date of promotion in present post', type: 'date', section: 'C — Service Record' },
    { key: 'schoolPosting', label: 'Present Place of Posting', wide: true, section: 'C — Service Record' },
    { key: 'timeScaleBps', label: 'Time Scale — B.P.S.', type: 'number', section: 'C — Service Record' },
    { key: 'timeScaleOrderNo', label: 'Time Scale — Order No.', section: 'C — Service Record' },
    { key: 'timeScaleDate', label: 'Time Scale — Date', type: 'date', section: 'C — Service Record' },

    {
      key: 'trainingInside', label: 'Trainings inside country', type: 'textarea', wide: true, section: 'D — Trainings / Special Aptitude',
      placeholder: 'Course Title | Duration   (one per line)',
    },
    {
      key: 'trainingOutside', label: 'Trainings outside country', type: 'textarea', wide: true, section: 'D — Trainings / Special Aptitude',
      placeholder: 'Course Title | Duration',
    },
    {
      key: 'computerSkills', label: 'Computer skills', type: 'textarea', wide: true, section: 'D — Trainings / Special Aptitude',
      placeholder: 'Course Title | Duration',
    },
  ],
  sheet: (v) => {
    const QualTable = ({ names, rows }: { names: string[]; rows: string[][] }) => (
      <table className="ag-table">
        <thead>
          <tr>
            <th style={{ width: '6%' }}>S.No</th>
            {QUAL_HEAD.map((h, i) => <th key={h} style={{ width: i === 0 ? '34%' : undefined }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {names.map((name, i) => (
            <tr key={name}>
              <td style={{ textAlign: 'center' }}>{i + 1}</td>
              <td>{name}</td>
              <td className="h">{rows[i]?.[1] || ''}</td>
              <td className="h">{rows[i]?.[2] || ''}</td>
              <td className="h">{rows[i]?.[3] || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );

    const CourseTable = ({ title, raw }: { title: string; raw: string }) => {
      const rows = rowsOf(raw);
      return (
        <>
          <p className="mt-3 font-bold">{title}</p>
          <table className="ag-table">
            <thead>
              <tr>
                <th style={{ width: '6%' }}>S.No</th>
                <th>Course Title</th>
                <th style={{ width: '25%' }}>Duration</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2].map((i) => (
                <tr key={i}>
                  <td style={{ textAlign: 'center' }}>{i + 1}</td>
                  <td className="h">{rows[i]?.[0] || ''}</td>
                  <td className="h">{rows[i]?.[1] || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      );
    };

    return (
      <>
        <h2 className="mb-5 text-center underline">Service Profile of the Employee</h2>

        <p className="ag-block-title">A — Personal Data</p>
        <LabelTable
          rows={[
            ['Name of Employee', v.employeeName],
            ["Father's Name", v.fatherName],
            ['Date of Birth (as per Matric Passed Certificate)', v.dateOfBirth],
            ['Personal Number', v.personalNo],
            ['C.N.I.C No.', v.cnic],
            ['Contact Information — Mobile No.', v.contactNo],
            ['Contact Information — Email Address', v.email],
            ['Postal Address — Present', v.presentAddress],
            ['Postal Address — Permanent (as per PRC "D")', v.permanentAddress],
            ['Domicile', v.domicile],
          ]}
        />

        <p className="ag-block-title mt-5">B — Qualification (i) Academic</p>
        <QualTable names={ACADEMIC} rows={rowsOf(v.academicRows)} />

        <p className="ag-block-title mt-5">B — Qualification (ii) Professional</p>
        <QualTable names={PROFESSIONAL} rows={rowsOf(v.professionalRows)} />

        <div style={{ pageBreakAfter: 'always', breakAfter: 'page' }} />

        <p className="ag-block-title">C — Service Record</p>
        <LabelTable
          start={20}
          rows={[
            ['Date of Initial Appointment / Entry into service', v.dateOfEntryService],
            ['Offer Letter — Number / Date', [v.offerLetterNo, v.offerLetterDate].filter(Boolean).join('  /  ')],
            ['Appointment Order — Number / Date', [v.appointmentOrderNo, v.appointmentOrderDate].filter(Boolean).join('  /  ')],
            ['Medical Fitness — Number / Date', [v.medicalFitnessNo, v.medicalFitnessDate].filter(Boolean).join('  /  ')],
            ['Post at the time of Appointment — Post / B.P.S.', [v.firstPost, v.firstBps].filter(Boolean).join('  /  BPS-')],
            ['First Place of Posting', v.firstPosting],
            ['Date of First Joining', v.firstJoiningDate],
            ['Date of Promotion — Post / B.P.S. / Date', [v.promotionPost, v.promotionBps, v.promotionDate].filter(Boolean).join('  /  ')],
            ['Promotion Order No. / Date', [v.promotionOrderNo, v.promotionOrderDate].filter(Boolean).join('  /  ')],
            ['Place of posting on promotion', v.postingOnPromotion],
            ['Date of promotion in present post', v.presentPostDate],
            ['Present Place of Posting', v.schoolPosting],
            ['Time Scale — B.P.S. / Order No. / Date', [v.timeScaleBps, v.timeScaleOrderNo, v.timeScaleDate].filter(Boolean).join('  /  ')],
          ]}
        />

        <p className="ag-block-title mt-5">D — Trainings / Special Aptitude</p>
        <CourseTable title="Training inside Country" raw={v.trainingInside} />
        <CourseTable title="Training outside Country" raw={v.trainingOutside} />
        <CourseTable title="Computer Skills" raw={v.computerSkills} />

        <div className="mt-12 flex justify-between gap-10">
          <div className="flex-1 text-center">
            <div className="mb-1 h-[38px] border-b border-black" />
            <p className="font-bold">Signature of Employee</p>
          </div>
          <div className="flex-1 text-center">
            <div className="mb-1 h-[38px] border-b border-black" />
            <p className="font-bold">Verified by H.M / D.D.O (Stamp)</p>
          </div>
        </div>
      </>
    );
  },
  notes: [
    'This profile prints as two A4 pages — keep them together in your personal file.',
    'Attach attested copies of every order and certificate referred to in the service record.',
  ],
};

export default function ServiceProfilePage() {
  return <AgFormBuilder config={config} />;
}
