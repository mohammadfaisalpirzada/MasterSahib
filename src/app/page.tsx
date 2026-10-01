'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineSparkles,
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
} from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import WorkshopBannerCarousel from './components/WorkshopBannerCarousel';
import HomeSignIn from './components/HomeSignIn';
import HomeVisitorCount from './components/HomeVisitorCount';
import HomePadletBoard from './components/HomePadletBoard';
import Footer from './components/Footer';
import { getCurrentTheme } from '@/lib/theme';

type ToolCategory = 'all' | 'latest' | 'teacher' | 'academic';

type QuickCard = {
  title: string;
  description: string;
  href: string;
  accent: string;
  icon: string;
  category: ToolCategory;
  badge?: string;
  newUntil?: string;
};

const allTools: QuickCard[] = [
  {
    title: 'MasterSahib Video Editor (MSVE)',
    description: 'Proprietary AI Video Merger, Sequence Audio/Video Editor & Social SEO Studio for educators and creators.',
    href: '/softwares/video-editor',
    accent: 'from-blue-600 via-indigo-600 to-cyan-600',
    icon: '🎬',
    category: 'latest',
    badge: 'AI Software',
    newUntil: '2026-12-31T23:59:59+05:00',
  },
  {
    title: 'Student ID Card Studio',
    description: 'Generate, preview and batch print official CR80 dual-side student ID cards with secure verification QR codes.',
    href: '/ggss-nishtar-road/admin/id-cards',
    accent: 'from-indigo-600 via-sky-600 to-teal-600',
    icon: '🪪',
    category: 'latest',
    badge: 'New Feature',
    newUntil: '2026-12-31T23:59:59+05:00',
  },
  {
    title: 'Timetable Generator',
    description: 'Generate balanced weekly school class timetables with manual slot swap, conflict checks & PDF export.',
    href: '/educational-resources/timetable-generator',
    accent: 'from-emerald-500 via-teal-500 to-cyan-600',
    icon: '⏰',
    category: 'academic',
    badge: 'Popular',
  },
  {
    title: 'Class Notes & Planning Books',
    description: 'Interactive digital curriculum reader: Class ECE to XII lesson plans, solved exercises & clean PDF downloads.',
    href: '/class_notes',
    accent: 'from-emerald-500 via-teal-500 to-cyan-600',
    icon: '📚',
    category: 'academic',
    badge: 'ECE - XII',
  },
  {
    title: 'Govt Educational Forms',
    description: 'Printable official school forms: admission, no dues, bonafide, character certificate and AG payroll letters.',
    href: '/govt-forms',
    accent: 'from-amber-500 via-orange-500 to-teal-600',
    icon: '📋',
    category: 'teacher',
    badge: 'Print Ready',
  },
  {
    title: 'Automatic Lesson Plan AI',
    description: 'AI-assisted lesson planning: paste curriculum topics or upload outlines to get complete structured plans.',
    href: '/educational-resources/automatic-lesson-plan',
    accent: 'from-purple-500 via-indigo-500 to-sky-500',
    icon: '✍️',
    category: 'academic',
    badge: 'AI Powered',
  },
  {
    title: 'Students Age Calculator',
    description: 'Instant calculation of exact student age in years, months, and days with automated class eligibility checks.',
    href: '/educational-resources/students-age-calculator',
    accent: 'from-sky-500 to-blue-600',
    icon: '👶',
    category: 'teacher',
    badge: 'Admission Tool',
  },
  {
    title: 'Teacher Resume Builder',
    description: 'Professional teacher CV and resume creator with standardized academic templates and PDF export.',
    href: '/resume-builder',
    accent: 'from-slate-600 to-teal-600',
    icon: '📄',
    category: 'teacher',
    badge: 'Career Tool',
  },
  {
    title: 'MasterSahib Softwares Hub',
    description: 'Explore proprietary AI software suites, MasterSahib Video Editor (MSVE), and upcoming teacher utilities.',
    href: '/softwares',
    accent: 'from-blue-600 via-indigo-600 to-purple-600',
    icon: '💻',
    category: 'latest',
  },
  {
    title: 'Academic Calendar Generator',
    description: 'Generate yearly school academic calendars with official holidays, terms, exams, and working-day tallies.',
    href: '/educational-resources/academic-calendar',
    accent: 'from-teal-500 to-emerald-600',
    icon: '🗓️',
    category: 'academic',
  },
  {
    title: 'Sindh Teaching License (STEDA)',
    description: 'Complete guide for the Sindh Teaching License examination — eligibility, syllabus, preparation & past papers.',
    href: '/teaching-license',
    accent: 'from-emerald-500 to-cyan-600',
    icon: '🎓',
    category: 'academic',
  },
  {
    title: 'IGCSE 0580 Study Guide',
    description: "Sabrina's Cambridge IGCSE Mathematics study guide with chapter-wise explanations, QR codes, and practice exercises.",
    href: '/igcse-0580-mathematics',
    accent: 'from-blue-500 to-indigo-600',
    icon: '📐',
    category: 'academic',
  },
  {
    title: 'Upgraded Salary Calculator',
    description: 'Calculate upgraded teacher salary details, allowances, scale revisions, and net payable estimates.',
    href: '/upgraded-salary-calculator',
    accent: 'from-teal-600 to-cyan-700',
    icon: '💰',
    category: 'teacher',
  },
  {
    title: 'Pay Fixation 2008 Records',
    description: "Pre-2008 recruited employees' data — pay fixation, increments & arrears across District East, Karachi.",
    href: '/pay-fixation-2008',
    accent: 'from-slate-600 to-sky-700',
    icon: '📑',
    category: 'teacher',
  },
  {
    title: 'GGSS Nishtar Road Portal',
    description: 'Open GGSS staff records, admissions, student data and administrative management workspace.',
    href: '/ggss-nishtar-road',
    accent: 'from-amber-500 to-orange-600',
    icon: '🏫',
    category: 'teacher',
  },
  {
    title: 'Worksheet Builder',
    description: 'Generate printable classroom worksheets, question banks, and revision sheets from curriculum notes.',
    href: '/educational-resources/worksheet-builder',
    accent: 'from-sky-500 to-emerald-600',
    icon: '📝',
    category: 'academic',
  },
  {
    title: 'Contact & Custom Tools',
    description: 'Get in touch for school digitizations, custom software development, workshops, and teacher training.',
    href: '/contact',
    accent: 'from-emerald-500 to-teal-600',
    icon: '📞',
    category: 'all',
  },
];

