import { NextResponse } from 'next/server';

type ResumeDraftInput = {
  name: string;
  address: string;
  phone: string;
  email: string;
  targetRole: string;
  profileSummary: string;
  professionalExperience: string;
  education: string;
  skills: string;
  achievements: string;
  certifications: string;
  languages: string;
  interests: string;
};

type GeneratedResumeContent = {
  headline: string;
  professionalSummary: string;
  experienceBullets: string[];
  achievementBullets: string[];
  coreSkills: string[];
  educationHighlights: string[];
  certifications: string[];
  languages: string[];
  interestsLine: string;
};

function sanitize(value: unknown) {
  return String(value ?? '').trim();
}

function pickApiKey() {
  return process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || '';
}

function splitList(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildFallbackResume(input: ResumeDraftInput): GeneratedResumeContent {
  return {
    headline: `${input.targetRole || 'Education Professional'} | TheMasterSahib Resume Studio`,
    professionalSummary:
      input.profileSummary ||
      `${input.name || 'This candidate'} is a motivated education professional with practical classroom experience, strong communication skills, and a commitment to student growth and academic excellence.`,
    experienceBullets:
      splitList(input.professionalExperience).slice(0, 6).length > 0
        ? splitList(input.professionalExperience).slice(0, 6)
        : ['Delivered classroom support, lesson preparation, and student guidance in a structured academic environment.'],
    achievementBullets:
      splitList(input.achievements).slice(0, 5).length > 0
        ? splitList(input.achievements).slice(0, 5)
        : ['Maintained a professional, student-focused, and growth-oriented teaching approach.'],
    coreSkills:
      splitList(input.skills).slice(0, 10).length > 0
        ? splitList(input.skills).slice(0, 10)
        : ['Classroom Management', 'Communication', 'Lesson Planning', 'Student Support'],
    educationHighlights:
      splitList(input.education).slice(0, 5).length > 0
        ? splitList(input.education).slice(0, 5)
        : ['Academic background details will appear here once added.'],
    certifications: splitList(input.certifications).slice(0, 5),
    languages: splitList(input.languages).slice(0, 6),
    interestsLine:
      input.interests || 'Professional development, reading, educational technology, and community service.',
  };
}

function extractJson(text: string): GeneratedResumeContent | null {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace < 0 || lastBrace < 0 || lastBrace <= firstBrace) {
    return null;
  }

  try {
    return JSON.parse(text.slice(firstBrace, lastBrace + 1)) as GeneratedResumeContent;
  } catch {
    return null;
  }
}

function normalizeArray(input: unknown) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((item) => sanitize(item)).filter(Boolean);
}

function normalizeResume(input: GeneratedResumeContent | null): GeneratedResumeContent | null {
  if (!input) {
    return null;
  }

  return {
    headline: sanitize(input.headline),
    professionalSummary: sanitize(input.professionalSummary),
    experienceBullets: normalizeArray(input.experienceBullets),
    achievementBullets: normalizeArray(input.achievementBullets),
    coreSkills: normalizeArray(input.coreSkills),
    educationHighlights: normalizeArray(input.educationHighlights),
    certifications: normalizeArray(input.certifications),
    languages: normalizeArray(input.languages),
    interestsLine: sanitize(input.interestsLine),
  };
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<ResumeDraftInput>;

    const input: ResumeDraftInput = {
      name: sanitize(payload.name),
      address: sanitize(payload.address),
      phone: sanitize(payload.phone),
      email: sanitize(payload.email),
      targetRole: sanitize(payload.targetRole),
      profileSummary: sanitize(payload.profileSummary),
      professionalExperience: sanitize(payload.professionalExperience),
      education: sanitize(payload.education),
      skills: sanitize(payload.skills),
      achievements: sanitize(payload.achievements),
      certifications: sanitize(payload.certifications),
      languages: sanitize(payload.languages),
      interests: sanitize(payload.interests),
    };

    if (!input.name || !input.targetRole) {
      return NextResponse.json(
        {
          success: false,
          message: 'Name and target role are required before building the resume.',
        },
        { status: 400 },
      );
    }

    const fallback = buildFallbackResume(input);
    const apiKey = pickApiKey();

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        content: fallback,
        message: 'A polished resume draft was prepared successfully.',
      });
    }

    const prompt = `You are an expert resume writer and career coach for teachers, coordinators, and education professionals in Pakistan.
Create a polished, attractive, ATS-friendly professional resume draft.
Return JSON only in this exact schema:
{
  "headline": "string",
  "professionalSummary": "string",
  "experienceBullets": ["string"],
  "achievementBullets": ["string"],
  "coreSkills": ["string"],
  "educationHighlights": ["string"],
  "certifications": ["string"],
  "languages": ["string"],
  "interestsLine": "string"
}

Candidate details:
- Name: ${input.name}
- Target role: ${input.targetRole}
- Address: ${input.address || 'Not provided'}
- Phone: ${input.phone || 'Not provided'}
- Email: ${input.email || 'Not provided'}
- Existing profile summary: ${input.profileSummary || 'Not provided'}
- Professional experience: ${input.professionalExperience || 'Not provided'}
- Education: ${input.education || 'Not provided'}
- Skills: ${input.skills || 'Not provided'}
- Achievements: ${input.achievements || 'Not provided'}
- Certifications: ${input.certifications || 'Not provided'}
- Languages: ${input.languages || 'Not provided'}
- Interests: ${input.interests || 'Not provided'}

Rules:
- Use professional but simple English.
- Make the summary confident and elegant.
- Convert raw details into strong bullet points.
- Keep each bullet concise and employment-ready.
- Do not invent false degrees or fake achievements.
- Improve wording, but stay truthful to the provided input.`;

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
            temperature: 0.65,
          },
        }),
      },
    );

    if (!response.ok) {
      return NextResponse.json({
        success: true,
        content: fallback,
        message: 'A polished resume draft has been prepared instead.',
      });
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    const rawText = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n') || '';
    const parsed = normalizeResume(extractJson(rawText));

    return NextResponse.json({
      success: true,
      content: parsed ?? fallback,
      message: parsed ? 'Your professional resume draft is ready.' : 'Your polished resume draft is ready.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unable to build the resume right now.',
      },
      { status: 500 },
    );
  }
}
