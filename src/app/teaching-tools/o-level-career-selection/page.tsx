'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type TrackKey =
  | 'preMedical'
  | 'engineering'
  | 'computerScience'
  | 'business'
  | 'socialSciences'
  | 'creativeMedia'
  | 'coordinatedScience';

type QuestionOption = {
  label: string;
  weights: Partial<Record<TrackKey, number>>;
  totalSubjects?: number;
};

type Question = {
  id: number;
  prompt: string;
  options: QuestionOption[];
};

type TrackProfile = {
  key: TrackKey;
  title: string;
  careerDirection: string;
  coreElectives: string[];
  optionalPool: string[];
  note: string;
};

type SchoolPolicy = {
  id: string;
  name: string;
  city: string;
  board?: string;
  minTotalSubjects: number;
  maxTotalSubjects: number;
  preferredTotalSubjects: number;
  interdisciplinaryOptions: number;
  note: string;
};

type ApplicantRole = 'Student' | 'Parent/Guardian';

const compulsorySubjects = ['English', 'Urdu', 'Islamiyat', 'Pakistan Studies', 'Mathematics'];

const pakistaniSchoolPolicies: SchoolPolicy[] = [
  {
    id: 'kgs',
    name: 'Karachi Grammar School (KGS)',
    city: 'Karachi',
    minTotalSubjects: 8,
    maxTotalSubjects: 9,
    preferredTotalSubjects: 8,
    interdisciplinaryOptions: 2,
    note: 'Typically keeps a focused O Level load with clear stream choices.',
  },
  {
    id: 'city-school',
    name: 'The City School',
    city: 'Karachi',
    minTotalSubjects: 8,
    maxTotalSubjects: 9,
    preferredTotalSubjects: 8,
    interdisciplinaryOptions: 2,
    note: 'Commonly follows 5 compulsory subjects with structured elective combinations.',
  },
  {
    id: 'beaconhouse',
    name: 'Beaconhouse School System',
    city: 'Karachi',
    minTotalSubjects: 8,
    maxTotalSubjects: 10,
    preferredTotalSubjects: 9,
    interdisciplinaryOptions: 2,
    note: 'Usually supports both standard and slightly wider elective choices.',
  },
  {
    id: 'bay-view',
    name: 'Bay View Academy (Karachi)',
    city: 'Karachi',
    minTotalSubjects: 8,
    maxTotalSubjects: 9,
    preferredTotalSubjects: 8,
    interdisciplinaryOptions: 2,
    note: 'Often promotes balanced combinations aligned to student goals.',
  },
  {
    id: 'dawood-public',
    name: 'Dawood Public School (Karachi)',
    city: 'Karachi',
    board: 'IGCSE',
    minTotalSubjects: 10,
    maxTotalSubjects: 10,
    preferredTotalSubjects: 10,
    interdisciplinaryOptions: 2,
    note: 'IGCSE-focused planning with a 10-subject selection framework.',
  },
  {
    id: 'lyceum',
    name: 'The Lyceum (Karachi)',
    city: 'Karachi',
    minTotalSubjects: 8,
    maxTotalSubjects: 9,
    preferredTotalSubjects: 8,
    interdisciplinaryOptions: 2,
    note: 'Generally keeps strong academic focus and manageable subject load.',
  },
  {
    id: 'cedar',
    name: 'Cedar College (Karachi)',
    city: 'Karachi',
    minTotalSubjects: 8,
    maxTotalSubjects: 10,
    preferredTotalSubjects: 9,
    interdisciplinaryOptions: 2,
    note: 'Flexible pathway planning is usually available for different career tracks.',
  },
  {
    id: 'nixor',
    name: 'Nixor School and College (Karachi)',
    city: 'Karachi',
    minTotalSubjects: 8,
    maxTotalSubjects: 9,
    preferredTotalSubjects: 8,
    interdisciplinaryOptions: 2,
    note: 'Subject planning usually prioritizes university path alignment.',
  },
  {
    id: 'alpha',
    name: 'Alpha College (Karachi)',
    city: 'Karachi',
    minTotalSubjects: 8,
    maxTotalSubjects: 9,
    preferredTotalSubjects: 8,
    interdisciplinaryOptions: 2,
    note: 'Commonly uses compact combinations with clear direction by stream.',
  },
  {
    id: 'lgs-lahore',
    name: 'Lahore Grammar School (LGS)',
    city: 'Lahore',
    minTotalSubjects: 8,
    maxTotalSubjects: 10,
    preferredTotalSubjects: 9,
    interdisciplinaryOptions: 2,
    note: 'Usually supports broad planning for science, business, and social science tracks.',
  },
  {
    id: 'aitchison',
    name: 'Aitchison College',
    city: 'Lahore',
    minTotalSubjects: 8,
    maxTotalSubjects: 9,
    preferredTotalSubjects: 8,
    interdisciplinaryOptions: 2,
    note: 'Typically follows structured combinations with strong academic rigor.',
  },
  {
    id: 'roots-ivy',
    name: 'Roots Ivy International Schools',
    city: 'Islamabad',
    minTotalSubjects: 8,
    maxTotalSubjects: 10,
    preferredTotalSubjects: 9,
    interdisciplinaryOptions: 2,
    note: 'Commonly offers flexible subject planning across major streams.',
  },
  {
    id: 'islamabad-grammar',
    name: 'Islamabad Grammar School',
    city: 'Islamabad',
    minTotalSubjects: 8,
    maxTotalSubjects: 9,
    preferredTotalSubjects: 8,
    interdisciplinaryOptions: 2,
    note: 'Usually emphasizes balanced load and progression to A Level pathways.',
  },
  {
    id: 'headstart',
    name: 'Headstart School',
    city: 'Islamabad',
    minTotalSubjects: 8,
    maxTotalSubjects: 9,
    preferredTotalSubjects: 8,
    interdisciplinaryOptions: 2,
    note: 'Often follows clear stream-focused combinations for higher studies.',
  },
  {
    id: 'city-rwp',
    name: 'The City School',
    city: 'Rawalpindi',
    minTotalSubjects: 8,
    maxTotalSubjects: 9,
    preferredTotalSubjects: 8,
    interdisciplinaryOptions: 2,
    note: 'Generally uses standard Cambridge-aligned combinations with policy checks.',
  },
];

