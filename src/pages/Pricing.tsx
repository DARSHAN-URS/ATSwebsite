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

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

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
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <SEOHead title="Pricing — ResumePro" description="Select the best plan for your career growth." />
      
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 pt-48 pb-40 space-y-20">
        <div className="relative bg-white dark:bg-slate-900 rounded-[3rem] p-12 md:p-20 overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
           
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
               <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400">
                     <Star className="w-3.5 h-3.5" />
                     <span className="text-[10px] font-black uppercase tracking-wider">Operational Tiers active</span>
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">
                       Pricing.
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-xl max-w-xl">Scale your professional infrastructure with advanced AI deployment modules and priority processing.</p>
                  </div>
               </div>

              <div className="flex items-center gap-10">
                 <div className="text-right">
                    <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">100%</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uptime</p>
                 </div>
                 <div className="w-px h-16 bg-slate-100 dark:bg-slate-800" />
                 <div className="text-right">
                    <p className="text-4xl font-black text-blue-600 tracking-tighter leading-none">SECURE</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payments</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-stretch">
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
                          <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8", plan.highlight ? "bg-blue-600 text-white" : "bg-white text-blue-600 shadow-sm")}>
                             {plan.name === "Standard" ? <Star className="w-10 h-10" /> : plan.name === "Professional" ? <Zap className="w-10 h-10" /> : <ShieldCheck className="w-10 h-10" />}
                          </div>
                          <h3 className="text-4xl font-black tracking-tight uppercase leading-none">{plan.name}</h3>
                          <p className={cn("text-lg font-medium leading-relaxed", plan.highlight ? "text-slate-400" : "text-slate-500")}>{plan.desc}</p>
                       </div>

                       <div className="flex items-baseline gap-2 pt-6">
                          <span className="text-8xl font-black tracking-tighter">${plan.price}</span>
                          <span className={cn("text-[10px] font-black uppercase tracking-widest", plan.highlight ? "text-blue-500" : "text-slate-400")}>/ deployment</span>
                       </div>

                       <div className={cn("space-y-6 pt-12 border-t", plan.highlight ? "border-white/10" : "border-slate-200")}>
                          {plan.features.map(f => (
                             <div key={f} className="flex items-start gap-4">
                                <div className={cn("mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0", plan.highlight ? "bg-blue-600/20 text-blue-400" : "bg-blue-600 text-white")}>
                                   <Check className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-sm font-black tracking-tight uppercase tracking-wider">{f}</span>
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="pt-12">
                       <Button 
                          onClick={() => handleSubscribe(plan.name.toLowerCase())} 
                          disabled={loading === plan.name.toLowerCase() || (plan.price === "0" && plan.name === "Standard")}
                          className={cn(
                             "w-full h-24 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[11px] gap-4 transition-all shadow-2xl",
                             plan.highlight 
                                ? "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/30" 
                                : "bg-slate-900 text-white hover:bg-slate-800"
                          )}
                       >
                          {loading === plan.name.toLowerCase() ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-6 h-6" />}
                          {plan.cta}
                       </Button>
                    </div>
                 </Card>
              </motion.div>
           ))}
        </div>

        <div className="py-20 text-center space-y-12 border-t border-slate-100 dark:border-slate-800">
           <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Secure Infrastructure</h3>
              <div className="flex flex-wrap items-center justify-center gap-16 opacity-30 grayscale">
                 <ShieldCheck className="w-16 h-16" />
                 <span className="text-5xl font-black tracking-tighter uppercase">Stripe</span>
                 <Sparkles className="w-16 h-16" />
              </div>
           </div>
           <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              All transactions are processed through bank-grade encryption protocols. No credit card information is stored on our servers.
              Plan activation is immediate upon verification.
           </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
