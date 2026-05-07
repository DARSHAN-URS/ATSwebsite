import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, Mail, ExternalLink, FileText, Copy, Check, Send, Info, Paperclip, X, Upload, Zap, ArrowRight, Star } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { buildDoc } from "@/components/resume/pdfTemplates";
import type { ResumeData } from "@/components/resume/types";
import type { Tables } from "@/integrations/supabase/types";
import { invokeFunction } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";

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
      const { data, error } = await invokeFunction("generate-outreach-email", {
        position,
        company,
        resumeId: selectedResumeId || undefined,
      });
      if (error) throw new Error(error.message || "Failed to generate");
      setSubject(data.subject);
      setBody(data.body);
      toast({ title: "Email drafted!" });
    } catch (err: any) {
      toast({ title: "Generation failed", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const saveToJobTracker = async (additionalDocsToSave?: { name: string; base64: string; mimeType: string }[]): Promise<string | null> => {
    if (!user) return null;
    try {
      const { data: appData } = await supabase.from("job_applications").insert({
        user_id: user.id,
        company,
        position,
        status: "applied",
        date_applied: new Date().toISOString().split("T")[0],
        notes: `📧 Sent via Email Outreach`,
        resume_id: selectedResumeId || null,
      }).select("id").maybeSingle();
      return appData?.id ?? null;
    } catch { return null; }
  };

  const sendDirectly = async () => {
    if (!recruiterEmail.trim()) {
      toast({ title: "Recipient required", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { error } = await invokeFunction("send-outreach-email", {
        to: recruiterEmail.trim(),
        subject: subject.trim(),
        body: body.trim(),
        fromName: fromName.trim() || undefined,
        replyTo: user?.email,
        position,
        company,
      });
      if (error) throw new Error(error.message || "Failed to send");
      await saveToJobTracker(additionalDocs);
      toast({ title: "✅ Email sent!" });
    } catch (err: any) {
      toast({ title: "Send failed", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <SEOHead title="Email Outreach — ResumePro" description="Connect with recruiters directly." />
      
      <div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Direct <span className="text-primary">Outreach</span></h1>
        <p className="text-slate-500 mt-2 font-medium">Draft and send high-conversion emails to recruiters directly from your dashboard.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         {/* Config Panel */}
         <div className="lg:col-span-1 space-y-8">
            <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
               <CardHeader className="p-8">
                  <CardTitle className="text-xl font-black">Target</CardTitle>
                  <CardDescription className="font-medium">Define who you're reaching out to.</CardDescription>
               </CardHeader>
               <CardContent className="p-8 pt-0 space-y-6">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Company</Label>
                     <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Stripe" className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Position</Label>
                     <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="e.g. Product Designer" className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recruiter Email</Label>
                     <Input value={recruiterEmail} onChange={(e) => setRecruiterEmail(e.target.value)} placeholder="recruiter@company.com" className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none" />
                  </div>
                  <Separator className="bg-slate-50" />
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resume Context</Label>
                     <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                        <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                           {resumes.map(r => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}
                        </SelectContent>
                     </Select>
                  </div>
               </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-primary/10 bg-primary/5 shadow-none p-8">
               <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                     <Zap className="w-5 h-5" />
                  </div>
                  <div>
                     <h4 className="text-sm font-black uppercase tracking-widest text-primary">Pro Tip</h4>
                     <p className="text-primary/70 text-xs font-bold mt-1 leading-relaxed">Personalized outreach increases your response rate by 40%. Use AI to tailor your pitch.</p>
                  </div>
               </div>
            </Card>
         </div>

         {/* Editor Panel */}
         <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col h-full">
               <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Mail className="w-5 h-5" />
                     </div>
                     <h2 className="text-xl font-black">Draft Email</h2>
                  </div>
                  <Button 
                    onClick={generateWithAI} 
                    disabled={generating || !company || !position} 
                    className="bg-primary/10 text-primary hover:bg-primary/20 rounded-xl font-black uppercase tracking-widest text-[10px] h-10 px-6 border border-primary/10 transition-all gap-2"
                  >
                     {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                     {generating ? "AI Drafting..." : "Draft with AI"}
                  </Button>
               </div>
               <CardContent className="p-10 space-y-8">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject Line</Label>
                     <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject..." className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none font-bold" />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message</Label>
                     <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={12} placeholder="Type your message or use AI..." className="rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border-none p-6 font-medium resize-none leading-relaxed" />
                  </div>
               </CardContent>
               <div className="p-8 mt-auto border-t border-slate-50 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                     <div className="flex -space-x-2">
                        {attachResume && (
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-400 shadow-sm relative z-10">
                             <Paperclip className="w-4 h-4" />
                          </div>
                        )}
                        <button className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 flex items-center justify-center text-slate-300 hover:text-primary transition-colors">
                           <Upload className="w-4 h-4" />
                        </button>
                     </div>
                     <div className="flex items-center gap-2">
                        <input type="checkbox" id="attach-resume" checked={attachResume} onChange={() => setAttachResume(!attachResume)} className="w-4 h-4 rounded border-slate-200 text-primary focus:ring-primary" />
                        <Label htmlFor="attach-resume" className="text-xs font-bold text-slate-500 cursor-pointer">Attach Selected Resume (PDF)</Label>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                     <Button variant="ghost" className="rounded-xl font-bold text-slate-400 px-6 h-12" onClick={() => { navigator.clipboard.writeText(body); toast({ title: "Copied!" }); }}>
                        <Copy className="w-4 h-4 mr-2" /> Copy
                     </Button>
                     <Button onClick={sendDirectly} disabled={sending || !recruiterEmail} className="flex-1 md:flex-none bg-primary text-white font-black uppercase tracking-widest text-xs h-14 px-12 rounded-2xl shadow-2xl shadow-primary/20 hover:scale-105 transition-all gap-3">
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {sending ? "Sending..." : "Send Outreach"}
                     </Button>
                  </div>
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
}