const trackProfiles: TrackProfile[] = [
  {
    key: 'preMedical',
    title: 'Pure Science (Biology Track)',
    careerDirection: 'Medicine, pharmacy, biotechnology, health sciences',
    coreElectives: ['Physics', 'Chemistry', 'Biology'],
    optionalPool: ['Computer Science', 'Environmental Management', 'Sociology', 'English Literature'],
    note: 'Strong route for MBBS, DPT, Pharm-D and biomedical fields.',
  },
  {
    key: 'engineering',
    title: 'Pure Science (Computer Track)',
    careerDirection: 'Engineering, architecture, robotics, data-intensive STEM',
    coreElectives: ['Physics', 'Chemistry', 'Computer Science'],
    optionalPool: ['Computer Science', 'Design & Technology', 'Environmental Management', 'Economics'],
    note: 'Best for students targeting engineering and technical university pathways with computing strength.',
  },
  {
    key: 'computerScience',
    title: 'Pure Science (Computer Track)',
    careerDirection: 'Software engineering, AI, cybersecurity, data science',
    coreElectives: ['Physics', 'Chemistry', 'Computer Science'],
    optionalPool: ['Economics', 'Business Studies', 'English Literature', 'Design & Technology'],
    note: 'Balanced for both fast-growing tech careers and quantitative degrees.',
  },
  {
    key: 'business',
    title: 'Business & Commerce',
    careerDirection: 'Business, accounting, finance, management, entrepreneurship',
    coreElectives: ['Accounting', 'Business Studies', 'Economics'],
    optionalPool: ['Computer Science', 'Mathematics (Additional)', 'Sociology', 'Commerce'],
    note: 'Practical route for BBA, ACCA, CA foundation and startup mindset.',
  },
  {
    key: 'socialSciences',
    title: 'Humanities & Social Sciences',
    careerDirection: 'Law, civil services, psychology, media studies, public policy',
    coreElectives: ['Sociology', 'History', 'Economics'],
    optionalPool: ['Psychology', 'Geography', 'English Literature', 'Business Studies'],
    note: 'Great for communication-heavy and policy-oriented careers.',
  },
  {
    key: 'creativeMedia',
    title: 'Creative & Communication',
    careerDirection: 'Media, design, content creation, architecture support fields',
    coreElectives: ['Art & Design', 'English Literature', 'Media Studies'],
    optionalPool: ['Design & Technology', 'Business Studies', 'Computer Science', 'Sociology'],
    note: 'Ideal for students with strong creative expression and storytelling interest.',
  },
  {
    key: 'coordinatedScience',
    title: 'Co-ordinated Science Pathway',
    careerDirection: 'Balanced STEM base with room for business, computing, or humanities',
    coreElectives: ['Co-ordinated Sciences (Double Award)'],
    optionalPool: ['Computer Science', 'Economics', 'Business Studies', 'Sociology', 'English Literature'],
    note: 'Flexible path when you want science foundation with broader options.',
  },
];

