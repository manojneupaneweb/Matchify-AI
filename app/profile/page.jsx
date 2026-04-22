import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Result from '@/models/Result';
import UserModel from '@/models/User';
import Link from 'next/link';
import { ArrowLeft, Activity, Award } from 'lucide-react';
import ProfileWrapper from './ProfileWrapper';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  await dbConnect();
  
  // Fetch full user locally to pass up-to-date fields like phone, address, profilePic
  let userDoc = await UserModel.findOne({ email: session.user.email }).lean();
  let userDetails = session.user;

  if (userDoc) {
    userDetails = {
      ...session.user,
      name: userDoc.name || session.user.name,
      phone: userDoc.phone,
      address: userDoc.address,
      profilePic: userDoc.profilePic
    };
  }
  
  const results = await Result.find({ userEmail: session.user.email }).lean();
  const totalUserAnalyses = results.length;
  
  const averageScore = results.length > 0
    ? (results.reduce((acc, curr) => acc + (curr.score || 0), 0) / results.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Premium Profile Header with Glass Effect */}
        <ProfileWrapper initialUser={userDetails} />

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Total Analyses Card */}
          <div className="group bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center gap-4 mb-4">
              <span className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:scale-110 transition-transform">
                <Activity className="w-8 h-8" />
              </span>
              <div>
                <h3 className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">TOTAL ANALYSES</h3>
                <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {totalUserAnalyses}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Resumes scanned & evaluated</p>
          </div>

          {/* Average Score Card */}
          <div className="group bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:scale-[1.02]">
            <div className="flex items-center gap-4 mb-4">
              <span className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 text-purple-600 dark:text-purple-400 rounded-2xl group-hover:scale-110 transition-transform">
                <Award className="w-8 h-8" />
              </span>
              <div>
                <h3 className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">AVERGAGE SCORE</h3>
                <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {averageScore}%
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Overall match success rate</p>
          </div>
        </div>

      </div>
    </div>
  );
}
