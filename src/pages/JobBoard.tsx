import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Briefcase, Globe } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/LanguageContext";
import RecruiterJobsList from "@/components/job-board/RecruiterJobsList";
import ExternalJobsSearch from "@/components/job-board/ExternalJobsSearch";
import ApplyWithResumeDialog from "@/components/job-board/ApplyWithResumeDialog";

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
  const { t } = useLanguage();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applyingJob, setApplyingJob] = useState<JobPost | null>(null);

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
        toast({ title: t.jobBoard.alreadyApplied, description: t.jobBoard.alreadyApplied });
      } else {
        toast({ title: t.common.error, description: error.message, variant: "destructive" });
      }
    } else {
      setAppliedIds((prev) => new Set(prev).add(jobId));
      toast({ title: t.jobBoard.applicationSubmitted });
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
        description="Browse job openings posted by recruiters and discover external listings matched to your resume."
        canonical="https://atsproresumebuilder.com/job-board"
        keywords="job board, job openings, recruiter jobs, job search, find jobs, career opportunities"
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.jobBoard.title}</h1>
          <p className="text-muted-foreground">{t.jobBoard.subtitle}</p>
        </div>
      </div>

      <Tabs defaultValue="recruiter">
        <TabsList>
          <TabsTrigger value="recruiter" className="gap-1.5">
            <Briefcase className="h-4 w-4" />{t.jobBoard.recruiterPosts}
          </TabsTrigger>
          <TabsTrigger value="external" className="gap-1.5">
            <Globe className="h-4 w-4" />{t.jobBoard.externalJobs}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recruiter" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.jobBoard.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t.findJobs.jobType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.jobBoard.allTypes}</SelectItem>
                <SelectItem value="full-time">{t.jobBoard.fullTime}</SelectItem>
                <SelectItem value="part-time">{t.jobBoard.partTime}</SelectItem>
                <SelectItem value="contract">{t.jobBoard.contract}</SelectItem>
                <SelectItem value="remote">{t.jobBoard.remote}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <RecruiterJobsList
            jobs={filtered}
            loading={loading}
            appliedIds={appliedIds}
            expandedId={expandedId}
            onExpand={handleExpand}
            onApply={handleApply}
          />
        </TabsContent>

        <TabsContent value="external" className="mt-4">
          <ExternalJobsSearch />
        </TabsContent>
      </Tabs>
    </div>
  );
}
