export interface NumberItem {
  num: number;
  word: string;
  category: 'unit' | 'teen' | 'tens' | 'compound' | 'hundred';
  isKeySpelling: boolean;
  tip?: string;
  syllables?: string;
}

const ONES: Record<number, string> = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
  10: 'ten',
  11: 'eleven',
  12: 'twelve',
};

const TEENS: Record<number, string> = {
  13: 'thirteen',
  14: 'fourteen',
  15: 'fifteen',
  16: 'sixteen',
  17: 'seventeen',
  18: 'eighteen',
  19: 'nineteen',
};

const TENS: Record<number, string> = {
  20: 'twenty',
  30: 'thirty',
  40: 'forty',
  50: 'fifty',
  60: 'sixty',
  70: 'seventy',
  80: 'eighty',
  90: 'ninety',
};

// Key spelling tips & tricky alerts for learners
const TIPS: Record<number, { tip: string; syllables: string }> = {
  1: { tip: 'Starts with silent O sound (pronounced "wun").', syllables: 'one' },
  2: { tip: 'Has a silent W (pronounced "too").', syllables: 'two' },
  3: { tip: 'Starts with TH and ends with double E.', syllables: 'three' },
  4: { tip: 'Notice the OU spelling ("four").', syllables: 'four' },
  5: { tip: 'Silent E at the end makes the I say its name.', syllables: 'five' },
  8: { tip: 'Has silent GH (pronounced "ate").', syllables: 'eight' },
  11: { tip: 'Two L sounds: e-lev-en.', syllables: 'e-lev-en' },
  12: { tip: 'Notice the LV spelling: twelve.', syllables: 'twelve' },
  13: { tip: 'Uses "thir-" instead of three: thir-teen.', syllables: 'thir-teen' },
  14: { tip: 'Keeps "four": four-teen.', syllables: 'four-teen' },
  15: { tip: 'Important: uses "fif-" not "five": fif-teen!', syllables: 'fif-teen' },
  18: { tip: 'Notice: only one T (eight + een = eighteen, not eightteen).', syllables: 'eigh-teen' },
  19: { tip: 'Keeps the silent E from nine: nine-teen.', syllables: 'nine-teen' },
  20: { tip: 'Base word for 20s: twen-ty.', syllables: 'twen-ty' },
  30: { tip: 'Uses "thir-": thir-ty.', syllables: 'thir-ty' },
  40: { tip: 'CRITICAL TRICK: "forty" has NO "u" (not fourty)!', syllables: 'for-ty' },
  50: { tip: 'Uses "fif-" just like fifteen: fif-ty (not fivety).', syllables: 'fif-ty' },
  80: { tip: 'Notice: only one T (eight + y = eighty, not eightty).', syllables: 'eigh-ty' },
  90: { tip: 'Keeps the E: nine-ty.', syllables: 'nine-ty' },
  100: { tip: 'Century number: one hundred (hun-dred).', syllables: 'one hun-dred' },
};

export function getNumberWord(n: number): string {
  if (n <= 12) return ONES[n];
  if (n <= 19) return TEENS[n];
  if (n % 10 === 0 && n < 100) return TENS[n];
  if (n === 100) return 'one hundred';
  const ten = Math.floor(n / 10) * 10;
  const unit = n % 10;
  return `${TENS[ten]}-${ONES[unit]}`;
}

export function buildAllNumbers(): NumberItem[] {
  const list: NumberItem[] = [];
  for (let i = 1; i <= 100; i++) {
    const word = getNumberWord(i);
    let category: NumberItem['category'] = 'compound';
    let isKey = false;

    if (i <= 12) {
      category = 'unit';
      isKey = true;
    } else if (i <= 19) {
      category = 'teen';
      isKey = true;
    } else if (i % 10 === 0 && i < 100) {
      category = 'tens';
      isKey = true;
    } else if (i === 100) {
      category = 'hundred';
      isKey = true;
    }

    const tipData = TIPS[i];
    list.push({
      num: i,
      word,
      category,
      isKeySpelling: isKey,
      tip: tipData?.tip,
      syllables: tipData?.syllables || word,
    });
  }
  return list;
}

export const ALL_NUMBERS = buildAllNumbers();

// 1 to 19 (Unit + Teens) - foundational base words
export const KEY_1_TO_19 = ALL_NUMBERS.filter((n) => n.num <= 19);

// Tens building blocks: 20, 30, 40, 50, 60, 70, 80, 90, 100
export const KEY_TENS = ALL_NUMBERS.filter((n) => n.num % 10 === 0);

// Key tricky spellings that kids often misspell in school exams
export const TRICKY_SPELLINGS = ALL_NUMBERS.filter((n) => [4, 8, 12, 13, 14, 15, 18, 19, 40, 50, 80, 90, 100].includes(n.num));
