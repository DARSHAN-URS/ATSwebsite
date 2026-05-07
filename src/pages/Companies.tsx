import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { invokeFunction } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import {
  Search, ExternalLink, MapPin, Building2, Globe, Briefcase, Loader2, ChevronDown, ChevronUp, Pin, PinOff, Share2, Zap, ArrowRight, Star
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SEOHead from "@/components/SEOHead";
import { motion, AnimatePresence } from "framer-motion";

interface OpenJob {
  job_title: string;
  job_type: string;
  location: string;
  url: string;
  posted_date: string | null;
  description: string;
}

interface Company {
  name: string;
  logo: string | null;
  website: string | null;
  company_type: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  open_jobs: OpenJob[];
}

interface PinnedCompany {
  id: string;
  company_name: string;
  company_logo: string | null;
  company_website: string | null;
  company_type: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  created_at: string;
}

export default function Companies() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searching, setSearching] = useState(false);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const [pinnedCompanies, setPinnedCompanies] = useState<PinnedCompany[]>([]);
  const [pinLoading, setPinLoading] = useState<string | null>(null);

  const fetchPinned = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("pinned_companies")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPinnedCompanies(data);
  }, [user]);

  useEffect(() => {
    fetchPinned();
  }, [fetchPinned]);

  const isPinned = (name: string) => pinnedCompanies.some((p) => p.company_name === name);

  const togglePin = async (company: Company) => {
    if (!user) return;
    setPinLoading(company.name);
    try {
      if (isPinned(company.name)) {
        await supabase
          .from("pinned_companies")
          .delete()
          .eq("user_id", user.id)
          .eq("company_name", company.name);
      } else {
        await supabase.from("pinned_companies").insert({
          user_id: user.id,
          company_name: company.name,
          company_logo: company.logo,
          company_website: company.website,
          company_type: company.company_type,
          city: company.city,
          state: company.state,
          country: company.country,
        });
      }
      await fetchPinned();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setPinLoading(null);
    }
  };

  const unpinCompany = async (name: string) => {
    if (!user) return;
    setPinLoading(name);
    try {
      await supabase
        .from("pinned_companies")
        .delete()
        .eq("user_id", user.id)
        .eq("company_name", name);
      await fetchPinned();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setPinLoading(null);
    }
  };

  const handleSearch = async () => {
    if (!query && !industry && !location) {
      toast({ title: t.companies.enterSearch, variant: "destructive" });
      return;
    }
    setSearching(true);
    setCompanies([]);
    try {
      const { data, error } = await invokeFunction("search-companies", {
        body: { query, location: location || undefined, industry: industry || undefined },
      });
      if (error) throw error;
      setCompanies(data?.companies ?? []);
    } catch (e: any) {
      toast({ title: t.companies.searchFailed, description: e.message, variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  const toggleExpand = (name: string) => {
    setExpandedCompany(expandedCompany === name ? null : name);
  };

  const shareToSocial = (platform: string, name: string, website: string | null) => {
    const text = encodeURIComponent(`Check out ${name} on ResumePro!`);
    const url = encodeURIComponent(website || window.location.href);
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };
    window.open(urls[platform], "_blank", "noopener,noreferrer,width=600,height=500");
  };

  const renderCompanyCard = (company: Company | PinnedCompany, isPinnedSection = false) => {
    const isSearchResult = "name" in company && "open_jobs" in company;
    const name = isSearchResult ? (company as Company).name : (company as PinnedCompany).company_name;
    const logo = isSearchResult ? (company as Company).logo : (company as PinnedCompany).company_logo;
    const website = isSearchResult ? (company as Company).website : (company as PinnedCompany).company_website;
    const city = company.city;
    const country = company.country;
    const openJobs = isSearchResult ? (company as Company).open_jobs : [];
    const pinned = isPinned(name);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        key={name}
      >
        <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all overflow-hidden group">
          <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex gap-6">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-100 dark:border-slate-700 overflow-hidden">
                   {logo ? <img src={logo} alt={name} className="w-full h-full object-cover" /> : <Building2 className="w-8 h-8" />}
                </div>
                <div>
                   <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{name}</h3>
                   <div className="flex flex-wrap items-center gap-4 mt-2 text-sm font-bold text-slate-500">
                      {website && <span className="flex items-center gap-1.5 text-primary hover:underline cursor-pointer" onClick={() => window.open(website, '_blank')}><Globe className="w-4 h-4" /> {website.replace('https://', '')}</span>}
                      {(city || country) && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {[city, country].filter(Boolean).join(", ")}</span>}
                   </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isSearchResult && openJobs.length > 0 && (
                   <div className="px-4 py-2 rounded-xl bg-primary/5 text-primary border border-primary/10 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5" /> {openJobs.length} Roles
                   </div>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => isPinnedSection ? unpinCompany(name) : togglePin(company as Company)} 
                  className={`h-11 w-11 rounded-xl transition-all ${pinned ? "bg-amber-50 text-amber-500" : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-amber-500"}`}
                >
                   {pinned ? <Star className="w-5 h-5 fill-amber-500" /> : <Star className="w-5 h-5" />}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400">
                       <Share2 className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="rounded-xl">
                    <DropdownMenuItem onClick={() => shareToSocial("twitter", name, website)}>Twitter / X</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => shareToSocial("linkedin", name, website)}>LinkedIn</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {isSearchResult && openJobs.length > 0 && (
                  <Button variant="ghost" size="icon" onClick={() => toggleExpand(name)} className="h-11 w-11 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400">
                     <ChevronDown className={`w-5 h-5 transition-transform ${expandedCompany === name ? "rotate-180" : ""}`} />
                  </Button>
                )}
              </div>
            </div>
          </div>
          <AnimatePresence>
            {!isPinnedSection && expandedCompany === name && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30"
              >
                 <div className="p-8 space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Open Opportunities</h4>
                    {openJobs.map((job, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{job.job_title}</p>
                          <p className="text-xs text-slate-500 font-medium">{job.location} • {job.job_type}</p>
                        </div>
                        <Button asChild variant="outline" size="sm" className="rounded-xl font-bold border-slate-200">
                          <a href={job.url} target="_blank" rel="noopener noreferrer">View Role <ExternalLink className="w-3.5 h-3.5 ml-2" /></a>
                        </Button>
                      </div>
                    ))}
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <SEOHead title="Companies — ResumePro" description="Discover and follow companies you love." noindex />
      
      <div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Explore <span className="text-primary">Companies</span></h1>
        <p className="text-slate-500 mt-2 font-medium">Follow top employers and stay updated on new openings.</p>
      </div>

      {pinnedCompanies.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Pinned Companies</h2>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {pinnedCompanies.map((pc) => renderCompanyCard(pc, true))}
          </div>
        </div>
      )}

      <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <CardContent className="p-8">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Search</Label>
                 <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Company name..." className="pl-11 rounded-xl h-12" />
                 </div>
              </div>
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Industry</Label>
                 <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Fintech" className="rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location</Label>
                 <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. San Francisco" className="rounded-xl h-12" />
              </div>
              <div className="flex items-end">
                 <Button onClick={handleSearch} disabled={searching} className="w-full h-12 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-primary/20 gap-2">
                    {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    {searching ? "Searching..." : "Find Companies"}
                 </Button>
              </div>
           </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {searching ? (
          <div className="py-20 text-center space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
               <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <p className="text-slate-500 font-bold">Discovering top companies matching your criteria...</p>
          </div>
        ) : companies.map((company) => renderCompanyCard(company))}
        
        {!searching && companies.length === 0 && !pinnedCompanies.length && (
           <div className="py-20 text-center space-y-6 rounded-[3rem] bg-slate-50/50 dark:bg-slate-900/50 border-2 border-dashed border-slate-100 dark:border-slate-800">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Start your search</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto">Search for companies to follow their career pages and see open roles.</p>
           </div>
        )}
      </div>
    </div>
  );
}
