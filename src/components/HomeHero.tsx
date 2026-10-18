import React from 'react';
import { 
  Sparkles, 
  Brain, 
  FileCheck2, 
  BarChart3, 
  Sliders, 
  CheckCircle, 
  ArrowRight, 
  FileText, 
  Camera, 
  Layers, 
  ShieldAlert,
  Share2,
  Cpu,
  BookOpenCheck
} from 'lucide-react';

interface HomeHeroProps {
  onStartEvaluator: () => void;
  onGoToDashboard: () => void;
  onLoadDemoSample: (index: number) => void;
  onOpenStudentLinks?: () => void;
  onOpenBulkClasses?: () => void;
  onOpenRubrics?: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  onStartEvaluator,
  onGoToDashboard,
  onLoadDemoSample,
  onOpenStudentLinks,
  onOpenBulkClasses,
  onOpenRubrics,
}) => {
  return (
    <div className="relative pt-6 pb-20 overflow-hidden">
      
      {/* 3D Ambient Background Lights */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-indigo-600/20 via-purple-600/15 to-cyan-500/20 blur-[120px] pointer-events-none rounded-full"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Announcement Pill */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-lg shadow-indigo-500/10 hover:border-indigo-400/50 transition-all cursor-pointer">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Didukung Model Google Gemini Flash Tingkat Mahir</span>
            <span className="text-slate-500">|</span>
            <span className="text-indigo-400 font-bold">Multimodal AI 2026</span>
          </div>
        </div>

        {/* Hero Title and Subtitle */}
        <div className="mt-6 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
            Koreksi Tugas Siswa Lebih Cepat, <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
              Objektif & Berbasis KKM
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            <strong className="text-white">GusthyTaskEvaluator</strong> adalah asisten AI penilai lembar kerja siswa multimodal. Membaca lembar jawaban foto tulisan tangan, mengekstrak kriteria rubrik, menentukan status <span className="text-emerald-400 font-bold">Tuntas</span> vs <span className="text-rose-400 font-bold">Remedial</span>, serta menghasilkan feedback mendidik dan output JSON terstruktur.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onStartEvaluator}
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5"
            >
              <FileCheck2 className="w-5 h-5" />
              <span>Mulai Evaluasi Tugas Sekarang</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={onGoToDashboard}
              className="px-6 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm sm:text-base border border-slate-700/80 hover:border-slate-600 transition-all flex items-center gap-2 shadow-lg"
            >
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <span>Lihat Dashboard Analitik</span>
            </button>

            {onOpenStudentLinks && (
              <button
                onClick={onOpenStudentLinks}
                className="px-5 py-3.5 rounded-2xl bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 hover:text-cyan-200 font-semibold text-sm border border-cyan-500/30 hover:border-cyan-400 transition-all flex items-center gap-2 shadow-lg"
              >
                <span>🔗 Link Kumpul Tugas Siswa</span>
              </button>
            )}

            {onOpenBulkClasses && (
              <button
                onClick={onOpenBulkClasses}
                className="px-5 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-sm border border-slate-700/80 hover:border-slate-600 transition-all flex items-center gap-2 shadow-lg"
              >
                <span>👥 Kelola Kelas Massal</span>
              </button>
            )}

            {onOpenRubrics && (
              <button
                onClick={onOpenRubrics}
                className="px-5 py-3.5 rounded-2xl bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 hover:text-indigo-200 font-semibold text-sm border border-indigo-500/30 hover:border-indigo-400 transition-all flex items-center gap-2 shadow-lg"
              >
                <span>📁 Upload File Rubrik (Word/PDF/Excel)</span>
              </button>
            )}
          </div>

          {/* Demo Quick Samples Loader */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span>Uji Coba Cepat Sampel Tugas:</span>
            <button
              onClick={() => {
                onLoadDemoSample(0);
                onStartEvaluator();
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-indigo-500/30 hover:border-indigo-400 text-indigo-300 font-medium transition-all hover:bg-indigo-950/40"
            >
              📝 Esai Teks Deskripsi
            </button>
            <button
              onClick={() => {
                onLoadDemoSample(1);
                onStartEvaluator();
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-violet-500/30 hover:border-violet-400 text-violet-300 font-medium transition-all hover:bg-violet-950/40"
            >
              🔬 Praktikum Sains Biologi
            </button>
            <button
              onClick={() => {
                onLoadDemoSample(2);
                onStartEvaluator();
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-400 text-amber-300 font-medium transition-all hover:bg-amber-950/40"
            >
              ⚠️ Lembar Tanpa Identitas (Test Unidentified)
            </button>
          </div>
        </div>

        {/* 3D Showcase Card / Interactive Simulated Evaluation Preview */}
        <div className="mt-14 perspective-1000 max-w-5xl mx-auto">
          <div className="transform-style-3d glass-card-elevated rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden transition-all duration-500 hover:rotate-x-1">
            
            {/* Holographic Header Bar */}
            <div className="flex flex-wrap items-center justify-between pb-6 border-b border-slate-800 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Brain className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Alur Kerja Evaluasi AI Multimodal
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                      Otomatisasi Real-Time
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Dari pemindaian tulisan tangan hingga pelaporan umpan balik tuntas
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-slate-800 text-xs text-slate-300 border border-slate-700">
                  KKM Aktif: <strong className="text-white">75</strong>
                </span>
                <span className="px-3 py-1 rounded-lg bg-indigo-950 text-xs text-indigo-300 border border-indigo-800">
                  Tone: <strong>Encouraging</strong>
                </span>
              </div>
            </div>

            {/* 3D Interactive Interactive Stages Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              
              {/* Card 1: OCR & Header Parsing */}
              <div className="glass-card-glow rounded-2xl p-5 border border-indigo-500/20 relative group hover:border-indigo-400/50 transition-all">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold mb-3">
                  01
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Camera className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-sm font-bold text-white">OCR & Deteksi Identitas</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  Membaca foto tulisan tangan buram menggunakan penalaran konteks kalimat untuk mengenali kata yang kurang jelas.
                </p>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300">
                  <div className="text-emerald-400">✓ Nama: Farhan Dwi W.</div>
                  <div className="text-slate-400">✓ NISN: 0087612301</div>
                  <div className="text-slate-400">✓ Kelas: 10-B</div>
                </div>
              </div>

              {/* Card 2: Rubrik KKM & Scoring */}
              <div className="glass-card-glow rounded-2xl p-5 border border-violet-500/20 relative group hover:border-violet-400/50 transition-all">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center text-xs font-bold mb-3">
                  02
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Sliders className="w-4 h-4 text-violet-400" />
                  <h4 className="text-sm font-bold text-white">Penilaian Rubrik Objektif</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  Menghitung skor keruntutan struktur, ketepatan konsep & kebahasaan. Status Tuntas/Remedial dikalkulasi ketat.
                </p>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] space-y-1">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Total Skor:</span>
                    <strong className="text-emerald-400 font-bold text-sm">88 / 100</strong>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Status KKM (≥75):</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      TUNTAS
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: 5 Persona Tone Feedback & JSON */}
              <div className="glass-card-glow rounded-2xl p-5 border border-cyan-500/20 relative group hover:border-cyan-400/50 transition-all">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xs font-bold mb-3">
                  03
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-bold text-white">Feedback & Output JSON</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  Membedah kekuatan siswa, saran perbaikan konkret, dan menghasilkan JSON standar siap pakai untuk sistem rapor.
                </p>
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-cyan-300 truncate">
                  {`{"student_info":{...},"scoring":{...}}`}
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* 5 Distinctive Pillars Feature Grid */}
        <div className="mt-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Fitur Lengkap Sesuai Standar Evaluasi Akademik
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Dirancang untuk guru, dosen, dan penguji yang membutuhkan kecepatan tanpa mengorbankan kualitas penilaian pedagogis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/40 card-3d-hover transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Multimodal Tulisan Tangan & File Digital
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Menerima foto lembar kertas tulisan tangan, file dokumen (PDF/Word), hingga ketikan digital. OCR otomatis menranskripsi teks siswa untuk audit guru.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/40 card-3d-hover transition-all">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-4">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Fallback Resi "Unidentified Student"
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bila lembar jawaban sobek atau siswa lupa menuliskan nama, AI memberi penanda nomor resi unik (cth: #REC-4821) dengan opsi ganti identitas 1-klik.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/40 card-3d-hover transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Aturan KKM: Tuntas vs Remedial
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Skor dihitung proporsional pada skala 0–100. Jika total skor &lt; KKM (default 75), otomatis berstatus "Remedial"; jika ≥ KKM dinyatakan "Tuntas".
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/40 card-3d-hover transition-all">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                5 Mode Persona Tone of Voice
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pilih gaya feedback: Encouraging, Academic & Rigorous, Direct & Actionable, Socratic & Inquisitive, atau Gentle / Remedial-Friendly sesuai karakteristik siswa.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/40 card-3d-hover transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <BookOpenCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Bank Rubrik Mata Pelajaran
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dilengkapi pustaka rubrik siap pakai Kurikulum Merdeka (Teks Deskripsi, Praktikum Sains IPA, Pemecahan Masalah Matematika, Esai Bahasa Inggris) dan rubrik kustom.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-indigo-500/40 card-3d-hover transition-all">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                Ekspor JSON, Cetak & Kirim WA
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Salin hasil JSON terstruktur dengan 1 klik, cetak lembar umpan balik siswa berformat resmi, atau kirimkan ringkasan rapor via WhatsApp ke orang tua.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
