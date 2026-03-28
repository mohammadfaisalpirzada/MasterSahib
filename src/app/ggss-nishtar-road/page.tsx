import Image from 'next/image';
import Link from 'next/link';

export default function GgssNishtarRoadLandingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#dbeafe_0%,#f8fafc_45%,#ecfeff_100%)] px-4 py-10 sm:px-6 lg:px-10">
      <section className="mx-auto grid w-full max-w-6xl gap-8 rounded-3xl border border-cyan-100 bg-white/90 p-6 shadow-xl shadow-cyan-100/70 backdrop-blur sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
        <div className="flex flex-col justify-center">
          <p className="inline-flex w-fit rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
            School Staff Portal
          </p>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            GGSS Nishtar Road
            <span className="block text-cyan-700">Staff Data Center</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            From here, you can verify, update, and manage GGSS Nishtar Road staff records. Data is loaded from the dedicated
            Google Sheet and saved back to the same source after secure verification.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Live Source</p>
              <p className="mt-1 text-sm font-bold text-slate-800">Google Sheet: GGSS Staff Register</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Security</p>
              <p className="mt-1 text-sm font-bold text-slate-800">Server-side PID verification before edit</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/staff-data"
              className="inline-flex items-center justify-center rounded-2xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-200 transition hover:-translate-y-0.5 hover:bg-cyan-700"
            >
              Open Staff Data
            </Link>
            <Link
              href="/ggss-nishtar-road/admin"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400 hover:text-cyan-700"
            >
              Admin Dashboard
            </Link>
            <span className="text-xs font-medium text-slate-500">Semis Code: 408070227</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-4 -top-4 h-20 w-20 rounded-full bg-cyan-200/60 blur-2xl" />
          <div className="absolute -bottom-3 -right-3 h-24 w-24 rounded-full bg-blue-200/70 blur-2xl" />

          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-950/5 p-3 shadow-md">
            <Image
              src="/images/ggss-teachers-ai.svg"
              alt="AI illustration for GGSS Nishtar Road teacher data"
              width={1200}
              height={800}
              priority
              className="h-auto w-full rounded-2xl"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
