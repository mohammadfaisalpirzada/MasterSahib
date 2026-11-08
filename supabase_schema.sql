-- 1. Academic Sessions Table
CREATE TABLE IF NOT EXISTS public.academic_sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    is_current BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Current Session
INSERT INTO public.academic_sessions (id, title, is_current)
VALUES ('2026-2027', 'Session 2026-2027', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 2. Master Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gr_no TEXT NOT NULL UNIQUE,
    student_name TEXT NOT NULL,
    father_name TEXT NOT NULL,
    gender TEXT DEFAULT 'Male',
    dob TEXT DEFAULT '',
    dob_words TEXT DEFAULT '',
    b_form_no TEXT DEFAULT '',
    father_cnic TEXT DEFAULT '',
    contact_no TEXT DEFAULT '',
    address TEXT DEFAULT '',
    religion TEXT DEFAULT 'Islam',
    medium TEXT DEFAULT 'Urdu',
    school_id TEXT NOT NULL DEFAULT 'gbss_pak_quarter',
    admission_date TEXT DEFAULT '',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Student Annual Enrollments Table
CREATE TABLE IF NOT EXISTS public.student_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gr_no TEXT NOT NULL REFERENCES public.students(gr_no) ON DELETE CASCADE,
    session_id TEXT NOT NULL REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
    student_class TEXT NOT NULL,
    section TEXT DEFAULT '',
    roll_no TEXT DEFAULT '',
    status TEXT DEFAULT 'enrolled',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(gr_no, session_id)
);

-- 4. Exam Results Table
CREATE TABLE IF NOT EXISTS public.exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gr_no TEXT NOT NULL REFERENCES public.students(gr_no) ON DELETE CASCADE,
    session_id TEXT NOT NULL REFERENCES public.academic_sessions(id) ON DELETE CASCADE,
    exam_title TEXT NOT NULL,
    student_class TEXT NOT NULL,
    roll_no TEXT DEFAULT '',
    marks JSONB NOT NULL DEFAULT '{}'::jsonb,
    total_max NUMERIC DEFAULT 0,
    total_obt NUMERIC DEFAULT 0,
    percentage NUMERIC DEFAULT 0,
    grade TEXT DEFAULT '',
    attendance_total INTEGER DEFAULT 0,
    attendance_present INTEGER DEFAULT 0,
    remarks TEXT DEFAULT '',
    conduct TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(gr_no, session_id, exam_title)
);

-- 5. Enable Row Level Security & Create Public Policies
ALTER TABLE public.academic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on academic_sessions" ON public.academic_sessions FOR SELECT USING (true);
CREATE POLICY "Allow all on academic_sessions" ON public.academic_sessions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read on students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow all on students" ON public.students FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read on student_enrollments" ON public.student_enrollments FOR SELECT USING (true);
CREATE POLICY "Allow all on student_enrollments" ON public.student_enrollments FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read on exam_results" ON public.exam_results FOR SELECT USING (true);
CREATE POLICY "Allow all on exam_results" ON public.exam_results FOR ALL USING (true) WITH CHECK (true);
