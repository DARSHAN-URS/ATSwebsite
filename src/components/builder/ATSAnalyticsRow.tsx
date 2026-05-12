import { cn } from "@/lib/utils";
import { ShieldCheck, Target, Zap, Search, BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";

interface ATSAnalyticsRowProps {
  score: number;
  keywordMatch: number;
  readability: string;
}

export default function ATSAnalyticsRow({ score, keywordMatch, readability }: ATSAnalyticsRowProps) {
  return (
    <div className="h-14 bg-white border-b border-slate-100 px-8 flex items-center justify-between z-30 shrink-0">
      <div className="flex items-center gap-12">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ATS Score</span>
              <span className="text-xs font-bold text-slate-900">{score}% Match</span>
            </div>
          </div>
          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              className={cn(
                "h-full rounded-full",
                score > 80 ? "bg-emerald-500" : score > 50 ? "bg-amber-500" : "bg-rose-500"
              )}
            />
          </div>
        </div>

        <div className="h-4 w-px bg-slate-100" />

        <div className="flex items-center gap-3">
          <Target className="w-4 h-4 text-purple-500" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Keyword Match</span>
            <span className="text-xs font-bold text-slate-900">{keywordMatch} Critical Found</span>
          </div>
        </div>

        <div className="h-4 w-px bg-slate-100" />

        <div className="flex items-center gap-3">
          <BrainCircuit className="w-4 h-4 text-amber-500" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Readability</span>
            <span className="text-xs font-bold text-slate-900">{readability}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
               <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-50" />
            </div>
          ))}
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Optimizing Now</span>
        <Zap className="w-3 h-3 text-amber-500 animate-pulse" />
      </div>
    </div>
  );
}
