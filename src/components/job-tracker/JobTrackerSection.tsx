import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, ExternalLink, Mail, Trash2, Send, Loader2 } from "lucide-react";
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
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [apps, setApps] = useState<JobApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailFromName, setEmailFromName] = useState("");
  const [emailReplyTo, setEmailReplyTo] = useState("");
  const [selectedApp, setSelectedApp] = useState<JobApp | null>(null);
  const [sending, setSending] = useState(false);

  const openEmailDialog = async (app: JobApp) => {
    setSelectedApp(app);
    let coverLetterBody = "";
    if (app.cover_letter_id) {
      const { data } = await supabase
        .from("cover_letters")
        .select("cover_letter_data")
        .eq("id", app.cover_letter_id)
        .single();
      if (data?.cover_letter_data) {
        const clData = data.cover_letter_data as Record<string, unknown>;
        const sections = clData.sections as Array<{ title: string; content: string }> | undefined;
        if (sections) {
          coverLetterBody = sections.map((s) => `${s.title}\n${s.content}`).join("\n\n");
        }
      }
    }
    setEmailTo("");
    setEmailReplyTo(user?.email ?? "");
    setEmailFromName("");
    setEmailSubject(`Application for ${app.position} at ${app.company}`);
    setEmailBody(
      coverLetterBody ||
        `Dear Hiring Manager,\n\nI am writing to express my interest in the ${app.position} position at ${app.company}.\n\nI look forward to hearing from you.\n\nBest regards`
    );
    setEmailOpen(true);
  };

  const sendEmail = async () => {
    if (!emailTo || !session?.access_token) return;
    setSending(true);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/send-outreach-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            to: emailTo,
            subject: emailSubject,
            body: emailBody,
            fromName: emailFromName,
            replyTo: emailReplyTo,
            position: selectedApp?.position,
            company: selectedApp?.company,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to send email");
      }
      toast({ title: "Email sent!", description: `Your message was delivered to ${emailTo}.` });
      setEmailOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      toast({ title: "Send failed", description: message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const fetchApps = async () => {
    const { data } = await supabase
      .from("job_applications")
      .select("*")
      .order("created_at", { ascending: false });
    setApps(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchApps();
  }, [user]);

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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Job Tracker</h2>
        <p className="text-sm text-muted-foreground">Track your job applications in one place</p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(statusConfig).map(([key, { label, className }]) => {
          const count = apps.filter((a) => a.status === key).length;
          return (
            <Card key={key}>
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <span className="text-sm font-medium">{label}</span>
                <Badge variant="outline" className={className}>{count}</Badge>
              </CardContent>
            </Card>
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
            <p className="text-sm text-muted-foreground mt-1">Save & track jobs from the Find Jobs page</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <Card key={app.id}>
              <CardContent className="py-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{app.position}</p>
                  <p className="text-sm text-muted-foreground">{app.company}</p>
                  <p className="text-xs text-muted-foreground">Applied: {new Date(app.date_applied).toLocaleDateString()}</p>
                  {app.notes && (
                    <p className="text-xs text-muted-foreground italic truncate max-w-xs">{app.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
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
                  <Button variant="ghost" size="icon" onClick={() => openEmailDialog(app)} title="Email HR">
                    <Mail className="h-4 w-4" />
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Email compose dialog */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send Email to Hiring Team
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="email-from-name">Your Name</Label>
                <Input
                  id="email-from-name"
                  placeholder="Jane Doe"
                  value={emailFromName}
                  onChange={(e) => setEmailFromName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-reply-to">Your Email (Reply-To)</Label>
                <Input
                  id="email-reply-to"
                  type="email"
                  placeholder="you@example.com"
                  value={emailReplyTo}
                  onChange={(e) => setEmailReplyTo(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-to">To (HR / Recruiter Email) <span className="text-destructive">*</span></Label>
              <Input
                id="email-to"
                type="email"
                placeholder="hr@company.com"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-body">Message</Label>
              <Textarea
                id="email-body"
                rows={10}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Email will be sent from our platform. Replies will go to your email address above.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)} disabled={sending}>Cancel</Button>
            <Button onClick={sendEmail} disabled={!emailTo || sending}>
              {sending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</>
              ) : (
                <><Send className="h-4 w-4 mr-2" />Send Email</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
