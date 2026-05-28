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
      color: "from-blue-500 to-blue-600",
      bgHover: "hover:shadow-[0_20px_40px_rgba(37,99,235,0.12)] hover:border-blue-200",
      iconBg: "bg-blue-50 text-blue-600",
      path: "/interview-prep/session",
      stats: "Interactive Voice AI"
    },
    {
      id: "questions",
      title: "Question Bank",
      desc: "Explore AI-generated questions tailored to specific roles or your unique resume profile.",
      icon: <BookOpen className="w-8 h-8" />,
      color: "from-emerald-500 to-emerald-600",
      bgHover: "hover:shadow-[0_20px_40px_rgba(16,185,129,0.12)] hover:border-emerald-200",
      iconBg: "bg-emerald-50 text-emerald-600",
      path: "/interview-prep/questions",
      stats: "10,000+ Questions"
    },
    {
      id: "performance",
      title: "Performance Analytics",
      desc: "Review your past session metrics, strengths, weaknesses, and overall readiness scores.",
      icon: <BarChart3 className="w-8 h-8" />,
      color: "from-indigo-500 to-indigo-600",
      bgHover: "hover:shadow-[0_20px_40px_rgba(99,102,241,0.12)] hover:border-indigo-200",
      iconBg: "bg-indigo-50 text-indigo-600",
      path: "/interview-prep/performance",
      stats: "Detailed Insights"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 -mt-20 pt-28 pb-20 px-4 md:px-8 overflow-hidden relative">
      <SEOHead title="Interview Intelligence - ResumePro" description="Practice your interview skills with AI." />
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
         
         {/* 1. Premium Hero Header */}
         <div className="flex flex-col items-center text-center space-y-8 mt-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm"
            >
               <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
               </span>
               <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">AI Interview Engine Active</span>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6 max-w-3xl mx-auto"
            >
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter">
                 INTERVIEW <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">LAB.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed">
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
                        "h-full bg-white border border-slate-200 p-8 rounded-[2rem] cursor-pointer transition-all duration-500 group relative overflow-hidden flex flex-col justify-between min-h-[340px] shadow-sm hover:-translate-y-1",
                        card.bgHover
                     )}
                  >
                     <div className="relative z-10 space-y-8">
                        <div className="flex justify-between items-start">
                           <div className={cn(
                              "w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                              card.iconBg
                           )}>
                              {card.icon}
                           </div>
                           <div className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600">
                              {card.stats}
                           </div>
                        </div>
                        
                        <div className="space-y-4">
                           <h3 className="text-2xl font-black text-slate-900 tracking-tight">{card.title}</h3>
                           <p className="text-sm font-medium text-slate-500 leading-relaxed">{card.desc}</p>
                        </div>
                     </div>
                     
                     <div className="relative z-10 pt-8 mt-auto flex items-center justify-between text-sm font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
                        <span>Enter Module</span>
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
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
            className="flex flex-wrap justify-center gap-8 md:gap-16 pt-10 border-t border-slate-200"
         >
            <div className="flex items-center gap-3 text-slate-500">
               <Shield className="w-5 h-5 text-emerald-500" />
               <span className="text-sm font-semibold uppercase tracking-wider">Private & Secure</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
               <Brain className="w-5 h-5 text-blue-500" />
               <span className="text-sm font-semibold uppercase tracking-wider">GPT-4 Powered</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500">
               <Mic className="w-5 h-5 text-indigo-500" />
               <span className="text-sm font-semibold uppercase tracking-wider">Real-time Voice</span>
            </div>
         </motion.div>

      </div>
    </div>
  );
}