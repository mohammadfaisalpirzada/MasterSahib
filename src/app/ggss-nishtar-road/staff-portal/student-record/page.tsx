// 'use client';

// import { useEffect, useMemo, useRef, useState } from 'react';
// import Link from 'next/link';

// const CLASS_OPTIONS = [
//   'ECE',
//   'IM', 'IA',
//   'IIM', 'IIA',
//   'IIIM', 'IIIA',
//   'IVM', 'IVA',
//   'VM', 'VA',
//   'VIM', 'VIA',
//   'VIIM', 'VIIA',
//   'VIIIM', 'VIIIA',
//   'IXM', 'IXA',
//   'XM', 'XA',
//   'Admin',
// ];
// const START_PASSWORD = '20262027';
// const ADMIN_PASSWORD = 'adminadmin321';

// export default function StudentRecordFormPage() {
//   const [started, setStarted] = useState(false);
//   const [selectedClass, setSelectedClass] = useState('');
//   const [password, setPassword] = useState('');
//   const [headers, setHeaders] = useState<string[]>([]);
//   const [record, setRecord] = useState<Record<string, string>>({});
//   const [exists, setExists] = useState(false);
//   const [status, setStatus] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [actionMode, setActionMode] = useState<'idle' | 'prompt' | 'edit' | 'new'>('idle');
//   const [nextSerial, setNextSerial] = useState<number | null>(null);
//   const [autoSaving, setAutoSaving] = useState(false);
//   const [lastSavedRecord, setLastSavedRecord] = useState<Record<string, string>>({});
//   const [availableClasses, setAvailableClasses] = useState<string[]>([]);
//   const [currentClassIndex, setCurrentClassIndex] = useState<number | null>(null);
//   const [adminTargetClass, setAdminTargetClass] = useState('');
//   const [recordRows, setRecordRows] = useState<Array<{ rowNumber: number; record: Record<string, string> }>>([]);
//   const [currentRecordIndex, setCurrentRecordIndex] = useState(0);
//   const [studentSearch, setStudentSearch] = useState('');
//   const [step, setStep] = useState<'select' | 'loaded'>('select');
//   const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   const isAdminClass = selectedClass.toLowerCase() === 'admin';
//   const effectiveClass = isAdminClass ? adminTargetClass : selectedClass;
//   const passwordInputType = showPassword ? 'text' : 'password';
//   const passwordInputMode = isAdminClass ? 'text' : 'numeric';

//   const getDefaultFieldValue = (header: string, className: string) => {
//     const key = header.toLowerCase();
//     if (key === 'class') return className;
//     if (key === 'religion') return 'Muslim';
//     if (key === 'medium') return 'Urdu';
//     return '';
//   };

//   const SERIAL_KEYS = ['sno', 'serial', 'serial_no', 'sr'];
//   const NAME_KEYS = ['name', 'student_name', 'full_name', 'studentname'];
//   const GR_KEYS = ['gr', 'gr_no', 'gr number', 'gr_number', 'grno'];

//   const normalizeHeader = (header: string) => String(header ?? '').trim().toLowerCase();
//   const getSerialHeader = (headersList: string[]) =>
//     headersList.find((header) => SERIAL_KEYS.includes(normalizeHeader(header))) ?? null;
//   const getNameHeader = (headersList: string[]) =>
//     headersList.find((header) => NAME_KEYS.includes(normalizeHeader(header))) ?? null;
//   const getGrHeader = (headersList: string[]) =>
//     headersList.find((header) => GR_KEYS.includes(normalizeHeader(header))) ?? null;

//   const serialHeader = getSerialHeader(headers);
//   const nameHeader = getNameHeader(headers);
//   const grHeader = getGrHeader(headers);

//   const currentRow = recordRows[currentRecordIndex] ?? null;
//   const currentRowCount = recordRows.length;
//   const isExistingEditMode = actionMode === 'edit';

//   const filteredRowsByName = useMemo(() => {
//     if (!studentSearch.trim() || !nameHeader) return [];
//     const query = studentSearch.trim().toLowerCase();
//     return recordRows
//       .map((item, index) => ({ ...item, index }))
//       .filter((item) => String(item.record[nameHeader] ?? '').toLowerCase().includes(query));
//   }, [studentSearch, recordRows, nameHeader]);

//   const hasRequiredName = nameHeader ? String(record[nameHeader] ?? '').trim().length > 0 : false;
//   const hasRequiredGr = grHeader ? String(record[grHeader] ?? '').trim().length > 0 : false;
//   const saveButtonDisabled = saving || !hasRequiredName || !hasRequiredGr;

//   const chooseLoadAction = (choice: 'view' | 'new') => {
//     setStatus('');

//     if (choice === 'new') {
//       const empty = buildEmptyRecordFromHeaders(headers, effectiveClass);
//       if (serialHeader && nextSerial !== null) {
//         empty[serialHeader] = String(nextSerial);
//       }
//       setRecord(empty);
//       setLastSavedRecord(empty);
//       setStatus('Starting fresh student record. Serial number is generated automatically. Fill the form and save when ready.');
//       setActionMode('new');
//     } else {
//       setStatus('Editing existing student data. Serial, Name, and GR are not editable. Other fields save automatically.');
//       setLastSavedRecord(record);
//       setActionMode('edit');
//     }
//   };

//   const selectStudentByIndex = (index: number) => {
//     const nextRow = recordRows[index];
//     if (!nextRow) return;

//     setCurrentRecordIndex(index);
//     setRecord(nextRow.record);
//     setLastSavedRecord(nextRow.record);
//     setExists(true);
//     setActionMode('edit');
//     setStatus('Editing selected student.');
//   };

//   const buildEmptyRecordFromHeaders = (headersList: string[], className: string) => {
//     const emptyRecord: Record<string, string> = {};
//     headersList.forEach((header) => {
//       const label = String(header ?? '').trim();
//       if (!label) return;
//       emptyRecord[label] = getDefaultFieldValue(label, className);
//     });
//     return emptyRecord;
//   };

//   const hasRecordData = (recordToCheck: Record<string, string>, headersList: string[]) => {
//     const ignoreKeys = new Set(['class', 'updated_at', ...SERIAL_KEYS]);
//     return headersList.some((header) => {
//       const key = String(header ?? '').trim().toLowerCase();
//       if (ignoreKeys.has(key)) return false;
//       return String(recordToCheck[header] ?? '').trim().length > 0;
//     });
//   };

//   const formatCnicValue = (value: string) => {
//     const digits = value.replace(/\D/g, '').slice(0, 13);
//     if (digits.length <= 5) return digits;
//     if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
//     return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
//   };

//   const formatPakMobileValue = (value: string) => {
//     const digits = value.replace(/\D/g, '').slice(0, 11);
//     if (digits.length <= 4) return digits;
//     return `${digits.slice(0, 4)}-${digits.slice(4)}`;
//   };

//   const normalizeDobForInput = (value: string) => {
//     const date = new Date(value);
//     if (!Number.isNaN(date.getTime())) {
//       return date.toISOString().slice(0, 10);
//     }
//     return value;
//   };

//   const expectedPassword = useMemo(() => {
//     if (selectedClass.toLowerCase() === 'admin') return ADMIN_PASSWORD;
//     if (!selectedClass) return '';
//     return START_PASSWORD;
//   }, [selectedClass]);

//   const handleStart = () => {
//     setStarted(true);
//     setStatus('');
//   };

