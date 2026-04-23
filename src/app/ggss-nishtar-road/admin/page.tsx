'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { IoEyeOffOutline, IoEyeOutline } from 'react-icons/io5';
import jsPDF from 'jspdf';
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
  record?: AdminRecord;
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

const MAX_PICTURE_BASE64_LENGTH = 48_000;
const PICTURE_TARGET_WIDTH = 360;
const PICTURE_TARGET_HEIGHT = 450;
const MIN_PICTURE_WIDTH = 220;
const MIN_PICTURE_HEIGHT = 275;
const MIN_PICTURE_QUALITY = 0.45;

const extractBase64Payload = (dataUrl: string) => {
  const [, payload = ''] = dataUrl.split(',');
  return payload;
};

const loadImageElement = (file: File) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Selected image could not be opened.'));
    };

    image.src = objectUrl;
  });
};

const drawCenteredCrop = (
  context: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number
) => {
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = targetWidth / targetHeight;

  let cropWidth = sourceWidth;
  let cropHeight = sourceHeight;

  if (sourceRatio > targetRatio) {
    cropWidth = sourceHeight * targetRatio;
  } else {
    cropHeight = sourceWidth / targetRatio;
  }

  const offsetX = Math.max(0, (sourceWidth - cropWidth) / 2);
  const offsetY = Math.max(0, (sourceHeight - cropHeight) / 2);

  context.drawImage(source, offsetX, offsetY, cropWidth, cropHeight, 0, 0, targetWidth, targetHeight);
};

const compressCanvasToJpegBase64 = (sourceCanvas: HTMLCanvasElement) => {
  let width = sourceCanvas.width;
  let height = sourceCanvas.height;
  let quality = 0.9;
  let attempts = 0;

  const exportCanvas = document.createElement('canvas');
  const exportContext = exportCanvas.getContext('2d');

  if (!exportContext) {
    throw new Error('Image processing is not supported in this browser.');
  }

  while (attempts < 12) {
    exportCanvas.width = width;
    exportCanvas.height = height;
    exportContext.clearRect(0, 0, width, height);
    exportContext.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height, 0, 0, width, height);

    const dataUrl = exportCanvas.toDataURL('image/jpeg', quality);
    const base64 = extractBase64Payload(dataUrl);

    if (
      base64.length <= MAX_PICTURE_BASE64_LENGTH ||
      (quality <= MIN_PICTURE_QUALITY && width <= MIN_PICTURE_WIDTH && height <= MIN_PICTURE_HEIGHT)
    ) {
      return base64;
    }

    if (quality > 0.6) {
      quality -= 0.1;
    } else if (quality > MIN_PICTURE_QUALITY) {
      quality -= 0.05;
    } else {
      width = Math.max(MIN_PICTURE_WIDTH, Math.round(width * 0.88));
      height = Math.max(MIN_PICTURE_HEIGHT, Math.round(height * 0.88));
    }

    attempts += 1;
  }

  const fallbackDataUrl = exportCanvas.toDataURL('image/jpeg', MIN_PICTURE_QUALITY);
  const fallbackBase64 = extractBase64Payload(fallbackDataUrl);

  if (fallbackBase64.length > MAX_PICTURE_BASE64_LENGTH) {
    throw new Error('Image is still too large after compression. Please move closer and retake the photo.');
  }

  return fallbackBase64;
};

