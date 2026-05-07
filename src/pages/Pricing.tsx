import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Check, 
  Crown, 
  Sparkles, 
  Zap, 
  Shield, 
  Rocket, 
  Star, 
  TrendingUp, 
  FileText, 
  Users, 
  ChevronDown,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEOHead";
import { useLocalCurrency } from "@/hooks/useLocalCurrency";
import { pricingExtraTranslations } from "@/i18n/pricingExtraTranslations";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type Duration = "weekly" | "biweekly" | "monthly";

const STATS = [
  { icon: Users, value: "10k+", label: "Job Seekers" },
  { icon: FileText, value: "1M+", label: "Resumes" },
  { icon: Star, value: "4.8", label: "Rating" },
  { icon: TrendingUp, value: "3x", label: "Interviews" },
];

const FAQS = [
  { q: "Can I cancel anytime?", a: "Yes! There are no long-term contracts. You can cancel your subscription at any time and continue to use Pro features until your current period ends." },
  { q: "What payment methods do you accept?", a: "We accept Visa, Mastercard, UPI, PayPal, and many more regional payment methods. All payments are processed securely." },
  { q: "Is my data safe?", a: "Absolutely. We use bank-grade encryption and never share your personal data with third parties. Your resumes are stored securely in the cloud." },
  { q: "What happens after my plan expires?", a: "You'll still have access to the free tier features. Your Pro resumes and data remain saved — simply resubscribe to access them again." },
];

