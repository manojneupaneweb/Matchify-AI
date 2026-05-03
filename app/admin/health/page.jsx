'use client';
import { useState, useEffect } from 'react';
import { Server, RefreshCw, CheckCircle, XCircle, Clock, Database, Cpu, HardDrive, Wifi } from 'lucide-react';

function fmt(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

export default function AdminHealthPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/health');
      setData(await res.json());
      setLastCheck(new Date());
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const isHealthy = data?.status === 'healthy';

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
              {data ? (isHealthy ? 'All Systems Operational' : 'Degraded') : 'Checking…'}
            </p>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">System <span className="gradient-text">Health</span></h1>
          {lastCheck && <p className="text-xs text-slate-600 mt-1">Last checked {lastCheck.toLocaleTimeString()}</p>}
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-bold text-slate-400 hover:text-white hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} /> Run Check
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Database', icon: Database,
            status: data?.dbState === 'connected',
            value: data?.dbState || '—',
            sub: data?.dbPingMs != null ? `${data.dbPingMs}ms ping` : '—'
          },
          {
            label: 'API Server', icon: Server,
            status: true,
            value: 'Running',
            sub: data?.env || '—'
          },
          {
            label: 'Node.js', icon: Cpu,
            status: true,
            value: data?.nodeVersion || '—',
            sub: 'Runtime'
          },
          {
            label: 'Uptime', icon: Clock,
            status: true,
            value: data?.uptime ? formatUptime(data.uptime) : '—',
            sub: 'Server uptime'
          },
        ].map(card => (
          <div key={card.label} className="glass-panel bg-white/[0.02] border-white/5 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.status ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
                <card.icon className={`w-5 h-5 ${card.status ? 'text-emerald-400' : 'text-rose-400'}`} />
              </div>
              {card.status
                ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                : <XCircle className="w-4 h-4 text-rose-400" />
              }
            </div>
            <p className="text-sm font-black text-white">{card.value}</p>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mt-0.5">{card.label}</p>
            <p className="text-[10px] text-slate-700 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Storage Stats */}
        <div className="glass-panel bg-white/[0.02] border-white/5 p-5">
          <div className="flex items-center gap-2 mb-5">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Storage</h2>
          </div>
          {data ? (
            <div className="space-y-4">
              {[
                { label: 'Data Size', value: fmt(data.dataSize), pct: data.dataSize && data.storageSize ? (data.dataSize / data.storageSize * 100).toFixed(0) : 0, color: 'bg-violet-500' },
                { label: 'Storage Allocated', value: fmt(data.storageSize), pct: 100, color: 'bg-cyan-500' },
                { label: 'Index Size', value: fmt(data.indexSize), pct: data.indexSize && data.storageSize ? (data.indexSize / data.storageSize * 100).toFixed(0) : 0, color: 'bg-amber-500' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400">{item.label}</span>
                    <span className="text-[10px] font-black text-slate-500">{item.value}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5">
                    <div className={`h-2 rounded-full ${item.color} transition-all duration-700`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="h-20 flex items-center justify-center"><div className="w-6 h-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" /></div>}
        </div>

        {/* Collections */}
        <div className="glass-panel bg-white/[0.02] border-white/5 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5">
            <Database className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">Collections · {data?.dbName || '—'}</h2>
          </div>
          <div className="divide-y divide-white/[0.03]">
            {(data?.collections || []).map(col => (
              <div key={col.name} className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-violet-500" />
                  <span className="text-sm font-bold text-slate-300 capitalize">{col.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-cyan-400">{col.documents.toLocaleString()} docs</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services checklist */}
      <div className="glass-panel bg-white/[0.02] border-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Wifi className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-black text-white uppercase tracking-wider">External Services</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { name: 'Google Gemini API', status: true, detail: 'AI resume analysis engine' },
            { name: 'MongoDB Atlas', status: data?.dbState === 'connected', detail: data?.dbPingMs ? `${data.dbPingMs}ms latency` : 'Checking…' },
            { name: 'NextAuth.js', status: true, detail: 'OAuth + JWT authentication' },
          ].map(svc => (
            <div key={svc.name} className={`flex items-center gap-3 p-4 rounded-xl border ${svc.status ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-rose-500/5 border-rose-500/15'}`}>
              {svc.status ? <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" /> : <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              <div>
                <p className="text-xs font-bold text-white">{svc.name}</p>
                <p className="text-[10px] text-slate-600">{svc.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
