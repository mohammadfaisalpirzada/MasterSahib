import Link from 'next/link';
import { HiOutlineMail, HiOutlinePhone, HiOutlineSparkles, HiOutlineArrowRight } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';
import WorkshopBannerCarousel from './components/WorkshopBannerCarousel';
import HomeSignIn from './components/HomeSignIn';
import HomeVisitorCount from './components/HomeVisitorCount';
import HomePadletBoard from './components/HomePadletBoard';

type QuickCard = {
  title: string;
  description: string;
  href: string;
  accent: string;
  icon: string;
  newUntil?: string;
};

const quickCards: QuickCard[] = [
  {
    title: 'MasterSahib Softwares',
    description: 'Explore proprietary AI software suites, MasterSahib Video Editor (MSVE), and innovative digital tools.',
    href: '/softwares',
    accent: 'from-blue-600 via-indigo-600 to-purple-600',
    icon: '💻',
    newUntil: '2026-12-31T23:59:59+05:00',
  },
  {
    title: 'Class Notes & Planning Books',
    description: 'Interactive digital curriculum reader: Class ECE to XII lesson plans, solved exercises & clean PDF downloads.',
    href: '/curriculum',
    accent: 'from-emerald-500 via-teal-500 to-cyan-600',
    icon: '📚',
    newUntil: '2026-12-31T23:59:59+05:00',
  },
  {
    title: 'Govt Educational Forms',
    description: 'Printable official school forms: admission, no dues, bonafide, character certificate and AG payroll letters.',
    href: '/govt-forms',
    accent: 'from-amber-500 via-orange-500 to-red-500',
    icon: '📋',
    newUntil: '2026-12-31T23:59:59+05:00',
  },
  {
    title: 'Educational Resources',
    description: 'Open classroom utilities, lesson planning, and daily school helpers.',
    href: '/educational-resources',
    accent: 'from-fuchsia-500 to-pink-600',
    icon: '💡',
  },
  {
    title: 'Sindh Teaching License (STEDA)',
    description: 'Complete guide for the Sindh Teaching License examination — eligibility, syllabus, preparation & more.',
    href: '/teaching-license',
    accent: 'from-emerald-500 to-cyan-600',
    icon: '🎓',
  },
  {
    title: 'IGCSE 0580 Study Guide',
    description: "Sabrina's Cambridge IGCSE Mathematics study guide with chapter-wise explanations, QR codes, and practice exercises.",
    href: '/igcse-0580-mathematics',
    accent: 'from-blue-500 to-indigo-600',
    icon: '📐',
  },
  {
    title: 'Upgraded Salary Calculator',
    description: 'Calculate upgraded salary details with a dedicated school utility.',
    href: '/upgraded-salary-calculator',
    accent: 'from-violet-500 to-purple-600',
    icon: '💰',
  },
  {
    title: 'GGSS Nishtar Road',
    description: 'Open GGSS staff, admissions and student ID card management workspace.',
    href: '/ggss-nishtar-road',
    accent: 'from-amber-500 to-orange-600',
    icon: '🏫',
  },
  {
    title: 'Contact & Support',
    description: 'Get in touch quickly for support, custom tools and collaboration.',
    href: '/contact',
    accent: 'from-emerald-500 to-teal-600',
    icon: '📞',
  },
  {
    title: 'Pay Fixation 2008',
    description: "Pre-2008 recruited employees' data — pay fixation, increments & arrears across District East, Karachi.",
    href: '/pay-fixation-2008',
    accent: 'from-rose-500 to-red-600',
    icon: '📑',
  },
];

const highlights = [
  { label: 'Fast Access', value: '1 Click' },
  { label: 'Modules', value: '8+' },
  { label: 'Daily Ready', value: '100%' },
];

