// lib/notebooklm-quiz-data.ts
// Question bank for the NotebookLM Mastery Workshop pre/post self-assessment.
// Same 10 questions are used both times — the backend decides "before" vs
// "after" based on whether this email has already submitted once.
// Each question has an English and an Urdu version — the form lets the
// attendee switch between them, but the id / correct answer stays the same.

export type QuizOption = {
  id: "a" | "b" | "c" | "d";
  text: string;
  textUr: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  promptUr: string;
  options: QuizOption[];
  correct: "a" | "b" | "c" | "d";
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "What does Gemini Notebook (NotebookLM) mainly use to answer your questions?",
    promptUr: "Gemini Notebook (NotebookLM) آپ کے سوال کا جواب دینے کے لیے زیادہ تر کیا استعمال کرتا ہے؟",
    options: [
      { id: "a", text: "Anything on the internet", textUr: "انٹرنیٹ پر موجود کوئی بھی چیز" },
      { id: "b", text: "Only the documents you upload", textUr: "صرف وہ دستاویزات جو آپ اپ لوڈ کرتے ہیں" },
      { id: "c", text: "A fixed built-in encyclopedia", textUr: "ایک مقررہ بلٹ اِن انسائیکلوپیڈیا" },
      { id: "d", text: "Random AI guesses", textUr: "اے آئی کے بے ترتیب اندازے" },
    ],
    correct: "b",
  },
  {
    id: "q2",
    prompt: "What was NotebookLM renamed to on 16 July 2026?",
    promptUr: "16 جولائی 2026 کو NotebookLM کا نیا نام کیا رکھا گیا؟",
    options: [
      { id: "a", text: "Gemini Notebook", textUr: "Gemini Notebook" },
      { id: "b", text: "Google Notes AI", textUr: "Google Notes AI" },
      { id: "c", text: "NotebookAI Pro", textUr: "NotebookAI Pro" },
      { id: "d", text: "Gemini Docs", textUr: "Gemini Docs" },
    ],
    correct: "a",
  },
  {
    id: "q3",
    prompt: "What lets you check that an AI answer really comes from your source?",
    promptUr: "آپ کیسے چیک کرتے ہیں کہ AI کا جواب واقعی آپ کے سورس سے آیا ہے؟",
    options: [
      { id: "a", text: "A word count", textUr: "ورڈ کاؤنٹ" },
      { id: "b", text: "A citation you can click", textUr: "ایک حوالہ (citation) جس پر کلک کیا جا سکے" },
      { id: "c", text: "A green checkmark", textUr: "ایک سبز چیک مارک" },
      { id: "d", text: "An automatic footer note", textUr: "ایک خودکار فوٹر نوٹ" },
    ],
    correct: "b",
  },
  {
    id: "q4",
    prompt: "What is an “Audio Overview” in Gemini Notebook?",
    promptUr: "Gemini Notebook میں “Audio Overview” کیا ہوتا ہے؟",
    options: [
      { id: "a", text: "A silent summary slide", textUr: "ایک خاموش سمری سلائیڈ" },
      { id: "b", text: "A podcast-style talk about your source, with two hosts", textUr: "دو میزبانوں کے ساتھ، آپ کے سورس پر پوڈکاسٹ جیسی گفتگو" },
      { id: "c", text: "One robotic voice reading the document", textUr: "ایک روبوٹک آواز جو دستاویز پڑھتی ہے" },
      { id: "d", text: "A ringtone", textUr: "ایک رنگ ٹون" },
    ],
    correct: "b",
  },
  {
    id: "q5",
    prompt: "On the Free plan, how many Audio Overviews can you make per day?",
    promptUr: "Free پلان میں، آپ دن میں کتنے Audio Overviews بنا سکتے ہیں؟",
    options: [
      { id: "a", text: "Unlimited", textUr: "لامحدود" },
      { id: "b", text: "3", textUr: "3" },
      { id: "c", text: "10", textUr: "10" },
      { id: "d", text: "1 per week", textUr: "ہفتے میں 1" },
    ],
    correct: "b",
  },
  {
    id: "q6",
    prompt: "Which Studio tool best shows how the ideas in a chapter connect?",
    promptUr: "کونسا Studio ٹول سب سے بہتر دکھاتا ہے کہ باب کے خیالات آپس میں کیسے جڑے ہیں؟",
    options: [
      { id: "a", text: "Quiz", textUr: "کوئز" },
      { id: "b", text: "Mind Map", textUr: "مائنڈ میپ" },
      { id: "c", text: "Flashcards", textUr: "فلیش کارڈز" },
      { id: "d", text: "Audio Overview", textUr: "آڈیو اوورویو" },
    ],
    correct: "b",
  },
  {
    id: "q7",
    prompt: "How are flashcards and quizzes from Gemini Notebook different from a normal online quiz?",
    promptUr: "Gemini Notebook کے فلیش کارڈز اور کوئز عام آن لائن کوئز سے کیسے مختلف ہیں؟",
    options: [
      { id: "a", text: "They are timed", textUr: "ان میں وقت کی پابندی ہوتی ہے" },
      { id: "b", text: "They come only from your own uploaded source", textUr: "یہ صرف آپ کے اپ لوڈ کردہ سورس سے بنتے ہیں" },
      { id: "c", text: "They are multiple choice only", textUr: "یہ صرف ملٹیپل چوائس ہوتے ہیں" },
      { id: "d", text: "They need a paid plan", textUr: "ان کے لیے پیڈ پلان چاہیے" },
    ],
    correct: "b",
  },
  {
    id: "q8",
    prompt: "What can Deep Research do that a normal chat with your notebook cannot?",
    promptUr: "Deep Research ایسا کیا کر سکتی ہے جو آپ کے نوٹ بک سے عام چیٹ نہیں کر سکتی؟",
    options: [
      { id: "a", text: "Delete your sources", textUr: "آپ کے سورسز ڈیلیٹ کرنا" },
      { id: "b", text: "Search the wider web and give a cited report", textUr: "پوری ویب سرچ کر کے حوالوں کے ساتھ رپورٹ بنانا" },
      { id: "c", text: "Translate your document", textUr: "آپ کی دستاویز کا ترجمہ کرنا" },
      { id: "d", text: "Print your document", textUr: "آپ کی دستاویز پرنٹ کرنا" },
    ],
    correct: "b",
  },
  {
    id: "q9",
    prompt: "What is the safest way to upload classroom material?",
    promptUr: "کلاس روم کا مواد اپ لوڈ کرنے کا سب سے محفوظ طریقہ کیا ہے؟",
    options: [
      { id: "a", text: "Include full student names together with their grades", textUr: "طلبہ کے پورے نام ان کے گریڈز کے ساتھ شامل کریں" },
      { id: "b", text: "Avoid uploading files with students' personal data", textUr: "ایسی فائلیں اپ لوڈ نہ کریں جن میں طلبہ کا ذاتی ڈیٹا ہو" },
      { id: "c", text: "Upload everything — privacy doesn't matter", textUr: "سب کچھ اپ لوڈ کر دیں، پرائیویسی کی کوئی اہمیت نہیں" },
      { id: "d", text: "Only upload after emailing Google for permission", textUr: "صرف گوگل کو ای میل کر کے اجازت لینے کے بعد اپ لوڈ کریں" },
    ],
    correct: "b",
  },
  {
    id: "q10",
    prompt: "What can Gemini Notebook create that you can export straight to PowerPoint or Google Slides?",
    promptUr: "Gemini Notebook کیا بنا سکتا ہے جو سیدھا PowerPoint یا Google Slides میں ایکسپورٹ ہو سکے؟",
    options: [
      { id: "a", text: "A Slide Deck", textUr: "ایک سلائیڈ ڈیک" },
      { id: "b", text: "A spreadsheet", textUr: "ایک اسپریڈ شیٹ" },
      { id: "c", text: "An email", textUr: "ایک ای میل" },
      { id: "d", text: "A phone call summary", textUr: "فون کال کی سمری" },
    ],
    correct: "a",
  },
];
