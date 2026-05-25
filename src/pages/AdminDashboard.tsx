import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, FileText, ShieldAlert, Loader2, Search, MoreHorizontal, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import SEOHead from "@/components/SEOHead";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";

export default function AdminDashboard() {
  const { t } = useLanguage();
  const ta = t.adminDashboard;
  
  const [stats, setStats] = useState({ users: 0, jobs: 0, resumes: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uStats, jStats, rStats, uList, jList] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("job_posts").select("id", { count: "exact", head: true }),
        supabase.from("resumes").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select(`*, user_roles(role)`).limit(50),
        supabase.from("job_posts").select("*").order("created_at", { ascending: false }).limit(50),
      ]);

      setStats({
        users: uStats.count || 0,
        jobs: jStats.count || 0,
        resumes: rStats.count || 0,
      });
      setUsers(uList.data || []);
      setJobs(jList.data || []);
    } catch (error) {
      toast.error(ta.failedFetch);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole as any })
      .eq("user_id", userId);
    
    if (error) toast.error(ta.failedUpdateRole);
    else {
      toast.success(`${ta.roleUpdated} ${newRole}`);
      fetchData();
    }
  };

  const handleUpdateJobStatus = async (jobId: string, status: string) => {
    const { error } = await supabase
      .from("job_posts")
      .update({ status })
      .eq("id", jobId);
    
    if (error) toast.error(ta.failedUpdateJob);
    else {
      toast.success(`${ta.jobStatusUpdated} ${status}`);
      fetchData();
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans pb-20">
      <SEOHead title={ta.seoTitle} description={ta.seoDesc} noindex />
      
      <div className="max-w-7xl mx-auto px-8 pt-16 space-y-16">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-12">
           <div className="space-y-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                    <ShieldAlert className="w-5 h-5" />
                 </div>
                 <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">{ta.operationalOversight}</span>
              </motion.div>
              <h1 className="text-2xl md:text-4xl md:text-6xl md:text-[8rem] font-black text-slate-900 dark:text-white tracking-tighter leading-[0.8] uppercase">
                 {ta.control} <br /> <span className="text-blue-600">{ta.center}</span>
              </h1>
              <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
                 {ta.subtitle}
              </p>
           </div>

           <div className="hidden lg:block pb-4">
              <div className="w-px h-32 bg-slate-100 dark:bg-slate-800" />
           </div>

           <div className="space-y-4 text-right">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-emerald-600 dark:text-emerald-400">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-bold uppercase tracking-widest">{ta.coreSystemsActive}</span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ta.syncLatency}</p>
           </div>
        </div>

        {/* Real-time Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: ta.totalEntities, value: stats.users, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
            { title: ta.activeMissions, value: stats.jobs, icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-50" },
            { title: ta.architectureSyncs, value: stats.resumes, icon: FileText, color: "text-purple-600", bg: "bg-purple-50" }
          ].map((stat, i) => (
            <Card key={i} className="rounded-[3rem] border-none bg-slate-50 dark:bg-slate-900 p-10 flex items-center justify-between group hover:bg-white dark:hover:bg-slate-800 transition-all hover:shadow-2xl">
               <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.title}</p>
                  <p className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value.toLocaleString()}</p>
               </div>
               <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-6", stat.bg, stat.color)}>
                  <stat.icon className="w-8 h-8" />
               </div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="users" className="space-y-12">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <TabsList className="bg-transparent h-auto p-0 gap-8">
              {["users", "jobs", "logs"].map(val => (
                <TabsTrigger 
                  key={val} 
                  value={val} 
                  className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-0 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                >
                  {val === "users" ? ta.tabEntityManagement : val === "jobs" ? ta.tabMissionModeration : ta.tabSystemDiagnostics}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex gap-4">
               <div className="relative group hidden md:block">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input 
                    placeholder={ta.scanIdentities} 
                    className="h-12 pl-11 w-64 rounded-xl bg-slate-50 dark:bg-slate-800 border-none font-bold text-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <Button variant="outline" className="h-12 w-12 rounded-xl border-slate-100 dark:border-slate-800"><MoreHorizontal className="h-4 w-4" /></Button>
            </div>
          </div>

          <TabsContent value="users" className="m-0">
             <Card className="rounded-[4rem] border-none bg-white dark:bg-slate-900 shadow-[0_20px_80px_rgba(0,0,0,0.03)] overflow-hidden">
                <Table>
                   <TableHeader className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-100 dark:border-slate-800">
                      <TableRow className="border-none hover:bg-transparent">
                        <TableHead className="h-20 px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">{ta.idMatrix}</TableHead>
                        <TableHead className="h-20 px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">{ta.opRole}</TableHead>
                        <TableHead className="h-20 px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">{ta.deploymentDate}</TableHead>
                        <TableHead className="h-20 px-10 text-right"></TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {users.filter(u => (u.display_name || "").toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                        <TableRow key={user.id} className="border-b border-slate-50 dark:border-white/5 hover:bg-blue-50/30 dark:hover:bg-blue-600/5 transition-colors group">
                           <TableCell className="px-10 py-8">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-600/20">{user.display_name?.[0] || "?"}</div>
                                 <div>
                                    <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{user.display_name || ta.unknownIdentity}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{user.user_id.substring(0, 18)}...</p>
                                 </div>
                              </div>
                           </TableCell>
                           <TableCell className="px-10 py-8">
                              <Badge className="rounded-xl px-4 py-1.5 bg-slate-900 dark:bg-white/10 text-white border-none text-[9px] font-black uppercase tracking-widest">
                                 {user.user_roles?.[0]?.role || ta.unassigned}
                              </Badge>
                           </TableCell>
                           <TableCell className="px-10 py-8 text-slate-500 font-bold text-sm">
                              {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                           </TableCell>
                           <TableCell className="px-10 py-8 text-right">
                              <DropdownMenu>
                                 <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><MoreHorizontal className="h-5 w-5" /></Button>
                                 </DropdownMenuTrigger>
                                 <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-3xl p-2 min-w-[200px]">
                                    <DropdownMenuItem onClick={() => handleUpdateRole(user.user_id, "admin")} className="rounded-xl p-3 font-black text-[10px] uppercase tracking-widest">{ta.escalateAdmin}</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdateRole(user.user_id, "recruiter")} className="rounded-xl p-3 font-black text-[10px] uppercase tracking-widest">{ta.assignRecruiter}</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdateRole(user.user_id, "job_seeker")} className="rounded-xl p-3 font-black text-[10px] uppercase tracking-widest">{ta.assignJobSeeker}</DropdownMenuItem>
                                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                                    <DropdownMenuItem className="rounded-xl p-3 font-black text-[10px] uppercase tracking-widest text-rose-600">{ta.terminateEntity}</DropdownMenuItem>
                                 </DropdownMenuContent>
                              </DropdownMenu>
                           </TableCell>
                        </TableRow>
                      ))}
                   </TableBody>
                </Table>
             </Card>
          </TabsContent>

          <TabsContent value="jobs" className="m-0">
             <div className="grid grid-cols-1 gap-8">
                {jobs.map((job) => (
                  <Card key={job.id} className="rounded-[3rem] border-none bg-white dark:bg-slate-900 shadow-[0_20px_80px_rgba(0,0,0,0.03)] p-12 hover:shadow-2xl transition-all group">
                     <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
                        <div className="space-y-4">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600"><Briefcase className="w-6 h-6" /></div>
                              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">{job.title}</h3>
                           </div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] pl-16">{job.company_name} <span className="mx-3 opacity-20">|</span> Status: {job.status}</p>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                           <Button 
                             onClick={() => handleUpdateJobStatus(job.id, "active")}
                             className="flex-1 md:flex-none h-16 px-8 rounded-2xl bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-emerald-500/20"
                           >
                              <CheckCircle className="h-4 w-4" /> {ta.approve}
                           </Button>
                           <Button 
                             onClick={() => handleUpdateJobStatus(job.id, "suspended")}
                             className="flex-1 md:flex-none h-16 px-8 rounded-2xl bg-rose-500 text-white font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-rose-500/20"
                           >
                              <XCircle className="h-4 w-4" /> {ta.suspend}
                           </Button>
                        </div>
                     </div>
                  </Card>
                ))}
             </div>
          </TabsContent>

          <TabsContent value="logs" className="m-0">
             <Card className="rounded-[4rem] border-none bg-slate-900 p-12 space-y-10 shadow-3xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-8">
                   <h3 className="text-2xl font-black text-white tracking-tight uppercase">{ta.diagnosticFlux}</h3>
                   <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">{ta.continuousMonitoring}</span>
                   </div>
                </div>
                <div className="space-y-4">
                   {[
                     { level: "SUCCESS", msg: ta.logSync, time: ta.justNow },
                     { level: "INFO", msg: ta.logCleanup, time: `12${ta.minsAgo}` },
                     { level: "WARN", msg: ta.logLatency, time: `45${ta.minsAgo}` },
                     { level: "SYSTEM", msg: ta.logUpdate, time: `2${ta.hoursAgo}` }
                   ].map((log, i) => (
                      <div key={i} className="flex items-center gap-8 p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                         <Badge variant="outline" className={cn("rounded-lg border-none px-3 font-black text-[9px] uppercase tracking-widest", log.level === "SUCCESS" ? "bg-emerald-500/20 text-emerald-400" : log.level === "WARN" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400")}>
                            {log.level}
                         </Badge>
                         <p className="flex-1 text-slate-300 font-medium text-sm">{log.msg}</p>
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{log.time}</span>
                      </div>
                   ))}
                </div>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/5 transition-all group">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-mono">{title}</p>
            <p className="text-2xl md:text-4xl font-bold mt-1 font-display tabular-nums tracking-tighter">{value}</p>
          </div>
          <div className={`p-4 rounded-2xl bg-muted/50 group-hover:bg-muted transition-colors ${color}`}>
            <Icon className="h-7 w-7" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
