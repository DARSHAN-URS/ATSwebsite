import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Briefcase, Bookmark, Search, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

export default function Dashboard() {
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
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <SEOHead title="Dashboard — ATS Pro Resume Builder" description="Manage your resumes, cover letters, and job applications." noindex />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.dashboard.title}</h1>
        <p className="text-muted-foreground mt-1">{t.dashboard.welcome}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Card key={card.title} className="cursor-pointer hover:shadow-md transition-shadow" onClick={card.action}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/jobs")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            {t.dashboard.findJobs}
          </CardTitle>
          <CardDescription>{t.dashboard.findJobsDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t.dashboard.findJobsDetail}</p>
        </CardContent>
      </Card>
    </div>
  );
}
