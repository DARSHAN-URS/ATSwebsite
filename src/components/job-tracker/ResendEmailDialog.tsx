import { useState } from "react";
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

type JobApp = Tables<"job_applications">;

interface ResendEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app: JobApp | null;
}

export default function ResendEmailDialog({ open, onOpenChange, app }: ResendEmailDialogProps) {
  const { user, session } = useAuth();
  const { toast } = useToast();

  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachResume, setAttachResume] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);

  const handleOpenChange = (val: boolean) => {
    if (val && app) {
      setRecruiterEmail("");
      setSubject(`Following Up — ${app.position} at ${app.company}`);
      setBody("");
    }
    onOpenChange(val);
  };

  const generateWithAI = async () => {
    if (!app || !session?.access_token) return;
    setGenerating(true);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/generate-outreach-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            position: app.position,
            company: app.company,
            resumeId: app.resume_id ?? undefined,
            coverLetterId: app.cover_letter_id ?? undefined,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate");
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

  const generateResumePdf = async (): Promise<{ base64: string; filename: string } | null> => {
    if (!app?.resume_id) return null;
    try {
      const { data: resumeRow } = await supabase
        .from("resumes")
        .select("*")
        .eq("id", app.resume_id)
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
      let resumePdfBase64: string | undefined;
      let resumeFilename: string | undefined;

      if (attachResume && app?.resume_id) {
        toast({ title: "Preparing resume…", description: "Generating PDF attachment." });
        const pdf = await generateResumePdf();
        if (pdf) {
          resumePdfBase64 = pdf.base64;
          resumeFilename = pdf.filename;
        }
      }

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/send-outreach-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            to: recruiterEmail.trim(),
            subject: subject.trim(),
            body: body.trim(),
            replyTo: user?.email,
            position: app?.position,
            company: app?.company,
            resumePdfBase64,
            resumeFilename,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send");

      toast({
        title: "✅ Email sent!",
        description: `Sent to ${recruiterEmail}${resumePdfBase64 ? " with resume attached" : ""}. Replies go to your email.`,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send email.";
      toast({ title: "Send failed", description: message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const canSend = subject.trim() && body.trim() && recruiterEmail.trim();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            Resend Email — {app?.position} at {app?.company}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full border-primary/40 text-primary hover:bg-primary/5"
            onClick={generateWithAI}
            disabled={generating || !session}
          >
            {generating ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Drafting with AI…</>
            ) : (
              <><Sparkles className="h-4 w-4 mr-2" />Generate Email with AI</>
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

          {app?.resume_id && (
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
              <><Send className="h-4 w-4 mr-2" />Send Email{attachResume && app?.resume_id ? " with Resume" : ""}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
