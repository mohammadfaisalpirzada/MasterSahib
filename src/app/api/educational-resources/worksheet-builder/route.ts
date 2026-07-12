import { NextResponse } from 'next/server';

const DAILY_LIMIT = 5;

type UsageRecord = { dateKey: string; count: number };

const globalUsageStore = globalThis as typeof globalThis & {
  wsBuilderUsage?: Map<string, UsageRecord>;
};
const usageStore = globalUsageStore.wsBuilderUsage ?? new Map<string, UsageRecord>();
globalUsageStore.wsBuilderUsage = usageStore;

function getDateKey() {
  return new Date().toISOString().slice(0, 10);
}

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for') || '';
  const ip = forwardedFor.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'anon';
  const ua = request.headers.get('user-agent') || 'unknown';
  return `${ip}::${ua}`;
}

function getRemaining(request: Request) {
  const key = getClientKey(request);
  const dk = getDateKey();
  const rec = usageStore.get(key);
  if (!rec || rec.dateKey !== dk) return DAILY_LIMIT;
  return Math.max(0, DAILY_LIMIT - rec.count);
}

function incrementUsage(request: Request) {
  const key = getClientKey(request);
  const dk = getDateKey();
  const rec = usageStore.get(key);
  if (!rec || rec.dateKey !== dk) {
    usageStore.set(key, { dateKey: dk, count: 1 });
  } else {
    rec.count += 1;
  }
}

function pickApiKey() {
  return process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || '';
}

export async function POST(request: Request) {
  try {
    const remaining = getRemaining(request);
    if (remaining <= 0) {
      return NextResponse.json(
        { error: `Daily limit reached. You can generate ${DAILY_LIMIT} custom worksheets per day. Please try again tomorrow.` },
        { status: 429 }
      );
    }

    const apiKey = pickApiKey();
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured.' }, { status: 500 });
    }

    const body = await request.json();
    const { topic, grade, studentName, worksheetType } = body as {
      topic: string;
      grade: string;
      studentName: string;
      worksheetType: string;
    };

    if (!topic?.trim()) {
      return NextResponse.json({ error: 'Please provide a topic.' }, { status: 400 });
    }

    const prompt = `You are a professional worksheet generator for schools in Pakistan (Cambridge/O-Level and local board). Create a single-page worksheet in clean HTML.

RULES:
- Output ONLY the worksheet HTML body content, no <html>, <head>, <body> tags
- Use inline styles only (no external CSS)
- All text in English
- Content should be age-appropriate for ${grade || 'primary'} level
- Include variety: fill-in-the-blanks, multiple choice, matching, short questions
- Make it visually clean with proper spacing
- Topic: ${topic}
- Type of exercises: ${worksheetType || 'Mixed (fill blanks, MCQ, matching, short answers)'}
- Student Name: ${studentName || '_______________'}
- Grade: ${grade || '_______________'}

Generate the worksheet content HTML now:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini error:', err);
      return NextResponse.json({ error: 'Failed to generate worksheet. Please try again.' }, { status: 502 });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) {
      return NextResponse.json({ error: 'Empty response from AI. Please try again.' }, { status: 502 });
    }

    // Extract HTML from response (may be wrapped in ```html ... ```)
    let html = text;
    const codeBlockMatch = text.match(/```(?:html)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) html = codeBlockMatch[1].trim();

    incrementUsage(request);

    return NextResponse.json({ html, remaining: remaining - 1 });
  } catch (err) {
    console.error('Worksheet builder error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return NextResponse.json({ remaining: getRemaining(request), limit: DAILY_LIMIT });
}
