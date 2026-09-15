import type { Metadata } from 'next';
import Link from 'next/link';
import {
  HiArrowRight, HiCheckCircle, HiLockClosed, HiMail, HiOutlineAcademicCap,
  HiOutlineLightningBolt, HiOutlineSparkles, HiPhone, HiShieldCheck,
} from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';

export const metadata: Metadata = {
  title: 'Courses',
  description: 'Practical AI, EdTech and academic planning courses by The Master Sahib — for teachers, coordinators and school leaders.',
};

const PHONE_DISPLAY = '+92 345 8340669';
const PHONE_TEL = 'tel:+923458340669';
const WHATSAPP = 'https://wa.me/923458340669';
const EMAIL = 'mailto:mohammadfaisalpirzada@gmail.com';

const waLink = (course: string) =>
  `${WHATSAPP}?text=${encodeURIComponent(`Hi, I want to register for the "${course}" course.`)}`;

type NewCourse = { title: string; tag: string; description: string; fee: number; feeLabel?: string; href?: string };
type PastCourse = { title: string; description: string; batch: string };

const newCourses: NewCourse[] = [
  {
    title: 'AI for All',
    tag: 'Flagship · 10 AI Courses',
    description: 'ChatGPT, Claude, Gemini, NotebookLM, Canva AI, curriculum design and more — 10 practical AI courses in one place.',
    fee: 3500,
    feeLabel: 'PKR 3,500 – 15,000',
    href: '/courses/ai-for-all',
  },
  {
    title: 'Academic Course & Curriculum Planning Mastery',
    tag: 'Planning & Design',
    description: 'Design complete unit plans, term plans and standards-aligned curriculum maps from scratch.',
    fee: 4500,
  },
  {
    title: 'Exam Paper & Assessment Design Mastery',
    tag: 'Planning & Design',
    description: 'Build balanced exam papers, MCQ banks and marking schemes aligned to board standards.',
    fee: 4500,
  },
  {
    title: 'ChatGPT Mastery for Educators',
    tag: 'AI Tool Mastery',
    description: 'Practical, hands-on ChatGPT workflows for lesson plans, question papers, rubrics and everyday teaching tasks.',
    fee: 3000,
  },
  {
    title: 'Claude Mastery for Educators',
    tag: 'AI Tool Mastery',
    description: 'Use Claude for longer documents, curriculum drafting, marking support and structured academic writing.',
    fee: 3000,
  },
  {
    title: 'NotebookLM Mastery',
    tag: 'AI Tool Mastery',
    description: "Turn your syllabus, notes and PDFs into AI-powered study guides and summaries with Google NotebookLM.",
    fee: 2500,
  },
];

const pastCourses: PastCourse[] = [
  { title: 'Google Workspace for Teachers', description: 'Docs, Sheets, Slides and Classroom for everyday school work.', batch: 'Completed · Feb 2025' },
  { title: 'Canva for Classroom Content Creation', description: 'Worksheets, posters and presentation design for teachers.', batch: 'Completed · May 2025' },
  { title: 'Excel & Gradebook Automation', description: 'Automated gradebooks, result sheets and report cards in Excel.', batch: 'Completed · Aug 2025' },
  { title: 'Google Forms & Digital Assessment', description: 'Auto-graded quizzes and digital assessment workflows.', batch: 'Completed · Nov 2025' },
  { title: 'Google Sites — Teacher Portfolio', description: 'Build a professional teaching portfolio website.', batch: 'Completed · Jan 2026' },
  { title: 'Presentation Design Mastery', description: 'Engaging, classroom-ready slide decks with PowerPoint & Canva.', batch: 'Completed · Apr 2026' },
];

