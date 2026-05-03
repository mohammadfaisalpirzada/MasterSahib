import Link from 'next/link';

export default function GgssRootPage() {
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
              🏫 GGSS Nishtar Road
            </p>

            <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Welcome to
              <span className="block bg-gradient-to-r from-cyan-300 via-emerald-300 to-sky-300 bg-clip-text text-transparent">
                GGSS Admin Portal
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              School management portal for staff records, student stipend tracking, and administrative workflows. Access all tools from here.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/ggss-nishtar-road/stipend"
                className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600"
              >
                📊 Stipend Management
              </Link>
              <Link
                href="/ggss-nishtar-road/admin"
                className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-cyan-600"
              >
                👥 Staff Records
              </Link>
              <Link
                href="/ggss-nishtar-road/admin/takeover"
                className="rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                🎓 Takeover Management
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-white/15 bg-white/5 p-6 shadow-2xl backdrop-blur-md">
              <h2 className="text-lg font-bold text-cyan-100">Quick Access</h2>
              <div className="mt-4 space-y-2">
                <Link
                  href="/ggss-nishtar-road/stipend"
                  className="block rounded-xl bg-slate-900/60 px-4 py-3 text-sm font-semibold text-slate-100 border border-white/10 transition hover:border-emerald-400/50 hover:text-emerald-100"
                >
                  💰 Student Stipend Records
                </Link>
                <Link
                  href="/ggss-nishtar-road/admin"
                  className="block rounded-xl bg-slate-900/60 px-4 py-3 text-sm font-semibold text-slate-100 border border-white/10 transition hover:border-cyan-400/50 hover:text-cyan-100"
                >
                  📋 Staff Admin Console
                </Link>
                <Link
                  href="/ggss-nishtar-road/admin/takeover"
                  className="block rounded-xl bg-slate-900/60 px-4 py-3 text-sm font-semibold text-slate-100 border border-white/10 transition hover:border-indigo-400/50 hover:text-indigo-100"
                >
                  📚 Takeover Records
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/5 p-6 shadow-2xl backdrop-blur-md">
              <h3 className="text-sm font-bold text-slate-300">Portal Status</h3>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-slate-200">Stipend System Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" />
                  <span className="text-slate-200">Staff Database Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-indigo-400" />
                  <span className="text-slate-200">Admin Tools Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
