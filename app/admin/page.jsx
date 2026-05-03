'use client';

import { useState, useEffect } from 'react';
import {
  Users, FileText, BarChart3, TrendingUp, Activity,
  Shield, Award, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Clock, Star, Database, RefreshCw, ChevronRight, Sparkles, Zap
} from 'lucide-react';
import Link from 'next/link';

/* ─────────────────────────────────────────────────────────
   KPI CARD
───────────────────────────────────────────────────────── */
function KpiCard({ title, value, sub, icon: Icon, trend, gradient }) {
  const gradients = {
    violet: 'from-violet-500 to-purple-600',
    cyan:   'from-cyan-500 to-blue-600',
    emerald:'from-emerald-500 to-teal-600',
    rose:   'from-rose-500 to-pink-600',
    amber:  'from-amber-500 to-orange-500',
  };
  const gr = gradients[gradient] || gradients.violet;

  return (
    <div className="glass-panel p-5 bg-white/[0.02] border-white/5 hover:bg-white/[0.035] group transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gr} flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${
            trend >= 0
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          }`}>
            {trend >= 0
              ? <ArrowUpRight className="w-3 h-3" />
              : <ArrowDownRight className="w-3 h-3" />
            }
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-black tracking-tight text-white mb-0.5">{value ?? '—'}</p>
      <p className="text-xs font-semibold text-slate-500">{title}</p>
      {sub && <p className="text-[10px] text-slate-700 mt-0.5">{sub}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   SCORE BAR
───────────────────────────────────────────────────────── */
function ScoreBar({ label, count, total, colorClass }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/5">
        <div className={`h-1.5 rounded-full transition-all duration-700 ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-bold text-slate-500 w-6 text-right">{count}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────── */
export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to fetch');
      setData(await res.json());
      setLastRefresh(new Date());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const bucketLabel = (b) => ({ 0: '0–19', 20: '20–39', 40: '40–59', 60: '60–79', 80: '80–100' }[b] ?? b);
  const bucketColor = (b) => ({ 0: 'bg-rose-500', 20: 'bg-amber-500', 40: 'bg-yellow-400', 60: 'bg-lime-500', 80: 'bg-emerald-500' }[b] ?? 'bg-violet-500');

  const getScoreColor = (s) =>
    s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-lime-400' : s >= 40 ? 'text-amber-400' : 'text-rose-400';

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      <p className="text-sm font-semibold text-slate-500">Loading admin console…</p>
    </div>
  );

  if (error) return (
    <div className="glass-panel p-10 text-center bg-white/[0.02] border-white/5 max-w-md mx-auto mt-20">
      <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
      <p className="font-bold text-white mb-1">Failed to load data</p>
      <p className="text-sm text-slate-500 mb-5">{error}</p>
      <button onClick={fetchData} className="btn-primary text-sm px-6 py-2.5 rounded-xl">Retry</button>
    </div>
  );

  const { overview, recentUsers, recentAnalyses, topScorers, scoreDistribution, activityByDay } = data;

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">Admin Overview</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            System <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Last updated at {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-bold text-slate-400 hover:text-white hover:border-violet-500/30 hover:bg-violet-500/10 transition-all duration-300"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-violet-400' : ''}`} />
          Refresh
        </button>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <KpiCard title="Total Users" value={overview.totalUsers.toLocaleString()} sub={`${overview.totalAdmins} admin · ${overview.regularUsers} regular`} icon={Users} trend={12} gradient="violet" />
        <KpiCard title="Total Analyses" value={overview.totalAnalyses.toLocaleString()} sub="All-time resume scans" icon={FileText} trend={8} gradient="cyan" />
        <KpiCard title="Avg Match Score" value={`${overview.avgScore}%`} sub="Across all reports" icon={Award} gradient="emerald" />
        <KpiCard title="Admin Accounts" value={overview.totalAdmins} sub="Full system access" icon={Shield} gradient="amber" />
        <KpiCard title="Platform Signups" value={overview.globalTotalUsers.toLocaleString()} sub="Via onboarding stats" icon={Activity} gradient="rose" />
      </div>

      {/* ── Row 1: Users Table + Score Distribution ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Users */}
        <div className="xl:col-span-2 glass-panel bg-white/[0.02] border-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-black text-white uppercase tracking-wider">Recent Users</h2>
            </div>
            <Link href="/admin/users" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-violet-400 hover:text-violet-300 transition-colors">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  {['User', 'Role', 'Joined', 'Last Login'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0 ${user.role === 'admin' ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-violet-600 to-purple-700'}`}>
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{user.name || '—'}</p>
                          <p className="text-[10px] text-slate-600">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                        user.role === 'admin'
                          ? 'bg-amber-500/15 border border-amber-500/25 text-amber-400'
                          : 'bg-white/5 border border-white/10 text-slate-500'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-600 font-medium">
                      {new Date(user.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' })}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-600 font-medium">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
                        : <span className="text-slate-700">Never</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="glass-panel bg-white/[0.02] border-white/5">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-white/5">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Score Breakdown</h2>
          </div>
          <div className="p-5 space-y-3.5">
            {scoreDistribution.length > 0
              ? scoreDistribution.map((b) => (
                  <ScoreBar key={b._id} label={bucketLabel(b._id)} count={b.count} total={overview.totalAnalyses} colorClass={bucketColor(b._id)} />
                ))
              : <p className="text-sm text-slate-700 text-center py-8">No data yet</p>
            }
          </div>
          <div className="border-t border-white/5 p-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3 bg-white/[0.02] border border-white/5">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Avg Score</p>
              <p className="text-xl font-black mt-1 gradient-text">{overview.avgScore}%</p>
            </div>
            <div className="rounded-xl p-3 bg-white/[0.02] border border-white/5">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Total</p>
              <p className="text-xl font-black mt-1 text-white">{overview.totalAnalyses}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Analyses Table + Top Scorers + Activity ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Analyses */}
        <div className="xl:col-span-2 glass-panel bg-white/[0.02] border-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-black text-white uppercase tracking-wider">Recent Analyses</h2>
            </div>
            <Link href="/admin/analyses" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors">
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  {['User', 'Resume', 'Score', 'Date'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentAnalyses.map((a) => (
                  <tr key={a._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3.5 text-xs text-slate-500 max-w-[160px] truncate font-medium">{a.userEmail}</td>
                    <td className="px-6 py-3.5 text-xs text-slate-300 max-w-[140px] truncate font-medium">{a.resumeName}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-white/5">
                          <div
                            className={`h-1.5 rounded-full ${a.score >= 80 ? 'bg-emerald-500' : a.score >= 60 ? 'bg-lime-500' : a.score >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${a.score}%` }}
                          />
                        </div>
                        <span className={`text-xs font-black ${getScoreColor(a.score)}`}>{a.score}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-600 font-medium">
                      {new Date(a.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column stacked */}
        <div className="space-y-4">

          {/* Top Scorers */}
          <div className="glass-panel bg-white/[0.02] border-white/5">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5">
              <Award className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-black text-white uppercase tracking-wider">Top Scorers</h2>
            </div>
            <div className="p-3 space-y-0.5">
              {topScorers.map((item, i) => (
                <div key={item._id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0 text-white ${
                    i === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-600 shadow-lg shadow-amber-500/30'
                    : i === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-600'
                    : i === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-900'
                    : 'bg-white/5 text-slate-600'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-slate-300 truncate">{item.userEmail}</p>
                    <p className="text-[9px] text-slate-600 truncate">{item.resumeName}</p>
                  </div>
                  <span className={`text-xs font-black shrink-0 ${getScoreColor(item.score)}`}>{item.score}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* 7-Day Activity */}
          <div className="glass-panel bg-white/[0.02] border-white/5">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-black text-white uppercase tracking-wider">7-Day Activity</h2>
            </div>
            <div className="p-5">
              {activityByDay.length > 0 ? (
                <div className="space-y-2.5">
                  {activityByDay.map((day) => {
                    const max = Math.max(...activityByDay.map(d => d.count), 1);
                    const pct = Math.round((day.count / max) * 100);
                    return (
                      <div key={day._id} className="flex items-center gap-3">
                        <span className="text-[9px] font-bold text-slate-600 w-16 shrink-0">
                          {new Date(day._id).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex-1 h-1.5 rounded-full bg-white/5">
                          <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-bold text-slate-600 w-3 text-right">{day.count}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center py-6 gap-2">
                  <Activity className="w-8 h-8 text-slate-700" />
                  <p className="text-xs text-slate-700">No activity in the last 7 days</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── System Info ── */}
      <div className="glass-panel bg-white/[0.02] border-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-black text-white uppercase tracking-wider">System Information</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Framework', value: 'Next.js 15 (App Router)', color: 'text-cyan-400' },
            { label: 'Database', value: 'MongoDB Atlas', color: 'text-emerald-400' },
            { label: 'AI Engine', value: 'Google Gemini', color: 'text-violet-400' },
            { label: 'Auth', value: 'NextAuth.js + JWT', color: 'text-amber-400' },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1.5">{item.label}</p>
              <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
