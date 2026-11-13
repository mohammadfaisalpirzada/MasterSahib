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
            <span className="rc-year-dots"><span>{data.sessionStartYear || ''}</span></span>
            <span className="rc-year-dash">-</span>
            <span className="rc-year-prefix">20</span>
            <span className="rc-year-dots"><span>{data.sessionEndYear || ''}</span></span>
          </div>

          {/* Student Bio Fields */}
          <div className="rc-front-fields">
            <div className="rc-field-row-split">
              <div className="rc-field-line" style={{ flex: 1 }}>
                <span className="rc-field-label">Roll No.</span>
                <span className="rc-field-value">
                  <span className="rc-field-text">{data.rollNo}</span>
                </span>
              </div>
              <div className="rc-field-line" style={{ flex: 1 }}>
                <span className="rc-field-label">G. R No.</span>
                <span className="rc-field-value">
                  <span className="rc-field-text">{data.grNo}</span>
                </span>
              </div>
            </div>

            <div className="rc-field-line">
              <span className="rc-field-label">Name</span>
              <span className="rc-field-value">
                <span className="rc-field-text">{data.name}</span>
              </span>
            </div>

            <div className="rc-field-line">
              <span className="rc-field-label">Father&apos;s Name</span>
              <span className="rc-field-value">
                <span className="rc-field-text">{data.fatherName}</span>
              </span>
            </div>

            <div className="rc-field-line">
              <span className="rc-field-label">Class</span>
              <span className="rc-field-value">
                <span className="rc-field-text">{data.studentClass}</span>
              </span>
            </div>

            <div className="rc-field-line">
              <span className="rc-field-label">Date of Birth</span>
              <span className="rc-field-value">
                <span className="rc-field-text">{data.dob}</span>
              </span>
            </div>

            <div className="rc-field-line">
              <span className="rc-field-label">Address</span>
              <span className="rc-field-value rc-field-value-left">
                <span className="rc-field-text">{addressLine1}</span>
              </span>
            </div>

            <div className="rc-field-line">
              <span className="rc-field-value rc-field-value-left">
                <span className="rc-field-text">{addressLine2}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const clampDisplayObtained = (rawObt: string | undefined, maxStr: string | undefined): string => {
  const clean = rawObt != null ? String(rawObt).trim() : '';
  if (clean === '' || clean === '-') return clean;
  const max = parseFloat(maxStr || '0') || 0;
  const obt = parseFloat(clean);
  if (isNaN(obt)) return clean;
  if (obt < 0) return '0';
  if (max > 0 && obt > max) return String(max);
  return clean;
};

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
  isDummy = false,
  passingPct = 40,
}: {
  data: ReportCardStudentData;
  school?: SchoolConfig;
  subjectRows?: Array<{ key: string; label: string; compactText?: boolean }>;
  isDummy?: boolean;
  passingPct?: number;
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
              <span className="rc-back-top-val"><span>{data.sessionFull}</span></span>
            </div>
            <div className="rc-back-top-field" style={{ width: '44%' }}>
              <span className="rc-back-top-label">Class:</span>
              <span className="rc-back-top-val"><span>{data.studentClass}</span></span>
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

                    const islTotalMaxStr = score.maxMarks || '100';
                    const islTotalMaxNum = parseFloat(islTotalMaxStr) || 100;
                    const defaultOralNum = Math.round(islTotalMaxNum * 0.4);
                    const defaultWrittenNum = Math.max(0, islTotalMaxNum - defaultOralNum);

                    const oralMax = hasIsl ? (oral.maxMarks || String(defaultOralNum)) : '-';
                    const writtenMax = hasIsl ? (written.maxMarks || String(defaultWrittenNum)) : '-';

                    const oralObtDisplay = clampDisplayObtained(oral.marksObtained, oralMax);
                    const writtenObtDisplay = clampDisplayObtained(written.marksObtained, writtenMax);
                    const islObtDisplay = clampDisplayObtained(score.marksObtained, islTotalMaxStr);

                    const oralMaxNum = parseFloat(oralMax) || 0;
                    const oralObtNum = parseFloat(oralObtDisplay || '0') || 0;
                    const isOralFailed = hasOral && oralMaxNum > 0 && ((oralObtNum / oralMaxNum) * 100 < passingPct);

                    const writtenMaxNum = parseFloat(writtenMax) || 0;
                    const writtenObtNum = parseFloat(writtenObtDisplay || '0') || 0;
                    const isWrittenFailed = hasWritten && writtenMaxNum > 0 && ((writtenObtNum / writtenMaxNum) * 100 < passingPct);

                    const islObtNum = parseFloat(islObtDisplay || '0') || 0;
                    const isIslFailed = hasIsl && islTotalMaxNum > 0 && ((islObtNum / islTotalMaxNum) * 100 < passingPct);

                    return (
                      <tr key={subj.key} className="rc-subj-row rc-islamiat-row">
                        <td className="rc-islamiat-cell">
                          <div className="rc-islamiat-grid">
                            <div className="rc-islamiat-main">{subj.label}</div>
                            <div className="rc-islamiat-sub">
                              <div className="rc-islamiat-sub-top">
                                <span>Nazra / Oral</span>
                                <span className="rc-islamiat-num">
                                  {oralMax}
                                  {hasOral ? (
                                    <span className={isDummy ? 'rc-dummy-num' : ''}>
                                      {' ('}
                                      {isOralFailed ? (
                                        <span className="rc-failed-mark">{oralObtDisplay}</span>
                                      ) : (
                                        oralObtDisplay
                                      )}
                                      {')'}
                                    </span>
                                  ) : null}
                                </span>
                              </div>
                              <div className="rc-islamiat-sub-bottom">
                                <span>Written</span>
                                <span className="rc-islamiat-num">
                                  {writtenMax}
                                  {hasWritten ? (
                                    <span className={isDummy ? 'rc-dummy-num' : ''}>
                                      {' ('}
                                      {isWrittenFailed ? (
                                        <span className="rc-failed-mark">{writtenObtDisplay}</span>
                                      ) : (
                                        writtenObtDisplay
                                      )}
                                      {')'}
                                    </span>
                                  ) : null}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="rc-num-cell">{hasIsl ? islTotalMaxStr : '-'}</td>
                        <td className={`rc-num-cell ${isDummy && hasIsl ? 'rc-dummy-num' : ''}`}>
                          {hasIsl ? (
                            isIslFailed ? (
                              <span className="rc-failed-mark">{islObtDisplay}</span>
                            ) : (
                              islObtDisplay
                            )
                          ) : (
                            '-'
                          )}
                        </td>
                        {idx === 0 ? (
                          <td rowSpan={subjectRows.length + 1} className="rc-remarks-merged-cell">
                            <RemarksColumnContent data={data} isDummy={isDummy} />
                          </td>
                        ) : null}
                      </tr>
                    );
                  }

                  const hasMarks = Boolean(score.marksObtained && String(score.marksObtained).trim() !== '' && String(score.marksObtained).trim() !== '-');
                  const obtDisplay = clampDisplayObtained(score.marksObtained, score.maxMarks);
                  const maxNum = parseFloat(score.maxMarks || '0') || 0;
                  const obtNum = parseFloat(obtDisplay || '0') || 0;
                  const isFailed = hasMarks && maxNum > 0 && ((obtNum / maxNum) * 100 < passingPct);

                  return (
                    <tr key={subj.key} className="rc-subj-row">
                      <td className={`rc-subj-name-cell ${subj.compactText || subj.label.length > 18 ? 'rc-subj-compact' : ''}`}>
                        {subj.label}
                      </td>
                      <td className="rc-num-cell">{hasMarks ? score.maxMarks : '-'}</td>
                      <td className={`rc-num-cell ${isDummy && hasMarks ? 'rc-dummy-num' : ''}`}>
                        {hasMarks ? (
                          isFailed ? (
                            <span className="rc-failed-mark">{obtDisplay}</span>
                          ) : (
                            obtDisplay
                          )
                        ) : (
                          '-'
                        )}
                      </td>
                      {idx === 0 ? (
                        <td rowSpan={subjectRows.length + 1} className="rc-remarks-merged-cell">
                          <RemarksColumnContent data={data} isDummy={isDummy} />
                        </td>
                      ) : null}
                    </tr>
                  );
                })}

                {/* Grand Total Row */}
                <tr className="rc-subj-row rc-grand-total-row">
                  <td className="rc-subj-name-cell rc-grand-total-label">Grand Total</td>
                  <td className="rc-num-cell rc-grand-total-val">{data.grandTotalMax}</td>
                  <td className={`rc-num-cell rc-grand-total-val ${isDummy ? 'rc-dummy-num' : ''}`}>{data.grandTotalObtained}</td>
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

