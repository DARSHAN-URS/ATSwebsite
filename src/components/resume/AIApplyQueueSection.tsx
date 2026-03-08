import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Sparkles, ExternalLink, CheckCircle2, X, MapPin, Trophy, FileText, Mail,
  ChevronDown, ChevronUp, Loader2, Zap, AlertCircle, Globe, Building2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QueuedJob {
  id: string;
  job_title: string;
  company: string;
  location: string | null;
  job_type: string | null;
  job_url: string | null;
  match_score: number | null;
  match_explanation: string | null;
  tailored_resume_data: any;
  cover_letter_data: any;
  status: string;
  apply_method: string | null;
  apply_error: string | null;
  created_at: string;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-green-100 text-green-700 border-green-200" :
    score >= 60 ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
    "bg-orange-100 text-orange-700 border-orange-200";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      <Trophy className="h-3 w-3" /> {score}% match
    </span>
  );
}

function getManualApplyReason(url: string | null): string {
  if (!url || url === "#") return "No direct apply API is available for this listing.";

  const normalized = url.toLowerCase();
  if (
    normalized.includes("indeed.com") ||
    normalized.includes("linkedin.com") ||
    normalized.includes("naukri") ||
    normalized.includes("bayt.com") ||
    normalized.includes("dubizzle")
  ) {
    return "This listing is on a job board and requires form steps on the employer page.";
  }

  return "This career site does not expose a public auto-apply API, so you need to submit manually.";
}

function ApplyMethodBadge({ method, url }: { method: string | null; url: string | null }) {
  if (!method || method === "manual") {
    // Detect what method would be used
    const detected = detectMethodFromUrl(url);
    if (detected === "greenhouse") return <Badge variant="outline" className="text-[10px] gap-1"><Building2 className="h-2.5 w-2.5" />Greenhouse</Badge>;
    if (detected === "lever") return <Badge variant="outline" className="text-[10px] gap-1"><Building2 className="h-2.5 w-2.5" />Lever</Badge>;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="text-[10px] gap-1 cursor-help"><Globe className="h-2.5 w-2.5" />Manual</Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[250px] text-xs">
          {getManualApplyReason(url)} Click "Apply" to open the job page and submit directly.
        </TooltipContent>
      </Tooltip>
    );
  }
  if (method === "greenhouse") return <Badge variant="secondary" className="text-[10px] gap-1 bg-green-100 text-green-700"><Building2 className="h-2.5 w-2.5" />Greenhouse API</Badge>;
  if (method === "lever") return <Badge variant="secondary" className="text-[10px] gap-1 bg-blue-100 text-blue-700"><Building2 className="h-2.5 w-2.5" />Lever API</Badge>;
  if (method === "email") return <Badge variant="secondary" className="text-[10px] gap-1 bg-purple-100 text-purple-700"><Mail className="h-2.5 w-2.5" />Email</Badge>;
  return <Badge variant="outline" className="text-[10px]">{method}</Badge>;
}

function detectMethodFromUrl(url: string | null): string {
  if (!url) return "manual";
  if (url.includes("greenhouse.io")) return "greenhouse";
  if (url.includes("lever.co")) return "lever";
  return "manual";
}

