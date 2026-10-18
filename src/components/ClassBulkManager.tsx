import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  CheckSquare, 
  Square, 
  Search, 
  Check, 
  AlertTriangle, 
  Layers, 
  GraduationCap, 
  BookOpen, 
  FileText,
  Sparkles
} from 'lucide-react';
import { SchoolClass, EvaluationResult } from '../types';

interface ClassBulkManagerProps {
  classes: SchoolClass[];
  onAddClassesBulk: (newClasses: SchoolClass[]) => void;
  onDeleteClassesBulk: (classIds: string[]) => void;
  evaluations: EvaluationResult[];
}

export const ClassBulkManager: React.FC<ClassBulkManagerProps> = ({
  classes,
  onAddClassesBulk,
  onDeleteClassesBulk,
  evaluations,
}) => {
  // Modal / Tab for bulk add
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [bulkTextInput, setBulkTextInput] = useState('');
  const [bulkGradeLevel, setBulkGradeLevel] = useState('Fase E (Kelas 10)');
  const [bulkAcademicYear, setBulkAcademicYear] = useState('2025/2026 Ganjil');
  const [defaultStudentCount, setDefaultStudentCount] = useState(36);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Parse bulk text into array of class names
  const parsedClassNames = Array.from(
    new Set(
      bulkTextInput
        .split(/[\n,;]+/)
        .map(c => c.trim())
        .filter(c => c.length > 0)
    )
  );

  // Filter existing duplicates
  const existingNamesLower = classes.map(c => c.name.toLowerCase().trim());
  const newClassesToAdd = parsedClassNames.filter(
    name => !existingNamesLower.includes(name.toLowerCase())
  );
  const duplicatesCount = parsedClassNames.length - newClassesToAdd.length;

  // Filtered classes list
  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.gradeLevel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Count submissions per class
  const getSubmissionCount = (className: string) => {
    return evaluations.filter(e => 
      e.student_info.class_group.toLowerCase().includes(className.toLowerCase())
    ).length;
  };

  // Toggle selection for all
  const handleToggleSelectAll = () => {
    if (selectedClassIds.length === filteredClasses.length && filteredClasses.length > 0) {
      setSelectedClassIds([]);
    } else {
      setSelectedClassIds(filteredClasses.map(c => c.id));
    }
  };

  // Toggle single class
  const handleToggleSelect = (id: string) => {
    if (selectedClassIds.includes(id)) {
      setSelectedClassIds(selectedClassIds.filter(item => item !== id));
    } else {
      setSelectedClassIds([...selectedClassIds, id]);
    }
  };

  // Submit bulk add
  const handleBulkAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClassesToAdd.length === 0) return;

    const createdList: SchoolClass[] = newClassesToAdd.map((name, idx) => ({
      id: `cls-${Date.now()}-${idx}`,
      name,
      gradeLevel: bulkGradeLevel,
      academicYear: bulkAcademicYear,
      studentCount: defaultStudentCount,
      createdAt: new Date().toISOString(),
    }));

    onAddClassesBulk(createdList);
    setBulkTextInput('');
    setShowBulkAddModal(false);
    setSuccessToast(`Berhasil menambahkan ${createdList.length} kelas baru secara massal!`);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Execute bulk delete
  const handleExecuteBulkDelete = () => {
    if (selectedClassIds.length === 0) return;
    onDeleteClassesBulk(selectedClassIds);
    setSuccessToast(`Berhasil menghapus ${selectedClassIds.length} kelas terpilih.`);
    setSelectedClassIds([]);
    setShowConfirmDeleteModal(false);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{successToast}</span>
        </div>
      )}

      {/* Action Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card-elevated p-6 rounded-3xl border border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Manajemen Kelas Massal
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-300">
            Tambah banyak kelas sekaligus (bulk paste) atau hapus kelas secara massal dengan mudah.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {selectedClassIds.length > 0 && (
            <button
              onClick={() => setShowConfirmDeleteModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer animate-in fade-in"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus ({selectedClassIds.length}) Kelas Massal</span>
            </button>
          )}

          <button
            onClick={() => setShowBulkAddModal(true)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Kelas Massal</span>
          </button>
        </div>
      </div>

      {/* Search and Table Controls */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama kelas atau tingkat..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Bulk Selection Summary */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <button
            onClick={handleToggleSelectAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium transition-colors"
          >
            {selectedClassIds.length === filteredClasses.length && filteredClasses.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-indigo-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-500" />
            )}
            <span>Pilih Semua ({filteredClasses.length})</span>
          </button>
          <span>{classes.length} Total Kelas Terdaftar</span>
        </div>

      </div>

      {/* Classes Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        {filteredClasses.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Users className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm">Tidak ada kelas yang cocok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={selectedClassIds.length === filteredClasses.length && filteredClasses.length > 0}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4">Nama Kelas</th>
                  <th className="px-6 py-4">Fase / Jenjang</th>
                  <th className="px-6 py-4 text-center">Kapasitas Siswa</th>
                  <th className="px-6 py-4 text-center">Tugas Diperiksa</th>
                  <th className="px-6 py-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredClasses.map((item) => {
                  const isSelected = selectedClassIds.includes(item.id);
                  const submissionCount = getSubmissionCount(item.name);
                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-indigo-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Class Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Tahun: {item.academicYear}
                        </span>
                      </td>

                      {/* Grade Level */}
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md bg-slate-800 text-indigo-300 font-medium text-[11px] border border-slate-700">
                          {item.gradeLevel}
                        </span>
                      </td>

                      {/* Student Count */}
                      <td className="px-6 py-4 text-center font-mono text-slate-300">
                        {item.studentCount || 36} siswa
                      </td>

                      {/* Submission Count */}
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          submissionCount > 0 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {submissionCount} tugas
                        </span>
                      </td>

                      {/* Delete Single */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedClassIds([item.id]);
                            setShowConfirmDeleteModal(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 transition-colors"
                          title="Hapus Kelas Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Tambah Kelas Massal */}
      {showBulkAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl glass-card-elevated rounded-3xl p-6 sm:p-8 border border-indigo-500/40 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Tambah Kelas Massal (Bulk Import)</h3>
                  <p className="text-xs text-slate-400">
                    Ketik atau tempel beberapa nama kelas sekaligus
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBulkAddModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBulkAddSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Daftar Nama Kelas (Pisahkan dengan baris baru, koma, atau titik koma):
                </label>
                <textarea
                  required
                  rows={6}
                  value={bulkTextInput}
                  onChange={(e) => setBulkTextInput(e.target.value)}
                  placeholder={`Contoh:\nKelas 10-D\nKelas 10-E\nKelas 11 IPS 1\nKelas 11 IPS 2\nKelas 12 IPS 1`}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3.5 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-indigo-500 resize-y"
                ></textarea>

                {/* Live parsed badges */}
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-slate-400">
                    Terdeteksi: <strong className="text-indigo-400 font-mono">{parsedClassNames.length} kelas</strong>
                    {duplicatesCount > 0 && (
                      <span className="text-amber-400 ml-2">({duplicatesCount} sudah ada/duplikat diabaikan)</span>
                    )}
                  </span>
                  <span className="text-emerald-400 font-semibold font-mono">
                    +{newClassesToAdd.length} kelas baru
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Jenjang / Fase:
                  </label>
                  <select
                    value={bulkGradeLevel}
                    onChange={(e) => setBulkGradeLevel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Fase E (Kelas 10)">Fase E (Kelas 10)</option>
                    <option value="Fase F (Kelas 11)">Fase F (Kelas 11)</option>
                    <option value="Fase F (Kelas 12)">Fase F (Kelas 12)</option>
                    <option value="Tingkat SMP / Sederajat">Tingkat SMP / Sederajat</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Tahun Ajaran:
                  </label>
                  <input
                    type="text"
                    value={bulkAcademicYear}
                    onChange={(e) => setBulkAcademicYear(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBulkAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={newClassesToAdd.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-bold text-white shadow-lg disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Tambahkan ({newClassesToAdd.length}) Kelas Massal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Kelas Massal */}
      {showConfirmDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md glass-card-elevated rounded-3xl p-6 border border-rose-500/40 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-white">Konfirmasi Hapus Kelas Massal</h3>
              <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                Anda akan menghapus <strong>{selectedClassIds.length} kelas</strong> dari sistem. Catatan nilai siswa yang sudah ada di arsip tetap aman dan tidak akan terhapus.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg"
              >
                Ya, Hapus {selectedClassIds.length} Kelas
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
