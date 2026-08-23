'use client';

import { useEffect, useState } from 'react';

type VisitorCountApiResponse = {
  success: boolean;
  count?: number;
  message?: string;
};

export default function HomeVisitorCount() {
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  useEffect(() => {
    const countVisit = async () => {
      try {
        const alreadyCounted = sessionStorage.getItem('ms_visited');
        if (!alreadyCounted) {
          const response = await fetch('/api/visitor-count', { method: 'POST' });
          const data = (await response.json()) as VisitorCountApiResponse;
          if (data.success && typeof data.count === 'number') {
            setVisitorCount(data.count);
            sessionStorage.setItem('ms_visited', '1');
          }
        } else {
          const response = await fetch('/api/visitor-count');
          const data = (await response.json()) as VisitorCountApiResponse;
          if (data.success && typeof data.count === 'number') {
            setVisitorCount(data.count);
          }
        }
      } catch {
        // Visitor counter is non-critical
      }
    };

    void countVisit();
  }, []);

  return (
    <span className="text-xl font-black text-cyan-800 dark:text-cyan-300">
      {visitorCount !== null ? visitorCount.toLocaleString() : '—'}
    </span>
  );
}
