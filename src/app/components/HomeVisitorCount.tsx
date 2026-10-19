'use client';

import { useEffect, useState } from 'react';

type VisitorCountApiResponse = {
  success: boolean;
  count?: number;
  message?: string;
};

const fetchVisitorCount = async (markVisited: boolean): Promise<number | null> => {
  const response = markVisited
    ? await fetch('/api/visitor-count', { method: 'POST' })
    : await fetch('/api/visitor-count');
  const data = (await response.json()) as VisitorCountApiResponse;
  if (data.success && typeof data.count === 'number') {
    return data.count;
  }
  return null;
};

export default function HomeVisitorCount() {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const countVisit = async () => {
      const alreadyCounted = sessionStorage.getItem('ms_visited');

      // One retry after a short delay: a single transient network/API hiccup
      // (e.g. the Sheets backend briefly unreachable) shouldn't leave this
      // stuck on "—" for the whole page view — see AI_IMPROVEMENT_LOG.md 2026-10-06.
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const count = await fetchVisitorCount(!alreadyCounted);
          if (cancelled) return;
          if (count !== null) {
            setVisitorCount(count);
            if (!alreadyCounted) {
              sessionStorage.setItem('ms_visited', '1');
            }
            return;
          }
        } catch {
          // Visitor counter is non-critical — fall through to retry/give up.
        }

        if (attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }
    };

    void countVisit();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <span className="text-xl font-black text-cyan-800 dark:text-cyan-300">
      {visitorCount !== null ? visitorCount.toLocaleString() : '—'}
    </span>
  );
}
