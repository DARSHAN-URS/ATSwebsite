import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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

  const [activeTab, setActiveTab] = useState("Mock Interview");

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
    setStarted(true);
    setPhase("thinking");
    const welcomeText = `Simulation initialized. We are now practicing an ${interviewType} interview for the ${position} position at the ${difficulty} level. I will analyze your verbal and technical responses in real-time. Ready to begin?`;
    setMessages([{ role: "assistant", content: welcomeText }]);
    speak(welcomeText);
  };

  const analyticsData = [
    { name: "Mon", score: 65 },
    { name: "Tue", score: 72 },
    { name: "Wed", score: 68 },
    { name: "Thu", score: 84 },
    { name: "Fri", score: 81 },
    { name: "Sat", score: 89 },
    { name: "Sun", score: 84 },
  ];

  const pieData = [
    { name: "Technical", value: 88, color: "#2563eb" },
    { name: "Behavioral", value: 72, color: "#10b981" },
    { name: "System Design", value: 65, color: "#f59e0b" },
  ];

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
                     <p className="text-3xl font-black text-slate-900 leading-none">84%</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">Readiness Score</p>
                  </div>
                  <div className="w-px h-12 bg-slate-200" />
                  <div className="text-right">
                     <p className="text-3xl font-black text-blue-600 leading-none">12</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-2">Sessions Done</p>
                  </div>
               </div>
            </div>
         </div>

         {/* 2. Stats Row */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
               { label: "Confidence", value: "92%", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
               { label: "Technical", value: "88%", icon: Code, color: "text-indigo-600", bg: "bg-indigo-50" },
               { label: "Communication", value: "High", icon: MessageSquare, color: "text-emerald-600", bg: "bg-emerald-50" },
               { label: "Readiness", value: "Ready", icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" },
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
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Sidebar Column (Parameters & Insights) */}
            <div className="lg:col-span-4 space-y-8">
               
               {/* Setup Panel */}
               <Card className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm space-y-8 relative overflow-hidden">
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
                        <Input value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. Senior Frontend Dev" className="h-11 rounded-xl bg-slate-50 border-slate-200 font-bold text-xs focus:bg-white transition-all shadow-sm" />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400 px-1">Industry</Label>
                        <Input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Fintech" className="h-11 rounded-xl bg-slate-50 border-slate-200 font-bold text-xs focus:bg-white transition-all shadow-sm" />
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
                        <Button onClick={startSimulation} className="w-full h-12 rounded-xl bg-slate-900 text-white font-bold uppercase tracking-widest text-[10px] gap-3 shadow-xl shadow-slate-900/10 hover:bg-blue-600 transition-all">
                           Launch Simulation <ArrowRight className="w-4 h-4" />
                        </Button>
                     </div>
                  </div>
               </Card>

               {/* AI Feedback Panel */}
               <Card className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" /> AI Insights
                     </h3>
                     <Badge className="bg-blue-50 text-blue-600 border-none text-[8px] font-bold uppercase px-2">Analysis</Badge>
                  </div>
                  
                  <div className="space-y-4">
                     {[
                        { label: "Strengths", items: ["Technical Depth", "Confidence"], color: "text-emerald-600", icon: CheckCircle2 },
                        { label: "Improvements", items: ["Pacing", "Filler Words"], color: "text-amber-600", icon: AlertCircle }
                     ].map((section, i) => (
                        <div key={i} className="space-y-2">
                           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">{section.label}</p>
                           <div className="grid grid-cols-1 gap-2">
                              {section.items.map((item, j) => (
                                 <div key={j} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-all">
                                    <section.icon className={cn("w-3.5 h-3.5", section.color)} />
                                    <span className="text-[10px] font-bold text-slate-600 uppercase">{item}</span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     ))}
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
                     {[
                        { role: "Backend Architect", date: "2h ago", score: 94 },
                        { role: "Product Manager", date: "Yesterday", score: 82 },
                        { role: "Lead UI Designer", date: "3 days ago", score: 88 }
                     ].map((session, i) => (
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

            {/* Main Content Column */}
            <div className="lg:col-span-8 space-y-8">
               
               {/* Mode Tabs (Segmented Controls) */}
               <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 max-w-md">
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

               <AnimatePresence mode="wait">
                  {activeTab === "Mock Interview" && (
                     <motion.div key="mock" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                        
                        {/* Main Interview Panel */}
                        <Card className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl relative overflow-hidden min-h-[600px] flex flex-col group">
                           <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-50" />
                           
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
                                    <Button className="h-12 px-8 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest gap-2 hover:bg-blue-600 transition-all shadow-lg">
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
                              { label: "Speaking Confidence", value: 94, color: "bg-blue-600" },
                              { label: "Response Clarity", value: 78, color: "bg-indigo-600" },
                              { label: "Technical Accuracy", value: 85, color: "bg-emerald-600" },
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

               {/* Upgrade Promo */}
               <Card className="bg-gradient-to-br from-blue-600 to-indigo-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
                     <Zap className="w-48 h-48 text-white" />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                     <div className="space-y-4 text-center md:text-left">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
                           <Star className="w-6 h-6" />
                        </div>
                        <div className="space-y-2">
                           <h3 className="text-white text-2xl font-black tracking-tight uppercase">Elevate Your Training</h3>
                           <p className="text-white/70 text-sm max-w-md font-medium leading-relaxed">Upgrade to **Pro AI** for advanced video analysis, sentiment tracking, and personalized coaching logs from industry veterans.</p>
                        </div>
                     </div>
                     <Button className="h-14 px-10 rounded-2xl bg-white text-blue-900 text-[11px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl whitespace-nowrap">
                        Unlock Pro Protocols
                     </Button>
                  </div>
               </Card>
            </div>
         </div>
      </div>
    </div>
  );
}

