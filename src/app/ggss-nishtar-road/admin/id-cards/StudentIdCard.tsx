'use client';

// Front and back of a single CR80 student ID card — built directly on top
// of the school-approved template images (public/images/id-cards/*.png),
// exported page-for-page from the "Blue and White Modern Student ID Card"
// PDF the school provided. Nothing here is redrawn or approximated in CSS:
// the PNGs ARE the card design (logo, curve, colors, "TERMS & CONDITIONS"
// panel — all of it), at their real CR80 print size (85.6mm x 54mm, the
// PDF pages themselves are exactly that size). This component only lays
// the live student data (photo, Name, Student ID, D.O.B, Address) and a
// QR code on top of the front template, at the exact spots the template
// already reserves for them. The back template is used completely as-is —
// no overlay, no added fields — per instruction.
//
// Two colour variants exist (blue = Boys, pink = Girls), picked
// automatically from each student's own Gender field on the admission form
// (idCardUtils.resolveGender sets data.gender when the record is loaded) —
// no manual per-student choice here.

import { getInitials, type IdCardData } from './idCardUtils';

const FRONT_TEMPLATES: Record<IdCardData['gender'], string> = {
  boys: '/images/id-cards/boys-front-template.png',
  girls: '/images/id-cards/girls-front-template.png',
};
const BACK_TEMPLATES: Record<IdCardData['gender'], string> = {
  boys: '/images/id-cards/boys-back-template.png',
  girls: '/images/id-cards/girls-back-template.png',
};

type FrontProps = {
  data: IdCardData;
};

export function IdCardFront({ data }: FrontProps) {
  return (
    <div className="id-card card-front">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={FRONT_TEMPLATES[data.gender]} alt="" className="card-template-img" />

      <div className="card-photo-slot">
        {data.photoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.photoSrc} alt={data.name || 'Student photo'} />
        ) : (
          <span className="card-photo-fallback">{getInitials(data.name)}</span>
        )}
      </div>

      <div className="card-value card-value-name">{data.name || '—'}</div>
      <div className="card-value card-value-id">{data.grNo || data.rollNo || '—'}</div>
      <div className="card-value card-value-dob">{data.dob || '—'}</div>
      <div className="card-value card-value-address">{data.address || '—'}</div>

      <div className="card-qr-slot">
        {data.qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.qrDataUrl} alt="QR code" />
        ) : (
          <div className="card-qr-placeholder" />
        )}
      </div>
    </div>
  );
}

// Back is the school's Terms & Conditions template, unchanged — no
// per-student data belongs on it, so it's just the matching-colour image.
type BackProps = { gender: IdCardData['gender'] };

export function IdCardBack({ gender }: BackProps) {
  return (
    <div className="id-card card-back">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={BACK_TEMPLATES[gender]} alt="Terms and Conditions" className="card-template-img" />
    </div>
  );
}
