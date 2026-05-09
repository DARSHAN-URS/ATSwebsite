import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScanSearch, CheckCircle, XCircle, Zap, Target, Sparkles, ShieldCheck, Loader2 } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import type { Tables } from "@/integrations/supabase/types";
import type { ResumeData } from "@/components/resume/types";
import { motion, AnimatePresence } from "framer-motion";

type Resume = Tables<"resumes">;

function extractText(data: ResumeData): string {
  const parts: string[] = [];
  if (data.summary) parts.push(data.summary);
  if (data.skills?.length) parts.push(data.skills.join(" "));
  data.experience?.forEach((exp) => {
    if (exp.title) parts.push(exp.title);
    if (exp.company) parts.push(exp.company);
    if (exp.description) parts.push(exp.description);
    exp.bullets?.forEach((b) => parts.push(b));
  });
  data.education?.forEach((edu) => {
    if (edu.degree) parts.push(edu.degree);
    if (edu.school) parts.push(edu.school);
  });
  data.customSections?.forEach((s) => {
    if (s.title) parts.push(s.title);
    s.items?.forEach((i) => parts.push(i));
  });
  return parts.join(" ").toLowerCase();
}

function extractKeywords(text: string): string[] {
  const stopWords = new Set(["a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "from", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "can", "this", "that", "these", "those", "it", "its", "we", "our", "you", "your", "they", "their", "he", "she", "his", "her", "not", "no", "all", "each", "every", "both", "few", "more", "most", "other", "some", "such", "than", "too", "very", "just", "about", "above", "after", "again", "also", "any", "as", "because", "before", "between", "during", "into", "through", "under", "until", "up", "what", "when", "where", "which", "while", "who", "whom", "why", "how", "if", "then", "so", "work", "working", "worked", "experience", "role", "job", "position", "team", "company", "etc", "including", "using", "ability", "strong", "excellent", "required", "preferred", "must", "years", "minimum", "looking", "seeking", "responsible", "responsibilities", "requirements", "qualifications"]);
  const words = text.toLowerCase().replace(/[^a-z0-9\s\-\+\#\.]/g, " ").split(/\s+/);
  const wordCount: Record<string, number> = {};
  words.forEach((w) => {
    const cleaned = w.trim();
    if (cleaned.length < 2 || stopWords.has(cleaned)) return;
    wordCount[cleaned] = (wordCount[cleaned] || 0) + 1;
  });
  return Object.entries(wordCount).filter(([, count]) => count >= 1).sort((a, b) => b[1] - a[1]).slice(0, 40).map(([word]) => word);
}

export default function ATSKeywordScanner() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<{ matched: string[]; missing: string[]; score: number; } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("resumes").select("*").then(({ data }) => { if (data) setResumes(data); });
  }, [user]);

  const scan = () => {
    setScanning(true);
    setTimeout(() => {
      const resume = resumes.find((r) => r.id === selectedResumeId);
      if (!resume) { setScanning(false); return; }
      const resumeData = resume.resume_data as unknown as ResumeData;
      const resumeText = extractText(resumeData);
      const jdKeywords = extractKeywords(jobDescription);
      const matched: string[] = [];
      const missing: string[] = [];
      jdKeywords.forEach((kw) => { if (resumeText.includes(kw)) matched.push(kw); else missing.push(kw); });
      const score = jdKeywords.length > 0 ? Math.round((matched.length / jdKeywords.length) * 100) : 0;
      setResults({ matched, missing, score });
      setScanning(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 md:p-10 space-y-16 font-sans">
      <SEOHead title="Auditor — ResumePro" description="Optimize your professional architecture for algorithmic detection." />
      
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-12">
        <div className="space-y-4">
           <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                 <ScanSearch className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Architectural Audit Protocol</span>
           </motion.div>
           <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">
              Audit <br /> <span className="text-blue-600">Scanner.</span>
           </h1>
           <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
              Stress-test your resume against organizational algorithms to ensure maximum architectural compatibility and keyword alignment.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
         <div className="xl:col-span-4 space-y-10">
            <Card className="rounded-[4rem] border-none bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-10 space-y-10">
               <div className="space-y-6">
                  <div className="space-y-3">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Module</Label>
                     <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                        <SelectTrigger className="h-16 rounded-2xl bg-white border-slate-100 font-bold px-6">
                           <SelectValue placeholder="Select Architecture" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                           {resumes.map(r => <SelectItem key={r.id} value={r.id} className="rounded-xl p-3 font-bold">{r.title}</SelectItem>)}
                        </SelectContent>
                     </Select>
                  </div>
                  <div className="space-y-3">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Organizational Requirements</Label>
                     <Textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste the target job description..." className="min-h-[300px] rounded-[2.5rem] bg-white border-slate-100 font-bold p-8" />
                  </div>
               </div>
               <Button onClick={scan} disabled={scanning || !selectedResumeId || !jobDescription} className="w-full h-16 bg-blue-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-blue-600/30 gap-4 hover:scale-[1.02] transition-all">
                  {scanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                  Execute Audit
               </Button>
            </Card>

            <Card className="rounded-[3rem] border-none bg-blue-600 text-white p-10 shadow-2xl shadow-blue-600/30">
               <ShieldCheck className="w-10 h-10 mb-6" />
               <h3 className="text-2xl font-black tracking-tight mb-3">Algorithmic Defense</h3>
               <p className="text-blue-100 font-medium leading-relaxed">Our scanner uses high-fidelity extraction modules to identify critical keyword vectors required by modern ATS architectures.</p>
            </Card>
         </div>

         <div className="xl:col-span-8">
            <AnimatePresence mode="wait">
               {results ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
                     <Card className="rounded-[4rem] border-none bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.03)] p-12">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-10 border-b border-slate-50 dark:border-slate-800 pb-10">
                           <div className="space-y-2 text-center md:text-left">
                              <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Audit Score</h3>
                              <p className="text-slate-500 font-bold">Overall compatibility with target requirement vectors.</p>
                           </div>
                           <div className="relative w-32 h-32 flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90">
                                 <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-50 dark:text-slate-800" />
                                 <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * results.score) / 100} className="text-blue-600 transition-all duration-1000 ease-out" />
                              </svg>
                              <span className="absolute text-3xl font-black text-slate-900 dark:text-white">{results.score}%</span>
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12">
                           <div className="space-y-6">
                              <div className="flex items-center gap-3">
                                 <CheckCircle className="w-5 h-5 text-emerald-500" />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Identified Vectors</span>
                              </div>
                              <div className="flex flex-wrap gap-3">
                                 {results.matched.map(kw => <Badge key={kw} className="bg-emerald-50 text-emerald-600 rounded-xl px-4 py-2 border-emerald-100 font-bold uppercase text-[10px] tracking-widest">{kw}</Badge>)}
                              </div>
                           </div>
                           <div className="space-y-6">
                              <div className="flex items-center gap-3">
                                 <XCircle className="w-5 h-5 text-rose-500" />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Missing Modules</span>
                              </div>
                              <div className="flex flex-wrap gap-3">
                                 {results.missing.map(kw => <Badge key={kw} className="bg-rose-50 text-rose-600 rounded-xl px-4 py-2 border-rose-100 font-bold uppercase text-[10px] tracking-widest">{kw}</Badge>)}
                              </div>
                           </div>
                        </div>
                     </Card>

                     <Card className="rounded-[3rem] border-none bg-slate-900 text-white p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                           <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                              <Sparkles className="w-8 h-8 text-blue-400" />
                           </div>
                           <div className="space-y-1">
                              <h4 className="text-xl font-black tracking-tight">Optimization Recommended</h4>
                              <p className="text-slate-400 font-medium">Inject the missing keyword vectors into your architecture to reach 95%+ compatibility.</p>
                           </div>
                        </div>
                        <Button className="h-14 px-10 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all">Optimize Module</Button>
                     </Card>
                  </motion.div>
               ) : (
                  <div className="h-full flex items-center justify-center text-center p-20">
                     <div className="space-y-6">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-white dark:bg-slate-900 flex items-center justify-center text-slate-200 dark:text-slate-800 mx-auto border-4 border-dashed border-slate-100 dark:border-slate-800">
                           <Target className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                           <h3 className="text-2xl font-black text-slate-300 dark:text-slate-800">Awaiting Data Input</h3>
                           <p className="text-slate-400 dark:text-slate-800 font-medium max-w-xs mx-auto">Initialize the scan by selecting an architecture and defining organizational requirements.</p>
                        </div>
                     </div>
                  </div>
               )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
