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

const CircularProgress = ({ value, label, size = 100 }: { value: number; label: string; size?: number }) => {
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
          strokeWidth="5"
          fill="transparent"
          className="text-white/5"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="5"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className="text-blue-500"
          style={{ filter: "drop-shadow(0 0 5px rgba(59, 130, 246, 0.4))" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-black text-white leading-none">{value}%</span>
        <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest mt-1">{label}</span>
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
    <Card className="rounded-[2.5rem] border border-white/5 bg-white/5 backdrop-blur-xl p-6 premium-border group overflow-hidden relative">
      <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
        <CircularProgress value={resume.score} label="Score" />
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div className="space-y-0.5">
             <h3 className="text-lg font-black text-white tracking-tight">{resume.title}</h3>
             <p className="text-[9px] font-bold text-blue-500/70 uppercase tracking-widest">Active Architecture</p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
             {resume.score < 90 && (
                <div className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[8px] font-bold text-amber-500 uppercase tracking-widest">
                   AI Tip: Optimization Required
                </div>
             )}
             <div className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[8px] font-bold text-blue-500 uppercase tracking-widest">
                Discovery Active
             </div>
          </div>
          <Button onClick={() => navigate(`/builder/${resume.id}`)} variant="ghost" className="h-8 px-4 rounded-lg font-black uppercase tracking-widest text-[8px] text-blue-400 hover:bg-blue-600 hover:text-white transition-all gap-2">
             Refine Module <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="group">
      <Card className="rounded-2xl border border-white/5 bg-white/5 backdrop-blur-xl p-6 premium-border relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110", color.replace('bg-', 'bg-') + "/10", color.replace('bg-', 'text-'))}>
             <Icon className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
             <h4 className="text-2xl font-black text-white tracking-tighter leading-none">{value}</h4>
             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">{label}</p>
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
        date,
        count: applicationList.filter(app => app.created_at.startsWith(date)).length
      }));

      setStats({ totalApplications: applicationList.length, statusBreakdown, weeklyActivity, applications: applicationList });
      setLoading(false);
    })();
  }, [user]);

  const quickActions = [
    { label: "Build", icon: Plus, to: "/builder", color: "text-blue-500", bg: "bg-blue-600/10" },
    { label: "Search", icon: Search, to: "/jobs", color: "text-indigo-500", bg: "bg-indigo-600/10" },
    { label: "Interview", icon: Mic, to: "/interview-prep", color: "text-purple-500", bg: "bg-purple-600/10" },
    { label: "Outreach", icon: Mail, color: "text-emerald-500", bg: "bg-emerald-600/10", to: "/email-outreach" }
  ];

  return (
    <div className="min-h-screen bg-[#020617] pb-10 overflow-x-hidden selection:bg-blue-600/30 selection:text-blue-400">
      <SEOHead title="Dashboard — ResumePro" description="Career command center." />
      
      <div className="container mx-auto px-6 pt-10 space-y-8 text-left relative">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Simplified Top Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-4 text-center lg:text-left">
             <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/5 backdrop-blur-md rounded-full border border-blue-500/10 text-blue-400">
                <Sparkles className="w-3 h-3" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">System Active</span>
             </motion.div>
             <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight">
                Welcome, <span className="text-blue-500">{user?.user_metadata?.display_name?.split(' ')[0] || "User"}</span>.
             </h1>
          </div>

          <div className="flex items-center gap-3">
            {quickActions.map((action, i) => (
              <motion.button
                key={action.label}
                whileHover={{ y: -2 }}
                onClick={() => navigate(action.to)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-blue-600 hover:text-white transition-all duration-300 group"
              >
                <action.icon className={cn("w-4 h-4", action.color, "group-hover:text-white")} />
                <span className="text-[9px] font-black uppercase tracking-widest">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Compact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
           <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <ResumeStrengthWidget />
                 <div className="grid grid-cols-2 gap-4">
                    <StatCard label="Deployments" value={stats.totalApplications} icon={Activity} color="bg-blue-600" />
                    <StatCard label="Interviews" value="4" icon={Users} color="bg-purple-600" />
                 </div>
              </div>

              <Card className="rounded-[2.5rem] border border-white/5 bg-white/5 backdrop-blur-xl overflow-hidden">
                 <div className="p-8 pb-0 flex items-center justify-between">
                    <h3 className="text-xl font-black text-white tracking-tighter uppercase">Pulse Matrix</h3>
                    <div className="flex gap-1.5 items-center">
                       <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                       <span className="text-[7px] font-black text-blue-500 uppercase tracking-widest">Live Feed</span>
                    </div>
                 </div>
                 <div className="p-8">
                    <Suspense fallback={<div className="h-[250px] animate-pulse bg-white/5 rounded-2xl" />}>
                       <DashboardCharts
                          statusBreakdown={stats.statusBreakdown}
                          weeklyActivity={stats.weeklyActivity}
                          applications={stats.applications}
                          labels={{ applicationStatus: "Status", statusBreakdown: "Industry", weeklyActivity: "Activity", weeklyActivityDesc: "Submissions", noAppsYet: "Deploy mission...", noActivityYet: "Idle" }}
                       />
                    </Suspense>
                 </div>
              </Card>
           </div>

           <div className="lg:col-span-4 space-y-6">
              <Card className="rounded-[2.5rem] border-none bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                   <ZapIcon className="w-20 h-20" />
                </div>
                <div className="relative z-10 space-y-6">
                   <h3 className="text-xl font-black tracking-tighter uppercase leading-none">Auto-Apply</h3>
                   <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div animate={{ x: [-100, 200] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="h-full w-1/4 bg-white shadow-[0_0_10px_white]" />
                   </div>
                   <Suspense fallback={<div className="h-20 bg-white/10 rounded-xl" />}>
                      <AIApplyQueueSection />
                   </Suspense>
                </div>
              </Card>

              <Card className="rounded-[2.5xl] border border-white/5 bg-white/5 backdrop-blur-xl p-8 space-y-6">
                <div className="flex items-center justify-between">
                   <h3 className="text-lg font-black text-white tracking-tighter uppercase">Briefings</h3>
                   <Clock className="w-4 h-4 text-blue-500" />
                </div>
                <Suspense fallback={<div className="h-32 bg-white/5 rounded-2xl animate-pulse" />}>
                   <ScheduledInterviewsList />
                </Suspense>
              </Card>
           </div>
        </div>

        <div className="relative z-10">
           <Card className="rounded-[3rem] border border-white/5 bg-white/5 backdrop-blur-xl p-10">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Pipeline Matrix</h2>
                 <Button onClick={() => navigate("/jobs")} variant="ghost" className="h-10 px-6 rounded-full border border-white/5 text-blue-400 font-black uppercase tracking-widest text-[8px] hover:bg-blue-600 hover:text-white transition-all">
                    View All
                 </Button>
              </div>
              <Suspense fallback={<div className="h-[300px] bg-white/5 rounded-3xl animate-pulse" />}>
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
    <div className="min-h-screen bg-[#020617] pb-10 overflow-x-hidden selection:bg-blue-600/30 selection:text-blue-400">
      <SEOHead title="Recruiter — ResumePro" description="Talent acquisition hub." />
      
      <div className="container mx-auto px-6 pt-10 space-y-12 text-left relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="space-y-4 relative z-10 text-center lg:text-left">
           <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/5 backdrop-blur-md rounded-full border border-blue-500/10 text-blue-400">
              <Building2 className="w-3 h-3" />
              <span className="text-[8px] font-black uppercase tracking-[0.2em]">Talent Engine</span>
           </motion.div>
           <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">
              Recruiter <span className="text-blue-500">Hub.</span>
           </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <StatCard label="Postings" value={stats.activeJobs} icon={Briefcase} color="bg-blue-600" />
          <StatCard label="Reach" value={stats.totalViews} icon={Eye} color="bg-indigo-600" />
          <StatCard label="Talent" value={stats.totalApplicants} icon={Users} color="bg-blue-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <motion.button whileHover={{ y: -3 }} onClick={() => navigate("/recruiter/jobs")} className="group text-left">
             <Card className="rounded-[3rem] border border-white/5 bg-slate-900/50 p-12 relative overflow-hidden premium-border h-full">
                <div className="flex items-center justify-between mb-8">
                   <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/30 group-hover:scale-110 transition-transform"><Plus className="w-6 h-6 text-white" /></div>
                   <ArrowUpRight className="w-6 h-6 text-slate-700 group-hover:text-blue-500 transition-colors" />
                </div>
                <h3 className="text-3xl font-black text-white tracking-tighter mb-2">Post Job</h3>
                <p className="text-slate-500 font-medium text-sm">Deploy new missions to the network.</p>
             </Card>
          </motion.button>
          
          <motion.button whileHover={{ y: -3 }} onClick={() => navigate("/recruiter/company")} className="group text-left">
             <Card className="rounded-[3rem] border border-white/5 bg-white/5 backdrop-blur-xl p-12 premium-border h-full">
                <div className="flex items-center justify-between mb-8">
                   <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-blue-500 transition-colors"><Building2 className="w-6 h-6" /></div>
                   <ArrowUpRight className="w-6 h-6 text-slate-100 group-hover:text-blue-500 transition-colors" />
                </div>
                <h3 className="text-3xl font-black text-white tracking-tighter mb-2">Company</h3>
                <p className="text-slate-500 font-medium text-sm">Manage organizational identity.</p>
             </Card>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
