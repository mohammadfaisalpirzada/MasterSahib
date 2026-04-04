export type WeekendPattern = 'sunday-only' | 'saturday-sunday';

export type AcademicCalendarFormValues = {
  schoolName: string;
  academicYear: number;
  country: string;
  province: string;
  sessionStart: string;
  sessionEnd: string;
  weekendPattern: WeekendPattern;
  summerStart: string;
  summerEnd: string;
  winterStart: string;
  winterEnd: string;
  customHolidays: string;
};

export type AcademicHolidayEntry = {
  date: string;
  label: string;
  category: 'National' | 'Provincial' | 'Regional' | 'Season Break' | 'Custom';
  note?: string;
};

export type AcademicCalendarResult = {
  summary: {
    totalDays: number;
    weekendDays: number;
    holidayDays: number;
    breakDays: number;
    workingDays: number;
  };
  holidays: AcademicHolidayEntry[];
  vacationRanges: Array<{
    title: string;
    start: string;
    end: string;
  }>;
  monthSnapshot: Array<{
    monthLabel: string;
    workingDays: number;
    daysOff: number;
  }>;
  notes: string[];
};

export const countryOptions = ['Pakistan', 'Other'] as const;

export const pakistanProvinceOptions = [
  'Federal / ICT',
  'Sindh',
  'Punjab',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Gilgit-Baltistan',
  'Azad Jammu & Kashmir',
] as const;

const pakistanFixedHolidays = [
  { month: 2, day: 5, label: 'Kashmir Day', category: 'National' as const },
  { month: 3, day: 23, label: 'Pakistan Day', category: 'National' as const },
  { month: 5, day: 1, label: 'Labour Day', category: 'National' as const },
  { month: 8, day: 14, label: 'Independence Day', category: 'National' as const },
  { month: 11, day: 9, label: 'Iqbal Day', category: 'National' as const },
  { month: 12, day: 25, label: 'Quaid-e-Azam Day / Christmas', category: 'National' as const },
];

