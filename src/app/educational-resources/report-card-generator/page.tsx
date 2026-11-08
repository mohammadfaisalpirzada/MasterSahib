'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
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
} from 'react-icons/fi';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

import {
  ReportCardFront,
  ReportCardBack,
  REPORT_SUBJECT_ROWS,
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

// 100% Anonymous generic placeholder demo data
const INITIAL_DEMO_STUDENTS: ReportCardStudentData[] = [
  {
    rowNumber: '1',
    rollNo: '101',
    grNo: '1001',
    name: 'Student ABC',
    fatherName: 'Father ABC',
    studentClass: 'VIII',
    dob: '12-04-2011',
    address: 'House 123, Street ABC, City',
    sessionStartYear: '26',
    sessionEndYear: '27',
    sessionFull: '2026-2027',
    examTitle: 'SUMMATIVE ASSESSMENT - 1',
    examYearSuffix: '26',
    schoolName: 'ABC Model High School',
    subjects: {
      english: { maxMarks: '100', marksObtained: '84' },
      urdu: { maxMarks: '100', marksObtained: '88' },
      social_pak_studies: { maxMarks: '100', marksObtained: '79' },
      sindhi: { maxMarks: '100', marksObtained: '82' },
      islamiat_oral: { maxMarks: '40', marksObtained: '38' },
      islamiat_written: { maxMarks: '60', marksObtained: '52' },
      islamiat_total: { maxMarks: '100', marksObtained: '90' },
      g_science: { maxMarks: '100', marksObtained: '85' },
      mathematics: { maxMarks: '100', marksObtained: '92' },
      arabic_drawing: { maxMarks: '100', marksObtained: '86' },
      biology_computer: { maxMarks: '100', marksObtained: '91' },
    },
    grandTotalMax: '800',
    grandTotalObtained: '687',
    percentage: '85.9%',
    grade: 'A+',
    rank: '1st',
    result: 'PASS',
    attendance: '96%',
    conduct: 'Excellent',
  },
  {
    rowNumber: '2',
    rollNo: '102',
    grNo: '1002',
    name: 'Student XYZ',
    fatherName: 'Father XYZ',
    studentClass: 'VIII',
    dob: '05-09-2011',
    address: 'Apartment 456, Block XYZ, City',
    sessionStartYear: '26',
    sessionEndYear: '27',
    sessionFull: '2026-2027',
    examTitle: 'SUMMATIVE ASSESSMENT - 1',
    examYearSuffix: '26',
    schoolName: 'ABC Model High School',
    subjects: {
      english: { maxMarks: '100', marksObtained: '76' },
      urdu: { maxMarks: '100', marksObtained: '81' },
      social_pak_studies: { maxMarks: '100', marksObtained: '74' },
      sindhi: { maxMarks: '100', marksObtained: '78' },
      islamiat_oral: { maxMarks: '40', marksObtained: '35' },
      islamiat_written: { maxMarks: '60', marksObtained: '48' },
      islamiat_total: { maxMarks: '100', marksObtained: '83' },
      g_science: { maxMarks: '100', marksObtained: '77' },
      mathematics: { maxMarks: '100', marksObtained: '80' },
      arabic_drawing: { maxMarks: '100', marksObtained: '75' },
      biology_computer: { maxMarks: '100', marksObtained: '82' },
    },
    grandTotalMax: '800',
    grandTotalObtained: '631',
    percentage: '78.9%',
    grade: 'A',
    rank: '2nd',
    result: 'PASS',
    attendance: '94%',
    conduct: 'Good',
  },
];

export default function ReportCardGeneratorPage() {
  const [students, setStudents] = useState<ReportCardStudentData[]>(INITIAL_DEMO_STUDENTS);
  const [activeTab, setActiveTab] = useState<'excel' | 'ai_scan' | 'settings'>('excel');

  // School configuration
  const [schoolName, setSchoolName] = useState<string>('ABC Model High School');
  const [schoolLogo, setSchoolLogo] = useState<string>('/images/pakistan_quarter_logo.png');
  const [headSignTitle, setHeadSignTitle] = useState<string>('Sign. of Head Master / Mistress');

  // Global Session and Exam parameters
  const [sessionLabel, setSessionLabel] = useState<string>('2026-2027');
  const [selectedTermId, setSelectedTermId] = useState<string>('summative_one');
  const [examTitle, setExamTitle] = useState<string>('SUMMATIVE ASSESSMENT - 1');
  const [examYearSuffix, setExamYearSuffix] = useState<string>('26');

  // Max Marks Configuration
  const [defaultMaxMarks, setDefaultMaxMarks] = useState<string>('100');
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
    subjects: Partial<Record<SubjectKey, { maxMarks: string; marksObtained: string }>>,
  ) => {
    let totalMax = 0;
    let totalObt = 0;
    let anySubjFailed = false;

    Object.entries(subjects).forEach(([key, score]) => {
      if (key === 'islamiat_oral' || key === 'islamiat_written') {
        // Skip individual islamiat parts from grand total if islamiat_total is counted
        return;
      }
      const max = parseFloat(score?.maxMarks || '0') || 0;
      const obt = parseFloat(score?.marksObtained || '0') || 0;
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

  // Handler for changing default max marks
  const handleMaxMarksChange = (newVal: string) => {
    setDefaultMaxMarks(newVal);
    const base = parseFloat(newVal) || 100;
    const nextCustom = {
      ...customSubjectMaxMarks,
      islamiat_oral: String(Math.round(base * 0.4)),
      islamiat_written: String(Math.round(base * 0.6)),
    };
    setCustomSubjectMaxMarks(nextCustom);

    // Update all student records dynamically with the new Max Marks
    setStudents((prev) =>
      prev.map((st) => {
        const nextSubjects: Partial<Record<SubjectKey, { maxMarks: string; marksObtained: string }>> = {};
        Object.entries(st.subjects).forEach(([k, score]) => {
          if (!score) return;
          const key = k as SubjectKey;
          let subMax = String(base);
          if (nextCustom[key]) {
            subMax = nextCustom[key]!;
          } else if (key === 'islamiat_total') {
            const oral = parseFloat(nextCustom['islamiat_oral'] || String(Math.round(base * 0.4))) || 0;
            const written = parseFloat(nextCustom['islamiat_written'] || String(Math.round(base * 0.6))) || 0;
            subMax = String(oral + written);
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
  };

  // Filter selected cards for printing
  const cardsToPrint: ReportCardStudentData[] = useMemo(() => {
    const list = students.filter((s) => selectedRowNumbers.has(s.rowNumber));
    if (list.length > 0) return list;
    return students;
  }, [students, selectedRowNumbers]);

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
          rank: `${index + 1}${index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'}`,
          result: stats.result,
          attendance: String(getVal('Attendance') || '95%'),
          conduct: String(getVal('Conduct') || 'Good'),
        };
      });

      setStudents(parsedStudents);
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
        English: 85,
        Urdu: 88,
        Sindhi: 82,
        'Islamiat Oral': 38,
        'Islamiat Written': 54,
        'General Science': 86,
        Mathematics: 92,
        'Social Studies': 80,
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
        English: 78,
        Urdu: 82,
        Sindhi: 75,
        'Islamiat Oral': 35,
        'Islamiat Written': 48,
        'General Science': 79,
        Mathematics: 85,
        'Social Studies': 77,
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
        English: 92,
        Urdu: 90,
        Sindhi: 88,
        'Islamiat Oral': 40,
        'Islamiat Written': 58,
        'General Science': 94,
        Mathematics: 96,
        'Social Studies': 89,
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
              attendance: String(st.attendance || '95%'),
              conduct: String(st.conduct || 'Good'),
            };
          });

          setStudents(converted);
          setSelectedRowNumbers(new Set(converted.map((s) => s.rowNumber)));
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
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
            No Database Required &bull; 100% Client-Side
          </span>
        </div>

        {/* Header Banner */}
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
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

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition"
              >
                <FiPrinter size={16} />
                <span>Print Report Cards</span>
              </button>

              <button
                type="button"
                onClick={handleExportPdf}
                disabled={pdfGenerating}
                className="inline-flex items-center gap-2 rounded-xl bg-white text-indigo-950 px-4 py-2.5 text-xs font-bold shadow-md hover:bg-indigo-50 transition disabled:opacity-50"
              >
                <FiDownload size={16} />
                <span>{pdfGenerating ? 'Generating PDF...' : 'Download PDF'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Total Marks / Max Marks Configuration Bar */}
        <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <FiSliders className="text-indigo-600" size={16} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Exam Total Marks per Subject (Max Marks)
                </h3>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Set total marks for proper percentage and grade calculations (e.g. 100 for Annual, 50 for Mid-Term / Assessment).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Quick Presets:</span>
              {[
                { label: '100 (Standard)', val: '100' },
                { label: '75', val: '75' },
                { label: '50 (Assessment)', val: '50' },
                { label: '25 (Monthly)', val: '25' },
              ].map((btn) => (
                <button
                  key={btn.val}
                  type="button"
                  onClick={() => handleMaxMarksChange(btn.val)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                    defaultMaxMarks === btn.val
                      ? 'bg-indigo-900 text-white shadow-sm'
                      : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {btn.label}
                </button>
              ))}

              <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-3">
                <span className="text-xs font-semibold text-slate-600">Custom:</span>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={defaultMaxMarks}
                  onChange={(e) => handleMaxMarksChange(e.target.value)}
                  className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold text-center focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowSubjectMaxConfig(!showSubjectMaxConfig)}
                className="ml-2 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
              >
                {showSubjectMaxConfig ? 'Hide Details' : 'Per-Subject Marks'}
              </button>
            </div>
          </div>

          {/* Collapsible Subject-Wise Detailed Max Marks */}
          {showSubjectMaxConfig ? (
            <div className="mt-4 pt-3 border-t border-slate-200">
              <p className="text-[11px] font-semibold text-slate-600 mb-2">
                Fine-tune Max Marks for individual subjects if your exam has different marks per paper:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {REPORT_SUBJECT_ROWS.map((s) => {
                  const currentVal = customSubjectMaxMarks[s.key] || defaultMaxMarks;
                  return (
                    <div key={s.key} className="rounded-lg border border-slate-200 p-2 bg-slate-50">
                      <label className="block text-[11px] font-bold text-slate-700 truncate mb-1">
                        {s.label}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={currentVal}
                        onChange={(e) => {
                          const updated = {
                            ...customSubjectMaxMarks,
                            [s.key]: e.target.value,
                          };
                          applyCustomSubjectChange(updated);
                        }}
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs font-bold text-center bg-white"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
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
            <div key={`pair-${pairIndex}`} className="flex flex-col items-center gap-6">
              {/* SHEET 1: 2 FRONTS ON A4 LANDSCAPE */}
              <div className="w-full">
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
              <div className="w-full">
                <div className="no-print mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600">
                  <span>A4 Sheet {pairIndex * 2 + 2} — RESULT MARKS TABLE (2 × A5 Backs)</span>
                  <span>
                    Left: {backLeftCard?.name || 'Empty'} | Right: {backRightCard?.name || 'Empty'}
                  </span>
                </div>

                <div className="rc-a4-landscape-sheet">
                  <div className="rc-a5-half">
                    {backLeftCard ? (
                      <ReportCardBack data={backLeftCard} school={activeSchoolConfig} />
                    ) : (
                      <div className="rc-a5-slot" />
                    )}
                  </div>
                  {/* Center Dotted Cutting Line */}
                  <div className="rc-center-cut-line" aria-hidden="true" />
                  <div className="rc-a5-half">
                    {backRightCard ? (
                      <ReportCardBack data={backRightCard} school={activeSchoolConfig} />
                    ) : (
                      <div className="rc-a5-slot" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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
          height: 11mm;
          min-height: 11mm;
          padding: 0 8mm;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          box-sizing: border-box;
          overflow: hidden;
        }

        .rc-blackletter-text {
          font-family: 'UnifrakturMaguntia', 'Old English Text MT', 'Engravers Old English BT', Georgia, serif;
          font-size: 19pt;
          font-weight: 400;
          line-height: 1;
          color: #000000;
          display: inline-block;
          vertical-align: middle;
          margin-top: -1.2mm;
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
          align-items: center;
          justify-content: center;
          min-width: 16mm;
          height: 5.5mm;
          border-bottom: 1.5px dotted #000000;
          text-align: center;
          font-size: 11.5pt;
          font-weight: 700;
          padding: 0 1mm;
          margin: 0 1.5mm 0 1mm;
          line-height: 1;
          box-sizing: border-box;
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
          min-height: 5.5mm;
          height: 5.5mm;
          line-height: 1;
          padding: 0 1.5mm;
          display: inline-flex;
          align-items: center;
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
          min-height: 5mm;
          height: 5mm;
          padding: 0 1.5mm;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
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
            padding: 0 !important;
            gap: 0 !important;
          }

          .rc-a4-landscape-sheet {
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            page-break-after: always;
            break-after: page;
          }
        }
      `}</style>
    </main>
  );

  function applyCustomSubjectChange(updated: Record<string, string>) {
    setCustomSubjectMaxMarks(updated);
    setStudents((prev) =>
      prev.map((st) => {
        const nextSubjects = { ...st.subjects };
        Object.entries(nextSubjects).forEach(([k, score]) => {
          if (!score) return;
          const key = k as SubjectKey;
          const subMax = updated[key] || defaultMaxMarks;
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
