'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import * as XLSX from 'xlsx';

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

type AdminRecord = Record<string, string> & {
  rowId: string;
};

type AdminApiResponse = {
  success: boolean;
  authenticated?: boolean;
  columns?: ColumnMeta[];
  records?: AdminRecord[];
  items?: DirectoryItem[];
  message?: string;
  source?: {
    sheetName: string;
  };
};

const parseAdminResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    const raw = await response.text();
    throw new Error(raw.slice(0, 200) || 'Server returned a non-JSON response.');
  }

  return (await response.json()) as AdminApiResponse;
};

export default function GgssAdminPage() {
  const [authLoading, setAuthLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [columns, setColumns] = useState<ColumnMeta[]>([]);
  const [records, setRecords] = useState<AdminRecord[]>([]);
  const [items, setItems] = useState<DirectoryItem[]>([]);
  const [sourceLabel, setSourceLabel] = useState('');
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState('');
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [activeView, setActiveView] = useState<'individual' | 'export' | 'table' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRowId, setSelectedRowId] = useState('');
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);
  const [exportMessage, setExportMessage] = useState('');

  const loadAdminData = async () => {
    try {
      setDataLoading(true);
      setDataError('');
      const response = await fetch('/api/staff-records/admin', { cache: 'no-store' });
      const data = await parseAdminResponse(response);

      if (!response.ok || !data.success || !data.columns || !data.records || !data.items) {
        throw new Error(data.message || 'Unable to load admin data.');
      }

      setColumns(data.columns);
      setRecords(data.records);
      setItems(data.items);
      setSourceLabel(data.source?.sheetName || 'GGSS staff sheet');
      setSelectedColumnKeys(data.columns.map((column) => column.key));
      setSelectedRowId((current) => current || data.items?.[0]?.rowId || '');
      setHasLoadedData(true);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Unable to load admin data.');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        setAuthLoading(true);
        const response = await fetch('/api/staff-records/admin/auth/session', { cache: 'no-store' });
        const data = await parseAdminResponse(response);
        const isAuthed = Boolean(data.authenticated);
        setAuthenticated(isAuthed);
      } catch {
        setAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    };

    void checkSession();
  }, []);

  useEffect(() => {
    if (!authenticated || hasLoadedData || dataLoading) {
      return;
    }

    void loadAdminData();
  }, [authenticated, hasLoadedData, dataLoading]);

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return items;
    }

    return items.filter((item) => {
      return [item.name, item.sno, item.rowId].some((value) => value.toLowerCase().includes(query));
    });
  }, [items, searchTerm]);

  const selectedRecord = useMemo(() => {
    if (!selectedRowId) {
      return null;
    }

    return records.find((record) => record.rowId === selectedRowId) || null;
  }, [records, selectedRowId]);

  const exportableColumns = useMemo(() => {
    return columns.filter((column) => selectedColumnKeys.includes(column.key));
  }, [columns, selectedColumnKeys]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError('');
    if (!loginPassword.trim()) {
      setLoginError('Admin password is required.');
      return;
    }

    try {
      setIsLoggingIn(true);
      const response = await fetch('/api/staff-records/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: loginPassword }),
      });
      const data = await parseAdminResponse(response);
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Admin login failed.');
      }

      setAuthenticated(true);
      setLoginPassword('');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Admin login failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/staff-records/admin/auth/logout', { method: 'POST' });
    setAuthenticated(false);
    setColumns([]);
    setRecords([]);
    setItems([]);
    setHasLoadedData(false);
    setActiveView(null);
    setSelectedRowId('');
    setSelectedColumnKeys([]);
    setSearchTerm('');
    setExportMessage('');
  };

  const openView = async (view: 'individual' | 'export' | 'table') => {
    setActiveView(view);
    setExportMessage('');

    if (!hasLoadedData && !dataLoading) {
      await loadAdminData();
    }
  };

  const toggleColumn = (key: string) => {
    setSelectedColumnKeys((current) => {
      if (current.includes(key)) {
        return current.filter((item) => item !== key);
      }
      return [...current, key];
    });
  };

  const exportSelectedColumns = () => {
    setExportMessage('');
    if (!exportableColumns.length) {
      setExportMessage('Select at least one column for export.');
      return;
    }

    const exportRows = records.map((record) => {
      return Object.fromEntries(
        exportableColumns.map((column) => [column.label, String(record[column.key] ?? '')])
      );
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'GGSS Staff');
    const dateKey = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `ggss-staff-export-${dateKey}.xlsx`);
    setExportMessage(`Excel export ready with ${exportableColumns.length} selected columns.`);
  };

  const printSelectedRecord = () => {
    if (!selectedRecord) {
      return;
    }

    const selectedItem = items.find((item) => item.rowId === selectedRowId) || null;
    const genderValue = String(selectedRecord.gender ?? '').trim().toLowerCase();
    const titlePrefix = genderValue === 'male' ? 'Mr.' : genderValue === 'female' ? 'Mrs.' : '';
    const displayName = selectedItem?.name?.trim() || String(selectedRecord.name ?? '').trim() || 'Staff Record';
    const designation = String(
      selectedRecord.designation ??
      selectedRecord.designaton ??
      selectedRecord.desgination ??
      selectedRecord.post ??
      ''
    )
      .trim();

    const headingBase = [titlePrefix, displayName].filter(Boolean).join(' ');
    const headingText = designation ? `${headingBase} (${designation})` : headingBase;
    const codeOnly = '408070227';

    const websiteLink = `${window.location.origin}/ggss-nishtar-road`;
    const printedAt = new Date().toLocaleString();
    const printWindow = window.open('', '_blank', 'width=960,height=720');
    if (!printWindow) {
      return;
    }

    const fieldsHtml = columns
      .filter((column) => !['remarks', 'remark'].includes(column.key.toLowerCase()))
      .map((column) => {
        const value = String(selectedRecord[column.key] ?? '').trim() || '-';
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
          <title></title>
          <style>
            @page {
              size: A4;
              margin: 12mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              font-family: Arial, Helvetica, sans-serif;
              color: #0f172a;
              background: #ffffff;
            }

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

            .photo-slot-wrap {
              display: flex;
              justify-content: flex-end;
              padding-right: 6mm;
            }

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

            .half-line {
              width: 50%;
              height: 2px;
              background: #0891b2;
              margin: 4px auto 0;
              border-radius: 999px;
            }

            h1 {
              margin: 10px 0 0;
              font-size: 22px;
              line-height: 1.15;
            }

            .meta {
              margin: 0;
              font-size: 11px;
              color: #475569;
            }

            .summary {
              margin-top: 12px;
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: 8px;
            }

            .summary-card,
            .field-card {
              border: 1px solid #e2e8f0;
              border-radius: 10px;
              padding: 8px 10px;
              background: #f8fafc;
            }

            .summary-label,
            .field-label {
              font-size: 10px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.08em;
            }

            .summary-value {
              margin-top: 5px;
              font-size: 13px;
              font-weight: 700;
              color: #0f172a;
            }

            .section-title {
              margin: 4px 0 8px;
              font-size: 13px;
              font-weight: 700;
              color: #0f172a;
              border-bottom: 1px solid #cbd5e1;
              padding-bottom: 6px;
            }

            .fields {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 8px;
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

            .footer a {
              color: #0e7490;
              text-decoration: none;
            }

            @media print {
              .sheet {
                border: none;
                border-radius: 0;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="topbar">
              <div>
                <div class="eyebrow">GGSS Nishtar Road</div>
                <div class="sub-meta">${codeOnly}</div>
                <div class="name-meta">${headingText}</div>
              </div>
              <div class="profile-heading">PROFILE</div>
              <div class="photo-slot-wrap">
                <div class="photo-slot">Photo</div>
              </div>
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

  if (authLoading) {
    return <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-700">Checking admin session...</main>;
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#cffafe_0%,#f8fafc_45%,#ecfeff_100%)] px-4 py-10 sm:px-6 lg:px-10">
        <section className="mx-auto w-full max-w-xl rounded-3xl border border-cyan-100 bg-white/95 p-8 shadow-xl shadow-cyan-100/80">
          <p className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
            GGSS Admin Access
          </p>
          <h1 className="mt-4 text-3xl font-black text-slate-900">Secure Admin Login</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Admin dashboard se aap poora Google Sheet data dekh sakte hain, individual staff detail inspect kar sakte hain, aur selected columns ko Excel mein export kar sakte hain.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label htmlFor="ggss-admin-password" className="mb-2 block text-sm font-medium text-slate-700">
                Admin Password
              </label>
              <div className="relative">
                <input
                  id="ggss-admin-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  placeholder="Enter admin password"
                  className="min-h-[50px] w-full rounded-2xl border border-slate-300 px-4 py-3 pr-12 text-sm outline-none transition focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((current) => !current)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-slate-300 p-1.5 text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700"
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <IoEyeOffOutline size={16} /> : <IoEyeOutline size={16} />}
                </button>
              </div>
            </div>

            {loginError ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{loginError}</p> : null}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isLoggingIn}
                className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoggingIn ? 'Logging in...' : 'Login as Admin'}
              </button>
              <Link href="/ggss-nishtar-road" className="text-sm font-semibold text-slate-600 underline-offset-4 hover:text-cyan-700 hover:underline">
                Back to portal
              </Link>
            </div>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-xl shadow-cyan-100/60">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
                GGSS Admin Dashboard
              </p>
              <h1 className="mt-4 text-3xl font-black text-slate-900 sm:text-4xl">Staff Sheet Control Center</h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Yahan admin poori staff sheet ko table form mein dekh sakta hai, kisi bhi individual staff record ko inspect kar sakta hai, aur selected columns ka Excel export nikaal sakta hai.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void loadAdminData()}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700"
              >
                Refresh Data
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Active Sheet:</span> {sourceLabel || 'Load on demand'}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Total Staff Rows:</span> {hasLoadedData ? records.length : 'Not loaded'}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Selected Export Columns:</span> {hasLoadedData ? exportableColumns.length : 'Not loaded'}
            </div>
          </div>
        </section>

        {dataError ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{dataError}</p> : null}
        {dataLoading ? <p className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">Loading admin data...</p> : null}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-slate-900">Admin Actions</h2>
            <p className="text-sm text-slate-600">
              Jo kaam chahiye sirf usi button par click karein. Data panels default par hidden rahenge.
            </p>

            <div className="grid gap-3 md:grid-cols-3">
              <button
                type="button"
                onClick={() => void openView('individual')}
                className={`rounded-2xl border px-5 py-4 text-left transition ${activeView === 'individual' ? 'border-cyan-500 bg-cyan-50 text-cyan-800' : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-cyan-300'}`}
              >
                <p className="text-sm font-bold">Individual Staff View</p>
                <p className="mt-1 text-xs text-slate-500">Search and inspect one staff record</p>
              </button>

              <button
                type="button"
                onClick={() => void openView('table')}
                className={`rounded-2xl border px-5 py-4 text-left transition ${activeView === 'table' ? 'border-cyan-500 bg-cyan-50 text-cyan-800' : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-cyan-300'}`}
              >
                <p className="text-sm font-bold">View Full Staff Table</p>
                <p className="mt-1 text-xs text-slate-500">Open the complete Google Sheet style table</p>
              </button>

              <button
                type="button"
                onClick={() => void openView('export')}
                className={`rounded-2xl border px-5 py-4 text-left transition ${activeView === 'export' ? 'border-cyan-500 bg-cyan-50 text-cyan-800' : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-cyan-300'}`}
              >
                <p className="text-sm font-bold">Export Selected Columns</p>
                <p className="mt-1 text-xs text-slate-500">Choose only needed columns and download Excel</p>
              </button>
            </div>

            {activeView ? (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveView(null)}
                  className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700"
                >
                  Close Current Panel
                </button>
              </div>
            ) : null}
          </div>
        </section>

        {activeView === 'individual' ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold text-slate-900">Individual Staff View</h2>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search staff by name or S.No"
                  className="min-h-[46px] w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 sm:w-72"
                />
                <button
                  type="button"
                  onClick={printSelectedRecord}
                  disabled={!selectedRecord}
                  className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Print / PDF A4
                </button>
              </div>
            </div>

            <div className="mt-4 max-w-xl">
              <label htmlFor="admin-staff-select" className="mb-2 block text-sm font-medium text-slate-700">Select Staff</label>
              <select
                id="admin-staff-select"
                value={selectedRowId}
                onChange={(event) => setSelectedRowId(event.target.value)}
                className="min-h-[48px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500"
              >
                <option value="">Choose staff member</option>
                {filteredItems.map((item) => (
                  <option key={item.rowId} value={item.rowId}>
                    {item.sno ? `${item.sno} - ` : ''}{item.name}
                  </option>
                ))}
              </select>
            </div>

            {!selectedRecord ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
                Select a staff member to view individual details.
              </div>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {columns.map((column) => (
                  <div key={column.key} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{column.label}</p>
                    <p className="mt-1 break-words text-sm font-medium text-slate-800">{String(selectedRecord[column.key] ?? '—') || '—'}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {activeView === 'export' ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Excel Export</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Sirf woh columns select karein jo export chahiye hon. Downloaded file mein tamam staff rows hongi.
                </p>
              </div>
              <button
                type="button"
                onClick={exportSelectedColumns}
                className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Export Selected Columns
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {columns.map((column) => (
                <label key={column.key} className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedColumnKeys.includes(column.key)}
                    onChange={() => toggleColumn(column.key)}
                    className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>{column.label}</span>
                </label>
              ))}
            </div>

            {exportMessage ? <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{exportMessage}</p> : null}
          </section>
        ) : null}

        {activeView === 'table' ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold text-slate-900">All Staff Data</h2>
              <p className="text-sm text-slate-500">Google Sheet style full table view</p>
            </div>

            <div className="mt-4 overflow-auto rounded-2xl border border-slate-200">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-slate-100 text-left text-slate-700">
                  <tr>
                    {columns.map((column) => (
                      <th key={column.key} className="whitespace-nowrap border-b border-slate-200 px-4 py-3 font-semibold">
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, rowIndex) => (
                    <tr key={`row-${rowIndex + 1}`} className="odd:bg-white even:bg-slate-50">
                      {columns.map((column) => (
                        <td key={`${rowIndex + 1}-${column.key}`} className="whitespace-nowrap border-b border-slate-100 px-4 py-3 text-slate-700">
                          {String(record[column.key] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
