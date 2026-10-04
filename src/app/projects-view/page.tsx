import type { Metadata } from 'next';
import Link from 'next/link';
import { HiOutlineLockClosed, HiOutlineShieldCheck } from 'react-icons/hi';

export const metadata: Metadata = {
  title: 'Client Project Review Portal | The Master Sahib',
  robots: { index: false, follow: false },
};

export default function ProjectsViewIndexPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mx-auto mb-5 text-3xl">
          <HiOutlineShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Client Project Portal</h1>
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          This is a protected preview environment for Master Sahib freelancing & educational deliverables. Individual client project links are private and direct.
        </p>

        <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 text-left space-y-2 mb-6">
          <p className="font-semibold text-teal-300 flex items-center gap-1.5">
            <HiOutlineLockClosed className="w-4 h-4" /> Confidential Review Notice:
          </p>
          <p className="text-[11px] text-slate-400">
            If you are a client reviewing your draft or audit booklet, please click the custom link provided to you directly by Master Sahib via WhatsApp or Email.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700"
        >
          ← Return to Master Sahib Home
        </Link>
      </div>
    </div>
  );
}
