'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa';
import {
  FiPrinter,
  FiUploadCloud,
  FiDownload,
  FiFileText,
  FiCheckCircle,
  FiAlertTriangle,
  FiImage,
  FiRefreshCw,
  FiEye,
  FiSliders,
  FiPlus,
  FiTrash2,
} from 'react-icons/fi';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

import {
  ReportCardFront,
  ReportCardBack,
  REPORT_SUBJECT_ROWS,
  formatAttendancePercentage,
  type SchoolConfig,
  type ReportCardStudentData,
  type SubjectKey,
} from './StudentReportCard';

const CARDS_PER_A4 = 2;

const groupIntoPairs = <T,>(items: T[]): Array<[T, T | null]> => {
  const pairs: Array<[T, T | null]> = [];
  for (let i = 0; i < items.length; i += CARDS_PER_A4) {
    pairs.push([items[i], items[i + 1] ?? null]);
  }
  return pairs;
};

const parseSessionYears = (sessionStr: string): { startSuffix: string; endSuffix: string } => {
  const matches = String(sessionStr || '').match(/\d{2,4}/g);
  if (!matches || matches.length === 0) {
    return { startSuffix: '26', endSuffix: '27' };
  }
  const toTwoDigit = (val: string) => (val.length >= 2 ? val.slice(-2) : val);
  return {
    startSuffix: toTwoDigit(matches[0] || '26'),
    endSuffix: matches[1] ? toTwoDigit(matches[1]) : '27',
  };
};

export const TERM_OPTIONS = [
  { id: 'summative_one', label: 'Summative Assessment 1', defaultTitle: 'SUMMATIVE ASSESSMENT - 1' },
  { id: 'summative_two', label: 'Summative Assessment 2', defaultTitle: 'SUMMATIVE ASSESSMENT - 2' },
  { id: 'first_term', label: 'First Term Examination', defaultTitle: 'FIRST TERM EXAMINATION' },
  { id: 'mid_term', label: 'Mid Term Examination', defaultTitle: 'MID TERM EXAMINATION' },
  { id: 'final_term', label: 'Final Term / Annual Examination', defaultTitle: 'FINAL TERM EXAMINATION' },
  { id: 'first_assessment', label: 'First Assessment (Formative 1)', defaultTitle: 'FIRST ASSESSMENT' },
  { id: 'second_assessment', label: 'Second Assessment (Formative 2)', defaultTitle: 'SECOND ASSESSMENT' },
  { id: 'other', label: 'Custom Examination Title', defaultTitle: '' },
] as const;

export interface SubjectConfigItem {
  key: string;
  label: string;
  maxMarks: string;
  isIslamiat?: boolean;
}

const DEFAULT_SUBJECT_ITEMS: SubjectConfigItem[] = [
  { key: 'english', label: 'English', maxMarks: '100' },
  { key: 'urdu', label: 'Urdu', maxMarks: '100' },
  { key: 'social_pak_studies', label: 'S. Studies / Pak. Studies', maxMarks: '100' },
  { key: 'sindhi', label: 'Sindhi', maxMarks: '100' },
  { key: 'islamiat_total', label: 'Islamiat', maxMarks: '100', isIslamiat: true },
  { key: 'g_science', label: 'G. Science', maxMarks: '100' },
  { key: 'mathematics', label: 'Mathematics', maxMarks: '100' },
  { key: 'h_economics', label: 'H. Economics', maxMarks: '100' },
  { key: 'arabic_drawing', label: 'Arabic / Drawing', maxMarks: '100' },
  { key: 'biology_computer', label: 'Biology / Computer', maxMarks: '100' },
  { key: 'physics', label: 'Physics', maxMarks: '100' },
  { key: 'chemistry', label: 'Chemistry', maxMarks: '100' },
];

const MAX_SUBJECTS_LIMIT = 12;

const CONFIGURABLE_SUBJECTS: Array<{ key: SubjectKey; label: string; badge?: string }> = [
  { key: 'english', label: 'English' },
  { key: 'urdu', label: 'Urdu' },
  { key: 'social_pak_studies', label: 'S. Studies / Pak' },
  { key: 'sindhi', label: 'Sindhi' },
  { key: 'islamiat_oral', label: 'Nazra / Oral', badge: 'Oral' },
  { key: 'islamiat_written', label: 'Written', badge: 'Written' },
  { key: 'islamiat_total', label: 'Islamiat (Total)', badge: 'Total' },
  { key: 'g_science', label: 'General Science' },
  { key: 'mathematics', label: 'Mathematics' },
  { key: 'arabic_drawing', label: 'Arabic / Drawing' },
  { key: 'biology_computer', label: 'Biology / Computer' },
  { key: 'physics', label: 'Physics' },
  { key: 'chemistry', label: 'Chemistry' },
];

