'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { FiPrinter, FiEye, FiEdit2, FiX } from 'react-icons/fi';
import { FaFilePdf } from 'react-icons/fa';
import {
  AdmissionFormPrintView,
  normalizeRecordToPrintData,
  generateAdmissionA4PdfBlob,
  downloadBlob,
  buildAdmissionPdfFileName,
} from '../AdmissionFormPrintView';

type AdmissionRecord = Record<string, string>;

const LIST_COLUMNS: Array<{ key: string; label: string }> = [
  { key: 'sr_no', label: 'Sr No.' },
  { key: 'student_name', label: 'Student Name' },
  { key: 'father_name', label: "Father's Name" },
  { key: 'admission_class', label: 'Class' },
  { key: 'admission_date', label: 'Admission Date' },
  { key: 'gr_no', label: 'GR No.' },
  { key: 'whatsapp_no', label: 'WhatsApp No.' },
];

const DETAIL_SECTIONS: Array<{ title: string; fields: Array<{ key: string; label: string }> }> = [
  {
    title: 'Student',
    fields: [
      { key: 'sr_no', label: 'Sr No.' },
      { key: 'roll_no', label: 'Roll No.' },
      { key: 'gr_no', label: 'GR No.' },
      { key: 'student_name', label: 'Student Name' },
      { key: 'dob', label: 'Date of Birth' },
      { key: 'dob_words', label: 'DOB (in words)' },
      { key: 'nationality', label: 'Nationality' },
      { key: 'surname', label: 'Surname' },
      { key: 'religion', label: 'Religion' },
    ],
  },
  {
    title: 'Previous School (if any)',
    fields: [
      { key: 'previous_class', label: 'Previous Class' },
      { key: 'last_school', label: 'Last School' },
      { key: 'leaving_reason', label: 'Leaving Reason' },
      { key: 'leaving_date', label: 'Leaving Date' },
    ],
  },
  {
    title: 'Admission',
    fields: [
      { key: 'admission_class', label: 'Class Admission Sought' },
      { key: 'admission_date', label: 'Date of Admission' },
      { key: 'nadra_status', label: 'Nadra (B Form/CRC)' },
      { key: 'b_form_no', label: 'B-Form No.' },
      { key: 'address', label: 'Address' },
    ],
  },
  {
    title: "Father's Details",
    fields: [
      { key: 'father_name', label: "Father's Name" },
      { key: 'father_cnic', label: "Father's CNIC" },
      { key: 'father_cell', label: "Father's Cell No." },
      { key: 'father_qualification', label: 'Qualification' },
      { key: 'father_occupation', label: 'Occupation' },
      { key: 'company_details', label: 'Company Name & Address' },
    ],
  },
  {
    title: "Mother / Guardian's Details",
    fields: [
      { key: 'mother_name', label: "Mother's Name" },
      { key: 'mother_cnic', label: "Mother's CNIC" },
      { key: 'mother_cell', label: "Mother's Cell No." },
      { key: 'guardian_cell', label: "Guardian's Cell No." },
      { key: 'whatsapp_no', label: 'WhatsApp No.' },
    ],
  },
  {
    title: 'Office Use',
    fields: [
      { key: 'office_class_admitted', label: 'Class Admitted' },
      { key: 'office_admission_date', label: 'Date of Admission (Office)' },
      { key: 'campus_head_sign', label: 'Campus Head' },
      { key: 'academic_incharge_sign', label: 'Academic Incharge' },
      { key: 'prepared_by', label: 'Prepared By' },
      { key: 'prepared_sign', label: 'Prepared (Sign)' },
      { key: 'office_date', label: 'Office Date' },
    ],
  },
];

const parseJsonResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    const raw = await response.text();
    throw new Error(raw.slice(0, 200) || 'Server returned a non-JSON response.');
  }
  return response.json();
};