//   const getAvailableClassNames = (classNames: string[]) => {
//     const unique: string[] = [];
//     classNames.forEach((name) => {
//       const trimmed = String(name ?? '').trim();
//       if (!trimmed) return;
//       if (!unique.some((existing) => existing.toLowerCase() === trimmed.toLowerCase())) {
//         unique.push(trimmed);
//       }
//     });
//     return unique;
//   };

//   const loadClassRecord = async (
//     className: string,
//     focusCriteria?: { rowNumber?: number; serial?: string; gr?: string },
//   ) => {
//     setStatus('');

//     const targetClassName = className.toLowerCase() === 'admin' ? adminTargetClass : className;
//     if (!targetClassName) {
//       setStatus(className.toLowerCase() === 'admin' ? 'Select a class to manage as admin.' : 'Select a class first.');
//       return;
//     }

//     if (!password) {
//       setStatus('Enter the password for this class.');
//       return;
//     }

//     const expected = className.toLowerCase() === 'admin' ? ADMIN_PASSWORD : START_PASSWORD;
//     if (password !== expected) {
//       setStatus('Invalid password.');
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch('/api/ggss-student-record', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ action: 'load', className: targetClassName, password }),
//       });

//       const data = await response.json();
//       if (!response.ok || !data.success) {
//         throw new Error(data.error || 'Unable to load class record.');
//       }

//       const loadedHeaders = Array.isArray(data.headers)
//         ? data.headers.map((header: unknown) => String(header ?? '').trim()).filter(Boolean)
//         : [];
//       const loadedRecord: Record<string, string> = {};

//       const loadedRows = Array.isArray(data.records)
//         ? data.records
//             .filter(
//               (item: any) =>
//                 item && typeof item === 'object' && typeof item.rowNumber === 'number' && item.record && typeof item.record === 'object',
//             )
//             .map((item: any) => ({
//               rowNumber: Number(item.rowNumber),
//               record: loadedHeaders.reduce((acc: Record<string, string>, header: string) => {
//                 acc[header] = String(item.record[header] ?? getDefaultFieldValue(header, className)).trim();
//                 return acc;
//               }, {} as Record<string, string>),
//             }))
//         : [];

//       if (loadedHeaders.length) {
//         loadedHeaders.forEach((header: string) => {
//           const defaultValue = getDefaultFieldValue(header, targetClassName);
//           loadedRecord[header] = String(data.record?.[header] ?? defaultValue).trim();
//         });
//       } else {
//         Object.assign(loadedRecord, buildEmptyRecordFromHeaders(loadedHeaders, targetClassName));
//       }

//       const selectedSerialHeader = getSerialHeader(loadedHeaders);
//       if (!loadedRows.length && selectedSerialHeader && !loadedRecord[selectedSerialHeader] && typeof data.nextSerial === 'number') {
//         loadedRecord[selectedSerialHeader] = String(data.nextSerial);
//       }

//       const classesFromSheet = Array.isArray(data.availableClasses) && data.availableClasses.length
//         ? getAvailableClassNames(data.availableClasses)
//         : CLASS_OPTIONS.filter((option) => option.toLowerCase() !== 'admin');
//       const index = classesFromSheet.findIndex((name) => name.toLowerCase() === targetClassName.toLowerCase());

//       let recordIndex = 0;
//       if (loadedRows.length && focusCriteria) {
//         const foundIndex = loadedRows.findIndex((row: { rowNumber: number; record: Record<string, string> }) => {
//           if (focusCriteria.rowNumber && row.rowNumber === focusCriteria.rowNumber) {
//             return true;
//           }
//           if (focusCriteria.serial && serialHeader) {
//             return String(row.record[serialHeader] ?? '').trim() === focusCriteria.serial;
//           }
//           if (focusCriteria.gr && grHeader) {
//             return String(row.record[grHeader] ?? '').trim() === focusCriteria.gr;
//           }
//           return false;
//         });
//         if (foundIndex !== -1) recordIndex = foundIndex;
//       }

//       const selectedRow = loadedRows[recordIndex]?.record ?? loadedRecord;

//       setHeaders(loadedHeaders);
//       setRecordRows(loadedRows);
//       setCurrentRecordIndex(recordIndex);
//       setRecord(selectedRow);
//       setLastSavedRecord(selectedRow);
//       setExists(loadedRows.length > 0 && data.exists);
//       setNextSerial(typeof data.nextSerial === 'number' ? data.nextSerial : null);
//       setAvailableClasses(classesFromSheet);
//       setCurrentClassIndex(index >= 0 ? index : null);
//       setStep('loaded');
//       setActionMode(data.exists ? 'prompt' : 'new');
//       setStatus('');
//     } catch (error) {
//       setStatus(error instanceof Error ? error.message : 'Unable to load class record.');
//       setStep('select');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOpenClass = async () => {
//     await loadClassRecord(selectedClass);
//   };

//   const handleOpenClassSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     if (!loading) {
//       await handleOpenClass();
//     }
//   };

//   const handleNavigateStudent = (direction: -1 | 1) => {
//     if (!recordRows.length) return;

//     const nextIndex = currentRecordIndex + direction;
//     if (nextIndex < 0 || nextIndex >= recordRows.length) return;

//     const nextRow = recordRows[nextIndex];
//     setCurrentRecordIndex(nextIndex);
//     setRecord(nextRow.record);
//     setLastSavedRecord(nextRow.record);
//     setExists(true);
//     setActionMode('edit');
//     setStatus('');
//   };

//   useEffect(() => {
//     const handleKeyDown = (event: KeyboardEvent) => {
//       const target = event.target as HTMLElement | null;
//       if (target?.tagName && ['input', 'textarea', 'select'].includes(target.tagName.toLowerCase())) {
//         return;
//       }

//       if (event.key === 'ArrowRight') {
//         event.preventDefault();
//         handleNavigateStudent(1);
//       }

//       if (event.key === 'ArrowLeft') {
//         event.preventDefault();
//         handleNavigateStudent(-1);
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [recordRows, currentRecordIndex, loading]);

//   const handleSave = async ({ autoSave = false }: { autoSave?: boolean } = {}) => {
//     if (!autoSave) {
//       setStatus('');
//     }

//     if (!effectiveClass) {
//       if (!autoSave) setStatus('Class must be selected before saving.');
//       return;
//     }

//     if (!password) {
//       if (!autoSave) setStatus('Password is required to save.');
//       return;
//     }

//     if (password !== expectedPassword) {
//       if (!autoSave) setStatus('Invalid password.');
//       return;
//     }

//     if (!hasRecordData(record, headers)) {
//       if (!autoSave) setStatus('No record fields have been entered yet.');
//       return;
//     }

//     if (!hasRequiredName || !hasRequiredGr) {
//       if (!autoSave) {
//         setStatus('Name and GR are required before saving.');
//       }
//       return;
//     }

//     setSaving(true);
//     if (autoSave) setAutoSaving(true);

//     try {
//       const response = await fetch('/api/ggss-student-record', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           action: 'save',
//           className: effectiveClass,
//           password,
//           values: record,
//           rowNumber: currentRow?.rowNumber,
//         }),
//       });

//       const data = await response.json();
//       if (!response.ok || !data.success) {
//         throw new Error(data.error || 'Unable to save class record.');
//       }