const toFileSlug = (value: string) => {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'staff-record';
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

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
  const [activeView, setActiveView] = useState<'individual' | 'service-card' | 'export' | 'table' | 'picture' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRowId, setSelectedRowId] = useState('');
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([]);
  const [exportMessage, setExportMessage] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [editMode, setEditMode] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addPassword, setAddPassword] = useState('');
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [addFormData, setAddFormData] = useState<Record<string, string>>({});
  const [addNewCols, setAddNewCols] = useState<Array<{ id: number; label: string; value: string }>>([]);
  const [addMessage, setAddMessage] = useState('');
  const [addingRecord, setAddingRecord] = useState(false);
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editMessage, setEditMessage] = useState('');
  const [unlockingEdit, setUnlockingEdit] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');
  const [deletingRecord, setDeletingRecord] = useState(false);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkEdits, setBulkEdits] = useState<Record<string, Record<string, string>>>({});
  const [bulkPassword, setBulkPassword] = useState('');
  const [showBulkPassword, setShowBulkPassword] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');
  const [addColDialogOpen, setAddColDialogOpen] = useState(false);
  const [addColLabel, setAddColLabel] = useState('');
  const [addColPassword, setAddColPassword] = useState('');
  const [showAddColPassword, setShowAddColPassword] = useState(false);
  const [addColSaving, setAddColSaving] = useState(false);
  const [addColMessage, setAddColMessage] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [serviceCardSelectedRowIds, setServiceCardSelectedRowIds] = useState<string[]>([]);
  const [pictureUploadMessage, setPictureUploadMessage] = useState('');
  const [pictureSaving, setPictureSaving] = useState(false);
  const [pictureProcessing, setPictureProcessing] = useState(false);
  const [picturePreview, setPicturePreview] = useState<string>('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const nameColumnKey = useMemo(() => {
    const byKey = columns.find((column) => column.key.toLowerCase() === 'name');
    if (byKey) {
      return byKey.key;
    }

    const byLabel = columns.find((column) => column.label.trim().toLowerCase() === 'name');
    return byLabel?.key || '';
  }, [columns]);

  const nonEmptyRecords = useMemo(() => {
    if (!columns.length) {
      return records;
    }

    // Primary filter: only rows with actual staff name are treated as real data rows.
    if (nameColumnKey) {
      return records.filter((record) => String(record[nameColumnKey] ?? '').trim() !== '');
    }

    // Fallback if Name column is missing: ignore placeholder/formula-only style rows.
    const serialLikeKeys = new Set(['s_no', 'sno', 'serial_no', 'serial']);
    return records.filter((record) => {
      return columns
        .filter((column) => !serialLikeKeys.has(column.key.toLowerCase()))
        .some((column) => {
          const value = String(record[column.key] ?? '').trim().toLowerCase();
          return value !== '' && value !== '-' && value !== '—' && value !== 'n/a' && value !== 'na';
        });
    });
  }, [records, columns, nameColumnKey]);

  const createFormSnapshot = (record: AdminRecord | null) => {
    if (!record) {
      return {};
    }

    return Object.fromEntries(
      columns.map((column) => [column.key, String(record[column.key] ?? '')])
    );
  };

  const resetAdminActionState = () => {
    setEditMode(false);
    setEditDialogOpen(false);
    setEditPassword('');
    setShowEditPassword(false);
    setEditMessage('');
    setDeleteDialogOpen(false);
    setDeletePassword('');
    setShowDeletePassword(false);
    setDeleteConfirmText('');
    setDeleteMessage('');
    setActionMessage('');
    setSearchTerm('');
  };

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
      setServiceCardSelectedRowIds((current) => {
        const allowed = new Set((data.items || []).map((item) => item.rowId));
        return current.filter((rowId) => allowed.has(rowId));
      });
      setSourceLabel(data.source?.sheetName || 'GGSS staff sheet');
      setSelectedColumnKeys(data.columns.map((column) => column.key));
      setBulkEdits({});
      setBulkPassword('');
      setShowBulkPassword(false);
      setBulkMessage('');

      // Preserve selection if it still exists
      setSelectedRowId((current) => {
        const nextItems = data.items || [];
        if (current && nextItems.some((item) => item.rowId === current)) {
          return current;
        }
        return nextItems[0]?.rowId || '';
      });
      
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

  const selectedItem = useMemo(() => {
    if (!selectedRowId) {
      return null;
    }

    return items.find((item) => item.rowId === selectedRowId) || null;
  }, [items, selectedRowId]);

  const selectedServiceCardPreview = useMemo(() => {
    if (!selectedRecord) {
      return null;
    }

    const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isPlaceholder = (value: string) => {
      const normalized = value.trim().toLowerCase();
      return normalized === '' || normalized === '-' || normalized === '--' || normalized === 'n/a' || normalized === 'na';
    };

    const getValue = (aliases: string[]) => {
      for (const alias of aliases) {
        const directValue = String(selectedRecord[alias] ?? '').trim();
        if (!isPlaceholder(directValue)) {
          return directValue;
        }

        const normalizedAlias = normalize(alias);
        const matchedKey = Object.keys(selectedRecord).find((key) => normalize(key) === normalizedAlias);
        if (matchedKey) {
          const matchedValue = String(selectedRecord[matchedKey] ?? '').trim();
          if (!isPlaceholder(matchedValue)) {
            return matchedValue;
          }
        }

        const matchedColumn = columns.find(
          (column) => normalize(column.label) === normalizedAlias || normalize(column.key) === normalizedAlias
        );
        if (matchedColumn) {
          const columnValue = String(selectedRecord[matchedColumn.key] ?? '').trim();
          if (!isPlaceholder(columnValue)) {
            return columnValue;
          }
        }
      }

      return '';
    };

    return {
      name: selectedItem?.name?.trim() || getValue(['name', 'staffname', 'employeename']) || 'Staff Member',
      designation:
        getValue(['designation', 'designaton', 'desgination', 'post']) ||
        'PRIMARY SCHOOL TEACHER',
      personalNo:
        getValue(['personalno', 'personal_no', 'personalnumber', 'employeeid', 'empno', 'pid', 'pno', 'p_no']) ||
        '-',
      mobileNo: getValue(['mobileno', 'mobile', 'phone', 'contactno', 'contact']) || '-',
      pictureBase64:
        getValue(['picture', 'photo', 'staffphoto', 'staff_photo', 'staffpicture', 'image']) || '',
    };
  }, [selectedRecord, selectedItem, columns]);

  const itemNameByRowId = useMemo(() => {
    return new Map(items.map((item) => [item.rowId, item.name]));
  }, [items]);

  const exportableColumns = useMemo(() => {
    return columns.filter((column) => selectedColumnKeys.includes(column.key));
  }, [columns, selectedColumnKeys]);

  const addableColumns = useMemo(() => {
    return columns.filter((column) => {
      return (
        column.editable ||
        column.key.toLowerCase() === 'name' ||
        column.label.trim().toLowerCase() === 'name'
      );
    });
  }, [columns]);

  const bulkEditedRowCount = useMemo(() => Object.keys(bulkEdits).length, [bulkEdits]);

  useEffect(() => {
    if (selectedRecord && !editMode) {
      setFormData(createFormSnapshot(selectedRecord));
      return;
    }

    if (!selectedRecord) {
      setFormData({});
    }
  }, [selectedRecord, editMode, columns]);

  useEffect(() => {
    if (!selectedRowId) {
      return;
    }

    setServiceCardSelectedRowIds((current) => {
      if (current.includes(selectedRowId)) {
        return current;
      }
      return [...current, selectedRowId];
    });
  }, [selectedRowId]);

  const stopCameraStream = (keepOpenState = false) => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;

    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = null;
    }

    if (!keepOpenState) {
      setCameraOpen(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCameraStream(true);
    };
  }, []);

  useEffect(() => {
    if (activeView !== 'picture' || !selectedRecord) {
      stopCameraStream();
      setCameraError('');
    }
  }, [activeView, selectedRecord]);

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
    setFormData({});
    resetAdminActionState();
  };

  const openView = async (view: 'individual' | 'service-card' | 'export' | 'table' | 'picture') => {
    setActiveView(view);
    setExportMessage('');
    setPictureUploadMessage('');
    setPicturePreview('');

    if (!hasLoadedData && !dataLoading) {
      await loadAdminData();
    }

    if (view === 'picture' && selectedRecord && selectedRecord.picture) {
      setPicturePreview(selectedRecord.picture as string);
    }
  };

  useEffect(() => {
    if (!activeView) {
      return;
    }

    const timer = window.setTimeout(() => {
      const targetSection = document.getElementById(`admin-panel-${activeView}`);
      targetSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeView]);

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

    const exportRows = nonEmptyRecords.map((record) => {
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

  const selectAllColumns = () => {
    setSelectedColumnKeys(columns.map((column) => column.key));
    setExportMessage('All columns selected.');
  };

  const deselectAllColumns = () => {
    setSelectedColumnKeys([]);
    setExportMessage('All columns deselected.');
  };

  const exportSelectedColumnsPdf = () => {
    setExportMessage('');
    if (!exportableColumns.length) {
      setExportMessage('Select at least one column for PDF export.');
      return;
    }

    if (!nonEmptyRecords.length) {
      setExportMessage('No non-empty rows available for PDF export.');
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const margin = 24;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const rowHeight = 18;
    const headerY = 52;
    const startY = 76;
    const colWidth = Math.max(80, (pageWidth - margin * 2) / exportableColumns.length);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('GGSS Staff Export', margin, 28);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Columns: ${exportableColumns.length} | Rows: ${nonEmptyRecords.length}`, margin, 42);

    const drawHeader = (y: number) => {
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y - 12, colWidth * exportableColumns.length, rowHeight, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.rect(margin, y - 12, colWidth * exportableColumns.length, rowHeight);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      exportableColumns.forEach((column, index) => {
        const x = margin + index * colWidth + 4;
        doc.text(column.label.slice(0, 26), x, y);
      });
    };

    drawHeader(headerY);

    let cursorY = startY;
    nonEmptyRecords.forEach((record, rowIndex) => {
      if (cursorY + rowHeight > pageHeight - margin) {
        doc.addPage();
        drawHeader(headerY);
        cursorY = startY;
      }

      if (rowIndex % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, cursorY - 12, colWidth * exportableColumns.length, rowHeight, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      exportableColumns.forEach((column, index) => {
        const x = margin + index * colWidth + 4;
        const value = String(record[column.key] ?? '').replace(/\s+/g, ' ').trim();
        doc.text(value.slice(0, 30) || '-', x, cursorY);
      });

      cursorY += rowHeight;
    });

    const dateKey = new Date().toISOString().slice(0, 10);
    const nameValues = nameColumnKey
      ? nonEmptyRecords
          .map((record) => String(record[nameColumnKey] ?? '').trim())
          .filter((value) => value !== '')
      : [];
    const uniqueNames = Array.from(new Set(nameValues));
    const fileLabel = uniqueNames.length === 1 ? toFileSlug(uniqueNames[0]) : 'staff-export';

    doc.save(`ggss-${fileLabel}-${dateKey}.pdf`);
    setExportMessage(`PDF export ready with ${exportableColumns.length} selected columns.`);
  };

  const printSelectedColumns = () => {
    setExportMessage('');
    if (!exportableColumns.length) {
      setExportMessage('Select at least one column for print.');
      return;
    }

    if (!nonEmptyRecords.length) {
      setExportMessage('No non-empty rows available for print.');
      return;
    }

    const headerCells = exportableColumns
      .map((column) => `<th>${column.label}</th>`)
      .join('');

    const bodyRows = nonEmptyRecords
      .map((record) => {
        const cells = exportableColumns
          .map((column) => `<td>${String(record[column.key] ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`)
          .join('');
        return `<tr>${cells}</tr>`;
      })
      .join('');

    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    if (!printWindow) {
      setExportMessage('Unable to open print window. Allow pop-ups and try again.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>GGSS Staff Export</title>
          <style>
            body { font-family: Arial, Helvetica, sans-serif; margin: 18px; color: #0f172a; }
            h1 { margin: 0 0 6px; font-size: 18px; }
            p { margin: 0 0 12px; color: #475569; font-size: 12px; }
            table { border-collapse: collapse; width: 100%; font-size: 10px; }
            thead th { background: #f1f5f9; }
            th, td { border: 1px solid #cbd5e1; padding: 5px 6px; text-align: left; vertical-align: top; }
            tr:nth-child(even) td { background: #f8fafc; }
            @media print { body { margin: 10mm; } }
          </style>
        </head>
        <body>
          <h1>GGSS Staff Export</h1>
          <p>Columns: ${exportableColumns.length} | Rows: ${nonEmptyRecords.length}</p>
          <table>
            <thead><tr>${headerCells}</tr></thead>
            <tbody>${bodyRows}</tbody>
          </table>
          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    setExportMessage('Print view opened successfully.');
  };

  const handleSelectedStaffChange = (rowId: string) => {
    setSelectedRowId(rowId);
    resetAdminActionState();
  };

  const handleFieldChange = (key: string, value: string) => {
    setFormData((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const openEditDialog = () => {
    if (!selectedRecord) {
      setActionMessage('Select a staff member first.');
      return;
    }

    setDeleteDialogOpen(false);
    setDeleteMessage('');
    setEditMessage('');
    setActionMessage('');
    setShowEditPassword(false);
    setEditDialogOpen(true);
  };

  const openAddDialog = () => {
    const initialValues = Object.fromEntries(addableColumns.map((column) => [column.key, '']));
    setAddFormData(initialValues);
    setAddNewCols([]);
    setAddPassword('');
    setShowAddPassword(false);
    setAddMessage('');
    setAddDialogOpen(true);
  };

  const closeAddDialog = () => {
    if (addingRecord) {
      return;
    }

    setAddDialogOpen(false);
    setAddNewCols([]);
    setAddPassword('');
    setShowAddPassword(false);
    setAddMessage('');
  };

  const handleAddFieldChange = (key: string, value: string) => {
    setAddFormData((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleBulkCellChange = (
    rowId: string,
    columnKey: string,
    value: string,
    originalValue: string,
  ) => {
    setBulkEdits((current) => {
      const currentRow = current[rowId] || {};

      if (value === originalValue) {
        const { [columnKey]: _removed, ...remainingRow } = currentRow;
        if (Object.keys(remainingRow).length === 0) {
          const { [rowId]: _removedRow, ...remaining } = current;
          return remaining;
        }

        return {
          ...current,
          [rowId]: remainingRow,
        };
      }

      return {
        ...current,
        [rowId]: {
          ...currentRow,
          [columnKey]: value,
        },
      };
    });
    setBulkMessage('');
  };

  const saveAllBulkChanges = async () => {
    setBulkMessage('');

    if (!bulkEditedRowCount) {
      setBulkMessage('No pending changes to save.');
      return;
    }

    if (!bulkPassword.trim()) {
      setBulkMessage('Admin password is required to save all changes.');
      return;
    }

    const updatesList = Object.entries(bulkEdits).map(([rowId, updates]) => ({
      rowId,
      updates,
    }));

    try {
      setBulkSaving(true);
      const response = await fetch('/api/staff-records/admin', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: bulkPassword,
          updatesList,
        }),
      });
      const data = await parseAdminResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to save bulk updates.');
      }

      setBulkMessage(data.message || 'Bulk update completed successfully.');
      setBulkEditMode(false);
      await loadAdminData();
    } catch (error) {
      setBulkMessage(error instanceof Error ? error.message : 'Unable to save bulk updates.');
    } finally {
      setBulkSaving(false);
    }
  };

  const saveNewStaffRecord = async () => {
    setAddMessage('');
    const nameKey = addableColumns.find((column) => {
      return column.key.toLowerCase() === 'name' || column.label.trim().toLowerCase() === 'name';
    })?.key;

    if (!addPassword.trim()) {
      setAddMessage('Admin password is required to add a new record.');
      return;
    }

    if (nameKey && !String(addFormData[nameKey] ?? '').trim()) {
      setAddMessage('Name is required.');
      return;
    }

    try {
      setAddingRecord(true);
      const response = await fetch('/api/staff-records/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: addPassword,
          data: addFormData,
          newColumns: addNewCols
            .filter((col) => col.label.trim())
            .map((col) => ({ label: col.label.trim(), value: col.value })),
        }),
      });
      const data = await parseAdminResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to add new staff record.');
      }

      setAddDialogOpen(false);
      setActionMessage(data.message || 'New staff record added successfully.');
      await loadAdminData();
    } catch (error) {
      setAddMessage(error instanceof Error ? error.message : 'Unable to add new staff record.');
    } finally {
      setAddingRecord(false);
    }
  };

  const openAddColDialog = () => {
    setAddColLabel('');
    setAddColPassword('');
    setShowAddColPassword(false);
    setAddColMessage('');
    setAddColDialogOpen(true);
  };

  const closeAddColDialog = () => {
    if (addColSaving) return;
    setAddColDialogOpen(false);
    setAddColLabel('');
    setAddColPassword('');
    setShowAddColPassword(false);
    setAddColMessage('');
  };

  const saveNewColumn = async () => {
    setAddColMessage('');
    if (!addColLabel.trim()) {
      setAddColMessage('Column name is required.');
      return;
    }
    if (!addColPassword.trim()) {
      setAddColMessage('Admin password is required.');
      return;
    }
    try {
      setAddColSaving(true);
      const response = await fetch('/api/staff-records/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: addColPassword, columnLabel: addColLabel }),
      });
      const data = await parseAdminResponse(response);
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to add column.');
      }
      setAddColDialogOpen(false);
      setActionMessage(data.message || `Column "${addColLabel}" added successfully.`);
      await loadAdminData();
    } catch (error) {
      setAddColMessage(error instanceof Error ? error.message : 'Unable to add column.');
    } finally {
      setAddColSaving(false);
    }
  };

  const openEditDialogFromTable = (record: AdminRecord) => {
    setSelectedRowId(record.rowId);
    setDeleteDialogOpen(false);
    setDeleteMessage('');
    setEditMessage('');
    setActionMessage('');
    setShowEditPassword(false);
    setEditPassword('');
    setEditMode(false);
    setFormData(createFormSnapshot(record));
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    if (unlockingEdit) {
      return;
    }

    setEditDialogOpen(false);
    setEditMessage('');
    setShowEditPassword(false);
  };

  const openDeleteDialog = () => {
    if (!selectedRecord) {
      setActionMessage('Select a staff member first.');
      return;
    }

    setEditDialogOpen(false);
    setEditMessage('');
    setDeleteMessage('');
    setActionMessage('');
    setShowDeletePassword(false);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    if (deletingRecord) {
      return;
    }

    setDeleteDialogOpen(false);
    setDeletePassword('');
    setDeleteConfirmText('');
    setDeleteMessage('');
    setShowDeletePassword(false);
  };

  const unlockEditMode = async () => {
    setEditMessage('');
    setActionMessage('');
    setDeleteDialogOpen(false);
    setDeleteMessage('');

    if (!selectedRecord) {
      setEditMessage('Select a staff member first.');
      return;
    }

    if (!editPassword.trim()) {
      setEditMessage('Admin password is required to unlock edit mode.');
      return;
    }

    try {
      setUnlockingEdit(true);
      const response = await fetch('/api/staff-records/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: editPassword }),
      });
      const data = await parseAdminResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to unlock edit mode.');
      }

      setFormData(createFormSnapshot(selectedRecord));
      setEditMode(true);
      setEditMessage('');
      setActionMessage('');
    } catch (error) {
      setEditMode(false);
      setEditMessage(error instanceof Error ? error.message : 'Unable to unlock edit mode.');
    } finally {
      setUnlockingEdit(false);
    }
  };

  const saveAdminChanges = async () => {
    setActionMessage('');
    setEditMessage('');

    if (!selectedRecord) {
      setActionMessage('Select a staff member first.');
      return;
    }

    if (!editPassword.trim()) {
      setEditMode(false);
      setActionMessage('Admin password expired. Unlock edit mode again.');
      return;
    }

    try {
      setSavingEdit(true);
      const response = await fetch('/api/staff-records/admin', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rowId: selectedRecord.rowId,
          password: editPassword,
          updates: Object.fromEntries(columns.map((column) => [column.key, formData[column.key] ?? ''])),
        }),
      });
      const data = await parseAdminResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to save admin changes.');
      }

      setActionMessage(data.message || 'Staff record updated successfully.');
      resetAdminActionState();
      setEditDialogOpen(false);
      await loadAdminData();
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Unable to save admin changes.');
    } finally {
      setSavingEdit(false);
    }
  };

  const cancelAdminEdit = () => {
    setFormData(createFormSnapshot(selectedRecord));
    setEditMode(false);
    setEditPassword('');
    setShowEditPassword(false);
    setEditMessage('');
    setActionMessage('Edit cancelled.');
  };

  const deleteStaffRecord = async () => {
    setDeleteMessage('');
    setActionMessage('');

    if (!selectedRecord) {
      setDeleteMessage('Select a staff member first.');
      return;
    }

    if (!deletePassword.trim()) {
      setDeleteMessage('Admin password is required before deletion.');
      return;
    }

    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      setDeleteMessage('Type DELETE to confirm permanent removal.');
      return;
    }

    try {
      setDeletingRecord(true);
      const response = await fetch('/api/staff-records/admin', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rowId: selectedRecord.rowId,
          password: deletePassword,
        }),
      });
      const data = await parseAdminResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to delete staff record.');
      }

      resetAdminActionState();
      setActionMessage(data.message || 'Staff record deleted successfully.');
      await loadAdminData();
    } catch (error) {
      setDeleteMessage(error instanceof Error ? error.message : 'Unable to delete staff record.');
    } finally {
      setDeletingRecord(false);
    }
  };

  const printSelectedRecord = () => {
    if (!selectedRecord) {
      return;
    }

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
                ${selectedRecord.picture ? `<img src="data:image/jpeg;base64,${selectedRecord.picture}" alt="Photo" class="photo-slot" style="border-radius: 8px; object-fit: contain; border: 1px solid #e2e8f0;" />` : '<div class="photo-slot">Photo</div>'}
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

  const toggleServiceCardSelection = (rowId: string) => {
    setServiceCardSelectedRowIds((current) => {
      if (current.includes(rowId)) {
        return current.filter((id) => id !== rowId);
      }
      return [...current, rowId];
    });
  };

  const selectAllFilteredServiceCards = () => {
    setServiceCardSelectedRowIds((current) => {
      const ids = new Set(current);
      filteredItems.forEach((item) => ids.add(item.rowId));
      return Array.from(ids);
    });
  };

  const clearServiceCardSelection = () => {
    setServiceCardSelectedRowIds([]);
  };

  const printServiceCards = (targetRecords: AdminRecord[]) => {
    if (!targetRecords.length) {
      setActionMessage('No staff records available for service card print.');
      return;
    }

    const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isPlaceholderValue = (value: string) => {
      const normalized = value.trim().toLowerCase();
      return normalized === '' || normalized === '-' || normalized === '--' || normalized === 'n/a' || normalized === 'na';
    };

    const getRecordValue = (record: AdminRecord, aliases: string[]) => {
      for (const alias of aliases) {
        const directValue = String(record[alias] ?? '').trim();
        if (!isPlaceholderValue(directValue)) {
          return directValue;
        }

        const normalizedAlias = normalize(alias);
        const matchedKey = Object.keys(record).find((key) => normalize(key) === normalizedAlias);
        if (matchedKey) {
          const matchedValue = String(record[matchedKey] ?? '').trim();
          if (!isPlaceholderValue(matchedValue)) {
            return matchedValue;
          }
        }

        const matchedColumn = columns.find(
          (column) => normalize(column.label) === normalizedAlias || normalize(column.key) === normalizedAlias
        );
        if (matchedColumn) {
          const columnValue = String(record[matchedColumn.key] ?? '').trim();
          if (!isPlaceholderValue(columnValue)) {
            return columnValue;
          }
        }
      }

      return '';
    };

    const pagesHtml = targetRecords
      .map((record) => {
        const fallbackName = String(record.name ?? '').trim();
        const name =
          itemNameByRowId.get(record.rowId)?.trim() ||
          getRecordValue(record, ['name', 'staffname', 'employeename']) ||
          fallbackName ||
          'Staff Member';
        const fatherName = getRecordValue(record, ['father_name', 'fathername', 'fathersname', 'father name', 'sodowd']) || '-';
        const designation =
          getRecordValue(record, ['designation', 'designaton', 'desgination', 'post']) ||
          'PRIMARY SCHOOL TEACHER';
        const cnic = getRecordValue(record, ['cnic', 'nic', 'nationalid']) || '-';
        const dateOfBirth = getRecordValue(record, ['dateofbirth', 'dob', 'birthdate', 'date_of_birth']) || '-';
        const dateOfApp = getRecordValue(record, ['dateofapp', 'dateofappt', 'dateofappointment', 'doa', 'appointmentdate']) || '-';
        const personalNo =
          getRecordValue(record, ['personalno', 'personal_no', 'personalnumber', 'employeeid', 'empno', 'pid', 'pno', 'p_no']) || '-';
        const placeOfPosting = getRecordValue(record, ['placeofposting', 'posting', 'place_of_posting', 'school']) || 'G.G.S.S NISHTAR ROAD KHI.';
        const residentialAddress =
          getRecordValue(record, [
            'residentialaddress',
            'residential_address',
            'address',
            'residenceaddress',
            'homeaddress',
            'currentaddress',
            'current_address',
            'permanentaddress',
            'permanent_address',
          ]) || '-';
        const mobileNo = getRecordValue(record, ['mobileno', 'mobile', 'phone', 'contactno', 'contact']) || '-';
        const pictureBase64 =
          getRecordValue(record, ['picture', 'photo', 'staffphoto', 'staff_photo', 'staffpicture', 'image']) || '';

        const photoHtml = pictureBase64
          ? `<img src="data:image/jpeg;base64,${pictureBase64}" alt="${escapeHtml(name)}" class="photo" />`
          : '<div class="photo placeholder">PHOTO</div>';

        return `
          <section class="page">
            <div class="sheet">
              <section class="card front">
                <div class="front-main">
                  <div class="front-header">
                    <img src="/images/Logo_Government_of_Sindh_Pakistan.png" alt="Government of Sindh" class="logo" />
                  </div>

                  <div class="line"><span class="label">NAME</span><span class="value underlined">: ${escapeHtml(name)}</span></div>
                  <div class="line"><span class="label">FATHER NAME</span><span class="value underlined">: ${escapeHtml(fatherName)}</span></div>
                  <div class="line"><span class="label">DESIGNATION</span><span class="value underlined">: ${escapeHtml(designation)}</span></div>
                  <div class="line"><span class="label">CNIC</span><span class="value underlined">: ${escapeHtml(cnic)}</span></div>
                  <div class="line"><span class="label">DATE OF BIRTH</span><span class="value underlined">: ${escapeHtml(dateOfBirth)}</span></div>
                  <div class="line"><span class="label">DATE OF APPT.</span><span class="value underlined">: ${escapeHtml(dateOfApp)}</span></div>
                </div>

                <div class="front-side">
                  <div class="gov-strip">
                    <span>GOVERNMENT OF SINDH</span>
                    <span>EDUCATION DEPARTMENT</span>
                  </div>
                  <div class="personal">Personal No. ${escapeHtml(personalNo)}</div>
                  ${photoHtml}
                  <div class="sign">Signature of Officer</div>
                </div>
              </section>

              <section class="card back">
                <div class="line back-line"><span class="label">PLACE OF POSTING</span><span class="value underlined">: ${escapeHtml(placeOfPosting)}</span></div>
                <div class="line back-line"><span class="label">RESIDENTIAL ADDRESS</span><span class="value">:</span></div>
                <div class="addr">${escapeHtml(residentialAddress)}</div>
                <div class="line back-line" style="margin-top: 2.1mm;"><span class="label">MOBILE NO.</span><span class="value underlined">: ${escapeHtml(mobileNo)}</span></div>
              </section>
            </div>
          </section>
        `;
      })
      .join('');

    const leadName =
      itemNameByRowId.get(targetRecords[0].rowId)?.trim() ||
      String(targetRecords[0].name ?? '').trim() ||
      'staff';
    const fileSuffix = targetRecords.length === 1 ? toFileSlug(leadName) : `${targetRecords.length}-records`;

    const printWindow = window.open('', '_blank', 'width=1280,height=800');
    if (!printWindow) {
      setActionMessage('Unable to open print preview. Please allow pop-ups.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${escapeHtml(`ggss-service-card-${fileSuffix}`)}</title>
          <style>
            @page { size: A4 landscape; margin: 8mm; }
            * { box-sizing: border-box; }
            body { margin: 0; font-family: 'Times New Roman', serif; background: #f1f5f9; color: #0f172a; }
            .page { min-height: calc(210mm - 16mm); display: flex; align-items: center; justify-content: center; page-break-after: always; }
            .page:last-child { page-break-after: auto; }
            .sheet { display: flex; align-items: center; justify-content: center; gap: 8mm; padding: 4mm; }
            .card { width: 85.6mm; height: 54mm; background: #f2ecfb; border: 0.3mm solid #cbbbe6; border-radius: 3.2mm; overflow: hidden; box-shadow: 0 1.2mm 2.2mm rgba(15, 23, 42, 0.12); }
            .front { display: grid; grid-template-columns: 1fr 24.5mm; }
            .front-main { padding: 2.1mm 2.4mm 2.2mm; position: relative; }
            .front-header { display: block; margin-bottom: 0.8mm; }
            .logo { width: 11.2mm; height: 11.2mm; object-fit: contain; }
            .line { display: grid; grid-template-columns: 16.1mm 1fr; gap: 0.95mm; margin-bottom: 0.7mm; font-size: 2.45mm; line-height: 1.1; }
            .label { font-weight: 700; color: #111827; letter-spacing: 0.03mm; }
            .value { font-weight: 700; color: #0f172a; text-transform: uppercase; }
            .front-side { border-left: 0.3mm solid #7ba4c6; background: #edf2fb; padding: 0; display: flex; flex-direction: column; align-items: stretch; }
            .gov-strip { display: grid; grid-template-rows: 1fr 1fr; height: 17.8mm; text-align: center; font-weight: 700; letter-spacing: 0.04mm; color: #ffffff; text-transform: uppercase; }
            .gov-strip span { display: flex; align-items: center; justify-content: center; font-size: 2.05mm; line-height: 1.08; padding: 0 0.8mm; }
            .gov-strip span:first-child { background: #188a47; }
            .gov-strip span:last-child { background: #1d4ed8; }
            .personal { margin: 1.1mm 0.8mm 0.9mm; border: 0.22mm solid #6b7280; border-radius: 0.8mm; background: #ffffff; font-size: 1.85mm; font-weight: 700; color: #111827; letter-spacing: 0.03mm; text-align: center; padding: 0.65mm 0.5mm; white-space: nowrap; }
            .photo { width: 18.8mm; height: 22.6mm; border-radius: 0.95mm; border: 0.24mm solid #8798b7; object-fit: cover; background: #fff; margin: 0 auto; }
            .photo.placeholder { display: flex; align-items: center; justify-content: center; color: #475569; font-size: 1.8mm; font-weight: 700; letter-spacing: 0.11mm; }
            .sign { text-align: center; font-size: 1.6mm; color: #111827; margin: 0.8mm 0.8mm 0; width: auto; }
            .sign::before { content: ''; display: block; border-top: 0.22mm solid #1f2937; margin-bottom: 0.45mm; }
            .back { padding: 3.2mm 3.1mm 2.5mm; display: flex; flex-direction: column; justify-content: flex-start; }
            .line.back-line { grid-template-columns: 25.2mm 1fr; margin-bottom: 1.45mm; }
            .addr { min-height: 14.8mm; border-bottom: 0.22mm solid #1f2937; font-size: 2.2mm; line-height: 1.2; font-weight: 700; text-transform: uppercase; background: transparent; margin-top: 0.2mm; padding: 0 0 0.45mm; }
            .underlined { border-bottom: 0.22mm solid #1f2937; padding-bottom: 0.35mm; min-height: 3.1mm; }
            @media print { body { background: #fff; } .card { box-shadow: none; } }
          </style>
        </head>
        <body>
          ${pagesHtml}
          <script>
            window.onload = function () { window.print(); };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setActionMessage(`Opened print preview for ${targetRecords.length} service card(s).`);
  };

  const printServiceCard = () => {
    if (!selectedRecord) {
      setActionMessage('Select a staff member first.');
      return;
    }

    printServiceCards([selectedRecord]);
  };

  const printSelectedServiceCards = () => {
    const selectedRecords = nonEmptyRecords.filter((record) => serviceCardSelectedRowIds.includes(record.rowId));
    if (!selectedRecords.length) {
      setActionMessage('Select one or more staff members for bulk service card print.');
      return;
    }

    printServiceCards(selectedRecords);
  };

  const printAllServiceCards = () => {
    printServiceCards(nonEmptyRecords);
  };

  const handlePictureFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setPictureProcessing(true);
      setCameraError('');
      setPictureUploadMessage('Processing image and compressing size...');

      const image = await loadImageElement(file);
      const canvas = document.createElement('canvas');
      canvas.width = PICTURE_TARGET_WIDTH;
      canvas.height = PICTURE_TARGET_HEIGHT;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Image processing is not supported in this browser.');
      }

      drawCenteredCrop(
        context,
        image,
        image.naturalWidth || image.width,
        image.naturalHeight || image.height,
        PICTURE_TARGET_WIDTH,
        PICTURE_TARGET_HEIGHT
      );

      const compressedBase64 = compressCanvasToJpegBase64(canvas);
      setPicturePreview(compressedBase64);
      setPictureUploadMessage('Image ready. Auto-compressed and centered. Click "Save Picture" to update.');
    } catch (error) {
      setPictureUploadMessage(error instanceof Error ? error.message : 'Unable to process image.');
    } finally {
      setPictureProcessing(false);
      event.target.value = '';
    }
  };

  const startCameraCapture = async () => {
    if (!selectedRecord) {
      setCameraError('Please select a staff member first.');
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera is not supported in this browser.');
      return;
    }

    try {
      setCameraStarting(true);
      setCameraError('');
      setPictureUploadMessage('Starting camera...');

      stopCameraStream(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1080 },
          height: { ideal: 1350 },
        },
        audio: false,
      });

      cameraStreamRef.current = stream;
      setCameraOpen(true);

      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
        await cameraVideoRef.current.play();
      }

      setPictureUploadMessage('Camera ready. Keep face centered inside the frame, then capture.');
    } catch (error) {
      stopCameraStream();
      const message = error instanceof Error ? error.message : 'Unable to access camera.';
      setCameraError(message);
      setPictureUploadMessage(message);
    } finally {
      setCameraStarting(false);
    }
  };

  const capturePhotoFromCamera = async () => {
    if (!cameraVideoRef.current || !cameraCanvasRef.current) {
      setCameraError('Camera preview is not ready yet.');
      return;
    }

    const video = cameraVideoRef.current;
    const canvas = cameraCanvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError('Camera preview is not ready yet.');
      return;
    }

    try {
      setPictureProcessing(true);
      setCameraError('');
      setPictureUploadMessage('Capturing and compressing photo...');

      canvas.width = PICTURE_TARGET_WIDTH;
      canvas.height = PICTURE_TARGET_HEIGHT;
      drawCenteredCrop(context, video, video.videoWidth, video.videoHeight, PICTURE_TARGET_WIDTH, PICTURE_TARGET_HEIGHT);

      const compressedBase64 = compressCanvasToJpegBase64(canvas);
      setPicturePreview(compressedBase64);
      setPictureUploadMessage('Camera photo ready. Auto-compressed and centered. Click "Save Picture" to update.');
      stopCameraStream();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to capture photo.';
      setCameraError(message);
      setPictureUploadMessage(message);
    } finally {
      setPictureProcessing(false);
    }
  };

  const savePictureToSheet = async () => {
    if (!selectedRecord || !picturePreview) {
      setPictureUploadMessage('Please upload an image first.');
      return;
    }

    if (!editPassword.trim()) {
      setPictureUploadMessage('Admin password required to save picture.');
      return;
    }

    try {
      setPictureSaving(true);
      const response = await fetch('/api/staff-records/admin', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rowId: selectedRecord.rowId,
          password: editPassword,
          updates: { picture: picturePreview },
        }),
      });
      const data = await parseAdminResponse(response);

      if (!response.ok || !data.success) {
        setPictureUploadMessage(data.message || 'Unable to save picture.');
        return;
      }

      setPictureUploadMessage('Picture saved successfully!');
      setEditPassword('');
      await loadAdminData();
    } catch (error) {
      setPictureUploadMessage(error instanceof Error ? error.message : 'Unable to save picture.');
    } finally {
      setPictureSaving(false);
    }
  };

  const removePicturePreview = () => {
    setPicturePreview('');
    setPictureUploadMessage('');
    setCameraError('');
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
            Access the full Google Sheet, inspect individual staff records, and export selected columns to Excel.
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
                GGSS NISHTAR ROAD (Admin Dashboard)
              </p>
              <h1 className="mt-4 text-3xl font-black text-slate-900 sm:text-4xl">Staff Sheet Control Center</h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
                View the complete staff sheet in table format, inspect any individual record, and export selected columns to Excel.
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

        </section>

        {dataError ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{dataError}</p> : null}
        {dataLoading ? <p className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">Loading admin data...</p> : null}

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-slate-900">Admin Actions</h2>
            <p className="text-sm text-slate-600">
              Use the action buttons below to open only the panel you need. All data panels remain hidden by default for a cleaner workspace.
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
                <p className="mt-1 text-xs text-slate-500">Open the complete spreadsheet table with compact view</p>
              </button>

              <button
                type="button"
                onClick={() => void openView('export')}
                className={`rounded-2xl border px-5 py-4 text-left transition ${activeView === 'export' ? 'border-cyan-500 bg-cyan-50 text-cyan-800' : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-cyan-300'}`}
              >
                <p className="text-sm font-bold">Export Selected Columns</p>
                <p className="mt-1 text-xs text-slate-500">Choose only needed columns and download Excel</p>
              </button>

              <button
                type="button"
                onClick={() => void openView('picture')}
                className={`rounded-2xl border px-5 py-4 text-left transition ${activeView === 'picture' ? 'border-cyan-500 bg-cyan-50 text-cyan-800' : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-cyan-300'}`}
              >
                <p className="text-sm font-bold">Staff Picture Upload</p>
                <p className="mt-1 text-xs text-slate-500">Upload or change staff member photo</p>
              </button>

              <button
                type="button"
                onClick={() => void openView('service-card')}
                className={`rounded-2xl border px-5 py-4 text-left transition ${activeView === 'service-card' ? 'border-cyan-500 bg-cyan-50 text-cyan-800' : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-cyan-300'}`}
              >
                <p className="text-sm font-bold">Service Card (Front/Back)</p>
                <p className="mt-1 text-xs text-slate-500">Open service card panel for single, selected, or all print</p>
              </button>

              <button
                type="button"
                onClick={openAddDialog}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-left text-slate-800 transition hover:border-cyan-300"
              >
                <p className="text-sm font-bold">Add New Data</p>
                <p className="mt-1 text-xs text-slate-500">Create a new staff row directly from admin panel</p>
              </button>

              <button
                type="button"
                onClick={openAddColDialog}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-left text-slate-800 transition hover:border-purple-300"
              >
                <p className="text-sm font-bold">Add New Column</p>
                <p className="mt-1 text-xs text-slate-500">Append a new column (e.g. DDO Code, Semiscode) to the sheet</p>
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
          <section id="admin-panel-individual" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">Individual Staff View</h2>
                <p className="mt-1 text-sm text-slate-600">Select a staff member to view and manage details</p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search name or S.No"
                  className="min-h-[46px] w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 sm:w-56"
                />
              </div>
            </div>

            <div className="mt-4 max-w-2xl">
              <label htmlFor="admin-staff-select" className="mb-2 block text-sm font-medium text-slate-700">Select Staff Member</label>
              <select
                id="admin-staff-select"
                value={selectedRowId}
                onChange={(event) => handleSelectedStaffChange(event.target.value)}
                className="min-h-[48px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500"
              >
                <option value="">Choose staff member...</option>
                {filteredItems.map((item) => (
                  <option key={item.rowId} value={item.rowId}>
                    {item.sno ? `${item.sno} - ` : ''}{item.name}
                  </option>
                ))}
              </select>
            </div>

            {!selectedRecord ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                <p className="text-sm text-slate-500">Select a staff member to view and edit details</p>
              </div>
            ) : (
              <>
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">Staff Name</p>
                      <h3 className="mt-2 text-lg font-bold text-slate-900">{selectedItem?.name || 'Unknown'}</h3>
                      <p className="mt-1 text-xs text-slate-500">Row ID: {selectedRecord.rowId}{selectedItem?.sno ? ` | S.No: ${selectedItem.sno}` : ''}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={printSelectedRecord}
                        disabled={!selectedRecord}
                        className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Print A4
                      </button>
                      <button
                        type="button"
                        onClick={() => void openView('service-card')}
                        disabled={!selectedRecord}
                        className="rounded-xl bg-cyan-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Service Card Panel
                      </button>
                      <button
                        type="button"
                        onClick={openEditDialog}
                        className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-600"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={openDeleteDialog}
                        className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {columns.map((column) => {
                    const currentValue = String(selectedRecord[column.key] ?? '');
                    return (
                      <div key={column.key} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                        <p className="text-xs font-semibold uppercase text-slate-500">{column.label}</p>
                        <p className="mt-1 break-words text-sm font-medium text-slate-800">{currentValue || '—'}</p>
                      </div>
                    );
                  })}
                </div>

                {actionMessage ? (
                  <p className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${actionMessage.toLowerCase().includes('success') || actionMessage.toLowerCase().includes('updated') || actionMessage.toLowerCase().includes('deleted') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {actionMessage}
                  </p>
                ) : null}
              </>
            )}
          </section>
        ) : null}

        {activeView === 'service-card' ? (
          <section id="admin-panel-service-card" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">Service Card Print Panel</h2>
                <p className="mt-1 text-sm text-slate-600">Select one, multiple, or all staff records and print front/back on the same page.</p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search name or S.No"
                  className="min-h-[46px] w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 sm:w-56"
                />
              </div>
            </div>

            <div className="mt-4 max-w-2xl">
              <label htmlFor="service-card-staff-select" className="mb-2 block text-sm font-medium text-slate-700">Select Staff Member</label>
              <select
                id="service-card-staff-select"
                value={selectedRowId}
                onChange={(event) => handleSelectedStaffChange(event.target.value)}
                className="min-h-[48px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500"
              >
                <option value="">Choose staff member...</option>
                {filteredItems.map((item) => (
                  <option key={item.rowId} value={item.rowId}>
                    {item.sno ? `${item.sno} - ` : ''}{item.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid gap-4 xl:grid-cols-[minmax(220px,1fr)_minmax(300px,1.2fr)_auto] xl:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">Current Selection</p>
                  <h3 className="mt-2 text-lg font-bold text-slate-900">{selectedItem?.name || 'No staff selected'}</h3>
                  {selectedRecord ? (
                    <p className="mt-1 text-xs text-slate-500">Row ID: {selectedRecord.rowId}{selectedItem?.sno ? ` | S.No: ${selectedItem.sno}` : ''}</p>
                  ) : null}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  {selectedServiceCardPreview ? (
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-12 overflow-hidden rounded-md border border-slate-300 bg-slate-100">
                        {selectedServiceCardPreview.pictureBase64 ? (
                          <img
                            src={`data:image/jpeg;base64,${selectedServiceCardPreview.pictureBase64}`}
                            alt={selectedServiceCardPreview.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-slate-500">PHOTO</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-bold uppercase tracking-wide text-slate-700">Service Card Preview</p>
                        <p className="truncate text-sm font-bold text-slate-900">{selectedServiceCardPreview.name}</p>
                        <p className="truncate text-[11px] font-semibold uppercase text-slate-600">{selectedServiceCardPreview.designation}</p>
                        <p className="mt-1 text-[11px] text-slate-600">Personal No: <span className="font-semibold text-slate-800">{selectedServiceCardPreview.personalNo}</span></p>
                        <p className="text-[11px] text-slate-600">Mobile: <span className="font-semibold text-slate-800">{selectedServiceCardPreview.mobileNo}</span></p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-16 items-center justify-center text-xs text-slate-500">Select a staff member to preview card details.</div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 xl:justify-end">
                  <button
                    type="button"
                    onClick={printServiceCard}
                    disabled={!selectedRecord}
                    className="rounded-xl bg-cyan-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Print Selected Staff
                  </button>
                  <button
                    type="button"
                    onClick={printSelectedServiceCards}
                    disabled={!serviceCardSelectedRowIds.length}
                    className="rounded-xl bg-indigo-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Print Multiple ({serviceCardSelectedRowIds.length})
                  </button>
                  <button
                    type="button"
                    onClick={printAllServiceCards}
                    disabled={!nonEmptyRecords.length}
                    className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Print All ({nonEmptyRecords.length})
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">Bulk Selection</p>
                  <p className="mt-1 text-xs text-slate-500">Mark teachers below and click Print Multiple.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={selectAllFilteredServiceCards}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700"
                  >
                    Select All (Filtered)
                  </button>
                  <button
                    type="button"
                    onClick={clearServiceCardSelection}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-700"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>

              <div className="mt-3 max-h-52 overflow-y-auto rounded-xl border border-slate-200 p-2">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredItems.map((item) => {
                    const checked = serviceCardSelectedRowIds.includes(item.rowId);
                    return (
                      <label
                        key={`service-card-panel-${item.rowId}`}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-2 text-xs text-slate-700 hover:border-cyan-300"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleServiceCardSelection(item.rowId)}
                          className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                        />
                        <span className="truncate">{item.sno ? `${item.sno} - ` : ''}{item.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {actionMessage ? (
              <p className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${actionMessage.toLowerCase().includes('opened') || actionMessage.toLowerCase().includes('print preview') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {actionMessage}
              </p>
            ) : null}
          </section>
        ) : null}

        {editDialogOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Edit Staff Record</h3>
                  <p className="mt-1 text-sm text-slate-600">{selectedItem?.name || 'Staff Record'}</p>
                </div>
                <button
                  type="button"
                  onClick={closeEditDialog}
                  className="text-slate-400 transition hover:text-slate-600"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {!editMode ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-900">Verification Required</p>
                  <p className="mt-2 text-sm text-amber-800">Enter admin password to unlock edit mode</p>
                  
                  <div className="mt-4 space-y-3">
                    <div>
                      <label htmlFor="edit-modal-password" className="block text-sm font-medium text-slate-700">
                        Admin Password
                      </label>
                      <div className="relative mt-2">
                        <input
                          id="edit-modal-password"
                          type={showEditPassword ? 'text' : 'password'}
                          value={editPassword}
                          onChange={(event) => setEditPassword(event.target.value)}
                          placeholder="Enter password"
                          className="min-h-[44px] w-full rounded-lg border border-slate-300 px-4 py-2 pr-12 text-sm outline-none transition focus:border-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEditPassword((current) => !current)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
                          aria-label={showEditPassword ? 'Hide password' : 'Show password'}
                        >
                          {showEditPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                        </button>
                      </div>
                    </div>

                    {editMessage ? (
                      <p className={`rounded-lg px-3 py-2 text-sm ${editMode ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {editMessage}
                      </p>
                    ) : null}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={unlockEditMode}
                        disabled={unlockingEdit}
                        className="flex-1 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {unlockingEdit ? 'Verifying...' : 'Unlock Edit'}
                      </button>
                      <button
                        type="button"
                        onClick={closeEditDialog}
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    {columns.map((column) => {
                      const currentValue = String(formData[column.key] ?? '');
                      const fieldId = `edit-modal-field-${column.key}`;
                      return (
                        <div key={column.key}>
                          <label htmlFor={fieldId} className="block text-xs font-semibold uppercase text-slate-600">
                            {column.label}
                          </label>
                          {column.editable ? (
                            <input
                              id={fieldId}
                              type="text"
                              value={currentValue}
                              onChange={(event) => handleFieldChange(column.key, event.target.value)}
                              className="mt-1.5 min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-emerald-500"
                            />
                          ) : (
                            <p className="mt-1.5 min-h-[40px] flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                              {currentValue || '—'} <span className="ml-2 text-xs text-slate-400">(read-only)</span>
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={saveAdminChanges}
                      disabled={savingEdit}
                      className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {savingEdit ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelAdminEdit}
                      disabled={savingEdit}
                      className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {addDialogOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-3xl space-y-4 overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Add New Staff Data</h3>
                  <p className="mt-1 text-sm text-slate-600">Fill fields and submit to create a new staff row.</p>
                </div>
                <button
                  type="button"
                  onClick={closeAddDialog}
                  className="text-slate-400 transition hover:text-slate-600"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {addableColumns.map((column) => {
                  const fieldId = `add-field-${column.key}`;
                  return (
                    <div key={column.key}>
                      <label htmlFor={fieldId} className="block text-xs font-semibold uppercase text-slate-600">
                        {column.label}
                      </label>
                      <input
                        id={fieldId}
                        type="text"
                        value={String(addFormData[column.key] ?? '')}
                        onChange={(event) => handleAddFieldChange(column.key, event.target.value)}
                        className="mt-1.5 min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-cyan-500"
                      />
                    </div>
                  );
                })}
              </div>

              {/* ── Add New Column section ── */}
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">Add New Column (Optional)</p>
                  <button
                    type="button"
                    onClick={() =>
                      setAddNewCols((current) => [
                        ...current,
                        { id: Date.now(), label: '', value: '' },
                      ])
                    }
                    className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-cyan-700"
                  >
                    + Add Column
                  </button>
                </div>
                {addNewCols.length === 0 && (
                  <p className="text-xs text-slate-400">
                    Use this to add a new column (e.g. DDO Code, Semiscode) that does not exist in the sheet yet.
                  </p>
                )}
                {addNewCols.length > 0 && (
                  <div className="space-y-2">
                    {addNewCols.map((col) => (
                      <div key={col.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={col.label}
                          onChange={(event) =>
                            setAddNewCols((current) =>
                              current.map((c) =>
                                c.id === col.id ? { ...c, label: event.target.value } : c,
                              ),
                            )
                          }
                          placeholder="Column name (e.g. DDO Code)"
                          aria-label="New column name"
                          className="min-h-[36px] w-1/2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500"
                        />
                        <input
                          type="text"
                          value={col.value}
                          onChange={(event) =>
                            setAddNewCols((current) =>
                              current.map((c) =>
                                c.id === col.id ? { ...c, value: event.target.value } : c,
                              ),
                            )
                          }
                          placeholder="Value"
                          aria-label="New column value"
                          className="min-h-[36px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 outline-none transition focus:border-cyan-500"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setAddNewCols((current) => current.filter((c) => c.id !== col.id))
                          }
                          className="shrink-0 rounded-lg border border-red-200 px-2 py-1.5 text-xs text-red-500 transition hover:bg-red-50"
                          aria-label="Remove column"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="add-admin-password" className="block text-sm font-medium text-slate-700">
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    id="add-admin-password"
                    type={showAddPassword ? 'text' : 'password'}
                    value={addPassword}
                    onChange={(event) => setAddPassword(event.target.value)}
                    placeholder="Enter admin password"
                    className="min-h-[44px] w-full rounded-lg border border-slate-300 px-4 py-2 pr-12 text-sm outline-none transition focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
                    aria-label={showAddPassword ? 'Hide password' : 'Show password'}
                  >
                    {showAddPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                  </button>
                </div>
              </div>

              {addMessage ? (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{addMessage}</p>
              ) : null}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={saveNewStaffRecord}
                  disabled={addingRecord}
                  className="flex-1 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {addingRecord ? 'Adding...' : 'Add Data'}
                </button>
                <button
                  type="button"
                  onClick={closeAddDialog}
                  disabled={addingRecord}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {addColDialogOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md space-y-5 rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Add New Column</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Adds a new column to the sheet for all staff (existing rows will have it empty).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeAddColDialog}
                  className="text-slate-400 transition hover:text-slate-600"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div>
                <label htmlFor="add-col-label" className="block text-xs font-semibold uppercase text-slate-600">
                  Column Name
                </label>
                <input
                  id="add-col-label"
                  type="text"
                  value={addColLabel}
                  onChange={(event) => setAddColLabel(event.target.value)}
                  placeholder="e.g. DDO Code, Semiscode, CNIC"
                  className="mt-1.5 min-h-[40px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-purple-500"
                />
              </div>

              <div>
                <label htmlFor="add-col-password" className="block text-sm font-medium text-slate-700">
                  Admin Password
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="add-col-password"
                    type={showAddColPassword ? 'text' : 'password'}
                    value={addColPassword}
                    onChange={(event) => setAddColPassword(event.target.value)}
                    placeholder="Enter admin password"
                    className="min-h-[44px] w-full rounded-lg border border-slate-300 px-4 py-2 pr-12 text-sm outline-none transition focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddColPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
                    aria-label={showAddColPassword ? 'Hide password' : 'Show password'}
                  >
                    {showAddColPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                  </button>
                </div>
              </div>

              {addColMessage ? (
                <p className={`rounded-xl px-3 py-2 text-sm font-medium ${addColMessage.toLowerCase().includes('success') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                  {addColMessage}
                </p>
              ) : null}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={saveNewColumn}
                  disabled={addColSaving}
                  className="flex-1 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {addColSaving ? 'Adding Column...' : 'Add Column'}
                </button>
                <button
                  type="button"
                  onClick={closeAddColDialog}
                  disabled={addColSaving}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {deleteDialogOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-rose-700">Delete Staff Record</h3>
                <button
                  type="button"
                  onClick={closeDeleteDialog}
                  className="text-slate-400 transition hover:text-slate-600"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 rounded-lg border border-rose-200 bg-rose-50 p-4">
                <p className="text-sm font-semibold text-rose-900">Permanent Delete</p>
                <p className="text-sm text-rose-800">
                  Yeh action select kiye huay staff record ko permanently sheet se delete kar dega. Isko undo nahi kar sakty.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor="delete-modal-password" className="block text-sm font-medium text-slate-700">
                    Confirm Password
                  </label>
                  <div className="relative mt-2">
                    <input
                      id="delete-modal-password"
                      type={showDeletePassword ? 'text' : 'password'}
                      value={deletePassword}
                      onChange={(event) => setDeletePassword(event.target.value)}
                      placeholder="Enter password"
                      className="min-h-[44px] w-full rounded-lg border border-slate-300 px-4 py-2 pr-12 text-sm outline-none transition focus:border-rose-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDeletePassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
                      aria-label={showDeletePassword ? 'Hide password' : 'Show password'}
                    >
                      {showDeletePassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="delete-modal-confirm" className="block text-sm font-medium text-slate-700">
                    Type <span className="font-bold">DELETE</span> to confirm
                  </label>
                  <input
                    id="delete-modal-confirm"
                    type="text"
                    value={deleteConfirmText}
                    onChange={(event) => setDeleteConfirmText(event.target.value)}
                    placeholder="DELETE"
                    className="mt-2 min-h-[44px] w-full rounded-lg border border-slate-300 px-4 py-2 text-sm uppercase outline-none transition focus:border-rose-500"
                  />
                </div>

                {deleteMessage ? (
                  <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{deleteMessage}</p>
                ) : null}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={deleteStaffRecord}
                  disabled={deletingRecord}
                  className="flex-1 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {deletingRecord ? 'Deleting...' : 'Delete Permanently'}
                </button>
                <button
                  type="button"
                  onClick={closeDeleteDialog}
                  disabled={deletingRecord}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {activeView === 'export' ? (
          <section id="admin-panel-export" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Excel Export</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Select only the columns you want to export. The downloaded file will include all staff rows.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={selectAllColumns}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={deselectAllColumns}
                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-700"
                >
                  Deselect All
                </button>
                <button
                  type="button"
                  onClick={exportSelectedColumns}
                  className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Export Excel
                </button>
                <button
                  type="button"
                  onClick={exportSelectedColumnsPdf}
                  className="rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
                >
                  Export PDF
                </button>
                <button
                  type="button"
                  onClick={printSelectedColumns}
                  className="rounded-2xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Print
                </button>
              </div>
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
          <section id="admin-panel-table" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold text-slate-900">All Staff Data</h2>
              <p className="text-sm text-slate-500">Compact spreadsheet view with horizontal and vertical scrolling</p>
            </div>

            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setBulkEditMode((current) => {
                        const next = !current;
                        if (!next) {
                          setBulkEdits({});
                          setBulkPassword('');
                          setShowBulkPassword(false);
                          setBulkMessage('Bulk edit mode closed.');
                        } else {
                          setBulkMessage('Bulk edit mode enabled. Edit multiple cells, then save all changes.');
                        }
                        return next;
                      });
                    }}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${bulkEditMode ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-slate-900 text-white hover:bg-slate-700'}`}
                  >
                    {bulkEditMode ? 'Exit Bulk Edit' : 'Enable Bulk Edit'}
                  </button>
                  <span className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                    Changed Rows: {bulkEditedRowCount}
                  </span>
                  <button
                    type="button"
                    onClick={openAddColDialog}
                    className="rounded-xl border border-purple-300 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-100"
                  >
                    + Add New Column
                  </button>
                </div>

                {bulkEditMode ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <input
                        type={showBulkPassword ? 'text' : 'password'}
                        value={bulkPassword}
                        onChange={(event) => setBulkPassword(event.target.value)}
                        placeholder="Admin password"
                        className="min-h-[40px] rounded-xl border border-slate-300 bg-white px-3 py-2 pr-10 text-sm outline-none transition focus:border-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowBulkPassword((current) => !current)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-700"
                        aria-label={showBulkPassword ? 'Hide password' : 'Show password'}
                      >
                        {showBulkPassword ? <IoEyeOffOutline size={16} /> : <IoEyeOutline size={16} />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={saveAllBulkChanges}
                      disabled={bulkSaving || !bulkEditedRowCount}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {bulkSaving ? 'Saving All...' : 'Save All Changes'}
                    </button>
                  </div>
                ) : null}
              </div>

              {bulkMessage ? (
                <p className={`mt-2 rounded-xl px-3 py-2 text-xs font-medium ${bulkMessage.toLowerCase().includes('success') || bulkMessage.toLowerCase().includes('updated') || bulkMessage.toLowerCase().includes('enabled') ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {bulkMessage}
                </p>
              ) : null}
            </div>

            <div className="mt-4 h-[70vh] overflow-auto rounded-2xl border border-slate-200">
              <table className="min-w-max border-collapse text-xs sm:text-sm">
                <thead className="sticky top-0 z-10 bg-slate-100 text-left text-slate-700">
                  <tr>
                    <th className="whitespace-nowrap border-b border-slate-200 px-2.5 py-2 font-semibold">
                      Actions
                    </th>
                    {columns.map((column) => (
                      <th key={column.key} className="whitespace-nowrap border-b border-slate-200 px-2.5 py-2 font-semibold">
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {nonEmptyRecords.map((record, rowIndex) => (
                    <tr key={`row-${rowIndex + 1}`} className="odd:bg-white even:bg-slate-50">
                      <td className="whitespace-nowrap border-b border-slate-100 px-2.5 py-1.5 text-slate-700">
                        <button
                          type="button"
                          onClick={() => openEditDialogFromTable(record)}
                          className="rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-amber-600"
                        >
                          Edit
                        </button>
                      </td>
                      {columns.map((column) => (
                        <td key={`${rowIndex + 1}-${column.key}`} className="whitespace-nowrap border-b border-slate-100 px-2.5 py-1.5 text-slate-700">
                          {bulkEditMode && column.editable ? (
                            <input
                              type="text"
                              value={
                                bulkEdits[String(record.rowId)]?.[column.key] ??
                                String(record[column.key] ?? '')
                              }
                              onChange={(event) => {
                                const rowId = String(record.rowId);
                                const originalValue = String(record[column.key] ?? '');
                                handleBulkCellChange(rowId, column.key, event.target.value, originalValue);
                              }}
                              aria-label={`Edit ${column.label} for row ${record.rowId}`}
                              placeholder={column.label}
                              className="min-h-[30px] w-44 rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 outline-none transition focus:border-cyan-500"
                            />
                          ) : (
                            String(record[column.key] ?? '')
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {nonEmptyRecords.length === 0 ? (
              <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">No non-empty staff rows available to display.</p>
            ) : null}
          </section>
        ) : null}

        {activeView === 'picture' ? (
          <section id="admin-panel-picture" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Staff Picture Upload</h2>
            <p className="mt-1 text-sm text-slate-600">Select a staff member and upload their photo. System khud auto-compress karke centered JPEG save karega.</p>

            <div className="mt-4 max-w-2xl">
              <label htmlFor="picture-staff-select" className="mb-2 block text-sm font-medium text-slate-700">Select Staff Member</label>
              <select
                id="picture-staff-select"
                value={selectedRowId}
                onChange={(event) => {
                  handleSelectedStaffChange(event.target.value);
                  const newRecord = records.find((r) => r.rowId === event.target.value);
                  setPicturePreview(newRecord?.picture ? String(newRecord.picture) : '');
                }}
                className="min-h-[48px] w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500"
              >
                <option value="">Choose staff member...</option>
                {filteredItems.map((item) => (
                  <option key={item.rowId} value={item.rowId}>
                    {item.sno ? `${item.sno} - ` : ''}{item.name}
                  </option>
                ))}
              </select>
            </div>

            {!selectedRecord ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                <p className="text-sm text-slate-500">Select a staff member to upload photo</p>
              </div>
            ) : (
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="font-semibold text-slate-900">{selectedItem?.name}</p>
                  <p className="mt-1 text-xs text-slate-500">Row ID: {selectedRecord.rowId}</p>

                  <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label htmlFor="picture-file-input" className="cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center shadow-sm transition hover:border-cyan-300">
                        <p className="text-sm font-medium text-slate-700">Upload from file</p>
                        <p className="mt-1 text-xs text-slate-500">Auto-compress and center crop</p>
                        <input
                          id="picture-file-input"
                          type="file"
                          accept="image/*"
                          onChange={handlePictureFileChange}
                          className="hidden"
                        />
                      </label>

                      <label htmlFor="picture-camera-input" className="cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center shadow-sm transition hover:border-cyan-300">
                        <p className="text-sm font-medium text-slate-700">Quick mobile upload</p>
                        <p className="mt-1 text-xs text-slate-500">Photo ya phone se selected image</p>
                        <input
                          id="picture-camera-input"
                          type="file"
                          accept="image/*"
                          onChange={handlePictureFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-700">Live camera</p>
                          <p className="mt-1 text-xs text-slate-500">Face ko beech ke frame me rakh kar capture karein</p>
                        </div>
                        <div className="flex gap-2">
                          {cameraOpen ? (
                            <>
                              <button
                                type="button"
                                onClick={capturePhotoFromCamera}
                                disabled={pictureProcessing}
                                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                {pictureProcessing ? 'Processing...' : 'Capture Photo'}
                              </button>
                              <button
                                type="button"
                                onClick={() => stopCameraStream()}
                                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                              >
                                Close Camera
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => void startCameraCapture()}
                              disabled={cameraStarting || pictureProcessing}
                              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {cameraStarting ? 'Opening...' : 'Open Camera'}
                            </button>
                          )}
                        </div>
                      </div>

                      {cameraOpen ? (
                        <div className="mt-4">
                          <div className="relative mx-auto aspect-[4/5] w-full max-w-[320px] overflow-hidden rounded-[28px] border-4 border-cyan-200 bg-slate-900 shadow-lg">
                            <video
                              ref={cameraVideoRef}
                              autoPlay
                              playsInline
                              muted
                              className="h-full w-full object-cover"
                            />
                            <div className="pointer-events-none absolute inset-0 border-[10px] border-black/15" />
                            <div className="pointer-events-none absolute inset-x-6 inset-y-8 rounded-[24px] border-2 border-dashed border-white/90 shadow-[0_0_0_9999px_rgba(15,23,42,0.28)]" />
                          </div>
                          <p className="mt-3 text-center text-xs text-slate-500">Camera khulte hi portrait frame beech me rakha gaya hai taa ke face centered aaye.</p>
                        </div>
                      ) : null}

                      <canvas ref={cameraCanvasRef} className="hidden" />
                    </div>
                  </div>

                  {pictureUploadMessage ? (
                    <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${pictureUploadMessage.includes('successfully') || pictureUploadMessage.includes('ready') ? 'bg-emerald-50 text-emerald-700' : pictureUploadMessage.toLowerCase().includes('processing') || pictureUploadMessage.toLowerCase().includes('starting') || pictureUploadMessage.toLowerCase().includes('camera ready') ? 'bg-cyan-50 text-cyan-700' : 'bg-rose-50 text-rose-700'}`}>
                      {pictureUploadMessage}
                    </p>
                  ) : null}

                  {cameraError ? (
                    <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{cameraError}</p>
                  ) : null}

                  {picturePreview && (
                    <div className="mt-4 space-y-3">
                      <div className="space-y-2">
                        <label htmlFor="picture-admin-password" className="block text-sm font-medium text-slate-700">
                          Admin Password to Save
                        </label>
                        <input
                          id="picture-admin-password"
                          type="password"
                          value={editPassword}
                          onChange={(event) => setEditPassword(event.target.value)}
                          placeholder="Enter password"
                          className="min-h-[44px] w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-emerald-500"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={savePictureToSheet}
                          disabled={pictureSaving || !editPassword.trim()}
                          className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {pictureSaving ? 'Saving...' : 'Save Picture'}
                        </button>
                        <button
                          type="button"
                          onClick={removePicturePreview}
                          className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <p className="text-sm font-semibold text-slate-700">Preview</p>
                  <div className="mt-4 flex items-center justify-center rounded-lg border border-slate-200 bg-white p-4">
                    {picturePreview ? (
                      <div className="aspect-[4/5] w-full max-w-[320px] overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100 shadow-inner">
                        <img
                          src={`data:image/jpeg;base64,${picturePreview}`}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-64 items-center justify-center text-slate-500">
                        <p className="text-sm">No photo selected</p>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-slate-500">Photo JPEG me save hogi aur agar badi hui to system khud compress kar dega.</p>
                </div>
              </div>
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
}
