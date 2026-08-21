import Link from "next/link";
import HubLayout from "./HubLayout";

/* ═══════════════════════════════════════════════════════
   SIDEBAR DATA
   ═══════════════════════════════════════════════════════ */
const sidebarModules = [
  {
    id: "module-0",
    title: "Module 0",
    subtitle: "STEDA Overview & Test Strategy",
    icon: "🎯",
    sections: [
      { id: "m0-overview", label: "What is STEDA?" },
      { id: "m0-license-types", label: "License Categories" },
      { id: "m0-eligibility", label: "Eligibility Criteria" },
      { id: "m0-exam-pattern", label: "Exam Pattern & Weightage" },
      { id: "m0-strategy", label: "Test-Taking Strategy" },
      { id: "m0-mcq", label: "Practice MCQs" },
    ],
  },
  {
    id: "module-1",
    title: "Module 1",
    subtitle: "Educational Psychology & Child Development",
    icon: "🧠",
    sections: [
      { id: "m1-overview", label: "Module Overview" },
      { id: "m1-piaget", label: "Piaget's Cognitive Development" },
      { id: "m1-vygotsky", label: "Vygotsky's Social Constructivism" },
      { id: "m1-bloom", label: "Bloom's Taxonomy" },
      { id: "m1-erikson", label: "Erikson's Psychosocial Theory" },
      { id: "m1-behaviorism", label: "Behaviorism (Skinner & Pavlov)" },
      { id: "m1-bandura", label: "Bandura's Social Learning" },
      { id: "m1-individual-diff", label: "Individual Differences & Inclusive Education" },
      { id: "m1-motivation", label: "Motivation Theories" },
      { id: "m1-mcq", label: "Practice MCQs" },
    ],
  },
  {
    id: "module-2",
    title: "Module 2",
    subtitle: "General Methods of Teaching & Pedagogy",
    icon: "📖",
    sections: [
      { id: "m2-overview", label: "Module Overview" },
      { id: "m2-foundations", label: "Foundations of Education" },
      { id: "m2-instructional", label: "Instructional Approaches" },
      { id: "m2-cooperative", label: "Cooperative Learning" },
      { id: "m2-questioning", label: "Questioning Strategies" },
      { id: "m2-assessment", label: "Assessment Methods" },
      { id: "m2-mcq", label: "Practice MCQs" },
    ],
  },
  {
    id: "module-3",
    title: "Module 3",
    subtitle: "Classroom Management & Discipline",
    icon: "🏫",
    sections: [
      { id: "m3-overview", label: "Module Overview" },
      { id: "m3-environment", label: "Classroom Environment" },
      { id: "m3-routines", label: "Routines & Time Management" },
      { id: "m3-behavior", label: "Behavior Management" },
      { id: "m3-physical", label: "Physical & Social Environment" },
      { id: "m3-mcq", label: "Practice MCQs" },
    ],
  },
  {
    id: "module-4",
    title: "Module 4",
    subtitle: "STBB Core Subject Mastery",
    icon: "📚",
    sections: [
      { id: "m4-overview", label: "Module Overview" },
      { id: "m4-math", label: "Mathematics (Class 1-8)" },
      { id: "m4-science", label: "Science (Class 1-8)" },
      { id: "m4-english", label: "English (Class 1-8)" },
      { id: "m4-social", label: "Social Studies (Class 1-8)" },
      { id: "m4-mcq", label: "Practice MCQs" },
    ],
  },
  {
    id: "module-5",
    title: "Module 5",
    subtitle: "ICT & AI Tools for Educators",
    icon: "💻",
    sections: [
      { id: "m5-overview", label: "Module Overview" },
      { id: "m5-ict-basics", label: "ICT in Education" },
      { id: "m5-digital-tools", label: "Digital Teaching Tools" },
      { id: "m5-ai-education", label: "AI in Education" },
      { id: "m5-mcq", label: "Practice MCQs" },
    ],
  },
  {
    id: "module-6",
    title: "Module 6",
    subtitle: "Practice Quizzes & Mock Tests",
    icon: "🎯",
    sections: [
      { id: "m6-overview", label: "Module Overview" },
      { id: "m6-mock-test", label: "100-MCQ Full Mock Test" },
    ],
  },
];

