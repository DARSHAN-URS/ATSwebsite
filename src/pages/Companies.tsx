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
  Search, ExternalLink, MapPin, Building2, Globe, Briefcase, Loader2, ChevronDown, ChevronUp, Pin, PinOff, Share2,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SEOHead from "@/components/SEOHead";

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

  const getShareText = (name: string, website: string | null) => {
    const loc = [website].filter(Boolean).join(" ");
    return `Check out ${name}${loc ? ` — ${loc}` : ""} on ATS Pro Resume Builder!`;
  };

  const shareToSocial = (platform: string, name: string, website: string | null) => {
    const text = encodeURIComponent(getShareText(name, website));
    const url = encodeURIComponent(website || window.location.href);
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
    };
    window.open(urls[platform], "_blank", "noopener,noreferrer,width=600,height=500");
  };

  const copyShareLink = async (name: string, website: string | null) => {
    const text = getShareText(name, website);
    const link = website || window.location.href;
    await navigator.clipboard.writeText(`${text}\n${link}`);
    toast({ title: "Link copied!", description: "Share link copied to clipboard." });
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                    <Share2 className="h-3.5 w-3.5 mr-1" /> Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={() => shareToSocial("twitter", name, website)}>
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    Twitter / X
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => shareToSocial("facebook", name, website)}>
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => shareToSocial("linkedin", name, website)}>
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    LinkedIn
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => shareToSocial("whatsapp", name, website)}>
                    <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => copyShareLink(name, website)}>
                    <Globe className="h-4 w-4 mr-2" /> Copy Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
      <SEOHead title="Companies — ATS Pro Resume Builder" description="Discover companies and open positions." noindex />
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
