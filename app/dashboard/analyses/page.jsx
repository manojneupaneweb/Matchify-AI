import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Result from '@/models/Result';
import Link from 'next/link';
import { FileText, Calendar, Target, ArrowRight, Search, Filter } from 'lucide-react';

export default async function AnalysesHistoryPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  await dbConnect();
  
  // Fetch all user results sorted by newest first
  const allResults = await Result.find({ userEmail: session.user.email }).sort({ createdAt: -1 }).lean();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analysis History</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Browse and manage all your past resume-to-job match analyses</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search reports..." 
              className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm w-full md:w-64"
            />
          </div>
          <button className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Filter className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {allResults.length > 0 ? (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Resume Name</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Score</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Date Analyzed</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-gray-700 dark:text-gray-300">
                {allResults.map((result) => (
                  <tr 
                    key={result._id.toString()} 
                    className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-100/50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{result.resumeName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col items-center justify-center">
                        <div className={`
                          w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm
                          ${result.score >= 80 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' 
                            : result.score >= 50 
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' 
                            : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}
                        `}>
                          {result.score}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div className="flex flex-col">
                          <span className="font-semibold">{new Date(result.createdAt).toLocaleDateString()}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                            {new Date(result.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link 
                        href={`/dashboard/results/${result._id}`}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold rounded-xl hover:scale-105 transition-all shadow-lg shadow-gray-900/10 dark:shadow-white/5 active:scale-95"
                      >
                        View Report <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-16 shadow-xl border border-dashed border-gray-300 dark:border-gray-700 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-3xl flex items-center justify-center mx-auto mb-6 text-gray-400">
            <FileText className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Analyses Found</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-8">You haven't performed any resume analyses yet. Start your first scan to see your history here.</p>
          <Link 
            href="/#analyzer" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:scale-105 transition-all shadow-xl shadow-blue-600/20"
          >
            Start New Analysis <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
