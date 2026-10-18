import React, { useState, useRef, useEffect } from 'react';
import { 
  FileCheck2, 
  Upload, 
  Camera, 
  FileText, 
  Sparkles, 
  Sliders, 
  Brain, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Download, 
  Edit3, 
  RefreshCw, 
  Share2, 
  Printer, 
  Layers, 
  BookOpen, 
  HelpCircle,
  Eye,
  Trash2,
  ExternalLink,
  Save,
  MessageSquareQuote,
  Zap,
  ZoomIn
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  EvaluationResult, 
  RubricTemplate, 
  ToneMode, 
  RubricCriterion,
  SchoolClass
} from '../types';
import { INITIAL_RUBRIC_TEMPLATES, DEMO_PRESET_TASKS } from '../data/mockData';
import { 
  compressStudentImage, 
  formatFileSize, 
  CompressionResult 
} from '../utils/fileCompressor';

interface EvaluatorWorkspaceProps {
  onSaveEvaluationToArchive: (evaluation: EvaluationResult) => void;
  rubricTemplates: RubricTemplate[];
  onOpenIdentityEditor: (evaluation: EvaluationResult) => void;
  presetTaskIndex?: number | null;
  onClearPresetTaskIndex?: () => void;
  defaultPassingGrade?: number;
  defaultTone?: ToneMode;
  enableConfetti?: boolean;
  classes?: SchoolClass[];
}

