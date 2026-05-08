import { useEffect, useState, lazy, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
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
  Zap, 
  CheckCircle2, 
  Plus,
  ArrowUpRight,
  Brain,
  Target,
  Layout,
  Mic,
  ZapIcon,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import type { ResumeData } from "@/components/resume/types";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
    <Card className="rounded-[3rem] border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl premium-shadow p-8">
      <CardHeader className="pb-6">
        <CardTitle className="text-[10px] font-black flex items-center gap-2 uppercase tracking-[0.2em] text-slate-400">
           <TrendingUp className="w-3 h-3" /> Resume Strength
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {resumes.map((r) => {
          const color = r.score >= 80 ? "text-blue-600" : r.score >= 50 ? "text-amber-500" : "text-red-500";
          const barColor = r.score >= 80 ? "bg-blue-600" : r.score >= 50 ? "bg-amber-500" : "bg-red-500";
          return (
            <div key={r.id} className="space-y-3 cursor-pointer group" onClick={() => navigate("/resumes")}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors truncate max-w-[70%] tracking-tight">{r.title}</span>
                <span className={`text-xs font-black ${color}`}>{r.score}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${r.score}%` }} transition={{ duration: 1, ease: "circOut" }} className={`h-full ${barColor} shadow-[0_0_10px_rgba(37,99,235,0.2)]`} />
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
  const [stats, setStats] = useState({ totalApplications: 0, statusBreakdown: [] as any[], weeklyActivity: [] as any[], applications: [] as any[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: apps } = await supabase.from("job_tracker").select("*").eq("user_id", user.id);
      const applicationList = apps || [];
      const statusMap = applicationList.reduce((acc: any, app: any) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {});
      const statusBreakdown = Object.entries(statusMap).map(([name, value]) => ({ name, value }));
      
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split("T")[0];
      }).reverse();
      const weeklyActivity = last7Days.map(date => ({
        date,
        count: applicationList.filter(app => app.created_at.startsWith(date)).length
      }));

      setStats({ totalApplications: applicationList.length, statusBreakdown, weeklyActivity, applications: applicationList });
      setLoading(false);
    })();
  }, [user]);

  const quickActions = [
    { label: "Build Resume", icon: Plus, to: "/builder", desc: "Create a professional resume", color: "text-blue-600", bg: "bg-blue-600/10" },
    { label: "Job Search", icon: Search, to: "/jobs", desc: "Find your next career role", color: "text-indigo-600", bg: "bg-indigo-600/10" },
    { label: "Practice", icon: Mic, to: "/interview-prep", desc: "Train for your interview", color: "text-purple-600", bg: "bg-purple-600/10" },
    { label: "My Stats", icon: Target, to: "/jobs", desc: "View your progress", color: "text-emerald-600", bg: "bg-emerald-600/10" }
  ];

  return (
    <div className="min-h-screen bg-background mesh-gradient pb-20 overflow-x-hidden">
      <SEOHead title="Dashboard — ResumePro" description="Manage your resumes and job search." />
      
      <div className="container mx-auto px-8 pt-16 space-y-16 text-left relative">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-end justify-between gap-12 relative z-10">
          <div className="space-y-4">
             <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/5 backdrop-blur-md rounded-full border border-blue-600/10 text-blue-600">
                <Brain className="w-4 h-4" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Control Center</span>
             </motion.div>
             <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
                My <br /> <span className="text-blue-600">Dashboard.</span>
             </h1>
          </div>
          <Button onClick={() => navigate("/builder")} className="h-20 px-10 rounded-full bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] gap-4 shadow-2xl shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all">
             <Plus className="w-5 h-5" /> Create New Resume
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start relative z-10">
           <div className="lg:col-span-8 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, i) => (
                  <motion.div key={action.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card onClick={() => navigate(action.to)} className="group rounded-[2.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 premium-shadow hover:-translate-y-2 transition-all duration-500 cursor-pointer">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110", action.bg, action.color)}>
                         <action.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-6 mb-2">{action.label}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{action.desc}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Card className="rounded-[3.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 premium-shadow p-12">
                <CardHeader className="p-0 pb-12 flex flex-row items-center justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-4xl font-black tracking-tighter">Job Tracker</CardTitle>
                    <CardDescription className="font-bold text-slate-400 uppercase tracking-[0.2em] text-[10px]">Track your active applications</CardDescription>
                  </div>
                  <Button variant="ghost" onClick={() => navigate("/jobs")} className="h-12 px-6 rounded-full font-black text-[10px] uppercase tracking-widest text-blue-600 hover:bg-blue-50">View All</Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Suspense fallback={<div className="h-[400px] bg-slate-50 animate-pulse rounded-[3rem]" />}>
                    <JobTrackerSection compact onManage={() => navigate("/jobs")} />
                  </Suspense>
                </CardContent>
              </Card>
           </div>

           <div className="lg:col-span-4 space-y-12">
              <ResumeHealthCard navigate={navigate} />
              
              <Card className="rounded-[3.5rem] border-none bg-slate-900 text-white p-12 shadow-2xl shadow-blue-600/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                   <ZapIcon className="w-24 h-24 text-blue-500" />
                </div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-600/20 blur-[80px] rounded-full" />
                
                <CardHeader className="p-0 pb-10 relative z-10">
                  <CardTitle className="text-3xl font-black tracking-tighter">Auto Apply</CardTitle>
                  <CardDescription className="text-blue-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">AI applying to jobs for you</CardDescription>
                </CardHeader>
                <CardContent className="p-0 relative z-10">
                  <Suspense fallback={<div className="h-40 bg-slate-800 animate-pulse rounded-3xl" />}>
                    <AIApplyQueueSection />
                  </Suspense>
                </CardContent>
              </Card>

              <Card className="rounded-[3.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 premium-shadow p-12">
                <CardHeader className="p-0 pb-10">
                  <div className="flex items-center gap-3 text-blue-600 mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Upcoming</span>
                  </div>
                  <CardTitle className="text-3xl font-black tracking-tighter">Interviews</CardTitle>
                  <CardDescription className="font-bold text-slate-400 uppercase tracking-[0.2em] text-[10px]">Your scheduled meetings</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Suspense fallback={<div className="h-40 bg-slate-50 animate-pulse rounded-3xl" />}>
                    <ScheduledInterviewsList />
                  </Suspense>
                </CardContent>
              </Card>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-12 relative z-10">
          <Card className="rounded-[4rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 premium-shadow overflow-hidden">
            <CardHeader className="p-12 pb-0">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-4xl font-black tracking-tighter">Tracking Stats</CardTitle>
                  <CardDescription className="font-bold text-slate-400 uppercase tracking-[0.2em] text-[10px]">Application speed and performance</CardDescription>
                </div>
                <div className="w-16 h-16 rounded-3xl bg-blue-600/5 flex items-center justify-center text-blue-600">
                  <TrendingUp className="w-8 h-8" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-12 pt-0">
              <Suspense fallback={<div className="h-[300px] animate-pulse bg-slate-50 dark:bg-slate-800 rounded-[2rem]" />}>
                <DashboardCharts
                  statusBreakdown={stats.statusBreakdown}
                  weeklyActivity={stats.weeklyActivity}
                  applications={stats.applications}
                  labels={{ 
                    applicationStatus: "Job Status", 
                    statusBreakdown: "Category", 
                    weeklyActivity: "Application Speed", 
                    weeklyActivityDesc: "Daily activity", 
                    noAppsYet: "Start applying to see stats...", 
                    noActivityYet: "No activity yet" 
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
  const navigate = useNavigate();
  const [stats, setStats] = useState({ jobPosts: 0, activeJobs: 0, totalViews: 0, totalApplicants: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: jobs } = await supabase.from("job_posts").select("id, status").eq("recruiter_id", user.id);
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
    { title: "Live Jobs", value: stats.activeJobs, icon: Briefcase, color: "text-blue-600", action: () => navigate("/recruiter/jobs") },
    { title: "Job Views", value: stats.totalViews, icon: Eye, color: "text-indigo-600", action: () => navigate("/recruiter/analytics") },
    { title: "Applicants", value: stats.totalApplicants, icon: Users, color: "text-blue-400", action: () => navigate("/recruiter/candidates") },
  ];

  return (
    <div className="min-h-screen bg-background mesh-gradient pb-20 overflow-x-hidden">
      <SEOHead title="Recruiter Hub — ResumePro" description="Manage your job posts and applicants." noindex />
      
      <div className="container mx-auto px-8 pt-16 space-y-16 text-left relative">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="space-y-4 relative z-10">
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/5 backdrop-blur-md rounded-full border border-blue-600/10 text-blue-600">
              <Building2 className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Recruiter Hub</span>
           </motion.div>
           <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
              Recruiter <br /> <span className="text-blue-600">Dashboard.</span>
           </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
          {cards.map((card, i) => (
            <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="rounded-[3.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 premium-shadow hover:-translate-y-2 transition-all group cursor-pointer" onClick={card.action}>
                <div className="flex items-center justify-between mb-8">
                  <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center bg-slate-50 dark:bg-slate-800", card.color)}>
                     <card.icon className="w-8 h-8" />
                  </div>
                  <ArrowUpRight className="w-6 h-6 text-slate-200 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="text-7xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{loading ? "—" : card.value}</div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-8">{card.title}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
          <Card className="rounded-[4rem] border-none bg-slate-900 text-white p-12 shadow-2xl shadow-blue-600/30 group cursor-pointer relative overflow-hidden" onClick={() => navigate("/recruiter/jobs")}>
             <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Plus className="w-32 h-32" />
             </div>
             <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-600/40"><Plus className="w-8 h-8" /></div>
                <ArrowUpRight className="w-6 h-6 text-slate-700 group-hover:text-white transition-colors" />
             </div>
             <h3 className="text-5xl font-black tracking-tighter mb-4 relative z-10">Post a Job</h3>
             <p className="text-slate-400 font-medium text-lg relative z-10">Create a new job posting for candidates.</p>
          </Card>
          <Card className="rounded-[4rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 premium-shadow group cursor-pointer relative overflow-hidden" onClick={() => navigate("/recruiter/company")}>
             <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-700">
                <Building2 className="w-32 h-32" />
             </div>
             <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400"><Building2 className="w-8 h-8" /></div>
                <ArrowUpRight className="w-6 h-6 text-slate-100 group-hover:text-blue-600 transition-colors" />
             </div>
             <h3 className="text-5xl font-black tracking-tighter mb-4 relative z-10">Company Profile</h3>
             <p className="text-slate-400 font-medium text-lg relative z-10">Manage your company information and brand.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
