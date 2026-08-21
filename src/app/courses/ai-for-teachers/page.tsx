import type { Metadata } from 'next';
import Link from 'next/link';
import { HiArrowRight, HiCheck, HiClock, HiGlobeAlt, HiOutlineAcademicCap, HiOutlineCalendar, HiOutlineLightningBolt, HiShieldCheck, HiUserGroup } from 'react-icons/hi';
import EnrollmentForm from './EnrollmentForm';

export const metadata: Metadata = { title: 'AI for Teachers — Live Course', description: 'Learn practical AI tools for lesson planning, assessment and smarter teaching.' };

const modules = [
  ['01', 'AI Foundations for Educators', 'Understand generative AI, safe classroom use, and the teacher’s role in an AI-powered future.'],
  ['02', 'Prompting That Gets Results', 'Write clear prompts for lesson plans, explanations, rubrics and differentiated activities.'],
  ['03', 'Smart Lesson Planning', 'Build curriculum-aligned weekly plans, learning outcomes and classroom resources in minutes.'],
  ['04', 'Worksheets & Assessments', 'Create age-appropriate worksheets, quizzes, answer keys and formative assessments.'],
  ['05', 'Creative & Inclusive Teaching', 'Adapt content for different ability levels, languages and special learning needs.'],
  ['06', 'Teacher Productivity Toolkit', 'Use AI for feedback, reports, parent communication and everyday administration.'],
  ['07', 'Responsible AI in School', 'Privacy, accuracy, bias, copyright and a practical classroom AI policy.'],
  ['08', 'Final Classroom Project', 'Design and present a complete AI-assisted lesson pack you can use immediately.'],
];
const outcomes = ['Create complete lesson plans in less time', 'Design quizzes, worksheets and rubrics', 'Differentiate content for mixed-ability classes', 'Use AI safely and ethically with students', 'Build a reusable personal prompt library', 'Earn a digital completion certificate'];

export default function CoursePage() {
  return <main className="bg-[#f7f7fb] text-slate-900">
    <section id="top" className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(79,70,229,.55),transparent_34%),radial-gradient(circle_at_10%_90%,rgba(6,182,212,.22),transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:grid lg:grid-cols-[1fr_380px] lg:gap-14 lg:py-24">
        <div><div className="flex items-center gap-2 text-sm font-bold text-indigo-200"><Link href="/">Home</Link><span>/</span><span>Courses</span><span>/</span><span className="text-white">AI for Teachers</span></div>
          <span className="mt-10 inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[.18em] text-cyan-200">Live online cohort · Admissions open</span>
          <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.07] sm:text-6xl">Teach smarter with <span className="text-amber-300">practical AI.</span></h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">A hands-on course for teachers who want to create better lessons, assessments and learning experiences—without needing any technical background.</p>
          <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-slate-200"><span className="flex items-center gap-2"><HiClock className="text-cyan-300" /> 8 weeks</span><span className="flex items-center gap-2"><HiGlobeAlt className="text-cyan-300" /> Live online</span><span className="flex items-center gap-2"><HiOutlineAcademicCap className="text-cyan-300" /> Beginner friendly</span></div>
        </div>
        <aside className="mt-12 rounded-3xl border border-white/10 bg-white/[.08] p-6 shadow-2xl backdrop-blur-xl lg:mt-0">
          <div className="flex items-center justify-between border-b border-white/10 pb-5"><div><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Course fee</p><p className="mt-1 text-3xl font-black">PKR 5,000</p></div><span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">20 seats left</span></div>
          <div className="space-y-4 py-6 text-sm"><p className="flex items-center gap-3"><HiOutlineCalendar className="h-5 w-5 text-indigo-300" /><span><b>Starts:</b> 5 September 2026</span></p><p className="flex items-center gap-3"><HiUserGroup className="h-5 w-5 text-indigo-300" /><span><b>Classes:</b> Saturday & Sunday</span></p><p className="flex items-center gap-3"><HiClock className="h-5 w-5 text-indigo-300" /><span><b>Time:</b> 7:00–8:30 PM (PKT)</span></p></div>
          <EnrollmentForm /><p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400"><HiShieldCheck /> Secure registration · Confirmation by WhatsApp</p>
        </aside>
      </div>
    </section>

    <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_340px] lg:py-24">
      <div><p className="text-sm font-black uppercase tracking-[.2em] text-indigo-600">Course curriculum</p><h2 className="mt-3 text-3xl font-black sm:text-4xl">From curious to classroom-ready</h2><p className="mt-4 max-w-2xl leading-7 text-slate-600">Every module includes a live demonstration, guided practice and a ready-to-use classroom task.</p>
        <div className="mt-10 space-y-4">{modules.map(([number,title,description]) => <article key={number} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg sm:flex sm:gap-5"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-black text-indigo-600">{number}</span><div className="mt-3 sm:mt-0"><h3 className="text-lg font-black">{title}</h3><p className="mt-1.5 leading-6 text-slate-600">{description}</p></div></article>)}</div>
      </div>
      <aside className="space-y-6"><div className="rounded-3xl bg-indigo-600 p-7 text-white"><HiOutlineLightningBolt className="h-9 w-9 text-amber-300" /><h2 className="mt-5 text-2xl font-black">What you’ll achieve</h2><ul className="mt-6 space-y-4">{outcomes.map(item => <li key={item} className="flex gap-3 text-sm leading-6 text-indigo-50"><HiCheck className="mt-1 h-4 w-4 shrink-0 text-amber-300" />{item}</li>)}</ul></div>
        <div className="rounded-3xl border border-slate-200 bg-white p-7"><h3 className="text-xl font-black">Who is this for?</h3><p className="mt-3 leading-7 text-slate-600">School teachers, tutors, coordinators, education students and school leaders. No coding or previous AI experience is required.</p></div>
      </aside>
    </section>
    <section className="bg-amber-300"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-12 sm:px-8 md:flex-row md:items-center"><div><p className="font-bold text-amber-900">Next cohort starts soon</p><h2 className="mt-1 text-3xl font-black text-slate-950">Ready to upgrade your teaching?</h2></div><a href="#top" className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 font-black text-white">View enrollment <HiArrowRight /></a></div></section>
  </main>;
}
