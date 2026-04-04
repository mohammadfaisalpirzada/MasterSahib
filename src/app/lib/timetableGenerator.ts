export type TeacherInput = {
  id: string;
  name: string;
  subject: string;
  allowedClasses?: string[];
};

export type TimeSlot = {
  id: string;
  periodNumber: number;
  start: string;
  end: string;
  label: string;
};

export type SlotAssignment = {
  teacherId: string;
  teacherName: string;
  subject: string;
  className: string;
};

export type TimetableGrid = Record<string, Record<string, Record<string, SlotAssignment | null>>>;

export type TeacherSummary = {
  teacherId: string;
  teacherName: string;
  subject: string;
  periods: number;
};

export type GeneratedTimetable = {
  days: string[];
  slots: TimeSlot[];
  classSections: string[];
  timetable: TimetableGrid;
  teacherSummary: TeacherSummary[];
  unassignedSlots: number;
};

export type CellPosition = {
  day: string;
  slotId: string;
};

export type TimetableImportResult = {
  teachers: TeacherInput[];
  classSections: string[];
};

const FIVE_DAY_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const SIX_DAY_WEEK = [...FIVE_DAY_WEEK, 'Saturday'];

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

const toTimeLabel = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`;
};

const normalizeText = (value: unknown) => String(value ?? '').trim();

const getRowValue = (row: Record<string, unknown>, aliases: string[]) => {
  const normalizedAliases = aliases.map((alias) => alias.trim().toLowerCase());
  const match = Object.entries(row).find(([key]) => normalizedAliases.includes(key.trim().toLowerCase()));
  return match?.[1];
};

const parseAllowedClasses = (value: unknown) =>
  normalizeText(value)
    .split(/[\n,;|]+/)
    .map((item) => item.trim())
    .filter(Boolean);

export const parseTimetableImportRows = (rows: Record<string, unknown>[]): TimetableImportResult => {
  if (!rows.length) {
    throw new Error('The Excel file is empty. Add teacher rows and try again.');
  }

  const teacherMap = new Map<string, TeacherInput>();
  const classSet = new Set<string>();

  rows.forEach((row, index) => {
    const name = normalizeText(getRowValue(row, ['name', 'teacher', 'teacher name', 'teacher_name']));
    const subject = normalizeText(getRowValue(row, ['subject', 'course', 'teacher subject']));
    const allowedClasses = parseAllowedClasses(
      getRowValue(row, ['classes', 'class', 'section', 'class/section', 'allowed classes', 'allowed_classes']),
    );

    allowedClasses.forEach((item) => classSet.add(item));

    if (!name && !subject) {
      return;
    }

    if (!name || !subject) {
      return;
    }

    const mapKey = `${name.toLowerCase()}::${subject.toLowerCase()}`;
    const existing = teacherMap.get(mapKey);

    if (existing) {
      existing.allowedClasses = Array.from(new Set([...(existing.allowedClasses ?? []), ...allowedClasses]));
      return;
    }

    teacherMap.set(mapKey, {
      id: `import-${index + 1}-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      subject,
      allowedClasses,
    });
  });

  const teachers = Array.from(teacherMap.values());

  if (!teachers.length) {
    throw new Error('No valid teacher rows were found. Use Excel columns like Name, Subject, and Classes.');
  }

  return {
    teachers,
    classSections: Array.from(classSet),
  };
};

export const getWorkingDays = (workingDays: number) => (workingDays === 6 ? SIX_DAY_WEEK : FIVE_DAY_WEEK);

export const buildTimeSlots = (startTime: string, endTime: string, periodDuration: number): TimeSlot[] => {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);

  if (!startTime || !endTime || end <= start) {
    throw new Error('Please set a valid school start and end time.');
  }

  if (!periodDuration || periodDuration < 20) {
    throw new Error('Period duration should be at least 20 minutes.');
  }

  const slots: TimeSlot[] = [];
  let current = start;
  let periodNumber = 1;

  while (current + periodDuration <= end) {
    const next = current + periodDuration;
    slots.push({
      id: `period-${periodNumber}`,
      periodNumber,
      start: toTimeLabel(current),
      end: toTimeLabel(next),
      label: `${toTimeLabel(current)} - ${toTimeLabel(next)}`,
    });

    current = next;
    periodNumber += 1;
  }

  if (!slots.length) {
    throw new Error('No periods could be created. Increase school timing or reduce period duration.');
  }

  return slots;
};

const createEmptyGrid = (classSections: string[], days: string[], slots: TimeSlot[]) =>
  Object.fromEntries(
    classSections.map((className) => [
      className,
      Object.fromEntries(
        days.map((day) => [
          day,
          Object.fromEntries(slots.map((slot) => [slot.id, null])),
        ]),
      ),
    ]),
  ) as TimetableGrid;

const classDayAssignedCount = (grid: TimetableGrid, className: string, day: string) =>
  Object.values(grid[className]?.[day] ?? {}).filter(Boolean).length;

const hasTeacherConflict = (
  grid: TimetableGrid,
  classSections: string[],
  excludedClass: string,
  day: string,
  slotId: string,
  teacherId: string,
) =>
  classSections.some(
    (className) => className !== excludedClass && grid[className]?.[day]?.[slotId]?.teacherId === teacherId,
  );

