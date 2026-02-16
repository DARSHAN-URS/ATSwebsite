import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, FileText, Briefcase, Mail, Target, PieChart } from "lucide-react";
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

export default function JobSeekerAnalytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApps: 0,
    totalResumes: 0,
    totalCoverLetters: 0,
    totalSavedJobs: 0,
    statusBreakdown: [] as { name: string; value: number }[],
    weeklyActivity: [] as { week: string; count: number }[],
    responseRate: 0,
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [appsRes, resumesRes, clsRes, savedRes] = await Promise.all([
        supabase.from("job_applications").select("*").order("created_at", { ascending: true }),
        supabase.from("resumes").select("id", { count: "exact", head: true }),
        supabase.from("cover_letters").select("id", { count: "exact", head: true }),
        supabase.from("saved_jobs").select("id", { count: "exact", head: true }).eq("is_bookmarked", true),
      ]);

      const apps = appsRes.data || [];
      const totalApps = apps.length;
      const totalResumes = resumesRes.count ?? 0;
      const totalCoverLetters = clsRes.count ?? 0;
      const totalSavedJobs = savedRes.count ?? 0;

      // Status breakdown
      const statusMap: Record<string, number> = {};
      apps.forEach((app) => {
        const s = app.status || "applied";
        statusMap[s] = (statusMap[s] || 0) + 1;
      });
      const statusBreakdown = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

      // Response rate (anything beyond "applied" counts)
      const responded = apps.filter((a) => a.status && a.status !== "applied").length;
      const responseRate = totalApps > 0 ? Math.round((responded / totalApps) * 100) : 0;

      // Weekly activity (last 8 weeks)
      const weeklyMap: Record<string, number> = {};
      const now = new Date();
      for (let i = 7; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i * 7);
        const weekLabel = `W${8 - i}`;
        weeklyMap[weekLabel] = 0;
      }

      apps.forEach((app) => {
        const created = new Date(app.created_at);
        const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        const weekIndex = Math.floor(diffDays / 7);
        if (weekIndex < 8) {
          const weekLabel = `W${8 - weekIndex}`;
          if (weeklyMap[weekLabel] !== undefined) weeklyMap[weekLabel]++;
        }
      });

      const weeklyActivity = Object.entries(weeklyMap).map(([week, count]) => ({ week, count }));

      setStats({ totalApps, totalResumes, totalCoverLetters, totalSavedJobs, statusBreakdown, weeklyActivity, responseRate });
      setLoading(false);
    })();
  }, [user]);

  const summaryCards = [
    { title: "Applications", value: stats.totalApps, icon: Briefcase, color: "text-info" },
    { title: "Resumes", value: stats.totalResumes, icon: FileText, color: "text-primary" },
    { title: "Cover Letters", value: stats.totalCoverLetters, icon: Mail, color: "text-warning" },
    { title: "Response Rate", value: `${stats.responseRate}%`, icon: TrendingUp, color: "text-success" },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <SEOHead title="Analytics — ATS Pro Resume Builder" description="Track your job search analytics." noindex />
      <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-1.5">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" /> Job Search Analytics
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Track your application activity and response rates.</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-12">Loading analytics...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {summaryCards.map((card) => (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-1 p-3 md:p-4">
                  <CardTitle className="text-[11px] md:text-xs font-medium text-muted-foreground">{card.title}</CardTitle>
                  <card.icon className={`h-3.5 w-3.5 md:h-4 md:w-4 ${card.color}`} />
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-4 md:pt-0">
                  <div className="text-2xl md:text-3xl font-bold font-mono">{card.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

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
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={220}>
                      <RechartsPie>
                        <Pie
                          data={stats.statusBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
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
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-8">No applications yet. Start tracking to see your stats.</p>
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
                {stats.totalApps > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats.weeklyActivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-8">No activity to display yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
