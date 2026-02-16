import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Briefcase, Bookmark, Search, Mail, Eye, Users, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { role } = useUserRole();
  const navigate = useNavigate();

  if (role === "recruiter") {
    return <RecruiterDashboard />;
  }

  return <JobSeekerDashboard />;
}

function JobSeekerDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ resumes: 0, applications: 0, savedJobs: 0, coverLetters: 0 });

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [resumes, apps, saved, cls] = await Promise.all([
        supabase.from("resumes").select("id", { count: "exact", head: true }),
        supabase.from("job_applications").select("id", { count: "exact", head: true }),
        supabase.from("saved_jobs").select("id", { count: "exact", head: true }).eq("is_bookmarked", true),
        supabase.from("cover_letters").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        resumes: resumes.count ?? 0,
        applications: apps.count ?? 0,
        savedJobs: saved.count ?? 0,
        coverLetters: cls.count ?? 0,
      });
    };
    fetchStats();
  }, [user]);

  const cards = [
    { title: t.dashboard.resumes, value: stats.resumes, icon: FileText, description: t.dashboard.createdResumes, action: () => navigate("/resumes") },
    { title: t.dashboard.coverLetters, value: stats.coverLetters, icon: Mail, description: t.dashboard.generatedLetters, action: () => navigate("/cover-letters") },
    { title: t.dashboard.applications, value: stats.applications, icon: Briefcase, description: t.dashboard.trackedApps, action: () => navigate("/tracker") },
    { title: t.dashboard.savedJobs, value: stats.savedJobs, icon: Bookmark, description: t.dashboard.bookmarkedListings, action: () => navigate("/jobs") },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8">
      <SEOHead title="Dashboard — ATS Pro Resume Builder" description="Manage your resumes, cover letters, and job applications." noindex />
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t.dashboard.title}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t.dashboard.welcome}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {cards.map((card) => (
          <Card key={card.title} className="cursor-pointer hover:shadow-md transition-shadow" onClick={card.action}>
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
    { title: "Job Posts", value: stats.jobPosts, icon: Briefcase, description: `${stats.activeJobs} active`, action: () => navigate("/recruiter/jobs") },
    { title: "Total Views", value: stats.totalViews, icon: Eye, description: "Across all posts", action: () => navigate("/recruiter/analytics") },
    { title: "Total Applicants", value: stats.totalApplicants, icon: Users, description: "All candidates", action: () => navigate("/recruiter/candidates") },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8">
      <SEOHead title="Recruiter Dashboard — ATS Pro" description="Manage your job posts and candidates." noindex />
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Recruiter Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">Welcome back! Here's an overview of your hiring activity.</p>
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
              Company Profile
            </CardTitle>
            <CardDescription className="text-[12px] md:text-sm">Set up your company information to display on job listings.</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/recruiter/jobs")}>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Briefcase className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              Post a New Job
            </CardTitle>
            <CardDescription className="text-[12px] md:text-sm">Create job listings and manage your open positions.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
