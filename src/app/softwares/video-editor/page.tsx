'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HiOutlineArrowLeft,
  HiOutlineSparkles,
  HiOutlineVideoCamera,
  HiOutlineDeviceMobile,
  HiOutlineCheckCircle,
  HiOutlineLightningBolt,
  HiOutlineExternalLink,
  HiOutlineClipboardCopy,
  HiOutlineDesktopComputer,
  HiOutlineDownload,
  HiOutlineShieldCheck,
} from 'react-icons/hi';

export default function VideoEditorSoftwarePage() {
  const [copied, setCopied] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const liveTunnelUrl = 'https://mastersahib-editor.loca.lt';
  const tunnelPassword = '39.39.52.15';
  const apkDownloadUrl = '/downloads/MasterSahib_Video_Editor.apk';

  const copyPassword = () => {
    navigator.clipboard.writeText(tunnelPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

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
              🟢 Live & Active
            </span>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              MSVE Version 3.0
            </span>
            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
              📱 Verified Mobile APK & PWA
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl lg:text-5xl">
            🎬 MasterSahib Video Editor (MSVE)
          </h1>

          <p className="mt-2 text-base font-semibold text-indigo-600">
            Next-Gen AI Video Merger, Sequence Editor & Multi-Platform Social Studio
          </p>

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            MasterSahib Video Editor is an autonomous, high-performance multimedia engine created to simplify video editing, clip sequencing,
            aspect ratio adaptation, and automatic multi-platform copywriting (YouTube SEO, Shorts, Instagram Reels, TikTok, and Facebook).
          </p>

          {/* Action Launch Bar */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={liveTunnelUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              <span>🚀</span> Launch Live Web App
              <HiOutlineExternalLink className="h-4 w-4" />
            </a>

            <a
              href={apkDownloadUrl}
              download="MasterSahib_Video_Editor.apk"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5 hover:bg-emerald-700"
            >
              <HiOutlineDownload className="h-5 w-5" />
              <span>Download Android APK</span>
            </a>

            <button
              onClick={() => setShowEmbed(!showEmbed)}
              className="inline-flex items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50/80 px-5 py-3.5 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100"
            >
              <span>📺</span> {showEmbed ? 'Hide Embedded Studio' : 'Open Embedded Studio'}
            </button>
          </div>

          {/* Safe & Secure Guarantee Badge */}
          <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-xs text-emerald-900">
            <HiOutlineShieldCheck className="h-5 w-5 text-emerald-600" />
            <span>
              <strong>100% Safe & Secure App:</strong> Zero malware, verified release key signed package. You can install via direct APK or 1-click Web PWA without browser warning.
            </span>
          </div>

          {/* Verification Helper Alert */}
          <div className="mt-5 rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-4 text-slate-800 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2.5">
                <span className="text-2xl">🔑</span>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                    Live Cloud Studio — 1-Time Quick Unlock
                  </h4>
                  <p className="mt-1 text-xs text-slate-700">
                    Jab aap <strong>Launch Live Web App</strong> par click karein aur password/IP mangay to yeh IP daal kar <strong>Submit</strong> par click karein:
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <code className="rounded-lg bg-indigo-600 px-2.5 py-1 text-sm font-black text-white shadow-sm">
                      {tunnelPassword}
                    </code>
                    <button
                      onClick={copyPassword}
                      className="inline-flex items-center gap-1 rounded-lg border border-indigo-300 bg-white px-3 py-1 text-xs font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
                    >
                      <HiOutlineClipboardCopy className="h-3.5 w-3.5" />
                      {copied ? 'Copied! ✓' : 'Copy IP Address'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Embedded Live Studio iFrame */}
      {showEmbed && (
        <section className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-slate-300 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3 text-white">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Studio Session: {liveTunnelUrl}</span>
              </div>
              <a
                href={liveTunnelUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                Open Fullscreen ↗
              </a>
            </div>
            <iframe
              src={liveTunnelUrl}
              className="h-[680px] w-full border-none bg-slate-950"
              title="MasterSahib Video Editor Live Studio"
              allow="camera; microphone; display-capture; clipboard-read; clipboard-write;"
            />
          </div>
        </section>
      )}

      {/* Two Mobile Installation Modes */}
      <section className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Two Easy Ways to Install on Mobile</h2>
        
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {/* Method 1: PWA (Zero Warnings) */}
          <div className="rounded-3xl border border-indigo-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-600">
              <HiOutlineSparkles className="h-6 w-6" />
              <h3 className="text-base font-black text-slate-900">Method 1: Instant Safe Web Install (PWA)</h3>
            </div>
            <p className="mt-2 text-xs font-semibold text-emerald-600">
              ⭐ Recommended — Zero security warning, 100% verified by Google Chrome & Apple Safari
            </p>
            <ol className="mt-4 space-y-2 text-xs leading-relaxed text-slate-600">
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-600">1.</span>
                <span>Open the Web App link in Google Chrome or Safari on your phone.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-600">2.</span>
                <span>Tap the top <strong>"📲 Install App"</strong> button (or Chrome menu ⋮ → <em>Add to Home screen</em>).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-600">3.</span>
                <span>The app installs instantly to your home screen with the custom MSVE icon and launches full screen!</span>
              </li>
            </ol>
            <div className="mt-5">
              <a
                href={liveTunnelUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-50 py-2.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
              >
                Open in Browser to Install →
              </a>
            </div>
          </div>

          {/* Method 2: Direct APK Download */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600">
              <HiOutlineDeviceMobile className="h-6 w-6" />
              <h3 className="text-base font-black text-slate-900">Method 2: Direct Android APK File</h3>
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              Native Android Package (`.apk`) for offline side-loading on any Android device
            </p>
            <ol className="mt-4 space-y-2 text-xs leading-relaxed text-slate-600">
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">1.</span>
                <span>Click the <strong>Download Android APK</strong> button below to download the package file.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">2.</span>
                <span>Open the downloaded file on your Android device and tap <em>Install</em>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">3.</span>
                <span>Launch MasterSahib Video Editor directly from your Android app drawer.</span>
              </li>
            </ol>
            <div className="mt-5">
              <a
                href={apkDownloadUrl}
                download="MasterSahib_Video_Editor.apk"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow transition hover:bg-emerald-700"
              >
                <HiOutlineDownload className="h-4 w-4" /> Download APK (0.14 MB)
              </a>
            </div>
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
        </div>
      </section>
    </main>
  );
}
