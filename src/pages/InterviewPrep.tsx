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
  Brain, FileText, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ResumeData } from "@/components/resume/types";
import type { Tables } from "@/integrations/supabase/types";

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

const FUNC_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/interview-prep`;

export default function InterviewPrep() {
  const { session, user } = useAuth();
  const { toast } = useToast();

  // Shared state
  const [position, setPosition] = useState("");
  const [industry, setIndustry] = useState("");
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [activeTab, setActiveTab] = useState("mock");

  // Mock interview state
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

  // Question bank state
  const [questionType, setQuestionType] = useState<QuestionType>("role-based");
  const [experienceLevel, setExperienceLevel] = useState("mid");
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  // Analysis state
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Fetch resumes
  useEffect(() => {
    if (user) {
      supabase.from("resumes").select("*").order("updated_at", { ascending: false })
        .then(({ data }) => setResumes(data ?? []));
    }
  }, [user]);

  const getSelectedResumeData = (): ResumeData | null => {
    if (!selectedResumeId) return null;
    const resume = resumes.find(r => r.id === selectedResumeId);
    return resume ? (resume.resume_data as any as ResumeData) : null;
  };

  // ── Mock Interview Logic ──
  const speak = useCallback((text: string) => {
    if (!voiceEnabled) { setPhase("idle"); return; }
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onstart = () => setPhase("speaking");
    utterance.onend = () => setPhase("idle");
    utterance.onerror = () => setPhase("idle");
    synthRef.current.speak(utterance);
  }, [voiceEnabled]);

  const streamResponse = useCallback(async (body: any): Promise<string> => {
    const resp = await fetch(FUNC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Request failed" }));
      throw new Error(err.error || "Request failed");
    }

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
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") break;
        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            full += content;
            setCurrentCoachText(full);
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: full } : m);
              }
              return [...prev, { role: "assistant", content: full }];
            });
          }
        } catch { /* partial */ }
      }
    }
    return full;
  }, [session]);

  const startInterview = async () => {
    if (!position.trim() || !industry.trim()) {
      toast({ title: "Please enter both position and industry", variant: "destructive" });
      return;
    }
    setStarted(true);
    setMessages([]);
    setQuestionCount(1);
    setPhase("thinking");
    try {
      const text = await streamResponse({
        action: "start", position, industry,
        resumeData: getSelectedResumeData(),
      });
      speak(text);
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
      setPhase("idle");
    }
  };

  const sendAnswer = async (answer: string) => {
    if (!answer.trim()) return;
    const userMsg: Message = { role: "user", content: answer };
    const allMsgs = [...messages, userMsg];
    setMessages(allMsgs);
    setTranscript("");
    setCurrentCoachText("");
    setPhase("thinking");
    setQuestionCount(prev => prev + 1);
    try {
      const text = await streamResponse({
        action: "respond", position, industry,
        conversation: allMsgs,
        resumeData: getSelectedResumeData(),
      });
      speak(text);
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
      setPhase("idle");
    }
  };

  const endInterview = async () => {
    synthRef.current.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();
    setCurrentCoachText("");
    setPhase("thinking");
    try {
      await streamResponse({
        action: "summary", position, industry,
        conversation: messages,
        resumeData: getSelectedResumeData(),
      });
      setPhase("summary");
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
      setPhase("idle");
    }
  };

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Speech recognition not supported in this browser", variant: "destructive" });
      return;
    }
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
    recognition.lang = "en-US";
    let finalTranscript = "";
    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(finalTranscript + interim);
    };
    recognition.onerror = () => setPhase("idle");
    recognition.onend = () => {};
    recognitionRef.current = recognition;
    recognition.start();
    setPhase("listening");
  };

  const handleTextSend = () => {
    if (transcript.trim()) {
      if (isListening) recognitionRef.current?.stop();
      sendAnswer(transcript.trim());
    }
  };

  const resetInterview = () => {
    synthRef.current.cancel();
    if (recognitionRef.current) recognitionRef.current.stop();
    setStarted(false);
    setMessages([]);
    setTranscript("");
    setCurrentCoachText("");
    setPhase("setup");
    setQuestionCount(0);
  };

  // ── Question Bank Logic ──
  const generateQuestions = async () => {
    if (!position.trim() || !industry.trim()) {
      toast({ title: "Please enter position and industry first", variant: "destructive" });
      return;
    }
    setQuestionsLoading(true);
    setGeneratedQuestions([]);
    try {
      const resp = await fetch(FUNC_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          action: "generate-questions",
          position, industry, questionType, experienceLevel,
          resumeData: getSelectedResumeData(),
        }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || "Request failed");
      }
      const data = await resp.json();
      setGeneratedQuestions(data.questions || []);
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    } finally {
      setQuestionsLoading(false);
    }
  };

  // ── Strengths Analysis Logic ──
  const analyzeStrengths = async () => {
    if (!position.trim() || !industry.trim()) {
      toast({ title: "Please enter position and industry first", variant: "destructive" });
      return;
    }
    if (!selectedResumeId) {
      toast({ title: "Please select a resume to analyze", variant: "destructive" });
      return;
    }
    setAnalysisLoading(true);
    setAnalysis(null);
    try {
      const resp = await fetch(FUNC_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          action: "analyze-strengths",
          position, industry,
          resumeData: getSelectedResumeData(),
        }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || "Request failed");
      }
      const data = await resp.json();
      setAnalysis(data);
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    } finally {
      setAnalysisLoading(false);
    }
  };

  const difficultyColor = (d: string) => {
    if (d === "beginner") return "bg-green-500/10 text-green-700 border-green-200";
    if (d === "intermediate") return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
    return "bg-red-500/10 text-red-700 border-red-200";
  };

  const scoreColor = (s: number) => {
    if (s >= 75) return "text-green-600";
    if (s >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const progressColor = (s: number) => {
    if (s >= 75) return "[&>div]:bg-green-500";
    if (s >= 50) return "[&>div]:bg-yellow-500";
    return "[&>div]:bg-red-500";
  };

  // ── If in active mock interview, show that directly ──
  if (started) {
    const phaseLabel = {
      listening: "Alex is listening...",
      thinking: "Alex is thinking...",
      speaking: "Alex is talking...",
      idle: "Your turn — tap the mic or type",
      summary: "Alex's Feedback",
    }[phase] || "";

    return (
      <div className="flex flex-col items-center justify-between h-full p-4 max-w-2xl mx-auto">
        <div className="w-full flex items-center justify-between mb-4">
          <div className="text-sm">
            <span className="font-semibold text-foreground">{position}</span>
            <span className="text-muted-foreground"> • {industry}</span>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setVoiceEnabled(!voiceEnabled); if (phase === "speaking") synthRef.current.cancel(); }}>
              {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={resetInterview}>
              <RotateCcw className="h-3 w-3 mr-1" /> New
            </Button>
          </div>
        </div>
        <div className="flex-1 w-full flex flex-col items-center justify-center min-h-0 overflow-auto">
          <Avatar className={cn("w-20 h-20 mb-4 transition-all duration-300", phase === "speaking" && "ring-4 ring-primary/30 animate-pulse", phase === "thinking" && "animate-pulse")}>
            <AvatarFallback className={cn("text-xl font-bold transition-colors", phase === "speaking" ? "bg-primary/20 text-primary" : "bg-primary/10 text-muted-foreground")}>AC</AvatarFallback>
          </Avatar>
          <p className="text-sm font-medium text-muted-foreground mb-3">{phaseLabel}</p>
          {questionCount > 0 && phase !== "summary" && <p className="text-xs text-muted-foreground/60 mb-4">Question {questionCount}</p>}
          {currentCoachText && (
            <div className="w-full max-w-lg bg-muted/50 rounded-2xl p-5 mb-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap max-h-[40vh] overflow-auto">
              {currentCoachText}
            </div>
          )}
          {isListening && transcript && (
            <div className="w-full max-w-lg bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-4 text-sm text-foreground">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium text-primary">You</span>
              </div>
              {transcript}
            </div>
          )}
        </div>
        <div className="w-full space-y-3 pt-4">
          {phase !== "summary" && (
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" size="sm" onClick={endInterview} disabled={phase === "thinking" || messages.length < 2} className="text-xs">
                <Square className="h-3 w-3 mr-1" /> End Interview
              </Button>
              <div className="relative flex items-center justify-center">
                {isListening && (
                  <>
                    <span className="absolute w-24 h-24 rounded-full border-2 border-destructive/40 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
                    <span className="absolute w-20 h-20 rounded-full border-2 border-destructive/30 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_0.3s_infinite]" />
                    <span className="absolute w-28 h-28 rounded-full border border-destructive/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_0.6s_infinite]" />
                  </>
                )}
                {phase === "speaking" && (
                  <>
                    <span className="absolute w-24 h-24 rounded-full border-2 border-primary/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                    <span className="absolute w-28 h-28 rounded-full border border-primary/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_0.5s_infinite]" />
                  </>
                )}
                <button onClick={toggleListening} disabled={phase === "thinking"} className={cn("relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg", isListening ? "bg-destructive text-destructive-foreground scale-110" : "bg-primary text-primary-foreground hover:scale-105 hover:shadow-xl", phase === "thinking" && "opacity-50 cursor-not-allowed")}>
                  {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </button>
              </div>
              <div className="w-[100px]" />
            </div>
          )}
          {phase !== "summary" && (
            <div className="flex gap-2 max-w-lg mx-auto">
              <Input placeholder="Or type your answer..." value={transcript} onChange={e => setTranscript(e.target.value)} onKeyDown={e => e.key === "Enter" && handleTextSend()} disabled={phase === "thinking"} className="text-sm" />
              <Button size="icon" onClick={handleTextSend} disabled={phase === "thinking" || !transcript.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
          {phase === "summary" && (
            <div className="flex justify-center">
              <Button onClick={resetInterview} size="lg">
                <RotateCcw className="h-4 w-4 mr-2" /> Start New Interview
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Setup / Main Screen ──
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Interview Preparation</h1>
        <p className="text-muted-foreground text-sm mt-1">From Resume → Interview → Offer</p>
      </div>

      {/* Shared Setup */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Position / Job Title</label>
              <Input placeholder="e.g. Senior Frontend Developer" value={position} onChange={e => setPosition(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Industry</label>
              <Input placeholder="e.g. Technology" value={industry} onChange={e => setIndustry(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Resume (optional)</label>
              <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a resume" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No resume</SelectItem>
                  {resumes.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="mock" className="gap-1 sm:gap-2 text-[11px] sm:text-sm px-1 sm:px-3"><Headphones className="h-3 w-3 sm:h-4 sm:w-4 hidden sm:block" /><span className="truncate">Mock Interview</span></TabsTrigger>
          <TabsTrigger value="questions" className="gap-1 sm:gap-2 text-[11px] sm:text-sm px-1 sm:px-3"><BookOpen className="h-3 w-3 sm:h-4 sm:w-4 hidden sm:block" /><span className="truncate">Question Bank</span></TabsTrigger>
          <TabsTrigger value="analysis" className="gap-1 sm:gap-2 text-[11px] sm:text-sm px-1 sm:px-3"><Shield className="h-3 w-3 sm:h-4 sm:w-4 hidden sm:block" /><span className="truncate">Strengths Analysis</span></TabsTrigger>
        </TabsList>

        {/* ── Mock Interview Tab ── */}
        <TabsContent value="mock">
          <Card>
            <CardContent className="pt-6 text-center space-y-6">
              <Avatar className="mx-auto w-20 h-20">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">AC</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Alex Carter</h2>
                <p className="text-sm text-muted-foreground">Senior Hiring Manager • 15+ years experience</p>
              </div>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Start a live mock interview with Alex. He'll ask you real questions, react to your answers, and give honest feedback at the end.
                {selectedResumeId && selectedResumeId !== "none" && " Your resume will be used to personalize the questions."}
              </p>
              <Button onClick={startInterview} size="lg" disabled={!position.trim() || !industry.trim()}>
                <Play className="h-4 w-4 mr-2" /> Start Mock Interview
              </Button>
              <p className="text-xs text-muted-foreground">Uses your microphone for voice conversation. You can also type.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Question Bank Tab ── */}
        <TabsContent value="questions">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Question Type</label>
                  <Select value={questionType} onValueChange={v => setQuestionType(v as QuestionType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="role-based">Role-Based</SelectItem>
                      <SelectItem value="behavioral">Behavioral (STAR)</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="resume-based">Resume-Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Experience Level</label>
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid">Mid-Level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={generateQuestions} disabled={questionsLoading || !position.trim() || !industry.trim()} className="w-full">
                    {questionsLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
                    Generate Questions
                  </Button>
                </div>
              </div>

              {questionType === "resume-based" && !selectedResumeId && (
                <p className="text-sm text-yellow-600 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" /> Select a resume above for personalized questions
                </p>
              )}
            </CardContent>
          </Card>

          {/* Generated Questions */}
          {generatedQuestions.length > 0 && (
            <div className="mt-4 space-y-3">
              {generatedQuestions.map((q, i) => (
                <Collapsible key={i}>
                  <Card>
                    <CollapsibleTrigger className="w-full text-left">
                      <CardContent className="pt-4 pb-4 flex items-start gap-3">
                        <span className="text-sm font-bold text-muted-foreground mt-0.5 shrink-0">{i + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{q.question}</p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <Badge variant="outline" className={cn("text-xs", difficultyColor(q.difficulty))}>{q.difficulty}</Badge>
                            <Badge variant="secondary" className="text-xs">{q.category}</Badge>
                          </div>
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                      </CardContent>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-6 pb-4 space-y-3 border-t pt-3">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Target className="h-3 w-3" /> Why They Ask This</p>
                          <p className="text-sm text-foreground mt-1">{q.intent}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><FileText className="h-3 w-3" /> Answer Framework</p>
                          <p className="text-sm text-foreground mt-1">{q.framework}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1"><Lightbulb className="h-3 w-3" /> Pro Tip</p>
                          <p className="text-sm text-foreground mt-1">{q.tip}</p>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Strengths Analysis Tab ── */}
        <TabsContent value="analysis">
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Analyze your resume to identify strengths interviewers will notice, weaknesses they may probe, and get an interview readiness score.
              </p>
              <Button onClick={analyzeStrengths} disabled={analysisLoading || !position.trim() || !industry.trim() || !selectedResumeId || selectedResumeId === "none"} size="lg">
                {analysisLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
                Analyze My Resume
              </Button>
              {(!selectedResumeId || selectedResumeId === "none") && (
                <p className="text-sm text-yellow-600 flex items-center gap-1 justify-center">
                  <AlertTriangle className="h-4 w-4" /> Select a resume above to get started
                </p>
              )}
            </CardContent>
          </Card>

          {analysis && (
            <div className="mt-4 space-y-4">
              {/* Readiness Score */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className={cn("text-4xl font-bold", scoreColor(analysis.readinessScore))}>{analysis.readinessScore}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Interview Readiness Score</p>
                      <Progress value={analysis.readinessScore} className={cn("mt-2 h-2", progressColor(analysis.readinessScore))} />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{analysis.summary}</p>
                </CardContent>
              </Card>

              {/* Strengths */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" /> Strengths</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.strengths.map((s, i) => (
                    <div key={i} className="border-l-2 border-green-500 pl-3">
                      <p className="text-sm font-medium text-foreground">{s.point}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{s.explanation}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Weaknesses */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-600" /> Areas to Prepare</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.weaknesses.map((w, i) => (
                    <div key={i} className="border-l-2 border-yellow-500 pl-3">
                      <p className="text-sm font-medium text-foreground">{w.point}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{w.explanation}</p>
                      <p className="text-sm text-primary mt-1 flex items-center gap-1"><Lightbulb className="h-3 w-3" /> {w.tip}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
