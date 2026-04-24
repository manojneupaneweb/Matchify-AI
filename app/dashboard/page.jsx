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
    <div className="min-h-screen bg-transparent pb-12">
      <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
        
        {/* SECTION 1: HEADER & HERO */}
        <header className="glass-panel relative mb-10 p-8 md:p-12 overflow-hidden border-white/5 bg-white/[0.02]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-violet-600/10 to-purple-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 rounded-full blur-[80px]" />
          
          <div className="relative flex flex-col lg:flex-row items-center gap-10 text-center lg:text-left">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-cyan-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-cyan-600 flex items-center justify-center text-white text-5xl font-black shadow-2xl transform hover:rotate-3 transition-transform duration-500">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-6">
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic">
                  WELCOME, {session.user.name?.split(' ')[0] || 'USER'}
                </h1>
                <span className="badge">
                  LIVE ANALYTICS
                </span>
              </div>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-10">
                <div className="space-y-2">
                  <p className="text-slate-400 flex items-center justify-center lg:justify-start gap-2 text-sm font-bold tracking-tight">
                    <Mail className="w-4 h-4 text-violet-400" /> {session.user.email}
                  </p>
                  {userDoc?.phone && (
                    <p className="text-slate-400 flex items-center justify-center lg:justify-start gap-2 text-sm font-bold tracking-tight">
                      <Phone className="w-4 h-4 text-cyan-400" /> {userDoc.phone}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-3 min-w-[240px]">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                    <span className="text-slate-500">Profile Completion</span>
                    <span className="text-violet-400">{profileCompletion}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <Link href="/#analyzer" className="btn-primary px-8 py-4 shadow-violet-500/20">
                <Zap className="w-5 h-5" /> New Analysis
              </Link>
              <Link href="/profile" className="btn-secondary px-8 py-4">
                View Profile
              </Link>
            </div>
          </div>
        </header>

        {/* SECTION 2: KPI QUAD */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { icon: BarChart3, label: 'TOTAL SCANS', value: totalUserAnalyses, sub: 'Analyses generated', color: 'text-blue-400' },
            { icon: Target, label: 'AVG SCORE', value: `${userSuccessRate}%`, sub: `${momentum > 0 ? '+' : ''}${momentum}% momentum`, color: 'text-violet-400' },
            { icon: Award, label: 'MASTERY', value: excellentMatches, sub: excellentMatches > 0 ? 'Excellence achieved' : 'Aiming for 80+', color: 'text-emerald-400' },
            { icon: Activity, label: 'VELOCITY', value: scanVelocity, sub: 'Scans per day avg', color: 'text-cyan-400' },
          ].map((kpi, i) => (
            <div key={i} className="glass-panel p-8 hover:scale-[1.02] border-white/5 bg-white/[0.02] group">
              <div className="flex items-center justify-between mb-6">
                <span className={`p-3 bg-white/5 rounded-2xl ${kpi.color} group-hover:scale-110 transition-transform duration-300`}>
                  <kpi.icon className="w-6 h-6" />
                </span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{kpi.label}</span>
              </div>
              <p className="text-4xl font-extrabold stat-value tracking-tighter mb-2">{kpi.value}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* SECTION 3: VISUAL ANALYTICS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {[
            { title: 'Skill Dimensions', icon: PieChart, color: 'text-violet-400', component: <SkillsRadar data={skillAverages} /> },
            { title: 'Keyword Coverage', icon: Target, color: 'text-cyan-400', component: <KeywordCoverage matched={totalMatched} missing={totalMissing} /> },
            { title: 'Success Trend', icon: TrendingUp, color: 'text-emerald-400', component: <UserScoreChart scores={chartData} /> },
          ].map((analytics, i) => (
            <div key={i} className="glass-panel p-8 border-white/5 bg-white/[0.02]">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                <analytics.icon className={`w-5 h-5 ${analytics.color}`} /> {analytics.title}
              </h3>
              <div className="h-72">
                {analytics.component}
              </div>
            </div>
          ))}
        </div>

        {/* SECTION 4: CONTENT INSIGHTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="glass-panel p-8 border-white/5 bg-white/[0.02]">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8">Core Competencies</h3>
            <div className="space-y-6">
              {topStrengths.map(([name, count], i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-300">{name}</span>
                    <span className="text-violet-400">{count} SCANS</span>
                  </div>
                  <div className="progress-bar-container h-1.5">
                    <div className="progress-bar" style={{ width: `${(count/totalUserAnalyses)*100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-8 border-white/5 bg-white/[0.02]">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8">Strategic Skill Gaps</h3>
            <div className="flex flex-wrap gap-3">
              {topMissingKeywords.map(([name, count], i) => (
                <span key={i} className="px-4 py-2 bg-rose-500/5 text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-500/10 flex items-center gap-2 hover:bg-rose-500/10 transition-colors">
                  {name} <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded-md text-[8px]">{count}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="glass-panel p-8 border-white/5 bg-white/[0.02]">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8">Score Distribution</h3>
            <div className="h-64">
              <ScoreDistribution buckets={buckets} />
            </div>
          </div>
        </div>

        {/* SECTION 5: ACTION CENTER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          {/* Goal Progress */}
          <div className="lg:col-span-4 glass-panel p-10 bg-gradient-to-br from-violet-600/20 to-purple-600/20 border-violet-500/20 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/10 rounded-full blur-[60px]" />
            <div className="relative z-10">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Mastery Goal</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-10">Target: {targetScore}% Avg</p>
              
              <div className="flex items-center justify-center mb-10">
                <div className="relative w-40 h-40">
                   <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                     <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/5" strokeWidth="2" />
                     <circle cx="18" cy="18" r="16" fill="none" className="stroke-violet-500" strokeWidth="2" strokeDasharray={`${goalProgress} 100`} strokeLinecap="round" />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-4xl font-black text-white tracking-tighter">{goalProgress}%</span>
                   </div>
                </div>
              </div>
              <p className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-violet-400 transition-colors">Progress to Goal</p>
            </div>
          </div>

          {/* Best Match Spotlight */}
          <div className="lg:col-span-8 glass-panel p-10 border-white/5 bg-white/[0.02] relative group overflow-hidden">
             <div className="absolute top-0 right-0 p-6">
                <Crown className="w-10 h-10 text-yellow-500/40 group-hover:text-yellow-500 transition-colors duration-500" />
             </div>
             <h3 className="text-sm font-black text-white uppercase tracking-widest mb-10">Best-in-Class Analysis</h3>
             {bestMatch ? (
               <div className="flex flex-col md:flex-row items-center gap-10">
                  <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-yellow-500/20 transform group-hover:rotate-6 transition-transform">
                    {bestMatch.score}
                  </div>
                  <div className="flex-1 space-y-4">
                    <p className="text-2xl font-black text-white tracking-tight">{bestMatch.resumeName}</p>
                    <p className="text-sm text-slate-400 italic font-medium leading-relaxed">"{bestMatch.funnyMessage}"</p>
                    <div className="flex flex-wrap gap-2">
                       {bestMatch.strengths.slice(0, 3).map((s, i) => (
                         <span key={i} className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">{s}</span>
                       ))}
                    </div>
                  </div>
                  <Link href={`/dashboard/results/${bestMatch._id}`} className="btn-primary px-8 py-3.5 text-sm">
                    Re-Analyze
                  </Link>
               </div>
             ) : (
               <p className="text-center py-12 text-slate-500 font-bold uppercase tracking-widest italic">No benchmark data available yet.</p>
             )}
          </div>
        </div>

        {/* SECTION 6: HISTORY & ROADMAP */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-8 border-white/5 bg-white/[0.02]">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
              <ListChecks className="w-5 h-5 text-violet-400" /> Smart Roadmap
            </h3>
            <div className="space-y-4">
              {commonSuggestions.length > 0 ? commonSuggestions.map((text, i) => (
                <div key={i} className="flex items-start gap-5 p-5 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-violet-500/30 transition-all group">
                  <div className="mt-1 w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center text-xs font-black group-hover:bg-violet-500 group-hover:text-white transition-all">
                    {i + 1}
                  </div>
                  <p className="text-sm text-slate-300 font-medium leading-relaxed">{text}</p>
                </div>
              )) : (
                <p className="text-center py-10 text-slate-500 font-bold uppercase tracking-widest italic">Scan more resumes to unlock your roadmap.</p>
              )}
            </div>
          </div>

          <div className="glass-panel p-8 border-white/5 bg-white/[0.02]">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
              <History className="w-5 h-5 text-slate-500" /> Recent Activity
            </h3>
            <div className="space-y-4">
              {recentScans.length > 0 ? recentScans.map((activity, i) => (
                <Link href={`/dashboard/results/${activity._id}`} key={i} className="group flex items-center justify-between p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all hover:scale-[1.01]">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-sm font-black shadow-lg">
                      {activity.score}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white line-clamp-1">{activity.resumeName}</p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{new Date(activity.createdAt).toLocaleDateString()} • {activity.score > 80 ? 'OPTIMIZED' : 'NEEDS REFINEMENT'}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-6 h-6 text-slate-700 group-hover:text-violet-400 transition-all" />
                </Link>
              )) : (
                <div className="text-center py-16 text-slate-500 font-bold uppercase tracking-widest italic">No recent activity detected.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}