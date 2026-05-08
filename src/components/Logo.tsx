import { Sparkles } from "lucide-react";

interface LogoProps {
  className?: string;
  variant?: "auto" | "light" | "dark";
  width?: number;
  height?: number;
}

export default function Logo({ className = "h-10", variant = "auto" }: LogoProps) {
  // Logic for colors based on variant
  // auto: respects dark mode
  // light: forces white (for dark backgrounds)
  // dark: forces dark (for light backgrounds)
  
  const isDarkForce = variant === "dark";
  const isLightForce = variant === "light";
  
  const iconColor = "text-primary";
  const resumeColor = isLightForce 
    ? "text-white" 
    : isDarkForce 
      ? "text-slate-900" 
      : "text-slate-900 dark:text-white";
  
  const proColor = "text-primary";

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 hover:rotate-0 transition-transform duration-500">
        <Sparkles className="w-6 h-6 text-white" />
      </div>
      <div className="flex flex-col -space-y-1">
        <div className="flex items-center gap-1.5">
           <span className={`text-xl font-black tracking-tighter uppercase ${resumeColor}`}>
             Resume
           </span>
           <span className={`text-xl font-black tracking-tighter uppercase ${proColor}`}>
             Pro
           </span>
        </div>
        <div className="flex items-center gap-1">
           <div className="h-[2px] w-4 bg-primary rounded-full" />
           <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">AI Architect</span>
        </div>
      </div>
    </div>
  );
}
