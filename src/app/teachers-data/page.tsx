'use client';

import React, { useEffect, useMemo, useState } from 'react';

type StaffRecord = {
  sno: number;
  name: string;
  fatherName: string;
  cnic: string;
  designation: string;
  bps: string;
  placeOfPosting: string;
  contactNo: string;
  ibanNo: string;
  pid: string;
};

type StaffApiResponse = {
  success: boolean;
  items?: StaffRecord[];
  item?: StaffRecord;
  message?: string;
};

const sanitizePhone = (value: string) => {
  const raw = value.replace(/\s+/g, '').trim();

  if (!raw || raw === '-') return '-';
  if (raw.startsWith('+923')) return raw;
  if (raw.startsWith('923')) return `+${raw}`;
  if (raw.startsWith('03')) return `+92${raw.slice(1)}`;
  if (raw.startsWith('3')) return `+92${raw}`;
  return raw;
};

const fields: Array<{ key: keyof StaffRecord; label: string; editable: boolean; inputType?: string }> = [
  { key: 'name', label: 'Name', editable: false },
  { key: 'fatherName', label: 'Father Name', editable: true },
  { key: 'cnic', label: 'CNIC', editable: true, inputType: 'text' },
  { key: 'designation', label: 'Designation', editable: true },
  { key: 'bps', label: 'BPS', editable: true },
  { key: 'placeOfPosting', label: 'Place of Posting', editable: true },
  { key: 'contactNo', label: 'Contact Number', editable: true, inputType: 'tel' },
  { key: 'ibanNo', label: 'IBAN No.', editable: true },
  { key: 'pid', label: 'PID', editable: false },
];

