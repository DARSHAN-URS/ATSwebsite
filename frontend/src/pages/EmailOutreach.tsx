import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, Mail, ExternalLink, FileText, Copy, Check, Send, Info, Paperclip, X, Upload } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { buildDoc } from "@/components/resume/pdfTemplates";
import type { ResumeData } from "@/components/resume/types";
import type { Tables } from "@/integrations/supabase/types";

type Resume = Tables<"resumes">;

export default function EmailOutreach() {
  const { user, session } = useAuth();
  const { toast } = useToast();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachResume, setAttachResume] = useState(true);
  const [additionalDocs, setAdditionalDocs] = useState<{ name: string; base64: string; mimeType: string }[]>([]);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch user's resumes on mount
  useEffect(() => {
    if (!user) return;
    supabase
      .from("resumes")
      .select("*")
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        if (data) {
          setResumes(data);
          if (data.length > 0) setSelectedResumeId(data[0].id);
        }
      });
  }, [user]);

  // Auto-fill name/position from selected resume
  useEffect(() => {
    if (!selectedResumeId) return;
    const resume = resumes.find((r) => r.id === selectedResumeId);
    if (!resume?.resume_data) return;
    const rd = resume.resume_data as Record<string, unknown>;
    const personal = rd.personalInfo as Record<string, string> | undefined;
    const jobTitle = personal?.jobTitle || personal?.title || "";
    const name = personal?.fullName || personal?.name || "";
    if (jobTitle && !position) setPosition(jobTitle);
    if (name && !fromName) setFromName(name);
  }, [selectedResumeId, resumes]);

  const generateWithAI = async () => {
    if (!company || !position) {
      toast({ title: "Missing info", description: "Please enter a company and position first.", variant: "destructive" });
      return;
    }
    setGenerating(true);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/generate-outreach-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ position, company, resumeId: selectedResumeId || undefined }),
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

  const saveToJobTracker = async (additionalDocsToSave?: { name: string; base64: string; mimeType: string }[]): Promise<string | null> => {
    if (!user) return null;
    try {
      // Insert job application and get its id
      const { data: appData } = await supabase.from("job_applications").insert({
        user_id: user.id,
        company,
        position,
        status: "applied",
        date_applied: new Date().toISOString().split("T")[0],
        notes: `📧 Sent via Email Outreach on ${new Date().toLocaleDateString()}${recruiterEmail ? ` — to ${recruiterEmail}` : ""}`,
        url: null,
        resume_id: selectedResumeId || null,
      }).select("id").maybeSingle();

      const jobAppId = appData?.id ?? null;

      // Save full email details to history for Job Tracker resend
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client = supabase as any;
      await client.from("email_outreach_history").insert({
        user_id: user.id,
        job_application_id: jobAppId,
        company,
        position,
        recruiter_email: recruiterEmail.trim(),
        subject: subject.trim(),
        body: body.trim(),
        resume_id: selectedResumeId || null,
        attachments: additionalDocsToSave && additionalDocsToSave.length > 0
          ? additionalDocsToSave.map((d) => ({ name: d.name, base64: d.base64, mimeType: d.mimeType }))
          : null,
      });

      return jobAppId;
    } catch {
      // Non-critical
      return null;
    }
  };

  /** Generate PDF from selected resume and return base64 string */
  const generateResumePdfBase64 = async (): Promise<{ base64: string; filename: string } | null> => {
    if (!selectedResumeId) return null;
    const resume = resumes.find((r) => r.id === selectedResumeId);
    if (!resume?.resume_data) return null;
    try {
      const resumeData = resume.resume_data as ResumeData;
      const templateId = (resumeData.templateId as Parameters<typeof buildDoc>[2]) ?? "classic";
      const doc = await buildDoc(resumeData, resume.title, templateId);
      // output as base64 string (without the data URI prefix)
      const dataUri = doc.output("datauristring");
      const base64 = dataUri.split(",")[1];
      const pi = resumeData.personalInfo || {};
      const filename = `${(pi.fullName || resume.title || "Resume").replace(/\s+/g, "_")}_Resume.pdf`;
      return { base64, filename };
    } catch (err) {
      console.error("PDF generation error:", err);
      return null;
    }
  };

  /** Handle additional document uploads */
  const handleAdditionalDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const MAX_SIZE_MB = 5;
    const ALLOWED_TYPES = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ];

    files.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({ title: "Unsupported file", description: `${file.name} is not a supported format (PDF, DOC, DOCX, JPG, PNG).`, variant: "destructive" });
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast({ title: "File too large", description: `${file.name} exceeds the ${MAX_SIZE_MB}MB limit.`, variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(",")[1];
        setAdditionalDocs((prev) => {
          if (prev.some((d) => d.name === file.name)) return prev;
          return [...prev, { name: file.name, base64, mimeType: file.type }];
        });
      };
      reader.readAsDataURL(file);
    });
    // reset input so same file can be re-added after removal
    e.target.value = "";
  };

  const removeAdditionalDoc = (name: string) => {
    setAdditionalDocs((prev) => prev.filter((d) => d.name !== name));
  };


  const sendDirectly = async () => {
    if (!recruiterEmail.trim()) {
      toast({ title: "Recipient required", description: "Please enter the recruiter's email address.", variant: "destructive" });
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

      if (attachResume && selectedResumeId) {
        toast({ title: "Preparing resume…", description: "Generating PDF attachment." });
        const pdf = await generateResumePdfBase64();
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
            fromName: fromName.trim() || undefined,
            replyTo: user?.email,
            position,
            company,
            resumePdfBase64,
            resumeFilename,
            additionalAttachments: additionalDocs.length > 0
              ? additionalDocs.map((d) => ({ filename: d.name, content: d.base64, type: d.mimeType }))
              : undefined,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to send");

      await saveToJobTracker(additionalDocs);
      const attachCount = (resumePdfBase64 ? 1 : 0) + additionalDocs.length;
      toast({
        title: "✅ Email sent!",
        description: `Sent to ${recruiterEmail}${attachCount > 0 ? ` with ${attachCount} attachment${attachCount > 1 ? "s" : ""}` : ""}. Replies go to your email. Application saved to Job Tracker.`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send email.";
      toast({ title: "Send failed", description: message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const openMailClient = async (provider: "gmail" | "yahoo" | "default") => {
    if (!subject.trim() || !body.trim()) {
      toast({ title: "Nothing to send", description: "Generate or write an email first.", variant: "destructive" });
      return;
    }

    const fullText = `Subject: ${subject}\n\n${body}`;
    try { await navigator.clipboard.writeText(fullText); } catch { /* ignore */ }

    setSaving(true);
    await saveToJobTracker(additionalDocs);
    setSaving(false);

    const attachNote = "\n\n[Please attach your resume before sending]";
    const safeBody = body.length > 500
      ? body.slice(0, 500) + "…\n\n[Full email copied to clipboard — paste to complete]" + attachNote
      : body + attachNote;

    const to = encodeURIComponent(recruiterEmail);
    const sub = encodeURIComponent(subject);
    const bod = encodeURIComponent(safeBody);

    let url = "";
    if (provider === "gmail") {
      url = `https://mail.google.com/mail/?view=cm&fs=1${recruiterEmail ? `&to=${to}` : ""}&su=${sub}&body=${bod}`;
    } else if (provider === "yahoo") {
      url = `https://compose.mail.yahoo.com/?${recruiterEmail ? `to=${to}&` : ""}subject=${sub}&body=${bod}`;
    } else {
      url = `mailto:${recruiterEmail}?subject=${sub}&body=${bod}`;
    }

    window.open(url, "_blank", "noopener,noreferrer");
    toast({
      title: "✅ Email copied to clipboard",
      description: "Your mail app is opening. Paste if the body looks short.",
    });
  };

  const canSend = subject.trim() && body.trim() && company.trim() && position.trim();
  const canSendDirectly = canSend && recruiterEmail.trim();

  return (
    <>
      <SEOHead
        title="Email Outreach | ATS Pro Resume Builder"
        description="Send AI-crafted outreach emails to recruiters directly from your resume builder."
      />
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email Outreach</h1>
          <p className="text-muted-foreground mt-1">
            Compose AI-powered outreach emails and send directly from the platform — with your resume attached.
          </p>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <span>
            <strong>Send directly</strong> — your resume is attached as a PDF. The email arrives with your name and replies come straight to your inbox. Applications are logged in your <strong>Job Tracker</strong>.
          </span>
        </div>

        {/* Resume selector */}
        {resumes.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="eo-resume" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Select Resume <span className="text-muted-foreground text-xs font-normal">(AI personalises the email + attaches as PDF)</span>
            </Label>
            <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
              <SelectTrigger id="eo-resume">
                <SelectValue placeholder="Choose a resume…" />
              </SelectTrigger>
              <SelectContent>
                {resumes.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="eo-company">Company <span className="text-destructive">*</span></Label>
            <Input
              id="eo-company"
              placeholder="e.g. Google"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eo-position">Position <span className="text-destructive">*</span></Label>
            <Input
              id="eo-position"
              placeholder="e.g. Software Engineer"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="eo-name">Your Name <span className="text-muted-foreground text-xs">(shown as sender)</span></Label>
            <Input
              id="eo-name"
              placeholder="e.g. Jane Smith"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eo-recruiter">
              Recruiter / HR Email <span className="text-muted-foreground text-xs">(required for direct send)</span>
            </Label>
            <Input
              id="eo-recruiter"
              type="email"
              placeholder="recruiter@company.com"
              value={recruiterEmail}
              onChange={(e) => setRecruiterEmail(e.target.value)}
            />
          </div>
        </div>

        {/* AI Generate */}
        <Button
          variant="outline"
          className="w-full border-primary/40 text-primary hover:bg-primary/5"
          onClick={generateWithAI}
          disabled={generating || !company || !position}
        >
          {generating ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Drafting with AI…</>
          ) : (
            <><Sparkles className="h-4 w-4 mr-2" />Generate Email with AI</>
          )}
        </Button>

        {/* Email editor */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4" /> Compose Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eo-subject">Subject</Label>
              <Input
                id="eo-subject"
                value={subject}
                placeholder="Your email subject…"
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eo-body">Message</Label>
              <Textarea
                id="eo-body"
                rows={8}
                value={body}
                placeholder="Click 'Generate Email with AI' to draft your message, or write it yourself…"
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Attachment toggle */}
        {selectedResumeId && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
            <Paperclip className="h-4 w-4 text-primary shrink-0" />
            <div className="flex-1 text-sm">
              <span className="font-medium">Attach resume as PDF</span>
              <span className="text-muted-foreground ml-2">
                ({resumes.find(r => r.id === selectedResumeId)?.title ?? "Selected resume"})
              </span>
            </div>
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

        {/* Additional documents */}
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2 text-sm font-medium cursor-default">
              <Upload className="h-4 w-4 text-primary" />
              Additional Attachments
              <span className="text-muted-foreground font-normal text-xs">(PDF, DOC, DOCX, JPG, PNG · max 5 MB each)</span>
            </Label>
            <label
              htmlFor="eo-extra-docs"
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload file
              <input
                id="eo-extra-docs"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="sr-only"
                onChange={handleAdditionalDocUpload}
              />
            </label>
          </div>

          {additionalDocs.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No additional files attached. Upload a cover letter, portfolio, certificate, or any other supporting document.
            </p>
          ) : (
            <ul className="space-y-2">
              {additionalDocs.map((doc) => (
                <li key={doc.name} className="flex items-center gap-2 rounded-md bg-background border border-border px-3 py-2 text-sm">
                  <Paperclip className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="flex-1 truncate text-foreground">{doc.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0 capitalize">
                    {doc.mimeType.split("/")[1]?.replace("vnd.openxmlformats-officedocument.wordprocessingml.document", "docx").replace("msword", "doc")}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAdditionalDoc(doc.name)}
                    className="ml-1 rounded p-0.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label={`Remove ${doc.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* Primary: Send directly */}
          <Button
            className="w-full"
            size="lg"
            onClick={sendDirectly}
            disabled={!canSendDirectly || sending}
          >
            {sending ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</>
            ) : (
              <><Send className="h-4 w-4 mr-2" />Send Email{attachResume && selectedResumeId ? " with Resume Attached" : ""}</>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Sent from our platform · Recipient replies go to <strong>{user?.email}</strong>
          </p>

          {/* Secondary: open in mail client */}
          <div className="flex flex-wrap gap-2 justify-between items-center pt-1 border-t">
            <span className="text-xs text-muted-foreground">Or open in your own inbox:</span>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                disabled={!canSend}
                onClick={async () => {
                  await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                  toast({ title: "Copied!", description: "Paste the email into any mail app." });
                }}
              >
                {copied ? <Check className="h-4 w-4 mr-1 text-primary" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openMailClient("default")}
                disabled={!canSend || saving}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Mail App
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openMailClient("yahoo")}
                disabled={!canSend || saving}
              >
                Yahoo Mail
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openMailClient("gmail")}
                disabled={!canSend || saving}
              >
                {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Mail className="h-4 w-4 mr-1" />}
                Gmail
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