export function getOrdinalSuffix(n: number): string {
  if (n <= 0) return '-';
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}th`;
}

export function formatRankLabel(val: string | number | undefined | null): string {
  if (val == null) return '-';
  const str = String(val).trim();
  if (!str || str === '-') return '-';
  if (/^\d+(st|nd|rd|th)$/i.test(str)) return str;
  const num = parseInt(str, 10);
  if (!isNaN(num) && num > 0) return getOrdinalSuffix(num);
  return str;
}

function computeStudentStats(
  subjects: Partial<Record<string, { maxMarks: string; marksObtained: string }>>,
  activeItems: SubjectConfigItem[],
  passingPct: number = 40,
) {
  let totalMax = 0;
  let totalObt = 0;
  let failedSubjectsCount = 0;

  const activeKeys = new Set(activeItems.map((s) => s.key));

  Object.entries(subjects).forEach(([key, score]) => {
    if (key === 'islamiat_oral' || key === 'islamiat_written') return;
    if (!activeKeys.has(key)) return;
    const rawObt = score?.marksObtained != null ? String(score.marksObtained).trim() : '';
    if (rawObt === '' || rawObt === '-') return;
    const max = parseFloat(score?.maxMarks || '0') || 0;
    const obt = parseFloat(rawObt) || 0;
    if (max > 0) {
      totalMax += max;
      totalObt += obt;
      const passMark = (passingPct / 100) * max;
      if (obt < passMark) {
        failedSubjectsCount++;
      }
    }
  });

  const pct = totalMax > 0 ? (totalObt / totalMax) * 100 : 0;
  const isPass = failedSubjectsCount === 0 && pct >= passingPct;
  const result = isPass ? 'PASS' : 'FAIL';

  let grade = 'Fail';
  if (isPass) {
    if (pct >= 80) grade = 'A+';
    else if (pct >= 70) grade = 'A';
    else if (pct >= 60) grade = 'B';
    else if (pct >= 50) grade = 'C';
    else grade = 'D';
  }

  return {
    grandTotalMax: totalMax > 0 ? String(totalMax) : '0',
    grandTotalObtained: String(totalObt),
    percentage: `${pct.toFixed(1)}%`,
    grade,
    result,
    failedSubjectsCount,
  };
}

function assignRanksToStudents(
  list: ReportCardStudentData[],
  activeItems: SubjectConfigItem[],
  passingPct: number = 40,
): ReportCardStudentData[] {
  const withStats = list.map((st) => {
    const stats = computeStudentStats(st.subjects, activeItems, passingPct);
    return {
      ...st,
      grandTotalMax: stats.grandTotalMax,
      grandTotalObtained: stats.grandTotalObtained,
      percentage: stats.percentage,
      grade: stats.grade,
      result: stats.result,
    };
  });

  const passingIndices: Array<{ index: number; obt: number; pct: number }> = [];
  withStats.forEach((st, idx) => {
    if (st.result === 'PASS') {
      const obt = parseFloat(st.grandTotalObtained) || 0;
      const pct = parseFloat(st.percentage.replace('%', '')) || 0;
      passingIndices.push({ index: idx, obt, pct });
    }
  });

  passingIndices.sort((a, b) => {
    if (b.obt !== a.obt) return b.obt - a.obt;
    return b.pct - a.pct;
  });

  const rankByOriginalIndex = new Map<number, string>();
  for (let i = 0; i < passingIndices.length; i++) {
    const item = passingIndices[i];
    if (i > 0) {
      const prev = passingIndices[i - 1];
      if (item.obt === prev.obt && item.pct === prev.pct) {
        rankByOriginalIndex.set(item.index, rankByOriginalIndex.get(prev.index)!);
        continue;
      }
    }
    rankByOriginalIndex.set(item.index, getOrdinalSuffix(i + 1));
  }

  return withStats.map((st, idx) => {
    if (st.result !== 'PASS') {
      return { ...st, rank: '-' };
    }
    const autoRank = rankByOriginalIndex.get(idx) || '1st';
    const rawSheetRank = st.rank && st.rank !== '-' ? st.rank.trim() : '';
    const finalRank = rawSheetRank ? formatRankLabel(rawSheetRank) : autoRank;
    return { ...st, rank: finalRank };
  });
}

interface DummyProfile {
  name: string;
  fatherName: string;
  rollNo: string;
  grNo: string;
  studentClass: string;
  dob: string;
  address: string;
  attendance: string;
  conduct: string;
  ratios: Record<string, number>;
}

const DUMMY_STUDENT_PROFILES: DummyProfile[] = [
  {
    name: 'Student ABC',
    fatherName: 'Father ABC',
    rollNo: '101',
    grNo: '1001',
    studentClass: 'VIII',
    dob: '12-04-2011',
    address: 'House 123, Street ABC, City',
    attendance: '96%',
    conduct: 'Excellent',
    ratios: {
      english: 0.84,
      urdu: 0.88,
      social_pak_studies: 0.79,
      sindhi: 0.82,
      islamiat_oral: 0.85,
      islamiat_written: 0.86,
      g_science: 0.85,
      mathematics: 0.92,
      biology_computer: 0.91,
      h_economics: 0.84,
      arabic_drawing: 0.86,
      physics: 0.85,
      chemistry: 0.88,
    },
  },
  {
    name: 'Student XYZ',
    fatherName: 'Father XYZ',
    rollNo: '102',
    grNo: '1002',
    studentClass: 'VIII',
    dob: '05-09-2011',
    address: 'Apartment 456, Block XYZ, City',
    attendance: '94%',
    conduct: 'Good',
    ratios: {
      english: 0.76,
      urdu: 0.81,
      social_pak_studies: 0.74,
      sindhi: 0.78,
      islamiat_oral: 0.80,
      islamiat_written: 0.78,
      g_science: 0.77,
      mathematics: 0.80,
      biology_computer: 0.82,
      h_economics: 0.75,
      arabic_drawing: 0.75,
      physics: 0.76,
      chemistry: 0.78,
    },
  },
];

const DUMMY_ACTIVE_SUBJECT_KEYS = new Set([
  'english',
  'urdu',
  'social_pak_studies',
  'sindhi',
  'islamiat_total',
  'g_science',
  'mathematics',
  'biology_computer',
]);

function generateDummyStudents(
  subjectList: SubjectConfigItem[],
  defaultMaxStr: string,
  customMax: Partial<Record<string, string>> = {},
  passingPct: number = 40,
): ReportCardStudentData[] {
  const baseDefault = parseFloat(defaultMaxStr) || 100;

  const rawList: ReportCardStudentData[] = DUMMY_STUDENT_PROFILES.map((profile, pIdx) => {
    const subjects: Partial<Record<SubjectKey, SubjectScore>> = {};

    const oralMaxNum = parseFloat(customMax.islamiat_oral || '') || Math.round(baseDefault * 0.4);
    const writtenMaxNum = parseFloat(customMax.islamiat_written || '') || Math.round(baseDefault * 0.6);

    const oralRatio = profile.ratios.islamiat_oral ?? 0.85;
    const writtenRatio = profile.ratios.islamiat_written ?? 0.85;

    const oralObtained = Math.min(oralMaxNum, Math.round(oralMaxNum * oralRatio));
    const writtenObtained = Math.min(writtenMaxNum, Math.round(writtenMaxNum * writtenRatio));
    const islamiatTotalObtained = oralObtained + writtenObtained;

    subjectList.forEach((subj) => {
      const isCore = DUMMY_ACTIVE_SUBJECT_KEYS.has(subj.key) || subjectList.length <= 8;

      if (subj.key === 'islamiat_total') {
        const islMax = parseFloat(subj.maxMarks) || (oralMaxNum + writtenMaxNum);
        if (isCore) {
          subjects.islamiat_oral = {
            maxMarks: String(oralMaxNum),
            marksObtained: String(oralObtained),
          };
          subjects.islamiat_written = {
            maxMarks: String(writtenMaxNum),
            marksObtained: String(writtenObtained),
          };
          subjects.islamiat_total = {
            maxMarks: String(islMax),
            marksObtained: String(Math.min(islMax, islamiatTotalObtained)),
          };
        } else {
          subjects.islamiat_oral = { maxMarks: '', marksObtained: '' };
          subjects.islamiat_written = { maxMarks: '', marksObtained: '' };
          subjects.islamiat_total = { maxMarks: '', marksObtained: '' };
        }
        return;
      }

      if (!isCore) {
        subjects[subj.key as SubjectKey] = { maxMarks: '', marksObtained: '' };
        return;
      }

      const sMax = parseFloat(subj.maxMarks) || baseDefault;
      const ratio = profile.ratios[subj.key] ?? 0.82;
      const sObtained = Math.min(sMax, Math.round(sMax * ratio));

      subjects[subj.key as SubjectKey] = {
        maxMarks: String(sMax),
        marksObtained: String(sObtained),
      };
    });

    return {
      rowNumber: String(pIdx + 1),
      rollNo: profile.rollNo,
      grNo: profile.grNo,
      name: profile.name,
      fatherName: profile.fatherName,
      studentClass: profile.studentClass,
      dob: profile.dob,
      address: profile.address,
      sessionStartYear: '26',
      sessionEndYear: '27',
      sessionFull: '2026 - 2027',
      examTitle: 'SUMMATIVE ASSESSMENT - 1',
      examYearSuffix: '26',
      schoolName: 'ABC Model High School',
      subjects,
      grandTotalMax: '0',
      grandTotalObtained: '0',
      percentage: '0.0%',
      grade: 'D',
      rank: '',
      result: 'PASS',
      attendance: profile.attendance,
      conduct: profile.conduct,
    };
  });

  return assignRanksToStudents(rawList, subjectList, passingPct);
}

// 100% Anonymous generic placeholder demo data
const INITIAL_DEMO_STUDENTS: ReportCardStudentData[] = generateDummyStudents(
  DEFAULT_SUBJECT_ITEMS,
  '100',
  { islamiat_oral: '40', islamiat_written: '60' },
  40,
);

export default function ReportCardGeneratorPage() {
  const [hasUserUploadedData, setHasUserUploadedData] = useState<boolean>(false);
  const [passingPercentage, setPassingPercentage] = useState<number>(40);
  const [students, setStudents] = useState<ReportCardStudentData[]>(INITIAL_DEMO_STUDENTS);
  const [activeTab, setActiveTab] = useState<'excel' | 'ai_scan' | 'settings'>('excel');

  // School configuration
  const [schoolName, setSchoolName] = useState<string>('ABC Model High School');
  const [schoolLogo, setSchoolLogo] = useState<string>('/images/pakistan_quarter_logo.png');
  const [headSignTitle, setHeadSignTitle] = useState<string>('Sign. of Head Master / Mistress');

  // Global Session and Exam parameters
  const [sessionLabel, setSessionLabel] = useState<string>('2026 - 2027');
  const [selectedTermId, setSelectedTermId] = useState<string>('summative_one');
  const [examTitle, setExamTitle] = useState<string>('SUMMATIVE ASSESSMENT - 1');
  const [examYearSuffix, setExamYearSuffix] = useState<string>('26');

  // Max Marks Configuration
  const [defaultMaxMarks, setDefaultMaxMarks] = useState<string>('100');
    const [subjectItems, setSubjectItems] = useState<SubjectConfigItem[]>(DEFAULT_SUBJECT_ITEMS);
  const [customSubjectMaxMarks, setCustomSubjectMaxMarks] = useState<Partial<Record<SubjectKey, string>>>({
    islamiat_oral: '40',
    islamiat_written: '60',
  });
  const [showSubjectMaxConfig, setShowSubjectMaxConfig] = useState<boolean>(false);

  // Print controls
  const [mirrorBackForDuplex, setMirrorBackForDuplex] = useState<boolean>(true);
  const [selectedRowNumbers, setSelectedRowNumbers] = useState<Set<string>>(
    new Set(INITIAL_DEMO_STUDENTS.map((s) => s.rowNumber)),
  );

  // States
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [pdfGenerating, setPdfGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

    // Single Pair Printing & PDF states
  const [activePrintPairIndex, setActivePrintPairIndex] = useState<number | null>(null);

  const handlePrintSinglePair = (pairIndex: number) => {
    if (!hasUserUploadedData) {
      setErrorMessage('Dummy sample data cannot be printed. Please upload your student Excel file first.');
      return;
    }
    setActivePrintPairIndex(pairIndex);
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setActivePrintPairIndex(null);
      }, 1000);
    }, 100);
  };

  useEffect(() => {
    const handleAfterPrint = () => {
      setActivePrintPairIndex(null);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const handleExportSinglePairPdf = async (pairIndex: number) => {
    const pair = cardPairs[pairIndex];
    if (!pair || !pair[0]) return;
    const studentName = (pair[0].name || `Student_${pairIndex + 1}`).replace(/[^a-zA-Z0-9_-]/g, '_');
    setPdfGenerating(true);
    setStatusMessage(`Generating PDF for ${pair[0].name}...`);

    try {
      if (typeof document !== 'undefined' && document.fonts) {
        await document.fonts.ready;
      }

      const pairElement = document.querySelector(`[data-pair-idx="${pairIndex}"]`);
      if (!pairElement) throw new Error('Sheet element not found.');

      const sheets = Array.from(pairElement.querySelectorAll<HTMLElement>('.rc-a4-landscape-sheet'));
      if (!sheets.length) throw new Error('No printable sheets found for this student.');

      const html2canvas = (await import('html2canvas')).default;
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      for (let i = 0; i < sheets.length; i++) {
        const sheet = sheets[i];
        if (i > 0) pdf.addPage([297, 210], 'landscape');

        const canvas = await html2canvas(sheet, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 1200,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');
      }

      pdf.save(`Report_Card_${studentName}.pdf`);
      setStatusMessage(`PDF downloaded successfully for ${pair[0].name}.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate PDF';
      setErrorMessage(msg);
    } finally {
      setPdfGenerating(false);
    }
  };

  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const excelInputRef = useRef<HTMLInputElement | null>(null);

  // Active School Object for cards
  const activeSchoolConfig: SchoolConfig = useMemo(
    () => ({
      name: schoolName,
      logoSrc: schoolLogo,
      headSignTitle,
    }),
    [schoolName, schoolLogo, headSignTitle],
  );

  // Helper to determine Max Marks for a specific subject
  const getSubjectMaxMarks = (key: SubjectKey, baseVal = defaultMaxMarks): string => {
    if (customSubjectMaxMarks[key]) return customSubjectMaxMarks[key]!;
    const base = parseFloat(baseVal) || 100;
    if (key === 'islamiat_oral') return String(Math.round(base * 0.4));
    if (key === 'islamiat_written') return String(Math.round(base * 0.6));
    return String(base);
  };

  // Helper to calculate total, percentage, grade
  const computeStudentStats = (
    subjects: Partial<Record<string, { maxMarks: string; marksObtained: string }>>,
    activeItems: SubjectConfigItem[] = subjectItems,
  ) => {
    let totalMax = 0;
    let totalObt = 0;
    let anySubjFailed = false;

    const activeKeys = new Set(activeItems.map((s) => s.key));

    Object.entries(subjects).forEach(([key, score]) => {
      if (key === 'islamiat_oral' || key === 'islamiat_written') {
        // Skip individual islamiat parts from grand total if islamiat_total is counted
        return;
      }
      if (!activeKeys.has(key)) {
        return;
      }
      const rawObt = score?.marksObtained != null ? String(score.marksObtained).trim() : '';
      if (rawObt === '' || rawObt === '-') {
        // Only count subjects that have actual marks obtained
        return;
      }
      const max = parseFloat(score?.maxMarks || '0') || 0;
      const obt = parseFloat(rawObt) || 0;
      if (max > 0) {
        totalMax += max;
        totalObt += obt;
        if (obt < max * 0.4) {
          anySubjFailed = true;
        }
      }
    });

    const pct = totalMax > 0 ? (totalObt / totalMax) * 100 : 0;
    let grade = 'Fail';
    if (pct >= 80) grade = 'A+';
    else if (pct >= 70) grade = 'A';
    else if (pct >= 60) grade = 'B';
    else if (pct >= 50) grade = 'C';
    else if (pct >= 40) grade = 'D';

    const result = !anySubjFailed && pct >= 40 ? 'PASS' : 'FAIL';

    return {
      grandTotalMax: totalMax > 0 ? String(totalMax) : '0',
      grandTotalObtained: String(totalObt),
      percentage: `${pct.toFixed(1)}%`,
      grade,
      result,
    };
  };

  // Subject manipulation handlers
  const handleSubjectLabelChange = (key: string, newLabel: string) => {
    setSubjectItems((prev) =>
      prev.map((s) => (s.key === key ? { ...s, label: newLabel } : s)),
    );
  };

  const handleSubjectMaxMarksChange = (key: string, newMax: string) => {
    let updatedCustom = { ...customSubjectMaxMarks, [key]: newMax };

    // If changing Islamiat total directly, keep oral and written in perfect sync (40% oral, 60% written)
    if (key === 'islamiat_total') {
      const totalNum = parseFloat(newMax) || 0;
      const oral = Math.round(totalNum * 0.4);
      const written = Math.max(0, totalNum - oral);
      updatedCustom = {
        ...updatedCustom,
        islamiat_total: newMax,
        islamiat_oral: String(oral),
        islamiat_written: String(written),
      };
    }

    const updatedItems = subjectItems.map((s) => (s.key === key ? { ...s, maxMarks: newMax } : s));
    setSubjectItems(updatedItems);
    setCustomSubjectMaxMarks(updatedCustom);

    if (!hasUserUploadedData) {
      setStudents(generateDummyStudents(updatedItems, defaultMaxMarks, updatedCustom, passingPercentage));
    } else {
      setStudents((prev) => {
        const updated = prev.map((st) => {
          const nextSubjects = { ...st.subjects };
          if (nextSubjects[key]) {
            nextSubjects[key] = {
              maxMarks: newMax,
              marksObtained: nextSubjects[key]!.marksObtained,
            };
          }
          if (key === 'islamiat_total') {
            if (nextSubjects.islamiat_oral) {
              nextSubjects.islamiat_oral = {
                maxMarks: updatedCustom.islamiat_oral!,
                marksObtained: nextSubjects.islamiat_oral.marksObtained,
              };
            }
            if (nextSubjects.islamiat_written) {
              nextSubjects.islamiat_written = {
                maxMarks: updatedCustom.islamiat_written!,
                marksObtained: nextSubjects.islamiat_written.marksObtained,
              };
            }
          }
          return { ...st, subjects: nextSubjects };
        });
        return assignRanksToStudents(updated, updatedItems, passingPercentage);
      });
    }
  };

  const handleIslamiatSubMarksChange = (newOralStr: string, newWrittenStr: string) => {
    const oralNum = parseFloat(newOralStr) || 0;
    const writtenNum = parseFloat(newWrittenStr) || 0;
    const newTotal = oralNum + writtenNum;
    const newTotalStr = String(newTotal);

    const updatedCustom: Partial<Record<string, string>> = {
      ...customSubjectMaxMarks,
      islamiat_oral: newOralStr,
      islamiat_written: newWrittenStr,
      islamiat_total: newTotalStr,
    };
    setCustomSubjectMaxMarks(updatedCustom);

    // Update Islamiat's maxMarks in subjectItems to match the sum of Oral + Written
    const updatedItems = subjectItems.map((s) =>
      s.key === 'islamiat_total' ? { ...s, maxMarks: newTotalStr } : s,
    );
    setSubjectItems(updatedItems);

    if (!hasUserUploadedData) {
      setStudents(generateDummyStudents(updatedItems, defaultMaxMarks, updatedCustom, passingPercentage));
    } else {
      setStudents((prev) => {
        const updated = prev.map((st) => {
          const nextSubjects = { ...st.subjects };
          if (nextSubjects.islamiat_oral) {
            nextSubjects.islamiat_oral = {
              maxMarks: newOralStr,
              marksObtained: nextSubjects.islamiat_oral.marksObtained,
            };
          }
          if (nextSubjects.islamiat_written) {
            nextSubjects.islamiat_written = {
              maxMarks: newWrittenStr,
              marksObtained: nextSubjects.islamiat_written.marksObtained,
            };
          }
          if (nextSubjects.islamiat_total) {
            nextSubjects.islamiat_total = {
              maxMarks: newTotalStr,
              marksObtained: nextSubjects.islamiat_total.marksObtained,
            };
          }
          return { ...st, subjects: nextSubjects };
        });
        return assignRanksToStudents(updated, updatedItems, passingPercentage);
      });
    }
  };

  const handlePassingPercentageChange = (newPct: number) => {
    setPassingPercentage(newPct);
    if (!hasUserUploadedData) {
      setStudents(generateDummyStudents(subjectItems, defaultMaxMarks, customSubjectMaxMarks, newPct));
    } else {
      setStudents((prev) => assignRanksToStudents(prev, subjectItems, newPct));
    }
  };

  const handleAddSubject = () => {
    if (subjectItems.length >= MAX_SUBJECTS_LIMIT) return;
    const newKey = `custom_subj_${Date.now()}`;
    const newItem: SubjectConfigItem = {
      key: newKey,
      label: `Subject ${subjectItems.length + 1}`,
      maxMarks: defaultMaxMarks,
    };
    const nextList = [...subjectItems, newItem];
    setSubjectItems(nextList);
    if (!hasUserUploadedData) {
      setStudents(generateDummyStudents(nextList, defaultMaxMarks, customSubjectMaxMarks, passingPercentage));
    } else {
      setStudents((prev) => assignRanksToStudents(prev, nextList, passingPercentage));
    }
  };

  const handleRemoveSubject = (key: string) => {
    if (subjectItems.length <= 1) return;
    const nextList = subjectItems.filter((s) => s.key !== key);
    setSubjectItems(nextList);
    if (!hasUserUploadedData) {
      setStudents(generateDummyStudents(nextList, defaultMaxMarks, customSubjectMaxMarks, passingPercentage));
    } else {
      setStudents((prev) => assignRanksToStudents(prev, nextList, passingPercentage));
    }
  };

  const handleResetSubjects = () => {
    const base = defaultMaxMarks || '100';
    const reset = DEFAULT_SUBJECT_ITEMS.map((s) => ({ ...s, maxMarks: base }));
    setSubjectItems(reset);
    const defaultCustom = {
      islamiat_oral: String(Math.round(parseFloat(base) * 0.4)),
      islamiat_written: String(Math.round(parseFloat(base) * 0.6)),
    };
    setCustomSubjectMaxMarks(defaultCustom);
    if (!hasUserUploadedData) {
      setStudents(generateDummyStudents(reset, base, defaultCustom, passingPercentage));
    } else {
      setStudents((prev) => assignRanksToStudents(prev, reset, passingPercentage));
    }
  };

  // Handler for changing default max marks
  const handleMaxMarksChange = (newVal: string) => {
    setDefaultMaxMarks(newVal);
    const base = parseFloat(newVal) || 100;
    const nextCustom: Partial<Record<string, string>> = {
      islamiat_oral: String(Math.round(base * 0.4)),
      islamiat_written: String(Math.round(base * 0.6)),
      islamiat_total: String(base),
    };
    setCustomSubjectMaxMarks(nextCustom);

    const updatedItems = subjectItems.map((s) => ({
      ...s,
      maxMarks: String(base),
    }));
    setSubjectItems(updatedItems);

    if (!hasUserUploadedData) {
      setStudents(generateDummyStudents(updatedItems, newVal, nextCustom, passingPercentage));
    } else {
      setStudents((prev) => {
        const updated = prev.map((st) => {
          const nextSubjects: Partial<Record<string, { maxMarks: string; marksObtained: string }>> = {};
          Object.entries(st.subjects).forEach(([k, score]) => {
            if (!score) return;
            let subMax = String(base);
            if (k === 'islamiat_oral') subMax = nextCustom.islamiat_oral!;
            else if (k === 'islamiat_written') subMax = nextCustom.islamiat_written!;
            nextSubjects[k] = {
              maxMarks: subMax,
              marksObtained: score.marksObtained,
            };
          });
          return {
            ...st,
            subjects: nextSubjects,
          };
        });
        return assignRanksToStudents(updated, updatedItems, passingPercentage);
      });
    }
  };

  // Derive effective student data overlaying global settings and computing real-time stats
  const effectiveStudents: ReportCardStudentData[] = useMemo(() => {
    const { startSuffix, endSuffix } = parseSessionYears(sessionLabel);
    const mapped = students.map((st) => {
      const stats = computeStudentStats(st.subjects, subjectItems, passingPercentage);
      return {
        ...st,
        schoolName: schoolName.trim() || st.schoolName,
        sessionStartYear: startSuffix || st.sessionStartYear,
        sessionEndYear: endSuffix || st.sessionEndYear,
        sessionFull: sessionLabel.trim() || st.sessionFull,
        examTitle: examTitle.trim() || st.examTitle,
        examYearSuffix: examYearSuffix || startSuffix || st.examYearSuffix,
        grandTotalMax: stats.grandTotalMax,
        grandTotalObtained: stats.grandTotalObtained,
        percentage: stats.percentage,
        grade: stats.grade,
        result: stats.result,
        attendance: formatAttendancePercentage(st.attendance),
      };
    });
    return assignRanksToStudents(mapped, subjectItems, passingPercentage);
  }, [students, schoolName, sessionLabel, examTitle, examYearSuffix, subjectItems, passingPercentage]);

  // Filter selected cards for printing
  const cardsToPrint: ReportCardStudentData[] = useMemo(() => {
    const list = effectiveStudents.filter((s) => selectedRowNumbers.has(s.rowNumber));
    if (list.length > 0) return list;
    return effectiveStudents;
  }, [effectiveStudents, selectedRowNumbers]);

  const cardPairs = useMemo(() => groupIntoPairs(cardsToPrint), [cardsToPrint]);

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSchoolLogo(result);
      setStatusMessage('School logo uploaded successfully!');
      setErrorMessage('');
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  // Handle Excel / CSV File Upload
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusMessage('Reading spreadsheet...');
    setErrorMessage('');

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (!rows.length) {
        throw new Error('Spreadsheet appears to be empty. Please check your file.');
      }

      // Check if School Name column exists in Excel
      const detectedSchoolName =
        rows[0]['School Name'] ||
        rows[0]['School'] ||
        rows[0]['SchoolName'] ||
        rows[0]['Institution'] ||
        rows[0]['school_name'] ||
        '';

      if (detectedSchoolName && String(detectedSchoolName).trim()) {
        setSchoolName(String(detectedSchoolName).trim());
      }

      const { startSuffix, endSuffix } = parseSessionYears(sessionLabel);

      const parsedStudents: ReportCardStudentData[] = rows.map((row, index) => {
        const rowSchool =
          row['School Name'] ||
          row['School'] ||
          row['SchoolName'] ||
          row['Institution'] ||
          detectedSchoolName ||
          schoolName;

        const rowSession = String(row['Session'] || row['Academic Year'] || sessionLabel).trim();
        const parsedYears = parseSessionYears(rowSession);
        const rowExam = String(row['Exam'] || row['Exam Title'] || examTitle).trim();

        // Extract marks
        const subjects: Partial<Record<SubjectKey, { maxMarks: string; marksObtained: string }>> = {};

        const getVal = (...keys: string[]) => {
          for (const k of keys) {
            if (row[k] !== undefined && row[k] !== '') {
              return String(row[k]).trim();
            }
          }
          return '';
        };

        const addSubj = (key: SubjectKey, ...colNames: string[]) => {
          const val = getVal(...colNames);
          if (val !== '') {
            subjects[key] = {
              maxMarks: getSubjectMaxMarks(key),
              marksObtained: val,
            };
          }
        };

        addSubj('english', 'English', 'ENG', 'Eng', 'English Marks');
        addSubj('urdu', 'Urdu', 'URD', 'Urdu Marks');
        addSubj('social_pak_studies', 'Social Studies', 'Pak Studies', 'S. Studies', 'Mutala-e-Pakistan', 'P.S');
        addSubj('sindhi', 'Sindhi', 'SIN', 'Asan Sindhi', 'Saleem Sindhi');

        // Islamiat oral & written
        const oral = getVal('Islamiat Oral', 'Islamiat Nazra', 'Nazra', 'Oral');
        const written = getVal('Islamiat Written', 'Written', 'Islamiat T');
        const totalIsl = getVal('Islamiat', 'Islamiat Total', 'ISL');

        const oralMax = getSubjectMaxMarks('islamiat_oral');
        const writtenMax = getSubjectMaxMarks('islamiat_written');
        const totalIslMax = getSubjectMaxMarks('islamiat_total');

        if (oral !== '' || written !== '') {
          if (oral !== '') subjects.islamiat_oral = { maxMarks: oralMax, marksObtained: oral };
          if (written !== '') subjects.islamiat_written = { maxMarks: writtenMax, marksObtained: written };
          const sumIsl = (parseFloat(oral || '0') + parseFloat(written || '0')).toString();
          subjects.islamiat_total = { maxMarks: totalIslMax, marksObtained: totalIsl || sumIsl };
        } else if (totalIsl !== '') {
          subjects.islamiat_total = { maxMarks: totalIslMax, marksObtained: totalIsl };
        }

        addSubj('g_science', 'General Science', 'Science', 'G. Science', 'Sci');
        addSubj('mathematics', 'Mathematics', 'Maths', 'Math', 'MTH', 'Hisaab');
        addSubj('h_economics', 'Home Economics', 'H. Economics', 'H.Econ');
        addSubj('arabic_drawing', 'Arabic', 'Drawing', 'Art', 'Arabic / Drawing');
        addSubj('biology_computer', 'Biology', 'Computer', 'Biology/Computer', 'CS', 'Bio');
        addSubj('physics', 'Physics', 'Phy');
        addSubj('chemistry', 'Chemistry', 'Chem');

        // Stats calculation
        const stats = computeStudentStats(subjects);

        return {
          rowNumber: String(index + 1),
          rollNo: String(getVal('Roll No', 'RollNo', 'Roll_No', 'Roll') || index + 1),
          grNo: String(getVal('GR No', 'GR', 'G.R. No', 'GRNo', 'Registration No') || ''),
          name: String(getVal('Student Name', 'Name', 'Student', 'Student_Name') || `Student ${index + 1}`),
          fatherName: String(getVal("Father's Name", 'Father Name', 'Father', 'Father_Name') || ''),
          studentClass: String(getVal('Class', 'Grade', 'Standard') || 'VIII'),
          dob: String(getVal('Date of Birth', 'DOB', 'Birth Date') || ''),
          address: String(getVal('Address', 'Residential Address') || ''),
          sessionStartYear: parsedYears.startSuffix || startSuffix,
          sessionEndYear: parsedYears.endSuffix || endSuffix,
          sessionFull: rowSession,
          examTitle: rowExam,
          examYearSuffix: parsedYears.startSuffix || examYearSuffix,
          schoolName: String(rowSchool || '').trim(),
          subjects,
          grandTotalMax: stats.grandTotalMax,
          grandTotalObtained: stats.grandTotalObtained,
          percentage: stats.percentage,
          grade: stats.grade,
          rank: String(getVal('Rank', 'Position', 'Stand', 'Pos', 'Student Rank') || '').trim(),
          result: stats.result,
          attendance: formatAttendancePercentage(getVal('Attendance', 'Attendance %', 'Att', 'Present') || '95%'),
          conduct: String(getVal('Conduct') || 'Good'),
        };
      });

      const ranked = assignRanksToStudents(parsedStudents, subjectItems, passingPercentage);
      setStudents(ranked);
      setHasUserUploadedData(true);
      setSelectedRowNumbers(new Set(parsedStudents.map((s) => s.rowNumber)));
      setStatusMessage(`Successfully loaded ${parsedStudents.length} student records from spreadsheet.`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error reading spreadsheet.');
    } finally {
      if (excelInputRef.current) excelInputRef.current.value = '';
    }
  };

  // Download Sample Excel Template with 100% Anonymous Dummy Placeholders
  const handleDownloadSampleExcel = () => {
    const base = parseFloat(defaultMaxMarks) || 100;
    const oralBase = parseFloat(customSubjectMaxMarks.islamiat_oral || '') || Math.round(base * 0.4);
    const writtenBase = parseFloat(customSubjectMaxMarks.islamiat_written || '') || Math.round(base * 0.6);

    const sampleData = [
      {
        'School Name': schoolName || 'ABC High School',
        'Roll No': '101',
        'GR No': '1001',
        'Student Name': 'Student ABC',
        "Father's Name": 'Father ABC',
        Class: 'VIII',
        'Date of Birth': '15-05-2011',
        Address: 'Address 123, Area ABC, City',
        Session: '2026-2027',
        Exam: 'SUMMATIVE ASSESSMENT - 1',
        English: Math.round(base * 0.85),
        Urdu: Math.round(base * 0.88),
        Sindhi: Math.round(base * 0.82),
        'Islamiat Oral': Math.round(oralBase * 0.85),
        'Islamiat Written': Math.round(writtenBase * 0.86),
        'General Science': Math.round(base * 0.85),
        Mathematics: Math.round(base * 0.92),
        'Social Studies': Math.round(base * 0.80),
        Rank: '1st',
        Attendance: '98%',
        Conduct: 'Excellent',
      },
      {
        'School Name': schoolName || 'ABC High School',
        'Roll No': '102',
        'GR No': '1002',
        'Student Name': 'Student XYZ',
        "Father's Name": 'Father XYZ',
        Class: 'VIII',
        'Date of Birth': '20-08-2011',
        Address: 'Address 456, Area XYZ, City',
        Session: '2026-2027',
        Exam: 'SUMMATIVE ASSESSMENT - 1',
        English: Math.round(base * 0.76),
        Urdu: Math.round(base * 0.81),
        Sindhi: Math.round(base * 0.75),
        'Islamiat Oral': Math.round(oralBase * 0.80),
        'Islamiat Written': Math.round(writtenBase * 0.78),
        'General Science': Math.round(base * 0.77),
        Mathematics: Math.round(base * 0.80),
        'Social Studies': Math.round(base * 0.74),
        Rank: '2nd',
        Attendance: '94%',
        Conduct: 'Good',
      },
      {
        'School Name': schoolName || 'ABC High School',
        'Roll No': '103',
        'GR No': '1003',
        'Student Name': 'Student 123',
        "Father's Name": 'Father 123',
        Class: 'VIII',
        'Date of Birth': '10-01-2012',
        Address: 'Address 789, Area 123, City',
        Session: '2026-2027',
        Exam: 'SUMMATIVE ASSESSMENT - 1',
        English: Math.round(base * 0.92),
        Urdu: Math.round(base * 0.90),
        Sindhi: Math.round(base * 0.88),
        'Islamiat Oral': Math.round(oralBase * 0.92),
        'Islamiat Written': Math.round(writtenBase * 0.90),
        'General Science': Math.round(base * 0.94),
        Mathematics: Math.round(base * 0.96),
        'Social Studies': Math.round(base * 0.89),
        Rank: '1st',
        Attendance: '99%',
        Conduct: 'Excellent',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report Card Data');
    XLSX.writeFile(wb, 'Report_Card_Template_Sample.xlsx');
  };

  // Marksheet Scanner Handler
  const handleAiScanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setStatusMessage('Reading result sheet...');
    setErrorMessage('');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string) || '';
        const mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

        try {
          const res = await fetch('/api/educational-resources/report-card-generator/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileBase64: base64Data,
              mimeType,
            }),
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.message || 'Unable to scan document. Please ensure the photo or PDF is clear and well-lit.');
          }

          if (data.schoolName && String(data.schoolName).trim()) {
            setSchoolName(String(data.schoolName).trim());
          }

          const rawStudents = data.students || [];
          if (!rawStudents.length) {
            throw new Error('No student results could be identified in this image.');
          }

          const { startSuffix, endSuffix } = parseSessionYears(sessionLabel);

          const converted: ReportCardStudentData[] = rawStudents.map((st: any, idx: number) => {
            const subjects: Partial<Record<SubjectKey, { maxMarks: string; marksObtained: string }>> = {};
            if (st.subjects) {
              Object.entries(st.subjects).forEach(([k, v]: [string, any]) => {
                subjects[k as SubjectKey] = {
                  maxMarks: String(v?.maxMarks || getSubjectMaxMarks(k as SubjectKey)),
                  marksObtained: String(v?.marksObtained ?? ''),
                };
              });
            }

            const stats = computeStudentStats(subjects);

            return {
              rowNumber: String(idx + 1),
              rollNo: String(st.rollNo || idx + 1),
              grNo: String(st.grNo || ''),
              name: String(st.studentName || `Student ${idx + 1}`),
              fatherName: String(st.fatherName || ''),
              studentClass: String(st.studentClass || 'VIII'),
              dob: String(st.dob || ''),
              address: String(st.address || ''),
              sessionStartYear: startSuffix,
              sessionEndYear: endSuffix,
              sessionFull: sessionLabel,
              examTitle,
              examYearSuffix,
              schoolName: data.schoolName || schoolName,
              subjects,
              grandTotalMax: String(st.grandTotalMax || stats.grandTotalMax),
              grandTotalObtained: String(st.grandTotalObtained || stats.grandTotalObtained),
              percentage: String(st.percentage || stats.percentage),
              grade: String(st.grade || stats.grade),
              rank: String(st.rank || `${idx + 1}${idx === 0 ? 'st' : idx === 1 ? 'nd' : idx === 2 ? 'rd' : 'th'}`),
              result: String(st.result || stats.result),
              attendance: formatAttendancePercentage(st.attendance || '95%'),
              conduct: String(st.conduct || 'Good'),
            };
          });

          const ranked = assignRanksToStudents(converted, subjectItems, passingPercentage);
          setStudents(ranked);
          setHasUserUploadedData(true);
          setSelectedRowNumbers(new Set(ranked.map((s) => s.rowNumber)));
          setStatusMessage(`Successfully loaded ${converted.length} student records.`);
        } catch (scanErr) {
          setErrorMessage(scanErr instanceof Error ? scanErr.message : 'Scanning failed. Please try a clearer photo.');
        } finally {
          setIsScanning(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setIsScanning(false);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to read document.');
    }
  };

  // Direct Browser Print
  const handlePrint = () => {
    if (!hasUserUploadedData) {
      setErrorMessage('Dummy sample data cannot be printed. Please upload your student Excel file or scan a marksheet first.');
      return;
    }
    window.print();
  };

  // Bulk PDF Export
  const handleExportPdf = async () => {
    setPdfGenerating(true);
    setStatusMessage('Generating print-ready PDF...');
    setErrorMessage('');

    try {
      if (typeof document !== 'undefined' && document.fonts) {
        await document.fonts.ready;
      }

      const sheets = Array.from(document.querySelectorAll<HTMLElement>('.rc-a4-landscape-sheet'));
      if (!sheets.length) {
        throw new Error('No printable sheets found on the page. Please select at least one student.');
      }

      const html2canvas = (await import('html2canvas')).default;
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      for (let i = 0; i < sheets.length; i += 1) {
        if (i > 0) pdf.addPage('a4', 'landscape');
        const sheetEl = sheets[i];
        const canvas = await html2canvas(sheetEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);
      }

      const cleanSchool = (schoolName || 'Report_Cards').replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`${cleanSchool}_Report_Cards.pdf`);
      setStatusMessage('PDF downloaded successfully!');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'PDF export failed. Try using the direct Print button.');
    } finally {
      setPdfGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800 pb-20">
      {/* ===================== Top Navigation & Controls ===================== */}
      <div className="no-print mx-auto max-w-7xl px-4 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <Link
            href="/educational-resources"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900"
          >
            &larr; Back to Educational Resources
          </Link>
        </div>

        {/* Header Banner */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300">
            The Master Sahib Educational Series
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
            Student Progress Report Card Generator
          </h1>
          <p className="mt-1 text-xs text-indigo-200">
            Generate authentic, print-ready student progress report cards with duplex printing and PDF export.
          </p>
        </div>

        {/* Notifications */}
        {statusMessage ? (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
            <FiCheckCircle size={16} className="text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-800">
            <FiAlertTriangle size={16} className="text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        ) : null}

        {/* Main Configuration Card */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm border border-slate-200">
          {/* Tabs */}
          <div className="mb-5 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('excel')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'excel'
                  ? 'bg-indigo-900 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FiFileText size={15} />
              <span>Attach Spreadsheet (.xlsx / .csv)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai_scan')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'ai_scan'
                  ? 'bg-purple-900 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FiImage size={15} />
              <span>Scan Marksheet (Photo / PDF)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'settings'
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FiEye size={15} />
              <span>School &amp; Exam Settings</span>
            </button>
          </div>

          {/* TAB 1: EXCEL ATTACHMENT */}
          {activeTab === 'excel' ? (
            <div className="space-y-4">
              <div className="rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-6 text-center">
                <FiUploadCloud size={36} className="mx-auto text-indigo-600 mb-2" />
                <h3 className="text-sm font-bold text-slate-800">Attach Student Marks Spreadsheet (.xlsx / .csv)</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-lg mx-auto">
                  Select your spreadsheet (.xlsx or .csv) containing student information and subject marks.
                </p>

                <div className="mt-4 flex flex-wrap justify-center items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 transition">
                    <FiUploadCloud size={16} />
                    <span>Select Spreadsheet File</span>
                    <input
                      ref={excelInputRef}
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleExcelUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleDownloadSampleExcel}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                  >
                    <FiDownload size={15} />
                    <span>Download Sample Excel Template</span>
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* TAB 2: MARKSHEET SCAN */}
          {activeTab === 'ai_scan' ? (
            <div className="space-y-4">
              <div className="rounded-xl border-2 border-dashed border-purple-200 bg-purple-50/40 p-6 text-center">
                <FiImage size={36} className="mx-auto text-purple-600 mb-2" />
                <h3 className="text-sm font-bold text-slate-800">Scan Marksheet or Award List (Photo or PDF)</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-lg mx-auto">
                  Upload a photo or scanned copy of your handwritten or printed marksheet, gazette, or award list.
                </p>

                <div className="mt-4 flex flex-wrap justify-center items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-purple-700 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-purple-800 transition">
                    <FiImage size={16} />
                    <span>{isScanning ? 'Scanning...' : 'Upload Marksheet Photo / PDF'}</span>
                    <input
                      type="file"
                      accept="image/*, application/pdf"
                      onChange={handleAiScanUpload}
                      disabled={isScanning}
                      className="hidden"
                    />
                  </label>
                </div>

                {isScanning ? (
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-purple-800">
                    <FiRefreshCw className="animate-spin text-purple-600" size={16} />
                    <span>Scanning marksheet... Please wait a moment.</span>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* TAB 3: SCHOOL & EXAM SETTINGS */}
          {activeTab === 'settings' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">School Name</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g. ABC Model High School"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:border-indigo-600 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500">Auto-detected from sheet or enter manually</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Academic Session</label>
                <input
                  type="text"
                  value={sessionLabel}
                  onChange={(e) => {
                    setSessionLabel(e.target.value);
                    const { startSuffix } = parseSessionYears(e.target.value);
                    if (startSuffix) setExamYearSuffix(startSuffix);
                  }}
                  placeholder="e.g. 2026-2027"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Examination Term</label>
                <select
                  value={selectedTermId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedTermId(id);
                    const opt = TERM_OPTIONS.find((t) => t.id === id);
                    if (opt && opt.defaultTitle) {
                      setExamTitle(opt.defaultTitle);
                    }
                  }}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:border-indigo-600 focus:outline-none"
                >
                  {TERM_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Exam Title on Card</label>
                <input
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="e.g. SUMMATIVE ASSESSMENT - 1"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Head Signature Title</label>
                <input
                  type="text"
                  value={headSignTitle}
                  onChange={(e) => setHeadSignTitle(e.target.value)}
                  placeholder="e.g. Sign. of Head Master / Mistress"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-medium focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-3">
                <div className="h-12 w-12 rounded-full border border-slate-300 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                  <img src={schoolLogo} alt="Logo" className="h-full w-full object-contain" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">School Logo</label>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm">
                    <FiImage size={14} />
                    <span>Upload Custom Logo</span>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* PER SUBJECT MAX MARKS SECTION */}
              <div className="md:col-span-2 lg:col-span-4 mt-2 pt-4 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FiSliders className="text-indigo-600 shrink-0" size={16} />
                    <span className="text-xs font-bold text-slate-800">
                      Per Subject Max Marks
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {['25', '50', '75', '100'].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleMaxMarksChange(val)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition shadow-sm ${
                          defaultMaxMarks === val && !showSubjectMaxConfig
                            ? 'bg-indigo-900 text-white'
                            : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {val}
                      </button>
                    ))}

                    <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
                      <span className="text-xs font-semibold text-slate-600">Custom:</span>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={defaultMaxMarks}
                        onChange={(e) => handleMaxMarksChange(e.target.value)}
                        placeholder="e.g. 50"
                        className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold text-center focus:border-indigo-600 focus:outline-none bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
                      <span className="text-xs font-semibold text-slate-600">Passing %:</span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={passingPercentage}
                        onChange={(e) => handlePassingPercentageChange(parseFloat(e.target.value) || 40)}
                        className="w-14 rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold text-center focus:border-indigo-600 focus:outline-none bg-white"
                        title="Passing percentage per subject and overall (default: 40%)"
                      />
                      <span className="text-xs font-bold text-slate-500">%</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowSubjectMaxConfig(!showSubjectMaxConfig)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition shadow-sm ${
                        showSubjectMaxConfig
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                      }`}
                    >
                      {showSubjectMaxConfig ? 'Close Per-Subject Marks' : 'Per-Subject Marks'}
                    </button>
                  </div>
                </div>

                {/* Collapsible Subject-Wise Detailed Max Marks & Names */}
                {showSubjectMaxConfig ? (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                      <p className="text-[11px] font-semibold text-slate-600">
                        Edit subject names and maximum marks. You can add up to {MAX_SUBJECTS_LIMIT} subjects (fits comfortably on A4 report card).
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500">
                          {subjectItems.length} / {MAX_SUBJECTS_LIMIT} Subjects
                        </span>
                        <button
                          type="button"
                          onClick={handleResetSubjects}
                          className="text-[10px] font-semibold text-indigo-600 hover:underline"
                        >
                          Reset Defaults
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                      {subjectItems.map((s) => {
                        return (
                          <div
                            key={s.key}
                            className="rounded-xl border border-slate-200 p-2.5 bg-slate-50 flex flex-col justify-between gap-2 shadow-sm"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <input
                                type="text"
                                value={s.label}
                                onChange={(e) => handleSubjectLabelChange(s.key, e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold text-slate-800 bg-white focus:border-indigo-600 focus:outline-none"
                                title="Click to rename subject"
                              />
                              {subjectItems.length > 1 ? (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSubject(s.key)}
                                  title="Remove this subject"
                                  className="text-slate-400 hover:text-rose-600 p-1 shrink-0 transition"
                                >
                                  <FiTrash2 size={13} />
                                </button>
                              ) : null}
                            </div>

                            <div className="flex items-center justify-between gap-2 text-xs">
                              <span className="text-[11px] font-semibold text-slate-500">Max Marks:</span>
                              <input
                                type="number"
                                min="1"
                                max="500"
                                value={s.maxMarks}
                                onChange={(e) => handleSubjectMaxMarksChange(s.key, e.target.value)}
                                className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold text-center bg-white focus:border-indigo-600 focus:outline-none"
                              />
                            </div>

                            {s.isIslamiat ? (
                              <div className="mt-1 pt-1.5 border-t border-slate-200 flex items-center justify-between gap-1 text-[10px]">
                                <span className="text-slate-500 font-semibold">Oral / Written:</span>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    value={customSubjectMaxMarks['islamiat_oral'] ?? String(Math.round((parseFloat(s.maxMarks) || 100) * 0.4))}
                                    onChange={(e) => {
                                      const curWritten = customSubjectMaxMarks['islamiat_written'] ?? String(Math.round((parseFloat(s.maxMarks) || 100) * 0.6));
                                      handleIslamiatSubMarksChange(e.target.value, curWritten);
                                    }}
                                    title="Nazra / Oral Max Marks"
                                    className="w-12 rounded border border-slate-300 px-1 py-0.5 text-center font-bold bg-white text-slate-800 focus:border-indigo-600 focus:outline-none"
                                  />
                                  <span className="font-bold text-slate-400">+</span>
                                  <input
                                    type="number"
                                    value={customSubjectMaxMarks['islamiat_written'] ?? String(Math.round((parseFloat(s.maxMarks) || 100) * 0.6))}
                                    onChange={(e) => {
                                      const curOral = customSubjectMaxMarks['islamiat_oral'] ?? String(Math.round((parseFloat(s.maxMarks) || 100) * 0.4));
                                      handleIslamiatSubMarksChange(curOral, e.target.value);
                                    }}
                                    title="Written Max Marks"
                                    className="w-12 rounded border border-slate-300 px-1 py-0.5 text-center font-bold bg-white text-slate-800 focus:border-indigo-600 focus:outline-none"
                                  />
                                </div>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}

                      {subjectItems.length < MAX_SUBJECTS_LIMIT ? (
                        <button
                          type="button"
                          onClick={handleAddSubject}
                          className="rounded-xl border-2 border-dashed border-indigo-300 p-2.5 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 flex items-center justify-center gap-2 text-xs font-bold transition min-h-[75px]"
                        >
                          <FiPlus size={16} />
                          <span>Add Subject ({subjectItems.length}/{MAX_SUBJECTS_LIMIT})</span>
                        </button>
                      ) : (
                        <div className="rounded-xl border border-slate-200 p-2.5 bg-slate-100 flex items-center justify-center text-[11px] font-semibold text-slate-500 text-center min-h-[75px]">
                          Max 12 subjects capacity reached (A4 layout full)
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Bottom Bar: Cards summary & duplex toggle */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Total Students:</span>
              <span className="rounded-md bg-indigo-100 px-2.5 py-0.5 font-bold text-indigo-900">
                {students.length}
              </span>
              <span className="text-slate-400">|</span>
              <span className="font-bold text-slate-700">Printable Sheets (A4):</span>
              <span className="rounded-md bg-slate-100 px-2.5 py-0.5 font-bold text-slate-800">
                {cardPairs.length * 2} Sheets
              </span>
            </div>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-1.5 font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mirrorBackForDuplex}
                  onChange={(e) => setMirrorBackForDuplex(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Mirror Back Side for Standard Duplex (Two-Sided) Printing</span>
              </label>
            </div>
          </div>
        </div>

        {/* Student Records Quick Selector */}
        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Select Students to Print ({cardsToPrint.length} of {students.length} Selected)
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedRowNumbers(new Set(students.map((s) => s.rowNumber)))}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Select All
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => setSelectedRowNumbers(new Set())}
                className="text-xs font-bold text-slate-500 hover:underline"
              >
                Deselect All
              </button>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1 pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {students.map((st) => {
                const isSelected = selectedRowNumbers.has(st.rowNumber);
                return (
                  <label
                    key={st.rowNumber}
                    className={`flex items-center gap-2 rounded-xl p-2 border text-xs cursor-pointer transition ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-50/60 font-semibold text-indigo-950'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const next = new Set(selectedRowNumbers);
                        if (e.target.checked) next.add(st.rowNumber);
                        else next.delete(st.rowNumber);
                        setSelectedRowNumbers(next);
                      }}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                    <div className="truncate flex-1">
                      <span className="font-bold">Roll {st.rollNo}:</span> {st.name}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        st.result === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {st.percentage}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== PRINT SHEETS VIEW ===================== */}
      <div className="rc-print-container flex flex-col items-center gap-8 px-4">
        {cardPairs.map((pair, pairIndex) => {
          const firstCard = pair[0];
          const secondCard = pair[1];

          // Duplex positioning:
          // Front Sheet: [Card 1] | [Card 2]
          // Back Sheet (Duplex Mirrored): [Back 2] | [Back 1]
          const backLeftCard = mirrorBackForDuplex ? secondCard : firstCard;
          const backRightCard = mirrorBackForDuplex ? firstCard : secondCard;

          return (
            <div key={`pair-${pairIndex}`} className="rc-pair-wrapper flex flex-col items-center gap-6" data-pair-index={pairIndex}>
              {/* Pair Controls Header */}
              <div className="no-print w-full max-w-[297mm] flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-100 border border-slate-200 px-4 py-2 text-xs">
                <div className="font-bold text-slate-700 flex items-center gap-2">
                  <span className="rounded bg-indigo-100 text-indigo-800 px-2 py-0.5 text-[11px] font-black">
                    Pair #{pairIndex + 1}
                  </span>
                  <span>
                    Left: <strong className="text-slate-900">{firstCard.name}</strong> (Roll: {firstCard.rollNo}) | Right:{' '}
                    {secondCard ? (
                      <><strong className="text-slate-900">{secondCard.name}</strong> (Roll: {secondCard.rollNo})</>
                    ) : (
                      <em className="text-slate-400">Empty</em>
                    )}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handlePrintSinglePair(pairIndex)}
                  disabled={!hasUserUploadedData}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  title={!hasUserUploadedData ? 'Upload student data to enable printing' : `Print Sheet ${pairIndex * 2 + 1} & ${pairIndex * 2 + 2}`}
                >
                  <FiPrinter size={13} className="text-emerald-600" />
                  <span>Print This Pair</span>
                </button>
              </div>

              {/* SHEET 1: 2 FRONTS ON A4 LANDSCAPE */}
              <div className="rc-sheet-wrapper w-full">
                <div className="no-print mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600">
                  <span>A4 Sheet {pairIndex * 2 + 1} — FRONT COVER (2 × A5 Fronts)</span>
                  <span>
                    Left: {firstCard.name} (Roll: {firstCard.rollNo}) | Right:{' '}
                    {secondCard ? `${secondCard.name} (Roll: ${secondCard.rollNo})` : 'Empty'}
                  </span>
                </div>

                <div className="rc-a4-landscape-sheet">
                  <div className="rc-a5-half">
                    <ReportCardFront data={firstCard} school={activeSchoolConfig} />
                  </div>
                  {/* Center Dotted Cutting Line */}
                  <div className="rc-center-cut-line" aria-hidden="true" />
                  <div className="rc-a5-half">
                    {secondCard ? (
                      <ReportCardFront data={secondCard} school={activeSchoolConfig} />
                    ) : (
                      <div className="rc-a5-slot" />
                    )}
                  </div>
                </div>
              </div>

              {/* SHEET 2: 2 BACKS ON A4 LANDSCAPE (Reverse) */}
              <div className="rc-sheet-wrapper w-full">
                <div className="no-print mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600">
                  <span>A4 Sheet {pairIndex * 2 + 2} — RESULT MARKS TABLE (2 × A5 Backs)</span>
                  <span>
                    Left: {backLeftCard?.name || 'Empty'} | Right: {backRightCard?.name || 'Empty'}
                  </span>
                </div>

                <div className="rc-a4-landscape-sheet">
                  <div className="rc-a5-half">
                    {backLeftCard ? (
                      <ReportCardBack data={backLeftCard} school={activeSchoolConfig} subjectRows={subjectItems} isDummy={!hasUserUploadedData} passingPct={passingPercentage} />
                    ) : (
                      <div className="rc-a5-slot" />
                    )}
                  </div>
                  {/* Center Dotted Cutting Line */}
                  <div className="rc-center-cut-line" aria-hidden="true" />
                  <div className="rc-a5-half">
                    {backRightCard ? (
                      <ReportCardBack data={backRightCard} school={activeSchoolConfig} subjectRows={subjectItems} isDummy={!hasUserUploadedData} passingPct={passingPercentage} />
                    ) : (
                      <div className="rc-a5-slot" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* ===================== BOTTOM ACTIONS & FEEDBACK ===================== */}
        <div className="no-print w-full max-w-5xl mx-auto flex flex-col gap-3 mt-4 mb-8">
          {/* READY TO PRINT ACTION BAR (TOP) */}
          <div className="w-full rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white shadow-2xl border border-indigo-500/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                {!hasUserUploadedData ? (
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300">
                      <FiEye size={14} />
                      <span>Preview Mode (Sample Data)</span>
                    </div>
                    <h3 className="mt-1.5 text-lg font-black tracking-tight text-white">
                      Sample Preview Mode • Upload Student Data to Print
                    </h3>
                    <p className="mt-0.5 text-xs text-indigo-200">
                      Dummy obtained marks are shown in light gray for review only. Upload your Excel marksheet or scan students above to enable printing and PDF download.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-300">
                      <FiCheckCircle size={14} className="text-emerald-400" />
                      <span>Review Complete</span>
                    </div>
                    <h3 className="mt-1.5 text-lg font-black tracking-tight text-white">
                      Ready to Print {cardsToPrint.length} Student Report Cards
                    </h3>
                    <p className="mt-0.5 text-xs text-indigo-200">
                      {cardPairs.length * 2} A4 Landscape Sheets total ({cardPairs.length} Front covers + {cardPairs.length} Back marks tables with duplex mirroring).
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handlePrint}
                  disabled={!hasUserUploadedData}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-lg hover:bg-emerald-400 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-slate-700"
                  title={!hasUserUploadedData ? 'Upload student data to enable printing' : 'Print All Report Cards'}
                >
                  <FiPrinter size={18} />
                  <span>Print All Report Cards</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={!hasUserUploadedData || pdfGenerating}
                  className="inline-flex items-center gap-2 rounded-xl bg-white text-indigo-950 px-5 py-3 text-sm font-bold shadow-lg hover:bg-indigo-50 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-slate-200"
                  title={!hasUserUploadedData ? 'Upload student data to enable PDF export' : 'Download Complete PDF'}
                >
                  <FiDownload size={18} />
                  <span>{pdfGenerating ? 'Generating PDF...' : 'Download Complete PDF'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* WHATSAPP FEEDBACK & CONTACT BAR (UNDERNEATH) */}
          <div className="w-full rounded-xl bg-white border border-slate-200 px-5 py-3 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <FaWhatsapp className="text-emerald-600 text-base shrink-0" />
                  <span className="text-xs font-bold text-slate-800">
                    Feedback & Support / رہنمائی و تجاویز
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-normal">
                  اگر آپ کو رپورٹ کارڈ میں کوئی غلطی نظر آئے یا اپنے اسکول کے لیے کچھ نیا شامل کروانا ہو، تو براہِ راست واٹس ایپ پر رابطہ فرمائیں۔
                </p>
                <p className="text-[11px] text-slate-400">
                  Notice any mistake or need custom features or subjects added? Message Master Sahib directly on WhatsApp.
                </p>
              </div>

              <a
                href="https://wa.me/923458340669?text=Assalam%20o%20Alaikum%20Master%20Sahib,%20I%20have%20feedback%20regarding%20the%20Report%20Card%20Generator"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition shrink-0"
              >
                <FaWhatsapp size={15} />
                <span>Contact on WhatsApp (+92 345 8340669)</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== Print & Card CSS ===================== */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&display=swap');

        .rc-a4-landscape-sheet {
          position: relative;
          width: 297mm;
          height: 210mm;
          background: #ffffff;
          display: flex;
          flex-direction: row;
          align-items: stretch;
          justify-content: space-between;
          box-sizing: border-box;
          box-shadow: 0 8px 30px rgba(15, 23, 42, 0.12);
          border: 1px solid #cbd5e1;
          overflow: hidden;
          color: #000000;
          font-family: Arial, Helvetica, sans-serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .rc-a5-half {
          width: 148.5mm;
          height: 210mm;
          box-sizing: border-box;
          flex-shrink: 0;
        }

        .rc-center-cut-line {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 148.5mm;
          width: 0;
          border-left: 1.5px dashed #475569;
          z-index: 20;
          pointer-events: none;
        }

        .rc-a5-slot {
          width: 148.5mm;
          height: 210mm;
          padding: 8.5mm;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }

        .rc-outer-border {
          width: 100%;
          height: 100%;
          border: 2.6px solid #000000;
          border-radius: 13px;
          padding: 2.5px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }

        .rc-inner-border {
          width: 100%;
          height: 100%;
          border: 1.1px solid #000000;
          border-radius: 10px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }

        .rc-front-content {
          padding: 5mm 8mm 6.5mm 8mm;
          justify-content: space-between;
          align-items: center;
        }

        .rc-front-logo-header {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding-top: 1.5mm;
          margin-bottom: 1mm;
        }

        .rc-prominent-school-logo {
          width: 54mm;
          height: 54mm;
          object-fit: contain;
        }

        .rc-front-school-title {
          font-family: Arial, Helvetica, sans-serif;
          font-size: 11pt;
          font-weight: 800;
          text-transform: uppercase;
          text-align: center;
          color: #000000;
          max-width: 95%;
          line-height: 1.2;
          margin-top: 1mm;
          margin-bottom: 1.5mm;
          letter-spacing: 0.3px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .rc-badge-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          margin: 1.5mm 0 2mm 0;
        }

        .rc-progress-pill {
          border: 1.4px solid #000000;
          border-radius: 999px;
          height: 12mm;
          min-height: 12mm;
          padding: 0 8mm;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          box-sizing: border-box;
        }

        .rc-blackletter-text {
          font-family: 'UnifrakturMaguntia', 'Old English Text MT', 'Engravers Old English BT', Georgia, serif;
          font-size: 18pt;
          font-weight: 400;
          line-height: 1;
          color: #000000;
          display: inline-block;
          vertical-align: middle;
          letter-spacing: 0.5px;
        }

        .rc-session-year-row {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13pt;
          font-weight: 800;
          color: #000000;
          margin: 1.8mm 0 2.2mm 0;
          line-height: 1;
        }

        .rc-year-prefix {
          font-weight: 800;
          line-height: 1;
          display: inline-block;
        }

        .rc-year-dots {
          display: inline-flex;
          align-items: flex-end;
          justify-content: center;
          min-width: 16mm;
          height: 6.5mm;
          border-bottom: 1.5px dotted #000000;
          text-align: center;
          font-size: 11.5pt;
          font-weight: 700;
          padding: 0 1mm 0 1mm;
          margin: 0 1.5mm 0 1mm;
          line-height: 1;
          box-sizing: border-box;
        }

        .rc-year-dots span {
          display: inline-block;
          margin-bottom: 1.8mm;
          line-height: 1;
        }

        .rc-year-dash {
          font-size: 14pt;
          font-weight: 800;
          margin: 0 2.5mm;
          line-height: 1;
          display: inline-block;
        }

        .rc-front-fields {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 3.2mm;
          margin-top: 1mm;
        }

        .rc-field-row-split {
          display: flex;
          flex-direction: row;
          gap: 5mm;
          width: 100%;
        }

        .rc-field-line {
          display: flex;
          align-items: center;
          gap: 2mm;
          width: 100%;
          min-height: 6.8mm;
          margin-bottom: 0.6mm;
        }

        .rc-field-label {
          font-size: 9.6pt;
          font-weight: 700;
          color: #000000;
          white-space: nowrap;
          padding-bottom: 0;
          line-height: 1;
        }

        .rc-field-value {
          flex: 1;
          border-bottom: 1.2px solid #000000;
          font-size: 10pt;
          font-weight: 700;
          color: #000000;
          text-align: center;
          min-height: 6.5mm;
          height: 6.5mm;
          line-height: 1;
          padding: 0 1.5mm 0 1.5mm;
          display: inline-flex;
          align-items: flex-end;
          justify-content: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          box-sizing: border-box;
        }

        .rc-field-text {
          display: inline-block;
          margin-bottom: 2.2mm;
          line-height: 1.1;
        }

        .rc-field-value-left {
          justify-content: flex-start;
          text-align: left;
        }

        .rc-back-content {
          padding: 4.5mm 5.5mm 4.5mm 5.5mm;
          justify-content: space-between;
        }

        .rc-back-top-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-bottom: 1.8mm;
        }

        .rc-back-top-field {
          display: flex;
          align-items: center;
          gap: 1.5mm;
          min-height: 5.5mm;
        }

        .rc-back-top-label {
          font-size: 9.5pt;
          font-weight: 700;
          color: #000000;
          white-space: nowrap;
          line-height: 1;
        }

        .rc-back-top-val {
          flex: 1;
          border-bottom: 1.2px solid #000000;
          font-size: 10pt;
          font-weight: 700;
          text-align: center;
          min-height: 5.5mm;
          height: 5.5mm;
          padding: 0 1.5mm 0 1.5mm;
          display: inline-flex;
          align-items: flex-end;
          justify-content: center;
          box-sizing: border-box;
          line-height: 1;
        }

        .rc-back-top-val span {
          display: inline-block;
          margin-bottom: 1.8mm;
          line-height: 1;
        }

        .rc-table-wrapper {
          position: relative;
          width: 100%;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .rc-watermark-wrap {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 1;
        }

        .rc-watermark-img {
          width: 72mm;
          height: 72mm;
          object-fit: contain;
          filter: grayscale(100%);
          opacity: 0.15;
        }

        .rc-marks-table {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
          border-collapse: collapse;
          border: 1.4px solid #000000;
          background: transparent;
        }

        .rc-marks-table th,
        .rc-marks-table td {
          border: 1px solid #000000;
          padding: 0;
          color: #000000;
        }

        .rc-exam-banner-cell {
          font-size: 10.5pt;
          font-weight: 800;
          text-align: center;
          padding: 1.6mm 2mm !important;
          letter-spacing: 0.3px;
        }

        .rc-exam-title-text {
          font-weight: 800;
        }

        .rc-exam-year-badge {
          display: inline-block;
          margin-left: 2.5mm;
          font-weight: 800;
          letter-spacing: 0.4px;
        }

        .rc-col-header-row th {
          font-size: 8.6pt;
          font-weight: 800;
          text-align: center;
          padding: 1.2mm 1mm !important;
          line-height: 1.1;
        }

        .rc-two-line-th {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          line-height: 1.08;
        }

        .rc-subj-row {
          height: 8.2mm;
        }

        .rc-subj-name-cell {
          padding: 0 2.2mm !important;
          font-size: 9.5pt;
          font-weight: 700;
          text-align: left;
          vertical-align: middle;
        }

        .rc-subj-compact {
          font-size: 8.2pt;
          letter-spacing: -0.2px;
        }

        .rc-num-cell {
          text-align: center;
          vertical-align: middle;
          font-size: 9.5pt;
          font-weight: 700;
        }

        .rc-islamiat-row {
          height: 10.2mm;
        }

        .rc-islamiat-cell {
          padding: 0 !important;
          vertical-align: stretch;
        }

        .rc-islamiat-grid {
          display: flex;
          width: 100%;
          height: 100%;
          align-items: stretch;
        }

        .rc-islamiat-main {
          width: 40%;
          display: flex;
          align-items: center;
          padding-left: 2.2mm;
          font-size: 9.5pt;
          font-weight: 700;
          border-right: 1px solid #000000;
          box-sizing: border-box;
        }

        .rc-islamiat-sub {
          width: 60%;
          display: flex;
          flex-direction: column;
          justify-content: stretch;
        }

        .rc-islamiat-sub-top,
        .rc-islamiat-sub-bottom {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.8mm;
          font-size: 7.2pt;
          font-weight: 700;
          font-style: italic;
        }

        .rc-islamiat-sub-top {
          border-bottom: 1px solid #000000;
        }

        .rc-islamiat-num {
          font-style: normal;
          font-weight: 700;
        }

        .rc-grand-total-row {
          height: 8.6mm;
        }

        .rc-grand-total-label {
          font-size: 9.8pt;
          font-weight: 800;
        }

        .rc-grand-total-val {
          font-size: 9.8pt;
          font-weight: 800;
        }

        .rc-remarks-merged-cell {
          vertical-align: top;
          padding: 3.5mm 1.5mm !important;
          height: 100%;
        }

        .rc-remarks-stack {
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          align-items: center;
          height: 100%;
          min-height: 102mm;
          text-align: center;
        }

        .rc-remark-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1mm;
          width: 100%;
        }

        .rc-remark-heading {
          font-size: 7.8pt;
          font-weight: 800;
          letter-spacing: 0.2px;
          color: #000000;
        }

        .rc-remark-value {
          font-size: 9.2pt;
          font-weight: 800;
          min-height: 4.5mm;
          color: #000000;
        }

        .rc-back-footer {
          display: flex;
          flex-direction: column;
          gap: 2.5mm;
          margin-top: 2.5mm;
          width: 100%;
        }

        .rc-footer-line {
          display: flex;
          align-items: center;
          gap: 1.5mm;
          width: 100%;
          min-height: 6mm;
        }

        .rc-footer-label {
          font-size: 8.8pt;
          font-weight: 800;
          color: #000000;
          white-space: nowrap;
          line-height: 1;
        }

        .rc-footer-val {
          flex: 1;
          border-bottom: 1.2px solid #000000;
          min-height: 5mm;
          height: 5mm;
          font-size: 9pt;
          font-weight: 700;
          padding: 0 1.5mm;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          line-height: 1;
        }

        .rc-dummy-num {
          color: #94a3b8 !important;
          font-weight: 500 !important;
        }

        .rc-failed-mark {
          border-bottom: 1.5px solid currentColor;
          display: inline-block;
          line-height: 1.05;
          padding-bottom: 0.5px;
          font-weight: 800;
        }

        @media print {
          ${!hasUserUploadedData ? `
            .rc-print-container {
              display: none !important;
            }
          ` : ''}

          ${activePrintPairIndex !== null ? `
            .rc-pair-wrapper:not([data-pair-index="${activePrintPairIndex}"]) {
              display: none !important;
            }
          ` : ''}

          .rc-print-hidden {
            display: none !important;
          }
          @page {
            size: A4 landscape;
            margin: 0;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
          }

          /* Hide global navbar, news ticker, floating back button, footers, headers during print */
          header,
          nav,
          footer,
          .navbar,
          [aria-label="Back to global website"],
          [class*="NewsTicker"],
          [class*="Navbar"],
          .no-print {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
          }

          .rc-print-container {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            gap: 0 !important;
            width: 100% !important;
          }

          .rc-pair-wrapper {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
            gap: 0 !important;
            width: 100% !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }

          .rc-sheet-wrapper {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }

          .rc-a4-landscape-sheet {
            display: flex !important;
            width: 297mm !important;
            height: 209.5mm !important;
            max-height: 209.5mm !important;
            box-sizing: border-box !important;
            border: none !important;
            box-shadow: none !important;
            margin: 0 auto !important;
            padding: 0 !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: always !important;
            break-after: page !important;
            overflow: hidden !important;
          }
        }
      `}</style>
    </main>
  );

  function applyCustomSubjectChange(updated: Partial<Record<SubjectKey, string>>) {
    const base = parseFloat(defaultMaxMarks) || 100;
    const nextUpdated: Partial<Record<SubjectKey, string>> = { ...updated };
    if (updated.islamiat_oral || updated.islamiat_written) {
      const oral = parseFloat(updated.islamiat_oral || String(Math.round(base * 0.4))) || 0;
      const written = parseFloat(updated.islamiat_written || String(Math.round(base * 0.6))) || 0;
      nextUpdated.islamiat_total = String(oral + written);
    }
    setCustomSubjectMaxMarks(nextUpdated);
    setStudents((prev) =>
      prev.map((st) => {
        const nextSubjects = { ...st.subjects };
        Object.entries(nextSubjects).forEach(([k, score]) => {
          if (!score) return;
          const key = k as SubjectKey;
          let subMax = nextUpdated[key] || defaultMaxMarks;
          if (key === 'islamiat_total' && nextUpdated.islamiat_total) {
            subMax = nextUpdated.islamiat_total;
          }
          nextSubjects[key] = {
            maxMarks: subMax,
            marksObtained: score.marksObtained,
          };
        });
        const stats = computeStudentStats(nextSubjects);
        return {
          ...st,
          subjects: nextSubjects,
          grandTotalMax: stats.grandTotalMax,
          grandTotalObtained: stats.grandTotalObtained,
          percentage: stats.percentage,
          grade: stats.grade,
          result: stats.result,
        };
      }),
    );
  }
}
