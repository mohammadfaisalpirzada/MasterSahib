import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  HiOutlineSparkles,
  HiOutlineVideoCamera,
  HiOutlineDeviceMobile,
  HiOutlineShare,
  HiOutlineArrowRight,
  HiOutlineCode,
  HiOutlineLightningBolt,
  HiOutlineCube,
  HiOutlineChartBar,
  HiOutlineAcademicCap,
  HiOutlineCheckCircle,
  HiOutlineExternalLink,
} from 'react-icons/hi';

export const metadata = {
  title: 'MasterSahib Softwares & AI Tools | Official Innovation Hub',
  description:
    'Explore MasterSahib proprietary AI software suites, video editing agents, educational utilities, and smart automation applications.',
};

type SoftwareTool = {
  id: string;
  title: string;
  badge: string;
  tagline: string;
  description: string;
  status: 'active' | 'upcoming';
  href: string;
  accent: string;
  icon: string;
  features: string[];
  techStack: string[];
};

const softwaresList: SoftwareTool[] = [
  {
    id: 'video-editor-agent',
    title: 'MasterSahib Video Editor (MSVE)',
    badge: 'v3.0 • Live & Active',
    tagline: 'AI Video Merger, Sequence Editor & Multi-Platform Social Studio',
    description:
      'A full-fledged, high-performance AI Video Studio built to effortlessly sequence, trim, and merge video clips, synthesize missing audio, preview continuous sequences, and automatically generate high-converting YouTube descriptions, hashtags, search tags, and viral reel hooks in 1-click.',
    status: 'active',
    href: '/softwares/video-editor',
    accent: 'from-blue-600 via-indigo-600 to-purple-600',
    icon: '🎬',
    features: [
      'Multi-clip Drag & Drop Timeline with 1-click sequence reordering',
      'Continuous "Play All" Sequence Player with live clip tracking',
      'Normalized Multi-Resolution Export (1080p FHD, 720p HD, 16:9, 9:16, 1:1)',
      'Autonomous Social AI Studio for YouTube, Shorts, Instagram Reels & TikTok',
      'Progressive Web App (PWA & APK ready) with offline caching and mobile-first interface',
      'Built-in Gemini AI Director for scene-by-scene scriptwriting & prompt crafting',
    ],
    techStack: ['FastAPI', 'FFmpeg Engine', 'Google Gemini 3.7', 'PWA / Mobile', 'Tailwind CSS'],
  },
  {
    id: 'academic-ai-agent',
    title: 'Autonomous Academic AI Agent',
    badge: 'In Development',
    tagline: 'Intelligent Lesson Planner, Quiz Generator & Differentiated Instruction Engine',
    description:
      'An intelligent pedagogical AI agent that automatically constructs curriculum-aligned lesson plans, bloom-taxonomy assessment rubrics, bilingual worksheets, and differentiated student learning tasks in seconds.',
    status: 'upcoming',
    href: '#',
    accent: 'from-emerald-600 to-teal-600',
    icon: '🤖',
    features: [
      'Automated SLO-aligned Lesson Plan Generator',
      'Instant Diagnostic, Formative & Summative Quiz Maker',
      'Urdu & English Bilingual Worksheet Synthesis',
      'Differentiated Task Generator for mixed-ability classrooms',
    ],
    techStack: ['Next.js 16', 'Google GenAI', 'Python Agent Engine', 'PDF Generation'],
  },
  {
    id: 'school-analytics-engine',
    title: 'Institutional Performance & Analytics Engine',
    badge: 'Upcoming',
    tagline: 'Automated Student Tracking, Report Cards & School Intelligence',
    description:
      'A comprehensive institutional software engine that aggregates daily attendance, examination scores, teacher records, and monthly student stipends into actionable visual insights and automated report cards.',
    status: 'upcoming',
    href: '#',
    accent: 'from-amber-500 to-orange-600',
    icon: '📊',
    features: [
      'Automated Gradebook & Marksheet Generator',
      'Student Attendance Analytics & At-Risk Alerts',
      'One-Click Excel / PDF Export for Official Submissions',
      'Staff Portal & Teacher Portfolio Synchronization',
    ],
    techStack: ['TypeScript', 'Supabase / PostgreSQL', 'React 19', 'Chart.js'],
  },
];

