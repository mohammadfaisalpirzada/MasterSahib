'use client';

import React, { forwardRef, useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';

export type AdmissionFormPrintData = {
  srNo?: string;
  rollNo?: string;
  grNo?: string;
  studentName?: string;
  dob?: string;
  dobWords?: string;
  nationality?: string;
  surname?: string;
  religion?: string;
  previousClass?: string;
  lastSchool?: string;
  leavingReason?: string;
  leavingDate?: string;
  admissionClass?: string;
  admissionDate?: string;
  nadraStatus?: string;
  bFormNo?: string;
  address?: string;
  fatherName?: string;
  fatherCnic?: string;
  fatherCell?: string;
  fatherQualification?: string;
  fatherOccupation?: string;
  companyDetails?: string;
  whatsappNo?: string;
  motherName?: string;
  motherCnic?: string;
  motherCell?: string;
  guardianCell?: string;
  officeClassAdmitted?: string;
  officeAdmissionDate?: string;
  campusHeadSign?: string;
  academicInchargeSign?: string;
  preparedBy?: string;
  preparedSign?: string;
  officeDate?: string;
  pictureBase64?: string;
  academicGroup?: string;
  electiveSubject?: string;
};

export const normalizeRecordToPrintData = (record: Record<string, string | undefined>): AdmissionFormPrintData => {
  return {
    srNo: record.sr_no || record.srNo || '',
    rollNo: record.roll_no || record.rollNo || '',
    grNo: record.gr_no || record.grNo || '',
    studentName: record.student_name || record.studentName || '',
    dob: record.dob || '',
    dobWords: record.dob_words || record.dobWords || '',
    nationality: record.nationality || 'Pakistani',
    surname: record.surname || '',
    religion: record.religion || 'Islam',
    previousClass: record.previous_class || record.previousClass || '',
    lastSchool: record.last_school || record.lastSchool || '',
    leavingReason: record.leaving_reason || record.leavingReason || '',
    leavingDate: record.leaving_date || record.leavingDate || '',
    admissionClass: record.admission_class || record.admissionClass || '',
    admissionDate: record.admission_date || record.admissionDate || '',
    nadraStatus: record.nadra_status || record.nadraStatus || '',
    bFormNo: record.b_form_no || record.bFormNo || '',
    address: record.address || '',
    fatherName: record.father_name || record.fatherName || '',
    fatherCnic: record.father_cnic || record.fatherCnic || '',
    fatherCell: record.father_cell || record.fatherCell || '',
    fatherQualification: record.father_qualification || record.fatherQualification || '',
    fatherOccupation: record.father_occupation || record.fatherOccupation || '',
    companyDetails: record.company_details || record.companyDetails || '',
    whatsappNo: record.whatsapp_no || record.whatsappNo || '',
    motherName: record.mother_name || record.motherName || '',
    motherCnic: record.mother_cnic || record.motherCnic || '',
    motherCell: record.mother_cell || record.motherCell || '',
    guardianCell: record.guardian_cell || record.guardianCell || '',
    officeClassAdmitted: record.office_class_admitted || record.officeClassAdmitted || '',
    officeAdmissionDate: record.office_admission_date || record.officeAdmissionDate || '',
    campusHeadSign: record.campus_head_sign || record.campusHeadSign || '',
    academicInchargeSign: record.academic_incharge_sign || record.academicInchargeSign || '',
    preparedBy: record.prepared_by || record.preparedBy || '',
    preparedSign: record.prepared_sign || record.preparedSign || '',
    officeDate: record.office_date || record.officeDate || '',
    pictureBase64: record.picture_base64 || record.pictureBase64 || '',
    academicGroup: record.academic_group || record.academicGroup || '',
    electiveSubject: record.elective_subject || record.electiveSubject || '',
  };
};

export const buildAdmissionPdfFileName = (studentName?: string): string => {
  const cleaned = String(studentName || 'Admission_Form')
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/\s+/g, '_');
  return `${cleaned || 'Admission_Form'}.pdf`;
};

