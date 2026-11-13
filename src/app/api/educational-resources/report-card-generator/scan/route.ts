import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const pickApiKey = () => process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || '';

const extractJson = (raw: string): any => {
  const cleaned = raw.replace(/```json/gi, '```').replace(/```/g, '').trim();
  const start = cleaned.indexOf('[');
  const startObj = cleaned.indexOf('{');

  // Check if it's array
  if (start !== -1 && (startObj === -1 || start < startObj)) {
    const end = cleaned.lastIndexOf(']');
    if (end > start) {
      try {
        const arr = JSON.parse(cleaned.slice(start, end + 1));
        return { students: arr };
      } catch {
        // fallback
      }
    }
  }

  // Check if it's object with students or schoolName
  if (startObj !== -1) {
    const endObj = cleaned.lastIndexOf('}');
    if (endObj > startObj) {
      try {
        const parsed = JSON.parse(cleaned.slice(startObj, endObj + 1));
        if (Array.isArray(parsed)) {
          return { students: parsed };
        }
        if (Array.isArray(parsed.students)) {
          return parsed;
        }
        if (Array.isArray(parsed.results)) {
          return { ...parsed, students: parsed.results };
        }
        return parsed;
      } catch {
        return null;
      }
    }
  }

  return null;
};

const PROMPT_INSTRUCTIONS = `You are an elite academic data extractor and OCR specialist specialized in Pakistani school Result Tabulation Sheets, Marksheets, Gazettes, and Award Lists (both handwritten and printed, from Sindh, Punjab, Federal, and private schools).

CRITICAL DIRECTIVE ON HANDWRITING RECOGNITION (EXTREME CARE REQUIRED):
1. ACCURATE DIGIT DISAMBIGUATION:
   - Pakistani teachers write digits with distinct variations. Be extremely careful not to confuse:
     * '7' vs '1': '7' typically has a top hook or crossbar; '1' is a single vertical stroke.
     * '4' vs '9': check open four vs closed loop nine.
     * '3' vs '5' or '8': trace the strokes carefully.
     * '0' vs '6': check if there is an upper stem.
   - Always evaluate the full row and surrounding students to understand that specific teacher's handwriting style before deciding ambiguous digits.

2. STRICT SUBJECT COLUMN ALIGNMENT:
   - Carefully identify each subject header at the top or side of the table (English, Urdu, Sindhi, Islamiat, Mathematics, General Science, Pak Studies, etc.).
   - Make sure marks are extracted strictly into the correct subject column for each student.
   - Do NOT shift columns or map a student's Science marks into Math.

3. NAME & FATHER NAME TRANSLITERATION:
   - If names are handwritten in Urdu script, read them accurately and transliterate into clean, standard Roman English (e.g. "فاطمہ خان" -> "Fatima Khan", "محمد طارق" -> "Muhammad Tariq").
   - If Roll No or GR No are written, extract them accurately.

4. ARITHMETIC RE-CALCULATION & CROSS-CHECKING:
   - Teachers often make calculation mistakes when manually adding marks in handwritten sheets.
   - For every student, extract the individual subject marks obtained and max marks.
   - Extract the teacher's written total in "writtenTotalOnSheet" if visible.
   - Calculate the TRUE mathematical sum of obtained marks across the tested subjects.
   - Calculate the TRUE grand total max marks.
   - Compute the exact percentage: (obtained / max) * 100 rounded to 1 decimal place.
   - Compute Grade: >= 80% A+, >= 70% A, >= 60% B, >= 50% C, >= 40% D, < 40% Fail.
   - Set Result: "PASS" if all tested subjects >= 40% (and total >= 40%), else "FAIL".

5. SCHOOL NAME EXTRACTION:
   - If a School Name appears at the top header, banner, or stamp, extract it into the "schoolName" property.

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "schoolName": "Detected School Name (or empty string)",
  "students": [
    {
      "rollNo": "string",
      "grNo": "string",
      "studentName": "string",
      "fatherName": "string",
      "studentClass": "string",
      "dob": "string (optional)",
      "address": "string (optional)",
      "subjects": {
        "english": { "maxMarks": 100, "marksObtained": 78 },
        "urdu": { "maxMarks": 100, "marksObtained": 85 },
        "islamiat_oral": { "maxMarks": 40, "marksObtained": 35 },
        "islamiat_written": { "maxMarks": 60, "marksObtained": 48 },
        "islamiat_total": { "maxMarks": 100, "marksObtained": 83 },
        "mathematics": { "maxMarks": 100, "marksObtained": 70 },
        "g_science": { "maxMarks": 100, "marksObtained": 75 },
        "social_pak_studies": { "maxMarks": 100, "marksObtained": 68 },
        "sindhi": { "maxMarks": 100, "marksObtained": 74 }
      },
      "writtenTotalOnSheet": 380,
      "grandTotalMax": 500,
      "grandTotalObtained": 380,
      "percentage": "76.0%",
      "grade": "A",
      "rank": "1st",
      "result": "PASS",
      "attendance": "92%",
      "conduct": "Good"
    }
  ]
}`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = pickApiKey();
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: 'Scanning service is currently unavailable. Please try again later.' },
        { status: 500 },
      );
    }

    const body = (await request.json()) as {
      fileBase64?: string;
      mimeType?: string;
      files?: Array<{ fileBase64: string; mimeType: string }>;
      rawText?: string;
      additionalNotes?: string;
    };

    const filesToScan =
      body.files && body.files.length > 0
        ? body.files
        : body.fileBase64
          ? [{ fileBase64: body.fileBase64, mimeType: body.mimeType || 'image/jpeg' }]
          : [];
    const trimmedText = typeof body.rawText === 'string' ? body.rawText.trim() : '';

    if (!filesToScan.length && !trimmedText) {
      return NextResponse.json({ success: false, message: 'No image, PDF, or text data received for scanning.' }, { status: 400 });
    }

    const parts: Array<Record<string, unknown>> = [{ text: PROMPT_INSTRUCTIONS }];

    if (trimmedText) {
      parts.push({
        text: `RAW TEXT / PASTED DATA TO PARSE INTO STUDENT REPORT CARDS:\n${trimmedText}`,
      });
    }

    if (body.additionalNotes?.trim()) {
      parts.push({
        text: `Additional User Instructions / Context:\n${body.additionalNotes.trim()}`,
      });
    }

    filesToScan.slice(0, 5).forEach((file) => {
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
        { success: false, message: 'Document scan could not be processed. Please upload a clearer photo.' },
        { status: 502 },
      );
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const rawOutput = data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('\n') || '';
    const parsed = extractJson(rawOutput);

    if (!parsed || (!Array.isArray(parsed.students) && !Array.isArray(parsed))) {
      return NextResponse.json(
        {
          success: false,
          message: 'Could not detect structured tabulation data. Please ensure the photo/PDF is clear and well-lit.',
          rawOutput: rawOutput.slice(0, 500),
        },
        { status: 200 },
      );
    }

    const rawStudents: any[] = Array.isArray(parsed.students) ? parsed.students : Array.isArray(parsed) ? parsed : [];
    const schoolName = parsed.schoolName || '';

    // Rigorous Server-Side Mathematical Verification & Re-calculation Pass
    const verifiedStudents = rawStudents.map((st: any) => {
      let calcMax = 0;
      let calcObt = 0;
      let anySubjFailed = false;

      if (st.subjects && typeof st.subjects === 'object') {
        Object.entries(st.subjects).forEach(([key, score]: [string, any]) => {
          const max = parseFloat(String(score?.maxMarks ?? '0')) || 0;
          const rawObt = parseFloat(String(score?.marksObtained ?? '0')) || 0;
          const obt = max > 0 ? Math.min(Math.max(0, rawObt), max) : Math.max(0, rawObt);
          if (score && typeof score === 'object' && max > 0) {
            score.marksObtained = obt;
          }
          if (key === 'islamiat_oral' || key === 'islamiat_written') {
            // Handled as part of islamiat_total
            return;
          }
          if (max > 0) {
            calcMax += max;
            calcObt += obt;
            if (obt < max * 0.4) {
              anySubjFailed = true;
            }
          }
        });
      }

      // If Islamiat oral + written was provided without islamiat_total
      if (
        st.subjects?.islamiat_oral &&
        st.subjects?.islamiat_written &&
        !st.subjects?.islamiat_total
      ) {
        const oral = parseFloat(String(st.subjects.islamiat_oral.marksObtained ?? '0')) || 0;
        const writ = parseFloat(String(st.subjects.islamiat_written.marksObtained ?? '0')) || 0;
        st.subjects.islamiat_total = {
          maxMarks: 100,
          marksObtained: oral + writ,
        };
        calcMax += 100;
        calcObt += (oral + writ);
      }

      const finalMax = calcMax > 0 ? calcMax : (parseFloat(String(st.grandTotalMax || '0')) || 0);
      const finalObt = calcMax > 0 ? calcObt : (parseFloat(String(st.grandTotalObtained || '0')) || 0);
      const pct = finalMax > 0 ? (finalObt / finalMax) * 100 : 0;

      let grade = 'Fail';
      if (pct >= 80) grade = 'A+';
      else if (pct >= 70) grade = 'A';
      else if (pct >= 60) grade = 'B';
      else if (pct >= 50) grade = 'C';
      else if (pct >= 40) grade = 'D';

      const result = !anySubjFailed && pct >= 40 ? 'PASS' : 'FAIL';

      return {
        ...st,
        grandTotalMax: finalMax > 0 ? finalMax : st.grandTotalMax || 0,
        grandTotalObtained: finalObt,
        percentage: `${pct.toFixed(1)}%`,
        grade,
        result,
        writtenTotalOnSheet: st.writtenTotalOnSheet ?? null,
      };
    });

    return NextResponse.json({
      success: true,
      schoolName,
      students: verifiedStudents,
      count: verifiedStudents.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Error processing AI scan.' },
      { status: 500 },
    );
  }
}
