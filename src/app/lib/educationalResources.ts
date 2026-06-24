export type EducationalResourceItem = {
  title: string;
  description: string;
  status: 'Ready' | 'Coming Soon';
  href?: string;
  showInNavbar?: boolean;
  addedOn?: string;
  ageGroup?: '3-6' | '7-12' | '13-16' | 'general' | 'parents';
  category?: 'kids' | 'teachers' | 'parents';
};

export const educationalResourceItems: EducationalResourceItem[] = [
  {
    title: 'Students Age Calculator',
    description: 'Calculate exact student age and view a recommended class instantly.',
    status: 'Ready',
    href: '/teaching-tools/students-age-calculator',
    addedOn: '2025-12-15',
    ageGroup: 'general',
    category: 'teachers',
  },
  {
    title: 'Lesson Plan',
    description: 'Generate a complete lesson plan from a topic, PDF, or image.',
    status: 'Ready',
    href: '/teaching-tools/automatic-lesson-plan',
    addedOn: '2026-01-10',
    ageGroup: 'general',
    category: 'teachers',
  },
  {
    title: 'Academic Calendar Generator',
    description: 'Generate a yearly school calendar with holidays, vacation periods, and working-day totals.',
    status: 'Ready',
    href: '/teaching-tools/academic-calendar',
    addedOn: '2026-02-12',
    ageGroup: 'general',
    category: 'teachers',
  },
  {
    title: 'Timetable Generator',
    description: 'Create a balanced weekly school timetable with manual swap, PDF, and print support.',
    status: 'Ready',
    href: '/teaching-tools/timetable-generator',
    addedOn: '2026-03-18',
    ageGroup: 'general',
    category: 'teachers',
  },
  {
    title: 'O Level Career Selection Helper',
    description: 'Answer 20 smart questions and get subject combinations based on your career goals in Pakistan.',
    status: 'Ready',
    href: '/teaching-tools/o-level-career-selection',
    addedOn: '2026-04-20',
    ageGroup: '13-16',
    category: 'kids',
  },
  {
    title: 'Resume Builder',
    description: 'Create a teacher CV or resume quickly for applications and updates.',
    status: 'Ready',
    href: '/resume-builder',
    addedOn: '2026-02-01',
    ageGroup: 'general',
    category: 'teachers',
  },
  {
    title: 'Attendance Tracker',
    description: 'Simple attendance workflow for class-wise management.',
    status: 'Ready',
    href: '#',
    showInNavbar: false,
    addedOn: '2025-11-20',
    ageGroup: 'general',
    category: 'teachers',
  },
  {
    title: 'Worksheet Builder',
    description: 'Create print-ready worksheets and classroom activities.',
    status: 'Coming Soon',
    showInNavbar: false,
    addedOn: '2025-11-01',
    ageGroup: 'general',
    category: 'teachers',
  },
  {
    title: 'Class Routine Board',
    description: 'Keep your daily timetable and classroom flow in one place.',
    status: 'Coming Soon',
    showInNavbar: false,
    addedOn: '2025-10-15',
    ageGroup: 'general',
    category: 'teachers',
  },
  {
    title: 'Daily Exit Ticket',
    description: 'Students write one thing they learned before leaving class. Builds reflection habit.',
    status: 'Ready',
    href: '/teaching-tools/exit-ticket',
    addedOn: '2026-06-23',
    ageGroup: '7-12',
    category: 'teachers',
  },
  {
    title: 'Typing Practice Tutor',
    description: 'Improve typing speed & accuracy across multiple levels with streaks, WPM tracking, and history.',
    status: 'Ready',
    href: '/teaching-tools/typing-tutor',
    addedOn: '2026-06-23',
    ageGroup: '7-12',
    category: 'kids',
  },
  {
    title: 'Art Gallery Wall',
    description: 'Showcase student drawings and creative work in a beautiful gallery wall with likes.',
    status: 'Ready',
    href: '/teaching-tools/art-gallery',
    addedOn: '2026-06-23',
    ageGroup: '3-6',
    category: 'kids',
  },
  {
    title: 'Weekly Assembly Plan Maker',
    description: 'Create A4-printable assembly plans with topics, speakers, duties, and customizable school details.',
    status: 'Ready',
    href: '/teaching-tools/assembly-planner',
    addedOn: '2026-06-23',
    ageGroup: 'general',
    category: 'teachers',
  },
  {
    title: 'ABC Alphabet Learning',
    description: 'Interactive alphabet tracing and phonics for early learners. Fun animations and sounds.',
    status: 'Ready',
    href: '#',
    addedOn: '2026-06-24',
    ageGroup: '3-6',
    category: 'kids',
  },
  {
    title: 'Number Fun (1-100)',
    description: 'Learn numbers 1 to 100 with colorful counting games and simple math activities.',
    status: 'Ready',
    href: '#',
    addedOn: '2026-06-24',
    ageGroup: '3-6',
    category: 'kids',
  },
  {
    title: 'Science Experiments (Ages 7-12)',
    description: 'Simple hands-on science experiments using household items. Learn while doing.',
    status: 'Ready',
    href: '#',
    addedOn: '2026-06-24',
    ageGroup: '7-12',
    category: 'kids',
  },
  {
    title: 'Creative Writing Prompts',
    description: 'Fun story starters and writing challenges for young writers to explore their imagination.',
    status: 'Ready',
    href: '#',
    addedOn: '2026-06-24',
    ageGroup: '7-12',
    category: 'kids',
  },
  {
    title: 'English Grammar Basics',
    description: 'Parts of speech, tenses, and sentence structure explained simply with examples.',
    status: 'Ready',
    href: '#',
    addedOn: '2026-06-24',
    ageGroup: '13-16',
    category: 'kids',
  },
  {
    title: 'Mathematics Practice (Secondary)',
    description: 'Algebra, geometry, and trigonometry practice sets with step-by-step solutions.',
    status: 'Ready',
    href: '#',
    addedOn: '2026-06-24',
    ageGroup: '13-16',
    category: 'kids',
  },
  {
    title: 'Urdu Reading for Kids',
    description: 'Simple Urdu stories and poems for early readers with audio pronunciation guide.',
    status: 'Ready',
    href: '#',
    addedOn: '2026-06-24',
    ageGroup: '3-6',
    category: 'kids',
  },
  {
    title: 'Shape Learning Fun',
    description: 'Learn shapes like circle, heart, star, triangle, cone, oval, rectangle, square with colors and sounds. Ages 3-4.',
    status: 'Ready',
    href: '/teaching-tools/fun-learning',
    addedOn: '2026-06-24',
    ageGroup: '3-6',
    category: 'kids',
  },
  {
    title: 'Spelling Bee Fun',
    description: 'Listen to the word, type the spelling. Includes vocal pronunciation for early learners.',
    status: 'Ready',
    href: '/teaching-tools/fun-learning',
    addedOn: '2026-06-24',
    ageGroup: '3-6',
    category: 'kids',
  },
  {
    title: 'Fill in the Blanks',
    description: 'Complete sentences by filling missing words. Fun way to learn vocabulary and grammar.',
    status: 'Ready',
    href: '/teaching-tools/fun-learning',
    addedOn: '2026-06-24',
    ageGroup: '3-6',
    category: 'kids',
  },
  {
    title: '3D Shapes Learning',
    description: 'Learn 3D shapes like cube, sphere, cone, pyramid and more with sounds, quiz, and auto-learn modes.',
    status: 'Ready',
    href: '/teaching-tools/fun-learning',
    addedOn: '2026-06-24',
    ageGroup: '3-6',
    category: 'kids',
  },
  {
    title: 'Colors Learning',
    description: 'Learn colors with fun visuals and a quiz game. Hear each color name pronounced aloud.',
    status: 'Ready',
    href: '/teaching-tools/fun-learning',
    addedOn: '2026-06-24',
    ageGroup: '3-6',
    category: 'kids',
  },
  {
    title: 'Sight Words Spelling',
    description: 'Practice spelling common sight words like Cat, Dog, Sun, Hat with letter tiles and hints.',
    status: 'Ready',
    href: '/teaching-tools/fun-learning',
    addedOn: '2026-06-24',
    ageGroup: '3-6',
    category: 'kids',
  },
  {
    title: 'Teen Words (13-19)',
    description: 'Learn number words thirteen to nineteen with quiz, fill-the-name, and auto-learn memorization.',
    status: 'Ready',
    href: '/teaching-tools/fun-learning',
    addedOn: '2026-06-24',
    ageGroup: '3-6',
    category: 'kids',
  },
  {
    title: 'Ty Words (20-90)',
    description: 'Learn tens number words twenty to ninety with quiz, fill-the-name, and auto-learn memorization.',
    status: 'Ready',
    href: '/teaching-tools/fun-learning',
    addedOn: '2026-06-24',
    ageGroup: '3-6',
    category: 'kids',
  },
  {
    title: 'Math Practice (Ages 7-12)',
    description: 'Addition, subtraction, multiplication, division — age-wise levels with sub-topics, difficulty modes, hints, and progress tracking.',
    status: 'Ready',
    href: '/teaching-tools/math-practice',
    addedOn: '2026-06-24',
    ageGroup: '7-12',
    category: 'kids',
  },
  {
    title: 'Parent Dashboard',
    description: 'Track your child\'s progress across all learning activities and see daily reports.',
    status: 'Coming Soon',
    addedOn: '2026-06-24',
    ageGroup: 'parents',
    category: 'parents',
  },
  {
    title: 'Activity Suggestions (Ages 3-6)',
    description: 'Fun home activities for parents to do with their young children. No screens needed.',
    status: 'Coming Soon',
    addedOn: '2026-06-24',
    ageGroup: 'parents',
    category: 'parents',
  },
  {
    title: 'Progress Report Generator',
    description: 'Generate a personalized progress report for your child across all subjects.',
    status: 'Coming Soon',
    addedOn: '2026-06-24',
    ageGroup: 'parents',
    category: 'parents',
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
