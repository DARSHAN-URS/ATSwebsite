import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { invokeFunction } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, ExternalLink, MapPin, Building2, Globe, Briefcase, Loader2, ChevronDown, Share2, Zap, Star, ShieldCheck,
  TrendingUp, BarChart3, Target, Sparkles, Clock, Filter, Info, ChevronRight, CheckCircle2, AlertCircle, Eye, Users
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface OpenJob { job_title: string; job_type: string; location: string; url: string; }
interface Company { name: string; logo: string | null; website: string | null; city: string | null; country: string | null; open_jobs: OpenJob[]; }
interface PinnedCompany { company_name: string; company_logo: string | null; company_website: string | null; city: string | null; country: string | null; }

export default function Companies() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searching, setSearching] = useState(false);
  const [pinnedCompanies, setPinnedCompanies] = useState<PinnedCompany[]>([]);

  const fetchPinned = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("pinned_companies").select("*");
    if (data) setPinnedCompanies(data);
  }, []);

  useEffect(() => { fetchPinned(); }, [fetchPinned]);

  const isPinned = (name: string) => pinnedCompanies.some(p => p.company_name === name);

  const togglePin = async (company: Company) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (isPinned(company.name)) {
      await supabase.from("pinned_companies").delete().eq("user_id", user.id).eq("company_name", company.name);
      toast({ title: "Unpinned" });
    } else {
      await supabase.from("pinned_companies").insert({
        user_id: user.id, company_name: company.name, company_logo: company.logo, company_website: company.website, city: company.city, country: company.country
      });
      toast({ title: "Pinned" });
    }
    fetchPinned();
  };

  const handleSearch = async () => {
    if (!query) return;
    setSearching(true);
    try {
      const { data } = await invokeFunction("search-companies", { body: { query, location, industry } });
      setCompanies(data?.companies ?? []);
      toast({ title: "Search Completed", description: `Found ${data?.companies?.length || 0} companies.` });
    } catch (e: any) {
      toast({ title: "Search Failed", variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] font-sans pb-20 text-left">
      <SEOHead title="Find Companies — ResumePro" description="Search for companies and see their open job positions." />
      
      <div className="max-w-7xl mx-auto space-y-8 text-left p-8 md:p-10">
         
         {/* 1. SaaS Hero Section */}
         <div className="relative bg-white rounded-3xl p-8 md:p-10 overflow-hidden border border-slate-200 shadow-sm">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100 text-blue-600">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Enterprise Intelligence Active</span>
                   </div>
                   <div className="space-y-1">
                     <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-none uppercase">
                        Companies.
                     </h1>
                     <p className="text-slate-500 font-medium text-sm max-w-xl">Industry-leading enterprises and active deployment hubs synchronized in real-time.</p>
                   </div>
                </div>

               <div className="flex items-center gap-6">
                  <div className="text-right">
                     <p className="text-2xl font-bold text-slate-900 leading-none">1,284</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Hiring</p>
                  </div>
                  <div className="w-px h-10 bg-slate-100" />
                  <div className="text-right">
                     <p className="text-2xl font-bold text-blue-600 leading-none">237</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Matches</p>
                  </div>
               </div>
            </div>
         </div>

         {/* 2. Intelligence Search Workspace */}
         <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-600/[0.01] pointer-events-none group-focus-within:bg-blue-600/[0.02] transition-colors" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end relative z-10">
               <div className="lg:col-span-5 space-y-2">
                  <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-1 flex items-center gap-2">
                     <Building2 className="w-3 h-3" /> Entity Name
                  </Label>
                  <div className="relative group/search">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/search:text-blue-600 transition-colors" />
                     <Input 
                        value={query} 
                        onChange={e => setQuery(e.target.value)} 
                        placeholder="e.g. Google, Microsoft, Stripe" 
                        className="h-12 pl-11 pr-14 rounded-xl bg-slate-50 border-slate-200 font-bold text-sm focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all" 
                     />
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[8px] font-bold text-slate-400">
                        <span>⌘</span><span>K</span>
                     </div>
                  </div>
               </div>
               <div className="lg:col-span-4 space-y-2">
                  <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-1 flex items-center gap-2">
                     <MapPin className="w-3 h-3" /> HQ / Regional Focus
                  </Label>
                  <div className="relative">
                     <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <Input 
                        value={location} 
                        onChange={e => setLocation(e.target.value)} 
                        placeholder="London, Remote" 
                        className="h-12 pl-11 rounded-xl bg-slate-50 border-slate-200 font-bold text-sm focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all" 
                     />
                  </div>
               </div>
               <div className="lg:col-span-3">
                  <Button onClick={handleSearch} disabled={searching} className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] gap-3 shadow-xl shadow-slate-900/10 hover:bg-blue-600 transition-all">
                     {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Initialize Search
                  </Button>
               </div>
            </div>

            <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-100 overflow-x-auto pb-2 scrollbar-hide">
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pr-2 border-r border-slate-100">Quick Filters:</span>
               {["Series B+", "Fintech", "FAANG", "1000+ Employees", "Series D", "Venture Backed"].map(chip => (
                  <button key={chip} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-bold text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all whitespace-nowrap">
                     {chip}
                  </button>
               ))}
            </div>
         </Card>

         {/* 3. Analytics & Intelligence Workspace */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[500px]">
                  {searching ? (
                     [1,2,3,4,5,6].map(i => <div key={i} className="h-64 rounded-3xl bg-white animate-pulse border border-slate-200 shadow-sm" />)
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
                     <AnimatePresence>
                        {companies.map((company, i) => (
                           <motion.div key={company.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                              <Card className="rounded-3xl border border-slate-200 bg-white p-6 hover:border-blue-600/30 hover:shadow-xl transition-all duration-300 group relative overflow-hidden h-full flex flex-col justify-between">
                                 <div className="space-y-5">
                                    <div className="flex items-start justify-between">
                                       <div className="w-14 h-14 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                          {company.logo ? <img src={company.logo} alt={company.name} className="w-full h-full object-cover" /> : <Building2 className="w-6 h-6" />}
                                       </div>
                                       <div className="flex gap-2">
                                          <Button variant="ghost" size="icon" className="w-9 h-9 rounded-lg hover:bg-slate-50"><Share2 className="w-4 h-4 text-slate-400" /></Button>
                                          <Button onClick={() => togglePin(company)} variant="ghost" size="icon" className={cn("w-9 h-9 rounded-lg transition-all", isPinned(company.name) ? "text-blue-600 bg-blue-50" : "text-slate-300 hover:text-blue-600")}>
                                             <Star className={cn("w-4 h-4", isPinned(company.name) && "fill-current")} />
                                          </Button>
                                       </div>
                                    </div>

                                    <div className="space-y-1">
                                       <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors line-clamp-1">{company.name}</h3>
                                       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                          <MapPin className="w-3 h-3" /> {company.city}, {company.country}
                                       </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 py-4 border-y border-slate-50">
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

                                 <div className="pt-6">
                                    <Button onClick={() => window.open(company.website || '#', '_blank')} variant="outline" className="w-full h-11 rounded-xl border-slate-100 text-slate-900 font-bold uppercase tracking-widest text-[9px] gap-2 hover:bg-slate-900 hover:text-white transition-all">
                                       Launch Intelligence <ExternalLink className="w-3.5 h-3.5" />
                                    </Button>
                                 </div>
                              </Card>
                           </motion.div>
                        ))}
                     </AnimatePresence>
                  )}
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
                  
                  <Button variant="outline" className="w-full h-10 rounded-xl border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all">Export Analysis</Button>
               </Card>

               {/* Recruiter Activity Sidebar Card */}
               <Card className="rounded-3xl border border-slate-200 bg-slate-900 p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2" />
                  <div className="relative z-10 space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                           <Users className="w-5 h-5" />
                        </div>
                        <Badge className="bg-white/10 text-white border-none text-[8px] font-bold uppercase">Active</Badge>
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-white text-base font-bold tracking-tight">Active Recruiter Hubs</h3>
                        <p className="text-slate-400 text-[11px] leading-relaxed">Recruiters from <span className="text-blue-400 font-bold">FAANG</span> and <span className="text-blue-400 font-bold">Top Tier Startups</span> are searching for your skill profile.</p>
                     </div>
                     <Button className="w-full h-10 rounded-xl bg-white text-slate-900 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-50 transition-all">Increase Visibility</Button>
                  </div>
               </Card>
            </div>
         </div>
      </div>
    </div>
  );
}
      </div>
    </div>
  );
}
