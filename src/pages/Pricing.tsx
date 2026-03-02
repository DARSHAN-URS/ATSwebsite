import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X, Crown, Sparkles, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEOHead from "@/components/SEOHead";
import { useLocalCurrency } from "@/hooks/useLocalCurrency";
import { pricingExtraTranslations } from "@/i18n/pricingExtraTranslations";
import { cn } from "@/lib/utils";

type Duration = "weekly" | "biweekly" | "monthly";

export default function Pricing() {
  const { user } = useAuth();
  const { t, locale } = useLanguage();
  const tp = pricingExtraTranslations[locale];
  const { isPro } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const localCurrency = useLocalCurrency();
  const [duration, setDuration] = useState<Duration>("monthly");

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
    <div className="container mx-auto max-w-5xl py-10 px-4">
      <SEOHead title="Pricing — ATS Pro Resume Builder" description="Compare free and pro plans for ATS Pro Resume Builder." canonical="https://atsproresumebuilder.com/pricing" keywords="resume builder pricing, ATS pro plans" />

      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => user ? navigate("/dashboard") : navigate("/")} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> {tp.back}
        </Button>
      </div>

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">{tp.launchOffer}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-display">{t.pricingPage.title}</h1>
        <p className="mt-2 text-muted-foreground">{t.pricingPage.subtitle}</p>
      </div>

      {/* Two-column pricing cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto items-start">
        {/* FREE PLAN */}
        <div className="rounded-2xl border bg-card p-6 md:p-8 flex flex-col h-full">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Free Plan</p>
          <div className="mb-1">
            <span className="text-4xl font-extrabold">{localCurrency.formatPrice(0)}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-6">{t.pricingPage.freeDesc}</p>

          <ul className="space-y-3 mb-8 flex-1">
            {freeFeatures.map((f) => (
              <li key={f.text} className="flex items-start gap-2.5 text-sm">
                {f.included ? (
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                ) : (
                  <X className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                )}
                <span className={cn(!f.included && "text-muted-foreground/50 line-through")}>{f.text}</span>
              </li>
            ))}
          </ul>

          <Button variant="outline" className="w-full" disabled>
            {t.pricingPage.currentPlan}
          </Button>
        </div>

        {/* PRO PLAN */}
        <div className="rounded-2xl border-2 border-primary bg-card p-6 md:p-8 flex flex-col relative shadow-lg shadow-primary/10 h-full">
          {/* Save badge */}
          <div className="absolute -top-3 right-4 bg-destructive text-destructive-foreground px-3 py-1 text-xs font-bold rounded-full">
            {tp.launchBadge}
          </div>

          <div className="flex items-center gap-2 mb-1">
            <Crown className="h-5 w-5 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Pro Plan</p>
          </div>

          {/* Price */}
          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold">{localCurrency.formatProPrice(duration)}</span>
            <span className="text-base text-muted-foreground line-through">{savingsLabel}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            {duration === "weekly" ? tp.per7Days : duration === "biweekly" ? tp.per14Days : t.pricingPage.perMonth}
          </p>

          {/* Duration tabs */}
          <div className="flex rounded-lg bg-muted p-1 mb-6">
            {durationTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setDuration(tab.key)}
                className={cn(
                  "flex-1 text-xs font-semibold py-2 px-2 rounded-md transition-all",
                  duration === tab.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-6 flex-1">
            {proFeatures.map((f) => (
              <li key={f.text} className="flex items-start gap-2.5 text-sm">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{f.text}</span>
              </li>
            ))}
          </ul>

          {/* Early adopter bonus */}
          <div className="flex items-start gap-2 rounded-lg bg-accent/50 border border-accent p-3 mb-4">
            <Gift className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-foreground">{tp.bonusFeatures}</p>
              <p className="text-[11px] text-muted-foreground">{tp.bonusDesc}</p>
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

      {/* Payment methods */}
      <div className="text-center mt-8">
        <p className="text-xs text-muted-foreground">We accept: Visa, Mastercard, UPI, PayPal & more</p>
      </div>
    </div>
  );
}