export const EvaluatorWorkspace: React.FC<EvaluatorWorkspaceProps> = ({
  onSaveEvaluationToArchive,
  rubricTemplates,
  onOpenIdentityEditor,
  presetTaskIndex,
  onClearPresetTaskIndex,
  defaultPassingGrade = 75,
  defaultTone = 'Encouraging & Constructive',
  enableConfetti = true,
  classes = [],
}) => {
  // Input mode: 'text' | 'image'
  const [inputMode, setInputMode] = useState<'text' | 'image'>('text');

  // Input states
  const [textSubmission, setTextSubmission] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [targetClass, setTargetClass] = useState('Kelas 10-A');
  const [taskTitle, setTaskTitle] = useState('Teks Deskripsi & Narasi');

  // Rubric & Configuration
  const [selectedRubricId, setSelectedRubricId] = useState<string>(rubricTemplates[0]?.id || '');
  const [passingGrade, setPassingGrade] = useState<number>(defaultPassingGrade);
  const [selectedTone, setSelectedTone] = useState<ToneMode>(defaultTone);
  const [customInstructions, setCustomInstructions] = useState('');

  // Evaluation states
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalProgressStep, setEvalProgressStep] = useState<string>('');
  const [evalError, setEvalError] = useState<string | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<'visual' | 'json' | 'transcription'>('visual');
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Compression states
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<CompressionResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load preset task if requested
  useEffect(() => {
    if (presetTaskIndex !== undefined && presetTaskIndex !== null && DEMO_PRESET_TASKS[presetTaskIndex]) {
      const preset = DEMO_PRESET_TASKS[presetTaskIndex];
      setInputMode('text');
      setTextSubmission(preset.sampleContent);
      setTargetClass(preset.classGroup);
      setTaskTitle(preset.title);
      setSelectedRubricId(preset.rubricId);
      setSelectedTone(preset.tone);
      setPassingGrade(preset.passingGrade);
      setEvaluationResult(null);

      if (onClearPresetTaskIndex) {
        onClearPresetTaskIndex();
      }
    }
  }, [presetTaskIndex]);

  // Active rubric object
  const activeRubric = rubricTemplates.find(r => r.id === selectedRubricId) || rubricTemplates[0];

  // Process and compress uploaded image/file
  const processUploadedFile = async (file: File) => {
    setIsCompressing(true);
    setEvalError(null);
    try {
      const comp = await compressStudentImage(file, 1800, 0.82);
      setImageFile(file);
      setImagePreview(comp.dataUrl);
      setCompressionInfo(comp);
    } catch (err: any) {
      console.warn('Fallback direct image loading:', err);
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

  // Image Upload handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  // Drag and drop image
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.pdf'))) {
      processUploadedFile(file);
    }
  };

  // Load sample demo task
  const handleLoadDemoTask = (idx: number) => {
    const preset = DEMO_PRESET_TASKS[idx];
    if (!preset) return;
    setInputMode('text');
    setTextSubmission(preset.sampleContent);
    setTargetClass(preset.classGroup);
    setTaskTitle(preset.title);
    setSelectedRubricId(preset.rubricId);
    setSelectedTone(preset.tone);
    setPassingGrade(preset.passingGrade);
    setImagePreview(null);
    setImageFile(null);
  };

  // Execute Evaluation via Server API
  const handleEvaluate = async () => {
    if (inputMode === 'text' && !textSubmission.trim()) {
      setEvalError('Harap masukkan teks lembar kerja siswa atau pilih contoh sampel.');
      return;
    }
    if (inputMode === 'image' && !imagePreview) {
      setEvalError('Harap unggah foto lembar jawaban tulisan tangan siswa.');
      return;
    }

    setIsEvaluating(true);
    setEvalError(null);
    setEvaluationResult(null);

    // Multi-step progress visualizer
    setEvalProgressStep('Menginisialisasi Model Google Gemini Flash...');
    const stepTimer1 = setTimeout(() => {
      setEvalProgressStep('Membaca lembar kerja multimodal & ekstraksi OCR tulisan tangan...');
    }, 800);
    const stepTimer2 = setTimeout(() => {
      setEvalProgressStep('Menganalisis kriteria rubrik & menghitung kalkulasi skor KKM...');
    }, 1800);
    const stepTimer3 = setTimeout(() => {
      setEvalProgressStep('Menyusun umpan balik pedagogis & struktur JSON standar...');
    }, 2800);

    try {
      let imagePartPayload = null;
      if (inputMode === 'image' && imagePreview) {
        // extract base64 data without prefix (using compressed base64 if available)
        const base64Data = compressionInfo?.base64 || imagePreview.split(',')[1];
        const mimeType = compressionInfo?.mimeType || imageFile?.type || 'image/jpeg';
        imagePartPayload = {
          data: base64Data,
          mimeType,
        };
      }

      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          textSubmission: inputMode === 'text' ? textSubmission : '',
          imagePart: imagePartPayload,
          rubricCriteria: activeRubric?.criteria || [],
          passingGrade,
          tone: selectedTone,
          customInstructions,
          targetClass,
          taskTitle,
        }),
      });

      const jsonResponse = await response.json();

      if (!response.ok || !jsonResponse.success) {
        throw new Error(jsonResponse.error || 'Gagal mengevaluasi tugas siswa.');
      }

      const evalData = jsonResponse.data;
      const finalResult: EvaluationResult = {
        id: `eval-${Date.now()}`,
        student_info: evalData.student_info,
        scoring: evalData.scoring,
        feedback: evalData.feedback,
        transcribed_text: evalData.transcribed_text || textSubmission,
        evaluatedAt: new Date().toISOString(),
        sourceType: inputMode,
        imagePreview: imagePreview || undefined,
        toneUsed: selectedTone,
        kkmUsed: passingGrade,
      };

      setEvaluationResult(finalResult);
      onSaveEvaluationToArchive(finalResult);

      // Trigger Confetti if Tuntas and enabled in settings
      if (finalResult.scoring.status === 'Tuntas' && enableConfetti) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {
          // ignore if canvas-confetti environment issue
        }
      }
    } catch (err: any) {
      console.error('Evaluation Error:', err);
      setEvalError(err.message || 'Terjadi gangguan saat memproses evaluasi AI. Silakan coba lagi.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setIsEvaluating(false);
      setEvalProgressStep('');
    }
  };

  // Copy JSON handler
  const handleCopyJson = () => {
    if (!evaluationResult) return;
    const jsonStr = JSON.stringify({
      student_info: evaluationResult.student_info,
      scoring: evaluationResult.scoring,
      feedback: evaluationResult.feedback,
    }, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Copy Student Summary
  const handleCopySummary = () => {
    if (!evaluationResult) return;
    const summaryText = `*LAPORAN HASIL PENILAIAN TUGAS*
Siswa: ${evaluationResult.student_info.detected_name}
Kelas: ${evaluationResult.student_info.class_group}
Tugas: ${evaluationResult.student_info.submission_title}
Nilai Akhir: ${evaluationResult.scoring.total_score} (KKM: ${evaluationResult.scoring.passing_grade})
Status: ${evaluationResult.scoring.status.toUpperCase()}

*Catatan & Umpan Balik Guru:*
"${evaluationResult.feedback.student_friendly_summary}"

_GusthyTaskEvaluator AI Engine_`;
    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  // Download JSON file
  const handleDownloadJson = () => {
    if (!evaluationResult) return;
    const jsonStr = JSON.stringify(evaluationResult, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluasi_${evaluationResult.student_info.detected_name.replace(/\s+/g, '_')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner Workspace Header */}
      <div className="glass-card-elevated p-6 sm:p-8 rounded-3xl border border-indigo-500/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                <FileCheck2 className="w-6 h-6" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Ruang Kerja Penilai AI Multimodal
              </h1>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              Evaluasi lembar kerja teks atau foto tulisan tangan berbasis kriteria rubrik objektif & KKM.
            </p>
          </div>

          {/* Quick Demo Preload Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 mr-1">Muat Cepat Sampel:</span>
            <button
              onClick={() => handleLoadDemoTask(0)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs text-indigo-300 font-medium transition-all"
            >
              📝 Teks Deskripsi
            </button>
            <button
              onClick={() => handleLoadDemoTask(1)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs text-violet-300 font-medium transition-all"
            >
              🔬 Sains Biologi
            </button>
            <button
              onClick={() => handleLoadDemoTask(2)}
              className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs text-amber-300 font-medium transition-all"
            >
              ⚠️ Uji Tanpa Nama
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Input Lembar Kerja & Parameter (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Input Mode Selection */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>1. Masukkan Lembar Kerja Siswa</span>
              </h3>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setInputMode('text')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    inputMode === 'text'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Teks / Ketikan
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('image')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    inputMode === 'image'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Foto Tulisan Tangan / OCR
                </button>
              </div>
            </div>

            {/* Input Mode: Text */}
            {inputMode === 'text' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Tempelkan lembar jawaban teks siswa beserta header (jika ada):</span>
                  <span>{textSubmission.length} karakter</span>
                </div>
                <textarea
                  value={textSubmission}
                  onChange={(e) => setTextSubmission(e.target.value)}
                  rows={9}
                  placeholder="Contoh:&#10;NAMA SISWA: Amanda Putri&#10;KELAS: Kelas 10-A&#10;JUDUL TUGAS: Analisis Teks Deskripsi...&#10;&#10;Isi jawaban siswa..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed resize-y"
                ></textarea>
                <p className="text-[11px] text-slate-500">
                  Tip: Jika nama siswa tidak disertakan di lembar kerja, AI akan otomatis menandainya sebagai <strong>Unidentified Student #REC-XXXX</strong> dan nomor resi acak.
                </p>
              </div>
            )}

            {/* Input Mode: Image */}
            {inputMode === 'image' && (
              <div className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*,application/pdf"
                  className="hidden"
                />

                {isCompressing && (
                  <div className="p-6 rounded-2xl border border-indigo-500/40 bg-indigo-950/30 text-center space-y-3 animate-pulse">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 text-indigo-400 mx-auto flex items-center justify-center">
                      <Zap className="w-5 h-5 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Mengompres & Mengoptimalkan File Siswa...
                      </h4>
                      <p className="text-xs text-indigo-200/80 mt-1">
                        Memperkecil ukuran file secara otomatis sambil menjaga ketajaman tulisan tangan agar 100% terbaca oleh AI Gemini.
                      </p>
                    </div>
                  </div>
                )}

                {!imagePreview && !isCompressing ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-indigo-500/80 rounded-2xl p-8 text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-slate-950/70 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Camera className="w-7 h-7" />
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">
                      Unggah Foto Lembar Tulisan Tangan Siswa
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mb-3">
                      Seret & lepas foto lembar jawaban tulisan tangan atau klik untuk memilih file dari komputer / ponsel.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-semibold border border-slate-700">
                        Format JPG, PNG, WEBP, PDF
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                        <Zap className="w-3 h-3" /> Kompresi Otomatis Aktif
                      </span>
                    </div>
                  </div>
                ) : imagePreview && !isCompressing ? (
                  <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 group">
                      <img
                        src={imagePreview}
                        alt="Preview Lembar Kerja Siswa"
                        className="w-full max-h-80 object-contain mx-auto"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Ganti File
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                            setCompressionInfo(null);
                          }}
                          className="px-3 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Hapus
                        </button>
                      </div>
                      <div className="p-2.5 bg-slate-900/90 text-xs text-slate-300 flex items-center justify-between border-t border-slate-800">
                        <span className="truncate max-w-[200px]">{imageFile?.name || 'Foto Lembar Tulisan Tangan'}</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                          <Check className="w-3 h-3" /> Siap Dievaluasi
                        </span>
                      </div>
                    </div>

                    {/* Compression Banner */}
                    {compressionInfo && (
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <Zap className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">
                                Terkompresi Otomatis
                              </span>
                              {compressionInfo.isCompressed && compressionInfo.compressionRatio > 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] border border-emerald-500/30">
                                  Hemat {compressionInfo.compressionRatio}%
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-300 mt-0.5">
                              {formatFileSize(compressionInfo.originalSize)} → <strong className="text-emerald-400 font-mono">{formatFileSize(compressionInfo.compressedSize)}</strong>
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
                ) : null}

                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2.5">
                  <Brain className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                  <p>
                    <strong>Penalaran Multimodal Gemini Flash:</strong> Sistem otomatis mengompresi gambar tanpa merusak resolusi optik tulisan tangan siswa. Tulisan tangan sedikit miring atau pensil tipis tetap dapat dianalisis dengan akurat.
                  </p>
                </div>
              </div>
            )}

            {/* Optional Metadata Context */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Target Kelas (Acuan Konteks):
                </label>
                <input
                  type="text"
                  list="registered-classes-list"
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  placeholder="Contoh: Kelas 10-A"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <datalist id="registered-classes-list">
                  {classes.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Judul Penugasan:
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Contoh: Teks Deskripsi Objek Wisata"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

          </div>

          {/* Section 2: Rubrik, KKM & Tone Configuration */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <Sliders className="w-4 h-4 text-violet-400" />
              <span>2. Standar Rubrik, KKM & Gaya Umpan Balik</span>
            </h3>

            {/* Rubric Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Pilih Rubrik Penilaian Aktif:
              </label>
              <select
                value={selectedRubricId}
                onChange={(e) => setSelectedRubricId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {rubricTemplates.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.subject} - {r.gradeLevel})
                  </option>
                ))}
              </select>

              {/* Active criteria chips */}
              {activeRubric && (
                <div className="mt-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-400 mb-1">
                    Kriteria Aktif ({activeRubric.criteria.length} Aspek):
                  </div>
                  {activeRubric.criteria.map((c, i) => (
                    <div key={c.id || i} className="flex items-center justify-between text-xs text-slate-300">
                      <span className="truncate max-w-[280px]">
                        {i + 1}. {c.name}
                      </span>
                      <span className="font-mono text-indigo-400 font-bold shrink-0">
                        Maks {c.maxScore} poin
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* KKM Slider */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white">Batas KKM (Passing Grade):</span>
                  <p className="text-[11px] text-slate-400">
                    Skor &lt; KKM = <strong className="text-rose-400">Remedial</strong> | Skor ≥ KKM = <strong className="text-emerald-400">Tuntas</strong>
                  </p>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 font-mono font-black text-base">
                  {passingGrade}
                </div>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="1"
                value={passingGrade}
                onChange={(e) => setPassingGrade(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>50</span>
                <span>65</span>
                <span className="text-indigo-400 font-bold">75 (Standar Nasional)</span>
                <span>85</span>
                <span>95</span>
              </div>
            </div>

            {/* 5 Tone of Voice Persona Modes */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Tone of Voice Umpan Balik (5 Persona Guru):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                
                {/* 1. Encouraging & Constructive */}
                <button
                  type="button"
                  onClick={() => setSelectedTone('Encouraging & Constructive')}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    selectedTone === 'Encouraging & Constructive'
                      ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Encouraging & Constructive</span>
                    <span className="text-[10px] text-indigo-400 font-semibold">(Default)</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Apresiasi kekuatan siswa dulu, lalu beri saran ramah.
                  </p>
                </button>

                {/* 2. Academic & Rigorous */}
                <button
                  type="button"
                  onClick={() => setSelectedTone('Academic & Rigorous')}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    selectedTone === 'Academic & Rigorous'
                      ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold text-white">Academic & Rigorous</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Formal, analitis, ketepatan istilah & kaidah ilmiah.
                  </p>
                </button>

                {/* 3. Direct & Actionable */}
                <button
                  type="button"
                  onClick={() => setSelectedTone('Direct & Actionable')}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    selectedTone === 'Direct & Actionable'
                      ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold text-white">Direct & Actionable</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Ringkas, langsung ke poin perbaikan konkret.
                  </p>
                </button>

                {/* 4. Socratic & Inquisitive */}
                <button
                  type="button"
                  onClick={() => setSelectedTone('Socratic & Inquisitive')}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    selectedTone === 'Socratic & Inquisitive'
                      ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold text-white">Socratic & Inquisitive</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Pertanyaan reflektif untuk pemahaman mandiri siswa.
                  </p>
                </button>

                {/* 5. Gentle / Remedial-Friendly */}
                <button
                  type="button"
                  onClick={() => setSelectedTone('Gentle / Remedial-Friendly')}
                  className={`sm:col-span-2 p-2.5 rounded-xl text-left border transition-all ${
                    selectedTone === 'Gentle / Remedial-Friendly'
                      ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Gentle / Remedial-Friendly</span>
                    <span className="text-[10px] text-emerald-400 font-semibold">Suportif & Hangat</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Lembut, tidak menghakimi, sangat suportif mendampingi siswa yang butuh perbaikan.
                  </p>
                </button>

              </div>
            </div>

            {/* Custom Teacher Note */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Instruksi Khusus Guru (Opsional):
              </label>
              <input
                type="text"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Misal: Beri penekanan ekstra pada penggunaan tanda baca titik koma."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Error Message if any */}
            {evalError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{evalError}</span>
              </div>
            )}

            {/* Big Action Submit Button */}
            <button
              type="button"
              onClick={handleEvaluate}
              disabled={isEvaluating}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-black text-sm sm:text-base shadow-xl shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer"
            >
              {isEvaluating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>{evalProgressStep || 'Memproses Evaluasi Multimodal...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Koreksi & Evaluasi Tugas Siswa (Gemini Flash)</span>
                </>
              )}
            </button>

          </div>

        </div>

        {/* Right Column: Evaluation Results & Reports (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {evaluationResult ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              {/* Result Container Card */}
              <div className="glass-card-elevated rounded-3xl p-6 border border-indigo-500/30 shadow-2xl space-y-6 relative overflow-hidden">
                
                {/* Ambient glow behind card */}
                <div className={`absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl pointer-events-none ${
                  evaluationResult.scoring.status === 'Tuntas' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                }`}></div>

                {/* Header: Student Identity & 1-Click Fallback */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 block">
                        Identitas Siswa Terdeteksi
                      </span>
                      <h2 className="text-xl font-black text-white mt-0.5 flex items-center gap-2">
                        <span>{evaluationResult.student_info.detected_name}</span>
                        {evaluationResult.student_info.detected_name.toLowerCase().includes('unidentified') && (
                          <button
                            onClick={() => onOpenIdentityEditor(evaluationResult)}
                            title="Ganti identitas dengan 1-klik"
                            className="p-1 rounded-md bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </h2>
                    </div>

                    {/* 3D Floating Status Badge */}
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs tracking-wider shadow-lg ${
                        evaluationResult.scoring.status === 'Tuntas'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-emerald-500/20'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-rose-500/20'
                      }`}>
                        {evaluationResult.scoring.status === 'Tuntas' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                        )}
                        <span>{evaluationResult.scoring.status.toUpperCase()}</span>
                      </span>
                    </div>
                  </div>

                  {/* Warning banner if Unidentified Student */}
                  {evaluationResult.student_info.detected_name.toLowerCase().includes('unidentified') && (
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Nama siswa tidak ditemukan pada lembar kerja.</span>
                      </div>
                      <button
                        onClick={() => onOpenIdentityEditor(evaluationResult)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px] shrink-0"
                      >
                        Ganti 1-Klik
                      </button>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 pt-1">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                      Kelas: <strong>{evaluationResult.student_info.class_group}</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
                      Tugas: <strong>{evaluationResult.student_info.submission_title}</strong>
                    </span>
                  </div>
                </div>

                {/* Score Gauge & Summary Card */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Total Skor Akhir:</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className={`text-4xl font-black ${
                        evaluationResult.scoring.status === 'Tuntas' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {evaluationResult.scoring.total_score}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">/ 100</span>
                    </div>
                  </div>

                  <div className="text-right text-xs space-y-1">
                    <div className="text-slate-400">
                      Nilai KKM Acuan: <strong className="text-white font-mono">{evaluationResult.scoring.passing_grade}</strong>
                    </div>
                    <div className="text-slate-400">
                      Selisih KKM: {' '}
                      <strong className={
                        evaluationResult.scoring.total_score >= evaluationResult.scoring.passing_grade 
                          ? 'text-emerald-400' 
                          : 'text-rose-400'
                      }>
                        {evaluationResult.scoring.total_score >= evaluationResult.scoring.passing_grade ? '+' : ''}
                        {evaluationResult.scoring.total_score - evaluationResult.scoring.passing_grade} poin
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Tabs for Visual vs Raw JSON */}
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
                  <button
                    onClick={() => setActiveResultTab('visual')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      activeResultTab === 'visual'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Visual Rapor
                  </button>
                  <button
                    onClick={() => setActiveResultTab('json')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      activeResultTab === 'json'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Raw JSON Standar
                  </button>
                  <button
                    onClick={() => setActiveResultTab('transcription')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      activeResultTab === 'transcription'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Hasil OCR Teks
                  </button>
                </div>

                {/* TAB 1: Visual Rapor */}
                {activeResultTab === 'visual' && (
                  <div className="space-y-5">
                    
                    {/* Rubric Breakdown */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Rincian Skor Per Kriteria Rubrik:
                      </h4>

                      {evaluationResult.scoring.rubric_breakdown.map((item, idx) => {
                        const pct = Math.round((item.score / item.max_score) * 100);
                        return (
                          <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-white">{item.criterion}</span>
                              <span className="font-mono font-bold text-indigo-400">
                                {item.score} / {item.max_score}
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  pct >= 75 ? 'bg-emerald-400' : pct >= 60 ? 'bg-amber-400' : 'bg-rose-400'
                                }`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              ></div>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                              {item.notes}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Feedback: Strengths */}
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                      <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Poin Keunggulan Siswa (Strengths):</span>
                      </h4>
                      <ul className="space-y-1.5 text-xs text-emerald-100/90 list-disc list-inside">
                        {evaluationResult.feedback.strengths.map((str, i) => (
                          <li key={i}>{str}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Feedback: Areas for Improvement */}
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                      <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Aspek Perlu Ditingkatkan (Areas for Improvement):</span>
                      </h4>
                      <ul className="space-y-1.5 text-xs text-amber-100/90 list-disc list-inside">
                        {evaluationResult.feedback.areas_for_improvement.map((area, i) => (
                          <li key={i}>{area}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Student Friendly Summary */}
                    <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                      <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                        <MessageSquareQuote className="w-3.5 h-3.5" />
                        <span>Ringkasan Umpan Balik untuk Siswa ({evaluationResult.toneUsed}):</span>
                      </h4>
                      <p className="text-xs text-indigo-100 italic leading-relaxed">
                        "{evaluationResult.feedback.student_friendly_summary}"
                      </p>
                    </div>

                  </div>
                )}

                {/* TAB 2: Raw JSON */}
                {activeResultTab === 'json' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>Format Standar JSON Evaluasi:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopyJson}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1"
                        >
                          {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedJson ? 'Disalin!' : 'Salin JSON'}</span>
                        </button>
                        <button
                          onClick={handleDownloadJson}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Unduh .json</span>
                        </button>
                      </div>
                    </div>

                    <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-cyan-300 font-mono overflow-x-auto max-h-96 leading-relaxed">
                      {JSON.stringify({
                        student_info: evaluationResult.student_info,
                        scoring: evaluationResult.scoring,
                        feedback: evaluationResult.feedback,
                      }, null, 2)}
                    </pre>
                  </div>
                )}

                {/* TAB 3: Transcription OCR */}
                {activeResultTab === 'transcription' && (
                  <div className="space-y-3">
                    <div className="text-xs text-slate-400">
                      Teks Hasil Ekstraksi / OCR Lembar Kerja Siswa:
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed">
                      {evaluationResult.transcribed_text || 'Tidak ada data teks transkripsi.'}
                    </div>
                  </div>
                )}

                {/* Quick Action Footer */}
                <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={handleCopySummary}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{copiedSummary ? 'Ringkasan Disalin!' : 'Salin Format WA'}</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Cetak Lembar Umpan Balik</span>
                  </button>
                </div>

              </div>

            </div>
          ) : (
            /* Empty State Placeholder */
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center floating-3d">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">
                Hasil Evaluasi AI Akan Muncul di Sini
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Silakan isi teks tugas siswa atau unggah foto lembar tulisan tangan di sebelah kiri, lalu klik <strong>Koreksi & Evaluasi Tugas Siswa</strong>.
              </p>
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 text-left space-y-1.5">
                <div className="font-semibold text-slate-300">Kemampuan Otomatis:</div>
                <div className="text-emerald-400">✓ Deteksi otomatis Nama, NISN & Kelas</div>
                <div className="text-cyan-400">✓ Resi Unidentified Student jika tanpa nama</div>
                <div className="text-indigo-400">✓ Ekstraksi Rubrik & Logika KKM (Tuntas vs Remedial)</div>
                <div className="text-violet-400">✓ 5 Pilihan Gaya Bahasa Umpan Balik Pedagogis</div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
