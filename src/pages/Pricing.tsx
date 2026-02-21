import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Crown, Zap, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import SEOHead from "@/components/SEOHead";
import { useLocalCurrency } from "@/hooks/useLocalCurrency";
import { pricingExtraTranslations } from "@/i18n/pricingExtraTranslations";

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

  if (role === "recruiter") {
    return (
      <div className="container mx-auto max-w-2xl py-10 px-4">
        <SEOHead title="Pricing — ATS Pro Resume Builder" description="Recruiter account pricing information." canonical="https://atsproresumebuilder.com/pricing" />
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> {tp.backToDashboard}
          </Button>
        </div>
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Building2 className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{tp.recruiterAccountTitle}</h1>
          <p className="mt-2 text-muted-foreground">{tp.recruiterAccountDesc}</p>
        </div>
        <Card className="border-primary/30 shadow-lg shadow-primary/5">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <CardTitle>{tp.recruiterPlanTitle}</CardTitle>
            <CardDescription>{tp.recruiterPlanDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 mb-6">
              {[tp.feature1, tp.feature2, tp.feature3, tp.feature4, tp.feature5, tp.feature6, tp.feature7].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-primary shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <p className="text-xs text-center text-muted-foreground">
              {tp.recruiterPricingNote}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-10 px-4">
      <SEOHead title="Pricing — ATS Pro Resume Builder" description="Compare free and pro plans for ATS Pro Resume Builder. AI resume grading, tailoring, cover letters, and unlimited resumes starting at ₹299/month." canonical="https://atsproresumebuilder.com/pricing" keywords="resume builder pricing, ATS pro plans, AI resume subscription" />
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => user ? navigate("/dashboard") : navigate("/")} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> {tp.back}
        </Button>
      </div>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">{t.pricingPage.title}</h1>
        <p className="mt-2 text-muted-foreground">{t.pricingPage.subtitle}</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
        {PLANS.map((plan) => (
          <Card key={plan.id} className={`relative overflow-hidden transition-all ${plan.popular ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]" : "border-border"}`}>
            {plan.popular && <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-bl-lg">{tp.bestValue}</div>}
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">{plan.icon}</div>
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <CardDescription className="text-xs">{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-extrabold">{plan.id === "free" ? localCurrency.formatPrice(0) : localCurrency.formatProPrice(plan.duration)}</span>
                {plan.period && <span className="text-muted-foreground text-xs">{plan.period}</span>}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-xs"><CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />{feature}</li>
                ))}
              </ul>
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
