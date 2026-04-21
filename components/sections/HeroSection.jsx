'use client';
import { Sparkles, ArrowRight, Play, Users, TrendingUp, Award } from 'lucide-react';

const STATS = [
  { icon: TrendingUp, value: '92K+', label: 'Analyses Done', color: 'from-violet-500 to-purple-600' },
  { icon: Users, value: '38K+', label: 'Active Users', color: 'from-cyan-500 to-blue-600' },
  { icon: Award, value: '98%', label: 'Success Rate', color: 'from-pink-500 to-rose-600' },
];

const COMPANY_LOGOS = [
  { 
    name: 'Google', 
    svg: (
      <svg className="h-6 md:h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.90 3.16-1.82 4.08-1.12 1.12-2.88 2.32-5.64 2.32-4.46 0-8.12-3.62-8.12-8.08s3.66-8.1 8.12-8.1c2.42 0 4.2 0.96 5.5 2.22l2.3-2.3C18.72 2.44 16.02 1 12.48 1 6.54 1 1.66 5.88 1.66 11.82s4.88 10.82 10.82 10.82c3.2 0 5.62-1.04 7.6-3.1 2.04-2.04 2.68-4.9 2.68-7.22 0-.68-.06-1.34-.16-1.92h-7.66z"/>
      </svg>
    )
  },
  { 
    name: 'Amazon', 
    svg: (
      <svg className="h-6 md:h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.486 16.584c-1.57.949-3.414 1.488-5.748 1.488-3.084 0-5.46-1.114-6.852-3.15-.361-.52-.108-.82.463-.64 2.113.665 4.673.99 7.22.99 1.95 0 3.738-.255 5-.785.452-.19.645.1.18.423-.42.29-.86.533-1.263.674zm2.148-1.63c-.15.195-.452.164-.542-.045-.27-.63-.99-2.28-1.05-2.43-.06-.15.06-.21.18-.12s.93.63 1.2.81c.27.18.36.45.21.785l.002.99zm-4.485-3.064c0 1.2-.54 2.01-1.62 2.01-.6 0-1.05-.33-1.05-.99 0-1.23 1.23-1.44 2.67-1.44v.42zm1.616 2.508s.18-.03.18-.18c0-.06-.03-.12-.09-.15-.36-.21-.75-.42-1.11-.63-.12-.06-.24 0-.24.12 0 .09.03.18.06.27.33.51.69 1.02 1.02 1.53.06.12.15.12.18 0v-.96z"/>
        <path d="M11.954 3.75c-3.795 0-6.822 3.125-6.822 7.02 0 3.15 2.04 5.37 5.166 6.3l.09.18s-.03.03-.03.06c-3.14 0-6.1-1.48-7.74-4.1-.31-.5-.48-1.08-.48-1.7s.17-1.2.48-1.7C4.1 6.8 7.35 4.9 10.9 4.9c2.4 0 4.5.85 6.09 2.25l-.21.24c-1.35-1.2-3.12-1.64-4.83-1.64z"/>
      </svg>
    )
  },
  { 
    name: 'Microsoft', 
    svg: (
      <svg className="h-6 md:h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/>
      </svg>
    )
  },
  { 
    name: 'Meta', 
    svg: (
      <svg className="h-6 md:h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.18 12.98C22.25 10.1 20.35 7 15.82 7c-2.4 0-4.22 1.3-5.22 2.3-.64-.72-1.92-1.7S8.4 7 7.15 7C2.7 7 .9 10.6 1 12.86c.06 2.44 2.1 6.14 6.7 6.14 1.63 0 3.16-.54 4.34-1.6.86.72 2.2 1.6 4.3 1.6 5.48 0 5.63-3.8 5.84-6.02zM7.18 17.5c-1.5 0-3.3-1.55-3.3-4.5 0-3 1.76-4.5 3.3-4.5 1.45 0 2.25 1.1 3 2-.6 1.4-.7 3.5.3 4.8-.5 1.3-1.8 2.2-3.3 2.2zm7.64 0c-1.25 0-2.34-.84-2.84-2.1.88-1.25 1.05-3.4.45-4.8.76-.94 1.63-1.94 3.05-1.94 2.86 0 3.36 3.15 3.36 4.5 0 3.3-1.63 4.34-4.02 4.34z"/>
      </svg>
    )
  },
  { 
    name: 'Apple', 
    svg: (
      <svg className="h-6 md:h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.039 2.48-4.5 2.597-4.571-1.428-2.09-3.623-2.324-4.39-2.376-2-.156-3.344 1.103-3.951 1.103h-.001zM15.424 3.62C16.32 2.531 16.924 1.026 16.755 0c-1.287.052-2.844.857-3.766 1.935-.831.96-1.558 2.467-1.364 3.493 1.428.117 2.883-.728 3.799-1.808z"/>
      </svg>
    )
  },
  { 
    name: 'Netflix', 
    svg: (
      <svg className="h-6 md:h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.031 0H12v24h4.031V0zM8.016 0H4v24h4.016V0z" />
        <path d="M16.031 24V0L8.016 24V0" />
      </svg>
    )
  },
  { 
    name: 'Stripe', 
    svg: (
      <svg className="h-6 md:h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 11.23c0-4.04-2.12-6.19-5.74-6.19-3.23 0-5.78 1.77-5.78 4.79 0 4.67 6.43 3.92 6.43 5.92 0 .79-.71 1.25-1.89 1.25-1.74 0-3.95-.78-5.32-1.52l-.84 3.05c1.19.64 3.71 1.5 6 1.5 3.51 0 6.14-1.71 6.14-5.06 0-4.82-6.43-3.79-6.43-5.91 0-.66.6-1.12 1.63-1.12 1.52 0 3.34.57 4.54 1.16l1.26-2.96zM8.51 16.06c1.13 0 1.95-.56 1.95-1.9V0L6.47 1.05v13.06c0 1.34.82 1.95 2.04 1.95zM4.01 16.06c1.13 0 1.95-.56 1.95-1.9v-7.3L1.93 7.82v6.34c0 1.34.82 1.9 2.08 1.9z"/>
      </svg>
    )
  }
];