export default function CoursesPage() {
  return (
    <main className="bg-[#f7f7fb] text-slate-900">
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(79,70,229,.55),transparent_34%),radial-gradient(circle_at_10%_90%,rgba(6,182,212,.22),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
          <div className="flex items-center gap-2 text-sm font-bold text-indigo-200">
            <Link href="/">Home</Link><span>/</span><span className="text-white">Courses</span>
          </div>
          <span className="mt-10 inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-cyan-200">
            Courses by The Master Sahib
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.07] sm:text-6xl">
            Practical courses for <span className="text-amber-300">modern educators.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            22+ years in classrooms, curriculum design and AI consulting — turned into short, practical, one-to-one
            courses for teachers, coordinators and school leaders. Fee: <span className="font-bold text-white">PKR 2,500 – 5,000</span>, by course.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 font-black text-slate-950">
              <FaWhatsapp /> WhatsApp to Enroll
            </a>
            <a href={PHONE_TEL} className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/[.08] px-6 py-3 font-black text-white backdrop-blur">
              <HiPhone /> Call Now
            </a>
          </div>
        </div>
      </section>

      {/* New / live courses */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(79,70,229,.35),transparent_36%),radial-gradient(circle_at_85%_80%,rgba(6,182,212,.18),transparent_32%)]" />
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
          <p className="text-sm font-black uppercase tracking-[.2em] text-cyan-300">Enrolling now</p>
          <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">New Courses</h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-300">One-to-one sessions, scheduled directly with you — no fixed batch dates or times. Message on WhatsApp to book.</p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {newCourses.map((course) => (
              <article key={course.title} className="flex flex-col rounded-3xl border border-white/10 bg-white/[.06] p-6 shadow-2xl backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300/30">
                <div className="flex items-center gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
                    <HiOutlineSparkles className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-cyan-200">{course.tag}</span>
                </div>
                <h3 className="mt-4 text-lg font-black text-white">{course.title}</h3>
                <p className="mt-2 flex-1 leading-6 text-slate-300">{course.description}</p>

                <div className="mt-5 border-t border-white/10 pt-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Course fee</p>
                  <p className="mt-1 text-2xl font-black text-white">{course.feeLabel ?? `PKR ${course.fee.toLocaleString()}`}</p>
                </div>

                {course.href ? (
                  <Link href={course.href} className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 py-3.5 text-sm font-black text-slate-950 transition hover:bg-amber-300">
                    View All 10 Courses <HiArrowRight />
                  </Link>
                ) : (
                  <a href={waLink(course.title)} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 py-3.5 text-sm font-black text-slate-950 transition hover:bg-amber-300">
                    <FaWhatsapp className="h-4 w-4" /> Register Now — PKR {course.fee.toLocaleString()}
                  </a>
                )}
                <p className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <HiShieldCheck /> One-to-one session · Confirmation by WhatsApp
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Past / completed courses */}
      <section className="bg-slate-100/70">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
          <p className="text-sm font-black uppercase tracking-[.2em] text-slate-500">Track record</p>
          <h2 className="mt-3 text-3xl font-black text-slate-800 sm:text-4xl">Completed Courses</h2>
          <p className="mt-4 max-w-2xl leading-7 text-slate-500">Past cohorts, already delivered. Enrollment is closed for these — shown here for reference.</p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pastCourses.map((course) => (
              <article key={course.title} className="relative flex flex-col rounded-3xl border border-slate-200 bg-white/60 p-6 opacity-80 grayscale">
                <div className="flex items-center gap-2">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-500">
                    <HiOutlineAcademicCap className="h-5 w-5" />
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-700">
                    <HiCheckCircle className="h-3.5 w-3.5" /> {course.batch}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-black text-slate-700">{course.title}</h3>
                <p className="mt-2 flex-1 leading-6 text-slate-500">{course.description}</p>
                <button disabled className="mt-5 inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-slate-100 py-3 text-sm font-black text-slate-400">
                  <HiLockClosed className="h-4 w-4" /> Enrollment Closed
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-amber-300">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <p className="flex items-center gap-2 font-bold text-amber-900"><HiOutlineLightningBolt /> PKR 2,500 – 5,000 per course</p>
              <h2 className="mt-1 text-3xl font-black text-slate-950">Ready to enroll? Reach out directly.</h2>
              <p className="mt-2 max-w-xl leading-6 text-amber-950/80">No online payment link — just call, WhatsApp or email Master Sahib to confirm your seat and schedule a one-to-one session.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href={PHONE_TEL} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 font-black text-white">
                <HiPhone /> {PHONE_DISPLAY}
              </a>
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 font-black text-white">
                <FaWhatsapp /> WhatsApp
              </a>
              <a href={EMAIL} className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-950 bg-white px-6 py-4 font-black text-slate-950">
                <HiMail /> Email
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
