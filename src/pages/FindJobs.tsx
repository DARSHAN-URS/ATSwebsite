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
      toast({ title: "Intelligence Dispatched", description: `Synchronized ${data?.jobs?.length || 0} opportunities.` });
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
    if (error) toast({ title: "Protocol Error", variant: "destructive" });
    else {
      toast({ title: "Opportunity Saved" });
      fetchSavedJobs();
    }
  };

  const isSaved = (url: string) => savedJobs.some(sj => sj.job_url === url);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans pb-20">
      <SEOHead title="Opportunity Matrix — ResumePro" description="Synchronize your professional identity with global organizational requirements." />
      <ApplyWithResumeDialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen} job={applyingJob} resumes={resumes} onSuccess={() => appliedIds.add(applyingJob?.id || "")} />

      <div className="container mx-auto px-8 pt-16 space-y-16">
         <div className="flex flex-col md:flex-row items-end justify-between gap-12">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 rounded-full border border-blue-600/20 text-blue-600">
                  <Globe className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Global Protocol</span>
               </div>
               <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                  Opportunity <br /> <span className="text-blue-600">Matrix.</span>
               </h1>
            </div>
         </div>

         <Tabs defaultValue="discovery" className="space-y-12">
            <TabsList className="h-16 p-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm inline-flex">
               <TabsTrigger value="discovery" className="rounded-2xl px-10 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">AI Discovery</TabsTrigger>
               <TabsTrigger value="internal" className="rounded-2xl px-10 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">Direct Board</TabsTrigger>
            </TabsList>

            <TabsContent value="discovery" className="space-y-12 outline-none">
               <Card className="rounded-[4rem] border-none bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-12">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                     <div className="lg:col-span-5 space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Neural Query</Label>
                        <div className="relative">
                           <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                           <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="e.g. Senior Software Architect" className="h-20 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-none px-16 font-bold text-lg" />
                        </div>
                     </div>
                     <div className="lg:col-span-3 space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Geographic Vector</Label>
                        <div className="relative">
                           <MapPin className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                           <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Global" className="h-20 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-none px-16 font-bold" />
                        </div>
                     </div>
                     <div className="lg:col-span-2 space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Identity Sync</Label>
                        <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                           <SelectTrigger className="h-20 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-none px-8 font-bold text-xs"><SelectValue placeholder="Select Module" /></SelectTrigger>
                           <SelectContent className="rounded-2xl border-none shadow-2xl p-2">{resumes.map(r => <SelectItem key={r.id} value={r.id} className="rounded-xl font-bold">{r.title}</SelectItem>)}</SelectContent>
                        </Select>
                     </div>
                     <div className="lg:col-span-2">
                        <Button onClick={handleSearch} disabled={searching} className="w-full h-20 rounded-[2rem] bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] gap-3 shadow-2xl shadow-blue-600/20">
                           {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />} Execute
                        </Button>
                     </div>
                  </div>
               </Card>

               {searching ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     {[1,2,3,4].map(i => <div key={i} className="h-64 rounded-[4rem] bg-white animate-pulse shadow-sm" />)}
                  </div>
               ) : jobs.length === 0 ? (
                  <div className="py-40 text-center space-y-6">
                     <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center text-slate-300 mx-auto"><Target className="w-12 h-12" /></div>
                     <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">System Ready</h3>
                     <p className="text-slate-500 font-medium">Initialize a neural query to discovery global career vectors.</p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <AnimatePresence>
                        {jobs.map((job, i) => (
                           <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="group">
                              <Card className="rounded-[4rem] border-none bg-white dark:bg-slate-900 p-12 shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-2xl hover:-translate-y-2 transition-all space-y-8">
                                 <div className="flex items-start justify-between">
                                    <div className="space-y-4">
                                       <div className="flex items-center gap-3">
                                          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600"><Building2 className="w-6 h-6" /></div>
                                          <span className="font-black text-slate-900 dark:text-white text-xl tracking-tight">{job.company}</span>
                                       </div>
                                       <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{job.job_title}</h3>
                                    </div>
                                    {job.match_score && (
                                       <div className="px-6 py-3 bg-blue-600/10 rounded-2xl border border-blue-600/20">
                                          <span className="text-blue-600 font-black text-xs">{job.match_score}% Match</span>
                                       </div>
                                    )}
                                 </div>
                                 
                                 <div className="flex flex-wrap gap-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {job.location}</div>
                                    <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {job.posted_date}</div>
                                    <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> {job.job_type}</div>
                                 </div>

                                 <div className="flex items-center gap-4 pt-4">
                                    <Button onClick={() => window.open(job.url, '_blank')} className="flex-1 h-16 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl">
                                       Apply via Source <ExternalLink className="w-4 h-4" />
                                    </Button>
                                    <Button onClick={() => saveJob(job)} variant="outline" className={cn("h-16 w-16 rounded-2xl border-slate-100", isSaved(job.url) && "bg-blue-50 text-blue-600")}>
                                       {isSaved(job.url) ? <BookmarkCheck className="w-6 h-6" /> : <Bookmark className="w-6 h-6" />}
                                    </Button>
                                 </div>
                              </Card>
                           </motion.div>
                        ))}
                     </AnimatePresence>
                  </div>
               )}
            </TabsContent>

            <TabsContent value="internal" className="outline-none">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {boardLoading ? (
                     [1,2,3,4].map(i => <div key={i} className="h-64 rounded-[4rem] bg-white animate-pulse shadow-sm" />)
                  ) : boardJobs.length === 0 ? (
                     <div className="col-span-full py-40 text-center space-y-6">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center text-slate-300 mx-auto"><Building2 className="w-12 h-12" /></div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Board Empty</h3>
                        <p className="text-slate-500 font-medium">No direct organizational roles detected in current matrix.</p>
                     </div>
                  ) : (
                     boardJobs.map((job, i) => (
                        <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                           <Card className="rounded-[4rem] border-none bg-white dark:bg-slate-900 p-12 shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-2xl hover:-translate-y-2 transition-all space-y-8">
                              <div className="space-y-4">
                                 <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white"><ShieldCheck className="w-6 h-6" /></div>
                                    <span className="font-black text-slate-900 dark:text-white text-xl tracking-tight">{job.company_name}</span>
                                 </div>
                                 <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{job.title}</h3>
                              </div>
                              <div className="flex flex-wrap gap-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                                 <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {job.location || "Remote"}</div>
                                 <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> {job.job_type}</div>
                              </div>
                              <Button onClick={() => { setApplyingJob(job); setApplyDialogOpen(true); }} className="w-full h-16 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl shadow-blue-600/20">
                                 Instant Apply <Zap className="w-4 h-4" />
                              </Button>
                           </Card>
                        </motion.div>
                     ))
                  )}
               </div>
            </TabsContent>
         </Tabs>
      </div>
    </div>
  );
}
