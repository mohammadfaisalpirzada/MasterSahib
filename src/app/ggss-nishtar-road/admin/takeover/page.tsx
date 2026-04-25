'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import jsPDF from 'jspdf';

type WorkingStatus = 'Working' | 'Not Working' | 'Needs Repair';

type TakeoverItem = {
  id: string;
  serialNo: number;
  area: string;
  object: string;
  quantity: number | '';
  status: WorkingStatus;
  comments: string;
};

type TakeoverMeta = {
  date: string;
  day: string;
  schoolName: string;
  time: string;
  handoverBy: string;
  handoverTo: string;
  remarks: string;
};

type AddObjectInput = {
  object: string;
  quantity: number | '';
  status: WorkingStatus;
  comments: string;
};

const STATUS_OPTIONS: WorkingStatus[] = ['Working', 'Not Working', 'Needs Repair'];

const STATUS_COLORS: Record<WorkingStatus, string> = {
  Working: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Not Working': 'bg-rose-50 text-rose-700 border-rose-200',
  'Needs Repair': 'bg-amber-50 text-amber-700 border-amber-200',
};

const EMPTY_ITEM = (): Omit<TakeoverItem, 'id' | 'serialNo'> => ({
  area: '',
  object: '',
  quantity: '',
  status: 'Working',
  comments: '',
});

const EMPTY_OBJECT_INPUT = (): AddObjectInput => ({
  object: '',
  quantity: '',
  status: 'Working',
  comments: '',
});

const generateId = () => Math.random().toString(36).slice(2, 11);

const parseAdminResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    const raw = await response.text();
    throw new Error(raw.slice(0, 200) || 'Server returned a non-JSON response.');
  }
  return (await response.json()) as { success: boolean; authenticated?: boolean; message?: string };
};

