import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, Loader2, Mail, ExternalLink, FileText, Send, Paperclip, X, Zap, Star, ShieldCheck, Copy, Upload, ArrowRight
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { buildDoc } from "@/components/resume/pdfTemplates";
import type { ResumeData } from "@/components/resume/types";
import type { Tables } from "@/integrations/supabase/types";
import { invokeFunction } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Resume = Tables<"resumes">;

export default function EmailOutreach() {
  const { user } = useAuth();
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
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("resumes").select("*").order("updated_at", { ascending: false }).then(({ data }) => {
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
    const rd = resume.resume_data as any;
    const personal = rd.personalInfo;
    const jobTitle = personal?.jobTitle || personal?.title || "";
    const name = personal?.fullName || personal?.name || "";
    if (jobTitle && !position) setPosition(jobTitle);
    if (name && !fromName) setFromName(name);
  }, [selectedResumeId, resumes]);

  const generateWithAI = async () => {
    if (!company || !position) {
      toast({ title: "Identification required", description: "Specify target organization and role.", variant: "destructive" });
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await invokeFunction("generate-outreach-email", { position, company, resumeId: selectedResumeId || undefined });
      if (error) throw new Error(error.message);
      setSubject(data.subject);
      setBody(data.body);
      toast({ title: "Protocol Synthesized" });
    } catch (err: any) {
      toast({ title: "Synthesis failed", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const sendEmail = async () => {
    if (!recruiterEmail || !subject || !body) {
      toast({ title: "Parameters missing", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      let attachmentBase64 = null;
      if (attachResume && selectedResumeId) {
        const resume = resumes.find(r => r.id === selectedResumeId);
        if (resume) {
          const doc = await buildDoc(resume.resume_data as unknown as ResumeData);
          attachmentBase64 = doc.output('datauristring').split(',')[1];
        }
      }
      const { error } = await invokeFunction("send-outreach-email", { to: recruiterEmail, subject, body, fromName, attachmentBase64 });
      if (error) throw new Error(error.message);
      toast({ title: "Transmission Successful" });
    } catch (err: any) {
      toast({ title: "Transmission Failed", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans pb-20">
      <SEOHead title="Strategic Link Protocol — ResumePro" description="Synchronize your identity with organizational recruiters." />
      
      <div className="container mx-auto px-8 pt-16 space-y-16 text-left">
         <div className="flex flex-col md:flex-row items-end justify-between gap-12">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 rounded-full border border-blue-600/20 text-blue-600">
                  <Mail className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Outreach Protocol</span>
               </div>
               <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                  Strategic <br /> <span className="text-blue-600">Link.</span>
               </h1>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5 space-y-10">
               <Card className="rounded-[4rem] border-none bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-12 space-y-10">
                  <div className="space-y-6">
                     <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Entity Parameters</Label>
                        <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="Target Organization" className="h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold" />
                     </div>
                     <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Role Objective</Label>
                        <Input value={position} onChange={e => setPosition(e.target.value)} placeholder="Target Role" className="h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold" />
                     </div>
                     <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Source Identity</Label>
                        <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                           <SelectTrigger className="h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold"><SelectValue placeholder="Select Module" /></SelectTrigger>
                           <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                              {resumes.map(r => <SelectItem key={r.id} value={r.id} className="rounded-xl font-bold">{r.title}</SelectItem>)}
                           </SelectContent>
                        </Select>
                     </div>
                  </div>
                  <Button onClick={generateWithAI} disabled={generating} className="w-full h-20 rounded-[2rem] bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] gap-4 shadow-2xl hover:scale-105 transition-all">
                     {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-blue-500" />} Synthesize Draft
                  </Button>
               </Card>

               <div className="p-10 space-y-6">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Transmission Logic.</h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                     Our neural outreach engine crafts highly personalized communication protocols that maximize recruiter engagement.
                     Connect your identity source to provide technical context.
                  </p>
                  <div className="flex gap-6 opacity-20">
                     <ShieldCheck className="w-8 h-8" />
                     <Zap className="w-8 h-8" />
                     <Star className="w-8 h-8" />
                  </div>
               </div>
            </div>

            <div className="lg:col-span-7">
               <Card className="rounded-[4rem] border-none bg-white dark:bg-slate-900 shadow-2xl p-12 space-y-10 min-h-[800px] flex flex-col">
                  <div className="space-y-6 flex-1">
                     <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Recipient Vector</Label>
                        <div className="relative">
                           <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                           <Input value={recruiterEmail} onChange={e => setRecruiterEmail(e.target.value)} placeholder="recruiter@organization.com" className="h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-14 font-bold" />
                        </div>
                     </div>
                     <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Operational Subject</Label>
                        <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject Protocol" className="h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold" />
                     </div>
                     <div className="space-y-3 flex-1 flex flex-col">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Message Narrative</Label>
                        <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Draft narrative..." className="flex-1 rounded-3xl bg-slate-50 dark:bg-slate-800 border-none p-8 font-medium text-slate-700 dark:text-slate-200 resize-none min-h-[300px]" />
                     </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 pt-10 border-t border-slate-50 dark:border-slate-800">
                     <div className="flex-1 flex items-center gap-4 px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                        <Paperclip className="w-5 h-5 text-slate-400" />
                        <span className="text-xs font-bold text-slate-500">Identity_Module.pdf</span>
                        <div className="ml-auto w-4 h-4 rounded-full bg-green-500 shadow-lg shadow-green-500/20" />
                     </div>
                     <Button onClick={sendEmail} disabled={sending} className="h-16 px-12 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] gap-4 shadow-xl shadow-blue-600/20 hover:scale-105 transition-all">
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} Transmit Protocol
                     </Button>
                  </div>
               </Card>
            </div>
         </div>
      </div>
    </div>
  );
}