export default function SoftwaresHubPage() {
  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-900">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white">
        <div className="absolute -left-20 top-[-100px] h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute right-[-80px] top-10 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-12 sm:px-6 lg:px-8 lg:pt-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700 shadow-sm backdrop-blur">
              <HiOutlineSparkles className="h-4 w-4 text-indigo-600" />
              MasterSahib Proprietary Applications
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              MasterSahib{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Softwares & AI Tools
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Welcome to the official MasterSahib software development hub. Discover modern AI-driven utilities,
              content creation studios, and classroom automation agents engineered to streamline your digital workflows.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/softwares/video-editor"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-200 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-300"
              >
                <span>🎬</span> Open MasterSahib Video Editor
                <HiOutlineArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#upcoming-tools"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50"
              >
                <span>🚀</span> Explore Upcoming Suites
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Software Catalog Section */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Featured Software: MSVE */}
        <div className="mb-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Featured Application</p>
              <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Flagship Software Suite</h2>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white p-6 shadow-xl shadow-indigo-100/40 sm:p-8 lg:p-10">
            <div className="absolute right-0 top-0 h-40 w-40 bg-gradient-to-bl from-indigo-100/60 to-transparent blur-2xl" />

            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="space-y-5 lg:col-span-7">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
                    🟢 Active & Ready
                  </span>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    Version 3.0 (MSVE)
                  </span>
                  <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                    📱 Mobile APK & PWA
                  </span>
                </div>

                <h3 className="text-3xl font-black text-slate-900 sm:text-4xl">
                  🎬 MasterSahib Video Editor
                </h3>

                <p className="text-base font-semibold text-indigo-600">
                  AI Video Merger, Sequence Editor & Autonomous Social Media Copywriter
                </p>

                <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                  A high-performance video production workspace designed for content creators, educators, and social media managers.
                  Effortlessly drag and drop video clips into chronological order, preview full continuous sequences with 1-click, trim
                  exact cut points, synthesize silent audio tracks, and automatically generate viral YouTube titles, SEO descriptions,
                  hashtags, and TikTok / Instagram Reel hooks.
                </p>

                {/* Feature Bullet Points */}
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div className="flex items-start gap-2 text-xs font-medium text-slate-700 sm:text-sm">
                    <HiOutlineCheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                    <span>Multi-Clip Drag & Drop Sequencer</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-medium text-slate-700 sm:text-sm">
                    <HiOutlineCheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                    <span>Continuous "Play All" Sequence Player</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-medium text-slate-700 sm:text-sm">
                    <HiOutlineCheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                    <span>Auto Social SEO (YouTube, Reels, TikTok)</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs font-medium text-slate-700 sm:text-sm">
                    <HiOutlineCheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                    <span>Mobile Friendly & Installable PWA/APK</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href="/softwares/video-editor"
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-200 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <span>⚡</span> Launch Video Studio
                    <HiOutlineArrowRight className="h-4 w-4" />
                  </Link>

                  <a
                    href="/downloads/MasterSahib_Video_Editor.apk"
                    download="MasterSahib_Video_Editor.apk"
                    className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-3.5 text-sm font-bold text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-100"
                  >
                    <HiOutlineDownload className="h-5 w-5" />
                    <span>Download Mobile APK</span>
                  </a>
                </div>
              </div>

              {/* Right Visual Card */}
              <div className="lg:col-span-5">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-950 p-6 text-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 font-bold text-white shadow-lg">
                        MS
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">MSVE v3.0</div>
                        <div className="text-[11px] text-slate-400">MasterSahib Video Engine</div>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                      LIVE
                    </span>
                  </div>

                  <div className="space-y-3 py-4 text-xs text-slate-300">
                    <div className="flex items-center justify-between rounded-lg bg-slate-800/60 p-2.5">
                      <span>🎬 Engine:</span>
                      <span className="font-semibold text-indigo-400">FFmpeg 1080p/720p</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-slate-800/60 p-2.5">
                      <span>🤖 AI Assistant:</span>
                      <span className="font-semibold text-purple-400">Gemini 3.7 Flash</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-slate-800/60 p-2.5">
                      <span>📱 Mobile Mode:</span>
                      <span className="font-semibold text-cyan-400">Full PWA App</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-slate-800/60 p-2.5">
                      <span>🚀 Social Studio:</span>
                      <span className="font-semibold text-amber-400">1-Click Auto Copy</span>
                    </div>
                  </div>

                  <Link
                    href="/softwares/video-editor"
                    className="block w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 py-2.5 text-center text-xs font-bold text-white transition hover:opacity-90"
                  >
                    Launch Studio Interface →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Tools Grid */}
        <div id="upcoming-tools" className="mt-14">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Pipeline & Roadmap</p>
            <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">Upcoming MasterSahib Softwares</h2>
            <p className="mt-1 text-sm text-slate-600">
              New custom modules and intelligent AI tools are actively being engineered and will appear here.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {softwaresList
              .filter((s) => s.status === 'upcoming')
              .map((tool) => (
                <div
                  key={tool.id}
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{tool.icon}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
                        {tool.badge}
                      </span>
                    </div>

                    <h3 className="mt-4 text-xl font-bold text-slate-900">{tool.title}</h3>
                    <p className="mt-1 text-xs font-semibold text-indigo-600">{tool.tagline}</p>
                    <p className="mt-3 text-xs leading-relaxed text-slate-600 sm:text-sm">{tool.description}</p>

                    <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                      {tool.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                          <span className="text-indigo-500">✦</span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex flex-wrap gap-1.5">
                      {tool.techStack.map((t) => (
                        <span
                          key={t}
                          className="rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-400">Coming Soon</span>
                  </div>
                </div>
              ))}
          </div>
        </div>

      </section>
    </main>
  );
}