const questions: Question[] = [
  {
    id: 1,
    prompt: 'How many total O Level subjects do you want to keep?',
    options: [
      { label: '8 subjects (light and focused)', totalSubjects: 8, weights: { coordinatedScience: 2, business: 1, socialSciences: 1 } },
      { label: '9 subjects (balanced)', totalSubjects: 9, weights: { computerScience: 1, business: 1, socialSciences: 1 } },
      { label: '10 subjects (high academic load)', totalSubjects: 10, weights: { preMedical: 2, engineering: 2, computerScience: 2 } },
    ],
  },
  {
    id: 2,
    prompt: 'Which school tasks give you energy instead of stress?',
    options: [
      { label: 'Lab practicals and experiments', weights: { preMedical: 2, engineering: 2, coordinatedScience: 1 } },
      { label: 'Coding, logic puzzles, and troubleshooting', weights: { computerScience: 3, engineering: 1 } },
      { label: 'Debates, writing, analysis of society', weights: { socialSciences: 2, creativeMedia: 1, business: 1 } },
    ],
  },
  {
    id: 3,
    prompt: 'What kind of long-term work life do you imagine?',
    options: [
      { label: 'Healthcare / helping patients directly', weights: { preMedical: 3 } },
      { label: 'Building systems, products, machines, software', weights: { engineering: 2, computerScience: 2 } },
      { label: 'Leading teams, business growth, communication', weights: { business: 2, creativeMedia: 1, socialSciences: 1 } },
    ],
  },
  {
    id: 4,
    prompt: 'Which subject result has been strongest recently?',
    options: [
      { label: 'Biology / Chemistry', weights: { preMedical: 3, coordinatedScience: 1 } },
      { label: 'Physics / Mathematics', weights: { engineering: 3, computerScience: 1 } },
      { label: 'English / Social Studies', weights: { socialSciences: 2, creativeMedia: 2, business: 1 } },
    ],
  },
  {
    id: 5,
    prompt: 'How comfortable are you with advanced mathematics?',
    options: [
      { label: 'Very comfortable; I enjoy hard math', weights: { engineering: 2, computerScience: 2, business: 1 } },
      { label: 'Moderate; I can manage with practice', weights: { coordinatedScience: 2, business: 1, socialSciences: 1 } },
      { label: 'Prefer less math-heavy route', weights: { socialSciences: 2, creativeMedia: 2, preMedical: 1 } },
    ],
  },
  {
    id: 6,
    prompt: 'When solving a problem, what is your style?',
    options: [
      { label: 'Step-by-step technical method', weights: { engineering: 2, computerScience: 2, coordinatedScience: 1 } },
      { label: 'Observation + evidence + conclusions', weights: { preMedical: 2, socialSciences: 1 } },
      { label: 'Communication, persuasion, and creativity', weights: { creativeMedia: 2, business: 2, socialSciences: 1 } },
    ],
  },
  {
    id: 7,
    prompt: 'Which extracurricular activity sounds most exciting?',
    options: [
      { label: 'Science club or Olympiad', weights: { preMedical: 2, engineering: 2, coordinatedScience: 1 } },
      { label: 'Coding competition or robotics', weights: { computerScience: 3, engineering: 1 } },
      { label: 'Entrepreneurship / media / public speaking', weights: { business: 2, creativeMedia: 2, socialSciences: 1 } },
    ],
  },
  {
    id: 8,
    prompt: 'How important is career flexibility for you right now?',
    options: [
      { label: 'Very high; I want broad options later', weights: { coordinatedScience: 3, computerScience: 1, business: 1 } },
      { label: 'I already know my main field', weights: { preMedical: 2, engineering: 2, business: 1 } },
      { label: 'I want a mix of practical + creative routes', weights: { creativeMedia: 2, socialSciences: 1, business: 1 } },
    ],
  },
  {
    id: 9,
    prompt: 'In group projects, what role do you naturally take?',
    options: [
      { label: 'Researcher and quality checker', weights: { preMedical: 2, socialSciences: 2 } },
      { label: 'Technical builder / analyst', weights: { engineering: 2, computerScience: 2 } },
      { label: 'Presenter / coordinator / strategist', weights: { business: 2, creativeMedia: 2 } },
    ],
  },
  {
    id: 10,
    prompt: 'Which future degree seems most attractive today?',
    options: [
      { label: 'Medicine / pharmacy / life sciences', weights: { preMedical: 3 } },
      { label: 'Engineering / computer science / AI', weights: { engineering: 2, computerScience: 2 } },
      { label: 'Business / law / social sciences / media', weights: { business: 2, socialSciences: 2, creativeMedia: 1 } },
    ],
  },
  {
    id: 11,
    prompt: 'How much do you enjoy writing and argumentation?',
    options: [
      { label: 'A lot; I can write strong essays', weights: { socialSciences: 2, creativeMedia: 2, business: 1 } },
      { label: 'Moderate; only when needed', weights: { coordinatedScience: 2, business: 1, computerScience: 1 } },
      { label: 'I prefer formulas and technical tasks', weights: { engineering: 2, computerScience: 2, preMedical: 1 } },
    ],
  },
  {
    id: 12,
    prompt: 'How do you respond to pressure and deadlines?',
    options: [
      { label: 'I stay calm with structured plans', weights: { preMedical: 2, engineering: 2 } },
      { label: 'I optimize quickly and automate tasks', weights: { computerScience: 3 } },
      { label: 'I coordinate people and priorities', weights: { business: 2, socialSciences: 1, creativeMedia: 1 } },
    ],
  },
  {
    id: 13,
    prompt: 'Which impact matters most to you?',
    options: [
      { label: 'Improve health and quality of life', weights: { preMedical: 3 } },
      { label: 'Build technology and innovation', weights: { engineering: 2, computerScience: 2 } },
      { label: 'Improve society, policy, communication', weights: { socialSciences: 2, business: 1, creativeMedia: 1 } },
    ],
  },
  {
    id: 14,
    prompt: 'How interested are you in finance and markets?',
    options: [
      { label: 'Very interested', weights: { business: 3 } },
      { label: 'Some interest for practical knowledge', weights: { computerScience: 1, socialSciences: 1, coordinatedScience: 1 } },
      { label: 'Not much interest', weights: { preMedical: 1, engineering: 1, creativeMedia: 1 } },
    ],
  },
  {
    id: 15,
    prompt: 'How comfortable are you with programming/computing tools?',
    options: [
      { label: 'Very comfortable', weights: { computerScience: 3, engineering: 1 } },
      { label: 'Can learn if needed', weights: { coordinatedScience: 2, business: 1, preMedical: 1 } },
      { label: 'Prefer non-technical tools', weights: { socialSciences: 1, creativeMedia: 2 } },
    ],
  },
  {
    id: 16,
    prompt: 'Do you enjoy practical lab work more or theory reading?',
    options: [
      { label: 'Mostly practical lab work', weights: { preMedical: 2, engineering: 2, coordinatedScience: 1 } },
      { label: 'Balanced mix of both', weights: { computerScience: 1, business: 1, coordinatedScience: 1 } },
      { label: 'Mostly theory and writing', weights: { socialSciences: 2, creativeMedia: 2 } },
    ],
  },
  {
    id: 17,
    prompt: 'Which statement fits your motivation best?',
    options: [
      { label: 'I want a respected professional technical career', weights: { preMedical: 2, engineering: 2 } },
      { label: 'I want to create products or digital solutions', weights: { computerScience: 3, business: 1 } },
      { label: 'I want influence through ideas, media, or leadership', weights: { socialSciences: 2, creativeMedia: 2, business: 1 } },
    ],
  },
  {
    id: 18,
    prompt: 'How much memorization can you handle consistently?',
    options: [
      { label: 'High level memorization is fine', weights: { preMedical: 2, socialSciences: 1 } },
      { label: 'Prefer concept-based understanding', weights: { engineering: 2, computerScience: 2 } },
      { label: 'Prefer mixed and practical learning', weights: { coordinatedScience: 2, business: 1, creativeMedia: 1 } },
    ],
  },
  {
    id: 19,
    prompt: 'If you had to choose one long project, what would it be?',
    options: [
      { label: 'Health awareness campaign with evidence', weights: { preMedical: 2, socialSciences: 1 } },
      { label: 'Build an app, robot, or automation tool', weights: { computerScience: 2, engineering: 2 } },
      { label: 'Launch a student brand or media channel', weights: { business: 2, creativeMedia: 2 } },
    ],
  },
  {
    id: 20,
    prompt: 'How certain are you about your career path today?',
    options: [
      { label: 'Very certain and focused', weights: { preMedical: 1, engineering: 1, computerScience: 1, business: 1 } },
      { label: 'Somewhat certain but still exploring', weights: { coordinatedScience: 3, socialSciences: 1 } },
      { label: 'Not certain; I need broad safe options', weights: { coordinatedScience: 3, business: 1, socialSciences: 1 } },
    ],
  },
];

