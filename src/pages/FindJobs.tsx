import { useEffect, useState } from "react";
import { invokeFunction } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, Bookmark, BookmarkCheck, ExternalLink, MapPin, Building2, Clock, Sparkles, Loader2, Briefcase, Globe, Target, Zap, ChevronDown, Trash2, ShieldCheck 
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import SEOHead from "@/components/SEOHead";
import ApplyWithResumeDialog from "@/components/job-board/ApplyWithResumeDialog";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Resume = Tables<"resumes">;
type SavedJob = Tables<"saved_jobs">;

interface JobListing {
  job_title: string; company: string; location: string; job_type: string; description: string; url: string; posted_date: string; match_score?: number; match_explanation?: string;
}

interface JobPost {
  id: string; title: string; company_name: string; location: string | null; job_type: string; description: string | null; requirements: string | null; salary_min: number | null; salary_max: number | null; salary_currency: string | null; created_at: string;
}

export default function FindJobs() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("all");
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [boardJobs, setBoardJobs] = useState<JobPost[]>([]);
  const [boardLoading, setBoardLoading] = useState(true);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applyingJob, setApplyingJob] = useState<JobPost | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("resumes").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setResumes(data ?? []);
      if (data && data.length > 0) setSelectedResumeId(data[0].id);
    });
    fetchSavedJobs();
  }, [user]);

  useEffect(() => {
    (async () => {
      setBoardLoading(true);
      const { data } = await supabase.from("job_posts").select("*").eq("status", "active").order("created_at", { ascending: false });
      setBoardJobs((data as any) ?? []);
      setBoardLoading(false);
    })();
  }, []);

  const fetchSavedJobs = async () => {
    const { data } = await supabase.from("saved_jobs").select("*").eq("user_id", user?.id);
    setSavedJobs(data || []);
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setSearching(true);
    try {
      const { data, error } = await invokeFunction("search-jobs", { 
        body: { query: searchQuery, location, jobType: jobType === "all" ? "" : jobType, resumeId: selectedResumeId } 
      });
      if (error) throw error;
      setJobs(data?.jobs || []);
      toast({ title: "Jobs Found", description: `Found ${data?.jobs?.length || 0} job opportunities.` });
    } catch (e: any) {
      toast({ title: "Search Failed", description: e.message, variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  const saveJob = async (job: JobListing) => {
    const { error } = await supabase.from("saved_jobs").insert({
      user_id: user?.id, job_title: job.job_title, company: job.company, location: job.location, job_url: job.url
    });
    if (error) toast({ title: "Error saving job", variant: "destructive" });
    else {
      toast({ title: "Job Saved" });
      fetchSavedJobs();
    }
  };

  const isSaved = (url: string) => savedJobs.some(sj => sj.job_url === url);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans pb-20">
      <SEOHead title="Find Jobs — ResumePro" description="Search and apply for jobs with AI." />
      <ApplyWithResumeDialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen} job={applyingJob} resumes={resumes} onSuccess={() => appliedIds.add(applyingJob?.id || "")} />
      <div className="container mx-auto px-8 space-y-20">
         <div className="flex flex-col md:flex-row items-end justify-between gap-12">
            <div className="space-y-6">
               <div className="inline-flex items-center gap-3 px-5 py-2 bg-blue-600/10 rounded-full border border-blue-600/20 text-blue-600">
                  <Globe className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Global Intelligence Grid</span>
               </div>
               <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none">
                  Opportunity <br /> <span className="text-blue-600">Matrix.</span>
               </h1>
            </div>
         </div>

         <Tabs defaultValue="discovery" className="space-y-16">
            <TabsList className="h-20 p-2 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 shadow-sm inline-flex">
               <TabsTrigger value="discovery" className="h-16 rounded-[1.8rem] px-12 font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">Search Web Nodes</TabsTrigger>
               <TabsTrigger value="internal" className="h-16 rounded-[1.8rem] px-12 font-black text-[10px] uppercase tracking-[0.2em] data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">Direct Deployments</TabsTrigger>
            </TabsList>

            <TabsContent value="discovery" className="space-y-20 outline-none">
               <Card className="rounded-[4.5rem] border-none bg-slate-900 p-16 shadow-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-transparent pointer-events-none" />
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end relative z-10">
                     <div className="lg:col-span-5 space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 px-6">Mission Objective</Label>
                        <div className="relative group">
                           <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                           <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="e.g. Lead Architect" className="h-20 rounded-[2.2rem] bg-white/5 border border-white/10 px-20 font-black text-xl text-white placeholder:text-slate-600 focus:bg-white focus:text-slate-900 focus:border-blue-600 transition-all uppercase tracking-tight" />
                        </div>
                     </div>
                     <div className="lg:col-span-3 space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 px-6">Deployment Zone</Label>
                        <div className="relative group">
                           <MapPin className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                           <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Remote" className="h-20 rounded-[2.2rem] bg-white/5 border border-white/10 px-20 font-black text-white placeholder:text-slate-600 focus:bg-white focus:text-slate-900 focus:border-blue-600 transition-all uppercase tracking-tight" />
                        </div>
                     </div>
                     <div className="lg:col-span-2 space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 px-6">Active Asset</Label>
                        <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                           <SelectTrigger className="h-20 rounded-[2.2rem] bg-white/5 border border-white/10 px-8 font-black text-[10px] uppercase tracking-widest text-white focus:bg-white focus:text-slate-900 transition-all"><SelectValue placeholder="Select Resume" /></SelectTrigger>
                           <SelectContent className="rounded-[2rem] border-none shadow-3xl p-3 bg-white">{resumes.map(r => <SelectItem key={r.id} value={r.id} className="rounded-xl font-black uppercase tracking-widest text-[9px] p-4">{r.title}</SelectItem>)}</SelectContent>
                        </Select>
                     </div>
                     <div className="lg:col-span-2">
                        <Button onClick={handleSearch} disabled={searching} className="w-full h-20 rounded-[2.2rem] bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-[10px] gap-4 shadow-3xl shadow-blue-600/40 hover:scale-105 transition-all">
                           {searching ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />} Initialize
                        </Button>
                     </div>
                  </div>
               </Card>

               {searching ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     {[1,2,3,4].map(i => <div key={i} className="h-80 rounded-[4rem] bg-slate-50 animate-pulse border border-slate-100 shadow-sm" />)}
                  </div>
               ) : jobs.length === 0 ? (
                  <div className="py-48 text-center space-y-10">
                     <div className="w-32 h-32 bg-slate-50 rounded-[3rem] border border-slate-100 flex items-center justify-center text-slate-300 mx-auto group-hover:scale-110 transition-transform"><Target className="w-14 h-14" /></div>
                     <div className="space-y-4">
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Ready for <br /> Scanning.</h3>
                        <p className="text-lg text-slate-500 font-medium">Input mission parameters to synchronize with the global market.</p>
                     </div>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     <AnimatePresence>
                        {jobs.map((job, i) => (
                           <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group">
                              <Card className="rounded-[4rem] border-none bg-white p-12 shadow-sm border border-slate-50 hover:shadow-3xl hover:-translate-y-4 transition-all duration-700 space-y-10 relative overflow-hidden flex flex-col justify-between h-full group">
                                 <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2" />
                                 <div className="space-y-10 relative z-10">
                                    <div className="flex items-start justify-between">
                                       <div className="space-y-6">
                                          <div className="flex items-center gap-4">
                                             <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-sm"><Building2 className="w-7 h-7" /></div>
                                             <span className="font-black text-slate-400 text-[10px] uppercase tracking-[0.4em]">{job.company}</span>
                                          </div>
                                          <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-[1.1] group-hover:text-blue-600 transition-colors uppercase">{job.job_title}</h3>
                                       </div>
                                       {job.match_score && (
                                          <div className="px-6 py-3 bg-blue-600/10 rounded-2xl border border-blue-600/20 shadow-sm">
                                             <span className="text-blue-600 font-black text-[10px] uppercase tracking-widest">{job.match_score}% Match</span>
                                          </div>
                                       )}
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pt-8 border-t border-slate-50">
                                       <div className="flex items-center gap-3"><MapPin className="w-4 h-4" /> {job.location}</div>
                                       <div className="flex items-center gap-3"><Clock className="w-4 h-4" /> {job.posted_date}</div>
                                       <div className="flex items-center gap-3"><Briefcase className="w-4 h-4" /> {job.job_type}</div>
                                    </div>
                                 </div>

                                 <div className="flex items-center gap-6 pt-12 relative z-10">
                                    <Button onClick={() => window.open(job.url, '_blank')} className="flex-1 h-18 py-6 rounded-[1.8rem] bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-[10px] gap-4 shadow-xl hover:bg-blue-600 transition-all">
                                       Launch Application <ExternalLink className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" onClick={() => saveJob(job)} className={cn("h-18 w-18 py-6 rounded-[1.8rem] border border-slate-100 shadow-sm transition-all", isSaved(job.url) ? "text-blue-600 bg-blue-50 border-blue-100" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-100")}>
                                       {isSaved(job.url) ? <BookmarkCheck className="w-7 h-7" /> : <Bookmark className="w-7 h-7" />}
                                    </Button>
                                 </div>
                              </Card>
                           </motion.div>
                        ))}
                     </AnimatePresence>
                  </div>
               )}
            </TabsContent>

            <TabsContent value="internal" className="space-y-20 outline-none">
               {boardLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     {[1,2,3,4].map(i => <div key={i} className="h-80 rounded-[4rem] bg-slate-50 animate-pulse border border-slate-100 shadow-sm" />)}
                  </div>
               ) : boardJobs.length === 0 ? (
                  <div className="py-48 text-center space-y-10">
                     <div className="w-32 h-32 bg-slate-50 rounded-[3rem] border border-slate-100 flex items-center justify-center text-slate-300 mx-auto"><Briefcase className="w-14 h-14" /></div>
                     <div className="space-y-4">
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">No Direct <br /> Nodes Found.</h3>
                        <p className="text-lg text-slate-500 font-medium">No direct recruiter deployments active in this sector.</p>
                     </div>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     {boardJobs.map((job, i) => (
                        <motion.div key={job.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="group">
                           <Card className="rounded-[4rem] border-none bg-white p-12 shadow-sm border border-slate-50 hover:shadow-3xl hover:-translate-y-4 transition-all duration-700 space-y-10 relative overflow-hidden flex flex-col justify-between h-full">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2" />
                              <div className="space-y-10 relative z-10">
                                 <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-600/30">{job.company_name.charAt(0)}</div>
                                    <div className="space-y-1">
                                       <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none group-hover:text-blue-600 transition-colors uppercase">{job.title}</h3>
                                       <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em]">{job.company_name}</p>
                                    </div>
                                 </div>
                                 
                                 <div className="flex flex-wrap gap-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pt-8 border-t border-slate-50">
                                    <div className="flex items-center gap-3"><MapPin className="w-4 h-4" /> {job.location || "Remote"}</div>
                                    <div className="flex items-center gap-3"><Clock className="w-4 h-4" /> {new Date(job.created_at).toLocaleDateString()}</div>
                                    <div className="flex items-center gap-3"><Zap className="w-4 h-4" /> {job.job_type}</div>
                                 </div>
                              </div>

                              <div className="pt-12 relative z-10">
                                 <Button 
                                   onClick={() => { setApplyingJob(job); setApplyDialogOpen(true); }}
                                   disabled={appliedIds.has(job.id)}
                                   className={cn("w-full h-18 py-6 rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-[10px] gap-4 shadow-xl transition-all", appliedIds.has(job.id) ? "bg-emerald-500 text-white" : "bg-slate-900 text-white hover:bg-blue-600")}
                                 >
                                    {appliedIds.has(job.id) ? <ShieldCheck className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />}
                                    {appliedIds.has(job.id) ? "Mission Completed" : "Initialize Application"}
                                 </Button>
                              </div>
                           </Card>
                        </motion.div>
                     ))}
                  </div>
               )}
            </TabsContent>
         </Tabs>
      </div>

    </div>
  );
}
