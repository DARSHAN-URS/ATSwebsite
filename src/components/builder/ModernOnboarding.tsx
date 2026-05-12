import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ShieldCheck, Zap, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function ModernOnboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const hasSeen = localStorage.getItem("ats_onboarding_seen");
    if (!hasSeen) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const finish = () => {
    localStorage.setItem("ats_onboarding_seen", "true");
    setShow(false);
  };

  const steps = [
    {
      title: "Welcome to your AI Studio",
      desc: "Your resume is now managed by our advanced neural engine. Let's get you hired.",
      icon: Sparkles,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Real-time ATS Scanning",
      desc: "Watch your score grow in real-time as you optimize your content for recruiters.",
      icon: ShieldCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "AI Co-Pilot is Ready",
      desc: "Use the sidebar to ask questions, rewrite bullets, or generate professional summaries.",
      icon: Zap,
      color: "text-amber-600",
      bg: "bg-amber-50"
    }
  ];

  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] border border-white overflow-hidden relative"
        >
          <button onClick={finish} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className="p-12 space-y-8 text-center">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className={`w-20 h-20 mx-auto rounded-[2rem] ${steps[step].bg} flex items-center justify-center`}>
                {(() => {
                  const Icon = steps[step].icon;
                  return <Icon className={`w-10 h-10 ${steps[step].color}`} />;
                })()}
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight text-slate-900">{steps[step].title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{steps[step].desc}</p>
              </div>
            </motion.div>

            <div className="flex items-center justify-center gap-2">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? "w-8 bg-blue-600" : "w-1.5 bg-slate-100"}`} 
                />
              ))}
            </div>

            <Button 
              onClick={() => step < steps.length - 1 ? setStep(step + 1) : finish()}
              className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {step === steps.length - 1 ? "Get Started" : "Next Insight"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
