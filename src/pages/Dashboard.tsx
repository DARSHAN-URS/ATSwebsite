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
import { useLanguage } from "../i18n/LanguageContext";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { user } = useAuth();
  const { isPro } = useSubscription();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const td = t.dashboard;
  const tde = t.dashboardExtra;
  const tj = t.jobTracker;

  const [stats, setStats] = useState({
    resumes: 0,
    letters: 0,
    apps: 0,
    responseRate: 0
  });
  const [appsByStatus, setAppsByStatus] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState("Applied");

  const [activities, setActivities] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [checklist, setChecklist] = useState([
    { label: "Keyword Density", done: false },
    { label: "Action Verbs", done: false },
    { label: "Contact Info Matrix", done: false },
    { label: "Skills Synchronization", done: false }
  ]);
  const [optimizationScore, setOptimizationScore] = useState(0);
  const [outreachTasks, setOutreachTasks] = useState([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoadingContent(true);
      
      // 1. Fetch Stats
      const { count: resumesCount } = await supabase.from("resumes").select("*", { count: 'exact', head: true }).eq("user_id", user.id);
      const { count: lettersCount } = await supabase.from("cover_letters").select("*", { count: 'exact', head: true }).eq("user_id", user.id);
      const { data: apps } = await supabase.from("job_applications").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      
      const appCount = apps?.length || 0;
      const responseCount = apps?.filter(a => ["interview", "offer"].includes(a.status)).length || 0;
      
      setStats({
        resumes: resumesCount || 0,
        letters: lettersCount || 0,
        apps: appCount,
        responseRate: appCount > 0 ? Math.round((responseCount / appCount) * 100) : 0
      });
      setAppsByStatus(apps || []);

      // Fetch latest resume data for checklist
      const { data: latestResumeList } = await supabase.from("resumes").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(1);
      const latestResume = latestResumeList && latestResumeList.length > 0 ? latestResumeList[0] : null;

      let hasSkills = false;
      let hasPersonalInfo = false;
      let hasWorkExperience = false;
      let hasActionVerbs = false;

      if (latestResume && latestResume.resume_data) {
        try {
          const rd = latestResume.resume_data;
          hasSkills = Array.isArray(rd.skills) && rd.skills.length > 0;
          hasPersonalInfo = !!(rd.personalInfo?.email || rd.personalInfo?.phone || rd.personalInfo?.fullName);
          hasWorkExperience = Array.isArray(rd.workExperience) && rd.workExperience.length > 0;
          hasActionVerbs = hasWorkExperience && rd.workExperience.some((w) => w.description && w.description.length > 10);
        } catch (e) {
          console.error("Error parsing resume data", e);
        }
      }

      const steps = [
        { label: "Keyword Density", done: hasWorkExperience },
        { label: "Action Verbs", done: hasActionVerbs },
        { label: "Contact Info Matrix", done: hasPersonalInfo },
        { label: "Skills Synchronization", done: hasSkills }
      ];
      setChecklist(steps);
      const doneCount = steps.filter(s => s.done).length;
      setOptimizationScore(Math.round((doneCount / steps.length) * 100));

      const tasks = [];
      if (apps && apps.length > 0) {
        apps.forEach((app) => {
          if (app.status === "applied") {
            tasks.push({
              title: `Follow up on application for ${app.position} at ${app.company}`,
              due: "in 3 days",
              priority: "High"
            });
          } else if (app.status === "screening") {
            tasks.push({
              title: `Prepare questions for ${app.company} screening call`,
              due: "Tomorrow",
              priority: "Critical"
            });
          } else if (app.status === "interview") {
            tasks.push({
              title: `Complete mock interview prep for ${app.company}`,
              due: "Today",
              priority: "Critical"
            });
          } else if (app.status === "offer") {
            tasks.push({
              title: `Review compensation & terms for ${app.company} offer`,
              due: "in 2 days",
              priority: "Medium"
            });
          }
        });
      }
      
      setOutreachTasks(tasks.slice(0, 3));

      // 2. Fetch Recent Activity
      const activityList = [];
      if (apps && apps.length > 0) {
        activityList.push(...apps.slice(0, 3).map(a => ({
          type: "app",
          title: `Applied to ${a.position}`,
          company: a.company,
          time: new Date(a.created_at).toLocaleDateString(),
          status: a.status
        })));
      }
      
      const { data: recentResumes } = await supabase.from("resumes").select("title, updated_at").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(2);
      if (recentResumes) {
        activityList.push(...recentResumes.map(r => ({
          type: "resume",
          title: `Resume '${r.title}' updated`,
          company: "System",
          time: new Date(r.updated_at).toLocaleDateString(),
          status: "system"
        })));
      }
      setActivities(activityList.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5));

      // 3. Fetch Recommendations (from job_posts)
      const { data: jobPosts } = await supabase.from("job_posts").select("*").eq("status", "active").limit(2);
      if (jobPosts) {
        let resumeSkills: string[] = [];
        let resumeTitle = "";
        if (latestResume && latestResume.resume_data) {
          try {
            const rd: any = latestResume.resume_data;
            resumeSkills = Array.isArray(rd.skills) 
              ? rd.skills.map((s: any) => (typeof s === 'string' ? s : s?.name || "").toLowerCase().trim()).filter(Boolean)
              : [];
            resumeTitle = (rd.personalInfo?.title || latestResume.title || "").toLowerCase();
          } catch (e) {
            console.error("Error parsing resume details for match score", e);
          }
        }

        setRecommendations(jobPosts.map(j => {
          let score = 70;
          const roleLower = j.title.toLowerCase();
          const reqsLower = ((j.requirements || "") + " " + (j.description || "")).toLowerCase();
          
          if (resumeTitle) {
            if (roleLower.includes(resumeTitle) || resumeTitle.includes(roleLower)) {
              score += 15;
            }
          }
          let skillMatches = 0;
          resumeSkills.forEach((skill: string) => {
            if (roleLower.includes(skill) || reqsLower.includes(skill)) {
              skillMatches++;
            }
          });
          score += Math.min(15, skillMatches * 3);
          
          return {
            role: j.title,
            company: j.company_name,
            match: `${Math.min(99, score)}%`,
            salary: j.salary_min ? `₹${j.salary_min} - ₹${j.salary_max}` : "Competitive",
            tags: [j.job_type, j.location || "Remote"].filter(Boolean)
          };
        }));
      }

      setLoadingContent(false);
    };
    fetchData();
  }, [user]);

  const statuses = [
    { label: tj.applied, color: "bg-blue-100 text-blue-600", count: appsByStatus.filter(a => a.status === "applied").length },
    { label: tj.screening, color: "bg-amber-100 text-amber-600", count: appsByStatus.filter(a => a.status === "screening").length },
    { label: tj.interview, color: "bg-purple-100 text-purple-600", count: appsByStatus.filter(a => a.status === "interview").length },
    { label: tj.offer, color: "bg-emerald-100 text-emerald-600", count: appsByStatus.filter(a => a.status === "offer").length },
    { label: tj.rejected, color: "bg-rose-100 text-rose-600", count: appsByStatus.filter(a => a.status === "rejected").length },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-left pb-20">
      <SEOHead title={`${td.missionBriefing} — ResumePro`} description={td.identityOptimized} />
      
      {/* 1. Compact Hero Section */}
      <div className="relative bg-white rounded-3xl p-8 md:p-12 overflow-hidden border border-slate-200 shadow-sm">
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
         
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="space-y-6 flex-1">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100 text-blue-600">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{td.missionBriefing}</span>
               </div>
               <div className="space-y-1">
                 <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[0.9]">
                    {td.welcomeAgent} <br />
                    <span className="text-blue-600">{user?.user_metadata?.full_name || user?.user_metadata?.name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || "Agent"}.</span>
                 </h1>
                 <p className="text-slate-500 font-medium text-lg max-w-md pt-2">{td.identityOptimized}</p>
               </div>
               <div className="flex gap-4">
                  <Button onClick={() => navigate("/resumes")} className="h-12 px-8 bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-blue-600 transition-all">
                    Resume Studio
                  </Button>
               </div>
            </div>


         </div>
      </div>

      {/* 2. Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: td.statsApplications, value: stats.apps, sub: "Active pipeline tracking", icon: Zap, color: "text-blue-600", bg: "bg-blue-50" },
           { label: td.statsInterviews, value: appsByStatus.filter(a => a.status === "interview").length, sub: "Scheduled this week", icon: Star, color: "text-purple-600", bg: "bg-purple-50" },
           { label: td.statsResumeScore, value: optimizationScore === 0 ? "0/100" : `${optimizationScore}/100`, sub: "ATS Optimization", icon: FileText, color: "text-emerald-600", bg: "bg-emerald-50" },
           { label: td.statsResponseRate, value: `${stats.responseRate}%`, sub: "Current operational rate", icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
         ].map((s, i) => (
           <motion.div 
             key={i} 
             initial={{ opacity: 0, y: 10 }} 
             animate={{ opacity: 1, y: 0 }} 
             transition={{ delay: i * 0.1 }}
             onClick={() => {
                if (s.label === td.statsApplications) navigate("/job-tracker");
                if (s.label === td.statsInterviews) navigate("/job-tracker?status=interview");
                if (s.label === td.statsResumeScore) navigate("/resumes");
                if (s.label === td.statsResponseRate) navigate("/job-tracker");
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
                     <h3 className="text-sm font-bold text-slate-900">{td.recentActivity}</h3>
                  </div>
                  <Button onClick={() => navigate("/resumes")} variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">{td.viewAll}</Button>
               </div>
               <div className="p-0">
                  {loadingContent ? (
                    <div className="p-12 text-center text-slate-400 font-medium">Synchronizing activity...</div>
                  ) : activities.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 font-medium italic">No recent operational activity detected.</div>
                  ) : (
                    activities.map((activity, i) => (
                      <div key={i} onClick={() => navigate(activity.type === "app" ? "/job-tracker" : "/resumes")} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 group cursor-pointer">
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
                    ))
                  )}
               </div>
            </Card>

            {/* Job Recommendations */}
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" /> {td.jobRecommendations}
                  </h3>
                  <Link to="/job-board" className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:underline">{td.viewGrid}</Link>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loadingContent ? (
                    [1,2].map(i => <div key={i} className="h-32 rounded-2xl bg-white animate-pulse border border-slate-100" />)
                  ) : recommendations.length === 0 ? (
                    <div className="col-span-2 py-12 text-center text-slate-400 font-medium italic bg-white rounded-2xl border border-dashed">Initialize job search to see recommendations.</div>
                  ) : (
                    recommendations.map((job, i) => (
                      <Card key={i} onClick={() => navigate("/job-board")} className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-blue-600/30 transition-all group cursor-pointer shadow-sm">
                         <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                              {job.company.charAt(0)}
                            </div>
                            <div className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-[10px] font-bold">
                               {job.match} {td.match}
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
                    ))
                  )}
               </div>
            </div>
         </div>

         {/* Right Column: Progress & Tasks */}
         <div className="lg:col-span-4 space-y-8">
            
            {/* Resume Progress */}
            <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                   <FileText className="w-4 h-4 text-blue-600" />
                   <h3 className="text-sm font-bold text-slate-900">{td.resumeProgress}</h3>
                </div>
                <div className="space-y-6">
                   <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                         <div>
                            <span className="text-[10px] font-bold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-50">
                               {td.optimizationLevel}
                            </span>
                         </div>
                         <div className="text-right">
                            <span className="text-xs font-bold inline-block text-blue-600">
                               {optimizationScore}%
                            </span>
                         </div>
                      </div>
                      <div className="overflow-hidden h-1.5 mb-4 text-xs flex rounded bg-slate-100">
                         <motion.div initial={{ width: 0 }} animate={{ width: `${optimizationScore}%` }} transition={{ duration: 1 }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"></motion.div>
                      </div>
                   </div>
                   <div className="space-y-3">
                     {checklist.map((step, i) => (
                       <div key={i} className="flex items-center justify-between">
                         <span className="text-[11px] font-medium text-slate-500">{step.label}</span>
                         {step.done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-200" />}
                       </div>
                     ))}
                   </div>
                   <Button onClick={() => navigate("/resumes")} className="w-full h-10 rounded-xl bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all">{t.resumes.gradeResume}</Button>
                </div>
             </Card>

             {/* Outreach Tasks */}
             <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-3">
                   <Mail className="w-4 h-4 text-blue-600" />
                   <h3 className="text-sm font-bold text-slate-900">{td.outreachTasks}</h3>
                </div>
                <div className="space-y-4">
                   {outreachTasks.length === 0 ? (
                      <div className="text-center text-slate-400 font-medium py-8 text-xs italic">
                         No active outreach tasks detected.
                      </div>
                    ) : (
                      outreachTasks.map((task, i) => (
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
                   )))}
                   <Button onClick={() => navigate("/email-outreach")} variant="outline" className="w-full h-10 rounded-xl border-slate-200 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">{td.viewTaskMatrix}</Button>
                </div>
             </Card>
         </div>
      </div>
    </div>
  );
}
