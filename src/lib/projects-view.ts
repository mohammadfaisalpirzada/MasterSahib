export type ProjectPage = {
  pageNumber: number;
  title: string;
  imageSrc: string;
};

export type ClientProject = {
  id: string;
  slug: string;
  title: string;
  clientName: string;
  category: string;
  description: string;
  totalPages: number;
  accessKey?: string;
  watermarkText: string;
  createdAt: string;
  pages: ProjectPage[];
};

export const clientProjectsRegistry: Record<string, ClientProject> = {
  shaheen_school: {
    id: 'shaheen_school',
    slug: 'shaheen_school',
    title: 'Shaheen GGSS Campus School Bihar Colony — SSB Booklet 2025–2026',
    clientName: 'Shaheen GGSS Campus School (Bihar Colony)',
    category: 'Government School SSB Transformation & Audit Booklet',
    description: 'Comprehensive 10-page color booklet documenting infrastructure overhaul, classroom renovation, furniture carpentry, electrical/solar installations, and final audit.',
    totalPages: 10,
    accessKey: 'shaheen2026',
    watermarkText: 'PREVIEW ONLY • THE MASTER SAHIB • CLIENT REVIEW — DO NOT REPRODUCE',
    createdAt: '2026-10-01',
    pages: [
      {
        pageNumber: 1,
        title: 'Page 01: Cover Page & Formal Identification',
        imageSrc: '/projects-view/shaheen_school/pages/page-01.png',
      },
      {
        pageNumber: 2,
        title: 'Page 02: Introduction, Vision & School Profile',
        imageSrc: '/projects-view/shaheen_school/pages/page-02.png',
      },
      {
        pageNumber: 3,
        title: 'Page 03: Entrance Gate & Courtyard Transformation',
        imageSrc: '/projects-view/shaheen_school/pages/page-03.png',
      },
      {
        pageNumber: 4,
        title: 'Page 04: Classrooms Plaster, Ceiling & Paint Works',
        imageSrc: '/projects-view/shaheen_school/pages/page-04.png',
      },
      {
        pageNumber: 5,
        title: 'Page 05: Student Desks & Dual-Benches Carpentry',
        imageSrc: '/projects-view/shaheen_school/pages/page-05.png',
      },
      {
        pageNumber: 6,
        title: 'Page 06: Washrooms & Hygiene Sanitation Overhaul',
        imageSrc: '/projects-view/shaheen_school/pages/page-06.png',
      },
      {
        pageNumber: 7,
        title: 'Page 07: Electrical Wiring, Fans & Solar Power Integration',
        imageSrc: '/projects-view/shaheen_school/pages/page-07.png',
      },
      {
        pageNumber: 8,
        title: 'Page 08: Academic Corridors & Stationery Stock Audit',
        imageSrc: '/projects-view/shaheen_school/pages/page-08.png',
      },
      {
        pageNumber: 9,
        title: 'Page 09: Campus Life, Assembly & Closing Remarks',
        imageSrc: '/projects-view/shaheen_school/pages/page-09.png',
      },
      {
        pageNumber: 10,
        title: 'Page 10: Summary, Expenditure & Final Audit Sign-Off',
        imageSrc: '/projects-view/shaheen_school/pages/page-10.png',
      },
    ],
  },
};

export function getClientProject(idOrSlug: string): ClientProject | null {
  const normalized = idOrSlug.toLowerCase().trim();
  return clientProjectsRegistry[normalized] || null;
}