const pakistanEstimatedIslamicHolidays: Record<number, AcademicHolidayEntry[]> = {
  2025: [
    { date: '2025-03-31', label: 'Eid ul Fitr (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
    { date: '2025-04-01', label: 'Eid ul Fitr Holiday (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
    { date: '2025-06-07', label: 'Eid ul Adha (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
    { date: '2025-06-08', label: 'Eid ul Adha Holiday (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
    { date: '2025-07-06', label: 'Ashura (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
    { date: '2025-07-07', label: 'Ashura Holiday (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
    { date: '2025-09-05', label: 'Eid Milad-un-Nabi (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
  ],
  2026: [
    { date: '2026-03-20', label: 'Eid ul Fitr (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
    { date: '2026-03-21', label: 'Eid ul Fitr Holiday (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
    { date: '2026-05-27', label: 'Eid ul Adha (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
    { date: '2026-05-28', label: 'Eid ul Adha Holiday (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
    { date: '2026-06-26', label: 'Ashura (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
    { date: '2026-06-27', label: 'Ashura Holiday (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
    { date: '2026-09-26', label: 'Eid Milad-un-Nabi (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
  ],
  2027: [
    { date: '2027-03-10', label: 'Eid ul Fitr (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
    { date: '2027-03-11', label: 'Eid ul Fitr Holiday (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
    { date: '2027-05-17', label: 'Eid ul Adha (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
    { date: '2027-05-18', label: 'Eid ul Adha Holiday (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
    { date: '2027-06-16', label: 'Ashura (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
    { date: '2027-06-17', label: 'Ashura Holiday (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
    { date: '2027-09-15', label: 'Eid Milad-un-Nabi (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
  ],
  2028: [
    { date: '2028-02-27', label: 'Eid ul Fitr (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
    { date: '2028-02-28', label: 'Eid ul Fitr Holiday (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
    { date: '2028-05-05', label: 'Eid ul Adha (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
    { date: '2028-05-06', label: 'Eid ul Adha Holiday (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
    { date: '2028-06-04', label: 'Ashura (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
    { date: '2028-06-05', label: 'Ashura Holiday (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
    { date: '2028-09-03', label: 'Eid Milad-un-Nabi (Estimated)', category: 'National', note: 'Subject to moon sighting and official notification.' },
  ],
};

const provinceNotes: Record<string, string> = {
  Sindh: 'Sindh school vacation dates can be adjusted by the School Education & Literacy Department.',
  Punjab: 'Punjab vacation notifications can be updated by the School Education Department.',
  'Khyber Pakhtunkhwa': 'KP school calendars may change through provincial education notifications.',
  Balochistan: 'Balochistan school schedules can vary through provincial announcements.',
  'Federal / ICT': 'Federal and ICT schools may follow separate notification dates for vacations and closures.',
  'Gilgit-Baltistan': 'Gilgit-Baltistan may revise winter timing according to weather conditions.',
  'Azad Jammu & Kashmir': 'AJK institutions may adjust closure schedules through local authority notifications.',
};

function toIsoDate(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatIsoLocalDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function toDate(isoDate: string) {
  return new Date(`${isoDate}T00:00:00`);
}

function isValidIsoDate(isoDate: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(isoDate) && !Number.isNaN(toDate(isoDate).getTime());
}

function enumerateDates(startDate: string, endDate: string) {
  if (!isValidIsoDate(startDate) || !isValidIsoDate(endDate)) {
    return [] as string[];
  }

  const start = toDate(startDate);
  const end = toDate(endDate);

  if (start > end) {
    return [] as string[];
  }

  const dates: string[] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    dates.push(formatIsoLocalDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

function isDateWithinRange(date: string, startDate: string, endDate: string) {
  return date >= startDate && date <= endDate;
}

function sortHolidayEntries(entries: AcademicHolidayEntry[]) {
  return [...entries].sort((left, right) => {
    if (left.date === right.date) {
      return left.label.localeCompare(right.label);
    }

    return left.date.localeCompare(right.date);
  });
}

function parseCustomHolidays(input: string) {
  return input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const [datePart, ...labelParts] = line.split('|').map((item) => item.trim());
      if (!isValidIsoDate(datePart) || labelParts.length === 0) {
        return [] as AcademicHolidayEntry[];
      }

      return [
        {
          date: datePart,
          label: labelParts.join(' | '),
          category: 'Custom' as const,
        },
      ];
    });
}

function getPakistanHolidayEntries(startYear: number, endYear: number) {
  const holidays: AcademicHolidayEntry[] = [];

  for (let year = startYear; year <= endYear; year += 1) {
    pakistanFixedHolidays.forEach((holiday) => {
      holidays.push({
        date: toIsoDate(year, holiday.month, holiday.day),
        label: holiday.label,
        category: holiday.category,
      });
    });

    (pakistanEstimatedIslamicHolidays[year] || []).forEach((holiday) => {
      holidays.push(holiday);
    });
  }

  return holidays;
}

function getWeekendDayCount(dates: string[], weekendPattern: WeekendPattern) {
  return dates.filter((date) => {
    const dayIndex = toDate(date).getDay();
    return weekendPattern === 'sunday-only' ? dayIndex === 0 : dayIndex === 0 || dayIndex === 6;
  }).length;
}

export function formatCalendarDate(date: string) {
  if (!isValidIsoDate(date)) {
    return date;
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(toDate(date));
}

export function formatWeekday(date: string) {
  if (!isValidIsoDate(date)) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(toDate(date));
}

export function generateAcademicCalendar(
  values: AcademicCalendarFormValues,
  locationHolidayEntries: AcademicHolidayEntry[] = [],
): AcademicCalendarResult {
  const sessionDates = enumerateDates(values.sessionStart, values.sessionEnd);
  const startYear = Number(values.sessionStart.slice(0, 4));
  const endYear = Number(values.sessionEnd.slice(0, 4));

  const holidayMap = new Map<string, AcademicHolidayEntry>();

  const nationalEntries = values.country === 'Pakistan' ? getPakistanHolidayEntries(startYear, endYear) : [];
  nationalEntries
    .filter((item) => isDateWithinRange(item.date, values.sessionStart, values.sessionEnd))
    .forEach((item) => {
      holidayMap.set(`${item.date}-${item.label}`, item);
    });

  locationHolidayEntries
    .filter((item) => isDateWithinRange(item.date, values.sessionStart, values.sessionEnd))
    .forEach((item) => {
      holidayMap.set(`${item.date}-${item.label}`, item);
    });

  parseCustomHolidays(values.customHolidays)
    .filter((item) => isDateWithinRange(item.date, values.sessionStart, values.sessionEnd))
    .forEach((item) => {
      holidayMap.set(`${item.date}-${item.label}`, item);
    });

  const vacationRanges = [
    {
      title: 'Summer Vacation',
      start: values.summerStart,
      end: values.summerEnd,
    },
    {
      title: 'Winter Vacation',
      start: values.winterStart,
      end: values.winterEnd,
    },
  ].filter((item) => isValidIsoDate(item.start) && isValidIsoDate(item.end) && item.start <= item.end);

  vacationRanges.forEach((range) => {
    if (isDateWithinRange(range.start, values.sessionStart, values.sessionEnd)) {
      holidayMap.set(`${range.start}-${range.title}`, {
        date: range.start,
        label: range.title,
        category: 'Season Break',
        note: `${formatCalendarDate(range.start)} to ${formatCalendarDate(range.end)}`,
      });
    }
  });

  const weekendDays = getWeekendDayCount(sessionDates, values.weekendPattern);

  const holidayDateSet = new Set<string>(
    [...holidayMap.values()].filter((item) => item.category !== 'Season Break').map((item) => item.date),
  );

  const breakDateSet = new Set<string>(
    vacationRanges.flatMap((range) =>
      enumerateDates(range.start, range.end).filter((date) => isDateWithinRange(date, values.sessionStart, values.sessionEnd)),
    ),
  );

  const excludedDates = new Set<string>();

  sessionDates.forEach((date) => {
    const dayIndex = toDate(date).getDay();
    const isWeekend = values.weekendPattern === 'sunday-only' ? dayIndex === 0 : dayIndex === 0 || dayIndex === 6;

    if (isWeekend || holidayDateSet.has(date) || breakDateSet.has(date)) {
      excludedDates.add(date);
    }
  });

  const monthSummaryMap = new Map<string, { workingDays: number; daysOff: number }>();
  sessionDates.forEach((date) => {
    const monthLabel = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric',
    }).format(toDate(date));

    const current = monthSummaryMap.get(monthLabel) || { workingDays: 0, daysOff: 0 };
    if (excludedDates.has(date)) {
      current.daysOff += 1;
    } else {
      current.workingDays += 1;
    }
    monthSummaryMap.set(monthLabel, current);
  });

  const notes = [
    `${values.schoolName || 'Your school'} academic session: ${formatCalendarDate(values.sessionStart)} to ${formatCalendarDate(values.sessionEnd)}.`,
    `Location: ${values.country}${values.province ? `, ${values.province}` : ''}.`,
    ...vacationRanges.map((range) => `${range.title}: ${formatCalendarDate(range.start)} to ${formatCalendarDate(range.end)}.`),
  ];

  if (values.country === 'Pakistan') {
    notes.push('Estimated Islamic public holidays can shift slightly according to moon sighting and official government notification.');
  }

  if (provinceNotes[values.province]) {
    notes.push(provinceNotes[values.province]);
  }

  if (values.country !== 'Pakistan') {
    notes.push('For countries outside Pakistan, use the custom holidays box to add your national or local public holidays.');
  }

  return {
    summary: {
      totalDays: sessionDates.length,
      weekendDays,
      holidayDays: holidayDateSet.size,
      breakDays: breakDateSet.size,
      workingDays: sessionDates.length - excludedDates.size,
    },
    holidays: sortHolidayEntries([...holidayMap.values()]).filter((item) =>
      isDateWithinRange(item.date, values.sessionStart, values.sessionEnd),
    ),
    vacationRanges,
    monthSnapshot: Array.from(monthSummaryMap.entries()).map(([monthLabel, value]) => ({
      monthLabel,
      workingDays: value.workingDays,
      daysOff: value.daysOff,
    })),
    notes,
  };
}
