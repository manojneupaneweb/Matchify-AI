'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';



export default function DashboardLayout({ children }) {
  const { data: session } = useSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto sign-out if token has been invalidated by "Logout All"
  useEffect(() => {
    if (session?.error === 'TokenInvalidated') {
      signOut({ callbackUrl: '/login' });
    }
  }, [session]);


  const formatLastLogin = (dateStr) => {
    if (!dateStr) return 'First login';
    const diff = Math.floor((new Date() - new Date(dateStr)) / 60000); // minutes
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours <= 12) return `${hours}hr ago`;
    return new Date(dateStr).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
  };

  const handleLogout = (e) => {
    if (e) e.preventDefault();
    signOut({ callbackUrl: '/login' });
  };

  const navItems = [
    { 
      href: '/dashboard', 
      label: 'Dashboard', 
      exact: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
        </svg>
      ),
      badge: null
    },
    { 
      href: '/dashboard/analyses', 
      label: 'Analyses', 
      exact: false,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      ),
      badge: null
    },
    { 
      href: '/dashboard/security', 
      label: 'Security', 
      exact: false,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
        </svg>
      ),
      badge: null
    },
    { 
      href: '/dashboard/settings', 
      label: 'Settings', 
      exact: false,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      ),
      badge: null
    },
    // Admin-only item
    ...(session?.user?.role === 'admin' ? [{
      href: '/dashboard/users',
      label: 'Users',
      exact: false,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      ),
      badge: 'ADMIN'
    }] : []),
  ];

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <div className="relative flex h-screen bg-black overflow-hidden font-sans selection:bg-violet-500/30 selection:text-white">
      {/* Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      {/* Grid Texture */}
      <div className="absolute inset-0 grid-texture opacity-20 pointer-events-none" />

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:relative z-50 h-full
        transform transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        ${sidebarCollapsed ? 'w-20' : 'w-72'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        bg-white/[0.02] backdrop-blur-2xl
        border-r border-white/5
        flex flex-col
      `}>
        {/* Sidebar Header */}
        <div className={`
          p-6 border-b border-white/5
          ${sidebarCollapsed ? 'items-center' : ''}
        `}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-purple-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-violet-600/20">
                <span className="text-white text-xl font-bold">M</span>
              </div>
              {!sidebarCollapsed && (
                <h2 className="text-2xl font-black tracking-tighter text-white">
                  Matchify<span className="text-violet-500">AI</span>
                </h2>
              )}
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex p-2 rounded-lg hover:bg-white/5 text-slate-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
                )}
              </svg>
            </button>
          </div>
        </div>
        

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center px-4 py-3 rounded-xl transition-all duration-300 group relative
                  ${isActive 
                    ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]' 
                    : 'text-slate-400 hover:bg-white/[0.03] hover:text-white'
                  }
                  ${sidebarCollapsed ? 'justify-center' : ''}
                `}
              >
                <span className={`
                  ${isActive ? 'text-violet-400' : 'text-slate-500'}
                  group-hover:scale-110 transition-transform duration-300
                `}>
                  {item.icon}
                </span>
                
                {!sidebarCollapsed && (
                  <>
                    <span className="ml-3 flex-1 font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-black rounded-lg bg-violet-500 text-white uppercase tracking-tighter">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {/* Tooltip for collapsed sidebar */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-2 group-hover:translate-x-0 z-50 border border-white/5 backdrop-blur-xl">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className={`
          p-4 border-t border-white/5
          ${sidebarCollapsed ? 'px-2' : 'px-4'}
        `}>
          <button className={`
            w-full flex items-center px-4 py-3 text-slate-400 
            hover:bg-white/[0.03] hover:text-white rounded-xl transition-all duration-300
            ${sidebarCollapsed ? 'justify-center' : ''}
          `}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {!sidebarCollapsed && <span className="ml-3 font-medium">Help Center</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top Navigation Bar */}
        <header className="relative z-30 bg-white/[0.02] backdrop-blur-2xl border-b border-white/5">
          <div className="flex items-center justify-between px-4 md:px-8 py-4">
            {/* Left Section */}
            <div className="flex items-center gap-6">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-xl hover:bg-white/5 transition-colors"
              >
                <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>

              {/* Search Bar */}
              <div className="hidden md:flex items-center px-4 py-2.5 bg-white/[0.03] border border-white/5 rounded-2xl focus-within:border-violet-500/50 transition-all duration-300 group">
                <svg className="w-4 h-4 text-slate-500 group-focus-within:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
                <input
                  type="text"
                  placeholder="Quick Search..."
                  className="ml-3 bg-transparent border-none focus:outline-none text-sm w-80 text-white placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-6">
              {/* Live Time & Status */}
              <div className="hidden lg:flex items-center gap-6 text-right">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Last Login</span>
                  <span className="text-xs font-bold text-violet-400 leading-none">{formatLastLogin(session?.user?.lastLoginAt)}</span>
                </div>
                <div className="h-8 w-px bg-white/5"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Local Time</span>
                  <span className="text-xs font-bold text-white leading-none">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="h-6 w-px bg-white/10 mx-1 hidden md:block"></div>

              {/* Greeting */}
              <div className="hidden sm:block">
                <span className="text-sm font-bold text-slate-400">Hi, </span>
                <span className="text-sm font-black text-white">{session?.user?.name?.split(' ')[0] || 'User'}</span>
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-white/5 transition-all duration-300 group"
                >
                  <img 
                    src={session?.user?.image || `https://ui-avatars.com/api/?name=${session?.user?.name || 'User'}&background=8b5cf6&color=fff`} 
                    alt="Profile"
                    className="w-9 h-9 rounded-xl object-cover border border-white/10 group-hover:border-violet-500/50 transition-colors"
                  />
                 
                  <svg className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${profileDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                {profileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-56 bg-gray-900/95 backdrop-blur-2xl border border-white/5 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="px-4 py-3 border-b border-white/5 mb-2">
                        <p className="text-sm font-bold text-white truncate">{session?.user?.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 truncate mt-0.5">{session?.user?.email}</p>
                      </div>
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        View Profile
                      </Link>
                      <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        </svg>
                        Settings
                      </Link>
                      <div className="h-px bg-white/5 my-2"></div>
                      <button 
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-500/10 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="px-4 md:px-8 py-3 border-t border-white/5 bg-white/[0.01]">
            <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em]">
              <Link href="/dashboard" className="text-slate-500 hover:text-violet-400 transition-colors">
                HOME
              </Link>
              <svg className="w-3 h-3 mx-3 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
              <span className="text-slate-300">
                {navItems.find(item => item.exact ? pathname === item.href : pathname.startsWith(item.href))?.label || 'OVERVIEW'}

              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 lg:p-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}