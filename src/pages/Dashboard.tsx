import { useEffect, useState, lazy, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, Briefcase, Search, Mail, Eye, Users, Building2, Zap, 
  CheckCircle2, Plus, ArrowUpRight, Brain, Target, Layout, Mic, 
  ZapIcon, Sparkles, TrendingUp, Activity, Award, Clock, ArrowRight, 
  ChevronRight, ShieldCheck, Lock, Rocket, BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import type { ResumeData } from "@/components/resume/types";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Lazy-load heavy chart + section components
const DashboardCharts = lazy(() => import("@/components/dashboard/DashboardCharts"));
const JobTrackerSection = lazy(() => import("@/components/job-tracker/JobTrackerSection"));
const AIApplyQueueSection = lazy(() => import("@/components/resume/AIApplyQueueSection"));
const ScheduledInterviewsList = lazy(() => import("@/components/ScheduledInterviewsList"));

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

const CircularProgress = ({ value, label, size = 100 }: { value: number; label: string; size?: number }) => {
  const radius = (size - 10) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth="6" fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className="text-blue-600"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-black text-slate-900 leading-none">{value}%</span>
        <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</span>
      </div>
    </div>
  );
};

function ResumeStrengthWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resume, setResume] = useState<{ title: string; score: number; id: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("resumes").select("id, title, resume_data").order("updated_at", { ascending: false }).limit(1)
      .then(({ data }) => {
        if (data?.[0]) {
          setResume({
            id: data[0].id,
            title: data[0].title,
            score: computeResumeScore(data[0].resume_data as unknown as ResumeData, data[0].title)
          });
        }
      });
  }, [user]);

  if (!resume) return null;

  return (
    <Card className="rounded-[2rem] border border-slate-200/60 bg-white p-6 shadow-sm group hover:shadow-md transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <CircularProgress value={resume.score} label="Strength" />
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div className="space-y-1">
             <h3 className="text-lg font-bold text-slate-900 tracking-tight">{resume.title}</h3>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Resume Module</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
             {resume.score < 90 && (
                <div className="px-2 py-0.5 bg-amber-50 border border-amber-100 rounded-lg text-[8px] font-bold text-amber-600 uppercase tracking-widest">AI Tip: Optimization Required</div>
             )}
             <div className="px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-lg text-[8px] font-bold text-blue-600 uppercase tracking-widest">High Readiness</div>
          </div>
          <Button onClick={() => navigate(`/builder/${resume.id}`)} variant="ghost" size="sm" className="h-8 px-4 font-bold text-[9px] uppercase tracking-widest text-blue-600 hover:bg-blue-50 gap-2">Improve <ArrowRight className="w-3 h-3" /></Button>
        </div>
      </div>
    </Card>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="group">
      <Card className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-sm", color.replace('bg-', 'bg-') + "/10", color.replace('bg-', 'text-'))}>
             <Icon className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
             <h4 className="text-2xl font-display font-black text-slate-900 tracking-tight leading-none">{value}</h4>
             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">{label}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const { role } = useUserRole();
  if (role === "recruiter") return <RecruiterDashboard />;
  return <JobSeekerDashboard />;
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
        date, count: applicationList.filter(app => app.created_at.startsWith(date)).length
      }));
      setStats({ totalApplications: applicationList.length, statusBreakdown, weeklyActivity, applications: applicationList });
      setLoading(false);
    })();
  }, [user]);

  const quickActions = [
    { label: "Build Resume", icon: Plus, to: "/builder", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Find Jobs", icon: Search, to: "/jobs", color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Interview", icon: Mic, to: "/interview-prep", color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Outreach", icon: Mail, to: "/email-outreach", color: "text-emerald-600", bg: "bg-emerald-50" }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-600/10 selection:text-blue-600">
      <SEOHead title="Dashboard — ResumePro" description="Career Management Center." />
      
      <div className="space-y-10 max-w-7xl mx-auto">
        {/* Clean SaaS Header */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100 text-blue-600">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Active Session</span>
             </div>
             <h1 className="text-4xl md:text-5xl font-display font-black text-slate-900 tracking-tight leading-tight">
                Welcome, <span className="text-blue-600">{user?.user_metadata?.display_name?.split(' ')[0] || "User"}</span>.
             </h1>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.label}
                whileHover={{ y: -2, scale: 1.02 }}
                onClick={() => navigate(action.to)}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:border-blue-600 hover:text-blue-600 transition-all duration-300 group"
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform", action.bg, action.color)}>
                   <action.icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-widest">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-2"><ResumeStrengthWidget /></div>
                 <StatCard label="Success Index" value="94%" icon={Award} color="bg-blue-600" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                 <StatCard label="Deployments" value={stats.totalApplications} icon={Rocket} color="bg-indigo-600" />
                 <StatCard label="Profile Views" value="842" icon={Eye} color="bg-emerald-600" />
                 <StatCard label="Interviews" value="4" icon={Users} color="bg-purple-600" />
              </div>

              <Card className="rounded-[2.5rem] border border-slate-200/60 bg-white shadow-sm overflow-hidden">
                 <div className="p-8 pb-0 flex items-center justify-between">
                    <h3 className="text-xl font-display font-black text-slate-900 tracking-tight uppercase">Pulse Analytics</h3>
                    <div className="flex gap-2 items-center">
                       <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                       <span className="text-[8px] font-black text-blue-600 uppercase tracking-[0.2em]">Operational</span>
                    </div>
                 </div>
                 <div className="p-8">
                    <Suspense fallback={<div className="h-[250px] animate-pulse bg-white rounded-2xl" />}>
                       <DashboardCharts
                          statusBreakdown={stats.statusBreakdown}
                          weeklyActivity={stats.weeklyActivity}
                          applications={stats.applications}
                          labels={{ applicationStatus: "Status", statusBreakdown: "Industry", weeklyActivity: "Velocity", weeklyActivityDesc: "Activity", noAppsYet: "Init...", noActivityYet: "Idle" }}
                       />
                    </Suspense>
                 </div>
              </Card>
           </div>

           <div className="lg:col-span-4 space-y-8">
              <Card className="rounded-[2.5rem] border border-slate-200/60 bg-white p-8 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                   <h3 className="text-lg font-display font-black text-slate-900 tracking-tight uppercase">Briefing</h3>
                   <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <Suspense fallback={<div className="h-32 bg-white rounded-2xl animate-pulse" />}>
                   <ScheduledInterviewsList />
                </Suspense>
                <Button className="w-full h-12 rounded-xl bg-white border border-slate-100 text-slate-900 font-bold uppercase tracking-widest text-[9px] hover:bg-blue-600 hover:text-white transition-all">Schedule New</Button>
              </Card>

              <Card className="rounded-[2.5rem] border border-slate-200/60 bg-white p-8 group overflow-hidden">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform"><ShieldCheck className="w-5 h-5" /></div>
                    <h4 className="text-md font-bold text-slate-900 tracking-tight uppercase">AI Advisor</h4>
                 </div>
                 <div className="p-5 bg-white rounded-2xl border border-slate-100 space-y-2">
                    <p className="text-xs font-medium text-slate-600">Keyword density at <span className="text-blue-600 font-bold">92%</span> for FAANG roles.</p>
                    <div className="flex items-center gap-2 text-[8px] font-black text-blue-600 uppercase tracking-widest"><TrendingUp className="w-3 h-3" /> Growth Detected</div>
                 </div>
              </Card>
           </div>
        </div>

        {/* Global Pipeline */}
        <div className="relative z-10">
           <Card className="rounded-[3.5rem] border border-slate-200/60 bg-white p-12 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                 <div className="space-y-2">
                    <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight leading-none uppercase">Success Pipeline</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active tracking system</p>
                 </div>
                 <Button onClick={() => navigate("/jobs")} variant="ghost" className="h-10 px-6 rounded-full border border-slate-200 text-blue-600 font-bold uppercase tracking-widest text-[9px] hover:bg-blue-50 transition-all">Expand View</Button>
              </div>
              <Suspense fallback={<div className="h-[300px] bg-white rounded-3xl animate-pulse" />}>
                 <JobTrackerSection compact onManage={() => navigate("/jobs")} />
              </Suspense>
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

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20 font-sans">
      <SEOHead title="Talent HQ — ResumePro" description="Recruitment Command Center." />
      
      <div className="container mx-auto px-8 pt-16 space-y-16 text-left">
        {/* Architectural Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">
           <div className="space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 rounded-full border border-blue-600/20 text-blue-600">
                 <Building2 className="w-4 h-4" />
                 <span className="text-[9px] font-black uppercase tracking-widest">Global Talent Headquarters</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                 Scale <br /> <span className="text-blue-600">Intelligence.</span>
              </h1>
              <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
                 Welcome back, <span className="text-slate-900 dark:text-white font-black">{user?.user_metadata?.display_name?.split(' ')[0] || "Commander"}</span>. Your talent matrix is performing at <span className="text-blue-600 font-black">94% efficiency</span>.
              </p>
           </div>

           <div className="flex flex-wrap gap-4">
              <Button onClick={() => navigate("/recruiter/jobs")} className="h-20 px-10 rounded-[2rem] bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-600/30 hover:scale-105 transition-all gap-4">
                 <Plus className="w-5 h-5" /> Deploy New Mission
              </Button>
           </div>
        </div>

        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { label: "Active Missions", value: stats.activeJobs, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Matrix Reach", value: stats.totalViews, icon: Eye, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Operational Nodes", value: stats.totalApplicants, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Growth Velocity", value: "+24%", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" }
          ].map((stat, i) => (
            <Card key={i} className="rounded-[2.5rem] border-none bg-white dark:bg-slate-900 shadow-[0_15px_40px_rgba(0,0,0,0.02)] p-10 flex flex-col items-center text-center space-y-4 group">
               <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                  <stat.icon className="w-6 h-6" />
               </div>
               <div className="space-y-1">
                  <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
               </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           {/* Command Modules */}
           <div className="lg:col-span-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <motion.button whileHover={{ y: -5 }} onClick={() => navigate("/recruiter/jobs")} className="group text-left h-full">
                    <Card className="h-full rounded-[4rem] border-none bg-slate-900 p-12 shadow-2xl relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
                          <Rocket className="w-32 h-32 text-white" />
                       </div>
                       <div className="space-y-12 relative z-10">
                          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-600/30">
                             <Plus className="w-8 h-8 text-white" />
                          </div>
                          <div className="space-y-2">
                             <h3 className="text-4xl font-black text-white tracking-tighter uppercase">Initialize <br /> Mission</h3>
                             <p className="text-slate-400 font-medium">Deploy new job postings to the global talent matrix.</p>
                          </div>
                          <ArrowUpRight className="w-8 h-8 text-white/20 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
                       </div>
                    </Card>
                 </motion.button>
                 
                 <motion.button whileHover={{ y: -5 }} onClick={() => navigate("/recruiter/company")} className="group text-left h-full">
                    <Card className="h-full rounded-[4rem] border-none bg-white dark:bg-slate-900 p-12 shadow-[0_30px_80px_rgba(0,0,0,0.03)] border border-slate-100 dark:border-white/5 relative overflow-hidden group">
                       <div className="space-y-12 relative z-10">
                          <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-3xl flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors border border-slate-100 dark:border-white/5">
                             <Building2 className="w-8 h-8" />
                          </div>
                          <div className="space-y-2">
                             <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Company <br /> Core</h3>
                             <p className="text-slate-500 font-medium">Manage organizational identity and mission branding.</p>
                          </div>
                          <ArrowUpRight className="w-8 h-8 text-slate-200 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
                       </div>
                    </Card>
                 </motion.button>
              </div>

              {/* Data Visualization Stream */}
              <Card className="rounded-[4rem] border-none bg-white dark:bg-slate-900 shadow-[0_40px_100px_rgba(0,0,0,0.03)] overflow-hidden">
                 <div className="p-12 pb-0 flex items-center justify-between">
                    <div className="space-y-2">
                       <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Operational Flow</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time talent acquisition metrics</p>
                    </div>
                    <Button variant="ghost" onClick={() => navigate("/recruiter/analytics")} className="h-12 px-6 rounded-2xl border border-slate-100 text-blue-600 font-black uppercase tracking-widest text-[9px] gap-2">Full Scan <BarChart3 className="w-4 h-4" /></Button>
                 </div>
                 <div className="p-12 min-h-[400px] flex items-center justify-center">
                    <div className="flex flex-col items-center text-center space-y-6 grayscale opacity-30">
                       <Activity className="w-16 h-16 text-slate-300" />
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synchronizing Data Grid...</p>
                    </div>
                 </div>
              </Card>
           </div>

           {/* Sidebar Intelligence */}
           <div className="lg:col-span-4 space-y-10">
              <Card className="rounded-[4rem] border-none bg-white dark:bg-slate-900 p-12 shadow-[0_30px_80px_rgba(0,0,0,0.03)] space-y-12">
                <div className="flex items-center justify-between">
                   <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Mission Brief</h3>
                   <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><Clock className="w-5 h-5" /></div>
                </div>
                <div className="space-y-8">
                   <Suspense fallback={<div className="h-32 bg-slate-50 animate-pulse rounded-3xl" />}>
                      <ScheduledInterviewsList />
                   </Suspense>
                </div>
                <Button onClick={() => navigate("/recruiter/candidates")} className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10">Manage Personnel</Button>
              </Card>

              <Card className="rounded-[4rem] border-none bg-blue-600 p-12 text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform">
                    <ShieldCheck className="w-32 h-32" />
                 </div>
                 <div className="space-y-8 relative z-10">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md"><Sparkles className="w-6 h-6" /></div>
                       <h4 className="text-xl font-black tracking-tight uppercase leading-none">AI Advisor <br /> <span className="text-blue-200 text-xs tracking-widest">Active System</span></h4>
                    </div>
                    <div className="p-8 bg-white/10 rounded-[2.5rem] border border-white/10 backdrop-blur-sm space-y-4">
                       <p className="text-sm font-bold leading-relaxed">Intelligence scan detected <span className="text-white font-black underline">3 elite candidates</span> matching your Lead Architect mission specs.</p>
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[9px] font-black uppercase tracking-widest">High Probability Match</span>
                       </div>
                    </div>
                 </div>
              </Card>
           </div>
        </div>
      </div>
    </div>
  );
}