// Deep-links to the records page's own admin-gated view for a saved row —
// scanning the printed form's QR code opens this record straight in the
// admin records screen (login already required there) so staff can confirm
// the printed copy matches what's actually on file.
export const buildAdmissionVerifyUrl = (rowNumber?: string) => {
  if (!rowNumber || typeof window === 'undefined') return undefined;
  return `${window.location.origin}/ggss-nishtar-road/admin/admission-form/records?verify=${encodeURIComponent(rowNumber)}`;
};

export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};

export async function generateAdmissionA4PdfBlob(container: HTMLElement): Promise<Blob> {
  const images = Array.from(container.querySelectorAll('img'));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) return resolve();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          setTimeout(resolve, 2000);
        })
    )
  );

  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // A4 dimensions: 210 x 297 mm with 8mm margin
  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 8;
  const marginY = 8;
  const maxContentWidth = pageWidth - marginX * 2; // 194mm
  const maxContentHeight = pageHeight - marginY * 2; // 281mm

  let finalWidth = maxContentWidth;
  let finalHeight = (canvas.height * finalWidth) / canvas.width;

  if (finalHeight > maxContentHeight) {
    const ratio = maxContentHeight / finalHeight;
    finalHeight = maxContentHeight;
    finalWidth = finalWidth * ratio;
  }

  const posX = marginX + (maxContentWidth - finalWidth) / 2;
  const posY = marginY;

  doc.addImage(imgData, 'JPEG', posX, posY, finalWidth, finalHeight);
  return doc.output('blob');
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-[9px] text-center text-[13px] font-bold uppercase tracking-wider text-[#1a3a6b] underline">
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  flex = 1,
  minWidth,
  className = '',
}: {
  label: string;
  value?: string;
  flex?: number | string;
  minWidth?: string | number;
  className?: string;
}) {
  const displayVal = value && value.trim() ? value.trim() : '';
  return (
    <div
      className={`flex items-end gap-[9px] ${className}`}
      style={{ flex: flex, minWidth: minWidth ?? 0 }}
    >
      <span className="text-[12px] font-bold text-black whitespace-nowrap leading-none pb-[3px]">
        {label}:
      </span>
      <span className="flex-1 border-b border-black px-1 text-[13px] font-semibold text-black leading-tight min-h-[22px] truncate pb-[3px] text-center">
        {displayVal || '\u00A0'}
      </span>
    </div>
  );
}

export const AdmissionFormPrintView = forwardRef<
  HTMLDivElement,
  { data: AdmissionFormPrintData; className?: string; id?: string; verifyUrl?: string }