const getProfile = (key: TrackKey) => trackProfiles.find((profile) => profile.key === key) ?? trackProfiles[0];

const getSchoolPolicy = (id: string) =>
  pakistaniSchoolPolicies.find((policy) => policy.id === id) ?? pakistaniSchoolPolicies[0];

const isPureScienceTrack = (key: TrackKey) =>
  key === 'preMedical' || key === 'engineering' || key === 'computerScience';

const buildAiGuidance = (
  fullName: string,
  role: ApplicantRole,
  primaryProfile: TrackProfile,
  backupProfile: TrackProfile,
  scores: Record<TrackKey, number>,
  recommendation: {
    totalSubjects: number;
    policyName: string;
    policyAdvisory: string;
  },
) => {
  const allScores = Object.values(scores);
  const totalScore = allScores.reduce((sum, value) => sum + value, 0);
  const topScore = Math.max(...allScores);
  const confidence = totalScore > 0 ? Math.round((topScore / totalScore) * 100) : 0;
  const safeName = fullName.trim() || 'Student';

  const opening =
    role === 'Parent/Guardian'
      ? `${safeName}, based on your responses as a parent/guardian, this is the strongest-fit pathway for your child right now.`
      : `${safeName}, based on your responses, this is your strongest-fit pathway right now.`;

  return {
    opening,
    confidenceLine: `AI confidence estimate: ${confidence}% fit for ${primaryProfile.title}.`,
    strategyLine: `Primary recommendation: ${primaryProfile.title}. Backup pathway: ${backupProfile.title}.`,
    policyLine: `School policy applied: ${recommendation.policyName}. ${recommendation.policyAdvisory}`,
    growthLine:
      'Action plan: keep a weekly study schedule, review past papers, and validate final subjects with school counselor guidance before registration.',
  };
};

