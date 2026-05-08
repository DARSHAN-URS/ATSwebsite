import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { invokeFunction } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, ExternalLink, MapPin, Building2, Globe, Briefcase, Loader2, ChevronDown, Share2, Zap, Star, ShieldCheck 
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans pb-20">
      <SEOHead title="Find Companies — ResumePro" description="Search for companies and see their open job positions." />
      
      <div className="container mx-auto px-8 pt-16 space-y-16 text-left">
         <div className="flex flex-col md:flex-row items-end justify-between gap-12">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 rounded-full border border-blue-600/20 text-blue-600">
                  <Building2 className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Company Search</span>
               </div>
               <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                  Companies.
               </h1>
            </div>
         </div>

         <Card className="rounded-[4rem] border-none bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
               <div className="lg:col-span-5 space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Company Name</Label>
                  <div className="relative">
                     <Search className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                     <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. Google, Microsoft" className="h-20 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-none px-16 font-bold text-lg" />
                  </div>
               </div>
               <div className="lg:col-span-4 space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Location</Label>
                  <div className="relative">
                     <MapPin className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                     <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. London" className="h-20 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-none px-16 font-bold" />
                  </div>
               </div>
               <div className="lg:col-span-3">
                  <Button onClick={handleSearch} disabled={searching} className="w-full h-20 rounded-[2rem] bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] gap-3 shadow-2xl shadow-blue-600/20">
                     {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />} Search
                  </Button>
               </div>
            </div>
         </Card>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {searching ? (
               [1,2,3].map(i => <div key={i} className="h-64 rounded-[4rem] bg-white animate-pulse shadow-sm" />)
            ) : companies.length === 0 ? (
               <div className="col-span-full py-40 text-center space-y-6">
                  <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center text-slate-300 mx-auto"><ShieldCheck className="w-12 h-12" /></div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Ready to search</h3>
                  <p className="text-slate-500 font-medium">Search for companies to see their active jobs.</p>
               </div>
            ) : (
               <AnimatePresence>
                  {companies.map((company, i) => (
                     <motion.div key={company.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <Card className="rounded-[4rem] border-none bg-white dark:bg-slate-900 p-12 shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-2xl hover:-translate-y-2 transition-all space-y-8 text-left">
                           <div className="flex items-start justify-between">
                              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl overflow-hidden flex items-center justify-center border-4 border-white dark:border-slate-700 shadow-xl">
                                 {company.logo ? <img src={company.logo} alt={company.name} className="w-full h-full object-cover" /> : <Building2 className="w-8 h-8 text-slate-300" />}
                              </div>
                              <Button onClick={() => togglePin(company)} variant="ghost" size="icon" className={cn("w-12 h-12 rounded-2xl", isPinned(company.name) && "bg-blue-50 text-blue-600")}>
                                 <Star className={cn("w-5 h-5", isPinned(company.name) && "fill-current")} />
                              </Button>
                           </div>

                           <div className="space-y-2">
                              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter line-clamp-1">{company.name}</h3>
                              <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
                                 <MapPin className="w-4 h-4" /> {company.city}, {company.country}
                              </div>
                           </div>

                           <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                              <div className="flex items-center justify-between">
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Open Jobs</span>
                                 <span className="text-blue-600 font-black">{company.open_jobs.length} roles</span>
                              </div>
                              <Button onClick={() => window.open(company.website || '#', '_blank')} variant="outline" className="w-full h-16 rounded-2xl border-slate-100 font-black uppercase tracking-widest text-[10px] gap-3 hover:bg-blue-600 hover:text-white transition-all">
                                 Visit Website <ExternalLink className="w-4 h-4" />
                              </Button>
                           </div>
                        </Card>
                     </motion.div>
                  ))}
               </AnimatePresence>
            )}
         </div>
      </div>
    </div>
  );
}
