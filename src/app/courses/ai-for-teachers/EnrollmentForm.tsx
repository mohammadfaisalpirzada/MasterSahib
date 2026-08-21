'use client';

import { FormEvent, useState } from 'react';
import { HiCheckCircle, HiX } from 'react-icons/hi';

export default function EnrollmentForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage('');
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const response = await fetch('/api/course-registrations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, courseId: 'AI-TEACHERS-101' }) });
    const result = await response.json();
    setLoading(false); setSuccess(response.ok); setMessage(result.message);
    if (response.ok) form.reset();
  }

  return <>
    <button onClick={() => setOpen(true)} className="w-full rounded-2xl bg-amber-400 px-6 py-4 text-base font-black text-slate-950 shadow-lg shadow-amber-400/20 transition hover:-translate-y-0.5 hover:bg-amber-300">Register Now — PKR 5,000</button>
    {open && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
        <button onClick={() => setOpen(false)} className="absolute right-5 top-5 rounded-full bg-slate-100 p-2 text-slate-600" aria-label="Close"><HiX className="h-5 w-5" /></button>
        {success ? <div className="py-10 text-center"><HiCheckCircle className="mx-auto h-16 w-16 text-emerald-500" /><h2 className="mt-4 text-2xl font-black text-slate-900">You are registered!</h2><p className="mt-2 text-slate-600">Our team will contact you with payment and class details.</p><button onClick={() => setOpen(false)} className="mt-7 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white">Done</button></div> : <>
          <p className="text-sm font-bold uppercase tracking-[.2em] text-indigo-600">AI-TEACHERS-101</p>
          <h2 className="mt-2 text-3xl font-black text-slate-900">Reserve your seat</h2>
          <p className="mt-2 text-sm text-slate-600">Submit your details. Payment instructions will be shared after confirmation.</p>
          <form onSubmit={submit} className="mt-7 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">Full name<input name="name" required className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-indigo-500" /></label>
            <label className="text-sm font-bold text-slate-700">Email<input name="email" type="email" required className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-indigo-500" /></label>
            <label className="text-sm font-bold text-slate-700">WhatsApp number<input name="phone" required className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-indigo-500" /></label>
            <label className="text-sm font-bold text-slate-700">City<input name="city" className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-indigo-500" /></label>
            <label className="text-sm font-bold text-slate-700 sm:col-span-2">Teaching experience<select name="experience" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none focus:border-indigo-500"><option>Student / New teacher</option><option>1–3 years</option><option>4–10 years</option><option>10+ years</option></select></label>
            {message && <p className="text-sm font-semibold text-rose-600 sm:col-span-2">{message}</p>}
            <button disabled={loading} className="rounded-xl bg-indigo-600 px-6 py-3.5 font-bold text-white disabled:opacity-60 sm:col-span-2">{loading ? 'Submitting…' : 'Submit Registration'}</button>
          </form>
        </>}
      </div>
    </div>}
  </>;
}
