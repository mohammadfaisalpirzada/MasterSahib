'use client';

// Read-aloud support for the Class Notes reader. No API keys, no server cost:
//  - Urdu / Sindhi: natural pre-recorded clips in /public/tts/ur/ (made once on the PC with
//    scripts/build-voice-clips.mjs). Plays instantly on every phone, including iPhones.
//  - English: the most natural voice already on the student's device (Google / "Natural" /
//    "Online" voices are preferred over the default robotic one).
//  - Urdu line not recorded and no Urdu voice on the device -> a "How to add Urdu voice" help popup.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { HiOutlineVolumeUp, HiOutlineX } from 'react-icons/hi';
import {
  cleanForSpeech,
  clipKey,
  splitByScript,
  splitSentences,
  WORD_CHAR,
} from '../_lib/speechText.mjs';

export { splitSentences };
export type SpeakItem = { key: string; text: string };
type Lang = 'en' | 'ur' | 'sd';

const CLIP_DIR = '/tts/ur';
// Tiny silent clip used to "unlock" audio playback on phones during the student's tap.
const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';

const normLang = (l: string) => l.toLowerCase().replace('_', '-');

/** Best device voice for a language — natural/online/Google voices beat the robotic defaults. */
function pickVoice(voices: SpeechSynthesisVoice[], lang: Lang): SpeechSynthesisVoice | null {
  const prefs = lang === 'en' ? ['en-gb', 'en-us', 'en-in', 'en-au', 'en'] : ['ur-pk', 'ur-in', 'ur'];
  const candidates = voices.filter((v) => prefs.some((p) => normLang(v.lang).startsWith(p)));
  if (candidates.length === 0) return null;
  const score = (v: SpeechSynthesisVoice) => {
    const name = v.name.toLowerCase();
    let s = 0;
    if (/natural|neural|online/.test(name)) s += 5;
    if (/google/.test(name)) s += 4;
    if (/premium|enhanced|siri/.test(name)) s += 3;
    if (/compact|espeak|robot/.test(name)) s -= 5;
    const idx = prefs.findIndex((p) => normLang(v.lang).startsWith(p));
    s += (prefs.length - idx) * 0.1;
    return s;
  };
  return [...candidates].sort((a, b) => score(b) - score(a))[0];
}

type SpeechContextValue = {
  supported: boolean;
  activeKey: string | null;
  loadingKey: string | null;
  isReadingAll: boolean;
  slow: boolean;
  setSlow: (v: boolean) => void;
  tapMode: boolean;
  setTapMode: (v: boolean) => void;
  voiceNotice: string | null;
  showUrduHelp: boolean;
  setShowUrduHelp: (v: boolean) => void;
  speak: (key: string, text: string) => void;
  speakAll: (items: SpeakItem[]) => void;
  stop: () => void;
  handleTapWord: (e: MouseEvent<HTMLElement>) => void;
};

const SpeechContext = createContext<SpeechContextValue | null>(null);

export function useSpeech(): SpeechContextValue {
  const ctx = useContext(SpeechContext);
  if (!ctx) throw new Error('useSpeech must be used inside <SpeechProvider>');
  return ctx;
}