export default function HomePage() {
  const now = Date.now();

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <WorkshopBannerCarousel />

      {/* Top Quick Contact Bar */}
      <div className="border-b border-indigo-100/80 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-1.5 px-4 py-2.5 text-sm font-semibold text-white sm:px-6 lg:px-8">
          <a
            href="https://wa.me/923458340669"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 py-0.5 transition hover:text-emerald-300"
          >
            <FaWhatsapp className="h-4 w-4" /> +92 345 8340669
          </a>
          <a href="tel:+923458340669" className="inline-flex items-center gap-1.5 py-0.5 transition hover:text-cyan-300">
            <HiOutlinePhone className="h-4 w-4" /> Call
          </a>
          <a
            href="mailto:mohammadfaisalpirzada@gmail.com"
            className="inline-flex items-center gap-1.5 py-0.5 transition hover:text-amber-300"
          >
            <HiOutlineMail className="h-4 w-4" /> mohammadfaisalpirzada@gmail.com
          </a>
        </div>
      </div>

      {/* Radiant Hero Header Section (Matching Softwares Hub) */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white">
        <div className="absolute -left-20 top-[-100px] h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl pointer-events-none" />
        <div className="absolute right-[-80px] top-10 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pt-14">
          <div className="grid gap-8 lg:grid-cols-[1.15fr,0.85fr] lg:items-end">
            <div className="space-y-5 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700 shadow-sm backdrop-blur">
                <HiOutlineSparkles className="h-4 w-4 text-indigo-600" />
                MasterSahib Digital Workspace
              </div>

              <h1 className="text-4xl font-black leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
                One Clean Entry
                <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  For Learning + Teaching
                </span>
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-slate-600">
                A unified hub for interactive digital curriculum books, lesson plans, official government forms, and AI-powered education utilities.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-start pt-2">
                <Link
                  href="/curriculum"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-200 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-300"
                >
                  <span>📚</span> Class Notes & Books
                  <HiOutlineArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/softwares"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50/50 px-5 py-3.5 text-sm font-bold text-indigo-700 transition hover:-translate-y-0.5 hover:bg-indigo-100/60"
                >
                  <span>💻</span> Softwares & AI Tools
                </Link>
                <HomeSignIn />
              </div>
            </div>

            <div className="rounded-3xl border border-indigo-100 bg-white/90 p-5 shadow-xl shadow-indigo-100/40 backdrop-blur">
              <div className="grid grid-cols-3 gap-3">
                {highlights.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-4 text-center">
                    <p className="text-xl font-black text-slate-900 sm:text-2xl">{item.value}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between rounded-2xl border border-cyan-200/80 bg-gradient-to-r from-cyan-50 to-blue-50 px-4 py-3 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-800">Visitors Count</span>
                <HomeVisitorCount />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Modules Quick Cards Section */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Quick Access</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">Core Academic Modules</h2>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {quickCards.map((card) => {
            const showNewBadge = Boolean(card.newUntil) && now <= new Date(card.newUntil as string).getTime();

            return (
              <Link
                key={card.title}
                href={card.href}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-indigo-100/80 bg-white p-5 shadow-sm shadow-indigo-100/30 transition duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-200/50"
              >
                {showNewBadge ? (
                  <span className="absolute right-4 top-4 rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-sm animate-pulse">
                    New
                  </span>
                ) : null}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{card.icon}</span>
                    <div className={`h-1.5 flex-1 rounded-full bg-gradient-to-r ${card.accent}`} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition">{card.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{card.description}</p>
                </div>
                <div className="mt-5 inline-flex items-center text-xs font-bold text-indigo-600 group-hover:text-blue-700">
                  Open Workspace
                  <span className="ml-1.5 transition group-hover:translate-x-1">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <HomePadletBoard />

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Master Sahib</p>
            <h3 className="mt-2 text-xl font-black text-slate-900">Learning Hub</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Clean digital workspace for educational resources, GGSS management, and daily teaching flow.
            </p>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900">Quick Links</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
              <Link href="/curriculum" className="font-semibold text-blue-600 hover:text-blue-800 transition">Class Notes & Books</Link>
              <Link href="/softwares" className="hover:text-slate-900 transition">Softwares & AI Tools</Link>
              <Link href="/govt-forms" className="hover:text-slate-900 transition">Govt Educational Forms</Link>
              <Link href="/educational-resources" className="hover:text-slate-900 transition">Educational Resources</Link>
              <Link href="/teaching-license" className="hover:text-slate-900 transition">Sindh Teaching License (STEDA)</Link>
              <Link href="/contact" className="hover:text-slate-900 transition">Contact & Support</Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900">Workspace</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
              <p>Fast module access</p>
              <p>Teacher daily tools</p>
              <p>Profile & data workflow</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900">Support</p>
            <p className="mt-3 text-sm text-slate-600">Need a new tool? Share requirements in Contact.</p>
            <Link
              href="/contact"
              className="mt-4 inline-flex rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-indigo-100 transition hover:shadow-lg hover:shadow-indigo-200"
            >
              Request Feature
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/50">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} Master Sahib. All rights reserved.</p>
            <p>Built for practical daily use.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
