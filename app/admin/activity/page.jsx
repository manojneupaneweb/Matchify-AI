'use client';
import { useState, useEffect, useRef } from 'react';
import { Activity, RefreshCw, FileText, UserPlus, Zap, Clock } from 'lucide-react';

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getScoreColor(s) {
  if (s >= 80) return 'text-emerald-400';
  if (s >= 60) return 'text-lime-400';
  if (s >= 40) return 'text-amber-400';
  return 'text-rose-400';
}

export default function AdminActivityPage() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef(null);

  const fetchFeed = async () => {
    try {
      const res = await fetch('/api/admin/activity');
      const json = await res.json();
      setFeed(json.feed || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchFeed(); }, []);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchFeed, 10000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh]);

  const analyses = feed.filter(f => f.type === 'analysis');
  const signups  = feed.filter(f => f.type === 'signup');

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Live Feed</p>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Platform <span className="gradient-text">Activity</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1">Auto-refreshes every 10 seconds</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setAutoRefresh(v => !v)}
              className={`w-10 h-5 rounded-full transition-colors duration-300 relative ${autoRefresh ? 'bg-emerald-500' : 'bg-white/10'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all duration-300 ${autoRefresh ? 'left-5' : 'left-0.5'}`} />
            </div>
            <span className="text-xs font-bold text-slate-400">Auto</span>
          </label>
          <button onClick={fetchFeed} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-bold text-slate-400 hover:text-white hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Events Today', value: feed.filter(f => new Date(f.at).toDateString() === new Date().toDateString()).length, color: 'text-violet-400', icon: Zap },
          { label: 'Recent Analyses', value: analyses.length, color: 'text-cyan-400', icon: FileText },
          { label: 'Recent Signups', value: signups.length, color: 'text-emerald-400', icon: UserPlus },
        ].map(s => (
          <div key={s.label} className="glass-panel bg-white/[0.02] border-white/5 p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color === 'text-violet-400' ? 'bg-violet-500/10' : s.color === 'text-cyan-400' ? 'bg-cyan-500/10' : 'bg-emerald-500/10'}`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Live Feed */}
      <div className="glass-panel bg-white/[0.02] border-white/5 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-white/5">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Live Event Feed</h2>
          <span className="ml-2 px-2 py-0.5 text-[9px] font-black rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 animate-pulse">LIVE</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-white/5 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 rounded-full bg-white/5" style={{ width: `${Math.random() * 40 + 40}%` }} />
                  <div className="h-2 rounded-full bg-white/5 w-24" />
                </div>
                <div className="h-2 w-12 rounded-full bg-white/5" />
              </div>
            ))}
          </div>
        ) : feed.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Activity className="w-10 h-10 text-slate-700" />
            <p className="text-sm text-slate-600">No recent activity</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {feed.map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.type === 'analysis' ? 'bg-cyan-500/10' : 'bg-emerald-500/10'}`}>
                  {item.type === 'analysis'
                    ? <FileText className="w-4 h-4 text-cyan-400" />
                    : <UserPlus className="w-4 h-4 text-emerald-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-300 truncate">{item.detail}</p>
                  <p className="text-[10px] text-slate-600 truncate">{item.user}</p>
                </div>
                {item.score !== null && (
                  <span className={`text-xs font-black shrink-0 ${getScoreColor(item.score)}`}>{item.score}%</span>
                )}
                <div className="flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3 text-slate-700" />
                  <span className="text-[10px] text-slate-700">{timeAgo(item.at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
