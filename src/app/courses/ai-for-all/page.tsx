import type { Metadata } from 'next';
import Link from 'next/link';
import {
  HiArrowRight, HiCheck, HiGlobeAlt, HiOutlineAcademicCap,
  HiOutlineLightningBolt, HiOutlineSparkles, HiPhone,
} from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';

export const metadata: Metadata = { title: 'AI Courses — All AI Courses in One Place', description: 'Master ChatGPT, Claude, Gemini, NotebookLM, Canva AI, curriculum design and more with practical, one-to-one AI courses for teachers and professionals.' };

const PHONE_TEL = 'tel:+923458340669';
const WHATSAPP = 'https://wa.me/923458340669';
const waLink = (course: string) =>
  `${WHATSAPP}?text=${encodeURIComponent(`Hi, I want to register for the "${course}" course.`)}`;

type AiCourse = { number: string; title: string; description: string; fee: number };

const aiCourses: AiCourse[] = [
  { number: '01', title: 'ChatGPT Mastery', description: 'Practical ChatGPT workflows for lesson plans, question papers and daily tasks.', fee: 5000 },
  { number: '02', title: 'Claude Mastery', description: 'Long-document work: curriculum drafting, marking support, structured writing.', fee: 5000 },
  { number: '03', title: 'Google Gemini Mastery', description: 'Gemini across Docs, Sheets and Slides for faster, smarter classroom prep.', fee: 5000 },
  { number: '04', title: 'Google NotebookLM Mastery', description: 'Turn your syllabus, notes and PDFs into AI-powered study guides and audio overviews.', fee: 4000 },
  { number: '05', title: 'Canva AI (Magic Studio) Mastery', description: 'AI-generated worksheets, posters and classroom visuals in minutes.', fee: 4000 },
  { number: '06', title: 'AI Image Development Course', description: 'Create and refine custom classroom visuals, diagrams and posters with AI image tools.', fee: 5500 },
  { number: '07', title: 'Syllabus Making with AI', description: 'Build a complete, standards-aligned syllabus in a fraction of the usual time.', fee: 4500 },
  { number: '08', title: 'Curriculum Designing Course', description: 'Design full unit plans, term plans and curriculum maps using AI as your co-planner.', fee: 6000 },
  { number: '09', title: 'Urdu Content & Design Course', description: 'AI-assisted Urdu typing, content writing and graphic design for classroom materials.', fee: 3500 },
  { number: '10', title: 'AI for All — Complete Mastery Program', description: 'The full program: every course above, taught together as one complete system.', fee: 15000 },
];

const outcomes = ['Work confidently across 10 major AI tools', 'Create complete lesson plans in less time', 'Design a full syllabus and curriculum with AI', 'Design quizzes, worksheets and rubrics with AI', 'Use AI safely and ethically with students', 'Earn a digital completion certificate'];

