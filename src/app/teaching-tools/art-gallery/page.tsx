'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

type Artwork = {
  id: string;
  title: string;
  artist: string;
  imageData: string;
  description: string;
  date: string;
  likes: number;
};

const STORAGE_KEY = 'ms_art_gallery';

const loadArtworks = (): Artwork[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const saveArtworks = (items: Artwork[]) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* noop */ }
};

export default function ArtGalleryPage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [description, setDescription] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedArt, setSelectedArt] = useState<Artwork | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setArtworks(loadArtworks()); }, []);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      setImageData(data);
      setImagePreview(data);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!title.trim() || !imageData) return;
    const artwork: Artwork = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      title: title.trim(),
      artist: artist.trim() || 'Anonymous',
      imageData,
      description: description.trim(),
      date: new Date().toISOString().slice(0, 10),
      likes: 0,
    };
    const updated = [artwork, ...artworks];
    setArtworks(updated);
    saveArtworks(updated);
    setTitle('');
    setArtist('');
    setDescription('');
    setImageData(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }, [title, artist, description, imageData, artworks]);

  const handleLike = useCallback((id: string) => {
    const updated = artworks.map((a) => a.id === id ? { ...a, likes: a.likes + 1 } : a);
    setArtworks(updated);
    saveArtworks(updated);
  }, [artworks]);

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Creative Corner</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Art Gallery Wall</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">Showcase student drawings, paintings, and creative work. Upload images and inspire others!</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/teaching-tools" className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">← Back</Link>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Submit Artwork</h2>
          <div className="mt-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Artwork title *" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500" />
              <input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Artist name (optional)" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500" />
            </div>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description / inspiration note (optional)" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500" />
            <div className="flex flex-wrap items-center gap-3">
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-amber-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-amber-700 hover:file:bg-amber-200" />
              {imagePreview && <img src={imagePreview} alt="Preview" className="h-16 w-16 rounded-xl object-cover shadow-sm" />}
            </div>
            <button type="button" onClick={handleSubmit} disabled={!title.trim() || !imageData} className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50">Post to Gallery</button>
          </div>
        </section>

        <section className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {artworks.length === 0 ? (
            <div className="break-inside-avoid rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm text-slate-500">No artworks yet. Be the first to submit!</p>
            </div>
          ) : (
            artworks.map((art) => (
              <div key={art.id} className="break-inside-avoid mb-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="overflow-hidden rounded-2xl bg-slate-100">
                  <img src={art.imageData} alt={art.title} className="w-full h-auto object-cover cursor-pointer" onClick={() => setSelectedArt(art)} />
                </div>
                <div className="mt-3">
                  <h3 className="font-bold text-slate-900">{art.title}</h3>
                  <p className="text-xs font-semibold text-slate-500">by {art.artist} · {art.date}</p>
                  {art.description && <p className="mt-1.5 text-sm text-slate-600">{art.description}</p>}
                  <div className="mt-2 flex items-center gap-3">
                    <button type="button" onClick={() => handleLike(art.id)} className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600 transition hover:bg-rose-100">
                      ♥ {art.likes}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        {selectedArt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setSelectedArt(null)}>
            <div className="max-h-[90vh] max-w-3xl overflow-auto rounded-3xl bg-white p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <img src={selectedArt.imageData} alt={selectedArt.title} className="w-full rounded-2xl" />
              <div className="mt-3">
                <h3 className="text-lg font-bold text-slate-900">{selectedArt.title}</h3>
                <p className="text-sm text-slate-500">by {selectedArt.artist} · {selectedArt.date}</p>
                {selectedArt.description && <p className="mt-2 text-sm text-slate-600">{selectedArt.description}</p>}
                <button type="button" onClick={() => setSelectedArt(null)} className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
