import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  Search, ExternalLink, MapPin, Building2, Globe, Briefcase, Loader2, ChevronDown, ChevronUp,
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

export default function Companies() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searching, setSearching] = useState(false);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

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

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t.companies.title}</h1>
        <p className="text-muted-foreground mt-1">{t.companies.subtitle}</p>
      </div>

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
        {companies.map((company) => (
          <Card key={company.name} className="hover:shadow-md transition-shadow">
            <CardHeader
              className="pb-3 cursor-pointer"
              onClick={() => toggleExpand(company.name)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="h-12 w-12 rounded-lg object-contain bg-muted p-1"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                      {(company.city || company.country) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {[company.city, company.state, company.country].filter(Boolean).join(", ")}
                        </span>
                      )}
                      {company.company_type && (
                        <Badge variant="outline" className="text-xs">{company.company_type}</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    <Briefcase className="h-3 w-3 mr-1" />
                    {company.open_jobs.length} {t.companies.openRoles}
                  </Badge>
                  {expandedCompany === company.name ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>

            {expandedCompany === company.name && (
              <CardContent className="space-y-4">
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    {company.website}
                  </a>
                )}

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">{t.companies.openPositions}</h4>
                  {company.open_jobs.map((job, i) => (
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
        ))}
      </div>

      {/* Empty state after search */}
      {!searching && companies.length === 0 && query === "" && (
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
