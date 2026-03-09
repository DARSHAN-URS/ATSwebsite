import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Star, StarOff, FileText, Loader2, Users, Calendar, Video } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const PIPELINE_STAGES = ["applied", "screening", "interview", "offer", "rejected"] as const;
type Stage = typeof PIPELINE_STAGES[number];

const stageColors: Record<Stage, string> = {
  applied: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  screening: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  interview: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  offer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

interface Applicant {
  id: string;
  applicant_id: string;
  status: string;
  created_at: string;
  resume_id: string | null;
  recruiter_notes: string | null;
  is_shortlisted: boolean;
  profile?: { display_name: string | null; user_id: string };
}

export default function RecruiterApplicants() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Applicant | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [schedulingInterview, setSchedulingInterview] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewDuration, setInterviewDuration] = useState("30");
  const [interviewNotes, setInterviewNotes] = useState("");

  const fetchData = async () => {
    if (!user || !jobId) return;
    setLoading(true);

    const [{ data: jobData }, { data: appData }] = await Promise.all([
      supabase.from("job_posts").select("title").eq("id", jobId).single(),
      supabase.from("job_post_applications" as any).select("*").eq("job_post_id", jobId).order("created_at", { ascending: false }),
    ]);

    setJobTitle((jobData as any)?.title || "");

    if (appData && (appData as any[]).length > 0) {
      const applicantIds = (appData as any[]).map((a: any) => a.applicant_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("display_name, user_id")
        .in("user_id", applicantIds);

      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));
      const enriched = (appData as any[]).map((a: any) => ({
        ...a,
        profile: profileMap.get(a.applicant_id),
      }));
      setApplicants(enriched);
    } else {
      setApplicants([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user, jobId]);

  const updateStatus = async (appId: string, newStatus: string) => {
    setUpdatingId(appId);
    await supabase.from("job_post_applications" as any).update({ status: newStatus } as any).eq("id", appId);
    setApplicants((prev) => prev.map((a) => a.id === appId ? { ...a, status: newStatus } : a));
    if (selectedApp?.id === appId) setSelectedApp((prev) => prev ? { ...prev, status: newStatus } : null);
    setUpdatingId(null);
  };

  const toggleShortlist = async (app: Applicant) => {
    const newVal = !app.is_shortlisted;
    await supabase.from("job_post_applications" as any).update({ is_shortlisted: newVal } as any).eq("id", app.id);
    setApplicants((prev) => prev.map((a) => a.id === app.id ? { ...a, is_shortlisted: newVal } : a));
    if (selectedApp?.id === app.id) setSelectedApp((prev) => prev ? { ...prev, is_shortlisted: newVal } : null);
  };

  const saveNotes = async () => {
    if (!selectedApp) return;
    await supabase.from("job_post_applications" as any).update({ recruiter_notes: notes } as any).eq("id", selectedApp.id);
    setApplicants((prev) => prev.map((a) => a.id === selectedApp.id ? { ...a, recruiter_notes: notes } : a));
    toast({ title: "Notes saved" });
  };

  const scheduleInterview = async () => {
    if (!selectedApp || !interviewDate || !interviewTime) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setSchedulingInterview(true);
    try {
      const scheduledAt = new Date(`${interviewDate}T${interviewTime}:00.000Z`).toISOString();
      
      const { data, error } = await supabase.functions.invoke('schedule-zoom-interview', {
        body: {
          applicationId: selectedApp.id,
          scheduledAt,
          durationMinutes: parseInt(interviewDuration),
          notes: interviewNotes,
        },
      });

      if (error) throw error;

      toast({ title: "Interview scheduled successfully!" });
      setInterviewDate("");
      setInterviewTime("");
      setInterviewDuration("30");
      setInterviewNotes("");
    } catch (error: any) {
      console.error('Error scheduling interview:', error);
      toast({ 
        title: "Failed to schedule interview", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setSchedulingInterview(false);
    }
  };

  const openDrawer = (app: Applicant) => {
    setSelectedApp(app);
    setNotes(app.recruiter_notes || "");
    setDrawerOpen(true);
  };

  const grouped = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage] = applicants.filter((a) => a.status === stage);
    return acc;
  }, {} as Record<Stage, Applicant[]>);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <SEOHead title={`Applicants — ${jobTitle}`} description="Manage applicants" noindex />
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/recruiter/jobs")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Applicants</h1>
          <p className="text-muted-foreground">{jobTitle}</p>
        </div>
        <Badge variant="secondary" className="ml-auto">{applicants.length} total</Badge>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : applicants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No applicants yet</h3>
            <p className="text-muted-foreground">Applications will appear here as candidates apply.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {PIPELINE_STAGES.map((stage) => (
            <div key={stage} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className={`text-xs font-semibold uppercase px-2 py-1 rounded ${stageColors[stage]}`}>
                  {stage}
                </h3>
                <span className="text-xs text-muted-foreground">{grouped[stage].length}</span>
              </div>
              <div className="space-y-2 min-h-[100px]">
                {grouped[stage].map((app) => (
                  <Card
                    key={app.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border"
                    onClick={() => openDrawer(app)}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium truncate">
                          {app.profile?.display_name || "Unknown"}
                        </p>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleShortlist(app); }}
                          className="text-yellow-500 hover:text-yellow-600"
                        >
                          {app.is_shortlisted ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(app.created_at).toLocaleDateString()}
                      </p>
                      {app.resume_id && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <FileText className="h-3 w-3" /> Resume
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedApp?.profile?.display_name || "Applicant"}</SheetTitle>
            <SheetDescription>Applied {selectedApp ? new Date(selectedApp.created_at).toLocaleDateString() : ""}</SheetDescription>
          </SheetHeader>
          {selectedApp && (
            <div className="space-y-6 mt-6">
              <div>
                <Label>Status</Label>
                <Select
                  value={selectedApp.status}
                  onValueChange={(v) => updateStatus(selectedApp.id, v)}
                  disabled={updatingId === selectedApp.id}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PIPELINE_STAGES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label>Shortlisted</Label>
                <button onClick={() => toggleShortlist(selectedApp)} className="text-yellow-500">
                  {selectedApp.is_shortlisted ? <Star className="h-5 w-5 fill-current" /> : <StarOff className="h-5 w-5" />}
                </button>
              </div>

              <div>
                <Label>Private Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={5} placeholder="Add private notes about this candidate..." />
                <Button size="sm" className="mt-2" onClick={saveNotes}>Save Notes</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
