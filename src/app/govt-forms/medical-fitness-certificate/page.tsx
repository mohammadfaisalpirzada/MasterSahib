'use client';

import CertificateBuilder, { Fill, longDate, type CertificateConfig } from '@/app/components/govt-forms/CertificateBuilder';

const config: CertificateConfig = {
  slug: 'medical-fitness-certificate',
  pageTitle: 'Medical Fitness Certificate',
  pageIntro:
    'The medical fitness certificate required at the time of a government appointment — it is item 7 on the AG Sindh PAY01 required-documents list. Fill the candidate details and print the A4 page for the examining Medical Officer.',
  certificateHeading: 'Medical Fitness Certificate',
  certificateSubHeading: '(For Appointment in Government Service)',
  fields: [
    { key: 'title', label: 'Title', type: 'select', options: ['Mr.', 'Miss', 'Mrs.'], defaultValue: 'Mr.' },
    { key: 'employeeName', label: 'Name of Candidate' },
    { key: 'relation', label: 'S/O — D/O — W/O', type: 'select', options: ['S/O', 'D/O', 'W/O'], defaultValue: 'S/O' },
    { key: 'fatherName', label: "Father's / Husband's Name" },
    { key: 'cnic', label: 'CNIC No.', type: 'cnic' },
    { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
    { key: 'designation', label: 'Post applied for / appointed to' },
    { key: 'bps', label: 'BPS', type: 'number' },
    { key: 'schoolPosting', label: 'Department / School', wide: true, defaultValue: 'School Education & Literacy Department, Government of Sindh' },
    { key: 'examinationDate', label: 'Date of Medical Examination', type: 'date' },
    { key: 'height', label: 'Height', placeholder: "5' 8\"" },
    { key: 'weight', label: 'Weight', placeholder: '72 kg' },
    { key: 'bloodGroup', label: 'Blood Group', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    { key: 'eyesight', label: 'Eyesight', type: 'select', options: ['Normal', 'With correction'], defaultValue: 'Normal' },
    { key: 'identificationMark', label: 'Identification Mark', wide: true, placeholder: 'A mole on the right cheek' },
    { key: 'fitnessStatus', label: 'Fitness Opinion', type: 'select', options: ['Fit', 'Unfit'], defaultValue: 'Fit' },
    { key: 'doctorName', label: 'Name of Medical Officer', wide: true },
    { key: 'doctorRegNo', label: 'PMDC Registration No.' },
    { key: 'hospitalName', label: 'Hospital / Health Facility', wide: true },
  ],
  body: (v) => (
    <>
      <p className="font-bold">To Whom It May Concern</p>
      <p>
        Certified that I have carefully examined{' '}
        <Fill value={[v.title, v.employeeName].filter(Boolean).join(' ')} width={200} />{' '}
        <Fill value={v.relation} width={40} /> <Fill value={v.fatherName} width={190} />, holding CNIC No.{' '}
        <Fill value={v.cnic} width={150} /> and date of birth <Fill value={longDate(v.dateOfBirth)} width={140} />, on{' '}
        <Fill value={longDate(v.examinationDate)} width={140} />.
      </p>
      <p>
        On examination his / her height was recorded as <Fill value={v.height} width={90} />, weight{' '}
        <Fill value={v.weight} width={90} />, blood group <Fill value={v.bloodGroup} width={70} /> and eyesight{' '}
        <Fill value={v.eyesight} width={130} />. Identification mark:{' '}
        <Fill value={v.identificationMark} width={230} />.
      </p>
      <p>
        I do not find that he / she has any disease, constitutional weakness, mental or bodily infirmity that would
        render him / her unfit for service. In my opinion he / she is medically{' '}
        <Fill value={v.fitnessStatus} width={100} /> for appointment as{' '}
        <Fill value={v.designation} width={180} /> (BPS-<Fill value={v.bps} width={30} />) in{' '}
        <Fill value={v.schoolPosting} width={250} />.
      </p>
      <p>
        This certificate is issued on his / her own request for submission along with the appointment case.
      </p>
    </>
  ),
  signature: (v) => (
    <div className="flex items-end justify-between">
      <div className="text-[11.5px] text-slate-700">
        <div className="mb-1 h-[52px] w-[130px] border border-dashed border-slate-400" />
        <p className="text-center">Hospital Stamp</p>
      </div>
      <div className="w-[280px] text-center">
        <div className="mb-1 h-[42px] border-b border-black" />
        <p className="text-[13px] font-bold">{v.doctorName || '________________________'}</p>
        <p className="text-[12px] font-semibold">Medical Officer</p>
        <p className="text-[11px]">PMDC Reg. No. {v.doctorRegNo || '__________'}</p>
        <p className="text-[11px]">{v.hospitalName}</p>
      </div>
    </div>
  ),
  footerNotes: [
    'Note: This certificate is valid only when signed and stamped by a registered Medical Officer of a government health facility.',
    'The original must be submitted with the appointment case, along with a photocopy for the personal file.',
  ],
  howTo: [
    'Fill your school / office letterhead once — it is remembered for every form in this section.',
    'Enter the candidate details. The medical readings are filled by the examining Medical Officer.',
    'Click Generate Certificate, then Print / Save as PDF on A4 with Headers and footers OFF.',
    'Take the printed page to the government hospital — the Medical Officer records the findings, signs and stamps it.',
  ],
};

export default function MedicalFitnessPage() {
  return <CertificateBuilder config={config} />;
}
