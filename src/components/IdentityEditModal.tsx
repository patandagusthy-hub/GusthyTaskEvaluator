import React, { useState } from 'react';
import { UserCheck, X, Check, Edit3, ShieldAlert } from 'lucide-react';
import { EvaluationResult } from '../types';

interface IdentityEditModalProps {
  evaluation: EvaluationResult | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveIdentity: (evalId: string, updatedName: string, updatedNisn: string, updatedClass: string) => void;
}

export const IdentityEditModal: React.FC<IdentityEditModalProps> = ({
  evaluation,
  isOpen,
  onClose,
  onSaveIdentity,
}) => {
  if (!isOpen || !evaluation) return null;

  const [studentName, setStudentName] = useState(evaluation.student_info.detected_name);
  const [nisn, setNisn] = useState(evaluation.student_info.nisn || '');
  const [classGroup, setClassGroup] = useState(evaluation.student_info.class_group);

  const isUnidentified = evaluation.student_info.detected_name.toLowerCase().includes('unidentified');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;
    onSaveIdentity(evaluation.id, studentName.trim(), nisn.trim(), classGroup.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-card-elevated rounded-3xl p-6 border border-indigo-500/30 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isUnidentified ? 'Selesaikan Identitas Siswa' : 'Perbarui Identitas Siswa'}
              </h3>
              <p className="text-xs text-slate-400">
                1-Klik Penggantian Data Resi Lembar Jawaban
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning if unindentified */}
        {isUnidentified && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              Lembar ini awalnya ditandai dengan resi otomatis <strong>{evaluation.student_info.detected_name}</strong> karena nama tidak terdeteksi pada header. Masukkan nama asli siswa di bawah:
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Nama Lengkap Siswa:
            </label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Contoh: Muhammad Bintang Alamsyah"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              NISN / NIS (Nomor Induk):
            </label>
            <input
              type="text"
              value={nisn}
              onChange={(e) => setNisn(e.target.value)}
              placeholder="Contoh: 0089201948"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Kelas / Rombel:
            </label>
            <input
              type="text"
              required
              value={classGroup}
              onChange={(e) => setClassGroup(e.target.value)}
              placeholder="Contoh: Kelas 10-A"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
