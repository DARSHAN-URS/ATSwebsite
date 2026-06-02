import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScanSearch, CheckCircle, XCircle, Globe, ExternalLink, Loader2, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import type { ResumeData } from "@/components/resume/types";
import { invokeFunction } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface ATSScannerDialogProps {
  resumeData: ResumeData;
  onNavigate?: (section: string) => void;
}

interface AIResult {
  overallScore: number;
  overallAssessment: string;
  ats: {
    score: number;
    strengths: string[];
    improvements: string[];
  };
}

export default function ATSScannerDialog({ resumeData, onNavigate }: ATSScannerDialogProps) {
  const [open, setOpen] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState<AIResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const scan = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);
    
    const hashStr = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash).toString(36);
    };

    const jdHash = hashStr(jobDescription.trim().toLowerCase());
    const resumeHash = hashStr(JSON.stringify(resumeData));

    try {
      if (user?.id) {
        const { data: cached } = await supabase
          .from("resume_ats_scans")
          .select("results")
          .eq("user_id", user.id)
          .eq("jd_hash", jdHash)
          .eq("resume_hash", resumeHash)
          .maybeSingle();

        if (cached && cached.results) {
          setResults(cached.results as AIResult);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await invokeFunction("grade-resume", {
        resumeData,
        jobDescription
      });
      
      if (error) throw new Error(error.message || "Failed to analyze resume.");
      
      if (user?.id && data) {
         await supabase.from("resume_ats_scans").insert({
            user_id: user.id,
            jd_hash: jdHash,
            resume_hash: resumeHash,
            results: data
         }).catch(() => {});
      }

      setResults(data);
    } catch (err: any) {
      toast({ title: "Analysis Failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (improvement: string) => {
    if (!onNavigate) return;
    const lower = improvement.toLowerCase();
    let target = "";
    if (lower.includes("skill")) target = "skills";
    else if (lower.includes("experience") || lower.includes("work")) target = "experience";
    else if (lower.includes("summary") || lower.includes("objective")) target = "summary";
    else if (lower.includes("education")) target = "education";
    else if (lower.includes("project")) target = "custom";
    else target = "personal";

    setOpen(false); // Close dialog
    setTimeout(() => onNavigate(target), 100); // Slight delay for smooth transition
  };

  const scoreColor = results
    ? results.ats.score >= 70 ? "text-green-600" : results.ats.score >= 40 ? "text-yellow-600" : "text-destructive"
    : "";

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setResults(null); setJobDescription(""); setLoading(false); } }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-white/50 border-blue-100 hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm rounded-full px-4 font-bold text-xs">
          <ScanSearch className="h-3.5 w-3.5 mr-2 text-blue-500" />
          <span className="hidden sm:inline uppercase tracking-widest text-slate-600">AI ATS Scan</span>
          <span className="sm:hidden">ATS</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-black">
            <ScanSearch className="h-6 w-6 text-blue-600" /> AI ATS Scanner
          </DialogTitle>
          <DialogDescription className="text-base font-medium">
            Paste a job description and our AI will analyze your resume to give you a true ATS match score and actionable feedback.
          </DialogDescription>
        </DialogHeader>

        {!results ? (
          <div className="space-y-4 mt-4">
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={8}
              className="min-h-[200px] resize-none bg-slate-50 border-slate-200 rounded-2xl focus-visible:ring-blue-500 text-slate-900"
              disabled={loading}
            />
            <Button 
              onClick={scan} 
              disabled={!jobDescription.trim() || loading} 
              className="w-full h-14 rounded-2xl gap-2 font-bold text-lg bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20"
            >
              {loading ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Analyzing Resume against JD...</>
              ) : (
                <><ScanSearch className="h-5 w-5" /> Scan Keywords & Grade Resume</>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            <Card className="border-2 border-slate-100 shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="pb-4 bg-slate-50/50">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>ATS Match Score</span>
                  <span className={`text-5xl font-black font-mono tracking-tighter ${scoreColor}`}>{results.ats.score}%</span>
                </CardTitle>
                <CardDescription className="text-base font-medium text-slate-600">
                  {results.overallAssessment}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Progress value={results.ats.score} className="h-3 bg-slate-100" />
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 items-start">
              <Card className="rounded-3xl border-slate-100 shadow-sm h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" /> Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {results.ats.strengths?.map((str, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-slate-700 leading-relaxed">
                        <span className="text-green-500 font-bold mt-0.5">•</span> {str}
                      </li>
                    ))}
                    {(!results.ats.strengths || results.ats.strengths.length === 0) && (
                      <p className="text-sm text-muted-foreground">No particular strengths found for this JD.</p>
                    )}
                  </ul>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-slate-100 shadow-sm h-full bg-blue-50/30 border-blue-100/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-blue-700">
                    <ScanSearch className="h-5 w-5" /> AI Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {results.ats.improvements?.map((imp, idx) => (
                      <li key={idx} className="flex flex-col gap-2 text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                        <div className="flex gap-2">
                           <span className="text-blue-500 font-bold mt-0.5">•</span> 
                           <span>{imp}</span>
                        </div>
                        {onNavigate && (
                           <button 
                             onClick={() => handleNavigate(imp)}
                             className="self-end mt-1 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 uppercase tracking-wider"
                           >
                              Fix this section <ArrowRight className="w-3 h-3" />
                           </button>
                        )}
                      </li>
                    ))}
                    {(!results.ats.improvements || results.ats.improvements.length === 0) && (
                      <p className="text-sm text-muted-foreground">Your resume is perfectly optimized!</p>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Button variant="outline" onClick={() => setResults(null)} className="w-full h-14 rounded-2xl font-bold text-slate-500 hover:text-slate-900 border-2">
              Scan Another Description
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
