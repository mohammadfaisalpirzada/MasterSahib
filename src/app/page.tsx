import Link from 'next/link';
import { HiOutlineMail, HiOutlinePhone } from 'react-icons/hi';
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
  newUntil?: string;
};

const quickCards: QuickCard[] = [
  {
    title: 'MasterSahib Softwares',
    description: 'Explore proprietary AI software suites, MasterSahib Video Editor (MSVE), and innovative digital tools.',
    href: '/softwares',
    accent: 'from-blue-600 via-indigo-600 to-purple-600',
    newUntil: '2026-12-31T23:59:59+05:00',
  },
  {
    title: 'IGCSE 0580 Study Guide',
    description: "Sabrina's Cambridge IGCSE Mathematics study guide with chapter-wise explanations, QR codes, and practice exercises.",
    href: '/igcse-0580-mathematics',
    accent: 'from-blue-500 to-indigo-600',
    newUntil: '2026-08-31T23:59:59+05:00',
  },
  {
    title: 'Sindh Teaching License (STEDA)',
    description: 'Complete guide for the Sindh Teaching License examination — eligibility, syllabus, preparation & more.',
    href: '/teaching-license',
    accent: 'from-emerald-500 to-cyan-600',
    newUntil: '2026-08-31T23:59:59+05:00',
  },
  {
    title: 'Upgraded Salary Calculator',
    description: 'Calculate upgraded salary details with a dedicated school utility.',
    href: '/upgraded-salary-calculator',
    accent: 'from-violet-500 to-purple-600',
    newUntil: '2026-06-24T23:59:59+05:00',
  },
  {
    title: 'GGSS',
    description: 'Open GGSS staff and profile management workspace.',
    href: '/ggss-nishtar-road',
    accent: 'from-amber-500 to-orange-600',
  },
  {
    title: 'Contact',
    description: 'Get in touch quickly for support and collaboration.',
    href: '/contact',
    accent: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Educational Resources',
    description: 'Open classroom utilities, lesson planning, and daily school helpers.',
    href: '/educational-resources',
    accent: 'from-fuchsia-500 to-pink-600',
  },
  {
    title: 'Pay Fixation 2008',
    description: "Pre-2008 recruited employees' data — pay fixation, increments & arrears across District East, Karachi.",
    href: '/pay-fixation-2008',
    accent: 'from-rose-500 to-red-600',
  },
];

const highlights = [
  { label: 'Fast Access', value: '1 Click' },
  { label: 'Modules', value: '5+' },
  { label: 'Daily Ready', value: '100%' },
];

export default function HomePage() {
  const now = Date.now();

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <WorkshopBannerCarousel />

      <div className="border-b border-slate-200 bg-slate-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-1.5 px-4 py-2.5 text-sm font-semibold text-white sm:px-6 lg:px-8">
          <a
            href="https://wa.me/923458340669"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition hover:text-emerald-300"
          >
            <FaWhatsapp className="h-4 w-4" /> +92 345 8340669
          </a>
          <a href="tel:+923458340669" className="inline-flex items-center gap-1.5 transition hover:text-cyan-300">
            <HiOutlinePhone className="h-4 w-4" /> Call
          </a>
          <a
            href="mailto:mohammadfaisalpirzada@gmail.com"
            className="inline-flex items-center gap-1.5 transition hover:text-amber-300"
          >
            <HiOutlineMail className="h-4 w-4" /> mohammadfaisalpirzada@gmail.com
          </a>
        </div>
      </div>

      <section className="relative overflow-hidden border-b border-slate-200/70 bg-white">
        <div className="absolute -left-20 top-[-120px] h-64 w-64 rounded-full bg-cyan-200/50 blur-3xl" />
        <div className="absolute right-[-90px] top-14 h-72 w-72 rounded-full bg-orange-200/45 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 lg:px-8 lg:pt-14">
          <div className="grid gap-8 lg:grid-cols-[1.15fr,0.85fr] lg:items-end">
            <div className="space-y-5 text-center sm:text-left">
              <p className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                Master Sahib Workspace
              </p>

              <h1 className="text-4xl font-black leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
                One Clean Entry
                <span className="block bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 bg-clip-text text-transparent">
                  For Learning + Teaching
                </span>
              </h1>

              <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
                <Link
                  href="/educational-resources"
                  className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400"
                >
                  Open Educational Resources
                </Link>
                <HomeSignIn />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur sm:p-5">
              <div className="grid grid-cols-3 gap-3">
                {highlights.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-4 text-center">
                    <p className="text-xl font-black text-slate-900 sm:text-2xl">{item.value}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-700">Visitors</span>
                <HomeVisitorCount />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Quick Access</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">Core Modules</h2>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {quickCards.map((card) => {
            const showNewBadge = Boolean(card.newUntil) && now <= new Date(card.newUntil as string).getTime();

            return (
              <Link
                key={card.title}
                href={card.href}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {showNewBadge ? (
                  <span className="absolute right-4 top-4 rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-sm animate-pulse">
                    New
                  </span>
                ) : null}
                <div className={`mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r ${card.accent}`} />
                <h3 className="pr-12 text-xl font-bold text-slate-900">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
                <div className="mt-5 inline-flex items-center text-sm font-semibold text-slate-900">
                  Open
                  <span className="ml-2 transition group-hover:translate-x-1">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <HomePadletBoard />

      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Master Sahib</p>
            <h3 className="mt-2 text-xl font-black text-slate-900">Learning Hub</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Clean digital workspace for educational resources, GGSS management, and daily teaching flow.
            </p>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900">Quick Links</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
              <Link href="/teaching-license" className="transition hover:text-slate-900">Sindh Teaching License (STEDA)</Link>
              <Link href="/ggss-nishtar-road" className="transition hover:text-slate-900">GGSS</Link>
              <Link href="/educational-resources" className="transition hover:text-slate-900">Educational Resources</Link>
              <Link href="/contact" className="transition hover:text-slate-900">Contact</Link>
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
              className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Request Feature
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-200">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} Master Sahib. All rights reserved.</p>
            <p>Built for practical daily use.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
