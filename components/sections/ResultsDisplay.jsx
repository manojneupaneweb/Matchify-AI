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
    <div className="space-y-6">
      {/* Score + Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Score card */}
        <div className="glass-panel p-8 flex flex-col items-center justify-center text-center">
          <div className="badge mb-5">
            <Target className="w-3 h-3" /> Match Score
          </div>
          <Suspense fallback={<Skeleton className="w-44 h-44 rounded-full" />}>
            <ScoreGauge score={results.score} />
          </Suspense>

          {results.funnyMessage && (
            <div className="mt-5 px-4 py-3.5 bg-violet-500/8 border border-violet-500/20 rounded-xl">
              <p className="text-violet-300 text-sm italic leading-relaxed">"{results.funnyMessage}"</p>
            </div>
          )}

          <div className={`mt-4 px-4 py-3 rounded-xl bg-${scoreColor}-500/8 border border-${scoreColor}-500/25 w-full`}>
            <p className="text-sm font-medium text-center">{scoreMessage}</p>
          </div>
        </div>

        {/* Charts card */}
        <div className="glass-panel p-8 lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-slate-500 mb-5">
                <Target className="w-3.5 h-3.5" /> Skill Match Analysis
              </h4>
              <div className="h-60">
                <Suspense fallback={<Skeleton className="h-full" />}>
                  <SkillsRadar data={results.charts?.skillsMatch} />
                </Suspense>
              </div>
            </div>
            <div>
              <h4 className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-slate-500 mb-5">
                <BarChart3 className="w-3.5 h-3.5" /> Keyword Coverage
              </h4>
              <div className="h-52">
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
          <div key={key} className="glass-panel p-7">
            <h4 className={`flex items-center gap-2.5 mb-5 font-semibold text-${color}-400`}>
              <div className={`w-8 h-8 rounded-xl bg-${color}-500/15 flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
              {title}
            </h4>
            {results[key]?.length ? (
              <ul className="space-y-2.5">
                {results[key].map((item, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-slate-300 hover:text-white transition-colors">
                    <span className={`text-${color}-400 mt-0.5 flex-shrink-0`}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600 italic">None identified.</p>
            )}
          </div>
        ))}
      </div>

      {/* Missing keywords */}
      {results.missingKeywords?.length > 0 && (
        <div className="glass-panel p-7">
          <h4 className="flex items-center gap-2.5 font-semibold text-cyan-400 mb-5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            Missing Keywords
          </h4>
          <div className="flex flex-wrap gap-2.5 mb-4">
            {results.missingKeywords.map((kw, i) => (
              <span
                key={i}
                className="keyword-chip bg-cyan-500/8 border border-cyan-500/25 text-cyan-300"
              >
                {kw}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-cyan-600" />
            Add these keywords to your resume to improve your ATS match score
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
        <button className="btn-secondary px-8 py-3.5 rounded-xl flex items-center justify-center gap-2">
          <Download className="w-4 h-4" /> Download Report
        </button>
        <Link href="/dashboard" className="btn-primary px-8 py-3.5 rounded-xl flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4" /> Analyze Another
        </Link>
      </div>
    </div>
  );
}
