import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Users, Briefcase, TrendingUp, BarChart3, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import SEOHead from "@/components/SEOHead";
import { cn } from "@/lib/utils";

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
      const { data: views } = await supabase
        .from("job_post_views")
        .select("job_post_id")
        .in("job_post_id", jobIds) as any;

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

  const aggregateStatus: Record<string, number> = {};
  analytics.forEach((a) => {
    Object.entries(a.statusBreakdown).forEach(([status, count]) => {
      aggregateStatus[status] = (aggregateStatus[status] || 0) + count;
    });
  });
  const pieData = Object.entries(aggregateStatus).map(([name, value]) => ({ name, value }));
  const barData = analytics.slice(0, 10).map((a) => ({
    name: a.title.length > 15 ? a.title.slice(0, 15) + "…" : a.title,
    views: a.views,
    applications: a.applications,
  }));

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <SEOHead title="Job Analytics — ResumePro" description="View analytics for your job postings." noindex />
      
      <div className="container mx-auto px-8 pt-16 space-y-16 text-left">
         <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 rounded-full border border-blue-600/20 text-blue-600">
               <BarChart3 className="w-4 h-4" />
               <span className="text-[9px] font-black uppercase tracking-widest">Analytics Dashboard</span>
            </div>
            <h1 className="text-2xl md:text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
               Job <br /> <span className="text-blue-600">Analytics.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
               Monitor job performance, candidate applications, and recruitment efficiency across all your active jobs.
            </p>
         </div>

         {loading ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-6">
               <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Analytics Data</p>
            </div>
         ) : analytics.length === 0 ? (
            <Card className="rounded-[4rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-32 text-center space-y-8">
               <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                  <BarChart3 className="w-10 h-10" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Analytics Data</h3>
                  <p className="text-slate-500 font-medium max-w-sm mx-auto">No data available. Post a new job to start gathering analytics.</p>
               </div>
            </Card>
         ) : (
            <>
               <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {[
                     { label: "Total Views", value: totalViews, icon: Eye, color: "text-blue-600", bg: "bg-blue-50" },
                     { label: "Total Applicants", value: totalApps, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
                     { label: "Active Jobs", value: activeJobs, icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-50" },
                     { label: "Average Views/Job", value: analytics.length ? Math.round(totalViews / analytics.length) : 0, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
                  ].map((s, i) => (
                     <Card key={i} className="rounded-[2.5rem] border border-slate-100 bg-white dark:bg-slate-900 shadow-[0_15px_40px_rgba(0,0,0,0.02)] p-10 flex flex-col items-center text-center space-y-4 group">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", s.bg, s.color)}>
                           <s.icon className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                           <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{s.value}</p>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                        </div>
                     </Card>
                  ))}
               </div>

               <div className="grid gap-12 md:grid-cols-2">
                  <Card className="rounded-[3.5rem] border border-slate-100 bg-white dark:bg-slate-900 shadow-[0_25px_60px_rgba(0,0,0,0.03)] p-12 space-y-10">
                     <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Job Performance</h3>
                        <div className="flex gap-2">
                           <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-600" /><span className="text-[9px] font-black uppercase text-slate-400">Views</span></div>
                           <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-300" /><span className="text-[9px] font-black uppercase text-slate-400">Apps</span></div>
                        </div>
                     </div>
                     <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                              <Bar dataKey="views" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={24} />
                              <Bar dataKey="applications" fill="#93c5fd" radius={[6, 6, 0, 0]} barSize={24} />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </Card>

                  <Card className="rounded-[3.5rem] border border-slate-100 bg-white dark:bg-slate-900 shadow-[0_25px_60px_rgba(0,0,0,0.03)] p-12 space-y-10">
                     <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight px-2 text-center md:text-left">Pipeline Status</h3>
                     <div className="h-[300px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={8}>
                                 {pieData.map((entry, index) => (
                                    <Cell key={index} fill={STATUS_COLORS[entry.name] || "#e2e8f0"} stroke="none" />
                                 ))}
                              </Pie>
                              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                           </PieChart>
                        </ResponsiveContainer>
                        <div className="hidden lg:block space-y-4 pr-6">
                           {pieData.map((d, i) => (
                              <div key={i} className="flex items-center gap-3">
                                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[d.name] || '#e2e8f0' }} />
                                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">{d.name} <span className="text-slate-900 dark:text-white ml-2">{d.value}</span></p>
                              </div>
                           ))}
                        </div>
                     </div>
                  </Card>
               </div>

               <div className="space-y-10">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                     <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Job Postings</h2>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Status</p>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                     {analytics.map((job) => (
                        <Card key={job.id} className="rounded-[2.5rem] border border-slate-100 bg-white dark:bg-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.02)] p-8 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-300">
                           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                              <div className="space-y-1">
                                 <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{job.title}</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{job.company_name} <span className="mx-2 opacity-30">•</span> {new Date(job.created_at).toLocaleDateString()}</p>
                              </div>
                              <div className="flex flex-wrap items-center gap-8">
                                 <Badge className={cn("rounded-xl px-4 py-1.5 text-[9px] font-black uppercase tracking-widest", job.status === "active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200 dark:border-slate-800")}>{job.status}</Badge>
                                 <div className="flex items-center gap-10">
                                    <div className="text-center">
                                       <p className="text-lg font-black text-slate-900 dark:text-white">{job.views}</p>
                                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Views</p>
                                    </div>
                                    <div className="text-center">
                                       <p className="text-lg font-black text-slate-900 dark:text-white">{job.applications}</p>
                                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Apps</p>
                                    </div>
                                 </div>
                                 <div className="flex gap-2">
                                    {Object.entries(job.statusBreakdown).map(([status, count]) => (
                                       <div key={status} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] || '#e2e8f0' }} />
                                          <span className="text-[9px] font-bold text-slate-500 uppercase">{count}</span>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                        </Card>
                     ))}
                  </div>
               </div>
            </>
         )}
      </div>
    </div>
  );
}

