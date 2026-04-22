'use client';
import { ShieldCheck, Lock, EyeOff, Server, HardDrive, RefreshCw } from 'lucide-react';

const SECURITY_FEATURES = [
  {
    title: 'Data Privacy',
    desc: 'Your resume data is never sold to third parties. We use industry-standard encryption for all transfers.',
    icon: Lock
  },
  {
    title: 'Bank-Grade Security',
    desc: 'Built on world-class infrastructure with SOC2 Type II compliance and end-to-end 256-bit AES encryption.',
    icon: ShieldCheck
  },
  {
    title: 'Anonymous Analysis',
    desc: 'Option to scrub PII (Personally Identifiable Information) before AI processing for absolute anonymity.',
    icon: EyeOff
  },
  {
    title: 'Secure Storage',
    desc: 'All documents are stored in isolated, firewalled environments with regular automated security audits.',
    icon: Server
  }
];

export default function SecuritySection() {
  return (
    <section id="security" className="relative py-24 bg-black">
      <div className="max-w-7xl mx-auto px-6 md:px-20">
        
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          <div className="lg:w-1/2">
            <div className="badge mb-6">
              <ShieldCheck className="w-3.5 h-3.5" />
              Privacy First AI
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-white uppercase tracking-tighter">
              Your Professional Data <br />
              <span className="gradient-text italic">Stays Professional</span>
            </h2>
            <p className="text-gray-500 text-lg mb-10 leading-relaxed font-medium">
              We understand the sensitivity of your career history. Our platform is built with a security-first architecture to ensure your information is protected, private, and used only for your benefit.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {SECURITY_FEATURES.map((feat, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-violet-400">
                    <feat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1.5 uppercase tracking-tight">{feat.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2 relative">
            <div className="glass-panel p-1 border-white/5 relative z-10 overflow-hidden group bg-white/[0.01]">
              <div className="p-8 bg-black/40 rounded-[19px]">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                  </div>
                  <div className="text-xs font-mono text-slate-500">SECURE_TUNNEL_ESTABLISHED</div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <HardDrive className="w-5 h-5 text-violet-400 mt-1" />
                    <div className="flex-1">
                      <div className="h-2 w-full bg-white/5 rounded-full mb-2 overflow-hidden">
                        <div className="h-full bg-violet-500 w-full animate-[shimmer_2s_infinite]" />
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Encrypting Resume Data...</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <RefreshCw className="w-5 h-5 text-cyan-400 mt-1" />
                    <div className="flex-1">
                      <div className="h-2 w-full bg-white/5 rounded-full mb-2 overflow-hidden">
                        <div className="h-full bg-cyan-500 w-3/4 animate-[shimmer_2.5s_infinite]" />
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Anonymizing PII Metadata...</div>
                    </div>
                  </div>

                  <div className="glass-panel p-4 bg-emerald-500/5 border-emerald-500/20">
                    <div className="flex items-center gap-3 text-emerald-400">
                      <ShieldCheck className="w-5 h-5" />
                      <span className="text-sm font-bold">Security Verification: PASSED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shield decoration */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-violet-500/10 rounded-full blur-[60px] z-0" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-[60px] z-0" />
          </div>

        </div>
      </div>
    </section>
  );
}
