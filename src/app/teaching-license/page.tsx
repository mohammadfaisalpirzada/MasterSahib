import type { Metadata } from "next";
import Link from "next/link";

/* ─────────────────────────────────────────────────────
   SEO Metadata — targets Google searches for:
   "Sindh Teaching License", "STEDA License",
   "Teaching License Sindh", "Sindh Teacher License Exam",
   "Teaching Learning License", "STEDA Exam Preparation"
   ───────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: "Sindh Teaching License (STEDA) | Study Guide & Exam Preparation 2026",
  description:
    "Independent study guide for the Sindh Teaching License (STEDA) examination — eligibility, exam pattern, syllabus, preparation tips, and practice resources for teachers in Sindh.",
  keywords: [
    "Sindh Teaching License",
    "STEDA License",
    "Teaching License Sindh",
    "Sindh Teacher License Exam",
    "Teaching Learning License",
    "Sindh Education Department License",
    "STEDA Examination",
    "Sindh teacher license apply",
    "Sindh teaching license 2026",
    "teacher license test Sindh",
    "Sindh PTI license",
    "teaching certificate Sindh",
  ],
  openGraph: {
    title: "Sindh Teaching License (STEDA) | Complete Guide 2026",
    description:
      "Independent study guide for the Sindh Teaching License (STEDA) examination — eligibility, syllabus, exam pattern, preparation, and application process.",
    url: "https://themastersahib.com/teaching-license",
    siteName: "TheMasterSahib",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/images/main_logo.png",
        width: 512,
        height: 512,
        alt: "STEDA Teaching License Study Guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sindh Teaching License (STEDA) | Study Guide & Preparation 2026",
    description:
      "Independent study guide for the STEDA Teaching License — eligibility, syllabus, application process & preparation tips.",
    images: ["/images/main_logo.png"],
  },
  alternates: {
    canonical: "https://themastersahib.com/teaching-license",
  },
};

/* ─── JSON-LD Structured Data for Google ─── */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Sindh Teaching License (STEDA) - Study Guide & Preparation Resources 2026",
  description:
    "Independent study guide for the Sindh Teaching License (STEDA) examination — eligibility criteria, exam syllabus, preparation tips, and practice resources for teachers in Sindh.",
  author: {
    "@type": "Organization",
    name: "TheMasterSahib",
  },
  publisher: {
    "@type": "Organization",
    name: "TheMasterSahib",
    url: "https://themastersahib.com",
  },
  datePublished: "2026-07-21",
  dateModified: "2026-07-21",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://themastersahib.com/teaching-license",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the Sindh Teaching License (STEDA)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Sindh Teaching License is an official certification issued by the Sindh Education Department (STEDA) for teachers in Sindh province. It is mandatory for all government school teachers to obtain this license to continue teaching in public schools.",
      },
    },
    {
      "@type": "Question",
      name: "Who is eligible for the Sindh Teaching License exam?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Primary school teachers must have a PTC/CT qualification, middle school teachers need B.A/B.Ed, and high school teachers require M.A/B.Ed. Candidates must be currently employed in the Sindh Education Department and hold a valid CNIC.",
      },
    },
    {
      "@type": "Question",
      name: "What is the exam pattern for the Sindh Teaching License?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The STEDA exam consists of multiple-choice questions (MCQs) covering professional knowledge, general knowledge, English/Urdu, pedagogy, and subject-specific content. The exam is typically 100 marks with a duration of 2-3 hours.",
      },
    },
    {
      "@type": "Question",
      name: "How can I apply for the Sindh Teaching License exam?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Teachers can apply through their respective school headmaster/principal who submits applications to the District Education Office (DEO). Online applications may also be available through the Sindh Education Department portal.",
      },
    },
    {
      "@type": "Question",
      name: "Is the Sindh Teaching License mandatory for teachers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, the Sindh Teaching License is mandatory for all government school teachers in Sindh. Teachers must obtain the license within the specified timeframe as per the Sindh Education Department regulations.",
      },
    },
  ],
};

