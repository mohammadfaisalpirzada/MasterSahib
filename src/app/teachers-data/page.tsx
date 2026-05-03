'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import NextImage from 'next/image';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';

type ColumnMeta = {
  key: string;
  label: string;
  editable: boolean;
};

type DirectoryItem = {
  rowId: string;
  sno: string;
  name: string;
};

type StaffApiResponse = {
  success: boolean;
  items?: DirectoryItem[];
  record?: Record<string, string>;
  columns?: ColumnMeta[];
  verifyToken?: string;
  message?: string;
  source?: {
    sheetName: string;
  };
};

const MAX_PICTURE_UPLOAD_BYTES = 1024 * 1024; // 1MB
const MAX_PICTURE_CELL_CHARS = 49000; // Keep below Google Sheets single-cell limit.
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const QUICK_LOGIN_KEY = 'ggss_staff_quick_login';

const parseJsonResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    const rawText = await response.text();
    throw new Error(rawText.slice(0, 120) || 'Server returned a non-JSON response.');
  }

  return (await response.json()) as StaffApiResponse;
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Unable to read selected image.'));
    reader.readAsDataURL(file);
  });

const loadImageElement = (dataUrl: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Invalid image file.'));
    img.src = dataUrl;
  });

const compressImageForSheet = async (file: File): Promise<string> => {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Only JPG, PNG or WebP images are allowed.');
  }

  if (file.size > MAX_PICTURE_UPLOAD_BYTES) {
    throw new Error('Image must be 1MB or smaller.');
  }

  const originalDataUrl = await readFileAsDataUrl(file);
  const image = await loadImageElement(originalDataUrl);
  let scale = Math.min(1, 900 / Math.max(image.width, image.height));
  let quality = 0.86;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Unable to process image in browser.');
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
    const base64 = jpegDataUrl.split(',')[1] || '';

    if (base64.length <= MAX_PICTURE_CELL_CHARS) {
      return base64;
    }

    if (quality > 0.46) {
      quality -= 0.08;
    } else {
      scale *= 0.82;
      quality = 0.86;
    }
  }

  throw new Error('Image is still too large for Google Sheet cell. Use a smaller photo.');
};

const toFileSlug = (value: string) => {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'staff-record';
};

