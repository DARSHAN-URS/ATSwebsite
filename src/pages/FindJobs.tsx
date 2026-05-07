import { useEffect, useState } from "react";
import { invokeFunction } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Bookmark, BookmarkCheck, ExternalLink, MapPin, Building2, Clock, Sparkles, Loader2, Briefcase, Globe, Target, Zap, ArrowRight, ChevronDown } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import SEOHead from "@/components/SEOHead";
import { useSubscription } from "@/hooks/useSubscription";
import ProFeatureGate from "@/components/ProFeatureGate";
import { useLanguage } from "@/i18n/LanguageContext";
import RecruiterJobsList from "@/components/job-board/RecruiterJobsList";
import ExternalJobsSearch from "@/components/job-board/ExternalJobsSearch";
import ApplyWithResumeDialog from "@/components/job-board/ApplyWithResumeDialog";
import { motion, AnimatePresence } from "framer-motion";

type Resume = Tables<"resumes">;
type SavedJob = Tables<"saved_jobs">;

interface JobListing {
  job_title: string;
  company: string;
  location: string;
  job_type: string;
  description: string;
  url: string;
  posted_date: string;
  match_score?: number;
  match_explanation?: string;
}

interface JobPost {
  id: string;
  title: string;
  company_name: string;
  location: string | null;
  job_type: string;
  description: string | null;
  requirements: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  created_at: string;
}

function getScoreColor(score: number) {
  if (score >= 80) return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400";
  if (score >= 60) return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400";
  return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400";
}

