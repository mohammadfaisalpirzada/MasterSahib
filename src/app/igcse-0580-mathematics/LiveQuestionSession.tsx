'use client';

import { useEffect, useMemo, useState } from 'react';
import { HiArrowPath, HiCheck, HiClock, HiLightBulb, HiPlay, HiXMark } from 'react-icons/hi2';

type Question = {
  topic: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

const questions: Question[] = [
  { topic: 'Number', prompt: 'Write 84 as a product of prime factors.', options: ['2² × 3 × 7', '2 × 3² × 7', '2² × 21', '4 × 3 × 7'], answer: 0, explanation: '84 = 2 × 42 = 2 × 2 × 21 = 2² × 3 × 7.' },
  { topic: 'Algebra', prompt: 'Solve 3x − 7 = 20.', options: ['x = 9', 'x = 7', 'x = 13', 'x = 4⅓'], answer: 0, explanation: 'Add 7 to both sides: 3x = 27. Divide by 3, so x = 9.' },
  { topic: 'Coordinate geometry', prompt: 'What is the gradient between (2, 3) and (6, 11)?', options: ['2', '4', '½', '8'], answer: 0, explanation: 'Gradient = change in y ÷ change in x = (11−3) ÷ (6−2) = 8 ÷ 4 = 2.' },
  { topic: 'Geometry', prompt: 'The interior angles of a triangle are 48°, 67° and x°. Find x.', options: ['65°', '75°', '55°', '115°'], answer: 0, explanation: 'Angles in a triangle total 180°. x = 180 − 48 − 67 = 65°.' },
  { topic: 'Mensuration', prompt: 'Find the area of a circle with radius 5 cm. Give your answer in terms of π.', options: ['25π cm²', '10π cm²', '5π cm²', '50π cm²'], answer: 0, explanation: 'Area = πr² = π × 5² = 25π cm².' },
  { topic: 'Trigonometry', prompt: 'In a right triangle, opposite = 6 and hypotenuse = 10. What is sin θ?', options: ['0.6', '0.8', '1.67', '0.4'], answer: 0, explanation: 'SOH gives sin θ = opposite ÷ hypotenuse = 6 ÷ 10 = 0.6.' },
  { topic: 'Transformations', prompt: 'A translation by vector (−3, 4) moves a point how?', options: ['3 left, 4 up', '3 right, 4 up', '3 left, 4 down', '4 left, 3 up'], answer: 0, explanation: 'A negative x-component moves left; a positive y-component moves up.' },
  { topic: 'Probability', prompt: 'A fair die is rolled. What is P(number greater than 4)?', options: ['1/3', '1/2', '2/3', '1/6'], answer: 0, explanation: 'The favourable outcomes are 5 and 6: 2 out of 6 = 1/3.' },
  { topic: 'Statistics', prompt: 'Find the median of 3, 7, 8, 11, 15.', options: ['8', '7', '9', '11'], answer: 0, explanation: 'The values are ordered and the middle (third) value is 8.' },
  { topic: 'Number', prompt: 'Write 0.00072 in standard form.', options: ['7.2 × 10⁻⁴', '72 × 10⁻⁵', '7.2 × 10⁴', '0.72 × 10⁻³'], answer: 0, explanation: 'Move the decimal 4 places right to make 7.2, giving a power of −4.' },
  { topic: 'Algebra', prompt: 'Factorise x² + 7x + 12.', options: ['(x + 3)(x + 4)', '(x + 6)(x + 2)', '(x − 3)(x − 4)', '(x + 12)(x + 1)'], answer: 0, explanation: '3 × 4 = 12 and 3 + 4 = 7, so the factors are (x + 3)(x + 4).' },
  { topic: 'Statistics', prompt: 'The mean of 4 numbers is 9. What is their total?', options: ['36', '13', '27', '2.25'], answer: 0, explanation: 'Total = mean × number of values = 9 × 4 = 36.' },
];

function shuffledQuestions() {
  return [...questions]
    .sort(() => Math.random() - 0.5)
    .slice(0, 8)
    .map((question) => {
      const options = question.options.map((text, index) => ({ text, correct: index === question.answer })).sort(() => Math.random() - 0.5);
      return { ...question, options: options.map((option) => option.text), answer: options.findIndex((option) => option.correct) };
    });
}

export default function LiveQuestionSession() {
  const [session, setSession] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(60);
  const [finished, setFinished] = useState(false);
  const question = session[index];
  const progress = session.length ? ((index + (selected === null ? 0 : 1)) / session.length) * 100 : 0;

  useEffect(() => {
    if (!question || selected !== null || finished) return;
    if (seconds <= 0) {
      setSelected(-1);
      return;
    }
    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [question, seconds, selected, finished]);

  const resultMessage = useMemo(() => {
    if (!session.length) return '';
    const ratio = score / session.length;
    if (ratio >= 0.75) return 'Excellent control—move on to mixed exam questions.';
    if (ratio >= 0.5) return 'Good foundation—review the explanations and try once more.';
    return 'Keep building—use the chapter roadmap, then return for another session.';
  }, [score, session.length]);

  function start() {
    setSession(shuffledQuestions());
    setIndex(0);
    setSelected(null);
    setScore(0);
    setSeconds(60);
    setFinished(false);
  }

  function answer(option: number) {
    if (selected !== null) return;
    setSelected(option);
    if (option === question.answer) setScore((value) => value + 1);
  }

  function next() {
    if (index === session.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
    setSeconds(60);
  }

  if (!session.length) {
    return (
      <section id="live-practice" className="overflow-hidden rounded-3xl bg-[#07152f] p-6 text-white shadow-2xl sm:p-8">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[.16em] text-emerald-300"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> Live question session</span>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Answer. Learn. Improve—live.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Eight mixed Cambridge-style questions, 60 seconds each, with immediate marking and a worked explanation. No sign-in required.</p>
          </div>
          <button onClick={start} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-[#07152f] transition hover:-translate-y-0.5"><HiPlay className="h-5 w-5" /> Start live session</button>
        </div>
      </section>
    );
  }

  if (finished) {
    return (
      <section id="live-practice" className="rounded-3xl bg-[#07152f] p-7 text-center text-white shadow-2xl sm:p-10">
        <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-300">Session complete</p>
        <p className="mt-4 text-6xl font-black">{score}<span className="text-2xl text-slate-400">/{session.length}</span></p>
        <h2 className="mt-4 text-2xl font-black">{resultMessage}</h2>
        <button onClick={start} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-[#07152f]"><HiArrowPath className="h-5 w-5" /> New question set</button>
      </section>
    );
  }

  return (
    <section id="live-practice" className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,.10)]">
      <div className="h-1.5 bg-slate-100"><div className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all" style={{ width: `${progress}%` }} /></div>
      <div className="p-5 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-blue-600">{question.topic}</p><p className="mt-1 text-sm font-bold text-slate-500">Question {index + 1} of {session.length}</p></div>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-black ${seconds <= 10 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-700'}`}><HiClock className="h-4 w-4" /> 00:{String(seconds).padStart(2, '0')}</span>
        </div>
        <h2 className="mt-6 max-w-3xl text-xl font-black leading-snug sm:text-2xl">{question.prompt}</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {question.options.map((option, optionIndex) => {
            const correct = selected !== null && optionIndex === question.answer;
            const wrong = selected === optionIndex && optionIndex !== question.answer;
            return <button key={option} onClick={() => answer(optionIndex)} disabled={selected !== null} className={`flex items-center justify-between rounded-2xl border p-4 text-left text-sm font-bold transition ${correct ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : wrong ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'}`}><span><span className="mr-3 text-slate-400">{String.fromCharCode(65 + optionIndex)}</span>{option}</span>{correct && <HiCheck className="h-5 w-5" />}{wrong && <HiXMark className="h-5 w-5" />}</button>;
          })}
        </div>
        {selected !== null && <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-950"><p className="flex items-center gap-2 font-black"><HiLightBulb className="h-5 w-5 text-amber-500" /> Worked explanation</p><p className="mt-1">{question.explanation}</p><button onClick={next} className="mt-4 rounded-xl bg-[#07152f] px-5 py-2.5 font-black text-white">{index === session.length - 1 ? 'See result' : 'Next question →'}</button></div>}
      </div>
    </section>
  );
}