//       const updatedRecord: Record<string, string> = { ...record, updated_at: String(data.record?.updated_at ?? record.updated_at) };
//       setRecord(updatedRecord);
//       setLastSavedRecord(updatedRecord);
//       setExists(true);
//       if (!availableClasses.some((item) => item.toLowerCase() === effectiveClass.toLowerCase())) {
//         setAvailableClasses((current) => [...current, effectiveClass]);
//         setCurrentClassIndex(availableClasses.length);
//       }

//       const focusCriteria = {
//         rowNumber: typeof data.rowNumber === 'number' ? data.rowNumber : undefined,
//         serial: serialHeader ? String(updatedRecord[serialHeader] ?? '').trim() : undefined,
//         gr: grHeader ? String(updatedRecord[grHeader] ?? '').trim() : undefined,
//       };

//       await loadClassRecord(selectedClass, focusCriteria);
//       setStatus(autoSave ? 'Changes saved automatically.' : 'Class record saved successfully.');
//     } catch (error) {
//       setStatus(error instanceof Error ? error.message : 'Unable to save class record.');
//     } finally {
//       setSaving(false);
//       setAutoSaving(false);
//     }
//   };

//   const handleDeleteRecord = async () => {
//     if (!effectiveClass) {
//       setStatus('Select a class to delete.');
//       return;
//     }

//     if (!password) {
//       setStatus('Password is required to delete.');
//       return;
//     }

//     if (password !== expectedPassword) {
//       setStatus('Invalid password.');
//       return;
//     }

//     if (!currentRow?.rowNumber) {
//       setStatus('No current student selected to delete.');
//       return;
//     }

//     const confirmed = window.confirm('Delete this student record? This action cannot be undone.');
//     if (!confirmed) {
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch('/api/ggss-student-record', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ action: 'delete', className: effectiveClass, password, rowNumber: currentRow?.rowNumber }),
//       });

//       const data = await response.json();
//       if (!response.ok || !data.success) {
//         throw new Error(data.error || 'Unable to delete class record.');
//       }

//       await loadClassRecord(selectedClass);
//       setStatus('Student record deleted. Class records refreshed.');
//     } catch (error) {
//       setStatus(error instanceof Error ? error.message : 'Unable to delete class record.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (saveTimerRef.current) {
//       clearTimeout(saveTimerRef.current);
//       saveTimerRef.current = null;
//     }

//     if (
//       step !== 'loaded' ||
//       actionMode === 'prompt' ||
//       !effectiveClass ||
//       !password ||
//       password !== expectedPassword ||
//       JSON.stringify(record) === JSON.stringify(lastSavedRecord)
//     ) {
//       return;
//     }

//     saveTimerRef.current = setTimeout(() => {
//       handleSave({ autoSave: true });
//     }, 1200);

//     return () => {
//       if (saveTimerRef.current) {
//         clearTimeout(saveTimerRef.current);
//       }
//     };
//   }, [record, step, actionMode, selectedClass, password, expectedPassword, lastSavedRecord]);

//   return (
//     <main className="min-h-screen bg-slate-50">
//       <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border-b-4 border-amber-300">
//         <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
//           <div>
//             <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300">GGSS Nishtar Road</p>
//             <h1 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">Students Record 2026-27</h1>
//             <p className="mt-2 text-sm text-slate-200">Please update only the data you have so far. Name and GR are mandatory fields.</p>
//           </div>
//           <Link
//             href="/ggss-nishtar-road/staff-portal"
//             className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
//           >
//             Back to Portal
//           </Link>
//         </div>
//       </div>

//       <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
//         <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
//           <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
//             <p className="text-sm font-semibold text-slate-900">Teacher class form</p>
//             <p className="mt-2 text-sm text-slate-600">
//               {step === 'select'
//                 ? 'Click the button below, choose your class (use M/A suffix for classes I–X, e.g. VIIM or VIIA), enter the password, then load class details. Data is optional and will save automatically as you edit.'
//                 : 'Class record loaded. Edit fields below and save any changes. Use the navigation buttons to move between loaded class rows.'}
//             </p>
//           </div>

//           <div className="px-6 py-6 sm:px-8">
//             {!started ? (
//               <button
//                 type="button"
//                 onClick={handleStart}
//                 className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
//               >
//                 Open class record form
//               </button>
//             ) : (
//               <div className="space-y-6">
//                 {step !== 'loaded' ? (
//                   <form onSubmit={handleOpenClassSubmit}>
//                     <div className="grid gap-4 sm:grid-cols-2">
//                       <label className="block text-sm font-medium text-slate-700">
//                         Select class
//                         <select
//                           value={selectedClass}
//                           onChange={(event) => {
//                             setSelectedClass(event.target.value);
//                             setAdminTargetClass('');
//                             setStatus('');
//                             setActionMode('idle');
//                             setStep('select');
//                             setRecord({});
//                             setHeaders([]);
//                             setExists(false);
//                             setNextSerial(null);
//                           }}
//                           className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500"
//                         >
//                           <option value="">Choose class</option>
//                           {CLASS_OPTIONS.map((option) => (
//                             <option key={option} value={option}>{option}</option>
//                           ))}
//                         </select>
//                       </label>

//                       {isAdminClass ? (
//                         <label className="block text-sm font-medium text-slate-700">
//                           Admin: select class to manage
//                           <select
//                             value={adminTargetClass}
//                             onChange={(event) => {
//                               setAdminTargetClass(event.target.value);
//                               setStatus('');
//                             }}
//                             className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500"
//                           >
//                             <option value="">Choose class to manage</option>
//                             {CLASS_OPTIONS.filter((option) => option.toLowerCase() !== 'admin').map((option) => (
//                               <option key={option} value={option}>{option}</option>
//                             ))}
//                           </select>
//                         </label>
//                       ) : null}

//                       <label className="block text-sm font-medium text-slate-700">
//                         Password
//                         <div className="mt-2 flex items-center gap-2">
//                           <input
//                             type={passwordInputType}
//                             inputMode={passwordInputMode}
//                             value={password}
//                             onChange={(event) => setPassword(event.target.value)}
//                             placeholder="Enter class password"
//                             className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500"
//                           />
//                           <button
//                             type="button"
//                             onClick={() => setShowPassword((current) => !current)}
//                             className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
//                           >
//                             {showPassword ? 'Hide' : 'Show'}
//                           </button>
//                         </div>
//                       </label>
//                     </div>

//                     <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
//                       <button
//                         type="submit"
//                         disabled={loading || (isAdminClass && !adminTargetClass)}
//                         className="inline-flex items-center justify-center rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
//                       >
//                         {loading ? 'Loading…' : 'Load class details'}
//                       </button>
//                     </div>
//                   </form>
//                 ) : (
//                   <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
//                     <p className="font-semibold text-slate-900">
//                       {isAdminClass ? `Admin managing class ${effectiveClass || '...'}` : `Locked to class ${selectedClass}`}
//                     </p>
//                     <p className="mt-2">
//                       {isAdminClass
//                         ? 'Admin can manage the selected class after password entry. Refresh page to switch classes.'
//                         : 'Teacher stays on this class after password entry. Refresh page to switch classes.'}
//                     </p>
//                   </div>
//                 )}

//                 {status ? (
//                   <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
//                     {status}
//                     {autoSaving ? ' Saving…' : null}
//                   </div>
//                 ) : null}