export default function Pricing() {
  const { user } = useAuth();
  const { t, locale } = useLanguage();
  const tp = pricingExtraTranslations[locale];
  const { isPro } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const localCurrency = useLocalCurrency();
  const [duration, setDuration] = useState<Duration>("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const PAYMENT_LINKS: Record<string, string> = {
    pro_weekly: "https://nas.io/muzamils-business-2/zerolink/7day-pro",
    pro_biweekly: "https://nas.io/muzamils-business-2/zerolink/14day-pro",
    pro_monthly: "https://nas.io/muzamils-business-2/zerolink/monthly-pro",
  };

  const handleSelectPlan = () => {
    if (!user) {
      toast({ title: "Please sign in first", description: "You need an account to subscribe.", variant: "destructive" });
      navigate("/");
      return;
    }
    const link = PAYMENT_LINKS[`pro_${duration}`];
    if (link) window.open(link, "_blank");
  };

  const durationTabs: { key: Duration; label: string }[] = [
    { key: "weekly", label: tp.weeklyPlan },
    { key: "biweekly", label: tp.biweeklyPlan },
    { key: "monthly", label: t.pricingPage.proName },
  ];

  const savingsLabel = localCurrency.formatOriginalPrice(duration);

  const freeFeatures = [
    { text: t.pricingPage.oneResume, included: true },
    { text: t.pricingPage.basicTemplates, included: true },
    { text: t.pricingPage.pdfDownload, included: true },
    { text: t.pricingPage.jobTrackerLimit, included: true },
    { text: t.pricingPage.aiResumeGrading, included: false },
    { text: t.pricingPage.aiResumeTailoring, included: false },
  ];

  const proFeatures = [
    { text: t.pricingPage.unlimitedResumes, included: true },
    { text: t.pricingPage.allPremiumTemplates, included: true },
    { text: t.pricingPage.aiResumeGrading, included: true },
    { text: t.pricingPage.aiResumeTailoring, included: true },
    { text: t.pricingPage.coverLetterGen, included: true },
    { text: t.pricingPage.aiApply, included: true },
    { text: t.pricingPage.smartJobSearch, included: true },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      <SEOHead 
        title="Pricing — ResumePro" 
        description="Choose the plan that's right for your career growth." 
      />

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto max-w-7xl py-20 px-8 relative z-10">
        <div className="mb-12">
          <Button variant="ghost" size="sm" onClick={() => user ? navigate("/dashboard") : navigate("/")} className="rounded-xl font-bold text-slate-500 hover:text-primary transition-colors gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 rounded-2xl bg-primary/10 px-5 py-2"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Premium Career Growth</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tight leading-none"
          >
            Invest in your <span className="text-primary">future.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-500 font-medium leading-relaxed"
          >
            Unlock the full power of AI-driven career tools. Choose the plan that fits your current needs.
          </motion.p>
        </div>

        {/* Plan Toggle */}
        <div className="flex justify-center mb-16">
           <div className="p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center border border-slate-200 dark:border-slate-800 shadow-inner">
              {durationTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setDuration(tab.key)}
                  className={cn(
                    "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    duration === tab.key ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xl" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {tab.label}
                </button>
              ))}
           </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* FREE PLAN */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
             <Card className="rounded-[3rem] border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900 shadow-sm p-12 h-full flex flex-col group hover:shadow-2xl transition-all border-b-8 border-b-slate-100">
                <div className="space-y-12 flex-1">
                   <div>
                      <h3 className="text-xl font-black uppercase tracking-widest text-slate-400">Starter</h3>
                      <div className="flex items-baseline mt-4 gap-1">
                         <span className="text-6xl font-black text-slate-900 dark:text-white">{localCurrency.formatPrice(0)}</span>
                         <span className="text-slate-400 font-bold text-sm">/ month</span>
                      </div>
                   </div>

                   <ul className="space-y-6">
                      {freeFeatures.map((f, i) => (
                         <li key={i} className="flex items-start gap-4">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${f.included ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-300"}`}>
                               <Check className="w-3.5 h-3.5" />
                            </div>
                            <span className={`text-sm font-bold ${f.included ? "text-slate-700 dark:text-slate-300" : "text-slate-300 line-through"}`}>{f.text}</span>
                         </li>
                      ))}
                   </ul>
                </div>
                <Button variant="outline" className="mt-12 w-full h-16 rounded-[1.5rem] border-slate-200 text-slate-400 font-black uppercase tracking-widest text-xs" disabled>
                   Current Plan
                </Button>
             </Card>
          </motion.div>

          {/* PRO PLAN */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
             <Card className="rounded-[3rem] border-primary/20 bg-slate-900 p-12 h-full flex flex-col relative overflow-hidden shadow-2xl shadow-primary/20 border-b-8 border-b-primary">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                
                <div className="space-y-12 flex-1 relative z-10">
                   <div className="flex items-center justify-between">
                      <div>
                         <h3 className="text-xl font-black uppercase tracking-widest text-primary">Pro Access</h3>
                         <div className="flex items-baseline mt-4 gap-3">
                            <span className="text-6xl font-black text-white">{localCurrency.formatProPrice(duration)}</span>
                            <span className="text-white/30 font-bold text-lg line-through">{savingsLabel}</span>
                         </div>
                      </div>
                      <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-primary/50">
                         <Crown className="w-8 h-8" />
                      </div>
                   </div>

                   <ul className="space-y-6">
                      {proFeatures.map((f, i) => (
                         <li key={i} className="flex items-start gap-4">
                            <div className="w-6 h-6 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                               <Check className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-sm font-black text-white">{f.text}</span>
                         </li>
                      ))}
                   </ul>
                </div>
                
                <Button 
                  onClick={handleSelectPlan}
                  disabled={isPro}
                  className="mt-12 w-full h-16 rounded-[1.5rem] bg-primary text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30 hover:scale-105 transition-all group"
                >
                   {isPro ? "Active Plan" : "Upgrade to Pro"}
                   <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
             </Card>
          </motion.div>
        </div>

        {/* Trust Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-32 max-w-4xl mx-auto border-y border-slate-100 py-12">
           {STATS.map((s, i) => (
             <div key={i} className="text-center space-y-2">
                <p className="text-3xl font-black text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
             </div>
           ))}
        </div>

        {/* FAQ updated to match premium style */}
        <div className="max-w-3xl mx-auto mt-40">
           <h2 className="text-4xl font-black text-slate-900 dark:text-white text-center mb-16">Frequently Asked <span className="text-primary">Questions</span></h2>
           <div className="space-y-4">
             {FAQS.map((faq, i) => (
               <Card key={i} className="rounded-[2rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full p-8 flex items-center justify-between text-left group"
                  >
                     <span className="text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors">{faq.q}</span>
                     <ChevronDown className={cn("w-5 h-5 text-slate-300 transition-all", openFaq === i && "rotate-180 text-primary")} />
                  </button>
                  <AnimatePresence>
                     {openFaq === i && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                           <div className="p-8 pt-0 text-slate-500 font-medium leading-relaxed">
                              {faq.a}
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </Card>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
