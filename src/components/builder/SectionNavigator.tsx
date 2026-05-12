import { cn } from "@/lib/utils";
import { 
  User, FileText, Briefcase, GraduationCap, 
  Settings, Languages, Sparkles, LayoutGrid, Palette 
} from "lucide-react";
import { motion } from "framer-motion";

interface SectionNavigatorProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  completionData: Record<string, boolean>;
}

const sections = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "summary", label: "Summary", icon: FileText },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Sparkles },
  { id: "languages", label: "Languages", icon: Languages },
  { id: "custom", label: "Custom", icon: Settings },
];

export default function SectionNavigator({ 
  activeSection, 
  onSectionChange,
  completionData 
}: SectionNavigatorProps) {
  return (
    <nav className="w-64 flex flex-col gap-1 p-4 bg-white/50 backdrop-blur-sm border-r border-slate-100 h-full overflow-y-auto custom-scrollbar">
      <div className="mb-6 px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Navigation</h3>
      </div>
      
      {sections.map((section) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;
        const isDone = completionData[section.id];
        
        return (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={cn(
              "group relative flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-300",
              isActive 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Icon className={cn("w-4 h-4 transition-transform duration-300 group-hover:scale-110", isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600")} />
                {(section.id === "skills" || section.id === "summary") && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse blur-[2px]" />
                )}
              </div>
              <span className="text-xs font-bold tracking-tight">{section.label}</span>
            </div>
            
            {isDone && !isActive && (
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            )}
            
            {isActive && (
              <motion.div 
                layoutId="active-pill"
                className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        );
      })}
      
      <div className="mt-auto pt-6 space-y-2">
        <div className="h-px bg-slate-100 mx-2 mb-4" />
        <p className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-300">Design</p>
        <button
          onClick={() => onSectionChange("design")}
          className={cn(
            "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300",
            activeSection === "design" ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          )}
        >
          <Palette className="w-4 h-4" />
          <span className="text-xs font-bold">Theme & Colors</span>
        </button>
        <button
          onClick={() => onSectionChange("templates")}
          className={cn(
            "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300",
            activeSection === "templates" ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          )}
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="text-xs font-bold">Templates</span>
        </button>
      </div>
    </nav>
  );
}
