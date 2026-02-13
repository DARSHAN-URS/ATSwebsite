import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import {
  Search, ExternalLink, MapPin, Building2, Globe, Briefcase, Loader2, ChevronDown, ChevronUp, Pin, PinOff,
} from "lucide-react";

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
      const { data, error } = await supabase.functions.invoke("search-companies", {
        body: { query, location: location || undefined, industry: industry || undefined },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setCompanies(data?.companies ?? []);
      if (data?.companies?.length === 0) {
        toast({ title: t.companies.noResults, description: t.companies.noResultsDesc });
      }
    } catch (e: any) {
      toast({ title: t.companies.searchFailed, description: e.message, variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  const toggleExpand = (name: string) => {
    setExpandedCompany(expandedCompany === name ? null : name);
  };

  const renderCompanyCard = (company: Company | PinnedCompany, isPinnedSection = false) => {
    const isSearchResult = "name" in company && "open_jobs" in company;
    const name = isSearchResult ? (company as Company).name : (company as PinnedCompany).company_name;
    const logo = isSearchResult ? (company as Company).logo : (company as PinnedCompany).company_logo;
    const website = isSearchResult ? (company as Company).website : (company as PinnedCompany).company_website;
    const companyType = isSearchResult ? (company as Company).company_type : (company as PinnedCompany).company_type;
    const city = company.city;
    const state = company.state;
    const country = company.country;
    const openJobs = isSearchResult ? (company as Company).open_jobs : [];
    const pinned = isPinned(name);

    return (
      <Card key={name} className="hover:shadow-md transition-shadow">
        <CardHeader
          className="pb-3 cursor-pointer"
          onClick={() => !isPinnedSection && toggleExpand(name)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {logo ? (
                <img
                  src={logo}
                  alt={name}
                  className="h-12 w-12 rounded-lg object-contain bg-muted p-1"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="space-y-1">
                <CardTitle className="text-lg">{name}</CardTitle>
                <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                  {(city || country) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {[city, state, country].filter(Boolean).join(", ")}
                    </span>
                  )}
                  {companyType && (
                    <Badge variant="outline" className="text-xs">{companyType}</Badge>
                  )}
                  {pinned && (
                    <Badge variant="secondary" className="text-xs">
                      <Pin className="h-3 w-3 mr-1" />
                      {t.companies.pinned}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <Button
                  variant={pinned ? "secondary" : "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isPinnedSection) {
                      unpinCompany(name);
                    } else {
                      togglePin(company as Company);
                    }
                  }}
                  disabled={pinLoading === name}
                >
                  {pinLoading === name ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : pinned ? (
                    <PinOff className="h-3.5 w-3.5 mr-1" />
                  ) : (
                    <Pin className="h-3.5 w-3.5 mr-1" />
                  )}
                  {pinned ? t.companies.unpin : t.companies.pin}
                </Button>
              )}
              {!isPinnedSection && openJobs.length > 0 && (
                <>
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {openJobs.length} {t.companies.openRoles}
                  </Badge>
                  {expandedCompany === name ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </>
              )}
              {isPinnedSection && website && (
                <Button variant="outline" size="sm" asChild>
                  <a href={website} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-3.5 w-3.5 mr-1" />
                    Website
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {!isPinnedSection && expandedCompany === name && (
          <CardContent className="space-y-4">
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <Globe className="h-3.5 w-3.5" />
                {website}
              </a>
            )}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">{t.companies.openPositions}</h4>
              {openJobs.map((job, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{job.job_title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{job.location}</span>
                      <Badge variant="outline" className="text-xs">{job.job_type}</Badge>
                      {job.posted_date && <span>{job.posted_date}</span>}
                    </div>
                  </div>
                  {job.url && job.url !== "#" && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={job.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        {t.companies.apply}
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.companies.title}</h1>
        <p className="text-muted-foreground mt-1">{t.companies.subtitle}</p>
      </div>

      {/* Pinned Companies */}
      {pinnedCompanies.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Pin className="h-4 w-4 text-primary" />
            {t.companies.pinnedCompanies}
          </h2>
          <div className="space-y-3">
            {pinnedCompanies.map((pc) => renderCompanyCard(pc, true))}
          </div>
        </div>
      )}

      {/* Search filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>{t.companies.companyOrKeyword}</Label>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.companies.companyPlaceholder}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.companies.industry}</Label>
              <Input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder={t.companies.industryPlaceholder}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.companies.location}</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t.companies.locationPlaceholder}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="space-y-2">
              <Label className="invisible">Search</Label>
              <Button onClick={handleSearch} disabled={searching} className="w-full">
                {searching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                {searching ? t.companies.searching : t.companies.searchBtn}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      {companies.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {companies.length} {t.companies.companiesFound}
        </p>
      )}

      {/* Loading state */}
      {searching && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t.companies.searchingMsg}</p>
        </div>
      )}

      {/* Company cards */}
      <div className="space-y-4">
        {companies.map((company) => renderCompanyCard(company))}
      </div>

      {/* Empty state after search */}
      {!searching && companies.length === 0 && query === "" && pinnedCompanies.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">{t.companies.emptyTitle}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t.companies.emptyDesc}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
