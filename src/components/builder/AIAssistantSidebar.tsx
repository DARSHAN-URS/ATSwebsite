import { useState } from "react";
import { cn } from "@/lib/utils";
import { Sparkles, MessageSquare, Wand2, Lightbulb, ChevronRight, X, Bot, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function AIAssistantSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div className={cn(
      "relative bg-white border-l border-slate-100 transition-all duration-500 flex flex-col",
      isOpen ? "w-80" : "w-0 overflow-hidden border-none"
    )}>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="absolute right-full top-1/2 -translate-y-1/2 w-10 h-24 bg-white border border-r-0 border-slate-100 rounded-l-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors shadow-[-4px_0_12px_rgba(0,0,0,0.05)]"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      )}

      {isOpen && (
        <>
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <Bot className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black tracking-tight text-slate-900">AI Co-Pilot</h3>
            </div>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4 text-slate-400" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 space-y-3">
              <div className="flex items-center gap-2 text-blue-600">
                <Zap className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Active Insight</span>
              </div>
              <p className="text-xs text-blue-800 font-medium leading-relaxed">
                Your experience section is strong, but could use more quantifiable metrics. Try using the STAR format for your latest role.
              </p>
              <Button size="sm" className="w-full bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest h-9">
                Improve Experience
              </Button>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Smart Prompts</h4>
              <div className="space-y-2">
                {[
                  "Generate bullet points for Project Manager",
                  "Rewrite summary to be more professional",
                  "Find missing keywords for Software Engineer",
                  "Explain my career gap elegantly"
                ].map((prompt, i) => (
                  <button 
                    key={i}
                    className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 line-clamp-1">{prompt}</span>
                      <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-500" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Recent Suggestions</h4>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-3 h-3 text-amber-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">Add 'Cloud Architecture'</p>
                    <p className="text-[10px] text-slate-500 leading-normal">This keyword is missing from your skills but mentioned in 80% of job descriptions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="relative">
              <input 
                placeholder="Ask AI anything..." 
                className="w-full h-12 pl-4 pr-12 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-600/10 text-xs font-medium"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
