'use client';
import { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, Award, Users, ArrowUpRight, ArrowDownRight, Star } from 'lucide-react';

function getScoreColor(s) {
  if (s >= 80) return 'text-emerald-400';
  if (s >= 60) return 'text-lime-400';
  if (s >= 40) return 'text-amber-400';
  return 'text-rose-400';
}
function getBarColor(s) {
  if (s >= 80) return 'bg-emerald-500';
  if (s >= 60) return 'bg-lime-500';
  if (s >= 40) return 'bg-amber-500';
  return 'bg-rose-500';
}
const BUCKET_LABELS = { 0: '0–19 (Poor)', 20: '20–39 (Weak)', 40: '40–59 (Fair)', 60: '60–79 (Good)', 80: '80–100 (Excellent)' };

export default function AdminReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reports');
      setData(await res.json());
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-60">
      <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
    </div>
  );

  const { scoreBreakdown, topUsers, recentHighScores, weeklyComparison } = data;
  const thisWeek = weeklyComparison?.thisWeek?.[0];
  const lastWeek = weeklyComparison?.lastWeek?.[0];
  const countDiff = thisWeek && lastWeek ? ((thisWeek.count - lastWeek.count) / Math.max(lastWeek.count, 1) * 100).toFixed(0) : null;
  const scoreDiff = thisWeek && lastWeek ? (thisWeek.avgScore - lastWeek.avgScore).toFixed(1) : null;

  const totalInBreakdown = scoreBreakdown.reduce((sum, b) => sum + b.count, 0);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 mb-1">Insights</p>
          <h1 className="text-3xl font-black tracking-tight text-white">Performance <span className="gradient-text">Reports</span></h1>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-bold text-slate-400 hover:text-white hover:bg-amber-500/10 hover:border-amber-500/30 transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Week-over-Week */}
      <div className="grid grid-cols-2 gap-4">
        <WoWCard
          label="Analyses This Week"
          current={thisWeek?.count}
          previous={lastWeek?.count}
          diff={countDiff}
          unit=""
          icon={TrendingUp}
        />
        <WoWCard
          label="Avg Score This Week"
          current={thisWeek?.avgScore?.toFixed(1)}
          previous={lastWeek?.avgScore?.toFixed(1)}
          diff={scoreDiff}
          unit="%"
          icon={Award}
          positive={parseFloat(scoreDiff) >= 0}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="glass-panel bg-white/[0.02] border-white/5 p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Score Band Distribution</h2>
          </div>
          <div className="space-y-4">
            {scoreBreakdown.map(b => {
              const pct = totalInBreakdown > 0 ? ((b.count / totalInBreakdown) * 100).toFixed(1) : 0;
              return (
                <div key={b._id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400">{BUCKET_LABELS[b._id] || b._id}</span>
                    <span className="text-[10px] font-black text-slate-500">{pct}% · {b.count} scans</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-white/5">
                    <div className={`h-2.5 rounded-full transition-all duration-700 ${getBarColor(b._id)}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Users by Avg Score */}
        <div className="glass-panel bg-white/[0.02] border-white/5 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5">
            <Users className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Top Users by Avg Score</h2>
          </div>
          <div className="divide-y divide-white/[0.03]">
            {topUsers.map((u, i) => (
              <div key={u._id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black text-white shrink-0 ${
                  i === 0 ? 'bg-gradient-to-br from-amber-400 to-yellow-600'
                  : i === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-600'
                  : i === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-900'
                  : 'bg-white/5 text-slate-500'
                }`}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-300 truncate">{u._id}</p>
                  <p className="text-[9px] text-slate-600">{u.count} {u.count === 1 ? 'analysis' : 'analyses'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-black ${getScoreColor(u.avgScore)}`}>{u.avgScore.toFixed(1)}%</p>
                  <p className="text-[9px] text-slate-700">avg</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent High Scores */}
      <div className="glass-panel bg-white/[0.02] border-white/5 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-white/5">
          <Star className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Recent High Scores (≥ 80%)</h2>
          <span className="ml-2 px-2 py-0.5 text-[9px] font-black rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/25">TOP PERFORMERS</span>
        </div>
        {recentHighScores.length === 0 ? (
          <p className="text-sm text-slate-600 text-center py-10">No high scores yet</p>
        ) : (
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
                {recentHighScores.map(a => (
                  <tr key={a._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3.5 text-xs text-slate-500 truncate max-w-[180px]">{a.userEmail}</td>
                    <td className="px-6 py-3.5 text-xs text-slate-300 truncate max-w-[160px]">{a.resumeName}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-white/5">
                          <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${a.score}%` }} />
                        </div>
                        <span className="text-xs font-black text-emerald-400">{a.score}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-600">
                      {new Date(a.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function WoWCard({ label, current, previous, diff, unit, icon: Icon }) {
  const isUp = parseFloat(diff) >= 0;
  return (
    <div className="glass-panel bg-white/[0.02] border-white/5 p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-violet-400" />
        </div>
        {diff !== null && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${isUp ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}>
            {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(diff)}{unit === '%' ? 'pts' : '%'} vs last wk
          </div>
        )}
      </div>
      <p className="text-3xl font-black text-white">{current ?? '—'}{unit}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
      {previous !== undefined && <p className="text-[10px] text-slate-700 mt-0.5">Last week: {previous ?? '—'}{unit}</p>}
    </div>
  );
}
