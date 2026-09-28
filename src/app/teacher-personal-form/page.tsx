'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  HiOutlineSearch,
  HiOutlineLockClosed,
  HiOutlineLockOpen,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlinePencilAlt,
  HiOutlineCheckCircle,
  HiOutlinePrinter,
  HiOutlineArrowLeft,
  HiOutlineRefresh,
  HiOutlineShieldCheck,
  HiOutlineExclamationCircle,
  HiOutlineInformationCircle,
} from 'react-icons/hi';
import { TeacherListItem, TeacherRecordData } from '@/app/lib/teacherPersonalRecords';

export default function TeacherPersonalFormPage() {
  // Directory & Dropdown state
  const [teachersList, setTeachersList] = useState<TeacherListItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRowNumber, setSelectedRowNumber] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Authentication & Verification state
  const [personalNumberInput, setPersonalNumberInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  // Verified record & Session state
  const [viewToken, setViewToken] = useState<string>('');
  const [record, setRecord] = useState<TeacherRecordData | null>(null);

  // Edit Security Re-verification Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [reverifyPasswordInput, setReverifyPasswordInput] = useState('');
  const [showReverifyPassword, setShowReverifyPassword] = useState(false);
  const [reverifying, setReverifying] = useState(false);
  const [reverifyError, setReverifyError] = useState('');

  // Edit Mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editToken, setEditToken] = useState<string>('');
  const [formData, setFormData] = useState<TeacherRecordData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load teachers dropdown list on mount
  const fetchTeachers = async () => {
    try {
      setLoadingList(true);
      setVerifyError('');
      const res = await fetch('/api/teacher-personal-form?mode=list');
      const data = await res.json();
      if (data.success && Array.isArray(data.teachers)) {
        setTeachersList(data.teachers);
      } else {
        setVerifyError(data.message || 'اساتذہ کی لسٹ لوڈ کرنے میں خرابی پیش آئی۔');
      }
    } catch {
      setVerifyError('سرور سے رابطہ نہ ہو سکا۔ برائے مہربانی انٹرنیٹ کنکشن چیک کریں۔');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered teachers list for dropdown search
  const filteredTeachers = useMemo(() => {
    if (!searchQuery.trim()) return teachersList;
    const q = searchQuery.toLowerCase();
    return teachersList.filter(
      (t) => t.name.toLowerCase().includes(q) || String(t.sr_no).includes(q)
    );
  }, [teachersList, searchQuery]);

  const selectedTeacher = useMemo(() => {
    if (!selectedRowNumber) return null;
    return teachersList.find((t) => t.rowNumber === selectedRowNumber) || null;
  }, [teachersList, selectedRowNumber]);

  // Handle Verify & View Record
  const handleVerifyAccess = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedRowNumber) {
      setVerifyError('برائے مہربانی پہلے ڈراپ ڈاؤن لسٹ سے اپنا نام منتخب کریں۔');
      return;
    }
    if (!personalNumberInput.trim()) {
      setVerifyError('برائے مہربانی اپنا پرسنل نمبر (Password) درج کریں۔');
      return;
    }

    try {
      setVerifying(true);
      setVerifyError('');
      const res = await fetch('/api/teacher-personal-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          rowNumber: selectedRowNumber,
          personalNumber: personalNumberInput.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.record) {
        setViewToken(data.token);
        setRecord(data.record);
        setFormData(data.record);
        setIsEditMode(false);
        setIsEditModalOpen(false);
      } else {
        setVerifyError(data.message || 'پرسنل نمبر درست نہیں ہے۔ دوبارہ کوشش کریں۔');
      }
    } catch {
      setVerifyError('تصدیق کے عمل میں خرابی پیش آئی۔ براہ کرم دوبارہ کوشش کریں۔');
    } finally {
      setVerifying(false);
    }
  };

  // Open Re-verification modal for Editing
  const handleOpenEditModal = () => {
    setReverifyPasswordInput('');
    setReverifyError('');
    setIsEditModalOpen(true);
  };

  // Handle Re-verification to unlock Edit mode
  const handleConfirmEditReverify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!record || !viewToken) return;
    if (!reverifyPasswordInput.trim()) {
      setReverifyError('برائے مہربانی تصدیق کے لیے اپنا پرسنل نمبر دوبارہ درج کریں۔');
      return;
    }

    try {
      setReverifying(true);
      setReverifyError('');
      const res = await fetch('/api/teacher-personal-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reverify-edit',
          rowNumber: record.rowNumber,
          personalNumber: reverifyPasswordInput.trim(),
          viewToken,
        }),
      });

      const data = await res.json();
      if (data.success && data.editToken) {
        setEditToken(data.editToken);
        setFormData({ ...record });
        setIsEditMode(true);
        setIsEditModalOpen(false);
      } else {
        setReverifyError(data.message || 'پاس ورڈ (پرسنل نمبر) درست نہیں ہے۔');
      }
    } catch {
      setReverifyError('تصدیق کے دوران ایرر آیا۔ براہ کرم دوبارہ کوشش کریں۔');
    } finally {
      setReverifying(false);
    }
  };

  // Handle Input Change in Edit Form
  const handleFieldChange = (field: keyof TeacherRecordData, value: string) => {
    if (!formData) return;
    setFormData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  // Handle Save Changes to Google Sheet
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !editToken || !record) return;

    try {
      setSaving(true);
      setSaveMessage(null);
      const res = await fetch('/api/teacher-personal-form', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowNumber: record.rowNumber,
          editToken,
          data: formData,
        }),
      });

      const data = await res.json();
      if (data.success && data.record) {
        setRecord(data.record);
        setFormData(data.record);
        setIsEditMode(false);
        setSaveMessage({
          type: 'success',
          text: 'تبدیلیاں گوگل شیٹ میں کامیابی سے محفوظ کر دی گئی ہیں!',
        });
        setTimeout(() => setSaveMessage(null), 5000);
      } else {
        setSaveMessage({
          type: 'error',
          text: data.message || 'ریکارڈ محفوظ کرنے میں ناکامی ہوئی۔',
        });
      }
    } catch {
      setSaveMessage({
        type: 'error',
        text: 'محفوظ کرنے کے دوران ایرر آیا۔ انٹرنیٹ کنکشن چیک کریں۔',
      });
    } finally {
      setSaving(false);
    }
  };

  // Cancel Edit Mode
  const handleCancelEdit = () => {
    if (record) {
      setFormData({ ...record });
    }
    setIsEditMode(false);
  };

  // Lock / Logout current session
  const handleLogout = () => {
    setRecord(null);
    setFormData(null);
    setViewToken('');
    setEditToken('');
    setIsEditMode(false);
    setPersonalNumberInput('');
    setVerifyError('');
  };

  // Print slip
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-indigo-50/30 text-slate-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between no-print">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900 bg-white/80 hover:bg-white px-3 py-1.5 rounded-lg border border-teal-200/80 shadow-sm transition"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            <span>مرکزی صفحہ (Home)</span>
          </Link>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
            محفوظ ڈیٹا پورٹل (Secure Portal)
          </span>
        </div>

        {/* Portal Title Banner */}
        <header className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/90 text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="inline-flex p-3 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 mb-3 shadow-inner">
            <HiOutlineShieldCheck className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            اساتذہ کا ذاتی کوائف و تقرری تصدیق فارم
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl mx-auto">
            Teacher Personal Data &amp; Appointment Verification Form
          </p>
          <p className="text-xs sm:text-sm text-teal-700 mt-1 font-medium bg-teal-50/70 inline-block px-3 py-1 rounded-full border border-teal-200/50">
            🔒 صرف اپنے پرسنل نمبر (Password) کی تصدیق کے بعد ہی اپنا ریکارڈ دیکھ یا تبدیل کر سکتے ہیں۔
          </p>
        </header>

        {/* Save/Error Notification Banner */}
        {saveMessage && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold transition ${
              saveMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'bg-rose-50 text-rose-800 border border-rose-300'
            }`}
          >
            {saveMessage.type === 'success' ? (
              <HiOutlineCheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            ) : (
              <HiOutlineExclamationCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
            )}
            <span>{saveMessage.text}</span>
          </div>
        )}

        {/* Step 1: Teacher Selection & Verification Box (Hidden in print if record is viewed) */}
        {!record && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <HiOutlineLockClosed className="w-5 h-5 text-teal-600" />
                <span>مرحلہ 1: اپنا نام منتخب کریں اور پرسنل نمبر درج کریں</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select your name from the dropdown and enter your Personal Number as password.
              </p>
            </div>

            <form onSubmit={handleVerifyAccess} className="space-y-5">
              {/* Dropdown Menu for Name Selection */}
              <div className="space-y-1.5" ref={dropdownRef}>
                <label className="block text-sm font-semibold text-slate-700">
                  استاد کا نام منتخب کریں (Select Teacher Name) <span className="text-rose-500">*</span>
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={loadingList}
                    className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-300 text-left px-4 py-3 rounded-xl flex items-center justify-between text-sm transition focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <span className={selectedTeacher ? 'font-bold text-slate-900' : 'text-slate-400'}>
                      {selectedTeacher
                        ? `${selectedTeacher.sr_no}. ${selectedTeacher.name}`
                        : loadingList
                        ? 'اساتذہ کی فہرست لوڈ ہو رہی ہے...'
                        : 'فہرست میں سے نام چنیں (Click to select name)...'}
                    </span>
                    <span className="ml-2 text-slate-400">▼</span>
                  </button>

                  {/* Dropdown Popover */}
                  {isDropdownOpen && (
                    <div className="absolute z-30 mt-1 w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in-50 zoom-in-95">
                      {/* Search inside dropdown */}
                      <div className="p-2 border-b border-slate-100 bg-slate-50">
                        <div className="relative">
                          <HiOutlineSearch className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="نام تلاش کریں (Search name)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 bg-white"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* List options */}
                      <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                        {filteredTeachers.length === 0 ? (
                          <div className="p-3 text-center text-xs text-slate-500">
                            کوئی استاد نہیں ملا (No matches found)
                          </div>
                        ) : (
                          filteredTeachers.map((t) => (
                            <button
                              key={t.rowNumber}
                              type="button"
                              onClick={() => {
                                setSelectedRowNumber(t.rowNumber);
                                setIsDropdownOpen(false);
                                setVerifyError('');
                              }}
                              className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between hover:bg-teal-50/80 transition ${
                                selectedRowNumber === t.rowNumber
                                  ? 'bg-teal-50 font-bold text-teal-900 border-l-4 border-teal-600'
                                  : 'text-slate-700'
                              }`}
                            >
                              <span>{t.name}</span>
                              <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                #{t.sr_no}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Password (Personal Number) Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-slate-700">
                    پرسنل نمبر درج کریں (Enter Personal Number / PID) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs text-teal-600 font-medium">
                    (آپ کا پاس ورڈ آپ کا پرسنل نمبر ہے)
                  </span>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="مثال: 10455151"
                    value={personalNumberInput}
                    onChange={(e) => {
                      setPersonalNumberInput(e.target.value);
                      setVerifyError('');
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <HiOutlineEyeOff className="w-5 h-5" />
                    ) : (
                      <HiOutlineEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {verifyError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
                  <HiOutlineExclamationCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{verifyError}</span>
                </div>
              )}

              {/* Verify Button */}
              <button
                type="submit"
                disabled={verifying || loadingList || !selectedRowNumber}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm transition flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
              >
                {verifying ? (
                  <>
                    <HiOutlineRefresh className="w-5 h-5 animate-spin" />
                    <span>تصدیق کی جا رہی ہے...</span>
                  </>
                ) : (
                  <>
                    <HiOutlineShieldCheck className="w-5 h-5" />
                    <span>ریکارڈ دیکھیں (View My Record)</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Teacher Record Display (View Mode & Edit Mode) */}
        {record && (
          <div className="space-y-6">
            {/* Top Action Bar */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3 no-print">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold text-slate-800">
                  خوش آمدید: {record.name}
                </span>
                <span className="text-xs bg-teal-100 text-teal-800 font-mono px-2 py-0.5 rounded-full font-semibold">
                  PID: {record.pid_no}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Print Button */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition cursor-pointer"
                >
                  <HiOutlinePrinter className="w-4 h-4 text-slate-500" />
                  <span>پرنٹ فارم (Print)</span>
                </button>

                {/* Edit Button (if in view mode) */}
                {!isEditMode && (
                  <button
                    type="button"
                    onClick={handleOpenEditModal}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                  >
                    <HiOutlinePencilAlt className="w-4 h-4" />
                    <span>کوائف میں تبدیلی (Edit Record)</span>
                  </button>
                )}

                {/* Logout / Switch teacher */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
                >
                  <HiOutlineLockClosed className="w-4 h-4" />
                  <span>لاگ آؤٹ (Lock Session)</span>
                </button>
              </div>
            </div>

            {/* Read-Only Official Display Mode */}
            {!isEditMode && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header card for the report */}
                <div className="bg-gradient-to-r from-teal-700 to-cyan-800 text-white p-6 sm:p-7">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <span className="text-xs font-semibold tracking-wider uppercase text-teal-200">
                        Official Verification Dossier
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black mt-0.5">{record.name}</h2>
                      <p className="text-xs sm:text-sm text-teal-100 mt-1">
                        ولدیت / زوجیت: {record.father_name || '—'}
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 sm:text-right">
                      <div className="text-[11px] uppercase tracking-wider text-teal-200 font-semibold">
                        پرسنل نمبر (PID No)
                      </div>
                      <div className="text-lg font-mono font-bold">{record.pid_no || '—'}</div>
                      <div className="text-[11px] text-teal-200 font-mono mt-0.5">
                        CNIC: {record.cnic_no || '—'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detail Information Grid */}
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* SR No */}
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        1. SR No.
                      </div>
                      <div className="text-sm font-bold text-slate-900 mt-1">
                        {record.sr_no || '—'}
                      </div>
                    </div>

                    {/* Name */}
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        2. Name (استاد کا نام)
                      </div>
                      <div className="text-sm font-bold text-slate-900 mt-1">
                        {record.name || '—'}
                      </div>
                    </div>

                    {/* Father Name */}
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        3. Father Name (ولدیت)
                      </div>
                      <div className="text-sm font-semibold text-slate-900 mt-1">
                        {record.father_name || '—'}
                      </div>
                    </div>

                    {/* CNIC No */}
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        4. CNIC No (شناختی کارڈ نمبر)
                      </div>
                      <div className="text-sm font-mono font-bold text-slate-900 mt-1">
                        {record.cnic_no || '—'}
                      </div>
                    </div>

                    {/* PID No */}
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        5. PID No. (پرسنل نمبر)
                      </div>
                      <div className="text-sm font-mono font-bold text-teal-700 mt-1">
                        {record.pid_no || '—'}
                      </div>
                    </div>

                    {/* Place of Appointment */}
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        6. Place of Appointment (جائے تقرری)
                      </div>
                      <div className="text-sm font-semibold text-slate-900 mt-1">
                        {record.place_of_appointment || '—'}
                      </div>
                    </div>

                    {/* Domicile */}
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        7. Domicile (ڈومیسائل / ضلع)
                      </div>
                      <div className="text-sm font-semibold text-slate-900 mt-1">
                        {record.domicile || '—'}
                      </div>
                    </div>

                    {/* Date of Offer Letter */}
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        8. Date of Offer Letter (آفر لیٹر کی تاریخ)
                      </div>
                      <div className="text-sm font-semibold text-slate-900 mt-1">
                        {record.date_of_offer_letter || '—'}
                      </div>
                    </div>

                    {/* Date of Apptt: */}
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        9. Date of Apptt: (تاریخِ تقرری)
                      </div>
                      <div className="text-sm font-semibold text-slate-900 mt-1">
                        {record.date_of_apptt || '—'}
                      </div>
                    </div>

                    {/* Qualification at the time of Apptt. */}
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        10. Qualification at the time of Apptt.
                      </div>
                      <div className="text-sm font-semibold text-slate-900 mt-1">
                        {record.qualification_at_apptt || '—'}
                      </div>
                    </div>

                    {/* Requirement as per Rules */}
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 md:col-span-2">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        11. Requirement as per Rules (قواعد کے مطابق لازمی شرائط)
                      </div>
                      <div className="text-sm font-semibold text-slate-900 mt-1">
                        {record.requirement_as_per_rules || '—'}
                      </div>
                    </div>

                    {/* Name & Desig of Apptt: Authority Committee Members with Designation */}
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 md:col-span-2">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        12. Name &amp; Desig of Apptt: Authority Committee Members with Designation
                      </div>
                      <div className="text-sm font-semibold text-slate-900 mt-1">
                        {record.appointment_committee_members || '—'}
                      </div>
                    </div>

                    {/* Any others relevent information */}
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 md:col-span-2">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        13. Any others relevent information (دیگر اہم معلومات)
                      </div>
                      <div className="text-sm font-semibold text-slate-900 mt-1">
                        {record.other_relevant_info || '—'}
                      </div>
                    </div>

                    {/* Name of News paper of Advertisement & Date */}
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 md:col-span-2">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        14. Name of News paper of Advertisement &amp; Date (اشتہار شائع ہونے والا اخبار اور تاریخ)
                      </div>
                      <div className="text-sm font-semibold text-slate-900 mt-1">
                        {record.newspaper_advertisement_and_date || '—'}
                      </div>
                    </div>
                  </div>

                  {/* Edit Call-to-action button */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between no-print">
                    <p className="text-xs text-slate-500">
                      کیا آپ کے کوائف میں کوئی تبدیلی درکار ہے؟
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenEditModal}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow transition cursor-pointer"
                    >
                      <HiOutlinePencilAlt className="w-5 h-5" />
                      <span>کوائف میں تبدیلی کریں (Edit Data)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Editable Form Mode */}
            {isEditMode && formData && (
              <form
                onSubmit={handleSaveChanges}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden space-y-6 p-6 sm:p-8"
              >
                <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                      ترمیم موڈ (Edit Mode Active)
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 mt-2">
                      کوائف میں تبدیلی کریں (Edit Your Record)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      تبدیلیاں کرنے کے بعد محفوظ کریں کے بٹن پر کلک کریں۔ ڈیٹا خود بخود گوگل شیٹ میں اپ ڈیٹ ہو جائے گا۔
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
                    >
                      منسوخ (Cancel)
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                    >
                      {saving ? (
                        <>
                          <HiOutlineRefresh className="w-4 h-4 animate-spin" />
                          <span>محفوظ ہو رہا ہے...</span>
                        </>
                      ) : (
                        <>
                          <HiOutlineCheckCircle className="w-4 h-4" />
                          <span>محفوظ کریں (Save Changes)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* SR No. (Read-only) */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-600 uppercase">
                      1. SR No.
                    </label>
                    <input
                      type="text"
                      value={formData.sr_no}
                      disabled
                      className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  {/* Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      2. Name (استاد کا نام) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      required
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* Father Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      3. Father Name (ولدیت)
                    </label>
                    <input
                      type="text"
                      value={formData.father_name}
                      onChange={(e) => handleFieldChange('father_name', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* CNIC No */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      4. CNIC No (شناختی کارڈ نمبر)
                    </label>
                    <input
                      type="text"
                      value={formData.cnic_no}
                      onChange={(e) => handleFieldChange('cnic_no', e.target.value)}
                      placeholder="42101-1234567-1"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* PID No */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      5. PID No. (پرسنل نمبر) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.pid_no}
                      onChange={(e) => handleFieldChange('pid_no', e.target.value)}
                      required
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* Place of Appointment */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      6. Place of Appointment (جائے تقرری)
                    </label>
                    <input
                      type="text"
                      value={formData.place_of_appointment}
                      onChange={(e) => handleFieldChange('place_of_appointment', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* Domicile */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      7. Domicile (ڈومیسائل / ضلع)
                    </label>
                    <input
                      type="text"
                      value={formData.domicile}
                      onChange={(e) => handleFieldChange('domicile', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* Date of Offer Letter */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      8. Date of Offer Letter (آفر لیٹر کی تاریخ)
                    </label>
                    <input
                      type="text"
                      value={formData.date_of_offer_letter}
                      onChange={(e) => handleFieldChange('date_of_offer_letter', e.target.value)}
                      placeholder="DD/MM/YYYY یا تاریخ درج کریں"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* Date of Apptt: */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      9. Date of Apptt: (تاریخِ تقرری)
                    </label>
                    <input
                      type="text"
                      value={formData.date_of_apptt}
                      onChange={(e) => handleFieldChange('date_of_apptt', e.target.value)}
                      placeholder="DD/MM/YYYY یا آرڈر نمبر و تاریخ"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* Qualification at the time of Apptt. */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      10. Qualification at the time of Apptt.
                    </label>
                    <input
                      type="text"
                      value={formData.qualification_at_apptt}
                      onChange={(e) => handleFieldChange('qualification_at_apptt', e.target.value)}
                      placeholder="مثال: Matric, B.A, B.Ed, M.A وغیرہ"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* Requirement as per Rules */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      11. Requirement as per Rules (قواعد کے مطابق لازمی شرائط)
                    </label>
                    <input
                      type="text"
                      value={formData.requirement_as_per_rules}
                      onChange={(e) => handleFieldChange('requirement_as_per_rules', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* Name & Desig of Apptt: Authority Committee Members with Designation */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      12. Name &amp; Desig of Apptt: Authority Committee Members with Designation
                    </label>
                    <input
                      type="text"
                      value={formData.appointment_committee_members}
                      onChange={(e) => handleFieldChange('appointment_committee_members', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* Any others relevent information */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      13. Any others relevent information (دیگر اہم معلومات)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.other_relevant_info}
                      onChange={(e) => handleFieldChange('other_relevant_info', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* Name of News paper of Advertisement & Date */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase">
                      14. Name of News paper of Advertisement &amp; Date
                    </label>
                    <input
                      type="text"
                      value={formData.newspaper_advertisement_and_date}
                      onChange={(e) => handleFieldChange('newspaper_advertisement_and_date', e.target.value)}
                      placeholder="اخبار کا نام اور اشتہار کی تاریخ"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition cursor-pointer"
                  >
                    منسوخ (Cancel)
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow transition flex items-center gap-2 cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <HiOutlineRefresh className="w-5 h-5 animate-spin" />
                        <span>محفوظ کیا جا رہا ہے...</span>
                      </>
                    ) : (
                      <>
                        <HiOutlineCheckCircle className="w-5 h-5" />
                        <span>محفوظ کریں (Save Changes to Sheet)</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Security Re-verification Modal for Editing */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
                  <HiOutlineLockClosed className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    حفاظتی تصدیق (Security Confirmation)
                  </h3>
                  <p className="text-xs text-slate-500">
                    کوائف میں تبدیلی کرنے کے لیے دوبارہ تصدیق درکار ہے۔
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
                <HiOutlineInformationCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                <span>
                  سیکورٹی کی خاطر، برائے مہربانی کوائف میں ردوبدل (Editing) شروع کرنے سے پہلے اپنا پرسنل نمبر (Password) دوبارہ درج کریں۔
                </span>
              </div>

              <form onSubmit={handleConfirmEditReverify} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    پرسنل نمبر (Password) دوبارہ درج کریں:
                  </label>
                  <div className="relative">
                    <input
                      type={showReverifyPassword ? 'text' : 'password'}
                      placeholder="اپنا پرسنل نمبر لکھیں"
                      value={reverifyPasswordInput}
                      onChange={(e) => {
                        setReverifyPasswordInput(e.target.value);
                        setReverifyError('');
                      }}
                      autoFocus
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm pr-12 focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowReverifyPassword(!showReverifyPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showReverifyPassword ? (
                        <HiOutlineEyeOff className="w-4 h-4" />
                      ) : (
                        <HiOutlineEye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {reverifyError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
                    <HiOutlineExclamationCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{reverifyError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={reverifying}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
                  >
                    منسوخ (Cancel)
                  </button>
                  <button
                    type="submit"
                    disabled={reverifying || !reverifyPasswordInput.trim()}
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {reverifying ? (
                      <>
                        <HiOutlineRefresh className="w-4 h-4 animate-spin" />
                        <span>تصدیق ہو رہی ہے...</span>
                      </>
                    ) : (
                      <>
                        <HiOutlineLockOpen className="w-4 h-4" />
                        <span>تصدیق کر کے ترمیم کریں (Confirm)</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
