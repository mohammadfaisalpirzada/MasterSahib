'use client';

import { useCallback, useEffect, useRef, useState, type TouchEvent } from 'react';

type Banner = {
  id: string;
  name: string;
  modifiedTime: string;
  imageUrl: string;
};

type BannerResponse = {
  banners?: Banner[];
};

/** How far banner `index` sits from the box's own `activeIndex`, as a percent
 * offset (0 = centered/visible, 100 = waiting off the right edge, -100 = just
 * exited off the left edge). Wrapping is shortest-path so it loops cleanly. */
function slideOffset(index: number, activeIndex: number, length: number) {
  let diff = index - activeIndex;
  if (diff > length / 2) diff -= length;
  if (diff < -length / 2) diff += length;
  if (diff > 2) diff = 3;
  if (diff < -2) diff = -3;
  return diff * 100;
}

function BannerBox({ banners, activeIndex, className }: { banners: Banner[]; activeIndex: number; className: string }) {
  return (
    <div className={className}>
      {banners.map((banner, index) => {
        const offset = slideOffset(index, activeIndex, banners.length);
        const isVisible = offset === 0;
        return (
          <a
            key={banner.id}
            href={banner.imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${banner.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ')} full size`}
            aria-hidden={!isVisible}
            tabIndex={isVisible ? 0 : -1}
            className="absolute inset-0 block transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: `translateX(${offset}%)` }}
          >
            <img
              src={banner.imageUrl}
              alt={banner.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ')}
              className="h-full w-full object-contain"
              loading={Math.abs(offset) <= 100 ? 'eager' : 'lazy'}
            />
          </a>
        );
      })}
    </div>
  );
}

export default function WorkshopBannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/workshop-banners', { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: BannerResponse) => setBanners(data.banners ?? []))
      .catch(() => undefined)
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const showSlide = useCallback((index: number) => {
    setActiveIndex((index + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length);
    }, 10000);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const delta = touchDeltaX.current;
    touchStartX.current = null;
    touchDeltaX.current = 0;
    const SWIPE_THRESHOLD = 40;
    if (delta > SWIPE_THRESHOLD) {
      showSlide(activeIndex - 1);
    } else if (delta < -SWIPE_THRESHOLD) {
      showSlide(activeIndex + 1);
    }
  }, [activeIndex, showSlide]);

  if (!loading && banners.length === 0) return null;

  const secondIndex = banners.length > 1 ? (activeIndex + 1) % banners.length : activeIndex;

  return (
    <section aria-label="Latest workshops and announcements" className="bg-[#f4f7fb] px-3 pb-2 pt-4 sm:px-6 sm:pt-6 dark:bg-slate-950">
      <div className="group relative mx-auto max-w-7xl rounded-[1.5rem] bg-slate-100/80 p-2 shadow-[0_18px_50px_-25px_rgba(15,23,42,0.35)] sm:rounded-[2rem] sm:p-3 dark:bg-slate-900/60">
        {loading ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
            <div className="aspect-video animate-pulse rounded-2xl bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800" />
            <div className="hidden aspect-video animate-pulse rounded-2xl bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 sm:block dark:from-slate-800 dark:via-slate-900 dark:to-slate-800" />
          </div>
        ) : (
          <>
            <div
              className="relative touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Two banners per row on tablet/desktop, each its own rounded card. Both
                  slide right-to-left together (whatever was on the right becomes the left,
                  the old left exits further left) instead of swapping instantly. Mobile
                  shows one at a time with swipe. Click a banner to open it full size. */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                <BannerBox
                  banners={banners}
                  activeIndex={activeIndex}
                  className="relative aspect-video overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 dark:bg-slate-800 dark:ring-white/10"
                />
                {banners.length > 1 ? (
                  <BannerBox
                    banners={banners}
                    activeIndex={secondIndex}
                    className="relative hidden aspect-video overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 sm:block dark:bg-slate-800 dark:ring-white/10"
                  />
                ) : null}
              </div>

              {banners.length > 1 ? (
                <>
                  <button type="button" onClick={() => showSlide(activeIndex - 1)} aria-label="Previous banner" className="absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/35 text-2xl text-white backdrop-blur transition hover:bg-black/60 sm:grid sm:left-6">‹</button>
                  <button type="button" onClick={() => showSlide(activeIndex + 1)} aria-label="Next banner" className="absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/35 text-2xl text-white backdrop-blur transition hover:bg-black/60 sm:grid sm:right-6">›</button>
                </>
              ) : null}
            </div>

            {banners.length > 1 ? (
              <div className="flex items-center justify-center gap-2 pb-1 pt-3">
                {banners.map((banner, index) => (
                  <button key={banner.id} type="button" onClick={() => showSlide(index)} aria-label={`Show banner ${index + 1}`} aria-current={index === activeIndex ? 'true' : undefined} className={`h-2 rounded-full transition-all ${index === activeIndex ? 'w-7 bg-slate-800 dark:bg-white' : 'w-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500'}`} />
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
