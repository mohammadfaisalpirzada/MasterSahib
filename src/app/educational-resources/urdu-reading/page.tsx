'use client';

import Link from 'next/link';
import { useState, useCallback } from 'react';

type Story = { urdu: string; english: string };

const stories: Story[] = [
  {
    urdu: 'ایک تھا بلی کا بچہ\nوہ بہت پیارا تھا\nوہ دودھ پیتا تھا\nاور چھت پر بیٹھتا تھا',
    english: 'There was a little cat. He was very cute. He drank milk and sat on the roof.',
  },
  {
    urdu: 'میرا نام سارہ ہے\nمیں اسکول جاتی ہوں\nمیرے بستے میں کتابیں ہیں\nاور میں سبق پڑھتی ہوں',
    english: 'My name is Sarah. I go to school. I have books in my bag and I read my lessons.',
  },
  {
    urdu: 'سورج آیا چمک کر\nاندھیرا بھاگ گیا\nسب بچے جاگ گئے\nنیا دن آ گیا',
    english: 'The sun came shining bright. The darkness ran away. All the children woke up. A new day has arrived.',
  },
  {
    urdu: 'ایک تھا خرگوش\nاس کے کان لمبے تھے\nوہ گاجر کھاتا تھا\nاور تیزی سے دوڑتا تھا',
    english: 'There was a rabbit. It had long ears. It ate carrots and ran very fast.',
  },
  {
    urdu: 'مچھلی پانی میں رہتی ہے\nوہ تیرتی ہے\nرنگ برنگی مچھلیاں\nبہت خوبصورت لگتی ہیں',
    english: 'Fish live in water. They swim. Colorful fish look very beautiful.',
  },
  {
    urdu: 'اللہ نے کتنے اچھے\nپھول بنائے ہیں\nسرخ، پیلے، سفید\nسب نے منہ کھولے ہیں',
    english: 'Allah has made such beautiful flowers. Red, yellow, and white - they are all blooming.',
  },
  {
    urdu: 'چاند تاروں بھری رات\nبہت خوبصورت لگتی ہے\nبلّی چھت پر بیٹھی ہے\nاور تاروں کو دیکھتی ہے',
    english: 'The night full of moon and stars looks very beautiful. The cat sits on the roof and looks at the stars.',
  },
  {
    urdu: 'میری اماں بہت اچھی ہیں\nوہ مجھے کہانی سناتی ہیں\nابّا مجھے پیار کرتے ہیں\nمیرا گھر ہے جنت جیسا',
    english: 'My mother is very kind. She tells me stories. My father loves me. My home is like heaven.',
  },
];

function speakUrdu(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/\n/g, ' '));
  u.lang = 'ur-PK';
  u.rate = 0.8;
  u.pitch = 1.0;
  window.speechSynthesis.speak(u);
}

export default function UrduReadingPage() {
  const [idx, setIdx] = useState(0);
  const story = stories[idx];
  const hasPrev = idx > 0;
  const hasNext = idx < stories.length - 1;

  const goPrev = useCallback(() => setIdx((p) => Math.max(0, p - 1)), []);
  const goNext = useCallback(() => setIdx((p) => Math.min(stories.length - 1, p + 1)), []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-5">
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">Ages 3-6 • Urdu Reading</p>
          <div className="mt-2 flex items-center justify-between">
            <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">📖 اردو پڑھائی</h1>
            <Link href="/educational-resources" className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">← Back</Link>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">Read fun Urdu stories and poems. Listen to them aloud!</p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-rose-500">Story {idx + 1} of {stories.length}</p>
            <button
              onClick={() => speakUrdu(story.urdu)}
              className="flex items-center gap-2 rounded-2xl bg-rose-500 px-5 py-3 text-base font-bold text-white transition hover:bg-rose-600 active:scale-95"
            >
              <span className="text-xl">🔊</span> Listen
            </button>
          </div>

          <div className="mt-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 sm:p-8">
            <div dir="rtl" className="space-y-3 text-right">
              {story.urdu.split('\n').map((line, i) => (
                <p key={i} className="text-3xl font-bold leading-relaxed text-slate-900 sm:text-4xl">{line}</p>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-sky-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-500">English Translation</p>
            <p className="mt-1 text-lg leading-relaxed text-slate-700 sm:text-xl">{story.english}</p>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              onClick={goPrev}
              disabled={!hasPrev}
              className={`rounded-2xl px-6 py-3 text-base font-bold transition ${hasPrev ? 'bg-amber-500 text-white hover:bg-amber-600 active:scale-95' : 'cursor-not-allowed bg-slate-100 text-slate-400'}`}
            >
              ← Previous
            </button>

            <div className="flex gap-2">
              {stories.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`h-3 w-3 rounded-full transition ${i === idx ? 'bg-rose-500' : 'bg-slate-300 hover:bg-slate-400'}`}
                  aria-label={`Go to story ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              disabled={!hasNext}
              className={`rounded-2xl px-6 py-3 text-base font-bold transition ${hasNext ? 'bg-amber-500 text-white hover:bg-amber-600 active:scale-95' : 'cursor-not-allowed bg-slate-100 text-slate-400'}`}
            >
              Next →
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
