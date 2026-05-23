import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { invokeFunction } from "@/lib/api-client";
import { BookOpen, Search, Loader2, ArrowLeft, Bookmark, BookmarkCheck, Lightbulb, Briefcase, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { cn } from "@/lib/utils";

export default function InterviewQuestions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"role" | "resume">("role");
  const [position, setPosition] = useState("");
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<{ id: string, text: string, category: string }[]>([]);
  const [savedQuestions, setSavedQuestions] = useState<string[]>([]);
  
  useEffect(() => {
    if (user) {
      supabase.from("resumes").select("id, title, resume_data").order("updated_at", { ascending: false }).then(({ data }) => setResumes(data ?? []));
      
      const saved = localStorage.getItem(`saved_questions_${user.id}`);
      if (saved) {
        setSavedQuestions(JSON.parse(saved));
      }
    }
  }, [user]);

  const toggleSave = (qId: string, qText: string) => {
    let newSaved;
    if (savedQuestions.includes(qId)) {
      newSaved = savedQuestions.filter(id => id !== qId);
      toast({ title: "Removed from saved" });
    } else {
      newSaved = [...savedQuestions, qId];
      toast({ title: "Question saved to bookmarks" });
      
      // We could store the full object in localStorage or DB, 
      // but for simplicity in this frontend demo we store IDs and keep them in memory.
      // In a real app we would persist the question text.
    }
    setSavedQuestions(newSaved);
    if (user) {
      localStorage.setItem(`saved_questions_${user.id}`, JSON.stringify(newSaved));
    }
  };

  const handleGenerate = async () => {
    if (mode === "role" && !position) {
      toast({ title: "Role required", variant: "destructive" });
      return;
    }
    if (mode === "resume" && !selectedResumeId) {
      toast({ title: "Resume required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const selectedResume = resumes.find(r => r.id === selectedResumeId);
      const resumeData = selectedResume?.resume_data || null;

      const response = await invokeFunction("interview-prep", {
        action: "generate-questions",
        position: mode === "role" ? position : "General role based on resume",
        industry: "General",
        questionType: "Mixed",
        experienceLevel: "Intermediate",
        resumeData: mode === "resume" ? resumeData : null,
      });

      if (response.error) throw new Error(response.error);

      const generatedQuestions = response.data?.questions?.map((q: any, i: number) => ({
        id: `q-${Date.now()}-${i}`,
        text: q.question,
        category: q.type || "General"
      })) || [];

      setQuestions(generatedQuestions);
      toast({ title: "Questions generated!" });
    } catch (err: any) {
      toast({ title: "Failed to generate questions", description: err.message, variant: "destructive" });
      
      // Fallback
      setQuestions([
        { id: "fallback-1", text: "Can you describe a challenging project you worked on and how you overcame the obstacles?", category: "Behavioral" },
        { id: "fallback-2", text: "How do you stay updated with the latest technologies in your field?", category: "General" },
        { id: "fallback-3", text: "Explain a complex technical concept to a non-technical stakeholder.", category: "Technical" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 relative font-sans text-left">
      <SEOHead title="Question Bank - ResumePro" description="Explore interview questions." />
      
      <div className="flex items-center gap-4 mb-4">
         <Button variant="ghost" onClick={() => navigate("/interview-prep")} className="text-slate-400 hover:text-slate-900 rounded-xl px-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
         </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Sidebar - Controls */}
        <div className="md:col-span-4 space-y-6">
           <Card className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm space-y-6">
              <div className="space-y-1">
                 <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Search className="w-4 h-4 text-emerald-600" /> Discovery Mode
                 </h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Generate Questions</p>
              </div>

              <div className="flex gap-2 p-1 bg-slate-50 rounded-xl">
                 <button onClick={() => setMode("role")} className={cn("flex-1 py-2 rounded-lg text-xs font-bold transition-all", mode === "role" ? "bg-white shadow-sm text-emerald-600" : "text-slate-500 hover:text-slate-900")}>
                    By Role
                 </button>
                 <button onClick={() => setMode("resume")} className={cn("flex-1 py-2 rounded-lg text-xs font-bold transition-all", mode === "resume" ? "bg-white shadow-sm text-emerald-600" : "text-slate-500 hover:text-slate-900")}>
                    By Resume
                 </button>
              </div>

              {mode === "role" ? (
                 <div className="space-y-2">
                    <Input 
                       value={position} 
                       onChange={e => setPosition(e.target.value)} 
                       placeholder="e.g. Product Manager" 
                       className="h-11 rounded-xl bg-slate-50 border-slate-200 font-bold text-xs" 
                    />
                 </div>
              ) : (
                 <div className="space-y-2">
                    <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                       <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 font-bold text-xs">
                          <SelectValue placeholder="Select Context Resume" />
                       </SelectTrigger>
                       <SelectContent className="rounded-xl border border-slate-100 shadow-2xl bg-white p-1">
                          {resumes.map(r => (
                             <SelectItem key={r.id} value={r.id} className="text-xs font-semibold py-2.5 rounded-lg">
                                {r.title}
                             </SelectItem>
                          ))}
                       </SelectContent>
                    </Select>
                 </div>
              )}

              <Button 
                 onClick={handleGenerate} 
                 disabled={loading}
                 className="w-full h-12 rounded-xl bg-emerald-600 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
              >
                 {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Discover Questions"}
              </Button>
           </Card>

           <Card className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm space-y-4">
              <div className="space-y-1">
                 <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BookmarkCheck className="w-4 h-4 text-amber-500" /> Bookmarked
                 </h3>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{savedQuestions.length} saved questions</p>
              </div>
           </Card>
        </div>

        {/* Right Main Area - Results */}
        <div className="md:col-span-8">
           <Card className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm min-h-[500px]">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                 <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <BookOpen className="w-5 h-5" />
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-slate-900">Question Bank</h2>
                    <p className="text-xs font-medium text-slate-500">Study AI-generated questions tailored to your profile.</p>
                 </div>
              </div>

              {questions.length === 0 && !loading ? (
                 <div className="flex flex-col items-center justify-center text-center py-20 opacity-60">
                    <Lightbulb className="w-12 h-12 text-slate-300 mb-4" />
                    <p className="text-sm font-bold text-slate-500">Configure parameters on the left to generate targeted questions.</p>
                 </div>
              ) : (
                 <div className="space-y-4">
                    {questions.map((q, idx) => (
                       <div key={q.id} className="group flex items-start gap-4 p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-transparent hover:border-emerald-100 transition-all">
                          <span className="text-xs font-black text-slate-300 mt-1 w-6">{idx + 1}.</span>
                          <div className="flex-1 space-y-2">
                             <div className="flex items-center gap-2">
                                <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md", 
                                   q.category === "Behavioral" ? "bg-indigo-100 text-indigo-700" :
                                   q.category === "Technical" ? "bg-rose-100 text-rose-700" :
                                   "bg-slate-200 text-slate-700"
                                )}>
                                   {q.category}
                                </span>
                             </div>
                             <p className="text-sm font-semibold text-slate-800 leading-relaxed">{q.text}</p>
                          </div>
                          <Button 
                             variant="ghost" 
                             size="icon"
                             onClick={() => toggleSave(q.id, q.text)}
                             className={cn("opacity-0 group-hover:opacity-100 transition-opacity rounded-xl hover:bg-white shadow-sm", savedQuestions.includes(q.id) && "opacity-100 text-amber-500")}
                          >
                             {savedQuestions.includes(q.id) ? <BookmarkCheck className="w-4 h-4 fill-amber-500" /> : <Bookmark className="w-4 h-4 text-slate-400" />}
                          </Button>
                       </div>
                    ))}
                 </div>
              )}
           </Card>
        </div>
      </div>
    </div>
  );
}
