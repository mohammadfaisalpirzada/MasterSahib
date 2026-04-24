import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const GGSS_STIPEND_SESSION_COOKIE = 'ggss_stipend_session';
const GGSS_STIPEND_SESSION_TTL_SECONDS = 60 * 60 * 8;

export const GGSS_STIPEND_CLASS_USERS = ['Class VIG', 'Class IXG', 'Class XG'] as const;

type GgssStipendSessionPayload = {
  role: 'ggss-stipend-teacher';
  username: string;
  className: string;
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
const getTeacherPassword = () => process.env.GGSS_STIPEND_PASSWORD?.trim() || 'ggssnishtarroad';

const encode = (value: string) => Buffer.from(value, 'utf8').toString('base64url');
const decode = (value: string) => Buffer.from(value, 'base64url').toString('utf8');

const sign = (payloadPart: string) => {
  return createHmac('sha256', getSessionSecret()).update(payloadPart).digest('base64url');
};

const isAllowedUsername = (username: string) => {
  return GGSS_STIPEND_CLASS_USERS.includes(username as (typeof GGSS_STIPEND_CLASS_USERS)[number]);
};

export const verifyGgssStipendCredentials = (username: string, password: string) => {
  if (!isAllowedUsername(username)) {
    return false;
  }

  const expected = Buffer.from(getTeacherPassword());
  const provided = Buffer.from(password);

  if (expected.length !== provided.length) {
    return false;
  }

  return timingSafeEqual(expected, provided);
};

export const createGgssStipendSessionToken = (username: string) => {
  if (!isAllowedUsername(username)) {
    throw new Error('Invalid stipend username.');
  }

  const now = Math.floor(Date.now() / 1000);
  const payload: GgssStipendSessionPayload = {
    role: 'ggss-stipend-teacher',
    username,
    className: username,
    iat: now,
    exp: now + GGSS_STIPEND_SESSION_TTL_SECONDS,
  };

  const payloadPart = encode(JSON.stringify(payload));
  const signaturePart = sign(payloadPart);
  return `${payloadPart}.${signaturePart}`;
};

export const verifyGgssStipendSessionToken = (token: string): GgssStipendSessionPayload | null => {
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

    const payload = JSON.parse(decode(payloadPart)) as GgssStipendSessionPayload;
    if (payload.role !== 'ggss-stipend-teacher' || !isAllowedUsername(payload.username)) {
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