export function SpeechProvider({ children }: { children: ReactNode }) {
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [isReadingAll, setIsReadingAll] = useState(false);
  const [slow, setSlow] = useState(false);
  const [tapMode, setTapMode] = useState(true);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [showUrduHelp, setShowUrduHelp] = useState(false);
  const generation = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pendingResolve = useRef<(() => void) | null>(null);
  const clipIndex = useRef<Promise<Set<string>> | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setSupported(typeof Audio !== 'undefined' || 'speechSynthesis' in window);
    if (!('speechSynthesis' in window)) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', load);
      window.speechSynthesis.cancel();
      audioRef.current?.pause();
    };
  }, []);

  /** List of recorded Urdu clips (loaded once, on the first tap). */
  const getClipIndex = useCallback(() => {
    if (!clipIndex.current) {
      clipIndex.current = fetch(`${CLIP_DIR}/index.json`)
        .then((r) => (r.ok ? r.json() : []))
        .then((keys: string[]) => new Set(keys))
        .catch(() => new Set<string>());
    }
    return clipIndex.current;
  }, []);

  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
    }
    return audioRef.current;
  }, []);

  /** Stop whatever is playing right now (recorded clip or device voice). */
  const halt = useCallback(() => {
    audioRef.current?.pause();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    pendingResolve.current?.();
    pendingResolve.current = null;
  }, []);

  const stop = useCallback(() => {
    generation.current += 1;
    halt();
    setActiveKey(null);
    setLoadingKey(null);
    setIsReadingAll(false);
  }, [halt]);

  const playClip = useCallback(
    (url: string, rate: number) =>
      new Promise<void>((resolve, reject) => {
        const a = getAudio();
        a.onended = () => {
          pendingResolve.current = null;
          resolve();
        };
        a.onerror = () => {
          pendingResolve.current = null;
          reject(new Error('clip failed'));
        };
        pendingResolve.current = resolve;
        a.src = url;
        a.defaultPlaybackRate = rate;
        a.playbackRate = rate;
        a.play().catch(reject);
      }),
    [getAudio]
  );

  const deviceSpeak = useCallback(
    (text: string, voice: SpeechSynthesisVoice | null, fallbackLang: string, isSlow: boolean) =>
      new Promise<void>((resolve) => {
        if (!('speechSynthesis' in window)) return resolve();
        const u = new SpeechSynthesisUtterance(text);
        if (voice) u.voice = voice;
        u.lang = voice?.lang || fallbackLang;
        u.rate = isSlow ? 0.7 : 0.92;
        u.onend = () => resolve();
        u.onerror = () => resolve();
        pendingResolve.current = resolve;
        window.speechSynthesis.speak(u);
      }),
    []
  );

  /** Read one item: Urdu parts from recorded clips, English parts with the device voice. */
  const speakText = useCallback(
    async (text: string, gen: number, interactive: boolean) => {
      const segments = splitByScript(cleanForSpeech(text));
      for (const seg of segments) {
        if (gen !== generation.current) return;
        if (seg.lang === 'en') {
          await deviceSpeak(seg.text, pickVoice(voices, 'en'), 'en-GB', slow);
          continue;
        }
        const index = await getClipIndex();
        if (gen !== generation.current) return;
        const key = clipKey(seg.text);
        if (index.has(key)) {
          try {
            await playClip(`${CLIP_DIR}/${key}.mp3`, slow ? 0.85 : 1);
            continue;
          } catch {
            // fall through to the device voice
          }
        }
        const urduVoice = pickVoice(voices, 'ur');
        if (urduVoice) {
          await deviceSpeak(seg.text, urduVoice, 'ur-PK', slow);
        } else if (interactive) {
          setShowUrduHelp(true);
          return;
        } else {
          setVoiceNotice('Some Urdu lines could not be played on this device. Tap “Urdu not speaking?” for help.');
        }
      }
    },
    [voices, slow, deviceSpeak, getClipIndex, playClip]
  );

  /** Read items one after another; the item being read is highlighted. */
  const run = useCallback(
    (items: SpeakItem[], readingAll: boolean) => {
      if (!supported || items.length === 0) return;
      generation.current += 1;
      const gen = generation.current;
      halt();
      // Must happen synchronously inside the tap, or phones block the audio that follows.
      try {
        const a = getAudio();
        a.src = SILENT_WAV;
        a.play().catch(() => {});
      } catch {
        // ignore
      }
      setIsReadingAll(readingAll);

      void (async () => {
        for (const item of items) {
          if (gen !== generation.current) return;
          setActiveKey(item.key);
          setLoadingKey(clipIndex.current ? null : item.key); // spinner only while the clip list loads
          await speakText(item.text, gen, !readingAll);
          setLoadingKey(null);
        }
        if (gen === generation.current) {
          setActiveKey(null);
          setLoadingKey(null);
          setIsReadingAll(false);
        }
      })();
    },
    [supported, halt, getAudio, speakText]
  );

  const speak = useCallback(
    (key: string, text: string) => {
      if (activeKey === key && !isReadingAll) {
        stop(); // second tap on the same icon stops it
        return;
      }
      run([{ key, text }], false);
    },
    [activeKey, isReadingAll, run, stop]
  );

  const speakAll = useCallback((items: SpeakItem[]) => run(items, true), [run]);

  const handleTapWord = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (!tapMode || !supported) return;
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, select, textarea, [data-no-tap]')) return;
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) return; // student is selecting text

      type CaretDoc = {
        caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
        caretRangeFromPoint?: (x: number, y: number) => Range | null;
      };
      const doc = document as unknown as CaretDoc;
      let node: Node | null = null;
      let offset = 0;
      if (doc.caretPositionFromPoint) {
        const pos = doc.caretPositionFromPoint(e.clientX, e.clientY);
        node = pos?.offsetNode ?? null;
        offset = pos?.offset ?? 0;
      } else if (doc.caretRangeFromPoint) {
        const range = doc.caretRangeFromPoint(e.clientX, e.clientY);
        node = range?.startContainer ?? null;
        offset = range?.startOffset ?? 0;
      }
      if (!node || node.nodeType !== Node.TEXT_NODE) return;

      const text = node.textContent || '';
      const isWordChar = (ch: string | undefined) => !!ch && WORD_CHAR.test(ch);
      let start = offset;
      let end = offset;
      while (start > 0 && isWordChar(text[start - 1])) start--;
      while (end < text.length && isWordChar(text[end])) end++;
      const word = text.slice(start, end).replace(/^['’-]+|['’-]+$/g, '');
      if (!word || !/[\p{L}\p{N}]/u.test(word)) return;

      // Briefly highlight the tapped word.
      try {
        const range = document.createRange();
        range.setStart(node, start);
        range.setEnd(node, end);
        selection?.removeAllRanges();
        selection?.addRange(range);
        window.setTimeout(() => window.getSelection()?.removeAllRanges(), 900);
      } catch {
        // highlighting is cosmetic only
      }
      run([{ key: `tap:${word}`, text: word }], false);
    },
    [tapMode, supported, run]
  );

  const value = useMemo<SpeechContextValue>(
    () => ({
      supported,
      activeKey,
      loadingKey,
      isReadingAll,
      slow,
      setSlow,
      tapMode,
      setTapMode,
      voiceNotice,
      showUrduHelp,
      setShowUrduHelp,
      speak,
      speakAll,
      stop,
      handleTapWord,
    }),
    [supported, activeKey, loadingKey, isReadingAll, slow, tapMode, voiceNotice, showUrduHelp, speak, speakAll, stop, handleTapWord]
  );

  return (
    <SpeechContext.Provider value={value}>
      {children}
      <UrduVoiceHelp />
    </SpeechContext.Provider>
  );
}

