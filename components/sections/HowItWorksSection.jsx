'use client';
import { Upload, Cpu, CheckCircle } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: Upload,
    title: 'Upload Your Resume',
    desc: 'Drag & drop or click to upload your resume in PDF format. We securely parse it with our advanced document reader.',
    color: 'from-violet-500 to-purple-600',
    glow: 'rgba(139, 92, 246, 0.3)',
  },
  {
    number: '02',
    icon: Cpu,
    title: 'Paste Job Description',
    desc: 'Copy the full job posting and paste it in. Our AI reads every requirement, skill, and keyword in the listing.',
    color: 'from-cyan-500 to-blue-600',
    glow: 'rgba(6, 182, 212, 0.3)',
  },
  {
    number: '03',
    icon: CheckCircle,
    title: 'Get Instant Results',
    desc: 'In under 30 seconds, receive a detailed match score, missing keywords, strengths, weaknesses, and actionable suggestions.',
    color: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16, 185, 129, 0.3)',
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-28 md:py-40 relative flex flex-col items-center">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-20">

        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="badge mb-4">How It Works</div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Three Steps to Your{' '}
            <span className="gradient-text">Dream Role</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-lg">
            Our AI analyzes your resume against any job description in seconds. No signup required to get started.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-[52px] left-[calc(16.67%+40px)] right-[calc(16.67%+40px)] h-[2px] bg-gradient-to-r from-violet-500/30 via-cyan-500/30 to-emerald-500/30" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="glass-panel p-8 text-center group hover:-translate-y-2 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  {/* Number */}
                  <div className="text-6xl font-black text-white/5 absolute top-6 right-6 select-none pointer-events-none">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-6 shadow-xl`}
                    style={{ boxShadow: `0 0 30px ${step.glow}` }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Step number badge */}
                  <div className="inline-flex items-center gap-1.5 mb-3">
                    <span className={`text-xs font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent uppercase tracking-widest`}>
                      Step {step.number}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
