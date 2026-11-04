import { cookies } from 'next/headers';
import { timingSafeEqual } from 'node:crypto';

// Constant-time string compare - a plain `===` here would let an attacker
// infer the correct session token byte-by-byte from response timing.
// See AI_IMPROVEMENT_LOG.md for context (security-audit.md flagged this as
// the one auth module in the app not already using timingSafeEqual/HMAC).
const safeEqual = (a: string, b: string) => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
};

export async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('district_east_admin')?.value;
  const expected = process.env.ADMIN_SESSION_TOKEN;
  if (!token || !expected) return false;
  return safeEqual(token, expected);
}
