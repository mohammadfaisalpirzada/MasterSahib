import type { MetadataRoute } from "next";

const baseUrl = "https://themastersahib.com";

// Public tool pages under /educational-resources/*
const educationalResourceSlugs = [
  "3d-shapes",
  "academic-calendar",
  "alphabet-learning",
  "art-gallery",
  "assembly-planner",
  "attendance-tracker",
  "automatic-lesson-plan",
  "creative-writing",
  "english-grammar",
  "exit-ticket",
  "fill-blanks",
  "fun-learning",
  "math-practice",
  "math-secondary",
  "number-fun",
  "o-level-career-selection",
  "science-experiments",
  "shape-learning",
  "spelling-bee",
  "steda-teaching-license",
  "students-age-calculator",
  "table-times",
  "timetable-generator",
  "typing-tutor",
  "urdu-reading",
  "worksheet-builder",
];

// Public top-level marketing / tool pages (excludes auth-gated GGSS
// staff/admin/stipend routes, /api, /auth, /my-presentations, /audience)
const staticRoutes = [
  "",
  "/educational-resources",
  "/igcse-0580-mathematics",
  "/teaching-license",
  "/teaching-license/hub",
  "/upgraded-salary-calculator",
  "/contact",
  "/portfolio",
  "/resume-builder",
  "/softwares",
  "/softwares/video-editor",
  "/courses/ai-for-teachers",
  "/padlet",
  "/pay-fixation-2008",
  "/ggss-nishtar-road",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const resourceRoutes = educationalResourceSlugs.map(
    (slug) => `/educational-resources/${slug}`
  );

  const now = new Date();

  return [...staticRoutes, ...resourceRoutes].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
}