/** Popup: how to add an Urdu voice to the device (backup for lines that aren't pre-recorded). */
function UrduVoiceHelp() {
  const { showUrduHelp, setShowUrduHelp } = useSpeech();
  if (!showUrduHelp) return null;
  return (
    <div
      className="no-print fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/60 p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="urdu-help-title"
      onClick={() => setShowUrduHelp(false)}
    >
      <div
        className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-3xl bg-white p-5 text-left text-slate-800 shadow-2xl dark:bg-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 id="urdu-help-title" className="text-lg font-extrabold">🔊 Add Urdu voice</h2>
            <p className="font-urdu text-base text-emerald-700 dark:text-emerald-400" dir="rtl">
              اردو آواز سننے کے لیے اپنے فون میں اردو آواز شامل کریں
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowUrduHelp(false)}
            className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-sm opacity-80">
          This Urdu line has no recording yet, and your device has no Urdu voice. You can add one for free:
        </p>
        <div className="space-y-3 text-sm">
          <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
            <p className="font-bold">📱 Android phone</p>
            <ol className="mt-1 list-decimal space-y-0.5 pl-5">
              <li>Open <b>Settings</b> → search <b>“Text-to-speech”</b>.</li>
              <li>Choose <b>Speech Services by Google</b> → tap ⚙️ → <b>Install voice data</b>.</li>
              <li>Select <b>Urdu (اردو)</b> → download → come back and tap 🔊 again.</li>
            </ol>
          </div>
          <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
            <p className="font-bold">💻 Computer / laptop</p>
            <p className="mt-1">Open this page in <b>Microsoft Edge</b> — it already has natural Urdu voices.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
            <p className="font-bold">🍎 iPhone / iPad</p>
            <p className="mt-1">Apple devices have no Urdu voice. Most Urdu in these notes is pre-recorded and still plays.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowUrduHelp(false)}
          className="mt-4 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
        >
          OK
        </button>
      </div>
    </div>
  );
}