/* ═══════════════════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════════════════ */
export default function STEDALearningHubPage() {
  return (
    <HubLayout sidebarModules={sidebarModules}>

            {/* ─────────────────────────────────────────
                MODULE 0 — STEDA OVERVIEW & TEST STRATEGY
                ───────────────────────────────────────── */}

            {/* MODULE 0 HEADER */}
            <div id="module-0" className="mb-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Module 0</p>
              <h1 className="mt-2 text-2xl font-black sm:text-3xl">STEDA Overview & Test Strategy</h1>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Everything you need to know about the Sindh Teacher Education Development Authority (STEDA)
                licensing examination — policy, eligibility, exam pattern, and a winning test strategy.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-300">100 Marks</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-300">2 Hours</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amber-300">50% Passing</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-rose-300">MCQs + CRQs</span>
              </div>
            </div>

            {/* M0: What is STEDA */}
            <section id="m0-overview" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">What is STEDA?</h2>
              <div className="prose-sm space-y-4 text-slate-700 leading-7">
                <p>
                  <strong>STEDA</strong> — the <strong>Sindh Teacher Education Development Authority</strong> —
                  is a statutory body established under the STEDA Act, 2012 by the Government of Sindh. It is
                  mandated to regulate, standardize, and strengthen teacher education across the province.
                </p>
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Key Takeaway</p>
                  <p className="mt-1 text-sm text-blue-800">
                    STEDA&apos;s Teaching License is <strong>mandatory</strong> for all government school teachers in Sindh.
                    It validates professional competency and ensures minimum standards for quality education.
                  </p>
                </div>
                <p>
                  The Teaching License was launched in 2024 as a phased initiative. In the first phase,
                  STEDA offered the licensing test for the <strong>Professional Teaching License (Elementary)</strong>.
                  Successful candidates were offered BPS-16 Elementary School Teacher roles.
                </p>
                <p>
                  The tests are developed and administered by a <strong>Third Party</strong> (currently
                  <strong> SIBA Testing Services / IBA Sukkur</strong>) appointed by STEDA based on
                  relevant expertise. The Third Party preferably is a NACTE-accredited organization.
                </p>
                <h3 className="!mt-6 text-lg font-bold text-slate-900">STEDA&apos;s Core Responsibilities</h3>
                <ul className="ml-4 list-disc space-y-1">
                  <li>Develop and enforce <strong>Professional Standards for Teachers</strong></li>
                  <li>Design and administer the Teaching License test</li>
                  <li>Issue, renew, and revoke Teaching Licenses</li>
                  <li>Accredit <strong>CPD (Continuing Professional Development)</strong> courses</li>
                  <li>Standardize B.Ed. and ADE curricula across Sindh universities</li>
                  <li>Ensure alignment with HEC-recognized teacher education programs</li>
                </ul>
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

            {/* M0: License Categories */}
            <section id="m0-license-types" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">License Categories</h2>
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-lg">📖</span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Professional Teaching License (Primary)</h3>
                      <p className="text-xs text-slate-500">Classes 1 – 5</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">
                    For <strong>ADE (Associate Degree in Education)</strong> holders. Eligible to teach at primary level (Classes 1-5).
                    In-service teachers must have ADE + 2 years&apos; teaching experience.
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-200 text-lg">📚</span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Professional Teaching License (Elementary)</h3>
                      <p className="text-xs text-emerald-700 font-semibold">Classes 1 – 8 · FIRST PHASE</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">
                    For <strong>B.Ed. Elementary (4 years / 2.5 years)</strong> or M.Ed./M.A. (Education) holders.
                    In-service teachers must have the qualification + 3 years&apos; experience.
                    This was the <strong>first phase</strong> of the licensing rollout.
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-lg">🎓</span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Professional Teaching License (Secondary)</h3>
                      <p className="text-xs text-slate-500">Classes 6 – 12</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">
                    For <strong>B.Ed. Secondary (4 years / 1.5 years)</strong> or M.Ed./M.A. (Education) holders.
                    In-service teachers must have the qualification + 3 years&apos; experience.
                    Covers secondary and higher secondary levels.
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-800">
                  ⚠️ Important: The 1-year B.Ed. has been <strong>de-recognized by HEC</strong> and will NOT be considered for any license category.
                </p>
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

            {/* M0: Eligibility */}
            <section id="m0-eligibility" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">Eligibility Criteria</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-3 text-left font-bold text-slate-900">Criterion</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-900">Primary</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-900">Elementary</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-900">Secondary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-700">Qualification</td>
                      <td className="px-4 py-3 text-slate-600">ADE</td>
                      <td className="px-4 py-3 text-slate-600">B.Ed. Elementary (4yr / 2.5yr) or M.Ed. / M.A. (Edu)</td>
                      <td className="px-4 py-3 text-slate-600">B.Ed. Secondary (4yr / 1.5yr) or M.Ed. / M.A. (Edu)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-700">Experience (Govt Teachers)</td>
                      <td className="px-4 py-3 text-slate-600">2 years</td>
                      <td className="px-4 py-3 text-slate-600">3 years</td>
                      <td className="px-4 py-3 text-slate-600">3 years</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-700">Aspiring Teachers</td>
                      <td className="px-4 py-3 text-slate-600">ADE</td>
                      <td className="px-4 py-3 text-slate-600">B.Ed. Elementary (4yr / 2.5yr)</td>
                      <td className="px-4 py-3 text-slate-600">B.Ed. Secondary (4yr / 1.5yr)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-700">Domicile</td>
                      <td className="px-4 py-3 text-slate-600" colSpan={3}>Sindh Province (all districts)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-700">CNIC</td>
                      <td className="px-4 py-3 text-slate-600" colSpan={3}>Valid Computerized National Identity Card</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Note</p>
                <p className="mt-1 text-sm text-blue-800">
                  Candidates from <strong>all domiciles in Sindh</strong> may apply. Private sector teachers
                  can also apply as per the requirements. Experience can be a combination of public and
                  private sector teaching.
                </p>
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

            {/* M0: Exam Pattern */}
            <section id="m0-exam-pattern" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">Exam Pattern & Weightage</h2>

              {/* Weightage Table */}
              <div className="mb-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-3 text-left font-bold text-slate-900">Component</th>
                      <th className="px-4 py-3 text-center font-bold text-slate-900">Weightage</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-900">Topics Covered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900">Content Knowledge</span>
                        <p className="text-xs text-slate-500">Part I</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-black text-blue-700">30%</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">Mathematics, Science, Social Studies, English, Urdu/Sindhi — from STBB Class 1-8 curriculum</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900">Psychometric Assessment</span>
                        <p className="text-xs text-slate-500">Part I</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-black text-amber-700">20%</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">Aptitude, reasoning, situational judgment, professional disposition</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900">Pedagogical Content Knowledge</span>
                        <p className="text-xs text-slate-500">Part II</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-700">50%</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">Pedagogy, Child Development, Educational Psychology, Classroom Management, Assessment, ICT</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Detailed Breakdown */}
              <h3 className="mb-3 text-lg font-bold text-slate-900">Detailed Marks Distribution</h3>
              <div className="space-y-3">
                {[
                  { label: "Pedagogy & Teaching Methods", marks: 20, color: "bg-emerald-500", icon: "📖" },
                  { label: "Child Development & Educational Psychology", marks: 20, color: "bg-blue-500", icon: "🧠" },
                  { label: "Subject Content Knowledge (STBB Class 1-8)", marks: 20, color: "bg-violet-500", icon: "📚" },
                  { label: "Classroom Management & Assessment", marks: 15, color: "bg-amber-500", icon: "🏫" },
                  { label: "ICT in Education", marks: 10, color: "bg-cyan-500", icon: "💻" },
                  { label: "Psychometric / Aptitude", marks: 15, color: "bg-rose-500", icon: "🎯" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <span className="text-lg">{item.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.marks * 5}%` }} />
                      </div>
                    </div>
                    <span className="shrink-0 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">
                      {item.marks} marks
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">Test Format</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                    <p className="text-2xl font-black text-slate-900">100</p>
                    <p className="text-xs font-semibold text-slate-500">Total Marks</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                    <p className="text-2xl font-black text-slate-900">2 Hours</p>
                    <p className="text-xs font-semibold text-slate-500">Duration</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                    <p className="text-2xl font-black text-slate-900">MCQs</p>
                    <p className="text-xs font-semibold text-slate-500">Easy + Medium Difficulty</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                    <p className="text-2xl font-black text-emerald-600">50%</p>
                    <p className="text-xs font-semibold text-slate-500">Passing Marks</p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                  <strong>Note:</strong> The test instrument is in <strong>English</strong> except the mother tongue portion
                  (Urdu / Sindhi). MCQs are at two levels (Easy and Medium) assessing understanding, application,
                  and analysis per Bloom&apos;s Taxonomy.
                </div>
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

            {/* M0: Test Strategy */}
            <section id="m0-strategy" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">Test-Taking Strategy</h2>
              <div className="space-y-4">
                {[
                  {
                    step: "1",
                    title: "Time Allocation — 2 Hours, 100 Marks",
                    body: "Allocate ~1 minute per MCQ. Spend 30 minutes on Part I (Content Knowledge + Psychometric), then 60 minutes on Part II (Pedagogical Content Knowledge). Reserve 30 minutes for review and flagged questions.",
                  },
                  {
                    step: "2",
                    title: "Part I — Content Knowledge (30%)",
                    body: "These questions test STBB Class 1-8 curriculum. Focus on Mathematics, Science, Social Studies, and English fundamentals. Don't overthink — most are comprehension and application level.",
                  },
                  {
                    step: "3",
                    title: "Part I — Psychometric (20%)",
                    body: "Situational judgment and professional disposition questions. Answer as a responsible, empathetic teacher would. There are no 'wrong' personality answers, but extreme responses are usually incorrect.",
                  },
                  {
                    step: "4",
                    title: "Part II — Pedagogical Content Knowledge (50%)",
                    body: "This is the heaviest section. Revise Bloom's Taxonomy, Piaget, Vygotsky, Skinner, Bandura, classroom management, and assessment methods. Apply theory to classroom scenarios.",
                  },
                  {
                    step: "5",
                    title: "Eliminate & Guess Smart",
                    body: "For MCQs you're unsure about, eliminate obviously wrong answers first. Never leave a question blank — there's no negative marking. If stuck between two options, go with the one that aligns with learner-centered pedagogy.",
                  },
                  {
                    step: "6",
                    title: "Re-Attempt Policy",
                    body: "If you don't pass, you can re-appear after at least 6 months or the next available test date. You must pay a fresh license fee. There is no limit on attempts.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

            {/* M0: Practice MCQs */}
            <section id="m0-mcq" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">Module 0 — Practice MCQs</h2>
              <p className="mb-6 text-sm text-slate-600">
                Test your understanding of STEDA policy, eligibility, and exam structure.
              </p>
              <div className="space-y-4">
                {/* MCQ 1 */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold text-slate-900">Q1. What is the minimum passing percentage for the STEDA Teaching License test?</p>
                  <div className="mt-3 space-y-2">
                    {["40%", "50%", "60%", "70%"].map((opt) => (
                      <div key={opt} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-500">
                          {opt[0]}
                        </span>
                        {opt}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-xs font-bold text-emerald-700">✅ Answer: B — 50%</p>
                    <p className="mt-1 text-xs text-emerald-800">The test contains 100 marks and the passing score is 50% (50 marks). Candidates who do not pass can reappear after 6 months.</p>
                  </div>
                </div>

                {/* MCQ 2 */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold text-slate-900">Q2. Which qualification is required for the Professional Teaching License (Elementary)?</p>
                  <div className="mt-3 space-y-2">
                    {[
                      "ADE (Associate Degree in Education)",
                      "B.Ed. Elementary (4 years / 2.5 years) or M.Ed.",
                      "B.Ed. Secondary (4 years / 1.5 years)",
                      "1-year B.Ed.",
                    ].map((opt, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-500">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-xs font-bold text-emerald-700">✅ Answer: B — B.Ed. Elementary (4 years / 2.5 years) or M.Ed.</p>
                    <p className="mt-1 text-xs text-emerald-800">ADE is for Primary level. B.Ed. Secondary is for Secondary level. The 1-year B.Ed. has been de-recognized by HEC.</p>
                  </div>
                </div>

                {/* MCQ 3 */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold text-slate-900">Q3. What percentage of the STEDA test is based on Pedagogical Content Knowledge?</p>
                  <div className="mt-3 space-y-2">
                    {["20%", "30%", "50%", "60%"].map((opt) => (
                      <div key={opt} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-500">
                          {opt[0]}
                        </span>
                        {opt}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-xs font-bold text-emerald-700">✅ Answer: C — 50%</p>
                    <p className="mt-1 text-xs text-emerald-800">The test is divided: 30% Content Knowledge, 20% Psychometric, and 50% Pedagogical Content Knowledge (PCK).</p>
                  </div>
                </div>

                {/* MCQ 4 */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold text-slate-900">Q4. Which organization currently administers the STEDA Teaching License test?</p>
                  <div className="mt-3 space-y-2">
                    {["NUST Testing Service", "IBA Sukkur (SIBA Testing Services)", "Pakistan Testing Service", "ETS Pakistan"].map((opt, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-500">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-xs font-bold text-emerald-700">✅ Answer: B — IBA Sukkur (SIBA Testing Services)</p>
                    <p className="mt-1 text-xs text-emerald-800">STEDA appoints a Third Party to develop and administer the test. IBA Sukkur (STS) has been conducting the Elementary license test since 2024.</p>
                  </div>
                </div>

                {/* MCQ 5 */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold text-slate-900">Q5. After failing the STEDA test, when can a candidate re-appear?</p>
                  <div className="mt-3 space-y-2">
                    {[
                      "Immediately after the result",
                      "After 3 months",
                      "After 6 months or next available test date",
                      "After 1 year",
                    ].map((opt, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-500">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-xs font-bold text-emerald-700">✅ Answer: C — After 6 months or the next available test date</p>
                    <p className="mt-1 text-xs text-emerald-800">Per STEDA policy 2.6, applicants can re-appear after at least 6 months or as per the next available test date, upon submission of a fresh license fee.</p>
                  </div>
                </div>
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

            {/* ─────────────────────────────────────────────────────────
                MODULE 1 — EDUCATIONAL PSYCHOLOGY & CHILD DEVELOPMENT
                ───────────────────────────────────────────────────────── */}

            {/* MODULE 1 HEADER */}
            <div id="module-1" className="mb-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-900 to-indigo-900 p-6 text-white sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Module 1</p>
              <h1 className="mt-2 text-2xl font-black sm:text-3xl">Educational Psychology & Child Development</h1>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Master the foundational theories of child development and learning — Piaget, Vygotsky, Bloom,
                Erikson, Skinner, Bandura, and more. This module covers ~40% of the STEDA test.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-300">~40 Marks on Test</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amber-300">High-Yield Module</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-rose-300">Theory + Application</span>
              </div>
            </div>

            {/* M1: Overview */}
            <section id="m1-overview" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">Module Overview</h2>
              <div className="prose-sm space-y-4 text-slate-700 leading-7">
                <p>
                  Educational Psychology is the scientific study of how people learn and the factors that
                  influence the learning process. For the STEDA test, you must understand key developmental
                  theories, learning paradigms, and their direct classroom applications.
                </p>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Key Takeaway</p>
                  <p className="mt-1 text-sm text-emerald-800">
                    The STEDA test does NOT just ask &quot;Who said what?&quot; — it presents <strong>classroom scenarios</strong> and
                    asks you to apply theories. You must know each theorist&apos;s ideas AND how to use them in
                    real teaching situations.
                  </p>
                </div>
                <p>This module covers:</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li><strong>Piaget</strong> — Cognitive Development (4 stages)</li>
                  <li><strong>Vygotsky</strong> — Social Constructivism (ZPD, Scaffolding)</li>
                  <li><strong>Bloom&apos;s Taxonomy</strong> — Educational Objectives (6 levels)</li>
                  <li><strong>Erikson</strong> — Psychosocial Development (8 stages)</li>
                  <li><strong>Skinner &amp; Pavlov</strong> — Behaviorism (Conditioning)</li>
                  <li><strong>Bandura</strong> — Social Learning Theory (Modeling)</li>
                  <li><strong>Individual Differences</strong> — Inclusive Education &amp; Special Needs</li>
                  <li><strong>Motivation Theories</strong> — Intrinsic vs Extrinsic</li>
                </ul>
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

            {/* M1: Piaget */}
            <section id="m1-piaget" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">Jean Piaget — Cognitive Development Theory</h2>
              <div className="prose-sm space-y-4 text-slate-700 leading-7">
                <p>
                  Jean Piaget (1896–1980) was a Swiss psychologist who proposed that children move through
                  <strong> four distinct stages of cognitive development</strong>. Each stage represents a
                  qualitatively different way of thinking. Children cannot skip stages — they must develop
                  through each one in order.
                </p>

                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Core Concept</p>
                  <p className="mt-1 text-sm text-blue-800">
                    <strong>Constructivism:</strong> Piaget believed children actively construct knowledge through
                    interaction with their environment. Knowledge is not passively received — it is built
                    through experience.
                  </p>
                </div>

                <h3 className="!mt-6 text-lg font-bold text-slate-900">The Four Stages</h3>
              </div>

              <div className="mt-4 space-y-4">
                {[
                  {
                    stage: "Sensorimotor",
                    age: "0 – 2 years",
                    color: "from-rose-500 to-pink-500",
                    key: "Object Permanence",
                    desc: "Infants learn through senses and motor actions. They discover that objects continue to exist even when hidden (Object Permanence). No language yet — learning is purely experiential.",
                    classroom: "Provide sensory-rich environments. Use peek-a-boo games. Show that hidden toys still exist.",
                  },
                  {
                    stage: "Preoperational",
                    age: "2 – 7 years",
                    color: "from-amber-500 to-orange-500",
                    key: "Egocentrism & Symbolic Thinking",
                    desc: "Children begin using language and symbols but think egocentrically (cannot see others' perspectives). They struggle with conservation (understanding that quantity stays the same despite shape changes).",
                    classroom: "Use stories, play, and visual aids. Ask children to explain their thinking. Don't expect logical reasoning yet.",
                  },
                  {
                    stage: "Concrete Operational",
                    age: "7 – 11 years",
                    color: "from-emerald-500 to-teal-500",
                    key: "Logical Thinking (Concrete)",
                    desc: "Children can think logically about concrete events. They understand conservation, classification, and seriation. They can perform operations on tangible objects but struggle with abstract/hypothetical concepts.",
                    classroom: "Use hands-on experiments, sorting activities, and real-world math problems. Introduce step-by-step problem solving.",
                  },
                  {
                    stage: "Formal Operational",
                    age: "11+ years",
                    color: "from-violet-500 to-purple-500",
                    key: "Abstract & Hypothetical Thinking",
                    desc: "Adolescents can think abstractly, use deductive reasoning, and form hypotheses. They can think about possibilities, not just realities. This is the stage of mature logical thought.",
                    classroom: "Use debates, hypothetical questions, scientific experiments, and abstract problem-solving. Encourage critical thinking.",
                  },
                ].map((s) => (
                  <div key={s.stage} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`h-2 w-16 rounded-full bg-gradient-to-r ${s.color}`} />
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{s.stage} Stage</h3>
                        <p className="text-xs text-slate-500">{s.age}</p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 mb-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Concept</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{s.key}</p>
                    </div>
                    <p className="text-sm text-slate-600">{s.desc}</p>
                    <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Classroom Application</p>
                      <p className="mt-1 text-sm text-emerald-800">{s.classroom}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Case Study */}
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">📋 Real Classroom Scenario</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  A Class 4 teacher shows a student a ball of clay, then rolls it into a snake shape. The student
                  says &quot;Now there is more clay!&quot;
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  <strong>Analysis:</strong> This student is in the <strong>Preoperational stage</strong> (2-7 years) —
                  they lack <strong>conservation</strong> understanding. The teacher should use hands-on activities
                  with different-shaped containers to help the student discover that quantity remains the same
                  regardless of shape ( Concrete Operational thinking). This is exactly the type of scenario
                  the STEDA test presents.
                </p>
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

            {/* M1: Vygotsky */}
            <section id="m1-vygotsky" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">Lev Vygotsky — Social Constructivism</h2>
              <div className="prose-sm space-y-4 text-slate-700 leading-7">
                <p>
                  Lev Vygotsky (1896–1934) was a Soviet psychologist who emphasized the <strong>social
                  dimensions of learning</strong>. Unlike Piaget, who focused on individual discovery,
                  Vygotsky argued that learning is fundamentally a social process — children learn through
                  interaction with others (peers, teachers, parents).
                </p>

                <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">Core Concept: Zone of Proximal Development (ZPD)</p>
                  <p className="mt-1 text-sm text-indigo-800">
                    The <strong>ZPD</strong> is the gap between what a learner can do <strong>independently</strong> and
                    what they can do with <strong>guidance from a more knowledgeable person</strong>. Effective
                    teaching targets the ZPD — not too easy, not too hard.
                  </p>
                </div>

                <h3 className="!mt-6 text-lg font-bold text-slate-900">Key Concepts</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <h4 className="text-sm font-bold text-slate-900">Scaffolding</h4>
                    <p className="mt-1 text-xs text-slate-600">
                      Temporary support given by teacher/peer to help a learner accomplish a task within their ZPD.
                      As the learner gains competence, the support is gradually removed (faded).
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <h4 className="text-sm font-bold text-slate-900">More Knowledgeable Other (MKO)</h4>
                    <p className="mt-1 text-xs text-slate-600">
                      Anyone who has a higher level of understanding than the learner — teacher, parent, peer, or
                      even a digital tool. The MKO provides guidance within the ZPD.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <h4 className="text-sm font-bold text-slate-900">Language & Thought</h4>
                    <p className="mt-1 text-xs text-slate-600">
                      Vygotsky saw language as the primary tool of intellectual adaptation. Private speech
                      (talking to oneself) helps children regulate their thinking and behavior.
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <h4 className="text-sm font-bold text-slate-900">Social Interaction First</h4>
                    <p className="mt-1 text-xs text-slate-600">
                      Learning happens first on the social plane (between people), then on the individual plane
                      (inside the person). &quot;What a child can do with assistance today, she will be able to do by herself tomorrow.&quot;
                    </p>
                  </div>
                </div>
              </div>

              {/* Case Study */}
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">📋 Real Classroom Scenario</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  A Class 6 student cannot solve a math word problem alone. The teacher sits with her,
                  breaks the problem into steps, and guides her through each one. After 3 sessions,
                  the student solves similar problems independently.
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  <strong>Analysis:</strong> This is a perfect example of <strong>ZPD and scaffolding</strong>.
                  The teacher identified the student&apos;s ZPD, provided structured support (MKO), and
                  gradually faded the assistance until the student achieved independence. This is the
                  essence of Vygotsky&apos;s theory applied in the classroom.
                </p>
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

            {/* M1: Bloom's Taxonomy */}
            <section id="m1-bloom" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">Bloom&apos;s Taxonomy (Revised)</h2>
              <div className="prose-sm space-y-4 text-slate-700 leading-7">
                <p>
                  Benjamin Bloom (1956) developed a hierarchy of cognitive objectives, later revised by
                  Anderson &amp; Krathwohl (2001). It classifies thinking skills from <strong>lower-order</strong>
                  (remembering) to <strong>higher-order</strong> (creating). The STEDA test frequently asks
                  questions about this framework.
                </p>
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-700">Important for STEDA</p>
                  <p className="mt-1 text-sm text-rose-800">
                    The STEDA test itself is designed using Bloom&apos;s Taxonomy. MCQs are at &quot;Easy&quot;
                    (Remembering/Understanding) and &quot;Medium&quot; (Applying/Analyzing) levels. Understanding
                    this taxonomy helps you predict question types.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {[
                  { level: "Creating", color: "from-violet-500 to-purple-600", verb: "Design, Construct, Produce", desc: "Generate new or original work. Highest order of thinking.", example: "Design a science experiment to test plant growth." },
                  { level: "Evaluating", color: "from-rose-500 to-pink-500", verb: "Judge, Critique, Assess", desc: "Make judgments based on criteria and standards.", example: "Evaluate which teaching method is most effective for this topic." },
                  { level: "Analyzing", color: "from-amber-500 to-orange-500", verb: "Compare, Organize, Deconstruct", desc: "Break information into parts and explore relationships.", example: "Compare the causes of two historical events." },
                  { level: "Applying", color: "from-emerald-500 to-teal-500", verb: "Use, Implement, Solve", desc: "Use information in new situations. Execute or implement.", example: "Use a formula to solve a math problem." },
                  { level: "Understanding", color: "from-cyan-500 to-sky-500", verb: "Explain, Summarize, Interpret", desc: "Demonstrate understanding by explaining ideas or concepts.", example: "Explain in your own words why water boils." },
                  { level: "Remembering", color: "from-slate-500 to-slate-600", verb: "Recall, List, Define", desc: "Retrieve relevant knowledge from long-term memory. Lowest order.", example: "List the planets in our solar system." },
                ].map((l) => (
                  <div key={l.level} className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className={`h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br ${l.color} flex items-center justify-center text-xs font-black text-white`}>
                      {l.level.slice(0, 3).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900">{l.level}</h3>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {l.verb}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600">{l.desc}</p>
                      <p className="mt-1 text-xs italic text-slate-500">Example: {l.example}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-600">
                <strong>Remember:</strong> Lower-order skills (Remembering, Understanding) are at the bottom.
                Higher-order skills (Evaluating, Creating) are at the top. Good lesson objectives progress
                from lower to higher levels.
              </p>
            </section>

            <hr className="my-10 border-slate-200" />

            {/* M1: Erikson */}
            <section id="m1-erikson" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">Erik Erikson — Psychosocial Development</h2>
              <div className="prose-sm space-y-4 text-slate-700 leading-7">
                <p>
                  Erik Erikson (1902–1994) proposed <strong>8 stages of psychosocial development</strong> spanning
                  the entire lifespan. Each stage involves a central conflict or crisis that must be resolved.
                  Unresolved conflicts can affect development in later stages.
                </p>
                <p>
                  For the STEDA test, focus on the stages relevant to school-age children (stages 3-5).
                </p>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-3 py-2 text-left font-bold text-slate-900">Stage</th>
                      <th className="px-3 py-2 text-left font-bold text-slate-900">Age</th>
                      <th className="px-3 py-2 text-left font-bold text-slate-900">Conflict</th>
                      <th className="px-3 py-2 text-left font-bold text-slate-900">Positive Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { stage: "1", age: "0-1", conflict: "Trust vs Mistrust", outcome: "Hope" },
                      { stage: "2", age: "1-3", conflict: "Autonomy vs Shame", outcome: "Will" },
                      { stage: "3", age: "3-6", conflict: "Initiative vs Guilt", outcome: "Purpose" },
                      { stage: "4", age: "6-12", conflict: "Industry vs Inferiority", outcome: "Competence" },
                      { stage: "5", age: "12-18", conflict: "Identity vs Role Confusion", outcome: "Fidelity" },
                      { stage: "6", age: "18-40", conflict: "Intimacy vs Isolation", outcome: "Love" },
                      { stage: "7", age: "40-65", conflict: "Generativity vs Stagnation", outcome: "Care" },
                      { stage: "8", age: "65+", conflict: "Integrity vs Despair", outcome: "Wisdom" },
                    ].map((s) => (
                      <tr key={s.stage} className={parseInt(s.stage) >= 3 && parseInt(s.stage) <= 5 ? "bg-blue-50" : ""}>
                        <td className="px-3 py-2 font-semibold text-slate-700">{s.stage}</td>
                        <td className="px-3 py-2 text-slate-600">{s.age}</td>
                        <td className="px-3 py-2 text-slate-600">{s.conflict}</td>
                        <td className="px-3 py-2 text-slate-600">{s.outcome}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-slate-500">* Rows highlighted in blue are most relevant for school-age children (STEDA test focus).</p>

              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700">STEDA Test Tip</p>
                <p className="mt-1 text-sm text-blue-800">
                  Stage 4 (<strong>Industry vs Inferiority, ages 6-12</strong>) is the most tested — this is
                  when children develop a sense of competence through academic and social achievements.
                  A child who fails repeatedly may develop inferiority. Teachers play a critical role in
                  building industry through encouragement and appropriate challenges.
                </p>
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

            {/* M1: Behaviorism */}
            <section id="m1-behaviorism" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">Behaviorism — Skinner &amp; Pavlov</h2>
              <div className="prose-sm space-y-4 text-slate-700 leading-7">
                <p>
                  Behaviorism is a learning theory that focuses on <strong>observable behaviors</strong> and
                  how they are shaped by environmental stimuli. It ignores internal mental processes —
                  learning is simply a change in behavior due to experience.
                </p>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900">Ivan Pavlov — Classical Conditioning</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Learning through <strong>association</strong>. A neutral stimulus becomes associated with
                    a natural response until the neutral stimulus alone triggers the response.
                  </p>
                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                    <strong>Example:</strong> A teacher always rings a bell before starting a quiz. After
                    several weeks, the bell alone makes students feel alert and ready — even before the
                    quiz appears.
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-slate-500">
                    <p><strong>UCS:</strong> Quiz → <strong>UCR:</strong> Alertness</p>
                    <p><strong>CS:</strong> Bell → <strong>CR:</strong> Alertness (learned)</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900">B.F. Skinner — Operant Conditioning</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Learning through <strong>consequences</strong>. Behavior followed by positive consequences
                    is repeated; behavior followed by negative consequences is avoided.
                  </p>
                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                    <strong>Key terms:</strong>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-slate-600">
                    <p><strong>Positive Reinforcement:</strong> Adding something pleasant (praise, reward)</p>
                    <p><strong>Negative Reinforcement:</strong> Removing something unpleasant (skip homework)</p>
                    <p><strong>Positive Punishment:</strong> Adding something unpleasant (extra work)</p>
                    <p><strong>Negative Punishment:</strong> Removing something pleasant (no recess)</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">STEDA Test Tip</p>
                <p className="mt-1 text-sm text-amber-800">
                  Questions often ask you to <strong>classify scenarios</strong> as reinforcement or punishment,
                  positive or negative. Remember: <strong>&quot;Positive&quot; = adding</strong>, <strong>&quot;Negative&quot; = removing</strong>.
                  Reinforcement increases behavior; punishment decreases it.
                </p>
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

            {/* M1: Bandura */}
            <section id="m1-bandura" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">Albert Bandura — Social Learning Theory</h2>
              <div className="prose-sm space-y-4 text-slate-700 leading-7">
                <p>
                  Albert Bandura (1925–2021) bridged behaviorism and cognitive psychology. His
                  <strong> Social Learning Theory</strong> (later Social Cognitive Theory) states that people
                  learn by <strong>observing others</strong> (models) and imitating their behavior.
                </p>
                <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-violet-700">Core Concept</p>
                  <p className="mt-1 text-sm text-violet-800">
                    <strong>Modeling:</strong> Children learn behaviors by watching parents, teachers, peers,
                    and media figures. The famous <strong>Bobo Doll Experiment</strong> showed that children
                    who observed an adult behaving aggressively toward a doll replicated the same behavior.
                  </p>
                </div>

                <h3 className="!mt-4 text-lg font-bold text-slate-900">Four Processes of Observational Learning</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { name: "Attention", desc: "The learner must notice and focus on the model's behavior." },
                    { name: "Retention", desc: "The learner must remember the observed behavior (store in memory)." },
                    { name: "Reproduction", desc: "The learner must be able to physically reproduce the behavior." },
                    { name: "Motivation", desc: "The learner must have a reason to imitate (reinforcement or desire)." },
                  ].map((p) => (
                    <div key={p.name} className="rounded-xl border border-slate-200 bg-white p-3">
                      <h4 className="text-sm font-bold text-slate-900">{p.name}</h4>
                      <p className="mt-1 text-xs text-slate-600">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Case Study */}
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">📋 Real Classroom Scenario</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  A teacher notices that when she greets students warmly every morning, students start
                  greeting each other politely. When she models patience during difficult tasks, students
                  also become more patient.
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  <strong>Analysis:</strong> This demonstrates <strong>Bandura&apos;s Social Learning Theory</strong>.
                  The teacher serves as a <strong>model</strong>. Students pay <strong>attention</strong> to her behavior,
                  <strong> retain</strong> it in memory, and <strong>reproduce</strong> it because they are
                  <strong> motivated</strong> by the positive classroom atmosphere. The teacher&apos;s behavior
                  has been reinforced through students&apos; positive responses.
                </p>
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

            {/* M1: Individual Differences */}
            <section id="m1-individual-diff" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">Individual Differences &amp; Inclusive Education</h2>
              <div className="prose-sm space-y-4 text-slate-700 leading-7">
                <p>
                  Every student is unique. <strong>Individual differences</strong> refer to the variations
                  among learners in terms of physical, mental, emotional, and social characteristics.
                  Teachers must recognize and accommodate these differences.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <h4 className="text-sm font-bold text-slate-900">Types of Individual Differences</h4>
                    <ul className="mt-2 space-y-1 text-xs text-slate-600">
                      <li>• Intelligence (IQ levels)</li>
                      <li>• Learning styles (Visual, Auditory, Kinesthetic)</li>
                      <li>• Physical abilities & disabilities</li>
                      <li>• Socio-economic background</li>
                      <li>• Cultural & linguistic diversity</li>
                      <li>• Motivation & interests</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <h4 className="text-sm font-bold text-slate-900">Special Learning Needs</h4>
                    <ul className="mt-2 space-y-1 text-xs text-slate-600">
                      <li>• <strong>Dyslexia:</strong> Difficulty with reading and language processing</li>
                      <li>• <strong>Dyscalculia:</strong> Difficulty with math and number concepts</li>
                      <li>• <strong>ADHD:</strong> Difficulty with attention, hyperactivity, impulsivity</li>
                      <li>• <strong>Autism Spectrum:</strong> Challenges with social communication</li>
                    </ul>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Inclusive Education Principles</p>
                  <ul className="mt-2 space-y-1 text-sm text-emerald-800">
                    <li>• Every child has the right to learn in a mainstream classroom</li>
                    <li>• Differentiated instruction adapts teaching to diverse learners</li>
                    <li>• Accommodations (extra time, modified tests) are not special treatment — they are equity</li>
                    <li>• Peer tutoring and cooperative learning benefit ALL students</li>
                    <li>• A positive, accepting classroom culture is the foundation of inclusion</li>
                  </ul>
                </div>
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

            {/* M1: Motivation */}
            <section id="m1-motivation" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">Motivation Theories</h2>
              <div className="prose-sm space-y-4 text-slate-700 leading-7">
                <p>
                  Motivation is the internal drive that initiates, guides, and maintains goal-oriented behavior.
                  Understanding motivation is critical for effective teaching.
                </p>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900">Intrinsic Motivation</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Doing something because it is <strong>inherently interesting or enjoyable</strong>.
                    The reward comes from within.
                  </p>
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                    <strong>Examples:</strong> Reading for pleasure, solving puzzles for fun, exploring
                    a topic out of curiosity, helping others because it feels good.
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900">Extrinsic Motivation</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Doing something for an <strong>external reward or to avoid punishment</strong>.
                    The motivation comes from outside.
                  </p>
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                    <strong>Examples:</strong> Studying to get good grades, working to earn money,
                    avoiding homework to escape scolding.
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Maslow&apos;s Hierarchy of Needs</p>
                <p className="mt-1 text-sm text-blue-800">
                  Abraham Maslow proposed that <strong>basic needs must be met before higher learning</strong> can
                  occur. A hungry, unsafe, or unloved child cannot focus on academics. Teachers must first
                  ensure students feel safe, fed, and valued.
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {["Self-Actualization", "Esteem", "Love & Belonging", "Safety", "Physiological"].map((n, i) => (
                    <span key={n} className={`rounded-full px-2.5 py-1 text-[10px] font-bold text-white ${i === 0 ? "bg-violet-500" : i === 1 ? "bg-blue-500" : i === 2 ? "bg-emerald-500" : i === 3 ? "bg-amber-500" : "bg-rose-500"}`}>
                      {n}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-blue-700">↑ Higher needs (top) require lower needs (bottom) to be satisfied first.</p>
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

            {/* M1: Practice MCQs */}
            <section id="m1-mcq" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">Module 1 — Practice MCQs</h2>
              <p className="mb-6 text-sm text-slate-600">
                Apply your knowledge of Educational Psychology and Child Development.
              </p>
              <div className="space-y-4">
                {/* MCQ 1 */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold text-slate-900">Q1. According to Piaget, a 5-year-old child who cannot understand that the amount of water remains the same when poured into a taller glass is in which stage?</p>
                  <div className="mt-3 space-y-2">
                    {["Sensorimotor Stage", "Preoperational Stage", "Concrete Operational Stage", "Formal Operational Stage"].map((opt, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-500">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-xs font-bold text-emerald-700">✅ Answer: B — Preoperational Stage (2-7 years)</p>
                    <p className="mt-1 text-xs text-emerald-800">Lack of conservation is a hallmark of the Preoperational stage. Children in this stage focus on one dimension (height) and cannot mentally reverse the operation. A 5-year-old falls squarely in this range.</p>
                  </div>
                </div>

                {/* MCQ 2 */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold text-slate-900">Q2. A teacher gives hints and prompts to help a student solve a problem the student could not solve alone. After several sessions, the student solves it independently. This best illustrates:</p>
                  <div className="mt-3 space-y-2">
                    {["Classical Conditioning", "Zone of Proximal Development (ZPD)", "Operant Conditioning", "Bloom's Taxonomy"].map((opt, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-500">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-xs font-bold text-emerald-700">✅ Answer: B — Zone of Proximal Development (ZPD)</p>
                    <p className="mt-1 text-xs text-emerald-800">This is Vygotsky's ZPD in action — the student can't do it alone but CAN do it with guidance (scaffolding). The teacher acts as the More Knowledgeable Other (MKO) and fades support as competence grows.</p>
                  </div>
                </div>

                {/* MCQ 3 */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold text-slate-900">Q3. A student who always receives praise from the teacher for completing homework on time is most likely motivated by:</p>
                  <div className="mt-3 space-y-2">
                    {["Intrinsic motivation", "Positive reinforcement (extrinsic)", "Negative reinforcement", "Classical conditioning"].map((opt, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-500">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-xs font-bold text-emerald-700">✅ Answer: B — Positive reinforcement (extrinsic)</p>
                    <p className="mt-1 text-xs text-emerald-800">Praise is an external reward (extrinsic motivation). It is "positive" because something pleasant is ADDED. This is Skinner's operant conditioning — behavior followed by positive reinforcement is likely to be repeated.</p>
                  </div>
                </div>

                {/* MCQ 4 */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold text-slate-900">Q4. In Bloom's Taxonomy, which level is the HIGHEST?</p>
                  <div className="mt-3 space-y-2">
                    {["Analyzing", "Evaluating", "Creating", "Applying"].map((opt, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-500">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-xs font-bold text-emerald-700">✅ Answer: C — Creating</p>
                    <p className="mt-1 text-xs text-emerald-800">In the Revised Bloom's Taxonomy (Anderson & Krathwohl, 2001), Creating is the highest cognitive level. It involves generating new ideas, products, or ways of thinking. The hierarchy from lowest to highest: Remember → Understand → Apply → Analyze → Evaluate → Create.</p>
                  </div>
                </div>

                {/* MCQ 5 */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold text-slate-900">Q5. A Class 3 student stops trying in class after being told &quot;You&apos;ll never be good at math.&quot; According to Erikson, this experience most directly affects:</p>
                  <div className="mt-3 space-y-2">
                    {[
                      "Trust vs Mistrust",
                      "Initiative vs Guilt",
                      "Industry vs Inferiority",
                      "Identity vs Role Confusion",
                    ].map((opt, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-500">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-xs font-bold text-emerald-700">✅ Answer: C — Industry vs Inferiority (ages 6-12)</p>
                    <p className="mt-1 text-xs text-emerald-800">A Class 3 student (age ~8) is in Erikson's Stage 4: Industry vs Inferiority. Negative comments create feelings of inferiority and destroy the child's sense of competence. Teachers must foster industry through encouragement and achievable challenges.</p>
                  </div>
                </div>
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

                        {/* ═══════════════════════════════════════════════════
                MODULE 4 — STBB CORE SUBJECT MASTERY
                ═══════════════════════════════════════════════════ */}

            <div id="module-4" className="mb-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-900 to-teal-900 p-6 text-white sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Module 4</p>
              <h1 className="mt-2 text-2xl font-black sm:text-3xl">STBB Core Subject Mastery</h1>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Content Knowledge from the Sindh Textbook Board (STBB) curriculum — Class 1 to 8.
                This module covers the 30% of the STEDA test based on Mathematics, Science, English,
                and Social Studies fundamentals.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-300">30% Content Knowledge</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amber-300">STBB Class 1-8</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-rose-300">Easy + Medium MCQs</span>
              </div>
            </div>

            <section id="m4-overview" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">Module Overview</h2>
              <div className="prose-sm space-y-4 text-slate-700 leading-7">
                <p>
                  Part I of the STEDA test is based on <strong>Content Knowledge</strong> (30% of total marks).
                  Questions are drawn from the STBB school curriculum — Class 1 to 8 — covering
                  Mathematics, Science, Social Studies, English, and Urdu/Sindhi.
                </p>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Key Takeaway</p>
                  <p className="mt-1 text-sm text-emerald-800">
                    These questions are at <strong>Easy and Medium difficulty</strong> levels, testing
                    <strong> understanding, application, and analysis</strong> per Bloom&apos;s Taxonomy.
                    You don&apos;t need university-level knowledge — you need solid grasp of school-level concepts.
                  </p>
                </div>
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

            <section id="m4-math" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">Mathematics — Class 1 to 8</h2>
              <div className="space-y-4">
                {[
                  { grade: "Class 1-3", color: "from-emerald-500 to-teal-500", topics: [
                    { name: "Number Sense", desc: "Counting 1-1000, place value (ones, tens, hundreds), comparing numbers." },
                    { name: "Addition & Subtraction", desc: "Single and double digit, with/without carrying, word problems." },
                    { name: "Basic Shapes", desc: "Circle, square, rectangle, triangle. Identifying in real life." },
                    { name: "Patterns", desc: "Growing/shrinking patterns, repeating patterns (AB, ABB, ABC)." },
                    { name: "Measurement", desc: "Length (longer/shorter), weight (heavier/lighter), time (o'clock)." },
                  ]},
                  { grade: "Class 4-5", color: "from-cyan-500 to-sky-500", topics: [
                    { name: "Large Numbers", desc: "Reading/writing up to 100,000. Roman numerals. Rounding." },
                    { name: "Operations", desc: "Multi-digit multiplication, long division, BODMAS intro." },
                    { name: "Fractions", desc: "Proper/improper/mixed numbers. Equivalent fractions." },
                    { name: "Decimals", desc: "Tenths and hundredths. Converting fractions to decimals." },
                    { name: "Geometry", desc: "Perimeter and area of rectangles/squares. Angles basics." },
                    { name: "Data Handling", desc: "Bar graphs, pictographs, tables. Reading and interpreting data." },
                  ]},
                  { grade: "Class 6-8", color: "from-blue-500 to-indigo-500", topics: [
                    { name: "Integers", desc: "Positive/negative numbers. Operations on number line." },
                    { name: "Algebra", desc: "Variables, expressions, simple equations. Word problems." },
                    { name: "Ratio & Proportion", desc: "Unitary method. Direct/inverse proportion. Percentage." },
                    { name: "Geometry", desc: "Triangles, circles (radius, diameter, circumference). Area." },
                    { name: "Mensuration", desc: "Surface area and volume of cube, cuboid." },
                    { name: "Statistics", desc: "Mean, median, mode. Histograms. Probability basics." },
                  ]},
                ].map((g) => (
                  <div key={g.grade} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`h-2 w-16 rounded-full bg-gradient-to-r ${g.color}`} />
                      <h3 className="text-base font-bold text-slate-900">{g.grade}</h3>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {g.topics.map((t) => (
                        <div key={t.name} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <p className="text-sm font-bold text-slate-900">{t.name}</p>
                          <p className="mt-1 text-xs text-slate-600">{t.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

            <section id="m4-science" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">Science — Class 1 to 8</h2>
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900">Life Science</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {[
                      { name: "Plants & Animals", desc: "Parts of plants, photosynthesis basics, herbivore/carnivore/omnivore, habitats." },
                      { name: "Human Body", desc: "Skeleton, muscles, digestive, respiratory, circulatory system basics." },
                      { name: "Cells", desc: "Plant vs animal cells, organelles (nucleus, membrane, cytoplasm)." },
                      { name: "Ecosystems", desc: "Food chains, food webs, producers/consumers/decomposers." },
                      { name: "Heredity", desc: "Genes, traits, dominant/recessive, Punnett square basics." },
                      { name: "Health & Hygiene", desc: "Communicable vs non-communicable diseases, nutrition, vaccination." },
                    ].map((t) => (
                      <div key={t.name} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-sm font-bold text-slate-900">{t.name}</p>
                        <p className="mt-1 text-xs text-slate-600">{t.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900">Physical Science</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {[
                      { name: "States of Matter", desc: "Solid, liquid, gas. Melting, evaporation, condensation." },
                      { name: "Forces & Motion", desc: "Push/pull, friction, gravity, speed, simple machines." },
                      { name: "Energy", desc: "Kinetic/potential, heat transfer (conduction, convection, radiation)." },
                      { name: "Light & Sound", desc: "Reflection, refraction, shadows, vibration, pitch and volume." },
                      { name: "Chemistry Basics", desc: "Mixtures vs compounds, atoms and molecules intro." },
                      { name: "Electricity", desc: "Conductors/insulators, circuits, Ohm's law intro." },
                    ].map((t) => (
                      <div key={t.name} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-sm font-bold text-slate-900">{t.name}</p>
                        <p className="mt-1 text-xs text-slate-600">{t.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900">Earth Science</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {[
                      { name: "Solar System", desc: "Sun, planets, moon phases, day/night, seasons, eclipses." },
                      { name: "Rocks & Minerals", desc: "Igneous, sedimentary, metamorphic. Rock cycle." },
                      { name: "Weather & Climate", desc: "Temperature, humidity, wind, precipitation, climate zones." },
                      { name: "Natural Resources", desc: "Renewable vs non-renewable. Water cycle. Conservation." },
                    ].map((t) => (
                      <div key={t.name} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-sm font-bold text-slate-900">{t.name}</p>
                        <p className="mt-1 text-xs text-slate-600">{t.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

            <section id="m4-english" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">English — Class 1 to 8</h2>
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900">Grammar Fundamentals</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {[
                      { name: "Parts of Speech", desc: "Noun, pronoun, verb, adjective, adverb, preposition, conjunction." },
                      { name: "Tenses", desc: "Present/past/future simple and continuous. Signal words." },
                      { name: "Sentences", desc: "Types: declarative, interrogative, imperative, exclamatory." },
                      { name: "Active & Passive Voice", desc: "Converting between active and passive voice." },
                      { name: "Direct & Indirect Speech", desc: "Converting speech. Pronoun/tense/time changes." },
                      { name: "Punctuation", desc: "Full stop, comma, question mark, apostrophe, quotation marks." },
                    ].map((t) => (
                      <div key={t.name} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-sm font-bold text-slate-900">{t.name}</p>
                        <p className="mt-1 text-xs text-slate-600">{t.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900">Reading & Writing Skills</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {[
                      { name: "Comprehension", desc: "Main idea, supporting details, inference, vocabulary in context." },
                      { name: "Vocabulary", desc: "Synonyms, antonyms, homophones, prefixes/suffixes, context clues." },
                      { name: "Paragraph Writing", desc: "Topic sentence, supporting details, concluding sentence." },
                      { name: "Letter Writing", desc: "Formal vs informal letters. Format and structure." },
                      { name: "Essay Writing", desc: "Narrative, descriptive, expository, persuasive essays." },
                      { name: "Story Writing", desc: "Characters, setting, plot, dialogue, resolution." },
                    ].map((t) => (
                      <div key={t.name} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-sm font-bold text-slate-900">{t.name}</p>
                        <p className="mt-1 text-xs text-slate-600">{t.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

            <section id="m4-social" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">Social Studies — Class 1 to 8</h2>
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900">Pakistan Studies</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {[
                      { name: "Geography", desc: "Provinces, rivers (Indus system), mountains, climate, natural resources." },
                      { name: "History", desc: "Pakistan Movement, Muslim League, Quaid-e-Azam, Resolution 1940, 1947." },
                      { name: "Government & Civics", desc: "Three branches, constitution, fundamental rights, democracy." },
                      { name: "Culture & Heritage", desc: "Festivals, languages, dances, monuments (Moenjodaro, Badshahi Mosque)." },
                    ].map((t) => (
                      <div key={t.name} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-sm font-bold text-slate-900">{t.name}</p>
                        <p className="mt-1 text-xs text-slate-600">{t.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900">Civics & Community</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {[
                      { name: "Rights & Responsibilities", desc: "Constitutional rights. Citizen duties — voting, obeying law." },
                      { name: "Map Skills", desc: "Cardinal directions, compass rose, map symbols, scale." },
                      { name: "Community Helpers", desc: "Roles of teacher, doctor, police, farmer, soldier." },
                      { name: "Global Awareness", desc: "UN, SAARC, neighboring countries, environmental issues." },
                    ].map((t) => (
                      <div key={t.name} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-sm font-bold text-slate-900">{t.name}</p>
                        <p className="mt-1 text-xs text-slate-600">{t.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

            <section id="m4-mcq" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">Module 4 — Practice MCQs</h2>
              <div className="space-y-4">
                {[
                  { q: "Q1. What is the place value of 5 in 7,532?", opts: ["5", "50", "500", "5,000"], ans: "C — 500", exp: "In 7,532: 7=thousands, 5=hundreds (500), 3=tens, 2=ones." },
                  { q: "Q2. Which process converts water vapor into liquid water?", opts: ["Evaporation", "Condensation", "Transpiration", "Sublimation"], ans: "B — Condensation", exp: "Condensation: gas cools to liquid. Evaporation is the opposite (liquid to gas)." },
                  { q: "Q3. Which sentence is in PASSIVE voice?", opts: ["The teacher explained the lesson.", "The lesson was explained by the teacher.", "The teacher is explaining.", "The teacher will explain."], ans: "B — The lesson was explained by the teacher.", exp: "Passive voice: object comes first + was/were/is + past participle + by + agent." },
                  { q: "Q4. Which river flows through Sindh province?", opts: ["Jhelum", "Chenab", "Indus", "Ravi"], ans: "C — Indus", exp: "The Indus River (Darya-e-Sindh) is the main river flowing through Sindh province." },
                  { q: "Q5. The powerhouse of the cell is:", opts: ["Nucleus", "Ribosome", "Mitochondria", "Cell membrane"], ans: "C — Mitochondria", exp: "Mitochondria produce energy (ATP) through cellular respiration — hence called the powerhouse." },
                ].map((mcq, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-bold text-slate-900">{mcq.q}</p>
                    <div className="mt-3 space-y-2">
                      {mcq.opts.map((opt, j) => (
                        <div key={j} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-500">{String.fromCharCode(65+j)}</span>
                          {opt}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                      <p className="text-xs font-bold text-emerald-700">✅ Answer: {mcq.ans}</p>
                      <p className="mt-1 text-xs text-emerald-800">{mcq.exp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

            {/* ═══════════════════════════════════════════════════
                MODULE 5 — ICT & AI TOOLS FOR EDUCATORS
                ═══════════════════════════════════════════════════ */}

            <div id="module-5" className="mb-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-violet-900 to-purple-900 p-6 text-white sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-400">Module 5</p>
              <h1 className="mt-2 text-2xl font-black sm:text-3xl">ICT &amp; AI Tools for Educators</h1>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Information and Communication Technology in education — digital tools, AI assistants,
                and modern teaching technology. The STEDA syllabus explicitly lists ICT as a tested topic.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-violet-300">~10 Marks on Test</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-300">Practical Knowledge</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amber-300">HEC B.Ed. Curriculum</span>
              </div>
            </div>

            <section id="m5-overview" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">Module Overview</h2>
              <div className="prose-sm space-y-4 text-slate-700 leading-7">
                <p>
                  ICT in education is about using technology to <strong>enhance teaching and learning</strong>,
                  not replace the teacher. The STEDA test focuses on practical knowledge — when and how to
                  use technology effectively in the classroom.
                </p>
                <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-violet-700">Key Takeaway</p>
                  <p className="mt-1 text-sm text-violet-800">
                    Technology is a <strong>tool</strong>, not a replacement. The best ICT integration
                    supports learning goals, engages students, and makes teaching more efficient —
                    it doesn&apos;t add complexity for its own sake.
                  </p>
                </div>
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

            <section id="m5-ict-basics" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">ICT in Education — Fundamentals</h2>
              <div className="space-y-4">
                {[
                  { name: "What is ICT in Education?", items: [
                    "Using computers, tablets, projectors, internet, and software to support teaching and learning.",
                    "Includes: presentation tools, learning management systems, digital assessments, online resources.",
                    "Goal: make learning interactive, accessible, and efficient — not just digitize lectures.",
                  ]},
                  { name: "Benefits of ICT in Teaching", items: [
                    "Visual learning — videos, animations, simulations make abstract concepts concrete.",
                    "Interactive learning — quizzes, polls, games increase engagement.",
                    "Accessibility — digital resources available anytime, anywhere.",
                    "Efficiency — automated grading, instant feedback, easy content sharing.",
                    "Collaboration — shared documents, online discussions, peer review.",
                  ]},
                  { name: "Challenges of ICT in Teaching", items: [
                    "Infrastructure — unreliable electricity, limited internet in rural Sindh.",
                    "Digital divide — not all students have access to devices at home.",
                    "Teacher training — many teachers need professional development in ICT.",
                    "Distraction — students may misuse devices (games, social media).",
                    "Cost — hardware, software, and maintenance require funding.",
                  ]},
                ].map((s) => (
                  <div key={s.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900">{s.name}</h3>
                    <ul className="mt-3 space-y-2">
                      {s.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="mt-0.5 text-emerald-500">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

            <section id="m5-digital-tools" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">Digital Teaching Tools</h2>
              <div className="space-y-4">
                {[
                  { category: "Presentation & Delivery", tools: [
                    { name: "PowerPoint / Google Slides", use: "Create visual presentations with images, animations, and embedded videos." },
                    { name: "Canva for Education", use: "Design infographics, worksheets, posters, and classroom materials." },
                    { name: "Kahoot! / Quizizz", use: "Create interactive quizzes students answer in real-time on their devices." },
                    { name: "Nearpod", use: "Interactive lessons with polls, quizzes, VR field trips, and collaborative boards." },
                  ]},
                  { category: "Assessment & Feedback", tools: [
                    { name: "Google Forms", use: "Create quizzes with auto-grading. Collect responses instantly." },
                    { name: "Quizlet", use: "Flashcards, matching games, and practice tests for any subject." },
                    { name: "Socrative", use: "Real-time assessments, exit tickets, and space races for formative assessment." },
                    { name: "Edmodo / Google Classroom", use: "Learning management — assign work, grade, give feedback, communicate." },
                  ]},
                  { category: "Collaboration & Communication", tools: [
                    { name: "Google Workspace", use: "Shared docs, slides, sheets for group projects and peer collaboration." },
                    { name: "Padlet", use: "Digital bulletin board for brainstorming, sharing ideas, and displaying work." },
                    { name: "Flipgrid / Flip", use: "Students record short video responses — great for speaking and listening skills." },
                    { name: "Zoom / Google Meet", use: "Virtual classes, parent-teacher meetings, and guest speaker sessions." },
                  ]},
                ].map((cat) => (
                  <div key={cat.category} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900">{cat.category}</h3>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {cat.tools.map((t) => (
                        <div key={t.name} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <p className="text-sm font-bold text-slate-900">{t.name}</p>
                          <p className="mt-1 text-xs text-slate-600">{t.use}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

            <section id="m5-ai-education" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">AI in Education</h2>
              <div className="prose-sm space-y-4 text-slate-700 leading-7">
                <p>
                  Artificial Intelligence is transforming education. The STEDA syllabus now includes
                  AI awareness for teachers — understanding how AI tools can support (not replace) teaching.
                </p>
              </div>
              <div className="mt-4 space-y-4">
                {[
                  { name: "AI for Lesson Planning", desc: "AI assistants can generate lesson plans, worksheets, and activity ideas. Teachers review and adapt — AI drafts, human decides.", tools: "ChatGPT, Claude, Gemini" },
                  { name: "AI for Assessment", desc: "AI can create MCQs, rubrics, and formative assessments aligned to learning objectives. Auto-grading saves hours.", tools: "ChatGPT, Quillionz, Quizizz AI" },
                  { name: "AI for Differentiation", desc: "AI can generate the same content at different difficulty levels for diverse learners in the same class.", tools: "ChatGPT, Diffit, Curipod" },
                  { name: "AI for Student Support", desc: "AI chatbots can answer student questions 24/7, provide practice problems, and explain concepts in multiple ways.", tools: "Khanmigo, Photomath, ChatGPT" },
                  { name: "AI for Accessibility", desc: "Text-to-speech, speech-to-text, translation, and image description tools help students with disabilities.", tools: "Google Translate, NaturalReader, Seeing AI" },
                ].map((s) => (
                  <div key={s.name} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900">{s.name}</p>
                        <p className="mt-1 text-xs text-slate-600">{s.desc}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-bold text-violet-700">
                        {s.tools}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Important Reminder</p>
                <p className="mt-1 text-sm text-amber-800">
                  AI is a <strong>tool</strong>, not a replacement for the teacher. The teacher&apos;s role in
                  planning, assessment, and relationship-building remains irreplaceable. AI assists — the
                  teacher decides.
                </p>
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

            <section id="m5-mcq" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">Module 5 — Practice MCQs</h2>
              <div className="space-y-4">
                {[
                  { q: "Q1. Which tool is BEST for creating interactive real-time quizzes that students answer on their phones?", opts: ["Microsoft Word", "Kahoot!", "Notepad", "Calculator"], ans: "B — Kahoot!", exp: "Kahoot! is specifically designed for real-time interactive quizzes. Students join with a code and answer on their devices." },
                  { q: "Q2. A teacher uses AI to generate three versions of the same worksheet at different difficulty levels. This is an example of:", opts: ["Digital assessment", "Differentiated instruction using AI", "Virtual learning", "E-learning"], ans: "B — Differentiated instruction using AI", exp: "The teacher is using AI to adapt content for diverse learners — this is differentiated instruction facilitated by technology." },
                  { q: "Q3. Google Classroom is primarily used for:", opts: ["Playing games", "Learning Management — assigning, grading, communicating", "Watching videos only", "Social media"], ans: "B — Learning Management", exp: "Google Classroom is a Learning Management System (LMS) that helps teachers assign work, grade, give feedback, and communicate with students." },
                  { q: "Q4. What is the biggest CHALLENGE of using ICT in rural Sindh schools?", opts: ["Too much technology", "Unreliable electricity and limited internet", "Students know too much", "Teachers are overtrained"], ans: "B — Unreliable electricity and limited internet", exp: "Infrastructure challenges — electricity outages and limited internet connectivity — are the primary barriers to ICT integration in rural Sindh." },
                  { q: "Q5. The role of the teacher when using AI tools in education is to:", opts: ["Let AI do everything automatically", "Review AI output and make pedagogical decisions", "Stop teaching and let students use AI alone", "Avoid AI completely"], ans: "B — Review AI output and make pedagogical decisions", exp: "AI generates drafts and suggestions, but the teacher must review, adapt, and decide what is pedagogically appropriate. AI assists — the teacher decides." },
                ].map((mcq, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-bold text-slate-900">{mcq.q}</p>
                    <div className="mt-3 space-y-2">
                      {mcq.opts.map((opt, j) => (
                        <div key={j} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-500">{String.fromCharCode(65+j)}</span>
                          {opt}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                      <p className="text-xs font-bold text-emerald-700">✅ Answer: {mcq.ans}</p>
                      <p className="mt-1 text-xs text-emerald-800">{mcq.exp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

            {/* ═══════════════════════════════════════════════════
                MODULE 6 — PRACTICE QUIZZES & MOCK TESTS
                ═══════════════════════════════════════════════════ */}

            <div id="module-6" className="mb-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-rose-900 to-pink-900 p-6 text-white sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400">Module 6</p>
              <h1 className="mt-2 text-2xl font-black sm:text-3xl">Practice Quizzes &amp; Mock Tests</h1>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Put your knowledge to the test with topic-wise MCQ banks and a full 100-MCQ mock test
                that simulates the real STEDA examination experience.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-rose-300">Self-Assessment</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amber-300">100 MCQs</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-300">Timed Mode</span>
              </div>
            </div>

            <section id="m6-overview" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">Module Overview</h2>
              <div className="prose-sm space-y-4 text-slate-700 leading-7">
                <p>
                  Research shows that <strong>retrieval practice</strong> (testing yourself) is one of the most
                  effective study strategies. Module 6 helps you practice in two ways:
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm font-bold text-emerald-900">Topic-Wise Practice</p>
                    <p className="mt-1 text-xs text-emerald-800">
                      Focus on specific weak areas — Piaget, Bloom, Classroom Management, or Content Knowledge.
                      Targeted practice builds mastery in each topic.
                    </p>
                  </div>
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm font-bold text-blue-900">Full Mock Test</p>
                    <p className="mt-1 text-xs text-blue-800">
                      Simulate the real STEDA test — 100 MCQs, 2 hours, all topics mixed.
                      Build stamina, time management, and exam-day confidence.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

            <section id="m6-mock-test" className="mb-10">
              <h2 className="mb-4 text-xl font-black text-slate-900 sm:text-2xl">100-MCQ Full Mock Test — Study Plan</h2>
              <div className="prose-sm space-y-4 text-slate-700 leading-7">
                <p>
                  Here is a recommended study plan for taking the full mock test and tracking your progress:
                </p>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { week: "Week 1", focus: "Pedagogy & Teaching Methods", mcqs: "25 MCQs", color: "bg-emerald-100 text-emerald-700" },
                  { week: "Week 2", focus: "Child Development & Psychology", mcqs: "25 MCQs", color: "bg-blue-100 text-blue-700" },
                  { week: "Week 3", focus: "Content Knowledge (Math, Science, English, Social Studies)", mcqs: "25 MCQs", color: "bg-violet-100 text-violet-700" },
                  { week: "Week 4", focus: "Classroom Management + ICT + Full Revision", mcqs: "25 MCQs", color: "bg-amber-100 text-amber-700" },
                  { week: "Final", focus: "Full 100-MCQ Mock Test (Timed — 2 hours)", mcqs: "100 MCQs", color: "bg-rose-100 text-rose-700" },
                ].map((w) => (
                  <div key={w.week} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <span className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold ${w.color}`}>{w.week}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900">{w.focus}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{w.mcqs}</span>
                  </div>
                ))}
              </div>
            </section>

            <hr className="my-10 border-slate-200" />

            {/* Bottom CTA */}
            <div className="mt-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-center sm:p-8">
              <h2 className="text-xl font-black text-white sm:text-2xl">All Modules Complete — Start Practicing!</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300">
                You&apos;ve covered all 7 modules. Now test yourself daily with the interactive quiz module
                and track your progress.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="#module-0"
                  className="rounded-2xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600"
                >
                  ↑ Back to Top
                </Link>
                <Link
                  href="/teaching-license"
                  className="rounded-2xl border border-slate-600 bg-transparent px-6 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-400 hover:text-white"
                >
                  Back to Overview
                </Link>
              </div>
            </div>


          </HubLayout>
  );
}
