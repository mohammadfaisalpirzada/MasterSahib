'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import NextImage from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AdmissionFormPrintView,
  generateAdmissionA4PdfBlob,
  downloadBlob,
  buildAdmissionPdfFileName,
} from './AdmissionFormPrintView';

type AdmissionFormData = {
  srNo: string;
  rollNo: string;
  grNo: string;
  studentName: string;
  dob: string;
  dobWords: string;
  nationality: string;
  surname: string;
  religion: string;
  previousClass: string;
  lastSchool: string;
  leavingReason: string;
  leavingDate: string;
  admissionClass: string;
  admissionDate: string;
  nadraStatus: 'Available' | 'Not Available' | '';
  bFormNo: string;
  address: string;
  fatherName: string;
  fatherCnic: string;
  fatherCell: string;
  fatherQualification: string;
  fatherOccupation: string;
  companyDetails: string;
  whatsappNo: string;
  motherName: string;
  motherCnic: string;
  motherCell: string;
  guardianCell: string;
  officeClassAdmitted: string;
  officeAdmissionDate: string;
  campusHeadSign: string;
  academicInchargeSign: string;
  preparedBy: string;
  preparedSign: string;
  officeDate: string;
};

const EMPTY_FORM = (): AdmissionFormData => ({
  srNo: '',
  rollNo: '',
  grNo: '',
  studentName: '',
  dob: '',
  dobWords: '',
  nationality: 'Pakistani',
  surname: '',
  religion: 'Islam',
  previousClass: '',
  lastSchool: '',
  leavingReason: '',
  leavingDate: '',
  admissionClass: '',
  admissionDate: new Date().toISOString().slice(0, 10),
  nadraStatus: '',
  bFormNo: '',
  address: '',
  fatherName: '',
  fatherCnic: '',
  fatherCell: '',
  fatherQualification: '',
  fatherOccupation: '',
  companyDetails: '',
  whatsappNo: '',
  motherName: '',
  motherCnic: '',
  motherCell: '',
  guardianCell: '',
  officeClassAdmitted: '',
  officeAdmissionDate: new Date().toISOString().slice(0, 10),
  campusHeadSign: '',
  academicInchargeSign: '',
  preparedBy: '',
  preparedSign: '',
  officeDate: '',
});

const CLASS_OPTIONS = ['ECE', 'Prep / KG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
// A brand-new student (never studied anywhere before) can only be admitted into the entry classes.
const NEW_STUDENT_CLASS_OPTIONS = ['ECE', 'I'];
const RELIGION_OPTIONS = ['Islam', 'Christianity', 'Hinduism', 'Other'];
const NATIONALITY_OPTIONS = ['Pakistani', 'Other'];

// ---------- CNIC / phone auto-dash formatting ----------
// CNIC & B-Form: 13 digits -> XXXXX-XXXXXXX-X. Phone/WhatsApp: 11 digits -> 03XX-XXXXXXX.
// Dashes are inserted as the user types; deleting/retyping just re-derives from the digits.
const formatCnicInput = (raw: string) => {
  const digits = raw.replace(/\D/g, '').slice(0, 13);
  return [digits.slice(0, 5), digits.slice(5, 12), digits.slice(12, 13)].filter(Boolean).join('-');
};
const formatPhoneInput = (raw: string) => {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  return [digits.slice(0, 4), digits.slice(4, 11)].filter(Boolean).join('-');
};
const isCompleteCnic = (value: string) => value.replace(/\D/g, '').length === 13;
const isCompletePhone = (value: string) => value.replace(/\D/g, '').length === 11;
const dashIfEmpty = (value: string) => (value.trim() ? value.trim() : '-');

// ---------- Date-of-birth "in words" auto-converter ----------
const ONES_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS_WORDS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

const numberToWords = (num: number): string => {
  if (num === 0) return 'Zero';

  const chunkToWords = (n: number) => {
    let str = '';
    if (n >= 100) {
      str += `${ONES_WORDS[Math.floor(n / 100)]} Hundred `;
      n %= 100;
    }
    if (n >= 20) {
      str += `${TENS_WORDS[Math.floor(n / 10)]} `;
      n %= 10;
      if (n) str += `${ONES_WORDS[n]} `;
    } else if (n > 0) {
      str += `${ONES_WORDS[n]} `;
    }
    return str.trim();
  };

  let result = '';
  const thousands = Math.floor(num / 1000);
  const remainder = num % 1000;
  if (thousands) result += `${chunkToWords(thousands)} Thousand `;
  if (remainder) result += chunkToWords(remainder);
  return result.trim();
};

const ORDINAL_WORDS: Record<number, string> = {
  1: 'First', 2: 'Second', 3: 'Third', 4: 'Fourth', 5: 'Fifth', 6: 'Sixth', 7: 'Seventh', 8: 'Eighth', 9: 'Ninth', 10: 'Tenth',
  11: 'Eleventh', 12: 'Twelfth', 13: 'Thirteenth', 14: 'Fourteenth', 15: 'Fifteenth', 16: 'Sixteenth', 17: 'Seventeenth', 18: 'Eighteenth', 19: 'Nineteenth', 20: 'Twentieth',
  21: 'Twenty-First', 22: 'Twenty-Second', 23: 'Twenty-Third', 24: 'Twenty-Fourth', 25: 'Twenty-Fifth', 26: 'Twenty-Sixth', 27: 'Twenty-Seventh', 28: 'Twenty-Eighth', 29: 'Twenty-Ninth', 30: 'Thirtieth', 31: 'Thirty-First',
};

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const dateToWords = (isoDate: string): string => {
  if (!isoDate) return '';
  const parts = isoDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return '';
  const [year, month, day] = parts;
  const monthName = MONTH_NAMES[month - 1];
  if (!monthName || !year || !day) return '';
  const dayWord = ORDINAL_WORDS[day] || String(day);
  return `${dayWord} ${monthName}, ${numberToWords(year)}`;
};
// ---------------------------------------------------------------

const parseAdminResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    const raw = await response.text();
    throw new Error(raw.slice(0, 200) || 'Server returned a non-JSON response.');
  }
  return (await response.json()) as { success: boolean; authenticated?: boolean; message?: string };
};

// ---------- Picture capture + compression helpers ----------
// Kept deliberately small so the photo saves fast on mobile data and stays
// well under Google Sheets' ~50,000-character cell limit.
const MAX_PICTURE_BASE64_LENGTH = 32_000;
const PICTURE_TARGET_WIDTH = 300;
const PICTURE_TARGET_HEIGHT = 375;
const MIN_PICTURE_WIDTH = 160;
const MIN_PICTURE_HEIGHT = 200;
const MIN_PICTURE_QUALITY = 0.4;

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

// iPhones commonly save gallery photos as HEIC/HEIF, which browsers other than
// Safari cannot decode into an <img>/canvas at all — that's what causes
// "Selected image could not be opened." Detect it (by MIME type, since some
// phones report an empty/generic type, so we also fall back to the file
// extension) and transcode to JPEG in the browser before doing anything else.
const isHeicFile = (file: File) => {
  const type = (file.type || '').toLowerCase();
  const name = (file.name || '').toLowerCase();
  return type.includes('heic') || type.includes('heif') || name.endsWith('.heic') || name.endsWith('.heif');
};

