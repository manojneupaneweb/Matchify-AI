import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../api/auth/[...nextauth]/route';
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
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Analysis Report
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            Target File: <span className="font-medium text-gray-700 dark:text-gray-300">{resultData.resumeName}</span>
          </p>
        </div>
        <div className="mt-4 md:mt-0 text-right">
          <span className="text-sm text-gray-500">Analyzed on</span>
          <p className="font-semibold text-gray-900 dark:text-white">{new Date(resultData.createdAt).toLocaleDateString()} at {new Date(resultData.createdAt).toLocaleTimeString()}</p>
        </div>
      </div>

      <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-1 md:p-4 border border-indigo-500/10">
        <ResultsDisplay results={uiResults} />
      </div>
    </div>
  );
}