export default function AIApplyQueueSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [queue, setQueue] = useState<QueuedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<QueuedJob | null>(null);
  const [previewTab, setPreviewTab] = useState<"resume" | "cover-letter">("cover-letter");
  const [applying, setApplying] = useState<string | null>(null);
  const [autoApplying, setAutoApplying] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const fetchQueue = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("ai_apply_queue" as any)
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "queued")
      .order("match_score", { ascending: false })
      .limit(20);
    setQueue((data as unknown as QueuedJob[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchQueue(); }, [user]);

  const handleAutoApplyAll = async () => {
    if (queue.length === 0) return;
    setAutoApplying(true);

    try {
      const ids = queue.map((j) => j.id);
      const { data, error } = await supabase.functions.invoke("auto-apply", {
        body: { queue_ids: ids },
      });

      if (error) throw error;

      const applied = data?.applied || 0;
      const failed = data?.failed || 0;
      const manual = data?.manual || 0;

      toast({
        title: `Auto-Apply Complete`,
        description: `✅ ${applied} applied via API/email${failed > 0 ? ` · ❌ ${failed} failed` : ""}${manual > 0 ? ` · 📋 ${manual} manual (site requires direct form submission)` : ""}`,
      });

      // Refresh queue
      await fetchQueue();
    } catch (err) {
      console.error("Auto-apply error:", err);
      toast({ title: "Error", description: "Auto-apply failed. Please try again.", variant: "destructive" });
    } finally {
      setAutoApplying(false);
    }
  };

  const handleApply = async (job: QueuedJob) => {
    setApplying(job.id);
    try {
      // Try auto-apply first
      const { data, error } = await supabase.functions.invoke("auto-apply", {
        body: { queue_ids: [job.id] },
      });

      const result = data?.results?.[0];

      if (!error && result?.success) {
        toast({
          title: "Applied automatically!",
          description: `${job.job_title} at ${job.company} — applied via ${result.method}`,
        });
      } else {
        // Fallback: mark as applied manually + open URL
        await supabase.from("ai_apply_queue" as any).update({ status: "applied", apply_method: "manual" }).eq("id", job.id);

        await supabase.from("job_applications").insert({
          user_id: user!.id,
          company: job.company,
          position: job.job_title,
          url: job.job_url,
          status: "applied",
          notes: `AI Apply (manual) — Match score: ${job.match_score}%`,
        });

        if (job.job_url && job.job_url !== "#") {
          window.open(job.job_url, "_blank", "noopener,noreferrer");
        }

        toast({ title: "Application tracked!", description: `${job.job_title} at ${job.company} — apply on the opened page. ${getManualApplyReason(job.job_url)}` });
      }

      setSelected(null);
      setQueue((prev) => prev.filter((j) => j.id !== job.id));
    } catch {
      toast({ title: "Error", description: "Failed to process application.", variant: "destructive" });
    } finally {
      setApplying(null);
    }
  };

  const handleDismiss = async (jobId: string) => {
    await supabase.from("ai_apply_queue" as any).update({ status: "dismissed" }).eq("id", jobId);
    setQueue((prev) => prev.filter((j) => j.id !== jobId));
    if (selected?.id === jobId) setSelected(null);
  };

  if (loading) return null;
  if (queue.length === 0) return null;

  const visibleQueue = expanded ? queue : queue.slice(0, 3);

  // Count auto-applicable jobs
  const autoApplicable = queue.filter((j) => {
    const m = detectMethodFromUrl(j.job_url);
    return m === "greenhouse" || m === "lever";
  }).length;

  return (
    <>
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  AI Apply Queue
                  <Badge variant="secondary" className="text-xs">{queue.length} ready</Badge>
                </CardTitle>
                <CardDescription className="text-xs">AI-tailored applications ready to send</CardDescription>
              </div>
            </div>
            <Button
              size="sm"
              className="text-xs h-8 gap-1.5"
              onClick={handleAutoApplyAll}
              disabled={autoApplying}
            >
              {autoApplying
                ? <><Loader2 className="h-3 w-3 animate-spin" /> Applying...</>
                : <><Zap className="h-3 w-3" /> Auto-Apply All</>}
            </Button>
          </div>
          {autoApplicable > 0 && (
            <p className="text-xs text-muted-foreground mt-1 ml-10">
              {autoApplicable} job{autoApplicable > 1 ? "s" : ""} can be auto-submitted via ATS API
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {visibleQueue.map((job) => (
            <div
              key={job.id}
              className="flex flex-col gap-2 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow"
            >
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm">{job.job_title}</p>
                  {job.match_score != null && <ScoreBadge score={job.match_score} />}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <p className="text-xs text-muted-foreground">{job.company}</p>
                  <ApplyMethodBadge method={job.apply_method} url={job.job_url} />
                </div>
                {job.location && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 shrink-0" /> {job.location}
                    {job.job_type && <span className="ml-2">· {job.job_type}</span>}
                  </p>
                )}
                {detectMethodFromUrl(job.job_url) === "manual" && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1.5">
                    <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>{getManualApplyReason(job.job_url)}</span>
                  </p>
                )}
                {job.match_explanation && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">{job.match_explanation}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7"
                  onClick={() => { setSelected(job); setPreviewTab("cover-letter"); }}
                >
                  <FileText className="h-3 w-3 mr-1" /> Preview
                </Button>
                <Button
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleApply(job)}
                  disabled={applying === job.id}
                >
                  {applying === job.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Zap className="h-3 w-3 mr-1" /> Apply</>}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive ml-auto"
                  onClick={() => handleDismiss(job.id)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}

          {queue.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <><ChevronUp className="h-3 w-3 mr-1" /> Show less</> : <><ChevronDown className="h-3 w-3 mr-1" /> Show {queue.length - 3} more</>}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {selected?.job_title} at {selected?.company}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-xs flex-wrap">
              {selected?.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{selected.location}</span>}
              {selected?.match_score != null && <ScoreBadge score={selected.match_score} />}
              {selected && <ApplyMethodBadge method={selected.apply_method} url={selected.job_url} />}
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              {selected.match_explanation && (
                <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">{selected.match_explanation}</p>
              )}

              {/* Apply method info */}
              {detectMethodFromUrl(selected.job_url) !== "manual" && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  This job can be auto-submitted via {detectMethodFromUrl(selected.job_url) === "greenhouse" ? "Greenhouse" : "Lever"} API
                </div>
              )}

              {/* Tab switcher */}
              <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
                <button
                  onClick={() => setPreviewTab("cover-letter")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${previewTab === "cover-letter" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                >
                  <Mail className="h-3 w-3" /> Cover Letter
                </button>
                <button
                  onClick={() => setPreviewTab("resume")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${previewTab === "resume" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
                >
                  <FileText className="h-3 w-3" /> Tailored Resume
                </button>
              </div>

              {previewTab === "cover-letter" && selected.cover_letter_data && (
                <div className="p-4 rounded-lg border bg-muted/30 space-y-3 text-sm leading-relaxed">
                  <p className="font-medium">{selected.cover_letter_data.greeting}</p>
                  <p>{selected.cover_letter_data.opening}</p>
                  <p>{selected.cover_letter_data.body}</p>
                  <p>{selected.cover_letter_data.closing}</p>
                  <p className="font-medium">Sincerely,<br />{selected.tailored_resume_data?.personalInfo?.fullName || "Your Name"}</p>
                </div>
              )}

              {previewTab === "resume" && selected.tailored_resume_data && (
                <div className="space-y-3">
                  {selected.tailored_resume_data.summary && (
                    <div className="p-3 rounded-lg border">
                      <p className="text-xs font-semibold uppercase text-muted-foreground mb-1 tracking-wider">Tailored Summary</p>
                      <p className="text-sm">{selected.tailored_resume_data.summary}</p>
                    </div>
                  )}
                  {selected.tailored_resume_data.skills?.length > 0 && (
                    <div className="p-3 rounded-lg border">
                      <p className="text-xs font-semibold uppercase text-muted-foreground mb-2 tracking-wider">Highlighted Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.tailored_resume_data.skills.map((skill: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  onClick={() => handleApply(selected)}
                  disabled={applying === selected.id}
                >
                  {applying === selected.id
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>
                    : <><Zap className="h-4 w-4 mr-2" />Auto-Apply & Track</>}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDismiss(selected.id)}
                >
                  <X className="h-4 w-4 mr-1" /> Dismiss
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
