'use client';

import Link from 'next/link';
import { useState } from 'react';

type SectionId = 'parts-of-speech' | 'tenses' | 'sentence-structure' | 'punctuation';

interface Section {
  id: SectionId;
  title: string;
  explanation: string;
  examples: string[];
  questions: { question: string; options: string[]; correct: number }[];
}

const sections: Section[] = [
  {
    id: 'parts-of-speech',
    title: 'Parts of Speech',
    explanation:
      'Every word in a sentence belongs to a category called a part of speech. The eight main parts are: Noun (names a person, place, thing, or idea), Pronoun (replaces a noun), Verb (shows action or state), Adjective (describes a noun), Adverb (describes a verb, adjective, or another adverb), Preposition (shows relationship between words), Conjunction (connects words or clauses), and Interjection (expresses emotion).',
    examples: [
      'Noun: The cat sat on the mat.',
      'Verb: She runs every morning.',
      'Adjective: That is a beautiful painting.',
      'Adverb: He spoke quietly.',
    ],
    questions: [
      { question: 'Which part of speech is "quickly" in "She ran quickly"?', options: ['Noun', 'Verb', 'Adverb', 'Adjective'], correct: 2 },
      { question: 'Which part of speech is "and"?', options: ['Preposition', 'Conjunction', 'Interjection', 'Pronoun'], correct: 1 },
      { question: '"Happiness" is what part of speech?', options: ['Verb', 'Adjective', 'Noun', 'Adverb'], correct: 2 },
      { question: 'Which word is a pronoun in "They went to the park"?', options: ['went', 'to', 'They', 'park'], correct: 2 },
      { question: 'Which is an interjection?', options: ['slowly', 'Wow!', 'under', 'but'], correct: 1 },
    ],
  },
  {
    id: 'tenses',
    title: 'Tenses',
    explanation:
      'Tenses tell us when an action happens. There are three main tenses: Past (already happened), Present (happening now), and Future (going to happen). Each has four aspects: Simple, Continuous (ongoing), Perfect (completed), and Perfect Continuous (ongoing until a point). For example, "I eat" (Present Simple), "I am eating" (Present Continuous), "I have eaten" (Present Perfect), "I have been eating" (Present Perfect Continuous).',
    examples: [
      'Past Simple: I walked to school.',
      'Present Simple: I walk to school.',
      'Future Simple: I will walk to school.',
      'Present Continuous: I am walking to school.',
    ],
    questions: [
      { question: 'Which tense is "She has finished her homework"?', options: ['Past Simple', 'Present Perfect', 'Present Continuous', 'Future Simple'], correct: 1 },
      { question: '"They were playing football" is which tense?', options: ['Past Continuous', 'Present Continuous', 'Past Simple', 'Present Perfect'], correct: 0 },
      { question: 'Choose the future tense sentence:', options: ['I ate dinner', 'I eat dinner', 'I will eat dinner', 'I am eating dinner'], correct: 2 },
      { question: '"He reads books every day" is:', options: ['Past Simple', 'Present Simple', 'Future Simple', 'Present Continuous'], correct: 1 },
      { question: 'Which is Present Perfect Continuous?', options: ['I run', 'I am running', 'I have run', 'I have been running'], correct: 3 },
    ],
  },
  {
    id: 'sentence-structure',
    title: 'Sentence Structure',
    explanation:
      'Sentences can be simple, compound, or complex. A simple sentence has one independent clause (e.g., "I like cats"). A compound sentence joins two independent clauses with a conjunction (e.g., "I like cats, but I am allergic"). A complex sentence has one independent clause and one or more dependent clauses (e.g., "Although I like cats, I am allergic"). Good sentence structure makes writing clear and varied.',
    examples: [
      'Simple: The sun is shining.',
      'Compound: The sun is shining, so we will go outside.',
      'Complex: Because the sun is shining, we will go outside.',
      'Compound-Complex: Although it is cloudy, the sun is shining, and we will go outside.',
    ],
    questions: [
      { question: '"I went to bed because I was tired" is what type?', options: ['Simple', 'Compound', 'Complex', 'Compound-Complex'], correct: 2 },
      { question: 'Which is a compound sentence?', options: ['I like tea', 'I like tea, and she likes coffee', 'Because I like tea, I drink it', 'The girl who likes tea smiled'], correct: 1 },
      { question: 'A simple sentence has:', options: ['Two independent clauses', 'One independent clause', 'One dependent clause', 'No clauses'], correct: 1 },
      { question: '"She sang, and he danced" is:', options: ['Simple', 'Complex', 'Compound', 'Fragment'], correct: 2 },
      { question: 'Which sentence contains a dependent clause?', options: ['I ran home', 'I ran home and I ate lunch', 'After I ran home, I ate lunch', 'I ran home to eat'], correct: 2 },
    ],
  },
  {
    id: 'punctuation',
    title: 'Punctuation',
    explanation:
      'Punctuation marks clarify meaning in writing. Key marks: Period (.) ends a sentence. Comma (,) separates items or clauses. Question Mark (?) ends a question. Exclamation Mark (!) shows strong emotion. Colon (:) introduces a list or explanation. Semicolon (;) connects related clauses. Apostrophe (\') shows possession or contractions. Quotation Marks (" ") enclose direct speech.',
    examples: [
      'Period: I enjoy reading.',
      'Comma: We bought apples, oranges, and bananas.',
      'Apostrophe: That is Sarah\'s book.',
      'Quotation: She said, "Hello!"',
    ],
    questions: [
      { question: 'Which punctuation joins two related independent clauses?', options: ['Comma', 'Period', 'Semicolon', 'Apostrophe'], correct: 2 },
      { question: 'What does an apostrophe show in "the dog\'s bone"?', options: ['Contraction', 'Possession', 'Plural', 'Question'], correct: 1 },
      { question: 'Which sentence uses a colon correctly?', options: ['I like: pizza', 'I need: eggs milk bread', 'Bring these: eggs, milk, and bread', 'Bring: these items'], correct: 2 },
      { question: '"Watch out" should end with:', options: ['Period', 'Question Mark', 'Exclamation Mark', 'Comma'], correct: 2 },
      { question: 'Which is correct for direct speech?', options: ['He said, hello', 'He said "hello."', 'He said, "hello."', 'He said: hello'], correct: 2 },
    ],
  },
];

