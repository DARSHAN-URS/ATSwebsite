import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Mic, MicOff, Volume2, Brain, Loader2, Zap, RotateCcw, ShieldCheck, Target, Sparkles, ChevronRight, 
  User, Activity, TrendingUp, BarChart3, Clock, MessageSquare, Star, Info, CheckCircle2, AlertCircle, Heart,
  Video, Play, Settings2, BarChart
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

type Resume = Tables<"resumes">;
type Message = { role: "user" | "assistant"; content: string };
type Phase = "setup" | "listening" | "thinking" | "speaking" | "idle" | "summary";

export default function InterviewPrep() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [position, setPosition] = useState("");
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
    const welcomeText = `Simulation initialized. We are now practicing an interview for the ${position} position. I will analyze your verbal and technical responses in real-time. Ready to begin?`;
    setMessages([{ role: "assistant", content: welcomeText }]);
    speak(welcomeText);
  };

  return (
    <div className="min-h-screen bg-[#05070A] font-sans pb-20 text-left selection:bg-blue-600/30">
      <SEOHead title="Interview Prep — ResumePro" description="Practice your professional interviews with AI." />
      
      <div className="max-w-7xl mx-auto space-y-8 p-8 md:p-10 relative">
         {/* Background Ambience */}
         <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
         <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

         {/* 1. Futuristic Hero Section */}
         <div className="relative bg-slate-900/40 backdrop-blur-xl rounded-3xl p-8 md:p-10 overflow-hidden border border-white/5 shadow-2xl">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/10 rounded-full border border-blue-600/20 text-blue-400">
                      <Brain className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Simulation Lab v4.0</span>
                   </div>
                   <div className="space-y-1">
                     <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none uppercase">
                        Interview Lab.
                     </h1>
                     <p className="text-slate-400 font-medium text-sm max-w-xl">High-fidelity cognitive training with real-time AI behavioral analysis.</p>
                   </div>
                </div>

               <div className="flex items-center gap-8">
                  <div className="text-right">
                     <p className="text-2xl font-bold text-white leading-none">84%</p>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Readiness Score</p>
                  </div>
                  <div className="w-px h-10 bg-white/5" />
                  <div className="text-right">
                     <p className="text-2xl font-bold text-blue-500 leading-none">12</p>
                     <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sessions Done</p>
                  </div>
               </div>
            </div>
         </div>

         {/* 2. Quick Stats Row */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
               { label: "Confidence", value: "92%", icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-400/5" },
               { label: "Accuracy", value: "88%", icon: Target, color: "text-emerald-400", bg: "bg-emerald-400/5" },
               { label: "Sentiment", value: "Positive", icon: Sparkles, color: "text-amber-400", bg: "bg-amber-400/5" },
               { label: "Clarity", value: "High", icon: Activity, color: "text-purple-400", bg: "bg-purple-400/5" },
            ].map((stat, i) => (
               <Card key={i} className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-2xl hover:border-white/10 transition-all group">
                  <div className="flex items-center justify-between mb-2">
                     <div className={cn("p-2 rounded-lg", stat.bg)}>
                        <stat.icon className={cn("w-4 h-4", stat.color)} />
                     </div>
                     <Badge variant="outline" className="text-[8px] border-white/5 text-slate-500 font-bold">+2%</Badge>
                  </div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-lg font-bold text-white">{stat.value}</p>
               </Card>
            ))}
         </div>

         {/* 3. Main Dashboard Workspace */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
               <AnimatePresence mode="wait">
                  {!started ? (
                     <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                        {/* Simulation Setup Panel */}
                        <Card className="bg-slate-900/60 backdrop-blur-2xl border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-8 opacity-5">
                              <Settings2 className="w-24 h-24 text-white" />
                           </div>
                           <div className="relative z-10 space-y-8">
                              <div className="space-y-1">
                                 <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-blue-500" /> Initialize Simulation
                                 </h3>
                                 <p className="text-sm text-slate-500 font-medium">Configure parameters for the AI training environment.</p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="space-y-3">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">Target Mission</Label>
                                    <Input value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. Lead Architect" className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-slate-600 font-bold focus:ring-blue-500/20 transition-all" />
                                 </div>
                                 <div className="space-y-3">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">Identity Context</Label>
                                    <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                                       <SelectTrigger className="h-12 rounded-xl bg-white/5 border-white/10 text-white font-bold">
                                          <SelectValue placeholder="Select Resume" />
                                       </SelectTrigger>
                                       <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
                                          {resumes.map(r => <SelectItem key={r.id} value={r.id} className="font-bold text-[10px] p-3 uppercase hover:bg-white/5 cursor-pointer">{r.title}</SelectItem>)}
                                       </SelectContent>
                                    </Select>
                                 </div>
                              </div>

                              <div className="flex flex-wrap gap-3">
                                 {["Technical Round", "Behavioral", "System Design", "Cultural Fit"].map(mode => (
                                    <button key={mode} className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all">
                                       {mode}
                                    </button>
                                 ))}
                              </div>

                              <Button onClick={startSimulation} className="w-full h-14 rounded-2xl bg-blue-600 text-white font-bold uppercase tracking-widest text-[10px] gap-3 shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all">
                                 Launch Simulation Protocols <ArrowRight className="w-4 h-4" />
                              </Button>
                           </div>
                        </Card>

                        {/* Recent Activity History */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {[
                              { role: "Senior Eng", score: 94, date: "2h ago", status: "Perfected" },
                              { role: "Product Mgr", score: 82, date: "Yesterday", status: "Analyzed" },
                           ].map((item, i) => (
                              <Card key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl hover:bg-white/[0.04] transition-all group">
                                 <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                                       <History className="w-5 h-5" />
                                    </div>
                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] uppercase">{item.status}</Badge>
                                 </div>
                                 <h4 className="text-white font-bold mb-1">{item.role}</h4>
                                 <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase">
                                    <span>{item.date}</span>
                                    <span className="text-blue-400">Score: {item.score}%</span>
                                 </div>
                              </Card>
                           ))}
                        </div>
                     </motion.div>
                  ) : (
                     <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                        {/* Simulation Hero Panel */}
                        <Card className="bg-slate-900/80 backdrop-blur-3xl border border-blue-500/20 p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden min-h-[500px] flex flex-col justify-center items-center text-center">
                           <div className="absolute top-0 right-0 p-8">
                              <Badge className={cn(
                                 "text-[10px] font-bold uppercase tracking-widest px-4 py-1",
                                 phase === "speaking" ? "bg-blue-600 text-white animate-pulse" : "bg-white/5 text-slate-400"
                              )}>
                                 {phase === "setup" ? "Initializing" : phase === "listening" ? "Listening..." : phase === "thinking" ? "Processing AI..." : phase === "speaking" ? "AI Speaking" : "Standby"}
                              </Badge>
                           </div>

                           <div className="space-y-12 max-w-2xl w-full">
                              <div className="relative">
                                 <motion.div 
                                    animate={{ 
                                       scale: phase === "speaking" ? [1, 1.2, 1] : 1,
                                       opacity: phase === "thinking" ? [0.5, 1, 0.5] : 1
                                    }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className={cn(
                                       "w-32 h-32 rounded-full mx-auto flex items-center justify-center text-white shadow-3xl transition-all duration-700 relative z-10",
                                       phase === "speaking" ? "bg-blue-600 shadow-blue-600/40" : "bg-slate-800 shadow-white/5"
                                    )}
                                 >
                                    {phase === "listening" ? <Mic className="w-12 h-12 text-blue-400" /> : <Volume2 className="w-12 h-12" />}
                                 </motion.div>
                                 {/* Pulsing rings */}
                                 {phase === "speaking" && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                       <div className="w-40 h-40 border border-blue-600/30 rounded-full animate-ping" />
                                       <div className="w-56 h-56 border border-blue-600/10 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
                                    </div>
                                 )}
                              </div>

                              <div className="space-y-4">
                                 <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.4em] px-2">AI Simulation Active</p>
                                 <h3 className="text-2xl md:text-3xl font-bold text-white leading-snug tracking-tight">
                                    {messages[messages.length - 1]?.content || "Initializing cognitive link..."}
                                 </h3>
                              </div>

                              {phase === "listening" && (
                                 <div className="flex justify-center gap-1.5 h-4">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                       <motion.div key={i} animate={{ height: [4, 16, 4] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }} className="w-1 bg-blue-500 rounded-full" />
                                    ))}
                                 </div>
                              )}
                           </div>

                           <div className="mt-12 flex items-center gap-6">
                              <Button variant="ghost" onClick={() => { setStarted(false); setPhase("setup"); }} className="h-12 px-6 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest gap-2">
                                 <RotateCcw className="w-4 h-4" /> Reset
                              </Button>
                              <Button className="h-12 px-8 rounded-xl bg-white text-slate-900 text-[10px] font-bold uppercase tracking-widest gap-2 hover:bg-blue-500 hover:text-white transition-all">
                                 Skip Question <ChevronRight className="w-4 h-4" />
                              </Button>
                           </div>
                        </Card>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>

            {/* Sidebar: Analytics & Insights */}
            <div className="lg:col-span-4 space-y-8">
               <Card className="bg-slate-900/60 backdrop-blur-2xl border border-white/5 p-6 rounded-3xl space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-500" /> AI Coach
                     </h3>
                     <Badge className="bg-blue-600/10 text-blue-400 border-none text-[8px] font-bold uppercase">Pro</Badge>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                           <span className="text-slate-500">Interview Readiness</span>
                           <span className="text-blue-500">84%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-600 rounded-full" style={{ width: '84%' }} />
                        </div>
                     </div>

                     <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
                        <h4 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
                           <Target className="w-3.5 h-3.5 text-blue-500" /> Focus Areas
                        </h4>
                        <div className="space-y-3">
                           {[
                              { label: "Technical Depth", val: 75, col: "bg-blue-500" },
                              { label: "Soft Skills", val: 92, col: "bg-emerald-500" },
                              { label: "Clarity", val: 68, col: "bg-amber-500" },
                           ].map(item => (
                              <div key={item.label} className="space-y-1.5">
                                 <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                                    <span>{item.label}</span>
                                    <span>{item.val}%</span>
                                 </div>
                                 <Progress value={item.val} className={cn("h-1 bg-white/5", item.col)} />
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-4 pt-2">
                        <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Top Feedback</h4>
                        {[
                           { label: "Great Pacing", icon: CheckCircle2, color: "text-emerald-500" },
                           { label: "Avoid Filler Words", icon: AlertCircle, color: "text-amber-500" },
                           { label: "Show More Passion", icon: Heart, color: "text-rose-500" },
                        ].map((tip, i) => (
                           <div key={i} className="flex items-center gap-3">
                              <tip.icon className={cn("w-3.5 h-3.5", tip.color)} />
                              <span className="text-[11px] font-medium text-slate-400">{tip.label}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </Card>

               <Card className="bg-gradient-to-br from-blue-600 to-indigo-900 p-6 rounded-3xl shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                     <Zap className="w-32 h-32 text-white" />
                  </div>
                  <div className="relative z-10 space-y-6">
                     <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                        <Star className="w-5 h-5" />
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-white text-base font-bold tracking-tight">Unlock Analysis</h3>
                        <p className="text-white/70 text-[11px] leading-relaxed">Upgrade to **Pro AI** for advanced video analysis, sentiment tracking, and personalized coaching logs.</p>
                     </div>
                     <Button className="w-full h-10 rounded-xl bg-white text-slate-900 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-50 transition-all shadow-lg">Upgrade Now</Button>
                  </div>
               </Card>
            </div>
         </div>
      </div>
    </div>
  );
}
