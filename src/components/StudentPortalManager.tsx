import React, { useState } from 'react';
import { 
  Link2, 
  Plus, 
  Copy, 
  Check, 
  Share2, 
  QrCode, 
  ExternalLink, 
  Trash2, 
  Calendar, 
  Clock, 
  Layers, 
  Sliders, 
  BookOpen, 
  MessageCircle,
  Eye,
  CheckCircle2,
  X,
  Zap
} from 'lucide-react';
import { AssignmentLink, SchoolClass, RubricTemplate, ToneMode } from '../types';

interface StudentPortalManagerProps {
  assignmentLinks: AssignmentLink[];
  onAddAssignmentLink: (link: AssignmentLink) => void;
  onDeleteAssignmentLink: (id: string) => void;
  onToggleLinkActive: (id: string) => void;
  classes: SchoolClass[];
  rubrics: RubricTemplate[];
  onOpenStudentPortalTest: (link: AssignmentLink) => void;
}

export const StudentPortalManager: React.FC<StudentPortalManagerProps> = ({
  assignmentLinks,
  onAddAssignmentLink,
  onDeleteAssignmentLink,
  onToggleLinkActive,
  classes,
  rubrics,
  onOpenStudentPortalTest,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedQrLink, setSelectedQrLink] = useState<AssignmentLink | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  // Form states for creating a new link
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Bahasa Indonesia');
  const [targetClass, setTargetClass] = useState(classes[0]?.name || 'Kelas 10-A');
  const [rubricId, setRubricId] = useState(rubrics[0]?.id || '');
  const [passingGrade, setPassingGrade] = useState(75);
  const [tone, setTone] = useState<ToneMode>('Encouraging & Constructive');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Get baseUrl
  const getFullSubmissionUrl = (link: AssignmentLink) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    return `${origin}${path}?portal=submit&token=${encodeURIComponent(link.token)}&class=${encodeURIComponent(link.targetClass)}`;
  };

  // Copy link handler
  const handleCopyLink = (link: AssignmentLink) => {
    const url = getFullSubmissionUrl(link);
    navigator.clipboard.writeText(url);
    setCopiedLinkId(link.id);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  // Share to WhatsApp
  const handleShareWhatsApp = (link: AssignmentLink) => {
    const url = getFullSubmissionUrl(link);
    const text = `*PEMBERITAHUAN TUGAS SISWA*\n` +
      `Kelas: ${link.targetClass}\n` +
      `Tugas: *${link.title}*\n` +
      `Mata Pelajaran: ${link.subject}\n` +
      `Batas KKM: ${link.passingGrade}\n` +
      (link.dueDate ? `Batas Waktu: ${link.dueDate}\n` : '') +
      `\nSilakan kumpulkan foto tulisan tangan atau ketikan jawaban lembar kerja kalian pada link berikut:\n${url}\n\n` +
      `_Sistem AI GusthyTaskEvaluator akan memeriksa dan memberikan skor otomatis._`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  // Submit create new link
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const token = `TASK-${targetClass.replace(/\s+/g, '')}-${randomSuffix}`;

    const newLink: AssignmentLink = {
      id: `link-${Date.now()}`,
      title: title.trim(),
      subject: subject.trim(),
      targetClass,
      rubricId,
      passingGrade,
      tone,
      instructions: instructions.trim() || undefined,
      dueDate: dueDate || undefined,
      token,
      active: true,
      createdAt: new Date().toISOString(),
    };

    onAddAssignmentLink(newLink);
    setShowCreateModal(false);
    setTitle('');
    setInstructions('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card-elevated p-6 rounded-3xl border border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Link2 className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Link Pengumpulan Tugas Siswa
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-300">
            Kirimkan tautan ini kepada siswa melalui WhatsApp grup kelas atau tayangkan QR code di proyektor kelas.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Link Tugas Baru</span>
        </button>
      </div>

      {/* Auto-compression Info Banner */}
      <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs flex items-center gap-2">
              <span>Fitur Kompresi Otomatis Aktif di Portal Siswa</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                Hemat Kuota & Cepat
              </span>
            </h4>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Foto lembar kerja tulisan tangan berukuran besar (5MB–15MB) otomatis dikompres ke ukuran ~300KB di ponsel siswa sebelum diunggah. Resolusi dan ketajaman tulisan tetap 100% terbaca jelas oleh sistem AI Gemini.
            </p>
          </div>
        </div>
        <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/20 shrink-0">
          ✓ Tulisan Tangan Terjaga
        </span>
      </div>

      {/* Assignment Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assignmentLinks.map((link) => {
          const fullUrl = getFullSubmissionUrl(link);
          const isCopied = copiedLinkId === link.id;

          return (
            <div
              key={link.id}
              className={`glass-panel p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                link.active ? 'border-slate-800 hover:border-cyan-500/40' : 'border-slate-800/40 opacity-60'
              }`}
            >
              <div className="space-y-4">
                
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold border border-cyan-500/30">
                      {link.targetClass} • {link.subject}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">
                      {link.title}
                    </h3>
                  </div>

                  <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-[11px] text-emerald-400 font-mono font-bold shrink-0">
                    KKM {link.passingGrade}
                  </span>
                </div>

                {/* Instructions if present */}
                {link.instructions && (
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {link.instructions}
                  </p>
                )}

                {/* Link URL Box */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-cyan-300 truncate select-all">
                    {fullUrl}
                  </span>
                  <button
                    onClick={() => handleCopyLink(link)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
                    title="Salin Link Siswa"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    Batas: {link.dueDate || 'Tanpa Batas Waktu'}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    Token: {link.token}
                  </span>
                </div>

              </div>

              {/* Action Buttons Footer */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyLink(link)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
                    <span>{isCopied ? 'Tersalin' : 'Salin Link'}</span>
                  </button>

                  <button
                    onClick={() => handleShareWhatsApp(link)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-semibold flex items-center gap-1 border border-emerald-500/30 transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => setSelectedQrLink(link)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Tampilkan QR Code / Proyektor"
                  >
                    <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenStudentPortalTest(link)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1"
                    title="Uji Halaman Pengumpulan Siswa"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Uji Buka</span>
                  </button>

                  <button
                    onClick={() => onDeleteAssignmentLink(link.id)}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400"
                    title="Hapus Link"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Buat Link Tugas Baru */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl glass-card-elevated rounded-3xl p-6 sm:p-8 border border-indigo-500/40 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Buat Link Pengumpulan Tugas Baru</h3>
                  <p className="text-xs text-slate-400">
                    Tautan langsung bagi siswa untuk mengumpulkan tugas mandiri
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Judul Tugas Siswa *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Teks Deskripsi Wisata Sejarah Lokal"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Mata Pelajaran:
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Bahasa Indonesia"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Target Kelas:
                  </label>
                  <select
                    value={targetClass}
                    onChange={(e) => setTargetClass(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.name}>{cls.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Rubrik Penilaian Aktif:
                  </label>
                  <select
                    value={rubricId}
                    onChange={(e) => setRubricId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {rubrics.map((r) => (
                      <option key={r.id} value={r.id}>{r.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Batas KKM Kelulusan:
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="95"
                    value={passingGrade}
                    onChange={(e) => setPassingGrade(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Persona Tone Feedback:
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Encouraging & Constructive">Encouraging & Constructive</option>
                    <option value="Academic & Rigorous">Academic & Rigorous</option>
                    <option value="Direct & Actionable">Direct & Actionable</option>
                    <option value="Socratic & Inquisitive">Socratic & Inquisitive</option>
                    <option value="Gentle / Remedial-Friendly">Gentle / Remedial-Friendly</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Batas Waktu Pengumpulan (Opsional):
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Petunjuk / Instruksi untuk Siswa (Opsional):
                </label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Contoh: Tulis di kertas bergaris, foto tegak lurus dengan pencahayaan cukup..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-xs font-bold text-white shadow-lg flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Terbitkan Link Pengumpulan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QR Code & Proyektor Display */}
      {selectedQrLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md glass-card-elevated rounded-3xl p-6 sm:p-8 border border-cyan-500/40 shadow-2xl space-y-5 text-center">
            
            <button
              onClick={() => setSelectedQrLink(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 text-xs font-bold">
              Scan untuk Mengumpulkan Tugas
            </span>

            <div>
              <h3 className="text-xl font-black text-white">{selectedQrLink.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{selectedQrLink.targetClass} • KKM {selectedQrLink.passingGrade}</p>
            </div>

            {/* Simulated 3D QR Code Box with dynamic SVG representation */}
            <div className="p-6 rounded-3xl bg-white mx-auto inline-block shadow-2xl border-4 border-cyan-400">
              <svg 
                className="w-48 h-48 mx-auto" 
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* QR Pattern visual */}
                <rect width="100" height="100" fill="white" />
                {/* Top-left marker */}
                <rect x="10" y="10" width="24" height="24" fill="black" />
                <rect x="14" y="14" width="16" height="16" fill="white" />
                <rect x="18" y="18" width="8" height="8" fill="black" />
                {/* Top-right marker */}
                <rect x="66" y="10" width="24" height="24" fill="black" />
                <rect x="70" y="14" width="16" height="16" fill="white" />
                <rect x="74" y="18" width="8" height="8" fill="black" />
                {/* Bottom-left marker */}
                <rect x="10" y="66" width="24" height="24" fill="black" />
                <rect x="14" y="70" width="16" height="16" fill="white" />
                <rect x="18" y="74" width="8" height="8" fill="black" />
                {/* Data bits */}
                <rect x="42" y="14" width="6" height="6" fill="black" />
                <rect x="52" y="14" width="6" height="6" fill="black" />
                <rect x="42" y="24" width="6" height="6" fill="black" />
                <rect x="52" y="32" width="6" height="6" fill="black" />
                <rect x="20" y="44" width="6" height="6" fill="black" />
                <rect x="30" y="44" width="6" height="6" fill="black" />
                <rect x="40" y="44" width="6" height="6" fill="black" />
                <rect x="50" y="44" width="6" height="6" fill="black" />
                <rect x="64" y="44" width="6" height="6" fill="black" />
                <rect x="74" y="44" width="6" height="6" fill="black" />
                <rect x="44" y="60" width="8" height="8" fill="black" />
                <rect x="60" y="60" width="8" height="8" fill="black" />
                <rect x="72" y="60" width="8" height="8" fill="black" />
                <rect x="44" y="76" width="8" height="8" fill="black" />
                <rect x="60" y="76" width="8" height="8" fill="black" />
                <rect x="74" y="76" width="8" height="8" fill="black" />
              </svg>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 select-all">
              Token Tugas: <strong>{selectedQrLink.token}</strong>
            </div>

            <p className="text-[11px] text-slate-400">
              Siswa dapat membuka kamera ponsel untuk scan QR ini atau mengakses link pengumpulan secara langsung.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handleCopyLink(selectedQrLink)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5 text-indigo-400" />
                <span>Salin Tautan</span>
              </button>
              <button
                onClick={() => {
                  const link = selectedQrLink;
                  setSelectedQrLink(null);
                  onOpenStudentPortalTest(link);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Sebagai Siswa</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
