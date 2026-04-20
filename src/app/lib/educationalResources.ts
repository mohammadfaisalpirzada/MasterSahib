export type EducationalResourceItem = {
  title: string;
  description: string;
  status: 'Ready' | 'Coming Soon';
  href?: string;
  showInNavbar?: boolean;
  addedOn?: string;
};

export const educationalResourceItems: EducationalResourceItem[] = [
  {
    title: 'Students Age Calculator',
    description: 'Calculate exact student age and view a recommended class instantly.',
    status: 'Ready',
    href: '/teaching-tools/students-age-calculator',
    addedOn: '2025-12-15',
  },
  {
    title: 'Lesson Plan',
    description: 'Generate a complete lesson plan from a topic, PDF, or image.',
    status: 'Ready',
    href: '/teaching-tools/automatic-lesson-plan',
    addedOn: '2026-01-10',
  },
  {
    title: 'Academic Calendar Generator',
    description: 'Generate a yearly school calendar with holidays, vacation periods, and working-day totals.',
    status: 'Ready',
    href: '/teaching-tools/academic-calendar',
    addedOn: '2026-02-12',
  },
  {
    title: 'Timetable Generator',
    description: 'Create a balanced weekly school timetable with manual swap, PDF, and print support.',
    status: 'Ready',
    href: '/teaching-tools/timetable-generator',
    addedOn: '2026-03-18',
  },
  {
    title: 'O Level Career Selection Helper',
    description: 'Answer 20 smart questions and get subject combinations based on your career goals in Pakistan.',
    status: 'Ready',
    href: '/teaching-tools/o-level-career-selection',
    addedOn: '2026-04-20',
  },
  {
    title: 'Resume Builder',
    description: 'Create a teacher CV or resume quickly for applications and updates.',
    status: 'Ready',
    href: '/resume-builder',
    addedOn: '2026-02-01',
  },
  {
    title: 'Attendance Tracker',
    description: 'Simple attendance workflow for class-wise management.',
    status: 'Ready',
    href: '#',
    showInNavbar: false,
    addedOn: '2025-11-20',
  },
  {
    title: 'Worksheet Builder',
    description: 'Create print-ready worksheets and classroom activities.',
    status: 'Coming Soon',
    showInNavbar: false,
    addedOn: '2025-11-01',
  },
  {
    title: 'Class Routine Board',
    description: 'Keep your daily timetable and classroom flow in one place.',
    status: 'Coming Soon',
    showInNavbar: false,
    addedOn: '2025-10-15',
  },
];

const getAddedTimestamp = (item: EducationalResourceItem, index: number) => {
  if (item.addedOn) {
    const parsed = Date.parse(item.addedOn);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return index;
};

export const sortedEducationalResourceItems = educationalResourceItems
  .map((item, index) => ({ item, index }))
  .sort((a, b) => getAddedTimestamp(b.item, b.index) - getAddedTimestamp(a.item, a.index))
  .map(({ item }) => item);

export const latestEducationalResourceTitles = sortedEducationalResourceItems
  .filter((item) => item.status === 'Ready' && item.href && item.href !== '#')
  .slice(0, 2)
  .map((item) => item.title);

export const educationalResourceNavLinks = sortedEducationalResourceItems
  .filter((item) => item.status === 'Ready' && item.href && item.href !== '#' && item.showInNavbar !== false)
  .map((item) => ({
    label: item.title,
    href: item.href as string,
    description: item.description,
  }));
