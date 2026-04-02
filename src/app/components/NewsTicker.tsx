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

const fallbackHeadline = 'Latest Pakistani education updates will appear here shortly.';

export default function NewsTicker() {
  const [items, setItems] = useState<EducationNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadNews = async () => {
      try {
        const response = await fetch('/api/education-news', { cache: 'no-store' });
        const data = (await response.json()) as EducationNewsApiResponse;

        if (!isMounted) {
          return;
        }

        const nextItems = Array.isArray(data.items)
          ? data.items.filter((item) => Boolean(item?.title && item?.link))
          : data.item?.title && data.item.link
            ? [data.item]
            : [];

        setItems(nextItems.slice(0, 8));
      } catch {
        if (isMounted) {
          setItems([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadNews();

    return () => {
      isMounted = false;
    };
  }, []);

  const tickerItems = useMemo(() => {
    if (items.length > 0) {
      return [...items, ...items];
    }

    const message = loading ? 'Loading latest Pakistani education updates...' : fallbackHeadline;
    return [
      { title: message, link: '' },
      { title: message, link: '' },
      { title: message, link: '' },
    ];
  }, [items, loading]);

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
