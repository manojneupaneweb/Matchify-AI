'use client';

import { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, LogOut, Monitor } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function SecurityPage() {
  const { data: session } = useSession();
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
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [logoutAllStatus, setLogoutAllStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
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
    } catch {
      setStatus({ type: 'error', message: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    setLogoutAllLoading(true);
    setLogoutAllStatus({ type: '', message: '' });
    try {
      const res = await fetch('/api/user/logout-all', { method: 'POST' });
      if (res.ok) {
        setLogoutAllStatus({ type: 'success', message: 'All sessions terminated. Signing you out...' });
        setTimeout(() => signOut({ callbackUrl: '/login' }), 1500);
      } else {
        setLogoutAllStatus({ type: 'error', message: 'Failed to logout all sessions.' });
      }
    } catch {
      setLogoutAllStatus({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setLogoutAllLoading(false);
    }
  };

  const toggleVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 space-y-8">
      <div className="mb-2">
        <h1 className="text-4xl font-black text-white mb-2 tracking-tighter italic uppercase">Security</h1>
        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Manage your password and active sessions</p>
      </div>

      {/* Change Password */}
      <div className="glass-panel p-10 border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3.5 bg-violet-500/10 text-violet-400 rounded-2xl">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Update Password</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secure your account with a strong password</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
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
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                UPDATING...
              </span>
            ) : 'CONFIRM CHANGE'}
          </button>
        </form>
      </div>

      {/* Browser Sessions */}
      <div className="glass-panel p-10 border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3.5 bg-cyan-500/10 text-cyan-400 rounded-2xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Browser Sessions</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Manage and terminate active sessions</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Current session card */}
          <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-5">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-white tracking-tight">Current Device</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                  {session?.user?.email || 'Active session'}
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Active</span>
            </span>
          </div>

          {/* Logout all status */}
          {logoutAllStatus.message && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300 ${
              logoutAllStatus.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {logoutAllStatus.type === 'success'
                ? <CheckCircle2 className="w-5 h-5 shrink-0" />
                : <AlertCircle className="w-5 h-5 shrink-0" />}
              <p className="text-[10px] font-black uppercase tracking-widest">{logoutAllStatus.message}</p>
            </div>
          )}

          {/* Logout All button */}
          <button
            onClick={handleLogoutAll}
            disabled={logoutAllLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/30 text-rose-400 transition-all duration-300 group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {logoutAllLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-rose-400/30 border-t-rose-400 rounded-full animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest">Terminating Sessions...</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Logout All Devices</span>
              </>
            )}
          </button>
          <p className="text-[9px] text-slate-600 text-center font-bold uppercase tracking-widest">
            This will immediately sign out all active sessions including this one.
          </p>
        </div>
      </div>
    </div>
  );
}
