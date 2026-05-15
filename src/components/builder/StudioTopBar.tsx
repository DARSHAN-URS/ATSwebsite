import { motion } from "framer-motion";
import { ChevronLeft, Sparkles, Zap, Download, FileText, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StudioTopBarProps {
  title: string;
  onTitleChange: (val: string) => void;
  saving: boolean;
  score: number;
  onAiImprove: () => void;
  onExport: () => void;
}

export default function StudioTopBar({
  title,
  onTitleChange,
  saving,
  score,
  onAiImprove,
  onExport,
}: StudioTopBarProps) {
  return (
    <header className="sticky top-0 left-0 right-0 z-50 px-8 py-4">
      <div className="bg-white/70 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-[2rem] px-8 py-4 flex items-center justify-between">
        {/* Left: Branding & Title */}
        <div className="flex items-center gap-6">
          <Link to="/resumes">
            <Button variant="ghost" size="icon" className="w-12 h-12 rounded-2xl hover:bg-slate-50 transition-all group">
              <ChevronLeft className="w-6 h-6 text-slate-400 group-hover:text-slate-900" />
            </Button>
          </Link>
          <div className="h-8 w-px bg-slate-100" />
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <input 
                value={title} 
                onChange={e => onTitleChange(e.target.value)}
                className="text-base font-black text-slate-900 bg-transparent border-none p-0 focus:ring-0 w-auto min-w-[150px]"
                placeholder="Untitled Resume"
              />
              <FileText className="w-4 h-4 text-slate-300" />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={cn("w-1.5 h-1.5 rounded-full", saving ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {saving ? "Auto-saving..." : "Saved to Cloud"}
              </span>
            </div>
          </div>
        </div>

        {/* Center: ATS Score Pill */}
        <div className="hidden lg:flex items-center gap-4 px-6 py-2 bg-slate-900/5 rounded-full border border-slate-100 relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">ATS Score</span>
              <span className="text-sm font-black text-slate-900">{score}%</span>
            </div>
            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${score}%` }}
                 className="h-full bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.4)]"
               />
            </div>
          </div>
          <div className="h-4 w-px bg-slate-200 mx-2" />
          <div className="flex gap-4 relative z-10">
             <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Keywords</span>
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Strong</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Format</span>
                <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" /> Optimal</span>
             </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <Button 
            onClick={onAiImprove}
            className="rounded-full bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] px-8 h-12 shadow-xl hover:shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all gap-2 group"
          >
            AI Improve <Sparkles className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform" />
          </Button>
          <Button 
            onClick={onExport}
            className="rounded-full bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] px-8 h-12 shadow-xl shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all gap-2 group"
          >
            Export <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </Button>
        </div>
      </div>
    </header>
  );
}