export default function AdmissionRecordsPage() {
  const [authLoading, setAuthLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const [records, setRecords] = useState<AdmissionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');

  // Proper Form View modal
  const [viewRecord, setViewRecord] = useState<AdmissionRecord | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Edit modal
  const [editRecord, setEditRecord] = useState<AdmissionRecord | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSaveMessage, setEditSaveMessage] = useState('');

  // Row loading states
  const [downloadingRowId, setDownloadingRowId] = useState<string | null>(null);
  const [printingRowId, setPrintingRowId] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const printContainerRef = useRef<HTMLDivElement>(null);
  const offscreenPrintRef = useRef<HTMLDivElement>(null);
  const [offscreenRecord, setOffscreenRecord] = useState<AdmissionRecord | null>(null);

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

  const fetchRecords = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await fetch('/api/ggss-admission-form/records', { cache: 'no-store' });
      const data = await parseJsonResponse(response);
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to load admission records.');
      }
      setRecords(data.records || []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load admission records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) void fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return records;
    return records.filter((record) =>
      [record.student_name, record.father_name, record.gr_no, record.sr_no, record.father_cnic, record.admission_class]
        .some((value) => String(value ?? '').toLowerCase().includes(term))
    );
  }, [records, search]);

  const ensureFullRecord = async (record: AdmissionRecord): Promise<AdmissionRecord> => {
    if (record.picture_base64) return record;
    try {
      const response = await fetch(`/api/ggss-admission-form/records?row=${encodeURIComponent(record.row_number)}`, {
        cache: 'no-store',
      });
      const data = await parseJsonResponse(response);
      if (response.ok && data.success && data.record) {
        return data.record;
      }
    } catch (err) {
      console.error('Could not fetch full record:', err);
    }
    return record;
  };

  const openViewModal = async (record: AdmissionRecord) => {
    setViewRecord(record);
    setViewLoading(true);
    const full = await ensureFullRecord(record);
    setViewRecord(full);
    setViewLoading(false);
  };

  const closeViewModal = () => {
    setViewRecord(null);
    setViewLoading(false);
  };

  const openEditModal = async (rowNumber: string) => {
    closeViewModal();
    setEditRecord(null);
    setEditError('');
    setEditSaveMessage('');
    setEditLoading(true);
    try {
      const response = await fetch(`/api/ggss-admission-form/records?row=${encodeURIComponent(rowNumber)}`, { cache: 'no-store' });
      const data = await parseJsonResponse(response);
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to load this record.');
      }
      setEditRecord(data.record);
    } catch (error) {
      setEditError(error instanceof Error ? error.message : 'Unable to load this record.');
    } finally {
      setEditLoading(false);
    }
  };

  const closeEditModal = () => {
    setEditRecord(null);
    setEditError('');
    setEditSaveMessage('');
  };

  const handleEditFieldChange = (key: string, value: string) => {
    setEditRecord((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleEditSave = async () => {
    if (!editRecord) return;
    setEditSaving(true);
    setEditSaveMessage('');
    setEditError('');
    try {
      const response = await fetch('/api/ggss-admission-form/records', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowNumber: editRecord.row_number, values: editRecord }),
      });
      const data = await parseJsonResponse(response);
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to save changes.');
      }
      setEditSaveMessage('Saved successfully.');
      await fetchRecords();
    } catch (error) {
      setEditError(error instanceof Error ? error.message : 'Unable to save changes.');
    } finally {
      setEditSaving(false);
    }
  };

  const handlePrintRecord = (record: AdmissionRecord) => {
    const previousTitle = document.title;
    const studentName = (record.student_name || 'Student').trim();
    document.title = `${studentName} - Admission Form`;
    window.print();
    window.setTimeout(() => {
      document.title = previousTitle;
    }, 1000);
  };

  const handleDownloadPdf = async (record: AdmissionRecord) => {
    const targetEl = printContainerRef.current || offscreenPrintRef.current;
    if (!targetEl) return;
    setDownloadingPdf(true);
    try {
      const fileName = buildAdmissionPdfFileName(record.student_name);
      const blob = await generateAdmissionA4PdfBlob(targetEl);
      downloadBlob(blob, fileName);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert(error instanceof Error ? error.message : 'Unable to generate PDF.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleRowPrint = async (record: AdmissionRecord) => {
    setPrintingRowId(record.row_number);
    const full = await ensureFullRecord(record);
    setViewRecord(full);
    setPrintingRowId(null);
    setTimeout(() => {
      handlePrintRecord(full);
    }, 120);
  };

  const handleRowDownloadPdf = async (record: AdmissionRecord) => {
    setDownloadingRowId(record.row_number);
    try {
      const full = await ensureFullRecord(record);
      setOffscreenRecord(full);
      await new Promise<void>((res) => setTimeout(res, 180));
      if (offscreenPrintRef.current) {
        const fileName = buildAdmissionPdfFileName(full.student_name);
        const blob = await generateAdmissionA4PdfBlob(offscreenPrintRef.current);
        downloadBlob(blob, fileName);
      }
    } catch (error) {
      console.error('Row PDF error:', error);
      alert(error instanceof Error ? error.message : 'Unable to generate PDF.');
    } finally {
      setDownloadingRowId(null);
      setOffscreenRecord(null);
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">Checking session...</p>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="mb-2 text-sm font-bold text-slate-800">Admin access only</p>
          <p className="mb-4 text-xs text-slate-500">
            Please login from the Admin Dashboard first — the admission-desk password does not open this page.
          </p>
          <Link
            href="/ggss-nishtar-road/admin"
            className="inline-block rounded-xl bg-[#1a3a6b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#132c52]"
          >
            Go to Admin Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href="/ggss-nishtar-road/admin" className="text-sm font-semibold text-[#1a3a6b] transition hover:underline">
              ← Back to Admin
            </Link>
            <h1 className="mt-1 text-xl font-bold text-slate-800">All Students — Admission Forms</h1>
            <p className="text-xs text-slate-500">
              {records.length} record{records.length === 1 ? '' : 's'} in &quot;Admission Forms 26-27&quot;
            </p>
          </div>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by student, father, GR No, CNIC, class..."
            className="w-full max-w-xs rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-[#1a3a6b]"
          />
        </div>

        {loadError ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{loadError}</p> : null}

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                {LIST_COLUMNS.map((column) => (
                  <th key={column.key} className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {column.label}
                  </th>
                ))}
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={LIST_COLUMNS.length + 1} className="px-3 py-6 text-center text-slate-500">
                    Loading records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={LIST_COLUMNS.length + 1} className="px-3 py-6 text-center text-slate-500">
                    No records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.row_number} className="hover:bg-slate-50">
                    {LIST_COLUMNS.map((column) => (
                      <td key={column.key} className="whitespace-nowrap px-3 py-2 text-slate-700">
                        {record[column.key] || '-'}
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        {/* View Proper Form Icon */}
                        <button
                          type="button"
                          onClick={() => void openViewModal(record)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 hover:border-slate-400 shadow-sm active:scale-95"
                          title="View Official Admission Form"
                          aria-label="View Form"
                        >
                          <FiEye className="h-4 w-4" />
                        </button>

                        {/* Print Form Icon */}
                        <button
                          type="button"
                          onClick={() => void handleRowPrint(record)}
                          disabled={printingRowId === record.row_number}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a3a6b] text-white transition hover:bg-[#132c52] shadow-sm active:scale-95 disabled:opacity-60"
                          title="Print Form (A4)"
                          aria-label="Print Form"
                        >
                          {printingRowId === record.row_number ? (
                            <span className="text-[10px]">⏳</span>
                          ) : (
                            <FiPrinter className="h-4 w-4" />
                          )}
                        </button>

                        {/* Save as PDF Icon */}
                        <button
                          type="button"
                          onClick={() => void handleRowDownloadPdf(record)}
                          disabled={downloadingRowId === record.row_number}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-700 shadow-sm active:scale-95 disabled:opacity-60"
                          title="Save as PDF"
                          aria-label="Save PDF"
                        >
                          {downloadingRowId === record.row_number ? (
                            <span className="text-[10px]">⏳</span>
                          ) : (
                            <FaFilePdf className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {/* Edit Record Icon */}
                        <button
                          type="button"
                          onClick={() => void openEditModal(record.row_number)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-amber-600 transition hover:bg-amber-50 hover:border-amber-300 shadow-sm active:scale-95"
                          title="Edit Details"
                          aria-label="Edit Record"
                        >
                          <FiEdit2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proper Official Admission Form View Modal */}
      {viewRecord ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-2 py-4 sm:px-4 sm:py-6">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-3 sm:p-5 shadow-2xl">
            {/* Header: Title and sleek Icon Buttons */}
            <div className="no-print mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {viewRecord.student_name || 'Admission Form'}
                </h2>
                <p className="text-xs text-slate-500">
                  Class: <span className="font-semibold text-slate-700">{viewRecord.admission_class || '-'}</span> | Sr No: <span className="font-semibold text-slate-700">{viewRecord.sr_no || '-'}</span> | GR No: <span className="font-semibold text-slate-700">{viewRecord.gr_no || '-'}</span>
                  {viewLoading ? ' (Loading full details...)' : ''}
                </p>
              </div>

              {/* Action Icons (no bulky text) */}
              <div className="flex items-center gap-2">
                {/* Print Icon */}
                <button
                  type="button"
                  onClick={() => handlePrintRecord(viewRecord)}
                  title="Print Form (A4)"
                  aria-label="Print Form"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1a3a6b] text-white shadow transition hover:bg-[#132c52] active:scale-95"
                >
                  <FiPrinter className="h-4 w-4" />
                </button>

                {/* PDF Save Icon */}
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(viewRecord)}
                  disabled={downloadingPdf}
                  title="Save / Download A4 PDF"
                  aria-label="Save PDF"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow transition hover:bg-emerald-700 active:scale-95 disabled:opacity-60"
                >
                  {downloadingPdf ? (
                    <span className="text-xs">⏳</span>
                  ) : (
                    <FaFilePdf className="h-4 w-4" />
                  )}
                </button>

                {/* Edit Icon */}
                <button
                  type="button"
                  onClick={() => void openEditModal(viewRecord.row_number)}
                  title="Edit Record"
                  aria-label="Edit Record"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
                >
                  <FiEdit2 className="h-4 w-4" />
                </button>

                {/* Close Icon */}
                <button
                  type="button"
                  onClick={closeViewModal}
                  title="Close"
                  aria-label="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Proper Official A4 Form Layout */}
            <div id="records-print-wrapper" className="overflow-x-auto bg-slate-100 p-2 sm:p-4 rounded-xl">
              <AdmissionFormPrintView
                ref={printContainerRef}
                id="admission-a4-form"
                data={normalizeRecordToPrintData(viewRecord)}
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Edit Record Modal */}
      {editRecord ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-8">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-800">Edit Admission Record</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void openViewModal(editRecord)}
                  title="View Official Form"
                  aria-label="View Form"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
                >
                  <FiEye className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  title="Close"
                  aria-label="Close"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
                >
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            </div>

            {editLoading ? <p className="text-sm text-slate-500">Loading...</p> : null}
            {editError ? <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{editError}</p> : null}
            {editSaveMessage ? <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{editSaveMessage}</p> : null}

            {editRecord ? (
              <div className="space-y-5">
                {editRecord.picture_base64 ? (
                  <div className="flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`data:image/jpeg;base64,${editRecord.picture_base64}`}
                      alt="Student"
                      className="h-28 w-24 rounded-md border border-slate-300 object-cover"
                    />
                  </div>
                ) : null}

                {DETAIL_SECTIONS.map((section) => (
                  <div key={section.title}>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#1a3a6b]">{section.title}</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {section.fields.map((field) => (
                        <label key={field.key} className="block text-xs font-medium text-slate-600">
                          {field.label}
                          <input
                            type="text"
                            value={editRecord[field.key] || ''}
                            onChange={(event) => handleEditFieldChange(field.key, event.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1a3a6b]"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleEditSave}
                    disabled={editSaving}
                    className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {editSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Offscreen container for direct row download */}
      {offscreenRecord ? (
        <div
          style={{
            position: 'fixed',
            left: '-99999px',
            top: 0,
            width: '780px',
            backgroundColor: '#ffffff',
            zIndex: -1,
          }}
        >
          <AdmissionFormPrintView
            ref={offscreenPrintRef}
            data={normalizeRecordToPrintData(offscreenRecord)}
          />
        </div>
      ) : null}

      <style>{`
        @page {
          size: A4 portrait;
          margin: 6mm 8mm;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            height: auto !important;
          }
          body * {
            visibility: hidden !important;
          }
          #records-print-wrapper,
          #records-print-wrapper * {
            visibility: visible !important;
          }
          #records-print-wrapper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            border: none !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </main>
  );
}
