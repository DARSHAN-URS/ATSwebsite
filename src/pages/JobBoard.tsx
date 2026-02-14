import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Briefcase, DollarSign, SendHorizontal, CheckCircle } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { useToast } from "@/hooks/use-toast";

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

export default function JobBoard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("job_posts")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      setJobs((data as any) ?? []);
      setLoading(false);
    };
    fetchJobs();
  }, []);

  // Fetch user's existing applications
  useEffect(() => {
    if (!user) return;
    const fetchApplied = async () => {
      const { data } = await supabase
        .from("job_post_applications")
        .select("job_post_id")
        .eq("applicant_id", user.id) as any;
      if (data) setAppliedIds(new Set(data.map((d: any) => d.job_post_id)));
    };
    fetchApplied();
  }, [user]);

  // Track view when expanding a job
  const handleExpand = async (jobId: string) => {
    const isExpanding = expandedId !== jobId;
    setExpandedId(isExpanding ? jobId : null);

    if (isExpanding && user) {
      await supabase
        .from("job_post_views")
        .upsert({ job_post_id: jobId, viewer_id: user.id } as any, { onConflict: "job_post_id,viewer_id" });
    }
  };

  const handleApply = async (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    if (!user) return;
    const { error } = await supabase
      .from("job_post_applications")
      .insert({ job_post_id: jobId, applicant_id: user.id } as any);
    if (error) {
      if (error.code === "23505") {
        toast({ title: "Already applied", description: "You've already applied to this job." });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } else {
      setAppliedIds((prev) => new Set(prev).add(jobId));
      toast({ title: "Application submitted!" });
    }
  };

  const filtered = jobs.filter((job) => {
    const matchesSearch =
      !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company_name.toLowerCase().includes(search.toLowerCase()) ||
      (job.location?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesType = typeFilter === "all" || job.job_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <SEOHead
        title="Job Board — Browse Open Positions | ATS Pro Resume Builder"
        description="Browse job openings posted by recruiters. Search by title, company, location, and job type. Apply directly with your ATS-optimized resume."
        canonical="https://atsproresumebuilder.com/job-board"
        keywords="job board, job openings, recruiter jobs, job search, find jobs, career opportunities"
      />
      <div>
        <h1 className="text-2xl font-bold text-foreground">Job Board</h1>
        <p className="text-muted-foreground">Browse open positions posted by recruiters</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, company, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Job Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="part-time">Part-time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="remote">Remote</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading jobs...</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No jobs found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{filtered.length} job{filtered.length !== 1 ? "s" : ""} found</p>
          {filtered.map((job) => (
            <Card
              key={job.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleExpand(job.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{job.company_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                    {appliedIds.has(job.id) ? (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Applied
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="default"
                        className="gap-1"
                        onClick={(e) => handleApply(e, job.id)}
                      >
                        <SendHorizontal className="h-3 w-3" /> Apply
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap mb-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />{job.job_type}
                  </Badge>
                  {job.location && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{job.location}
                    </Badge>
                  )}
                  {job.salary_min && job.salary_max && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />{job.salary_currency} {job.salary_min.toLocaleString()} - {job.salary_max.toLocaleString()}
                    </Badge>
                  )}
                </div>

                {expandedId === job.id && (
                  <div className="mt-4 space-y-3 border-t pt-3">
                    {job.description && (
                      <div>
                        <h4 className="font-medium text-sm mb-1">Description</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.description}</p>
                      </div>
                    )}
                    {job.requirements && (
                      <div>
                        <h4 className="font-medium text-sm mb-1">Requirements</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.requirements}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
