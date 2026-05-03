import Link from 'next/link';

export default function GgssSubdomainLandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-cyan-500/25 blur-3xl" />
        <div className="absolute right-0 top-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-[-90px] left-1/3 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full border border-cyan-300/40 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              GGSS Nishtar Road Portal
            </p>

            <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Welcome to the
              <span className="block bg-gradient-to-r from-cyan-300 via-emerald-300 to-sky-300 bg-clip-text text-transparent">
                GGSS Subdomain Workspace
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              This subdomain is dedicated to GGSS Nishtar Road tools. Open admin workspace, stipend records,
              and school workflows directly from here.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/ggss-nishtar-road"
                className="rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-900 transition hover:-translate-y-0.5 hover:bg-cyan-300"
              >
                Open GGSS Home
              </Link>
              <Link
                href="/ggss-nishtar-road/admin"
                className="rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                Open Admin
              </Link>
              <Link
                href="/ggss-nishtar-road/stipend"
                className="rounded-2xl border border-emerald-300/60 bg-emerald-300/10 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:-translate-y-0.5 hover:bg-emerald-300/20"
              >
                Open Stipend
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/5 p-6 shadow-2xl backdrop-blur-md sm:p-7">
            <h2 className="text-xl font-bold text-cyan-100">Quick Links</h2>
            <div className="mt-4 space-y-3">
              <Link
                href="/ggss-nishtar-road"
                className="block rounded-xl border border-white/15 bg-slate-900/60 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/50 hover:text-cyan-100"
              >
                GGSS Landing Dashboard
              </Link>
              <Link
                href="/ggss-nishtar-road/admin"
                className="block rounded-xl border border-white/15 bg-slate-900/60 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/50 hover:text-cyan-100"
              >
                Staff Admin Console
              </Link>
              <Link
                href="/ggss-nishtar-road/admin/takeover"
                className="block rounded-xl border border-white/15 bg-slate-900/60 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/50 hover:text-cyan-100"
              >
                Takeover Management
              </Link>
              <Link
                href="/ggss-nishtar-road/stipend"
                className="block rounded-xl border border-white/15 bg-slate-900/60 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/50 hover:text-cyan-100"
              >
                Student Stipend Records
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