export default function FindJobs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isPro } = useSubscription();
  const { t } = useLanguage();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("all");
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [searching, setSearching] = useState(false);
  const [expandedJob, setExpandedJob] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"match" | "date" | "company">("match");

  const [boardJobs, setBoardJobs] = useState<JobPost[]>([]);
  const [boardLoading, setBoardLoading] = useState(true);
  const [boardSearch, setBoardSearch] = useState("");
  const [boardTypeFilter, setBoardTypeFilter] = useState("all");
  const [boardExpandedId, setBoardExpandedId] = useState<string | null>(null);
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

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("job_post_applications").select("job_post_id").eq("applicant_id", user.id) as any;
      if (data) setAppliedIds(new Set(data.map((d: any) => d.job_post_id)));
    })();
  }, [user]);

  const fetchSavedJobs = async () => {
    const { data } = await supabase.from("saved_jobs").select("*").eq("is_bookmarked", true).order("created_at", { ascending: false });
    setSavedJobs(data ?? []);
  };

  const handleSearch = async () => {
    if (!selectedResumeId) {
      toast({ title: "Select a resume", variant: "destructive" });
      return;
    }
    const resume = resumes.find((r) => r.id === selectedResumeId);
    if (!resume) return;
    setSearching(true);
    setJobs([]);
    try {
      const { data, error } = await invokeFunction("search-jobs", {
        resume_data: resume.resume_data,
        resume_title: resume.title,
        location: location || undefined,
        job_type: jobType === "all" ? undefined : jobType,
        query: searchQuery || undefined
      });
      if (error) throw error;
      setJobs(data?.jobs ?? []);
    } catch (e: any) {
      toast({ title: "Search failed", description: e.message, variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  const handleSaveJob = async (job: JobListing) => {
    if (!user) return;
    const { error } = await supabase.from("saved_jobs").insert({
      user_id: user.id, job_title: job.job_title, company: job.company, location: job.location, job_type: job.job_type,
      description: job.description, url: job.url, match_score: job.match_score ?? null, match_explanation: job.match_explanation ?? null,
      source_resume_id: selectedResumeId || null, posted_date: job.posted_date || null,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Job saved!" }); fetchSavedJobs(); }
  };

  const handleTrackJob = async (job: { job_title: string; company: string; url?: string | null }) => {
    if (!user) return;
    const { error } = await supabase.from("job_applications").insert({
      user_id: user.id, company: job.company, position: job.job_title, url: job.url ?? "", resume_id: selectedResumeId || null,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Added to tracker!" });
  };

  const handleRemoveSaved = async (id: string) => {
    await supabase.from("saved_jobs").delete().eq("id", id);
    fetchSavedJobs();
  };

  const isJobSaved = (job: JobListing) => savedJobs.some((s) => s.job_title === job.job_title && s.company === job.company);

  const sortedJobs = [...jobs].sort((a, b) => {
    if (sortBy === "match") return (b.match_score ?? 0) - (a.match_score ?? 0);
    if (sortBy === "date") return (b.posted_date ?? "").localeCompare(a.posted_date ?? "");
    return a.company.localeCompare(b.company);
  });

  const handleBoardExpand = (jobId: string) => {
    setBoardExpandedId(boardExpandedId === jobId ? null : jobId);
  };

  const handleApplySubmit = async (resumeId: string | null, coverNote: string) => {
    if (!user || !applyingJob) return;
    const { error } = await supabase.from("job_post_applications").insert({
      job_post_id: applyingJob.id,
      applicant_id: user.id,
      resume_id: resumeId,
    } as any);
    if (error) {
      if (error.code === "23505") toast({ title: t.jobBoard.alreadyApplied });
      else toast({ title: t.common.error, description: error.message, variant: "destructive" });
      throw error;
    } else {
      setAppliedIds((prev) => new Set(prev).add(applyingJob.id));
      toast({ title: t.jobBoard.applicationSubmitted });
    }
  };

  const filteredBoard = boardJobs.filter((job) => {
    const matchesSearch = !boardSearch || job.title.toLowerCase().includes(boardSearch.toLowerCase()) || job.company_name.toLowerCase().includes(boardSearch.toLowerCase());
    const matchesType = boardTypeFilter === "all" || job.job_type === boardTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <SEOHead title="Find Jobs — ResumePro" description="Find the perfect role with AI-powered job matching." noindex />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Find <span className="text-primary">Opportunities</span></h1>
          <p className="text-slate-500 mt-2 font-medium">Discover your next career move with AI-powered matching.</p>
        </div>
      </div>

      <Tabs defaultValue="search" className="space-y-8">
        <TabsList className="p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex-wrap h-auto">
          <TabsTrigger value="search" className="rounded-xl px-6 py-2.5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
            <Zap className="h-4 w-4 mr-2" /> AI Search
          </TabsTrigger>
          <TabsTrigger value="recruiter" className="rounded-xl px-6 py-2.5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
            <Briefcase className="h-4 w-4 mr-2" /> Board
          </TabsTrigger>
          <TabsTrigger value="external" className="rounded-xl px-6 py-2.5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
            <Globe className="h-4 w-4 mr-2" /> External
          </TabsTrigger>
          <TabsTrigger value="saved" className="rounded-xl px-6 py-2.5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
            <Bookmark className="h-4 w-4 mr-2" /> Saved ({savedJobs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-8 mt-0">
          <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
             <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Match Against</Label>
                      <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                         <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Select resume" /></SelectTrigger>
                         <SelectContent className="rounded-xl">{resumes.map((r) => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}</SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Keywords</Label>
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="e.g. Frontend, Python" className="pl-11 rounded-xl h-12" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Remote, Austin" className="pl-11 rounded-xl h-12" />
                      </div>
                   </div>
                   <div className="flex items-end">
                      <Button onClick={handleSearch} disabled={searching} className="w-full h-12 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-primary/20 gap-2">
                         {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                         {searching ? "Matching..." : "Match Jobs"}
                      </Button>
                   </div>
                </div>
             </CardContent>
          </Card>

          {jobs.length > 0 && (
             <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">{jobs.length} Matching results</p>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                   <SelectTrigger className="w-48 rounded-xl h-10 text-xs font-bold"><SelectValue /></SelectTrigger>
                   <SelectContent className="rounded-xl">
                      <SelectItem value="match">Sort by Match</SelectItem>
                      <SelectItem value="date">Sort by Date</SelectItem>
                      <SelectItem value="company">Sort by Company</SelectItem>
                   </SelectContent>
                </Select>
             </div>
          )}

          <div className="grid grid-cols-1 gap-6">
             <AnimatePresence>
                {searching ? (
                  <div className="py-20 text-center space-y-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
                       <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                    <p className="text-slate-500 font-bold">Our AI is analyzing 50+ platforms for your perfect match...</p>
                  </div>
                ) : sortedJobs.map((job, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="rounded-[2rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all overflow-hidden group">
                       <div className="p-8">
                          <div className="flex flex-col md:flex-row justify-between gap-6">
                             <div className="flex gap-6">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-100 dark:border-slate-700">
                                   <Building2 className="w-8 h-8" />
                                </div>
                                <div>
                                   <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{job.job_title}</h3>
                                   <div className="flex flex-wrap items-center gap-4 mt-2 text-sm font-bold text-slate-500">
                                      <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {job.company}</span>
                                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</span>
                                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {job.posted_date}</span>
                                   </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-3">
                                {job.match_score !== undefined && (
                                   <div className={`px-4 py-2 rounded-xl border font-black text-xs uppercase tracking-widest flex items-center gap-2 ${getScoreColor(job.match_score)}`}>
                                      <Sparkles className="w-3.5 h-3.5" /> {job.match_score}% Match
                                   </div>
                                )}
                                <Button variant="ghost" size="icon" onClick={() => handleSaveJob(job)} className={`h-11 w-11 rounded-xl transition-all ${isJobSaved(job) ? "bg-primary/10 text-primary" : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary"}`}>
                                   {isJobSaved(job) ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setExpandedJob(expandedJob === i ? null : i)} className="h-11 w-11 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400">
                                   <ChevronDown className={`w-5 h-5 transition-transform ${expandedJob === i ? "rotate-180" : ""}`} />
                                </Button>
                             </div>
                          </div>
                       </div>
                       <AnimatePresence>
                          {expandedJob === i && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30"
                            >
                               <div className="p-8 space-y-6">
                                  {job.match_explanation && (
                                     <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                                        <span className="font-black text-primary uppercase text-[10px] tracking-widest block mb-1">AI Intelligence</span>
                                        {job.match_explanation}
                                     </div>
                                  )}
                                  <div className="text-sm text-slate-500 font-medium whitespace-pre-wrap leading-relaxed max-w-3xl">
                                     {job.description}
                                  </div>
                                  <div className="flex gap-3">
                                     <Button asChild className="h-12 px-8 bg-slate-900 dark:bg-slate-800 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-primary transition-all">
                                        <a href={job.url} target="_blank" rel="noopener noreferrer">Apply Now <ExternalLink className="w-3.5 h-3.5 ml-2" /></a>
                                     </Button>
                                     <Button variant="outline" onClick={() => handleTrackJob(job)} className="h-12 px-8 border-slate-200 font-black uppercase tracking-widest text-xs rounded-xl">
                                        <Target className="w-3.5 h-3.5 mr-2" /> Add to Tracker
                                     </Button>
                                  </div>
                               </div>
                            </motion.div>
                          )}
                       </AnimatePresence>
                    </Card>
                  </motion.div>
                ))}
             </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="recruiter" className="mt-0">
           <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                 <div className="relative flex-1">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                   <Input placeholder={t.jobBoard.searchPlaceholder} value={boardSearch} onChange={(e) => setBoardSearch(e.target.value)} className="pl-11 h-12 rounded-xl" />
                 </div>
                 <Select value={boardTypeFilter} onValueChange={setBoardTypeFilter}>
                   <SelectTrigger className="w-full sm:w-56 h-12 rounded-xl"><SelectValue placeholder="All Types" /></SelectTrigger>
                   <SelectContent className="rounded-xl">
                     <SelectItem value="all">{t.jobBoard.allTypes}</SelectItem>
                     <SelectItem value="full-time">{t.jobBoard.fullTime}</SelectItem>
                     <SelectItem value="part-time">{t.jobBoard.partTime}</SelectItem>
                     <SelectItem value="contract">{t.jobBoard.contract}</SelectItem>
                     <SelectItem value="remote">{t.jobBoard.remote}</SelectItem>
                   </SelectContent>
                 </Select>
              </div>
              <RecruiterJobsList jobs={filteredBoard} loading={boardLoading} appliedIds={appliedIds} expandedId={boardExpandedId || ""} onExpand={handleBoardExpand} onApply={(e, id) => {
                const job = boardJobs.find(j => j.id === id);
                if (job) { setApplyingJob(job); setApplyDialogOpen(true); }
              }} />
           </div>
        </TabsContent>

        <TabsContent value="external" className="mt-0">
          <ExternalJobsSearch />
        </TabsContent>

        <TabsContent value="saved" className="mt-0">
           {savedJobs.length === 0 ? (
             <Card className="rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
               <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                 <Bookmark className="h-12 w-12 text-slate-300 mb-4" />
                 <h3 className="text-xl font-black text-slate-900 dark:text-white">No saved jobs</h3>
                 <p className="text-slate-500 font-medium mt-1">Bookmark roles from AI Search or the Job Board.</p>
               </CardContent>
             </Card>
           ) : (
             <div className="grid grid-cols-1 gap-6">
               {savedJobs.map((job) => (
                 <Card key={job.id} className="rounded-[2rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-8">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                       <div className="flex gap-6">
                          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                             <Building2 className="w-8 h-8" />
                          </div>
                          <div>
                             <h3 className="text-xl font-black text-slate-900 dark:text-white">{job.job_title}</h3>
                             <div className="flex flex-wrap items-center gap-4 mt-2 text-sm font-bold text-slate-500">
                                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {job.company}</span>
                                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</span>
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <Button asChild variant="outline" className="h-11 px-6 rounded-xl font-bold border-slate-200">
                             <a href={job.url || "#"} target="_blank" rel="noopener noreferrer">Apply</a>
                          </Button>
                          <Button onClick={() => handleTrackJob(job)} className="h-11 px-6 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold">Track</Button>
                          <Button variant="ghost" onClick={() => handleRemoveSaved(job.id)} className="h-11 w-11 rounded-xl text-red-500 hover:bg-red-50"><Trash2 className="w-5 h-5" /></Button>
                       </div>
                    </div>
                 </Card>
               ))}
             </div>
           )}
        </TabsContent>
      </Tabs>

      <ApplyWithResumeDialog
        open={applyDialogOpen}
        onOpenChange={setApplyDialogOpen}
        jobTitle={applyingJob?.title ?? ""}
        companyName={applyingJob?.company_name ?? ""}
        onSubmit={handleApplySubmit}
      />
    </div>
  );
}
