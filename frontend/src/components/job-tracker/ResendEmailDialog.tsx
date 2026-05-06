import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, Sparkles, Mail, Paperclip } from "lucide-react";
import { buildDoc } from "@/components/resume/pdfTemplates";
import type { ResumeData } from "@/components/resume/types";
import type { Tables } from "@/integrations/supabase/types";
import { invokeFunction } from "@/lib/api-client";

type JobApp = Tables<"job_applications">;

export interface EmailAttachment {
  name: string;
  base64: string;
  mimeType: string;
}

export interface EmailHistoryEntry {
  id: string;
  recruiter_email: string;
  subject: string;
  body: string;
  sent_at: string;
  resume_id: string | null;
  attachments?: EmailAttachment[] | null;
}

interface ResendEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app: JobApp | null;
  prefill?: EmailHistoryEntry | null;
  onSent?: () => void;
}

export default function ResendEmailDialog({ open, onOpenChange, app, prefill, onSent }: ResendEmailDialogProps) {
  const { user, session } = useAuth();
  const { toast } = useToast();

  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachResume, setAttachResume] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);

  // Reset fields whenever the dialog opens or the prefill/app changes
  useEffect(() => {
    if (open) {
      setRecruiterEmail(prefill?.recruiter_email ?? "");
      setSubject(prefill?.subject ?? (app ? `Following Up — ${app.position} at ${app.company}` : ""));
      setBody(prefill?.body ?? "");
      setAttachResume(true);
    }
  }, [open, prefill, app]);

  const handleOpenChange = (val: boolean) => {
    onOpenChange(val);
  };

  const generateWithAI = async () => {
    if (!app || !session?.access_token) return;
    setGenerating(true);
    try {
      const { data, error } = await invokeFunction("generate-outreach-email", {
        position: app.position,
        company: app.company,
        resumeId: app.resume_id ?? undefined,
        coverLetterId: app.cover_letter_id ?? undefined,
      });

      if (error) throw new Error(error.message || "Failed to generate");
      setSubject(data.subject);
      setBody(data.body);
      toast({ title: "Email drafted!", description: "Review and personalise before sending." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      toast({ title: "Generation failed", description: message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const generateResumePdf = async (resumeId: string): Promise<{ base64: string; filename: string } | null> => {
    try {
      const { data: resumeRow } = await supabase
        .from("resumes")
        .select("*")
        .eq("id", resumeId)
        .single();
      if (!resumeRow?.resume_data) return null;
      const resumeData = resumeRow.resume_data as ResumeData;
      const templateId = (resumeData.templateId as Parameters<typeof buildDoc>[2]) ?? "classic";
      const doc = await buildDoc(resumeData, resumeRow.title, templateId);
      const dataUri = doc.output("datauristring");
      const base64 = dataUri.split(",")[1];
      const pi = resumeData.personalInfo || {};
      const filename = `${(pi.fullName || resumeRow.title || "Resume").replace(/\s+/g, "_")}_Resume.pdf`;
      return { base64, filename };
    } catch {
      return null;
    }
  };

  const sendDirectly = async () => {
    if (!recruiterEmail.trim()) {
      toast({ title: "Recipient required", description: "Enter the recruiter's email address.", variant: "destructive" });
      return;
    }
    if (!subject.trim() || !body.trim()) {
      toast({ title: "Nothing to send", description: "Generate or write an email first.", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      const resumeIdToUse = app?.resume_id ?? prefill?.resume_id ?? null;
      let resumePdfBase64: string | undefined;
      let resumeFilename: string | undefined;

      if (attachResume && resumeIdToUse) {
        toast({ title: "Preparing resume…", description: "Generating PDF attachment." });
        const pdf = await generateResumePdf(resumeIdToUse);
        if (pdf) {
          resumePdfBase64 = pdf.base64;
          resumeFilename = pdf.filename;
        }
      }

      // Include saved additional attachments from history
      const savedAttachments = prefill?.attachments ?? [];
      const additionalAttachments = savedAttachments.length > 0
        ? savedAttachments.map((d) => ({ filename: d.name, content: d.base64, type: d.mimeType }))
        : undefined;

      const { data, error } = await invokeFunction("send-outreach-email", {
        to: recruiterEmail.trim(),
        subject: subject.trim(),
        body: body.trim(),
        replyTo: user?.email,
        position: app?.position,
        company: app?.company,
        resumePdfBase64,
        resumeFilename,
        additionalAttachments,
      });

      if (error) throw new Error(error.message || "Failed to send");

      // Save to email history
      if (user && app) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const client = supabase as any;
        await client.from("email_outreach_history").insert({
          user_id: user.id,
          job_application_id: app.id,
          company: app.company,
          position: app.position,
          recruiter_email: recruiterEmail.trim(),
          subject: subject.trim(),
          body: body.trim(),
          resume_id: resumeIdToUse,
          attachments: savedAttachments.length > 0 ? savedAttachments : null,
        });
      }

      const attachCount = (resumePdfBase64 ? 1 : 0) + savedAttachments.length;
      toast({
        title: "✅ Email sent!",
        description: `Sent to ${recruiterEmail}${attachCount > 0 ? ` with ${attachCount} attachment${attachCount > 1 ? "s" : ""}` : ""}. Replies go to your email.`,
      });
      onSent?.();
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send email.";
      toast({ title: "Send failed", description: message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const resumeIdForToggle = app?.resume_id ?? prefill?.resume_id ?? null;
  const canSend = subject.trim() && body.trim() && recruiterEmail.trim();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            {prefill ? "Resend Email" : "Email Hiring Team"} — {app?.position} at {app?.company}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {prefill && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-foreground">
              ✉️ Pre-filled from your last sent email — edit as needed before sending.
            </div>
          )}

          <Button
            variant="outline"
            className="w-full border-primary/40 text-primary hover:bg-primary/5"
            onClick={generateWithAI}
            disabled={generating || !session}
          >
            {generating ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Drafting with AI…</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" />Generate Fresh Email with AI</>
            )}
          </Button>

          <div className="space-y-2">
            <Label htmlFor="rs-to">
              Recruiter / HR Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="rs-to"
              type="email"
              placeholder="recruiter@company.com"
              value={recruiterEmail}
              onChange={(e) => setRecruiterEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rs-subject">Subject</Label>
            <Input
              id="rs-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rs-body">Message</Label>
            <Textarea
              id="rs-body"
              rows={11}
              placeholder="Click 'Generate Email with AI' or write your follow-up…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          {resumeIdForToggle && (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
              <Paperclip className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm flex-1 font-medium">Attach resume as PDF</span>
              <button
                type="button"
                role="switch"
                aria-checked={attachResume}
                onClick={() => setAttachResume(!attachResume)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  attachResume ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    attachResume ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          )}

          {/* Show saved additional attachments */}
          {prefill?.attachments && prefill.attachments.length > 0 && (
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 space-y-2">
              <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Paperclip className="h-3.5 w-3.5 text-primary" />
                Saved attachments — will be re-sent automatically
              </p>
              <ul className="space-y-1">
                {prefill.attachments.map((doc) => (
                  <li key={doc.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Paperclip className="h-3 w-3 shrink-0" />
                    <span className="truncate">{doc.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Sent from our platform · Replies go to <strong>{user?.email}</strong>
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="sm:mr-auto">
            Cancel
          </Button>
          <Button onClick={sendDirectly} disabled={!canSend || sending}>
            {sending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</>
            ) : (
              <><Send className="h-4 w-4 mr-2" />Send{attachResume && resumeIdForToggle ? " with Resume" : ""}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
