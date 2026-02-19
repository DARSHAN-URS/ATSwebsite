import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, ExternalLink, Mail, Trash2, RefreshCw, ChevronDown, ChevronUp, Clock } from "lucide-react";
import EmailComposeDialog from "./EmailComposeDialog";
import ResendEmailDialog, { type EmailHistoryEntry } from "./ResendEmailDialog";
import type { Tables } from "@/integrations/supabase/types";

type JobApp = Tables<"job_applications">;

const statusConfig: Record<string, { label: string; className: string }> = {
  applied: { label: "Applied", className: "bg-blue-100 text-blue-800 border-blue-200" },
  screening: { label: "Screening", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  interview: { label: "Interview", className: "bg-purple-100 text-purple-800 border-purple-200" },
  offer: { label: "Offer", className: "bg-green-100 text-green-800 border-green-200" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800 border-red-200" },
};

export default function JobTrackerSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apps, setApps] = useState<JobApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailOpen, setEmailOpen] = useState(false);
  const [resendOpen, setResendOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<JobApp | null>(null);
  const [prefillEntry, setPrefillEntry] = useState<EmailHistoryEntry | null>(null);
  const [emailHistory, setEmailHistory] = useState<Record<string, EmailHistoryEntry[]>>({});
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});

  const fetchApps = async () => {
    const { data } = await supabase
      .from("job_applications")
      .select("*")
      .order("created_at", { ascending: false });
    setApps(data ?? []);
    setLoading(false);
  };

  const fetchEmailHistory = async (appIds: string[]) => {
    if (!appIds.length) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;
    const { data } = await client
      .from("email_outreach_history")
      .select("id, job_application_id, recruiter_email, subject, body, sent_at, resume_id, attachments")
      .in("job_application_id", appIds)
      .order("sent_at", { ascending: false });

    if (data) {
      const grouped: Record<string, EmailHistoryEntry[]> = {};
      for (const row of data as any[]) {
        const jid = row.job_application_id as string;
        if (!grouped[jid]) grouped[jid] = [];
        grouped[jid].push({
          id: row.id,
          recruiter_email: row.recruiter_email,
          subject: row.subject,
          body: row.body,
          sent_at: row.sent_at,
          resume_id: row.resume_id,
          attachments: row.attachments ?? null,
        });
      }
      setEmailHistory(grouped);
    }
  };

  useEffect(() => {
    if (user) fetchApps();
  }, [user]);

  useEffect(() => {
    if (apps.length) fetchEmailHistory(apps.map((a) => a.id));
  }, [apps]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("job_applications").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      fetchApps();
    }
  };

  const deleteApp = async (id: string) => {
    await supabase.from("job_applications").delete().eq("id", id);
    fetchApps();
  };

  const openEmail = (app: JobApp) => {
    setSelectedApp(app);
    setEmailOpen(true);
  };

  const openResend = (app: JobApp, prefill?: EmailHistoryEntry) => {
    setSelectedApp(app);
    setPrefillEntry(prefill ?? null);
    setResendOpen(true);
  };

  const toggleHistory = (appId: string) => {
    setExpandedHistory((prev) => ({ ...prev, [appId]: !prev[appId] }));
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Job Tracker</h2>
        <p className="text-sm text-muted-foreground">Track your job applications in one place</p>
      </div>

      {/* Status summary */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {Object.entries(statusConfig).map(([key, { label, className }]) => {
          const count = apps.filter((a) => a.status === key).length;
          return (
            <div
              key={key}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2.5 shrink-0"
            >
              <span className="text-sm font-medium whitespace-nowrap">{label}</span>
              <Badge variant="outline" className={className}>{count}</Badge>
            </div>
          );
        })}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : apps.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold">No applications yet</h3>
            <p className="text-sm text-muted-foreground mt-1">Save &amp; track jobs from the Find Jobs page</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => {
            const history = emailHistory[app.id] ?? [];
            const lastSent = history[0];
            const isExpanded = expandedHistory[app.id];

            return (
              <Card key={app.id}>
                <CardContent className="py-4 flex flex-col gap-3">
                  {/* Main row */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{app.position}</p>
                        {app.notes?.startsWith("📧") && (
                          <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5 gap-1 py-0">
                            <Mail className="h-3 w-3" /> Via Email
                          </Badge>
                        )}
                        {history.length > 0 && (
                          <Badge variant="outline" className="text-xs gap-1 py-0 border-muted-foreground/30 text-muted-foreground">
                            <Clock className="h-3 w-3" /> {history.length} email{history.length > 1 ? "s" : ""} sent
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{app.company}</p>
                      <p className="text-xs text-muted-foreground">Applied: {new Date(app.date_applied).toLocaleDateString()}</p>
                      {lastSent && (
                        <p className="text-xs text-primary/80">
                          Last emailed: {new Date(lastSent.sent_at).toLocaleDateString()} → {lastSent.recruiter_email}
                        </p>
                      )}
                      {app.notes && !app.notes.startsWith("📧") && (
                        <p className="text-xs text-muted-foreground italic truncate max-w-xs">{app.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Select value={app.status} onValueChange={(v) => updateStatus(app.id, v)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusConfig).map(([key, { label }]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button variant="ghost" size="icon" onClick={() => openEmail(app)} title="Open mail client">
                        <Mail className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openResend(app, lastSent ?? undefined)}
                        title={lastSent ? "Resend last email" : "Send email directly"}
                      >
                        <RefreshCw className="h-4 w-4 text-primary" />
                      </Button>

                      {app.url && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={app.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}

                      <Button variant="ghost" size="icon" onClick={() => deleteApp(app.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  {/* Email history toggle */}
                  {history.length > 0 && (
                    <div>
                      <button
                        onClick={() => toggleHistory(app.id)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        {isExpanded ? "Hide" : "Show"} email history ({history.length})
                      </button>

                      {isExpanded && (
                        <div className="mt-2 space-y-2 border-l-2 border-primary/20 pl-3">
                          {history.map((entry) => (
                            <div
                              key={entry.id}
                              className="flex items-start justify-between gap-2 rounded-md bg-muted/40 px-3 py-2"
                            >
                              <div className="min-w-0 space-y-0.5">
                                <p className="text-xs font-medium truncate">{entry.subject}</p>
                                <p className="text-xs text-muted-foreground">
                                  To: {entry.recruiter_email} · {new Date(entry.sent_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="shrink-0 h-7 text-xs gap-1"
                                onClick={() => openResend(app, entry)}
                              >
                                <RefreshCw className="h-3 w-3" /> Resend
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <EmailComposeDialog
        open={emailOpen}
        onOpenChange={setEmailOpen}
        app={selectedApp}
      />

      <ResendEmailDialog
        open={resendOpen}
        onOpenChange={setResendOpen}
        app={selectedApp}
        prefill={prefillEntry}
        onSent={() => fetchEmailHistory(apps.map((a) => a.id))}
      />
    </div>
  );
}
