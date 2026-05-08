import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Check, ShieldCheck, ArrowLeft, Zap, Star, Sparkles, Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: string) => {
    if (!user) {
      toast({ title: "Session Error", description: "Sign in to deploy your subscription protocol." });
      navigate("/auth");
      return;
    }
    setLoading(plan);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan, userId: user.id, userEmail: user.email },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast({ title: "Deployment Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      name: "Standard",
      price: "0",
      desc: "Ideal for initial career architecture.",
      features: ["1 AI-Powered Module", "Standard Architectures", "Basic Job Matrix", "Email Support"],
      cta: "Current Protocol",
      highlight: false,
    },
    {
      name: "Professional",
      price: "19",
      desc: "Advanced engineering for high-impact candidates.",
      features: ["Unlimited AI Modules", "Elite Architecture Library", "Neural Tailoring Engine", "Global Matrix Access", "Priority AI Queue", "Personal Identity Domain"],
      cta: "Deploy Professional",
      highlight: true,
    },
    {
      name: "Executive",
      price: "49",
      desc: "Maximum performance for organizational leaders.",
      features: ["Everything in Professional", "Direct Strategic Outreach", "Simulation Chamber Access", "Personal Brand Matrix", "VIP Architecture Review", "Concierge Deployment"],
      cta: "Go Executive",
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans pb-20">
      <SEOHead title="Deployment Matrix — ResumePro" description="Select the optimal plan for your career deployment." />
      
      <div className="container mx-auto px-8 pt-16 space-y-24">
         <div className="flex flex-col md:flex-row items-end justify-between gap-12">
            <div className="space-y-4 text-left">
               <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 rounded-full border border-blue-600/20 text-blue-600">
                  <Star className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Pricing Strategy</span>
               </div>
               <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                  Deployment <br /> <span className="text-blue-600">Matrix.</span>
               </h1>
            </div>
            <Button variant="ghost" onClick={() => navigate(-1)} className="h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 text-slate-400 hover:text-blue-600">
               <ArrowLeft className="w-4 h-4" /> Return to Intelligence
            </Button>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-7xl mx-auto items-center">
            {plans.map((plan, i) => (
               <motion.div 
                  key={plan.name} 
                  initial={{ opacity: 0, y: 30 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.1 }}
                  className="relative"
               >
                  {plan.highlight && (
                     <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20">
                        <div className="px-6 py-2 bg-blue-600 rounded-full text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/20 whitespace-nowrap">Recommended Configuration</div>
                     </div>
                  )}

                  <Card className={cn(
                     "relative rounded-[4rem] border-none p-12 space-y-12 transition-all duration-700 hover:-translate-y-4 flex flex-col justify-between text-left",
                     plan.highlight 
                        ? "bg-slate-900 text-white min-h-[700px] shadow-2xl shadow-blue-600/20 scale-105 z-10 border-4 border-blue-600/30" 
                        : "bg-white dark:bg-slate-900 min-h-[650px] shadow-[0_20px_50px_rgba(0,0,0,0.04)]"
                  )}>
                     <div className="space-y-8">
                        <div className="space-y-2">
                           <h3 className="text-3xl font-black tracking-tight">{plan.name}</h3>
                           <p className={cn("text-sm font-medium", plan.highlight ? "text-slate-400" : "text-slate-500")}>{plan.desc}</p>
                        </div>

                        <div className="flex items-baseline gap-2">
                           <span className="text-6xl font-black tracking-tighter">${plan.price}</span>
                           <span className={cn("text-xs font-black uppercase tracking-widest", plan.highlight ? "text-blue-500" : "text-slate-400")}>/ Cycle</span>
                        </div>

                        <div className="space-y-4 pt-8 border-t border-slate-100 dark:border-slate-800">
                           {plan.features.map(f => (
                              <div key={f} className="flex items-center gap-3">
                                 <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", plan.highlight ? "bg-blue-600 text-white" : "bg-blue-50 dark:bg-blue-900/30 text-blue-600")}>
                                    <Check className="w-3 h-3" />
                                 </div>
                                 <span className="text-xs font-bold tracking-tight">{f}</span>
                              </div>
                           ))}
                        </div>
                     </div>

                     <Button 
                        onClick={() => handleSubscribe(plan.name.toLowerCase())} 
                        disabled={loading === plan.name.toLowerCase() || (plan.price === "0" && plan.name === "Standard")}
                        className={cn(
                           "w-full h-20 rounded-[2rem] font-black uppercase tracking-widest text-[10px] gap-3 transition-all",
                           plan.highlight 
                              ? "bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/20" 
                              : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105"
                        )}
                     >
                        {loading === plan.name.toLowerCase() ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                        {plan.cta}
                     </Button>
                  </Card>
               </motion.div>
            ))}
         </div>

         <div className="py-20 text-center space-y-12 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-4">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Enterprise Security Protocol</h3>
               <div className="flex flex-wrap items-center justify-center gap-12 opacity-20">
                  <ShieldCheck className="w-12 h-12" />
                  <span className="text-4xl font-black tracking-tighter uppercase">Secure Stripe Protocol</span>
                  <Sparkles className="w-12 h-12" />
               </div>
            </div>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto">
               All transactions are processed through encrypted neural channels. No credit card information is stored on our matrix.
               Deployment is instantaneous upon confirmation.
            </p>
         </div>
      </div>
    </div>
  );
}
