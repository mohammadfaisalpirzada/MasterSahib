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
  "sentence-learning",
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

// Public print-ready government forms under /govt-forms/*
const govtFormSlugs = [
  "admission-form",
  "ag-vendor-creation",
  "bonafide-certificate",
  "casual-leave-order",
  "character-certificate",
  "employee-data-verification",
  "joining-report",
  "leave-application-form",
  "medical-fitness-certificate",
  "no-dues-certificate",
  "no-inquiry-certificate",
  "noc-request-application",
  "pay01-employee-master-file",
  "pay02-payroll-amendment",
  "pay03-payroll-amendment-multiple",
  "pay05-temporary-gp-fund-loan",
  "pay06-permanent-gp-fund-advance",
  "pension-direct-credit-option",
  "pension-indemnity-bond",
  "pensioner-fingerprints",
  "school-leaving-certificate",
  "seniority-inclusion-application",
  "service-certificate",
  "service-profile-employee",
  "student-bonafide-certificate",
  "teacher-leave-application",
  "teaching-allowance-application",
  "time-scale-application",
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
  "/courses/ai-for-all",
  "/padlet",
  "/pay-fixation-2008",
  "/ggss-nishtar-road",
  "/govt-forms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const resourceRoutes = educationalResourceSlugs.map(
    (slug) => `/educational-resources/${slug}`
  );

  const govtFormRoutes = govtFormSlugs.map(
    (slug) => `/govt-forms/${slug}`
  );

  const now = new Date();

  return [...staticRoutes, ...resourceRoutes, ...govtFormRoutes].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
}
