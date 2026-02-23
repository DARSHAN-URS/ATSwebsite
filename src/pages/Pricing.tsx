import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Crown, Zap, Building2, Sparkles, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import SEOHead from "@/components/SEOHead";
import { useLocalCurrency } from "@/hooks/useLocalCurrency";
import { pricingExtraTranslations } from "@/i18n/pricingExtraTranslations";
import { Badge } from "@/components/ui/badge";

export default function Pricing() {
  const { user } = useAuth();
  const { t, locale } = useLanguage();
  const tp = pricingExtraTranslations[locale];
  const { isPro, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const localCurrency = useLocalCurrency();
  const { role } = useUserRole();

  const PAYMENT_LINKS: Record<string, string> = {
    pro_weekly: "https://nas.io/muzamils-business-2/zerolink/7day-pro",
    pro_biweekly: "https://nas.io/muzamils-business-2/zerolink/14day-pro",
    pro_monthly: "https://nas.io/muzamils-business-2/zerolink/monthly-pro",
  };

  const handleSelectPlan = (planId: string) => {
    if (planId === "free") return;
    if (!user) {
      toast({ title: "Please sign in first", description: "You need an account to subscribe.", variant: "destructive" });
      navigate("/");
      return;
    }
    const link = PAYMENT_LINKS[planId];
    if (link) window.open(link, "_blank");
  };

  const PLANS = [
    {
      id: "free", name: t.pricingPage.freeName, period: "", description: t.pricingPage.freeDesc,
      features: [t.pricingPage.oneResume, t.pricingPage.basicTemplates, t.pricingPage.pdfDownload, t.pricingPage.jobTrackerLimit],
      icon: <Zap className="h-6 w-6" />, duration: "monthly" as const,
    },
    {
      id: "pro_weekly", name: tp.weeklyPlan, period: tp.per7Days, description: tp.weeklyDesc,
      features: [t.pricingPage.unlimitedResumes, t.pricingPage.allPremiumTemplates, t.pricingPage.aiResumeGrading, t.pricingPage.aiResumeTailoring, t.pricingPage.coverLetterGen, t.pricingPage.unlimitedJobTracking],
      icon: <Crown className="h-6 w-6" />, duration: "weekly" as const,
    },
    {
      id: "pro_biweekly", name: tp.biweeklyPlan, period: tp.per14Days, description: tp.biweeklyDesc,
      features: [t.pricingPage.unlimitedResumes, t.pricingPage.allPremiumTemplates, t.pricingPage.aiResumeGrading, t.pricingPage.aiResumeTailoring, t.pricingPage.coverLetterGen, t.pricingPage.unlimitedJobTracking],
      icon: <Crown className="h-6 w-6" />, duration: "biweekly" as const,
    },
    {
      id: "pro_monthly", name: t.pricingPage.proName, period: t.pricingPage.perMonth, description: t.pricingPage.proDesc,
      features: [t.pricingPage.unlimitedResumes, t.pricingPage.allPremiumTemplates, t.pricingPage.aiResumeGrading, t.pricingPage.aiResumeTailoring, t.pricingPage.coverLetterGen, t.pricingPage.unlimitedJobTracking, t.pricingPage.prioritySupport],
      icon: <Crown className="h-6 w-6" />, popular: true, duration: "monthly" as const,
    },
  ];

  return (
    <div className="container mx-auto max-w-6xl py-10 px-4">
      <SEOHead title="Pricing — ATS Pro Resume Builder" description="Compare free and pro plans for ATS Pro Resume Builder. AI resume grading, tailoring, cover letters, and unlimited resumes starting at ₹299/month." canonical="https://atsproresumebuilder.com/pricing" keywords="resume builder pricing, ATS pro plans, AI resume subscription" />
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => user ? navigate("/dashboard") : navigate("/")} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> {tp.back}
        </Button>
      </div>
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">{tp.launchOffer}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{t.pricingPage.title}</h1>
        <p className="mt-2 text-muted-foreground">{t.pricingPage.subtitle}</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
        {PLANS.map((plan) => (
          <Card key={plan.id} className={`relative overflow-hidden transition-all ${plan.popular ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]" : "border-border"}`}>
            {plan.popular && <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-bl-lg">{tp.bestValue}</div>}
            {plan.id !== "free" && <div className="absolute top-0 left-0 bg-destructive text-destructive-foreground px-2.5 py-1 text-xs font-bold rounded-br-lg">{tp.launchBadge}</div>}
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">{plan.icon}</div>
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <CardDescription className="text-xs">{plan.description}</CardDescription>
              <div className="mt-4">
                {plan.id !== "free" && (
                  <span className="text-base font-medium text-muted-foreground line-through mr-2">
                    {localCurrency.formatOriginalPrice(plan.duration)}
                  </span>
                )}
                <span className="text-3xl font-extrabold">{plan.id === "free" ? localCurrency.formatPrice(0) : localCurrency.formatProPrice(plan.duration)}</span>
                {plan.period && <span className="text-muted-foreground text-xs">{plan.period}</span>}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-xs"><CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />{feature}</li>
                ))}
              </ul>
              {plan.id !== "free" && (
                <div className="flex items-start gap-2 rounded-lg bg-accent/50 border border-accent p-2.5 mb-4">
                  <Gift className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{tp.bonusFeatures}</p>
                    <p className="text-[11px] text-muted-foreground">{tp.bonusDesc}</p>
                  </div>
                </div>
              )}
              <Button
                className="w-full"
                size="sm"
                variant={plan.popular ? "default" : "outline"}
                disabled={plan.id === "free" || (isPro && plan.id !== "free")}
                onClick={() => handleSelectPlan(plan.id)}
              >
                {isPro && plan.id !== "free" ? t.pricingPage.currentPlan : plan.id === "free" ? t.pricingPage.currentPlan : "Subscribe Now"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
