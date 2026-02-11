import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Briefcase, Bookmark, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ resumes: 0, applications: 0, savedJobs: 0 });

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [resumes, apps, saved] = await Promise.all([
        supabase.from("resumes").select("id", { count: "exact", head: true }),
        supabase.from("job_applications").select("id", { count: "exact", head: true }),
        supabase.from("saved_jobs").select("id", { count: "exact", head: true }).eq("is_bookmarked", true),
      ]);
      setStats({
        resumes: resumes.count ?? 0,
        applications: apps.count ?? 0,
        savedJobs: saved.count ?? 0,
      });
    };
    fetchStats();
  }, [user]);

  const cards = [
    { title: "Resumes", value: stats.resumes, icon: FileText, description: "Created resumes", action: () => navigate("/resumes") },
    { title: "Applications", value: stats.applications, icon: Briefcase, description: "Tracked applications", action: () => navigate("/tracker") },
    { title: "Saved Jobs", value: stats.savedJobs, icon: Bookmark, description: "Bookmarked listings", action: () => navigate("/jobs") },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your job search overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Card
            key={card.title}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={card.action}
          >
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
            Find Jobs
          </CardTitle>
          <CardDescription>Discover jobs matched to your resume using AI</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a resume and let AI find the best job matches for you. Get match scores, save listings, and track your applications — all in one place.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
