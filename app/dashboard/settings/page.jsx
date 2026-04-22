'use client';

import { Settings, User, Bell, Globe, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Account Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your profile preferences and account notifications</p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl">
              <User className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Profile Overview</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Type</p>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-blue-500 text-white text-xs font-bold uppercase tracking-wider">Pro Plan</span>
                <span className="text-xs text-gray-400">Renewing Sep 2026</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</p>
              <p className="text-gray-900 dark:text-white font-semibold">{session?.user?.email || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-black dark:text-white">Notification Preferences</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Email Notifications</p>
                <p className="text-xs text-gray-500">Receive analysis reports via email</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-blue-600 cursor-pointer" />
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">New Features</p>
                <p className="text-xs text-gray-500">Stay updated on latest platform tools</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-blue-600 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50/50 dark:bg-red-950/20 rounded-3xl p-8 border border-red-100 dark:border-red-900/50">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-2xl">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-900 dark:text-red-100">Danger Zone</h3>
              <p className="text-sm text-red-600/70 dark:text-red-400/70">Irreversible actions for your account</p>
            </div>
          </div>

          <button className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 transition-all text-sm">
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
}
