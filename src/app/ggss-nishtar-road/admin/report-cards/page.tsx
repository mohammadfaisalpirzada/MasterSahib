'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import {
  FiPrinter,
  FiRefreshCw,
  FiCamera,
  FiUploadCloud,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiDownload,
  FiCheckCircle,
  FiAlertTriangle,
  FiX,
  FiSearch,
} from 'react-icons/fi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import {
  type AdmissionRecord,
  defaultSessionLabel,
} from '../id-cards/idCardUtils';
import {
  ReportCardFront,
  ReportCardBack,
  REPORT_SUBJECT_ROWS,
  SCHOOL_PRESETS,
  DEFAULT_SCHOOL_ID,
  type SchoolId,
  type SchoolConfig,
  type ReportCardStudentData,
  type SubjectKey,
} from './StudentReportCard';

const CLASS_OPTIONS = ['ECE', 'Prep / KG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const CLASS_SORT_INDEX = new Map(CLASS_OPTIONS.map((cls, index) => [cls, index]));

export const TERM_OPTIONS = [
  { id: 'summative_one', label: 'Summative Assessment I (Summative One)', defaultTitle: 'SUMMATIVE ASSESSMENT - I' },
  { id: 'summative_two', label: 'Summative Assessment II (Summative Two)', defaultTitle: 'SUMMATIVE ASSESSMENT - II' },
  { id: 'first_assessment', label: 'First Assessment (Formative I)', defaultTitle: 'FIRST ASSESSMENT' },
  { id: 'second_assessment', label: 'Second Assessment (Formative II)', defaultTitle: 'SECOND ASSESSMENT' },
  { id: 'first_term', label: 'First Term Examination', defaultTitle: 'FIRST TERM EXAMINATION' },
  { id: 'mid_term', label: 'Mid Term Examination', defaultTitle: 'MID TERM EXAMINATION' },
  { id: 'final_term', label: 'Final Term / Annual Examination', defaultTitle: 'FINAL TERM EXAMINATION' },
  { id: 'other', label: 'Other (Custom Term)', defaultTitle: '' },
] as const;

type SortKey = 'class' | 'gr_no' | 'roll_no' | 'name';

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: 'class', label: 'Class' },
  { key: 'gr_no', label: 'GR No.' },
  { key: 'roll_no', label: 'Roll No.' },
  { key: 'name', label: 'Student Name' },
];

const compareNumericOrText = (a: string, b: string) => {
  const numA = parseInt(String(a ?? '').replace(/\D/g, ''), 10);
  const numB = parseInt(String(b ?? '').replace(/\D/g, ''), 10);
  if (Number.isFinite(numA) && Number.isFinite(numB) && numA !== numB) return numA - numB;
  return String(a ?? '').localeCompare(String(b ?? ''));
};

const compareByClass = (a: string, b: string) => {
  const indexA = CLASS_SORT_INDEX.has(a) ? CLASS_SORT_INDEX.get(a)! : CLASS_OPTIONS.length;
  const indexB = CLASS_SORT_INDEX.has(b) ? CLASS_SORT_INDEX.get(b)! : CLASS_OPTIONS.length;
  return indexA - indexB;
};

const sortCards = (cards: ReportCardStudentData[], sortKey: SortKey, direction: 'asc' | 'desc') => {
  const sorted = [...cards].sort((a, b) => {
    if (sortKey === 'class') return compareByClass(a.studentClass || '', b.studentClass || '');
    if (sortKey === 'gr_no') return compareNumericOrText(a.gr_no || '', b.gr_no || '');
    if (sortKey === 'roll_no') return compareNumericOrText(a.roll_no || '', b.roll_no || '');
    return String(a.name ?? '').localeCompare(String(b.name ?? ''));
  });
  return direction === 'desc' ? sorted.reverse() : sorted;
};

const parseJsonResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    const raw = await response.text();
    throw new Error(raw.slice(0, 200) || 'Server returned a non-JSON response.');
  }
  return response.json();
};

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
    return { startSuffix: '', endSuffix: '' };
  }
  const toTwoDigit = (val: string) => (val.length >= 2 ? val.slice(-2) : val);
  return {
    startSuffix: toTwoDigit(matches[0] || ''),
    endSuffix: matches[1] ? toTwoDigit(matches[1]) : '',
  };
};

// Storage keys for persisting user's last selected settings
const LS_SESSION = 'rc_pref_session';
const LS_TERM_ID = 'rc_pref_term_id';
const LS_EXAM_TITLE = 'rc_pref_exam_title';
const LS_EXAM_YEAR = 'rc_pref_exam_year';
const LS_CLASS = 'rc_pref_class';
const LS_MAX_MARKS = 'rc_pref_max_marks';

