import React, { useState, useRef } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Check, 
  Sliders, 
  Award, 
  ArrowRight,
  Layers,
  Sparkles,
  Upload,
  FileText,
  FileSpreadsheet,
  FileCode,
  File,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Download,
  Info,
  X
} from 'lucide-react';
import { RubricTemplate, RubricCriterion } from '../types';

interface RubricManagerProps {
  rubrics: RubricTemplate[];
  onAddRubric: (rubric: RubricTemplate) => void;
  onDeleteRubric?: (rubricId: string) => void;
  onSelectRubricForEvaluator: (rubricId: string) => void;
}

export const RubricManager: React.FC<RubricManagerProps> = ({
  rubrics,
  onAddRubric,
  onDeleteRubric,
  onSelectRubricForEvaluator,
}) => {
  // Mode: 'list' | 'manual' | 'upload'
  const [activeMode, setActiveMode] = useState<'list' | 'manual' | 'upload'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('Semua');

  // Manual Form States
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newGradeLevel, setNewGradeLevel] = useState('Fase E (Kelas 10)');
  const [newPassingGrade, setNewPassingGrade] = useState(75);
  const [criteriaList, setCriteriaList] = useState<RubricCriterion[]>([
    { id: '1', name: 'Keselarasan Isi dengan Topik & Instruksi', maxScore: 35, description: 'Kesesuaian seluruh substansi tugas dengan instruksi dan topik yang dipilih.' },
    { id: '2', name: 'Keruntutan Alur & Struktur Teks/Jawaban', maxScore: 30, description: 'Kohesi, koherensi, organisasi pemikiran, dan sistematika penyampaian.' },
    { id: '3', name: 'Akurasi Konsep, Kebahasaan & Logika', maxScore: 35, description: 'Ketepatan terminologi, tata bahasa baku, dan penalaran argumen.' },
  ]);

  // Upload Rubric File States (Word .doc/.docx, PDF, Excel .xlsx/.xls/.csv)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState<string>('');
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [extractedRubricPreview, setExtractedRubricPreview] = useState<RubricTemplate | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [rubricToDelete, setRubricToDelete] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalMaxScore = criteriaList.reduce((acc, curr) => acc + (Number(curr.maxScore) || 0), 0);

  // Filter rubrics
  const subjects = ['Semua', ...Array.from(new Set(rubrics.map(r => r.subject)))];
  const filteredRubrics = rubrics.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.gradeLevel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSubject = selectedSubjectFilter === 'Semua' || r.subject === selectedSubjectFilter;
    return matchSearch && matchSubject;
  });

  // Manual criteria handlers
  const handleAddCriterion = () => {
    setCriteriaList([
      ...criteriaList,
      {
        id: `crit-${Date.now()}`,
        name: '',
        maxScore: 20,
        description: '',
      },
    ]);
  };

  const handleRemoveCriterion = (id: string) => {
    if (criteriaList.length <= 1) return;
    setCriteriaList(criteriaList.filter(c => c.id !== id));
  };

  const handleUpdateCriterion = (id: string, field: keyof RubricCriterion, val: any) => {
    setCriteriaList(
      criteriaList.map(c => (c.id === id ? { ...c, [field]: val } : c))
    );
  };

  // Save manual rubric
  const handleSaveManualRubric = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSubject.trim()) return;

    const newTemplate: RubricTemplate = {
      id: `rubric-${Date.now()}`,
      title: newTitle.trim(),
      subject: newSubject.trim(),
      gradeLevel: newGradeLevel.trim(),
      passingGrade: newPassingGrade,
      criteria: criteriaList.map(c => ({
        ...c,
        maxScore: Number(c.maxScore) || 10,
      })),
    };

    onAddRubric(newTemplate);
    setActiveMode('list');
    setNewTitle('');
    setNewSubject('');
  };

  // Handle file selection (Word, Excel, PDF)
  const handleFileSelect = (file: File) => {
    setExtractionError(null);
    setExtractedRubricPreview(null);

    const validExtensions = ['.doc', '.docx', '.pdf', '.xlsx', '.xls', '.csv'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      setExtractionError('Format file tidak didukung. Harap unggah file Word (.doc, .docx), PDF (.pdf), atau Excel (.xlsx, .xls, .csv).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setExtractionError('Ukuran file terlalu besar. Maksimal 20 MB.');
      return;
    }

    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      setFileBase64(base64Data);
    };
    reader.onerror = () => {
      setExtractionError('Gagal membaca file dari perangkat.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Call /api/parse-rubric using Gemini Flash
  const handleExtractRubricWithAI = async () => {
    if (!uploadedFile || !fileBase64) {
      setExtractionError('Silakan pilih file rubrik terlebih dahulu.');
      return;
    }

    setIsExtracting(true);
    setExtractionError(null);
    setExtractionProgress('Mengunggah dokumen ke AI Engine...');

    try {
      setTimeout(() => setExtractionProgress('Membaca struktur tabel dan teks rubrik...'), 1200);
      setTimeout(() => setExtractionProgress('Mengekstrak kriteria, bobot, dan indikator...'), 2400);

      const response = await fetch('/api/parse-rubric', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileData: fileBase64,
          fileName: uploadedFile.name,
          mimeType: uploadedFile.type || 'application/octet-stream',
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Gagal mengekstrak rubrik dengan AI.');
      }

      const parsed = resData.data || resData.rubric;
      if (!parsed) {
        throw new Error('Format respon rubrik tidak valid.');
      }
      const extractedCriteria: RubricCriterion[] = (parsed.criteria || []).map((c: any, index: number) => ({
        id: `crit-ext-${Date.now()}-${index}`,
        name: c.name || `Kriteria ${index + 1}`,
        maxScore: Number(c.maxScore) || 20,
        description: c.description || 'Sesuai indikator ketercapaian rubrik.',
      }));

      const newTemplate: RubricTemplate = {
        id: `rubric-ext-${Date.now()}`,
        title: parsed.title || uploadedFile.name.replace(/\.[^/.]+$/, ''),
        subject: parsed.subject || 'Mata Pelajaran',
        gradeLevel: parsed.gradeLevel || 'Fase E (Kelas 10)',
        passingGrade: Number(parsed.passingGrade) || 75,
        criteria: extractedCriteria.length > 0 ? extractedCriteria : [
          { id: 'c1', name: 'Kesesuaian Instruksi Tugas', maxScore: 50, description: 'Kesesuaian tugas dengan instruksi dokumen.' },
          { id: 'c2', name: 'Kerapian dan Sistematika Jawaban', maxScore: 50, description: 'Sistematika dan alur jawaban.' }
        ],
      };

      setExtractedRubricPreview(newTemplate);
      setExtractionProgress('Ekstraksi berhasil!');
    } catch (err: any) {
      console.error('Error parsing rubric file:', err);
      setExtractionError(err.message || 'Terjadi kesalahan saat memproses file rubrik dengan AI.');
    } finally {
      setIsExtracting(false);
    }
  };

  // Save extracted rubric to Bank
  const handleSaveExtractedRubric = () => {
    if (!extractedRubricPreview) return;
    onAddRubric(extractedRubricPreview);
    setUploadedFile(null);
    setFileBase64(null);
    setExtractedRubricPreview(null);
    setActiveMode('list');
  };

  // Download Sample Excel/CSV Template
  const handleDownloadSampleExcel = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "No,Nama Kriteria Penilaian,Bobot Skor Maksimal,Deskripsi Indikator Ketercapaian\n" +
      "1,Pemahaman Konsep & Kedalaman Analisis,35,Siswa menguasai materi dengan argumen mendalam dan berbasis fakta\n" +
      "2,Keruntutan Alur & Struktur Teks,30,Penyusunan paragraf rapi dengan transisi logis antar argumen\n" +
      "3,Ketepatan Kaidah Bahasa & Terminologi,35,Ejaan baku sesuai PUEBI dan penggunaan istilah teknis yang tepat\n";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Template_Rubrik_Penilaian_GusthyTask.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper file icon & color
  const getFileIcon = (fileName: string) => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.doc') || lower.endsWith('.docx')) {
      return <FileText className="w-8 h-8 text-blue-400" />;
    }
    if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) {
      return <FileSpreadsheet className="w-8 h-8 text-emerald-400" />;
    }
    if (lower.endsWith('.pdf')) {
      return <File className="w-8 h-8 text-rose-400" />;
    }
    return <FileCode className="w-8 h-8 text-indigo-400" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-card-elevated p-6 sm:p-8 rounded-3xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <BookOpen className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Bank Rubrik & Standar KKM
            </h1>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Pusat manajemen kriteria rubrik penugasan. Anda dapat mengunggah file rubrik siap pakai dalam format 
            <strong className="text-blue-300"> Word (.docx/.doc)</strong>, 
            <strong className="text-rose-300"> PDF (.pdf)</strong>, atau 
            <strong className="text-emerald-300"> Excel (.xlsx/.xls/.csv)</strong> dengan ekstraksi otomatis ditenagai AI Gemini Flash.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={() => setActiveMode(activeMode === 'upload' ? 'list' : 'upload')}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-lg ${
              activeMode === 'upload'
                ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/30 ring-2 ring-cyan-400'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/20'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{activeMode === 'upload' ? 'Tutup Upload' : 'Upload File Rubrik (Word/PDF/Excel)'}</span>
          </button>

          <button
            onClick={() => setActiveMode(activeMode === 'manual' ? 'list' : 'manual')}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-lg ${
              activeMode === 'manual'
                ? 'bg-indigo-500 text-white shadow-indigo-500/30 ring-2 ring-indigo-400'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/30'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{activeMode === 'manual' ? 'Tutup Formulir' : 'Buat Rubrik Manual'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: UPLOAD FILE RUBRIK (WORD, PDF, EXCEL) WITH AI AUTO-EXTRACTION */}
      {/* ========================================================================= */}
      {activeMode === 'upload' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/40 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">
                  Unggah Dokumen Rubrik Akademik (AI Multi-Format Parser)
                </h3>
                <p className="text-xs text-slate-400">
                  Didukung format: Microsoft Word (.docx, .doc), Adobe PDF (.pdf), Excel / CSV (.xlsx, .xls, .csv).
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadSampleExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-emerald-500/30"
              title="Unduh contoh template rubrik berformat Excel / CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Contoh Format Excel (.csv)</span>
            </button>
          </div>

          {/* Drag & Drop File Upload Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`relative rounded-3xl border-2 border-dashed p-8 transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
              isDragOver
                ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
                : uploadedFile
                ? 'border-emerald-500/60 bg-emerald-950/20'
                : 'border-slate-700 bg-slate-900/60 hover:border-cyan-500/50 hover:bg-slate-900/80'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              accept=".docx,.doc,.pdf,.xlsx,.xls,.csv,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              className="hidden"
            />

            {!uploadedFile ? (
              <div className="space-y-4 max-w-md">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                    <File className="w-6 h-6" />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    Klik untuk memilih file atau seret ke area ini
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Word (.docx, .doc) • Adobe PDF (.pdf) • Microsoft Excel (.xlsx, .xls) • CSV (.csv)
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-[11px] text-slate-400">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AI Gemini Flash akan otomatis mengenali kriteria, skor maksimal, dan deskripsi</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-2xl bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-4 text-left">
                  {getFileIcon(uploadedFile.name)}
                  <div>
                    <h4 className="text-sm font-bold text-white break-all">
                      {uploadedFile.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ukuran: {(uploadedFile.size / 1024).toFixed(1)} KB • Siap diproses
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFile(null);
                      setFileBase64(null);
                      setExtractedRubricPreview(null);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                    title="Ganti File"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    disabled={isExtracting}
                    onClick={handleExtractRubricWithAI}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {isExtracting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Mengekstrak AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-slate-950" />
                        <span>Mulai Ekstraksi AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Progress / Status feedback */}
          {isExtracting && (
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 flex items-center gap-3 animate-pulse">
              <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin shrink-0" />
              <div>
                <p className="text-xs font-bold text-cyan-200">Sedang Menganalisis Dokumen Rubrik</p>
                <p className="text-[11px] text-cyan-400/80">{extractionProgress}</p>
              </div>
            </div>
          )}

          {extractionError && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 flex items-start gap-3 text-rose-200 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Gagal Mengekstrak Rubrik</p>
                <p className="mt-0.5">{extractionError}</p>
              </div>
            </div>
          )}

          {/* Extracted Rubric Preview & Editable Form */}
          {extractedRubricPreview && (
            <div className="space-y-6 pt-4 border-t border-slate-800 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">
                    Hasil Ekstraksi AI — Tinjau & Sesuaikan Kriteria
                  </h4>
                </div>
                <span className="text-xs text-slate-400">
                  Total Bobot: <strong className="text-emerald-400 font-mono text-sm">
                    {extractedRubricPreview.criteria.reduce((a, b) => a + Number(b.maxScore), 0)} / 100
                  </strong>
                </span>
              </div>

              {/* Basic Info Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Judul Rubrik:
                  </label>
                  <input
                    type="text"
                    value={extractedRubricPreview.title}
                    onChange={(e) => setExtractedRubricPreview({ ...extractedRubricPreview, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Mata Pelajaran:
                  </label>
                  <input
                    type="text"
                    value={extractedRubricPreview.subject}
                    onChange={(e) => setExtractedRubricPreview({ ...extractedRubricPreview, subject: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Batas KKM:
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={extractedRubricPreview.passingGrade}
                    onChange={(e) => setExtractedRubricPreview({ ...extractedRubricPreview, passingGrade: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Extracted Criteria List */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 block">
                  Kriteria Penilaian yang Berhasil Dikenali ({extractedRubricPreview.criteria.length} Aspek):
                </span>

                {extractedRubricPreview.criteria.map((c, idx) => (
                  <div key={c.id || idx} className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                      {idx + 1}
                    </span>

                    <div className="flex-1 w-full sm:w-auto">
                      <input
                        type="text"
                        value={c.name}
                        onChange={(e) => {
                          const updated = [...extractedRubricPreview.criteria];
                          updated[idx] = { ...updated[idx], name: e.target.value };
                          setExtractedRubricPreview({ ...extractedRubricPreview, criteria: updated });
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                        placeholder="Nama kriteria"
                      />
                      <input
                        type="text"
                        value={c.description}
                        onChange={(e) => {
                          const updated = [...extractedRubricPreview.criteria];
                          updated[idx] = { ...updated[idx], description: e.target.value };
                          setExtractedRubricPreview({ ...extractedRubricPreview, criteria: updated });
                        }}
                        className="w-full bg-transparent border-0 text-[11px] text-slate-400 mt-1 focus:ring-0 placeholder-slate-600"
                        placeholder="Deskripsi indikator"
                      />
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="text-[11px] text-slate-400">Bobot:</span>
                      <input
                        type="number"
                        min="5"
                        max="100"
                        value={c.maxScore}
                        onChange={(e) => {
                          const updated = [...extractedRubricPreview.criteria];
                          updated[idx] = { ...updated[idx], maxScore: Number(e.target.value) };
                          setExtractedRubricPreview({ ...extractedRubricPreview, criteria: updated });
                        }}
                        className="w-16 bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-cyan-400 font-mono font-bold text-center"
                      />
                      {extractedRubricPreview.criteria.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = extractedRubricPreview.criteria.filter((_, i) => i !== idx);
                            setExtractedRubricPreview({ ...extractedRubricPreview, criteria: updated });
                          }}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40"
                          title="Hapus Kriteria"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons to save into Rubric Bank */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setExtractedRubricPreview(null);
                    setUploadedFile(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveExtractedRubric}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Rubrik ke Bank Data (Permanen)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: CREATE MANUAL RUBRIC FORM                                      */}
      {/* ========================================================================= */}
      {activeMode === 'manual' && (
        <form onSubmit={handleSaveManualRubric} className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/40 shadow-2xl space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Desain Rubrik Kustom Guru Manual</span>
            </h3>
            <span className="text-xs text-slate-400">
              Total Bobot: <strong className={totalMaxScore === 100 ? 'text-emerald-400 font-mono text-sm' : 'text-amber-400 font-mono text-sm'}>{totalMaxScore} / 100</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Judul Rubrik:
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Misal: Rubrik Esai Berpikir Kritis Sejarah"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Mata Pelajaran:
              </label>
              <input
                type="text"
                required
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Misal: Sejarah Indonesia"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Batas KKM:
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={newPassingGrade}
                onChange={(e) => setNewPassingGrade(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Criteria Builder */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                Daftar Aspek / Kriteria Penilaian:
              </span>
              <button
                type="button"
                onClick={handleAddCriterion}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Kriteria
              </button>
            </div>

            {criteriaList.map((c, index) => (
              <div key={c.id} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-mono font-bold shrink-0">
                  {index + 1}
                </span>

                <div className="flex-1 w-full sm:w-auto">
                  <input
                    type="text"
                    required
                    value={c.name}
                    onChange={(e) => handleUpdateCriterion(c.id, 'name', e.target.value)}
                    placeholder="Nama Kriteria (cth: Keruntutan Logika)"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500"
                  />
                  <input
                    type="text"
                    value={c.description}
                    onChange={(e) => handleUpdateCriterion(c.id, 'description', e.target.value)}
                    placeholder="Penjelasan deskripsi indikator rubrik..."
                    className="w-full bg-transparent border-0 text-[11px] text-slate-400 mt-1 focus:ring-0 placeholder-slate-600"
                  />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-[11px] text-slate-400">Bobot Maks:</span>
                  <input
                    type="number"
                    min="5"
                    max="100"
                    value={c.maxScore}
                    onChange={(e) => handleUpdateCriterion(c.id, 'maxScore', Number(e.target.value))}
                    className="w-16 bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-indigo-400 font-mono font-bold text-center"
                  />
                  {criteriaList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCriterion(c.id)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setActiveMode('list')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-bold text-white shadow-lg flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Rubrik ke Pustaka</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: RUBRIC SEARCH, FILTER & BANK LIST                               */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul rubrik atau mata pelajaran..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Subject Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0 ml-1" />
          {subjects.map(subj => (
            <button
              key={subj}
              onClick={() => setSelectedSubjectFilter(subj)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSubjectFilter === subj
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* Rubric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRubrics.map((rubric) => (
          <div
            key={rubric.id}
            className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/40 card-3d-hover transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold border border-indigo-500/20">
                    {rubric.subject} • {rubric.gradeLevel}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5 group-hover:text-indigo-300 transition-colors">
                    {rubric.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs text-emerald-400 font-mono font-bold">
                    KKM: {rubric.passingGrade}
                  </span>
                  {onDeleteRubric && rubrics.length > 1 && (
                    <button
                      onClick={() => setRubricToDelete(rubric.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-all opacity-0 group-hover:opacity-100"
                      title="Hapus Rubrik"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Criteria List */}
              <div className="space-y-2 mt-4">
                {rubric.criteria.map((c, i) => (
                  <div
                    key={c.id || i}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs flex items-center justify-between"
                  >
                    <div className="truncate max-w-[260px] text-slate-300">
                      <span className="text-slate-500 font-mono mr-1.5">{i + 1}.</span>
                      {c.name}
                    </div>
                    <span className="font-mono text-indigo-400 font-semibold shrink-0">
                      {c.maxScore} poin
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {rubric.criteria.length} kriteria terkalibrasi
              </span>
              <button
                onClick={() => onSelectRubricForEvaluator(rubric.id)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-semibold text-xs transition-all flex items-center gap-1.5 border border-indigo-500/30"
              >
                <span>Gunakan Rubrik Ini</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredRubrics.length === 0 && (
        <div className="text-center py-12 glass-panel rounded-3xl border border-slate-800 text-slate-400">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="font-bold text-slate-300">Tidak ada rubrik yang sesuai filter pencarian</p>
          <p className="text-xs text-slate-500 mt-1">Coba gunakan kata kunci lain atau unggah dokumen rubrik baru.</p>
        </div>
      )}

      {/* Confirmation Modal to Delete Rubric */}
      {rubricToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-rose-500/40 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-500/20">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Hapus Rubrik Penilaian?</h4>
                <p className="text-xs text-slate-400">Tindakan ini akan menghapus rubrik terpilih dari bank rubrik.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              Perhatian: Data evaluasi siswa yang telah menggunakan rubrik ini tidak akan terhapus.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRubricToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (onDeleteRubric && rubricToDelete) {
                    onDeleteRubric(rubricToDelete);
                  }
                  setRubricToDelete(null);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30"
              >
                Ya, Hapus Rubrik
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
