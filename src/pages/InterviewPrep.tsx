import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Mic, MicOff, Volume2, VolumeX, Play, Square, RotateCcw, Send, User,
  Headphones, BookOpen, Shield, Loader2, ChevronDown, Lightbulb, Target,
  Brain, FileText, AlertTriangle, CheckCircle2, Sparkles, Zap, ArrowRight, Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { invokeFunction } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ResumeData } from "@/components/resume/types";
import type { Tables } from "@/integrations/supabase/types";
import { motion, AnimatePresence } from "framer-motion";
import SEOHead from "@/components/SEOHead";

type Resume = Tables<"resumes">;
type Message = { role: "user" | "assistant"; content: string };
type Phase = "setup" | "listening" | "thinking" | "speaking" | "idle" | "summary";
type QuestionType = "resume-based" | "behavioral" | "technical" | "role-based";

interface GeneratedQuestion {
  question: string;
  intent: string;
  framework: string;
  tip: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
}

interface StrengthItem { point: string; explanation: string; }
interface WeaknessItem { point: string; explanation: string; tip: string; }
interface AnalysisResult {
  strengths: StrengthItem[];
  weaknesses: WeaknessItem[];
  readinessScore: number;
  summary: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const FUNC_URL = BACKEND_URL 
  ? `${BACKEND_URL}/api/ai/interview-prep`
  : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interview-prep`;

export default function InterviewPrep() {
  const { session, user } = useAuth();
  const { toast } = useToast();

  const [position, setPosition] = useState("");
  const [industry, setIndustry] = useState("");
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("mock");

  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [phase, setPhase] = useState<Phase>("setup");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [currentCoachText, setCurrentCoachText] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef(window.speechSynthesis);
  const isListening = phase === "listening";

  const [questionType, setQuestionType] = useState<QuestionType>("role-based");
  const [experienceLevel, setExperienceLevel] = useState("mid");
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from("resumes").select("*").order("updated_at", { ascending: false })
        .then(({ data }) => setResumes(data ?? []));
    }
  }, [user]);

  const getSelectedResumeData = (): ResumeData | null => {
    if (!selectedResumeId || selectedResumeId === "none") return null;
    const resume = resumes.find(r => r.id === selectedResumeId);
    return resume ? (resume.resume_data as any as ResumeData) : null;
  };

  const speak = useCallback((text: string) => {
    if (!voiceEnabled) { setPhase("idle"); return; }
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onstart = () => setPhase("speaking");
    utterance.onend = () => setPhase("idle");
    utterance.onerror = () => setPhase("idle");
    synthRef.current.speak(utterance);
  }, [voiceEnabled]);

  const streamResponse = useCallback(async (body: any): Promise<string> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token}`,
    };
    if (!BACKEND_URL) headers["apikey"] = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const resp = await fetch(FUNC_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!resp.ok) throw new Error("Request failed");

    const reader = resp.body!.getReader();
    const decoder = new TextDecoder();
    let full = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") break;
        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            full += content;
            setCurrentCoachText(full);
          }
        } catch { }
      }
    }
    setMessages(prev => [...prev, { role: "assistant", content: full }]);
    return full;
  }, [session]);

  const startInterview = async () => {
    if (!position.trim() || !industry.trim()) {
      toast({ title: "Please enter details", variant: "destructive" });
      return;
    }
    setStarted(true);
    setPhase("thinking");
    try {
      const text = await streamResponse({ action: "start", position, industry, resumeData: getSelectedResumeData() });
      speak(text);
    } catch (e: any) {
      setPhase("idle");
    }
  };

  const sendAnswer = async (answer: string) => {
    if (!answer.trim()) return;
    const userMsg: Message = { role: "user", content: answer };
    setMessages(prev => [...prev, userMsg]);
    setTranscript("");
    setCurrentCoachText("");
    setPhase("thinking");
    setQuestionCount(prev => prev + 1);
    try {
      const text = await streamResponse({ action: "respond", position, industry, conversation: [...messages, userMsg], resumeData: getSelectedResumeData() });
      speak(text);
    } catch (e: any) {
      setPhase("idle");
    }
  };

  const endInterview = async () => {
    synthRef.current.cancel();
    setPhase("thinking");
    try {
      await streamResponse({ action: "summary", position, industry, conversation: messages, resumeData: getSelectedResumeData() });
      setPhase("summary");
    } catch (e: any) {
      setPhase("idle");
    }
  };

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setPhase("idle");
      if (transcript.trim()) sendAnswer(transcript.trim());
      return;
    }
    synthRef.current.cancel();
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (e: any) => {
      let current = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        current += e.results[i][0].transcript;
      }
      setTranscript(current);
    };
    recognition.onend = () => setPhase("idle");
    recognitionRef.current = recognition;
    recognition.start();
    setPhase("listening");
  };

  const generateQuestions = async () => {
    setQuestionsLoading(true);
    try {
      const { data } = await invokeFunction("interview-prep", {
        body: { action: "generate-questions", position, industry, questionType, experienceLevel, resumeData: getSelectedResumeData() },
      });
      setGeneratedQuestions(data.questions || []);
    } catch (e: any) {
      toast({ title: "Failed to generate questions", variant: "destructive" });
    } finally {
      setQuestionsLoading(false);
    }
  };

  const analyzeStrengths = async () => {
    setAnalysisLoading(true);
    try {
      const { data } = await invokeFunction("interview-prep", {
        body: { action: "analyze-strengths", position, industry, resumeData: getSelectedResumeData() },
      });
      setAnalysis(data);
    } catch (e: any) {
      toast({ title: "Analysis failed", variant: "destructive" });
    } finally {
      setAnalysisLoading(false);
    }
  };

  const resetInterview = () => {
    synthRef.current.cancel();
    setStarted(false);
    setMessages([]);
    setPhase("setup");
    setQuestionCount(0);
    setCurrentCoachText("");
  };

  if (started) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-between p-10 overflow-hidden">
         <div className="w-full max-w-4xl flex items-center justify-between text-white/50">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
               <span className="text-xs font-black uppercase tracking-widest">Live Coaching Session</span>
            </div>
            <Button variant="ghost" onClick={resetInterview} className="text-white hover:bg-white/10 rounded-xl font-bold">End Session</Button>
         </div>

         <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl space-y-12">
            <div className="relative">
               <div className={`absolute inset-0 bg-primary/20 rounded-full blur-[60px] transition-all duration-1000 ${phase === "speaking" ? "scale-150 opacity-100" : "scale-100 opacity-50"}`} />
               <motion.div 
                 animate={phase === "speaking" ? { scale: [1, 1.1, 1] } : {}}
                 transition={{ repeat: Infinity, duration: 2 }}
                 className="w-32 h-32 rounded-[2.5rem] bg-slate-800 border border-white/10 flex items-center justify-center relative z-10 shadow-2xl"
               >
                  <Headphones className={`w-12 h-12 ${phase === "speaking" ? "text-primary" : "text-white/20"}`} />
               </motion.div>
            </div>

            <div className="text-center space-y-4 max-w-2xl">
               <h2 className="text-white text-2xl font-black tracking-tight">
                  {phase === "listening" ? "Listening to you..." : phase === "thinking" ? "Alex is thinking..." : phase === "speaking" ? "Alex Carter" : "Alex is waiting..."}
               </h2>
               <div className="min-h-[100px]">
                  {currentCoachText && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/70 text-lg font-medium leading-relaxed">
                       "{currentCoachText}"
                    </motion.p>
                  )}
                  {transcript && (
                    <p className="text-primary text-lg font-black italic">
                       "{transcript}"
                    </p>
                  )}
               </div>
            </div>
         </div>

         <div className="w-full max-w-xl space-y-8 flex flex-col items-center">
            <div className="flex items-center gap-6">
               <button onClick={() => setVoiceEnabled(!voiceEnabled)} className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${voiceEnabled ? "border-white/10 bg-white/5 text-white" : "border-red-500/50 bg-red-500/10 text-red-500"}`}>
                  {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
               </button>
               <button 
                 onClick={toggleListening}
                 disabled={phase === "thinking"}
                 className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all ${isListening ? "bg-red-500 text-white scale-110 shadow-red-500/30" : "bg-primary text-white hover:scale-105 shadow-primary/30"}`}
               >
                  {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
               </button>
               <button onClick={endInterview} className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 bg-white/5 text-white">
                  <Square className="w-5 h-5" />
               </button>
            </div>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">
               {isListening ? "Tap to stop & send" : "Tap to speak your answer"}
            </p>
         </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <SEOHead title="Interview Prep — ResumePro" description="Master your interviews with AI-powered coaching." />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Interview <span className="text-primary">Mastery</span></h1>
          <p className="text-slate-500 mt-2 font-medium">Practice with AI, analyze your strategy, and land the offer.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <Card className="rounded-[2.5rem] md:col-span-1 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <CardHeader className="p-8">
               <CardTitle className="text-xl font-black">Context</CardTitle>
               <CardDescription className="font-medium">Define the target role.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Position</Label>
                  <Input value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. Product Manager" className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none" />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Industry</Label>
                  <Input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. SaaS" className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none" />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Resume Context</Label>
                  <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                    <SelectTrigger className="rounded-xl h-12"><SelectValue placeholder="Select a resume" /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="none">General Practice</SelectItem>
                      {resumes.map(r => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
               </div>
            </CardContent>
         </Card>

         <div className="md:col-span-2 space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
               <TabsList className="p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <TabsTrigger value="mock" className="rounded-xl px-6 py-2.5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                    Live Coach
                  </TabsTrigger>
                  <TabsTrigger value="questions" className="rounded-xl px-6 py-2.5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                    Question Bank
                  </TabsTrigger>
                  <TabsTrigger value="analysis" className="rounded-xl px-6 py-2.5 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                    Strategy
                  </TabsTrigger>
               </TabsList>

               <TabsContent value="mock" className="mt-0">
                  <Card className="rounded-[3rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden p-10 text-center space-y-8 relative">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                     <Avatar className="w-24 h-24 mx-auto border-4 border-white dark:border-slate-800 shadow-2xl">
                        <AvatarFallback className="bg-slate-900 text-white text-3xl font-black">AC</AvatarFallback>
                     </Avatar>
                     <div className="space-y-2">
                        <h2 className="text-2xl font-black">Alex Carter</h2>
                        <p className="text-slate-500 font-medium">Your AI Hiring Coach • Real-time Voice Conversation</p>
                     </div>
                     <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                        Start a realistic mock interview. Alex will analyze your speech, tone, and answers to give you professional feedback.
                     </p>
                     <Button onClick={startInterview} disabled={!position} className="bg-primary text-white font-black uppercase tracking-widest text-xs h-14 px-12 rounded-2xl shadow-2xl shadow-primary/20 hover:scale-105 transition-all gap-3">
                        <Play className="w-4 h-4 fill-white" /> Launch Interview
                     </Button>
                  </Card>
               </TabsContent>

               <TabsContent value="questions" className="mt-0 space-y-6">
                  <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-8">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Question Focus</Label>
                           <Select value={questionType} onValueChange={v => setQuestionType(v as QuestionType)}>
                             <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                             <SelectContent className="rounded-xl">
                               <SelectItem value="role-based">Role-Based</SelectItem>
                               <SelectItem value="behavioral">Behavioral (STAR)</SelectItem>
                               <SelectItem value="technical">Technical</SelectItem>
                               <SelectItem value="resume-based">Resume-Based</SelectItem>
                             </SelectContent>
                           </Select>
                        </div>
                        <div className="flex items-end">
                           <Button onClick={generateQuestions} disabled={questionsLoading || !position} className="w-full h-12 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-slate-900/10 hover:bg-primary transition-all">
                              {questionsLoading ? "Generating..." : "Generate List"}
                           </Button>
                        </div>
                     </div>
                  </Card>

                  <div className="space-y-4">
                     {generatedQuestions.map((q, i) => (
                       <Card key={i} className="rounded-[2rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 overflow-hidden group">
                          <div className="flex items-start gap-4">
                             <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 shrink-0">
                                {i + 1}
                             </div>
                             <div className="flex-1 space-y-3">
                                <p className="font-bold text-slate-900 dark:text-white leading-tight">{q.question}</p>
                                <div className="flex gap-2">
                                   <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-slate-100">{q.difficulty}</Badge>
                                   <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-slate-100">{q.category}</Badge>
                                </div>
                             </div>
                          </div>
                       </Card>
                     ))}
                  </div>
               </TabsContent>

               <TabsContent value="analysis" className="mt-0 space-y-8">
                  <Card className="rounded-[2.5rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-10 text-center space-y-6">
                     <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
                        <Shield className="w-8 h-8" />
                     </div>
                     <h3 className="text-xl font-black">Strengths Analysis</h3>
                     <p className="text-slate-500 font-medium max-w-sm mx-auto">
                        Identify your strongest selling points and potential red flags before the interview starts.
                     </p>
                     <Button onClick={analyzeStrengths} disabled={analysisLoading || !selectedResumeId} className="bg-primary text-white font-black uppercase tracking-widest text-xs h-12 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all">
                        {analysisLoading ? "Analyzing..." : "Analyze Strategy"}
                     </Button>
                  </Card>

                  {analysis && (
                    <div className="grid grid-cols-1 gap-6">
                       <Card className="rounded-[2.5rem] border-slate-100 bg-white dark:bg-slate-900 shadow-sm p-8">
                          <div className="flex items-center justify-between mb-6">
                             <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Readiness Score</h4>
                             <span className="text-3xl font-black text-primary">{analysis.readinessScore}%</span>
                          </div>
                          <Progress value={analysis.readinessScore} className="h-3 bg-slate-50" />
                       </Card>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card className="rounded-[2.5rem] border-green-50 bg-green-50/20 shadow-sm p-8 space-y-6">
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-green-600">Top Strengths</h4>
                             {analysis.strengths.map((s, i) => (
                               <div key={i} className="space-y-1">
                                  <p className="font-bold text-slate-900">{s.point}</p>
                                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{s.explanation}</p>
                               </div>
                             ))}
                          </Card>
                          <Card className="rounded-[2.5rem] border-amber-50 bg-amber-50/20 shadow-sm p-8 space-y-6">
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600">Areas to Prepare</h4>
                             {analysis.weaknesses.map((w, i) => (
                               <div key={i} className="space-y-1">
                                  <p className="font-bold text-slate-900">{w.point}</p>
                                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{w.explanation}</p>
                               </div>
                             ))}
                          </Card>
                       </div>
                    </div>
                  )}
               </TabsContent>
            </Tabs>
         </div>
      </div>
    </div>
  );
}
