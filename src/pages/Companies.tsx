import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { invokeFunction } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, ExternalLink, MapPin, Building2, Globe, Briefcase, Loader2, ChevronDown, Share2, Zap, Star, ShieldCheck,
  TrendingUp, BarChart3, Target, Sparkles, Clock, Filter, Info, ChevronRight, CheckCircle2, AlertCircle, Eye, Users,
  Pin, PinOff, ChevronLeft
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useAuth } from "@/hooks/useAuth";

interface OpenJob { job_title: string; job_type: string; location: string; url: string; }
interface Company { name: string; logo: string | null; website: string | null; city: string | null; country: string | null; open_jobs: OpenJob[]; }
interface PinnedCompany { company_name: string; company_logo: string | null; company_website: string | null; city: string | null; country: string | null; }

export default function Companies() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [query, setQuery] = useState(() => sessionStorage.getItem("companies_query") || "");
  const [location, setLocation] = useState(() => sessionStorage.getItem("companies_location") || "");
  const [industry, setIndustry] = useState(() => sessionStorage.getItem("companies_industry") || "");
  const [technology, setTechnology] = useState(() => sessionStorage.getItem("companies_technology") || "");
  
  // State for pinned companies pagination index
  const [pinnedIndex, setPinnedIndex] = useState(0);
  
  // State to trigger search queries
  const [activeSearch, setActiveSearch] = useState<{q: string, l: string, i: string, t: string} | null>(() => {
    const saved = sessionStorage.getItem("companies_activeSearch");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    sessionStorage.setItem("companies_query", query);
    sessionStorage.setItem("companies_location", location);
    sessionStorage.setItem("companies_industry", industry);
    sessionStorage.setItem("companies_technology", technology);
    if (activeSearch) {
      sessionStorage.setItem("companies_activeSearch", JSON.stringify(activeSearch));
    } else {
      sessionStorage.removeItem("companies_activeSearch");
    }
  }, [query, location, industry, technology, activeSearch]);

  // Cached Query: Pinned Companies
  const { data: pinnedCompanies = [] } = useQuery({
    queryKey: ["pinned-companies", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("pinned_companies").select("*").eq("user_id", user?.id);
      if (error) throw error;
      return (data || []) as PinnedCompany[];
    },
    enabled: !!user?.id,
  });

  // Adjust pinned index if out of bounds
  useEffect(() => {
    if (pinnedIndex >= pinnedCompanies.length && pinnedCompanies.length > 0) {
      setPinnedIndex(pinnedCompanies.length - 1);
    }
  }, [pinnedCompanies, pinnedIndex]);

  // Cached Query: Search Companies
  const { data: companies = [], isFetching: searching } = useQuery({
    queryKey: ["search-companies", activeSearch],
    queryFn: async () => {
      if (!activeSearch) return [];
      const { data } = await invokeFunction("search-companies", { 
        body: { query: activeSearch.q, location: activeSearch.l, industry: activeSearch.i, technology: activeSearch.t } 
      });
      return (data?.companies || []) as Company[];
    },
    enabled: !!activeSearch,
  });

  const isPinned = (name: string) => pinnedCompanies.some(p => p.company_name === name);

  // Optimistic Mutation: Toggle Pin
  const togglePinMutation = useMutation({
    mutationFn: async (company: Company) => {
      if (!user) throw new Error("Not logged in");
      if (isPinned(company.name)) {
        const { error } = await supabase.from("pinned_companies").delete().eq("user_id", user.id).eq("company_name", company.name);
        if (error) throw error;
        return { pinned: false, name: company.name };
      } else {
        const { error } = await supabase.from("pinned_companies").insert({
          user_id: user.id, company_name: company.name, company_logo: company.logo, company_website: company.website, city: company.city, country: company.country
        });
        if (error) throw error;
        return { pinned: true, name: company.name };
      }
    },
    onMutate: async (company) => {
      await queryClient.cancelQueries({ queryKey: ["pinned-companies", user?.id] });
      const previousPinned = queryClient.getQueryData<PinnedCompany[]>(["pinned-companies", user?.id]);
      
      queryClient.setQueryData<PinnedCompany[]>(["pinned-companies", user?.id], (old = []) => {
        if (isPinned(company.name)) {
          return old.filter(p => p.company_name !== company.name);
        } else {
          return [...old, { 
            company_name: company.name, 
            company_logo: company.logo, 
            company_website: company.website, 
            city: company.city, 
            country: company.country 
          } as PinnedCompany];
        }
      });
      return { previousPinned };
    },
    onError: (err, company, context) => {
      if (context?.previousPinned) {
        queryClient.setQueryData(["pinned-companies", user?.id], context.previousPinned);
      }
      toast({ title: "Failed to update pin", variant: "destructive" });
    },
    onSuccess: (data) => {
      toast({ title: data.pinned ? "Pinned" : "Unpinned" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pinned-companies", user?.id] });
    }
  });

  const handleSearch = () => {
    if (!query && !industry && !technology && !location) return;
    setActiveSearch({ q: query, l: location, i: industry, t: technology });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-left pb-20 font-sans px-4 sm:px-6 lg:px-8">
      <SEOHead title="Find Companies - ResumePro" description="Search for companies and see their open job positions." />
      
      {/* 1. Header Section */}
      <div className="space-y-1 py-4 border-b border-slate-100">
         <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Companies</h1>
         <p className="text-slate-500 font-medium text-sm">Discover companies and their open positions</p>
      </div>

      {/* 2. Pinned Companies Section (Carousel style) */}
      {pinnedCompanies.length > 0 && (
         <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-2">
               <span className="text-[#3b82f6]">📌</span> Pinned Companies
            </h2>
            
            <div className="relative flex items-center w-full gap-4">
               {/* Left Control Arrow */}
               <Button 
                  variant="outline" 
                  size="icon" 
                  className="w-9 h-9 rounded-full bg-slate-600 hover:bg-slate-700 text-white flex-shrink-0 border-none flex items-center justify-center shadow-md transition-all"
                  onClick={() => setPinnedIndex(prev => (prev === 0 ? pinnedCompanies.length - 1 : prev - 1))}
               >
                  <ChevronLeft className="w-5 h-5 text-white" />
               </Button>
               
               {/* Card Display */}
               {pinnedCompanies[pinnedIndex] && (() => {
                  const pComp = pinnedCompanies[pinnedIndex];
                  return (
                     <Card className="flex-1 rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex gap-4 items-start w-full">
                           <div className="w-14 h-14 rounded-xl bg-white border border-slate-100 p-2 flex items-center justify-center flex-shrink-0 shadow-sm">
                              {pComp.company_logo ? (
                                 <img src={pComp.company_logo} alt={pComp.company_name} className="w-full h-full object-contain" />
                              ) : (
                                 <Building2 className="w-6 h-6 text-slate-400" />
                              )}
                           </div>
                           <div className="space-y-3 flex-1">
                              <div>
                                 <h3 className="text-base font-bold text-slate-900">{pComp.company_name}</h3>
                                 <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                                       <MapPin className="w-3.5 h-3.5 text-slate-400" /> {pComp.city || "Dubai"}, {pComp.country || "AE"}
                                    </span>
                                    <Badge className="bg-[#eff6ff] text-[#1d4ed8] border-none text-[9px] font-bold uppercase tracking-wide gap-1 rounded-full px-2.5 py-0.5 shadow-sm">
                                       <Pin className="w-2.5 h-2.5 rotate-[45deg] fill-current" /> Pinned
                                    </Badge>
                                 </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                 <Button 
                                    onClick={() => togglePinMutation.mutate({ name: pComp.company_name, logo: pComp.company_logo, website: pComp.company_website, city: pComp.city, country: pComp.country, open_jobs: [] })}
                                    variant="outline" 
                                    size="sm" 
                                    className="h-9 px-3 rounded-lg border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-slate-600 gap-1.5 uppercase transition-colors"
                                 >
                                    <PinOff className="w-3.5 h-3.5" /> Unpin
                                 </Button>
                                 <Button 
                                    onClick={() => {
                                       navigator.clipboard.writeText(pComp.company_website || "");
                                       toast({ title: "Copied Link", description: "Website link copied to clipboard." });
                                    }}
                                    variant="outline" 
                                    size="sm" 
                                    className="h-9 px-3 rounded-lg border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-slate-600 gap-1.5 uppercase transition-colors"
                                 >
                                    <Share2 className="w-3.5 h-3.5" /> Share
                                 </Button>
                                 <Button 
                                    onClick={() => window.open(pComp.company_website || "#", "_blank")}
                                    variant="outline" 
                                    size="sm" 
                                    className="h-9 px-3 rounded-lg border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-slate-600 gap-1.5 uppercase transition-colors"
                                 >
                                       <Globe className="w-3.5 h-3.5" /> Website
                                 </Button>
                              </div>
                           </div>
                        </div>
                     </Card>
                  );
               })()}
               
               {/* Right Control Arrow */}
               <Button 
                  variant="outline" 
                  size="icon" 
                  className="w-9 h-9 rounded-full bg-slate-600 hover:bg-slate-700 text-white flex-shrink-0 border-none flex items-center justify-center shadow-md transition-all"
                  onClick={() => setPinnedIndex(prev => (prev === pinnedCompanies.length - 1 ? 0 : prev + 1))}
               >
                  <ChevronRight className="w-5 h-5 text-white" />
               </Button>
            </div>
         </div>
      )}

      {/* 3. Horizontal Search Form */}
      <Card className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm w-full">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
            <div className="lg:col-span-3 space-y-1.5 text-left">
               <Label className="text-xs font-semibold text-slate-700">Company or Keyword</Label>
               <Input 
                  value={query} 
                  onChange={e => setQuery(e.target.value)} 
                  placeholder="e.g. Google, startup" 
                  className="h-11 rounded-lg border-slate-200 bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium text-xs text-slate-900"
               />
            </div>
            
            <div className="lg:col-span-2 space-y-1.5 text-left">
               <Label className="text-xs font-semibold text-slate-700">Industry</Label>
               <Input 
                  value={industry} 
                  onChange={e => setIndustry(e.target.value)} 
                  placeholder="e.g. Technology, Finance" 
                  className="h-11 rounded-lg border-slate-200 bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium text-xs text-slate-900"
               />
            </div>
            
            <div className="lg:col-span-2 space-y-1.5 text-left">
               <Label className="text-xs font-semibold text-slate-700">Technology</Label>
               <Input 
                  value={technology} 
                  onChange={e => setTechnology(e.target.value)} 
                  placeholder="e.g. React, Python" 
                  className="h-11 rounded-lg border-slate-200 bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium text-xs text-slate-900"
               />
            </div>

            <div className="lg:col-span-2 space-y-1.5 text-left">
               <Label className="text-xs font-semibold text-slate-700">Location</Label>
               <Input 
                  value={location} 
                  onChange={e => setLocation(e.target.value)} 
                  placeholder="e.g. New York, Remote" 
                  className="h-11 rounded-lg border-slate-200 bg-white focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-medium text-xs text-slate-900"
               />
            </div>

            <div className="lg:col-span-3">
               <Button 
                  onClick={handleSearch} 
                  disabled={searching} 
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider text-[10px] gap-2 rounded-lg shadow-lg shadow-blue-600/15"
               >
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} SEARCH COMPANIES
               </Button>
            </div>
         </div>
      </Card>

      {/* 4. Results Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-8">
            
            {/* Search Results */}
               <div className="space-y-4">
                  {(searching || companies.length > 0 || activeSearch) && (
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                       <Target className="w-4 h-4 text-slate-400" /> Intelligence Results
                    </h2>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searching ? (
                     [1,2,3,4,5,6].map(i => (
                        <Card key={i} className="rounded-3xl border border-slate-200 bg-white p-6 h-auto lg:h-[320px] flex flex-col justify-between shadow-sm">
                           <div className="space-y-5">
                              <div className="flex items-start justify-between">
                                 <Skeleton className="w-14 h-14 rounded-xl" />
                                 <div className="flex gap-2">
                                    <Skeleton className="w-9 h-9 rounded-lg" />
                                    <Skeleton className="w-9 h-9 rounded-lg" />
                                 </div>
                              </div>
                              <div className="space-y-2">
                                 <Skeleton className="h-5 w-3/4" />
                                 <Skeleton className="h-4 w-1/2" />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-4 border-y border-slate-50">
                                 <div className="space-y-2">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-4 w-12" />
                                 </div>
                                 <div className="space-y-2">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-4 w-8" />
                                 </div>
                              </div>
                           </div>
                           <Skeleton className="h-11 w-full rounded-xl mt-4" />
                        </Card>
                     ))
                  ) : companies.length === 0 && activeSearch ? (
                     <div className="col-span-full py-32 text-center space-y-6 bg-white rounded-3xl border border-slate-200 border-dashed">
                        <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto border border-slate-100">
                           <Search className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                           <h3 className="text-xl font-bold text-slate-900 tracking-tight uppercase">No Entities Found</h3>
                           <p className="text-slate-500 font-medium text-sm">Adjust your parameters and initialize search again.</p>
                        </div>
                     </div>
                  ) : companies.length === 0 ? (
                     <div className="col-span-full py-32 text-center space-y-6 bg-white rounded-3xl border border-slate-200 border-dashed">
                        <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto border border-slate-100">
                           <ShieldCheck className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                           <h3 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Intelligence Matrix Standby</h3>
                           <p className="text-slate-500 font-medium text-sm">Initialize parameters to synchronize with target entities.</p>
                        </div>
                     </div>
                  ) : (
                     <div className="contents">
                        {companies.map((company, i) => (
                           <div key={company.name}>
                              <Card className="rounded-3xl border border-slate-200 bg-white p-6 hover:border-blue-600/30 hover:shadow-xl transition-all duration-300 group relative overflow-hidden h-full flex flex-col justify-between">
                                 <div className="space-y-5">
                                    <div className="flex items-start justify-between">
                                       <div className="w-14 h-14 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                          {company.logo ? <img src={company.logo} alt={company.name} className="w-full h-full object-cover" /> : <Building2 className="w-6 h-6" />}
                                       </div>
                                       <div className="flex gap-2">
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button onClick={() => toast({ title: "Intelligence Shared", description: "Entity parameters have been synchronized to your clipboard." })} variant="ghost" size="icon" className="w-9 h-9 rounded-lg hover:bg-slate-50"><Share2 className="w-4 h-4 text-slate-400" /></Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">
                                              Share entity data
                                            </TooltipContent>
                                          </Tooltip>
                                          
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Button onClick={() => togglePinMutation.mutate(company)} variant="ghost" size="icon" className={cn("w-9 h-9 rounded-lg transition-all", isPinned(company.name) ? "text-blue-600 bg-blue-50" : "text-slate-300 hover:text-blue-600")}>
                                                 <Star className={cn("w-4 h-4", isPinned(company.name) && "fill-current")} />
                                              </Button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">
                                              {isPinned(company.name) ? "Unpin entity" : "Pin entity"}
                                            </TooltipContent>
                                          </Tooltip>
                                       </div>
                                    </div>

                                    <div className="space-y-1">
                                       <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors line-clamp-1">{company.name}</h3>
                                       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                          <MapPin className="w-3 h-3" /> {company.city}, {company.country}
                                       </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-4 border-y border-slate-50">
                                       <div className="space-y-1">
                                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Hiring Score</p>
                                          <div className="flex items-center gap-2">
                                             <span className="text-xs font-bold text-emerald-600">High</span>
                                             <TrendingUp className="w-3 h-3 text-emerald-500" />
                                          </div>
                                       </div>
                                       <div className="space-y-1">
                                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Open Roles</p>
                                          <p className="text-xs font-bold text-slate-900">{company.open_jobs.length}</p>
                                       </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 pt-2">
                                       <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-slate-100 text-[8px] px-1.5 h-4 font-bold uppercase">Series C</Badge>
                                       <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-slate-100 text-[8px] px-1.5 h-4 font-bold uppercase">Remote</Badge>
                                    </div>
                                 </div>
                                 
                                 <div className="pt-6 space-y-3">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button onClick={() => window.open(company.website || '#', '_blank')} variant="outline" className="w-full h-11 rounded-xl border-slate-100 text-slate-900 font-bold uppercase tracking-widest text-[9px] gap-2 hover:bg-slate-900 hover:text-white transition-all">
                                           Launch Intelligence <ExternalLink className="w-3.5 h-3.5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">
                                        Open company website
                                      </TooltipContent>
                                    </Tooltip>

                                    {company.open_jobs && company.open_jobs.length > 0 && (
                                       <Accordion type="single" collapsible className="w-full">
                                          <AccordionItem value="jobs" className="border-none">
                                             <AccordionTrigger className="py-2 hover:no-underline text-[10px] font-bold text-slate-500 uppercase tracking-widest data-[state=open]:text-blue-600 bg-slate-50 px-3 rounded-xl border border-slate-100">
                                                View Open Roles ({company.open_jobs.length})
                                             </AccordionTrigger>
                                             <AccordionContent className="pt-3 pb-0 space-y-2">
                                                {company.open_jobs.slice(0, 5).map((job, jdx) => (
                                                   <div key={jdx} className="p-3 bg-white border border-slate-100 rounded-xl hover:border-blue-200 transition-colors">
                                                      <h4 className="text-[11px] font-bold text-slate-900 line-clamp-1">{job.job_title}</h4>
                                                      <div className="flex items-center gap-2 mt-1 mb-3 text-[9px] font-bold text-slate-400 uppercase">
                                                         <Briefcase className="w-3 h-3" /> {job.job_type || "Full-time"} 
                                                         <MapPin className="w-3 h-3 ml-1" /> {job.location || "Remote"}
                                                      </div>
                                                      <Button onClick={() => window.open(job.url || company.website || '#', '_blank')} className="w-full h-8 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white text-[9px] font-bold uppercase tracking-widest rounded-lg">
                                                         Apply Direct <ExternalLink className="w-3 h-3 ml-1.5" />
                                                      </Button>
                                                   </div>
                                                ))}
                                                {company.open_jobs.length > 5 && (
                                                   <p className="text-[9px] font-bold text-center text-slate-400 pt-2 uppercase">
                                                      + {company.open_jobs.length - 5} more roles on their site
                                                   </p>
                                                )}
                                             </AccordionContent>
                                          </AccordionItem>
                                       </Accordion>
                                    )}
                                 </div>
                              </Card>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>
         </div>

            {/* AI Insights Sidebar */}
            <div className="lg:col-span-4 space-y-8">
               <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600" /> Entity Analysis
                     </h3>
                     <Badge className="bg-blue-50 text-blue-600 border-none text-[8px] font-bold uppercase">Live</Badge>
                  </div>
                  
                  <div className="space-y-6">
                     <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                           <span className="text-slate-400">Recruiter Engagement</span>
                           <span className="text-emerald-600">Active</span>
                        </div>
                        <Progress value={92} className="h-1.5 bg-slate-50" />
                     </div>

                     <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                        <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                           <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> Growth Velocity
                        </h4>
                        <div className="flex items-center gap-4">
                           <div className="flex-1 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center">
                              <div className="flex gap-0.5 items-end h-4">
                                 {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
                                    <div key={i} className="w-1.5 bg-blue-600/20 rounded-t-[1px]" style={{ height: `${h}%` }} />
                                 ))}
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-bold text-slate-900">+14.2%</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase">QoQ Headcount</p>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Trending Sectors</h4>
                        {[
                           { label: "Fintech", value: "High Growth", icon: BarChart3, color: "text-blue-500" },
                           { label: "AI Infrastructure", value: "Surging", icon: Zap, color: "text-amber-500" },
                           { label: "Climate Tech", value: "Trending", icon: Globe, color: "text-emerald-500" },
                        ].map((sector, i) => (
                           <div key={i} className="flex items-center justify-between">
                              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-2">
                                 <sector.icon className={cn("w-3.5 h-3.5", sector.color)} /> {sector.label}
                              </span>
                              <span className="text-[10px] font-bold text-slate-900 uppercase">{sector.value}</span>
                           </div>
                        ))}
                     </div>
                  </div>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={() => toast({ title: "Analysis Exported", description: "Intelligence report generated in PDF format." })} variant="outline" className="w-full h-10 rounded-xl border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all">Export Analysis</Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">
                      Export to PDF
                    </TooltipContent>
                  </Tooltip>
               </Card>


            </div>
         </div>
    </div>
  );
}
