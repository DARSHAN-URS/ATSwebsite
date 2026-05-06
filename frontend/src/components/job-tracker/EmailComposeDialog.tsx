import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, Sparkles, Mail } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { invokeFunction } from "@/lib/api-client";

type JobApp = Tables<"job_applications">;

interface EmailComposeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app: JobApp | null;
}

export default function EmailComposeDialog({ open, onOpenChange, app }: EmailComposeDialogProps) {
  const { session } = useAuth();
  const { toast } = useToast();

  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState(
    app ? `Application for ${app.position} at ${app.company}` : ""
  );
  const [emailBody, setEmailBody] = useState("");
  const [generating, setGenerating] = useState(false);

  const generateWithAI = async () => {
    if (!app || !session?.access_token) return;
    setGenerating(true);
    try {
      const { data, error } = await invokeFunction("generate-outreach-email", {
        position: app.position,
        company: app.company,
        resumeId: app.resume_id,
        coverLetterId: app.cover_letter_id,
      });

      if (error) throw new Error(error.message || "Failed to generate");
      setEmailSubject(data.subject);
      setEmailBody(data.body);
      toast({ title: "Email drafted!", description: "AI has written your email. Review and personalise before sending." });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      toast({ title: "Generation failed", description: message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const openInMailClient = (provider: "gmail" | "yahoo" | "default") => {
    const encodedTo = encodeURIComponent(emailTo);
    const encodedSubject = encodeURIComponent(emailSubject);
    const encodedBody = encodeURIComponent(emailBody + "\n\n[Please attach your resume before sending]");

    let url = "";
    if (provider === "gmail") {
      url = `https://mail.google.com/mail/?view=cm&fs=1${emailTo ? `&to=${encodedTo}` : ""}&su=${encodedSubject}&body=${encodedBody}`;
    } else if (provider === "yahoo") {
      url = `https://compose.mail.yahoo.com/?${emailTo ? `to=${encodedTo}&` : ""}subject=${encodedSubject}&body=${encodedBody}`;
    } else {
      url = `mailto:${emailTo}?subject=${encodedSubject}&body=${encodedBody}`;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Reset on open
  const handleOpenChange = (val: boolean) => {
    if (val && app) {
      setEmailTo("");
      setEmailSubject(`Application for ${app.position} at ${app.company}`);
      setEmailBody("");
    }
    onOpenChange(val);
  };

  const canSend = emailSubject.trim() && emailBody.trim();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            Email Hiring Team — {app?.position} at {app?.company}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* AI Generate button */}
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

          {emailBody && (
            <p className="text-xs text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
              ✨ AI has drafted your email using your resume &amp; cover letter. Review and personalise before sending.
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="ec-to">Recruiter / HR Email <span className="text-muted-foreground text-xs">(optional — you can add it in your mail app)</span></Label>
            <Input
              id="ec-to"
              type="email"
              placeholder="hr@company.com"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ec-subject">Subject</Label>
            <Input
              id="ec-subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ec-body">Message</Label>
            <Textarea
              id="ec-body"
              rows={11}
              placeholder="Click 'Generate Email with AI' to draft your message, or write it yourself…"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            📎 <strong>Tip:</strong> After opening your mail app, attach your resume PDF before sending.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="sm:mr-auto">
            Cancel
          </Button>
          <div className="flex gap-2 flex-wrap justify-end">
            <Button
              variant="outline"
              onClick={() => openInMailClient("default")}
              disabled={!canSend}
              title="Open in your default mail app"
            >
              <Send className="h-4 w-4 mr-2" />
              Open Mail App
            </Button>
            <Button
              variant="outline"
              onClick={() => openInMailClient("yahoo")}
              disabled={!canSend}
            >
              Yahoo Mail
            </Button>
            <Button
              onClick={() => openInMailClient("gmail")}
              disabled={!canSend}
            >
              Open in Gmail
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
