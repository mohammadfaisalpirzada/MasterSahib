import ResumeForm from '../components/resumeForm';

export default function ResumePage() {
  return (
    <main className="min-h-screen bg-[#f7fafc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="resume-page-hero overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-700 p-6 text-white shadow-sm sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">Career Studio</p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">Build a Beautiful Professional Resume</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-100 sm:text-base">
                Enter your details once, refine your wording, and instantly preview a clean, attractive, job-ready CV for teaching and professional roles.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-xl font-black">1</p>
                <p className="mt-1 text-sm text-slate-100">Enter personal, education, and experience details.</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-xl font-black">2</p>
                <p className="mt-1 text-sm text-slate-100">Strengthen your summary and bullet points.</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-xl font-black">3</p>
                <p className="mt-1 text-sm text-slate-100">Preview, print, or save as PDF in a polished format.</p>
              </div>
            </div>
          </div>
        </section>

        <ResumeForm />
      </div>
    </main>
  );
}