const prepareImageFile = async (file: File): Promise<File> => {
  if (!isHeicFile(file)) return file;
  try {
    const heic2any = (await import('heic2any')).default;
    const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
    const blob = Array.isArray(result) ? result[0] : result;
    return new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' });
  } catch {
    throw new Error('This photo is in iPhone HEIC format and could not be converted. Please try "Take Photo" instead, or change your phone camera format to "Most Compatible" (Settings > Camera > Formats) and retake it.');
  }
};

const drawCenteredCrop = (
  context: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  // 0 = anchor crop to the very top of the photo, 0.5 = dead-center (old
  // behaviour), 1 = anchor to the bottom. For an ID-style student photo we
  // want it biased near the top so it frames face-to-chest, not a random
  // center slice of a full-length photo.
  verticalBias = 0.5,
  // 0 = anchor crop to the very left of the photo, 0.5 = center, 1 = right.
  horizontalBias = 0.5,
  // 1 = the normal "cover" crop (as much of the photo as fits the target
  // box). Larger than 1 zooms in — the crop window shrinks so less of the
  // photo is used, then it's scaled up to fill the same target box.
  zoom = 1
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

  const safeZoom = Math.max(1, Math.min(4, zoom));
  cropWidth = cropWidth / safeZoom;
  cropHeight = cropHeight / safeZoom;

  const offsetX = Math.max(0, (sourceWidth - cropWidth) * Math.min(1, Math.max(0, horizontalBias)));
  const offsetY = Math.max(0, (sourceHeight - cropHeight) * Math.min(1, Math.max(0, verticalBias)));

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
    throw new Error('Image is still too large after compression. Please retake with better lighting.');
  }

  return fallbackBase64;
};
// -------------------------------------------------------------

// PDF export helpers are imported from ./AdmissionFormPrintView

// 03XX-XXXXXXX -> 923XXXXXXXXX (Pakistani international format wa.me needs).
const toWhatsappIntlNumber = (localNumber: string) => {
  const digits = localNumber.replace(/\D/g, '');
  if (digits.length !== 11 || !digits.startsWith('03')) return null;
  return `92${digits.slice(1)}`;
};
// -------------------------------------------------------------

// Short prompt any staff member can copy into their own Gemini app to turn a
// photo of a form/CNIC/B-Form into plain text they can paste into the
// "Auto-fill from text" box below.
const GEMINI_SCAN_PROMPT = `Read this photo and write out these admission-form details as plain English text, one "Label: value" per line. Transliterate any Urdu into English. Skip anything not visible, don't guess:
Student Name, Date of Birth, Father's Name, Father's CNIC, Father's Cell, Mother's Name, Mother's CNIC, Mother's Cell, Guardian's Cell, WhatsApp Number, Address, Previous School, Class, B-Form No, GR No.`;

