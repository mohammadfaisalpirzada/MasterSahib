'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

type ColumnMeta = {
  key: string;
  label: string;
};

type StipendRecord = Record<string, string> & {
  rowId: string;
};

type StipendApiResponse = {
  success: boolean;
  authenticated?: boolean;
  username?: string;
  className?: string;
  isAdmin?: boolean;
  columns?: ColumnMeta[];
  records?: StipendRecord[];
  record?: StipendRecord;
  availableClasses?: string[];
  source?: {
    sheetName: string;
  };
  message?: string;
};

const ADMIN_USERNAME = 'Admin';
const CLASS_USERNAMES = ['Class VIG', 'Class IXG', 'Class XG', ADMIN_USERNAME];
const DRAFT_SAVE_DELAY_MS = 450;

const parseResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    const raw = await response.text();
    throw new Error(raw.slice(0, 200) || 'Server returned non-JSON response.');
  }
  return (await response.json()) as StipendApiResponse;
};

const normalize = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

const ATTENDANCE_MONTH_KEYS = new Set([
  'august', 'september', 'october', 'november', 'december', 'january', 'february', 'march',
]);

const ATTENDANCE_MONTH_LIMITS: Record<string, number> = {
  august: 26,
  september: 26,
  october: 27,
  november: 25,
  december: 27,
  january: 27,
  february: 24,
  march: 26,
};

type FieldType = 'class' | 'gr' | 'name' | 'mobile' | 'cnic' | 'date' | 'month' | 'text';

const getFieldType = (columnKey: string, columnLabel: string, classKey: string): FieldType => {
  if (columnKey === classKey) return 'class';
  const nKey = normalize(columnKey);
  const nLabel = normalize(columnLabel);
  if (nKey === 'gr' || nLabel === 'gr') return 'gr';
  if (nKey === 'dateofbirth' || nLabel === 'dateofbirth' || nKey === 'dob' || nLabel === 'dob') return 'date';
  if (nKey === 'studentname' || nLabel === 'studentname') return 'name';
  if (nKey === 'fatherguardianname' || nLabel === 'fatherguardianname' || nLabel.startsWith('father')) return 'name';
  if (nKey === 'relation' || nLabel === 'relation') return 'name';
  if (nKey.startsWith('mobileno') || nLabel.startsWith('mobileno') || nKey.startsWith('mobile') || nLabel.startsWith('mobile')) return 'mobile';
  if (nKey.startsWith('cnic') || nLabel.startsWith('cnic')) return 'cnic';
  if (ATTENDANCE_MONTH_KEYS.has(nKey) || ATTENDANCE_MONTH_KEYS.has(nLabel)) return 'month';
  return 'text';
};

const formatMobile = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
};

const formatCnic = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
};

const getAttendanceMonthLimit = (columnKey: string, columnLabel: string): number | null => {
  return ATTENDANCE_MONTH_LIMITS[normalize(columnKey)] ?? ATTENDANCE_MONTH_LIMITS[normalize(columnLabel)] ?? null;
};

const sanitizeMonthValue = (value: string, monthLimit: number | null): string => {
  const digits = value.replace(/\D/g, '').slice(0, 2);
  if (!digits) {
    return '';
  }

  if (!monthLimit) {
    return digits;
  }

  const numericValue = Number(digits);
  if (!Number.isFinite(numericValue)) {
    return '';
  }

  return String(Math.min(numericValue, monthLimit));
};

const sanitizeValue = (value: string, fieldType: FieldType, columnKey: string, columnLabel: string): string => {
  switch (fieldType) {
    case 'gr': return value.replace(/\D/g, '');
    case 'name': return value.replace(/[^a-zA-Z\s.]/g, '');
    case 'mobile': return formatMobile(value);
    case 'cnic': return formatCnic(value);
    case 'month': return sanitizeMonthValue(value, getAttendanceMonthLimit(columnKey, columnLabel));
    default: return value;
  }
};

