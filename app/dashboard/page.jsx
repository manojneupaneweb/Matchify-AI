import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/mongodb';
import Result from '@/models/Result';
import Stats from '@/models/Stats';
import User from '@/models/User';
import UserScoreChart from './UserScoreChart';
import Link from 'next/link';
import { SkillsRadar, KeywordCoverage, ScoreDistribution } from './DashboardAnalytics';
import { 
  Mail, Phone, MapPin, CheckCircle, Target, TrendingUp, 
  Award, Zap, AlertTriangle, ArrowUpRight, ListChecks,
  Crown, History, BarChart3, PieChart, Activity
} from 'lucide-react';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  await dbConnect();
  
  // Fetch all user results for stats and charts
  const allUserResults = await Result.find({ userEmail: session.user.email }).sort({ createdAt: 1 }).lean();
  const totalUserAnalyses = allUserResults.length;
  
  // 1. KPI Metrics
  const userSuccessRate = totalUserAnalyses > 0
    ? (allUserResults.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalUserAnalyses).toFixed(1)
    : 0;
  const excellentMatches = allUserResults.filter(r => r.score >= 80).length;
  const topScore = totalUserAnalyses > 0 ? Math.max(...allUserResults.map(r => r.score)) : 0;
  const bestMatch = allUserResults.find(r => r.score === topScore);

  // 2. Chart Prep: Success Trend (Line)
  const chartData = allUserResults.slice(-10).map(r => ({
    date: r.createdAt,
    score: r.score
  }));

  // 3. Chart Prep: Skill Averages (Radar)
  const skillCategories = ['Technical Skills', 'Soft Skills', 'Experience', 'Education', 'Domain Knowledge'];
  const skillAverages = {};
  skillCategories.forEach(cat => {
    const total = allUserResults.reduce((acc, curr) => acc + (curr.charts?.skillsMatch?.[cat] || 0), 0);
    skillAverages[cat] = totalUserAnalyses > 0 ? Math.round(total / totalUserAnalyses) : 0;
  });

  // 4. Chart Prep: Keyword Coverage (Doughnut)
  const totalMatched = allUserResults.reduce((acc, curr) => acc + (curr.charts?.keywordCoverage?.Matched || 0), 0);
  const totalMissing = allUserResults.reduce((acc, curr) => acc + (curr.charts?.keywordCoverage?.Missing || 0), 0);

  // 5. Chart Prep: Score Distribution (Bar/Histogram)
  const buckets = [0, 0, 0, 0, 0]; // 0-20, 21-40, 41-60, 61-80, 81-100
  allUserResults.forEach(r => {
    const score = r.score;
    if (score <= 20) buckets[0]++;
    else if (score <= 40) buckets[1]++;
    else if (score <= 60) buckets[2]++;
    else if (score <= 80) buckets[3]++;
    else buckets[4]++;
  });

  // 6. Frequency Analysis (Strengths, Weaknesses, Missing Keywords)
  const getFrequencyMap = (records, field) => {
    const map = {};
    records.forEach(r => {
      (r[field] || []).forEach(item => {
        map[item] = (map[item] || 0) + 1;
      });
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Top 10
  };

  const topStrengths = getFrequencyMap(allUserResults, 'strengths');
  const topMissingKeywords = getFrequencyMap(allUserResults, 'missingKeywords');
  
  // 7. Analysis Velocity (Scans per day)
  const daysSinceFirstScan = totalUserAnalyses > 0 
    ? Math.max(1, Math.ceil((new Date() - new Date(allUserResults[0].createdAt)) / (1000 * 60 * 60 * 24)))
    : 1;
  const scanVelocity = (totalUserAnalyses / daysSinceFirstScan).toFixed(2);

  // 8. Dynamic Suggestions: Top 5 actionable items overall
  const commonSuggestions = getFrequencyMap(allUserResults, 'suggestions').map(s => s[0]).slice(0, 5);

  // 9. Goal Progress (Targeting 90% Avg)
  const targetScore = 90;
  const currentAvgNum = parseFloat(userSuccessRate);
  const goalProgress = Math.min(100, Math.round((currentAvgNum / targetScore) * 100));

  // 10. Skill Momentum (Compare last 3 scans vs all scans avg)
  const lastThreeResults = allUserResults.slice(-3);
  const lastThreeAvg = lastThreeResults.length > 0 
    ? lastThreeResults.reduce((acc, curr) => acc + curr.score, 0) / lastThreeResults.length
    : 0;
  const momentum = (lastThreeAvg - currentAvgNum).toFixed(1);

  // User/Profile Fetch
  const userDoc = await User.findOne({ email: session.user.email }).lean();
  const profileFields = ['name', 'phone', 'address', 'profilePic'];
  const completedFields = profileFields.filter(field => userDoc?.[field] && userDoc[field] !== '');
  const profileCompletion = Math.round((completedFields.length / profileFields.length) * 100);

  const recentScans = [...allUserResults].reverse().slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* SECTION 1: HEADER & HERO (3 Sections: Welcome, Profile Completion, Quick Actions) */}
        <header className="relative mb-8 p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-50"></div>
              <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl transform hover:rotate-3 transition-transform duration-300">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent italic">
                  WELCOME BACK, {session.user.name?.toUpperCase() || 'USER'}
                </h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-600 border border-green-200/50">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                  LIVE ANALYTICS
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-8">
                <div className="flex flex-col gap-2">
                  <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 text-sm font-medium">
                    <Mail className="w-4 h-4" /> {session.user.email}
                  </p>
                  {userDoc?.phone && (
                    <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 text-sm font-medium">
                      <Phone className="w-4 h-4" /> {userDoc.phone}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <div className="flex justify-between text-xs font-black uppercase tracking-tighter mb-1">
                    <span className="text-gray-400">Profile Completion</span>
                    <span className="text-blue-600">{profileCompletion}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden border border-gray-200/50 dark:border-gray-600/50">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Link href="/#analyzer" className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5">
                <Zap className="w-4 h-4" /> New Scan
              </Link>
              <Link href="/profile" className="flex-1 px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-white rounded-2xl font-bold border border-gray-200 dark:border-gray-600 flex items-center justify-center gap-2 transition-all hover:bg-gray-50 dark:hover:bg-gray-600">
                Edit Profile
              </Link>
            </div>
          </div>
        </header>

        {/* SECTION 2: KPI QUAD (4 Sections: Analyses, Avg Score, Excellent, Growth) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl"><BarChart3 className="w-5 h-5" /></span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Scans</span>
            </div>
            <p className="text-4xl font-black text-gray-900 dark:text-white">{totalUserAnalyses}</p>
            <p className="text-xs text-gray-500 mt-2 font-medium">Analyses generated to date</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-purple-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl"><Target className="w-5 h-5" /></span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg Score</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-gray-900 dark:text-white">{userSuccessRate}%</p>
            </div>
            <div className="flex items-center gap-1 mt-2">
               <TrendingUp className={`w-3 h-3 ${parseFloat(momentum) >= 0 ? 'text-green-500' : 'text-red-500'}`} />
               <span className={`text-xs font-bold ${parseFloat(momentum) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                 {momentum > 0 ? `+${momentum}` : momentum}% momentum
               </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-green-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-2xl"><Award className="w-5 h-5" /></span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mastery</span>
            </div>
            <p className="text-4xl font-black text-gray-900 dark:text-white">{excellentMatches}</p>
            <p className="text-xs text-green-600 mt-2 font-bold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> {excellentMatches > 0 ? 'Excellence achieved' : 'Aiming for 80+'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-orange-500/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-center justify-between mb-4">
              <span className="p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-2xl"><Activity className="w-5 h-5" /></span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Velocity</span>
            </div>
            <p className="text-4xl font-black text-gray-900 dark:text-white">{scanVelocity}</p>
            <p className="text-xs text-gray-500 mt-2 font-medium">Scans per day average</p>
          </div>
        </div>

        {/* SECTION 3: VISUAL ANALYTICS (3 Sections: Trend, Skill Radar, Keyword Coverage) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-500" /> Skill Dimensions
            </h3>
            <div className="h-72">
              <SkillsRadar data={skillAverages} />
            </div>
          </div>

          <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" /> Keyword Coverage
            </h3>
            <div className="h-72">
              <KeywordCoverage matched={totalMatched} missing={totalMissing} />
            </div>
          </div>

          <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" /> Success Trend
            </h3>
            <div className="h-72">
               <UserScoreChart scores={chartData} />
            </div>
          </div>
        </div>

        {/* SECTION 4: CONTENT INSIGHTS (3 Sections: Strengths, Gaps, Histogram) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Core Competencies</h3>
            <div className="space-y-4">
              {topStrengths.map(([name, count], i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{name}</span>
                    <span className="text-blue-500">{count} scans</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(count/totalUserAnalyses)*100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Strategic Skill Gaps</h3>
            <div className="flex flex-wrap gap-2">
              {topMissingKeywords.map(([name, count], i) => (
                <span key={i} className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold border border-red-100/50 dark:border-red-900/50 flex items-center gap-2">
                  {name} <span className="text-[10px] px-1.5 py-0.5 bg-red-600 text-white rounded-md">{count}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Score Distribution</h3>
            <div className="h-64">
              <ScoreDistribution buckets={buckets} />
            </div>
          </div>
        </div>

        {/* SECTION 5: ACTION CENTER (3 Sections: Goal, Best Match, Roadmap) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Goal Progress */}
          <div className="lg:col-span-4 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-2xl flex flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Mastery Goal</h3>
              <p className="text-blue-100 text-xs mb-6">Targeting {targetScore}% overall average score</p>
              
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32">
                   <svg className="w-full h-full" viewBox="0 0 36 36">
                     <path className="text-white/10" stroke="currentColor" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                     <path className="text-white shadow-lg" stroke="currentColor" strokeWidth="3" strokeDasharray={`${goalProgress}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                   </svg>
                   <div className="absolute inset-0 flex items-center justify-center font-black text-2xl tracking-tighter">
                     {goalProgress}%
                   </div>
                </div>
              </div>
              <p className="text-center text-xs font-bold text-blue-200 uppercase tracking-widest">Progress to 90% Avg</p>
            </div>
          </div>

          {/* Best Match Spotlight */}
          <div className="lg:col-span-8 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 relative group overflow-hidden">
             <div className="absolute top-0 right-0 p-4">
                <Crown className="w-8 h-8 text-yellow-500 animate-bounce" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Best-in-Class Analysis</h3>
             {bestMatch ? (
               <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-3xl font-black shadow-lg">
                    {bestMatch.score}
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{bestMatch.resumeName}</p>
                    <p className="text-sm text-gray-500 line-clamp-2 italic">"{bestMatch.funnyMessage}"</p>
                    <div className="flex flex-wrap gap-2">
                       {bestMatch.strengths.slice(0, 3).map((s, i) => (
                         <span key={i} className="px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-md text-[10px] font-bold uppercase">{s}</span>
                       ))}
                    </div>
                  </div>
                  <Link href={`/dashboard/results/${bestMatch._id}`} className="px-6 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl font-bold text-sm hover:scale-105 transition-transform">
                    Review Again
                  </Link>
               </div>
             ) : (
               <p className="text-center py-12 text-gray-400 italic">No scans yet to determine a best match.</p>
             )}
          </div>
        </div>

        {/* SECTION 6: HISTORY & ROADMAP (2 Sections: Smart Roadmap, Recent Feed) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-blue-500" /> Smart Roadmap
            </h3>
            <div className="space-y-4">
              {commonSuggestions.length > 0 ? commonSuggestions.map((text, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl group hover:border-blue-200 border border-transparent transition-all">
                  <div className="mt-1 w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xs font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed">{text}</p>
                </div>
              )) : (
                <p className="text-center py-8 text-gray-400 italic">Complete more scans to generate a personalized roadmap.</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-gray-400" /> Recent Scans
            </h3>
            <div className="space-y-4">
              {recentScans.length > 0 ? recentScans.map((activity, i) => (
                <a href={`/dashboard/results/${activity._id}`} key={i} className="group flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all hover:scale-[1.01]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-black shadow-md mt-1">
                      {activity.score}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{activity.resumeName}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{new Date(activity.createdAt).toLocaleDateString()} • {activity.score > 80 ? 'EXCELLENT' : 'IMPROVEMENT NEEDED'}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </a>
              )) : (
                <div className="text-center py-12 text-gray-400 italic">No analysis history found. Start your first scan today!</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}