export default function HeroSection({ onScrollToAnalyzer, liveStats }) {
  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-16 text-center overflow-hidden">

      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/5 rounded-full blur-[160px]" />
      </div>

      {/* Grid texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-20 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/25 rounded-full mb-8 animate-fade-in-up">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
            AI-Powered Resume Analyzer — Trusted by 38,000+ Job Seekers
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.08] mb-6 animate-fade-in-up delay-100">
          <span className="text-white">Land Your </span>
          <span className="gradient-text">Dream Job</span>
          <br className="hidden sm:block" />
          <span className="text-white"> With AI Precision</span>
        </h1>

        {/* Sub-heading */}
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-10 leading-relaxed animate-fade-in-up delay-200">
          Upload your resume, paste a job description, and get instant AI analysis —{' '}
          <span className="text-slate-200 font-medium">match score, missing keywords, and actionable improvements</span> in seconds.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14 animate-fade-in-up delay-300">
          <button
            onClick={onScrollToAnalyzer}
            className="btn-primary text-base px-8 py-4 rounded-2xl animate-glow"
          >
            <Sparkles className="w-5 h-5" />
            Analyze My Resume — Free
            <ArrowRight className="w-5 h-5" />
          </button>
          <button className="btn-secondary text-base px-8 py-4 rounded-2xl flex items-center gap-2">
            <Play className="w-5 h-5 text-violet-400" />
            See How It Works
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-14 animate-fade-in-up delay-400">
          {STATS.map(({ icon: Icon, value, label, color }, i) => (
            <div key={i} className="glass-panel p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="text-2xl font-extrabold stat-value">{value}</div>
                <div className="text-xs text-slate-500 mt-0.5 font-medium">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Trusted by */}
        <div className="animate-fade-in-up delay-500">
          <p className="text-xs mt-10 font-semibold text-slate-500 uppercase tracking-widest mb-8">
            Trusted by job seekers hired at
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14 px-4">
            {COMPANY_LOGOS.map((company) => (
              <div 
                key={company.name} 
                className="text-slate-500 hover:text-white transition-all duration-300 transform hover:scale-110 opacity-40 hover:opacity-100 grayscale hover:grayscale-0 cursor-pointer"
                title={company.name}
              >
                {company.svg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