const getFieldAttrs = (fieldType: FieldType, columnKey = '', columnLabel = '') => {
  if (fieldType === 'gr') return { type: 'text' as const, inputMode: 'numeric' as const, maxLength: undefined, placeholder: 'e.g. 1234' };
  if (fieldType === 'mobile') return { type: 'text' as const, inputMode: 'numeric' as const, maxLength: 12, placeholder: '0300-1234567' };
  if (fieldType === 'cnic') return { type: 'text' as const, inputMode: 'numeric' as const, maxLength: 15, placeholder: '42101-1234567-1' };
  if (fieldType === 'date') return { type: 'date' as const, inputMode: 'text' as const, maxLength: undefined, placeholder: '' };
  if (fieldType === 'month') {
    const monthLimit = getAttendanceMonthLimit(columnKey, columnLabel);
    return {
      type: 'text' as const,
      inputMode: 'numeric' as const,
      maxLength: 2,
      placeholder: monthLimit ? `0-${monthLimit}` : '0-31',
    };
  }
  return { type: 'text' as const, inputMode: 'text' as const, maxLength: undefined, placeholder: '' };
};

const openDatePicker = (event: React.MouseEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
  if ('showPicker' in event.currentTarget) {
    try {
      event.currentTarget.showPicker();
    } catch {
      // Ignore browsers that block programmatic picker opening.
    }
  }
};

const getDraftStorageKey = (classUser: string) => `ggss-stipend-draft:${normalize(classUser || 'default')}`;

const loadDraftFromStorage = (classUser: string): Record<string, string> | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(getDraftStorageKey(classUser));
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed).map(([key, value]) => [key, typeof value === 'string' ? value : String(value ?? '')])
    );
  } catch {
    return null;
  }
};

const saveDraftToStorage = (classUser: string, value: Record<string, string>) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(getDraftStorageKey(classUser), JSON.stringify(value));
};

const clearDraftFromStorage = (classUser: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(getDraftStorageKey(classUser));
};

