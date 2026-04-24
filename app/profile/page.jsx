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
    <div className="relative min-h-screen bg-black pt-20 pb-12 overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Grid texture */}
      <div className="absolute inset-0 grid-texture opacity-50 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Premium Profile Header */}
        <ProfileWrapper initialUser={userDetails} />

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Total Analyses Card */}
          <div className="glass-panel group p-8 hover:scale-[1.02] bg-white/[0.02] border-white/5">
            <div className="flex items-center gap-4 mb-4">
              <span className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/20 text-blue-400 rounded-2xl group-hover:scale-110 transition-transform">
                <Activity className="w-8 h-8" />
              </span>
              <div>
                <h3 className="text-slate-500 font-bold text-xs tracking-widest uppercase">TOTAL ANALYSES</h3>
                <p className="text-4xl font-extrabold stat-value tracking-tight">
                  {totalUserAnalyses}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-500">Resumes scanned & evaluated</p>
          </div>

          {/* Average Score Card */}
          <div className="glass-panel group p-8 hover:scale-[1.02] bg-white/[0.02] border-white/5">
            <div className="flex items-center gap-4 mb-4">
              <span className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/20 text-purple-400 rounded-2xl group-hover:scale-110 transition-transform">
                <Award className="w-8 h-8" />
              </span>
              <div>
                <h3 className="text-slate-500 font-bold text-xs tracking-widest uppercase">AVERAGE SCORE</h3>
                <p className="text-4xl font-extrabold stat-value tracking-tight">
                  {averageScore}%
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-500">Overall match success rate</p>
          </div>
        </div>

      </div>
    </div>
  );
}
