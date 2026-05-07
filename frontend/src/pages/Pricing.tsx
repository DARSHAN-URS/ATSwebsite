import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X, Crown, Sparkles, Gift, Zap, Shield, Rocket, Star, TrendingUp, FileText, Users, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEOHead";
import { useLocalCurrency } from "@/hooks/useLocalCurrency";
import { pricingExtraTranslations } from "@/i18n/pricingExtraTranslations";
import { cn } from "@/lib/utils";

type Duration = "weekly" | "biweekly" | "monthly";

const STATS = [
  { icon: Users, value: "10,000+", label: "Job Seekers" },
  { icon: FileText, value: "1M+", label: "Resumes Built" },
  { icon: Star, value: "4.8★", label: "Avg Rating" },
  { icon: TrendingUp, value: "3×", label: "More Interviews" },
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
    { text: t.pricingPage.coverLetterGen, included: false },
    { text: t.pricingPage.emailOutreach, included: false },
  ];

  const proFeatures = [
    { text: t.pricingPage.unlimitedResumes, included: true },
    { text: t.pricingPage.allPremiumTemplates, included: true },
    { text: t.pricingPage.aiResumeGrading, included: true },
    { text: t.pricingPage.aiResumeTailoring, included: true },
    { text: t.pricingPage.coverLetterGen, included: true },
    { text: t.pricingPage.unlimitedJobTracking, included: true },
    { text: t.pricingPage.emailOutreach, included: true },
    { text: t.pricingPage.interviewPrep, included: true },
    { text: t.pricingPage.companyDirectory, included: true },
    { text: t.pricingPage.aiApply, included: true },
    { text: t.pricingPage.smartJobSearch, included: true },
    ...(duration === "monthly" ? [{ text: t.pricingPage.prioritySupport, included: true }] : []),
  ];

  return (
    <div className="min-h-screen bg-background text-foreground scan-line">
      <SEOHead title="Pricing — ATS Pro Resume Builder" description="Compare free and pro plans for ATS Pro Resume Builder." canonical="https://atsproresumebuilder.com/pricing" keywords="resume builder pricing, ATS pro plans" />

      {/* Grid background overlay */}
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-50" />

      <div className="relative z-10 container mx-auto max-w-5xl py-10 px-4">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => user ? navigate("/dashboard") : navigate("/")} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> {tp.back}
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-sm border border-primary/30 bg-primary/10 px-4 py-1.5 mb-5 glow-border animate-glow-pulse">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold text-primary font-display uppercase tracking-wider">{tp.launchOffer}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-display neon-text">{t.pricingPage.title}</h1>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">{t.pricingPage.subtitle}</p>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-primary" /> Secure Payment</span>
            <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> Instant Access</span>
            <span className="flex items-center gap-1.5"><Rocket className="h-3.5 w-3.5 text-primary" /> Cancel Anytime</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 max-w-4xl mx-auto">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2 rounded-sm border border-primary/20 bg-card p-4 sci-fi-clip glow-border text-center">
              <s.icon className="h-5 w-5 text-primary" />
              <span className="text-xl font-extrabold font-display neon-text">{s.value}</span>
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-display">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Two-column pricing cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto items-start">

          {/* FREE PLAN */}
          <div className="rounded-sm border border-border bg-card p-6 md:p-8 flex flex-col h-full sci-fi-clip glow-border relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-30">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-sm bg-muted flex items-center justify-center">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground font-display">Free Plan</p>
              </div>

              <div className="mb-1">
                <span className="text-5xl font-extrabold font-display">{localCurrency.formatPrice(0)}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">{t.pricingPage.freeDesc}</p>

              <div className="h-px bg-border mb-5" />

              <ul className="space-y-3 mb-8 flex-1">
                {freeFeatures.map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5 text-sm">
                    {f.included ? (
                      <div className="h-5 w-5 rounded-sm bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-sm bg-muted flex items-center justify-center shrink-0 mt-0.5">
                        <X className="h-3 w-3 text-muted-foreground/40" />
                      </div>
                    )}
                    <span className={cn(!f.included && "text-muted-foreground/50 line-through")}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <Button variant="outline" className="w-full" disabled>
                {t.pricingPage.currentPlan}
              </Button>
            </div>
          </div>

          {/* PRO PLAN */}
          <div className="rounded-sm border-2 border-primary bg-card p-6 md:p-8 flex flex-col relative overflow-hidden h-full glow-border-strong corner-brackets">
            {/* Animated glow background */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            </div>

            {/* Popular badge */}
            <div className="absolute -top-px right-8 z-20">
              <div className="bg-destructive text-destructive-foreground px-4 py-1.5 text-xs font-bold rounded-b-md shadow-lg shadow-destructive/20 font-display uppercase tracking-wider">
                {tp.launchBadge}
              </div>
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-sm bg-primary/20 flex items-center justify-center animate-glow-pulse">
                  <Crown className="h-4 w-4 text-primary" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary font-display">Pro Plan</p>
              </div>

              {/* Price */}
              <div className="mb-1 flex items-baseline gap-3">
                <span className="text-5xl font-extrabold font-display neon-text">{localCurrency.formatProPrice(duration)}</span>
                <span className="text-lg text-muted-foreground line-through font-display">{savingsLabel}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-5">
                {duration === "weekly" ? tp.per7Days : duration === "biweekly" ? tp.per14Days : t.pricingPage.perMonth}
              </p>

              {/* Duration tabs */}
              <div className="flex rounded-sm border border-border bg-muted/50 p-1 mb-6 overflow-hidden w-full">
                {durationTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setDuration(tab.key)}
                    className={cn(
                      "flex-1 min-w-0 text-[10px] sm:text-xs font-bold py-2.5 px-1 sm:px-2 rounded-sm transition-all font-display uppercase tracking-wider truncate",
                      duration === tab.key
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 glow-border"
                        : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="h-px bg-primary/20 mb-5" />

              {/* Features */}
              <ul className="space-y-3 mb-6 flex-1">
                {proFeatures.map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5 text-sm">
                    <div className="h-5 w-5 rounded-sm bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                    <span>{f.text}</span>
                  </li>
                ))}
              </ul>

              {/* Early adopter bonus */}
              <div className="flex items-start gap-3 rounded-sm border border-primary/20 bg-primary/5 p-3 mb-5 glow-border">
                <div className="h-8 w-8 rounded-sm bg-primary/15 flex items-center justify-center shrink-0">
                  <Gift className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground font-display uppercase tracking-wide">{tp.bonusFeatures}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{tp.bonusDesc}</p>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={isPro}
                onClick={handleSelectPlan}
              >
                {isPro ? t.pricingPage.currentPlan : "Subscribe Now"}
              </Button>
            </div>
          </div>
        </div>

        {/* Money-back guarantee banner */}
        <div className="max-w-4xl mx-auto mt-8 rounded-sm border border-primary/20 bg-card p-5 flex items-center gap-4 sci-fi-clip glow-border">
          <div className="h-12 w-12 rounded-sm bg-primary/10 flex items-center justify-center shrink-0 animate-glow-pulse">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold font-display uppercase tracking-wide">100% Satisfaction Guaranteed</p>
            <p className="text-xs text-muted-foreground mt-0.5">Not happy with Pro? Contact us within 7 days for a full refund — no questions asked.</p>
          </div>
        </div>

        {/* Payment methods */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 rounded-sm border border-border bg-card/50 px-5 py-2.5 glow-border">
            <Shield className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">We accept: Visa, Mastercard, UPI, PayPal & more</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16 mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold font-display text-center mb-8 neon-text">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-sm border bg-card overflow-hidden transition-all sci-fi-clip",
                  openFaq === i ? "border-primary/40 glow-border" : "border-border"
                )}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="text-sm font-bold font-display">{faq.q}</span>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0 ml-2", openFaq === i && "rotate-180 text-primary")} />
                </button>
                <div className={cn("overflow-hidden transition-all", openFaq === i ? "max-h-40 pb-4 px-4" : "max-h-0")}>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