export const generateSmartTimetable = (input: {
  teachers: TeacherInput[];
  classSections: string[];
  startTime: string;
  endTime: string;
  periodDuration: number;
  workingDays: 5 | 6;
}): GeneratedTimetable => {
  const teachers = input.teachers
    .map((teacher, index) => ({
      id: teacher.id || `teacher-${index + 1}`,
      name: teacher.name.trim(),
      subject: teacher.subject.trim(),
      allowedClasses: (teacher.allowedClasses ?? []).map((item) => item.trim()).filter(Boolean),
    }))
    .filter((teacher) => teacher.name && teacher.subject);

  const classSections = input.classSections.map((item) => item.trim()).filter(Boolean);

  if (!teachers.length) {
    throw new Error('Please add at least one teacher before generating the timetable.');
  }

  if (!classSections.length) {
    throw new Error('Please add at least one class/section before generating the timetable.');
  }

  const days = getWorkingDays(input.workingDays);
  const slots = buildTimeSlots(input.startTime, input.endTime, input.periodDuration);
  const timetable = createEmptyGrid(classSections, days, slots);

  const teacherLoad = new Map(teachers.map((teacher) => [teacher.id, 0]));
  const teacherDailyLoad = new Map<string, number>();
  const teacherLastSlot = new Map<string, number>();
  let unassignedSlots = 0;

  // Step 1: Fill each class/day/period while preventing teacher overlap in the same slot.
  days.forEach((day) => {
    slots.forEach((slot, slotIndex) => {
      const busyTeachers = new Set<string>();
      const orderedClasses = [...classSections].sort(
        (first, second) => classDayAssignedCount(timetable, first, day) - classDayAssignedCount(timetable, second, day),
      );

      orderedClasses.forEach((className) => {
        const previousSlot = slotIndex > 0 ? timetable[className][day][slots[slotIndex - 1].id] : null;

        const rankedTeacher = teachers
          .filter((teacher) => !busyTeachers.has(teacher.id))
          .filter((teacher) => teacher.allowedClasses.length === 0 || teacher.allowedClasses.includes(className))
          .map((teacher) => {
            const dailyKey = `${teacher.id}-${day}`;
            const totalLoad = teacherLoad.get(teacher.id) ?? 0;
            const dailyLoad = teacherDailyLoad.get(dailyKey) ?? 0;
            const lastSlotIndex = teacherLastSlot.get(dailyKey);
            const continuityBonus = lastSlotIndex === slotIndex - 1 ? -1.15 : 0;
            const gapPenalty = typeof lastSlotIndex === 'number' && lastSlotIndex < slotIndex - 1 ? 0.8 : 0;
            const repeatPenalty = previousSlot?.teacherId === teacher.id ? 0.9 : 0;
            const score = totalLoad * 1.25 + dailyLoad * 0.65 + gapPenalty + repeatPenalty + continuityBonus + Math.random() * 0.2;

            return { teacher, score };
          })
          .sort((first, second) => first.score - second.score)[0];

        if (!rankedTeacher) {
          unassignedSlots += 1;
          return;
        }

        const dailyKey = `${rankedTeacher.teacher.id}-${day}`;
        timetable[className][day][slot.id] = {
          teacherId: rankedTeacher.teacher.id,
          teacherName: rankedTeacher.teacher.name,
          subject: rankedTeacher.teacher.subject,
          className,
        };

        busyTeachers.add(rankedTeacher.teacher.id);
        teacherLoad.set(rankedTeacher.teacher.id, (teacherLoad.get(rankedTeacher.teacher.id) ?? 0) + 1);
        teacherDailyLoad.set(dailyKey, (teacherDailyLoad.get(dailyKey) ?? 0) + 1);
        teacherLastSlot.set(dailyKey, slotIndex);
      });
    });
  });

  return {
    days,
    slots,
    classSections,
    timetable,
    teacherSummary: teachers
      .map((teacher) => ({
        teacherId: teacher.id,
        teacherName: teacher.name,
        subject: teacher.subject,
        periods: teacherLoad.get(teacher.id) ?? 0,
      }))
      .sort((first, second) => first.periods - second.periods || first.teacherName.localeCompare(second.teacherName)),
    unassignedSlots,
  };
};

export const swapTimetableCells = (
  schedule: GeneratedTimetable,
  className: string,
  first: CellPosition,
  second: CellPosition,
) => {
  const nextSchedule = structuredClone(schedule) as GeneratedTimetable;
  const firstCell = nextSchedule.timetable[className]?.[first.day]?.[first.slotId] ?? null;
  const secondCell = nextSchedule.timetable[className]?.[second.day]?.[second.slotId] ?? null;

  if (firstCell?.teacherId && hasTeacherConflict(nextSchedule.timetable, nextSchedule.classSections, className, second.day, second.slotId, firstCell.teacherId)) {
    return {
      ok: false,
      schedule,
      message: `${firstCell.teacherName} is already busy in that destination period for another class.`,
    };
  }

  if (secondCell?.teacherId && hasTeacherConflict(nextSchedule.timetable, nextSchedule.classSections, className, first.day, first.slotId, secondCell.teacherId)) {
    return {
      ok: false,
      schedule,
      message: `${secondCell.teacherName} is already busy in that destination period for another class.`,
    };
  }

  nextSchedule.timetable[className][first.day][first.slotId] = secondCell;
  nextSchedule.timetable[className][second.day][second.slotId] = firstCell;

  return {
    ok: true,
    schedule: nextSchedule,
    message: 'Schedule updated successfully with a manual swap.',
  };
};
