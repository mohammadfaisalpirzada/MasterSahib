'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  HiArrowLeft,
  HiArrowTopRightOnSquare,
  HiBookOpen,
  HiCheckCircle,
  HiChevronDown,
  HiClock,
  HiPlay,
  HiSparkles,
} from 'react-icons/hi2';
import LiveQuestionSession from './LiveQuestionSession';

type Chapter = {
  id: number;
  title: string;
  description: string;
  topics: string[];
  ready: boolean;
  accent: string;
  weeks: string;
  hours: number;
  resources: { label: string; description: string; href: string }[];
};

const subjects = [
  { name: 'Mathematics', code: '0580', icon: '∑', ready: true },
  { name: 'Physics', code: '0625', icon: '⚛', ready: false },
  { name: 'Chemistry', code: '0620', icon: '⌬', ready: false },
  { name: 'Biology', code: '0610', icon: '🧬', ready: false },
  { name: 'English', code: '0510', icon: 'Aa', ready: false },
  { name: 'Urdu', code: '0386', icon: 'اُ', ready: false },
];

const chapters: Chapter[] = [
  {
    id: 1,
    title: 'Review of Number Concepts',
    description: 'Build a strong number foundation with guided examples, visual explanations and practice.',
    topics: ['Types of Number', 'Sets & Venn', 'Powers & Roots', 'Fractions', 'BIDMAS', 'Indices', 'Standard Form'],
    ready: true,
    accent: 'from-cyan-400 to-blue-500',
    weeks: 'Weeks 1–5',
    hours: 20,
    resources: [
      { label: 'Complete Chapter 1 guide', description: 'Our guided notes, examples, QR videos and practice.', href: '/igcse-0580/Chapter-1-Study-Guide.html' },
      { label: 'Cambridge Resource Plus', description: 'Official learner materials mapped to syllabus 0580.', href: 'https://learning.cambridgeinternational.org/classroom/course/view.php?id=3099' },
      { label: 'Corbettmaths Number', description: 'Short videos, practice questions and textbook exercises.', href: 'https://corbettmaths.com/contents/' },
    ],
  },
  {
    id: 2,
    title: 'Algebra & Equations',
    description: 'Expressions, equations, inequalities and sequences.',
    topics: ['Simplifying', 'Equations', 'Inequalities', 'Sequences', 'Simultaneous Equations'],
    ready: false,
    accent: 'from-violet-400 to-purple-500',
    weeks: 'Weeks 6–12',
    hours: 28,
    resources: [
      { label: 'Corbettmaths Algebra', description: 'Video explanations and printable algebra practice.', href: 'https://corbettmaths.com/tag/algebra/' },
      { label: 'Khan Academy Algebra 1', description: 'Mastery-based lessons, hints and practice.', href: 'https://www.khanacademy.org/math/algebra' },
      { label: 'Maths Genie IGCSE', description: 'IGCSE topic practice organised by difficulty.', href: 'https://www.mathsgenie.co.uk/igcse.html' },
    ],
  },
  {
    id: 4,
    title: 'Geometry',
    description: 'Shape properties, angle facts, symmetry, constructions and circle theorems.',
    topics: ['Angles', 'Polygons', 'Congruence', 'Similarity', 'Symmetry', 'Circle theorems'],
    ready: false,
    accent: 'from-emerald-400 to-teal-500',
    weeks: 'Weeks 16–20',
    hours: 20,
    resources: [
      { label: 'GeoGebra Geometry', description: 'Explore constructions and geometry dynamically.', href: 'https://www.geogebra.org/geometry' },
      { label: 'Corbettmaths Geometry', description: 'Topic videos and practice worksheets.', href: 'https://corbettmaths.com/contents/' },
      { label: 'Cambridge Resource Plus', description: 'Official 0580 geometry learner activities.', href: 'https://learning.cambridgeinternational.org/classroom/course/view.php?id=3099' },
    ],
  },
  {
    id: 9,
    title: 'Statistics',
    description: 'Collect, represent and interpret data using averages, charts and distributions.',
    topics: ['Data collection', 'Averages', 'Charts', 'Scatter graphs', 'Cumulative frequency', 'Histograms'],
    ready: false,
    accent: 'from-amber-400 to-orange-500',
    weeks: 'Weeks 35–37',
    hours: 12,
    resources: [
      { label: 'Khan Academy Statistics', description: 'Guided data handling and statistics practice.', href: 'https://www.khanacademy.org/math/statistics-probability' },
      { label: 'Corbettmaths Statistics', description: 'Charts, averages and grouped-data worksheets.', href: 'https://corbettmaths.com/contents/' },
      { label: 'Cambridge Resource Plus', description: 'Official statistics teaching and learner resources.', href: 'https://learning.cambridgeinternational.org/classroom/course/view.php?id=3099' },
    ],
  },
  {
    id: 7,
    title: 'Transformations & Vectors',
    description: 'Visual transformations, matrices and vector geometry.',
    topics: ['Transformations', 'Matrices', 'Vectors'],
    ready: false,
    accent: 'from-rose-400 to-pink-500',
    weeks: 'Weeks 27–29',
    hours: 12,
    resources: [
      { label: 'GeoGebra Transformations', description: 'Visualise reflections, rotations and enlargements.', href: 'https://www.geogebra.org/search/transformations' },
      { label: 'Corbettmaths Transformations', description: 'Videos and exam-style practice.', href: 'https://corbettmaths.com/contents/' },
      { label: 'Cambridge Resource Plus', description: 'Official vectors and transformations materials.', href: 'https://learning.cambridgeinternational.org/classroom/course/view.php?id=3099' },
    ],
  },
  {
    id: 3, title: 'Coordinate Geometry', description: 'Coordinates, straight-line graphs, gradient and equations of lines.',
    topics: ['Coordinates', 'Gradient', 'Midpoint', 'Line equations', 'Parallel lines'], ready: false, accent: 'from-sky-400 to-cyan-500',
    weeks: 'Weeks 13–15', hours: 12,
    resources: [
      { label: 'GeoGebra Graphing', description: 'Plot and explore straight-line equations.', href: 'https://www.geogebra.org/graphing' },
      { label: 'Cambridge interactive demo', description: 'Official straight-line graph demonstrations.', href: 'https://learning.cambridgeinternational.org/classroom/course/view.php?id=3208' },
      { label: 'Corbettmaths Graphs', description: 'Graph videos and downloadable practice.', href: 'https://corbettmaths.com/tag/graphs/' },
    ],
  },
  {
    id: 5, title: 'Mensuration', description: 'Perimeter, area, surface area, volume and compound shapes.',
    topics: ['Perimeter & area', 'Circles', 'Surface area', 'Volume', 'Compound shapes'], ready: false, accent: 'from-lime-400 to-emerald-500',
    weeks: 'Weeks 21–23', hours: 12,
    resources: [
      { label: 'Corbettmaths Mensuration', description: 'Area, volume and compound-shape practice.', href: 'https://corbettmaths.com/contents/' },
      { label: 'Khan Geometry', description: 'Visual geometry and measurement practice.', href: 'https://www.khanacademy.org/math/geometry' },
      { label: 'Cambridge Resource Plus', description: 'Official unit-conversion and mensuration materials.', href: 'https://learning.cambridgeinternational.org/classroom/course/view.php?id=3099' },
    ],
  },
  {
    id: 6, title: 'Trigonometry', description: 'Pythagoras, trigonometric ratios, bearings and 3D problems.',
    topics: ['Pythagoras', 'SOHCAHTOA', 'Bearings', 'Sine & cosine rules', '3D trigonometry'], ready: false, accent: 'from-orange-400 to-red-500',
    weeks: 'Weeks 24–26', hours: 12,
    resources: [
      { label: 'Khan Trigonometry', description: 'Concept lessons with scaffolded practice.', href: 'https://www.khanacademy.org/math/trigonometry' },
      { label: 'Corbettmaths Trigonometry', description: 'Pythagoras, bearings and trig worksheets.', href: 'https://corbettmaths.com/contents/' },
      { label: 'Cambridge Resource Plus', description: 'Official bearings and 3D trigonometry packs.', href: 'https://learning.cambridgeinternational.org/classroom/course/view.php?id=3099' },
    ],
  },
  {
    id: 8, title: 'Probability', description: 'Single and combined events, diagrams and conditional reasoning.',
    topics: ['Probability scale', 'Combined events', 'Tree diagrams', 'Venn diagrams', 'Expected frequency'], ready: false, accent: 'from-fuchsia-400 to-violet-500',
    weeks: 'Weeks 30–34', hours: 20,
    resources: [
      { label: 'Khan Probability', description: 'Interactive probability lessons and practice.', href: 'https://www.khanacademy.org/math/statistics-probability/probability-library' },
      { label: 'Cambridge interactive tools', description: 'Official spinners, tree and Venn diagrams.', href: 'https://learning.cambridgeinternational.org/classroom/course/view.php?id=3208' },
      { label: 'Corbettmaths Probability', description: 'Topic videos and exam-style questions.', href: 'https://corbettmaths.com/contents/' },
    ],
  },
];

