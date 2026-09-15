import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { STAFF_ADMIN_SESSION_COOKIE, verifyStaffAdminSessionToken } from '@/app/lib/staffAdminAuth';
import { ADMISSION_FORM_SESSION_COOKIE, verifyAdmissionFormSessionToken } from '@/app/lib/admissionFormAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const pickApiKey = () => process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || '';

// Must also be logged in to the admission form itself (admin or admission-desk password).
const hasAdmissionFormSession = async () => {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get(STAFF_ADMIN_SESSION_COOKIE)?.value;
  if (adminToken && verifyStaffAdminSessionToken(adminToken)) return true;

  const admissionToken = cookieStore.get(ADMISSION_FORM_SESSION_COOKIE)?.value;
  if (admissionToken && verifyAdmissionFormSessionToken(admissionToken)) return true;

  return false;
};

const FIELD_KEYS = [
  'studentName',
  'dob',
  'nationality',
  'surname',
  'religion',
  'previousClass',
  'lastSchool',
  'grNo',
  'rollNo',
  'nadraStatus',
  'bFormNo',
  'address',
  'fatherName',
  'fatherCnic',
  'fatherCell',
  'fatherQualification',
  'fatherOccupation',
  'motherName',
  'motherCnic',
  'motherCell',
  'guardianCell',
  'whatsappNo',
] as const;

const extractJson = (raw: string): Record<string, string> | null => {
  const cleaned = raw.replace(/```json/gi, '```').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return null;
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    if (typeof parsed !== 'object' || !parsed) return null;
    return parsed as Record<string, string>;
  } catch {
    return null;
  }
};

const normalizeFields = (raw: Record<string, string>) => {
  const result: Record<string, string> = {};
  for (const key of FIELD_KEYS) {
    const value = raw[key];
    if (typeof value === 'string' && value.trim() && value.trim().toLowerCase() !== 'not available' && value.trim().toLowerCase() !== 'unknown') {
      result[key] = value.trim();
    }
  }
  return result;
};

const PROMPT_INSTRUCTIONS = `You are helping front-desk staff at a Pakistani government school fill out a
paper Admission Form by reading one or more source images/text (these could be
a photo of a Child's B-Form, a CNIC, a previous school leaving certificate, an
already hand-filled admission form, or a WhatsApp text message from a parent).
If more than one image is given, treat them as pages/documents for the SAME
child and combine details from all of them into one single answer — do not
report per-image results.

LANGUAGE: Always answer in English (Roman script) only. If a name, address, or
any other detail on the document is written in Urdu, transliterate it into
readable Roman English (e.g. "محمد علی" -> "Muhammad Ali") — never put Urdu/Arabic
script characters in the JSON output.

PHONE vs CNIC — do not mix these up:
- A Pakistani CNIC / B-Form number is always 13 digits, format XXXXX-XXXXXXX-X.
- A Pakistani mobile number is always 11 digits, always starts with "03",
  format 03XX-XXXXXXX. It is NEVER 13 digits and never starts with the same
  digits as a CNIC block. If a number does not start with "03" and is not
  exactly 11 digits, it is NOT a phone number — do not put it in a phone field.
- Read each digit carefully; do not transpose or drop digits. If you are not
  fully confident in every digit of a number, leave that field out entirely
  rather than guessing.

Extract ONLY the fields you can clearly read or infer. Respond with STRICT JSON
only (no markdown, no commentary), using exactly these keys — omit a key
entirely if you cannot find it, do not guess or invent values:

{
  "studentName": "string",
  "dob": "YYYY-MM-DD",
  "nationality": "string",
  "surname": "string",
  "religion": "string",
  "previousClass": "string",
  "lastSchool": "string",
  "grNo": "string",
  "rollNo": "string",
  "nadraStatus": "Available or Not Available",
  "bFormNo": "13-digit number, format XXXXX-XXXXXXX-X",
  "address": "string",
  "fatherName": "string",
  "fatherCnic": "13-digit number, format XXXXX-XXXXXXX-X",
  "fatherCell": "11-digit Pakistani mobile, format 03XX-XXXXXXX",
  "fatherQualification": "string",
  "fatherOccupation": "string",
  "motherName": "string",
  "motherCnic": "13-digit number, format XXXXX-XXXXXXX-X",
  "motherCell": "11-digit Pakistani mobile, format 03XX-XXXXXXX",
  "guardianCell": "11-digit Pakistani mobile, format 03XX-XXXXXXX",
  "whatsappNo": "11-digit Pakistani mobile, format 03XX-XXXXXXX"
}

Rules:
- Never fabricate a value. If something is unclear or missing, leave that key out.
- Dates must be in YYYY-MM-DD format.
- CNIC / B-Form numbers must be exactly 13 digits, dash-formatted as shown.
- Phone numbers must be exactly 11 digits, dash-formatted as shown.
- If the source is a WhatsApp-style text message rather than a document, pull whatever it states (e.g. "beta ka naam Ali hai, CNIC father 42101-1234567-1") into the matching fields.`;

