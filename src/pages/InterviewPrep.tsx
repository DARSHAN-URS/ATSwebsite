import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Brain, Target, Sparkles, Activity, MessageSquare, Video, ArrowRight, BookOpen, BarChart3, Zap, 
  Mic, User, Shield, ChevronRight
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function InterviewPrep() {
  const navigate = useNavigate();

  const cards = [
    {
      id: "mock",
      title: "AI Mock Session",
      desc: "Launch a voice-enabled technical or behavioral interview simulation based on your resume.",
      icon: <Video className="w-8 h-8" />,
      color: "from-blue-500 to-cyan-400",
      bgHover: "hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]",
      borderColor: "border-blue-500/20",
      path: "/interview-prep/session",
      stats: "Interactive Voice AI"
    },
    {
      id: "questions",
      title: "Question Bank",
      desc: "Explore AI-generated questions tailored to specific roles or your unique resume profile.",
      icon: <BookOpen className="w-8 h-8" />,
      color: "from-emerald-400 to-teal-500",
      bgHover: "hover:shadow-[0_0_40px_rgba(52,211,153,0.2)]",
      borderColor: "border-emerald-500/20",
      path: "/interview-prep/questions",
      stats: "10,000+ Questions"
    },
    {
      id: "performance",
      title: "Performance Analytics",
      desc: "Review your past session metrics, strengths, weaknesses, and overall readiness scores.",
      icon: <BarChart3 className="w-8 h-8" />,
      color: "from-indigo-400 to-purple-500",
      bgHover: "hover:shadow-[0_0_40px_rgba(129,140,248,0.3)]",
      borderColor: "border-indigo-500/20",
      path: "/interview-prep/performance",
      stats: "Detailed Insights"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-slate-200 -mt-20 pt-28 pb-20 px-4 md:px-8 overflow-hidden relative">
      <SEOHead title="Interview Intelligence - ResumePro" description="Practice your interview skills with AI." />
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
         
         {/* 1. Premium Hero Header */}
         <div className="flex flex-col items-center text-center space-y-8 mt-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 bg-slate-800/50 backdrop-blur-md rounded-full border border-slate-700/50 shadow-2xl"
            >
               <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
               </span>
               <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">AI Interview Engine Active</span>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6 max-w-3xl mx-auto"
            >
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
                 INTERVIEW <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">LAB.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-400 font-medium leading-relaxed">
                Welcome to your ultimate interview preparation hub. Launch a real-time mock interview, study common questions, or analyze your past performance metrics.
              </p>
            </motion.div>
         </div>

         {/* 2. Main Navigation Hub */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {cards.map((card, idx) => (
               <motion.div 
                 key={card.id}
                 initial={{ opacity: 0, y: 20 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 transition={{ delay: 0.2 + (idx * 0.1) }}
               >
                  <div 
                     onClick={() => navigate(card.path)}
                     className={cn(
                        "h-full bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] cursor-pointer transition-all duration-500 group relative overflow-hidden flex flex-col justify-between min-h-[340px]",
                        card.bgHover,
                        `hover:${card.borderColor}`
                     )}
                  >
                     {/* Hover Gradient Overlay */}
                     <div className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500",
                        card.color
                     )} />
                     
                     <div className="relative z-10 space-y-8">
                        <div className="flex justify-between items-start">
                           <div className={cn(
                              "w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 bg-gradient-to-br",
                              card.color
                           )}>
                              {card.icon}
                           </div>
                           <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-400">
                              {card.stats}
                           </div>
                        </div>
                        
                        <div className="space-y-4">
                           <h3 className="text-2xl font-black text-white tracking-tight">{card.title}</h3>
                           <p className="text-sm font-medium text-slate-400 leading-relaxed">{card.desc}</p>
                        </div>
                     </div>
                     
                     <div className="relative z-10 pt-8 mt-auto flex items-center justify-between text-sm font-bold text-slate-300 uppercase tracking-widest group-hover:text-white transition-colors">
                        <span>Enter Module</span>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                           <ArrowRight className="w-4 h-4" />
                        </div>
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>

         {/* 3. Bottom Stats / Trust Bar */}
         <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-8 md:gap-16 pt-10 border-t border-white/5"
         >
            <div className="flex items-center gap-3 text-slate-400">
               <Shield className="w-5 h-5 text-emerald-400" />
               <span className="text-sm font-semibold uppercase tracking-wider">Private & Secure</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
               <Brain className="w-5 h-5 text-blue-400" />
               <span className="text-sm font-semibold uppercase tracking-wider">GPT-4 Powered</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
               <Mic className="w-5 h-5 text-indigo-400" />
               <span className="text-sm font-semibold uppercase tracking-wider">Real-time Voice</span>
            </div>
         </motion.div>

      </div>
    </div>
  );
}