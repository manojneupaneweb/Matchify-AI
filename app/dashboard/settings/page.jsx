'use client';

import { useState } from 'react';
import { 
  Settings, User, Bell, Shield, Lock, Eye, EyeOff, 
  CheckCircle2, AlertCircle, Trash2, Globe, Key, Zap
} from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: 'Password updated successfully!' });
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to update password' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'password', label: 'Password', icon: Key },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tighter italic uppercase">Settings</h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Manage your profile, account security, and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 bg-white/[0.02] p-1.5 rounded-2xl border border-white/5 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all
              ${activeTab === tab.id 
                ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {activeTab === 'general' && (
          <>
            {/* Profile Card */}
            <div className="glass-panel p-10 border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3.5 bg-violet-500/10 text-violet-400 rounded-2xl">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Profile Overview</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your identity and plan status</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Subscription Tier</p>
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 rounded-xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest">Matchify PRO</span>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Renews Sep 2026</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Contact</p>
                  <p className="text-white font-bold tracking-tight">{session?.user?.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="glass-panel p-10 border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3.5 bg-cyan-500/10 text-cyan-400 rounded-2xl">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Notifications</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Control how you receive updates</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { title: 'Analysis Reports', sub: 'Receive match scores via email', checked: true },
                  { title: 'Platform Updates', sub: 'Stay updated on latest AI tools', checked: true }
                ].map((notif, i) => (
                  <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-white/10 transition-colors group">
                    <div>
                      <p className="font-bold text-white tracking-tight group-hover:text-violet-400 transition-colors">{notif.title}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{notif.sub}</p>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={notif.checked} className="sr-only peer" />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="glass-panel p-10 border-rose-500/10 bg-rose-500/[0.02]">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3.5 bg-rose-500/10 text-rose-500 rounded-2xl">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-rose-500 uppercase tracking-tighter italic">Danger Zone</h3>
                  <p className="text-[10px] font-bold text-rose-500/50 uppercase tracking-widest">Irreversible account actions</p>
                </div>
              </div>

              <button className="px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-rose-600/20 transition-all">
                Terminate Account
              </button>
            </div>
          </>
        )}

        {activeTab === 'password' && (
          <div className="glass-panel p-10 border-white/5 bg-white/[0.02] animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3.5 bg-violet-500/10 text-violet-400 rounded-2xl">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Update Password</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secure your account with a unique password</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
              {status.message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300 ${
                  status.type === 'success' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                  <p className="text-[10px] font-black uppercase tracking-widest">{status.message}</p>
                </div>
              )}

              {['current', 'new', 'confirm'].map((field) => (
                <div key={field} className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    {field === 'current' ? 'Current Password' : field === 'new' ? 'New Password' : 'Confirm New Password'}
                  </label>
                  <div className="relative group">
                    <input
                      type={showPasswords[field] ? 'text' : 'password'}
                      required
                      value={formData[`${field}Password`]}
                      onChange={(e) => setFormData({ ...formData, [`${field}Password`]: e.target.value })}
                      className="w-full pl-12 pr-12 py-4 bg-white/[0.02] border border-white/5 rounded-2xl focus:border-violet-500/50 outline-none transition-all text-white placeholder:text-slate-700"
                      placeholder="••••••••"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-violet-400 transition-colors" />
                    <button
                      type="button"
                      onClick={() => toggleVisibility(field)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
                    >
                      {showPasswords[field] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-4 shadow-violet-500/20"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="spinner w-5 h-5 border-2 border-white/20 border-t-white" />
                    UPDATING...
                  </span>
                ) : 'CONFIRM CHANGE'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="glass-panel p-10 border-white/5 bg-white/[0.02] animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3.5 bg-cyan-500/10 text-cyan-400 rounded-2xl">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Advanced Security</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Manage active sessions and extra protection</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.01] border border-white/5 group">
                <div className="flex items-center gap-5">
                  <div className="p-3 bg-violet-500/5 text-violet-400 rounded-xl">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white tracking-tight">Two-Factor Authentication</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Recommended for maximum account safety</p>
                  </div>
                </div>
                <button className="px-5 py-2 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl text-slate-300 transition-all">Enable</button>
              </div>

              <div className="flex items-center justify-between p-6 rounded-2xl bg-white/[0.01] border border-white/5 group">
                <div className="flex items-center gap-5">
                  <div className="p-3 bg-cyan-500/5 text-cyan-400 rounded-xl">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white tracking-tight">Browser Sessions</p>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">1 Active Session (Current Device)</p>
                  </div>
                </div>
                <button className="px-5 py-2 bg-rose-500/5 hover:bg-rose-500/10 text-[10px] font-black uppercase tracking-widest rounded-xl text-rose-500/70 transition-all">Logout All</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
