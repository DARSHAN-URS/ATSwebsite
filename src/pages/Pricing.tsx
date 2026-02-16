import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Crown, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import SEOHead from "@/components/SEOHead";
import { useLocalCurrency } from "@/hooks/useLocalCurrency";

export default function Pricing() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isPro, loading: subLoading } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const localCurrency = useLocalCurrency();

  const PLANS = [
    {
      id: "free", name: t.pricingPage.freeName, period: "", description: t.pricingPage.freeDesc,
      features: [t.pricingPage.oneResume, t.pricingPage.basicTemplates, t.pricingPage.pdfDownload, t.pricingPage.jobTrackerLimit],
      icon: <Zap className="h-6 w-6" />,
    },
    {
      id: "pro_monthly", name: t.pricingPage.proName, period: t.pricingPage.perMonth, description: t.pricingPage.proDesc,
      features: [t.pricingPage.unlimitedResumes, t.pricingPage.allPremiumTemplates, t.pricingPage.aiResumeGrading, t.pricingPage.aiResumeTailoring, t.pricingPage.coverLetterGen, t.pricingPage.unlimitedJobTracking, t.pricingPage.prioritySupport],
      icon: <Crown className="h-6 w-6" />, popular: true,
    },
  ];


  return (
    <div className="container mx-auto max-w-4xl py-10 px-4">
      <SEOHead title="Pricing — ATS Pro Resume Builder" description="Compare free and pro plans for ATS Pro Resume Builder. AI resume grading, tailoring, cover letters, and unlimited resumes starting at ₹299/month." canonical="https://atsproresumebuilder.com/pricing" keywords="resume builder pricing, ATS pro plans, AI resume subscription" />
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => user ? navigate("/dashboard") : navigate("/")} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">{t.pricingPage.title}</h1>
        <p className="mt-2 text-muted-foreground">{t.pricingPage.subtitle}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
        {PLANS.map((plan) => (
          <Card key={plan.id} className={`relative overflow-hidden transition-all ${plan.popular ? "border-primary shadow-lg shadow-primary/10" : "border-border"}`}>
            {plan.popular && <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-bl-lg">{t.pricingPage.mostPopular}</div>}
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">{plan.icon}</div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-extrabold">{plan.id === "free" ? localCurrency.formatPrice(0) : localCurrency.formatProPrice()}</span>
                {plan.period && <span className="text-muted-foreground text-sm">{plan.period}</span>}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm"><CheckCircle className="h-4 w-4 text-primary shrink-0" />{feature}</li>
                ))}
              </ul>
              <Button className="w-full" variant={plan.popular ? "default" : "outline"} disabled={true}>
                {isPro && plan.id === "pro_monthly" ? t.pricingPage.currentPlan : plan.id === "free" ? t.pricingPage.currentPlan : "Coming Soon"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
