import { useEffect, useState } from "react";
import { invokeFunction } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, Bookmark, BookmarkCheck, ExternalLink, MapPin, Building2, Clock, Sparkles, Loader2, Briefcase, Globe, Target, Zap, ChevronDown, Trash2, ShieldCheck, Heart
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
  const [activeTab, setActiveTab] = useState<"ai" | "recruiter" | "external" | "saved">("ai");

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
    if (!searchQuery && activeTab === "ai") return;
    setSearching(true);
    try {
      const { data, error } = await invokeFunction("search-jobs", { 
        body: { query: searchQuery, location, jobType: jobType === "all" ? "" : jobType, resumeId: selectedResumeId } 
      });
      if (error) throw error;
      setJobs(data?.jobs || []);
      toast({ title: "Scanning Complete", description: `Synchronized ${data?.jobs?.length || 0} mission opportunities.` });
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
      toast({ title: "Link Saved to Matrix" });
      fetchSavedJobs();
    }
  };

  const isSaved = (url: string) => savedJobs.some(sj => sj.job_url === url);

  return (
    <div className="container mx-auto px-0 space-y-12 text-left pb-20">
      <SEOHead title="Find Jobs — ResumePro" description="Search and apply for jobs with AI." />
      <ApplyWithResumeDialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen} job={applyingJob} resumes={resumes} onSuccess={() => appliedIds.add(applyingJob?.id || "")} />
      
      <div className="relative bg-white rounded-[4rem] p-16 md:p-24 overflow-hidden border border-slate-100 shadow-sm">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
         
         <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-blue-600/5 rounded-full border border-blue-600/10 text-blue-600">
               <Briefcase className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Opportunity Scanner</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-black text-slate-900 tracking-tighter leading-[0.9] uppercase">
               Jobs.
            </h1>
            <p className="text-slate-500 font-medium text-lg max-w-xl">AI-powered job search, recruiter posts & external listings synchronized in real-time.</p>
         </div>
      </div>

      <div className="px-8 space-y-16">
         {/* Navigation Tabs Bar */}
         <div className="w-full h-16 p-1.5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm flex items-center">
            {[
               { id: "ai", label: "AI Search", icon: Sparkles },
               { id: "recruiter", label: "Recruiter Posts", icon: Briefcase },
               { id: "external", label: "External Jobs", icon: Globe },
               { id: "saved", label: "Saved", icon: Bookmark, count: savedJobs.length },
            ].map((tab) => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                  "flex-1 h-full flex items-center justify-center gap-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === tab.id ? "bg-slate-900 text-white shadow-xl" : "text-slate-400 hover:text-slate-900"
                  )}
               >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && <span className={cn("ml-1 px-2 py-0.5 rounded-full text-[8px]", activeTab === tab.id ? "bg-white/20" : "bg-slate-200")}>{tab.count}</span>}
               </button>
            ))}
         </div>

         {/* Horizontal Search Bar Card */}
         <Card className="rounded-[2.5rem] border-none bg-blue-50/30 p-6 shadow-sm border border-blue-100/50">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
               <div className="md:col-span-3 space-y-2 px-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Resume Asset</Label>
                  <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                     <SelectTrigger className="h-14 rounded-xl bg-white border-slate-100 font-bold text-[11px] text-slate-900"><SelectValue placeholder="Select Resume" /></SelectTrigger>
                     <SelectContent className="rounded-2xl border-none shadow-3xl bg-white">{resumes.map(r => <SelectItem key={r.id} value={r.id} className="font-bold text-[10px] p-4 uppercase">{r.title}</SelectItem>)}</SelectContent>
                  </Select>
               </div>
               <div className="md:col-span-3 space-y-2 px-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Search Query</Label>
                  <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="e.g. React developer" className="h-14 pl-10 rounded-xl bg-white border-slate-100 font-bold text-sm" />
                  </div>
               </div>
               <div className="md:col-span-2 space-y-2 px-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Location</Label>
                  <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Remote" className="h-14 pl-10 rounded-xl bg-white border-slate-100 font-bold text-sm" />
                  </div>
               </div>
               <div className="md:col-span-2 space-y-2 px-2">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Job Type</Label>
                  <Select value={jobType} onValueChange={setJobType}>
                     <SelectTrigger className="h-14 rounded-xl bg-white border-slate-100 font-bold text-[11px] text-slate-900"><SelectValue placeholder="All Types" /></SelectTrigger>
                     <SelectContent className="rounded-2xl border-none shadow-3xl bg-white">
                        <SelectItem value="all" className="font-bold text-[10px] p-4 uppercase">All Types</SelectItem>
                        <SelectItem value="full-time" className="font-bold text-[10px] p-4 uppercase">Full Time</SelectItem>
                        <SelectItem value="contract" className="font-bold text-[10px] p-4 uppercase">Contract</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
               <div className="md:col-span-2 px-2">
                  <Button onClick={handleSearch} disabled={searching} className="w-full h-14 rounded-xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] gap-3 shadow-lg shadow-blue-600/20 hover:scale-[1.02] transition-all">
                     {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Find Jobs
                  </Button>
               </div>
            </div>
         </Card>

         {/* Content Area */}
         <div className="min-h-[500px]">
            <AnimatePresence mode="wait">
               {activeTab === "ai" && (
                  <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                  {searching ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[1,2,3,4].map(i => <div key={i} className="h-72 rounded-[3.5rem] bg-slate-50 animate-pulse border border-slate-100" />)}
                     </div>
                  ) : jobs.length === 0 ? (
                     <div className="py-32 text-center space-y-6">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto border border-slate-100">
                           <Zap className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                           <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">System Ready</h3>
                           <p className="text-slate-400 font-medium">Input mission parameters to synchronize with the global market.</p>
                        </div>
                     </div>
                  ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {jobs.map((job, i) => (
                           <Card key={i} className="rounded-[3.5rem] border-none bg-slate-50/30 hover:bg-blue-50/10 p-10 shadow-sm border border-slate-100 hover:border-blue-600/20 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform">
                                 <Building2 className="w-20 h-20 text-slate-900" />
                              </div>
                              <div className="space-y-8 relative z-10">
                                 <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                       <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{job.company}</p>
                                       <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-tight uppercase group-hover:text-blue-600 transition-colors">{job.job_title}</h3>
                                    </div>
                                    {job.match_score && (
                                       <div className="px-4 py-1.5 bg-blue-600/10 rounded-full border border-blue-600/20">
                                          <span className="text-blue-600 font-black text-[9px] uppercase tracking-widest">{job.match_score}% Match</span>
                                       </div>
                                    )}
                                 </div>
                                 <div className="flex flex-wrap gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest pt-6 border-t border-slate-100">
                                    <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {job.location}</div>
                                    <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {job.posted_date}</div>
                                 </div>
                                 <div className="flex gap-4 pt-4">
                                    <Button onClick={() => window.open(job.url, '_blank')} className="flex-1 h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[9px] gap-3">
                                       Launch <ExternalLink className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" onClick={() => saveJob(job)} className={cn("h-14 w-14 rounded-2xl border-slate-100 transition-all", isSaved(job.url) ? "bg-rose-50 text-rose-500 border-rose-100" : "text-slate-300 hover:text-rose-500 hover:bg-rose-50")}>
                                       <Heart className={cn("w-5 h-5", isSaved(job.url) ? "fill-current" : "")} />
                                    </Button>
                                 </div>
                              </div>
                           </Card>
                        ))}
                     </div>
                  )}
                  </motion.div>
               )}

               {activeTab === "recruiter" && (
                  <motion.div key="recruiter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                     {boardLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[1,2,3,4].map(i => <div key={i} className="h-72 rounded-[3.5rem] bg-slate-50 animate-pulse border border-slate-100" />)}
                        </div>
                     ) : boardJobs.length === 0 ? (
                        <div className="py-32 text-center space-y-6">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto">
                           <Briefcase className="w-10 h-10" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No recruiter deployments found</p>
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {boardJobs.map((job, i) => (
                           <Card key={job.id} className="rounded-[3.5rem] border-none bg-slate-50/30 hover:bg-white p-10 shadow-sm border border-slate-100 transition-all duration-500 group">
                              <div className="space-y-8">
                                 <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">{job.company_name.charAt(0)}</div>
                                    <div className="space-y-1">
                                       <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none group-hover:text-blue-600 transition-colors uppercase">{job.title}</h3>
                                       <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{job.company_name}</p>
                                    </div>
                                 </div>
                                 <div className="flex flex-wrap gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest pt-6 border-t border-slate-100">
                                    <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {job.location || "Remote"}</div>
                                    <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {new Date(job.created_at).toLocaleDateString()}</div>
                                 </div>
                                 <Button 
                                    onClick={() => { setApplyingJob(job); setApplyDialogOpen(true); }}
                                    disabled={appliedIds.has(job.id)}
                                    className={cn("w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[9px] gap-3 transition-all", appliedIds.has(job.id) ? "bg-emerald-500 text-white" : "bg-slate-900 text-white hover:bg-blue-600")}
                                 >
                                    {appliedIds.has(job.id) ? <ShieldCheck className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                                    {appliedIds.has(job.id) ? "Application Submitted" : "Initialize Application"}
                                 </Button>
                              </div>
                           </Card>
                        ))}
                        </div>
                     )}
                  </motion.div>
               )}

               {activeTab === "saved" && (
                  <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                     {savedJobs.length === 0 ? (
                        <div className="py-32 text-center space-y-6">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto">
                           <Bookmark className="w-10 h-10" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No saved assets detected</p>
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {savedJobs.map((sj, i) => (
                           <Card key={sj.id} className="rounded-[3rem] border-none bg-slate-50/50 p-10 flex flex-col justify-between group">
                              <div className="space-y-2">
                                 <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{sj.company}</p>
                                 <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{sj.job_title}</h3>
                              </div>
                              <div className="flex items-center justify-between pt-10 mt-10 border-t border-slate-100">
                                 <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><MapPin className="w-3.5 h-3.5" /> {sj.location}</div>
                                 <div className="flex gap-3">
                                    <Button variant="ghost" size="icon" onClick={() => window.open(sj.job_url, '_blank')} className="w-12 h-12 rounded-xl bg-white shadow-sm hover:text-blue-600"><ExternalLink className="w-5 h-5" /></Button>
                                    <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl bg-white shadow-sm hover:text-rose-500"><Trash2 className="w-5 h-5" /></Button>
                                 </div>
                              </div>
                           </Card>
                        ))}
                        </div>
                     )}
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