/* ─── Page Data ─── */
const steps = [
  {
    num: "01",
    title: "Application Submission",
    description:
      "Submit your application through your school headmaster to the District Education Office (DEO). Ensure all required documents are attached.",
    icon: "📝",
  },
  {
    num: "02",
    title: "Document Verification",
    description:
      "Your educational certificates, CNIC, and service record will be verified by the DEO office.",
    icon: "✅",
  },
  {
    num: "03",
    title: "Exam Center Allocation",
    description:
      "After verification, you will receive your exam center details and roll number through your school.",
    icon: "🏫",
  },
  {
    num: "04",
    title: "Written Examination",
    description:
      "Appear for the written examination at the designated center. The exam includes MCQs on professional knowledge, pedagogy, and subject content.",
    icon: "✏️",
  },
  {
    num: "05",
    title: "Result & License Issuance",
    description:
      "Results are announced within 30-60 days. Successful candidates receive their Teaching License from the Sindh Education Department.",
    icon: "🎓",
  },
];

const syllabus = [
  {
    subject: "Professional Knowledge",
    marks: 30,
    topics: ["Teaching Methods", "Classroom Management", "Child Psychology", "Assessment Techniques"],
    color: "from-blue-500 to-indigo-600",
  },
  {
    subject: "Pedagogy & Education",
    marks: 25,
    topics: ["Curriculum Development", "Lesson Planning", "Educational Psychology", "Inclusive Education"],
    color: "from-emerald-500 to-teal-600",
  },
  {
    subject: "General Knowledge",
    marks: 15,
    topics: ["Pakistan Studies", "Current Affairs", "Basic Science", "Sindh Education Policies"],
    color: "from-amber-500 to-orange-600",
  },
  {
    subject: "English / Urdu",
    marks: 15,
    topics: ["Grammar", "Comprehension", "Writing Skills", "Vocabulary"],
    color: "from-rose-500 to-pink-600",
  },
  {
    subject: "Subject Content",
    marks: 15,
    topics: ["Grade-level Subject Knowledge", "Mathematics Basics", "Science Concepts", "Social Studies"],
    color: "from-violet-500 to-purple-600",
  },
];

const eligibility = [
  {
    level: "Primary Level (1-5)",
    qualification: "P.T.C / C.T",
    experience: "Minimum 2 years",
    age: "21-55 years",
    icon: "📖",
  },
  {
    level: "Middle Level (6-8)",
    qualification: "B.A / B.Ed",
    experience: "Minimum 3 years",
    age: "21-55 years",
    icon: "📚",
  },
  {
    level: "High School (9-10)",
    qualification: "M.A / B.Ed / M.Ed",
    experience: "Minimum 3 years",
    age: "21-55 years",
    icon: "🎓",
  },
];

const preparationTips = [
  {
    title: "Study Past Papers",
    description: "Review previous years' STEDA exam papers to understand the pattern and frequently asked topics.",
    icon: "📋",
  },
  {
    title: "Focus on Pedagogy",
    description: "Pedagogy and teaching methods carry significant marks. Study child psychology, learning theories, and classroom strategies.",
    icon: "🧠",
  },
  {
    title: "Sindh Education Policies",
    description: "Stay updated on Sindh government education policies, reforms, and recent notifications from the education department.",
    icon: "📜",
  },
  {
    title: "Daily Practice MCQs",
    description: "Practice MCQs daily using the quiz module on TheMasterSahib to build speed and accuracy for the exam.",
    icon: "🎯",
  },
  {
    title: "English & Urdu Prep",
    description: "Improve grammar, comprehension, and writing skills in both languages. These sections are scoring if prepared well.",
    icon: "✍️",
  },
  {
    title: "Time Management",
    description: "Practice solving questions within the time limit. Allocate approximately 1-1.5 minutes per MCQ during the exam.",
    icon: "⏱️",
  },
];

