'use client';
import { Suspense, lazy } from 'react';
import {
  Upload, FileText, Sparkles, ArrowRight,
  CheckCircle2, XCircle, Clipboard
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
        <div className="glass-panel p-5 md:p-10 mb-8 md:mb-10 bg-white/[0.01] border-white/5 shadow-2xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Resume Upload */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Upload Resume</h3>
                  <p className="text-xs text-slate-500">PDF format · Max 5MB</p>
                </div>
              </div>

              <Suspense fallback={<Skeleton className="h-[140px]" />}>
                <DropZone onFileSelect={setFile} file={file} />
              </Suspense>

              {file && (
                <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-500/8 border border-emerald-500/20 rounded-xl animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-emerald-300 truncate">{file.name}</span>
                  <button
                    onClick={() => setFile(null)}
                    className="ml-auto text-slate-500 hover:text-slate-300 transition-colors"
                    title="Remove file"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Job Description */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 flex justify-between items-center pr-2">
                  <div>
                    <h3 className="text-base font-semibold text-white">Job Description</h3>
                    <p className="text-xs text-slate-500">Paste the full job posting</p>
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
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                    title="Paste from clipboard"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    Paste
                  </button>
                </div>
              </div>

              <textarea
                id="job-description"
                placeholder="Paste the full job description here — include requirements, responsibilities, and qualifications for the best results..."
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                rows={6}
                className="min-h-[160px] bg-black/40 border-white/10 focus:border-violet-500/50 text-gray-200 placeholder:text-gray-600"
              />

              <div className="flex items-start gap-2.5 px-4 py-3 bg-violet-500/5 border border-violet-500/15 rounded-xl">
                <Sparkles className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  <span className="text-violet-300 font-medium">Pro tip:</span> Include the complete job posting for the most accurate keyword analysis.
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {loading && (
            <div className="mt-8 animate-fade-in">
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-sm font-medium text-violet-300">
                  {progress < 30 ? '📄 Parsing resume...' : progress < 70 ? '🤖 AI analyzing...' : '✨ Finalizing results...'}
                </span>
                <span className="text-sm font-bold text-white tabular-nums">{Math.round(progress)}%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Analyze button */}
          <div className="text-center mt-8">
            <button
              id="analyze-btn"
              onClick={onAnalyze}
              disabled={loading || !file || !jd.trim()}
              className="btn-primary text-base px-10 py-4 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze My Resume
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            {(!file || !jd.trim()) && !loading && (
              <p className="text-[10px] font-bold text-gray-600 mt-4 uppercase tracking-[0.2em] animate-pulse">Upload a resume and paste a job description to continue</p>
            )}
          </div>
        </div>
        {/* Note: The Results Panel has been moved to the Dashboard routing */}
      </div>
    </section>
  );
}
