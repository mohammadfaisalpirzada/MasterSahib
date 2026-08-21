import React from 'react';
import Link from 'next/link';
import {
  HiOutlineArrowLeft,
  HiOutlineSparkles,
  HiOutlineVideoCamera,
  HiOutlineDeviceMobile,
  HiOutlineCheckCircle,
  HiOutlineLightningBolt,
  HiOutlineExternalLink,
  HiOutlineShare,
} from 'react-icons/hi';

export const metadata = {
  title: 'MasterSahib Video Editor (MSVE) | Software Documentation & Launch',
  description:
    'Complete guide and web launcher for MasterSahib Video Editor (MSVE) - AI Video Merger, Sequence Editor, and Multi-Platform Social Studio.',
};

export default function VideoEditorSoftwarePage() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] pb-16 text-slate-900">
      {/* Top Breadcrumb & Hero */}
      <section className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/softwares"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            <HiOutlineArrowLeft className="h-4 w-4" />
            Back to MasterSahib Softwares
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
              🟢 Live & Ready
            </span>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              MSVE Version 3.0
            </span>
            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
              📱 PWA & Mobile APK
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl lg:text-5xl">
            🎬 MasterSahib Video Editor (MSVE)
          </h1>

          <p className="mt-2 text-base font-semibold text-indigo-600">
            Next-Generation AI Video Merger, Continuous Sequencer & Social SEO Studio
          </p>

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            MasterSahib Video Editor is an autonomous, high-performance multimedia engine created to simplify video editing, clip sequencing,
            aspect ratio adaptation, and automatic multi-platform copywriting (YouTube SEO, Shorts, Instagram Reels, TikTok, and Facebook).
          </p>

          {/* Action Launch Bar */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="http://localhost:8000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <span>⚡</span> Launch MasterSahib Video Studio
              <HiOutlineExternalLink className="h-4 w-4" />
            </a>

            <a
              href="http://192.168.0.101:8000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <span>📱</span> Open on Mobile Phone (Wi-Fi)
            </a>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Key Capabilities & Features</h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-2xl">🖐️</div>
            <h3 className="mt-3 text-base font-bold text-slate-900">Drag & Drop Sequence Editor</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Interactive timeline allowing seamless clip reordering, precise trimming (In/Out sliders), and speed controls (0.5x to 2.0x).
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-2xl">▶️</div>
            <h3 className="mt-3 text-base font-bold text-slate-900">"Play All" Sequence Player</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Seamlessly previews all timeline clips back-to-back in real-time, auto-advancing with live active clip indicators.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-2xl">🚀</div>
            <h3 className="mt-3 text-base font-bold text-slate-900">Auto Social Media Studio</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Automatically writes tailored titles, descriptions with timestamps, hashtags, and tags for YouTube, Shorts, Reels & TikTok.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-2xl">📐</div>
            <h3 className="mt-3 text-base font-bold text-slate-900">Aspect Ratio Normalization</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Converts mixed video formats into standard 16:9 Landscape, 9:16 Portrait / Reels, or 1:1 Square in 1080p FHD or 720p HD.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-2xl">📱</div>
            <h3 className="mt-3 text-base font-bold text-slate-900">Mobile PWA & APK Installation</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Installable directly onto Android and iOS home screens with the custom vibrant MSVE icon for a native app feel.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-2xl">👑</div>
            <h3 className="mt-3 text-base font-bold text-slate-900">Gemini AI Video Director</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              Brainstorms video concepts, crafts scene prompts, and generates video storyboards in English and Urdu.
            </p>
          </div>
        </div>

        {/* How to Use Step by Step */}
        <div className="mt-12 rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-black text-slate-900 sm:text-2xl">Quick Start Guide (5 Steps)</h2>

          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                1
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Import or Drop Video Clips</h4>
                <p className="text-xs text-slate-600">
                  Select gallery videos from your phone or PC, or paste a Google Gemini video URL. Tap <strong>"➕ Add All to Timeline"</strong> to queue them instantly.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                2
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Arrange and Trim Sequence</h4>
                <p className="text-xs text-slate-600">
                  Drag clip cards or use ◀ ▶ arrows to order your video. Adjust In/Out trim sliders or speed factors (0.5x, 1.0x, 1.5x, 2.0x).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                3
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Preview Continuous Playback</h4>
                <p className="text-xs text-slate-600">
                  Click <strong>"▶ Play All Sequence"</strong> to watch your entire video sequence continuously before merging.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                4
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">1-Click Merge & Export</h4>
                <p className="text-xs text-slate-600">
                  Hit <strong>"⚡ Merge & Export"</strong>. The FFmpeg engine normalizes resolutions, combines audio tracks, and delivers your MP4 with custom naming.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                5
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Auto-Generated Social Media Copy</h4>
                <p className="text-xs text-slate-600">
                  Upon completion, MasterSahib automatically prepares YouTube Titles, Descriptions, Hashtags, and Tags. Tap <strong>"📋 Copy All"</strong> to publish!
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-6 text-center">
            <a
              href="http://localhost:8000"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5"
            >
              <span>🚀</span> Start Editing with MasterSahib
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
