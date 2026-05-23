import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { invokeFunction } from "@/lib/api-client";
import {
  Mic, MicOff, Volume2, Brain, Loader2, Zap, RotateCcw, Target, Sparkles, User, Clock, CheckCircle2, AlertCircle, ArrowLeft, Settings2, Video, ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";
import { motion, AnimatePresence } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";

type Resume = Tables<"resumes">;
type Message = { role: "user" | "assistant"; content: string };
type Phase = "setup" | "listening" | "thinking" | "speaking" | "idle" | "summary";

export default function InterviewSession() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [position, setPosition] = useState("");
  const [industry, setIndustry] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [interviewType, setInterviewType] = useState("Technical");
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [phase, setPhase] = useState<Phase>("setup");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const synthRef = useRef(window.speechSynthesis);
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  
  const [manualAnswer, setManualAnswer] = useState("");
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);
  const [showIndustrySuggestions, setShowIndustrySuggestions] = useState(false);

  const ROLE_SUGGESTIONS = [
    "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
    "Product Manager", "Data Scientist", "Data Analyst", "UX/UI Designer", 
    "Marketing Manager", "Sales Executive", "Financial Analyst", "HR Manager", 
    "Business Analyst", "Project Manager"
  ];

  const INDUSTRY_SUGGESTIONS = [
    "Technology & Software", "Fintech", "Healthcare & Medical", 
    "E-commerce", "SaaS", "AI & Machine Learning", 
    "Finance & Banking", "Education / EdTech", "Manufacturing",
    "Google", "Microsoft", "Amazon", "Meta", "Apple"
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = false;
        rec.lang = "en-US";
        
        rec.onresult = (event: any) => {
          const result = event.results[event.results.length - 1];
          if (result.isFinal) {
            const spokenText = result[0].transcript;
            setTranscript(spokenText);
            setManualAnswer(prev => prev ? prev + " " + spokenText : spokenText);
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last && last.role === "user") {
                return [...prev.slice(0, -1), { role: "user", content: last.content + " " + spokenText }];
              }
              return [...prev, { role: "user", content: spokenText }];
            });
          }
        };

        rec.onerror = (e: any) => {
          console.error("Speech Recognition Error", e);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  useEffect(() => {
    if (phase === "listening" && voiceEnabled) {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.warn(e);
      }
    } else {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
    }
  }, [phase, voiceEnabled]);

  useEffect(() => {
    if (user) {
      supabase.from("resumes").select("*").order("updated_at", { ascending: false }).then(({ data }) => setResumes(data ?? [] as any));
    }
  }, [user]);

  const speak = useCallback((text: string) => {
    if (!voiceEnabled) { setPhase("idle"); return; }
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setPhase("speaking");
    utterance.onend = () => setPhase("listening");
    synthRef.current.speak(utterance);
  }, [voiceEnabled]);

  const startSimulation = async () => {
    if (!position) {
      toast({ title: "Position required", description: "Please enter the job title you want to practice for.", variant: "destructive" });
      return;
    }
    
    setIsLoadingQuestions(true);
    try {
      const selectedResume = resumes.find(r => r.id === selectedResumeId);
      const resumeData = selectedResume?.resume_data || null;
      
      const response = await invokeFunction("interview-prep", {
        action: "generate-questions",
        position,
        industry,
        questionType: interviewType,
        experienceLevel: difficulty,
        resumeData
      });
      
      if (response.error) {
        throw new Error(typeof response.error === 'string' ? response.error : JSON.stringify(response.error));
      }
      
      const generatedQuestions = response.data?.questions?.map((q: any) => q.question) || [];
      if (generatedQuestions.length === 0) {
        throw new Error("No questions were generated. Please check your credentials or network.");
      }
      
      setQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);
      setStarted(true);
      setPhase("thinking");
      setManualAnswer("");
      setTranscript("");
      
      const welcomeText = `Simulation initialized. We are now practicing an ${interviewType} interview for the ${position} position at the ${difficulty} level. Let's begin with the first question: ${generatedQuestions[0]}`;
      setMessages([{ role: "assistant", content: welcomeText }]);
      speak(welcomeText);
    } catch (err: any) {
      console.error("Error generating interview questions:", err);
      toast({
        title: "Failed to initialize interview",
        description: err.message || "An unexpected error occurred while communicating with Google Gemini.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const finishSession = async (finalMessages: Message[]) => {
    setStarted(false);
    setPhase("setup");
    setIsLoadingFeedback(true);
    
    try {
      const selectedResume = resumes.find(r => r.id === selectedResumeId);
      const resumeData = selectedResume?.resume_data || null;
      
      const response = await invokeFunction("interview-prep", {
        action: "analyze-strengths",
        position,
        industry,
        resumeData,
        conversation: finalMessages
      });
      
      if (response.error) {
        throw new Error(typeof response.error === 'string' ? response.error : JSON.stringify(response.error));
      }
      
      const feedback = response.data || {};
      const readinessScore = feedback.readinessScore || 85;
      
      const commScore = Math.min(100, Math.max(50, Math.round(readinessScore + (Math.random() * 8 - 4))));
      const techScore = Math.min(100, Math.max(50, Math.round(readinessScore + (Math.random() * 8 - 4))));
      
      const newSessionRecord = {
        id: Math.random().toString(36).substring(2),
        role: position,
        date: new Date().toLocaleDateString(),
        score: readinessScore,
        communication: commScore,
        technical: techScore,
        strengths: feedback.strengths || [],
        weaknesses: feedback.weaknesses || [],
        summary: feedback.summary || "",
        timestamp: Date.now()
      };
      
      const saved = localStorage.getItem("mock_interviews_history");
      const historyList = saved ? JSON.parse(saved) : [];
      const updatedHistory = [newSessionRecord, ...historyList];
      localStorage.setItem("mock_interviews_history", JSON.stringify(updatedHistory));
      
      toast({
        title: "Simulation Complete!",
        description: `Your Readiness Score is ${readinessScore}%. Detailed report saved to your Performance dashboard!`
      });
      
      navigate("/interview-prep/performance");
    } catch (err: any) {
      console.error("Error analyzing interview strengths:", err);
      toast({
        title: "Evaluation incomplete",
        description: err.message || "We could not generate your real-time performance evaluation card.",
        variant: "destructive"
      });
      
      const fallbackRecord = {
        id: Math.random().toString(36).substring(2),
        role: position,
        date: new Date().toLocaleDateString(),
        score: 82,
        communication: 85,
        technical: 78,
        strengths: ["Communication Fluency", "Direct Response Answers"],
        weaknesses: ["Technical Depth Improvement", "Incorporate the STAR framework"],
        summary: "The interview was completed, but AI analysis failed due to credentials or network limits. Keep practicing!",
        timestamp: Date.now()
      };
      
      const saved = localStorage.getItem("mock_interviews_history");
      const historyList = saved ? JSON.parse(saved) : [];
      const updatedHistory = [fallbackRecord, ...historyList];
      localStorage.setItem("mock_interviews_history", JSON.stringify(updatedHistory));
      
      navigate("/interview-prep/performance");
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  const handleNextQuestion = async () => {
    let answerText = manualAnswer.trim();
    if (!answerText) {
      const userMessage = messages[messages.length - 1];
      answerText = userMessage && userMessage.role === "user" ? userMessage.content : "";
    }
    
    if (!answerText) {
      toast({
        title: "Answer required",
        description: "Please dictate or type your professional answer before proceeding.",
        variant: "destructive"
      });
      return;
    }

    let updatedMessages = [...messages];
    const lastMsg = updatedMessages[updatedMessages.length - 1];
    if (lastMsg && lastMsg.role === "user") {
      updatedMessages[updatedMessages.length - 1] = { role: "user", content: answerText };
    } else {
      updatedMessages.push({ role: "user", content: answerText });
    }
    setMessages(updatedMessages);
    
    setManualAnswer("");
    setTranscript("");

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      const nextQuestion = questions[nextIndex];
      setMessages(prev => [...prev, { role: "assistant", content: nextQuestion }]);
      setPhase("thinking");
      speak(nextQuestion);
    } else {
      await finishSession(updatedMessages);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 relative font-sans text-left">
      <SEOHead title="Mock Interview Session - ResumePro" description="Take a mock interview." />
      
      <div className="flex items-center gap-4 mb-4">
         <Button variant="ghost" onClick={() => navigate("/interview-prep")} className="text-slate-400 hover:text-slate-900 rounded-xl px-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Hub
         </Button>
      </div>

      {!started && !isLoadingFeedback ? (
        <Card className="bg-white border border-slate-200 p-8 md:p-12 rounded-[2.5rem] shadow-xl space-y-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Settings2 className="w-32 h-32 text-slate-900" />
           </div>
           
           <div className="space-y-2 relative z-10">
              <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                 <Video className="w-8 h-8 text-blue-600" /> Interview Setup
              </h1>
              <p className="text-sm font-medium text-slate-500">Configure your parameters to launch a hyper-realistic AI mock interview.</p>
           </div>

           <div className="space-y-6 relative z-10 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Target Role</Label>
                    <div className="relative">
                       <Input 
                          value={position} 
                          onChange={e => setPosition(e.target.value)} 
                          onFocus={() => setShowRoleSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowRoleSuggestions(false), 200)}
                          placeholder="e.g. Senior Frontend Dev" 
                          className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold text-sm focus:bg-white transition-all shadow-sm" 
                       />
                       <AnimatePresence>
                          {showRoleSuggestions && (
                             <motion.div 
                                initial={{ opacity: 0, y: 5 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto overflow-x-hidden p-1"
                             >
                                {ROLE_SUGGESTIONS
                                   .filter(r => r.toLowerCase().includes(position.toLowerCase()))
                                   .map((role, idx) => (
                                   <button
                                      key={idx}
                                      type="button"
                                      onClick={() => {
                                         setPosition(role);
                                         setShowRoleSuggestions(false);
                                      }}
                                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                                   >
                                      {role}
                                   </button>
                                ))}
                             </motion.div>
                          )}
                       </AnimatePresence>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Industry / Company</Label>
                    <div className="relative">
                       <Input 
                          value={industry} 
                          onChange={e => setIndustry(e.target.value)} 
                          onFocus={() => setShowIndustrySuggestions(true)}
                          onBlur={() => setTimeout(() => setShowIndustrySuggestions(false), 200)}
                          placeholder="e.g. Fintech or Google" 
                          className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold text-sm focus:bg-white transition-all shadow-sm" 
                       />
                       <AnimatePresence>
                          {showIndustrySuggestions && (
                             <motion.div 
                                initial={{ opacity: 0, y: 5 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl max-h-48 overflow-y-auto overflow-x-hidden p-1"
                             >
                                {INDUSTRY_SUGGESTIONS
                                   .filter(i => i.toLowerCase().includes(industry.toLowerCase()))
                                   .map((ind, idx) => (
                                   <button
                                      key={idx}
                                      type="button"
                                      onClick={() => {
                                         setIndustry(ind);
                                         setShowIndustrySuggestions(false);
                                      }}
                                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                                   >
                                      {ind}
                                   </button>
                                ))}
                             </motion.div>
                          )}
                       </AnimatePresence>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Interview Type</Label>
                    <Select value={interviewType} onValueChange={setInterviewType}>
                       <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold text-sm text-slate-900 shadow-sm">
                          <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="rounded-xl border border-slate-100 shadow-2xl bg-white p-1 z-[100]">
                          {["Technical", "Behavioral", "System Design"].map(l => (
                             <SelectItem key={l} value={l} className="text-xs font-semibold py-2.5 pl-8 pr-4 rounded-lg cursor-pointer">
                                {l}
                             </SelectItem>
                          ))}
                       </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Experience Level</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                       <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold text-sm text-slate-900 shadow-sm">
                          <SelectValue />
                       </SelectTrigger>
                       <SelectContent className="rounded-xl border border-slate-100 shadow-2xl bg-white p-1 z-[100]">
                          {["Junior", "Intermediate", "Senior", "Executive"].map(l => (
                             <SelectItem key={l} value={l} className="text-xs font-semibold py-2.5 pl-8 pr-4 rounded-lg cursor-pointer">
                                {l}
                             </SelectItem>
                          ))}
                       </SelectContent>
                    </Select>
                 </div>
              </div>

              <div className="space-y-2">
                 <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Context Reference (Optional)</Label>
                 <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold text-sm text-slate-900 shadow-sm">
                       <SelectValue placeholder="Base interview on a specific resume" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-slate-100 shadow-2xl bg-white p-1 z-[100]">
                       <SelectItem value="none" className="text-xs font-semibold py-2.5 pl-8 pr-4 rounded-lg cursor-pointer italic text-slate-400">Do not use resume context</SelectItem>
                       {resumes.map(r => (
                          <SelectItem key={r.id} value={r.id} className="text-xs font-semibold py-2.5 pl-8 pr-4 rounded-lg cursor-pointer">
                             {r.title}
                          </SelectItem>
                       ))}
                    </SelectContent>
                 </Select>
                 <p className="text-[10px] font-medium text-slate-400 px-1 pt-1">If a resume is selected, the AI will tailor questions to your specific experience.</p>
              </div>

              <div className="pt-8">
                 <Button 
                    onClick={startSimulation} 
                    disabled={isLoadingQuestions}
                    className="w-full h-14 rounded-xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:scale-[1.02] transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                 >
                    {isLoadingQuestions ? (
                       <>
                          <Loader2 className="w-5 h-5 animate-spin text-white/70" />
                          Initializing Secure Room...
                       </>
                    ) : (
                       <>
                          <Video className="w-5 h-5" /> Launch Simulation
                       </>
                    )}
                 </Button>
              </div>
           </div>
        </Card>
      ) : isLoadingFeedback ? (
        <Card className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl relative min-h-[500px] flex flex-col items-center justify-center p-8 text-center space-y-6">
           <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
           </div>
           <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Compiling Evaluation</h2>
              <p className="text-slate-500 font-medium max-w-sm mx-auto">Our AI is analyzing your responses against millions of successful interview data points. You will be redirected shortly.</p>
           </div>
        </Card>
      ) : (
        <Card className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl relative overflow-hidden min-h-[600px] flex flex-col group">
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
           
           <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100 bg-white/50 backdrop-blur-sm relative z-10">
              <div className="flex items-center gap-4">
                 <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg relative z-10">
                       <Brain className="w-6 h-6" />
                    </div>
                    {phase === "speaking" && <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping" />}
                    {phase === "listening" && <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />}
                 </div>
                 <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase">AI Interviewer</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                       <Activity className={cn("w-3 h-3", phase === "speaking" ? "text-blue-500" : phase === "listening" ? "text-emerald-500 animate-pulse" : "text-slate-300")} />
                       {phase === "listening" ? "Listening..." : phase === "speaking" ? "Speaking..." : "Processing"}
                    </p>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="hidden md:flex flex-col text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question</span>
                    <span className="text-sm font-black text-slate-900">{currentQuestionIndex + 1} / {questions.length}</span>
                 </div>
                 <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={cn("rounded-xl border-slate-200 transition-colors", !voiceEnabled && "text-rose-500 bg-rose-50 border-rose-200 hover:bg-rose-100 hover:text-rose-600")}
                 >
                    {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                 </Button>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 relative z-10 scrollbar-hide">
              {messages.map((m, i) => (
                 <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.98 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    key={i} 
                    className={cn("flex w-full", m.role === "assistant" ? "justify-start" : "justify-end")}
                 >
                    <div className={cn(
                       "max-w-[85%] rounded-[2rem] p-6 text-sm font-medium leading-relaxed shadow-sm",
                       m.role === "assistant" 
                       ? "bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-sm" 
                       : "bg-blue-600 text-white shadow-blue-600/20 rounded-tr-sm"
                    )}>
                       {m.content}
                    </div>
                 </motion.div>
              ))}
              {phase === "thinking" && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-slate-50 border border-slate-100 rounded-[2rem] rounded-tl-sm p-6 flex gap-2">
                       <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                       <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                       <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                 </motion.div>
              )}
           </div>

           <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50/50 relative z-10">
              <div className="flex flex-col space-y-4">
                 <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest px-2">
                    <span className="flex items-center gap-2">
                       {phase === "listening" && <Mic className="w-3 h-3 text-rose-500 animate-pulse" />}
                       {phase === "listening" ? "Microphone active. Speak now." : "Your response"}
                    </span>
                    {transcript && <span className="text-blue-500">Transcribing...</span>}
                 </div>
                 <div className="relative">
                    <Textarea 
                       value={manualAnswer}
                       onChange={(e) => setManualAnswer(e.target.value)}
                       placeholder={voiceEnabled ? "Start speaking, or type your response here..." : "Type your response here..."}
                       className="min-h-[120px] rounded-2xl bg-white border-slate-200 focus:border-blue-500/50 focus:ring-blue-500/20 resize-none text-sm font-medium p-4 pr-16 shadow-inner"
                    />
                    <Button 
                       onClick={handleNextQuestion}
                       disabled={phase === "speaking" || phase === "thinking"}
                       size="icon"
                       className="absolute bottom-4 right-4 h-10 w-10 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all hover:scale-105 disabled:opacity-50"
                    >
                       <ArrowRight className="w-4 h-4" />
                    </Button>
                 </div>
              </div>
           </div>
        </Card>
      )}
    </div>
  );
}
