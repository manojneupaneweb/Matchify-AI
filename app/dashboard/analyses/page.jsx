import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Result from '@/models/Result';
import Link from 'next/link';
import { FileText, Calendar, Target, ArrowRight, Search, Filter } from 'lucide-react';

export default async function AnalysesHistoryPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const page = parseInt(searchParams?.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  await dbConnect();
  
  // Fetch paginated results and total count
  const [results, totalCount] = await Promise.all([
    Result.find({ userEmail: session.user.email })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Result.countDocuments({ userEmail: session.user.email })
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="max-w-7xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 md:px-0">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter italic uppercase">Analysis History</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Browse and manage all your past resume-to-job match analyses</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search reports..." 
              className="pl-12 pr-6 py-3 bg-white/[0.02] border border-white/5 rounded-2xl focus:border-violet-500/50 outline-none transition-all text-sm w-full md:w-72 text-white placeholder:text-slate-600"
            />
          </div>
          <button className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 transition-colors text-slate-400">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {results.length > 0 ? (
        <div className="space-y-6">
          <div className="glass-panel overflow-hidden border-white/5 bg-white/[0.02]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.01] border-b border-white/5">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Resume Name</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Match Score</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date Analyzed</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {results.map((result) => (
                    <tr 
                      key={result._id.toString()} 
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-violet-500/10 rounded-2xl text-violet-400 group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-white tracking-tight">{result.resumeName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col items-center justify-center">
                          <div className={`
                            w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm shadow-lg
                            ${result.score >= 80 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : result.score >= 50 
                              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}
                          `}>
                            {result.score}%
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3 text-sm">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-300">{new Date(result.createdAt).toLocaleDateString()}</span>
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">
                              {new Date(result.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Link 
                          href={`/dashboard/results/${result._id}`}
                          className="btn-primary px-6 py-2.5 text-xs tracking-widest shadow-violet-500/10"
                        >
                          VIEW REPORT
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination UI */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-6 glass-panel border-white/5 bg-white/[0.01]">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Showing <span className="text-white">{skip + 1}</span> to <span className="text-white">{Math.min(skip + limit, totalCount)}</span> of <span className="text-white">{totalCount}</span> results
            </p>
            
            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/analyses?page=${Math.max(1, page - 1)}`}
                className={`
                  p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-slate-400 transition-all
                  ${page <= 1 ? 'opacity-20 pointer-events-none' : 'hover:bg-white/5 hover:text-white'}
                `}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </Link>

              <div className="flex items-center gap-1.5">
                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  // Show only first, last, and pages around current
                  if (totalPages > 5 && p !== 1 && p !== totalPages && Math.abs(p - page) > 1) {
                    if (p === 2 || p === totalPages - 1) return <span key={p} className="text-slate-600 px-1 font-black text-[10px]">...</span>;
                    return null;
                  }
                  return (
                    <Link
                      key={p}
                      href={`/dashboard/analyses?page=${p}`}
                      className={`
                        w-10 h-10 flex items-center justify-center rounded-xl text-[10px] font-black transition-all border
                        ${page === p 
                          ? 'bg-violet-500 text-white border-violet-500 shadow-lg shadow-violet-500/20' 
                          : 'bg-white/[0.02] text-slate-500 border-white/5 hover:bg-white/5 hover:text-slate-300'
                        }
                      `}
                    >
                      {p}
                    </Link>
                  );
                })}
              </div>

              <Link
                href={`/dashboard/analyses?page=${Math.min(totalPages, page + 1)}`}
                className={`
                  p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-slate-400 transition-all
                  ${page >= totalPages ? 'opacity-20 pointer-events-none' : 'hover:bg-white/5 hover:text-white'}
                `}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-20 border-white/5 bg-white/[0.02] border-dashed text-center">
          <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 text-slate-500">
            <FileText className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tighter italic">No Analyses Found</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-10 font-bold uppercase text-[10px] tracking-widest">You haven't performed any resume analyses yet. Start your first scan to see your history here.</p>
          <Link 
            href="/#analyzer" 
            className="btn-primary px-10 py-4 shadow-violet-500/20"
          >
            Start New Analysis
          </Link>
        </div>
      )}
    </div>
  );
}
