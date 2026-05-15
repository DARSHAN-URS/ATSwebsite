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
  Search, Bookmark, BookmarkCheck, ExternalLink, MapPin, Building2, Clock, Sparkles, Loader2, Briefcase, Globe, Target, Zap, ChevronDown, Trash2, ShieldCheck, Heart, Filter, TrendingUp, Star, BarChart3, Info, ChevronRight, CheckCircle2, AlertCircle, X
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import SEOHead from "@/components/SEOHead";
import ApplyWithResumeDialog from "@/components/job-board/ApplyWithResumeDialog";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

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
    <div className="max-w-7xl mx-auto space-y-8 text-left p-8 md:p-10 bg-[#F5F7FB] min-h-screen">
      <SEOHead title="Find Jobs — ResumePro" description="Search and apply for jobs with AI." />
      <ApplyWithResumeDialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen} job={applyingJob} resumes={resumes} onSuccess={() => appliedIds.add(applyingJob?.id || "")} />
      
      {/* 1. SaaS Hero Section */}
      <div className="relative bg-white rounded-3xl p-8 md:p-10 overflow-hidden border border-slate-200 shadow-sm">
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
         
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100 text-blue-600">
                   <Zap className="w-3.5 h-3.5" />
                   <span className="text-[10px] font-bold uppercase tracking-wider">AI Intelligence Active</span>
                </div>
                <div className="space-y-1">
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-none uppercase">
                     Jobs Hub.
                  </h1>
                  <p className="text-slate-500 font-medium text-sm max-w-xl">AI-powered job search, recruiter posts & external listings synchronized in real-time.</p>
                </div>
             </div>

            <div className="flex items-center gap-6">
               <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900 leading-none">237</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Matches</p>
               </div>
               <div className="w-px h-10 bg-slate-100" />
               <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600 leading-none">94%</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg. Match</p>
               </div>
            </div>
         </div>
      </div>

      <div className="space-y-6">
         {/* Navigation Tabs Bar */}
         <div className="w-full h-14 p-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center">
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
                  "flex-1 h-full flex items-center justify-center gap-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
                  activeTab === tab.id ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                  )}
               >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {tab.count !== undefined && <span className={cn("ml-1.5 px-2 py-0.5 rounded-full text-[8px]", activeTab === tab.id ? "bg-white/20" : "bg-slate-100")}>{tab.count}</span>}
               </button>
            ))}
         </div>

         {/* AI Search Panel */}
         <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-600/[0.01] pointer-events-none group-focus-within:bg-blue-600/[0.02] transition-colors" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end relative z-10">
               <div className="lg:col-span-3 space-y-2">
                  <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-1 flex items-center gap-2">
                     <Target className="w-3 h-3" /> Target Persona
                  </Label>
                  <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                     <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold text-[11px] text-slate-900 focus:ring-4 focus:ring-blue-600/5 transition-all">
                        <SelectValue placeholder="Select Resume" />
                     </SelectTrigger>
                     <SelectContent className="rounded-xl border border-slate-100 shadow-2xl bg-white">
                        {resumes.map(r => (
                           <SelectItem key={r.id} value={r.id} className="font-bold text-[10px] p-3 uppercase hover:bg-blue-50 cursor-pointer">{r.title}</SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>
               <div className="lg:col-span-4 space-y-2">
                  <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-1 flex items-center gap-2">
                     <Search className="w-3 h-3" /> Smart Query
                  </Label>
                  <div className="relative group/search">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/search:text-blue-600 transition-colors" />
                     <Input 
                        value={searchQuery} 
                        onChange={e => setSearchQuery(e.target.value)} 
                        placeholder="e.g. Senior Frontend Engineer" 
                        className="h-12 pl-11 pr-14 rounded-xl bg-slate-50 border-slate-200 font-bold text-sm focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all" 
                     />
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[8px] font-bold text-slate-400">
                        <span>⌘</span><span>K</span>
                     </div>
                  </div>
               </div>
               <div className="lg:col-span-2 space-y-2">
                  <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-1 flex items-center gap-2">
                     <MapPin className="w-3 h-3" /> Geo-Target
                  </Label>
                  <div className="relative">
                     <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <Input 
                        value={location} 
                        onChange={e => setLocation(e.target.value)} 
                        placeholder="Remote" 
                        className="h-12 pl-11 rounded-xl bg-slate-50 border-slate-200 font-bold text-sm focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all" 
                     />
                  </div>
               </div>
               <div className="lg:col-span-3">
                  <Button onClick={handleSearch} disabled={searching} className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] gap-3 shadow-xl shadow-slate-900/10 hover:bg-blue-600 transition-all">
                     {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Initialize Search
                  </Button>
               </div>
            </div>

            {/* Quick Filter Chips */}
            <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-100 overflow-x-auto pb-2 scrollbar-hide">
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pr-2 border-r border-slate-100">Suggestions:</span>
               {["Remote Only", "$150k+", "Series B+", "React Ecosystem", "Visa Sponsor"].map(chip => (
                  <button key={chip} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-bold text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all whitespace-nowrap">
                     {chip}
                  </button>
               ))}
            </div>
         </Card>

         {/* Content Area Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[500px]">
            <div className="lg:col-span-8">
               <AnimatePresence mode="wait">
                  {activeTab === "ai" && (
                     <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                     {searching ? (
                        <div className="space-y-4">
                           {[1,2,3].map(i => <div key={i} className="h-48 rounded-3xl bg-white animate-pulse border border-slate-200" />)}
                        </div>
                     ) : jobs.length === 0 ? (
                        <Card className="py-24 text-center space-y-6 bg-white rounded-3xl border border-slate-200 border-dashed">
                           <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto">
                              <Zap className="w-10 h-10" />
                           </div>
                           <div className="space-y-2 px-4">
                              <h3 className="text-xl font-bold text-slate-900 tracking-tight">System Ready for Deployment</h3>
                              <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">Input mission parameters to synchronize with the global market.</p>
                           </div>
                        </Card>
                     ) : (
                        <div className="space-y-4">
                           {jobs.map((job, i) => (
                              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                 <Card className="rounded-3xl border border-slate-200 bg-white p-6 hover:border-blue-600/30 hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden flex flex-col md:flex-row gap-6">
                                    <div className="w-14 h-14 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center font-bold text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                                       {job.company.charAt(0)}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                       <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                          <div className="space-y-1">
                                             <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{job.job_title}</h3>
                                             <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
                                                <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {job.company}</span>
                                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                                             </div>
                                          </div>
                                          {job.match_score && (
                                             <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Match</p>
                                                   <p className="text-sm font-bold text-blue-600">{job.match_score}%</p>
                                                </div>
                                                <div className="w-10 h-10 rounded-full border-2 border-blue-100 flex items-center justify-center p-1">
                                                   <div className="w-full h-full rounded-full border-2 border-blue-600 border-t-transparent animate-spin" style={{ animationDuration: '3s' }} />
                                                </div>
                                             </div>
                                          )}
                                       </div>
                                       
                                       <div className="flex flex-wrap gap-2">
                                          <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 text-[8px] px-1.5 h-4 font-bold uppercase">React</Badge>
                                          <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-slate-100 text-[8px] px-1.5 h-4 font-bold uppercase">Node.js</Badge>
                                          <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-slate-100 text-[8px] px-1.5 h-4 font-bold uppercase">Remote</Badge>
                                       </div>

                                       <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                                             <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {job.posted_date}</span>
                                             <span className="flex items-center gap-1"><Target className="w-3 h-3" /> 12 Applicants</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                             <Button variant="ghost" size="icon" onClick={() => saveJob(job)} className={cn("h-9 w-9 rounded-xl transition-all", isSaved(job.url) ? "text-rose-500 bg-rose-50" : "text-slate-300 hover:text-rose-500 hover:bg-rose-50")}>
                                                <Heart className={cn("w-4 h-4", isSaved(job.url) ? "fill-current" : "")} />
                                             </Button>
                                             <Button onClick={() => window.open(job.url, '_blank')} className="h-9 px-4 rounded-xl bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest gap-2 hover:bg-blue-600">
                                                Apply <ExternalLink className="w-3 h-3" />
                                             </Button>
                                          </div>
                                       </div>
                                    </div>
                                 </Card>
                              </motion.div>
                           ))}
                        </div>
                     )}
                     </motion.div>
                  )}
                  {activeTab === "recruiter" && (
                     <motion.div key="recruiter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        {boardLoading ? (
                           <div className="space-y-4">
                              {[1,2,3].map(i => <div key={i} className="h-48 rounded-3xl bg-white animate-pulse border border-slate-200" />)}
                           </div>
                        ) : boardJobs.length === 0 ? (
                           <Card className="py-24 text-center space-y-6 bg-white rounded-3xl border border-slate-200 border-dashed">
                              <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto">
                                 <Briefcase className="w-10 h-10" />
                              </div>
                              <p className="text-sm text-slate-500 font-medium">No recruiter deployments found</p>
                           </Card>
                        ) : (
                           <div className="space-y-4">
                              {boardJobs.map((job) => (
                                 <Card key={job.id} className="rounded-3xl border border-slate-200 bg-white p-6 hover:border-blue-600/30 transition-all duration-300 group relative flex flex-col md:flex-row gap-6">
                                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shrink-0">
                                       {job.company_name.charAt(0)}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                       <div className="space-y-1">
                                          <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">{job.title}</h3>
                                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{job.company_name}</p>
                                       </div>
                                       <div className="flex items-center gap-4 text-[11px] font-medium text-slate-500">
                                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location || "Remote"}</span>
                                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {format(new Date(job.created_at), "MMM d")}</span>
                                       </div>
                                       <Button 
                                          onClick={() => { setApplyingJob(job); setApplyDialogOpen(true); }}
                                          disabled={appliedIds.has(job.id)}
                                          className={cn("w-full h-10 rounded-xl font-bold uppercase tracking-widest text-[10px] gap-2", appliedIds.has(job.id) ? "bg-emerald-500 text-white" : "bg-slate-900 text-white hover:bg-blue-600")}
                                       >
                                          {appliedIds.has(job.id) ? <ShieldCheck className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                                          {appliedIds.has(job.id) ? "Applied" : "Apply Now"}
                                       </Button>
                                    </div>
                                 </Card>
                              ))}
                           </div>
                        )}
                     </motion.div>
                  )}
                  {activeTab === "saved" && (
                     <motion.div key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        {savedJobs.length === 0 ? (
                           <Card className="py-24 text-center space-y-6 bg-white rounded-3xl border border-slate-200 border-dashed">
                              <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto">
                                 <Bookmark className="w-10 h-10" />
                              </div>
                              <p className="text-sm text-slate-500 font-medium">No saved assets detected</p>
                           </Card>
                        ) : (
                           <div className="space-y-4">
                              {savedJobs.map((sj) => (
                                 <Card key={sj.id} className="rounded-3xl border border-slate-200 bg-white p-6 flex items-center justify-between group">
                                    <div className="space-y-1">
                                       <h3 className="text-base font-bold text-slate-900 tracking-tight">{sj.job_title}</h3>
                                       <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">{sj.company}</p>
                                    </div>
                                    <div className="flex gap-2">
                                       <Button variant="ghost" size="icon" onClick={() => window.open(sj.job_url, '_blank')} className="h-10 w-10 rounded-xl hover:text-blue-600"><ExternalLink className="w-4 h-4" /></Button>
                                       <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:text-rose-500"><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                 </Card>
                              ))}
                           </div>
                        )}
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>

            {/* AI Insights Sidebar */}
            <div className="lg:col-span-4 space-y-8">
               <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600" /> AI Insights
                     </h3>
                     <Badge className="bg-blue-50 text-blue-600 border-none text-[8px] font-bold uppercase">Beta</Badge>
                  </div>
                  
                  <div className="space-y-6">
                     <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                           <span className="text-slate-400">Market Compatibility</span>
                           <span className="text-blue-600">88%</span>
                        </div>
                        <Progress value={88} className="h-1.5 bg-slate-50" />
                     </div>

                     <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                        <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                           <Target className="w-3.5 h-3.5 text-blue-600" /> Skill Gaps Identified
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                           {["AWS Lambda", "Terraform", "System Design"].map(skill => (
                              <Badge key={skill} variant="outline" className="bg-white border-slate-200 text-slate-500 text-[8px] h-5">{skill}</Badge>
                           ))}
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">Adding these could increase match rate by 14%</p>
                     </div>

                     <div className="space-y-4">
                        <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Top Match Factors</h4>
                        {[
                           { label: "Frontend Expertise", value: "High", icon: CheckCircle2, color: "text-emerald-500" },
                           { label: "Location Alignment", value: "Match", icon: CheckCircle2, color: "text-emerald-500" },
                           { label: "Salary Expectation", value: "Pending", icon: AlertCircle, color: "text-amber-500" },
                        ].map((factor, i) => (
                           <div key={i} className="flex items-center justify-between">
                              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-2">
                                 <factor.icon className={cn("w-3.5 h-3.5", factor.color)} /> {factor.label}
                              </span>
                              <span className="text-[10px] font-bold text-slate-900 uppercase">{factor.value}</span>
                           </div>
                        ))}
                     </div>
                  </div>
                  
                  <Button onClick={() => navigate("/resumes")} variant="outline" className="w-full h-10 rounded-xl border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all">Optimize My Identity</Button>
               </Card>

               {/* Trending Roles Card */}
               <Card className="rounded-3xl border border-slate-200 bg-slate-900 p-6 shadow-xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2" />
                  <div className="relative z-10 space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                           <TrendingUp className="w-5 h-5" />
                        </div>
                        <Badge className="bg-white/10 text-white border-none text-[8px] font-bold uppercase">Trending</Badge>
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-white text-base font-bold tracking-tight">Market Momentum</h3>
                        <p className="text-slate-400 text-[11px] leading-relaxed">Roles in <span className="text-blue-400 font-bold">Generative AI</span> and <span className="text-blue-400 font-bold">Platform Engineering</span> have surged by 24% this week.</p>
                     </div>
                     <div className="space-y-2">
                        {["Senior AI Engineer", "DevOps Specialist", "Product Designer"].map(role => (
                           <div key={role} onClick={() => toast({ title: "Market Alert", description: `Synchronizing deep search for ${role} positions.` })} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-all cursor-pointer">
                              <span className="text-[11px] font-medium text-slate-300">{role}</span>
                              <ChevronRight className="w-3 h-3 text-slate-500" />
                           </div>
                        ))}
                     </div>
                  </div>
               </Card>
            </div>
         </div>
      </div>
    </div>
  );
}
