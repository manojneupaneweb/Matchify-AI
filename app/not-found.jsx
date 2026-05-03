'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Home, ArrowLeft, Sparkles, Search, RotateCcw } from 'lucide-react';

const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#________';

function useGlitch(text, active) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    if (!active) { setDisplay(text); return; }
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(
        text.split('').map((char, i) => {
          if (i < iteration) return text[i];
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }).join('')
      );
      if (iteration >= text.length) clearInterval(interval);
      iteration += 0.4;
    }, 40);
    return () => clearInterval(interval);
  }, [active, text]);
  return display;
}

const SUGGESTIONS = [
  { label: 'Go Home', href: '/', icon: Home, color: 'from-violet-500 to-purple-600' },
  { label: 'Dashboard', href: '/dashboard', icon: Sparkles, color: 'from-cyan-500 to-blue-600' },
  { label: 'Admin Panel', href: '/admin', icon: Search, color: 'from-emerald-500 to-teal-600' },
];

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 8 + 4,
  delay: Math.random() * 5,
}));

export default function NotFound() {
  const [glitchActive, setGlitchActive] = useState(false);
  const [mounted, setMounted] = useState(false);
  const glitchedText = useGlitch('PAGE NOT FOUND', glitchActive);

  useEffect(() => {
    setMounted(true);
    // Auto-glitch on mount
    const t = setTimeout(() => setGlitchActive(true), 600);
    const t2 = setTimeout(() => setGlitchActive(false), 2000);
    // Periodic glitch
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 1200);
    }, 6000);
    return () => { clearTimeout(t); clearTimeout(t2); clearInterval(interval); };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#060917] flex flex-col items-center justify-center overflow-hidden font-sans selection:bg-violet-500/30">

      {/* ── Ambient Orbs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-violet-600/8 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/6 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-purple-900/4 rounded-full blur-[200px]" />
      </div>

      {/* ── Grid Texture ── */}
      <div className="absolute inset-0 grid-texture opacity-25 pointer-events-none" />

      {/* ── Floating Particles ── */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {PARTICLES.map(p => (
            <div
              key={p.id}
              className="absolute rounded-full bg-violet-400/20"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Main Card ── */}
      <div
        className={`relative z-10 flex flex-col items-center text-center px-6 max-w-2xl transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-500/10 border border-rose-500/25 rounded-full mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-rose-400">Error 404</span>
        </div>

        {/* Giant 404 */}
        <div
          className="relative cursor-pointer select-none mb-2"
          onMouseEnter={() => setGlitchActive(true)}
          onMouseLeave={() => setTimeout(() => setGlitchActive(false), 800)}
          title="Hover to glitch"
        >
          {/* Shadow / glow layer */}
          <p
            className="absolute inset-0 text-[160px] sm:text-[200px] md:text-[240px] font-black leading-none text-violet-500/10 blur-sm select-none pointer-events-none"
            aria-hidden
          >
            404
          </p>
          <p className="relative text-[160px] sm:text-[200px] md:text-[240px] font-black leading-none tracking-tighter bg-gradient-to-br from-violet-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_60px_rgba(139,92,246,0.4)]">
            404
          </p>
        </div>

        {/* Glitch subtitle */}
        <div
          className={`text-sm sm:text-base font-black uppercase tracking-[0.3em] mb-6 transition-colors duration-100 ${glitchActive ? 'text-cyan-400' : 'text-slate-500'}`}
          style={{ fontFamily: 'monospace' }}
        >
          {glitchedText}
        </div>

        {/* Description */}
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-3">
          Lost in the{' '}
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            digital void
          </span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-md leading-relaxed mb-10">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track — your dream job is waiting.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-10 w-full max-w-xs sm:max-w-none sm:w-auto">
          <Link
            href="/"
            className="w-full sm:w-auto btn-primary text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2 animate-glow"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto btn-secondary text-sm px-6 py-3 rounded-xl flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Quick Nav */}
        <div className="glass-panel p-5 bg-white/[0.02] border-white/[0.06] w-full max-w-sm sm:max-w-md">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-4">Or jump to</p>
          <div className="grid grid-cols-3 gap-3">
            {SUGGESTIONS.map(({ label, href, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-violet-500/30 hover:bg-white/[0.06] transition-all duration-200 group"
              >
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-300 transition-colors">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Fun footer */}
        <div className="flex items-center gap-2 mt-10 text-slate-700 text-[11px] font-medium">
          <RotateCcw className="w-3 h-3" />
          <span>Try refreshing — sometimes the universe just needs a moment.</span>
        </div>
      </div>

    </div>
  );
}
