'use client';

import { useEffect, useMemo, useState } from 'react';

type EducationNewsItem = {
  title: string;
  link: string;
};

type EducationNewsApiResponse = {
  success: boolean;
  items?: EducationNewsItem[];
  item?: EducationNewsItem | null;
};

const fallbackItems: EducationNewsItem[] = [
  { title: 'Educational resources are ready for your next class.', link: '/teaching-tools' },
  { title: 'Daily quiz practice is available for students right now.', link: '/peace-quiz' },
  { title: 'Resume builder and portfolio sections are active for learners.', link: '/resume-builder' },
  { title: 'Fresh education and tech headlines are syncing in the background.', link: '/' },
];

export default function NewsTicker() {
  const [items, setItems] = useState<EducationNewsItem[]>(fallbackItems);

  useEffect(() => {
    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const loadNews = async () => {
      try {
        const response = await fetch(`/api/education-news?ts=${Date.now()}`, { cache: 'no-store' });
        const data = (await response.json()) as EducationNewsApiResponse;

        if (!isMounted) {
          return;
        }

        const nextItems = Array.isArray(data.items)
          ? data.items.filter((item) => Boolean(item?.title && item?.link))
          : data.item?.title && data.item.link
            ? [data.item]
            : [];

        setItems(nextItems.length > 0 ? nextItems.slice(0, 8) : fallbackItems);
      } catch {
        if (isMounted) {
          setItems(fallbackItems);
        }
      }
    };

    void loadNews();
    intervalId = setInterval(() => {
      void loadNews();
    }, 30 * 60 * 1000);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const tickerItems = useMemo(() => {
    const activeItems = items.length > 0 ? items : fallbackItems;
    return [...activeItems, ...activeItems];
  }, [items]);

  return (
    <div className="w-full overflow-hidden border-b border-slate-700/80 bg-slate-900 text-white">
      <div className="news-ticker">
        <div className="news-ticker-track">
          {tickerItems.map((item, index) => (
            <span key={`${item.title}-${index}`} className="news-ticker-item">
              {item.link ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-cyan-200"
                >
                  {item.title}
                </a>
              ) : (
                <span>{item.title}</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
