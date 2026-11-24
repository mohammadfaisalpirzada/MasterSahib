import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const ADMISSION_FORM_SESSION_COOKIE = 'ggss_admission_form_session';
const ADMISSION_FORM_SESSION_TTL_SECONDS = 60 * 60 * 8;

type AdmissionFormSessionPayload = {
  role: 'admission-form-staff';
  iat: number;
  exp: number;
};

const requiredEnv = (key: string) => {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getSessionSecret = () => requiredEnv('AUTH_SESSION_SECRET');

// Separate, lighter-weight password just for front-desk / admission staff.
// Must be set via GGSS_ADMISSION_FORM_PASSWORD — no hardcoded fallback, on purpose.
const getAdmissionFormPassword = () => requiredEnv('GGSS_ADMISSION_FORM_PASSWORD');

const encode = (value: string) => Buffer.from(value, 'utf8').toString('base64url');
const decode = (value: string) => Buffer.from(value, 'base64url').toString('utf8');

const sign = (payloadPart: string) => {
  return createHmac('sha256', getSessionSecret()).update(payloadPart).digest('base64url');
};

export const verifyAdmissionFormPassword = (password: string) => {
  const expected = Buffer.from(getAdmissionFormPassword());
  const provided = Buffer.from(password);

  if (expected.length !== provided.length) {
    return false;
  }

  return timingSafeEqual(expected, provided);
};

export const createAdmissionFormSessionToken = () => {
  const now = Math.floor(Date.now() / 1000);
  const payload: AdmissionFormSessionPayload = {
    role: 'admission-form-staff',
    iat: now,
    exp: now + ADMISSION_FORM_SESSION_TTL_SECONDS,
  };

  const payloadPart = encode(JSON.stringify(payload));
  const signaturePart = sign(payloadPart);
  return `${payloadPart}.${signaturePart}`;
};

export const verifyAdmissionFormSessionToken = (token: string): AdmissionFormSessionPayload | null => {
  try {
    const [payloadPart, signaturePart] = token.split('.');
    if (!payloadPart || !signaturePart) {
      return null;
    }

    const expectedSignature = sign(payloadPart);
    const expectedBuffer = Buffer.from(expectedSignature);
    const providedBuffer = Buffer.from(signaturePart);
    if (expectedBuffer.length !== providedBuffer.length || !timingSafeEqual(expectedBuffer, providedBuffer)) {
      return null;
    }

    const payload = JSON.parse(decode(payloadPart)) as AdmissionFormSessionPayload;
    if (payload.role !== 'admission-form-staff') {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp <= now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

// ---------------------------------------------------------------------------
// QR verification links + single-record viewer sessions
// ---------------------------------------------------------------------------
// Every printed QR link carries a server-made signature (?verify=<target>&s=<sig>).
// Changing the row/serial number in the link breaks the signature, so a viewer
// can never open a different record by editing the URL.

export const ADMISSION_RECORD_VIEWER_COOKIE = 'ggss_admission_record_viewer';
export const ADMISSION_RECORD_VIEWER_COOKIE_PATH = '/api/ggss-admission-form/records';
export const ADMISSION_RECORD_VIEWER_TTL_SECONDS = 60 * 10; // 10 minutes, then login again

type AdmissionRecordViewerPayload = {
  role: 'admission-record-viewer';
  target: string;
  iat: number;
  exp: number;
};

const safeEqual = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

export const signAdmissionVerifyTarget = (target: string) =>
  sign(`admission-verify:v1:${String(target).trim()}`).slice(0, 22);

export const isValidAdmissionVerifySignature = (target: string, signature: string) => {
  const cleanTarget = String(target ?? '').trim();
  const cleanSig = String(signature ?? '').trim();
  if (!cleanTarget || !cleanSig) return false;
  try {
    return safeEqual(signAdmissionVerifyTarget(cleanTarget), cleanSig);
  } catch {
    return false;
  }
};

export const createAdmissionRecordViewerToken = (target: string) => {
  const now = Math.floor(Date.now() / 1000);
  const payload: AdmissionRecordViewerPayload = {
    role: 'admission-record-viewer',
    target: String(target).trim(),
    iat: now,
    exp: now + ADMISSION_RECORD_VIEWER_TTL_SECONDS,
  };
  const payloadPart = encode(JSON.stringify(payload));
  return `${payloadPart}.${sign(payloadPart)}`;
};

export const verifyAdmissionRecordViewerToken = (token: string): AdmissionRecordViewerPayload | null => {
  try {
    const [payloadPart, signaturePart] = token.split('.');
    if (!payloadPart || !signaturePart || !safeEqual(sign(payloadPart), signaturePart)) return null;
    const payload = JSON.parse(decode(payloadPart)) as AdmissionRecordViewerPayload;
    if (payload.role !== 'admission-record-viewer' || !payload.target) return null;
    if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
};
