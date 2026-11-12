/**
 * Shared (client + server) helpers for The Master Store download / open counter.
 *
 * Displayed count = starting figure (stable per app, 200–500) + real counted clicks.
 * The starting figure comes from a hash of the app id, so it never changes between
 * visits or deploys. Set STORE_COUNT_SEED_MIN/MAX to 0 to show only real counts.
 */
const STORE_COUNT_SEED_MIN = 200;
const STORE_COUNT_SEED_MAX = 500;

export function seedCount(appId: string): number {
  let h = 2166136261;
  for (let i = 0; i < appId.length; i++) {
    h ^= appId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const span = STORE_COUNT_SEED_MAX - STORE_COUNT_SEED_MIN + 1;
  return STORE_COUNT_SEED_MIN + ((h >>> 0) % span);
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, '')}K`;
  return String(n);
}
