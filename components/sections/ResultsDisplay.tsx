'use client';
import { Suspense, lazy } from 'react';
import {
  CheckCircle2, AlertCircle, Lightbulb, Download,
  RefreshCw, Target, BarChart3, Sparkles
} from 'lucide-react';
import Link from 'next/link';

const ScoreGauge = lazy(() => import('@/components/ScoreGauge'));
const SkillsRadar = lazy(() =>
  import('@/components/Charts').then((m) => ({ default: m.SkillsRadar }))
);
const KeywordPie = lazy(() =>
  import('@/components/Charts').then((m) => ({ default: m.KeywordPie }))
);

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-2xl bg-white/5 ${className}`} />
);

const RESULT_SECTIONS = [
  { key: 'strengths', title: 'Key Strengths', icon: CheckCircle2, color: 'emerald' },
  { key: 'weaknesses', title: 'Areas to Improve', icon: AlertCircle, color: 'amber' },
  { key: 'suggestions', title: 'AI Suggestions', icon: Lightbulb, color: 'violet' },
];

export default function ResultsDisplay({ results }) {
  if (!results) return null;

  const scoreColor =
    results.score > 80 ? 'emerald' :
    results.score > 50 ? 'amber' : 'rose';

  const scoreMessage =
    results.score > 80 ? "🎯 Excellent match! You're a top candidate." :
    results.score > 50 ? "📈 Good match — a few tweaks will make it great." :
    "⚠️ Low match. Tailor your resume using the suggestions below.";

  return (
    <div className="space-y-6 animate-in fade-in duration-1000">
      {/* Score + Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Score card */}
        <div className="glass-panel p-10 flex flex-col items-center justify-center text-center border-white/5 bg-white/[0.02]">
          <div className="badge mb-8 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border-white/10">
            <Target className="w-3.5 h-3.5" /> Match Score
          </div>
          <Suspense fallback={<Skeleton className="w-48 h-48 rounded-full" />}>
            <ScoreGauge score={results.score} />
          </Suspense>

          {results.funnyMessage && (
            <div className="mt-8 px-5 py-4 bg-violet-500/5 border border-violet-500/10 rounded-2xl">
              <p className="text-violet-300 text-sm italic font-medium leading-relaxed">"{results.funnyMessage}"</p>
            </div>
          )}

          <div className={`mt-6 px-5 py-4 rounded-2xl bg-${scoreColor}-500/5 border border-${scoreColor}-500/20 w-full`}>
            <p className="text-sm font-bold text-center uppercase tracking-tight">{scoreMessage}</p>
          </div>
        </div>

        {/* Charts card */}
        <div className="glass-panel p-10 lg:col-span-2 border-white/5 bg-white/[0.02]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h4 className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8">
                <Target className="w-4 h-4 text-violet-400" /> Skill Match Analysis
              </h4>
              <div className="h-64">
                <Suspense fallback={<Skeleton className="h-full" />}>
                  <SkillsRadar data={results.charts?.skillsMatch} />
                </Suspense>
              </div>
            </div>
            <div>
              <h4 className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8">
                <BarChart3 className="w-4 h-4 text-cyan-400" /> Keyword Coverage
              </h4>
              <div className="h-56">
                <Suspense fallback={<Skeleton className="h-full" />}>
                  <KeywordPie data={results.charts?.keywordCoverage} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strengths / Weaknesses / Suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {RESULT_SECTIONS.map(({ key, title, icon: Icon, color }) => (
          <div key={key} className="glass-panel p-8 border-white/5 bg-white/[0.02] group hover:bg-white/[0.04] transition-all">
            <h4 className={`flex items-center gap-3.5 mb-6 font-black uppercase tracking-tighter text-sm text-${color}-400`}>
              <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-5 h-5" />
              </div>
              {title}
            </h4>
            {results[key]?.length ? (
              <ul className="space-y-3.5">
                {results[key].map((item, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-slate-400 hover:text-white transition-colors leading-relaxed font-medium">
                    <span className={`text-${color}-500/60 mt-1 flex-shrink-0`}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600 font-bold uppercase tracking-widest italic">None identified.</p>
            )}
          </div>
        ))}
      </div>

      {/* Missing keywords */}
      {results.missingKeywords?.length > 0 && (
        <div className="glass-panel p-8 border-white/5 bg-white/[0.02]">
          <h4 className="flex items-center gap-3.5 font-black uppercase tracking-tighter text-sm text-cyan-400 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            Missing Strategic Keywords
          </h4>
          <div className="flex flex-wrap gap-3 mb-6">
            {results.missingKeywords.map((kw, i) => (
              <span
                key={i}
                className="keyword-chip bg-cyan-500/5 border border-cyan-500/10 text-cyan-300 text-[10px] font-black tracking-widest px-4 py-2 hover:bg-cyan-500/10 transition-colors"
              >
                {kw}
              </span>
            ))}
          </div>
          <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
            <p className="text-[10px] font-bold text-slate-500 flex items-center gap-2 uppercase tracking-widest">
              <Lightbulb className="w-4 h-4 text-cyan-500" />
              Add these keywords to your resume to optimize ATS performance
            </p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
        <button className="btn-secondary px-10 py-4 shadow-xl">
          <Download className="w-5 h-5" /> Download Report
        </button>
        <Link href="/dashboard" className="btn-primary px-10 py-4 shadow-violet-500/20">
          <RefreshCw className="w-5 h-5" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
