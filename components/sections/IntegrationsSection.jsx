'use client';
import { ExternalLink, Puzzle, Share2, Zap } from 'lucide-react';

const INTEGRATIONS = [
  { name: 'LinkedIn', role: 'One-click import', icon: Share2, color: 'text-blue-500' },
  { name: 'Indeed', role: 'Direct applications', icon: ExternalLink, color: 'text-blue-600' },
  { name: 'Gmail', role: 'Interview invites', icon: Zap, color: 'text-red-500' },
  { name: 'Slack', role: 'Job notifications', icon: Puzzle, color: 'text-purple-500' },
  { name: 'Lever', role: 'ATS optimization', icon: Zap, color: 'text-emerald-500' },
  { name: 'Greenhouse', role: 'Scorecard alignment', icon: Puzzle, color: 'text-green-500' }
];

export default function IntegrationsSection() {
  return (
    <section id="integrations" className="relative py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <div className="badge mb-6">
              <Puzzle className="w-3.5 h-3.5" />
              Seamless Workflow
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Integrates with Your <br />
              <span className="gradient-text">Entire Ecosystem</span>
            </h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Matchify AI doesn't work in isolation. Connect with your favorite job boards, email clients, and ATS platforms to streamline your entire job search journey from one dashboard.
            </p>
            
            <ul className="space-y-4">
              {[
                'Import profiles directly from LinkedIn',
                'Auto-detect job descriptions on Indeed',
                'Notification alerts via Slack & Email',
                'Optimized for top 50+ ATS platforms'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <button className="btn-secondary group">
                Exploration All 50+ Integrations
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {INTEGRATIONS.map((int, i) => (
                <div 
                  key={i} 
                  className={`glass-panel p-6 flex flex-col items-center text-center transition-all duration-500 hover:border-violet-500/40 hover:-translate-y-1 ${
                    i % 2 === 1 ? 'mt-8' : ''
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 ${int.color}`}>
                    <int.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-white mb-1">{int.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{int.role}</p>
                </div>
              ))}
            </div>

            {/* Background glow */}
            <div className="absolute -inset-4 bg-violet-600/10 blur-[100px] rounded-full z-[-1] pointer-events-none" />
          </div>

        </div>
      </div>
    </section>
  );
}
