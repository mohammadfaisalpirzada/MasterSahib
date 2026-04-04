'use client';

import { useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { HiEye, HiOutlinePhotograph, HiPrinter } from 'react-icons/hi';

type ResumeFormData = {
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

type AiResumeContent = {
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

type ResumeApiResponse = {
  success: boolean;
  content?: AiResumeContent;
  message?: string;
};

const defaultFormData: ResumeFormData = {
  name: 'Muhammad Faisal Peerzada',
  address: 'Karachi, Pakistan',
  phone: '0345-8340-XXX',
  email: 'your-email@example.com',
  targetRole: 'Senior Teacher / Academic Coordinator',
  profileSummary:
    'Dedicated education professional with strong communication, lesson planning, and student engagement skills.',
  professionalExperience:
    'Managed classroom learning effectively\nPrepared lesson plans and assessments\nSupported student growth and parent communication',
  education: 'M.Ed\nB.Ed\nRelevant professional teaching training',
  skills: 'Classroom Management, Lesson Planning, Communication, MS Office, Educational Technology',
  achievements: 'Improved student participation\nSupported school event planning\nMaintained strong classroom discipline',
  certifications: 'Teaching Workshop Certificate\nICT in Education Training',
  languages: 'English, Urdu',
  interests: 'Reading, educational technology, mentoring students',
};

const toList = (value: string) =>
  value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const buildLocalResume = (formData: ResumeFormData): AiResumeContent => ({
  headline: `${formData.targetRole || 'Education Professional'} | TheMasterSahib Resume Studio`,
  professionalSummary:
    formData.profileSummary ||
    `${formData.name || 'This candidate'} is a motivated and reliable professional with a strong commitment to quality work and continuous growth.`,
  experienceBullets:
    toList(formData.professionalExperience).slice(0, 6).length > 0
      ? toList(formData.professionalExperience).slice(0, 6)
      : ['Professional experience details will appear here.'],
  achievementBullets:
    toList(formData.achievements).slice(0, 5).length > 0
      ? toList(formData.achievements).slice(0, 5)
      : ['Professional achievements will appear here once added.'],
  coreSkills:
    toList(formData.skills).slice(0, 10).length > 0
      ? toList(formData.skills).slice(0, 10)
      : ['Communication', 'Teamwork', 'Planning'],
  educationHighlights:
    toList(formData.education).slice(0, 6).length > 0
      ? toList(formData.education).slice(0, 6)
      : ['Education details will appear here.'],
  certifications: toList(formData.certifications).slice(0, 5),
  languages: toList(formData.languages).slice(0, 6),
  interestsLine: formData.interests || 'Professional development, reading, and community engagement.',
});

type ResumePreviewProps = {
  formData: ResumeFormData;
  imagePreview: string | null;
  content: AiResumeContent;
};

function ResumePreview({ formData, imagePreview, content }: ResumePreviewProps) {
  const contactItems = [formData.address, formData.phone, formData.email].filter(Boolean);

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-slate-900 via-blue-800 to-cyan-600 px-6 py-7 text-white sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-white/25 bg-white/10">
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Profile"
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-3xl font-black">{(formData.name || 'CV').slice(0, 1).toUpperCase()}</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-black sm:text-3xl">{formData.name || 'Your Name'}</h2>
            <p className="mt-1 text-sm font-semibold text-cyan-100 sm:text-base">{content.headline}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-100">
              {contactItems.map((item) => (
                <span key={item} className="rounded-full border border-white/20 bg-white/10 px-3 py-1">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[1.4fr,0.9fr]">
        <div className="space-y-6">
          <section>
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Professional Summary</h3>
            <p className="mt-2 text-sm leading-7 text-slate-700">{content.professionalSummary}</p>
          </section>

          <section>
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Experience Highlights</h3>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-700">
              {content.experienceBullets.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-cyan-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Achievements</h3>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-700">
              {content.achievementBullets.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-5">
          <section>
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Core Skills</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {content.coreSkills.map((item) => (
                <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {item}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Education</h3>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-700">
              {content.educationHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          {content.certifications.length ? (
            <section>
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Certifications</h3>
              <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-700">
                {content.certifications.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {content.languages.length ? (
            <section>
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Languages</h3>
              <p className="mt-2 text-sm leading-7 text-slate-700">{content.languages.join(' • ')}</p>
            </section>
          ) : null}

          <section>
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">Interests</h3>
            <p className="mt-2 text-sm leading-7 text-slate-700">{content.interestsLine}</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function ResumeForm() {
  const [formData, setFormData] = useState<ResumeFormData>(defaultFormData);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResume, setAiResume] = useState<AiResumeContent | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    'Fill in your details to create a strong and professional CV.',
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const previewContent = useMemo(() => aiResume ?? buildLocalResume(formData), [aiResume, formData]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateWithAI = async () => {
    try {
      setIsGenerating(true);
      setStatusMessage('Your professional CV is being prepared...');

      const response = await fetch('/api/resume-builder/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = (await response.json()) as ResumeApiResponse;

      if (!response.ok || !data.content) {
        throw new Error(data.message || 'Unable to build the resume right now.');
      }

      setAiResume(data.content);
      setStatusMessage(data.message || 'Your professional resume is ready.');
    } catch (error) {
      setAiResume(buildLocalResume(formData));
      setStatusMessage(
        error instanceof Error ? error.message : 'A polished resume draft has been prepared for you.',
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <section className="resume-input-panel no-print rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Resume Studio</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">Enter Your Details</h2>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <HiOutlinePhotograph className="h-4 w-4" />
              Upload Photo
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              aria-label="Upload profile photo"
              title="Upload profile photo"
              className="hidden"
            />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-800">Full Name</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-800">Target Role</span>
              <input
                type="text"
                name="targetRole"
                value={formData.targetRole}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-800">Address</span>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-800">Phone</span>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-800">Email</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-800">Professional Summary</span>
              <textarea
                name="profileSummary"
                rows={3}
                value={formData.profileSummary}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-800">Professional Experience</span>
              <textarea
                name="professionalExperience"
                rows={4}
                value={formData.professionalExperience}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
                placeholder="Write each key experience on a new line"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-800">Education</span>
              <textarea
                name="education"
                rows={3}
                value={formData.education}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-800">Skills</span>
              <textarea
                name="skills"
                rows={3}
                value={formData.skills}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
                placeholder="Comma-separated or line-by-line"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-800">Achievements</span>
              <textarea
                name="achievements"
                rows={3}
                value={formData.achievements}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-800">Certifications</span>
              <textarea
                name="certifications"
                rows={3}
                value={formData.certifications}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-800">Languages & Interests</span>
              <textarea
                name="languages"
                rows={1}
                value={formData.languages}
                onChange={handleInputChange}
                className="mb-2 w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
                placeholder="English, Urdu"
              />
              <textarea
                name="interests"
                rows={2}
                value={formData.interests}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500"
                placeholder="Reading, mentoring, educational technology"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleGenerateWithAI}
              disabled={isGenerating}
              className="inline-flex items-center rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isGenerating ? 'Building CV...' : 'Build CV'}
            </button>

            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <HiEye className="h-4 w-4" />
              Open Preview
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <HiPrinter className="h-4 w-4" />
              Print / Save PDF
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            {statusMessage}
          </div>
        </section>

        <section className="resume-print-area print-surface rounded-3xl border border-slate-200 bg-slate-50 p-3 shadow-sm sm:p-4">
          <ResumePreview formData={formData} imagePreview={imagePreview} content={previewContent} />
        </section>
      </div>

      {isPreviewOpen ? (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 p-4 backdrop-blur-sm no-print">
          <div className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h3 className="text-lg font-bold text-slate-900">Resume Preview</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="overflow-auto p-4 sm:p-6">
              <ResumePreview formData={formData} imagePreview={imagePreview} content={previewContent} />
            </div>
          </div>
        </div>
      ) : null}

      <style jsx global>{`
        @media print {
          .no-print,
          header,
          .resume-page-hero {
            display: none !important;
          }

          body {
            background: #ffffff !important;
          }

          .resume-print-area,
          .print-surface {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
          }
        }
      `}</style>
    </div>
  );
}
