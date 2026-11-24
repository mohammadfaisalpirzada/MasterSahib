import 'server-only';

/**
 * Rate limiter for login / password / public-form endpoints.
 *
 * Shared store (preferred): Upstash Redis over its REST API. Every server
 * instance Vercel starts counts against the SAME number, so a guesser cannot
 * dodge the limit by landing on a different instance. Enabled automatically
 * when these env vars exist (Vercel Marketplace "Upstash Redis" sets the KV_* pair):
 *   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN   (or)
 *   KV_REST_API_URL        + KV_REST_API_TOKEN
 *
 * Fallback: per-instance in-memory counter (the old behaviour). Used when the
 * env vars are missing OR Redis is unreachable, so a Redis outage can never
 * lock every user out of the site — it just degrades to the weaker limiter.
 *
 * Window type: fixed window (first attempt starts the clock, resets after
 * `windowSeconds`).
 */

type Bucket = { windowStart: number; count: number };
type Result = { allowed: true } | { allowed: false; retryAfterSeconds: number };

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

const checkMemory = (key: string, limit: number, windowSeconds: number): Result => {
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

const redisConfig = () => {
  const url = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '').trim().replace(/\/+$/, '');
  const token = (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '').trim();
  return url && token ? { url, token } : null;
};

const checkRedis = async (
  config: { url: string; token: string },
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<Result> => {
  const redisKey = `ms:rl:${key}`;
  const response = await fetch(`${config.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
    // INCR counts this attempt; EXPIRE ... NX starts the window only on the first attempt.
    body: JSON.stringify([
      ['INCR', redisKey],
      ['EXPIRE', redisKey, String(windowSeconds), 'NX'],
      ['TTL', redisKey],
    ]),
    cache: 'no-store',
    signal: AbortSignal.timeout(1500),
  });
  if (!response.ok) throw new Error(`Rate limit store HTTP ${response.status}`);

  const data = (await response.json()) as Array<{ result?: number; error?: string }>;
  if (!Array.isArray(data) || data.some((entry) => entry?.error)) throw new Error('Rate limit store error');

  const count = Number(data[0]?.result ?? 0);
  const ttl = Number(data[2]?.result ?? windowSeconds);
  if (!Number.isFinite(count) || count < 1) throw new Error('Rate limit store bad reply');

  if (count > limit) {
    return { allowed: false, retryAfterSeconds: Math.max(1, ttl > 0 ? ttl : windowSeconds) };
  }
  return { allowed: true };
};

/**
 * Returns { allowed: false, retryAfterSeconds } once `limit` attempts have
 * been made for this `key` (e.g. `login:admin:<ip>`) within `windowSeconds`.
 * `await` it BEFORE doing the sensitive work (password check, etc.) on every
 * attempt, success or failure, so repeated guesses all count.
 */
export const checkRateLimit = async (key: string, limit: number, windowSeconds: number): Promise<Result> => {
  const config = redisConfig();
  if (config) {
    try {
      return await checkRedis(config, key, limit, windowSeconds);
    } catch {
      // Redis unreachable: fall back to the per-instance counter rather than failing open or closed.
    }
  }
  return checkMemory(key, limit, windowSeconds);
};
