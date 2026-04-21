import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Result from '@/models/Result';
import Stats from '@/models/Stats';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  await dbConnect();
  
  // Fetch real user results
  const userResults = await Result.find({ userEmail: session.user.email })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const totalUserAnalyses = await Result.countDocuments({ userEmail: session.user.email });
  
  // Try to find the global stats
  const globalStats = await Stats.findOne().lean() || { totalUsers: 1, totalAnalyses: 1 };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Premium Header with Glass Effect */}
        <header className="relative mb-8 p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          {/* Decorative gradient background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-50"></div>
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl transform hover:scale-105 transition-transform duration-300">
                {payload?.name ? payload.name.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
                  Welcome back, {session.user.name || 'User'}
                </h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                  Active Now
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Logged securely via {session.user.image ? 'OAuth' : 'Email'}
                </p>
                <span className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25">
                  Pro User
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors group">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
              </button>
              <button className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors group">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button className="flex-1 min-w-[150px] px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-medium shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            New Analysis
          </button>
          <button className="flex-1 min-w-[150px] px-6 py-3.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl font-medium shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
            </svg>
            Upload Resume
          </button>
          <button className="flex-1 min-w-[150px] px-6 py-3.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl font-medium shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            View Reports
          </button>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users Card */}
          <div className="group bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 dark:text-gray-400 font-medium tracking-wide text-sm">TOTAL USERS</h3>
              <span className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </span>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">1,248</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="flex items-center text-sm font-medium text-green-500 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-lg">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                </svg>
                +12%
              </span>
              <span className="text-sm text-gray-500">from last month</span>
            </div>
          </div>

          {/* Total Analyses Card */}
          <div className="group bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 dark:text-gray-400 font-medium tracking-wide text-sm">TOTAL ANALYSES</h3>
              <span className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 text-purple-600 dark:text-purple-400 rounded-xl group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </span>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {totalUserAnalyses}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm text-gray-500">Total scans recorded</span>
            </div>
          </div>
          
          {/* Success Rate Card */}
          <div className="group bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-500 dark:text-gray-400 font-medium tracking-wide text-sm">SUCCESS RATE</h3>
              <span className="p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 text-green-600 dark:text-green-400 rounded-xl group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </span>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">94.8%</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="flex items-center text-sm font-medium text-green-500 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-lg">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                </svg>
                +5.2%
              </span>
              <span className="text-sm text-gray-500">from last month</span>
            </div>
          </div>

          {/* System Status Card */}
          <div className="group bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-3xl transform -translate-x-10 translate-y-10"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-blue-100 font-medium tracking-wide text-sm">SYSTEM STATUS</h3>
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </div>
              <p className="text-3xl font-bold text-white">Operational</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-sm text-blue-100">Uptime: 99.99%</span>
                <span className="text-blue-200">•</span>
                <span className="text-sm text-blue-100">All Systems Go</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Activity Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Activity</h3>
              <select className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-blue-500">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
            <div className="h-64 flex items-end justify-between gap-2">
              {[65, 45, 78, 56, 89, 72, 94].map((value, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-xl transition-all duration-500 hover:opacity-80" 
                       style={{height: `${value}%`}}></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {userResults.length > 0 ? userResults.map((activity, i) => (
                <a href={`/dashboard/results/${activity._id}`} key={i} className="flex items-center justify-between py-3 px-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                      {activity.score}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{activity.resumeName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Match score</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-sm text-blue-500 font-medium whitespace-nowrap">View Report →</span>
                    <p className="text-xs text-gray-400">{new Date(activity.createdAt).toLocaleDateString()}</p>
                  </div>
                </a>
              )) : (
                <div className="text-center py-6 text-gray-500">No analyses yet. Start one today!</div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Grid - Quick Stats & Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Skills */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Skills in Demand</h3>
            <div className="space-y-3">
              {[
                { skill: 'React', percentage: 85, color: 'from-blue-500 to-cyan-500' },
                { skill: 'Python', percentage: 78, color: 'from-purple-500 to-pink-500' },
                { skill: 'Node.js', percentage: 72, color: 'from-green-500 to-emerald-500' },
                { skill: 'AWS', percentage: 68, color: 'from-orange-500 to-red-500' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{item.skill}</span>
                    <span className="text-gray-900 dark:text-white font-semibold">{item.percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`} 
                         style={{width: `${item.percentage}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Tips</h3>
            <div className="space-y-4">
              {[
                { icon: '🎯', tip: 'Tailor your resume keywords to match job descriptions' },
                { icon: '📊', tip: 'Keep your resume to 1-2 pages for best results' },
                { icon: '✨', tip: 'Use action verbs to describe your achievements' },
                { icon: '💡', tip: 'Quantify your impact with numbers and metrics' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-700/50 dark:to-transparent">
                  <span className="text-2xl">{item.icon}</span>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{item.tip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Features */}
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-semibold text-white mb-4">Coming Soon</h3>
              <div className="space-y-3">
                {[
                  { feature: 'AI Interview Coach', date: 'Next Week' },
                  { feature: 'Salary Insights', date: 'Coming in May' },
                  { feature: 'Networking Tools', date: 'Coming in June' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <span className="text-white">{item.feature}</span>
                    <span className="text-xs font-medium px-2 py-1 bg-white/20 rounded-lg text-white">
                      {item.date}
                    </span>
                  </div>
                ))}
              </div>
              <button className="mt-6 w-full py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white font-medium transition-colors">
                Get Early Access
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}