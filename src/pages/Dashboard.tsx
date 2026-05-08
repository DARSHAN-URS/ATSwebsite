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
  TrendingUp,
  Activity,
  Award,
  Clock,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Star
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

const CircularProgress = ({ value, label, size = 120 }: { value: number; label: string; size?: number }) => {
  const radius = (size - 10) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          className="text-white/5"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className="text-blue-500"
          style={{ filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white leading-none">{value}%</span>
        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">{label}</span>
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
    <Card className="rounded-[3rem] border border-white/5 bg-white/5 backdrop-blur-xl p-8 premium-border group overflow-hidden relative">
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
         <Target className="w-20 h-20 text-blue-500" />
      </div>
      <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
        <CircularProgress value={resume.score} label="ATS Score" />
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="space-y-1">
             <h3 className="text-xl font-black text-white tracking-tight">{resume.title}</h3>
             <p className="text-[10px] font-bold text-blue-500/70 uppercase tracking-widest">Active Profile Architecture</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
             {resume.score < 90 && (
                <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[9px] font-bold text-amber-500 uppercase tracking-widest">
                   AI Tip: Add more keywords
                </div>
             )}
             <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[9px] font-bold text-blue-500 uppercase tracking-widest">
                High Discovery Potential
             </div>
          </div>
          <Button onClick={() => navigate(`/builder/${resume.id}`)} variant="ghost" className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[9px] text-blue-400 hover:bg-blue-600 hover:text-white transition-all gap-2">
             Improve Module <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function StatCard({ label, value, icon: Icon, trend, color }: { label: string; value: string | number; icon: any; trend?: string; color: string }) {
  return (
    <motion.div whileHover={{ y: -5 }} className="group">
      <Card className="rounded-[2.5xl] border border-white/5 bg-white/5 backdrop-blur-xl p-8 premium-border relative overflow-hidden">
        <div className={cn("absolute -top-4 -right-4 w-20 h-20 opacity-5 blur-2xl rounded-full", color)} />
        <div className="flex items-start justify-between relative z-10">
          <div className="space-y-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110", color.replace('bg-', 'bg-') + "/10", color.replace('bg-', 'text-'))}>
               <Icon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
               <h4 className="text-3xl font-black text-white tracking-tighter">{value}</h4>
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">{label}</p>
            </div>
          </div>
          {trend && (
             <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[8px] font-black text-emerald-500">
                {trend}
             </div>
          )}
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
        date,
        count: applicationList.filter(app => app.created_at.startsWith(date)).length
      }));

      setStats({ totalApplications: applicationList.length, statusBreakdown, weeklyActivity, applications: applicationList });
      setLoading(false);
    })();
  }, [user]);

  const quickActions = [
    { label: "Build Resume", icon: Plus, to: "/builder", color: "text-blue-500", bg: "bg-blue-600/10" },
    { label: "AI Search", icon: Search, to: "/jobs", color: "text-indigo-500", bg: "bg-indigo-600/10" },
    { label: "Interview", icon: Mic, to: "/interview-prep", color: "text-purple-500", bg: "bg-purple-600/10" },
    { label: "Outreach", icon: Mail, to: "/email-outreach", color: "text-emerald-500", bg: "bg-emerald-600/10" }
  ];

  return (
    <div className="min-h-screen bg-[#020617] pb-20 overflow-x-hidden selection:bg-blue-600/30 selection:text-blue-400">
      <SEOHead title="Dashboard — ResumePro" description="Premium AI-powered career dashboard." />
      
      <div className="container mx-auto px-8 pt-16 space-y-12 text-left relative">
        {/* Futuristic Ambient Glows */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />
        
        {/* Top Section - Welcome & Quick Actions */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12 relative z-10">
          <div className="space-y-6">
             <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/5 backdrop-blur-md rounded-full border border-blue-500/20 text-blue-400">
                <Sparkles className="w-4 h-4 text-glow" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Neural System Active</span>
             </motion.div>
             <div className="space-y-2">
                <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]">
                   Welcome back, <br /> <span className="text-blue-500 text-glow">{user?.user_metadata?.display_name?.split(' ')[0] || "User"}.</span>
                </h1>
                <p className="text-slate-500 font-medium text-lg max-w-xl">Your professional architecture is optimized and ready for deployment.</p>
             </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.label}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.to)}
                className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-500 group"
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500", action.bg, action.color)}>
                   <action.icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
           <div className="lg:col-span-8 space-y-8">
              <ResumeStrengthWidget />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                 <StatCard label="Applications" value={stats.totalApplications} icon={Activity} trend="+12% this week" color="bg-blue-600" />
                 <StatCard label="Profile Views" value="842" icon={Eye} trend="+54 today" color="bg-indigo-600" />
                 <StatCard label="Interviews" value="4" icon={Users} color="bg-purple-600" />
              </div>

              <Card className="rounded-[3rem] border border-white/5 bg-white/5 backdrop-blur-xl premium-shadow overflow-hidden group">
                 <div className="p-10 pb-0 flex items-center justify-between">
                    <div className="space-y-1">
                       <h3 className="text-3xl font-black text-white tracking-tighter">Application Pulse</h3>
                       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Real-time velocity tracking</p>
                    </div>
                    <div className="flex gap-2">
                       <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                       <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Live Feed</span>
                    </div>
                 </div>
                 <div className="p-10">
                    <Suspense fallback={<div className="h-[300px] animate-pulse bg-white/5 rounded-[2rem]" />}>
                       <DashboardCharts
                          statusBreakdown={stats.statusBreakdown}
                          weeklyActivity={stats.weeklyActivity}
                          applications={stats.applications}
                          labels={{ 
                            applicationStatus: "Status", 
                            statusBreakdown: "Industry", 
                            weeklyActivity: "Activity", 
                            weeklyActivityDesc: "Submissions", 
                            noAppsYet: "Deploy your first application...", 
                            noActivityYet: "Idle state" 
                          }}
                       />
                    </Suspense>
                 </div>
              </Card>
           </div>

           {/* Sidebar Widgets */}
           <div className="lg:col-span-4 space-y-8">
              <Card className="rounded-[3rem] border-none bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-10 shadow-2xl shadow-blue-600/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-1000">
                   <ZapIcon className="w-32 h-32" />
                </div>
                <div className="relative z-10 space-y-8">
                   <div className="space-y-2">
                      <h3 className="text-3xl font-black tracking-tighter leading-none">Auto-Apply Mode</h3>
                      <p className="text-blue-100/70 font-medium text-sm">AI is actively scouting 24/7.</p>
                   </div>
                   <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                      <motion.div animate={{ x: [-100, 300] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="h-full w-1/3 bg-white shadow-[0_0_15px_white]" />
                   </div>
                   <Suspense fallback={<div className="h-20 bg-white/10 rounded-2xl" />}>
                      <AIApplyQueueSection />
                   </Suspense>
                </div>
              </Card>

              <Card className="rounded-[3rem] border border-white/5 bg-white/5 backdrop-blur-xl premium-border p-10 space-y-8">
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <h3 className="text-2xl font-black text-white tracking-tighter">Next Briefing</h3>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Scheduled Interviews</p>
                   </div>
                   <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <Suspense fallback={<div className="h-40 bg-white/5 rounded-3xl animate-pulse" />}>
                   <ScheduledInterviewsList />
                </Suspense>
                <Button className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[9px] hover:bg-blue-600 hover:border-blue-600 transition-all">
                   Manage Schedule
                </Button>
              </Card>

              <Card className="rounded-[3rem] border border-white/5 bg-white/5 backdrop-blur-xl premium-border p-10 group overflow-hidden">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                       <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                       <h4 className="text-lg font-black text-white tracking-tight">AI Insights</h4>
                       <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none">Security Protocol: High</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2 group-hover:border-emerald-500/20 transition-all">
                       <p className="text-[10px] font-medium text-slate-400">Optimization recommended for <span className="text-emerald-500 font-bold">Google</span> role matching.</p>
                       <div className="flex items-center gap-2 text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                          <Activity className="w-3 h-3" /> Efficiency +24%
                       </div>
                    </div>
                 </div>
              </Card>
           </div>
        </div>

        {/* Secondary Modules */}
        <div className="relative z-10">
           <Card className="rounded-[4rem] border border-white/5 bg-white/5 backdrop-blur-xl premium-shadow p-12">
              <div className="flex items-center justify-between mb-12">
                 <div className="space-y-2">
                    <h2 className="text-4xl font-black text-white tracking-tighter">Opportunity Pipeline</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Live Tracking Matrix</p>
                 </div>
                 <Button onClick={() => navigate("/jobs")} variant="ghost" className="h-12 px-8 rounded-full border border-white/10 text-blue-400 font-black uppercase tracking-widest text-[9px] hover:bg-blue-600 hover:text-white transition-all">
                    Pipeline Analytics
                 </Button>
              </div>
              <Suspense fallback={<div className="h-[400px] bg-white/5 rounded-[3rem] animate-pulse" />}>
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
    <div className="min-h-screen bg-[#020617] pb-20 overflow-x-hidden selection:bg-blue-600/30 selection:text-blue-400">
      <SEOHead title="Recruiter Dashboard — ResumePro" description="Premium Recruiter Hub." />
      
      <div className="container mx-auto px-8 pt-16 space-y-16 text-left relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="space-y-6 relative z-10">
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/5 backdrop-blur-md rounded-full border border-blue-500/20 text-blue-400">
              <Building2 className="w-4 h-4 text-glow" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Talent Acquisition Engine</span>
           </motion.div>
           <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-tight">
              Recruiter <br /> <span className="text-blue-500 text-glow">Dashboard.</span>
           </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
          <StatCard label="Active Postings" value={stats.activeJobs} icon={Briefcase} trend="+2 new" color="bg-blue-600" />
          <StatCard label="Total Reach" value={stats.totalViews} icon={Eye} trend="+1.2k views" color="bg-indigo-600" />
          <StatCard label="Candidates" value={stats.totalApplicants} icon={Users} color="bg-blue-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
          <motion.button whileHover={{ y: -5 }} onClick={() => navigate("/recruiter/jobs")} className="group text-left">
             <Card className="rounded-[4rem] border border-white/5 bg-slate-900/50 p-16 shadow-2xl relative overflow-hidden premium-border h-full">
                <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Plus className="w-32 h-32" />
                </div>
                <div className="flex items-center justify-between mb-12">
                   <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-600/40 group-hover:scale-110 transition-transform"><Plus className="w-10 h-10 text-white" /></div>
                   <ArrowUpRight className="w-8 h-8 text-slate-700 group-hover:text-blue-500 transition-colors" />
                </div>
                <h3 className="text-5xl font-black text-white tracking-tighter mb-4">Post a Job</h3>
                <p className="text-slate-500 font-medium text-xl">Deploy a new mission and discover elite talent.</p>
             </Card>
          </motion.button>
          
          <motion.button whileHover={{ y: -5 }} onClick={() => navigate("/recruiter/company")} className="group text-left">
             <Card className="rounded-[4rem] border border-white/5 bg-white/5 backdrop-blur-xl p-16 premium-border h-full">
                <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Building2 className="w-32 h-32 text-blue-500" />
                </div>
                <div className="flex items-center justify-between mb-12">
                   <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-slate-500 group-hover:text-blue-500 transition-colors"><Building2 className="w-10 h-10" /></div>
                   <ArrowUpRight className="w-8 h-8 text-slate-100 group-hover:text-blue-500 transition-colors" />
                </div>
                <h3 className="text-5xl font-black text-white tracking-tighter mb-4">Company Core</h3>
                <p className="text-slate-500 font-medium text-xl">Manage organizational identity and branding.</p>
             </Card>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
