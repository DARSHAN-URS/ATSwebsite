import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Users, Briefcase, TrendingUp, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import SEOHead from "@/components/SEOHead";

interface JobAnalytics {
  id: string;
  title: string;
  company_name: string;
  status: string;
  created_at: string;
  views: number;
  applications: number;
  statusBreakdown: Record<string, number>;
}

const STATUS_COLORS: Record<string, string> = {
  applied: "hsl(210, 70%, 55%)",
  screening: "hsl(45, 80%, 50%)",
  interview: "hsl(270, 60%, 55%)",
  offer: "hsl(140, 60%, 45%)",
  rejected: "hsl(0, 65%, 50%)",
};

export default function RecruiterAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<JobAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoading(true);

      // Fetch recruiter's jobs
      const { data: jobs } = await supabase
        .from("job_posts")
        .select("id, title, company_name, status, created_at")
        .eq("recruiter_id", user.id)
        .order("created_at", { ascending: false }) as any;

      if (!jobs || jobs.length === 0) {
        setAnalytics([]);
        setLoading(false);
        return;
      }

      const jobIds = jobs.map((j: any) => j.id);

      // Fetch views counts
      const { data: views } = await supabase
        .from("job_post_views")
        .select("job_post_id")
        .in("job_post_id", jobIds) as any;

      // Fetch applications with status
      const { data: apps } = await supabase
        .from("job_post_applications")
        .select("job_post_id, status")
        .in("job_post_id", jobIds) as any;

      const viewCounts: Record<string, number> = {};
      (views ?? []).forEach((v: any) => {
        viewCounts[v.job_post_id] = (viewCounts[v.job_post_id] || 0) + 1;
      });

      const appCounts: Record<string, number> = {};
      const statusBreakdowns: Record<string, Record<string, number>> = {};
      (apps ?? []).forEach((a: any) => {
        appCounts[a.job_post_id] = (appCounts[a.job_post_id] || 0) + 1;
        if (!statusBreakdowns[a.job_post_id]) statusBreakdowns[a.job_post_id] = {};
        statusBreakdowns[a.job_post_id][a.status] = (statusBreakdowns[a.job_post_id][a.status] || 0) + 1;
      });

      setAnalytics(
        jobs.map((j: any) => ({
          ...j,
          views: viewCounts[j.id] || 0,
          applications: appCounts[j.id] || 0,
          statusBreakdown: statusBreakdowns[j.id] || {},
        }))
      );
      setLoading(false);
    };
    fetch();
  }, [user]);

  const totalViews = analytics.reduce((s, a) => s + a.views, 0);
  const totalApps = analytics.reduce((s, a) => s + a.applications, 0);
  const activeJobs = analytics.filter((a) => a.status === "active").length;

  // Aggregate status breakdown across all jobs
  const aggregateStatus: Record<string, number> = {};
  analytics.forEach((a) => {
    Object.entries(a.statusBreakdown).forEach(([status, count]) => {
      aggregateStatus[status] = (aggregateStatus[status] || 0) + count;
    });
  });
  const pieData = Object.entries(aggregateStatus).map(([name, value]) => ({ name, value }));

  const barData = analytics.slice(0, 10).map((a) => ({
    name: a.title.length > 20 ? a.title.slice(0, 20) + "…" : a.title,
    views: a.views,
    applications: a.applications,
  }));

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <SEOHead title="Recruiter Analytics — ATS Pro Resume Builder" description="View analytics for your job postings." noindex />
      <div>
        <h1 className="text-2xl font-bold text-foreground">Recruiter Analytics</h1>
        <p className="text-muted-foreground">Overview of your job postings performance</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading analytics...</p>
      ) : analytics.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No data yet</h3>
            <p className="text-muted-foreground">Post some jobs to see analytics here.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Views", value: totalViews, icon: <Eye className="h-5 w-5 text-primary" /> },
              { label: "Total Applications", value: totalApps, icon: <Users className="h-5 w-5 text-primary" /> },
              { label: "Active Jobs", value: activeJobs, icon: <Briefcase className="h-5 w-5 text-primary" /> },
              { label: "Avg. Views/Post", value: analytics.length ? Math.round(totalViews / analytics.length) : 0, icon: <TrendingUp className="h-5 w-5 text-primary" /> },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="pt-6 text-center">
                  <div className="flex justify-center mb-2">{s.icon}</div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Bar chart */}
            {barData.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Views & Applications by Post</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="applications" fill="hsl(var(--primary) / 0.5)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Pie chart */}
            {pieData.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Application Status Breakdown</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name} (${value})`}>
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "hsl(var(--muted))"} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Per-job breakdown */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Per-Job Breakdown</h2>
            {analytics.map((job) => (
              <Card key={job.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.company_name} • {new Date(job.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <Badge variant={job.status === "active" ? "default" : "secondary"}>{job.status}</Badge>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground"><Eye className="h-3.5 w-3.5" /> {job.views}</span>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground"><Users className="h-3.5 w-3.5" /> {job.applications}</span>
                      {Object.entries(job.statusBreakdown).map(([status, count]) => (
                        <span key={status} className="text-xs text-muted-foreground">
                          {status}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
