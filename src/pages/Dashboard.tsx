import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Briefcase, Bookmark, Search, Mail, Eye, Users, Building2, TrendingUp, Target, PieChart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

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

function JobSeekerDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    resumes: 0, applications: 0, savedJobs: 0, coverLetters: 0,
    responseRate: 0,
    statusBreakdown: [] as { name: string; value: number }[],
    weeklyActivity: [] as { week: string; count: number }[],
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

      // Status breakdown
      const statusMap: Record<string, number> = {};
      apps.forEach((app) => {
        const s = app.status || "applied";
        statusMap[s] = (statusMap[s] || 0) + 1;
      });
      const statusBreakdown = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

      // Response rate
      const responded = apps.filter((a) => a.status && a.status !== "applied").length;
      const responseRate = totalApps > 0 ? Math.round((responded / totalApps) * 100) : 0;

      // Weekly activity (last 8 weeks)
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

      setStats({
        resumes: resumesRes.count ?? 0,
        applications: totalApps,
        savedJobs: savedRes.count ?? 0,
        coverLetters: clsRes.count ?? 0,
        responseRate,
        statusBreakdown,
        weeklyActivity,
      });
    })();
  }, [user]);

  const cards = [
    { title: t.dashboard.resumes, value: stats.resumes, icon: FileText, description: t.dashboard.createdResumes, action: () => navigate("/resumes") },
    { title: t.dashboard.coverLetters, value: stats.coverLetters, icon: Mail, description: t.dashboard.generatedLetters, action: () => navigate("/cover-letters") },
    { title: t.dashboard.applications, value: stats.applications, icon: Briefcase, description: t.dashboard.trackedApps, action: () => navigate("/tracker") },
    { title: "Response Rate", value: `${stats.responseRate}%`, icon: TrendingUp, description: "From tracked apps" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8">
      <SEOHead title="Dashboard — ATS Pro Resume Builder" description="Manage your resumes, cover letters, and job applications." noindex />
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t.dashboard.title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t.dashboard.welcome}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {cards.map((card) => (
          <Card key={card.title} className={`${card.action ? "cursor-pointer hover:shadow-md" : ""} transition-shadow`} onClick={card.action}>
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

      {/* Analytics charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" /> Application Status
            </CardTitle>
            <CardDescription className="text-xs">Breakdown by current status</CardDescription>
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
                    label={({ name, value }) => `${name} (${value})`}
                  >
                    {stats.statusBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "hsl(220, 10%, 50%)"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">No applications yet. Start tracking to see stats.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Weekly Activity
            </CardTitle>
            <CardDescription className="text-xs">Applications over the last 8 weeks</CardDescription>
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
              <p className="text-center text-sm text-muted-foreground py-8">No activity to display yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Find Jobs CTA */}
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/jobs")}>
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
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t.recruiterDashboard.title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t.recruiterDashboard.welcome}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
        {cards.map((card) => (
          <Card key={card.title} className="cursor-pointer hover:shadow-md transition-shadow" onClick={card.action}>
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
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/recruiter/company")}>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Building2 className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              {t.recruiterDashboard.companyProfileTitle}
            </CardTitle>
            <CardDescription className="text-[12px] md:text-sm">{t.recruiterDashboard.companyProfileDesc}</CardDescription>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/recruiter/jobs")}>
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
