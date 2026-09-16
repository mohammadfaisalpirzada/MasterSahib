'use client';

// Student ID Card generator — GGSS Nishtar Road admin tool.
//
// Data: reused as-is from the live "Admission Forms 26-27" Google Sheet via
// /api/ggss-admission-form/records (the same source that already powers
// /ggss-nishtar-road/admin/admission-form/records). Nothing here is mock
// data — every field on a card (name, father's name, GR/roll no, class,
// photo, address, contact number) is pulled from a student's saved
// admission record. The one field that sheet does not track yet is Blood
// Group, so it's editable per-card at print time only (see idCardUtils.ts).
//
// Auth reuses the same admin session cookie as the admission records page
// (/api/staff-records/admin/auth/session) — log in from the main admin
// panel first.

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FiPrinter, FiRefreshCw } from 'react-icons/fi';
import { IdCardFront, IdCardBack } from './StudentIdCard';
import {
  type AdmissionRecord,
  type IdCardData,
  generateQrDataUrl,
  recordToCardData,
} from './idCardUtils';

const CLASS_OPTIONS = ['ECE', 'Prep / KG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

// Class order for sorting — CLASS_OPTIONS is already in the school's real
// promotion order (ECE first, X last), so sorting "by Class" follows this
// index rather than alphabetical order (which would put "II" before "I").
const CLASS_SORT_INDEX = new Map(CLASS_OPTIONS.map((cls, index) => [cls, index]));

type SortKey = 'class' | 'gr_no' | 'admission_date';

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: 'class', label: 'Class' },
  { key: 'gr_no', label: 'GR No.' },
  { key: 'admission_date', label: 'Date of Admission' },
];

// GR numbers can be plain digits ("245") or have a prefix ("GR-245") —
// compare numerically when possible so "9" sorts before "10".
const compareGrNo = (a: string, b: string) => {
  const numA = parseInt(String(a ?? '').replace(/\D/g, ''), 10);
  const numB = parseInt(String(b ?? '').replace(/\D/g, ''), 10);
  if (Number.isFinite(numA) && Number.isFinite(numB) && numA !== numB) return numA - numB;
  return String(a ?? '').localeCompare(String(b ?? ''));
};

const compareAdmissionDate = (a: string, b: string) => {
  const timeA = new Date(a || 0).getTime();
  const timeB = new Date(b || 0).getTime();
  const validA = Number.isFinite(timeA);
  const validB = Number.isFinite(timeB);
  if (validA && validB) return timeA - timeB;
  if (validA) return -1;
  if (validB) return 1;
  return String(a ?? '').localeCompare(String(b ?? ''));
};

const compareByClass = (a: string, b: string) => {
  const indexA = CLASS_SORT_INDEX.has(a) ? CLASS_SORT_INDEX.get(a)! : CLASS_OPTIONS.length;
  const indexB = CLASS_SORT_INDEX.has(b) ? CLASS_SORT_INDEX.get(b)! : CLASS_OPTIONS.length;
  return indexA - indexB;
};

const sortRecords = (records: AdmissionRecord[], sortKey: SortKey, direction: 'asc' | 'desc'): AdmissionRecord[] => {
  const sorted = [...records].sort((a, b) => {
    if (sortKey === 'class') return compareByClass(a.admission_class || '', b.admission_class || '');
    if (sortKey === 'gr_no') return compareGrNo(a.gr_no || '', b.gr_no || '');
    return compareAdmissionDate(a.admission_date || '', b.admission_date || '');
  });
  return direction === 'desc' ? sorted.reverse() : sorted;
};

// How many student cards fit on one A4 sheet — this single constant drives
// the print pagination below (see groupIntoPages / .id-card-print-page).
const CARDS_PER_PAGE = 3;

const parseJsonResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    const raw = await response.text();
    throw new Error(raw.slice(0, 200) || 'Server returned a non-JSON response.');
  }
  return response.json();
};

