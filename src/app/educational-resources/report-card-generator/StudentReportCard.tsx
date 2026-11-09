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
  schoolName?: string;      // School name if specified per student or overall
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
  { key: 'islamiat_total', label: 'Islamiat' },
  { key: 'g_science', label: 'G. Science' },
  { key: 'mathematics', label: 'Mathematics' },
  { key: 'h_economics', label: 'H. Economics' },
  { key: 'arabic_drawing', label: 'Arabic / Drawing' },
  { key: 'biology_computer', label: 'Biology/Computer', compactText: true },
  { key: 'physics', label: 'Physics' },
  { key: 'chemistry', label: 'Chemistry' },
];

export interface SchoolConfig {
  name: string;
  logoSrc: string;
  headSignTitle: string;
}

export const DEFAULT_SCHOOL_CONFIG: SchoolConfig = {
  name: '',
  logoSrc: '/images/pakistan_quarter_logo.png',
  headSignTitle: 'Sign. of Head Master / Mistress',
};

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
  school = DEFAULT_SCHOOL_CONFIG,
}: {
  data: ReportCardStudentData;
  school?: SchoolConfig;
}) {
  const [addressLine1, addressLine2] = splitAddressLines(data.address);
  const activeSchool = school || DEFAULT_SCHOOL_CONFIG;
  const displayName = activeSchool.name?.trim() || data.schoolName?.trim() || '';

  return (
    <div className="rc-a5-slot">
      <div className="rc-outer-border">
        <div className="rc-inner-border rc-front-content">
          {/* Prominent School Emblem Logo */}
          <div className="rc-front-logo-header">
                        <img
              src={activeSchool.logoSrc || '/images/pakistan_quarter_logo.png'}
              alt={displayName || 'School Emblem'}
              className="rc-prominent-school-logo"
            />
          </div>

          {/* School Name (if provided) */}
          {displayName ? (
            <div className="rc-front-school-title" title={displayName}>
              {displayName}
            </div>
          ) : null}

          {/* Progress Report Pill Badge */}
          <div className="rc-badge-wrap">
            <div className="rc-progress-pill">
              <span className="rc-blackletter-text">Progress Report</span>
            </div>
          </div>

          {/* Session Year Line: 20.... - 20.... */}
          <div className="rc-session-year-row">
            <span className="rc-year-prefix">20</span>
            <span className="rc-year-dots">{data.sessionStartYear || ''}</span>
            <span className="rc-year-dash">-</span>
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

const formatExamBannerYear = (suffix: string) => {
  const clean = String(suffix || '').trim();
  if (!clean) return '____';
  if (clean.length === 4) return clean;
  if (clean.length === 2) return `20${clean}`;
  return clean.startsWith('20') ? clean : `20${clean}`;
};

export function ReportCardBack({
  data,
  school = DEFAULT_SCHOOL_CONFIG,
  subjectRows = REPORT_SUBJECT_ROWS,
}: {
  data: ReportCardStudentData;
  school?: SchoolConfig;
  subjectRows?: Array<{ key: string; label: string; compactText?: boolean }>;
}) {
  const activeSchool = school || DEFAULT_SCHOOL_CONFIG;

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
                            <img
                src={activeSchool.logoSrc || '/images/pakistan_quarter_logo.png'}
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
                {subjectRows.map((subj, idx) => {
                  const score = data.subjects[subj.key] || { maxMarks: '', marksObtained: '' };

                  if (subj.key === 'islamiat_total') {
                    const oral = data.subjects.islamiat_oral || { maxMarks: '', marksObtained: '' };
                    const written = data.subjects.islamiat_written || { maxMarks: '', marksObtained: '' };
                    const hasOral = Boolean(oral.marksObtained && String(oral.marksObtained).trim() !== '' && String(oral.marksObtained).trim() !== '-');
                    const hasWritten = Boolean(written.marksObtained && String(written.marksObtained).trim() !== '' && String(written.marksObtained).trim() !== '-');
                    const hasTotal = Boolean(score.marksObtained && String(score.marksObtained).trim() !== '' && String(score.marksObtained).trim() !== '-');
                    const hasIsl = hasOral || hasWritten || hasTotal;

                    const oralMax = hasIsl ? (oral.maxMarks || '40') : '-';
                    const writtenMax = hasIsl ? (written.maxMarks || '60') : '-';
                    const oralMarks = hasOral ? ` (${oral.marksObtained})` : '';
                    const writtenMarks = hasWritten ? ` (${written.marksObtained})` : '';

                    return (
                      <tr key={subj.key} className="rc-subj-row rc-islamiat-row">
                        <td className="rc-islamiat-cell">
                          <div className="rc-islamiat-grid">
                            <div className="rc-islamiat-main">{subj.label}</div>
                            <div className="rc-islamiat-sub">
                              <div className="rc-islamiat-sub-top">
                                <span>Nazra / Oral</span>
                                <span className="rc-islamiat-num">{oralMax}{oralMarks}</span>
                              </div>
                              <div className="rc-islamiat-sub-bottom">
                                <span>Written</span>
                                <span className="rc-islamiat-num">{writtenMax}{writtenMarks}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="rc-num-cell">{hasIsl ? (score.maxMarks || '100') : '-'}</td>
                        <td className="rc-num-cell">{hasIsl ? score.marksObtained : '-'}</td>
                        {idx === 0 ? (
                          <td rowSpan={subjectRows.length + 1} className="rc-remarks-merged-cell">
                            <RemarksColumnContent data={data} />
                          </td>
                        ) : null}
                      </tr>
                    );
                  }

                  const hasMarks = Boolean(score.marksObtained && String(score.marksObtained).trim() !== '' && String(score.marksObtained).trim() !== '-');

                  return (
                    <tr key={subj.key} className="rc-subj-row">
                      <td className={`rc-subj-name-cell ${subj.compactText || subj.label.length > 18 ? 'rc-subj-compact' : ''}`}>
                        {subj.label}
                      </td>
                      <td className="rc-num-cell">{hasMarks ? score.maxMarks : '-'}</td>
                      <td className="rc-num-cell">{hasMarks ? score.marksObtained : '-'}</td>
                      {idx === 0 ? (
                        <td rowSpan={subjectRows.length + 1} className="rc-remarks-merged-cell">
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
              <span className="rc-footer-label">{activeSchool.headSignTitle || 'Sign. of Head Master / Mistress'}</span>
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

export function formatAttendancePercentage(val: string | number | undefined | null): string {
  if (!val) return '95%';
  const clean = String(val).trim();
  if (!clean) return '95%';
  if (clean.endsWith('%')) return clean;

  // Fraction like 180/200
  if (clean.includes('/')) {
    const parts = clean.split('/').map((p) => parseFloat(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[1] > 0) {
      return `${Math.round((parts[0] / parts[1]) * 100)}%`;
    }
  }

  const num = parseFloat(clean);
  if (!isNaN(num)) {
    if (num <= 1 && num > 0) {
      return `${Math.round(num * 100)}%`;
    }
    return `${Math.round(num)}%`;
  }
  return clean;
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
        <div className="rc-remark-value">{formatAttendancePercentage(data.attendance)}</div>
      </div>
    </div>
  );
}
