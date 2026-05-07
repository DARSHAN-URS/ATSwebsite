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
  Layout
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
  const { t, locale } = useLanguage();
  const td = dashboardExtraTranslations[locale];
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
    { title: "Resumes", value: stats.resumes, icon: FileText, color: "text-blue-500", action: () => navigate("/resumes") },
    { title: "Applications", value: stats.applications, icon: Briefcase, color: "text-purple-500", action: () => navigate("/jobs") },
    { title: "Cover Letters", value: stats.coverLetters, icon: Mail, color: "text-pink-500", action: () => navigate("/resumes?tab=cover-letters") },
    { title: "Response Rate", value: `${stats.responseRate}%`, icon: TrendingUp, color: "text-green-500" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <SEOHead title="Dashboard — ResumePro" description="Your professional career control center." noindex />
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome back, <span className="text-primary">{user?.user_metadata?.display_name?.split(" ")[0] || "there"}!</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Here's what's happening with your career progress today.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/builder")} className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-6 rounded-2xl shadow-xl shadow-primary/20 gap-2 h-auto">
            <Plus className="w-5 h-5" /> Create New Resume
          </Button>
          <Button variant="outline" className="font-bold px-6 py-6 rounded-2xl h-auto border-slate-200 dark:border-slate-800">
            <Sparkles className="w-5 h-5 mr-2 text-primary" /> AI Optimize
          </Button>
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
              className={`group cursor-pointer rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
              onClick={card.action}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-8">
                <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 ${card.color}`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="text-4xl font-black text-slate-900 dark:text-white">{card.value}</div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">{card.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Applications */}
          <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-slate-900 dark:text-white">Recent Applications</CardTitle>
                  <CardDescription className="text-sm font-medium mt-1">Track your progress at world-class companies</CardDescription>
                </div>
                <Button variant="ghost" onClick={() => navigate("/job-tracker")} className="text-primary font-bold">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-4">
              {stats.recentApps.length > 0 ? (
                stats.recentApps.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer transition-all group"
                    onClick={() => navigate("/job-tracker")}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center font-black text-primary shadow-sm">
                        {app.company.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{app.position}</p>
                        <p className="text-xs text-slate-500 font-medium truncate">{app.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <span className="hidden sm:block text-xs font-bold text-slate-400 uppercase tracking-tighter">
                        {new Date(app.date_applied).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                      <span className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest ${
                        app.status === "offer" ? "bg-green-100 text-green-600 dark:bg-green-900/20" :
                        app.status === "rejected" ? "bg-red-100 text-red-600 dark:bg-red-900/20" :
                        app.status === "interview" ? "bg-primary/10 text-primary dark:bg-primary/20" :
                        "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}>{app.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                  <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">No applications tracked yet.</p>
                  <Button variant="link" onClick={() => navigate("/jobs")} className="mt-2 text-primary">Start applying →</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Charts or Queue Section */}
          <Suspense fallback={<div className="h-[200px] animate-pulse bg-slate-50 dark:bg-slate-900 rounded-[2.5rem]" />}>
            <AIApplyQueueSection />
          </Suspense>
          
          <Suspense fallback={null}>
            <JobTrackerSection />
          </Suspense>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          <ResumeHealthCard navigate={navigate} />
          
          {/* Pro CTA Widget */}
          <Card className="rounded-[2rem] bg-slate-900 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <Sparkles className="w-10 h-10 text-primary mb-6" />
              <h3 className="text-xl font-black mb-3 leading-tight">Unlock AI Power</h3>
              <p className="text-slate-400 text-sm font-medium mb-6 leading-relaxed">
                Get unlimited AI tailoring, expert scoring, and direct application automation.
              </p>
              <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-xl">
                Upgrade to Pro
              </Button>
            </div>
          </Card>

          {/* Schedule/Interview Widget */}
          <Suspense fallback={null}>
            <ScheduledInterviewsList />
          </Suspense>

          {/* Activity Widget */}
          <Card className="rounded-[2rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-slate-400">
                <PieChart className="h-4 w-4" /> Application Funnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div className="h-[200px] animate-pulse" />}>
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