const curriculum = [...chapters].sort((a, b) => a.id - b.id);

export default function IGCSE0580Page() {
  const [chapterId, setChapterId] = useState(1);
  const [chapterMenu, setChapterMenu] = useState(false);
  const chapter = chapters.find((item) => item.id === chapterId) ?? chapters[0];
  const completedTopics = 0;
  const progress = Math.round((completedTopics / chapter.topics.length) * 100);

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <section className="relative isolate overflow-hidden bg-[#07152f] text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_75%_20%,rgba(59,130,246,.28),transparent_32%),radial-gradient(circle_at_15%_80%,rgba(34,211,238,.16),transparent_26%)]" />
        <div className="absolute inset-0 -z-10 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:40px_40px]" />

        <div className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:px-8 lg:pb-20">
          <nav className="flex items-center justify-between">
            <Link href="/educational-resources" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white">
              <HiArrowLeft className="h-4 w-4" /> Educational resources
            </Link>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-cyan-100 backdrop-blur">
              Cambridge IGCSE · 0580
            </span>
          </nav>

          <div className="mt-12 grid items-end gap-10 lg:grid-cols-[1fr_340px]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[.18em] text-cyan-200">
                <HiSparkles className="h-4 w-4" /> Personal learning space
              </div>
              <h1 className="max-w-4xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                Mathematics, made
                <span className="block bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-300 bg-clip-text text-transparent">clear and memorable.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Sabrina&apos;s complete 0580 companion—focused explanations, worked examples, smart revision and practice in one calm workspace.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#study-guide" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-[#07152f] shadow-xl transition hover:-translate-y-0.5">
                  <HiPlay className="h-4 w-4" /> Continue Chapter 1
                </a>
                <a href="/igcse-0580/Chapter-1-Study-Guide.html" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15">
                  Focus mode <HiArrowTopRightOnSquare className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/[.08] p-5 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-cyan-200">Current journey</p>
                  <p className="mt-1 text-lg font-extrabold">Chapter 1</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/15 text-cyan-200"><HiBookOpen className="h-6 w-6" /></div>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <span className="text-sm text-slate-300">Topic progress</span>
                <span className="text-2xl font-black">{progress}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-blue-400" style={{ width: `${Math.max(progress, 4)}%` }} /></div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-2xl bg-black/15 p-3"><p className="text-xl font-black">9</p><p className="text-[11px] text-slate-400">Syllabus units</p></div>
                <div className="rounded-2xl bg-black/15 p-3"><p className="text-xl font-black">40</p><p className="text-[11px] text-slate-400">Week pathway</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6 lg:px-8">
        <LiveQuestionSession />

        <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,.06)] sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-blue-600">Normal-paced programme</p><h2 className="mt-1 text-2xl font-black">40-week learning plan</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Four focused hours each week: two concept lessons, one guided-practice lesson and one retrieval or exam-practice lesson.</p></div>
            <div className="flex gap-2"><span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">160 hours</span><span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">Core + Extended</span></div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {curriculum.map((item) => (
              <button key={item.id} onClick={() => setChapterId(item.id)} className="group rounded-2xl border border-slate-200 p-4 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg">
                <div className="flex items-center justify-between"><span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${item.accent} text-sm font-black text-white`}>{item.id}</span><span className="text-[10px] font-black text-slate-400">{item.hours} HOURS</span></div>
                <p className="mt-3 text-sm font-black group-hover:text-blue-700">{item.title}</p><p className="mt-1 text-xs font-bold text-slate-400">{item.weeks}</p>
              </button>
            ))}
            <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-sm font-black text-white">✓</div><p className="mt-3 text-sm font-black text-amber-950">Revision & mocks</p><p className="mt-1 text-xs font-bold text-amber-700">Weeks 38–40 · 12 hours</p>
            </div>
          </div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-600"><strong className="text-slate-900">Weekly rhythm:</strong> Day 1 concept and examples · Day 2 skill practice · Day 3 mixed problems · Day 4 live question session and corrections. Every fifth week includes a short checkpoint.</div>
        </section>

        <section className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,.06)] sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-blue-600">Course collection</p><h2 className="mt-1 text-xl font-black">Choose a subject</h2></div>
            <p className="hidden text-sm text-slate-500 sm:block">More guides are being prepared</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            {subjects.map((subject) => (
              <button key={subject.code} disabled={!subject.ready} className={`relative rounded-2xl border p-4 text-left transition ${subject.ready ? 'border-blue-200 bg-blue-50 ring-2 ring-blue-600/10 hover:-translate-y-0.5' : 'cursor-not-allowed border-slate-100 bg-slate-50/80 opacity-55'}`}>
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-black ${subject.ready ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{subject.icon}</span>
                <p className="mt-3 text-[10px] font-extrabold tracking-widest text-slate-400">{subject.code}</p>
                <p className="text-sm font-extrabold">{subject.name}</p>
                {!subject.ready && <span className="absolute right-2 top-2 rounded-full bg-white px-2 py-1 text-[8px] font-black uppercase text-slate-400">Soon</span>}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-7 lg:grid-cols-[320px_1fr]">
          <aside className="h-fit rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,.06)] lg:sticky lg:top-5">
            <p className="px-2 pb-3 text-xs font-extrabold uppercase tracking-[.16em] text-slate-400">Learning path</p>
            <div className="relative lg:hidden">
              <button onClick={() => setChapterMenu(!chapterMenu)} className="flex w-full items-center justify-between rounded-2xl bg-slate-100 p-4 text-left">
                <span><span className="block text-[10px] font-bold text-blue-600">CHAPTER {chapter.id}</span><span className="text-sm font-extrabold">{chapter.title}</span></span>
                <HiChevronDown className={`h-5 w-5 transition ${chapterMenu ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <div className={`${chapterMenu ? 'mt-2 block' : 'hidden'} space-y-2 lg:block`}>
              {curriculum.map((item) => (
                <button key={item.id} onClick={() => { setChapterId(item.id); setChapterMenu(false); }} className={`group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${chapter.id === item.id ? 'bg-[#07152f] text-white shadow-lg' : 'hover:bg-slate-50'}`}>
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.accent} text-sm font-black text-white`}>{item.id}</span>
                  <span className="min-w-0 flex-1"><span className={`block text-[9px] font-black uppercase tracking-wider ${chapter.id === item.id ? 'text-cyan-200' : 'text-slate-400'}`}>{item.weeks}</span><span className="block truncate text-sm font-extrabold">{item.title}</span></span>
                  {item.ready ? <HiCheckCircle className="h-5 w-5 text-emerald-400" /> : <HiClock className="h-4 w-4 text-slate-400" />}
                </button>
              ))}
            </div>
          </aside>

          <div className="min-w-0 space-y-5">
            <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,.06)]">
              <div className={`h-1.5 bg-gradient-to-r ${chapter.accent}`} />
              <div className="p-5 sm:p-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[.16em] text-blue-600">Chapter {chapter.id} · Mathematics 0580</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{chapter.title}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{chapter.description}</p>
                  </div>
                  {chapter.ready && <a href="/igcse-0580/Chapter-1-Study-Guide.html" target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-blue-700">Focus mode <HiArrowTopRightOnSquare className="h-4 w-4" /></a>}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">{chapter.topics.map((topic, index) => <span key={topic} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600"><span className="mr-1.5 text-blue-500">{String(index + 1).padStart(2, '0')}</span>{topic}</span>)}</div>
                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5"><span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">{chapter.weeks}</span><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">{chapter.hours} guided hours</span><span className="text-xs text-slate-400">Recommended for a normal-paced learner</span></div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,.06)] sm:p-7">
              <div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-blue-600">Curated learning stack</p><h3 className="mt-1 text-xl font-black">Resources for {chapter.title}</h3></div>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {chapter.resources.map((resource, resourceIndex) => (
                  <a key={resource.label} href={resource.href} target={resource.href.startsWith('http') ? '_blank' : undefined} rel={resource.href.startsWith('http') ? 'noreferrer' : undefined} className="group rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg">
                    <span className="text-[10px] font-black uppercase tracking-[.15em] text-blue-500">Resource {resourceIndex + 1}</span><p className="mt-2 text-sm font-black group-hover:text-blue-700">{resource.label} ↗</p><p className="mt-1 text-xs leading-5 text-slate-500">{resource.description}</p>
                  </a>
                ))}
              </div>
            </section>

            {chapter.ready ? (
              <section id="study-guide" className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,.06)]">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"><HiCheckCircle className="h-5 w-5" /></span><div><p className="text-sm font-extrabold">Interactive study guide</p><p className="text-[11px] text-slate-500">Your progress is saved on this device</p></div></div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-600">Ready</span>
                </div>
                <iframe src="/igcse-0580/Chapter-1-Study-Guide.html" className="h-[78vh] min-h-[680px] w-full border-0" title="Sabrina IGCSE 0580 Chapter 1 Study Guide" />
              </section>
            ) : (
              <section className="rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl">✦</div>
                <h3 className="mt-5 text-xl font-black">Full guided chapter is being prepared</h3>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">The syllabus topics, normal learning time and trusted resources are ready above. The detailed in-house guide will be added chapter by chapter.</p>
                <a href="#live-practice" className="mt-5 inline-flex rounded-xl bg-[#07152f] px-5 py-3 text-sm font-black text-white">Practise live questions</a>
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