export default function EnglishGrammarPage() {
  const [expanded, setExpanded] = useState<SectionId | null>(null);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  const toggleSection = (id: SectionId) => {
    setExpanded(expanded === id ? null : id);
  };

  const selectAnswer = (sectionId: string, qIndex: number, optIndex: number) => {
    setAnswers((prev) => {
      const copy = { ...prev };
      const arr = [...(copy[sectionId] || [])];
      arr[qIndex] = optIndex;
      copy[sectionId] = arr;
      return copy;
    });
  };

  const submitQuiz = (sectionId: string) => {
    setSubmitted((prev) => ({ ...prev, [sectionId]: true }));
  };

  const resetQuiz = (sectionId: string) => {
    setSubmitted((prev) => {
      const copy = { ...prev };
      delete copy[sectionId];
      return copy;
    });
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[sectionId];
      return copy;
    });
  };

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-5">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Teaching Tools
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
            English Grammar Basics
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
            Learn the fundamentals of English grammar. Expand a section to read explanations,
            see examples, and test yourself with a short quiz.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/teaching-tools"
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              &larr; Back
            </Link>
          </div>
        </section>

        {sections.map((section) => {
          const isOpen = expanded === section.id;
          const sectionAnswers = answers[section.id] || [];
          const isSubmitted = submitted[section.id] || false;
          const score = isSubmitted
            ? sectionAnswers.reduce(
                (total, ans, i) => total + (ans === section.questions[i].correct ? 1 : 0),
                0
              )
            : null;

          return (
            <article
              key={section.id}
              className="rounded-3xl border border-slate-200 bg-white shadow-sm transition"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center justify-between px-6 py-5 text-left sm:px-8"
              >
                <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
                <span
                  className={`text-2xl text-slate-400 transition ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                >
                  ▾
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 px-6 pb-6 pt-4 sm:px-8 sm:pb-8">
                  <p className="text-sm leading-6 text-slate-700">{section.explanation}</p>

                  <div className="mt-4 space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Examples
                    </p>
                    {section.examples.map((ex, i) => (
                      <p
                        key={i}
                        className="rounded-xl bg-indigo-50 px-4 py-2 text-sm italic text-slate-700"
                      >
                        {ex}
                      </p>
                    ))}
                  </div>

                  <div className="mt-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Mini Quiz
                    </p>
                    <div className="mt-2 space-y-4">
                      {section.questions.map((q, qi) => (
                        <div key={qi}>
                          <p className="text-sm font-medium text-slate-800">
                            {qi + 1}. {q.question}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {q.options.map((opt, oi) => {
                              let cls =
                                'rounded-xl border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ';
                              if (!isSubmitted) {
                                cls +=
                                  sectionAnswers[qi] === oi
                                    ? 'border-indigo-500 bg-indigo-100 text-indigo-700'
                                    : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50';
                              } else {
                                if (oi === q.correct) {
                                  cls += 'border-emerald-500 bg-emerald-100 text-emerald-700';
                                } else if (sectionAnswers[qi] === oi) {
                                  cls += 'border-red-400 bg-red-50 text-red-600';
                                } else {
                                  cls += 'border-slate-200 bg-slate-50 text-slate-400';
                                }
                              }
                              return (
                                <button
                                  key={oi}
                                  disabled={isSubmitted}
                                  onClick={() => selectAnswer(section.id, qi, oi)}
                                  className={cls}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {!isSubmitted ? (
                      <button
                        onClick={() => submitQuiz(section.id)}
                        disabled={sectionAnswers.length < section.questions.length}
                        className="mt-4 rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Submit Answers
                      </button>
                    ) : (
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span className="rounded-xl bg-indigo-100 px-4 py-2 text-sm font-bold text-indigo-700">
                          Score: {score}/{section.questions.length}
                        </span>
                        <button
                          onClick={() => resetQuiz(section.id)}
                          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                          Retry Quiz
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}
