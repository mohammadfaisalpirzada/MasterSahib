import { NextResponse } from 'next/server';

import type { AcademicHolidayEntry } from '@/app/lib/academicCalendar';

type HolidayLookupInput = {
  schoolName: string;
  academicYear: number;
  country: string;
  province: string;
  sessionStart: string;
  sessionEnd: string;
};

type HolidayLookupPayload = {
  holidays?: Array<{
    date?: string;
    label?: string;
    category?: string;
    note?: string;
  }>;
};

function sanitize(value: unknown) {
  return String(value ?? '').trim();
}

function pickApiKey() {
  return process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || '';
}

function extractJson(text: string): HolidayLookupPayload | null {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace < 0 || lastBrace < 0 || lastBrace <= firstBrace) {
    return null;
  }

  try {
    return JSON.parse(text.slice(firstBrace, lastBrace + 1)) as HolidayLookupPayload;
  } catch {
    return null;
  }
}

function isValidIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeCategory(value: string): AcademicHolidayEntry['category'] {
  const lowered = value.toLowerCase();

  if (lowered.includes('provinc')) return 'Provincial';
  if (lowered.includes('regional') || lowered.includes('local')) return 'Regional';
  if (lowered.includes('season')) return 'Season Break';
  if (lowered.includes('custom')) return 'Custom';
  return 'National';
}

function normalizeHolidays(input: HolidayLookupPayload | null, sessionStart: string, sessionEnd: string) {
  if (!input?.holidays || !Array.isArray(input.holidays)) {
    return [] as AcademicHolidayEntry[];
  }

  const seen = new Set<string>();

  return input.holidays
    .map((item) => {
      const date = sanitize(item.date);
      const label = sanitize(item.label);
      const note = sanitize(item.note);

      if (!isValidIsoDate(date) || !label || date < sessionStart || date > sessionEnd) {
        return null;
      }

      const normalized: AcademicHolidayEntry = {
        date,
        label,
        category: normalizeCategory(sanitize(item.category)),
        note: note || 'Please verify with the latest official local notification.',
      };

      const key = `${normalized.date}-${normalized.label}`;
      if (seen.has(key)) {
        return null;
      }

      seen.add(key);
      return normalized;
    })
    .filter((item): item is AcademicHolidayEntry => Boolean(item))
    .slice(0, 16);
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<HolidayLookupInput>;

    const input: HolidayLookupInput = {
      schoolName: sanitize(payload.schoolName),
      academicYear: Number(payload.academicYear) || new Date().getFullYear(),
      country: sanitize(payload.country),
      province: sanitize(payload.province),
      sessionStart: sanitize(payload.sessionStart),
      sessionEnd: sanitize(payload.sessionEnd),
    };

    if (!input.country || !input.sessionStart || !input.sessionEnd) {
      return NextResponse.json(
        {
          success: false,
          message: 'Country and academic session dates are required.',
        },
        { status: 400 },
      );
    }

    const apiKey = pickApiKey();
    if (!apiKey) {
      return NextResponse.json({ success: true, holidays: [] });
    }

    const prompt = `You prepare academic calendar holiday suggestions for schools.
Return JSON only in this exact format:
{
  "holidays": [
    {
      "date": "YYYY-MM-DD",
      "label": "string",
      "category": "National | Provincial | Regional",
      "note": "string"
    }
  ]
}

Context:
- School name: ${input.schoolName || 'Not provided'}
- Academic year: ${input.academicYear}
- Country: ${input.country}
- Province/state/city: ${input.province || 'Not provided'}
- Session start: ${input.sessionStart}
- Session end: ${input.sessionEnd}

Rules:
- Include only holidays or likely closure dates relevant to this location and session.
- Prefer national and province/state-level public holidays.
- Keep maximum 12 entries.
- Do not include weekends.
- If a date can vary, mention official verification in the note.
- Return JSON only, with no explanation outside the JSON.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
          },
        }),
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      return NextResponse.json({ success: true, holidays: [] });
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    const rawText = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n') || '';
    const holidays = normalizeHolidays(extractJson(rawText), input.sessionStart, input.sessionEnd);

    return NextResponse.json({
      success: true,
      holidays,
    });
  } catch {
    return NextResponse.json({ success: true, holidays: [] });
  }
}
