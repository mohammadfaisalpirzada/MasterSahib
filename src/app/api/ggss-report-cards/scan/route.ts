import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { STAFF_ADMIN_SESSION_COOKIE, verifyStaffAdminSessionToken } from '@/app/lib/staffAdminAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const pickApiKey = () => process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || '';

const isFullAdmin = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_ADMIN_SESSION_COOKIE)?.value;
  return Boolean(token && verifyStaffAdminSessionToken(token));
};

const extractJson = (raw: string): unknown => {
  const cleaned = raw.replace(/```json/gi, '```').replace(/```/g, '').trim();
  const start = cleaned.indexOf('[');
  const startObj = cleaned.indexOf('{');

  // Check if it's array or object
  if (start !== -1 && (startObj === -1 || start < startObj)) {
    const end = cleaned.lastIndexOf(']');
    if (end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        // fallback
      }
    }
  }

  if (startObj !== -1) {
    const endObj = cleaned.lastIndexOf('}');
    if (endObj > startObj) {
      try {
        const parsed = JSON.parse(cleaned.slice(startObj, endObj + 1));
        return parsed.students || parsed.results || parsed;
      } catch {
        return null;
      }
    }
  }

  return null;
};

const PROMPT_INSTRUCTIONS = `You are an expert academic data extractor specialized in Pakistani school Result Tabulation Sheets (Gazettes, Award Lists, Marksheets) from Govt. Girls Secondary School (GGSS), Sindh.

Analyze the attached document (Photo or PDF) carefully. It may be handwritten or printed. It contains results of one or multiple students across several subjects.

STANDARD SUBJECT KEYS TO MAP TO:
- "english" (English)
- "urdu" (Urdu)
- "social_pak_studies" (S. Studies / Social Studies / Pak Studies / Mutala-e-Pakistan)
- "sindhi" (Sindhi / Asan Sindhi / Saleem Sindhi)
- "islamiat" (Islamiat - note if Nazra/Oral or Written is broken down, extract both oral and written; otherwise total)
  * "islamiat_oral": max usually 40
  * "islamiat_written": max usually 60
  * "islamiat_total": max usually 100
- "g_science" (General Science / Science)
- "mathematics" (Mathematics / Maths / Math / Hisaab)
- "h_economics" (Home Economics)
- "arabic_drawing" (Arabic / Drawing / Art)
- "biology_computer" (Biology / Computer Science)
- "physics" (Physics)
- "chemistry" (Chemistry)

CRITICAL EXTRACTION RULES:
1. ONLY INCLUDE SUBJECTS THAT ARE ACTUALLY IN THE SHEET / OFFERED TO THE CLASS:
   - Do NOT invent or fill marks for subjects that are not in this tabulation sheet.
   - For example, if primary/middle classes only have 5 or 6 subjects (English, Urdu, Sindhi, Islamiat, Maths, Science), do NOT add Physics or Chemistry.
2. ACCURATE SUBJECT RECOGNITION:
   - Identify which subjects have been tested in this sheet.
   - Determine the "maxMarks" for each subject (usually 100, or 50, or Islamiat 40+60).
3. DETECT MISSING / ANOMALOUS MARKS:
   - If other students have marks for a subject, but for a specific student the marks cell is empty, blank, a dash, "A", "Ab", or unclear, set:
     "isMissing": true, and set "rawStatus": "ABSENT" | "EMPTY" | "UNCLEAR".
     Do NOT silently guess!
4. LANGUAGE:
   - If student name or father name is in Urdu script, accurately transliterate to standard Roman English (e.g. "فاطمہ" -> "Fatima", "محمد سلیم" -> "Muhammad Saleem").
5. ACCURATE CALCULATIONS (ONLY ON OFFERED/TESTED SUBJECTS):
   - grandTotalMax: sum of maxMarks of only the subjects tested.
   - grandTotalObtained: sum of marksObtained for that student.
   - percentage: (grandTotalObtained / grandTotalMax) * 100 rounded to 1 decimal place.
   - grade:
     >= 80% -> "A+"
     >= 70% and < 80% -> "A"
     >= 60% and < 70% -> "B"
     >= 50% and < 60% -> "C"
     >= 40% and < 50% -> "D"
     < 40% -> "Fail"
   - result: "PASS" if all tested subjects >= 40% (or total >= 40%), otherwise "FAIL".

Output STRICT JSON ONLY as an Array of Student Objects:
[
  {
    "rollNo": "string",
    "grNo": "string",
    "studentName": "string",
    "fatherName": "string",
    "studentClass": "string",
    "subjects": {
      "english": { "maxMarks": 100, "marksObtained": 78 },
      "urdu": { "maxMarks": 100, "marksObtained": 85 },
      "islamiat_oral": { "maxMarks": 40, "marksObtained": 35 },
      "islamiat_written": { "maxMarks": 60, "marksObtained": 48 },
      "islamiat_total": { "maxMarks": 100, "marksObtained": 83 }
    },
    "missingSubjects": [
      { "subjectKey": "mathematics", "subjectLabel": "Mathematics", "rawStatus": "ABSENT" }
    ],
    "grandTotalMax": 500,
    "grandTotalObtained": 380,
    "percentage": "76.0%",
    "grade": "A",
    "rank": "1st",
    "result": "PASS",
    "attendance": "92%",
    "conduct": "Good"
  }
]`;

