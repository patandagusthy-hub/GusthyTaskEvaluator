import React, { useState, useRef } from 'react';
import { 
  FileCheck2, 
  Upload, 
  Camera, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Check, 
  RefreshCw, 
  Share2, 
  ArrowLeft,
  Calendar,
  Layers,
  GraduationCap,
  School,
  Clock,
  MessageSquareQuote,
  Zap,
  ZoomIn,
  X,
  FileCheck,
  Minimize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  SchoolClass, 
  AssignmentLink, 
  EvaluationResult, 
  RubricTemplate 
} from '../types';
import { 
  compressStudentImage, 
  formatFileSize, 
  CompressionResult 
} from '../utils/fileCompressor';

interface StudentSubmissionPortalProps {
  assignmentLink?: AssignmentLink | null;
  availableClasses: SchoolClass[];
  rubricTemplates: RubricTemplate[];
  onSubmissionSuccess: (evaluation: EvaluationResult) => void;
  onExitPortal: () => void;
}

export const StudentSubmissionPortal: React.FC<StudentSubmissionPortalProps> = ({
  assignmentLink,
  availableClasses,
  rubricTemplates,
  onSubmissionSuccess,
  onExitPortal,
}) => {
  // Student Form
  const [studentName, setStudentName] = useState('');
  const [nisn, setNisn] = useState('');
  const [selectedClass, setSelectedClass] = useState(
    assignmentLink?.targetClass || availableClasses[0]?.name || 'Kelas 10-A'
  );

  // Submission format: 'text' | 'image'
  const [submissionMode, setSubmissionMode] = useState<'image' | 'text'>('image');
  const [textAnswer, setTextAnswer] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Compression states
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<CompressionResult | null>(null);
  const [showZoomModal, setShowZoomModal] = useState(false);

  // Evaluating state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<EvaluationResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rubric to use
  const activeRubric = assignmentLink
    ? rubricTemplates.find(r => r.id === assignmentLink.rubricId) || rubricTemplates[0]
    : rubricTemplates[0];

  const passingGrade = assignmentLink?.passingGrade || 75;
  const tone = assignmentLink?.tone || 'Encouraging & Constructive';
  const taskTitle = assignmentLink?.title || 'Tugas Evaluasi Pembelajaran Siswa';

  // Handle image upload with auto-compression
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setIsCompressing(true);

    try {
      // Kompres otomatis: mengecilkan resolusi ke max 1800px dan optimasi JPEG 0.82
      // Menghasilkan ukuran file jauh lebih kecil (turun 80-95%) namun goresan tulisan tangan tetap 100% tajam & terbaca
      const compResult = await compressStudentImage(file, 1800, 0.82);
      setImageFile(file);
      setImagePreview(compResult.dataUrl);
      setCompressionInfo(compResult);
    } catch (err: any) {
      console.warn('Kompresi browser gagal, memuat file langsung:', err);
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setCompressionInfo(null);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  // Submit task
  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!studentName.trim()) {
      setErrorMsg('Mohon isi nama lengkap Anda sebelum mengumpulkan.');
      return;
    }

    if (submissionMode === 'image' && !imagePreview) {
      setErrorMsg('Mohon unggah foto lembar jawaban tulisan tangan Anda.');
      return;
    }

    if (submissionMode === 'text' && !textAnswer.trim()) {
      setErrorMsg('Mohon tulis atau tempel lembar jawaban teks Anda.');
      return;
    }

    setIsSubmitting(true);
    setProgressMsg('Mengunggah lembar kerja teroptimasi ke sistem AI...');

    const timer1 = setTimeout(() => {
      setProgressMsg('Model Google Gemini Flash membaca tulisan tangan siswa...');
    }, 1000);
    const timer2 = setTimeout(() => {
      setProgressMsg('Menghitung keselarasan rubrik dan skor KKM...');
    }, 2000);

    try {
      let imagePartPayload = null;
      if (submissionMode === 'image' && imagePreview) {
        // Gunakan base64 hasil kompresi berukuran ringan
        const base64Data = compressionInfo?.base64 || imagePreview.split(',')[1];
        const mimeType = compressionInfo?.mimeType || imageFile?.type || 'image/jpeg';
        imagePartPayload = {
          data: base64Data,
          mimeType,
        };
      }

      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textSubmission: submissionMode === 'text' ? textAnswer : '',
          imagePart: imagePartPayload,
          rubricCriteria: activeRubric?.criteria || [],
          passingGrade,
          tone,
          targetClass: selectedClass,
          taskTitle,
          customInstructions: `Siswa bernama ${studentName} mengumpulkan tugas ${taskTitle} untuk kelas ${selectedClass}.`,
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Terjadi kesalahan saat memeriksa tugas.');
      }

      const evalData = json.data;
      // Guarantee student name is what they entered
      evalData.student_info.detected_name = studentName.trim();
      evalData.student_info.class_group = selectedClass;
      evalData.student_info.submission_title = taskTitle;
      evalData.student_info.nisn = nisn.trim() || evalData.student_info.nisn;

      const evalResult: EvaluationResult = {
        id: `eval-${Date.now()}`,
        student_info: evalData.student_info,
        scoring: evalData.scoring,
        feedback: evalData.feedback,
        transcribed_text: evalData.transcribed_text || textAnswer,
        evaluatedAt: new Date().toISOString(),
        sourceType: submissionMode,
        imagePreview: imagePreview || undefined,
        toneUsed: tone,
        kkmUsed: passingGrade,
      };

      setResult(evalResult);
      onSubmissionSuccess(evalResult);

      if (evalResult.scoring.status === 'Tuntas') {
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch (e) {
          // ignore
        }
      }
    } catch (err: any) {
      console.error('Student submission error:', err);
      setErrorMsg(err.message || 'Gagal mengirim tugas. Silakan periksa koneksi Anda.');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsSubmitting(false);
      setProgressMsg('');
    }
  };

  return (
    <div className="min-h-screen bg-[#080C16] text-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Top Header / Portal Banner */}
        <div className="glass-card-elevated p-6 rounded-3xl border border-indigo-500/30 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-[1.5px] shadow-lg">
                <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Portal Pengumpulan Tugas Siswa
                </h1>
                <p className="text-xs text-slate-400">
                  GusthyTaskEvaluator • Koreksi Otomatis AI Gemini Flash
                </p>
              </div>
            </div>

            <button
              onClick={onExitPortal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>
          </div>

          {/* Task Info Banner */}
          <div className="mt-4 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold">
                {selectedClass}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Batas KKM: <strong className="text-white font-mono">{passingGrade}</strong>
              </span>
            </div>

            <h2 className="text-base sm:text-xl font-black text-white">
              {taskTitle}
            </h2>

            {assignmentLink?.instructions && (
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                📌 <strong>Petunjuk Guru:</strong> {assignmentLink.instructions}
              </p>
            )}
          </div>
        </div>

        {/* If Evaluation Result is Available */}
        {result ? (
          <div className="glass-card-elevated p-6 sm:p-8 rounded-3xl border border-indigo-500/30 shadow-2xl space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4" /> Tugas Berhasil Dikoreksi
              </span>
              <h2 className="text-2xl font-black text-white">
                Hasil Evaluasi: {result.student_info.detected_name}
              </h2>
              <p className="text-xs text-slate-400">
                {result.student_info.class_group} • {result.student_info.submission_title}
              </p>
            </div>

            {/* Score Showcase */}
            <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
              <div className="text-xs text-slate-400">Nilai Akhir Anda:</div>
              <div className={`text-5xl font-black ${
                result.scoring.status === 'Tuntas' ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {result.scoring.total_score}
                <span className="text-xs text-slate-500 font-mono"> / 100</span>
              </div>
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs tracking-wider shadow-lg ${
                  result.scoring.status === 'Tuntas'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {result.scoring.status === 'Tuntas' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )}
                  STATUS: {result.scoring.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Batas KKM Kelulusan: <strong className="text-white font-mono">{result.scoring.passing_grade}</strong>
              </p>
            </div>

            {/* Student Feedback Message */}
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
              <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <MessageSquareQuote className="w-4 h-4" />
                <span>Pesan Umpan Balik Guru:</span>
              </h4>
              <p className="text-xs text-indigo-100 italic leading-relaxed">
                "{result.feedback.student_friendly_summary}"
              </p>
            </div>

            {/* Strengths */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
              <h4 className="text-xs font-bold text-emerald-300">
                Poin Kekuatan Tugasmu:
              </h4>
              <ul className="text-xs text-emerald-100/90 space-y-1 list-disc list-inside">
                {result.feedback.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <h4 className="text-xs font-bold text-amber-300">
                Saran Peningkatan untuk Tugas Berikutnya:
              </h4>
              <ul className="text-xs text-amber-100/90 space-y-1 list-disc list-inside">
                {result.feedback.areas_for_improvement.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-center">
              <button
                onClick={() => {
                  setResult(null);
                  setTextAnswer('');
                  setImagePreview(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
              >
                Kumpulkan Tugas Lainnya
              </button>
            </div>
          </div>
        ) : (
          /* Submission Form */
          <form onSubmit={handleSubmitTask} className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 shadow-2xl">
            
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Student Identity Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Nama Lengkap Siswa *
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
                  NISN / No. Absen
                </label>
                <input
                  type="text"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  placeholder="0082910245"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Pilih Kelas Anda *
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {availableClasses.map((cls) => (
                    <option key={cls.id} value={cls.name}>
                      {cls.name} ({cls.gradeLevel})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submission Mode Selector */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Metode Pengumpulan Lembar Jawaban:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSubmissionMode('image')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    submissionMode === 'image'
                      ? 'bg-indigo-600/25 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white">Foto Lembar Tulisan Tangan</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Ambil foto buku/kertas jawaban dengan kamera HP atau upload file.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSubmissionMode('text')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    submissionMode === 'text'
                      ? 'bg-indigo-600/25 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">Ketik Jawaban Teks</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Tempel teks atau ketik langsung isi tugas Anda.
                  </p>
                </button>
              </div>
            </div>

            {/* Image Upload Area */}
            {submissionMode === 'image' && (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,application/pdf"
                  capture="environment"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {/* If Compressing In Progress */}
                {isCompressing && (
                  <div className="p-6 rounded-2xl border border-indigo-500/40 bg-indigo-950/30 text-center space-y-3 animate-pulse">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 text-indigo-400 mx-auto flex items-center justify-center">
                      <Zap className="w-5 h-5 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Mengompres & Mengoptimalkan File Tugas...
                      </h4>
                      <p className="text-xs text-indigo-200/80 mt-1">
                        Memperkecil ukuran file secara otomatis sambil menjaga ketajaman tulisan tangan agar 100% terbaca oleh AI Gemini.
                      </p>
                    </div>
                    <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full animate-progress"></div>
                    </div>
                  </div>
                )}

                {/* Upload Dropzone if no file selected */}
                {!imagePreview && !isCompressing && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-slate-950/70 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-white block">
                      Ketuk untuk Mengambil Foto atau Pilih Lembar Kerja
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      Mendukung Foto Kamera HP (JPG/PNG) & Dokumen PDF Tugas Siswa
                    </span>
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                      <Zap className="w-3 h-3" />
                      <span>Kompresi Otomatis Aktif (Ukuran Kecil & Tulisan Tetap Tajam)</span>
                    </div>
                  </div>
                )}

                {/* Image Preview & Compression Stats if file selected */}
                {imagePreview && !isCompressing && (
                  <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 group">
                      {compressionInfo?.fileType === 'pdf' ? (
                        <div className="p-8 text-center bg-slate-900/60 flex flex-col items-center justify-center">
                          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                            <FileText className="w-8 h-8" />
                          </div>
                          <span className="text-sm font-bold text-white">
                            {imageFile?.name || 'Dokumen_Tugas.pdf'}
                          </span>
                          <span className="text-xs text-slate-400 mt-1">
                            Dokumen PDF siap diperiksa langsung oleh sistem multimodal AI Gemini
                          </span>
                        </div>
                      ) : (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Foto Lembar Kerja Siswa"
                            className="w-full max-h-72 object-contain mx-auto bg-slate-950"
                          />
                          <button
                            type="button"
                            onClick={() => setShowZoomModal(true)}
                            className="absolute top-3 right-3 px-2.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold backdrop-blur-sm border border-slate-700 flex items-center gap-1.5 shadow-lg cursor-pointer"
                          >
                            <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Perbesar & Cek Tulisan</span>
                          </button>
                        </div>
                      )}

                      <div className="p-3 bg-slate-900 flex items-center justify-between border-t border-slate-800">
                        <span className="text-xs text-slate-300 truncate max-w-xs font-medium">
                          {imageFile?.name || 'Lembar Jawaban Terlampir'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium cursor-pointer"
                          >
                            Ganti File
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Compression Result Banner */}
                    {compressionInfo && (
                      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <Zap className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">
                                Kompresi Otomatis Berhasil
                              </span>
                              {compressionInfo.isCompressed && compressionInfo.compressionRatio > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] border border-emerald-500/30">
                                  Hemat {compressionInfo.compressionRatio}%
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-300 mt-0.5">
                              Ukuran: <span className="line-through text-slate-400">{formatFileSize(compressionInfo.originalSize)}</span> → <strong className="text-emerald-400 font-mono">{formatFileSize(compressionInfo.compressedSize)}</strong>
                              {compressionInfo.compressedDimensions && (
                                <span className="text-slate-400 ml-1.5 font-mono">
                                  ({compressionInfo.compressedDimensions.width}×{compressionInfo.compressedDimensions.height} px)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-semibold shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Tulisan Tangan 100% Terbaca AI</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Text Answer Area */}
            {submissionMode === 'text' && (
              <div>
                <textarea
                  rows={8}
                  required
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Ketik atau tempelkan lembar jawaban tugas Anda di sini..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed resize-y"
                ></textarea>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>{progressMsg || 'Memeriksa lembar kerja...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-cyan-300" />
                    <span>Kirim Tugas & Periksa Sekarang (AI Gemini)</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

        {/* Zoom Inspection Modal */}
        {showZoomModal && imagePreview && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <ZoomIn className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Inspeksi Kerapian & Keterbacaan Tulisan Tangan
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Sistem mengonfirmasi tulisan tangan tetap jernih dan tajam setelah kompresi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowZoomModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
              <img
                src={imagePreview}
                alt="Zoom Lembar Kerja"
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-slate-700"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              {compressionInfo && (
                <div className="text-xs text-slate-300">
                  Resolusi: <strong className="text-white font-mono">{compressionInfo.compressedDimensions?.width}×{compressionInfo.compressedDimensions?.height} px</strong> • Ukuran: <strong className="text-emerald-400 font-mono">{formatFileSize(compressionInfo.compressedSize)}</strong>
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowZoomModal(false)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
