import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const STAFF_ADMIN_SESSION_COOKIE = 'ggss_admin_session';
const STAFF_ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;

type StaffAdminSessionPayload = {
  role: 'staff-admin';
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

const getAdminPassword = () => process.env.GGSS_ADMIN_PASSWORD?.trim() || 'adminadmin321';

const encode = (value: string) => Buffer.from(value, 'utf8').toString('base64url');
const decode = (value: string) => Buffer.from(value, 'base64url').toString('utf8');

const sign = (payloadPart: string) => {
  return createHmac('sha256', getSessionSecret()).update(payloadPart).digest('base64url');
};

export const verifyStaffAdminPassword = (password: string) => {
  const expected = Buffer.from(getAdminPassword());
  const provided = Buffer.from(password);

  if (expected.length !== provided.length) {
    return false;
  }

  return timingSafeEqual(expected, provided);
};

export const createStaffAdminSessionToken = () => {
  const now = Math.floor(Date.now() / 1000);
  const payload: StaffAdminSessionPayload = {
    role: 'staff-admin',
    iat: now,
    exp: now + STAFF_ADMIN_SESSION_TTL_SECONDS,
  };

  const payloadPart = encode(JSON.stringify(payload));
  const signaturePart = sign(payloadPart);
  return `${payloadPart}.${signaturePart}`;
};

export const verifyStaffAdminSessionToken = (token: string): StaffAdminSessionPayload | null => {
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

    const payload = JSON.parse(decode(payloadPart)) as StaffAdminSessionPayload;
    if (payload.role !== 'staff-admin') {
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
