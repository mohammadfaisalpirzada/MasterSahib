import Image from 'next/image';
import Link from 'next/link';

const STORE_HREF = '/the-master-store';

/**
 * Home page promo for The Master Store.
 * - Desktop (lg+): wide banner + TMS "GET" app card side by side.
 * - Mobile/tablet: TMS "GET" app card only (the wide banner's text gets too small).
 */
export default function HomeMasterStoreBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8" aria-label="The Master Store">
      <div className="grid items-center gap-6 lg:grid-cols-4">
        {/* Wide banner — desktop only */}
        <Link
          href={STORE_HREF}
          aria-label="Browse The Master Store"
          className="group relative hidden overflow-hidden rounded-3xl bg-[#071426] shadow-xl shadow-slate-900/20 ring-1 ring-slate-900/10 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-900/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/60 lg:col-span-3 lg:block dark:ring-white/10"
        >
          <Image
            src="/images/the-master-store-desktop-banner.jpg"
            alt="The Master Store — Smart everyday tools & utilities to simplify your work."
            width={1600}
            height={893}
            sizes="(min-width: 1280px) 912px, 75vw"
            className="h-auto w-full transition duration-500 group-hover:scale-[1.015]"
          />
        </Link>

        {/* TMS app card: image as background, GET button is the link */}
        <div className="mx-auto w-full max-w-xs lg:max-w-none">
          <div
            role="img"
            aria-label="The Master Store app icon"
            className="relative aspect-square w-full overflow-hidden rounded-3xl bg-[#0a2343] bg-cover bg-center shadow-xl shadow-slate-900/25 ring-1 ring-slate-900/10 dark:ring-white/10"
            style={{ backgroundImage: "url('/images/tms-get-card.jpg')" }}
          >
            {/* Clickable hotspot sitting exactly over the GET button in the artwork */}
            <Link
              href={STORE_HREF}
              aria-label="Get — open The Master Store"
              title="Open The Master Store"
              className="absolute left-[34%] top-[73%] h-[13%] w-[32%] rounded-full transition duration-200 hover:scale-105 hover:shadow-[0_0_28px_rgba(34,211,238,0.65)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/80 active:scale-95"
            />
          </div>

          <div className="mt-4 text-center">
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              <Link href={STORE_HREF} className="transition hover:text-cyan-600 dark:hover:text-cyan-400">
                The Master Store
              </Link>
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Smart everyday tools &amp; utilities to simplify your work.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
