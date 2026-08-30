// lib/notebooklm-quiz-data.ts
// Question bank for the NotebookLM Mastery Workshop pre/post self-assessment.
// Same 10 questions are used both times — the backend decides "before" vs
// "after" based on whether this email has already submitted once.

export type QuizOption = { id: "a" | "b" | "c" | "d"; text: string };
export type QuizQuestion = {
  id: string;
  prompt: string;
  options: QuizOption[];
  correct: "a" | "b" | "c" | "d";
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "What does Gemini Notebook (NotebookLM) primarily use to answer your questions?",
    options: [
      { id: "a", text: "Anything it can find on the internet" },
      { id: "b", text: "Only the documents and sources you upload" },
      { id: "c", text: "A fixed built-in encyclopedia" },
      { id: "d", text: "Random AI-generated guesses" },
    ],
    correct: "b",
  },
  {
    id: "q2",
    prompt: "What was NotebookLM officially renamed to on 16 July 2026?",
    options: [
      { id: "a", text: "Gemini Notebook" },
      { id: "b", text: "Google Notes AI" },
      { id: "c", text: "NotebookAI Pro" },
      { id: "d", text: "Gemini Docs" },
    ],
    correct: "a",
  },
  {
    id: "q3",
    prompt: "What lets you verify an AI answer traces back to the right part of your source?",
    options: [
      { id: "a", text: "A word count" },
      { id: "b", text: "A citation you can click" },
      { id: "c", text: "A green checkmark" },
      { id: "d", text: "An automatic footer note" },
    ],
    correct: "b",
  },
  {
    id: "q4",
    prompt: "What is an \u201cAudio Overview\u201d in Gemini Notebook?",
    options: [
      { id: "a", text: "A silent summary slide" },
      { id: "b", text: "A two-host, podcast-style discussion of your source" },
      { id: "c", text: "A single robotic voice reading the document word-for-word" },
      { id: "d", text: "A ringtone" },
    ],
    correct: "b",
  },
  {
    id: "q5",
    prompt: "On the Free tier, how many Audio Overviews can you generate per day?",
    options: [
      { id: "a", text: "Unlimited" },
      { id: "b", text: "3" },
      { id: "c", text: "10" },
      { id: "d", text: "1 per week" },
    ],
    correct: "b",
  },
  {
    id: "q6",
    prompt: "Which Studio output is best for showing students how ideas in a chapter connect to each other?",
    options: [
      { id: "a", text: "Quiz" },
      { id: "b", text: "Mind Map" },
      { id: "c", text: "Flashcards" },
      { id: "d", text: "Audio Overview" },
    ],
    correct: "b",
  },
  {
    id: "q7",
    prompt: "What makes flashcards and quizzes generated in Gemini Notebook different from a generic online quiz?",
    options: [
      { id: "a", text: "They're timed" },
      { id: "b", text: "They're grounded only in your own uploaded source" },
      { id: "c", text: "They're multiple choice only" },
      { id: "d", text: "They require a paid plan" },
    ],
    correct: "b",
  },
  {
    id: "q8",
    prompt: "What can Deep Research do that regular chat with your notebook cannot?",
    options: [
      { id: "a", text: "Delete your sources" },
      { id: "b", text: "Search the wider web and compile a cited report" },
      { id: "c", text: "Translate your document" },
      { id: "d", text: "Print your document" },
    ],
    correct: "b",
  },
  {
    id: "q9",
    prompt: "What's the safest practice when uploading classroom material?",
    options: [
      { id: "a", text: "Include full student names together with their grades" },
      { id: "b", text: "Avoid uploading files with identifiable student personal data" },
      { id: "c", text: "Upload everything \u2014 privacy doesn't matter" },
      { id: "d", text: "Only upload after asking Google for permission by email" },
    ],
    correct: "b",
  },
  {
    id: "q10",
    prompt: "What can a Gemini Notebook generate that you can export straight to PowerPoint or Google Slides?",
    options: [
      { id: "a", text: "A Slide Deck" },
      { id: "b", text: "A spreadsheet" },
      { id: "c", text: "An email" },
      { id: "d", text: "A phone call summary" },
    ],
    correct: "a",
  },
];
