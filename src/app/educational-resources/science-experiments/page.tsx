'use client';

import { useState } from 'react';
import Link from 'next/link';

type Difficulty = 'Easy' | 'Medium' | 'Hard';
type Category = 'Physics' | 'Chemistry' | 'Biology';

type Experiment = {
  name: string;
  category: Category;
  difficulty: Difficulty;
  emoji: string;
  materials: string[];
  steps: string[];
};

const experiments: Experiment[] = [
  {
    name: 'Baking Soda Volcano',
    category: 'Chemistry',
    difficulty: 'Easy',
    emoji: '\uD83C\uDF0B',
    materials: ['Baking soda', 'Vinegar', 'Dish soap', 'Food coloring', 'Container'],
    steps: ['Place container on a tray.', 'Add 2 tbsp baking soda.', 'Add a squirt of dish soap and food coloring.', 'Pour vinegar and watch it erupt!'],
  },
  {
    name: 'Walking Water',
    category: 'Physics',
    difficulty: 'Easy',
    emoji: '\uD83D\uDCA7',
    materials: ['Paper towels', 'Food coloring', '7 glasses', 'Water'],
    steps: ['Line up 7 glasses.', 'Fill alternate glasses with water.', 'Add different food coloring to water glasses.', 'Fold paper towels and bridge each pair of glasses.'],
  },
  {
    name: 'Magic Milk',
    category: 'Chemistry',
    difficulty: 'Easy',
    emoji: '\uD83E\uDD5B',
    materials: ['Milk', 'Food coloring', 'Dish soap', 'Cotton swab', 'Plate'],
    steps: ['Pour milk into a plate.', 'Drop food coloring on top.', 'Dip cotton swab in dish soap.', 'Touch the milk surface and watch colors swirl.'],
  },
  {
    name: 'Invisible Ink',
    category: 'Chemistry',
    difficulty: 'Easy',
    emoji: '\uD83D\uDCDD',
    materials: ['Lemon juice', 'Paper', 'Cotton swab', 'Lamp or candle'],
    steps: ['Squeeze lemon juice into a bowl.', 'Dip cotton swab and write on paper.', 'Let it dry completely.', 'Hold near heat source to reveal the message.'],
  },
  {
    name: 'Balloon Rocket',
    category: 'Physics',
    difficulty: 'Easy',
    emoji: '\uD83C\uDF89',
    materials: ['Balloon', 'String', 'Straw', 'Tape'],
    steps: ['Thread string through a straw.', 'Tie string between two chairs.', 'Blow up balloon and tape it to the straw.', 'Release and watch it zoom!'],
  },
  {
    name: 'Rain Cloud in a Jar',
    category: 'Physics',
    difficulty: 'Easy',
    emoji: '\u2601\uFE0F',
    materials: ['Glass jar', 'Shaving cream', 'Food coloring', 'Water'],
    steps: ['Fill jar 3/4 with water.', 'Spray shaving cream on top (cloud).', 'Drop blue food coloring on the cloud.', 'Watch "rain" fall through the cloud.'],
  },
  {
    name: 'Static Butterfly',
    category: 'Physics',
    difficulty: 'Easy',
    emoji: '\uD83E\uDD8B',
    materials: ['Tissue paper', 'Balloon', 'Wool cloth'],
    steps: ['Cut a butterfly shape from tissue paper.', 'Rub balloon with wool cloth.', 'Hold balloon near the butterfly.', 'Watch it flutter and dance!'],
  },
  {
    name: 'Grow Gummy Bears',
    category: 'Biology',
    difficulty: 'Easy',
    emoji: '\uD83D\uDC3B',
    materials: ['Gummy bears', 'Water', 'Salt water', 'Baking soda water', 'Bowls'],
    steps: ['Fill 3 bowls with different liquids.', 'Drop a gummy bear in each.', 'Wait 24 hours.', 'Compare how much they grew!'],
  },
  {
    name: 'DIY Lava Lamp',
    category: 'Chemistry',
    difficulty: 'Medium',
    emoji: '\uD83D\uDCA1',
    materials: ['Bottle', 'Vegetable oil', 'Water', 'Food coloring', 'Alka-Seltzer'],
    steps: ['Fill bottle 1/4 with water.', 'Fill rest with oil.', 'Add food coloring drops.', 'Drop in Alka-Seltzer and watch bubbles.'],
  },
  {
    name: 'Magnetic Slime',
    category: 'Physics',
    difficulty: 'Medium',
    emoji: '\uD83E\uDEAA',
    materials: ['White glue', 'Liquid starch', 'Iron oxide powder', 'Magnet'],
    steps: ['Mix glue and iron oxide powder.', 'Add liquid starch and stir.', 'Knead until slime forms.', 'Bring a magnet close to move it!'],
  },
  {
    name: 'Crystal Snowflakes',
    category: 'Chemistry',
    difficulty: 'Medium',
    emoji: '\u2744\uFE0F',
    materials: ['Pipe cleaners', 'Borax', 'String', 'Boiling water', 'Jar'],
    steps: ['Shape pipe cleaner into a snowflake.', 'Tie string and suspend in jar.', 'Mix borax into boiling water until dissolved.', 'Pour into jar and wait overnight.'],
  },
  {
    name: 'Egg in a Bottle',
    category: 'Physics',
    difficulty: 'Medium',
    emoji: '\uD83E\uDD5A',
    materials: ['Hard-boiled egg', 'Glass bottle', 'Paper', 'Matches'],
    steps: ['Peel the hard-boiled egg.', 'Light a small paper on fire.', 'Drop burning paper into bottle.', 'Place egg on top and watch it get sucked in.'],
  },
  {
    name: 'Fingerprint Detective',
    category: 'Biology',
    difficulty: 'Medium',
    emoji: '\uD83D\uDD75\uFE0F',
    materials: ['Mirror or glass', 'Baby powder', 'Tape', 'Dark paper'],
    steps: ['Press finger on a clean glass.', 'Dust baby powder over the print.', 'Gently brush off excess powder.', 'Lift print with tape and stick on dark paper.'],
  },
  {
    name: 'Penny Battery',
    category: 'Physics',
    difficulty: 'Hard',
    emoji: '\uD83D\uDD0B',
    materials: ['Copper pennies', 'Zinc washers', 'Salt', 'Vinegar', 'Paper towels', 'LED', 'Wire'],
    steps: ['Soak paper in vinegar-salt mix.', 'Stack: penny, paper, washer, repeat.', 'Leave wire at top and bottom.', 'Touch LED leads to both ends to light it.'],
  },
  {
    name: 'Extract DNA from Strawberry',
    category: 'Biology',
    difficulty: 'Hard',
    emoji: '\uD83C\uDF53',
    materials: ['Strawberries', 'Dish soap', 'Salt', 'Rubbing alcohol', 'Ziplock bag', 'Strainer'],
    steps: ['Mash strawberries in a bag.', 'Mix soap, salt, and water.', 'Add to bag and mix gently.', 'Strain and pour rubbing alcohol on top to see DNA.'],
  },
];