const importantLinks = [
  { label: "STEDA Learning Hub (Full Notes)", url: "/teaching-license/hub" },
  { label: "Practice Quiz on TheMasterSahib", url: "/peace-quiz" },
  { label: "Educational Resources", url: "/educational-resources" },
  { label: "Contact for Support", url: "/contact" },
];

/* ─── Page Component ─── */
export default function TeachingLicensePage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <main className="min-h-screen bg-[#f4f7fb] text-slate-900">
        {/* ═══════════ HERO SECTION ═══════════ */}
        <section className="relative overflow-hidden border-b border-slate-200/70 bg-white">
          <div className="absolute -left-20 top-[-120px] h-64 w-64 rounded-full bg-emerald-200/50 blur-3xl" />
          <div className="absolute right-[-90px] top-14 h-72 w-72 rounded-full bg-cyan-200/45 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pt-16">
            <div className="mx-auto max-w-4xl text-center">
              <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                STEDA Study Guide &amp; Resources
              </p>

              <h1 className="mt-6 text-4xl font-black leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Sindh Teaching License
                <span className="block bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent">
                  (STEDA) Examination Guide
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Complete guide for the <strong>Sindh Teaching License</strong> examination.
                Learn about eligibility, exam pattern, syllabus, preparation tips, and the application process
                for the <strong>Teacher Learning License</strong> in Sindh province.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  href="/teaching-license/hub"
                  className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-700"
                >
                  Open Learning Hub →
                </Link>
                <Link
                  href="#syllabus"
                  className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400"
                >
                  View Syllabus
                </Link>
                <Link
                  href="#preparation"
                  className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400"
                >
                  Preparation Tips
                </Link>
                <Link
                  href="#faq"
                  className="rounded-2xl border border-emerald-300 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-100"
                >
                  FAQ
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-4 text-center">
                  <p className="text-xl font-black text-slate-900 sm:text-2xl">100</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Total Marks</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-4 text-center">
                  <p className="text-xl font-black text-slate-900 sm:text-2xl">2-3 Hrs</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Duration</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-4 text-center">
                  <p className="text-xl font-black text-slate-900 sm:text-2xl">MCQs</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Exam Format</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ ABOUT SECTION ═══════════ */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">About the License</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
                  What is the Sindh Teaching License?
                </h2>
                <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
                  <p>
                    The <strong>Sindh Teaching License</strong>, commonly known as <strong>STEDA License</strong>,
                    is an official certification issued by the <strong>Sindh Education Department</strong> for
                    teachers working in government schools across Sindh province.
                  </p>
                  <p>
                    This license is <strong>mandatory</strong> for all government school teachers in Sindh.
                    It validates a teacher&apos;s professional competency and ensures they meet the minimum
                    standards required for quality education delivery.
                  </p>
                  <p>
                    The examination is conducted at the district level under the supervision of the
                    <strong> District Education Office (DEO)</strong> and covers professional knowledge,
                    pedagogy, general knowledge, language skills, and subject-specific content.
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6">
                <h3 className="text-lg font-bold text-emerald-900">Key Highlights</h3>
                <ul className="mt-4 space-y-3">
                  {[
                    "Mandatory for all Sindh govt. school teachers",
                    "Conducted by District Education Offices",
                    "Covers pedagogy, professional knowledge & subject content",
                    "License validity is typically 5 years (renewable)",
                    "Preparation resources available at TheMasterSahib",
                    "Must be obtained within specified timeframe",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-emerald-800">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold text-emerald-900">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ APPLICATION PROCESS ═══════════ */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Step-by-Step</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">Application Process</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
              Follow these steps to apply for the Sindh Teaching License examination.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((step) => (
              <div
                key={step.num}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white">
                    {step.num}
                  </span>
                  <span className="text-2xl">{step.icon}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ ELIGIBILITY ═══════════ */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Requirements</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">Eligibility Criteria</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
              Check if you meet the eligibility requirements for each teaching level.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {eligibility.map((item) => (
              <div
                key={item.level}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-3xl">{item.icon}</span>
                  <h3 className="text-lg font-bold text-slate-900">{item.level}</h3>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Qualification</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{item.qualification}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Experience</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{item.experience}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Age Limit</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{item.age}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════ SYLLABUS ═══════════ */}
        <section id="syllabus" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">Exam Structure</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">Syllabus & Marks Distribution</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
              Detailed breakdown of the STEDA examination syllabus and marks allocation.
            </p>
          </div>

          <div className="space-y-4">
            {syllabus.map((item) => (
              <div
                key={item.subject}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-2 w-16 rounded-full bg-gradient-to-r ${item.color}`} />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{item.subject}</h3>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {item.topics.map((topic) => (
                          <span
                            key={topic}
                            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    <span className="rounded-xl bg-slate-900 px-4 py-1.5 text-sm font-black text-white">
                      {item.marks} Marks
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="rounded-3xl border-2 border-slate-900 bg-slate-900 p-5 text-center sm:p-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-300">Total Examination</p>
              <p className="mt-1 text-3xl font-black text-white">100 Marks</p>
              <p className="mt-1 text-sm text-slate-400">Passing Marks: 50 (50%)</p>
            </div>
          </div>
        </section>

        {/* ═══════════ PREPARATION TIPS ═══════════ */}
        <section id="preparation" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Study Smart</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">Preparation Tips</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
              Follow these tips to prepare effectively for the Sindh Teaching License examination.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {preparationTips.map((tip) => (
              <div
                key={tip.title}
                className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="text-3xl">{tip.icon}</span>
                <h3 className="mt-3 text-lg font-bold text-slate-900">{tip.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{tip.description}</p>
              </div>
            ))}
          </div>

          {/* CTA to Quiz */}
          <div className="mt-8 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50 p-6 text-center sm:p-8">
            <h3 className="text-xl font-black text-slate-900 sm:text-2xl">Start Practicing Now</h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
              Use TheMasterSahib&apos;s quiz module to practice MCQs daily and build your confidence
              for the STEDA examination.
            </p>
            <Link
              href="/peace-quiz"
              className="mt-6 inline-flex rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-700"
            >
              Open Quiz Module →
            </Link>
          </div>
        </section>

        {/* ═══════════ DOCUMENTS REQUIRED ═══════════ */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">Required Documents</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
                  Documents Needed
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  Make sure you have all the required documents before applying for the
                  Sindh Teaching License examination.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  "Original & attested Educational Certificates",
                  "Valid CNIC (Computerized National Identity Card)",
                  "Service record / Employment letter from school",
                  "Passport-size photographs (4 copies)",
                  "Headmaster/Principal recommendation letter",
                  "Experience certificates (if applicable)",
                  "Domicile certificate of Sindh province",
                  "Age relaxation certificate (if applicable)",
                ].map((doc) => (
                  <div key={doc} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-700">
                      📄
                    </span>
                    <span className="text-sm font-medium text-slate-800">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ IMPORTANT DATES ═══════════ */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Mark Your Calendar</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">Important Dates</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Application Start", date: "Announced by DEO", note: "Check with your school" },
                { label: "Application Deadline", date: "Announced by DEO", note: "Usually 30 days" },
                { label: "Exam Date", date: "Announced by DEO", note: "Check roll number slip" },
                { label: "Result Declaration", date: "30-60 days after exam", note: "Via DEO office" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">{item.label}</p>
                  <p className="mt-2 text-base font-bold text-slate-900">{item.date}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.note}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              <strong>Note:</strong> Exact dates are announced by the respective District Education Office (DEO).
              Contact your school headmaster or DEO office for the latest schedule.
            </p>
          </div>
        </section>

        {/* ═══════════ FAQ SECTION ═══════════ */}
        <section id="faq" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Got Questions?</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mx-auto max-w-3xl space-y-4">
            {[
              {
                q: "What is the Sindh Teaching License (STEDA)?",
                a: "The Sindh Teaching License is an official certification issued by the Sindh Education Department (STEDA) for teachers in Sindh province. It is mandatory for all government school teachers to obtain this license to continue teaching in public schools.",
              },
              {
                q: "Who is eligible for the Sindh Teaching License exam?",
                a: "Primary school teachers must have a PTC/CT qualification, middle school teachers need B.A/B.Ed, and high school teachers require M.A/B.Ed. Candidates must be currently employed in the Sindh Education Department and hold a valid CNIC.",
              },
              {
                q: "What is the exam pattern for the Sindh Teaching License?",
                a: "The STEDA exam consists of multiple-choice questions (MCQs) covering professional knowledge, general knowledge, English/Urdu, pedagogy, and subject-specific content. The exam is typically 100 marks with a duration of 2-3 hours.",
              },
              {
                q: "How can I apply for the Sindh Teaching License exam?",
                a: "Teachers can apply through their respective school headmaster/principal who submits applications to the District Education Office (DEO). Online applications may also be available through the Sindh Education Department portal.",
              },
              {
                q: "Is the Sindh Teaching License mandatory for teachers?",
                a: "Yes, the Sindh Teaching License is mandatory for all government school teachers in Sindh. Teachers must obtain the license within the specified timeframe as per the Sindh Education Department regulations.",
              },
              {
                q: "What happens if I fail the STEDA exam?",
                a: "If you fail the exam, you can reapply for the next examination cycle. There is no limit on the number of attempts. It is recommended to review the syllabus, study the weak areas, and practice MCQs before retaking the exam.",
              },
              {
                q: "How long is the Sindh Teaching License valid?",
                a: "The Sindh Teaching License is typically valid for 5 years. Teachers must renew their license before expiry by applying through the DEO office and meeting the renewal requirements.",
              },
              {
                q: "Can I prepare for the STEDA exam online?",
                a: "Yes! TheMasterSahib offers a dedicated quiz module and educational resources to help you prepare for the STEDA examination. You can practice MCQs, study pedagogy concepts, and take mock tests online.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-semibold text-slate-900 sm:text-base">
                  {item.q}
                  <span className="ml-4 shrink-0 rounded-full border border-slate-200 bg-slate-50 p-1 text-slate-500 transition group-open:rotate-180">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </span>
                </summary>
                <div className="border-t border-slate-100 px-5 py-4 text-sm leading-7 text-slate-600">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ═══════════ IMPORTANT LINKS ═══════════ */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Useful Resources</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">Important Links</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {importantLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.url}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  <span>🔗</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ CTA SECTION ═══════════ */}
        <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center sm:p-12">
            <h2 className="text-2xl font-black text-white sm:text-3xl">Ready to Get Your Teaching License?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
              Start your preparation today with TheMasterSahib. Practice quizzes, study pedagogy,
              and build the confidence you need to pass the STEDA examination.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/teaching-license/hub"
                className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600"
              >
                Open Learning Hub →
              </Link>
              <Link
                href="/peace-quiz"
                className="rounded-2xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-cyan-600"
              >
                Start Quiz Practice →
              </Link>
              <Link
                href="/educational-resources"
                className="rounded-2xl border border-slate-600 bg-transparent px-6 py-3 text-sm font-semibold text-slate-300 transition hover:-translate-y-0.5 hover:border-slate-400 hover:text-white"
              >
                Educational Resources
              </Link>
              <Link
                href="/contact"
                className="rounded-2xl border border-slate-600 bg-transparent px-6 py-3 text-sm font-semibold text-slate-300 transition hover:-translate-y-0.5 hover:border-slate-400 hover:text-white"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════ FOOTER ═══════════ */}
        <footer className="border-t border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} TheMasterSahib. All rights reserved.</p>
            <p>
              <Link href="/" className="transition hover:text-slate-900">Home</Link>
              {" · "}
              <Link href="/contact" className="transition hover:text-slate-900">Contact</Link>
              {" · "}
              <Link href="/peace-quiz" className="transition hover:text-slate-900">Quiz</Link>
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
