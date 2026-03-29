import { NextResponse } from 'next/server';

type UsageRecord = {
  dateKey: string;
  count: number;
};

type MethodologyItem = {
  methodName: string;
  howToUse: string;
};

type DayPlanItem = {
  day: string;
  topicFocus: string;
  miniObjective: string;
};

type LessonPlan = {
  days: string;
  objectives: string[];
  islamicIntegration: string;
  skillFocusedOn: string[];
  materials: string[];
  methodology: MethodologyItem[];
  openingMotivation15: string;
  activity1_15: string;
  ictActivity: string;
  discussion10: string;
  classwork: string;
  homework: string;
  reflection: string;
  dayWisePlan: DayPlanItem[];
};

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg', 'image/webp']);
const DAILY_LIMIT = 3;
const FRIENDLY_RETRY_MESSAGE =
  'Please excuse us. The lesson plan service is unavailable right now. Please try again later.\nمعذرت، سبق پلان سروس اس وقت دستیاب نہیں۔ براہ کرم کچھ دیر بعد دوبارہ کوشش کریں۔';

const globalUsageStore = globalThis as typeof globalThis & {
  lessonPlanUsage?: Map<string, UsageRecord>;
};

const lessonPlanUsage = globalUsageStore.lessonPlanUsage ?? new Map<string, UsageRecord>();
globalUsageStore.lessonPlanUsage = lessonPlanUsage;

function sanitize(value: unknown) {
  return String(value ?? '').trim();
}

function pickApiKey() {
  return process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || '';
}

function getDateKey() {
  return new Date().toISOString().slice(0, 10);
}

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for') || '';
  const ip = forwardedFor.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'anonymous';
  const userAgent = request.headers.get('user-agent') || 'unknown-agent';
  return `${ip}::${userAgent}`;
}

function isDailyLimitReached(request: Request) {
  const clientKey = getClientKey(request);
  const dateKey = getDateKey();
  const existing = lessonPlanUsage.get(clientKey);

  if (!existing || existing.dateKey !== dateKey) {
    lessonPlanUsage.set(clientKey, { dateKey, count: 0 });
    return false;
  }

  return existing.count >= DAILY_LIMIT;
}

function incrementUsage(request: Request) {
  const clientKey = getClientKey(request);
  const dateKey = getDateKey();
  const existing = lessonPlanUsage.get(clientKey);

  if (!existing || existing.dateKey !== dateKey) {
    lessonPlanUsage.set(clientKey, { dateKey, count: 1 });
    return;
  }

  lessonPlanUsage.set(clientKey, { dateKey, count: existing.count + 1 });
}

function extractJson(text: string): LessonPlan | null {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace < 0 || lastBrace < 0 || lastBrace <= firstBrace) return null;

  const slice = text.slice(firstBrace, lastBrace + 1);
  try {
    return JSON.parse(slice) as LessonPlan;
  } catch {
    return null;
  }
}

function normalizeArray(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input.map((item) => sanitize(item)).filter(Boolean);
}

function normalizeMethodology(input: unknown): MethodologyItem[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((item) => {
      const obj = typeof item === 'object' && item ? (item as Record<string, unknown>) : null;
      return {
        methodName: sanitize(obj?.methodName),
        howToUse: sanitize(obj?.howToUse),
      };
    })
    .filter((item) => item.methodName && item.howToUse);
}

function normalizeDayPlan(input: unknown): DayPlanItem[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((item) => {
      const obj = typeof item === 'object' && item ? (item as Record<string, unknown>) : null;
      return {
        day: sanitize(obj?.day),
        topicFocus: sanitize(obj?.topicFocus),
        miniObjective: sanitize(obj?.miniObjective),
      };
    })
    .filter((item) => item.day || item.topicFocus || item.miniObjective);
}