// Splits the selected students into fixed-size chunks, one chunk per A4
// sheet. Each chunk is rendered inside a ".id-card-print-page" wrapper,
// which carries `page-break-after: always` in print so the next chunk
// always starts on a fresh sheet — see the print stylesheet below.
const groupIntoPages = <T,>(items: T[], size: number): T[][] => {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
};

export default function IdCardsPage() {
  const [authLoading, setAuthLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const [records, setRecords] = useState<AdmissionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const [classFilter, setClassFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('class');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  // Full record (with photo) fetched lazily per row, only once selected —
  // the list endpoint deliberately omits picture_base64 to stay light.
  const [fullRecords, setFullRecords] = useState<Record<string, AdmissionRecord>>({});
  const [loadingPhotoRows, setLoadingPhotoRows] = useState<Set<string>>(new Set());
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

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
        throw new Error(data.message || 'Unable to load student records.');
      }
      setRecords(data.records || []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load student records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) void fetchRecords();
  }, [authenticated]);

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = records.filter((record) => {
      if (classFilter && String(record.admission_class ?? '').trim() !== classFilter) return false;
      if (!term) return true;
      return [record.student_name, record.father_name, record.gr_no, record.roll_no]
        .some((value) => String(value ?? '').toLowerCase().includes(term));
    });
    return sortRecords(filtered, sortKey, sortDirection);
  }, [records, classFilter, search, sortKey, sortDirection]);

  // Fetches the full record (photo included) and generates that student's
  // QR code the first time they're selected — never re-fetched afterwards.
  const ensureCardAssets = async (record: AdmissionRecord) => {
    const rowNumber = record.row_number;
    if (!rowNumber || fullRecords[rowNumber]) return;

    setLoadingPhotoRows((current) => new Set(current).add(rowNumber));
    try {
      const response = await fetch(`/api/ggss-admission-form/records?row=${encodeURIComponent(rowNumber)}`, {
        cache: 'no-store',
      });
      const data = await parseJsonResponse(response);
      const fullRecord: AdmissionRecord = response.ok && data.success && data.record ? data.record : record;
      setFullRecords((current) => ({ ...current, [rowNumber]: fullRecord }));
      const qr = await generateQrDataUrl(fullRecord);
      setQrCodes((current) => ({ ...current, [rowNumber]: qr }));
    } catch {
      setFullRecords((current) => ({ ...current, [rowNumber]: record }));
    } finally {
      setLoadingPhotoRows((current) => {
        const next = new Set(current);
        next.delete(rowNumber);
        return next;
      });
    }
  };

  const toggleRow = (record: AdmissionRecord) => {
    const rowNumber = record.row_number;
    if (!rowNumber) return;
    setSelectedRows((current) => {
      const next = new Set(current);
      if (next.has(rowNumber)) {
        next.delete(rowNumber);
      } else {
        next.add(rowNumber);
        void ensureCardAssets(record);
      }
      return next;
    });
  };

  const allFilteredSelected = filteredRecords.length > 0 && filteredRecords.every((r) => selectedRows.has(r.row_number));

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      setSelectedRows((current) => {
        const next = new Set(current);
        filteredRecords.forEach((r) => next.delete(r.row_number));
        return next;
      });
      return;
    }
    setSelectedRows((current) => {
      const next = new Set(current);
      filteredRecords.forEach((r) => next.add(r.row_number));
      return next;
    });
    filteredRecords.forEach((record) => void ensureCardAssets(record));
  };

  // Ordered list of the students that will actually be printed — follows
  // the same sort (Class / GR No. / Date of Admission) chosen above, so the
  // printed sheets always come out in that order regardless of which class
  // filter or search happens to be active on screen right now.
  const selectedRecordsInOrder = useMemo(
    () => sortRecords(records.filter((r) => r.row_number && selectedRows.has(r.row_number)), sortKey, sortDirection),
    [records, selectedRows, sortKey, sortDirection],
  );

  const cardsData: IdCardData[] = useMemo(
    () =>
      selectedRecordsInOrder.map((record) => {
        const full = fullRecords[record.row_number] || record;
        return recordToCardData(full, qrCodes[record.row_number] || '');
      }),
    [selectedRecordsInOrder, fullRecords, qrCodes],
  );

  const printPages = useMemo(() => groupIntoPages(cardsData, CARDS_PER_PAGE), [cardsData]);
  const anyPhotoLoading = loadingPhotoRows.size > 0;

  const handlePrint = () => window.print();

  if (authLoading) {
    return <main className="flex min-h-screen items-center justify-center text-sm text-slate-500">Checking admin session…</main>;
  }

  if (!authenticated) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-bold" style={{ color: '#1a3a6b' }}>Admin login required</p>
        <p className="max-w-sm text-sm text-slate-600">Sign in from the main admin panel first, then come back to this page.</p>
        <Link href="/ggss-nishtar-road/admin" className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white" style={{ background: '#1a3a6b' }}>
          Go to Admin Panel
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      {/* ===================== Controls (hidden on print) ===================== */}
      <div className="no-print mx-auto max-w-6xl px-4 pt-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold" style={{ color: '#1a3a6b' }}>Student ID Cards</h1>
          <p className="text-sm text-slate-600">
            Pulled live from the admission records sheet, laid onto the school&apos;s approved card design. Select students below, then print.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Class</label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">All Classes</option>
              {CLASS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Sort By</label>
            <div className="flex gap-1">
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.key} value={opt.key}>{opt.label}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))}
                title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                {sortDirection === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, father's name, GR / roll no."
              className="w-56 rounded-xl border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <label className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm">
            <input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAllFiltered} />
            Select All ({filteredRecords.length})
          </label>

          <button
            type="button"
            onClick={() => void fetchRecords()}
            className="ml-auto inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <FiRefreshCw size={14} /> Refresh
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={!cardsData.length || anyPhotoLoading}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: '#1a3a6b' }}
          >
            <FiPrinter size={16} /> Print Cards ({cardsData.length})
          </button>
        </div>

        {loadError ? <p className="mt-3 text-sm font-semibold text-red-600">{loadError}</p> : null}
        {loading ? <p className="mt-3 text-sm text-slate-500">Loading student records…</p> : null}

        {/* Selectable student list */}
        <div className="mt-4 max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2"></th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Father&apos;s Name</th>
                <th className="px-3 py-2">Class</th>
                <th className="px-3 py-2">GR No.</th>
                <th className="px-3 py-2">Admission Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.row_number} className="border-t border-slate-100">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(record.row_number)}
                      onChange={() => toggleRow(record)}
                    />
                  </td>
                  <td className="px-3 py-2 font-medium text-slate-800">{record.student_name}</td>
                  <td className="px-3 py-2 text-slate-600">{record.father_name}</td>
                  <td className="px-3 py-2 text-slate-600">{record.admission_class}</td>
                  <td className="px-3 py-2 text-slate-600">{record.gr_no}</td>
                  <td className="px-3 py-2 text-slate-600">{record.admission_date}</td>
                </tr>
              ))}
              {!filteredRecords.length && !loading ? (
                <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-400">No students match this filter.</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== Preview / print area ===================== */}
      <div className="mx-auto mt-8 flex max-w-6xl flex-col items-center gap-6 px-4 print:mt-0 print:gap-0 print:px-0">
        {!cardsData.length ? (
          <p className="no-print text-sm text-slate-400">Select students above to preview their ID cards here.</p>
        ) : null}

        {printPages.map((pageCards, pageIndex) => (
          // Each ".id-card-print-page" is exactly one A4 sheet holding up to
          // CARDS_PER_PAGE (3) students' front+back cards. In print, every
          // page except the last forces a page break after it, so the next
          // batch of 3 always starts on a fresh sheet.
          <div className="id-card-print-page" key={pageIndex}>
            {pageCards.map((card) => (
              <div className="id-card-row" key={card.rowNumber}>
                <IdCardFront data={card} />
                <IdCardBack />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ===================== Print + card styling ===================== */}
      {/*
        The card is the school's own template images
        (public/images/id-cards/front-template.png / back-template.png —
        exported directly, page-for-page, from their approved PDF at CR80
        print size). This stylesheet does not draw any card design — it
        only places the live fields (photo, Name, Student ID, D.O.B,
        Address, QR) at the exact spots the front template reserves for
        them, in millimetres measured off that same PDF. The back template
        is used untouched, no overlay at all.
      */}
      <style jsx global>{`
        /* ---- CR80 card geometry: 85.6mm x 54mm, the standard PVC ID card size ---- */
        .id-card {
          position: relative;
          width: 85.6mm;
          height: 54mm;
          box-sizing: border-box;
          overflow: hidden;
          background: #ffffff;
          font-family: 'Segoe UI', Verdana, sans-serif;
          box-shadow: 0 0 0 0.2mm #cbd5e1;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .id-card-row {
          display: flex;
          gap: 6mm;
          justify-content: center;
        }

        /* One "sheet" of up to 3 rows (front+back pairs) = one A4 page. */
        .id-card-print-page {
          display: flex;
          flex-direction: column;
          gap: 6mm;
          background: #ffffff;
          padding: 6mm 0;
        }

        .card-template-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 0;
        }

        /* ================= FRONT overlays ================= */
        /* Coordinates measured pixel-by-pixel off the source PDF pages
           (2024x1276px @600dpi == 85.6mm x 54mm exactly, scale
           0.0423mm/px) by isolating the printed circle outline, the blue
           label rows and the QR backing block and reading their bounding
           boxes — not eyeballed — so these line up with the template's own
           printed guides. */

        .card-photo-slot {
          position: absolute;
          z-index: 1;
          left: 6.3mm;
          top: 19.9mm;
          width: 19.2mm;
          height: 19.2mm;
          border-radius: 50%;
          overflow: hidden;
          background: #eef2f7;
          display: flex;
          align-items: center;
          justify-content: center;
          /* black ring directly on the circle, then a white ring just
             outside it (via box-shadow spread, not blur) so the photo
             reads clearly against the blue template behind it. */
          border: 0.5mm solid #000000;
          box-shadow: 0 0 0 0.6mm #ffffff;
        }
        .card-photo-slot img { width: 100%; height: 100%; object-fit: cover; }
        .card-photo-fallback { font-size: 8pt; font-weight: 800; color: #123b7a; }

        .card-value {
          position: absolute;
          z-index: 1;
          left: 49.7mm;
          width: 35mm;
          height: 4.2mm;
          display: flex;
          align-items: center;
          font-size: 2.6mm;
          color: #334155;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .card-value-name { top: 30.5mm; }
        .card-value-id { top: 35.0mm; }
        .card-value-dob { top: 39.6mm; }
        /* Address gets its own two-line box instead of the shared single-line
           one — a long address wraps onto a second line rather than getting
           cut off mid-word. */
        .card-value-address {
          top: 44.3mm;
          height: auto;
          max-height: 9mm;
          font-size: 2.3mm;
          white-space: normal;
          line-height: 1.25;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .card-qr-slot {
          position: absolute;
          z-index: 1;
          left: 4.4mm;
          top: 41.2mm;
          width: 10mm;
          height: 10mm;
          border-radius: 1mm;
          background: #c9d3ea;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .card-qr-slot img { width: 100%; height: 100%; object-fit: contain; }
        .card-qr-placeholder { width: 100%; height: 100%; background: #c9d3ea; }

        /* ---- Print rules ---- */
        @media print {
          .no-print { display: none !important; }
          html, body { background: #ffffff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

          /* Fresh A4 sheet for every batch of 3 cards; the last page must
             NOT force a break, or a blank trailing page gets printed. */
          .id-card-print-page {
            page-break-after: always;
            break-after: page;
          }
          .id-card-print-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }
        }

        @page {
          size: A4 portrait;
          margin: 0.5in;
        }
      `}</style>
    </main>
  );
}