export default function ReportCardsPage() {
  const [authLoading, setAuthLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  // Active view tab: 'print' | 'scanner' | 'manual'
  const [activeTab, setActiveTab] = useState<'print' | 'scanner' | 'manual'>('print');

  // Filters & Global parameters with auto-memory
  const [sessionLabel, setSessionLabel] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LS_SESSION);
      if (saved) return saved;
    }
    return defaultSessionLabel();
  });

  const [selectedTermId, setSelectedTermId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LS_TERM_ID);
      if (saved) return saved;
    }
    return 'summative_one';
  });

  const [examTitle, setExamTitle] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LS_EXAM_TITLE);
      if (saved) return saved;
    }
    return 'SUMMATIVE ASSESSMENT - I';
  });

  const [customTermText, setCustomTermText] = useState<string>('');

  const [examYearSuffix, setExamYearSuffix] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LS_EXAM_YEAR);
      if (saved) return saved;
    }
    const { startSuffix } = parseSessionYears(defaultSessionLabel());
    return startSuffix || '26';
  });

  const [classFilter, setClassFilter] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LS_CLASS);
      if (saved) return saved;
    }
    return '';
  });

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('class');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Print controls
  const [mirrorBackForDuplex, setMirrorBackForDuplex] = useState<boolean>(true);
  const [fillOddSlotWithBlankTemplate, setFillOddSlotWithBlankTemplate] = useState<boolean>(true);

  // Live Data Lists
  const [admissionRecords, setAdmissionRecords] = useState<AdmissionRecord[]>([]);
  const [savedResults, setSavedResults] = useState<Record<string, string>[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Selected student cards for printing
  const [selectedRowNumbers, setSelectedRowNumbers] = useState<Set<string>>(new Set());

  // AI Tabulation Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [scannedStudents, setScannedStudents] = useState<any[]>([]);
  const [scanFilePreview, setScanFilePreview] = useState<string>('');
  const [scanFileMime, setScanFileMime] = useState<string>('');
  const [additionalScanNotes, setAdditionalScanNotes] = useState('');
  const [duplicateWarningModal, setDuplicateWarningModal] = useState<{
    open: boolean;
    duplicates: any[];
    pendingPayload?: any[];
  }>({ open: false, duplicates: [] });

  // Default max marks map helper
  const getDefaultMaxMarks = (): Record<string, string> => {
    if (typeof window !== 'undefined') {
      const savedJson = localStorage.getItem(LS_MAX_MARKS);
      if (savedJson) {
        try {
          return JSON.parse(savedJson);
        } catch {
          // ignore
        }
      }
    }
    const standard: Record<string, string> = {};
    REPORT_SUBJECT_ROWS.forEach((s) => {
      standard[`${s.key}_max`] = '100';
    });
    standard['islamiat_oral_max'] = '40';
    standard['islamiat_written_max'] = '60';
    standard['islamiat_total_max'] = '100';
    return standard;
  };

  // Manual Entry Form State
  const [manualFormOpen, setManualFormOpen] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);
  const [manualSelectedAdmission, setManualSelectedAdmission] = useState<string>('');
  const [manualFormData, setManualFormData] = useState<Record<string, string>>(() => ({
    session: defaultSessionLabel(),
    exam_term_id: 'summative_one',
    exam_title: 'SUMMATIVE ASSESSMENT - I',
    exam_year_suffix: '26',
    student_class: '',
    gr_no: '',
    roll_no: '',
    student_name: '',
    father_name: '',
    dob: '',
    address: '',
    conduct: 'Good',
    attendance: '95%',
    result: 'PASS',
    ...getDefaultMaxMarks(),
  }));

  const [pdfGenerating, setPdfGenerating] = useState(false);

  // Active School Selection (Default: Govt Boys Pakistan Quarter)
  const [selectedSchoolId, setSelectedSchoolId] = useState<SchoolId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ms_rc_school_id') as SchoolId;
      if (saved && (saved === 'gbss_pak_quarter' || saved === 'ggss_nishtar_road')) {
        return saved;
      }
    }
    return DEFAULT_SCHOOL_ID;
  });

  const activeSchool: SchoolConfig = SCHOOL_PRESETS[selectedSchoolId] || SCHOOL_PRESETS[DEFAULT_SCHOOL_ID];

  const handleSchoolChange = (id: SchoolId) => {
    setSelectedSchoolId(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ms_rc_school_id', id);
    }
  };

  // Synchronize Preferences into LocalStorage
  const persistPreferences = (
    session: string,
    termId: string,
    title: string,
    yearSuffix: string,
    cls: string,
    maxMarksObj?: Record<string, string>,
  ) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LS_SESSION, session);
    localStorage.setItem(LS_TERM_ID, termId);
    localStorage.setItem(LS_EXAM_TITLE, title);
    localStorage.setItem(LS_EXAM_YEAR, yearSuffix);
    if (cls) localStorage.setItem(LS_CLASS, cls);
    if (maxMarksObj) {
      localStorage.setItem(LS_MAX_MARKS, JSON.stringify(maxMarksObj));
    }
  };

  // Auth verification
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/staff-records/admin/auth/session', { cache: 'no-store' });
        const data = await parseJsonResponse(response);
        setAuthenticated(Boolean(data.authenticated));
      } catch {
        setAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    };
    void checkSession();
  }, []);

  // Fetch both Admission Forms and Saved Results from Google Sheets
  const refreshAllData = async () => {
    setLoadingData(true);
    setDataError('');
    try {
      // 1. Fetch Admission Records
      const admRes = await fetch('/api/ggss-admission-form/records', { cache: 'no-store' });
      const admData = await parseJsonResponse(admRes);
      if (admRes.ok && admData.success) {
        setAdmissionRecords(admData.records || []);
      }

      // 2. Fetch Results from Google Sheet tab "result card data"
      const resRes = await fetch(
        `/api/ggss-report-cards?session=${encodeURIComponent(sessionLabel)}&examTitle=${encodeURIComponent(examTitle)}`,
        { cache: 'no-store' },
      );
      const resData = await parseJsonResponse(resRes);
      if (resRes.ok && resData.success) {
        setSavedResults(resData.records || []);
      }
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Unable to load data.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      void refreshAllData();
    }
  }, [authenticated, sessionLabel, examTitle]);

  // Handle Term Dropdown Change (Filter Bar)
  const handleTermChange = (termId: string, customText = '') => {
    setSelectedTermId(termId);
    let resolvedTitle = '';
    if (termId === 'other') {
      resolvedTitle = customText.trim().toUpperCase() || 'EXAMINATION';
      setCustomTermText(customText);
    } else {
      const match = TERM_OPTIONS.find((t) => t.id === termId);
      resolvedTitle = match?.defaultTitle || 'SUMMATIVE ASSESSMENT - I';
      setCustomTermText('');
    }
    setExamTitle(resolvedTitle);
    persistPreferences(sessionLabel, termId, resolvedTitle, examYearSuffix, classFilter);
  };

  // Merge Saved Results with Admission biodata
  const combinedReportCards: ReportCardStudentData[] = useMemo(() => {
    const { startSuffix, endSuffix } = parseSessionYears(sessionLabel);

    const admByGr = new Map<string, AdmissionRecord>();
    const admByName = new Map<string, AdmissionRecord>();
    admissionRecords.forEach((adm) => {
      if (adm.gr_no) admByGr.set(adm.gr_no.trim().toLowerCase(), adm);
      if (adm.student_name) admByName.set(adm.student_name.trim().toLowerCase(), adm);
    });

    if (savedResults.length > 0) {
      return savedResults.map((row, idx) => {
        const gr = row.gr_no || '';
        const name = row.student_name || '';
        const matchedAdm = admByGr.get(gr.trim().toLowerCase()) || admByName.get(name.trim().toLowerCase());

        const subjects: Partial<Record<SubjectKey, { maxMarks: string; marksObtained: string }>> = {};
        REPORT_SUBJECT_ROWS.forEach((subj) => {
          const max = row[`${subj.key}_max`] || '';
          const obt = row[`${subj.key}_obt`] || '';
          if (max || obt) {
            subjects[subj.key] = { maxMarks: max, marksObtained: obt };
          }
        });

        if (row.islamiat_oral_max || row.islamiat_oral_obt) {
          subjects['islamiat_oral'] = {
            maxMarks: row.islamiat_oral_max || '40',
            marksObtained: row.islamiat_oral_obt || '',
          };
        }
        if (row.islamiat_written_max || row.islamiat_written_obt) {
          subjects['islamiat_written'] = {
            maxMarks: row.islamiat_written_max || '60',
            marksObtained: row.islamiat_written_obt || '',
          };
        }
        if (row.islamiat_total_max || row.islamiat_total_obt) {
          subjects['islamiat_total'] = {
            maxMarks: row.islamiat_total_max || '100',
            marksObtained: row.islamiat_total_obt || '',
          };
        }

        return {
          rowNumber: row.row_number || String(idx + 2),
          rollNo: row.roll_no || matchedAdm?.roll_no || '',
          grNo: gr || matchedAdm?.gr_no || '',
          name: name || matchedAdm?.student_name || '',
          fatherName: row.father_name || matchedAdm?.father_name || '',
          studentClass: row.student_class || matchedAdm?.admission_class || '',
          dob: row.dob || matchedAdm?.dob || '',
          address: row.address || matchedAdm?.address || '',
          sessionStartYear: startSuffix,
          sessionEndYear: endSuffix,
          sessionFull: row.session || sessionLabel,
          examTitle: row.exam_title || examTitle,
          examYearSuffix: row.exam_year_suffix || examYearSuffix,
          subjects,
          grandTotalMax: row.grand_total_max || '',
          grandTotalObtained: row.grand_total_obt || '',
          result: row.result || '',
          percentage: row.percentage || '',
          grade: row.grade || '',
          rank: row.rank || '',
          attendance: row.attendance || '',
          conduct: row.conduct || 'Good',
        };
      });
    }

    return admissionRecords.map((adm, idx) => ({
      rowNumber: adm.row_number || String(idx + 2),
      rollNo: adm.roll_no || '',
      grNo: adm.gr_no || '',
      name: adm.student_name || '',
      fatherName: adm.father_name || '',
      studentClass: adm.admission_class || '',
      dob: adm.dob || '',
      address: adm.address || '',
      sessionStartYear: startSuffix,
      sessionEndYear: endSuffix,
      sessionFull: sessionLabel,
      examTitle,
      examYearSuffix,
      subjects: {},
      grandTotalMax: '',
      grandTotalObtained: '',
      result: '',
      percentage: '',
      grade: '',
      rank: '',
      attendance: '',
      conduct: 'Good',
    }));
  }, [savedResults, admissionRecords, sessionLabel, examTitle, examYearSuffix]);

  // Filtered Cards
  const filteredCards = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = combinedReportCards.filter((card) => {
      if (classFilter && String(card.studentClass ?? '').trim() !== classFilter) return false;
      if (!term) return true;
      return [card.name, card.fatherName, card.grNo, card.rollNo]
        .some((val) => String(val ?? '').toLowerCase().includes(term));
    });
    return sortCards(filtered, sortKey, sortDirection);
  }, [combinedReportCards, classFilter, search, sortKey, sortDirection]);

  // Selection handlers
  const toggleSelectCard = (rowNumber: string) => {
    setSelectedRowNumbers((prev) => {
      const next = new Set(prev);
      if (next.has(rowNumber)) next.delete(rowNumber);
      else next.add(rowNumber);
      return next;
    });
  };

  const allFilteredSelected = filteredCards.length > 0 && filteredCards.every((c) => selectedRowNumbers.has(c.rowNumber));

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      setSelectedRowNumbers((prev) => {
        const next = new Set(prev);
        filteredCards.forEach((c) => next.delete(c.rowNumber));
        return next;
      });
    } else {
      setSelectedRowNumbers((prev) => {
        const next = new Set(prev);
        filteredCards.forEach((c) => next.add(c.rowNumber));
        return next;
      });
    }
  };

  const selectedCardsInOrder = useMemo(() => {
    return filteredCards.filter((c) => selectedRowNumbers.has(c.rowNumber));
  }, [filteredCards, selectedRowNumbers]);

  const cardsToPrint: ReportCardStudentData[] = useMemo(() => {
    if (selectedCardsInOrder.length > 0) return selectedCardsInOrder;
    if (filteredCards.length >= 2) return [filteredCards[0], filteredCards[1]];
    if (filteredCards.length === 1) return [filteredCards[0]];
    const { startSuffix, endSuffix } = parseSessionYears(sessionLabel);
    return [
      {
        rowNumber: 'sample-1',
        rollNo: '',
        grNo: '',
        name: '',
        fatherName: '',
        studentClass: classFilter || 'VI',
        dob: '',
        address: '',
        sessionStartYear: startSuffix,
        sessionEndYear: endSuffix,
        sessionFull: sessionLabel,
        examTitle,
        examYearSuffix,
        subjects: {},
        grandTotalMax: '',
        grandTotalObtained: '',
        result: '',
        percentage: '',
        grade: '',
        rank: '',
        attendance: '',
        conduct: '',
      },
    ];
  }, [selectedCardsInOrder, filteredCards, sessionLabel, examTitle, examYearSuffix, classFilter]);

  const cardPairs = useMemo(() => groupIntoPairs(cardsToPrint), [cardsToPrint]);

  // Bulk Print & PDF
  const handleBulkPrint = () => window.print();

  const handleExportBulkPdf = async () => {
    setPdfGenerating(true);
    setStatusMessage('Generating print-ready PDF...');
    try {
      const sheets = Array.from(document.querySelectorAll<HTMLElement>('.rc-a4-landscape-sheet'));
      if (!sheets.length) throw new Error('No printable sheets found on page.');

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
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);
      }

      const schoolSlug = activeSchool.id === 'gbss_pak_quarter' ? 'GBSS_Pakistan_Quarter' : 'GGSS_Nishtar_Road';
      pdf.save(`${schoolSlug}_Report_Cards_${classFilter || 'All'}.pdf`);
      setStatusMessage('PDF downloaded successfully!');
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'PDF generation failed.');
    } finally {
      setPdfGenerating(false);
    }
  };

  // AI Tabulation Scanner Handlers
  const handleScanFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setScanError('');
    setIsScanning(true);
    setStatusMessage('Uploading and scanning tabulation sheet with Gemini AI...');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string) || '';
        const mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
        setScanFilePreview(base64Data);
        setScanFileMime(mimeType);

        const response = await fetch('/api/ggss-report-cards/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: base64Data,
            mimeType,
            additionalNotes: additionalScanNotes || `Session: ${sessionLabel}, Exam: ${examTitle}, Class: ${classFilter}`,
          }),
        });

        const data = await parseJsonResponse(response);
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'AI Scan failed. Please try a clearer picture or PDF.');
        }

        setScannedStudents(data.students || []);
        setStatusMessage(`AI detected ${data.students?.length || 0} student results! Review and verify below.`);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Error scanning file.');
    } finally {
      setIsScanning(false);
    }
  };

  // Save Scanned Results to Google Sheet
  const handleCommitScannedResults = async (allowOverwrite = false) => {
    if (!scannedStudents.length) return;
    setLoadingData(true);
    setStatusMessage('Saving results to Google Sheet (result card data)...');
    try {
      const payload = scannedStudents.map((st) => {
        const row: Record<string, string> = {
          session: sessionLabel,
          exam_title: examTitle,
          exam_year_suffix: examYearSuffix,
          student_class: st.studentClass || classFilter || '',
          gr_no: st.grNo || '',
          roll_no: st.rollNo || '',
          student_name: st.studentName || '',
          father_name: st.fatherName || '',
          grand_total_max: String(st.grandTotalMax || ''),
          grand_total_obt: String(st.grandTotalObtained || ''),
          percentage: String(st.percentage || ''),
          grade: String(st.grade || ''),
          rank: String(st.rank || ''),
          result: String(st.result || 'PASS'),
          attendance: String(st.attendance || '90%'),
          conduct: String(st.conduct || 'Good'),
        };

        if (st.subjects) {
          Object.keys(st.subjects).forEach((subKey) => {
            const sub = st.subjects[subKey];
            row[`${subKey}_max`] = String(sub.maxMarks || '');
            row[`${subKey}_obt`] = String(sub.marksObtained || '');
          });
        }
        return row;
      });

      const response = await fetch('/api/ggss-report-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: payload, allowOverwrite }),
      });

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        if (data.hasDuplicates) {
          setDuplicateWarningModal({
            open: true,
            duplicates: data.duplicates || [],
            pendingPayload: payload,
          });
          return;
        }
        throw new Error(data.message || 'Unable to save results to Google Sheet.');
      }

      // Persist preferences for next session
      persistPreferences(sessionLabel, selectedTermId, examTitle, examYearSuffix, classFilter);

      setStatusMessage(data.message || 'Results saved successfully to Google Sheet!');
      setDuplicateWarningModal({ open: false, duplicates: [] });
      setScannedStudents([]);
      await refreshAllData();
      setActiveTab('print');
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Failed to commit results.');
    } finally {
      setLoadingData(false);
    }
  };

  // Open Manual Entry Form with Saved Preferences Preserved
  const openManualForm = () => {
    const savedMax = getDefaultMaxMarks();
    setManualFormData((prev) => ({
      ...prev,
      session: sessionLabel,
      exam_term_id: selectedTermId,
      exam_title: examTitle,
      exam_year_suffix: examYearSuffix,
      student_class: classFilter || prev.student_class || '',
      // Clear student specific biodata & obtained scores for fresh entry
      gr_no: '',
      roll_no: '',
      student_name: '',
      father_name: '',
      dob: '',
      address: '',
      ...savedMax,
      // Clear obtained marks
      ...Object.fromEntries(REPORT_SUBJECT_ROWS.map((s) => [`${s.key}_obt`, ''])),
      islamiat_oral_obt: '',
      islamiat_written_obt: '',
      islamiat_total_obt: '',
      grand_total_obt: '',
      grand_total_max: '',
      percentage: '',
      grade: '',
      rank: '',
    }));
    setManualSelectedAdmission('');
    setManualFormOpen(true);
    setActiveTab('manual');
  };

  // Manual Entry Form Handlers
  const handleManualStudentSelect = (grOrName: string) => {
    setManualSelectedAdmission(grOrName);
    const adm = admissionRecords.find(
      (a) => a.gr_no === grOrName || a.student_name === grOrName,
    );
    if (adm) {
      setManualFormData((prev) => ({
        ...prev,
        student_class: adm.admission_class || prev.student_class,
        gr_no: adm.gr_no || prev.gr_no,
        roll_no: adm.roll_no || prev.roll_no,
        student_name: adm.student_name || prev.student_name,
        father_name: adm.father_name || prev.father_name,
        dob: adm.dob || prev.dob,
        address: adm.address || prev.address,
      }));
    }
  };

  const handleManualTermChange = (termId: string, customText = '') => {
    let resolvedTitle = '';
    if (termId === 'other') {
      resolvedTitle = customText.trim().toUpperCase() || 'EXAMINATION';
    } else {
      const match = TERM_OPTIONS.find((t) => t.id === termId);
      resolvedTitle = match?.defaultTitle || 'SUMMATIVE ASSESSMENT - I';
    }
    setManualFormData((prev) => ({
      ...prev,
      exam_term_id: termId,
      exam_title: resolvedTitle,
    }));
  };

  // Auto-calculate Totals, Percentage, Grade, and Result dynamically
  const recomputeManualTotals = (updatedState: Record<string, string>) => {
    let totalMax = 0;
    let totalObt = 0;
    let anySubjectEntered = false;

    REPORT_SUBJECT_ROWS.forEach((s) => {
      const obtVal = updatedState[`${s.key}_obt`]?.trim();
      const maxVal = updatedState[`${s.key}_max`]?.trim() || '100';

      if (obtVal && !isNaN(Number(obtVal))) {
        anySubjectEntered = true;
        totalObt += Number(obtVal);
        totalMax += Number(maxVal) || 100;
      }
    });

    if (!anySubjectEntered) {
      return {
        ...updatedState,
        grand_total_max: '',
        grand_total_obt: '',
        percentage: '',
        grade: '',
        result: 'PASS',
      };
    }

    const pct = totalMax > 0 ? (totalObt / totalMax) * 100 : 0;
    const roundedPct = pct.toFixed(1) + '%';

    let grade = 'Fail';
    if (pct >= 80) grade = 'A+';
    else if (pct >= 70) grade = 'A';
    else if (pct >= 60) grade = 'B';
    else if (pct >= 50) grade = 'C';
    else if (pct >= 40) grade = 'D';

    const result = pct >= 40 ? 'PASS' : 'FAIL';

    return {
      ...updatedState,
      grand_total_max: String(totalMax),
      grand_total_obt: String(totalObt),
      percentage: roundedPct,
      grade,
      result,
    };
  };

  const handleManualMarkChange = (field: string, val: string) => {
    setManualFormData((prev) => {
      const updated = { ...prev, [field]: val };
      return recomputeManualTotals(updated);
    });
  };

  const handleSaveManualRecord = async (allowOverwrite = false) => {
    if (!manualFormData.student_name && !manualFormData.gr_no) {
      setDataError('Please enter Student Name or GR No. before saving.');
      return;
    }

    setManualSaving(true);
    setStatusMessage('Saving record to Google Sheet (result card data)...');
    try {
      const response = await fetch('/api/ggss-report-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ record: manualFormData, allowOverwrite }),
      });

      const data = await parseJsonResponse(response);

      if (!response.ok) {
        if (data.hasDuplicates) {
          setDuplicateWarningModal({
            open: true,
            duplicates: data.duplicates || [],
          });
          return;
        }
        throw new Error(data.message || 'Error saving record.');
      }

      // Collect all max marks used to persist for next student
      const maxMarksObj: Record<string, string> = {};
      REPORT_SUBJECT_ROWS.forEach((s) => {
        maxMarksObj[`${s.key}_max`] = manualFormData[`${s.key}_max`] || '100';
      });

      // Persist Session, Term, Class, and Max Marks in localStorage so next entry inherits them
      persistPreferences(
        manualFormData.session || sessionLabel,
        manualFormData.exam_term_id || selectedTermId,
        manualFormData.exam_title || examTitle,
        manualFormData.exam_year_suffix || examYearSuffix,
        manualFormData.student_class || classFilter,
        maxMarksObj,
      );

      // Keep Session, Exam, Class, and Max Marks auto-filled for next student; reset student-specific fields
      setManualFormData((prev) => ({
        ...prev,
        gr_no: '',
        roll_no: '',
        student_name: '',
        father_name: '',
        dob: '',
        address: '',
        ...Object.fromEntries(REPORT_SUBJECT_ROWS.map((s) => [`${s.key}_obt`, ''])),
        islamiat_oral_obt: '',
        islamiat_written_obt: '',
        islamiat_total_obt: '',
        grand_total_obt: '',
        grand_total_max: '',
        percentage: '',
        grade: '',
        rank: '',
      }));
      setManualSelectedAdmission('');

      setStatusMessage(
        'Student result saved successfully! Ready for next student (Session, Term, Class & Max Marks preserved).',
      );
      setDuplicateWarningModal({ open: false, duplicates: [] });
      await refreshAllData();
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Failed to save manual record.');
    } finally {
      setManualSaving(false);
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Checking admin session...
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-bold" style={{ color: '#1a3a6b' }}>
          Admin login required
        </p>
        <p className="max-w-sm text-sm text-slate-600">
          Sign in from the main admin panel first, then return to this page.
        </p>
        <Link
          href="/ggss-nishtar-road/admin"
          className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: '#1a3a6b' }}
        >
          ← Back to Admin
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 pb-20">
      {/* Load Old English / Blackletter font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=UnifrakturMaguntia&display=swap"
      />

      {/* ===================== Top Navigation & Controls ===================== */}
      <div className="no-print mx-auto max-w-7xl px-4 pt-6">
        <div className="mb-2 flex items-center justify-between">
          <Link
            href="/ggss-nishtar-road/admin"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a3a6b] transition hover:underline"
          >
            ← Back to Admin Panel
          </Link>

          <span className="text-xs font-semibold text-slate-500">
            Google Sheet: <span className="text-emerald-700 font-bold">result card data</span>
          </span>
        </div>

        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: '#1a3a6b' }}>
              Student Report Cards (A5 Front &amp; Back — 2 per A4 Sheet)
            </h1>
            <p className="text-xs text-slate-600">
              Direct Google Sheet integration with Term Dropdown, Auto-memory of Last Settings, AI Tabulation Scanner, Bulk Print &amp; PDF.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 sm:pt-0">
            <button
              type="button"
              onClick={() => setActiveTab('print')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'print' ? 'bg-[#1a3a6b] text-white shadow-sm' : 'border border-slate-300 bg-white text-slate-700'
              }`}
            >
              Print &amp; Preview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('scanner')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'scanner' ? 'bg-[#1a3a6b] text-white shadow-sm' : 'border border-slate-300 bg-white text-slate-700'
              }`}
            >
              <FiCamera size={14} /> AI Tabulation Scanner
            </button>
            <button
              type="button"
              onClick={openManualForm}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'manual' ? 'bg-[#1a3a6b] text-white shadow-sm' : 'border border-slate-300 bg-white text-slate-700'
              }`}
            >
              <FiPlus size={14} /> Add / Edit Marks
            </button>
          </div>
        </div>

        {statusMessage ? (
          <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800">
            <span>{statusMessage}</span>
            <button type="button" onClick={() => setStatusMessage('')}>
              <FiX size={14} />
            </button>
          </div>
        ) : null}

        {dataError ? (
          <div className="mt-3 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-800">
            <span>{dataError}</span>
            <button type="button" onClick={() => setDataError('')}>
              <FiX size={14} />
            </button>
          </div>
        ) : null}

        {/* Active School Selection Bar */}
        <div className="mt-4 rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 via-sky-50 to-blue-50 p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-700 text-xs font-black tracking-wider text-white shadow-sm">
                SCH
              </span>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-900">
                  Select School for Report Cards &amp; Print / PDF Output:
                </div>
                <div className="text-sm font-extrabold text-slate-800">
                  {activeSchool.name}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleSchoolChange('gbss_pak_quarter')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-sm ${
                  selectedSchoolId === 'gbss_pak_quarter'
                    ? 'bg-indigo-700 text-white ring-2 ring-indigo-400'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Govt Boys Pri/Sec Pakistan Quarter (Default)
              </button>

              <button
                type="button"
                onClick={() => handleSchoolChange('ggss_nishtar_road')}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition shadow-sm ${
                  selectedSchoolId === 'ggss_nishtar_road'
                    ? 'bg-indigo-700 text-white ring-2 ring-indigo-400'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Govt Girls Sec School Nishtar Road
              </button>
            </div>
          </div>
        </div>

        {/* Global Filter Bar */}
        <div className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Session</label>
            <input
              type="text"
              value={sessionLabel}
              onChange={(e) => {
                setSessionLabel(e.target.value);
                persistPreferences(e.target.value, selectedTermId, examTitle, examYearSuffix, classFilter);
              }}
              placeholder="2026-2027"
              className="w-32 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold"
            />
          </div>

          {/* Term Name Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Term Name</label>
            <select
              value={selectedTermId}
              onChange={(e) => handleTermChange(e.target.value)}
              className="w-48 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold"
            >
              {TERM_OPTIONS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Term text if "other" selected */}
          {selectedTermId === 'other' ? (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500">Custom Term Title</label>
              <input
                type="text"
                value={customTermText}
                onChange={(e) => handleTermChange('other', e.target.value)}
                placeholder="Enter custom term name"
                className="w-48 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold uppercase"
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Exam Year (20__)</label>
            <input
              type="text"
              value={examYearSuffix}
              onChange={(e) => {
                setExamYearSuffix(e.target.value);
                persistPreferences(sessionLabel, selectedTermId, examTitle, e.target.value, classFilter);
              }}
              placeholder="26"
              maxLength={4}
              className="w-20 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Class</label>
            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                persistPreferences(sessionLabel, selectedTermId, examTitle, examYearSuffix, e.target.value);
              }}
              className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold"
            >
              <option value="">All Classes</option>
              {CLASS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, GR, Roll No."
              className="w-48 rounded-xl border border-slate-300 px-3 py-1.5 text-xs"
            />
          </div>

          <button
            type="button"
            onClick={() => void refreshAllData()}
            className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <FiRefreshCw size={13} /> Refresh Data
          </button>
        </div>

        {/* ===================== TAB 1: PRINT & PREVIEW CONTROLS ===================== */}
        {activeTab === 'print' ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleSelectAllFiltered}
                  className="rounded text-[#1a3a6b]"
                />
                Select All ({filteredCards.length} students)
              </label>

              <label
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600"
                title="When flipping paper left-to-right for duplex printing, the front-left card aligns with the back-right card."
              >
                <input
                  type="checkbox"
                  checked={mirrorBackForDuplex}
                  onChange={(e) => setMirrorBackForDuplex(e.target.checked)}
                />
                Duplex Flip (Back 2 | Back 1)
              </label>

              <label
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600"
                title="If odd number of cards selected, fill the second half of the A4 with a blank card template."
              >
                <input
                  type="checkbox"
                  checked={fillOddSlotWithBlankTemplate}
                  onChange={(e) => setFillOddSlotWithBlankTemplate(e.target.checked)}
                />
                Fill 2nd Half if Odd
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBulkPrint}
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold text-white shadow"
                style={{ background: '#1a3a6b' }}
              >
                <FiPrinter size={15} /> Print Report Cards (
                {selectedCardsInOrder.length ? selectedCardsInOrder.length : cardsToPrint.length})
              </button>

              <button
                type="button"
                onClick={handleExportBulkPdf}
                disabled={pdfGenerating}
                className="inline-flex items-center gap-2 rounded-xl border border-[#b45309] bg-amber-50 px-4 py-2 text-xs font-bold text-[#b45309] hover:bg-amber-100 disabled:opacity-50"
              >
                <FiDownload size={15} /> {pdfGenerating ? 'Creating PDF...' : 'Download PDF'}
              </button>
            </div>
          </div>
        ) : null}

        {/* ===================== TAB 2: AI TABULATION SCANNER ===================== */}
        {activeTab === 'scanner' ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-1 border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-[#1a3a6b]">
                AI Tabulation Sheet Scanner (Camera, Gallery, or PDF)
              </h2>
              <p className="text-xs text-slate-600">
                Snap a photo from mobile camera, upload from gallery, or select PDF/Image from computer. Gemini AI will recognize all students, subjects, and marks automatically without including unoffered subjects!
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-4">
                <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-[#1a3a6b] cursor-pointer">
                  <FiUploadCloud size={38} className="text-[#1a3a6b]" />
                  <span className="mt-2 text-sm font-bold text-slate-700">
                    Click to capture with Camera or Upload PDF / Image
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    Supported: JPG, PNG, HEIC, PDF
                  </span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    capture="environment"
                    onChange={handleScanFileUpload}
                    className="hidden"
                  />
                </label>

                <div>
                  <label className="text-xs font-semibold text-slate-600">
                    Additional Context / Subject Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={additionalScanNotes}
                    onChange={(e) => setAdditionalScanNotes(e.target.value)}
                    placeholder="e.g. Class VI Mid-Term, Max marks: English 100, Islamiat 100 (40 Nazra + 60 Written)"
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs"
                  />
                </div>

                {isScanning ? (
                  <div className="flex items-center gap-2 rounded-xl bg-blue-50 p-3 text-xs font-semibold text-blue-700">
                    <FiRefreshCw className="animate-spin" /> Scanning with Gemini AI... Please wait.
                  </div>
                ) : null}

                {scanError ? (
                  <p className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                    {scanError}
                  </p>
                ) : null}
              </div>

              <div>
                {scanFilePreview ? (
                  <div className="rounded-2xl border border-slate-200 p-3">
                    <p className="mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Uploaded File Preview
                    </p>
                    {scanFileMime.includes('pdf') ? (
                      <div className="flex h-48 items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-600">
                        PDF Document Loaded
                      </div>
                    ) : (
                      <img
                        src={scanFilePreview}
                        alt="Scan preview"
                        className="max-h-64 w-full rounded-xl object-contain bg-slate-50"
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-400">
                    Upload a tabulation sheet photo to see preview and AI results here.
                  </div>
                )}
              </div>
            </div>

            {/* AI Result Review & Editable Validation Table */}
            {scannedStudents.length > 0 ? (
              <div className="mt-6 border-t border-slate-200 pt-5">
                <div className="flex items-center justify-between pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      AI Extracted Students ({scannedStudents.length}) — Review &amp; Edit
                    </h3>
                    <p className="text-xs text-slate-500">
                      Verify any missing marks or anomalies before saving directly to Google Sheet.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCommitScannedResults(false)}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-800"
                  >
                    <FiCheckCircle size={15} /> Save All to Google Sheet
                  </button>
                </div>

                <div className="max-h-96 overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-slate-100 text-[11px] uppercase text-slate-600">
                      <tr>
                        <th className="px-3 py-2">Roll</th>
                        <th className="px-3 py-2">GR No</th>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Father Name</th>
                        <th className="px-3 py-2">Class</th>
                        <th className="px-3 py-2">Grand Total</th>
                        <th className="px-3 py-2">%age</th>
                        <th className="px-3 py-2">Grade</th>
                        <th className="px-3 py-2">Result</th>
                        <th className="px-3 py-2">Missing/Flags</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {scannedStudents.map((st, idx) => {
                        const hasMissing = st.missingSubjects && st.missingSubjects.length > 0;
                        return (
                          <tr key={idx} className={hasMissing ? 'bg-amber-50/50' : 'hover:bg-slate-50'}>
                            <td className="px-3 py-2 font-semibold">{st.rollNo || '-'}</td>
                            <td className="px-3 py-2 font-semibold">{st.grNo || '-'}</td>
                            <td className="px-3 py-2 font-bold text-slate-900">{st.studentName}</td>
                            <td className="px-3 py-2 text-slate-600">{st.fatherName}</td>
                            <td className="px-3 py-2 text-slate-600">{st.studentClass || classFilter}</td>
                            <td className="px-3 py-2 font-bold text-slate-800">
                              {st.grandTotalObtained} / {st.grandTotalMax}
                            </td>
                            <td className="px-3 py-2 font-bold text-slate-800">{st.percentage}</td>
                            <td className="px-3 py-2 font-bold text-slate-800">{st.grade}</td>
                            <td className="px-3 py-2">
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                  st.result === 'PASS'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {st.result}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              {hasMissing ? (
                                <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                                  <FiAlertTriangle size={12} />
                                  {st.missingSubjects.map((m: any) => m.subjectKey).join(', ')} missing!
                                </span>
                              ) : (
                                <span className="text-emerald-600 font-semibold">Complete</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* ===================== TAB 3: MANUAL ENTRY FORM ===================== */}
        {manualFormOpen ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-[#1a3a6b]">Manual Result Entry / Edit</h2>
                <p className="text-xs text-slate-600">
                  Settings (Session, Term, Class, and Max Marks) are preserved from your last entry automatically!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setManualFormOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Global parameters for this entry */}
            <div className="mb-5 grid gap-4 rounded-xl bg-slate-50/80 p-3.5 border border-slate-200 sm:grid-cols-4">
              <div>
                <label className="text-xs font-semibold text-slate-600">Academic Session</label>
                <input
                  type="text"
                  value={manualFormData.session || sessionLabel}
                  onChange={(e) => setManualFormData({ ...manualFormData, session: e.target.value })}
                  placeholder="2026-2027"
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Term Name</label>
                <select
                  value={manualFormData.exam_term_id || selectedTermId}
                  onChange={(e) => handleManualTermChange(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs font-bold"
                >
                  {TERM_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {manualFormData.exam_term_id === 'other' ? (
                <div>
                  <label className="text-xs font-semibold text-slate-600">Custom Term Name</label>
                  <input
                    type="text"
                    value={manualFormData.exam_title || ''}
                    onChange={(e) => handleManualTermChange('other', e.target.value)}
                    placeholder="e.g. SECOND ASSESSMENT"
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs font-bold uppercase"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-slate-600">Card Header Title</label>
                  <input
                    type="text"
                    value={manualFormData.exam_title || examTitle}
                    onChange={(e) => setManualFormData({ ...manualFormData, exam_title: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs font-bold"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-600">Class</label>
                <select
                  value={manualFormData.student_class || classFilter}
                  onChange={(e) => setManualFormData({ ...manualFormData, student_class: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs font-bold"
                >
                  <option value="">Select Class</option>
                  {CLASS_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Student Biodata */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Auto-fill from Admission Records</label>
                <select
                  value={manualSelectedAdmission}
                  onChange={(e) => handleManualStudentSelect(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs"
                >
                  <option value="">-- Choose Student --</option>
                  {admissionRecords.map((a) => (
                    <option key={a.row_number} value={a.gr_no || a.student_name}>
                      {a.student_name} ({a.admission_class} - GR: {a.gr_no || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Student Name</label>
                <input
                  type="text"
                  value={manualFormData.student_name || ''}
                  onChange={(e) => setManualFormData({ ...manualFormData, student_name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Father Name</label>
                <input
                  type="text"
                  value={manualFormData.father_name || ''}
                  onChange={(e) => setManualFormData({ ...manualFormData, father_name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">GR No.</label>
                <input
                  type="text"
                  value={manualFormData.gr_no || ''}
                  onChange={(e) => setManualFormData({ ...manualFormData, gr_no: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Roll No.</label>
                <input
                  type="text"
                  value={manualFormData.roll_no || ''}
                  onChange={(e) => setManualFormData({ ...manualFormData, roll_no: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600">Date of Birth</label>
                <input
                  type="text"
                  value={manualFormData.dob || ''}
                  onChange={(e) => setManualFormData({ ...manualFormData, dob: e.target.value })}
                  placeholder="DD-MM-YYYY"
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-xs font-semibold text-slate-600">Address</label>
                <input
                  type="text"
                  value={manualFormData.address || ''}
                  onChange={(e) => setManualFormData({ ...manualFormData, address: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-2 text-xs"
                />
              </div>
            </div>

            {/* Subject Marks Entry Grid */}
            <div className="mt-5 border-t border-slate-200 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Subject Marks Entry (Leave blank if not offered for this class)
                </h3>
                <span className="text-[11px] text-slate-500">
                  Max Marks are automatically remembered from your last entry
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
                {REPORT_SUBJECT_ROWS.map((s) => (
                  <div key={s.key} className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                    <span className="block text-[11px] font-bold text-slate-700 truncate">{s.label}</span>
                    <div className="mt-1 flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Obt"
                        value={manualFormData[`${s.key}_obt`] || ''}
                        onChange={(e) => handleManualMarkChange(`${s.key}_obt`, e.target.value)}
                        className="w-full rounded-lg border border-slate-300 p-1 text-center text-xs font-bold"
                      />
                      <span className="text-slate-400">/</span>
                      <input
                        type="text"
                        placeholder="Max"
                        value={manualFormData[`${s.key}_max`] || '100'}
                        onChange={(e) => handleManualMarkChange(`${s.key}_max`, e.target.value)}
                        className="w-full rounded-lg border border-slate-300 p-1 text-center text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculated Results Summary */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5 rounded-xl border border-blue-200 bg-blue-50/70 p-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Grand Total</span>
                <p className="text-sm font-extrabold text-slate-900">
                  {manualFormData.grand_total_obt || '0'} / {manualFormData.grand_total_max || '0'}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Percentage</span>
                <p className="text-sm font-extrabold text-slate-900">
                  {manualFormData.percentage || '0%'}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Grade</span>
                <p className="text-sm font-extrabold text-[#1a3a6b]">
                  {manualFormData.grade || '-'}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Result</span>
                <p className={`text-sm font-extrabold ${manualFormData.result === 'FAIL' ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {manualFormData.result || 'PASS'}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Conduct</span>
                <input
                  type="text"
                  value={manualFormData.conduct || 'Good'}
                  onChange={(e) => setManualFormData({ ...manualFormData, conduct: e.target.value })}
                  className="mt-0.5 w-full rounded border border-slate-300 p-1 text-xs font-bold"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => setManualFormOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={manualSaving}
                onClick={() => handleSaveManualRecord(false)}
                className="rounded-xl bg-[#1a3a6b] px-6 py-2 text-xs font-bold text-white shadow disabled:opacity-50"
              >
                {manualSaving ? 'Saving to Google Sheet...' : 'Save & Prepare Next Student'}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* ===================== A4 Print & Preview Sheets ===================== */}
      {activeTab === 'print' ? (
        <div className="mx-auto mt-8 flex flex-col items-center gap-10 px-4 print:mt-0 print:gap-0 print:px-0">
          {cardPairs.map(([firstCard, secondCardOrNull], pairIndex) => {
            const secondCard =
              secondCardOrNull ||
              (fillOddSlotWithBlankTemplate
                ? {
                    ...firstCard,
                    rowNumber: `blank-${pairIndex}`,
                    rollNo: '',
                    grNo: '',
                    name: '',
                    fatherName: '',
                    dob: '',
                    address: '',
                    subjects: {},
                    grandTotalMax: '',
                    grandTotalObtained: '',
                    result: '',
                    percentage: '',
                    grade: '',
                    rank: '',
                    attendance: '',
                    conduct: '',
                  }
                : null);

            const backLeftCard = mirrorBackForDuplex ? secondCard : firstCard;
            const backRightCard = mirrorBackForDuplex ? firstCard : secondCard;

            return (
              <div key={`pair-${pairIndex}`} className="flex flex-col items-center gap-8 print:gap-0">
                {/* SHEET 1: 2 FRONTS ON A4 LANDSCAPE */}
                <div className="w-full">
                  <div className="no-print mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600">
                    <span>A4 Sheet {pairIndex * 2 + 1} — FRONT SIDE (2 × A5 Fronts)</span>
                    <span>
                      Left: {firstCard.name || 'Card 1'} | Right: {secondCard?.name || 'Card 2'}
                    </span>
                  </div>

                  <div className="rc-a4-landscape-sheet">
                    <div className="rc-a5-half">
                      <ReportCardFront data={firstCard} school={activeSchool} />
                    </div>
                    {/* Center Dotted Cutting Line */}
                    <div className="rc-center-cut-line" aria-hidden="true" />
                    <div className="rc-a5-half">
                      {secondCard ? <ReportCardFront data={secondCard} school={activeSchool} /> : <div className="rc-a5-slot" />}
                    </div>
                  </div>
                </div>

                {/* SHEET 2: 2 BACKS ON A4 LANDSCAPE (Reverse) */}
                <div className="w-full">
                  <div className="no-print mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600">
                    <span>A4 Sheet {pairIndex * 2 + 2} — BACK SIDE (2 × A5 Backs)</span>
                    <span>
                      Left: {backLeftCard?.name || 'Back 2'} | Right: {backRightCard?.name || 'Back 1'}
                    </span>
                  </div>

                  <div className="rc-a4-landscape-sheet">
                    <div className="rc-a5-half">
                      {backLeftCard ? <ReportCardBack data={backLeftCard} school={activeSchool} /> : <div className="rc-a5-slot" />}
                    </div>
                    {/* Center Dotted Cutting Line */}
                    <div className="rc-center-cut-line" aria-hidden="true" />
                    <div className="rc-a5-half">
                      {backRightCard ? <ReportCardBack data={backRightCard} school={activeSchool} /> : <div className="rc-a5-slot" />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* ===================== DUPLICATE RECORD CONFIRMATION MODAL ===================== */}
      {duplicateWarningModal.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-600">
              <FiAlertTriangle size={24} />
              <h3 className="text-base font-extrabold text-slate-900">
                Same Year &amp; Exam Duplicate Detected!
              </h3>
            </div>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              As per your rule, a student cannot have multiple result entries for the same academic year (
              <span className="font-bold text-slate-800">{sessionLabel}</span>) and exam (
              <span className="font-bold text-slate-800">{examTitle}</span>).
            </p>
            <div className="my-3 max-h-36 overflow-y-auto rounded-xl bg-slate-50 p-2.5 text-xs text-slate-700">
              {duplicateWarningModal.duplicates.map((d, i) => (
                <div key={i} className="py-1 border-b border-slate-200 last:border-none">
                  • <span className="font-bold">{d.name}</span> (GR: {d.grNo || 'N/A'}) — Already exists in row {d.existingRow}.
                </div>
              ))}
            </div>
            <p className="text-xs font-semibold text-slate-700">
              Would you like to overwrite and update the existing Google Sheet records with this new data?
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDuplicateWarningModal({ open: false, duplicates: [] })}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'scanner') {
                    void handleCommitScannedResults(true);
                  } else {
                    void handleSaveManualRecord(true);
                  }
                }}
                className="rounded-xl bg-amber-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-amber-700"
              >
                Yes, Overwrite &amp; Update
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ===================== Print & Card CSS ===================== */}
      <style jsx global>{`
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
          padding: 6mm 8mm 7mm 8mm;
          justify-content: space-between;
          align-items: center;
        }

        .rc-arch-wrap {
          position: relative;
          width: 100%;
          height: 74mm;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rc-arch-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .rc-front-logo-box {
          position: relative;
          margin-top: 15mm;
          width: 44mm;
          height: 44mm;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rc-front-logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: grayscale(100%) contrast(125%);
        }

        .rc-location-title {
          font-size: 12.8pt;
          font-weight: 800;
          letter-spacing: 0.3px;
          text-align: center;
          text-transform: uppercase;
          color: #000000;
          margin-top: -1mm;
          white-space: nowrap;
        }

        .rc-badge-wrap {
          display: flex;
          justify-content: center;
          width: 100%;
          margin: 2mm 0;
        }

        .rc-progress-pill {
          border: 1.2px solid #000000;
          border-radius: 999px;
          padding: 2mm 7mm 2.5mm 7mm;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
        }

        .rc-blackletter-text {
          font-family: 'UnifrakturMaguntia', 'Old English Text MT', 'Engravers Old English BT', Georgia, serif;
          font-size: 21pt;
          font-weight: 400;
          line-height: 1;
          color: #000000;
          letter-spacing: 0.5px;
        }

        .rc-session-year-row {
          display: flex;
          align-items: baseline;
          justify-content: center;
          font-size: 14pt;
          font-weight: 800;
          color: #000000;
          margin: 1mm 0 2mm 0;
        }

        .rc-year-prefix {
          font-weight: 800;
        }

        .rc-year-dots {
          display: inline-flex;
          align-items: flex-end;
          justify-content: center;
          min-width: 18mm;
          border-bottom: 1.5px dotted #000000;
          text-align: center;
          font-size: 12.5pt;
          font-weight: 700;
          padding: 0 1mm 1.8mm 1mm;
          margin-right: 1.5mm;
          line-height: 1.1;
          box-sizing: border-box;
        }

        .rc-front-fields {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 3.4mm;
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
          align-items: flex-end;
          gap: 2mm;
          width: 100%;
          min-height: 6.8mm;
          margin-bottom: 0.6mm;
        }

        .rc-field-label {
          font-size: 9.8pt;
          font-weight: 700;
          color: #000000;
          white-space: nowrap;
          padding-bottom: 1.8mm;
        }

        .rc-field-value {
          flex: 1;
          border-bottom: 1.2px solid #000000;
          font-size: 10.5pt;
          font-weight: 700;
          color: #000000;
          text-align: center;
          min-height: 5.6mm;
          line-height: 1.1;
          padding: 0 1.5mm 1.8mm 1.5mm;
          display: inline-flex;
          align-items: flex-end;
          justify-content: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          box-sizing: border-box;
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
          align-items: baseline;
          width: 100%;
          margin-bottom: 1.8mm;
        }

        .rc-back-top-field {
          display: flex;
          align-items: flex-end;
          gap: 1.5mm;
          min-height: 5.5mm;
        }

        .rc-back-top-label {
          font-size: 9.5pt;
          font-weight: 700;
          color: #000000;
          white-space: nowrap;
          padding-bottom: 1.5mm;
        }

        .rc-back-top-val {
          flex: 1;
          border-bottom: 1.2px solid #000000;
          font-size: 10pt;
          font-weight: 700;
          text-align: center;
          min-height: 5mm;
          padding: 0 1.5mm 1.5mm 1.5mm;
          display: inline-flex;
          align-items: flex-end;
          justify-content: center;
          box-sizing: border-box;
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
          width: 68mm;
          height: 68mm;
          object-fit: contain;
          filter: grayscale(100%);
          opacity: 0.16;
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
          padding: 1.4mm 2mm !important;
          letter-spacing: 0.3px;
        }

        .rc-exam-year-line {
          display: inline-block;
          min-width: 11mm;
          border-bottom: 1.2px solid #000000;
          text-align: center;
          margin-left: 1mm;
          line-height: 1;
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
          align-items: flex-end;
          gap: 1.5mm;
          width: 100%;
          min-height: 6mm;
        }

        .rc-footer-label {
          font-size: 8.8pt;
          font-weight: 800;
          color: #000000;
          white-space: nowrap;
          padding-bottom: 1.5mm;
        }

        .rc-footer-val {
          flex: 1;
          border-bottom: 1.2px solid #000000;
          min-height: 5mm;
          font-size: 9pt;
          font-weight: 700;
          padding: 0 1.5mm 1.5mm 1.5mm;
          display: inline-flex;
          align-items: flex-end;
          justify-content: center;
          box-sizing: border-box;
        }

        @media print {
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

          .no-print {
            display: none !important;
          }

          .rc-a4-landscape-sheet {
            border: none;
            box-shadow: none;
            margin: 0;
            page-break-after: always;
            break-after: page;
          }
        }
      `}</style>
    </main>
  );
}