function RemarksColumnContent({ data, isDummy = false }: { data: ReportCardStudentData; isDummy?: boolean }) {
  return (
    <div className="rc-remarks-stack">
      <div className="rc-remark-item">
        <div className="rc-remark-heading">RESULT</div>
        <div className={`rc-remark-value ${isDummy ? 'rc-dummy-num' : ''}`}>{data.result}</div>
      </div>
      <div className="rc-remark-item">
        <div className="rc-remark-heading">PERCENTAGE</div>
        <div className={`rc-remark-value ${isDummy ? 'rc-dummy-num' : ''}`}>{data.percentage}</div>
      </div>
      <div className="rc-remark-item">
        <div className="rc-remark-heading">GRADE</div>
        <div className={`rc-remark-value ${isDummy ? 'rc-dummy-num' : ''}`}>{data.grade}</div>
      </div>
      <div className="rc-remark-item">
        <div className="rc-remark-heading">RANK</div>
        <div className={`rc-remark-value ${isDummy ? 'rc-dummy-num' : ''}`}>{data.rank}</div>
      </div>
      <div className="rc-remark-item">
        <div className="rc-remark-heading">ATTENDANCE</div>
        <div className={`rc-remark-value ${isDummy ? 'rc-dummy-num' : ''}`}>{formatAttendancePercentage(data.attendance)}</div>
      </div>
    </div>
  );
}
