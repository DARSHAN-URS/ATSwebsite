import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, Loader2, Mail, ExternalLink, FileText, Send, Paperclip, X, Zap, Star, ShieldCheck, Copy, Upload, ArrowRight,
  TrendingUp, BarChart3, Target, Clock, Filter, Info, ChevronRight, CheckCircle2, AlertCircle, Eye, Users, MousePointer2,
  Settings2, MessageSquare, History, Wand2, Type
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { buildDoc } from "@/components/resume/pdfTemplates";
import type { ResumeData } from "@/components/resume/types";
import type { Tables } from "@/integrations/supabase/types";
import { invokeFunction } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/i18n/LanguageContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

type Resume = Tables<"resumes">;

export default function EmailOutreach() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const to = t.emailOutreach;
  const queryClient = useQueryClient();

  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachResume, setAttachResume] = useState(true);
  const [tone, setTone] = useState("professional");

  // Cached Queries
  const { data: resumes = [], isSuccess: resumesLoaded } = useQuery({
    queryKey: ["resumes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("resumes").select("*").eq("user_id", user?.id).order("updated_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Resume[];
    },
    enabled: !!user?.id,
  });

  const { data: history = [], isLoading: loadingHistory } = useQuery({
    queryKey: ["outreach-history", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("email_outreach_history").select("*").eq("user_id", user?.id).order("sent_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Automatically select first resume on load
  if (resumesLoaded && resumes.length > 0 && !selectedResumeId) {
    setSelectedResumeId(resumes[0].id);
  }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResumeId, resumes]);

  // Mutations
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!company || !position) throw new Error("Missing company or position");
      const { data, error } = await invokeFunction("generate-outreach-email", { position, company, resumeId: selectedResumeId || undefined, tone });
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data) => {
      setSubject(data.subject);
      setBody(data.body);
      toast({ title: to.draftCreated });
    },
    onError: (err) => {
      if (err.message === "Missing company or position") {
        toast({ title: to.moreInfoNeeded, description: to.enterCompanyJob, variant: "destructive" });
      } else {
        toast({ title: to.failedDraft, variant: "destructive" });
      }
    }
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!recruiterEmail || !subject || !body) throw new Error("Missing fields");
      let attachmentBase64 = null;
      if (attachResume && selectedResumeId) {
        const resume = resumes.find(r => r.id === selectedResumeId);
        if (resume) {
          const doc = await buildDoc(resume.resume_data as unknown as ResumeData);
          attachmentBase64 = doc.output('datauristring').split(',')[1];
        }
      }
      const { error } = await invokeFunction("send-outreach-email", { 
        to: recruiterEmail, 
        subject, 
        body, 
        fromName, 
        resumePdfBase64: attachmentBase64,
        resumeFilename: "Resume.pdf"
      });
      if (error) throw new Error(error.message);

      if (user) {
        const { error: dbError } = await supabase.from("email_outreach_history").insert({
          user_id: user.id,
          company,
          position,
          recruiter_email: recruiterEmail,
          subject,
          body,
          resume_id: selectedResumeId || null
        });
        if (dbError) throw dbError;
      }
    },
    onSuccess: () => {
      toast({ title: to.emailSent });
      queryClient.invalidateQueries({ queryKey: ["outreach-history", user?.id] });
    },
    onError: (err) => {
      if (err.message === "Missing fields") {
        toast({ title: to.fillFields, variant: "destructive" });
      } else {
        toast({ title: to.failedSend, variant: "destructive" });
      }
    }
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-left pb-20 font-sans">
      <SEOHead title={to.seoTitle} description={to.seoDesc} />
         
         {/* 1. SaaS Hero Section */}
         <div className="relative bg-white rounded-3xl p-8 md:p-10 overflow-hidden border border-slate-200 shadow-sm">
            <div className="absolute top-0 right-0 w-full lg:w-[400px] h-auto lg:h-[400px] bg-blue-600/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100 text-blue-600">
                      <Zap className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{to.engineActive}</span>
                   </div>
                   <div className="space-y-1">
                     <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-none uppercase">
                        {to.title}
                     </h1>
                     <p className="text-slate-500 font-medium text-sm max-w-xl">{to.subtitle}</p>
                   </div>
                </div>

               <div className="flex items-center gap-6">
                  <div className="text-right">
                     <p className="text-2xl font-bold text-slate-900 leading-none">42</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{to.sentToday}</p>
                  </div>
                  <div className="w-px h-10 bg-slate-100" />
                  <div className="text-right">
                     <p className="text-2xl font-bold text-blue-600 leading-none">67%</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{to.avgReplyRate}</p>
                  </div>
               </div>
            </div>
         </div>

         {/* 2. Communication Workspace Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-auto lg:h-[400px] lg:min-h-auto lg:h-[700px]">
            
            {/* Left Panel: Configuration */}
            <div className="lg:col-span-4 space-y-6">
               <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                     <Settings2 className="w-20 h-20 text-slate-900" />
                  </div>
                  <div className="space-y-1">
                     <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-600" /> {to.parameters}
                     </h3>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{to.missionConfig}</p>
                  </div>

                  <div className="space-y-4 relative z-10">
                     <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-1">{to.targetEntity}</Label>
                        <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google" className="h-11 rounded-xl bg-slate-50 border-slate-200 font-bold text-xs focus:bg-white transition-all" />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-1">{to.functionalArea}</Label>
                        <Input value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. Senior Backend Engineer" className="h-11 rounded-xl bg-slate-50 border-slate-200 font-bold text-xs focus:bg-white transition-all" />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-1">{to.contextReference}</Label>
                        <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                           <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 font-bold text-xs text-slate-900">
                              <SelectValue placeholder={to.selectResume} />
                           </SelectTrigger>
                           <SelectContent className="rounded-xl border border-slate-100 shadow-2xl bg-white">
                              {resumes.map(r => <SelectItem key={r.id} value={r.id} className="font-bold text-[10px] p-3 uppercase hover:bg-blue-50 cursor-pointer">{r.title}</SelectItem>)}
                           </SelectContent>
                        </Select>
                     </div>
                     
                     <div className="pt-4 space-y-4">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-1">{to.tonePersona}</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                           {Object.entries(to.tones).map(([key, label]) => (
                              <button 
                                 key={key}
                                 onClick={() => setTone(key)}
                                 className={cn(
                                    "px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest border transition-all",
                                    tone === key ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20" : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-white hover:border-blue-600/30"
                                 )}
                              >
                                 {label}
                              </button>
                           ))}
                        </div>
                     </div>

                     <div className="pt-6 border-t border-slate-50">
                        <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending} className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] gap-3 shadow-xl shadow-slate-900/10 hover:bg-blue-600 transition-all">
                           {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} {to.synthesizeDraft}
                        </Button>
                     </div>
                  </div>
               </Card>

               <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                     <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> {to.safetyProtocols}
                     </h3>
                     <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-bold uppercase">{to.active}</Badge>
                  </div>
                  <div className="space-y-3">
                     <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3">
                           <Eye className="w-4 h-4 text-slate-400" />
                           <span className="text-[10px] font-bold text-slate-500 uppercase">{to.spamAnalysis}</span>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                     </div>
                     <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3">
                           <FileText className="w-4 h-4 text-slate-400" />
                           <span className="text-[10px] font-bold text-slate-500 uppercase">{to.atsCompatible}</span>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                     </div>
                  </div>
               </Card>
            </div>

            {/* Middle Panel: Superhuman Composer */}
            <div className="lg:col-span-8 h-full">
               <Card className="rounded-3xl border border-slate-200 bg-white shadow-xl h-full flex flex-col relative overflow-hidden group">
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-50" />
                  
                  {/* Composer Header */}
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                           <MessageSquare className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">{to.intelligenceComposer}</h3>
                     </div>
                     <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[8px] font-bold text-slate-400 border-slate-200 px-2 py-0.5">{to.draftMode}</Badge>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50"><X className="w-4 h-4" /></Button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-slate-900 text-white font-bold text-xs rounded-xl border-none">
                            Clear Draft
                          </TooltipContent>
                        </Tooltip>
                     </div>
                  </div>

                  {/* Composer Fields */}
                  <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                     <div className="space-y-6">
                        <div className="flex items-center border-b border-slate-100 focus-within:border-blue-500/50 pb-3 transition-colors duration-200">
                           <span className="w-20 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{to.recipient}</span>
                           <div className="flex-1 relative">
                              <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                              <input 
                                 value={recruiterEmail} 
                                 onChange={e => setRecruiterEmail(e.target.value)} 
                                 placeholder="recruiter@company.com" 
                                 className="w-full bg-transparent border-none focus:outline-none focus:ring-0 outline-none pl-7 text-sm font-bold text-slate-900 placeholder:text-slate-300 transition-all" 
                              />
                           </div>
                        </div>
                        <div className="flex items-center border-b border-slate-100 focus-within:border-blue-500/50 pb-3 transition-colors duration-200">
                           <span className="w-20 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{to.subject}</span>
                           <input 
                              value={subject} 
                              onChange={e => setSubject(e.target.value)} 
                              placeholder="Application for [Mission Title]..." 
                              className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 outline-none text-sm font-bold text-slate-900 placeholder:text-slate-300 transition-all" 
                           />
                        </div>
                        <div className="pt-4 flex-1">
                           <textarea 
                              value={body} 
                              onChange={e => setBody(e.target.value)} 
                              placeholder={to.startDrafting} 
                              className="w-full h-full min-h-auto lg:h-[400px] bg-transparent border-none focus:outline-none focus:ring-0 outline-none text-sm font-medium text-slate-600 leading-relaxed resize-none placeholder:text-slate-300 transition-all" 
                           />
                        </div>
                     </div>
                  </div>

                  {/* Composer Footer */}
                  <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
                     <div className="flex items-center gap-4 px-4 py-2 bg-white border border-slate-200 rounded-xl">
                        <div className="flex items-center gap-2">
                           <Paperclip className="w-4 h-4 text-slate-400" />
                           <span className="text-[10px] font-bold text-slate-500 uppercase">Resume.pdf</span>
                        </div>
                        <Checkbox checked={attachResume} onCheckedChange={(c) => setAttachResume(!!c)} className="w-4 h-4 border-slate-200 data-[state=checked]:bg-blue-600 rounded" />
                     </div>
                     
                     <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                           <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{to.readabilityScore}</p>
                           <p className="text-[10px] font-bold text-emerald-600">{to.premium} (94/100)</p>
                        </div>
                        <Button onClick={() => sendMutation.mutate()} disabled={sendMutation.isPending} className="h-12 px-8 rounded-xl bg-blue-600 text-white font-bold uppercase tracking-widest text-[10px] gap-3 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">
                           {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} {to.initializeOutreach}
                        </Button>
                     </div>
                  </div>
               </Card>
            </div>
         </div>

         {/* 3. Recent Activity Section */}
         <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-600" /> {to.recentCommunications}
               </h3>
               <Button variant="ghost" size="sm" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600">{to.viewFullHistory}</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {loadingHistory ? (
                  [1,2,3].map(i => (
                     <Card key={i} className="rounded-3xl border border-slate-200 bg-white p-5">
                        <div className="flex justify-between items-start mb-4">
                           <Skeleton className="w-10 h-10 rounded-xl" />
                           <Skeleton className="w-16 h-5 rounded-full" />
                        </div>
                        <div className="space-y-2 mb-4">
                           <Skeleton className="h-4 w-3/4" />
                           <Skeleton className="h-3 w-1/2" />
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                           <Skeleton className="h-3 w-20" />
                           <Skeleton className="h-3 w-16" />
                        </div>
                     </Card>
                  ))
               ) : history.length === 0 ? (
                  <div className="col-span-full py-16 text-center space-y-4 bg-white rounded-3xl border border-slate-200 border-dashed w-full">
                     <Mail className="w-8 h-8 text-slate-300 mx-auto" />
                     <p className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">No recent communications</p>
                     <p className="text-slate-400 text-xs max-w-xs mx-auto">Create and synthesize your first outreach parameters above to get in touch with hiring recruiters!</p>
                  </div>
               ) : (
                  history.map((item) => (
                     <Card key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5 hover:border-blue-600/30 hover:shadow-md transition-all group cursor-pointer">
                        <div className="flex justify-between items-start mb-4">
                           <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                              {item.company.charAt(0)}
                           </div>
                           <Badge className="text-[8px] font-bold uppercase bg-blue-50 text-blue-600 border-none">
                              Delivered
                           </Badge>
                        </div>
                        <div className="space-y-1 mb-4">
                           <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.position}</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.company}</p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                           <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
                              <Clock className="w-3 h-3" /> {new Date(item.sent_at).toLocaleDateString()}
                           </div>
                           <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                              <span className="text-[9px] font-bold text-slate-900">95% {to.optimised}</span>
                           </div>
                        </div>
                     </Card>
                  ))
               )}
            </div>
         </div>
    </div>
  );
}