const categoryIcons: Record<Category, string> = {
  Physics: '\u2699\uFE0F',
  Chemistry: '\uD83E\uDDEA',
  Biology: '\uD83C\uDF31',
};

const difficultyColors: Record<Difficulty, string> = {
  Easy: 'bg-emerald-100 text-emerald-700',
  Medium: 'bg-amber-100 text-amber-700',
  Hard: 'bg-rose-100 text-rose-700',
};

export default function ScienceExperimentsPage() {
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = activeCategory === 'All' ? experiments : experiments.filter((e) => e.category === activeCategory);
  const categories: (Category | 'All')[] = ['All', 'Physics', 'Chemistry', 'Biology'];

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/educational-resources" className="mb-6 inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900">
          &larr; Back
        </Link>

        <div className="mb-2 flex items-center gap-3">
          <span className="text-3xl">{'\uD83D\uDD2C'}</span>
          <h1 className="text-3xl font-black sm:text-4xl">Science Experiments</h1>
        </div>
        <p className="mb-6 text-slate-600">Fun experiments for ages 7&ndash;12 using household items. Click a card to see the steps.</p>

        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setExpanded(null); }}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400'
              }`}
            >
              {cat !== 'All' && <span className="mr-1">{categoryIcons[cat]}</span>}
              {cat}
            </button>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((exp) => {
            const isOpen = expanded === exp.name;
            return (
              <div
                key={exp.name}
                onClick={() => setExpanded(isOpen ? null : exp.name)}
                className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between">
                  <span className="text-2xl">{exp.emoji}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${difficultyColors[exp.difficulty]}`}>
                    {exp.difficulty}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{exp.name}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{exp.category}</p>
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Materials:</p>
                  <ul className="mt-1 flex flex-wrap gap-1.5">
                    {exp.materials.map((m) => (
                      <li key={m} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{m}</li>
                    ))}
                  </ul>
                </div>
                {isOpen && (
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Steps:</p>
                    <ol className="space-y-2">
                      {exp.steps.map((step, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-700">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">{i + 1}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                <p className="mt-3 text-xs font-semibold text-slate-400">
                  {isOpen ? 'Click to collapse' : 'Click to see steps'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
