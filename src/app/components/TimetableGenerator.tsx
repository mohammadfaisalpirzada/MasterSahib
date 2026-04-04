'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import {
  HiDownload,
  HiPlus,
  HiPrinter,
  HiRefresh,
  HiSparkles,
  HiTrash,
  HiUpload,
} from 'react-icons/hi';

import {
  buildTimeSlots,
  generateSmartTimetable,
  parseTimetableImportRows,
  swapTimetableCells,
  type CellPosition,
  type GeneratedTimetable,
  type TeacherInput,
} from '@/app/lib/timetableGenerator';

const starterTeachers: TeacherInput[] = [
  { id: 't-1', name: 'Sir Hamza', subject: 'Mathematics', allowedClasses: ['Class 9-A', 'Class 10-A'] },
  { id: 't-2', name: 'Miss Areeba', subject: 'English', allowedClasses: ['Class 9-B', 'Class 10-A'] },
  { id: 't-3', name: 'Sir Bilal', subject: 'Science', allowedClasses: ['Class 9-A', 'Class 9-B'] },
  { id: 't-4', name: 'Miss Sana', subject: 'Urdu', allowedClasses: ['Class 9-B', 'Class 10-A'] },
  { id: 't-5', name: 'Sir Ahmed', subject: 'Computer', allowedClasses: ['Class 9-A', 'Class 9-B', 'Class 10-A'] },
];

const starterClasses = ['Class 9-A', 'Class 9-B', 'Class 10-A'];

