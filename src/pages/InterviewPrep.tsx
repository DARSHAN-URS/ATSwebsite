import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Brain, Target, Sparkles, Activity, MessageSquare, Video, ArrowRight, BookOpen, BarChart3, Zap
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";

export default function InterviewPrep() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 relative font-sans text-left">
      <SEOHead title="Interview Intelligence - ResumePro" description="Practice your interview skills with AI." />
         
         {/* 1. Premium Hero Header */}
         <div className="relative bg-white rounded-[2rem] p-10 overflow-hidden border border-slate-200 shadow-sm text-center md:text-left">
            <div className="absolute top-0 right-0 w-full lg:w-[500px] h-auto lg:h-[500px] bg-blue-600/[0.03] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col items-center md:items-start space-y-5">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100 text-blue-600 shadow-sm">
                  <Zap className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">AI Interview Engine Active</span>
               </div>
               <div className="space-y-2 max-w-2xl">
                 <h1 className="text-2xl md:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none uppercase">
                    Interview Lab.
                 </h1>
                 <p className="text-slate-500 font-medium text-sm">Welcome to your ultimate interview preparation hub. Launch a real-time mock interview, study common questions, or analyze your past performance metrics.</p>
               </div>
            </div>
         </div>

         {/* 2. Main Navigation Hub */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
               <Card 
                  onClick={() => navigate("/interview-prep/session")}
                  className="bg-white border border-slate-200 p-8 rounded-[2rem] hover:shadow-xl hover:border-blue-600/30 transition-all duration-300 group cursor-pointer relative overflow-hidden h-full flex flex-col justify-between min-h-auto lg:h-[320px]"
               >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2 group-hover:bg-blue-600/10 transition-colors" />
                  <div className="space-y-6 relative z-10">
                     <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                        <Video className="w-8 h-8" />
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Mock Session</h3>
                        <p className="text-sm font-medium text-slate-500">Launch a voice-enabled technical or behavioral interview simulation based on your resume.</p>
                     </div>
                  </div>
                  <Button variant="ghost" className="w-full justify-between px-0 hover:bg-transparent group-hover:text-blue-600 text-slate-900 font-bold uppercase tracking-widest text-[10px]">
                     Enter Room <ArrowRight className="w-4 h-4" />
                  </Button>
               </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
               <Card 
                  onClick={() => navigate("/interview-prep/questions")}
                  className="bg-white border border-slate-200 p-8 rounded-[2rem] hover:shadow-xl hover:border-emerald-600/30 transition-all duration-300 group cursor-pointer relative overflow-hidden h-full flex flex-col justify-between min-h-auto lg:h-[320px]"
               >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2 group-hover:bg-emerald-600/10 transition-colors" />
                  <div className="space-y-6 relative z-10">
                     <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-8 h-8" />
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Question Bank</h3>
                        <p className="text-sm font-medium text-slate-500">Explore AI-generated questions tailored to specific roles or your unique resume profile.</p>
                     </div>
                  </div>
                  <Button variant="ghost" className="w-full justify-between px-0 hover:bg-transparent group-hover:text-emerald-600 text-slate-900 font-bold uppercase tracking-widest text-[10px]">
                     Study Questions <ArrowRight className="w-4 h-4" />
                  </Button>
               </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
               <Card 
                  onClick={() => navigate("/interview-prep/performance")}
                  className="bg-white border border-slate-200 p-8 rounded-[2rem] hover:shadow-xl hover:border-indigo-600/30 transition-all duration-300 group cursor-pointer relative overflow-hidden h-full flex flex-col justify-between min-h-auto lg:h-[320px]"
               >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-[40px] translate-x-1/2 -translate-y-1/2 group-hover:bg-indigo-600/10 transition-colors" />
                  <div className="space-y-6 relative z-10">
                     <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                        <BarChart3 className="w-8 h-8" />
                     </div>
                     <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Performance</h3>
                        <p className="text-sm font-medium text-slate-500">Review your past session metrics, strengths, weaknesses, and overall readiness scores.</p>
                     </div>
                  </div>
                  <Button variant="ghost" className="w-full justify-between px-0 hover:bg-transparent group-hover:text-indigo-600 text-slate-900 font-bold uppercase tracking-widest text-[10px]">
                     View Analytics <ArrowRight className="w-4 h-4" />
                  </Button>
               </Card>
            </motion.div>
         </div>
    </div>
  );
}