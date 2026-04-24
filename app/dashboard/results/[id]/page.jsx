import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/mongodb';
import Result from '@/models/Result';
import ResultsDisplay from '@/components/sections/ResultsDisplay';

export default async function ResultDetailsPage({ params }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const { id } = await params;

  await dbConnect();
  
  // Fetch specific result ensuring it belongs to user
  const resultData = await Result.findOne({ _id: id, userEmail: session.user.email }).lean();

  if (!resultData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Report Not Found</h2>
        <p className="text-gray-500 mb-6">This analysis might have been deleted or doesn't belong to you.</p>
        <Link href="/dashboard" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // Convert the generic JSON into what our UI component expects
  // The UI component normally expects `results`, which is what is in resultData
  const uiResults = {
    score: resultData.score,
    funnyMessage: resultData.funnyMessage,
    strengths: resultData.strengths,
    weaknesses: resultData.weaknesses,
    suggestions: resultData.suggestions,
    missingKeywords: resultData.missingKeywords,
    charts: resultData.charts
  };

  return (
    <div className="max-w-5xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="glass-panel mb-10 p-8 border-white/5 bg-white/[0.02] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase mb-2">
            Analysis Report
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            Target Resource: <span className="text-violet-400">{resultData.resumeName}</span>
          </p>
        </div>
        <div className="md:text-right">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Timestamp</span>
          <p className="font-bold text-slate-300">{new Date(resultData.createdAt).toLocaleDateString()} at {new Date(resultData.createdAt).toLocaleTimeString()}</p>
        </div>
      </div>

      <div className="glass-panel p-2 md:p-8 border-white/5 bg-white/[0.02]">
        <ResultsDisplay results={uiResults} />
      </div>
    </div>
  );
}
