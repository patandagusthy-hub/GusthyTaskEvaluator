import React, { useState } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  Award, 
  FileCheck2, 
  Search, 
  Filter, 
  ExternalLink, 
  Edit3, 
  Share2, 
  Download,
  Calendar,
  Sparkles
} from 'lucide-react';
import { EvaluationResult } from '../types';

interface DashboardViewProps {
  evaluations: EvaluationResult[];
  onStartNewEvaluation: () => void;
  onViewEvaluationDetail: (evaluation: EvaluationResult) => void;
  onEditStudentIdentity: (evaluation: EvaluationResult) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  evaluations,
  onStartNewEvaluation,
  onViewEvaluationDetail,
  onEditStudentIdentity,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'Tuntas' | 'Remedial'>('ALL');

  // Calculations
  const totalTasks = evaluations.length;
  const tuntasCount = evaluations.filter(e => e.scoring.status === 'Tuntas').length;
  const remedialCount = evaluations.filter(e => e.scoring.status === 'Remedial').length;
  const averageScore = totalTasks > 0
    ? Math.round(evaluations.reduce((acc, curr) => acc + curr.scoring.total_score, 0) / totalTasks)
    : 0;
  const passingRate = totalTasks > 0 ? Math.round((tuntasCount / totalTasks) * 100) : 0;

  // Unidentified students count
  const unidentifiedCount = evaluations.filter(e => 
    e.student_info.detected_name.toLowerCase().includes('unidentified')
  ).length;

