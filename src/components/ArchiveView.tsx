import React, { useState } from 'react';
import { 
  Archive, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Edit3, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Trash2,
  Calendar
} from 'lucide-react';
import { EvaluationResult } from '../types';

interface ArchiveViewProps {
  evaluations: EvaluationResult[];
  onViewDetail: (evaluation: EvaluationResult) => void;
  onEditIdentity: (evaluation: EvaluationResult) => void;
  onDeleteEvaluation: (id: string) => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  evaluations,
  onViewDetail,
  onEditIdentity,
  onDeleteEvaluation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'Tuntas' | 'Remedial'>('ALL');

  const filtered = evaluations.filter(e => {
    const matchSearch = 
      e.student_info.detected_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.student_info.submission_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.student_info.nisn && e.student_info.nisn.includes(searchQuery)) ||
      e.student_info.class_group.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus = selectedStatus === 'ALL' || e.scoring.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const exportCsv = () => {
    const headers = ['Nama Siswa', 'NISN', 'Kelas', 'Judul Tugas', 'Skor Akhir', 'KKM', 'Status', 'Gaya Feedback', 'Tanggal Evaluasi'];
    const rows = filtered.map(e => [
      `"${e.student_info.detected_name}"`,
      `"${e.student_info.nisn || '-'}"`,
      `"${e.student_info.class_group}"`,
      `"${e.student_info.submission_title}"`,
      e.scoring.total_score,
      e.scoring.passing_grade,
      e.scoring.status,
      `"${e.toneUsed}"`,
      `"${new Date(e.evaluatedAt).toLocaleString('id-ID')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_nilai_siswa_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card-elevated p-6 rounded-3xl border border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Archive className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Arsip & Rekapitulasi Nilai Siswa
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-300">
            Riwayat penilaian tugas lengkap dengan data OCR, KKM, dan status kelulusan.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCsv}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Ekspor CSV / Excel</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari siswa, NISN, kelas, atau judul tugas..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedStatus === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua ({evaluations.length})
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

      {/* Archive Cards / Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Archive className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm">Tidak ada arsip yang ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Siswa</th>
                  <th className="px-6 py-4">Penugasan</th>
                  <th className="px-6 py-4 text-center">Skor & KKM</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Mode Umpan Balik</th>
                  <th className="px-6 py-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((item) => {
                  const isUnidentified = item.student_info.detected_name.toLowerCase().includes('unidentified');
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={`font-bold ${isUnidentified ? 'text-amber-400 font-mono' : 'text-white'}`}>
                                {item.student_info.detected_name}
                              </span>
                              {isUnidentified && (
                                <button
                                  onClick={() => onEditIdentity(item)}
                                  className="p-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                                  title="Ganti identitas 1-klik"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {item.student_info.class_group} • NISN: {item.student_info.nisn || '-'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-200 block truncate max-w-xs">
                          {item.student_info.submission_title}
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.evaluatedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className={`text-base font-extrabold ${
                          item.scoring.total_score >= item.scoring.passing_grade ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {item.scoring.total_score}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          KKM {item.scoring.passing_grade}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          item.scoring.status === 'Tuntas'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {item.scoring.status === 'Tuntas' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {item.scoring.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-300">
                        <span className="px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px]">
                          {item.toneUsed}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditIdentity(item)}
                            title="Edit Data Siswa"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onViewDetail(item)}
                            title="Lihat Detail"
                            className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteEvaluation(item.id)}
                            title="Hapus Dari Arsip"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600/30 text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
