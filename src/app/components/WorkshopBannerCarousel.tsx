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

  return (
    <section aria-label="Latest workshops and announcements" className="bg-[#f4f7fb] px-3 pb-2 pt-4 sm:px-6 sm:pt-6 dark:bg-slate-950">
      <div className="group relative mx-auto max-w-7xl overflow-hidden rounded-[1.5rem] bg-slate-950 shadow-[0_22px_70px_-30px_rgba(15,23,42,0.7)] sm:rounded-[2rem]">
        {loading ? (
          <div className="aspect-video animate-pulse bg-gradient-to-br from-slate-800 via-slate-900 to-cyan-950" />
        ) : (
          <>
            <div
              className="relative aspect-video touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {banners.map((banner, index) => (
                <article
                  key={banner.id}
                  aria-hidden={index !== activeIndex}
                  className={`absolute inset-0 transition duration-700 ease-out ${index === activeIndex ? 'scale-100 opacity-100' : 'pointer-events-none scale-[1.03] opacity-0'}`}
                >
                  <img
                    src={banner.imageUrl}
                    alt={banner.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ')}
                    className="h-full w-full object-contain"
                    loading={index === 0 ? 'eager' : 'lazy'}
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/65 to-transparent" />
                </article>
              ))}
            </div>

            {banners.length > 1 ? (
              <>
                <button type="button" onClick={() => showSlide(activeIndex - 1)} aria-label="Previous banner" className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/35 text-2xl text-white backdrop-blur transition hover:bg-black/60 sm:grid sm:left-5">‹</button>
                <button type="button" onClick={() => showSlide(activeIndex + 1)} aria-label="Next banner" className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/35 text-2xl text-white backdrop-blur transition hover:bg-black/60 sm:grid sm:right-5">›</button>
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/35 px-3 py-2 backdrop-blur sm:bottom-5">
                  {banners.map((banner, index) => (
                    <button key={banner.id} type="button" onClick={() => showSlide(index)} aria-label={`Show banner ${index + 1}`} aria-current={index === activeIndex ? 'true' : undefined} className={`h-2 rounded-full transition-all ${index === activeIndex ? 'w-7 bg-white' : 'w-2 bg-white/55 hover:bg-white/80'}`} />
                  ))}
                </div>
              </>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
