'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type BookChapter = {
  id: string;
  title: string;
  content: string[];
  questions: { q: string; options: string[]; answer: number }[];
};

type Book = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  chapters: BookChapter[];
};

type QuizItem = { q: string; options: string[]; answer: number };

const STORAGE_KEY = 'steda_progress';

function loadProgress(): Record<string, { completed: number[]; quizScores: Record<string, number> }> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch { return {}; }
}

function saveProgress(data: Record<string, { completed: number[]; quizScores: Record<string, number> }>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const books: Book[] = [
  {
    id: 'steda-overview',
    title: 'STEDA & Teaching License Overview',
    subtitle: 'Understanding STEDA, its role, and the Teaching License Policy 2023',
    icon: '📋',
    color: 'from-indigo-500 to-purple-600',
    chapters: [
      {
        id: 'ch1',
        title: 'What is STEDA?',
        content: [
          'Sindh Teacher Education Development Authority (STEDA) was established under the STEDA Act 2012 to oversee and regulate teacher development activities in Sindh province.',
          'STEDA maintains standards of teacher training programs and training providers across Sindh. It is headquartered at Government Elementary College of Education (M) Lyari, Near Civil Hospital Mission Road, Karachi.',
          'The authority is led by the Minister for Education (Patron), Secretary Education, and an Executive Director. Sayed Sardar Ali Shah is the Patron, Zahid Ali Abbasi is the Secretary, and Sayed Rasool Bux Shah is the Executive Director.',
          'STEDA\'s key roles include: Accreditation of teacher education institutions and programs, issuing Teaching Licenses to qualified teachers, maintaining quality assurance in teacher education, and promoting the teaching profession.',
          'The teaching license is a credential that certifies a teacher has met the required professional standards to teach in Sindh. It aims to improve teacher quality and subsequently enhance student learning outcomes.',
        ],
        questions: [
          { q: 'When was STEDA established?', options: ['2008', '2010', '2012', '2015'], answer: 2 },
          { q: 'STEDA was established under which Act?', options: ['Education Act 2012', 'STEDA Act 2012', 'Teacher Act 2012', 'Sindh Act 2012'], answer: 1 },
          { q: 'Who is the Patron of STEDA?', options: ['Executive Director', 'Secretary Education', 'Minister for Education', 'Chief Minister Sindh'], answer: 2 },
          { q: 'Where is STEDA headquartered?', options: ['Hyderabad', 'Karachi', 'Sukkur', 'Larkana'], answer: 1 },
          { q: 'What is the main purpose of STEDA?', options: ['Build schools', 'Regulate teacher development', 'Conduct exams', 'Print textbooks'], answer: 1 },
        ],
      },
      {
        id: 'ch2',
        title: 'Teaching License Policy 2023',
        content: [
          'The Government of Sindh approved the Teaching License Policy 2023 to professionalize the teaching workforce. The policy applies to all teachers in public and private schools across Sindh.',
          'The teaching license is a credential that authorizes an individual to teach at a specific level. It is valid for a period and must be renewed periodically. The license ensures teachers meet minimum professional standards.',
          'Key features of the policy: All teachers must hold a valid teaching license to teach in Sindh. The license is categorized by level (Primary, Elementary, Secondary, Higher Secondary). Applicants must pass a standardized test conducted by a third-party testing service.',
          'The test covers: Content Knowledge (30%) - knowledge of subjects taught at class 1-8 level, Psychometric Assessment (20%) - verbal, numerical, and reasoning abilities, Pedagogical Content Knowledge (50%) - teaching methods, classroom management, assessment strategies.',
          'Third-party testing services handle online registration, test administration, and scoring. STEDA conducts verification of qualified candidates before issuing the license. The test is a single-attempt endeavor with 100 marks total.',
        ],
        questions: [
          { q: 'When was the Teaching License Policy approved?', options: ['2022', '2023', '2024', '2025'], answer: 1 },
          { q: 'What percentage of the test is Content Knowledge?', options: ['20%', '25%', '30%', '50%'], answer: 2 },
          { q: 'What percentage is Pedagogical Content Knowledge?', options: ['20%', '30%', '40%', '50%'], answer: 3 },
          { q: 'What percentage is Psychometric Assessment?', options: ['10%', '15%', '20%', '25%'], answer: 2 },
          { q: 'How many total marks is the teaching license test?', options: ['50', '75', '100', '150'], answer: 2 },
        ],
      },
      {
        id: 'ch3',
        title: 'Test Structure & Languages',
        content: [
          'The STEDA Teaching License test is designed to assess three main domains: Content Knowledge, Psychometric Assessment, and Pedagogical Content Knowledge.',
          'Content Knowledge (30 marks): Tests the candidate\'s understanding of subjects taught at the primary and elementary level (Class 1-8). This includes English, Urdu/Sindhi, Mathematics, Science, and Social Studies. The curriculum is based on the National Curriculum of Pakistan and the DCAR (Directorate of Curriculum, Assessment and Research) syllabus.',
          'Psychometric Assessment (20 marks): Evaluates cognitive abilities including verbal reasoning (vocabulary, comprehension), numerical reasoning (basic arithmetic, patterns), and abstract/spatial reasoning. This section helps assess the candidate\'s aptitude for teaching.',
          'Pedagogical Content Knowledge (50 marks): The largest section, covering teaching methodologies, classroom management, student assessment, lesson planning, educational psychology, and knowledge of the National Professional Standards for Teachers (NPST).',
          'Languages: The test instrument is primarily in English. However, proficiency in the mother tongue (Urdu or Sindhi) is also tested. Candidates should be proficient in both English and at least one local language to effectively communicate with students.',
        ],
        questions: [
          { q: 'Which section has the highest weightage?', options: ['Content Knowledge', 'Psychometric', 'Pedagogical Knowledge', 'All equal'], answer: 2 },
          { q: 'What is the primary language of the test?', options: ['Urdu', 'Sindhi', 'English', 'Arabic'], answer: 2 },
          { q: 'Content Knowledge is based on curriculum of which classes?', options: ['Nursery-5', 'Class 1-8', 'Class 6-10', 'Class 9-12'], answer: 1 },
          { q: 'What is DCAR?', options: ['Directorate of Curriculum Assessment and Research', 'Department of Curriculum and Results', 'Directorate of Central Academic Resources', 'Development Council for Academic Research'], answer: 0 },
          { q: 'Which is NOT tested in Psychometric Assessment?', options: ['Verbal reasoning', 'Numerical reasoning', 'Teaching methods', 'Abstract reasoning'], answer: 2 },
        ],
      },
    ],
  },
  {
    id: 'npst',
    title: 'National Professional Standards',
    subtitle: 'NPST for Teachers in Pakistan as per NACTE guidelines',
    icon: '🏆',
    color: 'from-emerald-500 to-teal-600',
    chapters: [
      {
        id: 'npst1',
        title: 'Introduction to NPST',
        content: [
          'The National Professional Standards for Teachers (NPST) were developed by the National Accreditation Council for Teacher Education (NACTE) to define what teachers should know and be able to do.',
          'There are 10 professional standards that all teachers in Pakistan must meet. These standards cover subject matter knowledge, pedagogical skills, assessment practices, and professional dispositions.',
          'Standard 1: Subject Matter Knowledge - Teachers must have deep understanding of the content they teach.',
          'Standard 2: Human Growth and Development - Teachers must understand how students learn and develop.',
          'Standard 3: Knowledge of Islamic Values - Teachers must integrate Islamic ethical values in their teaching.',
          'Standard 4: Instructional Planning and Strategies - Teachers must plan effective instruction using diverse strategies.',
          'Standard 5: Assessment - Teachers must use various assessment techniques to evaluate student learning.',
          'Standard 6: Learning Environment - Teachers must create a safe, inclusive, and engaging learning environment.',
          'Standard 7: Effective Communication - Teachers must communicate effectively with students, parents, and colleagues.',
          'Standard 8: Collaboration and Partnerships - Teachers must collaborate with stakeholders to support student learning.',
          'Standard 9: Continuous Professional Development - Teachers must engage in lifelong learning.',
          'Standard 10: Professional Ethics - Teachers must uphold ethical standards and professional conduct.',
        ],
        questions: [
          { q: 'Who developed the NPST?', options: ['HEC', 'NACTE', 'STEDA', 'DCAR'], answer: 1 },
          { q: 'How many National Professional Standards are there?', options: ['5', '8', '10', '12'], answer: 2 },
          { q: 'Standard 1 covers what area?', options: ['Assessment', 'Subject Matter Knowledge', 'Classroom Management', 'Communication'], answer: 1 },
          { q: 'Standard 5 covers what area?', options: ['Lesson Planning', 'Assessment', 'Learning Environment', 'Collaboration'], answer: 1 },
          { q: 'Standard 9 emphasizes what?', options: ['Ethics', 'CPD', 'Communication', 'Planning'], answer: 1 },
          { q: 'Which standard covers Islamic values?', options: ['Standard 1', 'Standard 2', 'Standard 3', 'Standard 4'], answer: 2 },
        ],
      },
      {
        id: 'npst2',
        title: 'Subject Matter & Student Development',
        content: [
          'Standard 1: Subject Matter Knowledge - Teachers must demonstrate comprehensive understanding of the subject content. They should be able to organize content logically, make connections across disciplines, and present information in an age-appropriate manner.',
          'Key indicators: Explains concepts accurately and clearly, uses relevant examples from daily life, integrates cross-curricular connections, stays updated with developments in the subject area.',
          'Standard 2: Human Growth and Development - Teachers must understand physical, cognitive, social, and emotional development of learners from early childhood through adolescence.',
          'Key theories: Piaget\'s Theory of Cognitive Development (sensorimotor, preoperational, concrete operational, formal operational stages), Vygotsky\'s Zone of Proximal Development (ZPD - the gap between what a learner can do independently and what they can do with guidance), Erikson\'s Psychosocial Development stages.',
          'Application: Differentiate instruction based on developmental levels, provide appropriate scaffolding, create activities matching students\' cognitive abilities and interests.',
        ],
        questions: [
          { q: 'Which standard requires teachers to know subject content?', options: ['Standard 1', 'Standard 2', 'Standard 3', 'Standard 4'], answer: 0 },
          { q: 'Piaget proposed how many stages of cognitive development?', options: ['2', '3', '4', '5'], answer: 2 },
          { q: 'What does ZPD stand for?', options: ['Zero Performance Development', 'Zone of Proximal Development', 'Zone of Practical Development', 'Zero Proximal Distance'], answer: 1 },
          { q: 'Standard 2 focuses on what aspect of teaching?', options: ['Subject knowledge', 'Student development', 'Assessment', 'Classroom management'], answer: 1 },
          { q: 'Which psychologist is associated with ZPD?', options: ['Piaget', 'Vygotsky', 'Erikson', 'Skinner'], answer: 1 },
        ],
      },
      {
        id: 'npst3',
        title: 'Instructional Planning & Assessment',
        content: [
          'Standard 4: Instructional Planning and Strategies - Teachers must develop systematic lesson plans that align with curriculum objectives. They should use a variety of teaching strategies to meet diverse learner needs.',
          'Key components of lesson planning: Objectives (SMART - Specific, Measurable, Achievable, Relevant, Time-bound), Introduction/Motivation (5 minutes), Development/Main activity (30 minutes), Conclusion (5 minutes), Assessment/Evaluation (5 minutes), Homework/Follow-up.',
          'Teaching strategies: Lecture method, Demonstration, Discussion, Inquiry-based learning, Cooperative learning, Project-based learning, Problem-solving, Experiential learning, Role-play, and Technology-enhanced learning.',
          'Standard 5: Assessment - Teachers must design and implement diverse assessment strategies to evaluate student learning. Types include: Formative assessment (ongoing during instruction), Summative assessment (end of unit/term), Diagnostic assessment (before instruction), and Portfolio assessment (collection of student work).',
          'Assessment principles: Valid (measures what it intends to), Reliable (consistent results), Fair (unbiased and equitable), Authentic (real-world tasks), and Transparent (clear criteria). Feedback should be timely, specific, and constructive.',
        ],
        questions: [
          { q: 'What does SMART stand for in lesson planning?', options: ['Simple, Measurable, Achievable, Relevant, Timely', 'Specific, Measurable, Achievable, Relevant, Time-bound', 'Specific, Meaningful, Achievable, Realistic, Tested', 'Simple, Meaningful, Accurate, Relevant, Time-bound'], answer: 1 },
          { q: 'Which assessment type happens during instruction?', options: ['Summative', 'Diagnostic', 'Formative', 'Portfolio'], answer: 2 },
          { q: 'Which type of assessment occurs at the end of a unit?', options: ['Formative', 'Summative', 'Diagnostic', 'Placement'], answer: 1 },
          { q: 'Standard 4 relates to what?', options: ['Assessment', 'Planning and Strategies', 'Communication', 'Learning Environment'], answer: 1 },
          { q: 'Which teaching strategy involves students working together in groups?', options: ['Lecture', 'Demonstration', 'Cooperative learning', 'Role-play'], answer: 2 },
        ],
      },
    ],
  },
  {
    id: 'content-knowledge',
    title: 'Content Knowledge',
    subtitle: 'Subject knowledge for Class 1-8 as per National Curriculum',
    icon: '📚',
    color: 'from-blue-500 to-cyan-600',
    chapters: [
      {
        id: 'ck-eng',
        title: 'English Language',
        content: [
          'English content knowledge covers grammar, vocabulary, reading comprehension, and writing skills appropriate for Class 1-8 level.',
          'Parts of Speech: Noun (person, place, thing), Pronoun (replaces noun - he, she, it, they), Verb (action or state), Adjective (describes noun), Adverb (describes verb), Preposition (shows relationship - in, on, at, under), Conjunction (connects words - and, but, or), Interjection (expresses emotion - wow, oh).',
          'Tenses: Present (Simple, Continuous, Perfect, Perfect Continuous), Past (Simple, Continuous, Perfect), Future (Simple, Continuous, Perfect). Simple Present is used for habits and facts. Simple Past for completed actions. Simple Future for planned actions.',
          'Sentence Structure: Subject + Verb + Object (SVO). Types: Declarative (statement), Interrogative (question), Imperative (command), Exclamatory (strong emotion). Active voice vs Passive voice.',
          'Vocabulary: Synonyms (same meaning), Antonyms (opposite), Homophones (same sound, different spelling - their/there/they\'re), Homonyms (same spelling, different meaning - bat, bank), Prefixes and Suffixes, Root words.',
          'Reading Comprehension: Main idea, supporting details, inference, prediction, cause and effect, sequencing, fact vs opinion. Writing: paragraph writing, letter writing (formal/informal), story writing, essay writing, report writing.',
        ],
        questions: [
          { q: 'What part of speech describes a noun?', options: ['Verb', 'Adverb', 'Adjective', 'Preposition'], answer: 2 },
          { q: '"She is reading a book" - what tense is this?', options: ['Simple Present', 'Present Continuous', 'Present Perfect', 'Simple Past'], answer: 1 },
          { q: 'Words with same sound but different spelling are called?', options: ['Synonyms', 'Homophones', 'Homonyms', 'Antonyms'], answer: 1 },
          { q: 'What sentence type asks a question?', options: ['Declarative', 'Imperative', 'Interrogative', 'Exclamatory'], answer: 2 },
          { q: 'Identify the adverb: "She ran quickly."', options: ['She', 'ran', 'quickly', 'none'], answer: 2 },
          { q: 'Which tense is used for habits and general facts?', options: ['Simple Present', 'Present Continuous', 'Past Simple', 'Future Simple'], answer: 0 },
        ],
      },
      {
        id: 'ck-urdu',
        title: 'Urdu / Sindhi Language',
        content: [
          'Proficiency in mother tongue (Urdu or Sindhi) is tested. This includes grammar, comprehension, and writing skills.',
          'Urdu grammar topics: Noun (اسم), Pronoun (ضمیر), Verb (فعل), Adjective (صفت), Adverb (متعلق فعل), Preposition (حرف جار), Conjunction (حرف عطف). Gender (مذکر/مؤنث), Number (واحد/جمع), Tenses (زمانے).',
          'Sentence structure in Urdu is Subject + Object + Verb (SOV), unlike English which is SVO. For example: "میں کتاب پڑھتا ہوں" (I book read).',
          'For Sindhi: Similar grammatical concepts apply. Sindhi has its own script (modified Arabic/Persian) with 52 letters. Key areas include: Noun cases, verb conjugation, and sentence construction.',
          'Comprehension and writing: Reading passages with questions, paragraph writing, letter writing (خط نویسی), application writing, essay writing (مضمون نویسی), and translation between English and Urdu/Sindhi.',
        ],
        questions: [
          { q: 'What is the word order in Urdu sentences?', options: ['SVO', 'SOV', 'VSO', 'OSV'], answer: 1 },
          { q: 'How many letters does the Sindhi alphabet have?', options: ['42', '48', '52', '56'], answer: 2 },
          { q: 'What is "صفت" in Urdu grammar?', options: ['Noun', 'Verb', 'Adjective', 'Pronoun'], answer: 2 },
          { q: 'The Urdu sentence structure differs from English in what way?', options: ['Subject position', 'Object position', 'Verb position', 'All same'], answer: 2 },
          { q: '"ضمیر" refers to which part of speech?', options: ['Noun', 'Pronoun', 'Verb', 'Adjective'], answer: 1 },
        ],
      },
      {
        id: 'ck-math',
        title: 'Mathematics',
        content: [
          'Mathematics content covers concepts from Class 1 to 8 level, including arithmetic, algebra, geometry, measurement, and data handling.',
          'Number System: Natural numbers, Whole numbers, Integers, Rational numbers, Real numbers. Place value up to billions. Prime and composite numbers. Factors and multiples. LCM and HCF.',
          'Arithmetic Operations: Addition, subtraction, multiplication, division of whole numbers, fractions, decimals, and percentages. BODMAS/BIDMAS rule (Brackets, Orders, Division/Multiplication, Addition/Subtraction).',
          'Fractions: Proper, improper, mixed numbers. Equivalent fractions. Addition, subtraction, multiplication, division of fractions. Decimal fractions. Converting between fractions, decimals, and percentages.',
          'Algebra: Algebraic expressions, linear equations (one variable), simple inequalities, patterns and sequences. Basic concept of variables, constants, coefficients.',
          'Geometry: Points, lines, line segments, rays, angles (acute, right, obtuse, straight, reflex). 2D shapes (triangle, quadrilateral, circle, polygon). 3D shapes (cube, cuboid, sphere, cylinder, cone, pyramid). Perimeter, area, volume.',
          'Measurement: Length, mass, capacity, time, money. Metric and imperial units. Conversion between units. Data Handling: Tally marks, bar graphs, pictographs, line graphs, pie charts. Mean, median, mode, range.',
        ],
        questions: [
          { q: 'What does BODMAS stand for?', options: ['Brackets Order Division Multiplication Addition Subtraction', 'Brackets Of Division Multiplication Addition Subtraction', 'Brackets Operations Division Multiplication Addition Subtraction', 'Brackets Orders Division Multiplication Addition Subtraction'], answer: 0 },
          { q: 'Which is NOT a type of fraction?', options: ['Proper', 'Improper', 'Mixed', 'Complex'], answer: 3 },
          { q: 'What is the formula for area of a rectangle?', options: ['Length × Breadth', '2(L+B)', 'πr²', '½ × base × height'], answer: 0 },
          { q: 'What is the median of: 3, 7, 9, 12, 15?', options: ['7', '9', '9.2', '12'], answer: 1 },
          { q: 'How many degrees are in a right angle?', options: ['45°', '60°', '90°', '180°'], answer: 2 },
          { q: 'Which number is a prime number?', options: ['4', '9', '11', '15'], answer: 2 },
        ],
      },
      {
        id: 'ck-science',
        title: 'General Science',
        content: [
          'General Science covers topics from Class 1-8 curriculum including life sciences, physical sciences, and earth sciences.',
          'Biology: Living and non-living things, plant and animal classification, human body systems (digestive, respiratory, circulatory, nervous, skeletal), photosynthesis, food chains and webs, ecosystems, reproduction in plants and animals.',
          'Chemistry: States of matter (solid, liquid, gas), changes of state (melting, freezing, evaporation, condensation, sublimation), elements, compounds, and mixtures, physical and chemical changes, acids and bases, simple chemical reactions.',
          'Physics: Force and motion (Newton\'s laws), energy (kinetic, potential, heat, light, sound, electrical), simple machines (lever, pulley, inclined plane, wheel and axle), light (reflection, refraction), sound (pitch, loudness), electricity (circuits, conductors, insulators), magnetism.',
          'Earth and Space: Solar system (sun, planets, moon), day and night, seasons, rocks and minerals, weather and climate, water cycle, natural resources (renewable and non-renewable), environmental conservation.',
          'Health and Nutrition: Food groups (carbohydrates, proteins, fats, vitamins, minerals), balanced diet, diseases (infectious and non-infectious), hygiene, first aid basics, drug awareness.',
        ],
        questions: [
          { q: 'Photosynthesis occurs in which part of the plant?', options: ['Roots', 'Stem', 'Leaves', 'Flowers'], answer: 2 },
          { q: 'What are the three states of matter?', options: ['Hot, Cold, Warm', 'Solid, Liquid, Gas', 'Hard, Soft, Liquid', 'Element, Compound, Mixture'], answer: 1 },
          { q: 'Which law states "For every action there is an equal reaction"?', options: ['First Law', 'Second Law', 'Third Law', 'Law of Gravity'], answer: 2 },
          { q: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], answer: 1 },
          { q: 'What is the main source of energy on Earth?', options: ['Moon', 'Wind', 'Sun', 'Fossil fuels'], answer: 2 },
          { q: 'Which system breaks down food in the body?', options: ['Circulatory', 'Respiratory', 'Digestive', 'Nervous'], answer: 2 },
        ],
      },
      {
        id: 'ck-sst',
        title: 'Social Studies & Pakistan Studies',
        content: [
          'Social Studies covers geography, history, civics, and Pakistan Studies for Class 1-8 level.',
          'Geography: Continents and oceans, countries and capitals, physical features (mountains, rivers, deserts, plains), climate zones, natural resources, population distribution. Geography of Pakistan: provinces, major cities, rivers (Indus, Jhelum, Chenab, Ravi, Sutlej), mountains (Karakoram, Himalayas, Hindu Kush), deserts (Thar, Cholistan, Thal).',
          'History of Pakistan: Indus Valley Civilization, arrival of Islam in the subcontinent, Mughal Empire, British Rule, Freedom Movement (Aligarh Movement, Pakistan Resolution 1940, Lahore Resolution), creation of Pakistan (1947), democratic and military regimes, 1973 Constitution.',
          'Civics: Rights and responsibilities of citizens, constitution, government structure (federal, provincial, local), parliament, judiciary, fundamental rights, democracy, rule of law.',
          'Important topics: Pakistan\'s ideology, Quaid-e-Azam Muhammad Ali Jinnah\'s 14 Points, Allama Iqbal\'s Allahabad Address 1930, Objectives Resolution 1949, National Flag and Anthem, Population and census, Economic overview (agriculture, industry, trade).',
        ],
        questions: [
          { q: 'Which is the longest river in Pakistan?', options: ['Chenab', 'Jhelum', 'Indus', 'Ravi'], answer: 2 },
          { q: 'When was the Pakistan Resolution passed?', options: ['1930', '1940', '1947', '1956'], answer: 1 },
          { q: 'How many provinces does Pakistan have?', options: ['3', '4', '5', '6'], answer: 1 },
          { q: 'Which civilization existed in the Indus Valley?', options: ['Mesopotamian', 'Egyptian', 'Indus Valley', 'Chinese'], answer: 2 },
          { q: 'The 1973 Constitution declared Pakistan a what?', options: ['Monarchy', 'Federal Republic', 'Islamic Republic', 'Secular State'], answer: 2 },
          { q: 'Who gave the Allahabad Address in 1930?', options: ['Jinnah', 'Iqbal', 'Liaquat', 'Sir Syed'], answer: 1 },
        ],
      },
    ],
  },
  {
    id: 'pedagogy',
    title: 'Pedagogical Content Knowledge',
    subtitle: 'Teaching methods, strategies, and educational psychology',
    icon: '🎯',
    color: 'from-orange-500 to-red-600',
    chapters: [
      {
        id: 'ped1',
        title: 'Teaching Methodologies',
        content: [
          'Teaching methodologies are systematic approaches to delivering instruction. Different methods suit different learning objectives, student needs, and content types.',
          'Teacher-Centered Methods: Lecture Method (teacher presents information to students), Demonstration Method (teacher shows while students observe), Drill and Practice (repetition for mastery). These work well for large classes but limit student participation.',
          'Student-Centered Methods: Inquiry-Based Learning (students investigate questions), Problem-Based Learning (students solve real problems), Project-Based Learning (students complete projects), Cooperative Learning (students work in groups), Discovery Learning (students discover concepts themselves). These promote critical thinking and engagement.',
          'Constructivist Approach: Based on Piaget and Vygotsky\'s theories. Students construct their own understanding through experiences. The teacher is a facilitator, not a lecturer. Learning is active, contextual, and social.',
          'Multiple Intelligences (Howard Gardner): Linguistic, Logical-Mathematical, Spatial, Musical, Bodily-Kinesthetic, Interpersonal, Intrapersonal, Naturalistic. Teachers should use varied activities to address different intelligences.',
          'Bloom\'s Taxonomy: Remember (recall facts), Understand (explain ideas), Apply (use in new situations), Analyze (break down information), Evaluate (justify decisions), Create (produce new work). Higher-order thinking skills are essential for deep learning.',
        ],
        questions: [
          { q: 'Which method involves students investigating questions?', options: ['Lecture', 'Inquiry-Based', 'Demonstration', 'Drill'], answer: 1 },
          { q: 'How many intelligences did Gardner propose?', options: ['5', '7', '8', '10'], answer: 2 },
          { q: 'Which is the highest level of Bloom\'s Taxonomy?', options: ['Evaluate', 'Create', 'Analyze', 'Apply'], answer: 1 },
          { q: 'Constructivism is based on the work of which theorists?', options: ['Skinner & Watson', 'Piaget & Vygotsky', 'Freud & Jung', 'Bandura & Pavlov'], answer: 1 },
          { q: 'In student-centered learning, the teacher acts as a?', options: ['Lecturer', 'Facilitator', 'Controller', 'Judge'], answer: 1 },
          { q: 'Which intelligence involves sensitivity to others\' feelings?', options: ['Intrapersonal', 'Interpersonal', 'Linguistic', 'Kinesthetic'], answer: 1 },
        ],
      },
      {
        id: 'ped2',
        title: 'Classroom Management',
        content: [
          'Classroom management refers to the techniques teachers use to maintain order, engage students, and create a productive learning environment.',
          'Key principles: Establish clear rules and routines from day one, build positive relationships with students, use positive reinforcement rather than punishment, be consistent and fair, arrange the physical space for optimal learning.',
          'Classroom management models: Assertive Discipline (Lee Canter - clear expectations and consequences), Democratic Classroom (Rudolf Dreikurs - students participate in rule-making), Choice Theory (William Glasser - students choose their behavior), Restorative Practices (focus on repairing harm rather than punishing).',
          'Dealing with challenging behavior: Use proximity control, non-verbal cues, redirect attention, offer choices, use "I" messages, have private conversations, involve parents when needed. Avoid public humiliation or shouting.',
          'Time management: Begin lessons promptly, use smooth transitions between activities, have materials ready, use timers, maintain appropriate pacing. Maximize instructional time by minimizing disruptions.',
          'Creating a positive learning environment: Arrange seating to support learning goals (rows for lectures, groups for collaboration). Display student work. Ensure adequate lighting, ventilation, and noise control. Establish a culture of respect and belonging.',
        ],
        questions: [
          { q: 'Which model involves students participating in rule-making?', options: ['Assertive Discipline', 'Democratic Classroom', 'Choice Theory', 'Restorative Practices'], answer: 1 },
          { q: 'What is proximity control?', options: ['Controlling temperature', 'Moving near a student', 'Controlling noise', 'Setting rules'], answer: 1 },
          { q: 'Who developed Assertive Discipline?', options: ['Dreikurs', 'Glasser', 'Canter', 'Skinner'], answer: 2 },
          { q: 'Effective classroom management starts with?', options: ['Punishment', 'Clear rules and routines', 'Strict lecturing', 'Homework'], answer: 1 },
          { q: 'Restorative practices focus on what?', options: ['Punishment', 'Repairing harm', 'Rewards', 'Competition'], answer: 1 },
        ],
      },
      {
        id: 'ped3',
        title: 'Educational Psychology',
        content: [
          'Educational psychology studies how people learn and the best practices for teaching. It combines principles of psychology and education.',
          'Learning Theories: Behaviorism (Pavlov, Skinner, Watson - learning through stimulus-response and reinforcement), Cognitivism (Piaget, Bruner - learning through mental processes), Constructivism (Piaget, Vygotsky - learning by constructing knowledge), Social Learning Theory (Bandura - learning through observation and modeling).',
          'Motivation: Intrinsic (internal drive - curiosity, interest, mastery) vs Extrinsic (external rewards - grades, praise, prizes). Self-Determination Theory (Deci & Ryan) identifies three basic needs: autonomy, competence, and relatedness.',
          'Child Development Stages: Piaget\'s Cognitive Stages (Sensorimotor 0-2, Preoperational 2-7, Concrete Operational 7-11, Formal Operational 11+), Erikson\'s Psychosocial Stages (Trust vs Mistrust, Autonomy vs Shame, Initiative vs Guilt, Industry vs Inferiority, Identity vs Role Confusion).',
          'Individual Differences: Learning styles (visual, auditory, kinesthetic, reading/writing), multiple intelligences, special educational needs (gifted students, learning disabilities, ADHD, autism spectrum), cultural and linguistic diversity.',
          'Memory and Forgetting: Sensory memory (seconds), Short-term/Working memory (15-30 seconds, 7±2 items), Long-term memory (permanent). Ebbinghaus Forgetting Curve - we forget rapidly without review. Strategies: chunking, rehearsal, elaboration, mnemonics, spaced repetition.',
        ],
        questions: [
          { q: 'Who proposed Social Learning Theory?', options: ['Piaget', 'Vygotsky', 'Bandura', 'Skinner'], answer: 2 },
          { q: 'Piaget\'s Concrete Operational stage covers ages?', options: ['0-2', '2-7', '7-11', '11+'], answer: 2 },
          { q: 'What is the capacity of short-term memory?', options: ['3±1 items', '5±2 items', '7±2 items', '9±2 items'], answer: 2 },
          { q: 'Intrinsic motivation comes from?', options: ['External rewards', 'Internal drive', 'Peer pressure', 'Parental expectations'], answer: 1 },
          { q: 'Ebbinghaus Forgetting Curve shows that we forget?', options: ['Slowly over time', 'Rapidly then gradually', 'At a constant rate', 'Never if understood'], answer: 1 },
          { q: 'Which theory uses reinforcement and punishment?', options: ['Cognitivism', 'Constructivism', 'Behaviorism', 'Humanism'], answer: 2 },
        ],
      },
      {
        id: 'ped4',
        title: 'Curriculum & Lesson Planning',
        content: [
          'Curriculum refers to the overall content, skills, and learning experiences planned for students. In Pakistan, the curriculum is developed at the national level by the Curriculum Wing of the Ministry of Education.',
          'National Curriculum of Pakistan 2006: It provides the framework for education from Class 1-12. Key features include: Student-centered approach, integration of knowledge across subjects, emphasis on critical thinking, and incorporation of Islamic values.',
          'Single National Curriculum (SNC) 2020: Introduced to ensure uniformity across all school systems (public, private, religious). It focuses on: Uniformity in content and learning outcomes, character building, National identity, 21st-century skills, and STEAM education.',
          'Lesson Planning Components: 1. Date and Class information, 2. Topic and duration, 3. Learning objectives (from SLOs - Student Learning Outcomes), 4. Teaching aids/materials, 5. Introduction/Motivation (5 min), 6. Development/Lesson procedure (25-30 min), 7. Assessment/Evaluation (5 min), 8. Conclusion (5 min), 9. Homework/Follow-up.',
          'Scheme of Studies: The distribution of subjects across different grade levels. For example, in B.Ed programs, the scheme includes: Professional courses (Foundations of Education, Educational Psychology), Content courses (teaching of specific subjects), and Practicum/Teaching Practice.',
          'Co-curricular and Extracurricular Activities: Debates, quizzes, sports, art, music, drama, scouting, community service. These develop social skills, leadership, creativity, and physical fitness.',
        ],
        questions: [
          { q: 'Which curriculum was introduced in 2020?', options: ['National Curriculum 2006', 'Single National Curriculum', 'B.Ed Curriculum', 'STEDA Curriculum'], answer: 1 },
          { q: 'What are SLOs?', options: ['School Learning Objectives', 'Student Learning Outcomes', 'Standard Learning Objectives', 'System Learning Outcomes'], answer: 1 },
          { q: 'The National Curriculum 2006 emphasizes what approach?', options: ['Teacher-centered', 'Student-centered', 'Exam-centered', 'Book-centered'], answer: 1 },
          { q: 'Which is NOT a lesson planning component?', options: ['Objectives', 'Development', 'Salary', 'Assessment'], answer: 2 },
          { q: 'The SNC aims to ensure what across school systems?', options: ['Different content', 'Uniformity', 'Competition', 'Privatization'], answer: 1 },
        ],
      },
    ],
  },
  {
    id: 'psychometric',
    title: 'Psychometric Assessment',
    subtitle: 'Verbal, numerical, and reasoning ability practice',
    icon: '🧠',
    color: 'from-violet-500 to-pink-600',
    chapters: [
      {
        id: 'psych1',
        title: 'Verbal Reasoning',
        content: [
          'Verbal reasoning assesses your ability to understand, analyze, and evaluate written information. It includes vocabulary, comprehension, analogies, and critical thinking.',
          'Synonyms and Antonyms: Words with similar (synonyms) and opposite (antonyms) meanings. Example: Happy - Joyful (synonym), Happy - Sad (antonym). Practice expands vocabulary and improves word choice.',
          'Analogies: Identifying relationships between pairs of words. Types: Part-Whole (finger:hand), Cause-Effect (fire:smoke), Synonym (big:large), Antonym (hot:cold), Function (pen:write), Category (apple:fruit). Format: A:B :: C:D (A is to B as C is to D).',
          'Reading Comprehension: Read passages and answer questions about: main idea, supporting details, inference, tone, purpose, vocabulary in context. Strategies: Skim first for main idea, read questions before detailed reading, look for keywords.',
          'Sentence Completion: Fill in blanks in sentences using context clues. Clue types: Definition clues (the word is defined in the sentence), Contrast clues (opposite meaning indicated by but, however), Example clues (examples given), Cause-effect clues.',
          'Critical Reasoning: Identify assumptions, strengthen/weaken arguments, draw conclusions, identify flaws in reasoning. Look for logical fallacies like circular reasoning, false analogy, hasty generalization, ad hominem.',
        ],
        questions: [
          { q: 'Complete the analogy: Bird : Fly :: Fish : ?', options: ['Walk', 'Swim', 'Jump', 'Crawl'], answer: 1 },
          { q: 'What is the synonym of "Apprehensive"?', options: ['Happy', 'Fearful', 'Brave', 'Tired'], answer: 1 },
          { q: 'What is the antonym of "Generous"?', options: ['Kind', 'Selfish', 'Helpful', 'Rich'], answer: 1 },
          { q: 'Relationship type: "Pen is to Write" is what analogy?', options: ['Part-Whole', 'Synonym', 'Function', 'Category'], answer: 2 },
          { q: 'A hasty generalization is a type of?', options: ['Fact', 'Opinion', 'Logical fallacy', 'Evidence'], answer: 2 },
        ],
      },
      {
        id: 'psych2',
        title: 'Numerical Reasoning',
        content: [
          'Numerical reasoning tests your ability to work with numbers, identify patterns, and solve quantitative problems quickly and accurately.',
          'Number Sequences: Identify patterns in sequences. Common patterns: Arithmetic (add/subtract constant), Geometric (multiply/divide constant), Square/Cube numbers, Fibonacci (each term is sum of previous two), Alternating patterns.',
          'Percentages: Percentage increase/decrease, finding percentage of a number, profit/loss percentage, discount calculations. Formula: Percentage = (Part/Whole) × 100.',
          'Ratios and Proportions: Comparing quantities. Simplify ratios, divide quantities in given ratios, direct and inverse proportion. Example: If 3 pens cost Rs. 45, how much do 7 pens cost? (Direct proportion).',
          'Averages: Mean (sum ÷ count), median (middle value when sorted), mode (most frequent value). Weighted averages for different groups with different sizes.',
          'Data Interpretation: Read and interpret tables, bar graphs, line graphs, pie charts. Calculate totals, differences, percentages, and trends. Example: Given a pie chart of expenses, calculate the angle for each category.',
          'Basic Arithmetic: Speed, distance, time (S = D/T), work problems (combined work rate), area and perimeter, simple and compound interest, profit and loss, discount and tax.',
        ],
        questions: [
          { q: 'Find the next: 2, 6, 18, 54, ?', options: ['108', '162', '72', '216'], answer: 1 },
          { q: '15% of 200 = ?', options: ['20', '25', '30', '35'], answer: 2 },
          { q: 'A car travels 120 km in 2 hours. What is its speed?', options: ['40 km/h', '50 km/h', '60 km/h', '80 km/h'], answer: 2 },
          { q: 'Find the median of: 4, 7, 2, 9, 5', options: ['4', '5', '7', '9'], answer: 1 },
          { q: 'If 5 workers complete a job in 10 days, how many days will 2 workers take?', options: ['20', '25', '15', '30'], answer: 1 },
          { q: 'In a class of 40 students, 60% are boys. How many girls?', options: ['16', '20', '24', '30'], answer: 0 },
        ],
      },
      {
        id: 'psych3',
        title: 'Abstract & Spatial Reasoning',
        content: [
          'Abstract reasoning tests your ability to identify patterns, relationships, and rules in non-verbal information. It is a key indicator of fluid intelligence.',
          'Pattern Recognition: Identify the pattern in a series of shapes. Look for: Rotation (clockwise/anticlockwise), Reflection/mirror image, Size changes, Number of elements, Shading/color changes, Position/arrangement changes, Sequence rules (add/remove elements).',
          'Matrix Reasoning: Find the missing element in a 3×3 grid. Look for patterns across rows and columns. The same rule may apply both horizontally and vertically, or a combination of both.',
          'Classification: Identify the odd one out from a set of shapes. Look for differences in: shape type, number of sides, symmetry, shading, orientation, size, or other attributes.',
          'Analogies (Non-verbal): A:B :: C:? where A, B, C are figures. Find the transformation that changes A to B and apply it to C. Transformations may include: rotation, flipping, color change, size change, addition/deletion of elements.',
          'Spatial Reasoning: Mental rotation (imagine rotating a 3D object), folding/unfolding (predict how a flat pattern folds into 3D), mirror images, embedded figures (find a simple shape within a complex figure), and net of solids.',
          'Tips: Work systematically, look for patterns in order (rotation first, then color, then size), eliminate obviously wrong answers, practice with timed conditions, don\'t spend too long on any single question.',
        ],
        questions: [
          { q: 'What type of reasoning uses shapes and patterns without words?', options: ['Verbal', 'Numerical', 'Abstract', 'Spatial'], answer: 2 },
          { q: 'Mental rotation is a type of what reasoning?', options: ['Verbal', 'Numerical', 'Abstract', 'Spatial'], answer: 3 },
          { q: 'In matrix reasoning, what size grid is commonly used?', options: ['2x2', '3x3', '4x4', '5x5'], answer: 1 },
          { q: 'Classification tasks ask you to find what?', options: ['The next in sequence', 'The missing element', 'The odd one out', 'The mirror image'], answer: 2 },
          { q: 'Non-verbal analogies follow the pattern A:B :: ?', options: ['B:C', 'C:?', 'A:C', 'B:A'], answer: 1 },
        ],
      },
    ],
  },
  {
    id: 'practice-tests',
    title: 'Practice Tests',
    subtitle: 'Full-length model papers as per IBA / STEDA pattern',
    icon: '📝',
    color: 'from-rose-500 to-pink-600',
    chapters: [
      {
        id: 'pt1',
        title: 'Model Test 1 - Full Paper',
        content: [
          'This practice test simulates the actual STEDA Teaching License exam. Total: 100 marks. Time: 2 hours.',
          'Section A: Content Knowledge (30 marks - 15 MCQs). Covers English, Urdu/Sindhi, Mathematics, Science, and Social Studies for Class 1-8 level.',
          'Section B: Psychometric Assessment (20 marks - 10 MCQs). Includes verbal reasoning, numerical reasoning, and abstract reasoning questions.',
          'Section C: Pedagogical Content Knowledge (50 marks - 25 MCQs). Covers teaching methodologies, classroom management, assessment, educational psychology, curriculum planning, and NPST.',
          'Passing criteria: Candidates must achieve the minimum passing score set by STEDA. Results are submitted to STEDA by the testing service, and STEDA conducts verification before issuing the license.',
          'Tip: Manage your time wisely. Spend approximately 1 minute per MCQ. Attempt easier questions first, then return to difficult ones. Read each question carefully and eliminate wrong answers before selecting.',
        ],
        questions: [
          { q: 'How many total MCQs are in this practice test?', options: ['40', '50', '60', '100'], answer: 1 },
          { q: 'Which section has the most questions?', options: ['Content Knowledge', 'Psychometric', 'Pedagogical Knowledge', 'All equal'], answer: 2 },
          { q: 'How many marks does the Psychometric section have?', options: ['15', '20', '25', '30'], answer: 1 },
          { q: 'What is the recommended time per MCQ?', options: ['30 seconds', '1 minute', '2 minutes', '5 minutes'], answer: 1 },
          { q: 'Who conducts the final verification before issuing a license?', options: ['IBA', 'STEDA', 'HEC', 'NACTE'], answer: 1 },
        ],
      },
      {
        id: 'pt2',
        title: 'Model Test 2 - Mixed Questions',
        content: [
          'Additional practice questions covering all sections of the STEDA Teaching License test.',
          'Content Knowledge questions: Identify the correct part of speech, solve a fraction problem, name a planet in the solar system, identify a historical event, correct a grammatical error.',
          'Psychometric questions: Complete number sequences, solve word problems, find analogies, interpret data from tables and graphs, identify patterns.',
          'Pedagogical Knowledge questions: Select the most appropriate teaching strategy, identify the correct assessment type, choose the best classroom management technique, apply educational psychology principles.',
          'Each practice test helps you identify areas of strength and weakness. Focus your study on sections where you score lower. Review explanations to understand correct answers.',
          'After completing all practice tests, you should be well-prepared for the actual STEDA Teaching License examination.',
        ],
        questions: [
          { q: '"Choose the correct spelling" falls under which domain?', options: ['Psychometric', 'Content Knowledge', 'Pedagogy', 'All'], answer: 1 },
          { q: 'Number sequences are part of which assessment?', options: ['Verbal', 'Numerical', 'Abstract', 'Spatial'], answer: 1 },
          { q: 'Selecting teaching strategy relates to which knowledge?', options: ['Content', 'Psychometric', 'Pedagogical', 'General'], answer: 2 },
          { q: 'What helps identify strengths and weaknesses?', options: ['Single test', 'Practice tests', 'Reading only', 'Group study'], answer: 1 },
          { q: 'STEDA license test preparation should focus on?', options: ['One subject', 'All sections', 'Only pedagogy', 'Only content'], answer: 1 },
        ],
      },
      {
        id: 'pt3',
        title: 'Model Test 3 - Rapid Fire',
        content: [
          'Quick 20-question rapid-fire round testing all areas. Time limit: 30 minutes. Score at least 40% to pass this practice round.',
          'Mix of questions from: Parts of speech, fraction operations, solar system facts, Pakistan history, teaching methods, classroom management, verbal analogies, and number sequences.',
          'Rapid-fire rounds help build speed and confidence. They simulate the pressure of the actual exam and train you to think quickly and accurately.',
          'Strategy: Read each question once. If unsure, eliminate obviously wrong options first. If still unsure, mark your best guess and move on. Don\'t leave any question unanswered unless there is negative marking.',
          'Review your answers after completing the round. Note which topics you found difficult and revise those areas before the next attempt.',
        ],
        questions: [
          { q: '"Happy" is an example of which part of speech?', options: ['Noun', 'Verb', 'Adjective', 'Adverb'], answer: 2 },
          { q: '1/2 + 1/4 = ?', options: ['1/6', '2/6', '3/4', '2/4'], answer: 2 },
          { q: 'Which planet is closest to the Sun?', options: ['Venus', 'Earth', 'Mercury', 'Mars'], answer: 2 },
          { q: 'Who was Pakistan\'s first Governor General?', options: ['Liaquat Ali Khan', 'Quaid-e-Azam', 'Sir Khawaja Nazimuddin', 'Iskander Mirza'], answer: 1 },
          { q: 'Direct instruction is best for teaching what?', options: ['Critical thinking', 'Facts and procedures', 'Creative writing', 'Group projects'], answer: 1 },
          { q: 'Which is a positive reinforcement strategy?', options: ['Punishment', 'Praise', 'Ignoring', 'Scolding'], answer: 1 },
        ],
      },
    ],
  },
  {
    id: 'curriculum-studies',
    title: 'Curriculum & Scheme of Studies',
    subtitle: 'Understanding the education curriculum framework in Pakistan and Sindh',
    icon: '📖',
    color: 'from-amber-500 to-yellow-600',
    chapters: [
      {
        id: 'curr1',
        title: 'National Curriculum Framework',
        content: [
          'Pakistan\'s education system follows a national curriculum framework developed by the Ministry of Federal Education and Professional Training. The curriculum specifies what students should learn at each grade level.',
          'Structure of Education: Pre-primary (age 3-4, optional), Primary (Grades 1-5, age 5-10), Middle (Grades 6-8, age 10-13), Secondary (Grades 9-10, age 14-15), Higher Secondary (Grades 11-12, age 16-17).',
          'Compulsory subjects (up to Middle level): English, Urdu, Mathematics, Science, Social Studies/Pakistan Studies, Islamic Studies (or Ethics for non-Muslims), and a regional language.',
          'Curriculum development process: Need assessment, drafting by subject experts, review by curriculum wing, pilot testing, approval by competent authority, implementation in schools. The curriculum is revised periodically to meet changing needs.',
          'Key documents: National Curriculum Documents for each subject, Textbook Boards develop textbooks based on the curriculum, Teacher Guides provide instructional support, and Assessment Frameworks guide examination design.',
          'The National Curriculum 2006 introduced major reforms: Outcome-based education, integration of knowledge, focus on higher-order thinking, and emphasis on values and character education.',
        ],
        questions: [
          { q: 'Primary education covers which grades?', options: ['1-3', '1-5', '1-8', '1-10'], answer: 1 },
          { q: 'How many stages are there in Pakistan\'s education structure?', options: ['3', '4', '5', '6'], answer: 2 },
          { q: 'What is the first step in curriculum development?', options: ['Approval', 'Drafting', 'Need assessment', 'Implementation'], answer: 2 },
          { q: 'Which year introduced major curriculum reforms?', options: ['2000', '2006', '2012', '2020'], answer: 1 },
          { q: 'Textbooks are based on what document?', options: ['Teacher Guide', 'National Curriculum', 'Exam Papers', 'School Policy'], answer: 1 },
        ],
      },
      {
        id: 'curr2',
        title: 'Teacher Education Curriculum',
        content: [
          'Teacher education programs in Pakistan include: Associate Degree in Education (ADE - 2 years), B.Ed (Hons - 4 years), B.Ed (1.5 years for already qualified graduates), M.Ed (Master in Education), and PhD in Education.',
          'The B.Ed curriculum includes: Foundations of Education, Educational Psychology, Curriculum Development, Classroom Management, Assessment and Evaluation, Teaching Methods for specific subjects, Research Methods in Education, and Practicum/Teaching Practice.',
          'B.Ed (1.5 year) program is designed for candidates who already hold a bachelor\'s degree. It focuses on professional teacher education including: Philosophy of Education, Sociology of Education, Comparative Education, Educational Leadership, and Specialization courses.',
          'Practicum is an essential component that includes: Observation of experienced teachers (Semester 3), Assisted teaching (Semester 3), Independent teaching (Semester 4), Portfolio development, and Reflective practice.',
          'HEC and NACTE provide accreditation and quality assurance for teacher education programs. STEDA accredits institutions offering teacher education programs in Sindh.',
          'The Scheme of Studies for B.Ed programs includes: 30% General/Core courses, 50% Professional courses, and 20% Teaching Practice. Total credit hours range from 64-130 depending on the program.',
        ],
        questions: [
          { q: 'B.Ed (Hons) is how many years?', options: ['2', '3', '4', '5'], answer: 2 },
          { q: 'B.Ed 1.5 year program is for which candidates?', options: ['Fresh students', 'Already graduates', 'Masters', 'PhD holders'], answer: 1 },
          { q: 'Which body accredits teacher education programs?', options: ['HEC', 'NACTE', 'STEDA', 'All of these'], answer: 3 },
          { q: 'Practicum includes all EXCEPT?', options: ['Observation', 'Assisted teaching', 'Independent teaching', 'Written exam'], answer: 3 },
          { q: 'What percentage of B.Ed is teaching practice?', options: ['10%', '20%', '30%', '50%'], answer: 1 },
        ],
      },
    ],
  },
];

