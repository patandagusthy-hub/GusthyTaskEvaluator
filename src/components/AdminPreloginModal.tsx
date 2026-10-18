import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  ArrowRight, 
  X,
  School,
  KeyRound,
  FileCheck,
  Brain,
  Sliders,
  Eye,
  EyeOff
} from 'lucide-react';
import { AdminUser } from '../types';
import { INITIAL_ADMIN_USERS } from '../data/mockData';

interface AdminPreloginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AdminUser) => void;
  currentUser: AdminUser | null;
}

export const AdminPreloginModal: React.FC<AdminPreloginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
}) => {
  const [selectedDemoUser, setSelectedDemoUser] = useState<AdminUser>(INITIAL_ADMIN_USERS[0]);
  const [email, setEmail] = useState('admin@gusthy.sch.id');
  const [password, setPassword] = useState('gusthy2025');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSelectDemo = (user: AdminUser) => {
    setSelectedDemoUser(user);
    setEmail(user.email);
    setPassword('gusthy2025');
    setErrorMsg('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsLoading(false);
      const matched = INITIAL_ADMIN_USERS.find(u => u.email.toLowerCase() === email.toLowerCase()) || {
        ...selectedDemoUser,
        email: email || selectedDemoUser.email,
      };
      onLoginSuccess(matched);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl glass-card-elevated rounded-3xl p-6 sm:p-10 border border-indigo-500/30 shadow-2xl overflow-hidden perspective-1000">
        
        {/* Glow ambient backgrounds */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-600/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-violet-600/30 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button if user already logged in */}
        {currentUser && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero / Brand Info */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Portal Otoritas Admin & Guru Penilai</span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Selamat Datang di <br />
                <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent">
                  GusthyTaskEvaluator
                </span>
              </h2>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Platform asisten AI penilai tugas siswa berbasis multimodal (teks & foto tulisan tangan), rubrik KKM objektif, serta umpan balik motivasional.
              </p>
            </div>

            {/* Feature Cards 3D Preview */}
            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/30 transition-all">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Multimodal OCR Tulisan Tangan</h4>
                  <p className="text-[11px] text-slate-400">
                    Ekstraksi cerdas tulisan tangan siswa dan header lembar kerja secara instan.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/30 transition-all">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Evaluasi Berbasis KKM & 5 Tone Feedback</h4>
                  <p className="text-[11px] text-slate-400">
                    Penetapan status Tuntas vs Remedial otomatis dengan gaya bahasa pedagogis terstruktur.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/30 transition-all">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Standar JSON Terstruktur & Fallback 1-Klik</h4>
                  <p className="text-[11px] text-slate-400">
                    Solusi resi "Unidentified Student" cerdas yang dapat diperbarui dalam 1 detik.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Login Card */}
          <div className="lg:col-span-6 bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-slate-700/80 shadow-xl relative">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Autentikasi Penguji</h3>
                <p className="text-xs text-slate-400">Masuk untuk mengelola penilaian dan rubrik</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-[10px] font-bold border border-indigo-500/20">
                Mode Uji Aktif
              </span>
            </div>

            {/* 1-Click Quick Demo Switcher */}
            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Pilih Akun Cepat (Quick Demo):
              </label>
              <div className="grid grid-cols-2 gap-2">
                {INITIAL_ADMIN_USERS.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelectDemo(user)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl text-left border transition-all ${
                      selectedDemoUser.id === user.id
                        ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500'
                        : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-lg object-cover ring-1 ring-indigo-400"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="mt-5 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Email Guru / Admin
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="nama@gusthy.sch.id"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Kata Sandi Portal
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Ingat sesi penguji</span>
                </label>
                <span className="text-indigo-400 text-[11px]">NIP Terverifikasi</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>Memverifikasi Otoritas Admin...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Dashboard Guru</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <School className="w-3.5 h-3.5 text-slate-400" />
                SMA Unggulan Nusantara
              </span>
              <span>Hak Akses Super Admin Penuh</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
