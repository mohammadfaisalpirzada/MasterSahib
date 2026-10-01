'use client';

import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa';
import { HiOutlineMail, HiOutlinePhone, HiOutlineSparkles, HiOutlineArrowUp } from 'react-icons/hi';
import { getCurrentTheme } from '@/lib/theme';

export default function Footer() {
  const theme = getCurrentTheme();

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="border-t border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 transition-colors">
      {/* Top Banner with Quick Actions & Weekly Theme Notice */}
      <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-4 dark:border-slate-800/80 dark:bg-slate-950/50 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide"
              style={{ backgroundColor: theme.badgeBg, color: theme.badgeText }}
            >
              <HiOutlineSparkles className="h-3 w-3" />
              Theme: {theme.name}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Weekly Fresh Sober Cool Colors</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
            <a
              href="https://wa.me/923458340669"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300"
            >
              <FaWhatsapp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              WhatsApp Help
            </a>
            <a
              href="tel:+923458340669"
              className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-sky-800 transition hover:bg-sky-100 dark:border-sky-800/50 dark:bg-sky-950/40 dark:text-sky-300"
            >
              <HiOutlinePhone className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              Direct Call
            </a>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-600 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              aria-label="Scroll to top"
            >
              <HiOutlineArrowUp className="h-3.5 w-3.5" />
              Top
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links Categorized by Tool Sections */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Mission */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-900 dark:text-white">Master Sahib</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Complete educational digital platform: AI software suites, official school documents, interactive curriculum, and teacher career utilities.
            </p>
            <div className="pt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Email Inquiries</p>
              <a
                href="mailto:mohammadfaisalpirzada@gmail.com"
                className="mt-1 block text-xs font-semibold text-slate-700 hover:text-sky-600 dark:text-slate-300 transition break-all"
              >
                mohammadfaisalpirzada@gmail.com
              </a>
            </div>
          </div>

          {/* Column 1: Latest AI & Software Tools */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-sky-700 dark:text-sky-400">
              🚀 Latest AI & Softwares
            </h3>
            <ul className="mt-3.5 space-y-2 text-xs">
              <li>
                <Link href="/softwares/video-editor" className="font-semibold text-slate-700 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400 transition flex items-center gap-1.5">
                  <span>🎬</span> MasterSahib Video Editor (MSVE)
                </Link>
              </li>
              <li>
                <Link href="/softwares" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                  💻 All Software Suites
                </Link>
              </li>
              <li>
                <Link href="/ggss-nishtar-road/admin/id-cards" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition flex items-center gap-1.5">
                  <span>🪪</span> Student ID Card Studio
                </Link>
              </li>
              <li>
                <Link href="/courses/ai-for-all" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                  🤖 AI for All Mastery Course
                </Link>
              </li>
              <li>
                <Link href="/my-presentations" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                  📊 NotebookLM Presentations & Quizzes
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Teacher Career & Official Utilities */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-teal-700 dark:text-teal-400">
              📝 Teacher & Staff Utilities
            </h3>
            <ul className="mt-3.5 space-y-2 text-xs">
              <li>
                <Link href="/govt-forms" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition flex items-center gap-1.5">
                  <span>📋</span> Printable Govt School Forms
                </Link>
              </li>
              <li>
                <Link href="/resume-builder" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                  📄 Teacher Resume Builder
                </Link>
              </li>
              <li>
                <Link href="/upgraded-salary-calculator" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                  💰 Upgraded Salary Calculator
                </Link>
              </li>
              <li>
                <Link href="/pay-fixation-2008" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                  📑 Pay Fixation 2008 Records
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Academic Books & Planning */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-400">
              📚 Academic & Lesson Planning
            </h3>
            <ul className="mt-3.5 space-y-2 text-xs">
              <li>
                <Link href="/class_notes" className="font-semibold text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition">
                  📖 Class Notes & Books (ECE-XII)
                </Link>
              </li>
              <li>
                <Link href="/educational-resources/automatic-lesson-plan" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                  ✍️ Automatic Lesson Plan Generator
                </Link>
              </li>
              <li>
                <Link href="/educational-resources/timetable-generator" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                  ⏰ Timetable Generator
                </Link>
              </li>
              <li>
                <Link href="/educational-resources/academic-calendar" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                  🗓️ Academic Calendar Generator
                </Link>
              </li>
              <li>
                <Link href="/educational-resources/students-age-calculator" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                  👶 Students Age Calculator
                </Link>
              </li>
              <li>
                <Link href="/teaching-license" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                  🎓 Sindh Teaching License (STEDA)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Portals & Contact */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">
              🏫 School Portals & Support
            </h3>
            <ul className="mt-3.5 space-y-2 text-xs">
              <li>
                <Link href="/ggss-nishtar-road" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                  🏫 GGSS Nishtar Road Portal
                </Link>
              </li>
              <li>
                <Link href="/igcse-0580-mathematics" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                  📐 Cambridge IGCSE 0580 Guide
                </Link>
              </li>
              <li>
                <Link href="/padlet" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                  📌 Community Padlet Board
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                  👤 Founder Portfolio
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition">
                  📞 Contact & Feature Request
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright and status */}
        <div className="mt-10 border-t border-slate-100 pt-6 dark:border-slate-800">
          <div className="flex flex-col items-center justify-between gap-3 text-xs text-slate-500 sm:flex-row dark:text-slate-400">
            <p>© {new Date().getFullYear()} The Master Sahib. Built for teachers, students, and educators.</p>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                All Systems Operational
              </span>
              <span>•</span>
              <span>Mobile-Optimized & SLO-Friendly</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
