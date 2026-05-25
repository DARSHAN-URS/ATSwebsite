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
  const [company, setCompany] = useState("");
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<{ id: string, text: string, category: string, intent?: string, framework?: string, tip?: string, difficulty?: string }[]>([]);
  const [savedQuestions, setSavedQuestions] = useState<string[]>([]);
  const [showingGuides, setShowingGuides] = useState<Record<string, boolean>>({});
  
  const [practicingId, setPracticingId] = useState<string | null>(null);
  const [answerDraft, setAnswerDraft] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviews, setReviews] = useState<Record<string, any>>({});
  
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
        company: mode === "role" ? company : undefined,
        questionType: mode === "resume" ? "resume-based" : "Mixed",
        experienceLevel: "Intermediate",
        resumeData: mode === "resume" ? resumeData : null,
      });

      if (response.error) throw new Error(response.error);

      const generatedQuestions = response.data?.questions?.map((q: any, i: number) => ({
        id: `q-${Date.now()}-${i}`,
        text: q.question,
        category: q.category || q.type || "General",
        intent: q.intent,
        framework: q.framework,
        tip: q.tip,
        difficulty: q.difficulty
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

  const handleReviewAnswer = async (qId: string, qText: string) => {
    if (!answerDraft.trim()) {
      toast({ title: "Please type an answer first", variant: "destructive" });
      return;
    }
    setReviewLoading(true);
    try {
      const response = await invokeFunction("interview-prep", {
        action: "review-answer",
        question: qText,
        answer: answerDraft
      });
      if (response.error) throw new Error(response.error);
      
      setReviews(prev => ({ ...prev, [qId]: response.data }));
      setPracticingId(null);
      setAnswerDraft("");
      toast({ title: "Feedback received!" });
    } catch (err: any) {
      toast({ title: "Failed to get feedback", description: err.message, variant: "destructive" });
    } finally {
      setReviewLoading(false);
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
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <Input 
                          value={position} 
                          onChange={e => setPosition(e.target.value)} 
                          placeholder="Role (e.g. Product Manager)" 
                          className="h-11 rounded-xl bg-slate-50 border-slate-200 font-bold text-xs" 
                       />
                    </div>
                    <div className="space-y-2">
                       <Input 
                          value={company} 
                          onChange={e => setCompany(e.target.value)} 
                          placeholder="Target Company (e.g. Google) - Optional" 
                          className="h-11 rounded-xl bg-slate-50 border-slate-200 font-bold text-xs" 
                       />
                    </div>
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
                       <div key={q.id} className="group flex flex-col p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-transparent hover:border-emerald-100 transition-all space-y-4">
                          <div className="flex items-start gap-4">
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
                                   {q.difficulty && (
                                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                         • {q.difficulty}
                                      </span>
                                   )}
                                </div>
                                <p className="text-sm font-semibold text-slate-800 leading-relaxed">{q.text}</p>
                             </div>
                             <div className="flex gap-2">
                                <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => setShowingGuides(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                                   className="h-8 text-xs font-bold text-slate-500 hover:text-emerald-600"
                                >
                                   {showingGuides[q.id] ? "Hide Guide" : "Study Guide"}
                                </Button>
                                <Button 
                                   variant="outline" 
                                   size="sm"
                                   onClick={() => {
                                      if (practicingId === q.id) {
                                        setPracticingId(null);
                                      } else {
                                        setPracticingId(q.id);
                                        setAnswerDraft("");
                                      }
                                   }}
                                   className="h-8 text-xs font-bold"
                                >
                                   {practicingId === q.id ? "Cancel" : "Practice"}
                                </Button>
                                <Button 
                                   variant="ghost" 
                                   size="icon"
                                   onClick={() => toggleSave(q.id, q.text)}
                                   className={cn("opacity-0 group-hover:opacity-100 transition-opacity rounded-xl hover:bg-white shadow-sm", savedQuestions.includes(q.id) && "opacity-100 text-amber-500")}
                                >
                                   {savedQuestions.includes(q.id) ? <BookmarkCheck className="w-4 h-4 fill-amber-500" /> : <Bookmark className="w-4 h-4 text-slate-400" />}
                                </Button>
                             </div>
                          </div>

                          {showingGuides[q.id] && (
                             <div className="pl-10 space-y-4 pt-2">
                                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50 space-y-3">
                                   {q.intent && (
                                      <div>
                                         <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Why they ask this</p>
                                         <p className="text-xs text-slate-700 font-medium">{q.intent}</p>
                                      </div>
                                   )}
                                   {q.framework && (
                                      <div>
                                         <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Required Structure</p>
                                         <p className="text-xs text-slate-700 font-medium">{q.framework}</p>
                                      </div>
                                   )}
                                   {q.tip && (
                                      <div>
                                         <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Pro Tip</p>
                                         <p className="text-xs text-slate-700 font-medium">{q.tip}</p>
                                      </div>
                                   )}
                                </div>
                             </div>
                          )}

                          {practicingId === q.id && (
                             <div className="pl-10 space-y-3">
                                <textarea
                                   className="w-full min-h-[100px] p-3 text-sm rounded-xl border border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                   placeholder="Type your answer here..."
                                   value={answerDraft}
                                   onChange={e => setAnswerDraft(e.target.value)}
                                />
                                <div className="flex justify-end">
                                   <Button 
                                      onClick={() => handleReviewAnswer(q.id, q.text)}
                                      disabled={reviewLoading}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8"
                                   >
                                      {reviewLoading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
                                      Get AI Feedback
                                   </Button>
                                </div>
                             </div>
                          )}

                          {reviews[q.id] && practicingId !== q.id && (
                             <div className="pl-10 space-y-4 pt-4 border-t border-emerald-100">
                                <div className="flex items-center gap-2">
                                   <span className="text-2xl font-black text-emerald-600">{reviews[q.id].score}/10</span>
                                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Score</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   <div className="space-y-2">
                                      <p className="text-xs font-bold text-emerald-700">Strengths</p>
                                      <ul className="space-y-1">
                                         {reviews[q.id].strengths?.map((s: string, i: number) => (
                                            <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5 before:content-['•'] before:text-emerald-500">{s}</li>
                                         ))}
                                      </ul>
                                   </div>
                                   <div className="space-y-2">
                                      <p className="text-xs font-bold text-amber-700">To Improve</p>
                                      <ul className="space-y-1">
                                         {reviews[q.id].improvements?.map((s: string, i: number) => (
                                            <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5 before:content-['•'] before:text-amber-500">{s}</li>
                                         ))}
                                      </ul>
                                   </div>
                                </div>
                                <div className="bg-emerald-50 rounded-xl p-4 space-y-2">
                                   <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Ideal Answer Structure</p>
                                   <p className="text-xs text-slate-700 font-medium leading-relaxed">{reviews[q.id].ideal_structure}</p>
                                </div>
                             </div>
                          )}
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
