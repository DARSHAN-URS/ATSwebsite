import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MessageSquare, X, Wand2, Zap, Layout, History } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { label: "Improve bullet points", icon: Zap },
    { label: "Rewrite professionally", icon: Wand2 },
    { label: "Optimize ATS keywords", icon: Sparkles },
    { label: "Add impact metrics", icon: Layout },
    { label: "Shorten content", icon: History },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-80 bg-white rounded-[2.5rem] shadow-3xl border border-slate-100/80 p-8 space-y-6"
          >
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                     <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                     <h3 className="text-sm font-black text-slate-900 tracking-tight">Resume Copilot</h3>
                     <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                       AI Online
                     </p>
                  </div>
               </div>
               <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <X className="w-5 h-5" />
               </button>
            </div>

            <p className="text-xs font-medium text-slate-500 leading-relaxed">
               Hello! I can help you improve your resume. What would you like me to do?
            </p>

            <div className="space-y-2">
               {options.map((option, i) => (
                 <button 
                   key={i}
                   className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100/50 text-slate-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:scale-[1.02] active:scale-[0.98] transition-all text-left group shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-lg hover:shadow-blue-600/10"
                 >
                    <option.icon className="w-4 h-4 text-slate-400 group-hover:text-white/90 transition-colors" />
                    <span className="text-[11px] font-bold tracking-tight">{option.label}</span>
                 </button>
               ))}
            </div>

            <div className="pt-4 border-t border-slate-50">
               <div className="relative">
                  <input 
                    placeholder="Ask anything..." 
                    className="w-full h-12 bg-slate-50 text-slate-800 border border-slate-100 rounded-xl px-4 pr-12 text-xs font-medium focus-visible:outline-none focus:ring-2 focus:ring-blue-600/20 focus:bg-white transition-all placeholder:text-slate-400"
                  />
                  <Button size="icon" className="absolute right-1 top-1 w-10 h-10 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20">
                     <MessageSquare className="w-4 h-4" />
                  </Button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-[2rem] bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/30 hover:scale-110 active:scale-95 transition-all group border-none"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
               <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="sparkles" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }}>
               <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </div>
  );
}