function normalizePlan(input: LessonPlan | null): LessonPlan | null {
  if (!input) return null;

  return {
    days: sanitize(input.days),
    objectives: normalizeArray(input.objectives),
    islamicIntegration: sanitize(input.islamicIntegration),
    skillFocusedOn: normalizeArray(input.skillFocusedOn),
    materials: normalizeArray(input.materials),
    methodology: normalizeMethodology(input.methodology),
    openingMotivation15: sanitize(input.openingMotivation15),
    activity1_15: sanitize(input.activity1_15),
    ictActivity: sanitize(input.ictActivity),
    discussion10: sanitize(input.discussion10),
    classwork: sanitize(input.classwork),
    homework: sanitize(input.homework),
    reflection: sanitize(input.reflection),
    dayWisePlan: normalizeDayPlan(input.dayWisePlan),
  };
}

export async function POST(request: Request) {
  try {
    const apiKey = pickApiKey();
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: FRIENDLY_RETRY_MESSAGE,
        },
        { status: 500 }
      );
    }

    const form = await request.formData();

    const chapterOrTopic = sanitize(form.get('chapterOrTopic'));
    const className = sanitize(form.get('className'));
    const units = sanitize(form.get('units'));
    const daysRequired = sanitize(form.get('daysRequired'));
    const teacherNotes = sanitize(form.get('teacherNotes'));
    const file = form.get('bookFile');

    if (!chapterOrTopic || !className || !daysRequired) {
      return NextResponse.json(
        {
          success: false,
          message: 'Chapter/topic, class, and days are required.',
        },
        { status: 400 }
      );
    }

    if (isDailyLimitReached(request)) {
      return NextResponse.json(
        {
          success: false,
          message:
            'You have reached today\'s limit of 3 lesson plans. Please try again tomorrow.\nآپ آج کے 3 سبق پلان کی حد مکمل کر چکے ہیں۔ براہ کرم کل دوبارہ کوشش کریں۔',
        },
        { status: 429 }
      );
    }

    let filePart:
      | {
          inline_data: { mime_type: string; data: string };
        }
      | undefined;

    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          {
            success: false,
            message: 'File is too large. Keep it under 8 MB.',
          },
          { status: 400 }
        );
      }

      if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return NextResponse.json(
          {
            success: false,
            message: 'Only PDF, PNG, JPG, or WEBP files are allowed.',
          },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      filePart = {
        inline_data: {
          mime_type: file.type,
          data: base64,
        },
      };
    }

    incrementUsage(request);

    const prompt = `You are an expert school lesson planner.
Create a practical lesson plan for a teacher in Pakistan.
Follow this exact JSON schema and return JSON only:
{
  "days": "string",
  "objectives": ["string"],
  "islamicIntegration": "string",
  "skillFocusedOn": ["string"],
  "materials": ["string"],
  "methodology": [
    { "methodName": "string", "howToUse": "string" }
  ],
  "openingMotivation15": "string",
  "activity1_15": "string",
  "ictActivity": "string",
  "discussion10": "string",
  "classwork": "string",
  "homework": "string",
  "reflection": "string",
  "dayWisePlan": [
    { "day": "Day 1", "topicFocus": "string", "miniObjective": "string" }
  ]
}

Teacher inputs:
- Chapter or topic: ${chapterOrTopic}
- Class: ${className}
- Units or subtopics: ${units || 'Not provided'}
- Days required: ${daysRequired}
- Extra notes from teacher: ${teacherNotes || 'None'}

Rules:
- Keep language simple and classroom-friendly.
- Keep each section concise and actionable.
- Include Islamic integration naturally, not forced.
- Add realistic classroom methodology items with method name and how to use.
- If ICT activity is not needed, still provide a low-tech alternative in ictActivity.
- Make dayWisePlan consistent with days required.
`;

    const body: {
      contents: Array<{
        role: string;
        parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }>;
      }>;
      generationConfig: { temperature: number };
    } = {
      contents: [
        {
          role: 'user',
          parts: filePart ? [{ text: prompt }, filePart] : [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.6,
      },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      await response.text();
      return NextResponse.json(
        {
          success: false,
          message: FRIENDLY_RETRY_MESSAGE,
        },
        { status: 502 }
      );
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    const rawText = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n') || '';

    const parsed = normalizePlan(extractJson(rawText));
    if (!parsed) {
      return NextResponse.json(
        {
          success: false,
          message: FRIENDLY_RETRY_MESSAGE,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, plan: parsed });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: FRIENDLY_RETRY_MESSAGE,
      },
      { status: 500 }
    );
  }
}
