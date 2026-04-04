export type EducationalResourceItem = {
  title: string;
  description: string;
  status: 'Ready' | 'Coming Soon';
  href?: string;
  showInNavbar?: boolean;
};

export const educationalResourceItems: EducationalResourceItem[] = [
  {
    title: 'Students Age Calculator',
    description: 'Calculate exact student age and view a recommended class instantly.',
    status: 'Ready',
    href: '/teaching-tools/students-age-calculator',
  },
  {
    title: 'Lesson Plan',
    description: 'Generate a complete lesson plan from a topic, PDF, or image.',
    status: 'Ready',
    href: '/teaching-tools/automatic-lesson-plan',
  },
  {
    title: 'Academic Calendar Generator',
    description: 'Generate a yearly school calendar with holidays, vacation periods, and working-day totals.',
    status: 'Ready',
    href: '/teaching-tools/academic-calendar',
  },
  {
    title: 'Timetable Generator',
    description: 'Create a balanced weekly school timetable with manual swap, PDF, and print support.',
    status: 'Ready',
    href: '/teaching-tools/timetable-generator',
  },
  {
    title: 'Resume Builder',
    description: 'Create a teacher CV or resume quickly for applications and updates.',
    status: 'Ready',
    href: '/resume-builder',
  },
  {
    title: 'Attendance Tracker',
    description: 'Simple attendance workflow for class-wise management.',
    status: 'Ready',
    href: '#',
    showInNavbar: false,
  },
  {
    title: 'Worksheet Builder',
    description: 'Create print-ready worksheets and classroom activities.',
    status: 'Coming Soon',
    showInNavbar: false,
  },
  {
    title: 'Class Routine Board',
    description: 'Keep your daily timetable and classroom flow in one place.',
    status: 'Coming Soon',
    showInNavbar: false,
  },
];

export const educationalResourceNavLinks = educationalResourceItems
  .filter((item) => item.status === 'Ready' && item.href && item.href !== '#' && item.showInNavbar !== false)
  .map((item) => ({
    label: item.title,
    href: item.href as string,
    description: item.description,
  }));