export async function POST(request: NextRequest) {
  try {
    if (!(await hasAdmissionFormSession())) {
      return NextResponse.json({ success: false, message: 'Session expired. Please login again.' }, { status: 401 });
    }

    const apiKey = pickApiKey();
    if (!apiKey) {
      return NextResponse.json({ success: false, message: 'Scan feature is not configured on the server yet.' }, { status: 500 });
    }

    const body = (await request.json()) as {
      mode?: 'image' | 'text';
      images?: Array<{ base64?: string; mimeType?: string }>;
      text?: string;
    };

    // Both photo scanning and text auto-fill are now open to every
    // logged-in admission-form user (admin or admission-desk) — the
    // hasAdmissionFormSession() check above already covers both roles.
    const parts: Array<Record<string, unknown>> = [{ text: PROMPT_INSTRUCTIONS }];

    if (body.mode === 'image') {
      const images = (body.images || []).filter((img) => img && img.base64).slice(0, 5);
      if (!images.length) {
        return NextResponse.json({ success: false, message: 'No image received.' }, { status: 400 });
      }
      images.forEach((img) => {
        parts.push({ inlineData: { mimeType: img.mimeType || 'image/jpeg', data: img.base64 } });
      });
    } else if (body.mode === 'text') {
      const text = String(body.text || '').trim();
      if (!text) {
        return NextResponse.json({ success: false, message: 'Please paste some text first.' }, { status: 400 });
      }
      parts.push({ text: `Source text message:\n"""\n${text}\n"""` });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid scan mode.' }, { status: 400 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: { temperature: 0.2 },
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      // Gemini returns 429 ("Resource has been exhausted") or 503 ("The
      // model is overloaded") when it's under heavy load — show a friendly,
      // one-line retry prompt instead of the raw error dump in that case.
      if (response.status === 429 || response.status === 503) {
        return NextResponse.json(
          { success: false, message: 'The scan service is a bit busy right now — please try again in a moment.' },
          { status: 503 },
        );
      }
      return NextResponse.json(
        { success: false, message: `Scan failed (AI service error). ${errText.slice(0, 150)}` },
        { status: 502 },
      );
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const rawText = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n') || '';
    const parsedRaw = extractJson(rawText);

    if (!parsedRaw) {
      return NextResponse.json({ success: false, message: 'Could not read any usable details from that. Try a clearer photo or different text.' }, { status: 200 });
    }

    const fields = normalizeFields(parsedRaw);

    if (Object.keys(fields).length === 0) {
      return NextResponse.json({ success: false, message: 'No recognizable admission details were found.' }, { status: 200 });
    }

    return NextResponse.json({ success: true, fields });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Unable to scan right now.' },
      { status: 500 },
    );
  }
}
