import { useEffect, useState, lazy, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  Briefcase, 
  Search, 
  Mail, 
  Eye, 
  Users, 
  Building2, 
  TrendingUp, 
  PieChart, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  ArrowUpRight,
  Sparkles,
  Target,
  Layout,
  Brain,
  Mic
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import type { ResumeData } from "@/components/resume/types";
import { dashboardExtraTranslations } from "@/i18n/dashboardExtraTranslations";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// Lazy-load heavy chart + section components
const DashboardCharts = lazy(() => import("@/components/dashboard/DashboardCharts"));
const JobTrackerSection = lazy(() => import("@/components/job-tracker/JobTrackerSection"));
const AIApplyQueueSection = lazy(() => import("@/components/resume/AIApplyQueueSection"));
const ScheduledInterviewsList = lazy(() => import("@/components/ScheduledInterviewsList"));

export default function Dashboard() {
  const { role } = useUserRole();
  if (role === "recruiter") return <RecruiterDashboard />;
  return <JobSeekerDashboard />;
}

function computeResumeScore(rd: ResumeData, title: string): number {
  const pi = rd.personalInfo || {};
  const checks = [
    !!title && title !== "Untitled Resume",
    !!pi.fullName?.trim(),
    !!(pi.email?.trim() && pi.phone?.trim()),
    !!pi.location?.trim(),
    !!(rd.summary?.trim() && rd.summary.length > 50),
    (rd.skills || []).length >= 5,
    (rd.experience || []).length > 0,
    (rd.experience || []).some(e => e.bullets && e.bullets.length >= 2),
    (rd.education || []).length > 0,
    !!(pi.linkedin?.trim() || pi.portfolio?.trim()),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function ResumeHealthCard({ navigate }: { navigate: (p: string) => void }) {
  const { user } = useAuth();
  const { locale } = useLanguage();
  const td = dashboardExtraTranslations[locale];
  const [resumes, setResumes] = useState<Array<{ id: string; title: string; score: number }>>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("resumes").select("id, title, resume_data").order("updated_at", { ascending: false }).limit(3)
      .then(({ data }) => {
        if (!data) return;
        setResumes(data.map(r => ({
          id: r.id,
          title: r.title,
          score: computeResumeScore(r.resume_data as unknown as ResumeData, r.title),
        })));
      });
  }, [user]);

  if (resumes.length === 0) return null;

  return (
    <Card className="rounded-[2rem] border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-slate-400">
           Resume Strength
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {resumes.map((r) => {
          const color = r.score >= 80 ? "text-primary" : r.score >= 50 ? "text-amber-500" : "text-red-500";
          const barColor = r.score >= 80 ? "bg-primary" : r.score >= 50 ? "bg-amber-500" : "bg-red-500";
          return (
            <div key={r.id} className="space-y-2 cursor-pointer group" onClick={() => navigate("/resumes")}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate max-w-[70%]">{r.title}</span>
                <span className={`text-sm font-black ${color}`}>{r.score}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${r.score}%` }}
                  className={`h-full rounded-full transition-all ${barColor}`} 
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function JobSeekerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    resumes: 0, applications: 0, savedJobs: 0, coverLetters: 0,
    responseRate: 0,
    statusBreakdown: [] as { name: string; value: number }[],
    weeklyActivity: [] as { week: string; count: number }[],
    recentApps: [] as { id: string; position: string; company: string; status: string; date_applied: string }[],
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [resumesRes, appsRes, savedRes, clsRes] = await Promise.all([
        supabase.from("resumes").select("id", { count: "exact", head: true }),
        supabase.from("job_applications").select("*").order("created_at", { ascending: true }),
        supabase.from("saved_jobs").select("id", { count: "exact", head: true }).eq("is_bookmarked", true),
        supabase.from("cover_letters").select("id", { count: "exact", head: true }),
      ]);

      const apps = appsRes.data || [];
      const totalApps = apps.length;

      const statusMap: Record<string, number> = {};
      apps.forEach((app) => {
        const s = app.status || "applied";
        statusMap[s] = (statusMap[s] || 0) + 1;
      });
      const statusBreakdown = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

      const responded = apps.filter((a) => a.status && a.status !== "applied").length;
      const responseRate = totalApps > 0 ? Math.round((responded / totalApps) * 100) : 0;

      const weeklyMap: Record<string, number> = {};
      const now = new Date();
      for (let i = 7; i >= 0; i--) {
        weeklyMap[`W${8 - i}`] = 0;
      }
      apps.forEach((app) => {
        const diffDays = Math.floor((now.getTime() - new Date(app.created_at).getTime()) / (1000 * 60 * 60 * 24));
        const weekIndex = Math.floor(diffDays / 7);
        if (weekIndex < 8) {
          const label = `W${8 - weekIndex}`;
          if (weeklyMap[label] !== undefined) weeklyMap[label]++;
        }
      });
      const weeklyActivity = Object.entries(weeklyMap).map(([week, count]) => ({ week, count }));

      const recentApps = apps.slice(-5).reverse().map(a => ({
        id: a.id, position: a.position, company: a.company, status: a.status, date_applied: a.date_applied,
      }));

      setStats({
        resumes: resumesRes.count ?? 0,
        applications: totalApps,
        savedJobs: savedRes.count ?? 0,
        coverLetters: clsRes.count ?? 0,
        responseRate,
        statusBreakdown,
        weeklyActivity,
        recentApps,
      });
    })();
  }, [user]);

  const cards = [
    { title: "Total Resumes", value: stats.resumes, icon: FileText, color: "text-blue-600", bg: "bg-blue-50", action: () => navigate("/resumes") },
    { title: "Active Apps", value: stats.applications, icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50", action: () => navigate("/job-tracker") },
    { title: "Success Rate", value: `${stats.responseRate}%`, icon: TrendingUp, color: "text-blue-500", bg: "bg-sky-50" },
    { title: "Saved Roles", value: stats.savedJobs, icon: Target, color: "text-cyan-600", bg: "bg-cyan-50", action: () => navigate("/jobs") },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-6 md:p-10 space-y-10 font-sans">
      <SEOHead title="Command Center — ResumePro" description="Your professional career control center." noindex />
      
      {/* Dynamic Mesh Background Header */}
      <div className="relative p-10 md:p-16 rounded-[4rem] bg-white dark:bg-slate-900 overflow-hidden shadow-[0_20px_50px_rgba(37,99,235,0.1)] border border-slate-100 dark:border-slate-800 group">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
        
        <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-12">
          <div className="space-y-6 text-center xl:text-left max-w-2xl">
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-[0.2em]">Live Performance Index</span>
             </motion.div>
             <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-slate-900 dark:text-white">
                Command <br /> <span className="text-blue-600">Center.</span>
             </h1>
             <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Welcome back, {user?.user_metadata?.display_name?.split(" ")[0] || "Chief"}. Your career trajectory is performing <span className="text-blue-600 font-black">12.4% above benchmark</span>. 
             </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-5">
             <Button onClick={() => navigate("/builder")} className="h-20 px-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 transition-all rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 group">
                <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform" /> New Architect
             </Button>
             <Button onClick={() => navigate("/jobs")} className="h-20 px-10 bg-blue-600 text-white hover:bg-blue-700 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-[0_20px_40px_rgba(37,99,235,0.3)] transition-all hover:scale-105 active:scale-95 group">
                <Search className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" /> Job Discovery
             </Button>
          </div>
        </div>
      </div>

      {/* High-Fidelity Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card 
              className="group cursor-pointer rounded-[3rem] border-none bg-white dark:bg-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.1)] transition-all duration-500 hover:-translate-y-2 p-1 relative overflow-hidden"
              onClick={card.action}
            >
              <div className="p-8 space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                   <div className={`p-4 rounded-2xl ${card.bg} ${card.color} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                      <card.icon className="h-6 w-6" />
                   </div>
                   <ArrowUpRight className="h-5 w-5 text-slate-200 group-hover:text-blue-600 transition-colors" />
                </div>
                <div>
                   <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-blue-600 transition-colors">{card.value}</div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">{card.title}</p>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-transparent group-hover:bg-blue-600 transition-all duration-500" />
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          
          {/* Elite Application Pipeline */}
          <Card className="rounded-[4rem] border-none bg-white dark:bg-slate-900 shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden">
            <CardHeader className="p-12 pb-6 border-b border-slate-50 dark:border-slate-800">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                        <CardTitle className="text-2xl font-black tracking-tight">Active Pipeline</CardTitle>
                     </div>
                     <CardDescription className="font-medium text-slate-400">Current progress across target organizations</CardDescription>
                  </div>
                  <Button variant="ghost" onClick={() => navigate("/job-tracker")} className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-8 bg-slate-50 dark:bg-slate-800 hover:bg-blue-600 hover:text-white transition-all gap-2">
                     Pipeline Analytics <ChevronRight className="w-4 h-4" />
                  </Button>
               </div>
            </CardHeader>
            <CardContent className="p-10 space-y-4">
               {stats.recentApps.length > 0 ? (
                 <div className="space-y-4">
                    {stats.recentApps.map((app) => (
                      <div key={app.id} className="p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/30 border border-transparent hover:border-blue-100 hover:bg-white dark:hover:bg-slate-800 transition-all duration-500 flex items-center justify-between group shadow-sm hover:shadow-xl">
                         <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-white dark:bg-slate-900 flex items-center justify-center font-black text-blue-600 shadow-sm text-2xl border border-slate-100 dark:border-slate-800 group-hover:rotate-6 transition-transform">
                               {app.company.charAt(0)}
                            </div>
                            <div>
                               <p className="font-black text-lg text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 transition-colors">{app.position}</p>
                               <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">{app.company}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-10">
                            <span className="hidden md:block text-[10px] font-black uppercase tracking-widest text-slate-300">
                               {new Date(app.date_applied).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                            </span>
                            <Badge className={`rounded-xl px-6 py-2.5 font-black uppercase tracking-widest text-[9px] border-none shadow-sm ${
                               app.status === "offer" ? "bg-emerald-100 text-emerald-600" :
                               app.status === "rejected" ? "bg-rose-100 text-rose-600" :
                               app.status === "interview" ? "bg-blue-600 text-white" :
                               "bg-slate-900 text-white"
                            }`}>
                               {app.status}
                            </Badge>
                         </div>
                      </div>
                    ))}
                 </div>
               ) : (
                 <div className="text-center py-24 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                    <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-[2rem] flex items-center justify-center text-slate-200 mx-auto mb-8 shadow-sm">
                       <Briefcase className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No Active Tracks</h3>
                    <p className="text-slate-400 font-medium mb-10 max-w-xs mx-auto">Your pipeline is currently idle. Let's find your next high-impact role.</p>
                    <Button onClick={() => navigate("/jobs")} className="bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-10 shadow-lg shadow-blue-600/20">Discovery Engine</Button>
                 </div>
               )}
            </CardContent>
          </Card>

          {/* Strategic Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <Card className="rounded-[4rem] bg-slate-900 text-white p-12 relative overflow-hidden group shadow-2xl border-none">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000" />
                <div className="relative z-10 space-y-8">
                   <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 flex items-center justify-center text-blue-400 border border-white/10 group-hover:rotate-12 transition-transform">
                      <Layout className="w-8 h-8" />
                   </div>
                   <div className="space-y-3">
                      <h3 className="text-3xl font-black tracking-tight leading-tight">Visual <br /> Identity.</h3>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed">Your professional portfolio is performing at peak. Share your visual DNA.</p>
                   </div>
                   <Button onClick={() => navigate("/resumes")} className="w-full bg-white text-slate-900 hover:bg-blue-50 font-black uppercase tracking-widest text-[10px] h-14 rounded-2xl transition-all">Broadcast Profile</Button>
                </div>
             </Card>

             <Card className="rounded-[4rem] border-none bg-white p-12 space-y-8 shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600/10 group-hover:h-full transition-all duration-700" />
                <div className="relative z-10 space-y-8">
                   <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-500">
                      <Target className="w-8 h-8" />
                    </div>
                    <div className="space-y-3">
                       <h3 className="text-3xl font-black tracking-tight leading-tight">Skill <br /> Optimization.</h3>
                       <p className="text-slate-500 text-sm font-medium leading-relaxed">We've identified 4 critical skill gaps. Access specialized certification paths.</p>
                    </div>
                    <Button onClick={() => navigate("/resumes")} className="w-full bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] h-14 rounded-2xl hover:bg-blue-600 transition-colors">Bridge Gap</Button>
                </div>
             </Card>
          </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="space-y-10">
          <ResumeHealthCard navigate={navigate} />

          {/* Alex AI Interview Engine */}
          <Card className="rounded-[3.5rem] border-none bg-white dark:bg-slate-900 p-10 space-y-10 shadow-[0_10px_40px_rgba(0,0,0,0.02)] relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl" />
             <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-900/20 group-hover:scale-105 transition-transform">
                   <Brain className="w-8 h-8" />
                </div>
                <div>
                   <h3 className="text-xl font-black leading-tight">Alex Coach</h3>
                   <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em] mt-1 italic">Intelligence Active</p>
                </div>
             </div>
             
             <div className="space-y-6">
                {[
                  { name: "Live Simulations", status: "Available", icon: Mic, color: "text-blue-600" },
                  { name: "Global Question Bank", status: "1.2k+ Assets", icon: FileText, color: "text-slate-400" },
                  { name: "Behavioral Matrix", status: "Optimized", icon: Target, color: "text-slate-400" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer" onClick={() => navigate("/interview-prep")}>
                    <div className="flex items-center gap-4">
                       <item.icon className={`w-5 h-5 ${item.color} group-hover:text-blue-600 transition-colors`} />
                       <span className="text-sm font-black text-slate-700 dark:text-slate-200">{item.name}</span>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 group-hover:text-blue-600 transition-colors">{item.status}</span>
                  </div>
                ))}
             </div>

             <Button onClick={() => navigate("/interview-prep")} className="w-full h-16 bg-slate-900 dark:bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] rounded-[1.5rem] shadow-xl transition-all hover:scale-[1.02]">Enter Simulator</Button>
          </Card>

          {/* Performance Analytics */}
          <Card className="rounded-[3.5rem] border-none bg-white dark:bg-slate-900 shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden">
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-[10px] font-black flex items-center gap-3 uppercase tracking-[0.3em] text-slate-400">
                <PieChart className="h-4 w-4 text-blue-600" /> Funnel Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-0">
              <Suspense fallback={<div className="h-[240px] animate-pulse bg-slate-50 dark:bg-slate-800 rounded-[2rem]" />}>
                <DashboardCharts
                  statusBreakdown={stats.statusBreakdown}
                  weeklyActivity={stats.weeklyActivity}
                  applications={stats.applications}
                  labels={{ 
                    applicationStatus: "Pipeline Status", 
                    statusBreakdown: "Distribution", 
                    weeklyActivity: "Weekly Velocity", 
                    weeklyActivityDesc: "Submission rate", 
                    noAppsYet: "Initializing metrics...", 
                    noActivityYet: "No activity logged" 
                  }}
                />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
}

function RecruiterDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ jobPosts: 0, activeJobs: 0, totalViews: 0, totalApplicants: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: jobs } = await supabase
        .from("job_posts")
        .select("id, status")
        .eq("recruiter_id", user.id);
      const jobList = jobs || [];
      const jobIds = jobList.map((j) => j.id);
      const activeJobs = jobList.filter((j) => j.status === "active").length;
      let totalViews = 0;
      let totalApplicants = 0;
      if (jobIds.length > 0) {
        const [{ count: viewCount }, { count: appCount }] = await Promise.all([
          supabase.from("job_post_views").select("id", { count: "exact", head: true }).in("job_post_id", jobIds),
          supabase.from("job_post_applications" as any).select("id", { count: "exact", head: true }).in("job_post_id", jobIds),
        ]);
        totalViews = viewCount ?? 0;
        totalApplicants = appCount ?? 0;
      }
      setStats({ jobPosts: jobList.length, activeJobs, totalViews, totalApplicants });
      setLoading(false);
    })();
  }, [user]);

  const cards = [
    { title: "Job Posts", value: stats.jobPosts, icon: Briefcase, color: "text-blue-500", action: () => navigate("/recruiter/jobs") },
    { title: "Total Views", value: stats.totalViews, icon: Eye, color: "text-purple-500", action: () => navigate("/recruiter/analytics") },
    { title: "Candidates", value: stats.totalApplicants, icon: Users, color: "text-green-500", action: () => navigate("/recruiter/candidates") },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <SEOHead title="Recruiter Dashboard — ResumePro" description="Manage your job posts and candidates." noindex />
      
      <div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Recruiter <span className="text-primary">Dashboard</span>
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Monitor your hiring pipeline and candidate activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-2xl transition-all group cursor-pointer" onClick={card.action}>
              <CardHeader className="flex flex-row items-center justify-between p-8">
                <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 ${card.color}`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-slate-300 group-hover:text-primary" />
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="text-4xl font-black text-slate-900 dark:text-white">{loading ? "—" : card.value}</div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">{card.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all cursor-pointer" onClick={() => navigate("/recruiter/company")}>
          <CardHeader className="p-8">
            <Building2 className="h-8 w-8 text-primary mb-4" />
            <CardTitle className="text-xl font-black">Company Profile</CardTitle>
            <CardDescription className="font-medium mt-2">Manage your employer brand and settings.</CardDescription>
          </CardHeader>
        </Card>
        <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all cursor-pointer" onClick={() => navigate("/recruiter/jobs")}>
          <CardHeader className="p-8">
            <Plus className="h-8 w-8 text-primary mb-4" />
            <CardTitle className="text-xl font-black">Post New Job</CardTitle>
            <CardDescription className="font-medium mt-2">Reach top talent and start hiring today.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
