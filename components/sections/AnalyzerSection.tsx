'use client';
import { Suspense, lazy } from 'react';
import {
  Upload, FileText, Sparkles, ArrowRight,
  CheckCircle2, XCircle, Clipboard, AlertCircle
} from 'lucide-react';

const DropZone = lazy(() => import('@/components/DropZone'));

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-2xl bg-white/5 ${className}`} />
);

export default function AnalyzerSection({
  file, setFile,
  jd, setJd,
  loading,
  progress,
  onAnalyze,
}) {

  return (
    <section id="analyzer" className="py-12 md:py-24 relative flex flex-col items-center bg-black">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-20">

        {/* Header */}
        <div className="text-center mb-10 md:mb-12 animate-fade-in-up">
          <div className="badge mb-4">
            <Sparkles className="w-3 h-3" /> Live Analyzer
          </div>
          <h2 className="text-2xl md:text-5xl font-bold text-white mb-4">
            Analyze Your Resume{' '}
            <span className="gradient-text">Right Now</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm md:text-lg">
            Get your match score, keyword gaps, and personalized suggestions in under 30 seconds.
          </p>
        </div>

        {/* ── Input Panel ── */}
        <div className="glass-panel p-6 md:p-12 mb-10 bg-white/[0.01] border-white/5 shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* Resume Upload */}
            <div className="space-y-6 group">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-xl shadow-violet-600/20 group-hover:scale-110 transition-transform duration-500">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">Upload Resume</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PDF · DOCX · MAX 5MB</p>
                </div>
              </div>

              <div className="relative rounded-3xl overflow-hidden border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-all duration-500">
                <Suspense fallback={<Skeleton className="h-[180px]" />}>
                  <DropZone onFileSelect={setFile} file={file} />
                </Suspense>
              </div>

              {file && (
                <div className="flex items-center gap-3 px-5 py-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl animate-in zoom-in duration-500">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-sm font-bold text-emerald-400 truncate flex-1">{file.name}</span>
                  <button
                    onClick={() => setFile(null)}
                    className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Job Description */}
            <div className="space-y-6 group">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-xl shadow-cyan-600/20 group-hover:scale-110 transition-transform duration-500">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 flex justify-between items-center pr-2">
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">Requirement</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Paste the job description</p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        setJd(text);
                      } catch (err) {
                        console.error('Failed to read clipboard contents: ', err);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    Paste
                  </button>
                </div>
              </div>

              <div className="relative">
                <textarea
                  id="job-description"
                  placeholder="Paste the full job description here..."
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  className="min-h-[180px] w-full bg-white/[0.02] border-white/5 focus:border-violet-500/50 text-slate-300 placeholder:text-slate-700 p-6 rounded-3xl outline-none transition-all resize-none font-medium leading-relaxed"
                />
              </div>

              <div className="flex items-start gap-3 px-5 py-4 bg-violet-500/5 border border-violet-500/10 rounded-2xl">
                <Sparkles className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-loose">
                  <span className="text-violet-400">PRO TIP:</span> For maximum accuracy, include the full responsibilities and qualifications sections.
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {loading && (
            <div className="mt-12 animate-in fade-in zoom-in duration-700">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
                  <span className="text-[10px] font-black text-violet-400 uppercase tracking-[0.2em]">
                    {progress < 30 ? 'Processing Document' : progress < 70 ? 'AI Neural Analysis' : 'Synchronizing Results'}
                  </span>
                </div>
                <span className="text-sm font-black text-white tabular-nums tracking-tighter">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-500 transition-all duration-500 ease-out shadow-[0_0_20px_rgba(139,92,246,0.4)]" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>
          )}

          {/* Analyze button */}
          <div className="text-center mt-12">
            <button
              id="analyze-btn"
              onClick={onAnalyze}
              disabled={loading || !file || !jd.trim()}
              className="btn-primary text-sm px-12 py-5 rounded-2xl disabled:opacity-20 disabled:grayscale transition-all duration-500 shadow-violet-500/20 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {loading ? (
                <>
                  <div className="spinner w-5 h-5 border-2 border-white/20 border-t-white mr-3" />
                  ANALYZING CORE...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  GENERATE MATCH REPORT
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            {(!file || !jd.trim()) && !loading && (
              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                <AlertCircle className="w-3.5 h-3.5" />
                Input required to initialize
              </div>
            )}
          </div>
        </div>
        {/* Note: The Results Panel has been moved to the Dashboard routing */}
      </div>
    </section>
  );
}
