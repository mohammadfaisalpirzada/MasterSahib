import 'server-only';

/**
 * Minimal in-memory sliding-window rate limiter for login/auth endpoints.
 *
 * Limitation (documented on purpose): this is per-server-instance memory, so on
 * a serverless/multi-instance deployment (e.g. Vercel) it does not share state
 * across cold starts or concurrent instances. It still meaningfully slows down
 * a single-instance or single-session brute-force attempt, and costs nothing
 * extra to run. A shared store (Upstash Redis, etc.) would make this airtight
 * across instances - flagged as a possible follow-up, not required for the
 * threat this currently blocks (naive automated password guessing).
 *
 * Mirrors the existing in-memory usage-tracking pattern already used in
 * src/app/api/educational-resources/worksheet-builder/route.ts.
 */

type Bucket = { windowStart: number; count: number };

const globalRateLimitStore = globalThis as typeof globalThis & {
  __msRateLimitBuckets?: Map<string, Bucket>;
};

const buckets = globalRateLimitStore.__msRateLimitBuckets ?? new Map<string, Bucket>();
globalRateLimitStore.__msRateLimitBuckets = buckets;

export const getClientIdentifier = (request: Request): string => {
  const forwardedFor = request.headers.get('x-forwarded-for') || '';
  const ip = forwardedFor.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  return ip;
};

/**
 * Returns { allowed: false, retryAfterSeconds } once `limit` attempts have
 * been made for this `key` (e.g. `login:admin:<ip>`) within `windowSeconds`.
 * Call this BEFORE doing the expensive/sensitive work (password check, etc.)
 * on every attempt, success or failure, so repeated guesses all count.
 */
export const checkRateLimit = (
  key: string,
  limit: number,
  windowSeconds: number,
): { allowed: true } | { allowed: false; retryAfterSeconds: number } => {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStart >= windowMs) {
    buckets.set(key, { windowStart: now, count: 1 });
    return { allowed: true };
  }

  if (existing.count >= limit) {
    const retryAfterSeconds = Math.ceil((existing.windowStart + windowMs - now) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfterSeconds) };
  }

  existing.count += 1;
  return { allowed: true };
};
