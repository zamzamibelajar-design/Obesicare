import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Auth from './Auth';
import DashboardPasien from './pages/DashboardPasien';
import DashboardDokter from './pages/DashboardDokter';
import DashboardAdmin from './pages/DashboardAdmin';

export default function App() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fungsi khusus untuk mengambil role
  const fetchRole = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    if (data) setRole(data.role);
  };

  useEffect(() => {
    const cekSesi = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session?.user) {
          await fetchRole(session.user.id);
        }
      } catch (error) {
        console.error("Error cek sesi:", error);
      } finally {
        setLoading(false);
      }
    };

    cekSesi();

    // Listener ini sekarang ikut mengambil role saat ada event SIGNED_IN
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      if (event === 'SIGNED_IN' && currentSession?.user) {
        await fetchRole(currentSession.user.id);
      } else if (event === 'SIGNED_OUT') {
        setRole(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Memuat aplikasi...
      </div>
    );
  }

 return (
    <Router>
      <Routes>
        {/* Rute Utama (Root) membagi 3 arah berdasarkan role */}
        <Route 
          path="/" 
          element={
            !session ? <Navigate to="/login" replace /> : 
            role === 'superadmin' ? <Navigate to="/admin" replace /> : 
            role === 'dokter' ? <Navigate to="/dokter" replace /> : 
            <Navigate to="/dashboard" replace />
          } 
        />

        <Route 
          path="/login" 
          element={
            !session ? <Auth /> : 
            <Navigate to="/" replace /> // Lempar ke Root agar diatur oleh logika di atas
          } 
        />
        
        {/* Rute Dashboard Pasien */}
        <Route 
          path="/dashboard" 
          element={
            role === 'pasien' || !role ? (
              <div className="p-10 text-center bg-white min-h-screen">
                <h1 className="text-2xl font-bold text-gray-800">Ini Halaman Dashboard Pasien</h1>
                <button onClick={() => supabase.auth.signOut()} className="mt-4 bg-red-500 text-white px-4 py-2 rounded font-semibold hover:bg-red-600">Logout</button>
              </div>
            ) : <Navigate to="/" replace />
          } 
        />

        {/* Rute Dashboard Dokter Baru */}
        <Route 
          path="/dokter" 
          element={
            role === 'dokter' ? (
              <div className="p-10 text-center bg-blue-50 min-h-screen">
                <h1 className="text-2xl font-bold text-blue-800">Ini Halaman Panel Dokter</h1>
                <p className="mt-2 text-gray-600">Selamat datang, Dok!</p>
                <button onClick={() => supabase.auth.signOut()} className="mt-4 bg-red-500 text-white px-4 py-2 rounded font-semibold hover:bg-red-600">Logout</button>
              </div>
            ) : <Navigate to="/" replace />
          } 
        />
        
        {/* Rute Dashboard Admin */}
        <Route 
          path="/admin" 
          element={role === 'superadmin' ? <DashboardAdmin /> : <Navigate to="/" replace />} 
        />
        
        {/* Rute Fallback */}
        <Route 
          path="*" 
          element={<Navigate to="/" replace />} 
        />
      </Routes>
    </Router>
  );
}