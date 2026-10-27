import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nik, setNik] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [noHp, setNoHp] = useState('');
  const [setuju, setSetuju] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) alert(error.message);
    else alert('Login berhasil!');
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!setuju) return alert('Anda harus menyetujui persyaratan.');
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      alert(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').insert([
        { id: authData.user.id, nama_lengkap: namaLengkap, email: email, role: 'pasien' }
      ]);
      if (profileError) console.error(profileError);

      const { error: pasienError } = await supabase.from('pasiens').insert([
        { id: authData.user.id, nik: nik, no_hp: noHp }
      ]);
      if (pasienError) console.error(pasienError);
      
      alert('Pendaftaran berhasil! Silakan cek email untuk verifikasi.');
      setIsLogin(true);
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen bg-gray-50 flex flex-col items-center font-sans overflow-hidden">
      
      {/* Background Gradasi Melengkung (Sekarang tanpa -z-10) */}
      <div className="absolute top-0 left-0 w-full h-[45%] bg-gradient-to-b from-[#7ED957] to-[#C5F354] rounded-b-[3rem] shadow-sm"></div>

      {/* Wrapper Konten Utama (Ditambahkan relative dan z-10 agar berada di atas warna hijau) */}
      <div className="relative z-10 w-full max-w-sm px-6 pt-16 flex flex-col items-center">
        
        {/* Judul Atas */}
        <h1 className="text-3xl font-bold text-white mb-8 tracking-wide drop-shadow-md">
          OBESICARE
        </h1>

        {/* Kartu Form */}
        <div className="w-full bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-[22px] font-bold text-[#3B4C68] text-center mb-6">
            {isLogin ? 'Login' : 'Daftar'}
          </h2>

          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-600 mb-1.5">Email</label>
              <input
                type="email"
                placeholder={isLogin ? "Masukkan email" : "Masukkan Email"}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 outline-none focus:border-blue-500 text-sm placeholder-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[13px] font-medium text-gray-600">Password</label>
                {isLogin && (
                  <a href="#" className="text-[13px] text-[#007BFF] hover:underline">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={isLogin ? "Masukkan Password" : "Buat Password"}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 outline-none focus:border-blue-500 text-sm placeholder-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {!isLogin && <p className="text-[11px] text-gray-500 mt-1">Minimal 8 Karakter</p>}
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-[13px] font-medium text-gray-600 mb-1.5">NIK</label>
                  <input type="text" placeholder="Nomor Induk Kependudukan" className="w-full border border-gray-300 rounded-md px-3 py-2.5 outline-none focus:border-blue-500 text-sm" value={nik} onChange={(e) => setNik(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-600 mb-1.5">Nama Lengkap</label>
                  <input type="text" className="w-full border border-gray-300 rounded-md px-3 py-2.5 outline-none focus:border-blue-500 text-sm" value={namaLengkap} onChange={(e) => setNamaLengkap(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-600 mb-1.5">NO HP</label>
                  <input type="tel" className="w-full border border-gray-300 rounded-md px-3 py-2.5 outline-none focus:border-blue-500 text-sm" value={noHp} onChange={(e) => setNoHp(e.target.value)} required />
                </div>
                <div className="flex items-center mt-2">
                  <input type="checkbox" id="setuju" className="mr-2 w-4 h-4 text-[#007BFF] rounded border-gray-300 focus:ring-[#007BFF]" checked={setuju} onChange={(e) => setSetuju(e.target.checked)} />
                  <label htmlFor="setuju" className="text-xs text-gray-700">Saya Setuju</label>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#007BFF] text-white rounded-md py-3 text-sm font-bold hover:bg-blue-600 transition-colors mt-2 shadow-md"
            >
              {loading ? 'Memproses...' : isLogin ? 'Login' : 'Daftar'}
            </button>
          </form>
        </div>

        {/* Bagian Bawah & Tempat Logo */}
        {isLogin && (
          <div className="flex flex-col items-center w-full">
            <img 
              src="/logo.png" 
              alt="Logo Obesicare" 
              className="w-48 h-auto object-contain mb-4"
            />
            <p className="text-[12px] text-gray-600 text-center leading-relaxed px-4">
              Aplikasi Pencegah Dan Penurunan Obesitas<br />Untuk Masyarakat Yang Lebih Sehat
            </p>
          </div>
        )}

        <div className="mt-8 text-[13px] text-gray-700 pb-8">
          {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#43A6C6] font-medium hover:underline"
          >
            {isLogin ? 'Daftar' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}