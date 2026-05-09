import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Check, ShieldCheck, ArrowLeft, Zap, Star, Sparkles, Loader2, ArrowRight
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
      toast({ title: "Please Sign In", description: "You need to be signed in to upgrade your plan." });
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
      toast({ title: "Payment Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      name: "Standard",
      price: "0",
      desc: "Perfect for getting started with your job search.",
      features: ["1 AI Resume", "Basic Templates", "Job Search Access", "Email Support"],
      cta: "Current Plan",
      highlight: false,
    },
    {
      name: "Professional",
      price: "19",
      desc: "Best for job seekers who want an edge.",
      features: ["Unlimited AI Resumes", "Premium Template Library", "AI Cover Letters", "Global Job Search", "Priority AI Processing", "Personal Profile Page"],
      cta: "Choose Pro",
      highlight: true,
    },
    {
      name: "Executive",
      price: "49",
      desc: "Full power for executives and managers.",
      features: ["Everything in Professional", "Direct Email Outreach", "Interview Practice Hub", "Personal Brand Page", "Resume Expert Review", "Concierge Setup"],
      cta: "Choose Executive",
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans pb-20">
      <SEOHead title="Pricing — ResumePro" description="Select the best plan for your career growth." />
      
      <div className="container mx-auto px-8 pt-16 space-y-24 text-left">
         <div className="flex flex-col md:flex-row items-end justify-between gap-12">
            <div className="space-y-4">
               <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-600/10 rounded-full border border-blue-600/20 text-blue-600">
                  <Star className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Upgrade</span>
               </div>
               <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                  Pricing.
               </h1>
            </div>
            <Button variant="ghost" onClick={() => navigate(-1)} className="h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 text-slate-400 hover:text-blue-600">
               <ArrowLeft className="w-4 h-4" /> Go Back
            </Button>
         </div>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-7xl mx-auto items-stretch">
            {plans.map((plan, i) => (
               <motion.div 
                  key={plan.name} 
                  initial={{ opacity: 0, y: 30 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.1 }}
                  className="relative h-full"
               >
                  {plan.highlight && (
                     <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
                        <div className="px-8 py-3 bg-blue-600 rounded-full text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/40 whitespace-nowrap">Recommended</div>
                     </div>
                  )}

                  <Card className={cn(
                     "relative h-full rounded-[4rem] border-none p-16 space-y-16 transition-all duration-700 hover:-translate-y-4 flex flex-col justify-between group",
                     plan.highlight 
                        ? "bg-slate-900 text-white shadow-3xl shadow-blue-600/20 z-10 border-4 border-blue-600/30" 
                        : "bg-slate-50/50 dark:bg-slate-900 shadow-sm hover:shadow-2xl hover:bg-white"
                  )}>
                     <div className="space-y-12">
                        <div className="space-y-4">
                           <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8", plan.highlight ? "bg-blue-600 text-white" : "bg-white text-blue-600 shadow-sm")}>
                              {plan.name === "Standard" ? <Star className="w-8 h-8" /> : plan.name === "Professional" ? <Zap className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                           </div>
                           <h3 className="text-4xl font-black tracking-tight uppercase leading-none">{plan.name}</h3>
                           <p className={cn("text-base font-medium leading-relaxed", plan.highlight ? "text-slate-400" : "text-slate-500")}>{plan.desc}</p>
                        </div>

                        <div className="flex items-baseline gap-2 pt-6">
                           <span className="text-7xl font-black tracking-tighter">${plan.price}</span>
                           <span className={cn("text-[10px] font-black uppercase tracking-widest", plan.highlight ? "text-blue-500" : "text-slate-400")}>/ deployment</span>
                        </div>

                        <div className={cn("space-y-5 pt-12 border-t", plan.highlight ? "border-white/10" : "border-slate-200")}>
                           {plan.features.map(f => (
                              <div key={f} className="flex items-start gap-4">
                                 <div className={cn("mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0", plan.highlight ? "bg-blue-600/20 text-blue-400" : "bg-blue-600 text-white")}>
                                    <Check className="w-3 h-3" />
                                 </div>
                                 <span className="text-sm font-black tracking-tight uppercase text-[11px] tracking-wider">{f}</span>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="pt-12">
                        <Button 
                           onClick={() => handleSubscribe(plan.name.toLowerCase())} 
                           disabled={loading === plan.name.toLowerCase() || (plan.price === "0" && plan.name === "Standard")}
                           className={cn(
                              "w-full h-20 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] gap-4 transition-all shadow-2xl",
                              plan.highlight 
                                 ? "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/30" 
                                 : "bg-slate-900 text-white hover:bg-slate-800"
                           )}
                        >
                           {loading === plan.name.toLowerCase() ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                           {plan.cta}
                        </Button>
                     </div>
                  </Card>
               </motion.div>
            ))}
         </div>


         <div className="py-20 text-center space-y-12 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-4">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Secure Payments</h3>
               <div className="flex flex-wrap items-center justify-center gap-12 opacity-20">
                  <ShieldCheck className="w-12 h-12" />
                  <span className="text-4xl font-black tracking-tighter uppercase">Stripe</span>
                  <Sparkles className="w-12 h-12" />
               </div>
            </div>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto">
               All transactions are processed through secure encryption. No credit card information is stored on our servers.
               Upgrade happens immediately upon confirmation.
            </p>
         </div>
      </div>
    </div>
  );
}
