import PeaceQuizNavbar from '../../components/PeaceQuizNavbar';
import StudentDashboardOverview from './StudentDashboardOverview';
import StudentWelcomeName from './StudentWelcomeName';

export default function PeaceQuizStudentPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto w-full max-w-6xl">
        <PeaceQuizNavbar role="student" />

        <section className="rounded-2xl bg-white p-8 shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Student Role</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Quiz Program Student Dashboard</h1>
          <StudentWelcomeName />

          <StudentDashboardOverview />
        </section>
      </div>
    </main>
  );
}
