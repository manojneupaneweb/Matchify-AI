'use client';
import { Target, BarChart3, Zap, Lightbulb, Shield, TrendingUp, FileSearch, Users } from 'lucide-react';

const FEATURES = [
  { icon: Target, title: 'AI Resume Analysis', desc: 'Our flagship analyzer scans your resume against job descriptions with 98% accuracy, identifying critical match gaps.', stat: '98% Match Accuracy', color: 'from-violet-500 to-purple-600', bg: 'rgba(139,92,246,0.08)' },
  { icon: FileSearch, title: 'Intelligent JD Generator', desc: 'Generate professional, SEO-optimized job descriptions in seconds based on simple role titles or requirements.', stat: 'Instant Generation', color: 'from-cyan-500 to-blue-600', bg: 'rgba(6,182,212,0.08)' },
  { icon: Zap, title: 'AI Cover Letter Builder', desc: 'Craft perfectly tailored cover letters that match both your resume and the target job description automatically.', stat: '100% Tailored', color: 'from-blue-500 to-indigo-600', bg: 'rgba(59,130,246,0.08)' },
  { icon: BarChart3, title: 'Visual Skill Mapping', desc: 'Get deep insights into your technical and soft skill alignment through interactive radar and pie charts.', stat: 'Deep Analytics', color: 'from-emerald-500 to-teal-600', bg: 'rgba(16,185,129,0.08)' },
  { icon: Shield, title: 'ATS Keyword Optimizer', desc: 'Beat recruitment filters by discovering and adding the exact keywords ATS systems are programmed to find.', stat: 'ATS-Proof', color: 'from-rose-500 to-red-600', bg: 'rgba(239,68,68,0.08)' },
  { icon: Lightbulb, title: 'Smart Career Insights', desc: 'Receive actionable AI suggestions on how to reword achievements and structure your documents for impact.', stat: 'Actionable Tips', color: 'from-indigo-500 to-violet-600', bg: 'rgba(99,102,241,0.08)' },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-40 flex flex-col items-center bg-black">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-20">

        {/* Header */}
        <div className="text-center mb-12 md:mb-16 animate-fade-in-up">
          <div className="badge mb-4">Powerful Features</div>
          <h2 className="text-2xl md:text-5xl font-bold text-white mb-4">
            Everything You Need to{' '}
            <span className="gradient-text">Get Hired</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-lg">
            Our AI-powered platform gives you every unfair advantage in your job search.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="glass-panel p-6 bg-white/[0.01] border-white/5 hover:bg-white/[0.03] group cursor-default hover:-translate-y-2 transition-all duration-500 overflow-hidden relative animate-fade-in-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {/* Top gradient line */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${feat.color} opacity-0 group-hover:opacity-100 transition-opacity`} />

                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-5 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-base font-bold text-white mb-2 leading-tight uppercase tracking-tight">{feat.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4 font-medium opacity-90">{feat.desc}</p>

                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${feat.color}`} />
                  <span className={`text-xs font-bold bg-gradient-to-r ${feat.color} bg-clip-text text-transparent`}>
                    {feat.stat}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
