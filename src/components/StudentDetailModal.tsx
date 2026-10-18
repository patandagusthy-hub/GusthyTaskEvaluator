import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Download, 
  Share2, 
  Printer, 
  BookOpen, 
  Calendar,
  Layers,
  MessageSquareQuote
} from 'lucide-react';
import { EvaluationResult } from '../types';

interface StudentDetailModalProps {
  evaluation: EvaluationResult | null;
  isOpen: boolean;
  onClose: () => void;
  onEditIdentity: (evaluation: EvaluationResult) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  evaluation,
  isOpen,
  onClose,
  onEditIdentity,
}) => {
  if (!isOpen || !evaluation) return null;

  const [activeTab, setActiveTab] = useState<'visual' | 'json' | 'ocr'>('visual');
  const [copied, setCopied] = useState(false);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(evaluation, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl glass-card-elevated rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-2xl space-y-6 my-auto">
        
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Laporan Evaluasi Pembelajaran Siswa
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                {evaluation.student_info.class_group}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              {evaluation.student_info.detected_name}
            </h2>
            <p className="text-xs text-slate-400">
              {evaluation.student_info.submission_title}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs tracking-wider shadow-lg ${
              evaluation.scoring.status === 'Tuntas'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
            }`}>
              {evaluation.scoring.status === 'Tuntas' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <span>{evaluation.scoring.status.toUpperCase()}</span>
            </span>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Score & KKM Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
          <div>
            <span className="text-[11px] text-slate-400 block">Total Skor:</span>
            <span className={`text-3xl font-black ${
              evaluation.scoring.status === 'Tuntas' ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {evaluation.scoring.total_score}
            </span>
            <span className="text-xs text-slate-500 font-mono"> / 100</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block">Batas KKM:</span>
            <span className="text-2xl font-bold text-white font-mono mt-0.5 block">
              {evaluation.scoring.passing_grade}
            </span>
            <span className="text-[10px] text-slate-500">Standar Kelulusan</span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block">Persona Tone:</span>
            <span className="text-xs font-bold text-indigo-300 mt-1 block">
              {evaluation.toneUsed}
            </span>
            <span className="text-[10px] text-slate-500">Gaya Bahasa Feedback</span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
          <button
            onClick={() => setActiveTab('visual')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'visual' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Rincian Rubrik & Umpan Balik
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'json' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            JSON Baku
          </button>
          <button
            onClick={() => setActiveTab('ocr')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === 'ocr' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Transkripsi Teks / OCR
          </button>
        </div>

        {/* Tab Content: Visual */}
        {activeTab === 'visual' && (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            
            {/* Criteria Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Detail Skor Kriteria:
              </h4>
              {evaluation.scoring.rubric_breakdown.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">{item.criterion}</span>
                    <span className="font-mono font-bold text-indigo-400">
                      {item.score} / {item.max_score}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {item.notes}
                  </p>
                </div>
              ))}
            </div>

            {/* Strengths */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
              <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Poin Keunggulan (Strengths):</span>
              </h4>
              <ul className="space-y-1 text-xs text-emerald-100/90 list-disc list-inside">
                {evaluation.feedback.strengths.map((str, i) => (
                  <li key={i}>{str}</li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
              <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Aspek Perlu Ditingkatkan:</span>
              </h4>
              <ul className="space-y-1 text-xs text-amber-100/90 list-disc list-inside">
                {evaluation.feedback.areas_for_improvement.map((area, i) => (
                  <li key={i}>{area}</li>
                ))}
              </ul>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
              <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <MessageSquareQuote className="w-3.5 h-3.5" />
                <span>Pesan Motivasi Siswa:</span>
              </h4>
              <p className="text-xs text-indigo-100 italic leading-relaxed">
                "{evaluation.feedback.student_friendly_summary}"
              </p>
            </div>

          </div>
        )}

        {/* Tab Content: JSON */}
        {activeTab === 'json' && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button
                onClick={handleCopyJson}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Disalin' : 'Salin JSON'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-cyan-300 font-mono overflow-x-auto max-h-80 leading-relaxed">
              {JSON.stringify({
                student_info: evaluation.student_info,
                scoring: evaluation.scoring,
                feedback: evaluation.feedback,
              }, null, 2)}
            </pre>
          </div>
        )}

        {/* Tab Content: OCR */}
        {activeTab === 'ocr' && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed">
            {evaluation.transcribed_text || 'Tidak ada teks OCR tersimpan.'}
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onEditIdentity(evaluation);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white font-semibold transition-colors"
          >
            Edit Identitas Siswa
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Lembar Umpan Balik</span>
          </button>
        </div>

      </div>
    </div>
  );
};
