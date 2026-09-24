'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  HiOutlineVolumeUp,
  HiOutlineSparkles,
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
  HiOutlineLightBulb,
  HiOutlinePrinter,
  HiOutlineRefresh,
  HiOutlinePlay,
  HiOutlinePause,
} from 'react-icons/hi';
import { SENTENCE_LIST, SentenceItem } from './sentenceData';

type Mode = 'flashcard' | 'builder' | 'quiz' | 'list' | 'worksheet';

// Web Audio sound effects for instant game feedback without external files
function playTone(freq: number, type: OscillatorType, duration: number, startDelay = 0) {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    setTimeout(() => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    }, startDelay * 1000);
  } catch {
    // Ignore audio errors if blocked
  }
}

function playPop() {
  playTone(520, 'sine', 0.08);
}

function playCorrect() {
  playTone(523.25, 'triangle', 0.12, 0); // C5
  playTone(659.25, 'triangle', 0.12, 0.1); // E5
  playTone(783.99, 'triangle', 0.25, 0.2); // G5
  playTone(1046.5, 'triangle', 0.35, 0.3); // C6
}

function playOops() {
  playTone(280, 'sawtooth', 0.15, 0);
  playTone(240, 'sawtooth', 0.2, 0.12);
}

export default function SentenceLearningPage() {
  const [activeTab, setActiveTab] = useState<Mode>('flashcard');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speechRate, setSpeechRate] = useState<number>(0.85); // 0.7 for slow, 0.85 for normal
  const [showUrdu, setShowUrdu] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [stars, setStars] = useState(0);
  const [highlightedWordIdx, setHighlightedWordIdx] = useState<number | null>(null);

  // Builder mode state
  const [builderWords, setBuilderWords] = useState<{ id: string; word: string }[]>([]);
  const [selectedWords, setSelectedWords] = useState<{ id: string; word: string }[]>([]);
  const [builderCompleted, setBuilderCompleted] = useState(false);
  const [builderHintIdx, setBuilderHintIdx] = useState<number | null>(null);

  // Quiz mode state
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);

  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentSentence = SENTENCE_LIST[currentIndex];

  // Speech helper with customized rate
  const speakText = useCallback(
    (text: string, onEnd?: () => void) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        onEnd?.();
        return;
      }
      window.speechSynthesis.cancel();
      setTimeout(() => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        u.rate = speechRate;
        u.pitch = 1.05;
        if (onEnd) {
          u.onend = () => onEnd();
          u.onerror = () => onEnd();
        }
        window.speechSynthesis.speak(u);
      }, 50);
    },
    [speechRate]
  );

  // Spell out keyword letter by letter
  const spellKeyword = useCallback(
    (word: string) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const letters = word.toUpperCase().split('');
      let i = 0;
      const sayNext = () => {
        if (i >= letters.length) {
          setTimeout(() => speakText(`${word}!`), 250);
          return;
        }
        const u = new SpeechSynthesisUtterance(letters[i]);
        u.lang = 'en-US';
        u.rate = 0.65;
        u.pitch = 1.15;
        u.onend = () => {
          i++;
          setTimeout(sayNext, 180);
        };
        window.speechSynthesis.speak(u);
      };
      sayNext();
    },
    [speakText]
  );

  // Setup builder words when current index or tab changes
  useEffect(() => {
    if (activeTab === 'builder') {
      const words = currentSentence.sentence.split(' ').map((w, i) => ({
        id: `${w}-${i}-${Math.random()}`,
        word: w,
      }));
      // Fisher-Yates shuffle
      const shuffled = [...words];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setBuilderWords(shuffled);
      setSelectedWords([]);
      setBuilderCompleted(false);
      setBuilderHintIdx(null);
    }
  }, [currentIndex, activeTab, currentSentence]);

  // Clean up auto-play timer on unmount
  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Auto-play slideshow logic
  useEffect(() => {
    if (isAutoPlaying && activeTab === 'flashcard') {
      speakText(currentSentence.sentence, () => {
        autoPlayTimerRef.current = setTimeout(() => {
          setCurrentIndex((prev) => {
            const next = (prev + 1) % SENTENCE_LIST.length;
            return next;
          });
        }, 2200);
      });
    } else {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    }
  }, [isAutoPlaying, currentIndex, activeTab, currentSentence, speakText]);

  // Handle single word tap in sentence
  const handleWordTap = (word: string, idx: number) => {
    playPop();
    setHighlightedWordIdx(idx);
    const cleanWord = word.replace(/[^a-zA-Z]/g, '');
    speakText(cleanWord);
    setTimeout(() => setHighlightedWordIdx(null), 1200);
  };

  // Builder mode handlers
  const handlePickBuilderWord = (item: { id: string; word: string }) => {
    if (builderCompleted) return;
    playPop();
    const nextSelected = [...selectedWords, item];
    const nextAvailable = builderWords.filter((w) => w.id !== item.id);
    setSelectedWords(nextSelected);
    setBuilderWords(nextAvailable);
    setBuilderHintIdx(null);

    // Check if sentence is complete
    const fullSentence = currentSentence.sentence;
    const constructed = nextSelected.map((w) => w.word).join(' ');
    if (constructed === fullSentence) {
      setBuilderCompleted(true);
      playCorrect();
      setStars((s) => s + 1);
      setTimeout(() => {
        speakText(`Awesome! ${fullSentence}`);
      }, 300);
    } else if (nextAvailable.length === 0) {
      // Finished placing all words but in wrong order
      playOops();
    }
  };

  const handleRemoveBuilderWord = (item: { id: string; word: string }) => {
    if (builderCompleted) return;
    playPop();
    setSelectedWords(selectedWords.filter((w) => w.id !== item.id));
    setBuilderWords([...builderWords, item]);
    setBuilderHintIdx(null);
  };

  const handleBuilderHint = () => {
    const targetWords = currentSentence.sentence.split(' ');
    const nextExpected = targetWords[selectedWords.length];
    if (!nextExpected) return;
    const matchIdx = builderWords.findIndex((w) => w.word === nextExpected);
    if (matchIdx !== -1) {
      setBuilderHintIdx(matchIdx);
      playTone(440, 'triangle', 0.15);
    }
  };

  const resetBuilder = () => {
    const words = currentSentence.sentence.split(' ').map((w, i) => ({
      id: `${w}-${i}-${Math.random()}`,
      word: w,
    }));
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setBuilderWords(shuffled);
    setSelectedWords([]);
    setBuilderCompleted(false);
    setBuilderHintIdx(null);
  };

  // Quiz questions generation
  const quizQuestion = useMemo(() => {
    const item = SENTENCE_LIST[quizIndex];
    const words = item.sentence.split(' ');
    // Pick the keyword or a prominent word to blank out
    const target = item.keyword;
    const blankSentence = item.sentence.replace(
      new RegExp(`\\b${target}\\b`, 'i'),
      '________'
    );

    // Get 3 incorrect options from other sentences
    const otherKeywords = SENTENCE_LIST.filter((s) => s.id !== item.id)
      .map((s) => s.keyword)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const options = [target, ...otherKeywords].sort(() => Math.random() - 0.5);

    return {
      sentence: blankSentence,
      correctWord: target,
      options,
      item,
    };
  }, [quizIndex]);

  const handleQuizChoice = (choice: string) => {
    if (quizAnswered) return;
    setSelectedOption(choice);
    setQuizAnswered(true);

    const isCorrect = choice.toLowerCase() === quizQuestion.correctWord.toLowerCase();
    if (isCorrect) {
      playCorrect();
      setQuizScore((s) => s + 1);
      setStars((s) => s + 1);
      speakText(`Correct! ${quizQuestion.item.sentence}`);
    } else {
      playOops();
      speakText(`The answer is ${quizQuestion.correctWord}. ${quizQuestion.item.sentence}`);
    }
  };

  const handleNextQuiz = () => {
    if (quizIndex < SENTENCE_LIST.length - 1) {
      setQuizIndex((prev) => prev + 1);
      setQuizAnswered(false);
      setSelectedOption(null);
    } else {
      setQuizFinished(true);
    }
  };

  const restartQuiz = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setQuizAnswered(false);
    setSelectedOption(null);
    setQuizFinished(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 via-sky-50 to-pink-50 px-3 py-6 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-lg backdrop-blur-md sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-fuchsia-500 to-pink-500 text-3xl shadow-md shadow-pink-200">
                📝
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-pink-100 px-3 py-0.5 text-xs font-bold text-pink-700">
                    Ages 4-9 • Kids Sentences
                  </span>
                  <span className="hidden rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-700 sm:inline-block">
                    ✓ Grammar Perfected
                  </span>
                </div>
                <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                  Sentence Learning (جملے سیکھیں)
                </h1>
                <p className="text-xs text-slate-600 sm:text-sm">
                  15 Basic English Sentences with Audio, Urdu Meanings, Word Builder & Quiz!
                </p>
              </div>
            </div>

            {/* Stars counter and score badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 shadow-sm">
                <span className="text-xl">⭐</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Stars Earned</p>
                  <p className="text-lg font-black text-amber-900">{stars}</p>
                </div>
              </div>

              {/* Speed toggle */}
              <button
                type="button"
                onClick={() => setSpeechRate((r) => (r > 0.75 ? 0.7 : 0.85))}
                className="flex items-center gap-1.5 rounded-2xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
                title="Change Audio Speed"
              >
                {speechRate <= 0.7 ? '🐢 Slow (0.7x)' : '🐰 Normal (0.85x)'}
              </button>
            </div>
          </div>

          {/* Action Row & Tabs */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <Link
              href="/educational-resources"
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 hover:text-indigo-600 shadow-sm"
            >
              ← Edu Resources
            </Link>

            {/* Navigation Tabs */}
            <nav className="flex flex-wrap items-center gap-1.5" aria-label="Learning Modes">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('flashcard');
                  setIsAutoPlaying(false);
                }}
                className={`rounded-2xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                  activeTab === 'flashcard'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                🗂️ Flashcards (یاد کریں)
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('builder');
                  setIsAutoPlaying(false);
                }}
                className={`rounded-2xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                  activeTab === 'builder'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                🧩 Build Sentence (جملہ جوڑیں)
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('quiz');
                  setIsAutoPlaying(false);
                }}
                className={`rounded-2xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                  activeTab === 'quiz'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                🎯 Quiz (کوئز)
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('list');
                  setIsAutoPlaying(false);
                }}
                className={`rounded-2xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                  activeTab === 'list'
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                📋 All 15 (فہرست)
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('worksheet');
                  setIsAutoPlaying(false);
                }}
                className={`rounded-2xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                  activeTab === 'worksheet'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                🖨️ Printable (ورک شیٹ)
              </button>
            </nav>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* MODE 1: FLASHCARDS (READ & LISTEN) */}
        {/* ========================================================================= */}
        {activeTab === 'flashcard' && (
          <section className="space-y-6">
            {/* Main Interactive Flashcard */}
            <div
              className={`relative overflow-hidden rounded-3xl border-2 bg-white p-6 shadow-xl transition-all sm:p-10 ${currentSentence.bgLight}`}
            >
              {/* Card top banner */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white">
                    {currentSentence.id}
                  </span>
                  <span
                    className={`rounded-xl border px-3 py-1 text-xs font-bold uppercase tracking-wider ${currentSentence.badgeColor}`}
                  >
                    Keyword: {currentSentence.keyword} ({currentSentence.urduKeyword})
                  </span>
                  <span className="rounded-xl bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    {currentSentence.category}
                  </span>
                </div>

                {/* Urdu toggle & Auto-play button */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUrdu((v) => !v)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                  >
                    {showUrdu ? '👁️ Hide Urdu' : '👁️ Show Urdu'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAutoPlaying((p) => !p)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shadow-sm ${
                      isAutoPlaying
                        ? 'bg-rose-500 text-white hover:bg-rose-600 animate-pulse'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {isAutoPlaying ? <HiOutlinePause className="h-4 w-4" /> : <HiOutlinePlay className="h-4 w-4" />}
                    {isAutoPlaying ? 'Pause Slideshow' : 'Auto Play'}
                  </button>
                </div>
              </div>

              {/* Central Emoji and Sentence display */}
              <div className="my-8 text-center sm:my-12">
                <div className="inline-block transform transition hover:scale-110">
                  <span className="text-7xl sm:text-8xl drop-shadow-sm select-none">
                    {currentSentence.emoji}
                  </span>
                </div>

                {/* Instruction note for kids */}
                <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  👉 Click any word to hear it pronounced!
                </p>

                {/* Large clickable word chips */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  {currentSentence.sentence.split(' ').map((word, wIdx) => {
                    const isKey = word.toLowerCase().includes(currentSentence.keyword.toLowerCase());
                    const isHighlighted = highlightedWordIdx === wIdx;
                    return (
                      <button
                        key={wIdx}
                        type="button"
                        onClick={() => handleWordTap(word, wIdx)}
                        className={`rounded-2xl px-4 py-2.5 text-2xl font-black transition-all transform hover:scale-105 active:scale-95 sm:px-6 sm:py-3.5 sm:text-4xl ${
                          isHighlighted
                            ? 'bg-amber-400 text-slate-900 shadow-lg scale-110 ring-4 ring-amber-300'
                            : isKey
                            ? `bg-gradient-to-r ${currentSentence.gradient} text-white shadow-md shadow-pink-200 ring-2 ring-white`
                            : 'bg-white text-slate-800 shadow-sm border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                        }`}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>

                {/* Urdu translation */}
                {showUrdu && (
                  <div className="mt-6 inline-block rounded-2xl bg-white/90 border border-slate-200 px-6 py-2.5 shadow-sm">
                    <p className="text-lg font-bold text-slate-800 sm:text-2xl" dir="rtl">
                      {currentSentence.urduTranslation}
                    </p>
                  </div>
                )}

                {/* Grammar correction explanation badge */}
                {currentSentence.grammarFixed && currentSentence.grammarNote && (
                  <div className="mx-auto mt-4 max-w-xl rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-left">
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-0.5">💡</span>
                      <div>
                        <p className="text-xs font-bold text-emerald-900">
                          English Grammar Note:
                        </p>
                        <p className="text-xs text-emerald-800">
                          {currentSentence.grammarNote}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Audio Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 border-t border-slate-200/80 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    speakText(currentSentence.sentence);
                  }}
                  className={`flex items-center gap-2 rounded-2xl bg-gradient-to-r ${currentSentence.gradient} px-6 py-3 text-sm font-black text-white shadow-lg transition hover:brightness-105 active:scale-95`}
                >
                  <HiOutlineVolumeUp className="h-5 w-5" />
                  🔊 Read Sentence (پورا جملہ سنیں)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    spellKeyword(currentSentence.keyword);
                  }}
                  className="flex items-center gap-2 rounded-2xl border-2 border-indigo-200 bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-50"
                >
                  <HiOutlineSparkles className="h-5 w-5" />
                  🔤 Spell &quot;{currentSentence.keyword}&quot; (ہجے کریں)
                </button>
              </div>

              {/* Navigation Arrows & Progress */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    setIsAutoPlaying(false);
                    setCurrentIndex((p) => (p === 0 ? SENTENCE_LIST.length - 1 : p - 1));
                  }}
                  className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-100"
                >
                  <HiOutlineArrowLeft className="h-4 w-4" /> Previous
                </button>

                <div className="text-center">
                  <span className="text-xs font-black text-slate-700">
                    Sentence {currentIndex + 1} of {SENTENCE_LIST.length}
                  </span>
                  <div className="mt-1 h-2 w-32 overflow-hidden rounded-full bg-slate-200 sm:w-48">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 to-indigo-600 transition-all duration-300"
                      style={{ width: `${((currentIndex + 1) / SENTENCE_LIST.length) * 100}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    setIsAutoPlaying(false);
                    setCurrentIndex((p) => (p === SENTENCE_LIST.length - 1 ? 0 : p + 1));
                  }}
                  className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-100"
                >
                  Next <HiOutlineArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick-Jump Sentence Drawer */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-800">
                  ⚡ Jump to Any Sentence (کسی بھی جملے پر جائیں):
                </h2>
                <span className="text-xs font-semibold text-slate-500">15 sentences</span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-5">
                {SENTENCE_LIST.map((item, idx) => {
                  const isActive = idx === currentIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        playPop();
                        setIsAutoPlaying(false);
                        setCurrentIndex(idx);
                      }}
                      className={`flex flex-col items-center justify-center rounded-2xl border p-2.5 text-center transition ${
                        isActive
                          ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-400 font-bold shadow-sm'
                          : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="text-2xl">{item.emoji}</span>
                      <span className="mt-1 text-xs font-black text-slate-800 truncate w-full">
                        {item.id}. {item.keyword}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: SENTENCE BUILDER / JUMLA BANAO */}
        {/* ========================================================================= */}
        {activeTab === 'builder' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                  Sentence #{currentSentence.id} of 15
                </span>
                <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                  🧩 Build the Sentence (جملہ ترتیب دیں)
                </h2>
                <p className="text-xs text-slate-500">
                  Tap the words below in the correct order to make the complete sentence!
                </p>
              </div>

              {/* Urdu reference & Hint button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBuilderHint}
                  disabled={builderCompleted}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                >
                  <HiOutlineLightBulb className="h-4 w-4" /> 💡 Clue / Hint
                </button>
                <button
                  type="button"
                  onClick={resetBuilder}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  <HiOutlineRefresh className="h-4 w-4" /> Reset
                </button>
              </div>
            </div>

            {/* Hint Urdu preview */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-indigo-50/70 p-4 border border-indigo-100">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{currentSentence.emoji}</span>
                <div>
                  <p className="text-xs font-bold text-indigo-900">Sentence meaning in Urdu:</p>
                  <p className="text-base font-bold text-indigo-950" dir="rtl">
                    {currentSentence.urduTranslation}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => speakText(currentSentence.sentence)}
                className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 border border-indigo-200 shadow-sm hover:bg-indigo-50"
              >
                🔊 Listen to sentence
              </button>
            </div>

            {/* Target Slots: Words placed so far */}
            <div className="my-8">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                Your Sentence Line:
              </p>
              <div className="min-h-24 rounded-3xl border-2 border-dashed border-indigo-200 bg-slate-50/60 p-4 flex flex-wrap items-center justify-center gap-2">
                {selectedWords.length === 0 ? (
                  <p className="text-sm font-semibold text-slate-400 italic">
                    Tap the word bubbles below to put them here...
                  </p>
                ) : (
                  selectedWords.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleRemoveBuilderWord(item)}
                      disabled={builderCompleted}
                      className="group flex items-center gap-1 rounded-2xl bg-indigo-600 px-4 py-2.5 text-lg font-black text-white shadow-md hover:bg-indigo-700 transition"
                      title="Tap to remove"
                    >
                      <span>{item.word}</span>
                      {!builderCompleted && (
                        <span className="text-xs text-indigo-200 group-hover:text-white">✕</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Success Celebration Banner */}
            {builderCompleted && (
              <div className="my-6 rounded-3xl bg-emerald-50 border-2 border-emerald-400 p-6 text-center shadow-lg animate-bounce">
                <span className="text-4xl">🎉 ⭐ 🥳</span>
                <h3 className="mt-2 text-xl font-black text-emerald-800 sm:text-2xl">
                  Shabash! Perfect Sentence!
                </h3>
                <p className="mt-1 text-sm font-bold text-emerald-900">
                  &quot;{currentSentence.sentence}&quot;
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => speakText(currentSentence.sentence)}
                    className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700"
                  >
                    🔊 Hear Again
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentIndex((p) => (p + 1) % SENTENCE_LIST.length);
                    }}
                    className="rounded-2xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700"
                  >
                    Next Sentence (اگلا جملہ) ➔
                  </button>
                </div>
              </div>
            )}

            {/* Available Word Bubbles to Tap */}
            {!builderCompleted && (
              <div className="my-6">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Pick the next word:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {builderWords.map((item, idx) => {
                    const isHinted = builderHintIdx === idx;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handlePickBuilderWord(item)}
                        className={`rounded-2xl px-5 py-3 text-xl font-black transition transform active:scale-95 shadow-md ${
                          isHinted
                            ? 'bg-amber-400 text-slate-900 ring-4 ring-amber-300 animate-pulse scale-105'
                            : 'bg-white border-2 border-slate-200 text-slate-800 hover:border-indigo-400 hover:bg-indigo-50'
                        }`}
                      >
                        {item.word}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom switcher for sentences */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setCurrentIndex((p) => (p === 0 ? SENTENCE_LIST.length - 1 : p - 1))}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                ← Previous
              </button>
              <span className="text-xs font-black text-slate-600">
                Sentence {currentSentence.id} / 15
              </span>
              <button
                type="button"
                onClick={() => setCurrentIndex((p) => (p + 1) % SENTENCE_LIST.length)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Next →
              </button>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* MODE 3: QUIZ / FILL IN THE BLANKS */}
        {/* ========================================================================= */}
        {activeTab === 'quiz' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
            {!quizFinished ? (
              <div>
                {/* Header score & status */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                      Question {quizIndex + 1} of {SENTENCE_LIST.length}
                    </span>
                    <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                      🎯 Fill in the Missing Word
                    </h2>
                  </div>
                  <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-2 text-center">
                    <p className="text-[10px] font-bold text-amber-700 uppercase">Score</p>
                    <p className="text-xl font-black text-amber-900">
                      {quizScore} / {quizIndex + (quizAnswered ? 1 : 0)}
                    </p>
                  </div>
                </div>

                {/* Question Area */}
                <div className="my-8 text-center">
                  <span className="text-6xl drop-shadow-sm select-none">
                    {quizQuestion.item.emoji}
                  </span>
                  <div className="mt-4 inline-block rounded-2xl bg-indigo-50 border border-indigo-200 px-6 py-4 shadow-sm">
                    <p className="text-2xl font-black text-slate-900 sm:text-3xl">
                      {quizQuestion.sentence}
                    </p>
                  </div>

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => speakText(quizQuestion.sentence.replace('________', 'blank'))}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      <HiOutlineVolumeUp className="h-4 w-4" /> Listen to question
                    </button>
                  </div>

                  <p className="mt-2 text-sm font-bold text-slate-600" dir="rtl">
                    اردو مطلب: {quizQuestion.item.urduTranslation}
                  </p>
                </div>

                {/* 4 Interactive Choices */}
                <div className="my-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {quizQuestion.options.map((option) => {
                    const isSelected = selectedOption === option;
                    const isCorrect = option.toLowerCase() === quizQuestion.correctWord.toLowerCase();
                    let btnStyle =
                      'bg-white border-2 border-slate-200 text-slate-800 hover:border-indigo-400 hover:bg-indigo-50';

                    if (quizAnswered) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-500 border-2 border-emerald-600 text-white font-black shadow-lg';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-500 border-2 border-rose-600 text-white font-black';
                      } else {
                        btnStyle = 'bg-slate-100 border-2 border-slate-200 text-slate-400 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleQuizChoice(option)}
                        disabled={quizAnswered}
                        className={`rounded-2xl p-4 text-xl font-bold transition transform active:scale-95 text-center shadow-sm ${btnStyle}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {/* Answer Feedback & Next Button */}
                {quizAnswered && (
                  <div className="mt-6 flex flex-col items-center justify-center gap-3">
                    <div
                      className={`rounded-2xl px-5 py-2.5 text-sm font-bold ${
                        selectedOption?.toLowerCase() === quizQuestion.correctWord.toLowerCase()
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {selectedOption?.toLowerCase() === quizQuestion.correctWord.toLowerCase()
                        ? '✅ Brilliant! That is correct!'
                        : `❌ Oops! The correct word is: "${quizQuestion.correctWord}"`}
                    </div>

                    <button
                      type="button"
                      onClick={handleNextQuiz}
                      className="rounded-2xl bg-indigo-600 px-8 py-3 text-base font-black text-white shadow-lg hover:bg-indigo-700 transition"
                    >
                      {quizIndex < SENTENCE_LIST.length - 1 ? 'Next Question ➔' : 'View Quiz Result 🏆'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Quiz Finished View */
              <div className="py-8 text-center space-y-4">
                <span className="text-7xl">🏆 ⭐ 🎖️</span>
                <h3 className="text-2xl font-black text-slate-900 sm:text-3xl">
                  Quiz Completed!
                </h3>
                <p className="text-base text-slate-600">
                  You scored <span className="font-black text-indigo-600 text-2xl">{quizScore}</span> out of{' '}
                  <span className="font-bold">{SENTENCE_LIST.length}</span>!
                </p>

                <div className="mx-auto max-w-sm rounded-2xl bg-indigo-50 border border-indigo-200 p-4">
                  <p className="text-sm font-bold text-indigo-900">
                    {quizScore >= 13
                      ? '🌟 Outstanding! You have mastered these 15 sentences!'
                      : quizScore >= 9
                      ? '👏 Great effort! Practice once more to get 100%!'
                      : '💪 Good try! Review the flashcards and try again!'}
                  </p>
                </div>

                <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={restartQuiz}
                    className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700"
                  >
                    ↺ Play Quiz Again
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('flashcard')}
                    className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    🗂️ Go to Flashcards
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ========================================================================= */}
        {/* MODE 4: ALL 15 SENTENCES LIST VIEW */}
        {/* ========================================================================= */}
        {activeTab === 'list' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
                  📋 15 Basic English Sentences for Kids
                </h2>
                <p className="text-xs text-slate-500 sm:text-sm">
                  Complete list with corrected grammar, Urdu translation, and instant audio playback.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  let i = 0;
                  const playNext = () => {
                    if (i >= SENTENCE_LIST.length) return;
                    setCurrentIndex(i);
                    speakText(SENTENCE_LIST[i].sentence, () => {
                      i++;
                      setTimeout(playNext, 1200);
                    });
                  };
                  playNext();
                }}
                className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700"
              >
                <HiOutlineVolumeUp className="h-4 w-4" /> ▶️ Listen to All 15 in Sequence
              </button>
            </div>

            {/* Sentences Table / Cards */}
            <div className="mt-6 space-y-3">
              {SENTENCE_LIST.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 transition hover:shadow-md ${
                    idx === currentIndex
                      ? 'border-indigo-400 bg-indigo-50/50 ring-2 ring-indigo-200'
                      : 'border-slate-200 bg-white hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white">
                      {item.id}
                    </span>
                    <span className="text-3xl">{item.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-pink-600">
                          {item.keyword}
                        </span>
                        {item.grammarFixed && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            Grammar Corrected
                          </span>
                        )}
                      </div>
                      <p className="text-lg font-black text-slate-900 sm:text-xl">
                        {item.sentence}
                      </p>
                      <p className="text-xs font-semibold text-slate-500" dir="rtl">
                        {item.urduTranslation}
                      </p>
                      {item.grammarFixed && item.grammarNote && (
                        <p className="mt-1 text-[11px] text-emerald-700 italic">
                          💡 {item.grammarNote}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        playPop();
                        setCurrentIndex(idx);
                        speakText(item.sentence);
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                    >
                      <HiOutlineVolumeUp className="h-4 w-4" /> Listen
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentIndex(idx);
                        setActiveTab('flashcard');
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                    >
                      Card ➔
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* MODE 5: PRINTABLE WORKSHEETS & HANDWRITING PRACTICE */}
        {/* ========================================================================= */}
        {activeTab === 'worksheet' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 print:hidden">
              <div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                  Print & Learn Offline
                </span>
                <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                  🖨️ Printable Handwriting & Practice Worksheet
                </h2>
                <p className="text-xs text-slate-500">
                  Ready-to-print activity sheet with English four-line ruling for handwriting practice!
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') window.print();
                }}
                className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg hover:bg-blue-700 transition"
              >
                <HiOutlinePrinter className="h-5 w-5" /> 🖨️ Print Worksheet Now
              </button>
            </div>

            {/* Printable Paper Area */}
            <div className="mt-6 rounded-2xl border-2 border-slate-300 p-6 sm:p-8 bg-white print:border-none print:p-0">
              {/* Worksheet Header */}
              <div className="border-b-2 border-slate-900 pb-4 text-center">
                <h3 className="text-2xl font-black tracking-wide text-slate-900">
                  MASTER SAHIB KIDS LEARNING ACADEMY
                </h3>
                <p className="text-xs font-bold uppercase text-slate-600">
                  English Sentence Practice & Tracing Worksheet • 15 Sentences
                </p>
                <div className="mt-4 flex justify-between text-xs font-bold text-slate-800">
                  <span>Student Name: _______________________</span>
                  <span>Class / Section: _________</span>
                  <span>Date: ____________</span>
                </div>
              </div>

              {/* Instructions */}
              <div className="my-4 rounded-xl bg-slate-100 p-3 text-xs font-semibold text-slate-700 print:bg-white print:border print:border-slate-300">
                ✏️ <strong>Instructions:</strong> Read the sentence aloud, learn the keyword, and write the sentence neatly on the lines below.
              </div>

              {/* Sentences with handwriting lines */}
              <div className="space-y-4">
                {SENTENCE_LIST.map((item) => (
                  <div key={item.id} className="border-b border-slate-200 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">
                          {item.id}.
                        </span>
                        <span className="text-xl">{item.emoji}</span>
                        <span className="text-base font-black text-slate-900">
                          {item.sentence}
                        </span>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                          Keyword: {item.keyword}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-500" dir="rtl">
                        {item.urduTranslation}
                      </span>
                    </div>

                    {/* Handwriting ruling guide lines */}
                    <div className="mt-2 pl-6 space-y-2">
                      <div className="w-full border-b border-dashed border-slate-300 h-3" />
                      <div className="w-full border-b border-slate-400 h-3" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Worksheet Footer */}
              <div className="mt-8 border-t border-slate-300 pt-4 flex justify-between text-xs font-bold text-slate-500">
                <span>Total Sentences: 15</span>
                <span>Teacher Signature: __________________</span>
                <span>Remarks: ⭐⭐⭐⭐⭐</span>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
