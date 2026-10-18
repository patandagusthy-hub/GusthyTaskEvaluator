import React from 'react';
import { 
  Sparkles, 
  BarChart3, 
  FileCheck2, 
  BookOpen, 
  Archive, 
  LogOut, 
  UserCheck, 
  Zap, 
  ChevronDown,
  Layers,
  GraduationCap,
  Settings
} from 'lucide-react';
import { AdminUser } from '../types';

interface NavbarProps {
  currentTab: 'home' | 'dashboard' | 'evaluator' | 'rubrics' | 'archive' | 'settings' | 'portal';
  setCurrentTab: (tab: 'home' | 'dashboard' | 'evaluator' | 'rubrics' | 'archive' | 'settings' | 'portal') => void;
  adminUser: AdminUser | null;
  onOpenPrelogin: () => void;
  onLogout: () => void;
  archiveCount: number;
  onNavigateSettingsSection?: (section: 'profile' | 'classes' | 'links' | 'evaluation' | 'security' | 'backup' | 'system') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  adminUser,
  onOpenPrelogin,
  onLogout,
  archiveCount,
  onNavigateSettingsSection,
}) => {
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-indigo-500/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand with 3D Effect */}
          <div 
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 group-hover:scale-105 transition-all duration-300">
                <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/0"></div>
                  <Layers className="w-6 h-6 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                  Gusthy<span className="text-indigo-400">Task</span>Evaluator
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  AI v3.8 Flash
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Asisten AI Penilai Tugas Siswa Multimodal & KKM
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setCurrentTab('home')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                currentTab === 'home'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Beranda</span>
            </button>

            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                currentTab === 'dashboard'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentTab('evaluator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                currentTab === 'evaluator'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400/30'
                  : 'text-cyan-300 hover:text-white hover:bg-cyan-950/40'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-cyan-400" />
              <span>Penilai Tugas</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            </button>

            <button
              onClick={() => setCurrentTab('rubrics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                currentTab === 'rubrics'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Bank Rubrik</span>
            </button>

            <button
              onClick={() => setCurrentTab('archive')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                currentTab === 'archive'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Archive className="w-4 h-4" />
              <span>Arsip Nilai</span>
              {archiveCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-indigo-500/30 text-indigo-300 font-bold">
                  {archiveCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                currentTab === 'settings'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Pengaturan</span>
            </button>
          </nav>

          {/* Right Action / Admin Profile */}
          <div className="flex items-center gap-3">
            {adminUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl bg-slate-900/80 border border-slate-700/80 hover:border-indigo-500/50 transition-all duration-200 text-left"
                >
                  <img
                    src={adminUser.avatar}
                    alt={adminUser.name}
                    className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/40"
                  />
                  <div className="hidden lg:block">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate max-w-[140px]">
                        {adminUser.name}
                      </span>
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-[10px] text-indigo-400 font-medium block">
                      {adminUser.role}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl glass-card-elevated p-4 shadow-2xl z-50">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                      <img
                        src={adminUser.avatar}
                        alt={adminUser.name}
                        className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-500"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">{adminUser.name}</h4>
                        <p className="text-xs text-slate-400">{adminUser.nip}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {adminUser.licenseTier}
                        </span>
                      </div>
                    </div>

                    <div className="py-2.5 text-xs text-slate-300 space-y-1.5">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Instansi Sekolah:</span>
                        <span className="text-white font-medium truncate max-w-[140px]">
                          {adminUser.school}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Status AI:</span>
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Aktif (Multimodal)
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 space-y-1">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          if (onNavigateSettingsSection) onNavigateSettingsSection('profile');
                          setCurrentTab('settings');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-indigo-300 hover:text-white hover:bg-slate-800/70 rounded-xl transition-colors"
                      >
                        <Settings className="w-4 h-4 text-indigo-400" />
                        <span>Pengaturan Admin & KKM</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          if (onNavigateSettingsSection) onNavigateSettingsSection('classes');
                          setCurrentTab('settings');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-cyan-300 hover:text-white hover:bg-slate-800/70 rounded-xl transition-colors"
                      >
                        <Layers className="w-4 h-4 text-cyan-400" />
                        <span>Manajemen Kelas Massal</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          if (onNavigateSettingsSection) onNavigateSettingsSection('links');
                          setCurrentTab('settings');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-emerald-300 hover:text-white hover:bg-slate-800/70 rounded-xl transition-colors"
                      >
                        <GraduationCap className="w-4 h-4 text-emerald-400" />
                        <span>Link Kumpul Tugas Siswa</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          setCurrentTab('portal');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-300 hover:text-white hover:bg-slate-800/70 rounded-xl transition-colors"
                      >
                        <FileCheck2 className="w-4 h-4 text-amber-400" />
                        <span>Mode Portal Siswa</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onOpenPrelogin();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-xl transition-colors"
                      >
                        <GraduationCap className="w-4 h-4 text-indigo-400" />
                        <span>Ganti Akun / Info Lisensi</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Keluar Sesi Guru</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenPrelogin}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 hover:scale-[1.02] transition-all"
              >
                <UserCheck className="w-4 h-4" />
                <span>Masuk Admin / Guru</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2.5 border-t border-slate-800 text-xs">
          <button
            onClick={() => setCurrentTab('home')}
            className={`p-2 rounded-lg flex flex-col items-center gap-1 ${
              currentTab === 'home' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Beranda</span>
          </button>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`p-2 rounded-lg flex flex-col items-center gap-1 ${
              currentTab === 'dashboard' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setCurrentTab('evaluator')}
            className={`p-2 rounded-lg flex flex-col items-center gap-1 ${
              currentTab === 'evaluator' ? 'text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Penilai</span>
          </button>
          <button
            onClick={() => setCurrentTab('rubrics')}
            className={`p-2 rounded-lg flex flex-col items-center gap-1 ${
              currentTab === 'rubrics' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Rubrik</span>
          </button>
          <button
            onClick={() => setCurrentTab('archive')}
            className={`p-2 rounded-lg flex flex-col items-center gap-1 ${
              currentTab === 'archive' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>Arsip</span>
          </button>
          <button
            onClick={() => setCurrentTab('settings')}
            className={`p-2 rounded-lg flex flex-col items-center gap-1 ${
              currentTab === 'settings' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Setelan</span>
          </button>
        </div>

      </div>
    </header>
  );
};
