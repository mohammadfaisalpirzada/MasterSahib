import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const secret = () => process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || '';

export const hashAudiencePin = (fileId: string, pin: string) =>
  createHash('sha256').update(`${fileId}:${pin}:${secret()}`).digest('hex');

const encryptionKey = () => createHash('sha256').update(secret()).digest();

export const encryptAudiencePin = (fileId: string, pin: string) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  cipher.setAAD(Buffer.from(fileId));
  const encrypted = Buffer.concat([cipher.update(pin, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64url')).join('.');
};

export const decryptAudiencePin = (fileId: string, value: string | undefined) => {
  if (!value) return null;
  try {
    const [ivText, tagText, encryptedText] = value.split('.');
    if (!ivText || !tagText || !encryptedText) return null;
    const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(ivText, 'base64url'));
    decipher.setAAD(Buffer.from(fileId));
    decipher.setAuthTag(Buffer.from(tagText, 'base64url'));
    return Buffer.concat([decipher.update(Buffer.from(encryptedText, 'base64url')), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
};

export const createAudienceToken = (fileId: string) => {
  const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 8;
  const value = `${fileId}.${expires}`;
  const signature = createHmac('sha256', secret()).update(value).digest('hex');
  return `${value}.${signature}`;
};

export const verifyAudienceToken = (token: string | undefined, fileId: string) => {
  if (!token) return false;
  const [tokenFileId, expiresText, signature] = token.split('.');
  if (tokenFileId !== fileId || !expiresText || !signature || Number(expiresText) <= Date.now() / 1000) return false;
  const expected = createHmac('sha256', secret()).update(`${tokenFileId}.${expiresText}`).digest('hex');
  try { return timingSafeEqual(Buffer.from(signature), Buffer.from(expected)); } catch { return false; }
};
