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
  Mic, MicOff, Volume2, Brain, Loader2, Zap, RotateCcw, ShieldCheck, Target, Sparkles, ChevronRight, 
  User, Activity, TrendingUp, BarChart3, Clock, MessageSquare, Star, Info, CheckCircle2, AlertCircle, Heart,
  Video, Play, Settings2, BarChart, ArrowRight, History, Search, Code, Users, Lightbulb, XCircle, LayoutDashboard
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";
import { motion, AnimatePresence } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip } from "recharts";

type Resume = Tables<"resumes">;
type Message = { role: "user" | "assistant"; content: string };
type Phase = "setup" | "listening" | "thinking" | "speaking" | "idle" | "summary";

export default function InterviewPrep() {
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
  const [historyList, setHistoryList] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionScores, setSessionScores] = useState([]);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);
  
  const [manualAnswer, setManualAnswer] = useState("");
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("mock_interviews_history");
    if (saved) {
      try {
        setHistoryList(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);


  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = false;
        rec.lang = "en-US";
        
        rec.onresult = (event) => {
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

        rec.onerror = (e) => {
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

  const totalSessions = historyList.length;
  const averageReadiness = totalSessions > 0 
    ? Math.round(historyList.reduce((sum, h) => sum + h.score, 0) / totalSessions) 
    : 0;

  const averageTech = totalSessions > 0
    ? Math.round(historyList.reduce((sum, h) => sum + h.technical, 0) / totalSessions)
    : 0;

  const averageComm = totalSessions > 0
    ? Math.round(historyList.reduce((sum, h) => sum + (h.communication || 85), 0) / totalSessions)
    : 0;

  const averageSysDesign = totalSessions > 0
    ? Math.round(historyList.reduce((sum, h) => sum + Math.max(50, Math.round((h.technical * 0.9 + h.communication * 0.1) - 4)), 0) / totalSessions)
    : 0;

  const analyticsData = historyList.slice().reverse().map(h => ({
    name: h.date,
    score: h.score
  })).slice(-7);

  if (analyticsData.length === 0) {
    analyticsData.push({ name: "No Sessions", score: 0 });
  }

  const pieData = [
    { name: "Technical", value: averageTech, color: "#2563eb" },
    { name: "Behavioral", value: averageComm, color: "#10b981" },
    { name: "System Design", value: averageSysDesign, color: "#f59e0b" },
  ];

  const [activeTab, setActiveTab] = useState("Mock Interview");
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
    if (user) {
      supabase.from("resumes").select("*").order("updated_at", { ascending: false }).then(({ data }) => setResumes(data ?? []));
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
      setSessionScores([]);
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
        date: "Today",
        score: readinessScore,
        communication: commScore,
        technical: techScore,
        strengths: feedback.strengths || [],
        weaknesses: feedback.weaknesses || [],
        summary: feedback.summary || "",
        timestamp: Date.now()
      };
      
      const updatedHistory = [newSessionRecord, ...historyList];
      setHistoryList(updatedHistory);
      localStorage.setItem("mock_interviews_history", JSON.stringify(updatedHistory));
      
      toast({
        title: "Simulation Complete!",
        description: `Your Readiness Score is ${readinessScore}%. Detailed report saved to your Performance dashboard!`
      });
      
      setActiveTab("Performance");
    } catch (err: any) {
      console.error("Error analyzing interview strengths:", err);
      toast({
        title: "Evaluation incomplete",
        description: err.message || "We could not generate your real-time performance evaluation card.",
        variant: "destructive"
      });
      
      // Fallback session record to prevent losing user dialogue
      const fallbackRecord = {
        id: Math.random().toString(36).substring(2),
        role: position,
        date: "Today",
        score: 82,
        communication: 85,
        technical: 78,
        strengths: ["Communication Fluency", "Direct Response Answers"],
        weaknesses: ["Technical Depth Improvement", "Incorporate the STAR framework"],
        summary: "The interview was completed, but AI analysis failed due to credentials or network limits. Keep practicing!",
        timestamp: Date.now()
      };
      
      const updatedHistory = [fallbackRecord, ...historyList];
      setHistoryList(updatedHistory);
      localStorage.setItem("mock_interviews_history", JSON.stringify(updatedHistory));
      setActiveTab("Performance");
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
    <div className="min-h-screen bg-[#F5F7FB] font-sans pb-20 text-left selection:bg-blue-600/30">
      <SEOHead title="Interview Prep — ResumePro" description="Practice your professional interviews with AI." />
      
      <div className="max-w-7xl mx-auto space-y-8 p-8 md:p-10 relative">
         
         {/* 1. Premium Hero Header */}
         <div className="relative bg-white rounded-[2rem] p-8 md:p-10 overflow-hidden border border-slate-200 shadow-sm">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/[0.03] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-5">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100 text-blue-600 shadow-sm">
                      <Zap className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">AI Interview Engine Active</span>
                   </div>
                   <div className="space-y-2">
                     <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none uppercase">
                        Interview Lab.
                     </h1>
                     <p className="text-slate-500 font-medium text-sm max-w-xl">AI-powered mock interviews and real-time coaching for high-stakes career deployment.</p>
                   </div>
                </div>

               <div className="flex items-center gap-10 bg-slate-50/50 p-6 rounded-3xl border border-slate-100 backdrop-blur-sm">
                  <div className="text-right">
                     <p className="text-3xl font-black text-slate-900 leading-none">{totalSessions > 0 ? `${averageReadiness}%` : "--"}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">Readiness Score</p>
                  </div>
                  <div className="w-px h-12 bg-slate-200" />
                  <div className="text-right">
                     <p className="text-3xl font-black text-blue-600 leading-none">{totalSessions}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">Sessions Done</p>
                  </div>
               </div>
            </div>
         </div>

         {/* 2. Stats Row */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
               { label: "Confidence", value: totalSessions > 0 ? `${averageComm}%` : "--", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
               { label: "Technical", value: totalSessions > 0 ? `${averageTech}%` : "--", icon: Code, color: "text-indigo-600", bg: "bg-indigo-50" },
               { label: "Communication", value: totalSessions === 0 ? "--" : averageComm >= 85 ? "High" : averageComm >= 70 ? "Medium" : "Needs Work", icon: MessageSquare, color: "text-emerald-600", bg: "bg-emerald-50" },
               { label: "Readiness", value: totalSessions === 0 ? "--" : averageReadiness >= 80 ? "Ready" : averageReadiness >= 65 ? "Improving" : "Critical", icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" },
            ].map((stat, i) => (
               <Card key={i} className="bg-white border border-slate-200 p-5 rounded-[1.5rem] hover:shadow-lg transition-all duration-300 group cursor-pointer hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                     <div className={cn("p-2.5 rounded-xl transition-colors", stat.bg)}>
                        <stat.icon className={cn("w-4 h-4", stat.color)} />
                     </div>
                     <Badge variant="outline" className="text-[8px] border-slate-200 text-slate-400 font-bold px-2 py-0.5">+2.4%</Badge>
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-xl font-black text-slate-900">{stat.value}</p>
               </Card>
            ))}
         </div>

         {/* 3. Main Dashboard Area */}
         <div className="space-y-8">
         
         <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 max-w-md mb-8">
                  {["Mock Interview", "Question Bank", "Performance"].map(tab => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                           "flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300",
                           activeTab === tab 
                           ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" 
                           : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                        )}
                     >
                        {tab}
                     </button>
                  ))}
               </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            <div className="lg:col-span-4">
               <Card className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm space-y-8 relative overflow-hidden h-full">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                     <Settings2 className="w-20 h-20 text-slate-900" />
                  </div>
                  <div className="space-y-1 relative z-10">
                     <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-600" /> Configuration
                     </h3>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Interview Parameters</p>
                  </div>

                  <div className="space-y-5 relative z-10">
                     <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-1">Target Role</Label>
                        <div className="relative">
                           <Input 
                              value={position} 
                              onChange={e => setPosition(e.target.value)} 
                              onFocus={() => setShowRoleSuggestions(true)}
                              onBlur={() => setTimeout(() => setShowRoleSuggestions(false), 200)}
                              placeholder="e.g. Senior Frontend Dev" 
                              className="h-11 rounded-xl bg-slate-50 border-slate-200 font-bold text-xs focus:bg-white transition-all shadow-sm" 
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
                                    {position && ROLE_SUGGESTIONS.filter(r => r.toLowerCase().includes(position.toLowerCase())).length === 0 && (
                                       <div className="px-3 py-2 text-xs font-medium text-slate-400">Press enter to use "{position}"</div>
                                    )}
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-1">Industry / Company</Label>
                        <div className="relative">
                           <Input 
                              value={industry} 
                              onChange={e => setIndustry(e.target.value)} 
                              onFocus={() => setShowIndustrySuggestions(true)}
                              onBlur={() => setTimeout(() => setShowIndustrySuggestions(false), 200)}
                              placeholder="e.g. Fintech" 
                              className="h-11 rounded-xl bg-slate-50 border-slate-200 font-bold text-xs focus:bg-white transition-all shadow-sm" 
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
                                    {industry && INDUSTRY_SUGGESTIONS.filter(i => i.toLowerCase().includes(industry.toLowerCase())).length === 0 && (
                                       <div className="px-3 py-2 text-xs font-medium text-slate-400">Press enter to use "{industry}"</div>
                                    )}
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-1">Experience Level</Label>
                        <Select value={difficulty} onValueChange={setDifficulty}>
                           <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 font-bold text-xs text-slate-900 shadow-sm">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent className="rounded-xl border border-slate-100 shadow-2xl bg-white">
                              {["Junior", "Intermediate", "Senior", "Executive"].map(l => <SelectItem key={l} value={l} className="font-bold text-[10px] p-3 uppercase hover:bg-blue-50 cursor-pointer">{l}</SelectItem>)}
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-1">Context Reference</Label>
                        <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                           <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 font-bold text-xs text-slate-900 shadow-sm">
                              <SelectValue placeholder="Select Resume" />
                           </SelectTrigger>
                           <SelectContent className="rounded-xl border border-slate-100 shadow-2xl bg-white">
                              {resumes.map(r => <SelectItem key={r.id} value={r.id} className="font-bold text-[10px] p-3 uppercase hover:bg-blue-50 cursor-pointer">{r.title}</SelectItem>)}
                           </SelectContent>
                        </Select>
                     </div>

                      <div className="pt-4">
                         <Button 
                            onClick={startSimulation} 
                            disabled={isLoadingQuestions}
                            className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] gap-3 shadow-xl shadow-slate-900/10 hover:bg-blue-600 transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                         >
                            {isLoadingQuestions ? (
                               <>
                                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                                  Initializing Interview Room...
                               </>
                            ) : (
                               <>
                                  Launch Simulation <ArrowRight className="w-4 h-4" />
                               </>
                            )}
                         </Button>
                      </div>
                  </div>
               </Card>
            </div>
            
            <div className="lg:col-span-8">
               <AnimatePresence mode="wait">
                  {activeTab === "Mock Interview" && (
                     <motion.div key="mock" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                        
                        {/* Main Interview Panel */}
                        <Card className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl relative overflow-hidden min-h-[600px] flex flex-col group">
                           <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-50" />
                           
                           {/* Diagnostic Evaluation Loading Overlay */}
                            {isLoadingFeedback && (
                               <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                                  <div className="w-20 h-20 rounded-[2.2rem] bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6 relative">
                                     <Loader2 className="w-8 h-8 animate-spin" />
                                     <Brain className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" />
                                  </div>
                                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Analyzing Dialogue & Session logs</h3>
                                  <p className="text-xs text-slate-500 font-medium max-w-sm leading-relaxed mb-6">
                                     Google Gemini is evaluating your communication fluency, professional vocabulary depth, and role competency matrix...
                                  </p>
                                  <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                     <motion.div 
                                        className="h-full bg-blue-600 rounded-full"
                                        animate={{ width: ["0%", "100%"] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                     />
                                  </div>
                               </div>
                            )}

                           {/* Panel Header */}
                           <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white relative z-10">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Brain className="w-6 h-6" />
                                 </div>
                                 <div>
                                    <h3 className="text-base font-black text-slate-900 tracking-tight uppercase">AI Simulation Room</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                       <div className={cn("w-1.5 h-1.5 rounded-full", started ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                                       {started ? "Session in Progress" : "Standby Mode"}
                                    </p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3">
                                 <Badge variant="outline" className="text-[10px] font-black border-slate-200 text-slate-400 px-3 py-1 uppercase">{interviewType}</Badge>
                                 {started && (
                                    <Button variant="ghost" size="icon" onClick={() => setStarted(false)} className="h-10 w-10 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
                                       <XCircle className="w-5 h-5" />
                                    </Button>
                                 )}
                              </div>
                           </div>

                           {/* Content Area */}
                           <div className="flex-1 p-8 md:p-12 flex flex-col justify-center items-center text-center relative overflow-hidden">
                              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2563eb 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
                              
                              {!started ? (
                                 <div className="space-y-10 max-w-md relative z-10">
                                    <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border border-slate-100 mx-auto flex items-center justify-center text-slate-200">
                                       <Video className="w-10 h-10" />
                                    </div>
                                    <div className="space-y-3">
                                       <h4 className="text-xl font-black text-slate-900 uppercase">Ready for Deployment?</h4>
                                       <p className="text-sm text-slate-500 font-medium leading-relaxed">Your AI interviewer is calibrated and ready to begin the session. Ensure your audio is active.</p>
                                    </div>
                                    <Button onClick={startSimulation} className="h-14 px-10 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-[11px] gap-3 shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all transform hover:scale-105 active:scale-95">
                                       Initialize Interview Protocol <ArrowRight className="w-4 h-4" />
                                    </Button>
                                 </div>
                              ) : (
                                 <div className="space-y-12 max-w-2xl w-full relative z-10">
                                    <div className="relative">
                                       {/* AI Intervirewer Avatar */}
                                       <motion.div 
                                          animate={{ 
                                             scale: phase === "speaking" ? [1, 1.05, 1] : 1,
                                             boxShadow: phase === "speaking" ? ["0 0 0 0px rgba(37,99,235,0.2)", "0 0 0 20px rgba(37,99,235,0)", "0 0 0 0px rgba(37,99,235,0)"] : "0 0 0 0px rgba(0,0,0,0)"
                                          }}
                                          transition={{ repeat: Infinity, duration: 2 }}
                                          className={cn(
                                             "w-40 h-40 rounded-full mx-auto flex items-center justify-center text-white transition-all duration-700 border-4 relative z-10",
                                             phase === "speaking" ? "bg-blue-600 border-blue-100" : "bg-slate-100 border-white text-slate-300"
                                          )}
                                       >
                                          {phase === "listening" ? <Mic className="w-12 h-12 text-blue-600" /> : <Brain className="w-12 h-12" />}
                                       </motion.div>
                                       
                                       {/* Animated Rings */}
                                       {phase === "speaking" && (
                                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                             <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 2, opacity: 0 }} transition={{ repeat: Infinity, duration: 2 }} className="w-40 h-40 border border-blue-200 rounded-full" />
                                             <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 2.5, opacity: 0 }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} className="w-40 h-40 border border-blue-100 rounded-full" />
                                          </div>
                                       )}
                                    </div>

                                    <div className="space-y-6">
                                       <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-xl">
                                          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                                          AI Interviewer
                                       </div>
                                       <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-snug tracking-tight">
                                          {messages[messages.length - 1]?.content || "Initializing cognitive link..."}
                                       </h3>
                                    </div>

                                    <div className="pt-6 flex justify-center gap-3">
                                       {phase === "listening" && (
                                          <div className="flex gap-1.5 h-8 items-center bg-blue-50 px-6 rounded-full border border-blue-100">
                                             {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                                <motion.div key={i} animate={{ height: [8, 24, 8] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }} className="w-1 bg-blue-600 rounded-full" />
                                             ))}
                                          </div>
                                       )}
                                    </div>

                                     {/* Enhanced Response Inputs Typing Panel */}
                                     <div className="w-full max-w-xl mx-auto space-y-3 pt-6 border-t border-slate-100">
                                        <div className="flex items-center justify-between px-1">
                                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                              <MessageSquare className="w-3.5 h-3.5 text-blue-600" /> 
                                              {voiceEnabled ? "Voice Dictation / Manual Edit" : "Manual Response Input"}
                                           </span>
                                           <span className="text-[9px] font-bold text-slate-400 uppercase">
                                              Question {currentQuestionIndex + 1} of {questions.length}
                                           </span>
                                        </div>
                                        <div className="relative rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-300">
                                           <Textarea
                                              value={manualAnswer}
                                              onChange={(e) => setManualAnswer(e.target.value)}
                                              placeholder={voiceEnabled ? "Speak clearly... or start typing here to edit/override the live transcription" : "Type your detailed professional response here..."}
                                              className="min-h-[120px] w-full p-4 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-slate-850 font-bold text-xs leading-relaxed placeholder:text-slate-400"
                                           />
                                           <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                              {manualAnswer && (
                                                 <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => setManualAnswer("")}
                                                    className="h-7 w-7 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                                                 >
                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                 </Button>
                                              )}
                                           </div>
                                        </div>
                                     </div>
                                  </div>
                              )}
                           </div>

                           {/* Panel Footer */}
                           <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
                              <div className="flex items-center gap-4">
                                 <div className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                                    <Mic className={cn("w-4 h-4", voiceEnabled ? "text-blue-600" : "text-slate-300")} />
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Mic Active</span>
                                    <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={cn("w-8 h-4 rounded-full relative transition-colors", voiceEnabled ? "bg-blue-600" : "bg-slate-200")}>
                                       <div className={cn("absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all", voiceEnabled ? "left-[18px]" : "left-0.5")} />
                                    </button>
                                 </div>
                              </div>
                              
                              {started && (
                                 <div className="flex items-center gap-3">
                                    <Button variant="outline" onClick={() => { setStarted(false); setPhase("setup"); }} className="h-12 px-6 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-white transition-all shadow-sm">
                                       <RotateCcw className="w-4 h-4" /> Reset
                                    </Button>
                                    <Button onClick={handleNextQuestion} className="h-12 px-8 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-blue-600 transition-all shadow-lg">
                                       Next Question <ChevronRight className="w-4 h-4" />
                                    </Button>
                                 </div>
                              )}
                           </div>
                        </Card>
                     </motion.div>
                  )}

                  {activeTab === "Question Bank" && (
                     <motion.div key="questions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                           { title: "Technical Fundamentals", count: 42, icon: Code, color: "text-blue-600", bg: "bg-blue-50" },
                           { title: "Behavioral Matrix", count: 28, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
                           { title: "System Design", count: 15, icon: LayoutDashboard, color: "text-emerald-600", bg: "bg-emerald-50" },
                           { title: "Cultural Alignment", count: 12, icon: Heart, color: "text-rose-600", bg: "bg-rose-50" },
                        ].map((category, i) => (
                           <Card key={i} className="bg-white border border-slate-200 p-8 rounded-[2rem] hover:shadow-lg transition-all group cursor-pointer relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                                 <category.icon className="w-24 h-24" />
                              </div>
                              <div className="space-y-6 relative z-10">
                                 <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all", category.bg, category.color)}>
                                    <category.icon className="w-6 h-6" />
                                 </div>
                                 <div className="space-y-2">
                                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{category.title}</h4>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{category.count} Questions Analyzed</p>
                                 </div>
                                 <div className="pt-2">
                                    <Button variant="link" className="p-0 h-auto text-blue-600 font-black text-[10px] uppercase tracking-widest gap-2 group-hover:translate-x-2 transition-transform">
                                       Explore Library <ChevronRight className="w-4 h-4" />
                                    </Button>
                                 </div>
                              </div>
                           </Card>
                        ))}
                     </motion.div>
                  )}

                  {activeTab === "Performance" && (
                     <motion.div key="performance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                           {/* Score Trend */}
                           <Card className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm space-y-8">
                              <div className="flex items-center justify-between">
                                 <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Performance Velocity</h4>
                                 <Badge className="bg-blue-50 text-blue-600 border-none text-[8px] font-black uppercase">Weekly Trend</Badge>
                              </div>
                              <div className="h-[250px] w-full">
                                 <ResponsiveContainer width="100%" height="100%">
                                    <ReBarChart data={analyticsData}>
                                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                                       <ReTooltip 
                                          contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                          labelStyle={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '10px' }}
                                       />
                                       <Bar dataKey="score" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={24} />
                                    </ReBarChart>
                                 </ResponsiveContainer>
                              </div>
                           </Card>

                           {/* Competency Map */}
                           <Card className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm space-y-8">
                              <div className="flex items-center justify-between">
                                 <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Competency Matrix</h4>
                                 <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black uppercase">Active Analysis</Badge>
                              </div>
                              <div className="flex items-center justify-around h-[250px]">
                                 <div className="h-full w-1/2">
                                    <ResponsiveContainer width="100%" height="100%">
                                       <PieChart>
                                          <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                                             {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                             ))}
                                          </Pie>
                                       </PieChart>
                                    </ResponsiveContainer>
                                 </div>
                                 <div className="space-y-4">
                                    {pieData.map((item, i) => (
                                       <div key={i} className="flex items-center gap-3">
                                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                          <div className="space-y-0.5">
                                             <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{item.name}</p>
                                             <p className="text-[9px] font-bold text-slate-400">{item.value}% Mastery</p>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           </Card>
                        </div>

                        {/* Detailed Metrics Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           {[
                              { label: "Speaking Confidence", value: Math.min(100, Math.round(averageComm * 1.02)), color: "bg-blue-600" },
                              { label: "Response Clarity", value: Math.round(averageComm * 0.95), color: "bg-indigo-600" },
                              { label: "Technical Accuracy", value: averageTech, color: "bg-emerald-600" },
                           ].map((metric, i) => (
                              <Card key={i} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                                 <div className="flex justify-between items-center">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{metric.label}</p>
                                    <p className="text-xs font-black text-slate-900">{metric.value}%</p>
                                 </div>
                                 <Progress value={metric.value} className={cn("h-1.5 bg-slate-100", metric.color)} />
                              </Card>
                           ))}
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" /> AI Insights
                     </h3>
                     <Badge className="bg-blue-50 text-blue-600 border-none text-[8px] font-bold uppercase px-2">Analysis</Badge>
                  </div>
                  
                  <div className="space-y-4">
                      {(() => {
                         const latestSession: any = historyList[0];
                         const hasRealFeedback = latestSession && Array.isArray(latestSession.strengths);
                         
                         const strengths = hasRealFeedback ? latestSession.strengths : [
                            { point: averageTech >= 85 ? "Technical Depth" : "Domain Fundamentals", explanation: "Excellent demonstration of role-specific architectures and domain protocols." },
                            { point: averageComm >= 85 ? "Communication Fluency" : "Direct Answering", explanation: "Fluid expression of concepts with highly structured delivery frameworks." }
                         ];
                         
                         const improvements = hasRealFeedback ? latestSession.weaknesses : [
                            { point: averageComm < 85 ? "Filler Words (um/like)" : "STAR Method Delivery", explanation: "Minimize non-lexical fillers and apply structural action results context." },
                            { point: averageTech < 85 ? "Domain Vocabulary" : "Architectural Frameworks", explanation: "Deepen references to specialized technology stack vocabulary." }
                         ];

                         return (
                            <>
                               {[
                                  { label: "Strengths", items: strengths, color: "text-emerald-600", icon: CheckCircle2 },
                                  { label: "Improvements", items: improvements, color: "text-amber-600", icon: AlertCircle }
                               ].map((section, i) => (
                                  <div key={i} className="space-y-2">
                                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">{section.label}</p>
                                     <div className="grid grid-cols-1 gap-2">
                                        {section.items.map((item: any, j) => {
                                           const isObject = typeof item === 'object';
                                           const title = isObject ? item.point : item;
                                           const desc = isObject ? (item.explanation || item.tip) : null;
                                           return (
                                              <div key={j} className="p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-all text-left">
                                                 <div className="flex items-center gap-3">
                                                    <section.icon className={cn("w-3.5 h-3.5 flex-shrink-0", section.color)} />
                                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-tight">{title}</span>
                                                 </div>
                                                 {desc && (
                                                    <p className="mt-1.5 pl-6 text-[10px] text-slate-500 font-medium leading-relaxed">
                                                       {desc}
                                                    </p>
                                                 )}
                                              </div>
                                           );
                                        })}
                                     </div>
                                  </div>
                               ))}
                               
                               {latestSession?.summary && (
                                  <div className="p-4 mt-2 rounded-2xl bg-blue-50/50 border border-blue-100 text-[11px] font-medium text-slate-600 leading-relaxed text-left">
                                     <strong className="text-slate-900 uppercase block mb-1 text-[9px] tracking-wider font-black flex items-center gap-1.5">
                                        <Info className="w-3.5 h-3.5 text-blue-600" /> Session Summary
                                     </strong>
                                     {latestSession.summary}
                                  </div>
                               )}
                            </>
                         );
                      })()}
                   </div>
               </Card>
               {/* Recent Sessions Activity Feed */}
               <Card className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <History className="w-3.5 h-3.5 text-blue-600" /> Recent Sessions
                     </h3>
                  </div>
                  <div className="space-y-4">
                     {historyList.map((session: any, i) => (
                        <div key={i} onClick={() => navigate("/resumes")} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 hover:border-blue-600/30 transition-all group cursor-pointer">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                 <Play className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                 <p className="text-[11px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{session.role}</p>
                                 <p className="text-[9px] text-slate-400 font-medium">{session.date}</p>
                              </div>
                           </div>
                           <Badge variant="outline" className="text-[9px] font-bold border-emerald-100 text-emerald-600 bg-emerald-50/30">{session.score}%</Badge>
                        </div>
                     ))}
                  </div>
               </Card>
         </div>
      </div>
   </div>
</div>
);
}