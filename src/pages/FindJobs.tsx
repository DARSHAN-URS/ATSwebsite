import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [location, setLocation] = useState(() => sessionStorage.getItem("findJobs_location") || "");
  const [jobType, setJobType] = useState(() => sessionStorage.getItem("findJobs_jobType") || "all");
  const [searchQuery, setSearchQuery] = useState(() => sessionStorage.getItem("findJobs_searchQuery") || "");
  const [activeSearch, setActiveSearch] = useState<{q: string, l: string, t: string} | null>(() => {
    const saved = sessionStorage.getItem("findJobs_activeSearch");
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState<"ai" | "recruiter" | "external" | "saved">(() => (sessionStorage.getItem("findJobs_activeTab") as any) || "ai");

  useEffect(() => {
    sessionStorage.setItem("findJobs_location", location);
    sessionStorage.setItem("findJobs_jobType", jobType);
    sessionStorage.setItem("findJobs_searchQuery", searchQuery);
    sessionStorage.setItem("findJobs_activeTab", activeTab);
    if (activeSearch) {
      sessionStorage.setItem("findJobs_activeSearch", JSON.stringify(activeSearch));
    } else {
      sessionStorage.removeItem("findJobs_activeSearch");
    }
  }, [location, jobType, searchQuery, activeSearch, activeTab]);

  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applyingJob, setApplyingJob] = useState<JobPost | null>(null);

  // Cached Queries
  const { data: resumes = [], isSuccess: resumesLoaded } = useQuery({
    queryKey: ["resumes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("resumes").select("*").eq("user_id", user?.id).order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Resume[];
    },
    enabled: !!user?.id,
  });

  // Automatically select first resume on load
  if (resumesLoaded && resumes.length > 0 && !selectedResumeId) {
    setSelectedResumeId(resumes[0].id);
  }

  const { data: savedJobs = [] } = useQuery({
    queryKey: ["saved-jobs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("saved_jobs").select("*").eq("user_id", user?.id);
      if (error) throw error;
      return (data || []) as SavedJob[];
    },
    enabled: !!user?.id,
  });

  const { data: boardJobs = [], isLoading: boardLoading } = useQuery({
    queryKey: ["board-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("job_posts").select("*").eq("status", "active").order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as JobPost[];
    }
  });

  const selectedResume = resumes.find(r => r.id === selectedResumeId);
  const parsedResumeData = (() => {
    if (!selectedResume) return null;
    try {
      return typeof selectedResume.resume_data === 'string' 
        ? JSON.parse(selectedResume.resume_data) 
        : selectedResume.resume_data;
    } catch (e) {
      return selectedResume.resume_data || null;
    }
  })();

  const { data: jobs = [], isFetching: searching } = useQuery({
    queryKey: ["search-jobs", activeSearch, selectedResumeId],
    queryFn: async () => {
      if (!activeSearch) return [];
      const { data, error } = await invokeFunction("search-jobs", { 
        body: { 
          query: activeSearch.q, 
          location: activeSearch.l, 
          job_type: activeSearch.t === "all" ? "" : activeSearch.t, 
          resume_data: parsedResumeData,
          resume_title: selectedResume?.title || ""
        } 
      });
      if (error) throw new Error(typeof error === 'string' ? error : JSON.stringify(error));
      toast({ title: "Scanning Complete", description: `Synchronized ${data?.jobs?.length || 0} mission opportunities.` });
      return (data?.jobs || []) as JobListing[];
    },
    enabled: !!activeSearch,
  });

  const saveJobMutation = useMutation({
    mutationFn: async (job: JobListing) => {
      const { error } = await supabase.from("saved_jobs").insert({
        user_id: user?.id, job_title: job.job_title, company: job.company, location: job.location, job_url: job.url
      });
      if (error) throw error;
    },
    onMutate: async (job) => {
      await queryClient.cancelQueries({ queryKey: ["saved-jobs", user?.id] });
      const previousSaved = queryClient.getQueryData<SavedJob[]>(["saved-jobs", user?.id]);
      
      queryClient.setQueryData<SavedJob[]>(["saved-jobs", user?.id], (old = []) => 
        [...old, { job_title: job.job_title, company: job.company, location: job.location, job_url: job.url } as SavedJob]
      );
      
      return { previousSaved };
    },
    onError: (err, job, context) => {
      if (context?.previousSaved) {
        queryClient.setQueryData(["saved-jobs", user?.id], context.previousSaved);
      }
      toast({ title: "Error saving job", variant: "destructive" });
    },
    onSuccess: () => {
      toast({ title: "Link Saved to Matrix" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-jobs", user?.id] });
    }
  });

  const deleteSavedJobMutation = useMutation({
    mutationFn: async (url: string) => {
      const { error } = await supabase.from("saved_jobs").delete().eq("user_id", user?.id).eq("job_url", url);
      if (error) throw error;
    },
    onMutate: async (url) => {
      await queryClient.cancelQueries({ queryKey: ["saved-jobs", user?.id] });
      const previousSaved = queryClient.getQueryData<SavedJob[]>(["saved-jobs", user?.id]);
      
      queryClient.setQueryData<SavedJob[]>(["saved-jobs", user?.id], (old = []) => 
        old.filter(j => j.job_url !== url)
      );
      return { previousSaved };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-jobs", user?.id] });
    }
  });

  const handleSearch = () => {
    if (!searchQuery && activeTab === "ai") return;
    setActiveSearch({ q: searchQuery, l: location, t: jobType });
  };

  const isSaved = (url: string) => savedJobs.some(sj => sj.job_url === url);

  const resumeSkills = Array.isArray(parsedResumeData?.skills) 
    ? parsedResumeData.skills.map((s: any) => (typeof s === 'string' ? s : s?.name || "").toLowerCase().trim()).filter(Boolean)
    : [];

  const resumeTitle = (parsedResumeData?.personalInfo?.title || selectedResume?.title || "").toLowerCase();

  // Dynamic Market Compatibility
  const marketCompatibility = (() => {
    if (!selectedResume) return 60;
    let score = 65;
    if (resumeTitle) score += 10;
    if (resumeSkills.length > 0) score += Math.min(15, resumeSkills.length * 1.5);
    if (parsedResumeData?.workExperience?.length > 0) score += 10;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const hasTitleOverlap = resumeTitle.includes(q) || q.includes(resumeTitle);
      const hasSkillOverlap = resumeSkills.some((s: string) => q.includes(s) || s.includes(q));
      if (hasTitleOverlap) score += 5;
      if (hasSkillOverlap) score += 5;
    }
    return Math.min(99, Math.round(score));
  })();

  // Dynamic Skill Gaps
  const skillGaps = (() => {
    const q = (searchQuery || resumeTitle || "").toLowerCase();
    let targetSkills = ["System Design", "Cloud Infrastructure", "CI/CD Pipelines", "Agile Methodologies", "Docker", "Kubernetes"];
    
    if (q.includes("front") || q.includes("react") || q.includes("ui") || q.includes("web") || q.includes("design")) {
      targetSkills = ["React", "TypeScript", "Next.js", "Redux", "Tailwind CSS", "Jest", "System Design"];
    } else if (q.includes("back") || q.includes("api") || q.includes("node") || q.includes("python") || q.includes("golang") || q.includes("server")) {
      targetSkills = ["Node.js", "Express", "PostgreSQL", "Redis", "Docker", "AWS Lambda", "System Design"];
    }

    // Filter out skills user already has
    const gaps = targetSkills.filter(ts => !resumeSkills.some((rs: string) => rs.includes(ts.toLowerCase()) || ts.toLowerCase().includes(rs)));
    return gaps.slice(0, 3);
  })();

  const gapImpact = Math.min(18, skillGaps.length * 6);

  // Dynamic Match Factors
  const topMatchFactors = (() => {
    const hasFrontSkills = resumeSkills.some((s: string) => ["react", "vue", "angular", "javascript", "typescript", "css", "html"].includes(s));
    const hasBackSkills = resumeSkills.some((s: string) => ["node", "express", "python", "django", "postgres", "sql", "mongodb", "api"].includes(s));
    
    const factors = [];
    if (hasFrontSkills || hasBackSkills) {
      factors.push({ label: hasFrontSkills ? "Frontend Expertise" : "Backend Expertise", value: "High", icon: CheckCircle2, color: "text-emerald-500" });
    } else {
      factors.push({ label: "Core Competency", value: "Verified", icon: CheckCircle2, color: "text-emerald-500" });
    }

    if (location) {
      factors.push({ label: "Location Alignment", value: "Match", icon: CheckCircle2, color: "text-emerald-500" });
    } else {
      factors.push({ label: "Remote Ready", value: "Verified", icon: CheckCircle2, color: "text-emerald-500" });
    }

    factors.push({ label: "Profile Completeness", value: parsedResumeData?.workExperience?.length > 0 ? "High" : "Medium", icon: CheckCircle2, color: "text-emerald-500" });
    
    return factors;
  })();

  // Dynamic Market Momentum
  const marketMomentum = (() => {
    const title = resumeTitle || searchQuery.toLowerCase() || "";
    if (title.includes("front") || title.includes("react") || title.includes("ui") || title.includes("design")) {
      return {
        text: "Demand for Next.js 14 Server Components and Tailwind CSS v4 design architecture is up 32% this week.",
        roles: ["Staff UI Engineer", "Design System Architect", "Next.js Expert"]
      };
    } else if (title.includes("back") || title.includes("api") || title.includes("node") || title.includes("sys")) {
      return {
        text: "Enterprise migrations to Rust-based tooling and Kubernetes multi-cluster routing have surged 41%.",
        roles: ["Platform Engineer", "Distributed Systems Lead", "Kubernetes Engineer"]
      };
    } else {
      return {
        text: "Roles in Generative AI fine-tuning and secure Vector Database deployments have surged by 48% this week.",
        roles: ["MLOps Engineer", "AI Product Manager", "Prompt Engineer"]
      };
    }
  })();

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-left pb-20 font-sans">
      <SEOHead title="Find Jobs - ResumePro" description="Search and apply for jobs with AI." />
      <ApplyWithResumeDialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen} job={applyingJob} resumes={resumes} onSuccess={() => appliedIds.add(applyingJob?.id || "")} />
      
      {/* 1. SaaS Hero Section */}
      <div className="relative bg-white rounded-3xl p-8 md:p-10 overflow-hidden border border-slate-200 shadow-sm">
         <div className="absolute top-0 right-0 w-full lg:w-[400px] h-auto lg:h-[400px] bg-blue-600/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
         
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
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[120px] md:min-h-[200px] md:min-h-[300px] lg:min-h-auto lg:h-[500px]">
            <div className="lg:col-span-8">
               <AnimatePresence mode="wait">
                  {activeTab === "ai" && (
                     <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                     {searching ? (
                        <div className="space-y-4">
                           {[1,2,3].map(i => (
                              <Card key={i} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row gap-6">
                                 <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
                                 <div className="flex-1 space-y-4">
                                    <div className="space-y-2">
                                       <Skeleton className="h-5 w-1/2" />
                                       <Skeleton className="h-4 w-1/3" />
                                    </div>
                                    <div className="flex gap-2">
                                       <Skeleton className="h-4 w-16 rounded-full" />
                                       <Skeleton className="h-4 w-20 rounded-full" />
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                       <Skeleton className="h-3 w-32" />
                                       <div className="flex gap-2">
                                          <Skeleton className="h-9 w-9 rounded-xl" />
                                          <Skeleton className="h-9 w-24 rounded-xl" />
                                       </div>
                                    </div>
                                 </div>
                              </Card>
                           ))}
                        </div>
                     ) : jobs.length === 0 && activeSearch ? (
                        <Card className="py-24 text-center space-y-6 bg-white rounded-3xl border border-slate-200 border-dashed">
                           <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto">
                              <Search className="w-10 h-10" />
                           </div>
                           <div className="space-y-2 px-4">
                              <h3 className="text-xl font-bold text-slate-900 tracking-tight">No Opportunities Found</h3>
                              <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">Adjust search parameters and try again.</p>
                           </div>
                        </Card>
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
                                 <div key={i} className="mb-4">
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
                                             <Tooltip>
                                               <TooltipTrigger asChild>
                                                 <Button variant="ghost" size="icon" onClick={() => saveJobMutation.mutate(job)} className={cn("h-9 w-9 rounded-xl transition-all", isSaved(job.url) ? "text-rose-500 bg-rose-50" : "text-slate-300 hover:text-rose-500 hover:bg-rose-50")}>
                                                    <Heart className={cn("w-4 h-4", isSaved(job.url) ? "fill-current" : "")} />
                                                 </Button>
                                               </TooltipTrigger>
                                               <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">
                                                 {isSaved(job.url) ? "Saved" : "Save Job"}
                                               </TooltipContent>
                                             </Tooltip>
                                             
                                             <Tooltip>
                                               <TooltipTrigger asChild>
                                                 <Button onClick={() => window.open(job.url, '_blank')} className="h-9 px-4 rounded-xl bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest gap-2 hover:bg-blue-600">
                                                    Apply <ExternalLink className="w-3 h-3" />
                                                 </Button>
                                               </TooltipTrigger>
                                               <TooltipContent className="bg-blue-600 text-white font-bold text-xs rounded-xl border-none">
                                                 Apply externally
                                               </TooltipContent>
                                             </Tooltip>
                                          </div>
                                       </div>
                                    </div>
                                 </Card>
                                 </div>
                           ))}
                        </div>
                     )}
                     </motion.div>
                  )}
                  {activeTab === "recruiter" && (
                     <motion.div key="recruiter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        {boardLoading ? (
                           <div className="space-y-4">
                              {[1,2,3].map(i => (
                                 <Card key={i} className="rounded-3xl border border-slate-200 bg-white p-6 flex items-center gap-6">
                                    <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
                                    <div className="flex-1 space-y-2">
                                       <Skeleton className="h-5 w-1/3" />
                                       <Skeleton className="h-3 w-1/4" />
                                    </div>
                                    <Skeleton className="w-24 h-10 rounded-xl" />
                                 </Card>
                              ))}
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
                                       <Tooltip>
                                         <TooltipTrigger asChild>
                                           <Button variant="ghost" size="icon" onClick={() => window.open(sj.job_url, '_blank')} className="h-10 w-10 rounded-xl hover:text-blue-600"><ExternalLink className="w-4 h-4" /></Button>
                                         </TooltipTrigger>
                                         <TooltipContent className="bg-blue-600 text-white font-bold text-xs rounded-xl border-none">
                                           Open External Listing
                                         </TooltipContent>
                                       </Tooltip>
                                       <Tooltip>
                                         <TooltipTrigger asChild>
                                           <Button onClick={() => deleteSavedJobMutation.mutate(sj.job_url)} variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:text-rose-500"><Trash2 className="w-4 h-4" /></Button>
                                         </TooltipTrigger>
                                         <TooltipContent className="bg-rose-600 text-white font-bold text-xs rounded-xl border-none">
                                           Remove from Saved
                                         </TooltipContent>
                                       </Tooltip>
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
                           <span className="text-blue-600">{marketCompatibility}%</span>
                        </div>
                        <Progress value={marketCompatibility} className="h-1.5 bg-slate-50" />
                     </div>

                     <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                        <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                           <Target className="w-3.5 h-3.5 text-blue-600" /> Skill Gaps Identified
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                           {skillGaps.length === 0 ? (
                              <span className="text-[10px] text-slate-400 font-medium italic">No immediate gaps found. Excellent coverage!</span>
                           ) : (
                              skillGaps.map(skill => (
                                 <Badge key={skill} variant="outline" className="bg-white border-slate-200 text-slate-500 text-[8px] h-5">{skill}</Badge>
                              ))
                           )}
                        </div>
                        {skillGaps.length > 0 && (
                           <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">Adding these could increase match rate by {gapImpact}%</p>
                        )}
                     </div>

                     <div className="space-y-4">
                        <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Top Match Factors</h4>
                        {topMatchFactors.map((factor, i) => (
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
                        <p className="text-slate-400 text-[11px] leading-relaxed">{marketMomentum.text}</p>
                     </div>
                     <div className="space-y-2">
                        {marketMomentum.roles.map(role => (
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
