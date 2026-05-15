import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, Search, Zap, Clock, CheckCircle2, XCircle, 
  ArrowUpRight, BarChart3, Mail, Star, Sparkles, TrendingUp, LayoutDashboard
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
    <div className="max-w-7xl mx-auto space-y-8 text-left pb-20">
      <SEOHead title="Mission Briefing — ResumePro" description="Operational overview of your career deployment." />
      
      {/* 1. Compact Hero Section */}
      <div className="relative bg-white rounded-3xl p-8 md:p-12 overflow-hidden border border-slate-200 shadow-sm">
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
         
         <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100 text-blue-600">
               <LayoutDashboard className="w-3.5 h-3.5" />
               <span className="text-[10px] font-bold uppercase tracking-wider">Mission Briefing</span>
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-none">
                 Welcome back, <span className="text-blue-600">{user?.user_metadata?.display_name || "Agent"}.</span>
              </h1>
              <p className="text-slate-500 font-medium text-sm max-w-xl">Your professional identity deployment is currently 84% optimized. 2 new missions identified.</p>
            </div>
         </div>
      </div>

      {/* 2. Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: "Applications", value: stats.apps, sub: "+12% from last month", icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
           { label: "Interviews", value: appsByStatus.filter(a => a.status === "interview").length, sub: "Scheduled this week", icon: Star, color: "text-purple-600", bg: "bg-purple-50" },
           { label: "Resume Score", value: "92/100", sub: "ATS Optimization", icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50" },
           { label: "Response Rate", value: `${stats.responseRate}%`, sub: "Above average", icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
         ].map((s, i) => (
           <motion.div 
             key={i} 
             initial={{ opacity: 0, y: 10 }} 
             animate={{ opacity: 1, y: 0 }} 
             transition={{ delay: i * 0.1 }}
             onClick={() => {
                if (s.label === "Applications") navigate("/job-tracker");
                if (s.label === "Interviews") navigate("/job-tracker?status=interview");
                if (s.label === "Resume Score") navigate("/resumes");
                if (s.label === "Response Rate") navigate("/job-tracker");
             }}
           >
              <Card className="rounded-3xl border border-slate-200 bg-white hover:shadow-md transition-all duration-300 p-6 group cursor-pointer">
                 <div className="flex justify-between items-start mb-4">
                    <div className={cn("p-2.5 rounded-xl transition-colors", s.bg, s.color)}>
                       <s.icon className="w-5 h-5" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-2xl font-bold text-slate-900 tracking-tight">{s.value}</p>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{s.label}</p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <p className="text-[10px] font-medium text-slate-500">{s.sub}</p>
                    </div>
                 </div>
              </Card>
           </motion.div>
         ))}
      </div>

      {/* 3. Main Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         
         {/* Left Column: Activity & Jobs */}
         <div className="lg:col-span-8 space-y-8">
            
            {/* Recent Activity */}
            <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <Clock className="w-4 h-4 text-blue-600" />
                     <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
                  </div>
                  <Button onClick={() => navigate("/resumes")} variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">View All</Button>
               </div>
               <div className="p-0">
                  {[
                    { type: "app", title: "Applied to Senior Product Designer", company: "Stripe", time: "2 hours ago", status: "applied" },
                    { type: "interview", title: "Interview scheduled with Engineering Team", company: "Vercel", time: "5 hours ago", status: "interview" },
                    { type: "resume", title: "Resume 'Design_2024' score updated", company: "System", time: "1 day ago", status: "system" }
                  ].map((activity, i) => (
                    <div key={i} onClick={() => navigate("/resumes")} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group cursor-pointer">
                       <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            activity.type === "app" ? "bg-blue-50 text-blue-600" : activity.type === "interview" ? "bg-purple-50 text-purple-600" : "bg-emerald-50 text-emerald-600"
                          )}>
                             {activity.type === "app" ? <Zap className="w-4 h-4" /> : activity.type === "interview" ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </div>
                          <div>
                             <p className="text-[13px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{activity.title}</p>
                             <p className="text-[11px] text-slate-500 font-medium">{activity.company} • {activity.time}</p>
                          </div>
                       </div>
                       <div className={cn(
                         "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest",
                         activity.status === "applied" ? "bg-blue-100 text-blue-700" : activity.status === "interview" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"
                       )}>
                         {activity.status}
                       </div>
                    </div>
                  ))}
               </div>
            </Card>

            {/* Job Recommendations */}
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Job Recommendations
                  </h3>
                  <Link to="/job-board" className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:underline">View Grid</Link>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { role: "Staff UI Engineer", company: "Linear", match: "98%", salary: "$180k - $240k", tags: ["Remote", "React"] },
                    { role: "Product Manager", company: "Notion", match: "94%", salary: "$160k - $210k", tags: ["Hybrid", "Product"] }
                  ].map((job, i) => (
                    <Card key={i} onClick={() => navigate("/job-board")} className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-blue-600/30 transition-all group cursor-pointer shadow-sm">
                       <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                            {job.company.charAt(0)}
                          </div>
                          <div className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-[10px] font-bold">
                             {job.match} Match
                          </div>
                       </div>
                       <div className="space-y-3">
                          <div>
                             <p className="text-sm font-bold text-slate-900 leading-tight">{job.role}</p>
                             <p className="text-[11px] text-slate-500 font-medium">{job.company}</p>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                             {job.tags.map(tag => (
                               <span key={tag} className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[9px] font-bold uppercase rounded-md">{tag}</span>
                             ))}
                          </div>
                       </div>
                    </Card>
                  ))}
               </div>
            </div>
         </div>

         {/* Right Column: Progress & Tasks */}
         <div className="lg:col-span-4 space-y-8">
            
            {/* Resume Progress */}
            <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
               <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Resume Progress</h3>
               </div>
               <div className="space-y-6">
                  <div className="relative pt-1">
                     <div className="flex mb-2 items-center justify-between">
                        <div>
                           <span className="text-[10px] font-bold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-50">
                              Optimization Level
                           </span>
                        </div>
                        <div className="text-right">
                           <span className="text-xs font-bold inline-block text-blue-600">
                              84%
                           </span>
                        </div>
                     </div>
                     <div className="overflow-hidden h-1.5 mb-4 text-xs flex rounded bg-slate-100">
                        <motion.div initial={{ width: 0 }} animate={{ width: "84%" }} transition={{ duration: 1 }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"></motion.div>
                     </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Keyword Density", done: true },
                      { label: "Action Verbs", done: true },
                      { label: "Contact Info Matrix", done: true },
                      { label: "Skills Synchronization", done: false }
                    ].map((step, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-500">{step.label}</span>
                        {step.done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-200" />}
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => navigate("/resumes")} className="w-full h-10 rounded-xl bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all">Optimize Resume</Button>
               </div>
            </Card>

            {/* Outreach Tasks */}
            <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
               <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">Outreach Tasks</h3>
               </div>
               <div className="space-y-4">
                  {[
                    { title: "Follow up with Netflix recruiter", due: "Today", priority: "High" },
                    { title: "Review Stripe interview invite", due: "Tomorrow", priority: "Critical" },
                    { title: "Send letter to Meta hiring lead", due: "2 days", priority: "Medium" }
                  ].map((task, i) => (
                    <div key={i} onClick={() => navigate("/email-outreach")} className="p-3 rounded-2xl border border-slate-50 hover:border-slate-200 transition-all group cursor-pointer">
                       <p className="text-[11px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight mb-1">{task.title}</p>
                       <div className="flex items-center justify-between">
                          <span className="text-[9px] text-slate-400 font-medium">Due {task.due}</span>
                          <span className={cn(
                            "text-[8px] font-black uppercase tracking-widest",
                            task.priority === "Critical" ? "text-rose-500" : task.priority === "High" ? "text-orange-500" : "text-slate-400"
                          )}>{task.priority}</span>
                       </div>
                    </div>
                  ))}
                  <Button onClick={() => navigate("/email-outreach")} variant="outline" className="w-full h-10 rounded-xl border-slate-200 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">View Task Matrix</Button>
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
}
