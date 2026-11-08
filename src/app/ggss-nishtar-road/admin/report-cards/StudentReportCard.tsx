'use client';

import React from 'react';

export type SubjectKey =
  | 'english'
  | 'urdu'
  | 'social_pak_studies'
  | 'sindhi'
  | 'islamiat_oral'
  | 'islamiat_written'
  | 'islamiat_total'
  | 'g_science'
  | 'mathematics'
  | 'h_economics'
  | 'arabic_drawing'
  | 'biology_computer'
  | 'physics'
  | 'chemistry';

export type SubjectScore = {
  maxMarks: string;
  marksObtained: string;
};

export type ReportCardStudentData = {
  rowNumber: string;
  rollNo: string;
  grNo: string;
  name: string;
  fatherName: string;
  studentClass: string;
  dob: string;
  address: string;
  sessionStartYear: string; // e.g. "26" for 2026
  sessionEndYear: string;   // e.g. "27" for 2027
  sessionFull: string;      // e.g. "2026-2027"
  examTitle: string;        // e.g. "MID TERM EXAMINATION"
  examYearSuffix: string;   // e.g. "26"
  subjects: Partial<Record<SubjectKey, SubjectScore>>;
  grandTotalMax: string;
  grandTotalObtained: string;
  result: string;
  percentage: string;
  grade: string;
  rank: string;
  attendance: string;
  conduct: string;
};

export const REPORT_SUBJECT_ROWS: Array<{
  key: SubjectKey;
  label: string;
  compactText?: boolean;
}> = [
  { key: 'english', label: 'English' },
  { key: 'urdu', label: 'Urdu' },
  { key: 'social_pak_studies', label: 'S. Studies / Pak. Studies', compactText: true },
  { key: 'sindhi', label: 'Sindhi' },
  // Islamiat is rendered specially with Nazra/Oral 40 & Written 60 split
  { key: 'islamiat_total', label: 'Islamiat' },
  { key: 'g_science', label: 'G. Science' },
  { key: 'mathematics', label: 'Mathematics' },
  { key: 'h_economics', label: 'H. Economics' },
  { key: 'arabic_drawing', label: 'Arabic / Drawing' },
  { key: 'biology_computer', label: 'Biology/Computer', compactText: true },
  { key: 'physics', label: 'Physics' },
  { key: 'chemistry', label: 'Chemistry' },
];

export type SchoolId = 'gbss_pak_quarter' | 'ggss_nishtar_road';

export interface SchoolConfig {
  id: SchoolId;
  name: string;
  shortName: string;
  archTitle: string;
  locationTitle: string;
  logoSrc: string;
  headSignTitle: string;
}

export const SCHOOL_PRESETS: Record<SchoolId, SchoolConfig> = {
  gbss_pak_quarter: {
    id: 'gbss_pak_quarter',
    name: 'Govt Boys Pri/Secondary School Pakistan Quarter , N/R Karachi',
    shortName: 'Pakistan Quarter (Boys)',
    archTitle: '',
    locationTitle: '',
    logoSrc: '/images/pakistan_quarter_logo.png',
    headSignTitle: 'Sign. of Head Master / Mistress',
  },
  ggss_nishtar_road: {
    id: 'ggss_nishtar_road',
    name: 'Govt Girls Secondary School Nishtar Road, Karachi',
    shortName: 'Nishtar Road (Girls)',
    archTitle: '',
    locationTitle: '',
    logoSrc: '/images/ggssnishtar_mastersahib.png',
    headSignTitle: 'Sign. of Head Mistress / Master',
  },
};

export const DEFAULT_SCHOOL_ID: SchoolId = 'gbss_pak_quarter';

// Split long address across two lines on the front cover
const splitAddressLines = (address: string): [string, string] => {
  const clean = String(address || '').trim();
  if (!clean) return ['', ''];
  if (clean.length <= 42) return [clean, ''];
  const breakIdx = clean.lastIndexOf(' ', 42);
  if (breakIdx > 15) {
    return [clean.slice(0, breakIdx).trim(), clean.slice(breakIdx + 1).trim()];
  }
  return [clean.slice(0, 42).trim(), clean.slice(42).trim()];
};

