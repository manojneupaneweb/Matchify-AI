'use client';
import { useState, useEffect } from 'react';
import { Database, RefreshCw, CheckCircle, Table2, FileText, Users, BarChart3 } from 'lucide-react';

function fmt(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const s = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${s[i]}`;
}

const COLLECTION_META = {
  users:   { icon: Users,    color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', desc: 'Registered user accounts & OAuth profiles' },
  results: { icon: FileText, color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20',   desc: 'Resume analysis results & AI reports' },
  stats:   { icon: BarChart3,color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/20',desc: 'Global platform statistics counters' },
};

export default function AdminDatabasePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/health');
      setData(await res.json());
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-1">Infrastructure</p>
          <h1 className="text-3xl font-black tracking-tight text-white">Database <span className="gradient-text">Inspector</span></h1>
          <p className="text-xs text-slate-600 mt-1">MongoDB Atlas · {data?.dbName || '—'}</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-bold text-slate-400 hover:text-white hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} /> Refresh
        </button>
      </div>

      {/* Connection Card */}
      <div className="glass-panel bg-white/[0.02] border-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Connection Info</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Status', value: data?.dbState || '—', ok: data?.dbState === 'connected' },
            { label: 'Ping', value: data?.dbPingMs != null ? `${data.dbPingMs}ms` : '—', ok: data?.dbPingMs < 100 },
            { label: 'Database', value: data?.dbName || '—', ok: true },
            { label: 'Data Size', value: fmt(data?.dataSize), ok: true },
          ].map(item => (
            <div key={item.label} className="rounded-xl p-3 bg-white/[0.02] border border-white/[0.05]">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1.5">{item.label}</p>
              <div className="flex items-center gap-1.5">
                <CheckCircle className={`w-3 h-3 ${item.ok ? 'text-emerald-400' : 'text-slate-700'}`} />
                <p className={`text-sm font-bold ${item.ok ? 'text-white' : 'text-slate-600'}`}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collections Detail */}
      <div className="space-y-4">
        {(data?.collections || []).map(col => {
          const meta = COLLECTION_META[col.name] || { icon: Table2, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', desc: 'Collection' };
          const Icon = meta.icon;
          return (
            <div key={col.name} className="glass-panel bg-white/[0.02] border-white/5 p-5">
              <div className="flex items-start gap-4 mb-5">
                <div className={`w-11 h-11 rounded-2xl ${meta.bg} border ${meta.border} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${meta.color}`} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white capitalize">{col.name}</h3>
                  <p className="text-xs text-slate-500">{meta.desc}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className={`text-2xl font-black ${meta.color}`}>{col.documents.toLocaleString()}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">documents</p>
                </div>
              </div>

              {/* Schema Info */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {getSchemaFields(col.name).map(field => (
                  <div key={field.name} className="rounded-xl p-3 bg-white/[0.02] border border-white/[0.05]">
                    <p className={`text-[10px] font-black ${meta.color}`}>{field.name}</p>
                    <p className="text-[9px] text-slate-600 mt-0.5">{field.type}</p>
                    {field.note && <p className="text-[9px] text-slate-700 mt-0.5 italic">{field.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Storage Overview */}
      <div className="glass-panel bg-white/[0.02] border-white/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-violet-400" />
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Storage Overview</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Data', value: fmt(data?.dataSize), color: 'text-violet-400', bar: 'from-violet-600 to-purple-600' },
            { label: 'Storage Allocated', value: fmt(data?.storageSize), color: 'text-cyan-400', bar: 'from-cyan-600 to-blue-600' },
            { label: 'Index Size', value: fmt(data?.indexSize), color: 'text-emerald-400', bar: 'from-emerald-600 to-teal-600' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4 bg-white/[0.02] border border-white/[0.05] text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 mt-1">{s.label}</p>
              <div className={`mt-3 h-0.5 rounded-full bg-gradient-to-r ${s.bar} opacity-60`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getSchemaFields(collection) {
  const schemas = {
    users: [
      { name: 'email', type: 'String (unique)', note: 'Required' },
      { name: 'name', type: 'String', note: 'Default: ""' },
      { name: 'password', type: 'String', note: 'Hashed (optional)' },
      { name: 'role', type: 'Enum', note: '"admin" | "user"' },
      { name: 'phone', type: 'String', note: '' },
      { name: 'address', type: 'String', note: '' },
      { name: 'profilePic', type: 'String (URL)', note: '' },
      { name: 'lastLoginAt', type: 'Date', note: '' },
      { name: 'tokenVersion', type: 'Number', note: 'Session invalidation' },
      { name: 'createdAt', type: 'Date', note: 'Auto' },
      { name: 'updatedAt', type: 'Date', note: 'Auto' },
    ],
    results: [
      { name: 'userEmail', type: 'String', note: 'Required' },
      { name: 'resumeName', type: 'String', note: '' },
      { name: 'jobDescription', type: 'String', note: '' },
      { name: 'score', type: 'Number', note: 'Required (0–100)' },
      { name: 'funnyMessage', type: 'String', note: 'AI generated' },
      { name: 'strengths', type: '[String]', note: '' },
      { name: 'weaknesses', type: '[String]', note: '' },
      { name: 'suggestions', type: '[String]', note: '' },
      { name: 'missingKeywords', type: '[String]', note: '' },
      { name: 'charts.skillsMatch', type: 'Object', note: '5 skill categories' },
      { name: 'charts.keywordCoverage', type: 'Object', note: 'Matched / Missing' },
      { name: 'createdAt', type: 'Date', note: 'Auto' },
    ],
    stats: [
      { name: 'totalUsers', type: 'Number', note: 'Default: 0' },
      { name: 'totalAnalyses', type: 'Number', note: 'Default: 0' },
      { name: 'createdAt', type: 'Date', note: 'Auto' },
      { name: 'updatedAt', type: 'Date', note: 'Auto' },
    ],
  };
  return schemas[collection] || [];
}
