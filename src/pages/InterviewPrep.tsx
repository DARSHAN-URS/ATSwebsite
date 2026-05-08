import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Mic, MicOff, Volume2, Brain, Loader2, Zap, RotateCcw, ShieldCheck, Target, Sparkles, ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";
import { motion, AnimatePresence } from "framer-motion";
import SEOHead from "@/components/SEOHead";

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
      toast({ title: "Objective required", description: "Define your target position to initialize the chamber.", variant: "destructive" });
      return;
    }
    setStarted(true);
    setPhase("thinking");
    const welcomeText = `Initialization complete. We are now simulating a professional interview for the ${position} role. I will analyze your narrative for strategic alignment and technical precision. Let's begin.`;
    setMessages([{ role: "assistant", content: welcomeText }]);
    speak(welcomeText);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans pb-20">
      <SEOHead title="Simulation Chamber — ResumePro" description="High-fidelity professional interview simulations." />
      
      <div className="container mx-auto px-8 pt-16 space-y-16 text-left">
         <div className="flex flex-col md:flex-row items-end justify-between gap-12">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 rounded-full border border-blue-600/20 text-blue-600">
                  <Brain className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Simulation Protocol</span>
               </div>
               <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                  Simulation <br /> <span className="text-blue-600">Chamber.</span>
               </h1>
            </div>
         </div>

         {!started ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
               <div className="lg:col-span-5">
                  <Card className="rounded-[4rem] border-none bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.04)] p-12 space-y-12">
                     <div className="space-y-8">
                        <div className="space-y-4">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Target Objective</Label>
                           <Input value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. Senior Architecture Lead" className="h-16 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold text-lg" />
                        </div>
                        <div className="space-y-4">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Identity Source</Label>
                           <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                              <SelectTrigger className="h-16 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border-none px-6 font-bold"><SelectValue placeholder="Select Module" /></SelectTrigger>
                              <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                                 {resumes.map(r => <SelectItem key={r.id} value={r.id} className="rounded-xl p-3 font-bold">{r.title}</SelectItem>)}
                              </SelectContent>
                           </Select>
                        </div>
                     </div>
                     <Button onClick={startSimulation} className="w-full h-20 rounded-[2rem] bg-blue-600 text-white font-black uppercase tracking-widest text-xs gap-4 shadow-2xl shadow-blue-600/20 hover:scale-105 transition-all">
                        Initialize Chamber <Zap className="w-5 h-5" />
                     </Button>
                  </Card>
               </div>
               <div className="lg:col-span-7 flex flex-col justify-center space-y-8 px-12">
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Neural Stress Testing.</h3>
                  <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
                     Our simulation environment uses advanced linguistic analysis to synchronize your professional identity with organizational benchmarks. 
                     Prepare for high-impact behavioral challenges.
                  </p>
                  <div className="flex flex-wrap gap-10 opacity-30">
                     {[ShieldCheck, Target, Sparkles].map((Icon, i) => <Icon key={i} className="w-12 h-12" />)}
                  </div>
               </div>
            </motion.div>
         ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-12">
               <Card className="rounded-[4rem] border-none bg-white dark:bg-slate-900 shadow-2xl p-16 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8">
                     <div className={cn("px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all", 
                        phase === "listening" ? "bg-blue-600 text-white border-blue-600" : "bg-slate-100 text-slate-400 border-slate-200"
                     )}>
                        {phase}
                     </div>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center space-y-12 py-10">
                     <motion.div 
                        animate={{ scale: phase === "speaking" ? [1, 1.1, 1] : 1 }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className={cn("w-32 h-32 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-500",
                           phase === "speaking" ? "bg-blue-600 shadow-blue-600/40" : "bg-slate-900 shadow-slate-900/40"
                        )}
                     >
                        <Volume2 className="w-12 h-12" />
                     </motion.div>
                     
                     <div className="text-center space-y-4">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Neural Feed</p>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white max-w-2xl leading-snug">
                           {messages[messages.length - 1]?.content || "Initializing operational feed..."}
                        </h3>
                     </div>
                  </div>
               </Card>

               <div className="flex justify-center gap-6">
                  <Button variant="outline" onClick={() => { setStarted(false); setPhase("setup"); }} className="h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3">
                     <RotateCcw className="w-4 h-4" /> Terminate Simulation
                  </Button>
                  <Button className="h-16 px-10 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] gap-3">
                     Next Module <ChevronRight className="w-4 h-4" />
                  </Button>
               </div>
            </motion.div>
         )}
      </div>
    </div>
  );
}
