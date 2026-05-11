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
      toast({ title: "Position required", description: "Please enter the job title you want to practice for.", variant: "destructive" });
      return;
    }
    setStarted(true);
    setPhase("thinking");
    const welcomeText = `Ready to start. We are now practicing an interview for the ${position} position. I will ask you questions to help you prepare. Let's begin.`;
    setMessages([{ role: "assistant", content: welcomeText }]);
    speak(welcomeText);
  };

  return (
    <div className="min-h-screen bg-white font-sans pb-20">
      <SEOHead title="Interview Prep — ResumePro" description="Practice your professional interviews with AI." />
      
      <div className="container mx-auto px-0 space-y-16 text-left">
         <div className="relative bg-white rounded-[4rem] p-16 md:p-24 overflow-hidden border border-slate-100 shadow-sm">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 space-y-8">
               <div className="inline-flex items-center gap-3 px-5 py-2 bg-blue-600/5 rounded-full border border-blue-600/10 text-blue-600">
                  <Brain className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Cognitive Training</span>
               </div>
               <h1 className="text-7xl md:text-9xl font-black text-slate-900 tracking-tighter leading-[0.9] uppercase">
                  Practice.
               </h1>
               <p className="text-slate-500 font-medium text-lg max-w-xl">High-fidelity simulation environments for behavioral and technical cognitive training.</p>
            </div>
         </div>

         {!started ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
               <div className="lg:col-span-5">
                  <Card className="rounded-[4rem] border-none bg-blue-50/30 shadow-sm border border-blue-100/50 p-12 space-y-12 hover:bg-blue-50/50 transition-all">
                     <div className="space-y-8">
                        <div className="space-y-4">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Job Position</Label>
                           <Input value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. Software Engineer" className="h-16 rounded-[1.5rem] bg-white border-slate-100 px-6 font-bold text-lg" />
                        </div>
                        <div className="space-y-4">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Use Resume</Label>
                           <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                              <SelectTrigger className="h-16 rounded-[1.5rem] bg-white border-slate-100 px-6 font-bold"><SelectValue placeholder="Select Resume" /></SelectTrigger>
                              <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                                 {resumes.map(r => <SelectItem key={r.id} value={r.id} className="rounded-xl p-3 font-bold">{r.title}</SelectItem>)}
                              </SelectContent>
                           </Select>
                        </div>
                     </div>
                     <Button onClick={startSimulation} className="w-full h-20 rounded-[2rem] bg-blue-600 text-white font-black uppercase tracking-widest text-xs gap-4 shadow-2xl shadow-blue-600/20 hover:scale-105 transition-all">
                        Start Practice <Zap className="w-5 h-5" />
                     </Button>
                  </Card>
               </div>
                <div className="lg:col-span-7 flex flex-col justify-center space-y-8 px-12">
                   <h3 className="text-4xl font-black text-slate-900 tracking-tight">Practice your interview.</h3>
                  <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
                     Our AI simulator helps you get better at answering questions and feeling confident. 
                     Prepare for common interview questions and get feedback.
                  </p>
                  <div className="flex flex-wrap gap-10 opacity-30">
                     {[ShieldCheck, Target, Sparkles].map((Icon, i) => <Icon key={i} className="w-12 h-12" />)}
                  </div>
               </div>
            </motion.div>
         ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-12">
                <Card className="rounded-[4rem] border-none bg-white shadow-2xl p-16 relative overflow-hidden border border-blue-100/50">
                  <div className="absolute top-0 right-0 p-8">
                     <div className={cn("px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all", 
                        phase === "listening" ? "bg-blue-600 text-white border-blue-600" : "bg-slate-100 text-slate-400 border-slate-200"
                     )}>
                        {phase === "setup" ? "Ready" : phase === "listening" ? "Listening" : phase === "thinking" ? "Thinking" : phase === "speaking" ? "Speaking" : "Idle"}
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
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">AI Voice</p>
                        <h3 className="text-3xl font-bold text-slate-900 max-w-2xl leading-snug">
                           {messages[messages.length - 1]?.content || "Connecting to AI practice..."}
                        </h3>
                     </div>
                  </div>
               </Card>

               <div className="flex justify-center gap-6">
                  <Button variant="outline" onClick={() => { setStarted(false); setPhase("setup"); }} className="h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3">
                     <RotateCcw className="w-4 h-4" /> Stop Practice
                  </Button>
                  <Button className="h-16 px-10 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] gap-3 hover:bg-blue-600 transition-all">
                     Next Question <ChevronRight className="w-4 h-4" />
                  </Button>
               </div>
            </motion.div>
         )}
      </div>
    </div>
  );
}
