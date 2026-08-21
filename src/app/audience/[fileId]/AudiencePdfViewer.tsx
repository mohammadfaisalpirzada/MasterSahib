'use client';

import { useEffect, useRef, useState } from 'react';

type PdfPage = {
  getViewport(options: { scale: number }): { width: number; height: number };
  render(options: { canvas: HTMLCanvasElement; canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }): { promise: Promise<void> };
};
type PdfDocument = { numPages: number; getPage(pageNumber: number): Promise<PdfPage> };

export default function AudiencePdfViewer({ fileId, title }: { fileId: string; title: string }) {
  const [pin, setPin] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState('');
  const [checkingPin, setCheckingPin] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [fallback, setFallback] = useState(false);
  const pdfRef = useRef<PdfDocument | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!unlocked) return;
    let cancelled = false;
    (async () => {
      const response = await fetch(`/api/audience/${fileId}/file`, {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`PDF request failed (${response.status})`);
      const pdfBytes = new Uint8Array(await response.arrayBuffer());
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.legacy.min.mjs';
      const pdf = await pdfjs.getDocument({ data: pdfBytes }).promise as PdfDocument;
      if (!cancelled) { pdfRef.current = pdf; setPageCount(pdf.numPages); setPageNumber(1); }
    })().catch((loadError) => { console.error(loadError); setFallback(true); });
    return () => { cancelled = true; };
  }, [fileId, unlocked]);

  useEffect(() => {
    const pdf = pdfRef.current;
    const canvas = canvasRef.current;
    if (!pdf || !canvas || !pageCount) return;
    let cancelled = false;
    (async () => {
      const page = await pdf.getPage(pageNumber);
      const availableWidth = Math.min(window.innerWidth - 24, 1100);
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = Math.max(0.75, Math.min(1.6, availableWidth / baseViewport.width));
      const viewport = page.getViewport({ scale });
      canvas.width = Math.floor(viewport.width); canvas.height = Math.floor(viewport.height);
      const context = canvas.getContext('2d');
      if (!context || cancelled) return;
      await page.render({ canvas, canvasContext: context, viewport }).promise;
    })().catch((renderError) => { console.error(renderError); setFallback(true); });
    return () => { cancelled = true; };
  }, [pageCount, pageNumber]);

  useEffect(() => {
    if (!unlocked || fallback) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') setPageNumber((current) => Math.min(pageCount, current + 1));
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') setPageNumber((current) => Math.max(1, current - 1));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [fallback, pageCount, unlocked]);

  useEffect(() => {
    if (unlocked || pin.length < 4) {
      setCheckingPin(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setCheckingPin(true);
      setError('');
      try {
        const response = await fetch(`/api/audience/${fileId}/unlock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin }),
          signal: controller.signal,
        });
        if (response.ok) setUnlocked(true);
      } catch (unlockError) {
        if (!(unlockError instanceof DOMException && unlockError.name === 'AbortError')) {
          console.error(unlockError);
        }
      } finally {
        if (!controller.signal.aborted) setCheckingPin(false);
      }
    }, 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [fileId, pin, unlocked]);

  const unlock = async () => {
    setError('');
    setCheckingPin(true);
    try {
      const response = await fetch(`/api/audience/${fileId}/unlock`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin }) });
      if (response.ok) setUnlocked(true); else setError('Incorrect PIN. Please try again.');
    } finally {
      setCheckingPin(false);
    }
  };

  if (!unlocked) return <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-950 px-4"><div className="w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-8 text-center text-white shadow-2xl backdrop-blur"><p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">TheMasterSahib</p><h1 className="mt-3 text-2xl font-black">{title}</h1><p className="mt-3 text-sm text-slate-300">Enter the audience PIN provided by your presenter. The PDF will open automatically.</p><input name={`audience-pin-${fileId}`} value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 10))} onKeyDown={(event) => event.key === 'Enter' && unlock()} type="password" inputMode="numeric" enterKeyHint="done" autoComplete="new-password" autoCorrect="off" spellCheck={false} data-lpignore="true" data-1p-ignore="true" autoFocus placeholder="Audience PIN" className="mt-6 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center text-lg tracking-[0.3em] outline-none focus:border-cyan-300" /><button onClick={unlock} disabled={checkingPin || pin.length < 4} className="mt-4 w-full rounded-2xl bg-cyan-500 px-4 py-3 font-bold text-slate-950 hover:bg-cyan-400 disabled:cursor-wait disabled:opacity-70">{checkingPin ? 'Checking PIN…' : 'Open Presentation PDF'}</button>{error && <p className="mt-3 text-sm text-rose-300">{error}</p>}</div></main>;

  return <main onContextMenu={(event) => event.preventDefault()} className="flex min-h-screen select-none flex-col bg-slate-900"><header className="z-20 border-b border-white/10 bg-slate-950/95 px-4 py-3 text-white"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3"><div className="min-w-0"><p className="truncate font-bold">{title}</p><p className="text-xs text-slate-400">Protected audience copy · {pageCount ? `${pageCount} pages` : 'Loading…'}</p></div><a href="/educational-resources" className="shrink-0 rounded-full bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950">Explore</a></div></header>{fallback ? <iframe src={`/api/audience/${fileId}/file#toolbar=0&navpanes=0`} title={title} className="min-h-[calc(100vh-65px)] w-full flex-1 border-0" /> : <div className="relative flex flex-1 items-center justify-center overflow-auto p-3 sm:p-6"><div className="relative mx-auto overflow-hidden rounded-lg bg-white shadow-2xl"><canvas ref={canvasRef} className="block max-h-[calc(100vh-120px)] max-w-full" /><div className="pointer-events-none absolute inset-0 flex items-center justify-center -rotate-12 text-xl font-bold text-slate-500/15 sm:text-3xl">TheMasterSahib · Page {pageNumber}</div></div>{pageCount > 0 && <><button onClick={() => setPageNumber((current) => Math.max(1, current - 1))} disabled={pageNumber === 1} className="fixed left-2 top-1/2 rounded-full bg-black/70 px-4 py-3 text-3xl text-white disabled:opacity-25 sm:left-6">‹</button><button onClick={() => setPageNumber((current) => Math.min(pageCount, current + 1))} disabled={pageNumber === pageCount} className="fixed right-2 top-1/2 rounded-full bg-black/70 px-4 py-3 text-3xl text-white disabled:opacity-25 sm:right-6">›</button><div className="fixed bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/75 px-4 py-2 text-sm font-bold text-white">{pageNumber} / {pageCount}</div></>}</div>}</main>;
}