export default function TimetableGenerator() {
  const [teachers, setTeachers] = useState<TeacherInput[]>(starterTeachers);
  const [classSections, setClassSections] = useState<string[]>(starterClasses);
  const [teacherName, setTeacherName] = useState('');
  const [teacherSubject, setTeacherSubject] = useState('');
  const [teacherAllowedClasses, setTeacherAllowedClasses] = useState<string[]>([]);
  const [classInput, setClassInput] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('13:30');
  const [periodDuration, setPeriodDuration] = useState(40);
  const [workingDays, setWorkingDays] = useState<5 | 6>(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [schedule, setSchedule] = useState<GeneratedTimetable | null>(null);
  const [activeClass, setActiveClass] = useState('');
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [statusMessage, setStatusMessage] = useState(
    'Add teachers and classes, then click generate to build a conflict-free school timetable.',
  );

  const slotPreview = useMemo(() => {
    try {
      return buildTimeSlots(startTime, endTime, periodDuration);
    } catch {
      return [];
    }
  }, [endTime, periodDuration, startTime]);

  const addTeacher = () => {
    const name = teacherName.trim();
    const subject = teacherSubject.trim();

    if (!name || !subject) {
      setStatusMessage('Please enter both teacher name and subject.');
      return;
    }

    setTeachers((current) => [
      ...current,
      {
        id:
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `teacher-${Date.now()}`,
        name,
        subject,
        allowedClasses: teacherAllowedClasses,
      },
    ]);
    setTeacherName('');
    setTeacherSubject('');
    setTeacherAllowedClasses([]);
    setStatusMessage(`${name} added successfully.`);
  };

  const addClassSection = () => {
    const value = classInput.trim();

    if (!value) {
      setStatusMessage('Please enter a class or section name.');
      return;
    }

    if (classSections.includes(value)) {
      setStatusMessage(`${value} already exists in the list.`);
      return;
    }

    setClassSections((current) => [...current, value]);
    setClassInput('');
    setStatusMessage(`${value} added successfully.`);
  };

  const removeTeacher = (id: string) => {
    setTeachers((current) => current.filter((teacher) => teacher.id !== id));
  };

  const toggleTeacherAllowedClass = (teacherId: string, className: string) => {
    setTeachers((current) =>
      current.map((teacher) => {
        if (teacher.id !== teacherId) {
          return teacher;
        }

        const currentAllowed = teacher.allowedClasses ?? [];
        return {
          ...teacher,
          allowedClasses: currentAllowed.includes(className)
            ? currentAllowed.filter((item) => item !== className)
            : [...currentAllowed, className],
        };
      }),
    );
  };

  const removeClassSection = (value: string) => {
    setClassSections((current) => current.filter((item) => item !== value));
  };

  const handleExcelUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const firstSheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '' });
      const imported = parseTimetableImportRows(rows);

      setTeachers((current) => {
        const merged = [...current];

        imported.teachers.forEach((incoming) => {
          const existingIndex = merged.findIndex(
            (teacher) =>
              teacher.name.trim().toLowerCase() === incoming.name.trim().toLowerCase() &&
              teacher.subject.trim().toLowerCase() === incoming.subject.trim().toLowerCase(),
          );

          if (existingIndex >= 0) {
            const existing = merged[existingIndex];
            merged[existingIndex] = {
              ...existing,
              allowedClasses: Array.from(
                new Set([...(existing.allowedClasses ?? []), ...(incoming.allowedClasses ?? [])]),
              ),
            };
            return;
          }

          merged.push(incoming);
        });

        return merged;
      });

      setClassSections((current) => Array.from(new Set([...current, ...imported.classSections])));
      setStatusMessage(
        `Excel imported successfully: ${imported.teachers.length} teachers and ${imported.classSections.length} classes added.`,
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : 'Unable to import the Excel file right now.',
      );
    } finally {
      event.target.value = '';
    }
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setSelectedCell(null);
      setStatusMessage('Generating the timetable with overlap checks and balanced teacher load...');

      await new Promise((resolve) => setTimeout(resolve, 900));

      const generated = generateSmartTimetable({
        teachers,
        classSections,
        startTime,
        endTime,
        periodDuration,
        workingDays,
      });

      setSchedule(generated);
      setActiveClass(generated.classSections[0] ?? '');
      setStatusMessage(
        `Timetable ready for ${generated.classSections.length} classes with ${generated.slots.length} periods per day.`,
      );
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to generate the timetable right now.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCellClick = (day: string, slotId: string) => {
    if (!schedule || !activeClass) {
      return;
    }

    if (!selectedCell) {
      setSelectedCell({ day, slotId });
      setStatusMessage('First slot selected. Now click another slot in the same class to swap it.');
      return;
    }

    if (selectedCell.day === day && selectedCell.slotId === slotId) {
      setSelectedCell(null);
      setStatusMessage('Selection cleared.');
      return;
    }

    const result = swapTimetableCells(schedule, activeClass, selectedCell, { day, slotId });
    setSchedule(result.schedule);
    setSelectedCell(null);
    setStatusMessage(result.message);
  };

  const handleDownloadPdf = () => {
    if (!schedule || !activeClass) {
      setStatusMessage('Generate a timetable first before downloading the PDF.');
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const firstColumnWidth = 30;
    const headerHeight = 12;
    const rowHeight = 18;
    const slotColumnWidth = (pageWidth - margin * 2 - firstColumnWidth) / schedule.slots.length;
    let y = 15;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`Smart School Timetable - ${activeClass}`, margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(
      `Generated by TheMasterSahib | ${schedule.days.length} days | ${schedule.slots.length} periods`,
      margin,
      y,
    );
    y += 8;

    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(30, 64, 175);
    doc.setTextColor(255, 255, 255);
    doc.rect(margin, y, firstColumnWidth, headerHeight, 'F');
    doc.text('Day / Period', margin + 2, y + 7);

    schedule.slots.forEach((slot, index) => {
      const x = margin + firstColumnWidth + index * slotColumnWidth;
      doc.rect(x, y, slotColumnWidth, headerHeight, 'F');
      doc.text(`P${slot.periodNumber}`, x + 2, y + 5);
      doc.text(slot.start, x + 2, y + 10);
    });

    y += headerHeight;
    doc.setTextColor(15, 23, 42);

    schedule.days.forEach((day) => {
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, firstColumnWidth, rowHeight, 'F');
      doc.rect(margin, y, firstColumnWidth, rowHeight);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(day, margin + 2, y + 8);

      schedule.slots.forEach((slot, index) => {
        const x = margin + firstColumnWidth + index * slotColumnWidth;
        const cell = schedule.timetable[activeClass][day][slot.id];

        doc.rect(x, y, slotColumnWidth, rowHeight);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(cell?.teacherName || 'Free', x + 2, y + 6, {
          maxWidth: slotColumnWidth - 4,
        });

        if (cell?.subject) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.text(cell.subject, x + 2, y + 11, {
            maxWidth: slotColumnWidth - 4,
          });
        }
      });

      y += rowHeight;
    });

    doc.save(`${activeClass.replace(/\s+/g, '-')}-timetable.pdf`);
  };

  const currentGrid = schedule && activeClass ? schedule.timetable[activeClass] : null;

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 print-surface">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Data Input</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">Teacher + Class Setup</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setTeachers(starterTeachers);
                setClassSections(starterClasses);
                setStatusMessage('Starter demo data restored.');
              }}
              className="no-print inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <HiRefresh className="h-4 w-4" />
              Reset Demo
            </button>
          </div>

          <div className="mb-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50/70 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">Import from Excel</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Upload an <code>.xlsx</code>, <code>.xls</code>, or <code>.csv</code> file with columns like
                  <strong> Name</strong>, <strong>Subject</strong>, and <strong>Classes</strong>.
                </p>
              </div>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
                <HiUpload className="h-4 w-4" />
                Upload Excel File
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleExcelUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-900">Add Teacher</p>
              <div className="mt-3 space-y-3">
                <input
                  type="text"
                  value={teacherName}
                  onChange={(event) => setTeacherName(event.target.value)}
                  placeholder="Teacher name"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                />
                <input
                  type="text"
                  value={teacherSubject}
                  onChange={(event) => setTeacherSubject(event.target.value)}
                  placeholder="Subject"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                />
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Assign Classes</p>
                  <div className="flex flex-wrap gap-2">
                    {classSections.map((item) => {
                      const active = teacherAllowedClasses.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() =>
                            setTeacherAllowedClasses((current) =>
                              current.includes(item) ? current.filter((value) => value !== item) : [...current, item],
                            )
                          }
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                            active
                              ? 'bg-blue-600 text-white'
                              : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">Leave all unselected if the teacher can teach every class.</p>
                </div>
                <button
                  type="button"
                  onClick={addTeacher}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  <HiPlus className="h-4 w-4" />
                  Add Teacher
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-900">Add Class / Section</p>
              <div className="mt-3 space-y-3">
                <input
                  type="text"
                  value={classInput}
                  onChange={(event) => setClassInput(event.target.value)}
                  placeholder="Class 9-A"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                />
                <button
                  type="button"
                  onClick={addClassSection}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  <HiPlus className="h-4 w-4" />
                  Add Class
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-bold text-slate-900">Teachers</p>
              <p className="mt-1 text-xs text-slate-500">Select which classes each teacher can teach. If none are selected, that teacher can teach all classes.</p>
              <div className="mt-3 space-y-2">
                {teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{teacher.name}</p>
                      <p className="text-xs text-slate-600">{teacher.subject}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {classSections.map((item) => {
                          const active = (teacher.allowedClasses ?? []).includes(item);
                          return (
                            <button
                              key={`${teacher.id}-${item}`}
                              type="button"
                              onClick={() => toggleTeacherAllowedClass(teacher.id, item)}
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                                active
                                  ? 'bg-blue-600 text-white'
                                  : 'border border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {item}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTeacher(teacher.id)}
                      className="no-print rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100"
                      aria-label={`Remove ${teacher.name}`}
                    >
                      <HiTrash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm font-bold text-slate-900">Classes / Sections</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {classSections.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeClassSection(item)}
                      className="no-print text-rose-500 transition hover:text-rose-700"
                      aria-label={`Remove ${item}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 print-surface">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">School Timing</p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">Smart Generator Settings</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-800">Start Time</span>
              <input
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-800">End Time</span>
              <input
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-800">Period Duration (minutes)</span>
              <input
                type="number"
                min={20}
                max={90}
                value={periodDuration}
                onChange={(event) => setPeriodDuration(Number(event.target.value) || 40)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-800">Working Days</span>
              <select
                value={workingDays}
                onChange={(event) => setWorkingDays(Number(event.target.value) as 5 | 6)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
              >
                <option value={5}>Monday to Friday</option>
                <option value={6}>Monday to Saturday</option>
              </select>
            </label>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-900">Period Preview</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {slotPreview.map((slot) => (
                <span
                  key={slot.id}
                  className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                >
                  P{slot.periodNumber}: {slot.start}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3 no-print">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isGenerating ? <HiRefresh className="h-4 w-4 animate-spin" /> : <HiSparkles className="h-4 w-4" />}
              {isGenerating ? 'Generating...' : 'Generate Smart Timetable'}
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <HiDownload className="h-4 w-4" />
              Download PDF
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <HiPrinter className="h-4 w-4" />
              Print Schedule
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 print-surface">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Interactive Dashboard</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">Weekly Timetable Grid</h2>
            <p className="mt-2 text-sm text-slate-600">
              Click one slot and then another to manually swap teachers without breaking overlap rules.
            </p>
          </div>

          {schedule ? (
            <div className="flex flex-wrap gap-2">
              {schedule.classSections.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setActiveClass(item);
                    setSelectedCell(null);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeClass === item
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {statusMessage}
        </div>

        {schedule && currentGrid ? (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 min-w-[140px] border border-slate-200 bg-slate-100 px-3 py-3 text-sm font-bold text-slate-900">
                    Day / Time
                  </th>
                  {schedule.slots.map((slot) => (
                    <th
                      key={slot.id}
                      className="min-w-[170px] border border-slate-200 bg-slate-100 px-3 py-3 text-sm font-bold text-slate-900"
                    >
                      <span className="block">Period {slot.periodNumber}</span>
                      <span className="mt-1 block text-xs font-medium text-slate-600">{slot.label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedule.days.map((day) => (
                  <tr key={day}>
                    <th className="sticky left-0 z-10 border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-900">
                      {day}
                    </th>
                    {schedule.slots.map((slot) => {
                      const assignment = currentGrid[day][slot.id];
                      const isSelected = selectedCell?.day === day && selectedCell?.slotId === slot.id;

                      return (
                        <td key={`${day}-${slot.id}`} className="border border-slate-200 bg-white p-2 align-top">
                          <button
                            type="button"
                            onClick={() => handleCellClick(day, slot.id)}
                            className={`h-full min-h-[92px] w-full rounded-2xl border px-3 py-3 text-left transition ${
                              isSelected
                                ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-200'
                                : assignment
                                  ? 'border-slate-200 bg-slate-50 hover:border-slate-300'
                                  : 'border-dashed border-slate-300 bg-white hover:border-slate-400'
                            }`}
                          >
                            {assignment ? (
                              <>
                                <span className="block text-sm font-bold text-slate-900">{assignment.teacherName}</span>
                                <span className="mt-1 block text-xs font-semibold uppercase tracking-wide text-blue-700">
                                  {assignment.subject}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm font-semibold text-slate-500">Free Slot</span>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
            Your generated timetable will appear here in a clean weekly grid.
          </div>
        )}
      </section>

      {schedule ? (
        <section className="grid gap-4 lg:grid-cols-[0.9fr,1.1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 print-surface">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Summary</p>
            <h3 className="mt-1 text-xl font-black text-slate-900">Teacher Load Balance</h3>
            <div className="mt-4 space-y-2">
              {schedule.teacherSummary.map((item) => (
                <div
                  key={item.teacherId}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.teacherName}</p>
                    <p className="text-xs text-slate-600">{item.subject}</p>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                    {item.periods} periods
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 print-surface">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Smart Notes</p>
            <h3 className="mt-1 text-xl font-black text-slate-900">Scheduling Logic</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              <li>• No teacher is placed in two classes during the same period.</li>
              <li>• Lower-loaded teachers are prioritized to keep the weekly workload balanced.</li>
              <li>• Adjacent period preference helps reduce idle gaps for teachers where possible.</li>
              <li>• You can manually swap any two slots in the same class table with one click + one click.</li>
              <li>• Unassigned slots: <strong>{schedule.unassignedSlots}</strong></li>
            </ul>
          </div>
        </section>
      ) : null}

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }

          body {
            background: #ffffff !important;
          }

          .print-surface {
            box-shadow: none !important;
            border-color: #cbd5e1 !important;
          }
        }
      `}</style>
    </div>
  );
}
