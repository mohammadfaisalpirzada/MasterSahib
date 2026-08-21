'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

type Presentation = {
  id: string;
  title: string;
  modifiedTime: string;
  thumbnailUrl: string | null;
  slideUrls: string[];
  previewUrl: string;
  audiencePdf: { id: string; enabled: boolean; pin: string | null } | null;
};

export default function PresentationLibrary({ presentations, driveConnected }: { presentations: Presentation[]; driveConnected: boolean }) {
  const [active, setActive] = useState<Presentation | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [pins, setPins] = useState<Record<string, string>>(() => Object.fromEntries(
    presentations.flatMap((presentation) => presentation.audiencePdf?.pin ? [[presentation.id, presentation.audiencePdf.pin]] : []),
  ));
  const [editingPins, setEditingPins] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const router = useRouter();

  const managePdf = async (presentation: Presentation, action: 'create' | 'pin') => {
    if (!driveConnected) {
      await signIn('google-drive', { callbackUrl: '/my-presentations' });
      return;
    }
    setBusy(presentation.id);
    try {
      const response = await fetch('/api/my-presentations/audience-pdf', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action === 'create'
          ? { action, presentationId: presentation.id, title: presentation.title }
          : { action, pdfId: presentation.audiencePdf?.id, pin: pins[presentation.id] }),
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Request failed');
      if (action === 'pin') setEditingPins((current) => ({ ...current, [presentation.id]: false }));
      router.refresh();
    } catch (error) { alert(error instanceof Error ? error.message : 'Request failed'); }
    finally { setBusy(null); }
  };

  const copyAudienceInvite = async (presentation: Presentation) => {
    const pin = pins[presentation.id] || presentation.audiencePdf?.pin;
    if (!pin || pin.length < 4) {
      alert('Audience PIN field mein PIN likhein, Save PIN karein, phir Copy Invite par click karein.');
      return;
    }

    const link = `${window.location.origin}/audience/${presentation.audiencePdf!.id}`;
    const message = `📄 ${presentation.title}\n\nPresentation PDF dekhne ke liye:\n${link}\n\nAudience PIN: ${pin}\n\nGoogle sign-in ke baad yeh PIN enter karein.`;
    await navigator.clipboard.writeText(message);
    alert('Link aur audience PIN wala message clipboard par copy ho gaya.');
  };

  const close = useCallback(() => {
    setActive(null);
    setSlideIndex(0);
  }, []);

  const previous = useCallback(() => {
    if (!active?.slideUrls.length) return;
    setSlideIndex((current) => (current <= 0 ? active.slideUrls.length - 1 : current - 1));
  }, [active]);

  const next = useCallback(() => {
    if (!active?.slideUrls.length) return;
    setSlideIndex((current) => (current >= active.slideUrls.length - 1 ? 0 : current + 1));
  }, [active]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!active) return;
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') previous();
      if (event.key === 'ArrowRight' || event.key === ' ' || event.key === 'PageDown') next();
      if (event.key === 'PageUp') previous();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, close, next, previous]);

  if (presentations.length === 0) {
    return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">No Google Slides presentations were found in the connected folder.</div>;
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {presentations.map((presentation) => (
          <button key={presentation.id} type="button" onClick={() => { setActive(presentation); setSlideIndex(0); }} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex aspect-video items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 to-slate-900">
              {presentation.thumbnailUrl ? (
                // Google Slides thumbnail URLs are temporary signed URLs and therefore bypass image optimization.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={presentation.thumbnailUrl} alt={`${presentation.title} cover`} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
              ) : (
                <span className="px-6 text-center text-xl font-bold text-white">{presentation.title}</span>
              )}
            </div>
            <div className="p-5">
              <h2 className="text-lg font-bold text-slate-900">{presentation.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{presentation.slideUrls.length} slides · Google Slides</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-indigo-600">Click to present</p>
              <div className="mt-5 border-t border-slate-200 pt-4" onClick={(event) => event.stopPropagation()}>
                {!presentation.audiencePdf ? (
                  <button type="button" onClick={() => managePdf(presentation, 'create')} disabled={busy === presentation.id} className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-110 disabled:opacity-60">
                    {busy === presentation.id ? 'Creating PDF…' : 'Create Audience PDF'}
                  </button>
                ) : (
                  <div className="space-y-3">
                    {presentation.audiencePdf.pin && !editingPins[presentation.id] ? (
                      <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                        <span className="text-sm font-semibold text-emerald-700">PIN securely saved</span>
                        <button type="button" onClick={() => setEditingPins((current) => ({ ...current, [presentation.id]: true }))} className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm">Change PIN</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input type="password" inputMode="numeric" value={pins[presentation.id] || ''} onChange={(event) => setPins((current) => ({ ...current, [presentation.id]: event.target.value.replace(/\D/g, '').slice(0, 10) }))} placeholder="Set 4–10 digit PIN" className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm" />
                        <button type="button" onClick={() => managePdf(presentation, 'pin')} disabled={(pins[presentation.id]?.length || 0) < 4 || busy === presentation.id} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">{busy === presentation.id ? 'Saving…' : 'Save PIN'}</button>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => copyAudienceInvite(presentation)} className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700">Copy Invite</button>
                      <a href={`/audience/${presentation.audiencePdf.id}`} target="_blank" rel="noreferrer" className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-sm font-semibold text-emerald-700">Open Viewer</a>
                    </div>
                    <p className={`text-xs font-semibold ${presentation.audiencePdf.enabled ? 'text-emerald-600' : 'text-amber-600'}`}>{presentation.audiencePdf.enabled ? 'Audience sharing active' : 'Set a PIN to activate sharing'}</p>
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {active ? (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black" role="dialog" aria-modal="true">
          <div className="flex items-center justify-between gap-4 bg-slate-950 px-4 py-3 text-white">
            <p className="min-w-0 truncate font-semibold">{active.title}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => document.documentElement.requestFullscreen?.()} className="rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/20">Full screen</button>
              <button type="button" onClick={close} className="rounded-lg bg-rose-600 px-3 py-2 text-sm hover:bg-rose-500">Close</button>
            </div>
          </div>
          {active.slideUrls.length ? (
            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
              {/* Google returns temporary signed image URLs for each slide. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={active.slideUrls[slideIndex]} alt={`Slide ${slideIndex + 1}`} className="max-h-full max-w-full object-contain" />
              <button type="button" onClick={previous} aria-label="Previous slide" className="absolute left-2 rounded-full bg-black/55 px-4 py-3 text-3xl text-white hover:bg-black/80 sm:left-6">‹</button>
              <button type="button" onClick={next} aria-label="Next slide" className="absolute right-2 rounded-full bg-black/55 px-4 py-3 text-3xl text-white hover:bg-black/80 sm:right-6">›</button>
              <div className="absolute bottom-4 rounded-full bg-black/65 px-4 py-2 text-sm font-semibold text-white">{slideIndex + 1} / {active.slideUrls.length}</div>
            </div>
          ) : (
            <iframe src={active.previewUrl} title={active.title} className="min-h-0 w-full flex-1 border-0" allowFullScreen />
          )}
        </div>
      ) : null}
    </>
  );
}
