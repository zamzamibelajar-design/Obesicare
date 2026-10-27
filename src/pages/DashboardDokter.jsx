import { supabase } from '../supabaseClient';

export default function DashboardPasien({ session }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Selamat Datang di Dashboard Pasien</h1>
      <button onClick={handleLogout} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
        Logout
      </button>
    </div>
  );
}