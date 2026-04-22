'use client';
import { Target, BarChart3, Zap, Lightbulb, Shield, TrendingUp, FileSearch, Users } from 'lucide-react';

const FEATURES = [
  { icon: Target, title: 'AI-Powered Match Score', desc: 'Instantly see your percentage match against any job description with our 98% accurate AI engine.', stat: '98% Accuracy', color: 'from-violet-500 to-purple-600', bg: 'rgba(139,92,246,0.08)' },
  { icon: BarChart3, title: 'Visual Skill Analytics', desc: 'Radar & pie charts visualize exactly which skills match, which are missing, and by how much.', stat: '6+ Metrics', color: 'from-cyan-500 to-blue-600', bg: 'rgba(6,182,212,0.08)' },
  { icon: Zap, title: 'Results in 30 Seconds', desc: 'Our optimized AI pipeline delivers comprehensive analysis faster than any human recruiter.', stat: '< 30s Speed', color: 'from-blue-500 to-indigo-600', bg: 'rgba(59,130,246,0.08)' },
  { icon: Lightbulb, title: 'Actionable Suggestions', desc: 'Get specific, tailored recommendations on exactly what to add, remove, or reword in your resume.', stat: '100% Specific', color: 'from-emerald-500 to-teal-600', bg: 'rgba(16,185,129,0.08)' },
  { icon: Shield, title: 'ATS Optimization', desc: 'Beat Applicant Tracking Systems by ensuring your resume contains the right keywords in the right density.', stat: '95% ATS Pass', color: 'from-rose-500 to-red-600', bg: 'rgba(239,68,68,0.08)' },
  { icon: TrendingUp, title: 'Progress Tracking', desc: 'Run multiple analyses and watch your match score climb as you refine your resume over time.', stat: 'Live History', color: 'from-indigo-500 to-violet-600', bg: 'rgba(99,102,241,0.08)' },
  { icon: FileSearch, title: 'Keyword Gap Analysis', desc: 'See precisely which keywords the recruiter is looking for that are missing from your current resume.', stat: 'Full Coverage', color: 'from-pink-500 to-fuchsia-600', bg: 'rgba(236,72,153,0.08)' },
  { icon: Users, title: 'Works All Industries', desc: 'From software engineering to healthcare to marketing — our AI adapts to any field and seniority level.', stat: 'All Fields', color: 'from-sky-500 to-cyan-600', bg: 'rgba(14,165,233,0.08)' },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-28 md:py-40 flex flex-col items-center bg-black">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-20">

        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="badge mb-4">Powerful Features</div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Everything You Need to{' '}
            <span className="gradient-text">Get Hired</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Our AI-powered platform gives you every unfair advantage in your job search.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
