import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function DashboardAdmin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [spesialisasi, setSpesialisasi] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleTambahDokter = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Proses 1: Daftarkan akun auth dokter
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      alert("Gagal membuat akun auth: " + authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // Proses 2: Masukkan ke profil dengan role 'dokter'
      await supabase.from('profiles').insert([
        { id: authData.user.id, nama_lengkap: namaLengkap, email: email, role: 'dokter' }
      ]);

      // Proses 3: Masukkan data ke tabel dokters
      await supabase.from('dokters').insert([
        { id: authData.user.id, spesialisasi: spesialisasi }
      ]);

      alert('Akun Dokter berhasil ditambahkan!');
      setEmail(''); setPassword(''); setNamaLengkap(''); setSpesialisasi('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Panel Superadmin</h1>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-red-600">
            Logout
          </button>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-lg font-bold text-[#1E3A8A] mb-4">Tambah Akun Dokter</h2>
          <form onSubmit={handleTambahDokter} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Dokter</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Sementara</label>
              <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" required minLength="8"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap & Gelar</label>
              <input type="text" value={namaLengkap} onChange={(e) => setNamaLengkap(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Spesialisasi</label>
              <input type="text" value={spesialisasi} onChange={(e) => setSpesialisasi(e.target.value)} placeholder="Contoh: Ahli Gizi Klinik" className="w-full border rounded-md px-3 py-2 text-sm" required />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-green-500 text-white rounded-md py-2.5 font-bold hover:bg-green-600 mt-2">
              {loading ? 'Menyimpan...' : 'Simpan Akun Dokter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}