export async function POST(request: NextRequest) {
  try {
    if (!(await isFullAdmin())) {
      return NextResponse.json({ success: false, message: 'Admin access only.' }, { status: 403 });
    }

    const apiKey = pickApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: 'Gemini AI API key is not configured on server (GOOGLE_AI_API_KEY).' },
        { status: 500 },
      );
    }

    const body = (await request.json()) as {
      fileBase64?: string;
      mimeType?: string;
      files?: Array<{ fileBase64: string; mimeType: string }>;
      additionalNotes?: string;
    };

    const filesToScan = body.files && body.files.length > 0
      ? body.files
      : body.fileBase64
        ? [{ fileBase64: body.fileBase64, mimeType: body.mimeType || 'image/jpeg' }]
        : [];

    if (!filesToScan.length) {
      return NextResponse.json({ success: false, message: 'No image or PDF received for scanning.' }, { status: 400 });
    }

    const parts: Array<Record<string, unknown>> = [
      { text: PROMPT_INSTRUCTIONS },
    ];

    if (body.additionalNotes?.trim()) {
      parts.push({
        text: `Additional User Instructions / Context:\n${body.additionalNotes.trim()}`,
      });
    }

    filesToScan.slice(0, 5).forEach((file) => {
      // Strip potential data URL prefix if present
      const cleanBase64 = file.fileBase64.replace(/^data:[^;]+;base64,/, '').trim();
      const mime = file.mimeType || (cleanBase64.startsWith('JVBERi0') ? 'application/pdf' : 'image/jpeg');

      parts.push({
        inlineData: {
          mimeType: mime,
          data: cleanBase64,
        },
      });
    });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
          },
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      if (response.status === 429 || response.status === 503) {
        return NextResponse.json(
          { success: false, message: 'Gemini AI service is currently busy. Please wait a moment and try again.' },
          { status: 503 },
        );
      }
      return NextResponse.json(
        { success: false, message: `AI Scan failed: ${errText.slice(0, 150)}` },
        { status: 502 },
      );
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const rawOutput = data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('\n') || '';
    const parsed = extractJson(rawOutput);

    if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Could not detect structured tabulation data. Please ensure the photo/PDF is clear and well-lit.',
          rawOutput: rawOutput.slice(0, 500),
        },
        { status: 200 },
      );
    }

    return NextResponse.json({
      success: true,
      students: parsed,
      count: parsed.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Error processing AI scan.' },
      { status: 500 },
    );
  }
}
