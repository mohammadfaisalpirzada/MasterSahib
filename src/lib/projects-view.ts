import fs from 'node:fs';
import path from 'node:path';

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

export const OWNER_EMAIL = 'mohammadfaisalpirzada@gmail.com';

const configFilePath = path.join(process.cwd(), 'src', 'data', 'projects-view-config.json');

// Default fallback registry
const defaultRegistry: Record<string, ClientProject> = {
  shaheen_school: {
    id: 'shaheen_school',
    slug: 'shaheen_school',
    title: 'Shaheen GGSS Campus School Bihar Colony — SSB Booklet 2025–2026',
    clientName: 'Shaheen GGSS Campus School (Bihar Colony)',
    category: 'Government School SSB Transformation & Audit Booklet',
    description: 'Comprehensive 13-page color booklet documenting infrastructure overhaul, classroom renovation, furniture carpentry, electrical/solar installations, and final audit.',
    totalPages: 13,
    accessKey: 'shaheen2026',
    watermarkText: 'PREVIEW ONLY • THE MASTER SAHIB • CLIENT REVIEW — DO NOT REPRODUCE',
    createdAt: '2026-10-01',
    pages: [
      { pageNumber: 1, title: 'Page 01: Cover Page & Formal Identification', imageSrc: '/projects-view/shaheen_school/pages/page-01.png' },
      { pageNumber: 2, title: 'Page 02: Headmistress & Administrative Office Renovation', imageSrc: '/projects-view/shaheen_school/pages/page-02.png' },
      { pageNumber: 3, title: 'Page 03: Executive Summary & Campus Profile', imageSrc: '/projects-view/shaheen_school/pages/page-03.png' },
      { pageNumber: 4, title: 'Page 04: Main Entrance Gate & Central Courtyard', imageSrc: '/projects-view/shaheen_school/pages/page-04.png' },
      { pageNumber: 5, title: 'Page 05: Classroom Plastering & Color Coating', imageSrc: '/projects-view/shaheen_school/pages/page-05.png' },
      { pageNumber: 6, title: 'Page 06: Student Dual Desks & Seating Refurbishment', imageSrc: '/projects-view/shaheen_school/pages/page-06.png' },
      { pageNumber: 7, title: 'Page 07: Steel Almirahs & Office Storage Cabinets Refurbishment', imageSrc: '/projects-view/shaheen_school/pages/page-07.png' },
      { pageNumber: 8, title: 'Page 08: Washrooms, Sanitation & Drainage Overhaul', imageSrc: '/projects-view/shaheen_school/pages/page-08.png' },
      { pageNumber: 9, title: 'Page 09: Classroom Ventilation & Solar System Maintenance', imageSrc: '/projects-view/shaheen_school/pages/page-09.png' },
      { pageNumber: 10, title: 'Page 10: Cleaning Materials & Sanitation Supplies Inventory', imageSrc: '/projects-view/shaheen_school/pages/page-10.png' },
      { pageNumber: 11, title: 'Page 11: Corridor Security, Official Attendance Registers & Information Banner', imageSrc: '/projects-view/shaheen_school/pages/page-11.png' },
      { pageNumber: 12, title: 'Page 12: Campus Life, Student Assemblies & Institutional Governance', imageSrc: '/projects-view/shaheen_school/pages/page-12.png' },
      { pageNumber: 13, title: 'Page 13: Consolidated SSB Expenditure & Final Audit', imageSrc: '/projects-view/shaheen_school/pages/page-13.png' },
    ],
  },
};

export function getAllClientProjects(): Record<string, ClientProject> {
  try {
    if (fs.existsSync(configFilePath)) {
      const content = fs.readFileSync(configFilePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Failed to read projects-view-config.json:', err);
  }
  return defaultRegistry;
}

export function getClientProject(idOrSlug: string): ClientProject | null {
  const normalized = idOrSlug.toLowerCase().trim();
  const all = getAllClientProjects();
  return all[normalized] || null;
}

export function updateProjectConfig(
  projectId: string,
  updates: Partial<ClientProject>
): ClientProject | null {
  const normalized = projectId.toLowerCase().trim();
  const all = getAllClientProjects();
  if (!all[normalized]) return null;

  all[normalized] = {
    ...all[normalized],
    ...updates,
  };

  try {
    fs.writeFileSync(configFilePath, JSON.stringify(all, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save projects-view-config.json:', err);
  }

  return all[normalized];
}
