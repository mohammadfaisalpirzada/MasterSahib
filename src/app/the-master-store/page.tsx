import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  HiOutlineDownload,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineExternalLink,
  HiOutlineDeviceMobile,
  HiOutlineCheckCircle,
  HiOutlineLightningBolt,
  HiOutlineMusicNote,
  HiOutlineShare,
  HiOutlineRefresh,
  HiOutlineDocumentText,
  HiOutlineFilm,
} from 'react-icons/hi';

export const metadata = {
  title: 'The Master Store | Official Android Apps & Software Series by The Master Sahib',
  description:
    'Download official high-performance Android applications, video editors, and utility tools developed by The Master Sahib. Direct APK downloads from verified GitHub releases.',
};

export default function MasterStorePage() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 py-16 sm:py-20">
        <div className="absolute -left-20 top-[-100px] h-80 w-80 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="absolute right-[-80px] top-10 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold tracking-wider text-cyan-400">
              <HiOutlineSparkles className="h-4 w-4 text-cyan-400" />
              THE MASTER SAHIB OFFICIAL SOFTWARE HUB
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              The Master Store
            </h1>
            <p className="mt-2 text-xl font-semibold text-cyan-400">
              دی ماسٹر اسٹور • سرکاری سافٹ ویئر پورٹل
            </p>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Official application distribution portal by The Master Sahib Educational &amp; Software Series.
              Directly download high-speed, privacy-first Android APKs compiled via verified automated GitHub pipelines.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <HiOutlineShieldCheck className="h-4 w-4 text-emerald-400" /> 100% Zero Login Privacy
              </span>
              <span className="flex items-center gap-1.5">
                <HiOutlineLightningBolt className="h-4 w-4 text-cyan-400" /> Direct High-Speed CDN Releases
              </span>
              <span className="flex items-center gap-1.5">
                <HiOutlineCheckCircle className="h-4 w-4 text-blue-400" /> Cryptographically Verified APKs
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Flagship Release: Download Master */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">Featured Application</p>
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Flagship Android App</h2>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
            Latest Release v1.0.15
          </span>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-slate-700/80 bg-gradient-to-br from-slate-800/90 to-slate-900/90 p-6 shadow-2xl sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            {/* App Icon & Identity */}
            <div className="flex flex-col items-center text-center lg:col-span-4 lg:items-start lg:text-left">
              <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-2 border-cyan-500/50 shadow-xl shadow-cyan-500/20 sm:h-36 sm:w-36">
                <Image
                  src="/images/download_master_icon.jpg"
                  alt="Download Master App Icon"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <h3 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">Download Master</h3>
              <p className="text-sm font-semibold text-cyan-400">ڈاؤنلوڈ ماسٹر • فاسٹ ویڈیو اینڈ سنُو ڈاؤنلوڈر</p>
              <p className="mt-2 text-xs text-slate-400">
                Package: <code className="text-slate-300">com.themastersahib.downloader</code>
              </p>
              <p className="text-xs text-slate-400">Size: 4.8 MB • Version: 1.0.15 (Build 15)</p>

              {/* Download Buttons */}
              <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row lg:flex-col">
                <a
                  href="https://github.com/mohammadfaisalpirzada/Download-Master/releases/download/v1.0.15/Download-Master-v1.0.15.apk"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition duration-200 hover:-translate-y-0.5 hover:shadow-cyan-500/40"
                >
                  <HiOutlineDownload className="h-5 w-5" />
                  Download APK (v1.0.15)
                </a>

                <a
                  href="https://github.com/mohammadfaisalpirzada/Download-Master/releases/latest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
                >
                  <HiOutlineExternalLink className="h-4 w-4" />
                  GitHub Release Details
                </a>
              </div>
            </div>

            {/* App Description & Feature Grid */}
            <div className="lg:col-span-8">
              <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5 sm:p-6">
                <h4 className="text-lg font-bold text-white">Application Overview</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Download Master is an ultra-fast, lightweight, and completely private multimedia downloader for Android.
                  Designed with zero third-party tracking, it extracts HD videos and studio-quality audio streams without requiring any account login.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-800/40 p-3">
                    <HiOutlineMusicNote className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                    <div>
                      <p className="text-xs font-bold text-white">Suno AI Music Downloader</p>
                      <p className="text-[11px] text-slate-400">Single track and bulk multi-song selection in MP3, M4A, or MP4 video.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-800/40 p-3">
                    <HiOutlineFilm className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
                    <div>
                      <p className="text-xs font-bold text-white">TikTok Without Watermark</p>
                      <p className="text-[11px] text-slate-400">Direct clean HD video download without TikTok watermark overlays.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-800/40 p-3">
                    <HiOutlineShare className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                    <div>
                      <p className="text-xs font-bold text-white">In-Player Instant Share</p>
                      <p className="text-[11px] text-slate-400">Watch media and share immediately to WhatsApp or social platforms in 1-tap.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-800/40 p-3">
                    <HiOutlineRefresh className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold text-white">In-Task 1-Click Retry</p>
                      <p className="text-[11px] text-slate-400">Seamlessly resume or retry any interrupted download right from the tasks tab.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-800/40 p-3">
                    <HiOutlineLightningBolt className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                    <div>
                      <p className="text-xs font-bold text-white">1 to 20 Concurrency Control</p>
                      <p className="text-[11px] text-slate-400">User-controlled simultaneous download limit with interactive slider and stepper.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-800/40 p-3">
                    <HiOutlineShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                    <div>
                      <p className="text-xs font-bold text-white">Native Google Drive Support</p>
                      <p className="text-[11px] text-slate-400">Direct 1-tap private upload into your personal Google Drive account.</p>
                    </div>
                  </div>
                </div>

                {/* Technical Specifications */}
                <div className="mt-6 border-t border-slate-800 pt-4">
                  <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                    <div>
                      <span className="text-slate-500">Android Support:</span>
                      <p className="font-semibold text-slate-300">Android 8.0 to 15</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Architecture:</span>
                      <p className="font-semibold text-slate-300">arm64-v8a / armeabi-v7a</p>
                    </div>
                    <div>
                      <span className="text-slate-500">License:</span>
                      <p className="font-semibold text-slate-300">Free &amp; Open Source</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Publisher:</span>
                      <p className="font-semibold text-cyan-400">The Master Sahib</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Software Series Catalog */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-extrabold text-white">The Master Sahib Software Series</h2>
        <p className="mt-1 text-sm text-slate-400">Other official applications and educational utilities</p>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card: Master Sahib PDF Viewer */}
          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5 transition hover:border-slate-700 hover:bg-slate-800/70">
            <div className="flex items-center justify-between">
              <span className="rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400">
                Android App
              </span>
              <HiOutlineDocumentText className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="mt-3 text-lg font-bold text-white">Master Sahib PDF Viewer</h3>
            <p className="mt-1 text-xs text-slate-400">
              Complete PDF reader, document scanner with auto-crop, CNIC duplex print layout, and bilingual OCR.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800">
              <a
                href="https://github.com/mohammadfaisalpirzada/master-sahib-pdf-viewer"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:underline"
              >
                View Repository &amp; Releases <HiOutlineArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Card: MasterSahib Video Editor */}
          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5 transition hover:border-slate-700 hover:bg-slate-800/70">
            <div className="flex items-center justify-between">
              <span className="rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-400">
                Web &amp; PWA
              </span>
              <HiOutlineFilm className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="mt-3 text-lg font-bold text-white">MasterSahib Video Editor (MSVE)</h3>
            <p className="mt-1 text-xs text-slate-400">
              Timeline video sequence merger, automatic multi-resolution export, and AI social copy studio.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800">
              <Link
                href="/softwares/video-editor"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:underline"
              >
                Launch Web Studio <HiOutlineArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Card: Haier Smart TV Remote */}
          <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5 transition hover:border-slate-700 hover:bg-slate-800/70">
            <div className="flex items-center justify-between">
              <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                Web &amp; Mobile
              </span>
              <HiOutlineDeviceMobile className="h-5 w-5 text-cyan-400" />
            </div>
            <h3 className="mt-3 text-lg font-bold text-white">Smart TV Remote Control</h3>
            <p className="mt-1 text-xs text-slate-400">
              Virtual remote control app for Android Smart TVs with authentic D-Pad, media shortcuts, and zero lag.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800">
              <a
                href="https://github.com/mohammadfaisalpirzada/haier-smart-tv-remote"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:underline"
              >
                View Repository &amp; Releases <HiOutlineArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Official Series Footer Note */}
      <section className="border-t border-slate-800/80 bg-slate-950 py-10">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
          <p className="font-semibold text-slate-300">
            The Master Sahib Educational &amp; Software Series • Copyright &copy; {new Date().getFullYear()}
          </p>
          <p className="mt-1">
            Website: <a href="https://themastersahib.com" className="text-cyan-400 hover:underline">www.themastersahib.com</a> • YouTube: <a href="https://www.youtube.com/@maastersahib" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">@maastersahib</a>
          </p>
        </div>
      </section>
    </main>
  );
}

function HiOutlineArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}
