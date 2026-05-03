'use client';
import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, RefreshCw, Tag, Users, Activity, Zap } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch_ = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/analytics');
      setData(await res.json());
    } finally { setLoading(false); }
  };
  useEffect(() => { fetch_(); }, []);

  if (loading) return <Loader />;

  const { scoresByDay, userGrowth, topKeywords, avgScoreByUser, analysesPerHour } = data;

  const maxScore = Math.max(...scoresByDay.map(d => d.avgScore), 1);
  const maxGrowth = Math.max(...userGrowth.map(d => d.count), 1);
  const maxKw = Math.max(...topKeywords.map(k => k.count), 1);
  const maxHour = Math.max(...analysesPerHour.map(h => h.count), 1);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader title="Analytics" accent="text-violet-400" onRefresh={fetch_} loading={loading} />

      {/* Score Trend (30 days) */}
      <Section icon={TrendingUp} iconColor="text-violet-400" title="Average Match Score — Last 30 Days">
        {scoresByDay.length > 0 ? (
          <div className="space-y-2">
            {scoresByDay.map(d => (
              <div key={d._id} className="flex items-center gap-3">
                <span className="text-[9px] font-bold text-slate-600 w-20 shrink-0">{d._id}</span>
                <div className="flex-1 h-2 rounded-full bg-white/5">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-700"
                    style={{ width: `${(d.avgScore / maxScore) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-black text-violet-400 w-12 text-right">{d.avgScore.toFixed(1)}%</span>
                <span className="text-[9px] text-slate-700 w-10 text-right">{d.count} scans</span>
              </div>
            ))}
          </div>
        ) : <Empty text="No score data in last 30 days" />}
      </Section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* User Growth */}
        <Section icon={Users} iconColor="text-cyan-400" title="User Registrations — Last 30 Days">
          {userGrowth.length > 0 ? (
            <div className="space-y-2">
              {userGrowth.map(d => (
                <div key={d._id} className="flex items-center gap-3">
                  <span className="text-[9px] font-bold text-slate-600 w-20 shrink-0">{d._id}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/5">
                    <div className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700" style={{ width: `${(d.count / maxGrowth) * 100}%` }} />
                  </div>
                  <span className="text-[10px] font-black text-cyan-400 w-8 text-right">{d.count}</span>
                </div>
              ))}
            </div>
          ) : <Empty text="No new users in last 30 days" />}
        </Section>

        {/* Hourly Activity Heatmap */}
        <Section icon={Activity} iconColor="text-emerald-400" title="Analyses by Hour of Day (UTC)">
          <div className="grid grid-cols-12 gap-1">
            {Array.from({ length: 24 }, (_, h) => {
              const found = analysesPerHour.find(x => x._id === h);
              const count = found?.count || 0;
              const intensity = maxHour > 0 ? count / maxHour : 0;
              return (
                <div key={h} className="flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded transition-all duration-500"
                    style={{
                      height: `${Math.max(8, intensity * 64)}px`,
                      background: `rgba(139,92,246,${0.1 + intensity * 0.9})`
                    }}
                    title={`${h}:00 — ${count} scans`}
                  />
                  <span className="text-[7px] text-slate-700 font-bold">{h}</span>
                </div>
              );
            })}
          </div>
          <p className="text-[9px] text-slate-700 mt-2 text-center">Hour of day (0–23 UTC) · height = relative volume</p>
        </Section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Missing Keywords */}
        <Section icon={Tag} iconColor="text-rose-400" title="Top Missing Keywords (All Analyses)">
          {topKeywords.length > 0 ? (
            <div className="space-y-2">
              {topKeywords.map(k => (
                <div key={k._id} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-400 flex-1 truncate">{k._id || 'Unknown'}</span>
                  <div className="w-32 h-1.5 rounded-full bg-white/5">
                    <div className="h-1.5 rounded-full bg-rose-500/60 transition-all" style={{ width: `${(k.count / maxKw) * 100}%` }} />
                  </div>
                  <span className="text-[10px] font-black text-rose-400 w-8 text-right">{k.count}</span>
                </div>
              ))}
            </div>
          ) : <Empty text="No keyword data" />}
        </Section>

        {/* Power Users */}
        <Section icon={Zap} iconColor="text-amber-400" title="Most Active Users">
          {avgScoreByUser.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/5">
                    {['User', 'Analyses', 'Avg Score'].map(h => (
                      <th key={h} className="text-left py-2 pr-4 text-[9px] font-black uppercase tracking-widest text-slate-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {avgScoreByUser.map((u, i) => (
                    <tr key={u._id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="py-2 pr-4 text-slate-400 max-w-[160px] truncate">{u._id}</td>
                      <td className="py-2 pr-4 font-black text-cyan-400">{u.count}</td>
                      <td className={`py-2 font-black ${u.avgScore >= 80 ? 'text-emerald-400' : u.avgScore >= 60 ? 'text-lime-400' : u.avgScore >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {u.avgScore.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <Empty text="No user data" />}
        </Section>
      </div>
    </div>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center h-60">
      <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
    </div>
  );
}

function PageHeader({ title, accent, onRefresh, loading }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${accent} mb-1`}>{title}</p>
        <h1 className="text-3xl font-black tracking-tight text-white">
          Platform <span className="gradient-text">{title}</span>
        </h1>
      </div>
      <button onClick={onRefresh} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-bold text-slate-400 hover:text-white hover:bg-violet-500/10 hover:border-violet-500/30 transition-all">
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-violet-400' : ''}`} /> Refresh
      </button>
    </div>
  );
}

function Section({ icon: Icon, iconColor, title, children }) {
  return (
    <div className="glass-panel bg-white/[0.02] border-white/5 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <h2 className="text-sm font-black text-white uppercase tracking-wider">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Empty({ text }) {
  return <p className="text-sm text-slate-700 text-center py-6">{text}</p>;
}