export default function StaffRecordPage() {
  const [directoryItems, setDirectoryItems] = useState<DirectoryItem[]>([]);
  const [columns, setColumns] = useState<ColumnMeta[]>([]);
  const [record, setRecord] = useState<Record<string, string>>({});
  const [verifyToken, setVerifyToken] = useState('');
  const [sourceLabel, setSourceLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [selectedRowId, setSelectedRowId] = useState('');
  const [pidInput, setPidInput] = useState('');
  const [verified, setVerified] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editPidInput, setEditPidInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saveToastVisible, setSaveToastVisible] = useState(false);
  const [saveToastText, setSaveToastText] = useState('');
  const [saveToastTone, setSaveToastTone] = useState<'success' | 'error'>('success');
  const [showVerifyPid, setShowVerifyPid] = useState(false);
  const [showEditPid, setShowEditPid] = useState(false);
  const [pendingPicture, setPendingPicture] = useState<string | null>(null);
  const [pendingPictureMessage, setPendingPictureMessage] = useState('');
  const [pictureInputKey, setPictureInputKey] = useState(0);
  const [quickLoginApplied, setQuickLoginApplied] = useState(false);
  const quickLoginRunRef = useRef(false);
  const [fromStaffPortal, setFromStaffPortal] = useState(false);

  const selectedDirectoryItem = useMemo(
    () => directoryItems.find((item) => item.rowId === selectedRowId) || null,
    [directoryItems, selectedRowId]
  );

  const editableColumns = useMemo(() => columns.filter((column) => column.editable), [columns]);
  const readonlyColumns = useMemo(() => columns.filter((column) => !column.editable), [columns]);

  const showSaveToast = (text: string, tone: 'success' | 'error' = 'success') => {
    setSaveToastText(text);
    setSaveToastTone(tone);
    setSaveToastVisible(true);
  };

  useEffect(() => {
    if (!saveToastVisible) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSaveToastVisible(false);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [saveToastVisible, saveToastText]);

  const loadDirectory = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const response = await fetch('/api/staff-records?mode=directory', { cache: 'no-store' });
      const data = await parseJsonResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to load staff directory.');
      }

      setDirectoryItems(data.items || []);
      setSourceLabel(data.source?.sheetName || 'GGSS staff sheet');
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load staff directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDirectory();
  }, []);

  const resetRecordState = () => {
    setVerified(false);
    setEditMode(false);
    setColumns([]);
    setRecord({});
    setFormData({});
    setVerifyToken('');
    setMessage('');
    setEditMessage('');
    setPidInput('');
    setEditPidInput('');
  };

  const verifyRecord = async (pid: string, enableEdit = false, rowIdOverride?: string) => {
    const targetRowId = rowIdOverride || selectedRowId;

    if (!targetRowId) {
      const errorMessage = 'Please select a staff member first.';
      if (enableEdit) {
        setEditMessage(errorMessage);
      } else {
        setMessage(errorMessage);
      }
      return;
    }

    try {
      if (enableEdit) {
        setEditMessage('');
      } else {
        setMessage('');
      }

      const response = await fetch('/api/staff-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rowId: targetRowId,
          pid,
        }),
      });

      const data = await parseJsonResponse(response);
      if (!response.ok || !data.success || !data.record || !data.columns || !data.verifyToken) {
        throw new Error(data.message || 'Verification failed.');
      }

      setColumns(data.columns);
      setRecord(data.record);
      setFormData(data.record);
      setVerifyToken(data.verifyToken);
      setVerified(true);

      if (enableEdit) {
        setEditMode(true);
        setEditMessage('Edit mode enabled.');
      } else {
        setMessage('Record verified successfully.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Verification failed.';
      if (enableEdit) {
        setEditMode(false);
        setEditMessage(errorMessage);
      } else {
        setVerified(false);
        setMessage(errorMessage);
      }
    }
  };

  const handleVerify = async () => {
    await verifyRecord(pidInput.trim(), false);
  };

  const handleEnableEdit = async () => {
    await verifyRecord(editPidInput.trim(), true);
  };

  const handleVerifyPidKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    void handleVerify();
  };

  const handleEditPidKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    void handleEnableEdit();
  };

  const handleFieldChange = (key: string, value: string) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    if (!verifyToken) {
      setEditMessage('Verification expired. Please verify again.');
      return;
    }

    try {
      setSaving(true);
      setEditMessage('');

      const updates = Object.fromEntries(
        editableColumns.map((column) => [column.key, formData[column.key] || ''])
      );

      // Include pending picture change
      if (pendingPicture !== null) {
        updates.picture = pendingPicture;
      }

      const response = await fetch('/api/staff-records', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verifyToken,
          updates,
        }),
      });

      const data = await parseJsonResponse(response);
      if (!response.ok || !data.success || !data.record || !data.columns) {
        throw new Error(data.message || 'Unable to save staff data.');
      }

      setColumns(data.columns);
      setRecord(data.record);
      setFormData(data.record);
      setEditMode(false);
      setEditPidInput('');
      setEditMessage('');
      setMessage('Record verified successfully.');
      setPendingPicture(null);
      setPendingPictureMessage('');
      setPictureInputKey((k) => k + 1);
      showSaveToast('Data saved', 'success');
      await loadDirectory();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to save staff data.';
      setEditMessage(errorMessage);
      showSaveToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(record);
    setEditMode(false);
    setEditPidInput('');
    setEditMessage('Editing canceled.');
    setPendingPicture(null);
    setPendingPictureMessage('');
    setPictureInputKey((k) => k + 1);
  };

  const handlePictureFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setPendingPictureMessage('Compressing image...');
      const compressedBase64 = await compressImageForSheet(file);
      setPendingPicture(compressedBase64);
      setPendingPictureMessage('Photo ready — click Save Changes.');
    } catch (error) {
      setPendingPictureMessage(error instanceof Error ? error.message : 'Unable to process image.');
    }
  };

  const handleDeletePicture = () => {
    setPendingPicture('');
    setPendingPictureMessage('Photo will be removed when you save.');
  };

  const handleBackToSearch = () => {
    setVerified(false);
    setSelectedRowId('');
    resetRecordState();
    setPendingPicture(null);
    setPendingPictureMessage('');
    setPictureInputKey((k) => k + 1);
  };

  const forceStaffLogout = useCallback((feedback?: string) => {
    setVerified(false);
    setSelectedRowId('');
    resetRecordState();
    setPendingPicture(null);
    setPendingPictureMessage('');
    setPictureInputKey((k) => k + 1);
    if (feedback) {
      setMessage(feedback);
    }
  }, []);

  useEffect(() => {
    const markSessionClosed = () => {
      try {
        sessionStorage.setItem('ggss_staff_portal_left_page', '1');
      } catch {
        // Ignore storage issues; state reset still occurs on pageshow if supported.
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      // When page is restored from browser cache, clear previous verified state.
      if (!event.persisted) {
        return;
      }

      forceStaffLogout('Session ended. Please verify again.');
    };

    window.addEventListener('beforeunload', markSessionClosed);
    window.addEventListener('pagehide', markSessionClosed);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      window.removeEventListener('beforeunload', markSessionClosed);
      window.removeEventListener('pagehide', markSessionClosed);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [forceStaffLogout]);

  const handlePrintRecord = () => {
    if (!verified || !columns.length) {
      return;
    }

    const genderValue = String(formData.gender ?? record.gender ?? '').trim().toLowerCase();
    const titlePrefix = genderValue === 'male' ? 'Mr.' : genderValue === 'female' ? 'Mrs.' : '';
    const displayName = selectedDirectoryItem?.name?.trim() || String(formData.name ?? record.name ?? '').trim() || 'Staff Record';
    const designation = String(
      formData.designation ??
      formData.designaton ??
      formData.desgination ??
      formData.post ??
      record.designation ??
      record.designaton ??
      record.desgination ??
      record.post ??
      ''
    )
      .trim();

    const headingBase = [titlePrefix, displayName].filter(Boolean).join(' ');
    const headingText = designation ? `${headingBase} (${designation})` : headingBase;
    const pdfTitle = `ggss-${toFileSlug(displayName)}-profile`;
    const websiteLink = `${window.location.origin}/ggss-nishtar-road`;
    const printedAt = new Date().toLocaleString();

    const printWindow = window.open('', '_blank', 'width=960,height=720');
    if (!printWindow) {
      return;
    }

    const fieldsHtml = columns
      .filter((column) => !['remarks', 'remark'].includes(column.key.toLowerCase()))
      .map((column) => {
        const value = String(formData[column.key] ?? '').trim() || '-';
        return `
          <div class="field-card">
            <div class="field-label">${column.label}</div>
            <div class="field-value">${value}</div>
          </div>
        `;
      })
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${pdfTitle}</title>
          <style>
            @page { size: A4; margin: 12mm; }
            * { box-sizing: border-box; }
            body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: #0f172a; background: #fff; }
            .sheet {
              width: 100%;
              max-width: 190mm;
              margin: 0 auto;
              padding: 6mm;
              border: 1px solid #cbd5e1;
              border-radius: 12px;
            }
            .topbar {
              display: grid;
              grid-template-columns: 1fr auto 1fr;
              align-items: center;
              gap: 12px;
              padding-bottom: 6px;
            }
            .eyebrow {
              display: block;
              color: #0e7490;
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 0.12em;
              text-transform: uppercase;
            }
            .sub-meta {
              margin-top: 4px;
              font-size: 12px;
              font-weight: 700;
              color: #0f172a;
              letter-spacing: 0.08em;
            }
            .name-meta {
              margin-top: 2px;
              font-size: 14px;
              font-weight: 700;
              color: #0e7490;
              letter-spacing: 0.02em;
            }
            .profile-heading {
              text-align: center;
              font-size: 16px;
              font-weight: 700;
              color: #0f172a;
              letter-spacing: 0.08em;
            }
            .photo-slot-wrap { display: flex; justify-content: flex-end; padding-right: 6mm; }
            .photo-slot {
              width: 25.4mm;
              height: 25.4mm;
              border: 1px dashed #94a3b8;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.08em;
            }
            .half-line { width: 50%; height: 2px; background: #0891b2; margin: 4px auto 0; border-radius: 999px; }
            .section-title {
              margin: 4px 0 8px;
              font-size: 13px;
              font-weight: 700;
              color: #0f172a;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 6px;
            }
            .fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
            .field-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 10px; background: #f8fafc; }
            .field-label {
              font-size: 10px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.08em;
            }
            .field-value {
              margin-top: 5px;
              font-size: 12px;
              line-height: 1.35;
              color: #0f172a;
              word-break: break-word;
            }
            .footer {
              margin-top: 12px;
              font-size: 10px;
              color: #64748b;
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 12px;
            }
            .footer a { color: #0e7490; text-decoration: none; }
            @media print {
              .sheet { border: none; border-radius: 0; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="topbar">
              <div>
                <div class="eyebrow">GGSS Nishtar Road</div>
                <div class="sub-meta">408070227</div>
                <div class="name-meta">${headingText}</div>
              </div>
              <div class="profile-heading">PROFILE</div>
              <div class="photo-slot-wrap">${record.picture ? `<img src="data:image/jpeg;base64,${record.picture}" alt="Photo" class="photo-slot" style="border-radius: 8px; object-fit: contain; border: 1px solid #e2e8f0;" />` : '<div class="photo-slot">Photo</div>'}</div>
            </div>
            <div class="half-line"></div>

            <div class="section-title">Staff Details</div>
            <div class="fields">${fieldsHtml}</div>

            <div class="footer">
              <span>Website: <a href="${websiteLink}">${websiteLink}</a></span>
              <span>Printed: ${printedAt}</span>
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  useEffect(() => {
    if (quickLoginApplied || loading || verified || directoryItems.length === 0 || quickLoginRunRef.current) {
      return;
    }

    quickLoginRunRef.current = true;

    let preferredName = '';
    let pidFromQuickLogin = '';

    try {
      const params = new URLSearchParams(window.location.search);
      preferredName = (params.get('name') || '').trim();

      const quickRaw = sessionStorage.getItem(QUICK_LOGIN_KEY);
      if (quickRaw) {
        const parsed = JSON.parse(quickRaw) as { name?: string; pid?: string; issuedAt?: number };
        const isFresh = typeof parsed.issuedAt === 'number' && Date.now() - parsed.issuedAt < 2 * 60 * 1000;
        if (isFresh && parsed.name && parsed.pid) {
          preferredName = String(parsed.name).trim() || preferredName;
          pidFromQuickLogin = String(parsed.pid).trim();
        }
        sessionStorage.removeItem(QUICK_LOGIN_KEY);
      }
    } catch {
      // Ignore malformed storage/query and continue with manual flow.
    }

    const params2 = new URLSearchParams(window.location.search);
    if (params2.get('from') === 'staff-portal') setFromStaffPortal(true);

    if (!preferredName) {
      setQuickLoginApplied(true);
      return;
    }

    const matchedItem = directoryItems.find(
      (item) => item.name.trim().toLowerCase() === preferredName.toLowerCase(),
    );

    if (!matchedItem) {
      setQuickLoginApplied(true);
      return;
    }

    setSelectedRowId(matchedItem.rowId);

    if (pidFromQuickLogin) {
      setPidInput(pidFromQuickLogin);
      void verifyRecord(pidFromQuickLogin, false, matchedItem.rowId);
    }

    setQuickLoginApplied(true);
  }, [directoryItems, loading, quickLoginApplied, verified]);

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }} className="text-slate-900">
      {/* ── GGSS Header ── */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a6b 0%, #0f2347 100%)', borderBottom: '4px solid #c8a96e' }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <NextImage src="/images/ggssnishtar_mastersahib.png" alt="GGSS Logo" width={44} height={44} className="object-contain" style={{ width: '44px', height: '44px' }} />
            <div>
              <p style={{ color: '#c8a96e', fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em' }} className="uppercase">GGSS Nishtar Road, Hyderabad</p>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: '16px', lineHeight: 1.2 }}>Staff Data Portal</p>
            </div>
          </div>
          {fromStaffPortal ? (
            <a href="/ggss-nishtar-road/staff-portal" style={{ color: 'rgba(200,169,110,0.8)', fontSize: '12px', fontWeight: 600 }} className="transition hover:text-[#c8a96e]">← Back to Portal</a>
          ) : null}
        </div>
      </div>

      {/* ── Toast ── */}
      <div
        className={`pointer-events-none fixed right-4 top-4 z-50 transition-all duration-500 ease-out ${
          saveToastVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
        }`}
        aria-live="polite"
      >
        <div
          className={`rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${
            saveToastTone === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {saveToastText}
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-4 px-3 py-4 sm:space-y-6 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
        {/* Header card */}
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #dce3ec', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }} className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p style={{ color: '#1a3a6b', fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em' }} className="uppercase">Staff Management Portal</p>
              <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl md:text-3xl" style={{ color: '#0f172a' }}>GGSS Nishtar Road Staff Data</h1>
              <p className="mt-1 text-xs text-slate-500">408070227</p>
            </div>
            {verified ? (
              <button
                type="button"
                onClick={fromStaffPortal ? () => { window.location.href = '/ggss-nishtar-road/staff-portal'; } : handleBackToSearch}
                style={{ border: '1px solid #dce3ec', color: '#1a3a6b', borderRadius: '10px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, background: '#fff', whiteSpace: 'nowrap' }}
                className="shrink-0 transition hover:bg-slate-50"
              >
                {fromStaffPortal ? '← Back to Portal' : '← Change Staff'}
              </button>
            ) : null}
          </div>
        </div>

        {loading ? <p className="rounded-xl bg-white p-4 text-sm text-slate-600">Loading secure staff directory...</p> : null}
        {loadError ? <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{loadError}</p> : null}

        {!loading && !loadError ? (
          <>
            {/* ── BEFORE VERIFICATION: Search panel ── */}
            {!verified ? (
              fromStaffPortal && !quickLoginApplied ? (
                <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 text-center text-sm text-slate-500">
                  Authenticating, please wait...
                </div>
              ) : (
              <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:rounded-3xl sm:p-6">
                <h2 className="text-lg font-semibold sm:text-xl">Find Staff Record</h2>
                <div className="mt-4 space-y-4 sm:mt-5">
                  <div>
                    <label htmlFor="staff-name-select" className="mb-2 block text-sm font-medium text-slate-700">Select Staff Name</label>
                    <select
                      id="staff-name-select"
                      title="Select Staff Name"
                      value={selectedRowId}
                      onChange={(event) => {
                        setSelectedRowId(event.target.value);
                        resetRecordState();
                      }}
                      className="min-h-[48px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                    >
                      <option value="">Choose staff member</option>
                      {directoryItems.map((item) => (
                        <option key={item.rowId} value={item.rowId}>
                          {item.sno ? `${item.sno} - ` : ''}{item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="verify-pid" className="mb-2 block text-sm font-medium text-slate-700">Enter PID</label>
                    <div className="relative">
                      <input
                        id="verify-pid"
                        type={showVerifyPid ? 'text' : 'password'}
                        name="record-verification-code"
                        autoComplete="off"
                        spellCheck={false}
                        data-lpignore="true"
                        data-1p-ignore="true"
                        data-form-type="other"
                        inputMode="numeric"
                        value={pidInput}
                        onChange={(event) => setPidInput(event.target.value)}
                        onKeyDown={handleVerifyPidKeyDown}
                        placeholder="Enter your PID"
                        className="min-h-[48px] w-full rounded-2xl border border-slate-300 px-4 py-3 pr-12 text-sm outline-none transition focus:border-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowVerifyPid((current) => !current)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-slate-300 p-1.5 text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700"
                        aria-label={showVerifyPid ? 'Hide PID' : 'Show PID'}
                      >
                        {showVerifyPid ? <IoEyeOffOutline size={16} /> : <IoEyeOutline size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => void handleVerify()}
                    className="min-h-[48px] w-full rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:from-slate-800 hover:to-slate-600"
                  >
                    Verify Record
                  </button>

                  {selectedDirectoryItem ? (
                    <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-800">
                      Selected: <span className="font-semibold">{selectedDirectoryItem.name}</span>
                    </div>
                  ) : null}

                  {message ? (
                    <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
                  ) : null}
                </div>
              </section>
              )
            ) : null}

            {/* ── AFTER VERIFICATION: Full staff record ── */}
            {verified ? (
              <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-3xl">
                {/* Top bar */}
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{selectedDirectoryItem?.name || record.name || ''}</p>
                    <p className="text-xs text-slate-500">{sourceLabel}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrintRecord}
                      className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700"
                    >
                      Print / PDF A4
                    </button>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Verified</span>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  {/* ── PHOTO (1×1, centered) ── */}
                  {(() => {
                    const displayPic =
                      pendingPicture !== null
                        ? pendingPicture
                        : (record.picture || '');

                    return (
                      <div className="mb-6 flex flex-col items-center gap-3">
                        {/* passport-size square */}
                        <div className="relative h-32 w-32 overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-100 shadow-sm">
                          {displayPic ? (
                            <img
                              src={`data:image/jpeg;base64,${displayPic}`}
                              alt="Staff photo"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-center text-xs font-medium uppercase tracking-wide text-slate-400">
                              No<br/>Photo
                            </div>
                          )}
                        </div>

                        {/* Photo controls — only in edit mode */}
                        {editMode ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex gap-2">
                              {displayPic ? (
                                <>
                                  <label
                                    htmlFor="staff-photo-input"
                                    className="cursor-pointer rounded-xl border border-cyan-300 bg-cyan-50 px-4 py-2 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-100"
                                  >
                                    Replace Photo
                                  </label>
                                  <button
                                    type="button"
                                    onClick={handleDeletePicture}
                                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                                  >
                                    Delete Photo
                                  </button>
                                </>
                              ) : (
                                <label
                                  htmlFor="staff-photo-input"
                                  className="cursor-pointer rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                                >
                                  + Add Photo
                                </label>
                              )}
                            </div>
                            <input
                              key={pictureInputKey}
                              id="staff-photo-input"
                              type="file"
                              accept="image/*"
                              onChange={handlePictureFileChange}
                              className="hidden"
                            />
                            {pendingPictureMessage ? (
                              <p className={`text-xs ${pendingPictureMessage.includes('ready') || pendingPictureMessage.includes('will') ? 'text-amber-600' : 'text-rose-600'}`}>
                                {pendingPictureMessage}
                              </p>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    );
                  })()}

                  {/* ── FIELDS GRID ── */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {columns.map((column) => {
                      const value = String(formData[column.key] ?? '');
                      const isReadOnly = !editMode || !column.editable;
                      const fieldInputId = `staff-field-${column.key}`;

                      return (
                        <div key={column.key} className="rounded-2xl border border-slate-200 p-3 sm:p-4">
                          <label htmlFor={fieldInputId} className="mb-2 block text-sm font-medium text-slate-700">
                            {column.label}
                            {!column.editable ? (
                              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">locked</span>
                            ) : null}
                          </label>

                          {isReadOnly ? (
                            <div className="break-words rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-800 sm:px-4">{value || '—'}</div>
                          ) : (
                            <input
                              id={fieldInputId}
                              type="text"
                              value={value}
                              onChange={(event) => handleFieldChange(column.key, event.target.value)}
                              title={column.label}
                              placeholder={column.label}
                              className="min-h-[48px] w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none transition focus:border-slate-500 sm:px-4"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* ── EDIT SECTION ── */}
                  <div className="mt-6 rounded-2xl border border-slate-200 p-3 sm:p-4">
                    <h3 className="text-sm font-semibold text-slate-800">Edit Access</h3>
                    <p className="mt-1 text-sm text-slate-500">To edit the record, enter PID again. Locked columns stay protected.</p>

                    {!editMode ? (
                      <div className="mt-4 flex flex-col gap-3">
                        <label htmlFor="edit-pid" className="text-sm font-medium text-slate-700">Re-enter PID</label>
                        <div className="relative">
                          <input
                            id="edit-pid"
                            type={showEditPid ? 'text' : 'password'}
                            name="record-edit-verification-code"
                            autoComplete="off"
                            spellCheck={false}
                            data-lpignore="true"
                            data-1p-ignore="true"
                            data-form-type="other"
                            inputMode="numeric"
                            value={editPidInput}
                            onChange={(event) => setEditPidInput(event.target.value)}
                            onKeyDown={handleEditPidKeyDown}
                            placeholder="Re-enter PID to edit"
                            className="min-h-[48px] w-full rounded-2xl border border-slate-300 px-4 py-3 pr-12 text-sm outline-none transition focus:border-slate-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowEditPid((current) => !current)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-slate-300 p-1.5 text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700"
                            aria-label={showEditPid ? 'Hide PID' : 'Show PID'}
                          >
                            {showEditPid ? <IoEyeOffOutline size={16} /> : <IoEyeOutline size={16} />}
                          </button>
                        </div>
                        <button
                          onClick={() => void handleEnableEdit()}
                          className="min-h-[48px] w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:from-amber-600 hover:to-orange-600 sm:w-auto"
                        >
                          Enable Edit
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <button
                          onClick={() => void handleSave()}
                          disabled={saving}
                          className="min-h-[48px] w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:from-emerald-700 hover:to-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={saving}
                          className="min-h-[48px] w-full rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {editMessage ? (
                      <div className={`mt-4 rounded-2xl px-4 py-3 text-sm ${editMode || editMessage.toLowerCase().includes('enabled') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {editMessage}
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>
            ) : null}
          </>
        ) : null}
      </div>

      {/* ── Footer ── */}
      <div style={{ borderTop: '1px solid #dce3ec', marginTop: '32px', padding: '20px 24px', textAlign: 'center' }}>
        <p style={{ color: '#94a3b8', fontSize: '12px' }}>SEMIS Code: 408070227 · GGSS Nishtar Road, Hyderabad</p>
      </div>
    </div>
  );
}
