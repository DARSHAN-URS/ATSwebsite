import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, Search, Zap, Clock, CheckCircle2, XCircle, 
  ArrowUpRight, BarChart3, Mail, Star, Sparkles, TrendingUp
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import SEOHead from "@/components/SEOHead";

export default function Dashboard() {
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    resumes: 0,
    letters: 0,
    apps: 0,
    responseRate: 0
  });
  const [appsByStatus, setAppsByStatus] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState("Applied");

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const { count: resumes } = await supabase.from("resumes").select("*", { count: 'exact', head: true }).eq("user_id", user.id);
      const { count: letters } = await supabase.from("cover_letters").select("*", { count: 'exact', head: true }).eq("user_id", user.id);
      const { data: apps } = await supabase.from("job_applications").select("status").eq("user_id", user.id);
      
      const appCount = apps?.length || 0;
      const responseCount = apps?.filter(a => ["interview", "offer"].includes(a.status)).length || 0;
      
      setStats({
        resumes: resumes || 0,
        letters: letters || 0,
        apps: appCount,
        responseRate: appCount > 0 ? Math.round((responseCount / appCount) * 100) : 0
      });
      setAppsByStatus(apps || []);
    };
    fetchStats();
  }, [user]);

  const statuses = [
    { label: "Applied", color: "bg-blue-100 text-blue-600", count: appsByStatus.filter(a => a.status === "applied").length },
    { label: "Screening", color: "bg-amber-100 text-amber-600", count: appsByStatus.filter(a => a.status === "screening").length },
    { label: "Interview", color: "bg-purple-100 text-purple-600", count: appsByStatus.filter(a => a.status === "interview").length },
    { label: "Offer", color: "bg-emerald-100 text-emerald-600", count: appsByStatus.filter(a => a.status === "offer").length },
    { label: "Rejected", color: "bg-rose-100 text-rose-600", count: appsByStatus.filter(a => a.status === "rejected").length },
  ];

  return (
    <div className="space-y-16 pb-20">
      <SEOHead title="Mission Briefing — ResumePro" description="Operational overview of your career deployment." />
      
      {/* 1. Dashboard Stats Section */}
      <section className="space-y-8">
        <div className="space-y-2">
           <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Dashboard</h1>
           <p className="text-slate-500 font-medium">Welcome back! Here's your job search overview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {[
             { label: "Resumes", value: stats.resumes, sub: "Created resumes", icon: FileText },
             { label: "Cover Letters", value: stats.letters, sub: "Generated letters", icon: Mail },
             { label: "Applications", value: stats.apps, sub: "Tracked applications", icon: Zap },
             { label: "Response Rate", value: `${stats.responseRate}%`, sub: "From tracked apps", icon: TrendingUp },
           ].map((s, i) => (
             <motion.div 
               key={i} 
               initial={{ opacity: 0, y: 20 }} 
               animate={{ opacity: 1, y: 0 }} 
               transition={{ delay: i * 0.1 }}
             >
                <Card className="rounded-[3rem] border-none bg-slate-50/50 hover:bg-white transition-all duration-500 p-8 shadow-sm hover:shadow-2xl hover:-translate-y-2 group">
                   <div className="flex justify-between items-start mb-6">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                      <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                         <s.icon className="w-5 h-5" />
                      </div>
                   </div>
                   <div className="space-y-1">
                      <p className="text-4xl font-black text-slate-900 tracking-tight">{s.value}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.sub}</p>
                   </div>
                </Card>
             </motion.div>
           ))}
        </div>
      </section>

      {/* 2. Application Status & Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         {/* Application Status Breakdown */}
         <div className="lg:col-span-5">
            <Card className="rounded-[4rem] border-none bg-slate-50/50 p-12 h-full space-y-10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-24 h-24 text-slate-900" />
               </div>
               <div className="space-y-2">
                  <div className="flex items-center gap-3">
                     <Clock className="w-4 h-4 text-blue-600" />
                     <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Status Metrics</h3>
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Application Status</h2>
                  <p className="text-slate-500 text-xs font-medium">Breakdown by current status</p>
               </div>

               {appsByStatus.length === 0 ? (
                 <div className="py-20 text-center space-y-4">
                    <p className="text-slate-400 font-bold text-sm">No applications yet. Start tracking to see stats.</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">No activity to display yet.</p>
                 </div>
               ) : (
                 <div className="space-y-6">
                    {statuses.map((s, i) => (
                      <div key={i} className="space-y-2">
                         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-500">{s.label}</span>
                            <span className="text-slate-900">{s.count}</span>
                         </div>
                         <div className="h-2 w-full bg-white rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: stats.apps > 0 ? `${(s.count / stats.apps) * 100}%` : 0 }} 
                              className={cn("h-full rounded-full", s.label === "Applied" ? "bg-blue-600" : s.label === "Screening" ? "bg-amber-500" : s.label === "Interview" ? "bg-purple-600" : s.label === "Offer" ? "bg-emerald-500" : "bg-rose-500")} 
                            />
                         </div>
                      </div>
                    ))}
                 </div>
               )}
            </Card>
         </div>

         {/* Job Tracker Section */}
         <div className="lg:col-span-7">
            <Card className="rounded-[4rem] border-none bg-slate-50/50 p-12 h-full space-y-10 group">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                     <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Job Tracker</h2>
                     <p className="text-slate-500 text-xs font-medium">Track your job applications in one place</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {statuses.map((s) => (
                       <button 
                         key={s.label}
                         onClick={() => setActiveFilter(s.label)}
                         className={cn(
                           "flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                           activeFilter === s.label ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-400 hover:bg-slate-100"
                         )}
                       >
                         {s.label} <span className={cn("px-2 py-0.5 rounded-full text-[8px]", activeFilter === s.label ? "bg-white/20 text-white" : s.color)}>{s.count}</span>
                       </button>
                     ))}
                  </div>
               </div>

               <div className="min-h-[300px] rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center p-12 text-center space-y-6">
                  <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-slate-200 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all">
                     <Zap className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                     <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No applications yet</h3>
                     <p className="text-slate-400 text-sm font-medium">Save & track jobs from the Find Jobs page</p>
                  </div>
               </div>

               {/* Find Jobs Promo Card */}
               <Card className="rounded-[3rem] border-none bg-white p-10 shadow-xl shadow-slate-900/5 group/find overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                     <div className="space-y-4 text-center md:text-left">
                        <div className="flex items-center gap-3 justify-center md:justify-start">
                           <Search className="w-5 h-5 text-blue-600" />
                           <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Find Jobs</h3>
                        </div>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-md">
                           Discover jobs matched to your resume using AI. Get match scores, save listings, and track your applications — all in one place.
                        </p>
                     </div>
                     <Button asChild size="lg" className="h-16 px-10 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] gap-4 shadow-2xl shadow-slate-900/20 hover:bg-blue-600 transition-all">
                        <Link to="/jobs">Explore Grid <ArrowUpRight className="w-4 h-4" /></Link>
                     </Button>
                  </div>
               </Card>
            </Card>
         </div>
      </div>
    </div>
  );
}