const buildSubjectRecommendation = (
  profile: TrackProfile,
  totalSubjects: number,
  policy: SchoolPolicy,
) => {
  const requestedTotal = totalSubjects;
  const belowPolicyMin = requestedTotal < policy.minTotalSubjects;
  const abovePolicyMax = requestedTotal > policy.maxTotalSubjects;
  const policyAdvisory = abovePolicyMax
    ? `Selected total is above the typical policy range (${policy.minTotalSubjects}-${policy.maxTotalSubjects}).`
    : belowPolicyMin
      ? `Selected total is below the typical policy range (${policy.minTotalSubjects}-${policy.maxTotalSubjects}).`
      : `Selected total is within the typical policy range (${policy.minTotalSubjects}-${policy.maxTotalSubjects}).`;

  if (profile.key === 'coordinatedScience') {
    const requiredCoreCount = 1 + policy.interdisciplinaryOptions;
    const extraOptionsNeeded = Math.max(
      requestedTotal - (compulsorySubjects.length + requiredCoreCount),
      0,
    );

    const optionPool = profile.optionalPool;
    const electives = [
      profile.coreElectives[0],
      ...optionPool.slice(0, policy.interdisciplinaryOptions),
      ...optionPool.slice(
        policy.interdisciplinaryOptions,
        policy.interdisciplinaryOptions + extraOptionsNeeded,
      ),
    ];
    const finalTotal = compulsorySubjects.length + electives.length;

    return {
      totalSubjects: finalTotal,
      compulsory: compulsorySubjects,
      electives,
      policyName: policy.name,
      policyRange: `${policy.minTotalSubjects}-${policy.maxTotalSubjects}`,
      isAdjusted: false,
      policyAdvisory,
      selectedTotal: requestedTotal,
      planNote:
        extraOptionsNeeded > 0
          ? 'Interdisciplinary policy applied: Co-ordinated Science + 2 required options, plus additional options to match selected total.'
          : 'Interdisciplinary policy applied: 5 compulsory + Co-ordinated Science + 2 options.',
    };
  }

  const baseCore =
    isPureScienceTrack(profile.key)
      ? profile.key === 'preMedical'
        ? ['Physics', 'Chemistry', 'Biology']
        : ['Physics', 'Chemistry', 'Computer Science']
      : profile.coreElectives;

  const baseTotal = compulsorySubjects.length + baseCore.length;
  const supportOptionsNeeded = Math.max(requestedTotal - baseTotal, 0);

  const electives = [
    ...baseCore,
    ...profile.optionalPool
      .filter((subject) => !baseCore.includes(subject))
      .slice(0, supportOptionsNeeded),
  ];

  return {
    totalSubjects: compulsorySubjects.length + electives.length,
    compulsory: compulsorySubjects,
    electives,
    policyName: policy.name,
    policyRange: `${policy.minTotalSubjects}-${policy.maxTotalSubjects}`,
    isAdjusted: false,
    policyAdvisory,
    selectedTotal: requestedTotal,
    planNote:
      isPureScienceTrack(profile.key)
        ? supportOptionsNeeded > 0
          ? 'Pure Science policy applied: Physics + Chemistry + Biology/Computer Science, plus support options.'
          : 'Pure Science policy applied: Physics + Chemistry + Biology/Computer Science.'
        : requestedTotal >= 10
        ? 'Strong route: 5 compulsory + Pure Science core (Physics, Chemistry, Biology/Computer Science) + 2 support options.'
        : 'Balanced route: 5 compulsory + Pure Science core (Physics, Chemistry, Biology/Computer Science).',
  };
};

