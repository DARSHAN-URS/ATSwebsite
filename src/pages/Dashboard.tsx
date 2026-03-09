import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Briefcase, Bookmark, Search, Mail, Eye, Users, Building2, TrendingUp, Target, PieChart, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import JobTrackerSection from "@/components/job-tracker/JobTrackerSection";
import AIApplyQueueSection from "@/components/resume/AIApplyQueueSection";
import type { ResumeData } from "@/components/resume/types";
import { dashboardExtraTranslations } from "@/i18n/dashboardExtraTranslations";
import ScheduledInterviewsList from "@/components/ScheduledInterviewsList";

const STATUS_COLORS: Record<string, string> = {
  applied: "hsl(200, 80%, 52%)",
  screening: "hsl(38, 92%, 55%)",
  interview: "hsl(252, 68%, 55%)",
  offer: "hsl(152, 60%, 44%)",
  rejected: "hsl(0, 72%, 56%)",
};

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
    <Card className="border border-border/60 rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" /> {td.resumeHealth}
        </CardTitle>
        <CardDescription className="text-xs">{td.resumeHealthDesc}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {resumes.map((r) => {
          const color = r.score >= 80 ? "text-primary" : r.score >= 50 ? "text-yellow-600 dark:text-yellow-400" : "text-destructive";
          const barColor = r.score >= 80 ? "bg-primary" : r.score >= 50 ? "bg-yellow-500" : "bg-destructive";
          return (
            <div key={r.id} className="space-y-1 cursor-pointer group" onClick={() => navigate("/resumes")}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium group-hover:text-primary transition-colors truncate max-w-[70%]">{r.title}</span>
                <div className="flex items-center gap-1.5">
                  {r.score >= 80
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    : <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />}
                  <span className={`text-sm font-bold ${color}`}>{r.score}%</span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${r.score}%` }} />
              </div>
            </div>
          );
        })}
        <button
          onClick={() => navigate("/resumes")}
          className="w-full text-xs text-primary hover:underline text-left pt-1"
        >
          {td.viewAllResumes}
        </button>
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
    { title: t.dashboard.resumes, value: stats.resumes, icon: FileText, description: t.dashboard.createdResumes, action: () => navigate("/resumes") },
    { title: t.dashboard.coverLetters, value: stats.coverLetters, icon: Mail, description: t.dashboard.generatedLetters, action: () => navigate("/resumes?tab=cover-letters") },
    { title: t.dashboard.applications, value: stats.applications, icon: Briefcase, description: t.dashboard.trackedApps, action: () => navigate("/jobs") },
    { title: td.responseRate, value: `${stats.responseRate}%`, icon: TrendingUp, description: td.fromTrackedApps },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8">
      <SEOHead title="Dashboard — ATS Pro Resume Builder" description="Manage your resumes, cover letters, and job applications." noindex />
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display">{t.dashboard.title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t.dashboard.welcome}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {cards.map((card) => (
          <Card key={card.title} className={`${card.action ? "cursor-pointer card-lift" : ""} rounded-xl border border-border/60`} onClick={card.action}>
            <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 p-3 md:p-6">
              <CardTitle className="text-[11px] md:text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-2xl md:text-3xl font-bold">{card.value}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Applications */}
      {stats.recentApps.length > 0 && (
        <Card className="rounded-xl border border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" /> Recent Applications
            </CardTitle>
            <CardDescription className="text-xs">Where you've applied recently</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.recentApps.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 hover:bg-muted/70 cursor-pointer transition-colors"
                onClick={() => navigate("/job-tracker")}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{app.position}</p>
                  <p className="text-xs text-muted-foreground truncate">{app.company}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-muted-foreground">{new Date(app.date_applied).toLocaleDateString()}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                    app.status === "offer" ? "bg-primary/10 text-primary" :
                    app.status === "rejected" ? "bg-destructive/10 text-destructive" :
                    app.status === "interview" ? "bg-accent text-accent-foreground" :
                    "bg-muted text-muted-foreground"
                  }`}>{app.status}</span>
                </div>
              </div>
            ))}
            <button onClick={() => navigate("/job-tracker")} className="w-full text-xs text-primary hover:underline text-left pt-1">
              View all applications →
            </button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" /> {td.applicationStatus}
            </CardTitle>
            <CardDescription className="text-xs">{td.statusBreakdown}</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.statusBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPie>
                  <Pie
                    data={stats.statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name.length > 8 ? name.slice(0, 8) + '…' : name} (${value})`}
                  >
                    {stats.statusBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "hsl(220, 10%, 50%)"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">{td.noAppsYet}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> {td.weeklyActivity}
            </CardTitle>
            <CardDescription className="text-xs">{td.weeklyActivityDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.applications > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)", color: "hsl(var(--foreground))" }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">{td.noActivityYet}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <AIApplyQueueSection />
      <ResumeHealthCard navigate={navigate} />
      <JobTrackerSection />

      <Card className="cursor-pointer card-lift rounded-xl border border-border/60" onClick={() => navigate("/jobs")}>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Search className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            {t.dashboard.findJobs}
          </CardTitle>
          <CardDescription className="text-[12px] md:text-sm">{t.dashboard.findJobsDesc}</CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 md:px-6 md:pb-6 pt-0">
          <p className="text-[12px] md:text-sm text-muted-foreground">{t.dashboard.findJobsDetail}</p>
        </CardContent>
      </Card>

      {/* Trustpilot Review CTA */}
      <a
        href="https://www.trustpilot.com/evaluate/atsproresumebuilder.com"
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <Card className="card-lift rounded-xl border border-[#00b67a]/30 bg-[#00b67a]/5 hover:bg-[#00b67a]/10 transition-colors cursor-pointer">
          <CardContent className="flex items-center gap-4 p-4 md:p-6">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-[#00b67a]/10 flex items-center justify-center shrink-0">
              <svg className="h-5 w-5 md:h-6 md:w-6 text-[#00b67a]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L14.59 8.41H23.42L16.41 13.59L19 22L12 16.82L5 22L7.59 13.59L0.58 8.41H9.41L12 0Z"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm md:text-base">Enjoying ATS Pro? Leave us a review!</p>
              <p className="text-xs md:text-sm text-muted-foreground">Share your experience on Trustpilot — it helps others discover us ⭐</p>
            </div>
            <div className="flex gap-0.5 shrink-0">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="h-4 w-4 text-[#00b67a]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              ))}
            </div>
          </CardContent>
        </Card>
      </a>
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
    { title: t.recruiterDashboard.jobPosts, value: stats.jobPosts, icon: Briefcase, description: `${stats.activeJobs} ${t.recruiterDashboard.active}`, action: () => navigate("/recruiter/jobs") },
    { title: t.recruiterDashboard.totalViews, value: stats.totalViews, icon: Eye, description: t.recruiterDashboard.acrossAllPosts, action: () => navigate("/recruiter/analytics") },
    { title: t.recruiterDashboard.totalApplicants, value: stats.totalApplicants, icon: Users, description: t.recruiterDashboard.allCandidates, action: () => navigate("/recruiter/candidates") },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8">
      <SEOHead title="Recruiter Dashboard — ATS Pro" description="Manage your job posts and candidates." noindex />
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display">{t.recruiterDashboard.title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t.recruiterDashboard.welcome}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
        {cards.map((card) => (
          <Card key={card.title} className="cursor-pointer card-lift rounded-xl border border-border/60" onClick={card.action}>
            <CardHeader className="flex flex-row items-center justify-between pb-1 md:pb-2 p-3 md:p-6">
              <CardTitle className="text-[11px] md:text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-2xl md:text-3xl font-bold">{loading ? "—" : card.value}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 md:mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
        <Card className="cursor-pointer card-lift rounded-xl border border-border/60" onClick={() => navigate("/recruiter/company")}>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Building2 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              {t.recruiterDashboard.companyProfileTitle}
            </CardTitle>
            <CardDescription className="text-[12px] md:text-sm">{t.recruiterDashboard.companyProfileDesc}</CardDescription>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer card-lift rounded-xl border border-border/60" onClick={() => navigate("/recruiter/jobs")}>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Briefcase className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              {t.recruiterDashboard.postNewJob}
            </CardTitle>
            <CardDescription className="text-[12px] md:text-sm">{t.recruiterDashboard.postNewJobDesc}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
