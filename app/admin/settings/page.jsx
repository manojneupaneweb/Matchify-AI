'use client';
import { Settings, Shield, Key, Globe, Bell, Palette, Lock, Info, CheckCircle, ExternalLink } from 'lucide-react';

const ENV_CONFIG = [
  { key: 'NEXTAUTH_URL', value: 'http://localhost:3000', label: 'Auth Base URL', status: true },
  { key: 'NEXTAUTH_SECRET', value: '●●●●●●●●●●●●●●●●', label: 'Auth Secret', status: true },
  { key: 'GOOGLE_CLIENT_ID', value: '●●●●●●●●●●●●●●●●', label: 'Google OAuth ID', status: true },
  { key: 'GOOGLE_CLIENT_SECRET', value: '●●●●●●●●●●●●●●●●', label: 'Google OAuth Secret', status: true },
  { key: 'GEMINI_API_KEY', value: '●●●●●●●●●●●●●●●●', label: 'Gemini AI Key', status: true },
  { key: 'MONGODB_URI', value: 'mongodb+srv://●●●●●●@●●●●', label: 'MongoDB Connection', status: true },
];

const FEATURES = [
  { name: 'Google OAuth Login', enabled: true, desc: 'Sign in with Google accounts' },
  { name: 'GitHub OAuth Login', enabled: false, desc: 'Sign in with GitHub — needs GITHUB_ID & GITHUB_SECRET' },
  { name: 'Resume Analysis', enabled: true, desc: 'Powered by Google Gemini AI' },
  { name: 'PDF Upload', enabled: true, desc: 'Parse and extract text from PDFs' },
  { name: 'Result History', enabled: true, desc: 'Save and view past analyses' },
  { name: 'Admin Panel', enabled: true, desc: 'This console — /admin/*' },
  { name: 'Logout All Sessions', enabled: true, desc: 'Token version invalidation' },
  { name: 'JD Generator', enabled: true, desc: 'AI-powered job description generator' },
  { name: 'Cover Letter Builder', enabled: true, desc: 'AI cover letter creation' },
];

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Configuration</p>
        <h1 className="text-3xl font-black tracking-tight text-white">System <span className="gradient-text">Settings</span></h1>
        <p className="text-xs text-slate-600 mt-1">Read-only view of current platform configuration</p>
      </div>

      {/* Notice */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-violet-500/5 border border-violet-500/15">
        <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400">
          This page shows the current system configuration in read-only mode. To change settings, update your <code className="text-violet-300 bg-violet-500/10 px-1 py-0.5 rounded">.env.local</code> file and restart the server.
        </p>
      </div>

      {/* Application Info */}
      <div className="glass-panel bg-white/[0.02] border-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Application</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'App Name', value: 'Matchify AI' },
            { label: 'Version', value: 'Next.js 15' },
            { label: 'Environment', value: process.env.NODE_ENV || 'development' },
            { label: 'Router', value: 'App Router (RSC)' },
          ].map(item => (
            <div key={item.label} className="rounded-xl p-3 bg-white/[0.02] border border-white/[0.05]">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1">{item.label}</p>
              <p className="text-sm font-bold text-white">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Environment Variables */}
      <div className="glass-panel bg-white/[0.02] border-white/5 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-white/5">
          <Key className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Environment Variables</h2>
          <span className="ml-2 px-2 py-0.5 text-[9px] font-black rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">REDACTED</span>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {ENV_CONFIG.map(env => (
            <div key={env.key} className="flex items-center justify-between px-6 py-3.5 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-3">
                <CheckCircle className={`w-3.5 h-3.5 ${env.status ? 'text-emerald-400' : 'text-slate-700'}`} />
                <div>
                  <p className="text-xs font-black text-amber-400 font-mono">{env.key}</p>
                  <p className="text-[10px] text-slate-600">{env.label}</p>
                </div>
              </div>
              <code className="text-[10px] text-slate-600 font-mono bg-white/[0.03] px-3 py-1 rounded-lg">{env.value}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Flags */}
      <div className="glass-panel bg-white/[0.02] border-white/5 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-white/5">
          <Palette className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Feature Status</h2>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {FEATURES.map(feature => (
            <div key={feature.name} className="flex items-center justify-between px-6 py-3.5 hover:bg-white/[0.02] transition-colors">
              <div>
                <p className={`text-sm font-bold ${feature.enabled ? 'text-white' : 'text-slate-600'}`}>{feature.name}</p>
                <p className="text-[10px] text-slate-600">{feature.desc}</p>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black ${feature.enabled ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-white/5 border border-white/10 text-slate-600'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${feature.enabled ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                {feature.enabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auth Config */}
      <div className="glass-panel bg-white/[0.02] border-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Authentication Config</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Strategy', value: 'JWT (JSON Web Tokens)' },
            { label: 'Session Duration', value: '30 days (NextAuth default)' },
            { label: 'Custom JWT Expiry', value: '1 day (lib/auth.js)' },
            { label: 'Sign-in Page', value: '/login' },
            { label: 'Providers', value: 'Google + GitHub' },
            { label: 'Token Invalidation', value: 'tokenVersion per user' },
          ].map(item => (
            <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <Lock className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">{item.label}</p>
                <p className="text-sm font-bold text-white mt-0.5">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="glass-panel bg-white/[0.02] border-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <ExternalLink className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Quick Links</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Main Site', href: '/' },
            { label: 'User Dashboard', href: '/dashboard' },
            { label: 'Login Page', href: '/login' },
            { label: 'Profile', href: '/profile' },
          ].map(link => (
            <a
              key={link.label}
              href={link.href}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm font-semibold text-slate-400 hover:text-white hover:border-violet-500/30 hover:bg-violet-500/10 transition-all duration-200"
            >
              {link.label}
              <ExternalLink className="w-3 h-3" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