export function ReportCardFront({
  data,
  school = SCHOOL_PRESETS.gbss_pak_quarter,
}: {
  data: ReportCardStudentData;
  school?: SchoolConfig;
}) {
  const [addressLine1, addressLine2] = splitAddressLines(data.address);
  const activeSchool = school || SCHOOL_PRESETS.gbss_pak_quarter;

  return (
    <div className="rc-a5-slot">
      <div className="rc-outer-border">
        <div className="rc-inner-border rc-front-content">
          {/* Prominent School Emblem Logo (Self-contained circular seal) */}
          <div className="rc-front-logo-header">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeSchool.logoSrc}
              alt={activeSchool.name}
              className="rc-prominent-school-logo"
            />
          </div>

          {/* Progress Report Pill Badge */}
          <div className="rc-badge-wrap">
            <div className="rc-progress-pill">
              <span className="rc-blackletter-text">Progress Report</span>
            </div>
          </div>

          {/* Session Year Line: 20........20........ */}
          <div className="rc-session-year-row">
            <span className="rc-year-prefix">20</span>
            <span className="rc-year-dots">{data.sessionStartYear || ''}</span>
            <span className="rc-year-prefix">20</span>
            <span className="rc-year-dots">{data.sessionEndYear || ''}</span>
          </div>

          {/* Student Bio Fields */}
          <div className="rc-front-fields">
            <div className="rc-field-row-split">
              <div className="rc-field-line" style={{ flex: 1 }}>
                <span className="rc-field-label">Roll No.</span>
                <span className="rc-field-value">{data.rollNo}</span>
              </div>
              <div className="rc-field-line" style={{ flex: 1 }}>
                <span className="rc-field-label">G. R No.</span>
                <span className="rc-field-value">{data.grNo}</span>
              </div>
            </div>

            <div className="rc-field-line">
              <span className="rc-field-label">Name</span>
              <span className="rc-field-value">{data.name}</span>
            </div>

            <div className="rc-field-line">
              <span className="rc-field-label">Father&apos;s Name</span>
              <span className="rc-field-value">{data.fatherName}</span>
            </div>

            <div className="rc-field-line">
              <span className="rc-field-label">Class</span>
              <span className="rc-field-value">{data.studentClass}</span>
            </div>

            <div className="rc-field-line">
              <span className="rc-field-label">Date of Birth</span>
              <span className="rc-field-value">{data.dob}</span>
            </div>

            <div className="rc-field-line">
              <span className="rc-field-label">Address</span>
              <span className="rc-field-value rc-field-value-left">{addressLine1}</span>
            </div>

            <div className="rc-field-line">
              <span className="rc-field-value rc-field-value-left">{addressLine2}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to format 4-digit year for the exam banner (e.g. "26" -> "2026")
const formatExamBannerYear = (suffix: string) => {
  const clean = String(suffix || '').trim();
  if (!clean) return '____';
  if (clean.length === 4) return clean;
  if (clean.length === 2) return `20${clean}`;
  return clean.startsWith('20') ? clean : `20${clean}`;
};

export function ReportCardBack({
  data,
  school = SCHOOL_PRESETS.gbss_pak_quarter,
}: {
  data: ReportCardStudentData;
  school?: SchoolConfig;
}) {
  const activeSchool = school || SCHOOL_PRESETS.gbss_pak_quarter;
  return (
    <div className="rc-a5-slot">
      <div className="rc-outer-border">
        <div className="rc-inner-border rc-back-content">
          {/* Top Session & Class Bar */}
          <div className="rc-back-top-row">
            <div className="rc-back-top-field" style={{ width: '48%' }}>
              <span className="rc-back-top-label">Session :</span>
              <span className="rc-back-top-val">{data.sessionFull}</span>
            </div>
            <div className="rc-back-top-field" style={{ width: '44%' }}>
              <span className="rc-back-top-label">Class:</span>
              <span className="rc-back-top-val">{data.studentClass}</span>
            </div>
          </div>

          {/* Main Result Table */}
          <div className="rc-table-wrapper">
            {/* Centered Watermark Logo */}
            <div className="rc-watermark-wrap" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeSchool.logoSrc}
                alt=""
                className="rc-watermark-img"
              />
            </div>

            <table className="rc-marks-table">
              <colgroup>
                <col style={{ width: '43%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '23%' }} />
              </colgroup>
              <thead>
                {/* Exam Title Row */}
                <tr>
                  <th colSpan={4} className="rc-exam-banner-cell">
                    <span className="rc-exam-title-text">
                      {data.examTitle || 'SUMMATIVE ASSESSMENT - 1'}
                    </span>
                    <span className="rc-exam-year-badge">
                      ( {formatExamBannerYear(data.examYearSuffix)} )
                    </span>
                  </th>
                </tr>
                {/* Column Headers */}
                <tr className="rc-col-header-row">
                  <th>SUBJECT</th>
                  <th>
                    <div className="rc-two-line-th">
                      <span>Max</span>
                      <span>Marks</span>
                    </div>
                  </th>
                  <th>
                    <div className="rc-two-line-th">
                      <span>Marks</span>
                      <span>Obtained</span>
                    </div>
                  </th>
                  <th>REMARKS</th>
                </tr>
              </thead>
              <tbody>
                {REPORT_SUBJECT_ROWS.map((subj, idx) => {
                  const score = data.subjects[subj.key] || { maxMarks: '', marksObtained: '' };

                  if (subj.key === 'islamiat_total') {
                    return (
                      <tr key={subj.key} className="rc-subj-row rc-islamiat-row">
                        <td className="rc-islamiat-cell">
                          <div className="rc-islamiat-grid">
                            <div className="rc-islamiat-main">Islamiat</div>
                            <div className="rc-islamiat-sub">
                              <div className="rc-islamiat-sub-top">
                                <span>Nazra / Oral</span>
                                <span className="rc-islamiat-num">40</span>
                              </div>
                              <div className="rc-islamiat-sub-bottom">
                                <span>Written</span>
                                <span className="rc-islamiat-num">60</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="rc-num-cell">{score.maxMarks}</td>
                        <td className="rc-num-cell">{score.marksObtained}</td>
                        {idx === 0 ? (
                          <td rowSpan={REPORT_SUBJECT_ROWS.length + 1} className="rc-remarks-merged-cell">
                            <RemarksColumnContent data={data} />
                          </td>
                        ) : null}
                      </tr>
                    );
                  }

                  return (
                    <tr key={subj.key} className="rc-subj-row">
                      <td className={`rc-subj-name-cell ${subj.compactText ? 'rc-subj-compact' : ''}`}>
                        {subj.label}
                      </td>
                      <td className="rc-num-cell">{score.maxMarks}</td>
                      <td className="rc-num-cell">{score.marksObtained}</td>
                      {idx === 0 ? (
                        <td rowSpan={REPORT_SUBJECT_ROWS.length + 1} className="rc-remarks-merged-cell">
                          <RemarksColumnContent data={data} />
                        </td>
                      ) : null}
                    </tr>
                  );
                })}

                {/* Grand Total Row */}
                <tr className="rc-subj-row rc-grand-total-row">
                  <td className="rc-subj-name-cell rc-grand-total-label">Grand Total</td>
                  <td className="rc-num-cell rc-grand-total-val">{data.grandTotalMax}</td>
                  <td className="rc-num-cell rc-grand-total-val">{data.grandTotalObtained}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bottom Conduct & Signatures */}
          <div className="rc-back-footer">
            <div className="rc-footer-line">
              <span className="rc-footer-label">Conduct</span>
              <span className="rc-footer-val">{data.conduct}</span>
            </div>
            <div className="rc-footer-line">
              <span className="rc-footer-label">Sign. of Class Teacher</span>
              <span className="rc-footer-val"></span>
            </div>
            <div className="rc-footer-line">
              <span className="rc-footer-label">{activeSchool.headSignTitle}</span>
              <span className="rc-footer-val"></span>
            </div>
            <div className="rc-footer-line">
              <span className="rc-footer-label">Sign. of Parent / Guardian</span>
              <span className="rc-footer-val"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RemarksColumnContent({ data }: { data: ReportCardStudentData }) {
  return (
    <div className="rc-remarks-stack">
      <div className="rc-remark-item">
        <div className="rc-remark-heading">RESULT</div>
        <div className="rc-remark-value">{data.result}</div>
      </div>
      <div className="rc-remark-item">
        <div className="rc-remark-heading">PERCENTAGE</div>
        <div className="rc-remark-value">{data.percentage}</div>
      </div>
      <div className="rc-remark-item">
        <div className="rc-remark-heading">GRADE</div>
        <div className="rc-remark-value">{data.grade}</div>
      </div>
      <div className="rc-remark-item">
        <div className="rc-remark-heading">RANK</div>
        <div className="rc-remark-value">{data.rank}</div>
      </div>
      <div className="rc-remark-item">
        <div className="rc-remark-heading">ATTENDANCE</div>
        <div className="rc-remark-value">{data.attendance}</div>
      </div>
    </div>
  );
}