//                 {step === 'loaded' && actionMode === 'prompt' ? (
//                   <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
//                     <p className="text-sm font-medium text-slate-700">Class data already exists. What would you like to do?</p>
//                     <div className="flex flex-col gap-3 sm:flex-row">
//                       <button
//                         type="button"
//                         onClick={() => chooseLoadAction('view')}
//                         className="inline-flex flex-1 items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
//                       >
//                         Edit existing student
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => chooseLoadAction('new')}
//                         className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
//                       >
//                         Add new student
//                       </button>
//                       <button
//                         type="button"
//                         onClick={handleDeleteRecord}
//                         className="inline-flex flex-1 items-center justify-center rounded-2xl border border-red-300 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
//                       >
//                         Delete current student
//                       </button>
//                     </div>
//                   </div>
//                 ) : null}

//                 {step === 'loaded' && actionMode !== 'prompt' ? (
//                   <div className="space-y-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
//                     <div className="grid gap-4 sm:grid-cols-2">
//                       <div>
//                         <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Selected class</p>
//                         <p className="mt-2 text-base font-semibold text-slate-900">{selectedClass}</p>
//                       </div>
//                       <div>
//                         <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Status</p>
//                         <p className="mt-2 text-base font-semibold text-slate-900">{exists ? 'Edit existing data' : 'Add new class data'}</p>
//                       </div>
//                     </div>

//                     <div className="flex flex-wrap gap-3 pt-4">
//                       <button
//                         type="button"
//                         onClick={() => chooseLoadAction('view')}
//                         disabled={!exists || loading}
//                         className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
//                       >
//                         {exists ? 'Edit existing data' : 'View existing data'}
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => chooseLoadAction('new')}
//                         disabled={loading}
//                         className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
//                       >
//                         Add new data
//                       </button>
//                       <button
//                         type="button"
//                         onClick={handleDeleteRecord}
//                         disabled={!exists || loading}
//                         className="inline-flex items-center justify-center rounded-2xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
//                       >
//                         Delete record
//                       </button>
//                     </div>

//                     {recordRows.length > 0 ? (
//                       <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
//                         <label className="block text-sm font-semibold text-slate-800">
//                           Search student by name
//                         </label>
//                         <input
//                           type="text"
//                           value={studentSearch}
//                           onChange={(event) => setStudentSearch(event.target.value)}
//                           placeholder="Type a student name to search"
//                           className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
//                         />
//                         {studentSearch.trim() ? (
//                           filteredRowsByName.length ? (
//                             <div className="mt-4 grid gap-2">
//                               {filteredRowsByName.slice(0, 6).map((item) => {
//                                 const studentName = nameHeader ? item.record[nameHeader] : '';
//                                 return (
//                                   <button
//                                     key={`${item.rowNumber}-${studentName || item.rowNumber}`}
//                                     type="button"
//                                     onClick={() => selectStudentByIndex(item.index)}
//                                     className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-900 transition hover:border-slate-400 hover:bg-slate-100"
//                                   >
//                                     <span className="font-semibold">{studentName}</span>
//                                     <span className="block text-xs text-slate-500">Row {item.rowNumber}</span>
//                                   </button>
//                                 );
//                               })}
//                             </div>
//                           ) : (
//                             <p className="mt-3 text-sm text-slate-500">No matching students found.</p>
//                           )
//                         ) : null}
//                       </div>
//                     ) : null}

//                     {recordRows.length > 1 ? (
//                       <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
//                         <div>
//                           Student {currentRecordIndex + 1} of {recordRows.length}
//                         </div>
//                         <div className="flex flex-wrap gap-2">
//                           <button
//                             type="button"
//                             onClick={() => handleNavigateStudent(-1)}
//                             disabled={currentRecordIndex <= 0 || loading}
//                             className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
//                           >
//                             Previous student
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => handleNavigateStudent(1)}
//                             disabled={currentRecordIndex >= recordRows.length - 1 || loading}
//                             className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
//                           >
//                             Next student
//                           </button>
//                         </div>
//                       </div>
//                     ) : null}

//                     <div className="grid gap-4 sm:grid-cols-2">
//                       {headers.map((header) => {
//                         const normalized = String(header ?? '').trim();
//                         const key = normalized.toLowerCase();
//                         const value = record[normalized] ?? '';
//                         const isClassField = key === 'class';
//                         const isUpdatedAt = key.includes('updated_at');
//                         const isSerialField = key === 'sno' || key === 'serial' || key === 'serial_no' || key === 'sr';
//                         const isNameField = nameHeader ? key === normalizeHeader(nameHeader) : false;
//                         const isGrField = grHeader ? key === normalizeHeader(grHeader) : false;
//                         const isTextArea = key.includes('note') || key.includes('remarks');
//                         const isGenderField = key === 'gender';
//                         const isDobField = key === 'dob' || key === 'dateofbirth' || key === 'date_of_birth' || key === 'birthdate';
//                         const isCnicField = key === 'cnic' || key === 'cnic_no' || key === 'cnic_number';
//                         const isMobileField = key.includes('mobile') || key.includes('phone') || key.includes('cell');
//                         const isRelationField = key === 'relation';
//                         const isReligionField = key === 'religion';
//                         const isMediumField = key === 'medium';
//                         const labelText = normalized.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

//                         return (
//                           <label key={normalized} className="block text-sm font-medium text-slate-700">
//                             {labelText}
//                             {isTextArea ? (
//                               <textarea
//                                 value={value}
//                                 onChange={(event) => setRecord((current) => ({ ...current, [normalized]: event.target.value }))}
//                                 rows={4}
//                                 disabled={isClassField || isUpdatedAt || isSerialField || (isExistingEditMode && (isNameField || isGrField))}
//                                 className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100"
//                               />
//                             ) : isGenderField ? (
//                               <select
//                                 value={value || 'Male'}
//                                 onChange={(event) => setRecord((current) => ({ ...current, [normalized]: event.target.value }))}
//                                 disabled={isExistingEditMode && (isNameField || isGrField)}
//                                 className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100"
//                               >
//                                 <option value="Male">Male</option>
//                                 <option value="Female">Female</option>
//                               </select>
//                             ) : isDobField ? (
//                               <input
//                                 type="date"
//                                 value={normalizeDobForInput(value)}
//                                 onChange={(event) => setRecord((current) => ({ ...current, [normalized]: event.target.value }))}
//                                 disabled={isExistingEditMode && (isNameField || isGrField)}
//                                 className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100"
//                               />
//                             ) : isCnicField ? (
//                               <>
//                                 <input
//                                   type="text"
//                                   inputMode="numeric"
//                                   value={value}
//                                   readOnly={isClassField || isUpdatedAt || (isExistingEditMode && (isNameField || isGrField))}
//                                   onChange={(event) => setRecord((current) => ({ ...current, [normalized]: formatCnicValue(event.target.value) }))}
//                                   placeholder="xxxxx-xxxxxxx-x"
//                                   className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100"
//                                 />
//                                 <p className="mt-2 text-xs text-slate-500">CNIC format: xxxxx-xxxxxxx-x</p>
//                               </>
//                             ) : isMobileField ? (
//                               <>
//                                 <input
//                                   type="tel"
//                                   inputMode="numeric"
//                                   value={value}
//                                   readOnly={isClassField || isUpdatedAt || (isExistingEditMode && (isNameField || isGrField))}
//                                   onChange={(event) => setRecord((current) => ({ ...current, [normalized]: formatPakMobileValue(event.target.value) }))}
//                                   placeholder="03XX-XXXXXXX"
//                                   className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100"
//                                 />
//                                 <p className="mt-2 text-xs text-slate-500">Mobile format: 03XX-XXXXXXX</p>
//                               </>
//                             ) : isRelationField ? (
//                               <select
//                                 value={value || 'Father'}
//                                 onChange={(event) => setRecord((current) => ({ ...current, [normalized]: event.target.value }))}
//                                 disabled={isExistingEditMode && (isNameField || isGrField)}
//                                 className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100"
//                               >
//                                 <option value="Father">Father</option>
//                                 <option value="Mother">Mother</option>
//                                 <option value="Grandparents">Grandparents</option>
//                                 <option value="Others">Others</option>
//                               </select>
//                             ) : isReligionField ? (
//                               <select
//                                 value={value || 'Muslim'}
//                                 onChange={(event) => setRecord((current) => ({ ...current, [normalized]: event.target.value }))}
//                                 disabled={isExistingEditMode && (isNameField || isGrField)}
//                                 className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100"
//                               >
//                                 <option value="Muslim">Muslim</option>
//                                 <option value="Hindu">Hindu</option>
//                                 <option value="Christian">Christian</option>
//                                 <option value="Other">Other</option>
//                               </select>
//                             ) : isMediumField ? (
//                               <select
//                                 value={value || 'Urdu'}
//                                 onChange={(event) => setRecord((current) => ({ ...current, [normalized]: event.target.value }))}
//                                 disabled={isExistingEditMode && (isNameField || isGrField)}
//                                 className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100"
//                               >
//                                 <option value="Urdu">Urdu</option>
//                                 <option value="English">English</option>
//                               </select>
//                             ) : (
//                               <input
//                                 type="text"
//                                 value={value}
//                                 readOnly={isClassField || isUpdatedAt || isSerialField || (isExistingEditMode && (isNameField || isGrField))}
//                                 onChange={(event) => setRecord((current) => ({ ...current, [normalized]: event.target.value }))}
//                                 className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100"
//                               />
//                             )}
//                           </label>
//                         );
//                       })}
//                     </div>

