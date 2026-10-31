'use client';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function CTASection({ onScrollToAnalyzer }) {
  return (
    <section id="cta" className="py-28 md:py-40 flex flex-col items-center bg-black">
      <div className="w-full max-w-7xl mx-auto px-6 md:px-20">
        <div className="relative glass-panel p-10 md:p-20 text-center overflow-hidden bg-white/[0.01] border-white/5">

          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-violet-600/12 rounded-full blur-[100px]" />
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
          </div>

          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/25 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-violet-300">Start Analyzing for Free — No Credit Card</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight uppercase tracking-tighter italic">
              Your Dream Job Is{' '}
              <span className="gradient-text">One Analysis Away</span>
            </h2>

            <p className="max-w-2xl mx-auto text-gray-500 text-lg mb-10 font-bold">
              Stop guessing why you're not getting callbacks. Get AI-powered clarity on exactly what's missing and fix it today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onScrollToAnalyzer}
                className="btn-primary text-base px-8 py-4 rounded-2xl animate-glow"
              >
                <Sparkles className="w-5 h-5" />
                Analyze My Resume Free
                <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-secondary text-base px-8 py-4 rounded-2xl"
              >
                View Pricing Plans
              </a>
            </div>

            {/* Social proof mini */}
            <p className="mt-8 text-slate-600 text-sm">
              ⭐⭐⭐⭐⭐ Rated 4.9/5 by 38,000+ job seekers
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