export default function CoursePage() {
  return <main className="bg-[#f7f7fb] text-slate-900">
    <section id="top" className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(79,70,229,.55),transparent_34%),radial-gradient(circle_at_10%_90%,rgba(6,182,212,.22),transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="flex items-center gap-2 text-sm font-bold text-indigo-200"><Link href="/">Home</Link><span>/</span><Link href="/courses">Courses</Link><span>/</span><span className="text-white">AI Courses</span></div>
        <div className="mt-5 flex flex-col items-start gap-5">
          <span className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-cyan-200">10 AI courses · One-to-one sessions</span>
          <div className="inline-flex max-w-3xl items-center gap-3 rounded-3xl border border-white/15 bg-white/10 px-6 py-5 shadow-2xl backdrop-blur-xl sm:px-8 sm:py-6">
            <HiOutlineSparkles className="h-7 w-7 shrink-0 text-amber-300 sm:h-9 sm:w-9" />
            <h1 className="bg-gradient-to-r from-cyan-200 via-white to-amber-200 bg-clip-text text-2xl font-black leading-[1.15] text-transparent sm:text-4xl">AI Courses in one place.</h1>
          </div>
        </div>
        <p className="mt-4 max-w-2xl leading-7 text-slate-300">Practical, hands-on AI courses for teachers, coordinators and professionals — pick a single tool or master the complete system, without needing any technical background.</p>
        <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-slate-200"><span className="flex items-center gap-2"><HiOutlineSparkles className="text-cyan-300" /> 10 AI courses</span><span className="flex items-center gap-2"><HiGlobeAlt className="text-cyan-300" /> Live online, one-to-one</span><span className="flex items-center gap-2"><HiOutlineAcademicCap className="text-cyan-300" /> Beginner friendly</span></div>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 font-black text-slate-950"><FaWhatsapp /> WhatsApp to Enroll</a>
          <a href={PHONE_TEL} className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/[.08] px-6 py-3 font-black text-white backdrop-blur"><HiPhone /> Call Now</a>
        </div>
      </div>
    </section>

    {/* 10 AI courses */}
    <section className="relative overflow-hidden bg-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(79,70,229,.3),transparent_35%),radial-gradient(circle_at_90%_85%,rgba(6,182,212,.16),transparent_32%)]" />
      <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
        <p className="text-sm font-black uppercase tracking-[.2em] text-cyan-300">Choose your course</p>
        <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">10 courses, each taught one-to-one</h2>
        <p className="mt-3 max-w-2xl leading-6 text-slate-300">Register for any single course, or go for the complete mastery program. Every session is scheduled directly with you on WhatsApp.</p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {aiCourses.map((course) => (
            <article key={course.number} className={`flex flex-col rounded-2xl border p-5 shadow-xl backdrop-blur-xl transition hover:-translate-y-1 ${course.number === '10' ? 'border-amber-300/40 bg-amber-400/[.08]' : 'border-white/10 bg-white/[.06] hover:border-cyan-300/30'}`}>
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-xs font-black text-cyan-300">{course.number}</span>
                {course.number === '10' && <span className="rounded-full bg-amber-400/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-300">Best value</span>}
              </div>
              <h3 className="mt-3 text-base font-black text-white">{course.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-5 text-slate-300">{course.description}</p>
              <p className="mt-4 text-lg font-black text-white">PKR {course.fee.toLocaleString()}</p>
              <a href={waLink(course.title)} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 py-2.5 text-sm font-black text-slate-950 transition hover:bg-amber-300">
                <FaWhatsapp className="h-4 w-4" /> Register Now
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_340px] lg:py-24">
      <div><p className="text-sm font-black uppercase tracking-[.2em] text-indigo-600">Why this program</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">From curious to AI-confident</h2><p className="mt-4 max-w-2xl leading-7 text-slate-600">Every course includes a live demonstration, guided practice and a ready-to-use task you can apply the same day.</p>
      </div>
      <aside className="space-y-6"><div className="rounded-3xl bg-indigo-600 p-7 text-white"><HiOutlineLightningBolt className="h-9 w-9 text-amber-300" /><h2 className="mt-5 text-2xl font-black">What you’ll achieve</h2><ul className="mt-6 space-y-4">{outcomes.map(item => <li key={item} className="flex gap-3 text-sm leading-6 text-indigo-50"><HiCheck className="mt-1 h-4 w-4 shrink-0 text-amber-300" />{item}</li>)}</ul></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-7"><h3 className="text-xl font-black">Who is this for?</h3><p className="mt-3 leading-7 text-slate-600">School teachers, tutors, coordinators, education students and school leaders. No coding or previous AI experience is required.</p></div>
      </aside>
    </section>
    <section className="bg-amber-300"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-12 sm:px-8 md:flex-row md:items-center"><div><p className="font-bold text-amber-900">PKR 3,500 – 15,000 per course</p><h2 className="mt-1 text-3xl font-black text-slate-950">Ready to start? Message us directly.</h2></div><a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 font-black text-white">WhatsApp to Enroll <HiArrowRight /></a></div></section>
  </main>;
}
