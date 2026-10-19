'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  HiOutlineVolumeUp,
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineLightBulb,
  HiOutlinePrinter,
  HiOutlineRefresh,
  HiOutlinePlay,
  HiOutlinePause,
  HiOutlineSearch,
} from 'react-icons/hi';
import {
  ALL_NUMBERS,
  KEY_1_TO_19,
  KEY_TENS,
  TRICKY_SPELLINGS,
  NumberItem,
} from './numberData';

type Mode = 'flashcard' | 'speller' | 'quiz' | 'chart' | 'worksheet';
type NumberFilter = 'all' | '1-19' | 'tens' | 'tricky';

// Web Audio sound effects for game feedback
function playTone(freq: number, type: OscillatorType, duration: number, startDelay = 0) {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
  playTone(540, 'sine', 0.08);
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

export default function NumbersInWordsPage() {
  const [activeTab, setActiveTab] = useState<Mode>('flashcard');
  const [filter, setFilter] = useState<NumberFilter>('1-19');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speechRate, setSpeechRate] = useState<number>(0.75); // 0.65 slow, 0.75 ideal, 0.85 normal
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [stars, setStars] = useState(0);
  const [highlightedLetterIdx, setHighlightedLetterIdx] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoPlayStatus, setAutoPlayStatus] = useState<'idle' | 'speaking' | 'pausing'>('idle');

  // Chart explorer state
  const [chartSearch, setChartSearch] = useState('');
  const [chartRange, setChartRange] = useState<'all' | '1-20' | '21-40' | '41-60' | '61-80' | '81-100' | 'tens'>('1-20');

  // Spelling builder game state
  const [spellerLetters, setSpellerLetters] = useState<{ id: string; char: string }[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<{ id: string; char: string }[]>([]);
  const [spellerCompleted, setSpellerCompleted] = useState(false);
  const [spellerHintIdx, setSpellerHintIdx] = useState<number | null>(null);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);

  // Timers and refs
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const letterTimerRef = useRef<NodeJS.Timeout[]>([]);
  const isAutoPlayingRef = useRef(isAutoPlaying);
  isAutoPlayingRef.current = isAutoPlaying;

  // Active dataset based on filter
  const activeList = useMemo(() => {
    switch (filter) {
      case '1-19':
        return KEY_1_TO_19;
      case 'tens':
        return KEY_TENS;
      case 'tricky':
        return TRICKY_SPELLINGS;
      case 'all':
      default:
        return ALL_NUMBERS;
    }
  }, [filter]);

  // Ensure currentIndex stays within bounds of the active list
  useEffect(() => {
    if (currentIndex >= activeList.length) {
      setCurrentIndex(0);
    }
  }, [activeList, currentIndex]);

  const currentItem = activeList[currentIndex] || activeList[0] || ALL_NUMBERS[0];

  // Stop speech & timers
  const stopSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    letterTimerRef.current.forEach(clearTimeout);
    letterTimerRef.current = [];
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
    setIsSpeaking(false);
    setHighlightedLetterIdx(null);
    setAutoPlayStatus('idle');
  }, []);

  // Speak text helper
  const speakText = useCallback(
    (text: string, onEnd?: () => void) => {
      stopSpeech();
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        onEnd?.();
        return;
      }
      setIsSpeaking(true);
      setTimeout(() => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        u.rate = speechRate;
        u.pitch = 1.05;

        const handleFinish = () => {
          setIsSpeaking(false);
          onEnd?.();
        };

        u.onend = handleFinish;
        u.onerror = handleFinish;
        window.speechSynthesis.speak(u);
      }, 50);
    },
    [speechRate, stopSpeech]
  );

  // Spell out number word letter by letter with visual highlighting
  const spellWordLetterByLetter = useCallback(
    (item: NumberItem, onFinished?: () => void) => {
      stopSpeech();
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        onFinished?.();
        return;
      }

      setIsSpeaking(true);
      setAutoPlayStatus('speaking');

      // Filter out hyphens for speech spelling but keep track of indices
      const chars = item.word.toUpperCase().split('');
      let i = 0;

      const sayNextChar = () => {
        if (i >= chars.length) {
          // Done spelling letters, now pronounce full word
          setHighlightedLetterIdx(null);
          setTimeout(() => {
            const uFinal = new SpeechSynthesisUtterance(item.word);
            uFinal.lang = 'en-US';
            uFinal.rate = speechRate;
            uFinal.pitch = 1.05;
            uFinal.onend = () => {
              setIsSpeaking(false);
              onFinished?.();
            };
            uFinal.onerror = () => {
              setIsSpeaking(false);
              onFinished?.();
            };
            window.speechSynthesis.speak(uFinal);
          }, 300);
          return;
        }

        const char = chars[i];
        setHighlightedLetterIdx(i);

        if (char === '-' || char === ' ') {
          i++;
          setTimeout(sayNextChar, 100);
          return;
        }

        const u = new SpeechSynthesisUtterance(char);
        u.lang = 'en-US';
        u.rate = 0.65;
        u.pitch = 1.15;
        u.onend = () => {
          i++;
          const t = setTimeout(sayNextChar, 200);
          letterTimerRef.current.push(t);
        };
        u.onerror = () => {
          setIsSpeaking(false);
          onFinished?.();
        };
        window.speechSynthesis.speak(u);
      };

      sayNextChar();
    },
    [speechRate, stopSpeech]
  );

  // Setup speller game letters
  useEffect(() => {
    if (activeTab === 'speller') {
      const cleanWord = currentItem.word.toUpperCase().replace('-', '');
      const letters = cleanWord.split('').map((ch, i) => ({
        id: `${ch}-${i}-${Math.random()}`,
        char: ch,
      }));
      // Fisher-Yates shuffle
      const shuffled = [...letters];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setSpellerLetters(shuffled);
      setSelectedLetters([]);
      setSpellerCompleted(false);
      setSpellerHintIdx(null);
    }
  }, [currentIndex, activeTab, currentItem]);

  // Clean up timers on unmount or tab switch
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [stopSpeech, activeTab]);

  // Auto-play slideshow logic
  useEffect(() => {
    if (isAutoPlaying && activeTab === 'flashcard') {
      spellWordLetterByLetter(currentItem, () => {
        if (!isAutoPlayingRef.current) return;
        setAutoPlayStatus('pausing');
        autoPlayTimerRef.current = setTimeout(() => {
          if (isAutoPlayingRef.current) {
            setCurrentIndex((prev) => (prev + 1) % activeList.length);
          }
        }, 2200);
      });
    } else {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
      setAutoPlayStatus('idle');
    }
  }, [isAutoPlaying, currentIndex, activeTab, currentItem, activeList.length, spellWordLetterByLetter]);

  // Speller game handlers
  const handlePickSpellerLetter = (item: { id: string; char: string }) => {
    if (spellerCompleted) return;
    playPop();
    const nextSelected = [...selectedLetters, item];
    const nextAvailable = spellerLetters.filter((l) => l.id !== item.id);
    setSelectedLetters(nextSelected);
    setSpellerLetters(nextAvailable);
    setSpellerHintIdx(null);

    const targetClean = currentItem.word.toUpperCase().replace('-', '');
    const constructed = nextSelected.map((l) => l.char).join('');

    if (constructed === targetClean) {
      setSpellerCompleted(true);
      playCorrect();
      setStars((s) => s + 1);
      setTimeout(() => {
        speakText(`Awesome! ${currentItem.word}!`);
      }, 300);
    } else if (nextAvailable.length === 0) {
      playOops();
    }
  };

  const handleRemoveSpellerLetter = (item: { id: string; char: string }) => {
    if (spellerCompleted) return;
    playPop();
    setSelectedLetters(selectedLetters.filter((l) => l.id !== item.id));
    setSpellerLetters([...spellerLetters, item]);
    setSpellerHintIdx(null);
  };

  const handleSpellerHint = () => {
    const targetClean = currentItem.word.toUpperCase().replace('-', '');
    const nextExpected = targetClean[selectedLetters.length];
    if (!nextExpected) return;
    const matchIdx = spellerLetters.findIndex((l) => l.char === nextExpected);
    if (matchIdx !== -1) {
      setSpellerHintIdx(matchIdx);
      playTone(440, 'triangle', 0.15);
    }
  };

  const resetSpeller = () => {
    const cleanWord = currentItem.word.toUpperCase().replace('-', '');
    const letters = cleanWord.split('').map((ch, i) => ({
      id: `${ch}-${i}-${Math.random()}`,
      char: ch,
    }));
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    setSpellerLetters(shuffled);
    setSelectedLetters([]);
    setSpellerCompleted(false);
    setSpellerHintIdx(null);
  };

  // Quiz questions generation
  const quizItems = useMemo(() => {
    // Pick 15 diverse numbers covering 1-19, tens, and compound numbers
    return [
      ALL_NUMBERS[0], // 1
      ALL_NUMBERS[3], // 4
      ALL_NUMBERS[7], // 8
      ALL_NUMBERS[11], // 12
      ALL_NUMBERS[12], // 13
      ALL_NUMBERS[13], // 14
      ALL_NUMBERS[14], // 15
      ALL_NUMBERS[17], // 18
      ALL_NUMBERS[18], // 19
      ALL_NUMBERS[19], // 20
      ALL_NUMBERS[29], // 30
      ALL_NUMBERS[39], // 40
      ALL_NUMBERS[49], // 50
      ALL_NUMBERS[79], // 80
      ALL_NUMBERS[99], // 100
    ];
  }, []);

  const quizQuestion = useMemo(() => {
    const targetItem = quizItems[quizIndex % quizItems.length];
    const targetWord = targetItem.word;

    // Generate 3 plausible distracting options (e.g. forty vs fourty, fifteen vs fiveteen)
    const optionsSet = new Set<string>([targetWord]);

    if (targetItem.num === 40) {
      optionsSet.add('fourty');
      optionsSet.add('fourteen');
      optionsSet.add('fifty');
    } else if (targetItem.num === 15) {
      optionsSet.add('fiveteen');
      optionsSet.add('fifty');
      optionsSet.add('fourteen');
    } else if (targetItem.num === 18) {
      optionsSet.add('eightteen');
      optionsSet.add('eighty');
      optionsSet.add('seventeen');
    } else if (targetItem.num === 12) {
      optionsSet.add('twenteen');
      optionsSet.add('twenty');
      optionsSet.add('eleven');
    } else if (targetItem.num === 13) {
      optionsSet.add('threeteen');
      optionsSet.add('thirty');
      optionsSet.add('fourteen');
    } else {
      // Pick random words from active numbers
      const pool = ALL_NUMBERS.filter((n) => n.num !== targetItem.num)
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);
      pool.forEach((p) => {
        if (optionsSet.size < 4) optionsSet.add(p.word);
      });
    }

    const options = Array.from(optionsSet).slice(0, 4).sort(() => Math.random() - 0.5);

    return {
      item: targetItem,
      correctWord: targetWord,
      options,
    };
  }, [quizItems, quizIndex]);

  const handleQuizChoice = (choice: string) => {
    if (quizAnswered) return;
    setSelectedQuizOption(choice);
    setQuizAnswered(true);

    const isCorrect = choice.toLowerCase() === quizQuestion.correctWord.toLowerCase();
    if (isCorrect) {
      playCorrect();
      setQuizScore((s) => s + 1);
      setStars((s) => s + 1);
      speakText(`Correct! ${quizQuestion.item.num} is ${quizQuestion.correctWord}!`);
    } else {
      playOops();
      speakText(`The correct spelling is ${quizQuestion.correctWord}.`);
    }
  };

  const handleNextQuiz = () => {
    stopSpeech();
    if (quizIndex < quizItems.length - 1) {
      setQuizIndex((prev) => prev + 1);
      setQuizAnswered(false);
      setSelectedQuizOption(null);
    } else {
      setQuizFinished(true);
    }
  };

  const restartQuiz = () => {
    stopSpeech();
    setQuizIndex(0);
    setQuizScore(0);
    setQuizAnswered(false);
    setSelectedQuizOption(null);
    setQuizFinished(false);
  };

  // Filtered chart numbers for Explorer mode
  const filteredChartNumbers = useMemo(() => {
    return ALL_NUMBERS.filter((item) => {
      // Range filter
      if (chartRange === '1-20' && (item.num < 1 || item.num > 20)) return false;
      if (chartRange === '21-40' && (item.num < 21 || item.num > 40)) return false;
      if (chartRange === '41-60' && (item.num < 41 || item.num > 60)) return false;
      if (chartRange === '61-80' && (item.num < 61 || item.num > 80)) return false;
      if (chartRange === '81-100' && (item.num < 81 || item.num > 100)) return false;
      if (chartRange === 'tens' && item.num % 10 !== 0) return false;

      // Text search filter
      if (chartSearch.trim()) {
        const q = chartSearch.trim().toLowerCase();
        return String(item.num).includes(q) || item.word.toLowerCase().includes(q);
      }
      return true;
    });
  }, [chartRange, chartSearch]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-pink-50 px-3 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Top Header Card */}
        <header className="rounded-3xl border border-white/60 bg-white/90 p-5 shadow-lg backdrop-blur-md sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-3xl shadow-md shadow-orange-200">
                🔢
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-orange-100 px-3 py-0.5 text-xs font-bold text-orange-700">
                    Ages 5-11 • Math & English
                  </span>
                  <span className="hidden rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-700 sm:inline-block">
                    ✓ 1 to 100 Complete Words
                  </span>
                </div>
                <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                  Numbers in Words (1 to 100)
                </h1>
                <p className="text-xs text-slate-600 sm:text-sm">
                  Master number spellings from 1 to 100 with audio, letter-by-letter spelling, games, and worksheets!
                </p>
              </div>
            </div>

            {/* Stars counter and Speed Toggle */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 shadow-sm">
                <span className="text-xl">⭐</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Stars Earned</p>
                  <p className="text-lg font-black text-amber-900">{stars}</p>
                </div>
              </div>

              {/* Speed selector */}
              <div className="flex items-center gap-1 rounded-2xl border border-amber-200 bg-amber-50/80 p-1">
                <button
                  type="button"
                  onClick={() => setSpeechRate(0.65)}
                  className={`rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                    speechRate === 0.65
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-amber-800 hover:bg-amber-100'
                  }`}
                  title="Very Slow Pace"
                >
                  🐢 Slow
                </button>
                <button
                  type="button"
                  onClick={() => setSpeechRate(0.75)}
                  className={`rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                    speechRate === 0.75
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-amber-800 hover:bg-amber-100'
                  }`}
                  title="Recommended Clear Pace"
                >
                  ✨ Clear
                </button>
                <button
                  type="button"
                  onClick={() => setSpeechRate(0.85)}
                  className={`rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
                    speechRate === 0.85
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-amber-800 hover:bg-amber-100'
                  }`}
                  title="Normal Conversational Speed"
                >
                  🐰 Fast
                </button>
              </div>
            </div>
          </div>

          {/* Action Row & Navigation Tabs */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <Link
              href="/educational-resources"
              onClick={stopSpeech}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 hover:text-indigo-600 shadow-sm"
            >
              ← Edu Resources
            </Link>

            <nav className="flex flex-wrap items-center gap-1.5" aria-label="Learning Modes">
              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  setActiveTab('flashcard');
                  setIsAutoPlaying(false);
                }}
                className={`rounded-2xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                  activeTab === 'flashcard'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                🗂️ Flashcards
              </button>

              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  setActiveTab('speller');
                  setIsAutoPlaying(false);
                }}
                className={`rounded-2xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                  activeTab === 'speller'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                🧩 Spell the Number
              </button>

              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  setActiveTab('quiz');
                  setIsAutoPlaying(false);
                }}
                className={`rounded-2xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                  activeTab === 'quiz'
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                🎯 Spelling Quiz
              </button>

              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  setActiveTab('chart');
                  setIsAutoPlaying(false);
                }}
                className={`rounded-2xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                  activeTab === 'chart'
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                📋 1-100 Chart
              </button>

              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  setActiveTab('worksheet');
                  setIsAutoPlaying(false);
                }}
                className={`rounded-2xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                  activeTab === 'worksheet'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                🖨️ Printable Worksheets
              </button>
            </nav>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* MODE 1: FLASHCARDS (MEMORIZE 1-19, TENS, TRICKY SPELLINGS & 1-100) */}
        {/* ========================================================================= */}
        {activeTab === 'flashcard' && (
          <section className="space-y-6">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3 shadow-sm border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Select Study Group:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    stopSpeech();
                    setFilter('1-19');
                    setCurrentIndex(0);
                  }}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    filter === '1-19'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🌟 Core 1 to 19 (19 words)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopSpeech();
                    setFilter('tens');
                    setCurrentIndex(0);
                  }}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    filter === 'tens'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🔟 The Tens: 20 to 100 (9 words)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopSpeech();
                    setFilter('tricky');
                    setCurrentIndex(0);
                  }}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    filter === 'tricky'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  ⚠️ Tricky Traps (forty, fifteen, etc.)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopSpeech();
                    setFilter('all');
                    setCurrentIndex(0);
                  }}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    filter === 'all'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  💯 All 1 to 100
                </button>
              </div>
            </div>

            {/* Main Interactive Flashcard */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-amber-200 bg-white p-6 shadow-xl sm:p-10">
              {/* Card top bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-sm font-black text-white">
                    {currentIndex + 1}
                  </span>
                  <span className="rounded-xl border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 uppercase tracking-wider">
                    {currentItem.category}
                  </span>
                  <span className="rounded-xl bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    Syllables: {currentItem.syllables}
                  </span>
                </div>

                {/* Auto Play Button */}
                <div className="flex items-center gap-2">
                  {isAutoPlaying && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold ${
                        autoPlayStatus === 'speaking'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {autoPlayStatus === 'speaking' ? '🔊 Spelling...' : '⏳ Next number...'}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (isAutoPlaying) {
                        stopSpeech();
                        setIsAutoPlaying(false);
                      } else {
                        setIsAutoPlaying(true);
                      }
                    }}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition shadow-sm ${
                      isAutoPlaying
                        ? 'bg-rose-500 text-white hover:bg-rose-600'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {isAutoPlaying ? <HiOutlinePause className="h-4 w-4" /> : <HiOutlinePlay className="h-4 w-4" />}
                    {isAutoPlaying ? 'Pause Slideshow' : 'Auto Play'}
                  </button>
                </div>
              </div>

              {/* Central Display: Big Digit & Letter Chips */}
              <div className="my-8 text-center sm:my-12">
                {/* Digit */}
                <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 text-5xl font-black text-white shadow-xl shadow-orange-200 sm:h-32 sm:w-32 sm:text-7xl">
                  {currentItem.num}
                </div>

                <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                  👉 Click any letter to hear its sound!
                </p>

                {/* Letter-by-letter clickable tiles */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  {currentItem.word.toUpperCase().split('').map((char, cIdx) => {
                    const isHighlighted = highlightedLetterIdx === cIdx;
                    if (char === '-') {
                      return (
                        <span key={cIdx} className="text-3xl font-black text-amber-500 select-none">
                          -
                        </span>
                      );
                    }
                    if (char === ' ') {
                      return <span key={cIdx} className="w-4" />;
                    }

                    return (
                      <button
                        key={cIdx}
                        type="button"
                        onClick={() => {
                          playPop();
                          speakText(char);
                          setHighlightedLetterIdx(cIdx);
                          setTimeout(() => setHighlightedLetterIdx(null), 500);
                        }}
                        className={`relative rounded-2xl px-4 py-2.5 text-2xl font-black transition-all duration-150 transform sm:px-5 sm:py-3 sm:text-4xl ${
                          isHighlighted
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 scale-110 shadow-2xl ring-4 ring-amber-400 z-10'
                            : 'bg-white text-slate-800 shadow-sm border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 hover:scale-105 active:scale-95'
                        }`}
                      >
                        {char}
                      </button>
                    );
                  })}
                </div>

                {/* Spelling Tip or Trap Alert */}
                {currentItem.tip && (
                  <div className="mx-auto mt-6 max-w-lg rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-left shadow-sm">
                    <div className="flex items-start gap-2.5">
                      <span className="text-xl">💡</span>
                      <div>
                        <p className="text-xs font-bold text-amber-900">Spelling Rule / Alert:</p>
                        <p className="text-xs text-amber-800 mt-0.5">{currentItem.tip}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Audio Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    speakText(currentItem.word);
                  }}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-black text-white shadow-lg transition hover:brightness-105 active:scale-95"
                >
                  <HiOutlineVolumeUp className="h-5 w-5" />
                  🔊 Say &quot;{currentItem.word}&quot;
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playPop();
                    spellWordLetterByLetter(currentItem);
                  }}
                  className="flex items-center gap-2 rounded-2xl border-2 border-amber-300 bg-white px-5 py-3 text-sm font-bold text-amber-800 shadow-sm transition hover:bg-amber-50"
                >
                  🔤 Spell Letter-by-Letter
                </button>
              </div>

              {/* Navigation Arrows */}
              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    stopSpeech();
                    setIsAutoPlaying(false);
                    setCurrentIndex((p) => (p === 0 ? activeList.length - 1 : p - 1));
                  }}
                  className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-100"
                >
                  <HiOutlineArrowLeft className="h-4 w-4" /> Previous
                </button>

                <div className="text-center">
                  <span className="text-xs font-black text-slate-700">
                    {currentIndex + 1} of {activeList.length}
                  </span>
                  <div className="mt-1 h-2 w-32 overflow-hidden rounded-full bg-slate-200 sm:w-48">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                      style={{ width: `${((currentIndex + 1) / activeList.length) * 100}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    stopSpeech();
                    setIsAutoPlaying(false);
                    setCurrentIndex((p) => (p === activeList.length - 1 ? 0 : p + 1));
                  }}
                  className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-100"
                >
                  Next <HiOutlineArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Quick jump carousel for current filter group */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-800">
                  ⚡ Quick Select ({activeList.length} numbers):
                </h2>
                <span className="text-xs text-slate-500 font-semibold">Tap to view</span>
              </div>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                {activeList.map((item, idx) => {
                  const isActive = idx === currentIndex;
                  return (
                    <button
                      key={item.num}
                      type="button"
                      onClick={() => {
                        stopSpeech();
                        setIsAutoPlaying(false);
                        setCurrentIndex(idx);
                        speakText(item.word);
                      }}
                      className={`flex flex-col items-center justify-center rounded-2xl border p-2 text-center transition ${
                        isActive
                          ? 'border-amber-500 bg-amber-100 ring-2 ring-amber-400 font-black text-amber-900 shadow-sm'
                          : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-base font-black">{item.num}</span>
                      <span className="text-[10px] truncate w-full font-semibold">{item.word}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: SPELL THE NUMBER GAME (UNSCRAMBLE LETTER TILES) */}
        {/* ========================================================================= */}
        {activeTab === 'speller' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                  Spelling Challenge • Number {currentItem.num}
                </span>
                <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                  🧩 Spell the Number
                </h2>
                <p className="text-xs text-slate-500">
                  Tap the letter bubbles in the correct order to spell the number word!
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSpellerHint}
                  disabled={spellerCompleted}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                >
                  <HiOutlineLightBulb className="h-4 w-4" /> 💡 Clue / Hint
                </button>
                <button
                  type="button"
                  onClick={resetSpeller}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  <HiOutlineRefresh className="h-4 w-4" /> Reset
                </button>
              </div>
            </div>

            {/* Target Display: Big Number Digit */}
            <div className="my-8 text-center">
              <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-600 text-5xl font-black text-white shadow-xl shadow-indigo-200 sm:h-28 sm:w-28 sm:text-6xl">
                {currentItem.num}
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => speakText(currentItem.word)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                >
                  <HiOutlineVolumeUp className="h-4 w-4" /> Hear pronunciation
                </button>
              </div>
            </div>

            {/* Target Placed Letters */}
            <div className="my-6">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
                Your Spelling:
              </p>
              <div className="min-h-20 rounded-3xl border-2 border-dashed border-indigo-200 bg-slate-50/60 p-4 flex flex-wrap items-center justify-center gap-2">
                {selectedLetters.length === 0 ? (
                  <p className="text-sm font-semibold text-slate-400 italic">
                    Tap the letter tiles below to build the word...
                  </p>
                ) : (
                  selectedLetters.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleRemoveSpellerLetter(item)}
                      disabled={spellerCompleted}
                      className="group flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-black text-white shadow-md hover:bg-indigo-700 transition"
                      title="Tap to remove"
                    >
                      {item.char}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Celebration Banner */}
            {spellerCompleted && (
              <div className="my-6 rounded-3xl bg-emerald-50 border-2 border-emerald-400 p-6 text-center shadow-lg animate-bounce">
                <span className="text-4xl">🎉 ⭐ 🥳</span>
                <h3 className="mt-2 text-xl font-black text-emerald-800 sm:text-2xl">
                  Brilliant! Perfect Spelling!
                </h3>
                <p className="mt-1 text-2xl font-black text-emerald-950 uppercase tracking-widest">
                  {currentItem.word}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => speakText(currentItem.word)}
                    className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700"
                  >
                    🔊 Hear Again
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      stopSpeech();
                      setCurrentIndex((p) => (p + 1) % activeList.length);
                    }}
                    className="rounded-2xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700"
                  >
                    Next Number ➔
                  </button>
                </div>
              </div>
            )}

            {/* Available Letter Tiles to Tap */}
            {!spellerCompleted && (
              <div className="my-6 text-center">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Pick the letters:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  {spellerLetters.map((item, idx) => {
                    const isHinted = spellerHintIdx === idx;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handlePickSpellerLetter(item)}
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-black transition transform active:scale-95 shadow-md ${
                          isHinted
                            ? 'bg-amber-400 text-slate-900 ring-4 ring-amber-300 animate-pulse scale-105'
                            : 'bg-white border-2 border-slate-200 text-slate-800 hover:border-indigo-400 hover:bg-indigo-50'
                        }`}
                      >
                        {item.char}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom switcher */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  setCurrentIndex((p) => (p === 0 ? activeList.length - 1 : p - 1));
                }}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                ← Previous
              </button>
              <span className="text-xs font-black text-slate-600">
                Number {currentItem.num} ({currentIndex + 1} of {activeList.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  setCurrentIndex((p) => (p + 1) % activeList.length);
                }}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Next →
              </button>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* MODE 3: QUIZ & TEST (DIGITS ↔ WORDS) */}
        {/* ========================================================================= */}
        {activeTab === 'quiz' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
            {!quizFinished ? (
              <div>
                {/* Header score & status */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">
                      Question {quizIndex + 1} of {quizItems.length}
                    </span>
                    <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                      🎯 Number Spelling Quiz
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
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-rose-500 to-pink-500 text-5xl font-black text-white shadow-xl shadow-pink-200 sm:h-28 sm:w-28 sm:text-6xl">
                    {quizQuestion.item.num}
                  </div>
                  <p className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl">
                    What is the correct spelling for {quizQuestion.item.num}?
                  </p>
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => speakText(String(quizQuestion.item.num))}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-800"
                    >
                      <HiOutlineVolumeUp className="h-4 w-4" /> Listen to number
                    </button>
                  </div>
                </div>

                {/* 4 Interactive Choices */}
                <div className="my-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {quizQuestion.options.map((option) => {
                    const isSelected = selectedQuizOption === option;
                    const isCorrect = option.toLowerCase() === quizQuestion.correctWord.toLowerCase();
                    let btnStyle =
                      'bg-white border-2 border-slate-200 text-slate-800 hover:border-rose-400 hover:bg-rose-50/50';

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
                        selectedQuizOption?.toLowerCase() === quizQuestion.correctWord.toLowerCase()
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {selectedQuizOption?.toLowerCase() === quizQuestion.correctWord.toLowerCase()
                        ? '✅ Brilliant! That is correct!'
                        : `❌ Oops! The correct spelling is: "${quizQuestion.correctWord}"`}
                    </div>

                    <button
                      type="button"
                      onClick={handleNextQuiz}
                      className="rounded-2xl bg-indigo-600 px-8 py-3 text-base font-black text-white shadow-lg hover:bg-indigo-700 transition"
                    >
                      {quizIndex < quizItems.length - 1 ? 'Next Question ➔' : 'View Quiz Result 🏆'}
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
                  You scored <span className="font-black text-rose-600 text-2xl">{quizScore}</span> out of{' '}
                  <span className="font-bold">{quizItems.length}</span>!
                </p>

                <div className="mx-auto max-w-sm rounded-2xl bg-amber-50 border border-amber-200 p-4">
                  <p className="text-sm font-bold text-amber-900">
                    {quizScore >= 13
                      ? '🌟 Outstanding! You have mastered the number spellings!'
                      : quizScore >= 9
                      ? '👏 Great job! Review the flashcards to achieve 100%!'
                      : '💪 Good try! Practice the tricky spellings and try again!'}
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
                    onClick={() => {
                      stopSpeech();
                      setActiveTab('flashcard');
                    }}
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
        {/* MODE 4: FULL 1 TO 100 CHART & EXPLORER */}
        {/* ========================================================================= */}
        {activeTab === 'chart' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
                  📋 1 to 100 Numbers in Words Chart
                </h2>
                <p className="text-xs text-slate-500 sm:text-sm">
                  Click any number to hear it spoken and spelled letter by letter!
                </p>
              </div>

              {/* Range Filters */}
              <div className="flex flex-wrap gap-1.5">
                {(['1-20', '21-40', '41-60', '61-80', '81-100', 'tens', 'all'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setChartRange(r)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition capitalize ${
                      chartRange === r
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {r === 'tens' ? 'Tens (10-100)' : r === 'all' ? 'All (1-100)' : r}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="my-5 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5">
              <HiOutlineSearch className="h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search number or spelling (e.g. 40, forty, thirteen)..."
                value={chartSearch}
                onChange={(e) => setChartSearch(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none"
              />
              {chartSearch && (
                <button
                  type="button"
                  onClick={() => setChartSearch('')}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Grid of Number Cards */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredChartNumbers.map((item) => (
                <button
                  key={item.num}
                  type="button"
                  onClick={() => {
                    playPop();
                    speakText(item.word);
                  }}
                  className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-left transition hover:border-teal-400 hover:bg-teal-50/60 hover:shadow-md"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 text-base font-black text-slate-900 shadow-sm group-hover:bg-teal-600 group-hover:text-white transition">
                      {item.num}
                    </span>
                    <div>
                      <p className="text-sm font-black text-slate-900 group-hover:text-teal-900">
                        {item.word}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400">
                        {item.category}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 group-hover:text-teal-600">🔊</span>
                </button>
              ))}
            </div>

            {filteredChartNumbers.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm font-bold">No numbers matched your search.</p>
              </div>
            )}
          </section>
        )}

        {/* ========================================================================= */}
        {/* MODE 5: PRINTABLE WORKSHEETS (TRACE & WRITE) */}
        {/* ========================================================================= */}
        {activeTab === 'worksheet' && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 print:hidden">
              <div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                  Print & Learn Offline
                </span>
                <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                  🖨️ Printable Number Words Worksheets
                </h2>
                <p className="text-xs text-slate-500">
                  Four-line English handwriting practice sheets for school homework and classroom tracing!
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopSpeech();
                  if (typeof window !== 'undefined') window.print();
                }}
                className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg hover:bg-blue-700 transition"
              >
                <HiOutlinePrinter className="h-5 w-5" /> 🖨️ Print Worksheet Now
              </button>
            </div>

            {/* Printable Area */}
            <div className="mt-6 rounded-2xl border-2 border-slate-300 p-6 sm:p-8 bg-white print:border-none print:p-0 space-y-8">
              {/* Worksheet 1: 1 to 20 in Words */}
              <div>
                <div className="border-b-2 border-slate-900 pb-4 text-center">
                  <h3 className="text-2xl font-black tracking-wide text-slate-900">
                    MASTER SAHIB KIDS LEARNING ACADEMY
                  </h3>
                  <p className="text-xs font-bold uppercase text-slate-600">
                    Numbers in Words Handwriting & Tracing Worksheet • 1 to 20
                  </p>
                  <div className="mt-4 flex justify-between text-xs font-bold text-slate-800">
                    <span>Student Name: _______________________</span>
                    <span>Class / Section: _________</span>
                    <span>Date: ____________</span>
                  </div>
                </div>

                <div className="my-4 rounded-xl bg-slate-100 p-3 text-xs font-semibold text-slate-700 print:bg-white print:border print:border-slate-300">
                  ✏️ <strong>Instructions:</strong> Read each number aloud, trace its word, and write the spelling neatly on the lines below.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                  {KEY_1_TO_19.concat(ALL_NUMBERS[19]).map((item) => (
                    <div key={item.num} className="border-b border-slate-200 pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-black text-white">
                            {item.num}
                          </span>
                          <span className="text-sm font-black text-slate-900 tracking-wide">
                            {item.word.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {item.syllables}
                        </span>
                      </div>
                      <div className="mt-1 pl-10 space-y-1">
                        <div className="w-full border-b border-dashed border-slate-300 h-2" />
                        <div className="w-full border-b border-slate-400 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Worksheet 2: The Tens (10 to 100) */}
              <div className="page-break-before pt-6 border-t-2 border-slate-300">
                <div className="border-b-2 border-slate-900 pb-4 text-center">
                  <h3 className="text-2xl font-black tracking-wide text-slate-900">
                    The Tens (10, 20, 30 ... 100) in Words
                  </h3>
                  <p className="text-xs font-bold uppercase text-slate-600">
                    Important: Watch out for &quot;forty&quot; (no &apos;u&apos;) and &quot;fifty&quot;!
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                  {KEY_TENS.map((item) => (
                    <div key={item.num} className="border-b border-slate-200 pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-xs font-black text-white">
                            {item.num}
                          </span>
                          <span className="text-sm font-black text-slate-900 tracking-wide">
                            {item.word.toUpperCase()}
                          </span>
                        </div>
                        {item.tip && (
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                            {item.tip}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 pl-10 space-y-1">
                        <div className="w-full border-b border-dashed border-slate-300 h-2" />
                        <div className="w-full border-b border-slate-400 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Worksheet Footer */}
              <div className="mt-8 border-t border-slate-300 pt-4 flex justify-between text-xs font-bold text-slate-500">
                <span>Master Sahib Educational Department</span>
                <span>Teacher Signature: __________________</span>
                <span>Rating: ⭐⭐⭐⭐⭐</span>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
