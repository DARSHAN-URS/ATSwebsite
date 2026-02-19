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
import { Sparkles, Loader2, Mail, ExternalLink, Info, FileText, Copy, Check } from "lucide-react";
import SEOHead from "@/components/SEOHead";
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
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [generating, setGenerating] = useState(false);
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
    // Pre-fill position if empty
    if (jobTitle && !position) setPosition(jobTitle);
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

  const saveToJobTracker = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("job_applications").insert({
        user_id: user.id,
        company,
        position,
        status: "applied",
        date_applied: new Date().toISOString().split("T")[0],
        notes: `📧 Applied via Email Outreach on ${new Date().toLocaleDateString()}${recruiterEmail ? ` — sent to ${recruiterEmail}` : ""}`,
        url: null,
      });
      if (error) throw error;
      toast({ title: "Saved to Job Tracker!", description: `${position} at ${company} has been added to your tracker.` });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save";
      toast({ title: "Save failed", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const openMailClient = async (provider: "gmail" | "yahoo" | "default") => {
    if (!subject.trim() || !body.trim()) {
      toast({ title: "Nothing to send", description: "Generate or write an email first.", variant: "destructive" });
      return;
    }

    // 1. Copy full email to clipboard so nothing is ever lost
    const fullText = `Subject: ${subject}\n\n${body}`;
    try {
      await navigator.clipboard.writeText(fullText);
    } catch {
      // clipboard access denied — proceed anyway
    }

    // Save to job tracker
    await saveToJobTracker();

    // 2. Build a SHORT URL — only pass subject + a trimmed body (≤500 chars)
    //    The full content is in clipboard; user pastes the rest if needed
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
      title: "✅ Full email copied to clipboard",
      description: "Your mail app is opening. If the body looks short, just paste (Ctrl+V / Cmd+V) the full email.",
    });
  };

  const canSend = subject.trim() && body.trim() && company.trim() && position.trim();

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
            Compose AI-powered outreach emails to recruiters. Emails open in your own inbox (Gmail, Yahoo, etc.) — applications are automatically saved to your Job Tracker.
          </p>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <span>
            When you open your mail client, this application is automatically logged in your <strong>Job Tracker</strong> so you can track the status.
          </span>
        </div>

        {/* Resume selector */}
        {resumes.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="eo-resume" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Select Resume <span className="text-muted-foreground text-xs font-normal">(AI will use this resume to personalise the email)</span>
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

        <div className="space-y-2">
          <Label htmlFor="eo-recruiter">Recruiter / HR Email <span className="text-muted-foreground text-xs">(optional — you can add it in your mail app)</span></Label>
          <Input
            id="eo-recruiter"
            type="email"
            placeholder="recruiter@company.com"
            value={recruiterEmail}
            onChange={(e) => setRecruiterEmail(e.target.value)}
          />
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
                rows={14}
                value={body}
                placeholder="Click 'Generate Email with AI' to draft your message, or write it yourself…"
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              📎 <strong>Tip:</strong> After your mail app opens, attach your resume PDF before hitting send.
            </p>
          </CardContent>
        </Card>

        {/* Actions row */}
        <div className="flex flex-wrap gap-3 justify-between items-center">
          {/* Copy to clipboard */}
          <Button
            variant="outline"
            disabled={!canSend}
            onClick={async () => {
              await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
              toast({ title: "Copied!", description: "Paste the email into any mail app." });
            }}
          >
            {copied ? <Check className="h-4 w-4 mr-2 text-primary" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? "Copied!" : "Copy Email"}
          </Button>

          <div className="flex gap-2 flex-wrap justify-end">
            <Button
              variant="outline"
              onClick={() => openMailClient("default")}
              disabled={!canSend || saving}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Mail App
            </Button>
            <Button
              variant="outline"
              onClick={() => openMailClient("yahoo")}
              disabled={!canSend || saving}
            >
              Yahoo Mail
            </Button>
            <Button
              onClick={() => openMailClient("gmail")}
              disabled={!canSend || saving}
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
              ) : (
                <><Mail className="h-4 w-4 mr-2" />Open in Gmail</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