export default function OLevelCareerSelectionPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [fullName, setFullName] = useState('');
  const [applicantRole, setApplicantRole] = useState<ApplicantRole>('Student');
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedSchoolPolicyId, setSelectedSchoolPolicyId] = useState<string>(
    pakistaniSchoolPolicies[0].id,
  );

  const currentQuestion = questions[step];
  const isCompleted = step >= questions.length;
  const canStart = fullName.trim().length >= 2;
  const selectedSchoolPolicy = getSchoolPolicy(selectedSchoolPolicyId);

  const result = useMemo(() => {
    if (!isCompleted || answers.length !== questions.length) {
      return null;
    }

    const scores: Record<TrackKey, number> = {
      preMedical: 0,
      engineering: 0,
      computerScience: 0,
      business: 0,
      socialSciences: 0,
      creativeMedia: 0,
      coordinatedScience: 0,
    };

    questions.forEach((question, questionIndex) => {
      const selectedIndex = answers[questionIndex];
      const selected = question.options[selectedIndex];

      if (!selected) {
        return;
      }

      (Object.keys(scores) as TrackKey[]).forEach((track) => {
        scores[track] += selected.weights[track] ?? 0;
      });
    });

    const sortedTracks = (Object.keys(scores) as TrackKey[]).sort((a, b) => scores[b] - scores[a]);
    const topTrack = sortedTracks[0];
    const secondTrack = sortedTracks[1];

    const selectedTotalSubjects = questions[0].options[answers[0]]?.totalSubjects ?? 8;
    const primaryProfile = getProfile(topTrack);
    const backupProfile = getProfile(secondTrack);

    const recommendation = buildSubjectRecommendation(
      primaryProfile,
      selectedTotalSubjects,
      selectedSchoolPolicy,
    );

    return {
      scores,
      primaryProfile,
      backupProfile,
      recommendation,
      aiGuidance: buildAiGuidance(
        fullName,
        applicantRole,
        primaryProfile,
        backupProfile,
        scores,
        recommendation,
      ),
    };
  }, [answers, isCompleted, selectedSchoolPolicy, fullName, applicantRole]);

  const answerQuestion = (optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = optionIndex;
      return next;
    });

    setStep((prev) => prev + 1);
  };

  const restart = () => {
    setAnswers([]);
    setStep(0);
    setHasStarted(false);
  };

  const progress = Math.min(((step + 1) / questions.length) * 100, 100);

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Smart Guidance</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">O Level Career Selection Helper</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            Based on 20 smart questions, this tool recommends the most suitable O Level subject combination for your career goals. It follows common Pakistan pathways: 5 compulsory subjects plus stream-based electives.
          </p>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-700">Candidate Profile</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="candidate-name" className="mb-2 block text-xs font-semibold text-slate-700">
                  Full Name
                </label>
                <input
                  id="candidate-name"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Enter full name"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none ring-slate-300 transition focus:ring"
                />
              </div>
              <div>
                <label htmlFor="applicant-role" className="mb-2 block text-xs font-semibold text-slate-700">
                  You Are
                </label>
                <select
                  id="applicant-role"
                  value={applicantRole}
                  onChange={(event) => setApplicantRole(event.target.value as ApplicantRole)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none ring-slate-300 transition focus:ring"
                >
                  <option value="Student">Student</option>
                  <option value="Parent/Guardian">Parent/Guardian</option>
                </select>
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label
              htmlFor="school-policy"
              className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-700"
            >
              Select School Policy (Pakistan)
            </label>
            <select
              id="school-policy"
              value={selectedSchoolPolicyId}
              onChange={(event) => setSelectedSchoolPolicyId(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none ring-slate-300 transition focus:ring"
            >
              {pakistaniSchoolPolicies.map((policy) => (
                <option key={policy.id} value={policy.id}>
                  {policy.name} - {policy.city}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-600">
              {selectedSchoolPolicy.note}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-700">
              Board: {selectedSchoolPolicy.board ?? 'Cambridge O Level'}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-700">
              Typical range: {selectedSchoolPolicy.minTotalSubjects}-{selectedSchoolPolicy.maxTotalSubjects} subjects | Preferred total: {selectedSchoolPolicy.preferredTotalSubjects}
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {!hasStarted ? (
              <button
                onClick={() => setHasStarted(true)}
                disabled={!canStart}
                className="rounded-2xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
                type="button"
              >
                Start Assessment
              </button>
            ) : null}
            <Link
              href="/teaching-tools"
              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Educational Resources
            </Link>
            <button
              onClick={restart}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              type="button"
            >
              Restart Assessment
            </button>
          </div>
        </section>

        {!hasStarted ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 text-sm font-medium text-slate-700 shadow-sm sm:p-8">
            Enter full name and role, then click Start Assessment to begin the 20-question smart evaluation.
          </section>
        ) : null}

        {!isCompleted && currentQuestion && hasStarted ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-5">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                <span>Question {step + 1} of 20</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <progress
                value={step + 1}
                max={questions.length}
                className="h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-slate-200 [&::-webkit-progress-value]:bg-slate-900 [&::-moz-progress-bar]:bg-slate-900"
              />
            </div>

            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{currentQuestion.prompt}</h2>
            <div className="mt-5 grid gap-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={option.label}
                  onClick={() => answerQuestion(index)}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:bg-slate-50 sm:text-base"
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {result ? (
          <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-black text-emerald-900">Recommended Path: {result.primaryProfile.title}</h2>
            <p className="mt-2 text-sm leading-6 text-emerald-900 sm:text-base">
              Career direction: {result.primaryProfile.careerDirection}
            </p>
            <p className="mt-2 text-sm leading-6 text-emerald-900 sm:text-base">{result.primaryProfile.note}</p>

            <div className="mt-5 rounded-2xl border border-emerald-200 bg-white p-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-emerald-800">Subject Plan ({result.recommendation.totalSubjects} total)</h3>
              <p className="mt-2 text-sm text-slate-700">{result.recommendation.planNote}</p>
              <p className="mt-1 text-xs text-slate-600">
                Policy applied: {result.recommendation.policyName} ({result.recommendation.policyRange} subjects)
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Board: {selectedSchoolPolicy.board ?? 'Cambridge O Level'}
              </p>
              <p className="mt-1 text-xs font-semibold text-amber-700">
                Requested total: {result.recommendation.selectedTotal} | {result.recommendation.policyAdvisory}
              </p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-bold text-slate-900">Compulsory (5)</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {result.recommendation.compulsory.map((subject) => (
                      <li key={subject}>{subject}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Electives ({result.recommendation.electives.length})
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {result.recommendation.electives.map((subject) => (
                      <li key={subject}>{subject}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">AI Result Summary</h3>
              <p className="mt-2 text-sm text-slate-700">{result.aiGuidance.opening}</p>
              <p className="mt-2 text-sm text-slate-700">{result.aiGuidance.confidenceLine}</p>
              <p className="mt-2 text-sm text-slate-700">{result.aiGuidance.strategyLine}</p>
              <p className="mt-2 text-sm text-slate-700">{result.aiGuidance.policyLine}</p>
              <p className="mt-2 text-sm text-slate-700">{result.aiGuidance.growthLine}</p>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">Backup Path</h3>
              <p className="mt-2 text-sm text-slate-700">
                If you later want to switch from the primary route, your second-best match is: <strong>{result.backupProfile.title}</strong>
              </p>
              <p className="mt-1 text-sm text-slate-600">{result.backupProfile.careerDirection}</p>
            </div>

            <p className="mt-5 text-xs text-slate-600">
              Note: This smart recommendation is generated from your responses and selected school policy. Final registration should be confirmed with school policy and board requirements.
            </p>
          </section>
        ) : null}
      </div>
    </main>
  );
}