  // Filtered evaluations
  const filteredEvaluations = evaluations.filter(e => {
    const matchSearch = 
      e.student_info.detected_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.student_info.submission_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.student_info.nisn && e.student_info.nisn.includes(searchQuery));

    const matchClass = selectedClass === 'ALL' || e.student_info.class_group.includes(selectedClass);
    const matchStatus = selectedStatus === 'ALL' || e.scoring.status === selectedStatus;

    return matchSearch && matchClass && matchStatus;
  });

  // Extract unique classes
  const classList = Array.from(new Set(evaluations.map(e => e.student_info.class_group))).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card-elevated p-6 rounded-3xl border border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Dashboard Analitik Penilaian Siswa
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Monitoring performa belajar, rekapitulasi KKM, dan status remedial tugas siswa terpadu.
          </p>
        </div>

        <button
          onClick={onStartNewEvaluation}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 hover:scale-[1.02] transition-all"
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Koreksi Tugas Baru (AI)</span>
        </button>
      </div>

      {/* 3D KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1 */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 relative overflow-hidden card-3d-hover">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Tugas Diperiksa</span>
            <span className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {totalTasks}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">dokumen</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Ekstraksi Multimodal Aktif</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 relative overflow-hidden card-3d-hover">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Rata-Rata Nilai</span>
            <span className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
              <Award className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 tracking-tight">
              {averageScore}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Standar KKM Acuan: <strong className="text-white">75</strong>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 relative overflow-hidden card-3d-hover">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Tingkat Ketuntasan</span>
            <span className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-cyan-300 tracking-tight">
              {passingRate}%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 font-medium">
            {tuntasCount} Tuntas • {remedialCount} Remedial
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 relative overflow-hidden card-3d-hover">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Perlu Penyesuaian Resi</span>
            <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400">
              <AlertCircle className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-amber-300 tracking-tight">
              {unidentifiedCount}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">Unidentified</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-400/90 font-medium">
            Dapat diganti dengan 1-klik di tabel
          </div>
        </div>

      </div>

      {/* Visual Analytics Row: Score Breakdown & KKM Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Ketuntasan & Remedial Distribution */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Distribusi Ketuntasan KKM Siswa</span>
            </h3>
            <span className="text-xs text-slate-400">Batas KKM: 75</span>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Siswa Tuntas / Lulus (Skor ≥ 75)
                </span>
                <span className="text-slate-300 font-bold">{tuntasCount} siswa ({passingRate}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${passingRate}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Siswa Remedial (Skor &lt; 75)
                </span>
                <span className="text-slate-300 font-bold">
                  {remedialCount} siswa ({totalTasks > 0 ? 100 - passingRate : 0}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${totalTasks > 0 ? 100 - passingRate : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            💡 <strong>Rekomendasi Evaluator AI:</strong> Siswa dalam kategori remedial otomatis disarankan latihan tambahan pada aspek keruntutan struktur paragraf dan ketepatan kaidah ejaan sebelum ujian sumatif akhir.
          </div>
        </div>

        {/* Right: Quick Tone & Model Engine Status */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Spesifikasi Engine Penilai</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">Model AI Terpasang:</span>
              <span className="text-white font-semibold">Gemini 3.8 Flash (Multimodal)</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">Akurasi Penalaran Tulisan:</span>
              <span className="text-emerald-400 font-semibold">Tingkat Mahir (Contextual)</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">Format Evaluasi:</span>
              <span className="text-indigo-400 font-semibold">JSON Schema Baku + Transkripsi OCR</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">Opsi Tone Umpan Balik:</span>
              <span className="text-cyan-300 font-semibold">5 Mode Persona Pedagogis</span>
            </div>
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama siswa, judul tugas, atau NISN..."
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Class */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Semua Kelas</option>
            {classList.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>

        {/* Filter Status */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedStatus === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setSelectedStatus('Tuntas')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedStatus === 'Tuntas' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Tuntas
          </button>
          <button
            onClick={() => setSelectedStatus('Remedial')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedStatus === 'Remedial' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Remedial
          </button>
        </div>

      </div>

      {/* Evaluations Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Daftar Hasil Penilaian Siswa</h3>
            <p className="text-xs text-slate-400">
              Menampilkan {filteredEvaluations.length} dari total {evaluations.length} data lembar kerja
            </p>
          </div>
        </div>

        {filteredEvaluations.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <AlertCircle className="w-10 h-10 mx-auto text-slate-500" />
            <p className="text-sm">Tidak ada data penilaian yang cocok dengan filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Nama Siswa & NISN</th>
                  <th className="px-6 py-4">Kelas & Judul Tugas</th>
                  <th className="px-6 py-4 text-center">Skor Akhir</th>
                  <th className="px-6 py-4 text-center">Status KKM</th>
                  <th className="px-6 py-4">Waktu Evaluasi</th>
                  <th className="px-6 py-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredEvaluations.map((item) => {
                  const isUnidentified = item.student_info.detected_name.toLowerCase().includes('unidentified');
                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Name & NISN */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={`font-bold ${isUnidentified ? 'text-amber-400 font-mono' : 'text-white'}`}>
                                {item.student_info.detected_name}
                              </span>
                              {isUnidentified && (
                                <button
                                  onClick={() => onEditStudentIdentity(item)}
                                  title="Ganti identitas dengan 1-klik"
                                  className="p-1 rounded-md bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 block">
                              NISN: {item.student_info.nisn || '-'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Class & Submission Title */}
                      <td className="px-6 py-4">
                        <div>
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 text-[10px] font-semibold border border-slate-700">
                            {item.student_info.class_group}
                          </span>
                          <p className="mt-1 font-medium text-slate-300 truncate max-w-xs">
                            {item.student_info.submission_title}
                          </p>
                        </div>
                      </td>

                      {/* Score */}
                      <td className="px-6 py-4 text-center">
                        <span className={`text-base font-extrabold ${
                          item.scoring.total_score >= item.scoring.passing_grade 
                            ? 'text-emerald-400' 
                            : 'text-rose-400'
                        }`}>
                          {item.scoring.total_score}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          KKM: {item.scoring.passing_grade}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide ${
                          item.scoring.status === 'Tuntas'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {item.scoring.status === 'Tuntas' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {item.scoring.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-slate-400 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{new Date(item.evaluatedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onEditStudentIdentity(item)}
                            title="Edit Identitas Siswa"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onViewEvaluationDetail(item)}
                            title="Buka Laporan Lengkap"
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white font-medium text-xs transition-all flex items-center gap-1"
                          >
                            <span>Rapor Detail</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
