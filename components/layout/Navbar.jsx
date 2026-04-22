'use client';
import { useState, useEffect, useRef } from 'react';
import { Sparkles, Menu, X, ChevronRight, LogIn, LogOut, User, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

const NAV_LINKS = [
  { label: 'Analyzer', href: '#analyzer' },
  { label: 'Cover Letter', href: '#cover-letter' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Testimonials', href: '#testimonials' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar({ activeSection }) {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (href) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        scrolled
          ? 'bg-[#060917]/90 backdrop-blur-2xl border-b border-violet-500/10 py-3 shadow-[0_8px_40px_rgba(0,0,0,0.4)]'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-6 md:px-20">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-violet-500/40 transition-shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Matchify AI
            </span>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-md">
              PRO
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-2">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <button
                  key={link.href}
                  onClick={() => handleNav(link.href)}
                  className={`relative px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'text-white bg-violet-500/10 shadow-[inset_0_0_20px_rgba(139,92,246,0.1)] border border-violet-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full blur-[1px]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* CTA buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {session ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-3 border border-white/10 bg-white/5 pl-2 pr-4 py-1.5 rounded-full backdrop-blur-md hover:bg-white/10 transition-colors focus:outline-none"
                >
                  <img 
                    src={session.user.image || `https://ui-avatars.com/api/?name=${session.user.name || 'User'}&background=8b5cf6&color=fff`} 
                    alt={session.user.name || 'User Profile'}
                    className="w-8 h-8 rounded-full border border-violet-500/50 object-cover"
                  />
                  <span className="text-sm font-medium text-slate-200">
                    Hi, {session.user.name?.split(' ')[0] || 'There'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-56 p-2 bg-[#060917]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] animate-fade-in z-50">
                    <div className="px-3 py-2 border-b border-white/10 mb-2">
                      <p className="text-sm font-medium text-white line-clamp-1">{session.user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{session.user.email}</p>
                    </div>
                    
                    <Link href="/dashboard" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    
                    <Link href="/profile" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    
                    <div className="h-px w-full bg-white/10 my-2"></div>
                    
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <a href="/login"
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  <LogIn className="w-4 h-4" /> Sign In
                </a>
                <button
                  onClick={() => handleNav('#analyzer')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-violet-500/30 hover:-translate-y-0.5 transition-all"
                >
                  Try Free <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/[0.06] bg-[rgba(6,9,23,0.95)] backdrop-blur-2xl animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className="w-full text-left px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-3 flex flex-col gap-2 border-t border-white/[0.06] mt-3">
              {session ? (
                <div className="flex flex-col gap-2 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <img 
                      src={session.user.image || `https://ui-avatars.com/api/?name=${session.user.name || 'User'}&background=8b5cf6&color=fff`} 
                      alt="Profile"
                      className="w-10 h-10 rounded-full border border-violet-500/50"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white">Hi, {session.user.name?.split(' ')[0] || 'There'}</span>
                      <span className="text-xs text-slate-400 truncate max-w-[150px]">{session.user.email}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Link href="/dashboard" className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-sm text-slate-300 hover:text-white rounded-xl transition-all">
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    <Link href="/profile" className="flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-sm text-slate-300 hover:text-white rounded-xl transition-all">
                      <User className="w-4 h-4" /> Profile
                    </Link>
                  </div>
                  
                  <button
                    onClick={() => signOut()}
                    className="mt-2 w-full flex items-center justify-center gap-2 py-2 text-sm text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-all"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <a href="/login" className="flex items-center gap-2 px-4 py-3 text-sm text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors">
                    <LogIn className="w-4 h-4" /> Sign In
                  </a>
                  <button
                    onClick={() => handleNav('#analyzer')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-sm font-semibold rounded-xl"
                  >
                    Try Free <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
