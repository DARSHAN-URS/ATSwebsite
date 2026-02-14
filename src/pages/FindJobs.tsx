import { useEffect, useState } from "react";
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
import { Search, Bookmark, BookmarkCheck, ExternalLink, MapPin, Building2, Clock, Sparkles, Loader2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import SEOHead from "@/components/SEOHead";

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

function getScoreColor(score: number) {
  if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
  if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (score >= 40) return "bg-orange-100 text-orange-800 border-orange-200";
  return "bg-red-100 text-red-800 border-red-200";
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
  const [expandedJob, setExpandedJob] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"match" | "date" | "company">("match");

  useEffect(() => {
    if (!user) return;
    supabase.from("resumes").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setResumes(data ?? []);
      if (data && data.length > 0) setSelectedResumeId(data[0].id);
    });
    fetchSavedJobs();
  }, [user]);

  const fetchSavedJobs = async () => {
    const { data } = await supabase.from("saved_jobs").select("*").eq("is_bookmarked", true).order("created_at", { ascending: false });
    setSavedJobs(data ?? []);
  };

  const handleSearch = async () => {
    if (!selectedResumeId) {
      toast({ title: "Select a resume", description: "Choose a resume to match jobs against", variant: "destructive" });
      return;
    }
    const resume = resumes.find((r) => r.id === selectedResumeId);
    if (!resume) return;

    setSearching(true);
    setJobs([]);
    try {
      const { data, error } = await supabase.functions.invoke("search-jobs", {
        body: {
          resume_data: resume.resume_data,
          resume_title: resume.title,
          location: location || undefined,
          job_type: jobType === "all" ? undefined : jobType,
          query: searchQuery || undefined,
        },
      });
      if (error) throw error;
      if (data?.error) {
        if (data.error.includes("Rate limit")) {
          toast({ title: "Rate limited", description: "Please wait a moment and try again.", variant: "destructive" });
        } else if (data.error.includes("Payment required")) {
          toast({ title: "Credits needed", description: "Please add credits to continue using AI features.", variant: "destructive" });
        } else {
          throw new Error(data.error);
        }
      } else {
        setJobs(data?.jobs ?? []);
        if (data?.jobs?.length === 0) {
          toast({ title: "No jobs found", description: "Try adjusting your filters or resume content." });
        }
      }
    } catch (e: any) {
      toast({ title: "Search failed", description: e.message, variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  const handleSaveJob = async (job: JobListing) => {
    if (!user) return;
    const { error } = await supabase.from("saved_jobs").insert({
      user_id: user.id,
      job_title: job.job_title,
      company: job.company,
      location: job.location,
      job_type: job.job_type,
      description: job.description,
      url: job.url,
      match_score: job.match_score ?? null,
      match_explanation: job.match_explanation ?? null,
      source_resume_id: selectedResumeId || null,
      posted_date: job.posted_date || null,
    });
    if (error) {
      toast({ title: "Error saving job", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Job saved!" });
      fetchSavedJobs();
    }
  };

  const handleTrackJob = async (job: { job_title: string; company: string; url?: string | null }) => {
    if (!user) return;
    const title = job.job_title;
    const { error } = await supabase.from("job_applications").insert({
      user_id: user.id,
      company: job.company,
      position: title,
      url: job.url ?? "",
      resume_id: selectedResumeId || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Added to tracker!" });
    }
  };

  const handleRemoveSaved = async (id: string) => {
    await supabase.from("saved_jobs").delete().eq("id", id);
    fetchSavedJobs();
  };

  const isJobSaved = (job: JobListing) =>
    savedJobs.some((s) => s.job_title === job.job_title && s.company === job.company);

  const sortedJobs = [...jobs].sort((a, b) => {
    if (sortBy === "match") return (b.match_score ?? 0) - (a.match_score ?? 0);
    if (sortBy === "date") return (b.posted_date ?? "").localeCompare(a.posted_date ?? "");
    return a.company.localeCompare(b.company);
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <SEOHead title="Find Jobs — ATS Pro Resume Builder" description="AI-powered job discovery matched to your resume." noindex />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find Jobs</h1>
        <p className="text-muted-foreground mt-1">AI-powered job discovery matched to your resume</p>
      </div>

      <Tabs defaultValue="search">
        <TabsList>
          <TabsTrigger value="search">Search Jobs</TabsTrigger>
          <TabsTrigger value="saved">Saved Jobs ({savedJobs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6 mt-4">
          {/* Search filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Resume</Label>
                  <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select resume" />
                    </SelectTrigger>
                    <SelectContent>
                      {resumes.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Search Query (optional)</Label>
                  <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="e.g. React developer" />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Remote, New York" />
                </div>
                <div className="space-y-2">
                  <Label>Job Type</Label>
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="invisible">Search</Label>
                  <Button onClick={handleSearch} disabled={searching || !selectedResumeId} className="w-full">
                    {searching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                    {searching ? "Searching..." : "Find Jobs"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sort controls */}
          {jobs.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{jobs.length} jobs found</p>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Sort by:</Label>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="match">Match Score</SelectItem>
                    <SelectItem value="date">Date Posted</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Job listings */}
          <div className="space-y-4">
            {sortedJobs.map((job, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpandedJob(expandedJob === i ? null : i)}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{job.job_title}</CardTitle>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{job.company}</span>
                        {job.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>}
                        {job.job_type && <Badge variant="outline" className="text-xs">{job.job_type}</Badge>}
                        {job.posted_date && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{job.posted_date}</span>}
                      </div>
                    </div>
                    {job.match_score !== undefined && (
                      <div className={`px-3 py-1.5 rounded-lg border text-sm font-semibold flex items-center gap-1.5 ${getScoreColor(job.match_score)}`}>
                        <Sparkles className="h-3.5 w-3.5" />
                        {job.match_score}% match
                      </div>
                    )}
                  </div>
                </CardHeader>

                {expandedJob === i && (
                  <CardContent className="space-y-4">
                    {job.match_explanation && (
                      <div className="bg-muted rounded-lg p-3 text-sm">
                        <span className="font-medium">AI Analysis: </span>{job.match_explanation}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.description}</p>
                    <div className="flex items-center gap-2">
                      {job.url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={job.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />Apply Externally
                          </a>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleSaveJob(job); }}
                        disabled={isJobSaved(job)}
                      >
                        {isJobSaved(job) ? <BookmarkCheck className="h-3.5 w-3.5 mr-1.5" /> : <Bookmark className="h-3.5 w-3.5 mr-1.5" />}
                        {isJobSaved(job) ? "Saved" : "Save Job"}
                      </Button>
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); handleTrackJob(job); }}>
                        <Sparkles className="h-3.5 w-3.5 mr-1.5" />Save & Track
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {searching && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">AI is finding the best jobs for your resume...</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-4 mt-4">
          {savedJobs.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Bookmark className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold">No saved jobs yet</h3>
                <p className="text-sm text-muted-foreground mt-1">Search for jobs and bookmark the ones you like</p>
              </CardContent>
            </Card>
          ) : (
            savedJobs.map((job) => (
              <Card key={job.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{job.job_title}</CardTitle>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{job.company}</span>
                        {job.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>}
                      </div>
                    </div>
                    {job.match_score !== null && (
                      <div className={`px-3 py-1.5 rounded-lg border text-sm font-semibold ${getScoreColor(job.match_score)}`}>
                        {job.match_score}% match
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {job.url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={job.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />Apply
                        </a>
                      </Button>
                    )}
                    <Button size="sm" onClick={() => handleTrackJob(job)}>
                      <Sparkles className="h-3.5 w-3.5 mr-1.5" />Save & Track
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveSaved(job.id)} className="text-destructive">
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
