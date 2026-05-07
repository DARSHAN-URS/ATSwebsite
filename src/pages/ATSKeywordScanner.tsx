import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ScanSearch, CheckCircle, XCircle, AlertTriangle, Zap, Target, Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i]} ${words[i + 1]}`.trim();
    if (phrase.length > 4 && !stopWords.has(words[i]) && !stopWords.has(words[i + 1])) {
      wordCount[phrase] = (wordCount[phrase] || 0) + 1;
    }
  }
  return Object.entries(wordCount).filter(([, count]) => count >= 1).sort((a, b) => b[1] - a[1]).slice(0, 60).map(([word]) => word);
}

export default function ATSKeywordScanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <SEOHead title="ATS Scanner — ResumePro" description="Optimize your resume for applicant tracking systems." />
      
      <div>
         <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="mb-6 rounded-xl font-bold text-slate-500 hover:text-primary transition-colors gap-2">
            <ArrowLeft className="h-4 w-4" /> Dashboard
         </Button>
         <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">ATS <span className="text-primary">Intelligence</span></h1>
         <p className="text-slate-500 mt-2 font-medium">Beat the algorithms. Scan your resume against job descriptions to ensure perfect keyword alignment.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
         {/* Input Section */}
         <div className="space-y-8">
            <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
               <CardHeader className="p-8">
                  <CardTitle className="text-xl font-black">Selection</CardTitle>
                  <CardDescription className="font-medium">Which resume are we testing today?</CardDescription>
               </CardHeader>
               <CardContent className="p-8 pt-0 space-y-6">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Resume</Label>
                     <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                        <SelectTrigger className="rounded-xl h-12 border-none bg-slate-50 dark:bg-slate-800"><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent className="rounded-xl">
                           {resumes.map(r => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}
                        </SelectContent>
                     </Select>
                  </div>
               </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
               <CardHeader className="p-8">
                  <CardTitle className="text-xl font-black">Job Description</CardTitle>
                  <CardDescription className="font-medium">Paste the text from the job posting.</CardDescription>
               </CardHeader>
               <CardContent className="p-8 pt-0 space-y-6">
                  <Textarea 
                    value={jobDescription} 
                    onChange={(e) => setJobDescription(e.target.value)} 
                    placeholder="Paste full job description here..." 
                    className="rounded-2xl bg-slate-50 dark:bg-slate-800 border-none p-6 font-medium resize-none leading-relaxed h-[300px]" 
                  />
                  <Button 
                    onClick={scan} 
                    disabled={scanning || !selectedResumeId || !jobDescription} 
                    className="w-full bg-slate-900 dark:bg-slate-800 text-white font-black uppercase tracking-widest text-xs h-14 rounded-2xl shadow-xl shadow-slate-900/10 hover:bg-primary transition-all gap-3"
                  >
                     {scanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <ScanSearch className="w-5 h-5" />}
                     {scanning ? "Analyzing Content..." : "Start Deep Scan"}
                  </Button>
               </CardContent>
            </Card>
         </div>

         {/* Results Section */}
         <div className="space-y-8">
            <AnimatePresence mode="wait">
               {!results && !scanning ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center py-32 text-center space-y-6 rounded-[3rem] bg-slate-50/50 dark:bg-slate-900/50 border-2 border-dashed border-slate-100 dark:border-slate-800">
                     <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-[2rem] flex items-center justify-center text-slate-200 shadow-sm">
                        <Target className="w-10 h-10" />
                     </div>
                     <h3 className="text-2xl font-black text-slate-900 dark:text-white">Waiting for Scan</h3>
                     <p className="text-slate-500 font-medium max-w-xs mx-auto">Input your resume and the job details to see your ATS match score.</p>
                  </motion.div>
               ) : scanning ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center py-32 text-center space-y-8">
                     <div className="relative">
                        <div className="w-24 h-24 bg-primary/10 rounded-full animate-ping absolute inset-0" />
                        <div className="w-24 h-24 bg-primary/20 rounded-[2.5rem] flex items-center justify-center text-primary relative z-10">
                           <Sparkles className="w-10 h-10" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-2xl font-black">Scanning...</h3>
                        <p className="text-slate-500 font-medium animate-pulse">Our AI is extracting keywords and checking alignment.</p>
                     </div>
                  </motion.div>
               ) : (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                     <Card className="rounded-[3rem] border-slate-100 bg-white dark:bg-slate-900 shadow-2xl p-10 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 ${results!.score >= 70 ? "bg-green-500/20" : "bg-amber-500/20"}`} />
                        <div className="flex items-center justify-between mb-8">
                           <h3 className="text-xl font-black">Alignment Score</h3>
                           <span className={`text-5xl font-black ${results!.score >= 70 ? "text-green-500" : "text-amber-500"}`}>{results!.score}%</span>
                        </div>
                        <Progress value={results!.score} className={`h-4 ${results!.score >= 70 ? "bg-green-50" : "bg-amber-50"}`} />
                        <p className="mt-8 text-slate-500 font-medium leading-relaxed">
                           {results!.score >= 70 
                             ? "Excellent alignment. Your resume uses the core language required by this employer." 
                             : "Some gaps identified. Adding the missing keywords below could significantly improve your rank."}
                        </p>
                     </Card>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="rounded-[2.5rem] border-green-50 bg-green-50/20 p-8 space-y-6">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-green-600">Matched ({results!.matched.length})</h4>
                           <div className="flex flex-wrap gap-2">
                              {results!.matched.slice(0, 20).map(kw => <Badge key={kw} className="bg-white text-green-700 border-green-100 rounded-lg px-3 py-1 font-bold text-[10px]">{kw}</Badge>)}
                           </div>
                        </Card>
                        <Card className="rounded-[2.5rem] border-red-50 bg-red-50/20 p-8 space-y-6">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-red-600">Missing ({results!.missing.length})</h4>
                           <div className="flex flex-wrap gap-2">
                              {results!.missing.slice(0, 20).map(kw => <Badge key={kw} className="bg-white text-red-700 border-red-100 rounded-lg px-3 py-1 font-bold text-[10px]">{kw}</Badge>)}
                           </div>
                        </Card>
                     </div>

                     <Card className="rounded-[2.5rem] border-primary/10 bg-primary/5 p-8">
                        <div className="flex items-center justify-between gap-6">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                 <Zap className="w-6 h-6" />
                              </div>
                              <div>
                                 <h4 className="font-black text-primary">Need a fix?</h4>
                                 <p className="text-primary/70 text-xs font-bold">Our AI can automatically insert these keywords.</p>
                              </div>
                           </div>
                           <Button onClick={() => navigate("/resumes")} className="bg-primary text-white font-black uppercase tracking-widest text-[10px] h-11 px-6 rounded-xl gap-2">
                              Fix Now <ArrowRight className="w-3.5 h-3.5" />
                           </Button>
                        </div>
                     </Card>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
