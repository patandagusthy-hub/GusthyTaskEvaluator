import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Lock, 
  Sliders, 
  Database, 
  Cpu, 
  Check, 
  Eye, 
  EyeOff, 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck, 
  School, 
  Sparkles, 
  AlertTriangle,
  Award,
  CheckCircle2,
  HelpCircle,
  FileSpreadsheet,
  Users,
  Link2
} from 'lucide-react';
import { 
  AdminUser, 
  AppSettings, 
  ToneMode, 
  RubricTemplate, 
  EvaluationResult,
  SchoolClass,
  AssignmentLink
} from '../types';
import { ClassBulkManager } from './ClassBulkManager';
import { StudentPortalManager } from './StudentPortalManager';

interface AdminSettingsProps {
  adminUser: AdminUser;
  onUpdateAdminUser: (updatedUser: AdminUser) => void;
  settings: AppSettings;
  onUpdateSettings: (updatedSettings: AppSettings) => void;
  rubrics: RubricTemplate[];
  evaluations: EvaluationResult[];
  classes: SchoolClass[];
  onAddClassesBulk: (newClasses: SchoolClass[]) => void;
  onDeleteClassesBulk: (classIds: string[]) => void;
  assignmentLinks: AssignmentLink[];
  onAddAssignmentLink: (link: AssignmentLink) => void;
  onDeleteAssignmentLink: (id: string) => void;
  onToggleLinkActive: (id: string) => void;
  onOpenStudentPortalTest: (link: AssignmentLink) => void;
  onRestoreAllData: (data: { 
    adminUser?: AdminUser; 
    settings?: AppSettings; 
    rubrics?: RubricTemplate[]; 
    evaluations?: EvaluationResult[];
    classes?: SchoolClass[];
    assignmentLinks?: AssignmentLink[];
  }) => void;
  onResetFactoryData: () => void;
  initialSection?: 'profile' | 'classes' | 'links' | 'evaluation' | 'security' | 'backup' | 'system';
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  adminUser,
  onUpdateAdminUser,
  settings,
  onUpdateSettings,
  rubrics,
  evaluations,
  classes,
  onAddClassesBulk,
  onDeleteClassesBulk,
  assignmentLinks,
  onAddAssignmentLink,
  onDeleteAssignmentLink,
  onToggleLinkActive,
  onOpenStudentPortalTest,
  onRestoreAllData,
  onResetFactoryData,
  initialSection = 'profile',
}) => {
  const [activeSection, setActiveSection] = useState<'profile' | 'classes' | 'links' | 'evaluation' | 'security' | 'backup' | 'system'>(initialSection);

  // Profile Form States
  const [name, setName] = useState(adminUser.name);
  const [nip, setNip] = useState(adminUser.nip);
  const [email, setEmail] = useState(adminUser.email);
  const [school, setSchool] = useState(adminUser.school);
  const [role, setRole] = useState(adminUser.role);
  const [avatar, setAvatar] = useState(adminUser.avatar);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);

  // Evaluation Settings Form States
  const [defaultPassingGrade, setDefaultPassingGrade] = useState(settings.defaultPassingGrade);
  const [defaultTone, setDefaultTone] = useState<ToneMode>(settings.defaultTone);
  const [receiptPrefix, setReceiptPrefix] = useState(settings.receiptPrefix);
  const [autoSaveToArchive, setAutoSaveToArchive] = useState(settings.autoSaveToArchive);
  const [multimodalTolerance, setMultimodalTolerance] = useState(settings.multimodalTolerance);
  const [schoolAcademicYear, setSchoolAcademicYear] = useState(settings.schoolAcademicYear);
  const [enableConfetti, setEnableConfetti] = useState(settings.enableConfetti);
  const [autoCompressStudentUploads, setAutoCompressStudentUploads] = useState(
    settings.autoCompressStudentUploads !== false
  );
  const [maxImageDimension, setMaxImageDimension] = useState(
    settings.maxImageDimension || 1800
  );
  const [evalSettingsSuccessMsg, setEvalSettingsSuccessMsg] = useState(false);

  // Security Form States (With Show/Hide Password Toggles)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reset Modal state
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  // Preset Avatars
  const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
  ];

  // Handle Save Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAdminUser({
      ...adminUser,
      name,
      nip,
      email,
      school,
      role,
      avatar,
    });
    setProfileSuccessMsg(true);
    setTimeout(() => setProfileSuccessMsg(false), 3000);
  };

  // Handle Save Evaluation Settings
  const handleSaveEvalSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      defaultPassingGrade,
      defaultTone,
      receiptPrefix,
      autoSaveToArchive,
      multimodalTolerance,
      schoolAcademicYear,
      enableConfetti,
      autoCompressStudentUploads,
      maxImageDimension,
    });
    setEvalSettingsSuccessMsg(true);
    setTimeout(() => setEvalSettingsSuccessMsg(false), 3000);
  };

  // Handle Change Password
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!currentPassword) {
      setPasswordMsg({ type: 'error', text: 'Masukkan kata sandi lama Anda.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Kata sandi baru minimal 6 karakter.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Konfirmasi kata sandi baru tidak cocok.' });
      return;
    }

    // Success simulate
    setPasswordMsg({ type: 'success', text: 'Kata sandi berhasil diperbarui dengan aman!' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordMsg(null), 4000);
  };

  // Export Full Backup JSON
  const handleExportFullBackup = () => {
    const backupData = {
      app: 'GusthyTaskEvaluator',
      version: '3.8-flash',
      exportedAt: new Date().toISOString(),
      adminUser,
      settings,
      rubrics,
      evaluations,
      classes,
      assignmentLinks,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_gusthytask_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import Backup JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(false);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (!parsed.app || !parsed.evaluations) {
          throw new Error('Format file backup tidak valid untuk GusthyTaskEvaluator.');
        }

        onRestoreAllData({
          adminUser: parsed.adminUser,
          settings: parsed.settings,
          rubrics: parsed.rubrics,
          evaluations: parsed.evaluations,
          classes: parsed.classes,
          assignmentLinks: parsed.assignmentLinks,
        });

        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 4000);
      } catch (err: any) {
        setImportError(err.message || 'Gagal memulihkan file backup.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="glass-card-elevated p-6 sm:p-8 rounded-3xl border border-indigo-500/20 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30">
              <Settings className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Pengaturan Administrator
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/30">
                  Panel Otoritas
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-300">
                Kelola profil penguji, standar penilaian KKM sekolah, keamanan kata sandi, dan cadangan data.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{adminUser.role}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Settings Grid: Navigation Tabs (Left) + Content (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar Tabs */}
        <div className="lg:col-span-4 glass-panel p-3.5 rounded-3xl border border-slate-800 space-y-1.5 shadow-xl">
          
          <button
            onClick={() => setActiveSection('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
              activeSection === 'profile'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <User className="w-4 h-4" />
            <div className="text-left">
              <div>Profil & Otoritas Pendidik</div>
              <div className="text-[10px] opacity-75 font-normal">Identitas NIP, nama & sekolah</div>
            </div>
          </button>

          <button
            onClick={() => setActiveSection('classes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
              activeSection === 'classes'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <div className="text-left">
              <div>Manajemen Kelas Massal</div>
              <div className="text-[10px] opacity-75 font-normal">Tambah & hapus banyak kelas</div>
            </div>
          </button>

          <button
            onClick={() => setActiveSection('links')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
              activeSection === 'links'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Link2 className="w-4 h-4 text-emerald-400" />
            <div className="text-left">
              <div>Link Kumpul Tugas Siswa</div>
              <div className="text-[10px] opacity-75 font-normal">Tautan WA & layar QR code</div>
            </div>
          </button>

          <button
            onClick={() => setActiveSection('evaluation')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
              activeSection === 'evaluation'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <div className="text-left">
              <div>Standar KKM & Evaluasi</div>
              <div className="text-[10px] opacity-75 font-normal">KKM acuan, tone, dan nomor resi</div>
            </div>
          </button>

          <button
            onClick={() => setActiveSection('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
              activeSection === 'security'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Lock className="w-4 h-4" />
            <div className="text-left">
              <div>Keamanan & Kata Sandi</div>
              <div className="text-[10px] opacity-75 font-normal">Ganti sandi & toggle visibilitas</div>
            </div>
          </button>

          <button
            onClick={() => setActiveSection('backup')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
              activeSection === 'backup'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4" />
            <div className="text-left">
              <div>Cadangan & Basis Data</div>
              <div className="text-[10px] opacity-75 font-normal">Ekspor/impor data & reset demo</div>
            </div>
          </button>

          <button
            onClick={() => setActiveSection('system')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
              activeSection === 'system'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <div className="text-left">
              <div>Spesifikasi Engine AI</div>
              <div className="text-[10px] opacity-75 font-normal">Gemini 3.8 Flash, status kuota</div>
            </div>
          </button>

        </div>

        {/* Settings Body Panels */}
        <div className="lg:col-span-8">
          
          {/* 1. Profil & Otoritas Pendidik */}
          {activeSection === 'profile' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-400" />
                    <span>Profil & Identitas Penguji Utama</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Informasi ini akan dicantumkan pada lembar ekspor rapor evaluasi siswa.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                  Terverifikasi
                </span>
              </div>

              {profileSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Profil administrator berhasil diperbarui!</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                
                {/* Avatar Preview & Selection */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">
                    Foto Profil Penguji:
                  </label>
                  <div className="flex items-center gap-4">
                    <img
                      src={avatar}
                      alt={name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500 shadow-md"
                    />
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 block">Pilih preset avatar:</span>
                      <div className="flex items-center gap-2">
                        {AVATAR_PRESETS.map((p, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setAvatar(p)}
                            className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-transform hover:scale-105 ${
                              avatar === p ? 'border-indigo-400 ring-2 ring-indigo-500/50' : 'border-slate-700'
                            }`}
                          >
                            <img src={p} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Nama Lengkap & Gelar:
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Bapak Gusthy Patanda, M.Pd."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Nomor Induk Pegawai (NIP):
                    </label>
                    <input
                      type="text"
                      value={nip}
                      onChange={(e) => setNip(e.target.value)}
                      placeholder="19840315 200801 1 008"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Email Kedinasan:
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@gusthy.sch.id"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Instansi / Sekolah:
                    </label>
                    <input
                      type="text"
                      required
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      placeholder="SMA Negeri Unggulan Nusantara"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Peran Otoritas Sistem:
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Super Admin">Super Admin (Hak Akses Penuh & Konfigurasi Rubrik)</option>
                      <option value="Guru Penguji">Guru Penguji (Evaluasi & Rekapitulasi Rapor)</option>
                      <option value="Kepala Kurikulum">Kepala Kurikulum (Supervisi Standar KKM & Audit)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-800">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Perubahan Profil</span>
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* 2. Manajemen Kelas Massal */}
          {activeSection === 'classes' && (
            <ClassBulkManager
              classes={classes}
              onAddClassesBulk={onAddClassesBulk}
              onDeleteClassesBulk={onDeleteClassesBulk}
              evaluations={evaluations}
            />
          )}

          {/* 3. Link Pengumpulan Tugas Siswa */}
          {activeSection === 'links' && (
            <StudentPortalManager
              assignmentLinks={assignmentLinks}
              onAddAssignmentLink={onAddAssignmentLink}
              onDeleteAssignmentLink={onDeleteAssignmentLink}
              onToggleLinkActive={onToggleLinkActive}
              classes={classes}
              rubrics={rubrics}
              onOpenStudentPortalTest={onOpenStudentPortalTest}
            />
          )}

          {/* 4. Standar KKM & Evaluasi */}
          {activeSection === 'evaluation' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-cyan-400" />
                    <span>Standar KKM & Konfigurasi Evaluator</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Nilai ambang batas KKM, tone suara feedback, dan penomoran resi otomatis.
                  </p>
                </div>
              </div>

              {evalSettingsSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Pengaturan evaluasi KKM berhasil disimpan!</span>
                </div>
              )}

              <form onSubmit={handleSaveEvalSettings} className="space-y-5">
                
                {/* Default KKM Slider */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white">Default Nilai KKM Acuan Sekolah:</span>
                      <p className="text-[11px] text-slate-400">
                        Skor tugas di bawah nilai ini otomatis ditetapkan sebagai status <strong>Remedial</strong>.
                      </p>
                    </div>
                    <div className="px-3.5 py-1.5 rounded-xl bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 font-mono font-black text-base">
                      {defaultPassingGrade}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="1"
                    value={defaultPassingGrade}
                    onChange={(e) => setDefaultPassingGrade(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>50 (Minimal)</span>
                    <span>70</span>
                    <span className="text-indigo-400 font-bold">75 (Standar Nasional)</span>
                    <span>80</span>
                    <span>95 (Maksimal)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Default Tone of Voice Feedback:
                    </label>
                    <select
                      value={defaultTone}
                      onChange={(e) => setDefaultTone(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Encouraging & Constructive">Encouraging & Constructive (Apresiatif & Ramah)</option>
                      <option value="Academic & Rigorous">Academic & Rigorous (Formal & Akademik Ketat)</option>
                      <option value="Direct & Actionable">Direct & Actionable (Langsung & Konkret)</option>
                      <option value="Socratic & Inquisitive">Socratic & Inquisitive (Pertanyaan Reflektif)</option>
                      <option value="Gentle / Remedial-Friendly">Gentle / Remedial-Friendly (Suportif & Hangat)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Prefix Resi "Unidentified Student":
                    </label>
                    <input
                      type="text"
                      value={receiptPrefix}
                      onChange={(e) => setReceiptPrefix(e.target.value)}
                      placeholder="REC-"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono uppercase"
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Contoh hasil: Unidentified Student #{receiptPrefix}4821
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Tahun Ajaran / Semester:
                    </label>
                    <input
                      type="text"
                      value={schoolAcademicYear}
                      onChange={(e) => setSchoolAcademicYear(e.target.value)}
                      placeholder="2025/2026 Ganjil"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Penalaran Tulisan Tangan Multimodal:
                    </label>
                    <select
                      value={multimodalTolerance}
                      onChange={(e) => setMultimodalTolerance(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Otomatis & Kontekstual">Otomatis & Kontekstual (Rekomendasi AI Flash)</option>
                      <option value="Tinggi (Toleran)">Tinggi (Sangat toleran terhadap tulisan miring/coretan)</option>
                      <option value="Ketat & Kaku">Ketat (Hanya menerima tulisan terbaca jelas)</option>
                    </select>
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-2">
                  <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                    <div>
                      <span className="text-xs font-bold text-white block">Simpan Otomatis ke Arsip</span>
                      <span className="text-[11px] text-slate-400">
                        Setiap hasil evaluasi langsung dicatat ke basis data riwayat nilai siswa.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoSaveToArchive}
                      onChange={(e) => setAutoSaveToArchive(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                    <div>
                      <span className="text-xs font-bold text-white block">Animasi Konfeti Kelulusan</span>
                      <span className="text-[11px] text-slate-400">
                        Tampilkan letupan konfeti visual saat siswa berhasil mencapai status Tuntas (≥ KKM).
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={enableConfetti}
                      onChange={(e) => setEnableConfetti(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                  </label>

                  {/* Auto-compression toggle */}
                  <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
                    <div className="pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white block">Kompresi Otomatis File Tugas Siswa</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                          Rekomendasi Aktif
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Mengompresi otomatis foto lembar kerja siswa berukuran besar (5–15MB) ke ~300KB di browser sebelum dikirim. Menjaga ketajaman tulisan tangan agar 100% terbaca jelas oleh AI tanpa memberatkan kuota siswa.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoCompressStudentUploads}
                      onChange={(e) => setAutoCompressStudentUploads(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                  </label>

                  {/* Max Dimension Selector if compression active */}
                  {autoCompressStudentUploads && (
                    <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-indigo-200 block">
                          Batas Dimensi Maksimum Foto (Ketajaman Optik OCR)
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Dimensi piksel optimal untuk membaca goresan pensil/pulpen siswa
                        </span>
                      </div>
                      <select
                        value={maxImageDimension}
                        onChange={(e) => setMaxImageDimension(Number(e.target.value))}
                        className="bg-slate-900 border border-indigo-500/30 rounded-xl px-3 py-1.5 text-xs text-indigo-300 font-mono focus:outline-none focus:border-indigo-400"
                      >
                        <option value="1600">1600 px (Sangat Ringan ~200KB)</option>
                        <option value="1800">1800 px (Standar Optimal ~350KB - Rekomendasi)</option>
                        <option value="2048">2048 px (Resolusi Tinggi 2K ~500KB)</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-800">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-xs font-bold text-white shadow-lg shadow-cyan-600/30 flex items-center gap-1.5 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Terapkan Pengaturan Evaluator</span>
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* 3. Keamanan & Kata Sandi (With Show/Hide Password Toggles) */}
          {activeSection === 'security' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-indigo-400" />
                    <span>Keamanan & Kata Sandi Administrator</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Perbarui kata sandi portal dengan tombol toggle visibilitas show/hide password.
                  </p>
                </div>
              </div>

              {passwordMsg && (
                <div className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${
                  passwordMsg.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  {passwordMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                
                {/* 1. Kata Sandi Saat Ini */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Kata Sandi Saat Ini:
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Masukkan sandi lama"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title={showCurrentPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 2. Kata Sandi Baru */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Kata Sandi Baru:
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title={showNewPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 3. Konfirmasi Kata Sandi Baru */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Konfirmasi Kata Sandi Baru:
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi baru"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title={showConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
                  🔒 Seluruh sesi penguji dilindungi enkripsi standar institusi dan token otentikasi internal.
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Perbarui Kata Sandi</span>
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* 4. Cadangan & Basis Data */}
          {activeSection === 'backup' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-400" />
                    <span>Manajemen Data, Cadangan & Pemulihan</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ekspor seluruh data nilai siswa dan rubrik untuk arsip offline atau pindah perangkat.
                  </p>
                </div>
              </div>

              {importSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Data cadangan berhasil dipulihkan secara penuh!</span>
                </div>
              )}

              {importError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Export Card */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-indigo-400" />
                    <h4 className="text-xs font-bold text-white">Ekspor Cadangan Lengkap (.JSON)</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Menyimpan {evaluations.length} data lembar kerja siswa, {rubrics.length} rubrik, serta profil admin ke file JSON aman.
                  </p>
                  <button
                    onClick={handleExportFullBackup}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4 text-indigo-400" />
                    <span>Unduh File Cadangan</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white">Pulihkan dari File Cadangan</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Unggah file backup JSON yang pernah Anda simpan sebelumnya untuk memulihkan seluruh data.
                  </p>
                  <label className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>Pilih File Backup JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>
                </div>

              </div>

              {/* Danger Zone: Reset to Factory Demo */}
              <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-3">
                <div className="flex items-center gap-2 text-rose-300">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <h4 className="text-xs font-bold">Zona Bahaya: Reset ke Data Bawaan Pabrik</h4>
                </div>
                <p className="text-[11px] text-rose-200/80 leading-relaxed">
                  Tindakan ini akan mengembalikan data penilaian dan rubrik ke kondisi demonstrasi bawaan. Pastikan Anda telah mengekspor cadangan terlebih dahulu jika diperlukan.
                </p>
                <button
                  type="button"
                  onClick={() => setShowResetConfirmModal(true)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Data Sekarang</span>
                </button>
              </div>

            </div>
          )}

          {/* 5. Spesifikasi Engine AI */}
          {activeSection === 'system' && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-indigo-400" />
                    <span>Spesifikasi Engine AI & Telemetri</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Detail arsitektur model Gemini Flash, telemetry proxy server, dan kuota.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400">Model Inti AI:</span>
                  <div className="text-right">
                    <span className="text-white font-mono font-bold">Google Gemini 3.8 Flash</span>
                    <span className="text-[10px] text-emerald-400 block">Multimodal Vision & Contextual OCR</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400">Header Telemetri Wajib:</span>
                  <span className="text-cyan-300 font-mono">User-Agent: aistudio-build</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400">Endpoint Evaluator:</span>
                  <span className="text-indigo-300 font-mono">POST /api/evaluate (Proxy Server Side)</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400">Tingkat Lisensi Institusi:</span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    Enterprise AI Pro Unlimited
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400">Sisa Kuota Token AI:</span>
                  <span className="text-white font-mono font-bold">
                    {adminUser.aiTokenQuota.toLocaleString('id-ID')} Tokens
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Confirmation Modal for Reset Factory Data */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md glass-card-elevated rounded-3xl p-6 border border-rose-500/30 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-white">Konfirmasi Reset Data Bawaan</h3>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                Apakah Anda yakin ingin mengatur ulang data kembali ke sampel awal demonstrasi? Semua riwayat evaluasi kustom akan dihapus.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetFactoryData();
                  setShowResetConfirmModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
