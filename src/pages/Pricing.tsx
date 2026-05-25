import { useState, useEffect } from "react";
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
import { invokeFunction } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";

import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function Pricing({ isInternal = false }: { isInternal?: boolean }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const tp = t.pricingPage;
  const tpe = t.pricingExtra;
  const tl = t.landing;

  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planName: string) => {
    if (!user) {
      toast({ title: t.common.error, description: "You need to be signed in to upgrade your plan." });
      navigate("/auth");
      return;
    }
    
    // Determine specific plan ID for pro subscription
    let planId = planName;
    if (planName === "pro") {
      if (billingCycle === "7day") planId = "pro_weekly";
      else if (billingCycle === "14day") planId = "pro_biweekly";
      else planId = "pro_monthly";
    }

    setLoading(planName);
    try {
      const { data, error } = await invokeFunction("create-checkout", {
        plan: planId,
        userId: user.id,
        userEmail: user.email,
        currency: pricingConfig.code,
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast({ title: tp.paymentError, description: err.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const [billingCycle, setBillingCycle] = useState<"7day" | "14day" | "pro">("pro");

  const [pricingConfig, setPricingConfig] = useState({
    symbol: "₹",
    code: "INR",
    rates: {
      pro: { price: "598", original: "1,196" },
      biweekly: { price: "299", original: "598" },
      weekly: { price: "199", original: "398" }
    }
  });

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
        if (data.country_code === "AE") {
          setPricingConfig({
            symbol: "AED ",
            code: "AED",
            rates: {
              pro: { price: "29", original: "58" },
              biweekly: { price: "15", original: "30" },
              weekly: { price: "9", original: "18" }
            }
          });
        } else if (data.country_code !== "IN") {
          setPricingConfig({
            symbol: "$",
            code: "USD",
            rates: {
              pro: { price: "9", original: "18" },
              biweekly: { price: "5", original: "10" },
              weekly: { price: "3", original: "6" }
            }
          });
        }
      })
      .catch(console.error);
  }, []);

  const plans = [
    {
      name: tp.freeName.toUpperCase(),
      price: "0",
      desc: tp.freeDesc,
      features: [
        { text: tp.oneResume, included: true },
        { text: tp.basicTemplates, included: true },
        { text: tp.pdfDownload, included: true },
        { text: tp.jobTrackerLimit, included: true },
        { text: tp.coverLetterGen, included: false },
        { text: tp.emailOutreach, included: false },
        { text: tp.aiResumeGrading, included: false },
        { text: tp.aiResumeTailoring, included: false },
      ],
      cta: tp.getStartedFree,
      highlight: false,
    },
    {
      name: tp.proName.toUpperCase(),
      price: billingCycle === "pro" ? pricingConfig.rates.pro.price : billingCycle === "14day" ? pricingConfig.rates.biweekly.price : pricingConfig.rates.weekly.price,
      originalPrice: billingCycle === "pro" ? pricingConfig.rates.pro.original : billingCycle === "14day" ? pricingConfig.rates.biweekly.original : pricingConfig.rates.weekly.original,
      desc: tp.perMonth,
      features: [
        { text: tp.unlimitedResumes, included: true },
        { text: tp.allPremiumTemplates, included: true },
        { text: tp.aiResumeGrading, included: true },
        { text: tp.aiResumeTailoring, included: true },
        { text: tp.coverLetterGen, included: true },
        { text: tp.unlimitedJobTracking, included: true },
        { text: tp.emailOutreach, included: true },
        { text: tp.interviewPrep, included: true },
        { text: tp.companyDirectory, included: true },
        { text: tp.aiApply, included: true },
        { text: tp.prioritySupport, included: true },
      ],
      cta: tp.subscribeNow,
      highlight: true,
      badge: tp.fiftyOff,
    },
  ];

  return (
    <div className={cn("min-h-screen text-slate-900 font-sans", !isInternal && "bg-white")}>
      <SEOHead title={`${tp.title} — ResumePro`} description={tp.subtitle} />
      
      {!isInternal && <Navbar />}

      <main className={cn("max-w-7xl mx-auto px-8 space-y-20", isInternal ? "py-10" : "pt-48 pb-40")}>
        <div className="text-center space-y-6 max-w-2xl mx-auto mb-20">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100 text-blue-600">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{tp.premiumIntelligenceAccess}</span>
           </div>
           <h1 className="text-3xl md:text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none uppercase">
              {tl.archHeroTitle.split(" ").slice(0, -1).join(" ")} <br /> <span className="text-blue-600">{tl.heroHighlight || "Career."}</span>
           </h1>
           <p className="text-slate-500 font-medium text-lg leading-relaxed">{tp.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
           {plans.map((plan, i) => (
              <motion.div 
                 key={plan.name} 
                 initial={{ opacity: 0, y: 30 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 transition={{ delay: i * 0.1 }}
                 className="relative h-full"
              >
                 {plan.badge && (
                    <div className="absolute top-0 right-0 z-20">
                       <div className="px-6 py-2 bg-rose-500 rounded-bl-3xl rounded-tr-[3.5rem] text-white font-black text-[10px] uppercase tracking-widest shadow-xl">
                          {plan.badge}
                       </div>
                    </div>
                 )}

                 <Card 
                    id={plan.highlight ? "pro-plan-card" : undefined}
                    className={cn(
                    "relative h-full rounded-[3.5rem] border-2 p-10 space-y-10 transition-all duration-500 flex flex-col justify-between group",
                    plan.highlight 
                       ? "bg-white border-blue-600 shadow-[0_20px_50px_rgba(37,99,235,0.1)] z-10" 
                       : "bg-white border-slate-100 shadow-sm hover:shadow-xl"
                 )}>
                    <div className="space-y-10">
                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{plan.name}</p>
                            </div>
                            {plan.highlight && <Zap className="w-8 h-8 text-blue-600" />}
                          </div>
                          <div className="flex items-end gap-3">
                            <h3 className="text-2xl md:text-4xl font-black tracking-tight uppercase leading-none text-slate-900">{plan.name === "FREE" ? tp.freeName : `${pricingConfig.symbol}${plan.price}`}</h3>
                            {plan.originalPrice && (
                              <p className="text-sm font-bold text-slate-400 line-through pb-1">{pricingConfig.symbol}{plan.originalPrice}</p>
                            )}
                          </div>
                          <p className="text-sm font-medium text-slate-500">{plan.desc}</p>
                       </div>

                       {plan.highlight && (
                          <div className="flex p-1 bg-slate-50 rounded-xl">
                             {(["7day", "14day", "pro"] as const).map((cycle) => (
                                <button
                                   key={cycle}
                                   onClick={() => setBillingCycle(cycle)}
                                   className={cn(
                                      "flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all",
                                      billingCycle === cycle ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                                   )}
                                >
                                   {cycle === "7day" ? tp.billingCycle7Day : cycle === "14day" ? tp.billingCycle14Day : tp.billingCyclePro}
                                </button>
                             ))}
                          </div>
                       )}

                       <div className="space-y-4">
                          {plan.features.map((f, fi) => (
                             <div key={fi} className={cn("flex items-center gap-3", !f.included && !plan.highlight && "opacity-60")}>
                                <div className={cn(
                                   "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                                   f.included ? "bg-blue-50 text-blue-600" : "text-slate-300"
                                )}>
                                   {f.included ? <Check className="w-3.5 h-3.5" /> : <span className="text-lg leading-none">×</span>}
                                </div>
                                <span className={cn(
                                   "text-[11px] font-bold tracking-tight uppercase tracking-wider flex-1",
                                   f.included ? "text-slate-700" : "text-slate-400 line-through"
                                )}>{f.text}</span>
                                {/* Free plan: show upgrade link on excluded features */}
                                {!f.included && !plan.highlight && (
                                   <button
                                      onClick={() => {
                                         const proCard = document.getElementById("pro-plan-card");
                                         if (proCard) proCard.scrollIntoView({ behavior: "smooth", block: "center" });
                                      }}
                                      className="text-[9px] font-black uppercase tracking-wider text-blue-600 hover:text-blue-700 hover:underline transition-colors whitespace-nowrap"
                                   >
                                      Upgrade →
                                   </button>
                                )}
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-6">
                       {plan.highlight && (
                          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 space-y-2">
                             <div className="flex items-center gap-2 text-amber-700">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-[11px] font-black uppercase tracking-wider">{tpe.bonusFeatures}</span>
                             </div>
                             <p className="text-[10px] font-medium text-amber-600 leading-relaxed">{tpe.bonusDesc}</p>
                          </div>
                       )}

                       <Button 
                          onClick={() => handleSubscribe(plan.name.toLowerCase())} 
                          disabled={loading === plan.name.toLowerCase() || (plan.name === tp.freeName.toUpperCase())}
                          className={cn(
                             "w-full h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] gap-3 transition-all",
                             plan.highlight 
                                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/20" 
                                : "bg-white border-2 border-blue-600/20 text-blue-600 hover:bg-blue-50"
                          )}
                       >
                          {loading === plan.name.toLowerCase() ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          {plan.cta}
                       </Button>
                    </div>
                 </Card>
              </motion.div>
           ))}
        </div>

        <div className="py-20 text-center space-y-8">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">We accept: Visa, Mastercard, UPI, PayPal & more</p>
           <div className="flex flex-wrap items-center justify-center gap-12 opacity-20 grayscale">
              <ShieldCheck className="w-8 h-8" />
              <Zap className="w-8 h-8" />
              <Star className="w-8 h-8" />
              <Sparkles className="w-8 h-8" />
           </div>
           <p className="text-sm text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
              {tp.securePayment}. Deployment is instantaneous upon verification.
           </p>
        </div>
      </main>

      {!isInternal && <Footer />}
    </div>
  );
}
