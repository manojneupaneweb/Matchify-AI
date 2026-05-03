'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, FileText, BarChart3, Settings,
  Shield, Activity, Bell, Search, Menu, X,
  ChevronLeft, ChevronRight, Database,
  Globe, LogOut, TrendingUp, Server, UserPlus,
  Award, AlertTriangle, Zap, CheckCheck, Clock, Inbox
} from 'lucide-react';

/* ── Nav structure ───────────────────────────────────────── */
const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { href: '/admin',           label: 'Dashboard',    icon: LayoutDashboard, exact: true },
      { href: '/admin/analytics', label: 'Analytics',    icon: BarChart3 },
      { href: '/admin/activity',  label: 'Live Activity',icon: Activity, badge: 'LIVE' },
    ]
  },
  {
    label: 'Management',
    items: [
      { href: '/admin/users',     label: 'Users',     icon: Users },
      { href: '/admin/analyses',  label: 'Analyses',  icon: FileText },
      { href: '/admin/reports',   label: 'Reports',   icon: TrendingUp },
    ]
  },
  {
    label: 'System',
    items: [
      { href: '/admin/health',    label: 'System Health', icon: Server },
      { href: '/admin/database',  label: 'Database',      icon: Database },
      { href: '/admin/settings',  label: 'Settings',      icon: Settings },
    ]
  }
];