const highlights = [
  { label: 'Mobile Optimized', value: '100%' },
  { label: 'Academic Tools', value: '18+' },
  { label: 'Availability SLO', value: '99.9%' },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const now = Date.now();
  const theme = getCurrentTheme();

  const filteredTools = allTools.filter((tool) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'latest') return tool.category === 'latest' || Boolean(tool.newUntil);
    return tool.category === selectedCategory;
  });

  return (
    <main className="min-h-screen bg-[var(--ms-bg-main)] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <WorkshopBannerCarousel />

      {/* Top Quick Contact & Status Bar (Light/Sober Cool Palette) */}
      <div
        className="border-b border-white/10 text-white shadow-sm"
        style={{
          background: `linear-gradient(90deg, ${theme.primaryHover} 0%, ${theme.primary} 50%, ${theme.secondary} 100%)`,
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 text-xs font-semibold sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-sm"
              style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
            >
              <HiOutlineSparkles className="h-3 w-3" />
              Weekly Theme: {theme.name}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <a
              href="https://wa.me/923458340669"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition hover:opacity-80"
            >
              <FaWhatsapp className="h-3.5 w-3.5" /> +92 345 8340669
            </a>
            <a href="tel:+923458340669" className="inline-flex items-center gap-1.5 transition hover:opacity-80">
              <HiOutlinePhone className="h-3.5 w-3.5" /> Call
            </a>
            <a
              href="mailto:mohammadfaisalpirzada@gmail.com"
              className="inline-flex items-center gap-1.5 transition hover:opacity-80 hidden md:inline-flex"
            >
              <HiOutlineMail className="h-3.5 w-3.5" /> Support
            </a>
          </div>
        </div>
      </div>

      {/* Hero Header Section - Mobile Priority & Desktop Crisp */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white/90 dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-sm">
        <div
          className="absolute -left-20 top-[-100px] h-72 w-72 rounded-full blur-3xl pointer-events-none opacity-30"
          style={{ backgroundColor: theme.primaryLight }}
        />
        <div
          className="absolute right-[-80px] top-10 h-80 w-80 rounded-full blur-3xl pointer-events-none opacity-25"
          style={{ backgroundColor: theme.primary }}
        />

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8 lg:pt-12">
          <div className="grid gap-8 lg:grid-cols-[1.15fr,0.85fr] lg:items-center">
            <div className="space-y-4 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-bold tracking-wide shadow-sm" style={{ borderColor: theme.borderSubtle, backgroundColor: theme.badgeBg, color: theme.badgeText }}>
                <HiOutlineSparkles className="h-4 w-4" />
                MasterSahib Digital Workspace
              </div>

              <h1 className="text-3xl font-black leading-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
                One Clean Entry
                <span
                  className="block bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(90deg, ${theme.accentFrom}, ${theme.accentVia}, ${theme.accentTo})`,
                  }}
                >
                  For Learning + Teaching
                </span>
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
                Interactive digital curriculum books, printable government school forms, teacher personal records, and AI-powered education software.
              </p>

              {/* Action Buttons - Touch friendly on mobile (>= 44px) */}
              <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:justify-start pt-2">
                <Link
                  href="/govt-forms"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-md transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{
                    backgroundColor: theme.primary,
                  }}
                >
                  <span>📋</span> Govt School Forms
                  <HiOutlineArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/softwares/video-editor"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700"
                  style={{ borderColor: theme.borderSubtle }}
                >
                  <span>🎬</span> Video Editor (MSVE)
                </Link>

                <Link
                  href="/class_notes"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition hover:opacity-90"
                  style={{
                    borderColor: theme.borderSubtle,
                    backgroundColor: theme.badgeBg,
                    color: theme.badgeText,
                  }}
                >
                  <span>📚</span> Class Books (ECE-XII)
                </Link>

                <HomeSignIn />
              </div>
            </div>

            {/* Highlights and Visitor Counter Widget */}
            <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-lg dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur">
              <div className="grid grid-cols-3 gap-2.5">
                {highlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-center dark:border-slate-800 dark:bg-slate-800/50"
                  >
                    <p className="text-lg font-black text-slate-900 dark:text-white sm:text-2xl">{item.value}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              <div
                className="mt-3 flex items-center justify-between rounded-2xl border px-4 py-2.5 shadow-sm"
                style={{
                  borderColor: theme.borderSubtle,
                  backgroundColor: theme.bgCardMuted,
                }}
              >
                <div className="flex items-center gap-2">
                  <HiOutlineCheckCircle className="h-4 w-4" style={{ color: theme.primary }} />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Live Visitors
                  </span>
                </div>
                <HomeVisitorCount />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Tools Section with Category Filter Tabs */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/60 bg-sky-50/90 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-sky-800 shadow-sm dark:border-sky-800/80 dark:bg-sky-950/70 dark:text-sky-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500"></span>
              </span>
              Directory of Educational Tools
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
              Academic & Teacher <span className="bg-gradient-to-r from-sky-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent dark:from-sky-400 dark:via-teal-300 dark:to-indigo-300">Tools</span>
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              All digital learning software, school utilities, and teacher tools in one unified workspace.
            </p>
          </div>

          {/* Category Filter Tabs - Touch friendly for Mobile */}
          <div className="flex flex-wrap gap-1.5 rounded-2xl border border-slate-200/90 bg-white/90 p-1.5 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
            {(
              [
                { id: 'all', label: 'All Tools' },
                { id: 'latest', label: '🚀 Latest & AI' },
                { id: 'teacher', label: '📝 Teacher & Forms' },
                { id: 'academic', label: '📚 Curriculum' },
              ] as const
            ).map((tab) => {
              const active = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition min-h-[38px] ${
                    active
                      ? 'bg-gradient-to-r from-sky-600 to-teal-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tools Grid: 1 column on mobile, 2 on small tablet, 3 on tablet, 4 on desktop */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTools.map((tool) => {
            const showNewBadge = Boolean(tool.newUntil) && now <= new Date(tool.newUntil as string).getTime();

            return (
              <Link
                key={tool.title}
                href={tool.href}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-500/10 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-sky-700 dark:hover:shadow-black/40 backdrop-blur-sm"
              >
                {/* Top expanding gradient accent line */}
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tool.accent} opacity-80 transition-all duration-300 group-hover:h-1.5 group-hover:opacity-100`}
                />

                {/* Ambient corner radial hover glow */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-gradient-to-br from-sky-400/15 via-teal-400/10 to-transparent blur-2xl transition-all duration-300 group-hover:scale-150 group-hover:opacity-100" />

                {/* Badge with live pulsing dot for NEW */}
                {showNewBadge || tool.badge ? (
                  <div className="absolute right-4 top-4 z-10">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-sm ${
                        showNewBadge
                          ? 'bg-rose-500 text-white shadow-rose-200 dark:shadow-none'
                          : 'border border-sky-200/60 bg-sky-50 text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/80 dark:text-sky-300'
                      }`}
                    >
                      {showNewBadge ? (
                        <>
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                          </span>
                          NEW
                        </>
                      ) : (
                        tool.badge
                      )}
                    </span>
                  </div>
                ) : null}

                {/* Card Content */}
                <div className="relative z-10">
                  {/* 3D-styled app icon tile with hover scaling */}
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-slate-100 p-2 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-1 group-hover:shadow-md dark:border-slate-700/80 dark:from-slate-800 dark:to-slate-800/60">
                    <span className="text-2xl filter drop-shadow-sm">{tool.icon}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 transition-colors duration-200 group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400">
                    {tool.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {tool.description}
                  </p>
                </div>

                {/* Sleek interactive card footer */}
                <div className="relative z-10 mt-6 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/80">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {tool.category === 'teacher' ? 'Teacher Tool' : tool.category === 'academic' ? 'Academic' : 'Software'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 transition-all duration-200 group-hover:gap-1.5 group-hover:text-sky-700 dark:text-sky-400 dark:group-hover:text-sky-300">
                    Open
                    <span className="text-sm transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <HomePadletBoard />

      <Footer />
    </main>
  );
}
