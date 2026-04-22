'use client';
import { Users, BarChart3, Globe, Award, CheckCircle2 } from 'lucide-react';

const STATS = [
  { 
    label: 'Resumes Analyzed', 
    value: '1.2M+', 
    sub: 'Total documents processed',
    icon: BarChart3,
    color: 'from-violet-500 to-purple-600'
  },
  { 
    label: 'Success Rate', 
    value: '94%', 
    sub: 'Interview callback rate',
    icon: Award,
    color: 'from-cyan-500 to-blue-600'
  },
  { 
    label: 'Global Users', 
    value: '500K+', 
    sub: 'Trusted in 120+ countries',
    icon: Globe,
    color: 'from-pink-500 to-rose-600'
  },
  { 
    label: 'Active Community', 
    value: '85K+', 
    sub: 'Daily active job seekers',
    icon: Users,
    color: 'from-amber-500 to-orange-600'
  }
];

export default function StatsSection() {
  return (
    <section id="stats" className="relative py-24 overflow-hidden bg-black">
      <div className="max-w-7xl mx-auto px-6 md:px-20 relative z-10">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Trusted by the <span className="gradient-text">World's Best</span> Talent
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Our AI engine has helped millions of professionals land roles at top-tier companies by optimizing their resumes for modern recruitment systems.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <div key={i} className="glass-panel p-8 bg-white/[0.01] border-white/5 hover:bg-white/[0.03] group hover:-translate-y-2 transition-all duration-500">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <div className="text-4xl font-black mb-2 stat-value tracking-tighter">
                {stat.value}
              </div>
              <div className="text-lg font-bold text-white mb-1 uppercase tracking-tight">
                {stat.label}
              </div>
              <div className="text-xs text-gray-500 font-bold leading-relaxed uppercase tracking-widest opacity-80">
                {stat.sub}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-50 grayscale contrast-125">
          {['99.9% Uptime', 'ISO 27001 Certified', 'GDPR Compliant', 'AI Ethics Validated'].map((badge) => (
            <div key={badge} className="flex items-center gap-2 text-sm font-semibold text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {badge}
            </div>
          ))}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
    </section>
  );
}