export default function TakeoverPage() {
  const [authLoading, setAuthLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [meta, setMeta] = useState<TakeoverMeta>({
    date: new Date().toISOString().slice(0, 10),
    day: new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()),
    schoolName: 'GGSS Nishtar Road',
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    handoverBy: '',
    handoverTo: '',
    remarks: '',
  });

  const [items, setItems] = useState<TakeoverItem[]>([
    { id: generateId(), serialNo: 1, ...EMPTY_ITEM() },
  ]);
  const [areaInput, setAreaInput] = useState('');
  const [objectInputs, setObjectInputs] = useState<AddObjectInput[]>([EMPTY_OBJECT_INPUT()]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<TakeoverItem, 'id' | 'serialNo'>>(EMPTY_ITEM());
  const [previewOpen, setPreviewOpen] = useState(false);
  const [message, setMessage] = useState('');

  // Sessions state
  const [savedSessions, setSavedSessions] = useState<string[]>([]);
  const [activeSessionTab, setActiveSessionTab] = useState<string | null>(null);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [savingSession, setSavingSession] = useState(false);
  const [sessionMessage, setSessionMessage] = useState('');

  const printRef = useRef<HTMLDivElement>(null);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/ggss-takeover');
      const data = (await res.json()) as { success: boolean; sessions?: string[] };
      if (data.success && data.sessions) setSavedSessions(data.sessions);
    } catch { /* ignore */ }
  };

  const loadSession = async (tabName: string) => {
    setSavingSession(true);
    setSessionMessage('');
    try {
      const res = await fetch(`/api/ggss-takeover?tab=${encodeURIComponent(tabName)}`);
      const data = (await res.json()) as {
        success: boolean;
        session?: {
          meta: TakeoverMeta;
          items: Array<{ serialNo: number; area: string; object: string; quantity: string; status: string; comments: string }>;
        };
        message?: string;
      };
      if (!data.success || !data.session) throw new Error(data.message ?? 'Failed to load session.');
      setMeta(data.session.meta);
      setItems(
        data.session.items.map((item) => ({
          id: generateId(),
          serialNo: item.serialNo,
          area: item.area,
          object: item.object,
          quantity: item.quantity === '' ? '' : Number(item.quantity),
          status: (['Working', 'Not Working', 'Needs Repair'].includes(item.status)
            ? item.status
            : 'Working') as WorkingStatus,
          comments: item.comments,
        }))
      );
      setActiveSessionTab(tabName);
      setSessionsOpen(false);
      setSessionMessage(`Loaded: ${tabName}`);
    } catch (err) {
      setSessionMessage(err instanceof Error ? err.message : 'Failed to load session.');
    } finally {
      setSavingSession(false);
    }
  };

  const saveSession = async (update: boolean) => {
    setSavingSession(true);
    setSessionMessage('');
    try {
      const body = {
        meta,
        items: items.map((item) => ({
          serialNo: item.serialNo,
          area: item.area,
          object: item.object,
          quantity: item.quantity === '' ? '' : String(item.quantity),
          status: item.status,
          comments: item.comments,
        })),
        ...(update && activeSessionTab ? { tabName: activeSessionTab } : {}),
      };
      const method = update ? 'PATCH' : 'POST';
      const res = await fetch('/api/ggss-takeover', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { success: boolean; tabName?: string; message?: string };
      if (!data.success) throw new Error(data.message ?? 'Failed to save session.');
      if (!update) {
        setActiveSessionTab(data.tabName ?? null);
        void fetchSessions();
      }
      setSessionMessage(data.message ?? 'Saved!');
    } catch (err) {
      setSessionMessage(err instanceof Error ? err.message : 'Failed to save session.');
    } finally {
      setSavingSession(false);
    }
  };

  const startNewSession = () => {
    setMeta({
      date: new Date().toISOString().slice(0, 10),
      day: new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()),
      schoolName: 'GGSS Nishtar Road',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      handoverBy: '',
      handoverTo: '',
      remarks: '',
    });
    setItems([{ id: generateId(), serialNo: 1, ...EMPTY_ITEM() }]);
    setAreaInput('');
    setObjectInputs([EMPTY_OBJECT_INPUT()]);
    setActiveSessionTab(null);
    setSessionMessage('');
    setSessionsOpen(false);
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/staff-records/admin/auth/session', { cache: 'no-store' });
        const data = await parseAdminResponse(response);
        setAuthenticated(Boolean(data.authenticated));
      } catch {
        setAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    };
    void checkSession();
  }, []);

  useEffect(() => {
    if (authenticated) void fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  // Sync day when date changes
  useEffect(() => {
    if (!meta.date) return;
    const d = new Date(meta.date + 'T00:00:00');
    setMeta((current) => ({
      ...current,
      day: new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(d),
    }));
  }, [meta.date]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError('');
    if (!loginPassword.trim()) {
      setLoginError('Password is required.');
      return;
    }
    try {
      setIsLoggingIn(true);
      const response = await fetch('/api/staff-records/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: loginPassword }),
      });
      const data = await parseAdminResponse(response);
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Incorrect password.');
      }
      setAuthenticated(true);
      setLoginPassword('');
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Unable to login.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/staff-records/admin/auth/logout', { method: 'POST' });
    setAuthenticated(false);
  };

  const handleMetaChange = (key: keyof TakeoverMeta, value: string) => {
    setMeta((current) => ({ ...current, [key]: value }));
  };

  const handleObjectInputChange = (
    index: number,
    key: keyof AddObjectInput,
    value: string,
  ) => {
    setObjectInputs((current) =>
      current.map((entry, i) => {
        if (i !== index) return entry;
        if (key === 'quantity') {
          return { ...entry, quantity: value === '' ? '' : Number(value) };
        }
        if (key === 'status') {
          return { ...entry, status: value as WorkingStatus };
        }
        return { ...entry, [key]: value };
      })
    );
  };

  const addMoreObjectInput = () => {
    setObjectInputs((current) => [...current, EMPTY_OBJECT_INPUT()]);
  };

  const addItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!areaInput.trim()) {
      setMessage('Area is required.');
      return;
    }
    const validObjectEntries = objectInputs.filter((entry) => entry.object.trim());

    if (validObjectEntries.length === 0) {
      setMessage('Please enter at least one object.');
      return;
    }

    const nextSerial = items.length > 0 ? Math.max(...items.map((item) => item.serialNo)) + 1 : 1;

    setItems((current) => [
      ...current,
      ...validObjectEntries.map((entry, index) => ({
        id: generateId(),
        serialNo: nextSerial + index,
        area: areaInput.trim(),
        object: entry.object.trim(),
        quantity: entry.quantity,
        status: entry.status,
        comments: entry.comments,
      })),
    ]);
    setAreaInput('');
    setObjectInputs([EMPTY_OBJECT_INPUT()]);
    setMessage('');
  };

  const startEdit = (item: TakeoverItem) => {
    setEditId(item.id);
    setEditForm({ area: item.area, object: item.object, quantity: item.quantity, status: item.status, comments: item.comments });
  };

  const saveEdit = () => {
    if (!editId) return;
    setItems((current) =>
      current.map((item) => (item.id === editId ? { ...item, ...editForm } : item))
    );
    setEditId(null);
    setEditForm(EMPTY_ITEM());
  };

  const deleteItem = (id: string) => {
    setItems((current) => {
      const filtered = current.filter((item) => item.id !== id);
      return filtered.map((item, index) => ({ ...item, serialNo: index + 1 }));
    });
  };

  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 14;
    const marginRight = 14;
    const contentWidth = pageWidth - marginLeft - marginRight;
    let y = 14;

    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('School Takeover Inventory', pageWidth / 2, y, { align: 'center' });
    y += 7;

    // Meta
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`School: ${meta.schoolName}`, marginLeft, y);
    y += 5;
    doc.text(`Date: ${meta.date}   Day: ${meta.day}   Time: ${meta.time}`, marginLeft, y);
    y += 5;
    doc.text(`Handover By: ${meta.handoverBy || '—'}   Handover To: ${meta.handoverTo || '—'}`, marginLeft, y);
    y += 5;
    if (meta.remarks) {
      doc.text(`Remarks: ${meta.remarks}`, marginLeft, y);
      y += 5;
    }
    y += 3;

    // Table column config: [label, widthFraction]
    const cols: [string, number][] = [
      ['S#', 0.06],
      ['Area', 0.18],
      ['Object', 0.22],
      ['Qty', 0.07],
      ['Status', 0.16],
      ['Comments', 0.31],
    ];
    const colWidths = cols.map(([, fraction]) => fraction * contentWidth);
    const rowHeight = 7;
    const headerHeight = 8;

    // Draw header
    doc.setFillColor(15, 118, 110);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    let x = marginLeft;
    cols.forEach(([label], idx) => {
      doc.rect(x, y, colWidths[idx], headerHeight, 'F');
      doc.text(label, x + 2, y + 5.5);
      x += colWidths[idx];
    });
    y += headerHeight;

    // Draw rows
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    items.forEach((item, rowIndex) => {
      const isEven = rowIndex % 2 === 0;
      doc.setFillColor(isEven ? 255 : 245, isEven ? 255 : 245, isEven ? 255 : 245);
      doc.setTextColor(30, 30, 30);
      x = marginLeft;
      const cells = [
        String(item.serialNo),
        item.area,
        item.object,
        item.quantity === '' ? '—' : String(item.quantity),
        item.status,
        item.comments || '—',
      ];
      cells.forEach((cell, idx) => {
        doc.rect(x, y, colWidths[idx], rowHeight, 'F');
        doc.setDrawColor(200, 200, 200);
        doc.rect(x, y, colWidths[idx], rowHeight, 'S');
        const maxChars = Math.floor(colWidths[idx] / 2);
        const truncated = cell.length > maxChars ? cell.slice(0, maxChars - 1) + '…' : cell;
        doc.text(truncated, x + 2, y + 4.8);
        x += colWidths[idx];
      });
      y += rowHeight;

      // New page if needed
      if (y > 265 && rowIndex < items.length - 1) {
        doc.addPage();
        y = 14;
      }
    });

    // Signature row
    y += 16;
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(9);
    doc.line(marginLeft, y, marginLeft + 60, y);
    doc.line(pageWidth - marginRight - 60, y, pageWidth - marginRight, y);
    y += 4;
    doc.text('Signature (Handover By)', marginLeft, y);
    doc.text(`Signature (Handover To)`, pageWidth - marginRight, y, { align: 'right' });
    if (meta.handoverBy) {
      doc.setFont('helvetica', 'bold');
      doc.text(meta.handoverBy, marginLeft, y + 4);
    }
    if (meta.handoverTo) {
      doc.setFont('helvetica', 'bold');
      doc.text(meta.handoverTo, pageWidth - marginRight, y + 4, { align: 'right' });
    }

    doc.save(`takeover-inventory-${meta.date}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-8">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-500">Checking admin session...</p>
        </div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">GGSS Nishtar Road — Admin</p>
          <h1 className="mt-2 text-2xl font-black text-slate-900">Takeover Inventory</h1>
          <p className="mt-1 text-sm text-slate-500">Admin access only. Enter password to continue.</p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label htmlFor="takeover-admin-pw" className="mb-1 block text-xs font-semibold uppercase text-slate-600">Admin Password</label>
              <div className="relative">
                <input
                  id="takeover-admin-pw"
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  placeholder="Enter password"
                  className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 pr-12 text-sm outline-none transition focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((current) => !current)}
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition hover:text-teal-700"
                >
                  {showLoginPassword ? (
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
              disabled={isLoggingIn}
              className="w-full rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="mt-4">
            <Link href="/ggss-nishtar-road/admin" className="text-xs text-slate-500 transition hover:text-teal-700">
              ← Back to Admin
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #takeover-print-area, #takeover-print-area * { visibility: visible; }
          #takeover-print-area { position: fixed; inset: 0; padding: 20mm; background: white; }
          .no-print { display: none !important; }
        }
        .takeover-a4-preview {
          min-height: 297mm;
          padding: 16mm 20mm;
          font-family: Arial, sans-serif;
          font-size: 11px;
          color: #111;
        }
      `}</style>

      <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">

          {/* Header */}
          <section className="no-print rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">GGSS Nishtar Road — Admin</p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">School Takeover Inventory</h1>
                {activeSessionTab ? (
                  <p className="mt-1 text-xs font-semibold text-teal-700">Session: {activeSessionTab}</p>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">Record all items being handed over to the new administration.</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {activeSessionTab ? (
                  <button
                    type="button"
                    onClick={() => void saveSession(true)}
                    disabled={savingSession}
                    className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60"
                  >
                    {savingSession ? 'Saving…' : 'Update Session'}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => void saveSession(false)}
                  disabled={savingSession}
                  className="rounded-xl border border-teal-500 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-100 disabled:opacity-60"
                >
                  {savingSession ? 'Saving…' : 'Save to Sheets'}
                </button>
                <button
                  type="button"
                  onClick={startNewSession}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700"
                >
                  New Session
                </button>
                <button
                  type="button"
                  onClick={() => { setSessionsOpen((prev) => !prev); void fetchSessions(); }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700"
                >
                  Sessions {savedSessions.length > 0 ? `(${savedSessions.length})` : ''}
                </button>
                <Link href="/ggss-nishtar-road/admin" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700">
                  ← Admin
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </section>

          {/* Session message */}
          {sessionMessage ? (
            <div className={`no-print rounded-2xl border px-4 py-3 text-sm font-medium ${sessionMessage.startsWith('Loaded') || sessionMessage.startsWith('Saved') ? 'border-teal-200 bg-teal-50 text-teal-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
              {sessionMessage}
            </div>
          ) : null}

          {/* Sessions panel */}
          {sessionsOpen ? (
            <section className="no-print rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-bold text-slate-800">Saved Sessions</h2>
                <button type="button" onClick={() => setSessionsOpen(false)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400">
                  Close
                </button>
              </div>
              {savedSessions.length === 0 ? (
                <p className="mt-3 text-sm text-slate-400">No saved sessions found. Save a session first.</p>
              ) : (
                <ul className="mt-3 divide-y divide-slate-100">
                  {savedSessions.map((tab) => (
                    <li key={tab} className="flex items-center justify-between gap-3 py-2.5">
                      <span className={`text-sm font-medium ${tab === activeSessionTab ? 'text-teal-700' : 'text-slate-700'}`}>
                        {tab} {tab === activeSessionTab ? '(active)' : ''}
                      </span>
                      <button
                        type="button"
                        onClick={() => void loadSession(tab)}
                        disabled={savingSession}
                        className="shrink-0 rounded-xl bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60"
                      >
                        Load
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : null}

          {/* Event Details */}
          <section className="no-print rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-800">Takeover Details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="tk-school" className="mb-1 block text-xs font-semibold uppercase text-slate-600">School Name</label>
                <input id="tk-school" type="text" value={meta.schoolName} onChange={(e) => handleMetaChange('schoolName', e.target.value)}
                  className="min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500" />
              </div>
              <div>
                <label htmlFor="tk-date" className="mb-1 block text-xs font-semibold uppercase text-slate-600">Date</label>
                <input id="tk-date" type="date" value={meta.date} onChange={(e) => handleMetaChange('date', e.target.value)}
                  className="min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
                  onClick={(e) => { if ('showPicker' in e.currentTarget) { try { e.currentTarget.showPicker(); } catch { /* ignore */ } } }} />
              </div>
              <div>
                <label htmlFor="tk-day" className="mb-1 block text-xs font-semibold uppercase text-slate-600">Day</label>
                <input id="tk-day" type="text" value={meta.day} readOnly
                  className="min-h-[40px] w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 outline-none" />
              </div>
              <div>
                <label htmlFor="tk-time" className="mb-1 block text-xs font-semibold uppercase text-slate-600">Time</label>
                <input id="tk-time" type="time" value={meta.time} onChange={(e) => handleMetaChange('time', e.target.value)}
                  className="min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500" />
              </div>
              <div>
                <label htmlFor="tk-handover-by" className="mb-1 block text-xs font-semibold uppercase text-slate-600">Handover By</label>
                <input id="tk-handover-by" type="text" value={meta.handoverBy} onChange={(e) => handleMetaChange('handoverBy', e.target.value)}
                  placeholder="Name / Designation" className="min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500" />
              </div>
              <div>
                <label htmlFor="tk-handover-to" className="mb-1 block text-xs font-semibold uppercase text-slate-600">Handover To</label>
                <input id="tk-handover-to" type="text" value={meta.handoverTo} onChange={(e) => handleMetaChange('handoverTo', e.target.value)}
                  placeholder="Name / Designation" className="min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500" />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <label htmlFor="tk-remarks" className="mb-1 block text-xs font-semibold uppercase text-slate-600">General Remarks (Optional)</label>
                <textarea id="tk-remarks" value={meta.remarks} onChange={(e) => handleMetaChange('remarks', e.target.value)}
                  rows={2} placeholder="Any general remarks about this takeover..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500 resize-none" />
              </div>
            </div>
          </section>

          {/* Add Item Form */}
          <section className="no-print rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-800">Add Item to List</h2>
            {message ? <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{message}</p> : null}
            <form onSubmit={addItem} className="mt-4 space-y-4">
              <div>
                <label htmlFor="add-area" className="mb-1 block text-xs font-semibold uppercase text-slate-600">Area <span className="text-rose-500">*</span></label>
                <input id="add-area" type="text" value={areaInput} onChange={(e) => setAreaInput(e.target.value)}
                  placeholder="e.g. Classroom 5A, Library..." className="min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500" />
              </div>
              {objectInputs.map((entry, index) => (
                <div key={`object-entry-${index}`} className="rounded-2xl border border-slate-200 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Object Entry {index + 1}</p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label htmlFor={`add-object-${index}`} className="mb-1 block text-xs font-semibold uppercase text-slate-600">Object <span className="text-rose-500">*</span></label>
                      <input
                        id={`add-object-${index}`}
                        type="text"
                        value={entry.object}
                        onChange={(e) => handleObjectInputChange(index, 'object', e.target.value)}
                        placeholder="e.g. Desk, Fan, Projector"
                        className="min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label htmlFor={`add-qty-${index}`} className="mb-1 block text-xs font-semibold uppercase text-slate-600">Quantity</label>
                      <input
                        id={`add-qty-${index}`}
                        type="number"
                        min={0}
                        value={entry.quantity}
                        onChange={(e) => handleObjectInputChange(index, 'quantity', e.target.value)}
                        placeholder="0"
                        className="min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label htmlFor={`add-status-${index}`} className="mb-1 block text-xs font-semibold uppercase text-slate-600">Status</label>
                      <select
                        id={`add-status-${index}`}
                        value={entry.status}
                        onChange={(e) => handleObjectInputChange(index, 'status', e.target.value)}
                        className="min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
                      >
                        {STATUS_OPTIONS.map((statusOption) => <option key={statusOption} value={statusOption}>{statusOption}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`add-comments-${index}`} className="mb-1 block text-xs font-semibold uppercase text-slate-600">Remarks (Optional)</label>
                      <input
                        id={`add-comments-${index}`}
                        type="text"
                        value={entry.comments}
                        onChange={(e) => handleObjectInputChange(index, 'comments', e.target.value)}
                        placeholder="Any note"
                        className="min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addMoreObjectInput}
                className="text-sm font-semibold text-teal-700 underline underline-offset-2 transition hover:text-teal-800"
              >
                + Add more object in the same area
              </button>

              <div className="flex items-end justify-end">
                <button type="submit"
                  className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800">
                  + Add Item(s)
                </button>
              </div>
            </form>
          </section>

          {/* Items Table */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="no-print flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-bold text-slate-800">Inventory List <span className="ml-2 text-sm font-normal text-slate-500">({items.length} item{items.length !== 1 ? 's' : ''})</span></h2>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setPreviewOpen(true)}
                  className="rounded-xl border border-teal-300 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-100">
                  Preview A4
                </button>
                <button type="button" onClick={downloadPDF}
                  className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800">
                  Download PDF
                </button>
                <button type="button" onClick={handlePrint}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700">
                  Print
                </button>
              </div>
            </div>

            {/* Print-visible header */}
            <div id="takeover-print-area" ref={printRef}>
              <div className="hidden print:block mb-4">
                <h1 className="text-center text-xl font-bold">School Takeover Inventory</h1>
                <p className="text-center text-sm">{meta.schoolName} &nbsp;|&nbsp; {meta.date} ({meta.day}) &nbsp;|&nbsp; {meta.time}</p>
                <p className="text-center text-sm">Handover By: {meta.handoverBy || '—'} &nbsp;|&nbsp; Handover To: {meta.handoverTo || '—'}</p>
                {meta.remarks ? <p className="text-center text-xs mt-1 text-slate-600">Remarks: {meta.remarks}</p> : null}
              </div>

              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-teal-700">
                    <tr>
                      {['S#', 'Area', 'Object', 'Qty', 'Status', 'Comments', 'Actions'].map((header) => (
                        <th key={header}
                          className={`whitespace-nowrap border-b border-teal-600 px-3 py-2.5 text-xs font-bold uppercase text-white ${header === 'Actions' ? 'no-print' : ''}`}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3 py-6 text-center text-sm text-slate-400">No items added yet. Use the form above to add items.</td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="whitespace-nowrap px-3 py-2 font-bold text-slate-700">{item.serialNo}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-slate-700">{item.area}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-slate-700">{item.object}</td>
                          <td className="whitespace-nowrap px-3 py-2 text-slate-700">{item.quantity === '' ? '—' : item.quantity}</td>
                          <td className="whitespace-nowrap px-3 py-2">
                            <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[item.status]}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-slate-600 max-w-[200px] truncate">{item.comments || '—'}</td>
                          <td className="no-print whitespace-nowrap px-3 py-2">
                            <div className="flex gap-1.5">
                              <button type="button" onClick={() => startEdit(item)}
                                className="rounded-lg border border-cyan-300 px-2.5 py-1 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-50">Edit</button>
                              <button type="button" onClick={() => deleteItem(item.id)}
                                className="rounded-lg border border-rose-300 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-50">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Signature row for print */}
              <div className="hidden print:flex mt-16 justify-between px-4">
                <div className="text-center text-xs">
                  <div className="mb-1 border-b border-slate-700 pb-1 w-48">&nbsp;</div>
                  <p>Signature (Handover By)</p>
                  <p className="font-semibold">{meta.handoverBy || '_______________'}</p>
                </div>
                <div className="text-center text-xs">
                  <div className="mb-1 border-b border-slate-700 pb-1 w-48">&nbsp;</div>
                  <p>Signature (Handover To)</p>
                  <p className="font-semibold">{meta.handoverTo || '_______________'}</p>
                </div>
              </div>

              <div className="no-print mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
                {activeSessionTab ? (
                  <button
                    type="button"
                    onClick={() => void saveSession(true)}
                    disabled={savingSession}
                    className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60"
                  >
                    {savingSession ? 'Saving...' : 'Update Session'}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => void saveSession(false)}
                  disabled={savingSession}
                  className="rounded-xl border border-teal-500 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-100 disabled:opacity-60"
                >
                  {savingSession ? 'Saving...' : 'Save to Sheets'}
                </button>
                <button type="button" onClick={() => setPreviewOpen(true)}
                  className="rounded-xl border border-teal-300 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-100">
                  Preview A4
                </button>
                <button type="button" onClick={handlePrint}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700">
                  Print
                </button>
                <button type="button" onClick={downloadPDF}
                  className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800">
                  Download PDF
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Edit modal */}
      {editId ? (
        <div className="no-print fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-slate-900">Edit Item</h3>
              <button type="button" onClick={() => setEditId(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400">
                Close
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-area" className="mb-1 block text-xs font-semibold uppercase text-slate-600">Area</label>
                <input id="edit-area" type="text" value={editForm.area}
                  onChange={(e) => setEditForm((current) => ({ ...current, area: e.target.value }))}
                  className="min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500" />
              </div>
              <div>
                <label htmlFor="edit-object" className="mb-1 block text-xs font-semibold uppercase text-slate-600">Object</label>
                <input id="edit-object" type="text" value={editForm.object}
                  onChange={(e) => setEditForm((current) => ({ ...current, object: e.target.value }))}
                  className="min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500" />
              </div>
              <div>
                <label htmlFor="edit-qty" className="mb-1 block text-xs font-semibold uppercase text-slate-600">Quantity</label>
                <input id="edit-qty" type="number" min={0} value={editForm.quantity}
                  onChange={(e) => setEditForm((current) => ({ ...current, quantity: e.target.value === '' ? '' : Number(e.target.value) }))}
                  className="min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500" />
              </div>
              <div>
                <label htmlFor="edit-status" className="mb-1 block text-xs font-semibold uppercase text-slate-600">Status</label>
                <select id="edit-status" value={editForm.status}
                  onChange={(e) => setEditForm((current) => ({ ...current, status: e.target.value as WorkingStatus }))}
                  className="min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500">
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="edit-comments" className="mb-1 block text-xs font-semibold uppercase text-slate-600">Comments</label>
                <input id="edit-comments" type="text" value={editForm.comments}
                  onChange={(e) => setEditForm((current) => ({ ...current, comments: e.target.value }))}
                  className="min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500" />
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={saveEdit}
                className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800">
                Save Changes
              </button>
              <button type="button" onClick={() => setEditId(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400">
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* A4 Preview modal */}
      {previewOpen ? (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="flex max-h-[95vh] w-full max-w-3xl flex-col rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <h3 className="text-base font-bold text-slate-900">A4 Preview</h3>
              <div className="flex gap-2">
                <button type="button" onClick={downloadPDF}
                  className="rounded-xl bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-800">
                  Download PDF
                </button>
                <button type="button" onClick={handlePrint}
                  className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-teal-400">
                  Print
                </button>
                <button type="button" onClick={() => setPreviewOpen(false)}
                  className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-400">
                  Close
                </button>
              </div>
            </div>
            <div className="overflow-y-auto p-4">
              {/* Simulated A4 page */}
              <div className="takeover-a4-preview mx-auto w-full max-w-[210mm] bg-white shadow-md">
                <div className="mb-5 border-b border-slate-800 pb-3 text-center">
                  <p className="text-lg font-bold">School Takeover Inventory</p>
                  <p className="mt-1 text-sm">{meta.schoolName}</p>
                  <p className="text-xs text-slate-600">{meta.date} ({meta.day}) &nbsp;|&nbsp; {meta.time}</p>
                  <p className="text-xs text-slate-600">Handover By: <strong>{meta.handoverBy || '—'}</strong> &nbsp;|&nbsp; Handover To: <strong>{meta.handoverTo || '—'}</strong></p>
                  {meta.remarks ? <p className="mt-1 text-xs text-slate-500">Remarks: {meta.remarks}</p> : null}
                </div>
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-teal-700 text-white">
                      {['S#', 'Area', 'Object', 'Qty', 'Status', 'Comments'].map((h) => (
                        <th key={h} className="border border-teal-600 px-2 py-1.5 text-left font-bold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="border border-slate-200 px-2 py-1 font-bold">{item.serialNo}</td>
                        <td className="border border-slate-200 px-2 py-1">{item.area}</td>
                        <td className="border border-slate-200 px-2 py-1">{item.object}</td>
                        <td className="border border-slate-200 px-2 py-1">{item.quantity === '' ? '—' : item.quantity}</td>
                        <td className="border border-slate-200 px-2 py-1">{item.status}</td>
                        <td className="border border-slate-200 px-2 py-1">{item.comments || '—'}</td>
                      </tr>
                    ))}
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="border border-slate-200 px-2 py-4 text-center text-slate-400">No items added.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
                <div className="mt-16 flex justify-between">
                  <div className="text-center text-xs">
                    <div className="mb-1 w-40 border-b border-black">&nbsp;</div>
                    <p>Signature (Handover By)</p>
                    <p className="font-bold">{meta.handoverBy || '_______________'}</p>
                  </div>
                  <div className="text-center text-xs">
                    <div className="mb-1 w-40 border-b border-black">&nbsp;</div>
                    <p>Signature (Handover To)</p>
                    <p className="font-bold">{meta.handoverTo || '_______________'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
