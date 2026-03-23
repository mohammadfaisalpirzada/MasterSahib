import RoleLogoutButton from '../components/RoleLogoutButton';

export default function AdminPage() {
  return (
    <main className="mx-auto min-h-[70vh] w-full max-w-4xl px-4 py-16">
      <div className="mb-6 flex justify-end">
        <RoleLogoutButton />
      </div>
      <h1 className="text-4xl font-bold text-slate-900">Admin Dashboard</h1>
      <p className="mt-3 text-lg text-slate-700">Welcome, Admin. You are logged in successfully.</p>
    </main>
  );
}