export default function StaffRecordPage() {
  const [staffData, setStaffData] = useState<StaffRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [selectedName, setSelectedName] = useState('');
  const [pidInput, setPidInput] = useState('');
  const [verifiedRecordId, setVerifiedRecordId] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editPidInput, setEditPidInput] = useState('');
  const [editAccessPid, setEditAccessPid] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [formData, setFormData] = useState<Partial<StaffRecord>>({});
  const [saveToastVisible, setSaveToastVisible] = useState(false);
  const [saveToastText, setSaveToastText] = useState('');
  const [saveToastTone, setSaveToastTone] = useState<'success' | 'error'>('success');

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

  const loadStaffData = async ({ silent = false }: { silent?: boolean } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      setLoadError('');

      const response = await fetch('/api/staff-records', { cache: 'no-store' });
      const data = (await response.json()) as StaffApiResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to load teachers data.');
      }

      const items = (data.items || []).map((item) => ({
        ...item,
        contactNo: sanitizePhone(item.contactNo || ''),
      }));

      setStaffData(items);
      return items;
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load teachers data.');
      return [] as StaffRecord[];
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadStaffData();
  }, []);

  const sortedNames = useMemo(
    () => [...staffData].sort((a, b) => a.name.localeCompare(b.name)),
    [staffData]
  );

  const selectedRecord = useMemo(
    () => staffData.find((item) => item.name === selectedName) || null,
    [selectedName, staffData]
  );

  const verifiedRecord = useMemo(
    () => staffData.find((item) => item.sno === verifiedRecordId) || null,
    [verifiedRecordId, staffData]
  );

  const handleVerify = () => {
    setMessage('');
    setEditMode(false);
    setEditMessage('');

    if (!selectedRecord) {
      setVerifiedRecordId(null);
      setMessage('Please select your name first.');
      return;
    }

    if (pidInput.trim() !== selectedRecord.pid) {
      setVerifiedRecordId(null);
      setMessage('Incorrect PID. Please try again.');
      return;
    }

    setVerifiedRecordId(selectedRecord.sno);
    setFormData(selectedRecord);
    setMessage('Record verified successfully.');
  };

  const handleVerifyPidKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    handleVerify();
  };

  const handleEnableEdit = () => {
    if (!verifiedRecord) {
      setEditMessage('Please verify your record first.');
      return;
    }

    if (editPidInput.trim() !== verifiedRecord.pid) {
      setEditMode(false);
      setEditMessage('Incorrect PID. Edit access denied.');
      return;
    }

    setEditAccessPid(editPidInput.trim());
    setEditMode(true);
    setEditMessage('Edit mode enabled.');
  };

  const handleEditPidKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    handleEnableEdit();
  };

  const handleFieldChange = (key: keyof StaffRecord, value: string) => {
    if (key === 'name' || key === 'pid') return;
    setFormData((prev) => ({ ...prev, [key]: key === 'contactNo' ? sanitizePhone(value) : value }));
  };

  const handleSave = async () => {
    if (!verifiedRecord) return;

    try {
      setSaving(true);
      setEditMessage('');

      const response = await fetch('/api/staff-records', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sno: verifiedRecord.sno,
          pid: editAccessPid,
          updates: {
            fatherName: String(formData.fatherName ?? ''),
            cnic: String(formData.cnic ?? ''),
            designation: String(formData.designation ?? ''),
            bps: String(formData.bps ?? ''),
            placeOfPosting: String(formData.placeOfPosting ?? ''),
            contactNo: sanitizePhone(String(formData.contactNo ?? '')),
            ibanNo: String(formData.ibanNo ?? ''),
          },
        }),
      });

      const data = (await response.json()) as StaffApiResponse;
      if (!response.ok || !data.success || !data.item) {
        throw new Error(data.message || 'Unable to save changes in sheet.');
      }

      const refreshedItems = await loadStaffData({ silent: true });
      const refreshedRecord = refreshedItems.find((item) => item.sno === verifiedRecord.sno) || data.item;

      setFormData(refreshedRecord);
      setSelectedName(refreshedRecord.name);
      setVerifiedRecordId(refreshedRecord.sno);
      setMessage('Record verified successfully.');
      setEditMode(false);
      setEditPidInput('');
      setEditAccessPid('');
      setEditMessage('');
      showSaveToast('Data saved', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to save changes in sheet.';
      setEditMessage(errorMessage);
      showSaveToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (verifiedRecord) setFormData(verifiedRecord);
    setEditMode(false);
    setEditPidInput('');
    setEditAccessPid('');
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

      <div className="mx-auto max-w-5xl space-y-4 sm:space-y-6 lg:space-y-8">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:rounded-3xl sm:p-6 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
                GGSS Nishtar Road Staff Record
              </h1>
              <p className="mt-2 text-xs text-slate-600 sm:text-sm md:text-base">
                Data source: TeachersData tab from Google Sheet
              </p>
              <p className="text-xs text-slate-500 sm:text-sm">Semis Code: 408070227</p>
            </div>
            <div className="rounded-2xl bg-slate-100 px-3 py-2 text-xs text-slate-700 sm:px-4 sm:py-3 sm:text-sm">
              Select your name and enter PID to view and update your record.
            </div>
          </div>
        </div>

        {loading ? <p className="rounded-xl bg-white p-4 text-sm text-slate-600">Loading teachers data from sheet...</p> : null}
        {loadError ? <p className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{loadError}</p> : null}

        {!loading && !loadError ? (
          <div className="grid gap-4 lg:grid-cols-[1fr,1.25fr] lg:gap-8">
            <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:rounded-3xl sm:p-6">
              <h2 className="text-lg font-semibold sm:text-xl">Find Your Record</h2>
              <div className="mt-4 space-y-4 sm:mt-5">
                <div>
                  <label htmlFor="staff-name-select" className="mb-2 block text-sm font-medium text-slate-700">Select Name</label>
                  <select
                    id="staff-name-select"
                    title="Select Name"
                    value={selectedName}
                    onChange={(e) => {
                      setSelectedName(e.target.value);
                      setPidInput('');
                      setVerifiedRecordId(null);
                      setEditMode(false);
                      setEditPidInput('');
                      setEditAccessPid('');
                      setMessage('');
                      setEditMessage('');
                      const record = staffData.find((item) => item.name === e.target.value);
                      setFormData(record || {});
                    }}
                    className="min-h-[48px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                  >
                    <option value="">Choose your name</option>
                    {sortedNames.map((person) => (
                      <option key={person.sno} value={person.name}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="verify-pid" className="mb-2 block text-sm font-medium text-slate-700">Enter PID</label>
                  <input
                    id="verify-pid"
                    type="password"
                    inputMode="numeric"
                    value={pidInput}
                    onChange={(e) => setPidInput(e.target.value)}
                    onKeyDown={handleVerifyPidKeyDown}
                    placeholder="Enter your PID"
                    className="min-h-[48px] w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                  />
                </div>

                <button
                  onClick={handleVerify}
                  className="min-h-[48px] w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:opacity-90"
                >
                  Verify Record
                </button>

                {message ? (
                  <div className={`rounded-2xl px-4 py-3 text-sm ${verifiedRecord ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message}
                  </div>
                ) : null}
              </div>
            </section>

            <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:rounded-3xl sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold sm:text-xl">Record Details</h2>
                {verifiedRecord ? (
                  <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Verified
                  </span>
                ) : (
                  <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    Locked
                  </span>
                )}
              </div>

              {!verifiedRecord ? (
                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500 sm:mt-6 sm:p-8">
                  Your data will appear here after successful PID verification.
                </div>
              ) : (
                <div className="mt-5 space-y-4 sm:mt-6 sm:space-y-5">
                  {fields.map((field) => {
                    const value = String(formData[field.key] ?? '');
                    const isReadOnly = !editMode || !field.editable;
                    const fieldInputId = `staff-field-${field.key}`;

                    return (
                      <div key={field.key} className="rounded-2xl border border-slate-200 p-3 sm:p-4">
                        <label htmlFor={fieldInputId} className="mb-2 block text-sm font-medium text-slate-700">
                          {field.label}
                          {!field.editable ? (
                            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                              locked
                            </span>
                          ) : null}
                        </label>

                        {isReadOnly ? (
                          <div className="break-words rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-800 sm:px-4">
                            {value || '—'}
                          </div>
                        ) : (
                          <input
                            id={fieldInputId}
                            type={field.inputType || 'text'}
                            value={value}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            title={field.label}
                            placeholder={field.label}
                            className="min-h-[48px] w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none transition focus:border-slate-500 sm:px-4"
                          />
                        )}
                      </div>
                    );
                  })}

                  <div className="rounded-2xl border border-slate-200 p-3 sm:p-4">
                    <h3 className="text-sm font-semibold text-slate-800">Edit Access</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      To edit the record, enter PID again. Name and PID cannot be changed.
                    </p>

                    {!editMode ? (
                      <div className="mt-4 flex flex-col gap-3">
                        <label htmlFor="edit-pid" className="text-sm font-medium text-slate-700">Re-enter PID</label>
                        <input
                          id="edit-pid"
                          type="password"
                          inputMode="numeric"
                          value={editPidInput}
                          onChange={(e) => setEditPidInput(e.target.value)}
                          onKeyDown={handleEditPidKeyDown}
                          placeholder="Re-enter PID to edit"
                          className="min-h-[48px] w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
                        />
                        <button
                          onClick={handleEnableEdit}
                          className="min-h-[48px] w-full rounded-2xl bg-amber-500 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 sm:w-auto"
                        >
                          Enable Edit
                        </button>
                      </div>
                    ) : (
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="min-h-[48px] w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={saving}
                          className="min-h-[48px] w-full rounded-2xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {editMessage ? (
                      <div className={`mt-4 rounded-2xl px-4 py-3 text-sm ${editMode || editMessage.toLowerCase().includes('saved') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
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
