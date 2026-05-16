import { motion } from "framer-motion";
import { 
  User, FileText, Briefcase, GraduationCap, 
  Settings, Languages, Sparkles, LayoutGrid, Palette,
  CheckCircle2, AlertCircle, Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudioSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  completionData: Record<string, boolean>;
}

const sections = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "summary", label: "Professional Summary", icon: FileText },
  { id: "experience", label: "Work Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Core Skills", icon: Sparkles },
  { id: "languages", label: "Languages", icon: Languages },
  { id: "design", label: "Visual Design", icon: Palette },
  { id: "templates", label: "Architecture", icon: LayoutGrid },
];

export default function StudioSidebar({
  activeSection,
  onSectionChange,
  completionData
}: StudioSidebarProps) {
  const totalSections = sections.length;
  const completedSections = sections.filter(s => completionData[s.id]).length;
  const progressPercent = Math.round((completedSections / totalSections) * 100);

  return (
    <aside className="w-full h-full bg-[#081225] flex flex-col p-8 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
      
      {/* Progress Ring */}
      <div className="mb-12 relative z-10">
        <div className="flex items-center justify-between mb-4">
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Mission Progress</span>
           <span className="text-xl font-black text-white tracking-tighter">{progressPercent}%</span>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${progressPercent}%` }}
             className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
           />
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2 relative z-10">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          const isDone = completionData[section.id];
          
          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={cn(
                "w-full group flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-500 relative overflow-hidden",
                isActive 
                  ? "bg-blue-600 text-white shadow-2xl shadow-blue-600/30" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-4 relative z-10">
                <Icon className={cn("w-4 h-4 transition-transform duration-500", isActive ? "scale-110" : "group-hover:scale-110")} />
                <span className="text-xs font-bold tracking-tight">{section.label}</span>
              </div>
              
              <div className="flex items-center gap-2 relative z-10">
                {isDone ? (
                  <CheckCircle2 className={cn("w-3.5 h-3.5", isActive ? "text-white" : "text-emerald-500")} />
                ) : (
                  <div className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-white/50" : "bg-slate-700")} />
                )}
              </div>

              {isActive && (
                <motion.div 
                  layoutId="sidebar-glow"
                  className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent pointer-events-none"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* AI Suggestions Widget */}
      <div className="mt-8 p-6 rounded-[2rem] bg-white/5 border border-white/10 space-y-4 relative z-10">
         <div className="flex items-center gap-2 text-blue-400">
            <Lightbulb className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">AI Suggestions</span>
         </div>
         <div className="space-y-3">
            {[
              "Add measurable achievements",
              "Missing certifications",
              "Improve ATS keywords"
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-3 group cursor-pointer">
                 <div className="w-1 h-1 rounded-full bg-blue-500/50 mt-1.5 group-hover:scale-150 transition-transform" />
                 <p className="text-[11px] text-slate-400 font-medium leading-relaxed group-hover:text-white transition-colors">{s}</p>
              </div>
            ))}
         </div>
      </div>
    </aside>
  );
}