export default function GgssNishtarRoadStipendPage() {
  const [authLoading, setAuthLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState(CLASS_USERNAMES[0]);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [sourceLabel, setSourceLabel] = useState('');
  const [className, setClassName] = useState('');
  const [isAdminSession, setIsAdminSession] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [recordClassFilter, setRecordClassFilter] = useState('ALL_CLASSES');
  const [classSortOrder, setClassSortOrder] = useState<'az' | 'za' | 'priority'>('az');
  const [priorityClass, setPriorityClass] = useState('');
  const [columns, setColumns] = useState<ColumnMeta[]>([]);
  const [records, setRecords] = useState<StipendRecord[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [draftStatus, setDraftStatus] = useState('');

  const [editRowId, setEditRowId] = useState('');
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [addingRecord, setAddingRecord] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingRecord, setDeletingRecord] = useState(false);
  const hasHydratedDraftRef = useRef(false);

  const classColumnKey = useMemo(() => {
    return columns.find((column) => normalize(column.label) === 'class' || normalize(column.key) === 'class')?.key || '';
  }, [columns]);

  const classOptions = useMemo(() => {
    if (!classColumnKey) {
      return availableClasses;
    }

    const fromRecords = Array.from(new Set(records.map((record) => String(record[classColumnKey] ?? '').trim()).filter(Boolean)));
    const fromApi = availableClasses.filter(Boolean);
    return Array.from(new Set([...fromApi, ...fromRecords])).sort((a, b) => a.localeCompare(b));
  }, [availableClasses, classColumnKey, records]);

  const { mainColumns, attendanceColumns } = useMemo(() => {
    const main: ColumnMeta[] = [];
    const attendance: ColumnMeta[] = [];
    for (const col of columns) {
      if (ATTENDANCE_MONTH_KEYS.has(normalize(col.key)) || ATTENDANCE_MONTH_KEYS.has(normalize(col.label))) {
        attendance.push(col);
      } else {
        main.push(col);
      }
    }
    return { mainColumns: main, attendanceColumns: attendance };
  }, [columns]);

  const filteredAndSortedRecords = useMemo(() => {
    const filtered = isAdminSession && classColumnKey && recordClassFilter !== 'ALL_CLASSES'
      ? records.filter((record) => String(record[classColumnKey] ?? '').trim() === recordClassFilter)
      : records;

    if (!classColumnKey || !isAdminSession) {
      return filtered;
    }

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      const classA = String(a[classColumnKey] ?? '').trim();
      const classB = String(b[classColumnKey] ?? '').trim();

      if (classSortOrder === 'priority' && priorityClass) {
        if (classA === priorityClass && classB !== priorityClass) return -1;
        if (classB === priorityClass && classA !== priorityClass) return 1;
      }

      const classCompare = classA.localeCompare(classB);
      if (classCompare !== 0) {
        return classSortOrder === 'za' ? -classCompare : classCompare;
      }

      return Number(a.rowId) - Number(b.rowId);
    });

    return sorted;
  }, [classColumnKey, classSortOrder, isAdminSession, priorityClass, recordClassFilter, records]);

  const showDualSerial = isAdminSession && recordClassFilter === 'ALL_CLASSES' && Boolean(classColumnKey);
  const serialColumnCount = showDualSerial ? 2 : 1;

  const serialIndexByRowId = useMemo(() => {
    const indexMap: Record<string, { overall: number; classWise: number }> = {};
    const classCounts: Record<string, number> = {};

    filteredAndSortedRecords.forEach((record, index) => {
      const classValue = classColumnKey ? String(record[classColumnKey] ?? '').trim() : 'default';
      classCounts[classValue] = (classCounts[classValue] || 0) + 1;
      indexMap[record.rowId] = {
        overall: index + 1,
        classWise: classCounts[classValue],
      };
    });

    return indexMap;
  }, [classColumnKey, filteredAndSortedRecords]);

  const loadRecords = async () => {
    try {
      setLoadingRecords(true);
      setError('');
      const response = await fetch('/api/ggss-stipend', { cache: 'no-store' });
      const data = await parseResponse(response);

      if (!response.ok || !data.success || !data.columns || !data.records) {
        throw new Error(data.message || 'Unable to load stipend records.');
      }

      setColumns(data.columns);
      setRecords(data.records);
      setSourceLabel(data.source?.sheetName || 'Students Stipend Record');
      setClassName(data.className || '');
      setIsAdminSession(Boolean(data.isAdmin));
      setAvailableClasses(data.availableClasses || []);
      setRecordClassFilter('ALL_CLASSES');
      setClassSortOrder('az');
      setPriorityClass('');

      const blankValues = Object.fromEntries(data.columns.map((column) => [column.key, '']));
      const classKey = data.columns.find(
        (column) => normalize(column.label) === 'class' || normalize(column.key) === 'class'
      )?.key;
      if (classKey) {
        blankValues[classKey] = data.isAdmin ? '' : (data.className || '');
      }
      const draftClassKey = data.className || username;
      const savedDraft = loadDraftFromStorage(draftClassKey);
      const withSaved = savedDraft
        ? { ...blankValues, ...savedDraft, ...(classKey && !Boolean(data.isAdmin) ? { [classKey]: data.className || '' } : {}) }
        : blankValues;
      setFormData(withSaved);
      hasHydratedDraftRef.current = true;
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load stipend records.');
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        setAuthLoading(true);
        const response = await fetch('/api/ggss-stipend/auth/session', { cache: 'no-store' });
        const data = await parseResponse(response);
        const isAuthed = Boolean(data.authenticated);
        setAuthenticated(isAuthed);
        if (isAuthed && data.username) {
          setUsername(data.username);
        }
        setIsAdminSession(Boolean(data.isAdmin));
      } catch {
        setAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    };

    void checkSession();
  }, []);

  useEffect(() => {
    if (!authenticated) {
      return;
    }

    void loadRecords();
  }, [authenticated]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const updateOnlineStatus = () => setIsOffline(!window.navigator.onLine);
    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    if (!authenticated || !columns.length || !hasHydratedDraftRef.current) {
      return;
    }

    const classUser = className || username;
    const timer = window.setTimeout(() => {
      saveDraftToStorage(classUser, formData);
      setDraftStatus(isOffline ? 'Draft saved offline on this device.' : 'Draft auto-saved in background.');
    }, DRAFT_SAVE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [authenticated, columns, formData, className, username, isOffline]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError('');
    setMessage('');

    if (!username.trim() || !password.trim()) {
      setLoginError('Class username and password both are required.');
      return;
    }

    try {
      setLoggingIn(true);
      const response = await fetch('/api/ggss-stipend/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await parseResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to login.');
      }

      setAuthenticated(true);
      setPassword('');
      setIsAdminSession(Boolean(data.isAdmin));
      setMessage(data.isAdmin ? 'Admin login successful. You can manage all classes.' : 'Login successful. You can now add stipend records.');
      await loadRecords();
    } catch (loginErr) {
      setLoginError(loginErr instanceof Error ? loginErr.message : 'Unable to login.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/ggss-stipend/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setAuthenticated(false);
      setClassName('');
      setIsAdminSession(false);
      setAvailableClasses([]);
      setRecordClassFilter('ALL_CLASSES');
      setClassSortOrder('az');
      setPriorityClass('');
      setColumns([]);
      setRecords([]);
      setFormData({});
      setEditRowId('');
      setEditData({});
      setDeleteRowId('');
      setDeletePassword('');
      setShowPassword(false);
      setMessage('Logged out.');
      setDraftStatus('');
      hasHydratedDraftRef.current = false;
    }
  };

  const handleFormChange = (key: string, value: string) => {
    const col = columns.find((c) => c.key === key);
    const fieldType = col ? getFieldType(col.key, col.label, classColumnKey) : 'text';
    setFormData((current) => ({
      ...current,
      [key]: sanitizeValue(value, fieldType, col?.key || key, col?.label || key),
    }));
  };

  const handleAddRecord = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      setAddingRecord(true);
      const response = await fetch('/api/ggss-stipend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formData }),
      });
      const data = await parseResponse(response);
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to add record.');
      }

      setMessage(data.message || 'Record added successfully.');
      clearDraftFromStorage(className || username);
      setDraftStatus('');
      await loadRecords();
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : 'Unable to add record.');
    } finally {
      setAddingRecord(false);
    }
  };

  const startEdit = (record: StipendRecord) => {
    setEditRowId(record.rowId);
    setEditData(Object.fromEntries(columns.map((column) => [column.key, String(record[column.key] ?? '')])));
    setMessage('');
    setError('');
  };

  const cancelEdit = () => {
    setEditRowId('');
    setEditData({});
  };

  const handleEditChange = (key: string, value: string) => {
    const col = columns.find((c) => c.key === key);
    const fieldType = col ? getFieldType(col.key, col.label, classColumnKey) : 'text';
    setEditData((current) => ({
      ...current,
      [key]: sanitizeValue(value, fieldType, col?.key || key, col?.label || key),
    }));
  };

  const saveEdit = async () => {
    if (!editRowId) {
      return;
    }

    try {
      setSavingEdit(true);
      setError('');
      setMessage('');
      const response = await fetch('/api/ggss-stipend', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowId: editRowId, data: editData }),
      });
      const data = await parseResponse(response);
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to save changes.');
      }

      setMessage(data.message || 'Record updated successfully.');
      setEditRowId('');
      setEditData({});
      await loadRecords();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save changes.');
    } finally {
      setSavingEdit(false);
    }
  };

  const requestDelete = (rowId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this student stipend record?');
    if (!confirmed) {
      return;
    }

    setDeleteRowId(rowId);
    setDeletePassword('');
    setError('');
    setMessage('');
  };

  const cancelDelete = () => {
    setDeleteRowId('');
    setDeletePassword('');
  };

  const confirmDelete = async () => {
    if (!deleteRowId) {
      return;
    }

    const trimmedPassword = deletePassword.trim();
    if (!trimmedPassword) {
      setError('Please enter password to delete this record.');
      return;
    }

    const activeUsername = username.trim();
    if (!activeUsername) {
      setError('Unable to verify user session. Please login again.');
      return;
    }

    try {
      setDeletingRecord(true);
      setError('');
      setMessage('');

      const verifyResponse = await fetch('/api/ggss-stipend/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: activeUsername, password: trimmedPassword }),
      });
      const verifyData = await parseResponse(verifyResponse);
      if (!verifyResponse.ok || !verifyData.success) {
        throw new Error('Password is incorrect. Record not deleted.');
      }

      const response = await fetch('/api/ggss-stipend', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowId: deleteRowId }),
      });
      const data = await parseResponse(response);
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to delete record.');
      }

      setMessage(data.message || 'Record deleted successfully.');
      if (editRowId === deleteRowId) {
        cancelEdit();
      }
      cancelDelete();
      await loadRecords();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete record.');
    } finally {
      setDeletingRecord(false);
    }
  };

  const buildExportRows = (input: StipendRecord[]) => {
    return input.map((record) => {
      const row: Record<string, string> = {};
      columns.forEach((column) => {
        row[column.label] = String(record[column.key] ?? '');
      });
      return row;
    });
  };

  const escapeHtml = (value: string) => value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

  const getScopeRows = (scope: 'all' | 'current') => (scope === 'all' ? records : filteredAndSortedRecords);

  const handleExportExcel = (scope: 'all' | 'current') => {
    const rows = getScopeRows(scope);
    if (!rows.length) {
      setError('No records available for Excel export.');
      return;
    }

    const exportRows = buildExportRows(rows);
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stipend');

    const dateKey = new Date().toISOString().slice(0, 10);
    const fileTag = scope === 'all' ? 'all-classes' : 'filtered';
    XLSX.writeFile(workbook, `ggss-stipend-${fileTag}-${dateKey}.xlsx`);
  };

  const handleExportPdf = (scope: 'all' | 'current') => {
    const rows = getScopeRows(scope);
    if (!rows.length) {
      setError('No records available for PDF export.');
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const title = scope === 'all' ? 'GGSS Stipend - All Classes' : 'GGSS Stipend - Current View';
    const now = new Date().toLocaleString();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFontSize(14);
    doc.text(title, 36, 36);
    doc.setFontSize(10);
    doc.text(`Generated: ${now}`, 36, 54);

    let y = 76;
    doc.setFontSize(8);
    doc.text(columns.map((column) => column.label).join(' | ').slice(0, 230), 36, y);
    y += 14;

    rows.forEach((record) => {
      const line = columns.map((column) => String(record[column.key] ?? '')).join(' | ').slice(0, 230);
      if (y > pageHeight - 26) {
        doc.addPage();
        y = 28;
      }
      doc.text(line, 36, y);
      y += 12;
    });

    const dateKey = new Date().toISOString().slice(0, 10);
    const fileTag = scope === 'all' ? 'all-classes' : 'filtered';
    doc.save(`ggss-stipend-${fileTag}-${dateKey}.pdf`);
  };

  const handlePrint = (scope: 'all' | 'current') => {
    const rows = getScopeRows(scope);
    if (!rows.length) {
      setError('No records available for print.');
      return;
    }

    const popup = window.open('', '_blank', 'noopener,noreferrer,width=1200,height=800');
    if (!popup) {
      setError('Pop-up blocked. Please allow pop-ups to print records.');
      return;
    }

    const title = scope === 'all' ? 'GGSS Stipend - All Classes' : 'GGSS Stipend - Current View';
    const headerCells = columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join('');
    const bodyRows = rows.map((record) => {
      const cells = columns.map((column) => `<td>${escapeHtml(String(record[column.key] ?? '')) || '&mdash;'}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    popup.document.write(`<!doctype html><html><head><title>${escapeHtml(title)}</title><style>
      body { font-family: Arial, sans-serif; margin: 20px; color: #0f172a; }
      h1 { margin: 0 0 8px; font-size: 20px; }
      p { margin: 0 0 16px; font-size: 12px; color: #475569; }
      table { width: 100%; border-collapse: collapse; font-size: 11px; }
      th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; white-space: nowrap; }
      thead { background: #f1f5f9; }
    </style></head><body>
      <h1>${escapeHtml(title)}</h1>
      <p>Generated: ${escapeHtml(new Date().toLocaleString())}</p>
      <table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>
      <script>window.onload = function () { window.print(); };</script>
    </body></html>`);
    popup.document.close();
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-600">Checking stipend session...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">GGSS Nishtar Road</p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Students Stipend Record 2026
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Fill, edit, and delete stipend data for your class. Records are saved in Google Sheet tab: Students Stipend Record.
              </p>
            </div>
            <Link
              href="/ggss-nishtar-road"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700"
            >
              Back to GGSS
            </Link>
          </div>
        </section>

        {!authenticated ? (
          <section className="mx-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Stipend Login</h2>
            <p className="mt-1 text-sm text-slate-600">Select class or admin username and enter password.</p>

            <form onSubmit={handleLogin} className="mt-5 space-y-4">
              <div>
                <label htmlFor="stipend-class-username" className="mb-2 block text-sm font-medium text-slate-700">
                  Username
                </label>
                <select
                  id="stipend-class-username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-cyan-500"
                >
                  {CLASS_USERNAMES.map((classUser) => (
                    <option key={classUser} value={classUser}>
                      {classUser}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="stipend-password" className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="stipend-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter password"
                    className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 pr-12 text-sm outline-none transition focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 transition hover:text-cyan-700"
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                        <path d="M3 3l18 18" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9.88 5.09A10.94 10.94 0 0 1 12 4.91c5.05 0 9.27 3.11 10.5 7.09a11.49 11.49 0 0 1-3.04 4.95" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M6.61 6.61A11.52 11.52 0 0 0 1.5 12c1.23 3.98 5.45 7.09 10.5 7.09a10.9 10.9 0 0 0 4.29-.87" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                        <path d="M1.5 12C2.73 8.02 6.95 4.91 12 4.91S21.27 8.02 22.5 12C21.27 15.98 17.05 19.09 12 19.09S2.73 15.98 1.5 12Z" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {loginError ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{loginError}</p> : null}

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loggingIn ? 'Signing in...' : 'Login'}
              </button>
            </form>
          </section>
        ) : (
          <>
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
                    {isAdminSession ? 'Active Admin Session' : 'Active Class Session'}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">{className || username}</h2>
                  <p className="mt-1 text-xs text-slate-500">Sheet Tab: {sourceLabel || 'Students Stipend Record'}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-700"
                >
                  Logout
                </button>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">Add Student Record</h3>
              <p className="mt-1 text-sm text-slate-600">
                {isAdminSession
                  ? 'Admin can add records for any class by filling the class field.'
                  : 'Fill student stipend details and save to your class sheet rows.'}
              </p>
              {isOffline ? (
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
                    Offline mode: draft stays on this device.
                  </span>
                  {draftStatus ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{draftStatus}</span>
                  ) : null}
                </div>
              ) : null}

              <form onSubmit={handleAddRecord} className="mt-4 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {mainColumns.map((column) => {
                    const isClassField = column.key === classColumnKey && !isAdminSession;
                    const fieldType = getFieldType(column.key, column.label, classColumnKey);
                    const attrs = getFieldAttrs(fieldType, column.key, column.label);
                    const fieldId = `add-${column.key}`;
                    return (
                      <div key={column.key}>
                        <label htmlFor={fieldId} className="mb-1 block text-xs font-semibold uppercase text-slate-600">{column.label}</label>
                        <input
                          id={fieldId}
                          type={attrs.type}
                          inputMode={attrs.inputMode}
                          maxLength={attrs.maxLength}
                          placeholder={attrs.placeholder}
                          value={String(formData[column.key] ?? '')}
                          onChange={(event) => handleFormChange(column.key, event.target.value)}
                          onClick={fieldType === 'date' ? openDatePicker : undefined}
                          onFocus={fieldType === 'date' ? openDatePicker : undefined}
                          readOnly={isClassField}
                          className={`min-h-[40px] w-full rounded-lg border px-3 py-2 text-sm outline-none transition ${isClassField ? 'border-slate-200 bg-slate-100 text-slate-700' : 'border-slate-300 bg-white text-slate-800 focus:border-cyan-500'}`}
                        />
                      </div>
                    );
                  })}
                </div>

                {attendanceColumns.length > 0 && (
                  <div>
                    <p className="mb-3 border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                      Attendance — 2025–2026
                    </p>
                    <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
                      {attendanceColumns.map((column) => {
                        const attrs = getFieldAttrs('month', column.key, column.label);
                        const fieldId = `add-${column.key}`;
                        return (
                          <div key={column.key}>
                            <label htmlFor={fieldId} className="mb-1 block text-xs font-semibold uppercase text-slate-600">{column.label}</label>
                            <input
                              id={fieldId}
                              type="text"
                              inputMode={attrs.inputMode}
                              maxLength={attrs.maxLength}
                              placeholder={attrs.placeholder}
                              value={String(formData[column.key] ?? '')}
                              onChange={(event) => handleFormChange(column.key, event.target.value)}
                              className="min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-cyan-500"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={addingRecord || loadingRecords}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addingRecord ? 'Saving...' : 'Add Record'}
                </button>
              </form>

              {message ? <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
              {error ? <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-slate-900">Class Records</h3>
                <p className="text-xs font-semibold text-slate-500">Total: {filteredAndSortedRecords.length}</p>
              </div>

              {isAdminSession ? (
                <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-3">
                  <div>
                    <label htmlFor="admin-class-filter" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                      View Class
                    </label>
                    <select
                      id="admin-class-filter"
                      value={recordClassFilter}
                      onChange={(event) => setRecordClassFilter(event.target.value)}
                      className="min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-cyan-500"
                    >
                      <option value="ALL_CLASSES">All Classes (Merged)</option>
                      {classOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="admin-class-sort" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Sort Classes
                    </label>
                    <select
                      id="admin-class-sort"
                      value={classSortOrder}
                      onChange={(event) => setClassSortOrder(event.target.value as 'az' | 'za' | 'priority')}
                      className="min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-cyan-500"
                    >
                      <option value="az">Class A to Z</option>
                      <option value="za">Class Z to A</option>
                      <option value="priority">Priority Class First</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="admin-class-priority" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                      Priority Class
                    </label>
                    <select
                      id="admin-class-priority"
                      value={priorityClass}
                      onChange={(event) => setPriorityClass(event.target.value)}
                      disabled={classSortOrder !== 'priority'}
                      className="min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-100"
                    >
                      <option value="">Choose Class</option>
                      {classOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div className="lg:col-span-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => handlePrint('all')} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700">Print All</button>
                      <button type="button" onClick={() => handlePrint('current')} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700">Print Current</button>
                      <button type="button" onClick={() => handleExportPdf('all')} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700">PDF All</button>
                      <button type="button" onClick={() => handleExportPdf('current')} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700">PDF Current</button>
                      <button type="button" onClick={() => handleExportExcel('all')} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700">Excel All</button>
                      <button type="button" onClick={() => handleExportExcel('current')} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700">Excel Current</button>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="whitespace-nowrap border-b border-slate-200 px-3 py-2 text-xs font-bold uppercase text-slate-600">#</th>
                      {showDualSerial ? (
                        <th className="whitespace-nowrap border-b border-slate-200 px-3 py-2 text-xs font-bold uppercase text-slate-600">Class #</th>
                      ) : null}
                      {columns.map((column) => (
                        <th key={column.key} className="whitespace-nowrap border-b border-slate-200 px-3 py-2 text-xs font-bold uppercase text-slate-600">
                          {column.label}
                        </th>
                      ))}
                      <th className="border-b border-slate-200 px-3 py-2 text-xs font-bold uppercase text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingRecords ? (
                      <tr>
                        <td colSpan={columns.length + serialColumnCount + 1} className="px-3 py-4 text-center text-slate-500">
                          Loading class records...
                        </td>
                      </tr>
                    ) : filteredAndSortedRecords.length === 0 ? (
                      <tr>
                        <td colSpan={columns.length + serialColumnCount + 1} className="px-3 py-4 text-center text-slate-500">
                          No stipend records yet.
                        </td>
                      </tr>
                    ) : (
                      filteredAndSortedRecords.map((record) => {
                        const serialInfo = serialIndexByRowId[record.rowId] || { overall: 0, classWise: 0 };
                        return (
                        <tr key={record.rowId} className="border-b border-slate-100">
                          <td className="whitespace-nowrap px-3 py-2 text-slate-700">{serialInfo.overall}</td>
                          {showDualSerial ? (
                            <td className="whitespace-nowrap px-3 py-2 text-slate-700">{serialInfo.classWise}</td>
                          ) : null}
                          {columns.map((column) => (
                            <td key={`${record.rowId}-${column.key}`} className="whitespace-nowrap px-3 py-2 text-slate-700">
                              {String(record[column.key] ?? '') || '—'}
                            </td>
                          ))}
                          <td className="px-3 py-2">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(record)}
                                className="rounded-lg border border-cyan-300 px-2.5 py-1 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => requestDelete(record.rowId)}
                                className="rounded-lg border border-rose-300 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {editRowId ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-slate-900">Edit Stipend Record</h3>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {mainColumns.map((column) => {
                    const isClassField = column.key === classColumnKey && !isAdminSession;
                    const fieldType = getFieldType(column.key, column.label, classColumnKey);
                    const attrs = getFieldAttrs(fieldType, column.key, column.label);
                    const fieldId = `edit-${column.key}`;
                    return (
                      <div key={`edit-${column.key}`}>
                        <label htmlFor={fieldId} className="mb-1 block text-xs font-semibold uppercase text-slate-600">{column.label}</label>
                        <input
                          id={fieldId}
                          type={attrs.type}
                          inputMode={attrs.inputMode}
                          maxLength={attrs.maxLength}
                          placeholder={attrs.placeholder}
                          value={String(editData[column.key] ?? '')}
                          onChange={(event) => handleEditChange(column.key, event.target.value)}
                          onClick={fieldType === 'date' ? openDatePicker : undefined}
                          onFocus={fieldType === 'date' ? openDatePicker : undefined}
                          readOnly={isClassField}
                          className={`min-h-[40px] w-full rounded-lg border px-3 py-2 text-sm outline-none transition ${isClassField ? 'border-slate-200 bg-slate-100 text-slate-700' : 'border-slate-300 bg-white text-slate-800 focus:border-cyan-500'}`}
                        />
                      </div>
                    );
                  })}
                </div>

                {attendanceColumns.length > 0 && (
                  <div>
                    <p className="mb-3 border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                      Attendance — 2025–2026
                    </p>
                    <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
                      {attendanceColumns.map((column) => {
                        const attrs = getFieldAttrs('month', column.key, column.label);
                        const fieldId = `edit-${column.key}`;
                        return (
                          <div key={`edit-att-${column.key}`}>
                            <label htmlFor={fieldId} className="mb-1 block text-xs font-semibold uppercase text-slate-600">{column.label}</label>
                            <input
                              id={fieldId}
                              type="text"
                              inputMode={attrs.inputMode}
                              maxLength={attrs.maxLength}
                              placeholder={attrs.placeholder}
                              value={String(editData[column.key] ?? '')}
                              onChange={(event) => handleEditChange(column.key, event.target.value)}
                              className="min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-cyan-500"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void saveEdit()}
                  disabled={savingEdit}
                  className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={savingEdit}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {deleteRowId ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-900">Confirm Delete</h3>
              <p className="mt-1 text-sm text-slate-600">Enter your password to delete this record.</p>

              <div className="mt-4">
                <label htmlFor="delete-password" className="mb-1 block text-xs font-semibold uppercase text-slate-600">Password</label>
                <input
                  id="delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={(event) => setDeletePassword(event.target.value)}
                  className="min-h-[42px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-cyan-500"
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void confirmDelete()}
                  disabled={deletingRecord}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingRecord ? 'Deleting...' : 'Delete Record'}
                </button>
                <button
                  type="button"
                  onClick={cancelDelete}
                  disabled={deletingRecord}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
