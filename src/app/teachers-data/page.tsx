'use client';

import React, { useEffect, useMemo, useState } from 'react';

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

const parseJsonResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    const rawText = await response.text();
    throw new Error(rawText.slice(0, 120) || 'Server returned a non-JSON response.');
  }

  return (await response.json()) as StaffApiResponse;
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

  const verifyRecord = async (pid: string, enableEdit = false) => {
    if (!selectedRowId) {
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
          rowId: selectedRowId,
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
  };

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-4 text-slate-900 sm:px-4 sm:py-6 lg:px-6 lg:py-10">
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

      <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6 lg:space-y-8">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:rounded-3xl sm:p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Staff Management Portal</p>
              <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">GGSS Nishtar Road Staff Data</h1>
              <p className="mt-2 text-xs text-slate-600 sm:text-sm md:text-base">
                Secure, server-verified workflow with direct synchronization to your configured Google Sheet.
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs text-cyan-800 sm:px-4 sm:py-3 sm:text-sm">
              Directory loads first. Full data appears only after PID verification.
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 sm:text-sm">
              <span className="font-semibold text-slate-900">Active Tab:</span> {sourceLabel || 'Loading...'}
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 sm:text-sm">
              <span className="font-semibold text-slate-900">Directory Size:</span> {directoryItems.length}
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 sm:text-sm">
              <span className="font-semibold text-slate-900">Editable Fields:</span> {editableColumns.length}
            </div>
          </div>
        </div>

        {loading ? <p className="rounded-xl bg-white p-4 text-sm text-slate-600">Loading secure staff directory...</p> : null}
        {loadError ? <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{loadError}</p> : null}

        {!loading && !loadError ? (
          <div className="grid gap-4 lg:grid-cols-[0.92fr,1.08fr] lg:gap-8">
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
                  <input
                    id="verify-pid"
                    type="password"
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
                    className="min-h-[48px] w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                  />
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
                  <div className={`rounded-2xl px-4 py-3 text-sm ${verified ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message}
                  </div>
                ) : null}
              </div>
            </section>

            <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:rounded-3xl sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold sm:text-xl">Staff Details</h2>
                {verified ? (
                  <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Verified</span>
                ) : (
                  <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Locked</span>
                )}
              </div>

              {verified ? (
                <p className="mt-2 text-xs text-slate-500 sm:text-sm">
                  {readonlyColumns.length} locked fields and {editableColumns.length} editable fields are available for this staff record.
                </p>
              ) : null}

              {!verified ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500 sm:mt-6 sm:p-8">
                  Staff data will appear here after secure PID verification.
                </div>
              ) : (
                <div className="mt-5 grid gap-4 sm:mt-6 lg:grid-cols-2">
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

                  <div className="rounded-2xl border border-slate-200 p-3 sm:p-4 lg:col-span-2">
                    <h3 className="text-sm font-semibold text-slate-800">Edit Access</h3>
                    <p className="mt-1 text-sm text-slate-500">To edit the record, enter PID again. Locked columns stay protected.</p>

                    {!editMode ? (
                      <div className="mt-4 flex flex-col gap-3">
                        <label htmlFor="edit-pid" className="text-sm font-medium text-slate-700">Re-enter PID</label>
                        <input
                          id="edit-pid"
                          type="password"
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
                          className="min-h-[48px] w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                        />
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
              )}
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
