'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminAnalysesPage() {
  const [analyses, setAnalyses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit, search });
      const res = await fetch(`/api/admin/analyses?${params}`);
      const json = await res.json();
      setAnalyses(json.analyses || []);
      setTotal(json.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPages = Math.ceil(total / limit);

  const getScoreColor = (s) => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-lime-400' : s >= 40 ? 'text-amber-400' : 'text-rose-400';
  const getBarColor = (s) => s >= 80 ? 'bg-emerald-500' : s >= 60 ? 'bg-lime-500' : s >= 40 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-1">Management</p>
          <h1 className="text-3xl font-black tracking-tight text-white">
            All <span className="gradient-text">Analyses</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1">{total.toLocaleString()} total resume scans</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-bold text-slate-400 hover:text-white hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all duration-300"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter */}
      <div className="glass-panel bg-white/[0.02] border-white/5 p-4">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] max-w-sm focus-within:border-cyan-500/40 transition-all duration-300">
          <Search className="w-4 h-4 text-slate-600 shrink-0" />
          <input
            type="text"
            placeholder="Search by user email…"
            className="bg-transparent text-sm flex-1 focus:outline-none text-white placeholder:text-slate-700"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel bg-white/[0.02] border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                {['User', 'Resume', 'Score', 'Missing Keywords', 'Strengths', 'Weaknesses', 'Date'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/[0.04]">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-3 rounded-full bg-white/5 animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : analyses.length === 0
                  ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-600">No analyses found</td>
                    </tr>
                  )
                  : analyses.map((a) => (
                    <tr key={a._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-3.5 text-xs text-slate-500 max-w-[160px] truncate font-medium">{a.userEmail}</td>
                      <td className="px-6 py-3.5 text-xs text-slate-300 max-w-[140px] truncate font-medium">{a.resumeName}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 rounded-full bg-white/5">
                            <div className={`h-1.5 rounded-full ${getBarColor(a.score)}`} style={{ width: `${a.score}%` }} />
                          </div>
                          <span className={`text-xs font-black ${getScoreColor(a.score)}`}>{a.score}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-xs font-black text-rose-400">{a.missingKeywords?.length ?? 0}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-xs font-black text-emerald-400">{a.strengths?.length ?? 0}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-xs font-black text-amber-400">{a.weaknesses?.length ?? 0}</span>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-slate-600 font-medium">
                        {new Date(a.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' })}
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/5">
            <p className="text-xs text-slate-600 font-medium">
              Page {page} of {totalPages} · {total} records
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`p-1.5 rounded-lg transition-colors ${page === 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-white px-2">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`p-1.5 rounded-lg transition-colors ${page === totalPages ? 'opacity-20 cursor-not-allowed' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