/* ── Helpers ─────────────────────────────────────────────── */
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const NOTIF_META = {
  signup:    { icon: UserPlus,      color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  highscore: { icon: Award,         color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   dot: 'bg-amber-400' },
  analysis:  { icon: FileText,      color: 'text-cyan-400',    bg: 'bg-cyan-500/10',     border: 'border-cyan-500/20',    dot: 'bg-cyan-400' },
  system:    { icon: AlertTriangle, color: 'text-rose-400',    bg: 'bg-rose-500/10',     border: 'border-rose-500/20',    dot: 'bg-rose-400' },
};

/* ══════════════════════════════════════════════════════════
   NOTIFICATION PANEL (dropdown)
══════════════════════════════════════════════════════════ */
function NotificationPanel({ onClose, onMarkAllRead }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState(new Set());

  useEffect(() => {
    fetch('/api/admin/notifications')
      .then(r => r.json())
      .then(json => { setData(json); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const markAll = () => {
    if (!data) return;
    setReadIds(new Set(data.notifications.map(n => n.id)));
    onMarkAllRead(0);
  };

  const unreadCount = data
    ? data.notifications.filter(n => !readIds.has(n.id)).length
    : 0;

  return (
    <div className="absolute right-0 top-full mt-2 w-[360px] z-50">
      {/* Glass panel */}
      <div className="bg-[#0d0d18]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-black text-white">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-rose-500 text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAll}
                className="flex items-center gap-1 text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors"
              >
                <CheckCheck className="w-3 h-3" />
                Mark all read
              </button>
            )}
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Summary strip */}
        {data?.summary && (
          <div className="grid grid-cols-3 gap-0 border-b border-white/[0.06]">
            {[
              { label: 'New Today',   value: data.summary.newUsersToday,      color: 'text-emerald-400' },
              { label: 'High Scores', value: data.summary.highScoresToday,    color: 'text-amber-400' },
              { label: 'Last Hour',   value: data.summary.analysesThisHour,   color: 'text-cyan-400' },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center py-2.5 border-r border-white/[0.06] last:border-r-0">
                <span className={`text-lg font-black ${s.color}`}>{s.value}</span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-600">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* List */}
        <div className="max-h-[380px] overflow-y-auto">
          {loading ? (
            <div className="py-10 flex flex-col items-center gap-2">
              <div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
              <p className="text-xs text-slate-600">Loading…</p>
            </div>
          ) : !data?.notifications?.length ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <Inbox className="w-8 h-8 text-slate-700" />
              <p className="text-sm font-bold text-slate-600">All caught up!</p>
              <p className="text-xs text-slate-700">No new activity in the last 24h</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {data.notifications.map(notif => {
                const meta = NOTIF_META[notif.type] || NOTIF_META.system;
                const Icon = meta.icon;
                const isRead = readIds.has(notif.id);
                return (
                  <div
                    key={notif.id}
                    onClick={() => setReadIds(prev => new Set([...prev, notif.id]))}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-150 ${isRead ? 'opacity-50' : 'hover:bg-white/[0.03]'}`}
                  >
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${meta.bg} border ${meta.border}`}>
                      <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-bold ${isRead ? 'text-slate-500' : 'text-white'} leading-tight`}>
                          {notif.title}
                        </p>
                        {!isRead && (
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} shrink-0 mt-1`} />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">{notif.body}</p>
                      {notif.meta && (
                        <p className="text-[9px] text-slate-700 mt-0.5 truncate">{notif.meta}</p>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="w-2.5 h-2.5 text-slate-700" />
                        <span className="text-[9px] text-slate-700">{timeAgo(notif.at)}</span>
                        {notif.priority === 'high' && (
                          <span className="ml-1 px-1 py-0 text-[8px] font-black rounded bg-rose-500/20 text-rose-400 uppercase">urgent</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.06] px-4 py-2.5 flex items-center justify-between">
          <Link
            href="/admin/activity"
            onClick={onClose}
            className="text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors"
          >
            View full activity →
          </Link>
          <span className="text-[9px] text-slate-700">Updates every page load</span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN LAYOUT
══════════════════════════════════════════════════════════ */
export default function AdminLayout({ children }) {
  const pathname    = usePathname();
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Notification state
  const [notifOpen, setNotifOpen]   = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  // Fetch unread count on mount
  useEffect(() => {
    fetch('/api/admin/notifications')
      .then(r => r.json())
      .then(json => setUnreadCount(json.unread || 0))
      .catch(() => {});
  }, []);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close notif dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentPage = NAV_GROUPS.flatMap(g => g.items)
    .find(item => item.exact ? pathname === item.href : pathname.startsWith(item.href));

  return (
    <div className="relative flex h-screen bg-[#060917] overflow-hidden font-sans selection:bg-violet-500/30 selection:text-white">

      {/* ── Background Orbs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[700px] h-[700px] bg-violet-600/8 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-500/6 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/5 rounded-full blur-[180px]" />
      </div>

      {/* ── Grid Texture ── */}
      <div className="absolute inset-0 grid-texture opacity-30 pointer-events-none" />

      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-[#060917]/80 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ══════════════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════════════ */}
      <aside className={`
        fixed lg:relative z-50 h-full flex flex-col
        border-r border-white/[0.06]
        bg-white/[0.02] backdrop-blur-2xl
        transition-all duration-300 ease-in-out shrink-0
        ${collapsed ? 'w-[72px]' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-white/[0.06] shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/30 shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="ml-3 overflow-hidden">
              <span className="text-base font-black tracking-tight bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
                Matchify AI
              </span>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mt-0.5">Admin Console</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex ml-auto p-1.5 rounded-lg hover:bg-white/5 text-slate-600 hover:text-slate-300 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Status Pill */}
        <div className={`px-3 pt-4 ${collapsed ? 'flex justify-center' : ''}`}>
          {!collapsed ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">All Systems Operational</span>
            </div>
          ) : (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse block" />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-slate-600">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`
                      relative flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5
                      text-sm font-semibold transition-all duration-200 group
                      ${isActive
                        ? 'bg-violet-500/10 text-violet-300 border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.08)]'
                        : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]'
                      }
                      ${collapsed ? 'justify-center' : ''}
                    `}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-violet-400 to-cyan-400 rounded-r-full" />
                    )}
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-violet-400' : 'text-slate-600 group-hover:text-slate-400'} transition-colors`} />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 text-[8px] font-black rounded-md bg-violet-500 text-white uppercase tracking-wider animate-pulse">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {collapsed && (
                      <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#0d1124] border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-2 group-hover:translate-x-0 z-50 whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-white/[0.06] shrink-0 space-y-0.5">
          <Link
            href="/"
            title={collapsed ? 'Back to Site' : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-200 hover:bg-white/[0.04] transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
          >
            <Globe className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Back to Site</span>}
          </Link>
          <Link
            href="/login"
            title={collapsed ? 'Sign Out' : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-500/70 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </Link>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10 min-w-0">

        {/* ── Top Header ── */}
        <header className="shrink-0 h-16 flex items-center px-4 md:px-6 gap-4 border-b border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl">

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-white/5 transition-colors text-slate-400"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Page Identity */}
          <div className="flex items-center gap-3">
            <div className="w-0.5 h-6 rounded-full bg-gradient-to-b from-violet-400 to-cyan-400" />
            <div>
              <h1 className="text-sm font-black tracking-tight text-white">
                {currentPage?.label || 'Dashboard'}
              </h1>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Admin Console</p>
            </div>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-4 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] focus-within:border-violet-500/40 focus-within:bg-violet-500/[0.04] transition-all duration-300">
            <Search className="w-4 h-4 text-slate-600 shrink-0" />
            <input
              type="text"
              placeholder="Search users, analyses…"
              className="ml-2 bg-transparent text-sm flex-1 focus:outline-none text-white placeholder:text-slate-700"
            />
            <kbd className="hidden lg:block text-[9px] font-bold text-slate-700 border border-white/10 px-1.5 py-0.5 rounded-md">⌘K</kbd>
          </div>

          <div className="ml-auto flex items-center gap-3">

            {/* Clock */}
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-xs font-bold tabular-nums text-white/80">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>

            <div className="w-px h-5 bg-white/[0.08] hidden lg:block" />

            {/* ── NOTIFICATION BELL ── */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(v => !v)}
                className={`relative p-2 rounded-xl transition-all duration-200 ${notifOpen ? 'bg-violet-500/20 text-violet-300' : 'hover:bg-white/5 text-slate-500 hover:text-slate-300'}`}
              >
                <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'animate-[wiggle_0.5s_ease_1]' : ''}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-lg shadow-rose-500/40">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <NotificationPanel
                  onClose={() => setNotifOpen(false)}
                  onMarkAllRead={(n) => setUnreadCount(n)}
                />
              )}
            </div>

            {/* Admin Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <Shield className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-violet-400">Admin</span>
            </div>
          </div>
        </header>

        {/* ── Breadcrumb ── */}
        <div className="shrink-0 px-4 md:px-6 py-2 border-b border-white/[0.04] bg-white/[0.01]">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-700">
            <Link href="/admin" className="hover:text-violet-400 transition-colors">Console</Link>
            {currentPage && currentPage.href !== '/admin' && (
              <>
                <ChevronRight className="w-2.5 h-2.5" />
                <span className="text-slate-500">{currentPage.label}</span>
              </>
            )}
          </div>
        </div>

        {/* ── Page Content ── */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
