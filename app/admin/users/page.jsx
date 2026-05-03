'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Search, RefreshCw, ChevronLeft, ChevronRight, Shield, User } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 15;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit, search, role });
      const res = await fetch(`/api/admin/users?${params}`);
      const json = await res.json();
      setUsers(json.users || []);
      setTotal(json.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, search, role]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPages = Math.ceil(total / limit);

  const getScoreColor = (s) => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-lime-400' : s >= 40 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="space-y-6 animate-fade-in-up">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400 mb-1">Management</p>
          <h1 className="text-3xl font-black tracking-tight text-white">
            All <span className="gradient-text">Users</span>
          </h1>
          <p className="text-xs text-slate-600 mt-1">{total.toLocaleString()} total registered accounts</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-bold text-slate-400 hover:text-white hover:border-violet-500/30 hover:bg-violet-500/10 transition-all duration-300"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-violet-400' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="glass-panel bg-white/[0.02] border-white/5 p-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] focus-within:border-violet-500/40 transition-all duration-300">
          <Search className="w-4 h-4 text-slate-600 shrink-0" />
          <input
            type="text"
            placeholder="Search by name or email…"
            className="bg-transparent text-sm flex-1 focus:outline-none text-white placeholder:text-slate-700"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm font-semibold text-slate-400 focus:outline-none focus:border-violet-500/40 transition-all"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-panel bg-white/[0.02] border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                {['User', 'Role', 'Analyses', 'Top Score', 'Joined', 'Last Login'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/[0.04]">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-6 py-4">
                          <div className="h-3 rounded-full bg-white/5 animate-pulse" style={{ width: `${Math.random() * 50 + 40}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : users.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-600">No users found</td>
                    </tr>
                  )
                  : users.map((user) => (
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
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                          user.role === 'admin'
                            ? 'bg-amber-500/15 border border-amber-500/25 text-amber-400'
                            : 'bg-white/5 border border-white/10 text-slate-500'
                        }`}>
                          {user.role === 'admin' ? <Shield className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-sm font-black text-cyan-400">{user.analysisCount}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        {user.topScore !== null
                          ? <span className={`text-sm font-black ${getScoreColor(user.topScore)}`}>{user.topScore}%</span>
                          : <span className="text-slate-700">—</span>
                        }
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
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/5">
            <p className="text-xs text-slate-600 font-medium">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
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
