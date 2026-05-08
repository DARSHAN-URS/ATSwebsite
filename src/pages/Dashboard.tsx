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
    { title: "Total Resumes", value: stats.resumes, icon: FileText, color: "text-blue-500", action: () => navigate("/resumes") },
    { title: "Active Apps", value: stats.applications, icon: Briefcase, color: "text-purple-500", action: () => navigate("/job-tracker") },
    { title: "Success Rate", value: `${stats.responseRate}%`, icon: TrendingUp, color: "text-green-500" },
    { title: "Saved Roles", value: stats.savedJobs, icon: Target, color: "text-amber-500", action: () => navigate("/jobs") },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <SEOHead title="Command Center — ResumePro" description="Your professional career control center." noindex />
      
      {/* Welcome Header - Architectural Design */}
      <div className="relative p-12 rounded-[3rem] bg-slate-900 overflow-hidden text-white group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4 text-center md:text-left">
             <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 justify-center md:justify-start">
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">System Active</span>
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
             </motion.div>
             <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-none">
                Command <br /> <span className="text-primary italic">Center.</span>
             </h1>
             <p className="text-slate-400 font-medium max-w-md">Welcome back, {user?.user_metadata?.display_name?.split(" ")[0] || "Chief"}. Your career trajectory is currently up 12.4% from last month.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
             <Button onClick={() => navigate("/builder")} className="h-16 px-8 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl transition-all hover:scale-105 active:scale-95">
                <Plus className="w-5 h-5 mr-2" /> New Resume
             </Button>
             <Button onClick={() => navigate("/jobs")} className="h-16 px-8 bg-primary text-white hover:bg-primary/90 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                <Search className="w-5 h-5 mr-2" /> Find Jobs
             </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card 
              className="group cursor-pointer rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              onClick={card.action}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-8">
                <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 ${card.color}`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Overview</div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="text-4xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{card.value}</div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">{card.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Job Tracker & Resume Health */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Job Tracker Insight */}
          <Card className="rounded-[3rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <CardHeader className="p-10 pb-6">
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                     <CardTitle className="text-2xl font-black">Application Tracker</CardTitle>
                     <CardDescription className="font-medium">Active progress in the hiring funnel</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => navigate("/job-tracker")} className="rounded-xl font-bold h-12 px-6 border-slate-200">View Full Pipeline</Button>
               </div>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-6">
               {stats.recentApps.length > 0 ? (
                 <div className="space-y-4">
                    {stats.recentApps.map((app) => (
                      <div key={app.id} className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-slate-100 transition-all flex items-center justify-between group">
                         <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center font-black text-primary shadow-sm text-xl border border-slate-100">
                               {app.company.charAt(0)}
                            </div>
                            <div>
                               <p className="font-black text-slate-900 dark:text-white leading-tight">{app.position}</p>
                               <p className="text-sm text-slate-400 font-medium">{app.company}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-8">
                            <span className="hidden md:block text-[10px] font-black uppercase tracking-widest text-slate-300">
                               {new Date(app.date_applied).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                            <Badge className={`rounded-full px-5 py-2 font-black uppercase tracking-widest text-[10px] border-none ${
                               app.status === "offer" ? "bg-green-100 text-green-600" :
                               app.status === "rejected" ? "bg-red-100 text-red-600" :
                               app.status === "interview" ? "bg-primary/10 text-primary" :
                               "bg-slate-100 text-slate-500"
                            }`}>
                               {app.status}
                            </Badge>
                         </div>
                      </div>
                    ))}
                 </div>
               ) : (
                 <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                    <Briefcase className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                    <p className="text-slate-400 font-bold mb-6">No active applications found.</p>
                    <Button onClick={() => navigate("/jobs")} className="bg-slate-900 text-white rounded-xl font-bold h-12 px-8">Find Your Next Role</Button>
                 </div>
               )}
            </CardContent>
          </Card>

          {/* AI Apply Discovery Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <Card className="rounded-[2.5rem] bg-slate-900 text-white p-10 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative z-10 space-y-6">
                   <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-primary">
                      <Layout className="w-6 h-6" />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-2xl font-black">Personal Brand</h3>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed">Your professional portfolio is live. Share your visual identity with the world.</p>
                   </div>
                   <Button onClick={() => navigate("/resumes")} className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] h-12 rounded-xl">Share Profile</Button>
                </div>
             </Card>

             <Card className="rounded-[2.5rem] border-slate-100 bg-white p-10 space-y-6 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-primary/10 transition-colors">
                   <Target className="w-6 h-6" />
                 </div>
                 <div className="space-y-2">
                    <h3 className="text-2xl font-black">Skill Bridge</h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">Discover missing skills in your profile and access elite certification paths.</p>
                 </div>
                 <Button onClick={() => navigate("/resumes")} variant="outline" className="w-full rounded-xl h-12 font-black uppercase tracking-widest text-[10px] border-slate-200">Bridge Gaps</Button>
             </Card>
          </div>
        </div>

        {/* Sidebar Column: Health, Stats, and Prep */}
        <div className="space-y-10">
          <ResumeHealthCard navigate={navigate} />

          {/* Interview Prep Widget */}
          <Card className="rounded-[2.5rem] border-slate-100 bg-white p-10 space-y-8 shadow-sm">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white">
                   <Brain className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-lg font-black leading-tight">Interview Mastery</h3>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Powered by Alex AI</p>
                </div>
             </div>
             
             <div className="space-y-6">
                {[
                  { name: "Mock Sessions", status: "Ready", icon: Mic },
                  { name: "Question Bank", status: "1,200+", icon: FileText },
                  { name: "Strength Analysis", status: "Updated", icon: Target },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer" onClick={() => navigate("/interview-prep")}>
                    <div className="flex items-center gap-3">
                       <item.icon className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                       <span className="text-sm font-bold text-slate-900">{item.name}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.status}</span>
                  </div>
                ))}
             </div>

             <Button onClick={() => navigate("/interview-prep")} className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl">Enter Dojo</Button>
          </Card>

          {/* Analytics Funnel */}
          <Card className="rounded-[2.5rem] border-slate-100 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-[10px] font-black flex items-center gap-2 uppercase tracking-[0.2em] text-slate-400">
                <PieChart className="h-4 w-4" /> Funnel Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <Suspense fallback={<div className="h-[200px] animate-pulse bg-slate-50 rounded-2xl" />}>
                <DashboardCharts
                  statusBreakdown={stats.statusBreakdown}
                  weeklyActivity={stats.weeklyActivity}
                  applications={stats.applications}
                  labels={{ 
                    applicationStatus: "Status", 
                    statusBreakdown: "By Status", 
                    weeklyActivity: "Weekly Progress", 
                    weeklyActivityDesc: "Apps per week", 
                    noAppsYet: "No data", 
                    noActivityYet: "No data" 
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
