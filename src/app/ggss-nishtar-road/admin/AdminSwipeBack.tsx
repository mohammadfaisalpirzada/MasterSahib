'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminSwipeBack() {
  const pathname = usePathname();
  const router = useRouter();

  const [swipeProgress, setSwipeProgress] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);

  const touchState = useRef<{
    startX: number;
    startY: number;
    startTime: number;
    isEligible: boolean;
  }>({
    startX: 0,
    startY: 0,
    startTime: 0,
    isEligible: false,
  });

  const isAdminSubpage = Boolean(
    pathname &&
      pathname.startsWith('/ggss-nishtar-road/admin/') &&
      pathname !== '/ggss-nishtar-road/admin'
  );

  // Reset state on route change
  useEffect(() => {
    setSwipeProgress(0);
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    if (!isAdminSubpage) return undefined;

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        touchState.current.isEligible = false;
        return;
      }

      // Only enable on mobile / tablet screens or touch-primary devices
      const isMobileOrTablet =
        window.innerWidth <= 1024 ||
        ('ontouchstart' in window && window.innerWidth <= 1280);
      if (!isMobileOrTablet) {
        touchState.current.isEligible = false;
        return;
      }

      const touch = event.touches[0];
      const target = event.target as HTMLElement | null;

      // Avoid intercepting interactive form controls
      if (target) {
        const tagName = target.tagName.toLowerCase();
        if (
          ['input', 'textarea', 'select', 'button', 'option'].includes(tagName) ||
          target.closest('input, textarea, select, [data-no-swipe]')
        ) {
          touchState.current.isEligible = false;
          return;
        }

        // Avoid intercepting horizontally scrollable containers (e.g. scrollable tables)
        let el: HTMLElement | null = target;
        while (el && el !== document.body) {
          const style = window.getComputedStyle(el);
          const isOverflowX =
            style.overflowX === 'auto' || style.overflowX === 'scroll';
          if (isOverflowX && el.scrollWidth > el.clientWidth + 8) {
            touchState.current.isEligible = false;
            return;
          }
          el = el.parentElement;
        }
      }

      touchState.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
        isEligible: true,
      };
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!touchState.current.isEligible || event.touches.length !== 1) return;

      const touch = event.touches[0];
      const dx = touch.clientX - touchState.current.startX;
      const dy = touch.clientY - touchState.current.startY;

      // Right-to-left swipe check (finger moves left, dx < 0)
      if (dx < -25 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        const progress = Math.min(1, Math.max(0, Math.abs(dx) / 75));
        setSwipeProgress(progress);
      } else if (dx >= 0 || Math.abs(dy) > Math.abs(dx)) {
        setSwipeProgress(0);
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (!touchState.current.isEligible) return;

      const touch = event.changedTouches[0];
      if (!touch) {
        setSwipeProgress(0);
        return;
      }

      const dx = touch.clientX - touchState.current.startX;
      const dy = touch.clientY - touchState.current.startY;
      const elapsed = Date.now() - touchState.current.startTime;

      touchState.current.isEligible = false;

      // Trigger condition: swiped right-to-left by at least 70px, mostly horizontal, within 750ms
      if (
        dx <= -70 &&
        Math.abs(dx) > Math.abs(dy) * 1.4 &&
        elapsed <= 750
      ) {
        setIsNavigating(true);
        setSwipeProgress(1);
        router.push('/ggss-nishtar-road/admin');
      } else {
        setSwipeProgress(0);
      }
    };

    const handleTouchCancel = () => {
      touchState.current.isEligible = false;
      setSwipeProgress(0);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [isAdminSubpage, router]);

  if (!isAdminSubpage) return null;

  return (
    <>
      {(swipeProgress > 0 || isNavigating) && (
        <div
          className="no-print pointer-events-none fixed right-4 top-1/2 -translate-y-1/2 z-[9999] flex items-center gap-2 rounded-full border border-teal-200/40 bg-[#1a3a6b]/95 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-2xl backdrop-blur-sm transition-all duration-150"
          style={{
            opacity: isNavigating ? 1 : Math.max(0.4, swipeProgress),
            transform: `translateY(-50%) translateX(${
              isNavigating ? 0 : Math.max(0, 24 - swipeProgress * 24)
            }px)`,
          }}
          aria-live="polite"
        >
          <span
            className="inline-block text-sm transition-transform duration-150"
            style={{ transform: `translateX(-${swipeProgress * 4}px)` }}
          >
            ←
          </span>
          <span>{isNavigating ? 'Returning to Admin…' : 'Back to Admin'}</span>
        </div>
      )}
    </>
  );
}