function getTotalChapters(books: Book[]): number {
  return books.reduce((sum, b) => sum + b.chapters.length, 0);
}

function allQuestions(books: Book[]): { bookIndex: number; chapterIndex: number; item: QuizItem }[] {
  const result: { bookIndex: number; chapterIndex: number; item: QuizItem }[] = [];
  books.forEach((book, bi) => {
    book.chapters.forEach((ch, ci) => {
      ch.questions.forEach((item) => {
        result.push({ bookIndex: bi, chapterIndex: ci, item });
      });
    });
  });
  return result;
}

type ViewMode = 'books' | 'reading' | 'quiz' | 'mixed-test';

type FinalQuizItem = {
  q: string;
  options: string[];
  answer: number;
  bookTitle: string;
  chapterTitle: string;
  selected: number | null;
  isCorrect: boolean | null;
};

export default function StedaTeachingLicensePage() {
  const [bookIdx, setBookIdx] = useState(0);
  const [chapterIdx, setChapterIdx] = useState(0);
  const [mode, setMode] = useState<ViewMode>('books');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [mixedQuiz, setMixedQuiz] = useState<FinalQuizItem[]>([]);
  const [mixedIdx, setMixedIdx] = useState(0);
  const [mixedFinished, setMixedFinished] = useState(false);
  const [progress, setProgress] = useState<Record<string, { completed: number[]; quizScores: Record<string, number> }>>({});

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const book = books[bookIdx];
  const chapter = book?.chapters[chapterIdx];

  const markChapterComplete = useCallback(() => {
    const key = books[bookIdx].id;
    const chId = books[bookIdx].chapters[chapterIdx].id;
    setProgress((prev) => {
      const updated = { ...prev };
      if (!updated[key]) updated[key] = { completed: [], quizScores: {} };
      if (!updated[key].completed.includes(chapterIdx)) {
        updated[key].completed = [...updated[key].completed, chapterIdx];
      }
      saveProgress(updated);
      return updated;
    });
  }, [bookIdx, chapterIdx]);

  const updateQuizScore = useCallback((chId: string, qs: number) => {
    const key = books[bookIdx].id;
    setProgress((prev) => {
      const updated = { ...prev };
      if (!updated[key]) updated[key] = { completed: [], quizScores: {} };
      const existing = updated[key].quizScores[chId] || 0;
      if (qs > existing) {
        updated[key].quizScores[chId] = qs;
      }
      saveProgress(updated);
      return updated;
    });
  }, [bookIdx]);

  const completedChapters = progress[book?.id]?.completed || [];
  const quizScores = progress[book?.id]?.quizScores || {};
  const totalCompleted = Object.values(progress).reduce((s, v) => s + v.completed.length, 0);

  function startQuiz() {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
    setMode('quiz');
  }

  function handleAnswer(idx: number) {
    if (showResult) return;
    setSelectedOption(idx);
    setShowResult(true);
    if (idx === chapter.questions[currentQuestion].answer) {
      setScore((s) => s + 1);
    }
  }

  function nextQuestion() {
    if (currentQuestion < chapter.questions.length - 1) {
      setCurrentQuestion((c) => c + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      const chId = chapter.id;
      const finalScore = score;
      if (finalScore === chapter.questions.length) {
        markChapterComplete();
      }
      updateQuizScore(chId, finalScore);
      setMode('reading');
    }
  }

  function startMixedTest() {
    const all = allQuestions(books);
    const shuffled = all.sort(() => Math.random() - 0.5).slice(0, 20);
    const items: FinalQuizItem[] = shuffled.map((s) => ({
      q: s.item.q,
      options: s.item.options,
      answer: s.item.answer,
      bookTitle: books[s.bookIndex].title,
      chapterTitle: books[s.bookIndex].chapters[s.chapterIndex].title,
      selected: null,
      isCorrect: null,
    }));
    setMixedQuiz(items);
    setMixedIdx(0);
    setMixedFinished(false);
    setMode('mixed-test');
  }

  function handleMixedAnswer(idx: number) {
    if (mixedQuiz[mixedIdx].selected !== null) return;
    const updated = [...mixedQuiz];
    updated[mixedIdx] = { ...updated[mixedIdx], selected: idx, isCorrect: idx === updated[mixedIdx].answer };
    setMixedQuiz(updated);
  }

  function nextMixed() {
    if (mixedIdx < mixedQuiz.length - 1) {
      setMixedIdx((i) => i + 1);
    } else {
      setMixedFinished(true);
    }
  }

  const totalChapters = getTotalChapters(books);

  const bookProgress = useMemo(() => {
    return books.map((b) => {
      const p = progress[b.id];
      const completed = p?.completed?.length || 0;
      return { completed, total: b.chapters.length, percent: Math.round((completed / b.chapters.length) * 100) };
    });
  }, [progress]);

  if (mode === 'books') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Hero */}
          <section className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-lg backdrop-blur-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-2xl text-white shadow-lg">🎓</div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-500">Govt of Sindh</p>
                <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">STEDA Teaching License</h1>
              </div>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
              Complete learning and practice platform for the Sindh Teaching License examination. Study books, take quizzes, and track your progress.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link href="/educational-resources" className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50">← Resources</Link>
              <div className="inline-flex items-center gap-2 rounded-2xl bg-indigo-100 px-4 py-2 text-sm font-bold text-indigo-700">
                <span>📊</span> <span>{totalCompleted}/{totalChapters} chapters done</span>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="grid gap-4 sm:grid-cols-1">
            <button onClick={startMixedTest} className="group relative overflow-hidden rounded-3xl border border-white/50 bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-rose-500 to-pink-400" />
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-400 text-3xl text-white shadow-lg">🎯</div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Quick Mixed Test</h3>
                  <p className="mt-1 text-sm text-slate-500">20 random questions from all books & chapters</p>
                </div>
              </div>
            </button>
          </section>

          {/* Book Grid */}
          {books.map((b, bi) => {
            const bp = bookProgress[bi];
            return (
              <button key={b.id} onClick={() => { setBookIdx(bi); setChapterIdx(0); setMode('reading'); }} className="group relative w-full overflow-hidden rounded-3xl border border-white/50 bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl text-left">
                <div className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${b.color}`} />
                <div className="flex items-start gap-4">
                  <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${b.color} text-3xl text-white shadow-lg`}>{b.icon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600">{b.title}</h3>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{b.subtitle}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs font-semibold">
                      <span className="text-slate-400">{b.chapters.length} chapters</span>
                      <span className="text-slate-400">{b.chapters.reduce((s, c) => s + c.questions.length, 0)} questions</span>
                      <span className={`font-bold ${bp.percent === 100 ? 'text-emerald-600' : 'text-indigo-600'}`}>{bp.completed}/{bp.total} done</span>
                    </div>
                    {bp.total > 0 && (
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full bg-gradient-to-r ${b.color} transition-all`} style={{ width: `${bp.percent}%` }} />
                      </div>
                    )}
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">→</div>
                </div>
              </button>
            );
          })}

          {/* Overall Progress */}
          <section className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
            <h2 className="text-lg font-bold text-slate-900">📈 Your Progress</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-indigo-50 p-4 text-center">
                <div className="text-2xl font-black text-indigo-600">{totalCompleted}</div>
                <div className="text-xs font-semibold text-indigo-500">Chapters Done</div>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4 text-center">
                <div className="text-2xl font-black text-emerald-600">{totalChapters - totalCompleted}</div>
                <div className="text-xs font-semibold text-emerald-500">Remaining</div>
              </div>
              <div className="rounded-2xl bg-amber-50 p-4 text-center">
                <div className="text-2xl font-black text-amber-600">{totalChapters > 0 ? Math.round((totalCompleted / totalChapters) * 100) : 0}%</div>
                <div className="text-xs font-semibold text-amber-500">Complete</div>
              </div>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all" style={{ width: `${totalChapters > 0 ? (totalCompleted / totalChapters) * 100 : 0}%` }} />
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (mode === 'reading') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Top bar */}
          <section className="rounded-3xl border border-white/50 bg-white/80 p-4 shadow-lg backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button onClick={() => setMode('books')} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">← Books</button>
              <span className="text-sm font-bold text-slate-500">{book.icon} {book.title}</span>
              <div className="flex gap-2">
                {completedChapters.includes(chapterIdx) && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-600">✅ Done</span>}
              </div>
            </div>
            {/* Chapter navigation */}
            <div className="mt-3 flex flex-wrap gap-2">
              {book.chapters.map((ch, ci) => (
                <button key={ch.id} onClick={() => { setChapterIdx(ci); setShowResult(false); setSelectedOption(null); setCurrentQuestion(0); setScore(0); }}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${ci === chapterIdx ? 'bg-indigo-600 text-white shadow-md' : completedChapters.includes(ci) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {ch.title}
                </button>
              ))}
            </div>
          </section>

          {/* Chapter Content */}
          <section className="rounded-3xl border border-white/50 bg-white p-6 shadow-lg">
            <h2 className="text-xl font-black text-slate-900">{chapter.title}</h2>
            <div className="mt-4 space-y-4">
              {chapter.content.map((para, pi) => (
                <p key={pi} className="text-sm leading-7 text-slate-700">{para}</p>
              ))}
            </div>
          </section>

          {/* Actions */}
          <section className="rounded-3xl border border-white/50 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>📝 {chapter.questions.length} questions available</span>
                {quizScores[chapter.id] !== undefined && (
                  <span className="font-bold text-emerald-600">Best: {quizScores[chapter.id]}/{chapter.questions.length}</span>
                )}
              </div>
              <button onClick={startQuiz} className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-indigo-700 hover:shadow-xl">
                Start Chapter Quiz →
              </button>
            </div>
            <div className="mt-4 flex gap-3">
              {chapterIdx > 0 && (
                <button onClick={() => setChapterIdx((c) => c - 1)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">← Previous Chapter</button>
              )}
              {chapterIdx < book.chapters.length - 1 && (
                <button onClick={() => { setChapterIdx((c) => c + 1); setShowResult(false); setSelectedOption(null); setCurrentQuestion(0); setScore(0); }} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200">Next Chapter →</button>
              )}
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (mode === 'quiz') {
    const q = chapter.questions[currentQuestion];
    const isLast = currentQuestion === chapter.questions.length - 1;
    return (
      <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <section className="rounded-3xl border border-white/50 bg-white/80 p-4 shadow-lg backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button onClick={() => setMode('reading')} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">← Chapter</button>
              <span className="text-sm font-bold text-indigo-600">Quiz: {chapter.title}</span>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-600">Q {currentQuestion + 1}/{chapter.questions.length}</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${((currentQuestion + 1) / chapter.questions.length) * 100}%` }} />
            </div>
          </section>

          <section className="rounded-3xl border border-white/50 bg-white p-6 shadow-lg">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700">{currentQuestion + 1}</span>
              <h2 className="text-lg font-bold text-slate-900">{q.q}</h2>
            </div>
            <div className="mt-6 grid gap-3">
              {q.options.map((opt, oi) => {
                const isSelected = selectedOption === oi;
                const isCorrect = q.answer === oi;
                return (
                  <button key={oi} type="button" onClick={() => handleAnswer(oi)} disabled={showResult}
                    className={`w-full rounded-2xl border-2 p-4 text-left text-sm font-semibold transition-all ${showResult ? (isCorrect ? 'border-emerald-400 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200' : isSelected ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white text-slate-400 opacity-50') : 'border-slate-200 bg-white text-slate-800 hover:border-indigo-300 hover:bg-indigo-50'}`}>
                    <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold">{showResult ? (isCorrect ? '✅' : isSelected ? '❌' : '⭕') : String.fromCharCode(65 + oi)}</span>
                    {opt}
                  </button>
                );
              })}
            </div>
            {showResult && (
              <div className={`mt-4 rounded-2xl p-3 text-center text-sm font-bold ${selectedOption === q.answer ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {selectedOption === q.answer ? '✅ Correct!' : `❌ The correct answer is: ${q.options[q.answer]}`}
              </div>
            )}
            {showResult && (
              <button onClick={nextQuestion} className="mt-6 w-full rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-indigo-700">
                {isLast ? 'See Results' : 'Next Question →'}
              </button>
            )}
          </section>

          <footer className="text-center text-sm text-slate-500">
            Score: {score}/{showResult && isLast ? (currentQuestion + 1) : (selectedOption !== null ? currentQuestion + 1 : currentQuestion)}
          </footer>
        </div>
      </main>
    );
  }

  if (mode === 'mixed-test') {
    if (mixedFinished) {
      const correct = mixedQuiz.filter((m) => m.isCorrect).length;
      return (
        <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-6">
            <section className="rounded-3xl border border-white/50 bg-white p-8 shadow-lg text-center">
              <div className="text-6xl">{correct >= 14 ? '🎉' : correct >= 10 ? '💪' : '📚'}</div>
              <h2 className="mt-4 text-2xl font-black text-slate-900">Test Complete!</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-indigo-50 p-4">
                  <div className="text-3xl font-black text-indigo-600">{mixedQuiz.length}</div>
                  <div className="text-xs font-semibold text-indigo-500">Total Questions</div>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <div className="text-3xl font-black text-emerald-600">{correct}</div>
                  <div className="text-xs font-semibold text-emerald-500">Correct</div>
                </div>
                <div className="rounded-2xl bg-rose-50 p-4">
                  <div className="text-3xl font-black text-rose-600">{mixedQuiz.length - correct}</div>
                  <div className="text-xs font-semibold text-rose-500">Incorrect</div>
                </div>
              </div>
              <div className="mt-4 text-lg font-bold text-slate-700">
                Score: {Math.round((correct / mixedQuiz.length) * 100)}% - {correct >= 14 ? 'Excellent!' : correct >= 10 ? 'Good, keep practicing!' : 'Keep studying!'}
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button onClick={() => setMode('books')} className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">← Books</button>
                <button onClick={startMixedTest} className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-indigo-700">Try Again</button>
              </div>
              <div className="mt-6 text-left">
                <h3 className="mb-3 text-sm font-bold text-slate-700">Review Answers:</h3>
                <div className="space-y-3">
                  {mixedQuiz.map((m, mi) => (
                    <div key={mi} className={`rounded-2xl border p-4 text-sm ${m.isCorrect ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
                      <p className="font-bold text-slate-800">{mi + 1}. {m.q}</p>
                      <p className="mt-1 text-xs text-slate-500">From: {m.bookTitle} &gt; {m.chapterTitle}</p>
                      <p className="mt-1 text-xs font-semibold">Answer: {m.options[m.answer]}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </main>
      );
    }

    const mq = mixedQuiz[mixedIdx];
    return (
      <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <section className="rounded-3xl border border-white/50 bg-white/80 p-4 shadow-lg backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button onClick={() => setMode('books')} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">← Exit</button>
              <span className="text-sm font-bold text-rose-600">🎯 Mixed Test</span>
              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-600">Q {mixedIdx + 1}/{mixedQuiz.length}</span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-rose-500 transition-all" style={{ width: `${((mixedIdx + 1) / mixedQuiz.length) * 100}%` }} />
            </div>
          </section>

          <section className="rounded-3xl border border-white/50 bg-white p-6 shadow-lg">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-rose-100 text-sm font-bold text-rose-700">{mixedIdx + 1}</span>
              <h2 className="text-lg font-bold text-slate-900">{mq.q}</h2>
            </div>
            <div className="mt-6 grid gap-3">
              {mq.options.map((opt, oi) => {
                const isSelected = mq.selected === oi;
                const isCorrect = mq.answer === oi;
                return (
                  <button key={oi} type="button" onClick={() => handleMixedAnswer(oi)} disabled={mq.selected !== null}
                    className={`w-full rounded-2xl border-2 p-4 text-left text-sm font-semibold transition-all ${mq.selected !== null ? (isCorrect ? 'border-emerald-400 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200' : isSelected ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white text-slate-400 opacity-50') : 'border-slate-200 bg-white text-slate-800 hover:border-rose-300 hover:bg-rose-50'}`}>
                    <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold">{mq.selected !== null ? (isCorrect ? '✅' : isSelected ? '❌' : '⭕') : String.fromCharCode(65 + oi)}</span>
                    {opt}
                  </button>
                );
              })}
            </div>
            {mq.selected !== null && (
              <div className={`mt-4 rounded-2xl p-3 text-center text-sm font-bold ${mq.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {mq.isCorrect ? '✅ Correct!' : `❌ The correct answer is: ${mq.options[mq.answer]}`}
                <p className="mt-1 text-xs text-slate-500">From: {mq.bookTitle} &gt; {mq.chapterTitle}</p>
              </div>
            )}
            {mq.selected !== null && (
              <button onClick={nextMixed} className="mt-6 w-full rounded-2xl bg-rose-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-rose-700">
                {mixedIdx < mixedQuiz.length - 1 ? 'Next Question →' : 'See Results'}
              </button>
            )}
          </section>
        </div>
      </main>
    );
  }

  return null;
}
