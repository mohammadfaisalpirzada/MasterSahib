export type SessionRole = 'admin' | 'teacher' | 'student';

export type SessionPayload = {
  role: SessionRole;
  source: 'peace-quiz';
  username: string;
  programName: string;
  classLevel?: string;
  iat: number;
  exp: number;
};

export const AUTH_SESSION_COOKIE = 'ms_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const SESSION_SECRET_ENV_KEYS = ['AUTH_SESSION_SECRET', 'AUTH_SECRET', 'NEXTAUTH_SECRET'] as const;

const getSessionSecret = () => {
  for (const key of SESSION_SECRET_ENV_KEYS) {
    const envSecret = process.env[key]?.trim();
    if (envSecret) {
      return envSecret;
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    return 'dev-only-session-secret-change-me';
  }

  throw new Error(
    'Missing session secret environment variable. Set AUTH_SESSION_SECRET (or AUTH_SECRET / NEXTAUTH_SECRET).'
  );
};

const toBase64Url = (bytes: Uint8Array) => {
  const base64 =
    typeof Buffer !== 'undefined'
      ? Buffer.from(bytes).toString('base64')
      : btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const fromBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(padded, 'base64'));
  }

  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
};

const signValue = async (value: string, secret: string) => {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
};

const safeJsonParse = <T>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

export const createSessionToken = async (params: {
  role: SessionRole;
  username: string;
  programName: string;
  classLevel?: string;
  source?: 'peace-quiz';
  ttlSeconds?: number;
}) => {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    role: params.role,
    source: params.source ?? 'peace-quiz',
    username: params.username,
    programName: params.programName,
    ...(params.classLevel ? { classLevel: params.classLevel } : {}),
    iat: now,
    exp: now + (params.ttlSeconds ?? SESSION_TTL_SECONDS),
  };

  const payloadPart = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signaturePart = await signValue(payloadPart, getSessionSecret());
  return `${payloadPart}.${signaturePart}`;
};

export const verifySessionToken = async (token: string): Promise<SessionPayload | null> => {
  try {
    const [payloadPart, signaturePart] = token.split('.');
    if (!payloadPart || !signaturePart) {
      return null;
    }

    const expectedSignature = await signValue(payloadPart, getSessionSecret());
    if (signaturePart !== expectedSignature) {
      return null;
    }

    const payloadJson = decoder.decode(fromBase64Url(payloadPart));
    const payload = safeJsonParse<SessionPayload>(payloadJson);

    if (!payload) {
      return null;
    }

    if (!payload.username || !payload.programName) {
      return null;
    }

    if (!['admin', 'teacher', 'student'].includes(payload.role)) {
      return null;
    }

    if (payload.source !== 'peace-quiz') {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};