export default function AdmissionFormPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'admission-desk' | null>(null);
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [form, setForm] = useState<AdmissionFormData>(EMPTY_FORM());
  const [isNewStudent, setIsNewStudent] = useState(false);

  const [picturePreview, setPicturePreview] = useState('');
  const [pictureProcessing, setPictureProcessing] = useState(false);
  const [pictureMessage, setPictureMessage] = useState('');
  // Photo positioning: the selected image is held here until the person
  // confirms where the crop window should sit (some phone photos still cut
  // the face off at the default position, so they can drag/slide it themselves).
  const [pendingPictureImage, setPendingPictureImage] = useState<HTMLImageElement | null>(null);
  const [picturePositionBias, setPicturePositionBias] = useState(0.18);
  const [pictureHorizontalBias, setPictureHorizontalBias] = useState(0.5);
  const [pictureZoom, setPictureZoom] = useState(1);
  const positionPreviewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showSaveSuccessAnim, setShowSaveSuccessAnim] = useState(false);
  const [saveError, setSaveError] = useState('');

  const printViewRef = useRef<HTMLDivElement>(null);
  const [downloadingPdfManual, setDownloadingPdfManual] = useState(false);

  const generateAdmissionPdfBlob = async (): Promise<Blob> => {
    if (!printViewRef.current) {
      throw new Error('Could not find printable form container.');
    }
    return generateAdmissionA4PdfBlob(printViewRef.current);
  };

  const handleManualDownloadPdf = async () => {
    if (!printViewRef.current) return;
    setDownloadingPdfManual(true);
    try {
      const fileName = buildAdmissionPdfFileName(form.studentName);
      const blob = await generateAdmissionA4PdfBlob(printViewRef.current);
      downloadBlob(blob, fileName);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert(err instanceof Error ? err.message : 'Unable to generate PDF.');
    } finally {
      setDownloadingPdfManual(false);
    }
  };

  const [scanMode, setScanMode] = useState<'image' | 'text'>('image');
  const [scanText, setScanText] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [promptCopied, setPromptCopied] = useState(false);
  const [scanError, setScanError] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/ggss-admission-form/auth/session', { cache: 'no-store' });
        const data = (await parseAdminResponse(response)) as { authenticated?: boolean; role?: 'admin' | 'admission-desk' | null };
        setAuthenticated(Boolean(data.authenticated));
        setUserRole(data.role ?? null);
      } catch {
        setAuthenticated(false);
        setUserRole(null);
      } finally {
        setAuthLoading(false);
      }
    };
    void checkSession();
  }, []);

  const fetchNextSerial = async () => {
    try {
      const response = await fetch('/api/ggss-admission-form', { cache: 'no-store' });
      const data = await response.json();
      if (response.ok && data.success && data.nextSerial) {
        setForm((current) => ({ ...current, srNo: String(data.nextSerial) }));
      }
    } catch {
      // Non-blocking — office staff can still type the serial number manually.
    }
  };

  // Auto-fill the next serial number as soon as the admin session is confirmed.
  useEffect(() => {
    if (authenticated) void fetchNextSerial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  // Auto-fill "in words" whenever the date of birth changes — field stays read-only.
  useEffect(() => {
    const words = dateToWords(form.dob);
    setForm((current) => (current.dobWords === words ? current : { ...current, dobWords: words }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.dob]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError('');
    if (!loginPassword.trim()) {
      setLoginError('Password is required.');
      return;
    }
    try {
      setIsLoggingIn(true);
      const response = await fetch('/api/ggss-admission-form/auth/login', {
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
    try {
      await fetch('/api/ggss-admission-form/auth/logout', { method: 'POST' });
    } catch {
      // Non-blocking — still clear local state below.
    } finally {
      setAuthenticated(false);
      setUserRole(null);
    }
  };

  // Safety: admission-desk staff (the lightweight helper login, not the full
  // admin) get force-logged-out the moment they leave this page — browser
  // back button, closing the tab, or clicking "Back to Admin" — so nobody
  // can walk away from a shared/public computer still logged in and let
  // someone else submit fake admissions. Full admins are exempt since they
  // may still be using the rest of the dashboard.
  const isAdmissionDeskRef = useRef(false);
  useEffect(() => {
    isAdmissionDeskRef.current = authenticated && userRole === 'admission-desk';
  }, [authenticated, userRole]);

  useEffect(() => {
    if (!authenticated || userRole !== 'admission-desk') return undefined;

    // Trap the browser "back" action on this page: push a dummy history
    // entry so the first back-press fires `popstate` here instead of
    // immediately leaving the page, then log the session out and send the
    // user back to the admin gate ourselves.
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      void fetch('/api/ggss-admission-form/auth/logout', { method: 'POST', keepalive: true });
      setAuthenticated(false);
      setUserRole(null);
      router.replace('/ggss-nishtar-road/admin');
    };

    const handlePageHide = () => {
      if (!isAdmissionDeskRef.current) return;
      // Tab close / real navigation away — fire a best-effort logout that
      // survives the page unloading.
      const url = '/api/ggss-admission-form/auth/logout';
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([], { type: 'application/json' }));
      } else {
        void fetch(url, { method: 'POST', keepalive: true });
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('pagehide', handlePageHide);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [authenticated, userRole, router]);

  const handleBackToAdminClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (userRole !== 'admission-desk') return; // full admins keep their session
    event.preventDefault();
    void handleLogout().then(() => {
      router.push('/ggss-nishtar-road/admin');
    });
  };

  const handleChange = <K extends keyof AdmissionFormData>(key: K, value: AdmissionFormData[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleCnicFieldChange = (key: 'fatherCnic' | 'motherCnic' | 'bFormNo', raw: string) => {
    handleChange(key, formatCnicInput(raw));
  };

  const handlePhoneFieldChange = (key: 'fatherCell' | 'motherCell' | 'guardianCell' | 'whatsappNo', raw: string) => {
    handleChange(key, formatPhoneInput(raw));
  };

  // ---------- Scan & Auto-fill (trial, admin only) ----------
  const resizeImageForScan = async (file: File): Promise<{ base64: string; mimeType: string }> => {
    const readyFile = await prepareImageFile(file);
    return loadImageElement(readyFile).then((image) => {
      // Higher resolution + quality than the ID-photo pipeline — this image
      // needs to stay readable for OCR (small CNIC/B-Form print), not just
      // look good as a thumbnail.
      const MAX_DIM = 2200;
      let width = image.naturalWidth || image.width;
      let height = image.naturalHeight || image.height;
      if (width > MAX_DIM || height > MAX_DIM) {
        const scale = Math.min(MAX_DIM / width, MAX_DIM / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Image processing is not supported in this browser.');
      }
      context.drawImage(image, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      return { base64: extractBase64Payload(dataUrl), mimeType: 'image/jpeg' };
    });
  };

  // Only fills fields that are still blank — never overwrites anything the
  // staff member already typed. Returns how many fields were filled.
  const applyScannedFields = (fields: Record<string, string>): number => {
    const updates: Partial<AdmissionFormData> = {};
    (Object.entries(fields) as Array<[keyof AdmissionFormData, string]>).forEach(([key, incoming]) => {
      if (!incoming || !(key in form)) return;
      if (String(form[key] ?? '').trim()) return;
      if (key === 'fatherCnic' || key === 'motherCnic' || key === 'bFormNo') {
        (updates as Record<string, string>)[key] = formatCnicInput(incoming);
      } else if (key === 'fatherCell' || key === 'motherCell' || key === 'guardianCell' || key === 'whatsappNo') {
        (updates as Record<string, string>)[key] = formatPhoneInput(incoming);
      } else if (key === 'nadraStatus') {
        if (incoming === 'Available' || incoming === 'Not Available') {
          (updates as Record<string, string>)[key] = incoming;
        }
      } else {
        (updates as Record<string, string>)[key] = incoming;
      }
    });
    const appliedCount = Object.keys(updates).length;
    if (appliedCount > 0) {
      setForm((current) => ({ ...current, ...updates }));
    }
    return appliedCount;
  };

  const runScan = async (payload: { mode: 'image' | 'text'; images?: Array<{ base64: string; mimeType: string }>; text?: string }) => {
    setScanning(true);
    setScanMessage('');
    setScanError('');
    try {
      const response = await fetch('/api/ggss-admission-form/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        setScanError(data.message || 'Could not read that document.');
        return;
      }
      const count = applyScannedFields(data.fields || {});
      setScanMessage(
        count > 0
          ? `Filled ${count} field${count === 1 ? '' : 's'} automatically — please review before saving.`
          : 'Nothing new to fill — those fields already had data, or nothing recognizable was found.',
      );
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Unable to scan right now.');
    } finally {
      setScanning(false);
    }
  };

  const MAX_SCAN_IMAGES = 5;

  const handleScanImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(0, MAX_SCAN_IMAGES);
    event.target.value = '';
    if (!files.length) return;
    try {
      setScanning(true);
      setScanMessage('');
      setScanError('');
      const images = await Promise.all(files.map((file) => resizeImageForScan(file)));
      await runScan({ mode: 'image', images });
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Could not process those images.');
      setScanning(false);
    }
  };

  const handleScanTextSubmit = async () => {
    if (!scanText.trim()) return;
    await runScan({ mode: 'text', text: scanText });
  };

  const handleCopyScanPrompt = async () => {
    try {
      await navigator.clipboard.writeText(GEMINI_SCAN_PROMPT);
      setPromptCopied(true);
      window.setTimeout(() => setPromptCopied(false), 2500);
    } catch {
      setScanError('Could not copy automatically — please select and copy the prompt manually.');
    }
  };
  // -----------------------------------------------------------

  const handleNewForm = () => {
    setForm(EMPTY_FORM());
    setIsNewStudent(false);
    setPicturePreview('');
    setPictureMessage('');
    setPendingPictureImage(null);
    setPicturePositionBias(0.18);
    setPictureHorizontalBias(0.5);
    setPictureZoom(1);
    setSaveMessage('');
    setSaveError('');
    setScanMode('image');
    setScanText('');
    setScanMessage('');
    setScanError('');
    void fetchNextSerial();
  };

  const handlePrint = () => {
    // Browsers use document.title as the default filename in the print/"Save as
    // PDF" dialog, so swap it to the student's name just for the print action.
    const previousTitle = document.title;
    const studentTitle = form.studentName.trim();
    if (studentTitle) {
      document.title = `${studentTitle} - Admission Form`;
    }
    window.print();
    window.setTimeout(() => {
      document.title = previousTitle;
    }, 1000);
  };

  // Manual share — the person taps this whenever they're ready, instead of a
  // WhatsApp chat opening automatically after every save.
  const handleShareViaWhatsapp = () => {
    const intlNumber = toWhatsappIntlNumber(form.whatsappNo);
    if (!intlNumber) {
      setSaveMessage('Add a valid WhatsApp No. (03XX-XXXXXXX) to the form first.');
      return;
    }
    const fileName = buildAdmissionPdfFileName(form.studentName);
    const message = encodeURIComponent(
      `Assalam-o-Alaikum, ${form.studentName || 'student'} ki Admission Form attached hai (${fileName}). Barah-e-karam is PDF ko attach kar ke bhej dein.`
    );
    window.open(`https://wa.me/${intlNumber}?text=${message}`, '_blank');
  };

  const handleToggleNewStudent = () => {
    setIsNewStudent((current) => {
      const next = !current;
      if (next) {
        setForm((form) => ({
          ...form,
          previousClass: '',
          lastSchool: '',
          leavingReason: '',
          leavingDate: '',
          admissionClass: (NEW_STUDENT_CLASS_OPTIONS as string[]).includes(form.admissionClass) ? form.admissionClass : '',
        }));
      }
      return next;
    });
  };

  const handlePictureFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setPictureProcessing(true);
      setPictureMessage('Loading photo...');

      const readyFile = await prepareImageFile(file);
      const image = await loadImageElement(readyFile);
      // Don't compress yet — hand it to the position adjuster so the staff
      // member can slide the crop window to wherever the face actually is
      // before it gets locked in.
      setPicturePositionBias(0.18);
      setPictureHorizontalBias(0.5);
      setPictureZoom(1);
      setPendingPictureImage(image);
      setPictureMessage('');
    } catch (error) {
      setPictureMessage(error instanceof Error ? error.message : 'Unable to process photo.');
    } finally {
      setPictureProcessing(false);
      event.target.value = '';
    }
  };

  // Live preview redraw whenever the pending photo or the slider moves.
  useEffect(() => {
    if (!pendingPictureImage) return;
    const canvas = positionPreviewCanvasRef.current;
    if (!canvas) return;
    canvas.width = PICTURE_TARGET_WIDTH;
    canvas.height = PICTURE_TARGET_HEIGHT;
    const context = canvas.getContext('2d');
    if (!context) return;
    drawCenteredCrop(
      context,
      pendingPictureImage,
      pendingPictureImage.naturalWidth || pendingPictureImage.width,
      pendingPictureImage.naturalHeight || pendingPictureImage.height,
      PICTURE_TARGET_WIDTH,
      PICTURE_TARGET_HEIGHT,
      picturePositionBias,
      pictureHorizontalBias,
      pictureZoom
    );
  }, [pendingPictureImage, picturePositionBias, pictureHorizontalBias, pictureZoom]);

  const handleConfirmPicturePosition = () => {
    if (!pendingPictureImage) return;
    try {
      setPictureProcessing(true);
      const canvas = document.createElement('canvas');
      canvas.width = PICTURE_TARGET_WIDTH;
      canvas.height = PICTURE_TARGET_HEIGHT;
      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Image processing is not supported in this browser.');
      }
      drawCenteredCrop(
        context,
        pendingPictureImage,
        pendingPictureImage.naturalWidth || pendingPictureImage.width,
        pendingPictureImage.naturalHeight || pendingPictureImage.height,
        PICTURE_TARGET_WIDTH,
        PICTURE_TARGET_HEIGHT,
        picturePositionBias,
        pictureHorizontalBias,
        pictureZoom
      );
      const compressedBase64 = compressCanvasToJpegBase64(canvas);
      setPicturePreview(compressedBase64);
      const approxKb = Math.round((compressedBase64.length * 0.75) / 1024);
      setPictureMessage(`Photo compressed to ~${approxKb} KB and ready to save.`);
      setPendingPictureImage(null);
    } catch (error) {
      setPictureMessage(error instanceof Error ? error.message : 'Unable to process photo.');
    } finally {
      setPictureProcessing(false);
    }
  };

  const handleCancelPicturePosition = () => {
    setPendingPictureImage(null);
    setPictureMessage('');
  };

  const handleRemovePicture = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setPicturePreview('');
    setPictureMessage('');
  };

  const handleSaveToRecords = async () => {
    setSaveError('');
    setSaveMessage('');

    if (!form.studentName.trim()) {
      setSaveError('Please enter the student name before saving.');
      return;
    }
    if (!form.admissionClass.trim()) {
      setSaveError('Please select the class admission is sought for.');
      return;
    }

    // CNIC / B-Form: empty is fine (saved as a dash), but a half-typed number is rejected.
    if (form.fatherCnic.trim() && !isCompleteCnic(form.fatherCnic)) {
      setSaveError("Father's CNIC looks incomplete. Enter the full 13-digit number or leave it blank.");
      return;
    }
    if (form.motherCnic.trim() && !isCompleteCnic(form.motherCnic)) {
      setSaveError("Mother's CNIC looks incomplete. Enter the full 13-digit number or leave it blank.");
      return;
    }
    if (form.nadraStatus !== 'Not Available' && form.bFormNo.trim() && !isCompleteCnic(form.bFormNo)) {
      setSaveError("Child's B-Form number looks incomplete. Enter the full 13-digit number or leave it blank.");
      return;
    }

    // Cell / WhatsApp numbers: same rule — empty is fine, half-typed is not.
    if (form.fatherCell.trim() && !isCompletePhone(form.fatherCell)) {
      setSaveError("Father's Cell No. looks incomplete. Enter the full 11-digit number or leave it blank.");
      return;
    }
    if (form.motherCell.trim() && !isCompletePhone(form.motherCell)) {
      setSaveError("Mother's Cell No. looks incomplete. Enter the full 11-digit number or leave it blank.");
      return;
    }
    if (form.guardianCell.trim() && !isCompletePhone(form.guardianCell)) {
      setSaveError("Guardian's Cell No. looks incomplete. Enter the full 11-digit number or leave it blank.");
      return;
    }
    if (form.whatsappNo.trim() && !isCompletePhone(form.whatsappNo)) {
      setSaveError('WhatsApp No. looks incomplete. Enter the full 11-digit number or leave it blank.');
      return;
    }

    try {
      setSaving(true);
      const values: Record<string, string> = {
        sr_no: form.srNo,
        roll_no: form.rollNo,
        gr_no: form.grNo,
        student_name: form.studentName,
        dob: form.dob,
        dob_words: form.dobWords,
        nationality: form.nationality,
        surname: form.surname,
        religion: form.religion,
        previous_class: isNewStudent ? '-' : form.previousClass,
        last_school: isNewStudent ? '-' : form.lastSchool,
        leaving_reason: isNewStudent ? '-' : form.leavingReason,
        leaving_date: isNewStudent ? '-' : form.leavingDate,
        admission_class: form.admissionClass,
        admission_date: form.admissionDate,
        nadra_status: form.nadraStatus,
        b_form_no: form.nadraStatus === 'Not Available' ? '-' : dashIfEmpty(form.bFormNo),
        address: form.address,
        father_name: form.fatherName,
        father_cnic: dashIfEmpty(form.fatherCnic),
        father_cell: dashIfEmpty(form.fatherCell),
        father_qualification: form.fatherQualification,
        father_occupation: form.fatherOccupation,
        company_details: form.companyDetails,
        whatsapp_no: dashIfEmpty(form.whatsappNo),
        mother_name: form.motherName,
        mother_cnic: dashIfEmpty(form.motherCnic),
        mother_cell: dashIfEmpty(form.motherCell),
        guardian_cell: dashIfEmpty(form.guardianCell),
        office_class_admitted: form.officeClassAdmitted,
        office_admission_date: form.officeAdmissionDate,
        campus_head_sign: form.campusHeadSign,
        academic_incharge_sign: form.academicInchargeSign,
        prepared_by: form.preparedBy,
        prepared_sign: form.preparedSign,
        office_date: form.officeDate,
        picture_base64: picturePreview,
      };

      const response = await fetch('/api/ggss-admission-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to save admission form.');
      }

      setShowSaveSuccessAnim(true);
      window.setTimeout(() => setShowSaveSuccessAnim(false), 2200);

      setSaveMessage('Saved to student records sheet successfully. Preparing PDF...');

      // Best-effort: the record is already safely saved above, so a PDF hiccup
      // here should never look like the save itself failed.
      try {
        const pdfBlob = await generateAdmissionPdfBlob();
        const fileName = buildAdmissionPdfFileName(form.studentName);
        downloadBlob(pdfBlob, fileName);
        setSaveMessage(
          toWhatsappIntlNumber(form.whatsappNo)
            ? `Saved. PDF downloaded as "${fileName}" — tap "Share via WhatsApp" below when ready to send it.`
            : `Saved. PDF downloaded as "${fileName}".`
        );
      } catch (pdfError) {
        setSaveMessage(
          `Saved to student records sheet successfully. (Could not auto-generate the PDF: ${
            pdfError instanceof Error ? pdfError.message : 'unknown error'
          } — use "Print / Save PDF" below instead.)`
        );
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save admission form.');
    } finally {
      setSaving(false);
    }
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
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">GGSS Nishtar Road — Admission Desk</p>
          <h1 className="mt-2 text-2xl font-black text-slate-900">Admission Form</h1>
          <p className="mt-1 text-sm text-slate-500">Enter the admission desk password to continue.</p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label htmlFor="admission-admin-pw" className="mb-1 block text-xs font-semibold uppercase text-slate-600">Admin Password</label>
              <div className="relative">
                <input
                  id="admission-admin-pw"
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
          #admission-form-a4-print-target,
          #admission-form-a4-print-target * {
            visibility: visible !important;
          }
          #admission-form-a4-print-target {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            display: block !important;
            border: none !important;
            box-shadow: none !important;
          }
          .no-print,
          #admission-print-area {
            display: none !important;
          }
        }
        .admission-underline {
          border: none;
          border-bottom: 1px solid #000;
          outline: none;
          background: transparent;
          font-family: inherit;
          font-size: 13px;
          padding: 2px 4px;
          width: 100%;
          -webkit-appearance: none;
          appearance: none;
          border-radius: 0;
        }
        select.admission-underline {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%231a3a6b'><path d='M5.25 7.5L10 12.25L14.75 7.5H5.25Z'/></svg>");
          background-repeat: no-repeat;
          background-position: right 2px center;
          background-size: 16px;
          padding-right: 20px;
        }
        @media print {
          select.admission-underline { background-image: none; padding-right: 4px; }
        }
        .admission-underline:focus {
          border-bottom: 2px solid #1a3a6b;
          background-color: #f8fafc;
        }
        select.admission-underline:focus {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%231a3a6b'><path d='M5.25 7.5L10 12.25L14.75 7.5H5.25Z'/></svg>");
        }
        .admission-label {
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          margin-right: 6px;
          color: #111;
        }
        .admission-row {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 10px;
          align-items: flex-end;
        }
        .admission-field {
          display: flex;
          flex: 1;
          min-width: 190px;
          align-items: flex-end;
        }
        .admission-field.full {
          flex: 100%;
        }
        @media screen and (max-width: 640px) {
          #admission-print-area {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
            padding: 0 !important;
          }
          .admission-field {
            min-width: 100%;
            flex-direction: column;
            align-items: stretch;
          }
          .admission-label {
            white-space: normal;
            margin-bottom: 4px;
            color: #475569;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.03em;
          }
          .admission-underline {
            font-size: 16px;
            padding: 12px 14px;
            border: 1.5px solid #dbe3ef !important;
            border-radius: 12px !important;
            background: #ffffff !important;
            box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
          }
          .admission-underline:focus {
            border-color: #1a3a6b !important;
            box-shadow: 0 0 0 3px rgba(26, 58, 107, 0.12);
          }
          select.admission-underline {
            background-position: right 10px center;
            padding-right: 30px;
          }
          .admission-row {
            gap: 12px;
            margin-bottom: 16px;
          }
          form > div.mb-3 {
            margin-top: 22px;
            margin-bottom: 14px;
            padding: 8px 14px;
            border-radius: 999px;
            background: linear-gradient(135deg, #1a3a6b, #2356a4);
            color: #fff !important;
            text-decoration: none !important;
            font-size: 12px;
            box-shadow: 0 4px 10px rgba(26, 58, 107, 0.25);
          }
        }
        /* Full school name/address block: hidden while filling on mobile, shown on desktop + print */
        .school-name-full { display: none; }
        .school-name-short { display: block; }
        @media (min-width: 640px) {
          .school-name-full { display: block; }
          .school-name-short { display: none; }
        }
        @media print {
          .school-name-full { display: block !important; }
          .school-name-short { display: none !important; }
        }
        /* Sindh Govt logo: hidden while filling on mobile (saves space), shown on desktop + print */
        .sindh-logo-box { display: none; }
        @media (min-width: 640px) {
          .sindh-logo-box { display: flex; }
        }
        @media print {
          .sindh-logo-box { display: flex !important; }
        }
        /* Signature areas: hidden while filling on mobile, shown on desktop + always on print */
        .sign-area-block { display: none; }
        .sign-area-flex { display: none; }
        @media (min-width: 640px) {
          .sign-area-block { display: block; }
          .sign-area-flex { display: flex; }
        }
        @media print {
          .sign-area-block { display: block !important; }
          .sign-area-flex { display: flex !important; }
        }
        /* New Student toggle switch */
        .toggle-track {
          position: relative;
          display: inline-flex;
          align-items: center;
          width: 40px;
          height: 22px;
          border-radius: 999px;
          background: #cbd5e1;
          transition: background-color 0.15s ease;
          flex-shrink: 0;
        }
        .toggle-track.on {
          background: #1a3a6b;
        }
        .toggle-knob {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: #fff;
          box-shadow: 0 1px 2px rgba(0,0,0,0.3);
          transition: transform 0.15s ease;
        }
        .toggle-track.on .toggle-knob {
          transform: translateX(18px);
        }

        @keyframes saveSuccessPop {
          0% { opacity: 0; transform: scale(0.4) translateY(10px); }
          15% { opacity: 1; transform: scale(1.15) translateY(0); }
          30% { transform: scale(1); }
          80% { opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(0.9) translateY(-6px); }
        }
        .save-success-pop {
          animation: saveSuccessPop 2.2s ease forwards;
        }
      `}</style>

      <main className="admission-page-root min-h-screen bg-slate-100 px-4 py-8 sm:px-6">
        {showSaveSuccessAnim ? (
          <div className="no-print pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
            <div className="save-success-pop flex flex-col items-center gap-2 rounded-3xl bg-white/95 px-8 py-6 shadow-2xl">
              <span className="text-6xl">🎉✅</span>
              <span className="text-sm font-bold text-emerald-700">Record Saved!</span>
            </div>
          </div>
        ) : null}
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 no-print">
            <Link
              href="/ggss-nishtar-road/admin"
              onClick={handleBackToAdminClick}
              className="text-sm font-semibold text-[#1a3a6b] transition hover:underline"
            >
              ← Back to Admin
            </Link>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                Logout
              </button>
            </div>
          </div>

          {authenticated ? (
            <div className="no-print rounded-2xl border border-dashed border-purple-300 bg-purple-50 p-4">
              <p className="mb-2 text-sm font-bold text-purple-900">🪄 Scan &amp; Auto-fill</p>
              <div className="mb-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setScanMode('image')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    scanMode === 'image' ? 'bg-purple-700 text-white' : 'border border-purple-300 bg-white text-purple-700'
                  }`}
                >
                  📷 From Photo
                </button>
                <button
                  type="button"
                  onClick={() => setScanMode('text')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    scanMode === 'text' ? 'bg-purple-700 text-white' : 'border border-purple-300 bg-white text-purple-700'
                  }`}
                >
                  💬 From Text
                </button>
              </div>

              {scanMode === 'image' ? (
                <div>
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-purple-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-800">
                      {scanning ? 'Reading…' : '📷 Take Photo'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        capture="environment"
                        className="hidden"
                        disabled={scanning}
                        onChange={handleScanImageChange}
                      />
                    </label>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-purple-300 bg-white px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-50">
                      {scanning ? 'Reading…' : '🖼️ Choose from Gallery'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                        multiple
                        className="hidden"
                        disabled={scanning}
                        onChange={handleScanImageChange}
                      />
                    </label>
                  </div>
                  <p className="mt-1.5 text-[11px] text-purple-600">
                    Gallery: pick up to 5 photos at once (e.g. B-Form + CNIC + admission form) — details from all of them will be combined. iPhone HEIC photos are converted automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] text-purple-700">
                    Ya apni tasveer Gemini ko dy kar text nikalwa lein, phir yahan paste kar dein:
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyScanPrompt}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:from-indigo-700 hover:to-purple-700"
                  >
                    {promptCopied ? '✅ Copied!' : '📋 Copy Gemini Prompt'}
                  </button>
                  <textarea
                    value={scanText}
                    onChange={(event) => setScanText(event.target.value)}
                    placeholder="Paste a WhatsApp message or any text with the child's details..."
                    rows={3}
                    className="w-full rounded-xl border border-purple-300 bg-white p-3 text-sm outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleScanTextSubmit}
                    disabled={scanning || !scanText.trim()}
                    className="rounded-xl bg-purple-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {scanning ? 'Reading text…' : 'Auto-fill from text'}
                  </button>
                </div>
              )}

              {scanMessage ? <p className="mt-2 text-xs font-semibold text-emerald-700">{scanMessage}</p> : null}
              {scanError ? <p className="mt-2 text-xs font-semibold text-rose-700">{scanError}</p> : null}
            </div>
          ) : null}

          {saveMessage ? (
            <p className="no-print rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{saveMessage}</p>
          ) : null}
          {saveError ? (
            <p className="no-print rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{saveError}</p>
          ) : null}

          <div id="admission-print-area" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:rounded-none print:border-0 print:shadow-none">
            <form>
              {/* Header */}
              <div className="border-b-2 border-black pb-3">
                <div className="mb-2 flex items-start justify-between">
                  <p className="flex items-center gap-2 text-xs font-bold">
                    <span>Sr No.</span>
                    <input
                      type="text"
                      value={form.srNo}
                      disabled
                      readOnly
                      className="admission-underline cursor-not-allowed bg-slate-50 text-slate-600"
                      style={{ width: '80px', flex: 'none' }}
                    />
                  </p>
                  <div className="inline-block border-2 border-black px-4 py-1 text-sm font-bold">Admission Form</div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="sindh-logo-box h-[78px] w-[78px] flex-shrink-0 items-center justify-center">
                    <NextImage
                      src="/images/sindh-govt-logo-black.png"
                      alt="Government of Sindh Logo"
                      width={78}
                      height={78}
                      priority
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="flex-1 text-center">
                    {/* Mobile (screen only): short name so the form fits easily while filling */}
                    <h1 className="school-name-short text-[16px] font-bold uppercase leading-tight tracking-wide">
                      GG/BSS Nishtar Road Campus
                    </h1>
                    {/* Desktop + Print: full official name and details */}
                    <div className="school-name-full">
                      <h1 className="text-[17px] font-bold uppercase leading-tight tracking-wide">
                        Govt. Girls / Boys Secondary School (GG/BSS)
                      </h1>
                      <p className="text-[15px] font-bold uppercase tracking-wide">Nishtar Road Campus</p>
                      <p className="text-[13px]">Nishtar Road, Karachi - Sindh, Pakistan</p>
                      <p className="text-[13px] font-bold">SEMIS Code : 408070227</p>
                    </div>
                  </div>

                  <div className="flex h-[78px] w-[78px] flex-shrink-0 items-center justify-center">
                    <NextImage
                      src="/images/ggssnishtar_mastersahib.png"
                      alt="GGSS Nishtar Road School Logo"
                      width={78}
                      height={78}
                      priority
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Photo capture — modern centered picker on mobile, compact ID-photo box on desktop/print */}
              <div className="mt-3 flex flex-col items-center gap-2 sm:items-end">
                <div className="no-print group relative flex h-32 w-32 flex-col items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#c8a96e] bg-gradient-to-b from-slate-50 to-slate-100 text-center shadow-sm sm:h-[110px] sm:w-[90px] sm:rounded-md sm:border sm:border-solid sm:border-black sm:bg-white sm:shadow-none">
                  {picturePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`data:image/jpeg;base64,${picturePreview}`} alt="Student" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex flex-col items-center gap-1 px-2 text-[#1a3a6b] sm:gap-0.5">
                      <span className="text-2xl sm:text-xs">📷</span>
                      <span className="text-xs font-semibold sm:text-[10px] sm:font-normal sm:text-slate-500 sm:underline">Add Photo</span>
                    </span>
                  )}
                  {picturePreview ? (
                    <button
                      type="button"
                      onClick={handleRemovePicture}
                      aria-label="Remove photo"
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-xs font-bold leading-none text-white shadow sm:h-5 sm:w-5 sm:text-[11px]"
                    >
                      ✕
                    </button>
                  ) : null}
                </div>
                {/* Two explicit inputs — a single input relying on the OS chooser to
                    offer "Take Photo" wasn't reliably opening the camera on some
                    phones/browsers, so camera and gallery are now separate buttons. */}
                <div className="no-print flex gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[#1a3a6b] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#132c52]">
                    📷 Take Photo
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      capture="environment"
                      onChange={handlePictureFileChange}
                      className="hidden"
                    />
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#1a3a6b] bg-white px-3 py-1.5 text-xs font-semibold text-[#1a3a6b] transition hover:bg-slate-50">
                    🖼️ Gallery
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                      onChange={handlePictureFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="no-print text-xs font-medium text-slate-500 sm:hidden">Take a new photo or choose one from your gallery</p>
                {/* Print-only static box (no interactive elements in print) */}
                <div className="hidden h-[110px] w-[90px] items-center justify-center overflow-hidden border border-black bg-white text-center text-[10px] text-slate-500 print:flex">
                  {picturePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`data:image/jpeg;base64,${picturePreview}`} alt="Student" className="h-full w-full object-cover" />
                  ) : (
                    <span className="px-1">Paste Recent Photograph</span>
                  )}
                </div>
                {pictureProcessing ? <p className="no-print text-xs text-slate-500">Processing photo...</p> : null}
                {pictureMessage && !pictureProcessing ? <p className="no-print text-xs text-slate-500">{pictureMessage}</p> : null}

                {pendingPictureImage ? (
                  <div className="no-print w-full max-w-xs rounded-2xl border border-[#c8a96e] bg-white p-3 shadow-sm sm:max-w-[220px]">
                    <p className="mb-2 text-center text-xs font-semibold text-slate-700">Adjust photo position</p>
                    <canvas
                      ref={positionPreviewCanvasRef}
                      className="mx-auto block rounded-lg border border-slate-300"
                      style={{ width: '140px', height: `${(140 * PICTURE_TARGET_HEIGHT) / PICTURE_TARGET_WIDTH}px` }}
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">Up</span>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={picturePositionBias}
                        onChange={(event) => setPicturePositionBias(Number(event.target.value))}
                        className="w-full"
                      />
                      <span className="text-[10px] text-slate-400">Down</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">Left</span>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={pictureHorizontalBias}
                        onChange={(event) => setPictureHorizontalBias(Number(event.target.value))}
                        className="w-full"
                      />
                      <span className="text-[10px] text-slate-400">Right</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">🔍−</span>
                      <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.01}
                        value={pictureZoom}
                        onChange={(event) => setPictureZoom(Number(event.target.value))}
                        className="w-full"
                      />
                      <span className="text-[10px] text-slate-400">🔍+</span>
                    </div>
                    <p className="mt-1 text-center text-[10px] text-slate-500">Slide until the face fits fully in the box</p>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={handleCancelPicturePosition}
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmPicturePosition}
                        disabled={pictureProcessing}
                        className="flex-1 rounded-lg bg-[#1a3a6b] px-2 py-1.5 text-xs font-semibold text-white transition hover:bg-[#132c52] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {pictureProcessing ? 'Saving...' : 'Use This Photo'}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Student data */}
              <div className="mb-3 mt-2 text-center text-[15px] font-bold uppercase tracking-wide text-[#1a3a6b] underline">
                Student Personal Data
              </div>

              <div className="admission-row">
                <div className="admission-field">
                  <label className="admission-label">Roll No. (Allotted by office)</label>
                  <input type="text" value={form.rollNo} onChange={(e) => handleChange('rollNo', e.target.value)} className="admission-underline" />
                </div>
                <div className="admission-field">
                  <label className="admission-label">GR No. (Allotted by office)</label>
                  <input type="text" value={form.grNo} onChange={(e) => handleChange('grNo', e.target.value)} className="admission-underline" />
                </div>
              </div>

              <div className="admission-row">
                <div className="admission-field full">
                  <label className="admission-label">Name of Student</label>
                  <input type="text" value={form.studentName} onChange={(e) => handleChange('studentName', e.target.value)} className="admission-underline" required />
                </div>
              </div>

              <div className="admission-row">
                <div className="admission-field">
                  <label className="admission-label">Date of Birth</label>
                  <input type="date" value={form.dob} onChange={(e) => handleChange('dob', e.target.value)} className="admission-underline" />
                </div>
                <div className="admission-field">
                  <label className="admission-label">in words (auto)</label>
                  <input
                    type="text"
                    value={form.dobWords}
                    disabled
                    readOnly
                    placeholder="Fills in automatically"
                    className="admission-underline cursor-not-allowed bg-slate-50 text-slate-600"
                  />
                </div>
              </div>

              <div className="admission-row">
                <div className="admission-field">
                  <label className="admission-label">Nationality</label>
                  <select value={form.nationality} onChange={(e) => handleChange('nationality', e.target.value)} className="admission-underline">
                    <option value="">Select...</option>
                    {NATIONALITY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="admission-field">
                  <label className="admission-label">Surname</label>
                  <input type="text" value={form.surname} onChange={(e) => handleChange('surname', e.target.value)} className="admission-underline" />
                </div>
                <div className="admission-field">
                  <label className="admission-label">Religion</label>
                  <select value={form.religion} onChange={(e) => handleChange('religion', e.target.value)} className="admission-underline">
                    {RELIGION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* New Student toggle — switch it on when the child has never studied anywhere before */}
              <div className="no-print mb-2 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isNewStudent}
                  onClick={handleToggleNewStudent}
                  className={`toggle-track ${isNewStudent ? 'on' : ''}`}
                >
                  <span className="toggle-knob" />
                </button>
                <span className="text-xs font-semibold text-slate-700">
                  New Student (never studied anywhere before)
                </span>
              </div>

              <div className="admission-row">
                <div className="admission-field">
                  <label className="admission-label">Previous Class</label>
                  {isNewStudent ? (
                    <span className="admission-underline inline-block text-slate-400">-</span>
                  ) : (
                    <select value={form.previousClass} onChange={(e) => handleChange('previousClass', e.target.value)} className="admission-underline">
                      <option value="">Select...</option>
                      {CLASS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="admission-row">
                <div className="admission-field full">
                  <label className="admission-label">School Name where last studied</label>
                  {isNewStudent ? (
                    <span className="admission-underline inline-block text-slate-400">-</span>
                  ) : (
                    <input type="text" value={form.lastSchool} onChange={(e) => handleChange('lastSchool', e.target.value)} className="admission-underline" />
                  )}
                </div>
              </div>

              <div className="admission-row">
                <div className="admission-field">
                  <label className="admission-label">Reason for leaving Previous School</label>
                  {isNewStudent ? (
                    <span className="admission-underline inline-block text-slate-400">-</span>
                  ) : (
                    <input type="text" value={form.leavingReason} onChange={(e) => handleChange('leavingReason', e.target.value)} className="admission-underline" />
                  )}
                </div>
                <div className="admission-field">
                  <label className="admission-label">Date of leaving previous School</label>
                  {isNewStudent ? (
                    <span className="admission-underline inline-block text-slate-400">-</span>
                  ) : (
                    <input type="date" value={form.leavingDate} onChange={(e) => handleChange('leavingDate', e.target.value)} className="admission-underline" />
                  )}
                </div>
              </div>

              <div className="admission-row">
                <div className="admission-field">
                  <label className="admission-label">
                    In which class admission sought out
                    {isNewStudent ? <span className="ml-1 font-normal text-slate-500">(new student: ECE or I only)</span> : null}
                  </label>
                  <select value={form.admissionClass} onChange={(e) => handleChange('admissionClass', e.target.value)} className="admission-underline" required>
                    <option value="">Select class...</option>
                    {(isNewStudent ? NEW_STUDENT_CLASS_OPTIONS : CLASS_OPTIONS.filter((c) => c !== 'X')).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="admission-field">
                  <label className="admission-label">Date of Admission</label>
                  <input type="date" value={form.admissionDate} onChange={(e) => handleChange('admissionDate', e.target.value)} className="admission-underline" />
                </div>
              </div>

              <div className="admission-row">
                <div className="admission-field full flex-wrap items-center gap-3">
                  <label className="admission-label">Nadra (B Form, CRC):</label>
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex cursor-pointer items-center gap-1 font-normal">
                      <input
                        type="radio"
                        name="nadraStatus"
                        checked={form.nadraStatus === 'Available'}
                        onChange={() => handleChange('nadraStatus', 'Available')}
                      />
                      Available
                    </label>
                    <label className="flex cursor-pointer items-center gap-1 font-normal">
                      <input
                        type="radio"
                        name="nadraStatus"
                        checked={form.nadraStatus === 'Not Available'}
                        onChange={() => handleChange('nadraStatus', 'Not Available')}
                      />
                      Not Available
                    </label>
                  </div>
                  <label className="admission-label ml-3">If Yes No.</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.bFormNo}
                    onChange={(e) => handleCnicFieldChange('bFormNo', e.target.value)}
                    placeholder="-"
                    maxLength={15}
                    className="admission-underline flex-1 text-center"
                  />
                </div>
              </div>

              <div className="admission-row">
                <div className="admission-field full">
                  <label className="admission-label">Address</label>
                  <input type="text" value={form.address} onChange={(e) => handleChange('address', e.target.value)} className="admission-underline" required />
                </div>
              </div>

              {/* Parents data */}
              <div className="mb-3 mt-4 text-center text-[15px] font-bold uppercase tracking-wide text-[#1a3a6b] underline">
                Parents / Guardian&apos;s Personal Data
              </div>

              <div className="admission-row">
                <div className="admission-field">
                  <label className="admission-label">Father&apos;s Name</label>
                  <input type="text" value={form.fatherName} onChange={(e) => handleChange('fatherName', e.target.value)} className="admission-underline" required />
                </div>
                <div className="admission-field">
                  <label className="admission-label">CNIC No</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.fatherCnic}
                    onChange={(e) => handleCnicFieldChange('fatherCnic', e.target.value)}
                    placeholder="-"
                    maxLength={15}
                    className="admission-underline text-center"
                  />
                </div>
              </div>

              <div className="admission-row">
                <div className="admission-field">
                  <label className="admission-label">Father&apos;s Cell No.</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.fatherCell}
                    onChange={(e) => handlePhoneFieldChange('fatherCell', e.target.value)}
                    placeholder="-"
                    maxLength={12}
                    className="admission-underline text-center"
                  />
                </div>
                <div className="admission-field">
                  <label className="admission-label">Guardian&apos;s Cell No.</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.guardianCell}
                    onChange={(e) => handlePhoneFieldChange('guardianCell', e.target.value)}
                    placeholder="-"
                    maxLength={12}
                    className="admission-underline text-center"
                  />
                </div>
              </div>

              <div className="admission-row">
                <div className="admission-field">
                  <label className="admission-label">Qualification</label>
                  <input type="text" value={form.fatherQualification} onChange={(e) => handleChange('fatherQualification', e.target.value)} className="admission-underline" />
                </div>
                <div className="admission-field">
                  <label className="admission-label">Occupation</label>
                  <input type="text" value={form.fatherOccupation} onChange={(e) => handleChange('fatherOccupation', e.target.value)} className="admission-underline" />
                </div>
              </div>

              <div className="admission-row">
                <div className="admission-field full">
                  <label className="admission-label">Company Name &amp; Address where doing job</label>
                  <input type="text" value={form.companyDetails} onChange={(e) => handleChange('companyDetails', e.target.value)} className="admission-underline" />
                </div>
              </div>

              <div className="admission-row">
                <div className="admission-field">
                  <label className="admission-label">Mother&apos;s Name</label>
                  <input type="text" value={form.motherName} onChange={(e) => handleChange('motherName', e.target.value)} className="admission-underline" />
                </div>
                <div className="admission-field">
                  <label className="admission-label">CNIC No</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.motherCnic}
                    onChange={(e) => handleCnicFieldChange('motherCnic', e.target.value)}
                    placeholder="-"
                    maxLength={15}
                    className="admission-underline text-center"
                  />
                </div>
              </div>

              <div className="admission-row">
                <div className="admission-field">
                  <label className="admission-label">Mother&apos;s Cell No.</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.motherCell}
                    onChange={(e) => handlePhoneFieldChange('motherCell', e.target.value)}
                    placeholder="-"
                    maxLength={12}
                    className="admission-underline text-center"
                  />
                </div>
                <div className="admission-field">
                  <label className="admission-label">WhatsApp No.</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={form.whatsappNo}
                    onChange={(e) => handlePhoneFieldChange('whatsappNo', e.target.value)}
                    placeholder="-"
                    maxLength={12}
                    className="admission-underline text-center"
                  />
                </div>
              </div>

              <div className="sign-area-flex mt-4 justify-end">
                <div className="w-[240px] text-center">
                  <div className="mb-1 h-[28px] border-b border-black" />
                  <p className="text-xs font-bold">Parents / Guardian&apos;s Sign.</p>
                </div>
              </div>

              {/* Office use */}
              <div className="mb-3 mt-4 text-center text-[15px] font-bold uppercase tracking-wide text-[#1a3a6b] underline">
                For Office Use Only
              </div>

              <div className="admission-row">
                <div className="admission-field">
                  <label className="admission-label">Class in which admitted</label>
                  <select value={form.officeClassAdmitted} onChange={(e) => handleChange('officeClassAdmitted', e.target.value)} className="admission-underline">
                    <option value="">Select class...</option>
                    {CLASS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="admission-field">
                  <label className="admission-label">Date of Admission</label>
                  <input type="date" value={form.officeAdmissionDate} onChange={(e) => handleChange('officeAdmissionDate', e.target.value)} className="admission-underline" />
                </div>
              </div>

              <div className="sign-area-flex admission-row">
                <div className="admission-field">
                  <label className="admission-label">Campus Head Signature</label>
                  <input type="text" value={form.campusHeadSign} onChange={(e) => handleChange('campusHeadSign', e.target.value)} className="admission-underline" />
                </div>
                <div className="admission-field">
                  <label className="admission-label">Academic Incharge Signature</label>
                  <input type="text" value={form.academicInchargeSign} onChange={(e) => handleChange('academicInchargeSign', e.target.value)} className="admission-underline" />
                </div>
              </div>

              <div className="admission-row">
                <div className="admission-field">
                  <label className="admission-label">Prepared by</label>
                  <input type="text" value={form.preparedBy} onChange={(e) => handleChange('preparedBy', e.target.value)} className="admission-underline" />
                  <span className="sign-area-flex items-end">
                    <label className="admission-label ml-3">Sign.</label>
                    <input type="text" value={form.preparedSign} onChange={(e) => handleChange('preparedSign', e.target.value)} className="admission-underline" />
                  </span>
                </div>
                <div className="admission-field">
                  <label className="admission-label">Date:</label>
                  <input type="date" value={form.officeDate} onChange={(e) => handleChange('officeDate', e.target.value)} className="admission-underline" />
                </div>
              </div>

              <div className="mt-4 border-t border-slate-300 pt-2 text-[11px] leading-relaxed text-slate-700">
                <p className="mb-1 font-bold">Documents to be attached along with:</p>
                <p>
                  1. Previous School Leaving Certificate (TC) &nbsp;&nbsp;&nbsp; 2. Father &amp; Mother CNIC Copies &nbsp;&nbsp;&nbsp; 3. Birth / Child Registration Certificate
                  <br />
                  4. Form &quot;B&quot; Issued by NADRA Office &nbsp;&nbsp;&nbsp; 5. Recent Photographs (05 Nos.)
                </p>
              </div>
            </form>
          </div>

          <div className="no-print flex flex-wrap justify-end gap-2 pb-6">
            <button
              type="button"
              onClick={handleNewForm}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              New Blank Form
            </button>
            <button
              type="button"
              onClick={handleSaveToRecords}
              disabled={saving}
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save to Records Sheet'}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-xl bg-[#1a3a6b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#132c52]"
            >
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={handleManualDownloadPdf}
              disabled={downloadingPdfManual}
              className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {downloadingPdfManual ? 'Generating PDF...' : '📥 Download PDF'}
            </button>
            <button
              type="button"
              onClick={handleShareViaWhatsapp}
              className="rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1ebe57]"
            >
              📤 Share via WhatsApp
            </button>
          </div>

          {/* Dedicated A4 Print & PDF Generation Container */}
          <div
            id="admission-form-a4-print-target"
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
              ref={printViewRef}
              data={{
                ...form,
                pictureBase64: picturePreview || undefined,
              }}
            />
          </div>
        </div>
      </main>
    </>
  );
}
