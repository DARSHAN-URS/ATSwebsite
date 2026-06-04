import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Briefcase, 
  Users, 
  Eye, 
  Plus, 
  TrendingUp, 
  ChevronRight, 
  Star, 
  Sparkles, 
  Building2, 
  Loader2, 
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { cn } from "@/lib/utils";

interface JobPost {
  id: string;
  title: string;
  company_name: string;
  status: string;
  created_at: string;
  viewCount: number;
  appCount: number;
}

interface RecentCandidate {
  id: string;
  display_name: string;
  job_title: string;
  job_post_id: string;
  status: string;
  is_shortlisted: boolean;
  created_at: string;
}

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [candidates, setCandidates] = useState<RecentCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [recruiterName, setRecruiterName] = useState("Operations Lead");

  useEffect(() => {
    if (!user) return;
    
    // Set display name
    if (user.user_metadata?.display_name) {
      setRecruiterName(user.user_metadata.display_name);
    } else if (user.email) {
      setRecruiterName(user.email.split("@")[0]);
    }

    (async () => {
      setLoading(true);
      try {
        // 1. Fetch Job Posts
        const { data: jobData } = await supabase
          .from("job_posts")
          .select("*")
          .eq("recruiter_id", user.id)
          .order("created_at", { ascending: false });

        const jobList = (jobData as any[]) ?? [];
        
        let viewCounts = new Map<string, number>();
        let appCounts = new Map<string, number>();
        
        if (jobList.length > 0) {
          const jobIds = jobList.map((j) => j.id);

          const [{ data: views }, { data: apps }] = await Promise.all([
            supabase.from("job_post_views").select("job_post_id").in("job_post_id", jobIds),
            supabase.from("job_post_applications" as any).select("job_post_id").in("job_post_id", jobIds),
          ]);

          (views || []).forEach((v: any) => viewCounts.set(v.job_post_id, (viewCounts.get(v.job_post_id) || 0) + 1));
          ((apps || []) as any[]).forEach((a: any) => appCounts.set(a.job_post_id, (appCounts.get(a.job_post_id) || 0) + 1));
        }

        const formattedJobs: JobPost[] = jobList.map((j) => ({
          id: j.id,
          title: j.title,
          company_name: j.company_name,
          status: j.status,
          created_at: j.created_at,
          viewCount: viewCounts.get(j.id) || 0,
          appCount: appCounts.get(j.id) || 0,
        }));

        setJobs(formattedJobs);

        // 2. Fetch Recent Candidates across recruiter's jobs
        if (jobList.length > 0) {
          const jobIds = jobList.map((j) => j.id);
          const jobMap = new Map(jobList.map((j) => [j.id, j.title]));

          const { data: appData } = await supabase
            .from("job_post_applications" as any)
            .select("*")
            .in("job_post_id", jobIds)
            .order("created_at", { ascending: false })
            .limit(5);

          const appList = (appData as any[]) ?? [];

          if (appList.length > 0) {
            const applicantIds = [...new Set(appList.map((a) => a.applicant_id))];
            const { data: profiles } = await supabase
              .from("profiles")
              .select("display_name, user_id")
              .in("user_id", applicantIds);

            const profileMap = new Map((profiles || []).map((p) => [p.user_id, p.display_name || "Unknown"]));

            const formattedCandidates: RecentCandidate[] = appList.map((a) => ({
              id: a.id,
              display_name: profileMap.get(a.applicant_id) || "Unknown Candidate",
              job_title: jobMap.get(a.job_post_id) || "Unknown Role",
              job_post_id: a.job_post_id,
              status: a.status,
              is_shortlisted: a.is_shortlisted,
              created_at: a.created_at,
            }));

            setCandidates(formattedCandidates);
          }
        }
      } catch (err) {
        console.error("Error fetching dashboard telemetry:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const toggleShortlist = async (e: React.MouseEvent, candidate: RecentCandidate) => {
    e.stopPropagation();
    const newVal = !candidate.is_shortlisted;
    await supabase.from("job_post_applications" as any).update({ is_shortlisted: newVal } as any).eq("id", candidate.id);
    setCandidates((prev) => prev.map((c) => c.id === candidate.id ? { ...c, is_shortlisted: newVal } : c));
  };

  // Aggregated Telemetry Calculations
  const totalViews = jobs.reduce((s, j) => s + j.viewCount, 0);
  const totalApps = jobs.reduce((s, j) => s + j.appCount, 0);
  const activeMissions = jobs.filter((j) => j.status === "active").length;
  const shortlistedCount = candidates.filter((c) => c.is_shortlisted).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <SEOHead title="Recruiter Dashboard — ResumePro" description="Manage your recruiting activities." noindex />
      
      <div className="container mx-auto px-8 pt-16 space-y-12 text-left">
        
        {/* Top Header Greetings */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 rounded-full border border-blue-600/20 text-blue-600">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest">Dashboard</span>
            </div>
            <h1 className="text-2xl md:text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
              Dashboard.
            </h1>
            <p className="text-xl text-slate-500 font-medium max-w-2xl leading-relaxed">
              Welcome back, <span className="text-slate-900 dark:text-white font-black">{recruiterName}</span>. Here is an overview of your recruiting activities.
            </p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => navigate("/recruiter/jobs")} className="h-16 px-8 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-105 transition-all">
              Manage Jobs
            </Button>
            <Button onClick={() => navigate("/recruiter/jobs")} className="h-16 px-8 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-105 transition-all gap-2">
              <Plus className="w-4 h-4" /> Post a Job
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-6">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Data</p>
          </div>
        ) : (
          <>
            {/* Telemetry Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { label: "Active Jobs", value: activeMissions, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Total Applications", value: totalApps, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
                { label: "Total Views", value: totalViews, icon: Eye, color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Shortlist Rate", value: totalApps ? `${Math.round((shortlistedCount / totalApps) * 100)}%` : "0%", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
              ].map((stat, i) => (
                <Card key={i} className="rounded-[2.5rem] border border-slate-100 bg-white dark:bg-slate-900 shadow-[0_15px_40px_rgba(0,0,0,0.02)] p-10 flex items-center gap-8 group">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6", stat.bg, stat.color)}>
                    <stat.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                    <p className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Quick Actions & Job Deployments */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Left Column: Recent Candidates */}
              <div className="lg:col-span-8 space-y-10">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Recent Candidates</h3>
                  <Button variant="ghost" onClick={() => navigate("/recruiter/candidates")} className="p-0 hover:bg-transparent text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-1">
                    View All <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </div>

                {candidates.length === 0 ? (
                  <Card className="rounded-[3rem] border border-slate-100 bg-white dark:bg-slate-900 p-12 text-center py-20">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No candidates have applied to your jobs yet.</p>
                  </Card>
                ) : (
                  <Card className="rounded-[3rem] border border-slate-100 bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                          <TableRow className="border-none">
                            <TableHead className="h-16 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Candidate Name</TableHead>
                            <TableHead className="h-16 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Job Title</TableHead>
                            <TableHead className="h-16 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</TableHead>
                            <TableHead className="h-16 px-8 w-20"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {candidates.map((c) => (
                            <TableRow 
                              key={c.id} 
                              className="border-b border-slate-100 cursor-pointer hover:bg-blue-50/30 transition-colors"
                              onClick={() => navigate(`/recruiter/jobs/${c.job_post_id}/applicants`)}
                            >
                              <TableCell className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md">
                                    {c.display_name[0]}
                                  </div>
                                  <div>
                                    <p className="text-md font-black text-slate-900 dark:text-white tracking-tight">{c.display_name}</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Applied {new Date(c.created_at).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-8 py-6">
                                <span className="font-bold text-slate-700 dark:text-slate-300">{c.job_title}</span>
                              </TableCell>
                              <TableCell className="px-8 py-6">
                                <Badge className={cn("rounded-xl px-4 py-1.5 text-[8px] font-black uppercase tracking-widest", c.status === "pending" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100")}>
                                  {c.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-8 py-6 text-right">
                                <button 
                                  onClick={(e) => toggleShortlist(e, c)} 
                                  className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", c.is_shortlisted ? "bg-amber-100 text-amber-500 scale-105" : "text-slate-300 hover:bg-amber-50")}
                                >
                                  <Star className={cn("h-4 w-4", c.is_shortlisted ? "fill-current" : "")} />
                                </button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                )}
              </div>

              {/* Right Column: Quick Actions */}
              <div className="lg:col-span-4 space-y-10">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Quick Actions</h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {[
                    { label: "Analytics", desc: "View your hiring performance.", path: "/recruiter/analytics", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Company Profile", desc: "Update your company information.", path: "/recruiter/company", icon: Building2, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Candidate Database", desc: "Search and view all candidates.", path: "/recruiter/candidates", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
                  ].map((cmd, i) => (
                    <Card 
                      key={i} 
                      onClick={() => navigate(cmd.path)}
                      className="rounded-[2.5rem] border border-slate-100 bg-white dark:bg-slate-900 p-8 hover:shadow-[0_15px_40px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex items-start gap-6"
                    >
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", cmd.bg, cmd.color)}>
                        <cmd.icon className="w-6 h-6" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <h4 className="font-black text-slate-900 dark:text-white tracking-tight leading-tight group-hover:text-blue-600 transition-colors uppercase text-sm">{cmd.label}</h4>
                        <p className="text-xs text-slate-400 font-bold">{cmd.desc}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all self-center" />
                    </Card>
                  ))}
                </div>
              </div>

            </div>

            {/* Active Jobs Summary */}
            <div className="space-y-10 pt-10">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Active Job Posts</h3>
                <Button variant="ghost" onClick={() => navigate("/recruiter/jobs")} className="p-0 hover:bg-transparent text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-1">
                  View All Jobs <ArrowUpRight className="w-4 h-4" />
                </Button>
              </div>

              {jobs.length === 0 ? (
                <Card className="rounded-[3rem] border border-slate-100 bg-white dark:bg-slate-900 p-12 text-center py-20">
                  <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No active jobs. Create a job post to start receiving applications.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {jobs.slice(0, 3).map((job) => (
                    <Card 
                      key={job.id} 
                      onClick={() => navigate(`/recruiter/jobs/${job.id}/applicants`)}
                      className="rounded-[3rem] border border-slate-100 bg-white dark:bg-slate-900 p-8 shadow-[0_10px_35px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] hover:-translate-y-1 cursor-pointer transition-all duration-500 group relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start gap-4 mb-6">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Briefcase className="w-6 h-6" /></div>
                        <Badge className={cn("rounded-xl px-3 py-1 text-[8px] font-black uppercase tracking-widest", job.status === "active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500 border border-slate-200 dark:border-slate-800")}>{job.status}</Badge>
                      </div>
                      <div className="space-y-2 mb-6">
                        <h4 className="font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 transition-colors uppercase text-lg leading-tight line-clamp-1">{job.title}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{job.company_name}</p>
                      </div>
                      <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-1 text-slate-400">
                          <Eye className="w-4 h-4" />
                          <span className="text-xs font-black text-slate-700 dark:text-slate-300">{job.viewCount} views</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-600">
                          <Users className="w-4 h-4" />
                          <span className="text-xs font-black">{job.appCount} apps</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

          </>
        )}
      </div>
    </div>
  );
}