>(function AdmissionFormPrintView({ data, className = '', id, verifyUrl }, ref) {
  const photoSrc = data.pictureBase64
    ? data.pictureBase64.startsWith('data:')
      ? data.pictureBase64
      : `data:image/jpeg;base64,${data.pictureBase64}`
    : null;

  // The QR only appears once a record has a verifyUrl (i.e. it has already
  // been saved and has a row number) — a still-being-filled draft has
  // nothing yet to verify against, so it stays off that view.
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (!verifyUrl) {
      setQrDataUrl(null);
      return;
    }
    QRCode.toDataURL(verifyUrl, { width: 160, margin: 0, errorCorrectionLevel: 'M' })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [verifyUrl]);

  return (
    <div
      ref={ref}
      id={id}
      className={`a4-admission-form bg-white text-black font-sans border border-slate-300 print:border-none print:p-0 ${className}`}
      style={{
        width: '100%',
        maxWidth: '780px',
        // No forced minHeight/space-between stretch here — this div has a
        // single wrapping child, so "space-between" had no effect anyway,
        // and forcing a tall minHeight only baked a big blank strip into
        // the exported PDF/print when the actual content was shorter. Let
        // the box size to its real content instead.
        margin: '0 auto',
        padding: '34px 42px',
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
      }}
    >
      <div>
        {/* Top Banner: Sr No and Admission Form Box */}
        <div className="flex items-center justify-between pb-[13px]">
        <div className="flex items-baseline gap-1.5 text-[13px] font-bold">
          <span>Sr No.</span>
          <span className="inline-block border-b border-black px-2 text-[13px] font-bold text-black min-w-[70px] text-center">
            {data.srNo || '\u00A0'}
          </span>
        </div>
        <div className="rounded-md border-2 border-black px-4 py-0.5 text-[13px] font-extrabold uppercase tracking-wide">
          Admission Form
        </div>
      </div>

      {/* School Header */}
      <div className="border-b-2 border-black pb-[13px]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex h-[76px] w-[76px] flex-shrink-0 items-center justify-center">
            {/* Plain <img>, not next/image — html2canvas captures the Next.js
                Image optimizer's srcset unreliably (logo sometimes rendered
                stretched/blank in the exported PDF). A direct static file is
                simple pixel data html2canvas handles correctly every time. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/sindh-govt-logo-black.png"
              alt="Government of Sindh Logo"
              width={76}
              height={76}
              className="h-full w-full object-contain"
            />
          </div>

          <div className="flex-1 text-center leading-snug">
            <h1 className="text-[16px] font-extrabold uppercase tracking-wide text-black">
              Govt. Girls / Boys Secondary School (GG/BSS)
            </h1>
            <p className="text-[13px] font-bold uppercase tracking-wider text-black">
              Nishtar Road Campus
            </p>
            <p className="text-[11px] text-slate-800">
              Nishtar Road, Karachi - Sindh, Pakistan
            </p>
            <p className="text-[11px] font-bold text-black">
              SEMIS Code : 408070227
            </p>
          </div>

          <div className="flex h-[76px] w-[76px] flex-shrink-0 items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/ggssnishtar_mastersahib.png"
              alt="GGSS Nishtar Road School Logo"
              width={76}
              height={76}
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Photo box on top-right */}
      <div className="relative mt-[13px]">
        <div className="absolute right-0 top-0 z-10">
          <div className="h-[112px] w-[94px] border border-black bg-white flex items-center justify-center overflow-hidden text-center">
            {photoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoSrc}
                alt="Student"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="p-1 text-[9px] font-medium leading-tight text-slate-500">
                Paste Recent Photograph
              </span>
            )}
          </div>
        </div>

        {/* Student Personal Data Section */}
        <div className="pr-[104px] space-y-[8px]">
          <SectionHeading>Student Personal Data</SectionHeading>
          <div className="flex gap-3">
            <Field label="Roll No. (Allotted by office)" value={data.rollNo} flex={1} />
            <Field label="GR No. (Allotted by office)" value={data.grNo} flex={1} />
          </div>
          <div className="flex">
            <Field label="Name of Student" value={data.studentName} flex={1} />
          </div>
          <div className="flex gap-3">
            <Field label="Date of Birth" value={data.dob} flex={1} />
            <Field label="in words (auto)" value={data.dobWords} flex={1.6} />
          </div>
          <div className="flex gap-2">
            <Field label="Nationality" value={data.nationality || 'Pakistani'} flex={1} />
            <Field label="Surname" value={data.surname} flex={1} />
            <Field label="Religion" value={data.religion || 'Islam'} flex={1} />
          </div>
        </div>
      </div>

      {/* Previous School & Admission Details */}
      <div className="space-y-[8px] mt-[14px]">
        <div className="flex">
          <Field label="Previous Class" value={data.previousClass} flex={1} />
        </div>
        <div className="flex">
          <Field label="School Name where last studied" value={data.lastSchool} flex={1} />
        </div>
        <div className="flex gap-3">
          <Field label="Reason for leaving Previous School" value={data.leavingReason} flex={1.2} />
          <Field label="Date of leaving previous School" value={data.leavingDate} flex={1} />
        </div>
        <div className="flex gap-3">
          <Field label="In which class admission sought out" value={data.admissionClass} flex={1.2} />
          <Field label="Date of Admission" value={data.admissionDate} flex={1} />
        </div>
        {(data.admissionClass === 'IX' || data.admissionClass === 'X' || data.academicGroup || data.electiveSubject) ? (
          <div className="flex gap-3">
            <Field label="Faculty / Group" value={data.academicGroup || '-'} flex={1.2} />
            <Field label="Elective Subject" value={data.electiveSubject || '-'} flex={1} />
          </div>
        ) : null}
        <div className="flex items-end gap-3">
          <div className="flex items-center gap-2 text-[11px] font-bold text-black whitespace-nowrap">
            <span>Nadra (B Form, CRC):</span>
            <span className="font-semibold text-[11px]">
              [{data.nadraStatus === 'Available' ? '✔' : ' '}] Available
            </span>
            <span className="font-semibold text-[11px]">
              [{data.nadraStatus === 'Not Available' ? '✔' : ' '}] Not Available
            </span>
          </div>
          <Field label="If Yes No." value={data.bFormNo} flex={1} />
        </div>
        <div className="flex">
          <Field label="Address" value={data.address} flex={1} />
        </div>
      </div>

      {/* Parents / Guardian's Personal Data */}
      <SectionHeading>Parents / Guardian&apos;s Personal Data</SectionHeading>
      <div className="space-y-[8px]">
        <div className="flex gap-3">
          <Field label="Father's Name" value={data.fatherName} flex={1.3} />
          <Field label="CNIC No" value={data.fatherCnic} flex={1} />
        </div>
        <div className="flex gap-3">
          <Field label="Father's Cell No." value={data.fatherCell} flex={1} />
          <Field label="Guardian's Cell No." value={data.guardianCell} flex={1} />
        </div>
        <div className="flex gap-3">
          <Field label="Qualification" value={data.fatherQualification} flex={1} />
          <Field label="Occupation" value={data.fatherOccupation} flex={1} />
        </div>
        <div className="flex">
          <Field label="Company Name & Address where doing job" value={data.companyDetails} flex={1} />
        </div>
        <div className="flex gap-3">
          <Field label="Mother's Name" value={data.motherName} flex={1.3} />
          <Field label="CNIC No" value={data.motherCnic} flex={1} />
        </div>
        <div className="flex gap-3">
          <Field label="Mother's Cell No." value={data.motherCell} flex={1} />
          <Field label="WhatsApp No." value={data.whatsappNo} flex={1} />
        </div>
      </div>

      {/* Parent Signature + verification QR */}
      <div className="mt-[14px] flex items-end justify-between">
        {qrDataUrl ? (
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="Verification QR code" className="h-[42px] w-[42px]" />
            <p className="mt-[1px] text-[7px] font-semibold uppercase leading-none tracking-wide text-slate-600">
              Scan to verify
            </p>
          </div>
        ) : (
          <div />
        )}
        <div className="w-[230px] text-center">
          <div className="h-[24px] border-b border-black mb-[2px]" />
          <p className="text-[11px] font-bold text-black">Parents / Guardian&apos;s Sign.</p>
        </div>
      </div>

      {/* For Office Use Only */}
      <SectionHeading>For Office Use Only</SectionHeading>
      <div className="space-y-[8px]">
        <div className="flex gap-3">
          <Field label="Class in which admitted" value={data.officeClassAdmitted} flex={1} />
          <Field label="Date of Admission" value={data.officeAdmissionDate} flex={1} />
        </div>
        <div className="flex gap-3">
          <Field label="Campus Head Signature" value={data.campusHeadSign} flex={1} />
          <Field label="Academic Incharge Signature" value={data.academicInchargeSign} flex={1} />
        </div>
        <div className="flex gap-3">
          <Field label="Prepared by" value={data.preparedBy} flex={1.2} />
          <Field label="Sign." value={data.preparedSign} flex={0.8} />
          <Field label="Date" value={data.officeDate} flex={0.8} />
        </div>
      </div>

        {/* Documents list footer */}
        <div className="mt-[16px] border-t-2 border-black pt-[9px] text-[11px] leading-snug text-slate-800">
          <p className="mb-[3px] font-bold text-black">Documents to be attached along with:</p>
          <p>
            1. Previous School Leaving Certificate (TC) &nbsp;&nbsp;&nbsp; 2. Father &amp; Mother CNIC Copies &nbsp;&nbsp;&nbsp; 3. Birth / Child Registration Certificate
            <br />
            4. Form &quot;B&quot; Issued by NADRA Office &nbsp;&nbsp;&nbsp; 5. Recent Photographs (05 Nos.)
          </p>
        </div>
      </div>
    </div>
  );
});

AdmissionFormPrintView.displayName = 'AdmissionFormPrintView';