//                     <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//                       <div>
//                         <p className="text-xs text-slate-500">Last updated at</p>
//                         <p className="mt-1 text-sm text-slate-700">{record.updated_at || 'Not saved yet'}</p>
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => handleSave()}
//                         disabled={saveButtonDisabled}
//                         className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
//                       >
//                         {saving ? 'Saving…' : 'Save class data'}
//                       </button>
//                     </div>
//                   </div>
//                 ) : null}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }



'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { IoCheckmarkCircleOutline, IoLockClosedOutline, IoSaveOutline, IoCloudDoneOutline } from 'react-icons/io5';

const CLASS_OPTIONS = [
  'ECE',
  'IM', 'IA',
  'IIM', 'IIA',
  'IIIM', 'IIIA',
  'IVM', 'IVA',
  'VM', 'VA',
  'VIM', 'VIA',
  'VIIM', 'VIIA',
  'VIIIM', 'VIIIA',
  'IXM', 'IXA',
  'XM', 'XA',
  'Admin',
];
const START_PASSWORD = '20262027';
const ADMIN_PASSWORD = 'adminadmin321';

export default function StudentRecordFormPage() {
  const [started, setStarted] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [password, setPassword] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [record, setRecord] = useState<Record<string, string>>({});
  const [exists, setExists] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [actionMode, setActionMode] = useState<'idle' | 'prompt' | 'edit' | 'new'>('idle');
  const [nextSerial, setNextSerial] = useState<number | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSavedRecord, setLastSavedRecord] = useState<Record<string, string>>({});
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [currentClassIndex, setCurrentClassIndex] = useState<number | null>(null);
  const [adminTargetClass, setAdminTargetClass] = useState('');
  const [recordRows, setRecordRows] = useState<Array<{ rowNumber: number; record: Record<string, string> }>>([]);
  const [currentRecordIndex, setCurrentRecordIndex] = useState(0);
  const [studentSearch, setStudentSearch] = useState('');
  const [step, setStep] = useState<'select' | 'loaded'>('select');
  
  // Custom states added for final locking workflow & clear messages
  const [isLocked, setIsLocked] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAdminClass = selectedClass.toLowerCase() === 'admin';
  const effectiveClass = isAdminClass ? adminTargetClass : selectedClass;
  const passwordInputType = showPassword ? 'text' : 'password';
  const passwordInputMode = isAdminClass ? 'text' : 'numeric';

  const showToastMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4500);
  };

  const getDefaultFieldValue = (header: string, className: string) => {
    const key = header.toLowerCase();
    if (key === 'class') return className;
    if (key === 'religion') return 'Muslim';
    if (key === 'medium') return 'Urdu';
    return '';
  };

  const SERIAL_KEYS = ['sno', 'serial', 'serial_no', 'sr'];
  const NAME_KEYS = ['name', 'student_name', 'full_name', 'studentname'];
  const GR_KEYS = ['gr', 'gr_no', 'gr number', 'gr_number', 'grno'];

  const normalizeHeader = (header: string) => String(header ?? '').trim().toLowerCase();
  const getSerialHeader = (headersList: string[]) =>
    headersList.find((header) => SERIAL_KEYS.includes(normalizeHeader(header))) ?? null;
  const getNameHeader = (headersList: string[]) =>
    headersList.find((header) => NAME_KEYS.includes(normalizeHeader(header))) ?? null;
  const getGrHeader = (headersList: string[]) =>
    headersList.find((header) => GR_KEYS.includes(normalizeHeader(header))) ?? null;

  const serialHeader = getSerialHeader(headers);
  const nameHeader = getNameHeader(headers);
  const grHeader = getGrHeader(headers);

  const currentRow = recordRows[currentRecordIndex] ?? null;
  const isExistingEditMode = actionMode === 'edit';

  const filteredRowsByName = useMemo(() => {
    if (!studentSearch.trim() || !nameHeader) return [];
    const query = studentSearch.trim().toLowerCase();
    return recordRows
      .map((item, index) => ({ ...item, index }))
      .filter((item) => String(item.record[nameHeader] ?? '').toLowerCase().includes(query));
  }, [studentSearch, recordRows, nameHeader]);

  const hasRequiredName = nameHeader ? String(record[nameHeader] ?? '').trim().length > 0 : false;
  const hasRequiredGr = grHeader ? String(record[grHeader] ?? '').trim().length > 0 : false;
  const saveButtonDisabled = saving || !hasRequiredName || !hasRequiredGr || isLocked;

  const chooseLoadAction = (choice: 'view' | 'new') => {
    setStatus('');
    setIsLocked(false); // Reset lock state when loading alternate records

    if (choice === 'new') {
      const empty = buildEmptyRecordFromHeaders(headers, effectiveClass);
      if (serialHeader && nextSerial !== null) {
        empty[serialHeader] = String(nextSerial);
      }
      setRecord(empty);
      setLastSavedRecord(empty);
      showToastMessage('info', 'Starting fresh student record data form.');
      setActionMode('new');
    } else {
      showToastMessage('info', 'Loaded existing student records for editing.');
      setLastSavedRecord(record);
      setActionMode('edit');
    }
  };

  const selectStudentByIndex = (index: number) => {
    const nextRow = recordRows[index];
    if (!nextRow) return;

    setIsLocked(false); // Reset lock state for the selected item
    setCurrentRecordIndex(index);
    setRecord(nextRow.record);
    setLastSavedRecord(nextRow.record);
    setExists(true);
    setActionMode('edit');
    showToastMessage('info', `Selected student record row ${nextRow.rowNumber}`);
  };

  const buildEmptyRecordFromHeaders = (headersList: string[], className: string) => {
    const emptyRecord: Record<string, string> = {};
    headersList.forEach((header) => {
      const label = String(header ?? '').trim();
      if (!label) return;
      emptyRecord[label] = getDefaultFieldValue(label, className);
    });
    return emptyRecord;
  };

  const hasRecordData = (recordToCheck: Record<string, string>, headersList: string[]) => {
    const ignoreKeys = new Set(['class', 'updated_at', ...SERIAL_KEYS]);
    return headersList.some((header) => {
      const key = String(header ?? '').trim().toLowerCase();
      if (ignoreKeys.has(key)) return false;
      return String(recordToCheck[header] ?? '').trim().length > 0;
    });
  };

  const formatCnicValue = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 13);
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  };

  const formatPakMobileValue = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 4) return digits;
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  };

  const normalizeDobForInput = (value: string) => {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString().slice(0, 10);
    }
    return value;
  };

  const expectedPassword = useMemo(() => {
    if (selectedClass.toLowerCase() === 'admin') return ADMIN_PASSWORD;
    if (!selectedClass) return '';
    return START_PASSWORD;
  }, [selectedClass]);

  const handleStart = () => {
    setStarted(true);
    setStatus('');
  };

  const getAvailableClassNames = (classNames: string[]) => {
    const unique: string[] = [];
    classNames.forEach((name) => {
      const trimmed = String(name ?? '').trim();
      if (!trimmed) return;
      if (!unique.some((existing) => existing.toLowerCase() === trimmed.toLowerCase())) {
        unique.push(trimmed);
      }
    });
    return unique;
  };

  const loadClassRecord = async (
    className: string,
    focusCriteria?: { rowNumber?: number; serial?: string; gr?: string },
  ) => {
    setStatus('');

    const targetClassName = className.toLowerCase() === 'admin' ? adminTargetClass : className;
    if (!targetClassName) {
      showToastMessage('error', 'Select a class to manage.');
      return;
    }

    if (!password) {
      showToastMessage('error', 'Enter the password for this class.');
      return;
    }

    const expected = className.toLowerCase() === 'admin' ? ADMIN_PASSWORD : START_PASSWORD;
    if (password !== expected) {
      showToastMessage('error', 'Invalid security access password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/ggss-student-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'load', className: targetClassName, password }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to load class record.');
      }

      const loadedHeaders = Array.isArray(data.headers)
        ? data.headers.map((header: unknown) => String(header ?? '').trim()).filter(Boolean)
        : [];
      const loadedRecord: Record<string, string> = {};

      const loadedRows = Array.isArray(data.records)
        ? data.records
            .filter(
              (item: any) =>
                item && typeof item === 'object' && typeof item.rowNumber === 'number' && item.record && typeof item.record === 'object',
            )
            .map((item: any) => ({
              rowNumber: Number(item.rowNumber),
              record: loadedHeaders.reduce((acc: Record<string, string>, header: string) => {
                acc[header] = String(item.record[header] ?? getDefaultFieldValue(header, className)).trim();
                return acc;
              }, {} as Record<string, string>),
            }))
        : [];

      if (loadedHeaders.length) {
        loadedHeaders.forEach((header: string) => {
          const defaultValue = getDefaultFieldValue(header, targetClassName);
          loadedRecord[header] = String(data.record?.[header] ?? defaultValue).trim();
        });
      } else {
        Object.assign(loadedRecord, buildEmptyRecordFromHeaders(loadedHeaders, targetClassName));
      }

      const selectedSerialHeader = getSerialHeader(loadedHeaders);
      if (!loadedRows.length && selectedSerialHeader && !loadedRecord[selectedSerialHeader] && typeof data.nextSerial === 'number') {
        loadedRecord[selectedSerialHeader] = String(data.nextSerial);
      }

      const classesFromSheet = Array.isArray(data.availableClasses) && data.availableClasses.length
        ? getAvailableClassNames(data.availableClasses)
        : CLASS_OPTIONS.filter((option) => option.toLowerCase() !== 'admin');
      const index = classesFromSheet.findIndex((name) => name.toLowerCase() === targetClassName.toLowerCase());

      let recordIndex = 0;
      if (loadedRows.length && focusCriteria) {
        const foundIndex = loadedRows.findIndex((row: { rowNumber: number; record: Record<string, string> }) => {
          if (focusCriteria.rowNumber && row.rowNumber === focusCriteria.rowNumber) {
            return true;
          }
          if (focusCriteria.serial && serialHeader) {
            return String(row.record[serialHeader] ?? '').trim() === focusCriteria.serial;
          }
          if (focusCriteria.gr && grHeader) {
            return String(row.record[grHeader] ?? '').trim() === focusCriteria.gr;
          }
          return false;
        });
        if (foundIndex !== -1) recordIndex = foundIndex;
      }

      const selectedRow = loadedRows[recordIndex]?.record ?? loadedRecord;

      setHeaders(loadedHeaders);
      setRecordRows(loadedRows);
      setCurrentRecordIndex(recordIndex);
      setRecord(selectedRow);
      setLastSavedRecord(selectedRow);
      setExists(loadedRows.length > 0 && data.exists);
      setNextSerial(typeof data.nextSerial === 'number' ? data.nextSerial : null);
      setAvailableClasses(classesFromSheet);
      setCurrentClassIndex(index >= 0 ? index : null);
      setStep('loaded');
      setActionMode(data.exists ? 'prompt' : 'new');
      showToastMessage('success', 'Class details synchronized successfully.');
    } catch (error) {
      showToastMessage('error', error instanceof Error ? error.message : 'Unable to load class records.');
      setStep('select');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenClass = async () => {
    await loadClassRecord(selectedClass);
  };

  const handleOpenClassSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loading) {
      await handleOpenClass();
    }
  };

  const handleNavigateStudent = (direction: -1 | 1) => {
    if (!recordRows.length) return;

    const nextIndex = currentRecordIndex + direction;
    if (nextIndex < 0 || nextIndex >= recordRows.length) return;

    setIsLocked(false); // Unlock view mode for navigating item row shifts
    const nextRow = recordRows[nextIndex];
    setCurrentRecordIndex(nextIndex);
    setRecord(nextRow.record);
    setLastSavedRecord(nextRow.record);
    setExists(true);
    setActionMode('edit');
    setStatus('');
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.tagName && ['input', 'textarea', 'select'].includes(target.tagName.toLowerCase())) {
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNavigateStudent(1);
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handleNavigateStudent(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [recordRows, currentRecordIndex, loading]);

  const handleSave = async ({ autoSave = false }: { autoSave?: boolean } = {}) => {
    if (isLocked) return; // Prevent live-saving if the form is sealed

    if (!effectiveClass || !password || password !== expectedPassword) return;
    if (!hasRecordData(record, headers) || !hasRequiredName || !hasRequiredGr) return;

    setSaving(true);
    if (autoSave) setAutoSaving(true);

    try {
      const response = await fetch('/api/ggss-student-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          className: effectiveClass,
          password,
          values: record,
          rowNumber: currentRow?.rowNumber,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to save data entry.');
      }

      const updatedRecord: Record<string, string> = { ...record, updated_at: String(data.record?.updated_at ?? record.updated_at) };
      setRecord(updatedRecord);
      setLastSavedRecord(updatedRecord);
      setExists(true);

      if (!availableClasses.some((item) => item.toLowerCase() === effectiveClass.toLowerCase())) {
        setAvailableClasses((current) => [...current, effectiveClass]);
        setCurrentClassIndex(availableClasses.length);
      }

      if (autoSave) {
        showToastMessage('info', 'Live changes backup saved automatically.');
      }
    } catch (error) {
      showToastMessage('error', 'Auto-save connection dropped. Storing changes locally.');
    } finally {
      setSaving(false);
      setAutoSaving(false);
    }
  };

  // Final confirmation save and lock function execution
  const handleFinalSubmissionAndLock = async () => {
    if (!hasRequiredName || !hasRequiredGr) {
      showToastMessage('error', 'Name and GR number fields are mandatory before submission.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/ggss-student-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save',
          className: effectiveClass,
          password,
          values: record,
          rowNumber: currentRow?.rowNumber,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) throw new Error();

      const finalRecord = { ...record, updated_at: String(data.record?.updated_at ?? record.updated_at) };
      setRecord(finalRecord);
      setLastSavedRecord(finalRecord);
      
      setIsLocked(true); // Freeze and lock inputs completely
      showToastMessage('success', '🎉 Data complete save hogya hai! Data editing is now locked.');
    } catch {
      showToastMessage('error', 'Failed to submit final student details record.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!effectiveClass || !password || password !== expectedPassword || !currentRow?.rowNumber) return;

    const confirmed = window.confirm('Delete this student record? This action cannot be undone.');
    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch('/api/ggss-student-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', className: effectiveClass, password, rowNumber: currentRow?.rowNumber }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to delete record.');
      }

      await loadClassRecord(selectedClass);
      showToastMessage('success', 'Student record deleted and dataset refreshed.');
    } catch (error) {
      showToastMessage('error', error instanceof Error ? error.message : 'Unable to delete student record.');
    } finally {
      setLoading(false);
    }
  };

  // Background timer wrapper hook for auto-saves
  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    if (
      step !== 'loaded' ||
      actionMode === 'prompt' ||
      isLocked ||
      !effectiveClass ||
      !password ||
      password !== expectedPassword ||
      JSON.stringify(record) === JSON.stringify(lastSavedRecord)
    ) {
      return;
    }

    saveTimerRef.current = setTimeout(() => {
      handleSave({ autoSave: true });
    }, 1200);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [record, step, actionMode, selectedClass, password, expectedPassword, lastSavedRecord, isLocked]);

  return (
    <main className="min-h-screen bg-slate-50 relative">
      
      {/* Toast System Notification Overlay */}
      {toast && (
        <div className={`fixed right-4 top-4 z-50 flex max-w-md items-center gap-2 rounded-2xl p-4 shadow-2xl text-white transition-all duration-300 ${
          toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'error' ? 'bg-rose-600' : 'bg-slate-800'
        }`}>
          <p className="text-sm font-semibold">{toast.text}</p>
        </div>
      )}

      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border-b-4 border-amber-300">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300">GGSS Nishtar Road</p>
            <h1 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">Students Record 2026-27</h1>
            <p className="mt-2 text-sm text-slate-200">Please update only the data you have so far. Name and GR are mandatory fields.</p>
          </div>
          <Link
            href="/ggss-nishtar-road/staff-portal"
            className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            Back to Portal
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5 sm:px-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Teacher class form</p>
              <p className="mt-1 text-sm text-slate-600">
                {step === 'select'
                  ? 'Click the button below, choose your class, enter the password, then load class details.'
                  : 'Class record loaded. Edit fields below. Progress updates dynamically via auto-sync backup.'}
              </p>
            </div>
            
            {/* Live Synchronized Badge Controls */}
            {step === 'loaded' && (
              <div>
                {isLocked ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold text-rose-700">
                    <IoLockClosedOutline /> Entry Sealed
                  </span>
                ) : autoSaving ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-700 animate-pulse">
                    Auto-saving...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                    <IoCloudDoneOutline /> Live Synced
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="px-6 py-6 sm:px-8">
            {!started ? (
              <button
                type="button"
                onClick={handleStart}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Open class record form
              </button>
            ) : (
              <div className="space-y-6">
                {step !== 'loaded' ? (
                  <form onSubmit={handleOpenClassSubmit}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Select class
                        <select
                          value={selectedClass}
                          onChange={(event) => {
                            setSelectedClass(event.target.value);
                            setAdminTargetClass('');
                            setStatus('');
                            setActionMode('idle');
                            setStep('select');
                            setRecord({});
                            setHeaders([]);
                            setExists(false);
                            setNextSerial(null);
                          }}
                          className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                        >
                          <option value="">Choose class</option>
                          {CLASS_OPTIONS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </label>

                      {isAdminClass ? (
                        <label className="block text-sm font-medium text-slate-700">
                          Admin: select class to manage
                          <select
                            value={adminTargetClass}
                            onChange={(event) => {
                              setAdminTargetClass(event.target.value);
                              setStatus('');
                            }}
                            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                          >
                            <option value="">Choose class to manage</option>
                            {CLASS_OPTIONS.filter((option) => option.toLowerCase() !== 'admin').map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </label>
                      ) : null}

                      <label className="block text-sm font-medium text-slate-700">
                        Password
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            type={passwordInputType}
                            inputMode={passwordInputMode}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter class password"
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((current) => !current)}
                            className="rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                          >
                            {showPassword ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </label>
                    </div>

                    <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center">
                      <button
                        type="submit"
                        disabled={loading || (isAdminClass && !adminTargetClass)}
                        className="inline-flex items-center justify-center rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading ? 'Loading…' : 'Load class details'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">
                      {isAdminClass ? `Admin managing class ${effectiveClass || '...'}` : `Locked to class ${selectedClass}`}
                    </p>
                    <p className="mt-1 text-slate-500">
                      {isAdminClass
                        ? 'Admin can manage the selected class after password entry. Refresh page to switch classes.'
                        : 'Teacher stays on this class after password entry. Refresh page to switch classes.'}
                    </p>
                  </div>
                )}

                {/* Legacy status row kept for structural safety compatibility */}
                {status ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    {status}
                  </div>
                ) : null}

                {step === 'loaded' && actionMode === 'prompt' ? (
                  <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm font-medium text-slate-700">Class data already exists. What would you like to do?</p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => chooseLoadAction('view')}
                        className="inline-flex flex-1 items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                      >
                        Edit existing student
                      </button>
                      <button
                        type="button"
                        onClick={() => chooseLoadAction('new')}
                        className="inline-flex flex-1 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                      >
                        Add new student
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteRecord}
                        className="inline-flex flex-1 items-center justify-center rounded-2xl border border-red-300 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                      >
                        Delete current student
                      </button>
                    </div>
                  </div>
                ) : null}

                {step === 'loaded' && actionMode !== 'prompt' ? (
                  <div className="space-y-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Selected class</p>
                        <p className="mt-2 text-base font-semibold text-slate-900">{selectedClass}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Status</p>
                        <p className="mt-2 text-base font-semibold text-slate-900">{exists ? 'Edit existing data' : 'Add new class data'}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => chooseLoadAction('view')}
                        disabled={!exists || loading}
                        className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {exists ? 'Edit existing data' : 'View existing data'}
                      </button>
                      <button
                        type="button"
                        onClick={() => chooseLoadAction('new')}
                        disabled={loading}
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Add new data
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteRecord}
                        disabled={!exists || loading}
                        className="inline-flex items-center justify-center rounded-2xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Delete record
                      </button>
                    </div>

                    {recordRows.length > 0 ? (
                      <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                        <label className="block text-sm font-semibold text-slate-800">
                          Search student by name
                        </label>
                        <input
                          type="text"
                          value={studentSearch}
                          onChange={(event) => setStudentSearch(event.target.value)}
                          placeholder="Type a student name to search"
                          className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                        />
                        {studentSearch.trim() ? (
                          filteredRowsByName.length ? (
                            <div className="mt-4 grid gap-2">
                              {filteredRowsByName.slice(0, 6).map((item) => {
                                const studentName = nameHeader ? item.record[nameHeader] : '';
                                return (
                                  <button
                                    key={`${item.rowNumber}-${studentName || item.rowNumber}`}
                                    type="button"
                                    onClick={() => selectStudentByIndex(item.index)}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-900 transition hover:border-slate-400 hover:bg-slate-100"
                                  >
                                    <span className="font-semibold">{studentName}</span>
                                    <span className="block text-xs text-slate-500">Row {item.rowNumber}</span>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="mt-3 text-sm text-slate-500">No matching students found.</p>
                          )
                        ) : null}
                      </div>
                    ) : null}

                    {recordRows.length > 1 ? (
                      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          Student {currentRecordIndex + 1} of {recordRows.length}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleNavigateStudent(-1)}
                            disabled={currentRecordIndex <= 0 || loading}
                            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Previous student
                          </button>
                          <button
                            type="button"
                            onClick={() => handleNavigateStudent(1)}
                            disabled={currentRecordIndex >= recordRows.length - 1 || loading}
                            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Next student
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <div className="grid gap-4 sm:grid-cols-2">
                      {headers.map((header) => {
                        const normalized = String(header ?? '').trim();
                        const key = normalized.toLowerCase();
                        const value = record[normalized] ?? '';
                        const isClassField = key === 'class';
                        const isUpdatedAt = key.includes('updated_at');
                        const isSerialField = key === 'sno' || key === 'serial' || key === 'serial_no' || key === 'sr';
                        const isNameField = nameHeader ? key === normalizeHeader(nameHeader) : false;
                        const isGrField = grHeader ? key === normalizeHeader(grHeader) : false;
                        const isTextArea = key.includes('note') || key.includes('remarks');
                        const isGenderField = key === 'gender';
                        const isDobField = key === 'dob' || key === 'dateofbirth' || key === 'date_of_birth' || key === 'birthdate';
                        const isCnicField = key === 'cnic' || key === 'cnic_no' || key === 'cnic_number';
                        const isMobileField = key.includes('mobile') || key.includes('phone') || key.includes('cell');
                        const isRelationField = key === 'relation';
                        const isReligionField = key === 'religion';
                        const isMediumField = key === 'medium';
                        const labelText = normalized.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

                        return (
                          <label key={normalized} className="block text-sm font-medium text-slate-700">
                            {labelText}
                            {isTextArea ? (
                              <textarea
                                value={value}
                                onChange={(event) => setRecord((current) => ({ ...current, [normalized]: event.target.value }))}
                                rows={4}
                                disabled={isLocked || isClassField || isUpdatedAt || isSerialField || (isExistingEditMode && (isNameField || isGrField))}
                                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                              />
                            ) : isGenderField ? (
                              <select
                                value={value || 'Male'}
                                onChange={(event) => setRecord((current) => ({ ...current, [normalized]: event.target.value }))}
                                disabled={isLocked || (isExistingEditMode && (isNameField || isGrField))}
                                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                              </select>
                            ) : isDobField ? (
                              <input
                                type="date"
                                value={normalizeDobForInput(value)}
                                onChange={(event) => setRecord((current) => ({ ...current, [normalized]: event.target.value }))}
                                disabled={isLocked || (isExistingEditMode && (isNameField || isGrField))}
                                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                              />
                            ) : isCnicField ? (
                              <>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={value}
                                  disabled={isLocked}
                                  readOnly={isClassField || isUpdatedAt || (isExistingEditMode && (isNameField || isGrField))}
                                  onChange={(event) => setRecord((current) => ({ ...current, [normalized]: formatCnicValue(event.target.value) }))}
                                  placeholder="xxxxx-xxxxxxx-x"
                                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                                />
                                <p className="mt-1 text-xs text-slate-400">CNIC format: xxxxx-xxxxxxx-x</p>
                              </>
                            ) : isMobileField ? (
                              <>
                                <input
                                  type="tel"
                                  inputMode="numeric"
                                  value={value}
                                  disabled={isLocked}
                                  readOnly={isClassField || isUpdatedAt || (isExistingEditMode && (isNameField || isGrField))}
                                  onChange={(event) => setRecord((current) => ({ ...current, [normalized]: formatPakMobileValue(event.target.value) }))}
                                  placeholder="03XX-XXXXXXX"
                                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                                />
                                <p className="mt-1 text-xs text-slate-400">Mobile format: 03XX-XXXXXXX</p>
                              </>
                            ) : isRelationField ? (
                              <select
                                value={value || 'Father'}
                                onChange={(event) => setRecord((current) => ({ ...current, [normalized]: event.target.value }))}
                                disabled={isLocked || (isExistingEditMode && (isNameField || isGrField))}
                                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                              >
                                <option value="Father">Father</option>
                                <option value="Mother">Mother</option>
                                <option value="Grandparents">Grandparents</option>
                                <option value="Others">Others</option>
                              </select>
                            ) : isReligionField ? (
                              <select
                                value={value || 'Muslim'}
                                onChange={(event) => setRecord((current) => ({ ...current, [normalized]: event.target.value }))}
                                disabled={isLocked || (isExistingEditMode && (isNameField || isGrField))}
                                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                              >
                                <option value="Muslim">Muslim</option>
                                <option value="Hindu">Hindu</option>
                                <option value="Christian">Christian</option>
                                <option value="Other">Other</option>
                              </select>
                            ) : isMediumField ? (
                              <select
                                value={value || 'Urdu'}
                                onChange={(event) => setRecord((current) => ({ ...current, [normalized]: event.target.value }))}
                                disabled={isLocked || (isExistingEditMode && (isNameField || isGrField))}
                                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                              >
                                <option value="Urdu">Urdu</option>
                                <option value="English">English</option>
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={value}
                                disabled={isLocked}
                                readOnly={isClassField || isUpdatedAt || isSerialField || (isExistingEditMode && (isNameField || isGrField))}
                                onChange={(event) => setRecord((current) => ({ ...current, [normalized]: event.target.value }))}
                                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                              />
                            )}
                          </label>
                        );
                      })}
                    </div>

                    <div className="flex flex-col gap-4 pt-6 border-t border-slate-200">
                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Last Server Save Stamp</p>
                        <p className="text-sm font-medium text-slate-800">{record.updated_at || 'Not saved yet'}</p>
                      </div>
                      
                      {/* Submissions Control Actions Block */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                        <button
                          type="button"
                          onClick={() => handleSave()}
                          disabled={saveButtonDisabled}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <IoSaveOutline size={16} /> {saving ? 'Saving...' : 'Save Data'}
                        </button>
                        
                        <button
                          type="button"
                          onClick={handleFinalSubmissionAndLock}
                          disabled={saveButtonDisabled}
                          className={`w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow transition-all ${
                            isLocked 
                              ? 'bg-slate-400 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700'
                          }`}
                        >
                          {isLocked ? (
                            <>
                              <IoLockClosedOutline size={16} /> Record Locked & Complete
                            </>
                          ) : (
                            <>
                              <IoCheckmarkCircleOutline size={16} /> Final Submit & Lock Records
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}