/** Small 🔊 button. `id` must be unique on the page; it drives the "now playing" highlight. */
export function SpeakButton({
  id,
  text,
  label,
  className = '',
  tone = 'blue',
}: {
  id: string;
  text: string;
  label?: string;
  className?: string;
  tone?: 'blue' | 'emerald' | 'light';
}) {
  const { supported, speak, activeKey, loadingKey } = useSpeech();
  if (!supported || !text || !text.trim()) return null;
  const active = activeKey === id;
  const loading = loadingKey === id;
  const tones = {
    blue: active
      ? 'bg-[var(--accent)] text-white ring-2 ring-[var(--accent-soft)]'
      : 'bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white',
    emerald: active
      ? 'bg-[var(--accent)] text-white ring-2 ring-[var(--accent-soft)]'
      : 'bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white',
    light: active ? 'bg-white text-blue-700 ring-2 ring-white/60' : 'bg-white/20 text-white hover:bg-white hover:text-blue-700',
  }[tone];
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        speak(id, text);
      }}
      className={`no-print inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full align-middle transition ${tones} ${
        active && !loading ? 'animate-pulse' : ''
      } ${className}`}
      aria-label={label || `Listen: ${text.slice(0, 60)}`}
      title={loading ? 'Loading voice…' : active ? 'Tap to stop' : 'Listen'}
      aria-busy={loading}
    >
      {loading ? (
        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <HiOutlineVolumeUp className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

/** Text with a 🔊 icon in front of every sentence; the sentence being read is highlighted. */
export function SpeakableText({ id, text, tone = 'blue' }: { id: string; text: string; tone?: 'blue' | 'emerald' }) {
  const { activeKey } = useSpeech();
  const sentences = splitSentences(text);
  return (
    <>
      {sentences.map((sentence, i) => {
        const key = `${id}:s${i}`;
        const active = activeKey === key;
        return (
          <span
            key={key}
            className={`rounded-md transition-colors ${active ? 'bg-[var(--marker)] text-[var(--ink)]' : ''}`}
          >
            <SpeakButton id={key} text={sentence} tone={tone} className="mx-1 -mt-0.5" />
            {sentence}{' '}
          </span>
        );
      })}
    </>
  );
}

/** Speech items (one per sentence) for "Listen to whole chapter", keyed to match SpeakableText. */
export function sentenceItems(id: string, text: string): SpeakItem[] {
  return splitSentences(text).map((s, i) => ({ key: `${id}:s${i}`, text: s }));
}

/** The main "Listen" button shown above the chapter text. */
export function ListenControls({ items }: { items: SpeakItem[] }) {
  const { supported, isReadingAll, speakAll, stop, voiceNotice } = useSpeech();
  if (!supported) return null;
  return (
    <>
      {isReadingAll ? (
        <button
          type="button"
          onClick={stop}
          className="no-print inline-flex items-center gap-2 rounded-full bg-[var(--pen)] px-4 py-2 text-sm font-bold text-white shadow-sm"
        >
          <span className="h-2.5 w-2.5 rounded-sm bg-white" aria-hidden /> Stop listening
        </button>
      ) : (
        <button
          type="button"
          onClick={() => items.length && speakAll(items)}
          disabled={items.length === 0}
          className="no-print inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--accent-strong)] disabled:opacity-50"
        >
          <HiOutlineVolumeUp className="h-4 w-4" /> Listen to this chapter
        </button>
      )}
      {voiceNotice && (
        <p className="no-print basis-full rounded-xl border border-[var(--line)] bg-[var(--marker-soft)] px-3 py-2 text-xs font-medium text-[var(--ink)]">
          {voiceNotice}
        </p>
      )}
    </>
  );
}

/** Voice options for the reading-settings sheet. */
export function ListenSettings() {
  const { supported, slow, setSlow, tapMode, setTapMode, setShowUrduHelp } = useSpeech();
  if (!supported) return null;
  const row = 'flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--line)] p-3';
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-semibold text-[var(--ink-soft)]">Voice</legend>
      <label className={row}>
        <input type="checkbox" checked={slow} onChange={(e) => setSlow(e.target.checked)} className="mt-1 h-4 w-4 accent-[var(--accent)]" />
        <span>
          <span className="block text-[15px] font-bold">Slow voice</span>
          <span className="block text-sm text-[var(--ink-soft)]">Reads a little slower, for new readers.</span>
        </span>
      </label>
      <label className={row}>
        <input type="checkbox" checked={tapMode} onChange={(e) => setTapMode(e.target.checked)} className="mt-1 h-4 w-4 accent-[var(--accent)]" />
        <span>
          <span className="block text-[15px] font-bold">Tap a word to hear it</span>
          <span className="block text-sm text-[var(--ink-soft)]">Tap any word in the notes and it is read aloud.</span>
        </span>
      </label>
      <button type="button" onClick={() => setShowUrduHelp(true)} className="text-sm font-bold text-[var(--accent-strong)] underline">
        Urdu not speaking? See how to fix it
      </button>
    </fieldset>
  );
}
